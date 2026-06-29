#!/usr/bin/env pybricks-micropython

from pybricks.hubs import EV3Brick
from pybricks.ev3devices import Motor, TouchSensor
from pybricks.parameters import Port, Stop, Direction
from pybricks.tools import wait
import urequests as requests
import usocket as socket
import time

# ── Constants ─────────────────────────────────────────────────────────────────
SERVER_BASE = "http://192.168.4.1:4001/api/EV3"
NOM         = "EV3_1"
MANUAL_URL  = SERVER_BASE + "/getManualCmd"
ESTAT_URL   = SERVER_BASE + "/treballant"
SOCKET_PORT = 5000

CENTRE_P      = 250
CENTRE_B      = 320
K             = 0.3
AREA_OBJECTIU = 150000
AREA_MARGE    = 50000
AREA_CAIXA    = 99000
MARGE_X       = 15
TIMEOUT       = 0.5
MANUAL_VEL    = 100
CENTRE_Y   = 240     
K_Y        = 0.3     
MARGE_Y    = 25       

DIST_K = 0.001 
K_AREA = 0.0005 

# ── Configuració motors EV3 ────────────────────────────────────────────────────────
ev3         = EV3Brick()
base        = Motor(Port.A)
gripper     = Motor(Port.B)
shoulder    = Motor(Port.C)
elbow       = Motor(Port.D)
base_switch = TouchSensor(Port.S2)

direccio   = 1
last_press = False
fase       = "PIECE"
confirmacions = 0
CONFIRMACIONS_NECESSARIES = 5

# ── Seqüència d'inici ────────────────────────────────────────────────────────
gripper.run_until_stalled(-60, then=Stop.HOLD, duty_limit=50)
wait(500)
gripper.reset_angle(0)

shoulder.run_until_stalled(-60, then=Stop.HOLD, duty_limit=50)
wait(500)
shoulder.run_until_stalled(-60, then=Stop.HOLD, duty_limit=20)
wait(500)
shoulder.reset_angle(0)
shoulder.run_target(100, 180, wait=True)

elbow.run_until_stalled(60, then=Stop.HOLD, duty_limit=50)
wait(500)
elbow.run_until_stalled(60, then=Stop.HOLD, duty_limit=20)
wait(500)
elbow.reset_angle(0)
ev3.speaker.set_speech_options(language='ca', voice = 'f5', speed=120, pitch=50)

POS_INICIAL_BASE     = base.angle()
POS_INICIAL_SHOULDER = shoulder.angle()
POS_INICIAL_ELBOW    = elbow.angle()
POS_INICIAL_GRIPPER  = gripper.angle()

# ── Registre al servidor ─────────────────────────────────────────────────────
EV3_ID = None
while EV3_ID is None:
    try:
        response = requests.post(SERVER_BASE + "/nou", json={"Nom": NOM})
        data = response.json()
        response.close()
        if data.get("msg") in ("OK", "Registrat"):
            EV3_ID = data.get("id")
            ev3.speaker.beep()
            print("Registrat, id:", EV3_ID)
    except Exception as e:
        print("Error registre:", e)
        wait(1000)

# ── Funcions mode automàtic ───────────────────────────────────────────────────
def buscar():
    base.run(-60 * direccio)

def ajustar_abast(cy, area, area_objectiu):
    error_y    = cy - CENTRE_Y
    error_area = area_objectiu - area   
 
    vel = int(K_Y * error_y) + int(K_AREA * error_area)
 
    if abs(vel) < 5:
        shoulder.hold()
    else:
        shoulder.run(vel)


def moure_base(cx, centre):
    error = cx - centre
    vel = -int(K * error)
    if abs(vel) < 5:
        base.hold()
    else:
        base.run(vel)


def buscar_caixa():
    shoulder.run_target(50, 100, wait=True)
    elbow.run_target(50, POS_INICIAL_ELBOW, wait=True)
    gripper.run_target(50, POS_INICIAL_GRIPPER, wait=True)

