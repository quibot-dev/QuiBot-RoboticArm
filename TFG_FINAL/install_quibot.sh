#!/bin/bash
# =============================================================================
# QUIBOT - Script d'instal·lació automàtica per a Raspberry Pi
# =============================================================================
# Aquest script automatitza la instal·lació i configuració de:
#   - Node.js i npm
#   - PM2 (gestor de processos)
#   - serve (servidor estàtic)
#   - nginx (proxy invers amb HTTPS)
#   - hostapd + dnsmasq (punt d'accés WiFi)
#   - Reenviament de paquets eth0 → wlan0 (opcional)
# =============================================================================

set -e  # Atura el script si hi ha algun error

# --- Colors per a la sortida ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Sense color

log()     { echo -e "${GREEN}[OK]${NC} $1"; }
info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
warning() { echo -e "${YELLOW}[AVÍS]${NC} $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# --- Comprovació de permisos ---
if [ "$EUID" -ne 0 ]; then
  error "Cal executar aquest script com a root. Prova: sudo bash $0"
fi

echo ""
echo "============================================="
echo "   QUIBOT - Instal·lació automàtica"
echo "============================================="
echo ""

# =============================================================================
# PAS 0: Demanar configuració a l'usuari
# =============================================================================
info "Configuració inicial..."
echo ""

# Ruta del projecte
read -rp "📁 Ruta de la carpeta del projecte [per defecte: $(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)]: " PROJECT_DIR
PROJECT_DIR="${PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}"

# Nom de la xarxa WiFi
read -rp "📶 Nom de la xarxa WiFi (SSID) [per defecte: QUIBOT_WIFI]: " WIFI_SSID
WIFI_SSID="${WIFI_SSID:-QUIBOT_WIFI}"

# Contrasenya de la xarxa WiFi
read -rp "🔑 Contrasenya de la xarxa WiFi [per defecte: QUIBOT_WIFI]: " WIFI_PASS
WIFI_PASS="${WIFI_PASS:-QUIBOT_WIFI}"

# Canal WiFi
read -rp "📡 Canal WiFi (1-11) [per defecte: 9]: " WIFI_CHANNEL
WIFI_CHANNEL="${WIFI_CHANNEL:-9}"

# Reenviament Ethernet
read -rp "🌐 Vols habilitar el reenviament de paquets via Ethernet? (s/n) [per defecte: n]: " ENABLE_NAT
ENABLE_NAT="${ENABLE_NAT:-n}"

echo ""
echo "--- Resum de la configuració ---"
echo "  Carpeta del projecte : $PROJECT_DIR"
echo "  SSID WiFi            : $WIFI_SSID"
echo "  Canal WiFi           : $WIFI_CHANNEL"
echo "  Reenviament Ethernet : $ENABLE_NAT"
echo ""
read -rp "Continues amb la instal·lació? (s/n): " CONFIRM
if [[ "$CONFIRM" != "s" && "$CONFIRM" != "S" ]]; then
  info "Instal·lació cancel·lada."
  exit 0
fi

# =============================================================================
# PAS 1: Node.js i npm
# =============================================================================
echo ""
info "=== PAS 1: Instal·lant Node.js i npm ==="

apt-get update -qq
curl -fsSL https://deb.nodesource.com/setup_24.x | bash - 2>/dev/null
apt-get install -y nodejs 2>/dev/null

NODE_VER=$(node -v 2>/dev/null || echo "no trobat")
NPM_VER=$(npm -v 2>/dev/null || echo "no trobat")
log "Node.js instal·lat: $NODE_VER"
log "npm instal·lat:     $NPM_VER"

# =============================================================================
# PAS 2: Instal·lar dependències del projecte i fer el build
# =============================================================================
echo ""
info "=== PAS 2: Instal·lant dependències del projecte ==="

if [ ! -d "$PROJECT_DIR" ]; then
  error "No s'ha trobat la carpeta del projecte: $PROJECT_DIR"
fi

cd "$PROJECT_DIR"

if [ ! -f "package.json" ]; then
  error "No s'ha trobat package.json a $PROJECT_DIR. Verifica la ruta del projecte."
fi

npm install --legacy-peer-deps
log "Dependències instal·lades"

info "Compilant la interfície web per a producció..."
NODE_OPTIONS=--openssl-legacy-provider npm run build --legacy-peer-deps
log "Build completat a $PROJECT_DIR/build"

# =============================================================================
# PAS 3: PM2 i serve
# =============================================================================
echo ""
info "=== PAS 3: Instal·lant PM2 i serve ==="

npm install -g pm2 serve
log "PM2 i serve instal·lats"

# Aturar processos anteriors si existeixen
pm2 stop frontend 2>/dev/null || true
pm2 stop server   2>/dev/null || true
pm2 delete frontend 2>/dev/null || true
pm2 delete server   2>/dev/null || true

# Iniciar frontend (build estàtic)
cd "$PROJECT_DIR"
pm2 start "serve -s build -l 3000" --name frontend
log "Procés 'frontend' registrat a PM2"

# Iniciar backend
if [ ! -f "$PROJECT_DIR/server/server.js" ]; then
  warning "No s'ha trobat $PROJECT_DIR/server/server.js — el procés 'server' no s'ha iniciat"
else
  cd "$PROJECT_DIR/server"
  pm2 start server.js --name server
  log "Procés 'server' registrat a PM2"
fi

# Configurar inici automàtic
pm2 startup systemd -u pi --hp /home/pi 2>/dev/null | tail -1 | bash || true
pm2 save
log "PM2 configurat per arrencar automàticament en cada reinici"

# =============================================================================
# PAS 4: Certificat SSL autosignat
# =============================================================================
echo ""
info "=== PAS 4: Generant certificat SSL autosignat ==="

mkdir -p /etc/ssl/private
openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
  -keyout /etc/ssl/private/raspberry.key \
  -out /etc/ssl/certs/raspberry.crt \
  -subj "/CN=quibot.local/O=QUIBOT/C=ES" 2>/dev/null
log "Certificat SSL generat (vàlid 10 anys)"

# =============================================================================
# PAS 5: nginx
# =============================================================================
echo ""
info "=== PAS 5: Instal·lant i configurant nginx ==="

apt update -qq && apt install -y nginx 2>/dev/null
log "nginx instal·lat"

cat > /etc/nginx/sites-available/default << EOF
server {
    listen 80;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    ssl_certificate     /etc/ssl/certs/raspberry.crt;
    ssl_certificate_key /etc/ssl/private/raspberry.key;

    root ${PROJECT_DIR}/build;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:4001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }

    location /stream {
        proxy_pass http://127.0.0.1:5000/stream;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_buffering off;
        proxy_cache off;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

nginx -t && systemctl restart nginx
log "nginx configurat i reiniciat"

# =============================================================================
# PAS 6: Punt d'accés WiFi (hostapd + dnsmasq)
# =============================================================================
echo ""
info "=== PAS 6: Configurant punt d'accés WiFi ==="

apt-get install -y hostapd dnsmasq 2>/dev/null
log "hostapd i dnsmasq instal·lats"

# IP estàtica per a wlan0
DHCPCD_CONF="/etc/dhcpcd.conf"
if ! grep -q "interface wlan0" "$DHCPCD_CONF"; then
  cat >> "$DHCPCD_CONF" << EOF

interface wlan0
static ip_address=192.168.4.1/24
nohook wpa_supplicant
EOF
  log "IP estàtica 192.168.4.1 assignada a wlan0"
else
  warning "wlan0 ja estava configurat a $DHCPCD_CONF, no s'ha modificat"
fi

# Configuració hostapd
cat > /etc/hostapd/hostapd.conf << EOF
country_code=DE
interface=wlan0
ssid=${WIFI_SSID}
channel=${WIFI_CHANNEL}
auth_algs=1
wpa=2
wpa_passphrase=${WIFI_PASS}
wpa_key_mgmt=WPA-PSK
wpa_pairwise=TKIP CCMP
rsn_pairwise=CCMP
EOF
log "hostapd configurat (SSID: $WIFI_SSID, canal: $WIFI_CHANNEL)"

# Indicar la ruta del fitxer de configuració a hostapd
sed -i 's|#DAEMON_CONF=""|DAEMON_CONF="/etc/hostapd/hostapd.conf"|' /etc/default/hostapd
log "Ruta de configuració de hostapd establerta"

# Configuració dnsmasq
if [ -f /etc/dnsmasq.conf ]; then
  mv /etc/dnsmasq.conf /etc/dnsmasq.conf.bak
  log "Còpia de seguretat de dnsmasq.conf creada"
fi
cat > /etc/dnsmasq.conf << EOF
interface=wlan0
dhcp-range=192.168.4.2,192.168.4.20,255.255.255.0,24h
EOF
log "dnsmasq configurat"

# Habilitar serveis
systemctl unmask hostapd
systemctl enable hostapd
systemctl enable dnsmasq

# =============================================================================
# PAS 7: Reenviament de paquets (opcional)
# =============================================================================
if [[ "$ENABLE_NAT" == "s" || "$ENABLE_NAT" == "S" ]]; then
  echo ""
  info "=== PAS 7: Configurant reenviament de paquets eth0 → wlan0 ==="

  apt-get install -y iptables 2>/dev/null

  # Habilitar ip_forward
  sed -i 's|#net.ipv4.ip_forward=1|net.ipv4.ip_forward=1|' /etc/sysctl.conf
  sysctl -p /etc/sysctl.conf > /dev/null

  # Regles NAT
  iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
  iptables -A FORWARD -i eth0 -o wlan0 -m state --state RELATED,ESTABLISHED -j ACCEPT
  iptables -A FORWARD -i wlan0 -o eth0 -j ACCEPT

  # Desar regles per al reinici
  sh -c "iptables-save > /etc/iptables.ipv4.nat"

  # Restaurar automàticament en cada inici
  RC_LOCAL="/etc/rc.local"
  if [ ! -f "$RC_LOCAL" ]; then
    echo '#!/bin/bash' > "$RC_LOCAL"
    echo 'exit 0' >> "$RC_LOCAL"
    chmod +x "$RC_LOCAL"
  fi
  if ! grep -q "iptables-restore" "$RC_LOCAL"; then
    sed -i '/^exit 0/i iptables-restore < /etc/iptables.ipv4.nat' "$RC_LOCAL"
  fi

  log "Reenviament de paquets configurat i persistent"
else
  info "Reenviament de paquets omès (sense Ethernet)"
fi

# =============================================================================
# RESUM FINAL
# =============================================================================
echo ""
echo "============================================="
echo -e "   ${GREEN}Instal·lació completada amb èxit!${NC}"
echo "============================================="
echo ""
echo "  📁 Projecte      : $PROJECT_DIR"
echo "  📶 Xarxa WiFi    : $WIFI_SSID (canal $WIFI_CHANNEL)"
echo "  🔑 Contrasenya   : $WIFI_PASS"
echo "  🌐 URL d'accés   : https://192.168.4.1"
echo ""
echo "  Processos PM2 actius:"
pm2 list
echo ""
warning "Cal reiniciar la Raspberry Pi perquè tots els canvis tinguin efecte."
echo ""
read -rp "Vols reiniciar ara? (s/n): " REBOOT_NOW
if [[ "$REBOOT_NOW" == "s" || "$REBOOT_NOW" == "S" ]]; then
  log "Reiniciant..."
  reboot
else
  info "Recorda reiniciar manualment amb: sudo reboot"
fi