def tornar_posicio_inicial():
    elbow.run_target(50, POS_INICIAL_ELBOW, wait=True)
    shoulder.run_target(50, POS_INICIAL_SHOULDER, wait=True)
    gripper.run_target(50, POS_INICIAL_GRIPPER, wait=True)





def agafar():
    gripper.run_target(120, 110, wait=True)  
    elbow.run_until_stalled(-40, then=Stop.HOLD, duty_limit=40)
    shoulder.run_until_stalled(40, then=Stop.HOLD, duty_limit=40)
    gripper.run_target(50, GRIPPER_TANCAT, wait=True)
    shoulder.run_target(200, 100, wait=True)
    buscar_caixa()


def deixar():
    elbow.run_target(40, -90, wait=True)
    gripper.run_target(120, 110, wait=True)
    gripper.run_target(-120, 0, wait=True)
    tornar_posicio_inicial()

def atura_tot():
    base.hold()
    shoulder.hold()
    elbow.hold()
    gripper.hold()

# ── Funcions mode manual ──────────────────────────────────────────────────────
GRIPPER_OBERT  = 110   # graus des del homing (tancat = 0)
GRIPPER_TANCAT = 0
 
VOICE_RESPONSES = {
    "base_left":      "movent esquerra",
    "base_right":     "movent dreta",
    "shoulder_up":    "pujant espatlla",
    "shoulder_down":  "baixant espatlla",
    "elbow_up":       "pujant colze",
    "elbow_down":     "baixant colze",
    "gripper_open":   "obrint",
    "gripper_close":  "tancant",
    "STOP":           "aturant moviment",
}

 
def aplicar_cmd(cmd):
    if cmd in VOICE_RESPONSES  and cmd != "STOP":
        ev3.speaker.say(VOICE_RESPONSES[cmd])
    if cmd == "gripper_open":
        gripper.run_target(120, GRIPPER_OBERT, then=Stop.HOLD, wait=False)
    elif cmd == "gripper_close":
        gripper.run_target(120, GRIPPER_TANCAT, then=Stop.HOLD, wait=False)
    else:
        atura_tot()
        if cmd == "base_left":       base.run(MANUAL_VEL)
        elif cmd == "base_right":    base.run(-MANUAL_VEL)
        elif cmd == "shoulder_up":   shoulder.run(-MANUAL_VEL)
        elif cmd == "shoulder_down": shoulder.run(MANUAL_VEL)
        elif cmd == "elbow_up":      elbow.run(-MANUAL_VEL+50)
        elif cmd == "elbow_down":    elbow.run(MANUAL_VEL-50)



# ── Servidor socket per la connexió amb la Raspberry ──────────────────────────────
srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
srv.bind(socket.getaddrinfo('0.0.0.0', SOCKET_PORT)[0][-1])
srv.listen(1)
print("Esperant connexió Raspberry al port", SOCKET_PORT)

conn = None
buffer_socket = ""

def acceptar_connexio():
    global conn, buffer_socket
    try:
        srv.settimeout(0.1)
        conn, addr = srv.accept()
        buffer_socket = ""
        print("Raspberry connectada:", addr)
    except:
        pass

def llegir_socket():
    global buffer_socket, conn
    if conn is None:
        return None
    try:
        conn.settimeout(0.01)
        chunk = conn.recv(256).decode()
        if not chunk:
            conn = None
            return None
        buffer_socket += chunk
    except:
        pass
    # Quedar-se amb l'última línia completa disponible
    ultima = None
    while "\n" in buffer_socket:
        line, buffer_socket = buffer_socket.split("\n", 1)
        if line.strip():
            ultima = line.strip()
    return ultima

# ── Bucle principal ───────────────────────────────────────────────────────────
manual_tick     = 0
last_manual_cmd = "STOP"
mode_actual     = "ESPERA"
last_data_time  = time.time()

while True:

    # ── Llegir mode del servidor cada 5 iteracions ────────────────────────────
    manual_tick += 1
    if manual_tick % 5 == 0:
        try:
            eres = requests.post(ESTAT_URL, json={"id_EV3": EV3_ID})
            estat = eres.json()
            eres.close()
            if estat.get("Manual") == 1:
                nou_mode = "MANUAL"
            elif estat.get("Automatic") == 1:
                nou_mode = "AUTO"
            else:
                nou_mode = "ESPERA"
            if nou_mode != mode_actual:
                mode_actual = nou_mode
                atura_tot()
                last_manual_cmd = "STOP"
                print("Mode:", mode_actual)
        except:
            pass

    # ── Pulsador canvi direcció (sempre actiu) ───────────────────────────────
    pressed = base_switch.pressed()
    if pressed and not last_press:
        direccio *= -1
        ev3.speaker.beep()
        base.run(60 * direccio)
        print("Canvi direcció:", direccio)
        wait(300)
    last_press = pressed

    # ── ESPERA ────────────────────────────────────────────────────────────────
    if mode_actual == "ESPERA":
        atura_tot()
        acceptar_connexio()
        wait(200)
        continue

    # ── MANUAL ────────────────────────────────────────────────────────────────
    if mode_actual == "MANUAL":
        try:
            mres = requests.post(MANUAL_URL, json={"Nom": NOM})
            cmd  = mres.json().get("manual_cmd", "STOP")
            mres.close()
        except:
            cmd = "STOP"
        if cmd != last_manual_cmd:
            aplicar_cmd(cmd)
            last_manual_cmd = cmd
        wait(80)
        continue

    # ── AUTO ──────────────────────────────────────────────────────────────────
    # Acceptar connexió si no n'hi ha
    if conn is None:
        acceptar_connexio()
        wait(50)
        continue

    linia = llegir_socket()
    if linia is None:
        wait(10)
        continue

    parts = linia.split(",")

    if parts[0] == "SEARCH":
        buscar()
        wait(20)
        continue

    if len(parts) < 4:
        wait(10)
        continue

    tipus = parts[0]
    try:
        cx   = int(parts[1])
        cy   = int(parts[2])
        area = int(parts[3])
    except:
        wait(10)
        continue

    last_data_time = time.time()

    es_rellevant = (tipus == "P" and fase == "PIECE") or (tipus == "B" and fase == "BOX")
    print("tipus:", tipus, "fase:", fase, "rellevant:", es_rellevant)
 
    if not es_rellevant:
        confirmacions = 0
        buscar()
        wait(20)
        continue
 
    centre_actual = CENTRE_P if fase == "PIECE" else CENTRE_B
    area_objectiu_actual = AREA_OBJECTIU if fase == "PIECE" else AREA_CAIXA
 
    moure_base(cx, centre_actual)
    ajustar_abast(cy,area, area_objectiu_actual)
 
    centrat   = abs(cx - centre_actual) < MARGE_X
    centrat_y = abs(cy - CENTRE_Y) < MARGE_Y
 
    if not centrat:
        moure_base(cx, centre_actual)
        shoulder.hold()      
    elif not centrat_y:
        base.hold()          
        ajustar_abast(cy, area, area_objectiu_actual)
    else:
        base.hold()
        shoulder.hold()
 
    if fase == "PIECE":
        a_prop = abs(area - AREA_OBJECTIU) < AREA_MARGE
    else:
        a_prop = area > AREA_CAIXA
 
    if centrat and centrat_y and a_prop:
        confirmacions += 1
    else:
        confirmacions = 0



    if confirmacions >= CONFIRMACIONS_NECESSARIES:
        base.hold()
        if fase == "PIECE":
            agafar()
            fase = "BOX"
            print("Ara busquem CAIXA")
        elif fase == "BOX":
            deixar()
            fase = "PIECE"
            print("Tornem a peces")
            if conn is not None:
                try:
                    conn.send(b"DELIVERED\n")
                except Exception as e:
                    print("Error notificant DELIVERED:", e)
        ev3.speaker.beep()
        confirmacions = 0
        buffer_socket = ""
        last_data_time = time.time()


    if time.time() - last_data_time > TIMEOUT:
        buscar()

    wait(20)
