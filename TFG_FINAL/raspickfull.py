from picamera2 import Picamera2
import cv2
import time
import requests
import threading
import queue
import socket
from http.server import BaseHTTPRequestHandler, HTTPServer

SERVER_URL    = "http://192.168.4.1:4001/api/EV3/updateVision"
COLOR_URL     = "http://192.168.4.1:4001/api/EV3/getColor"
SEQUENCIA_URL = "http://192.168.4.1:4001/api/EV3/getSequencia"
SET_COLOR_URL = "http://192.168.4.1:4001/api/EV3/setColor"
SEQ_COMPLETADA_URL = "http://192.168.4.1:4001/api/EV3/marcarSequenciaCompletada"

NOM           = "EV3_1"
EV3_IP        = "192.168.4.14"
EV3_PORT      = 5000
STREAM_PORT   = 5000
COLOR_REFRESH_INTERVAL = 100

# ── Frame compartit per al stream ─────────────────────────────────────────────
frame_lock   = threading.Lock()
latest_frame = None

# ── Cua HTTP per a updateVision ───────────────────────────────────────────────
data_queue = queue.Queue(maxsize=1)


recv_buffer = ""

def llegir_ev3():
    global recv_buffer
    with sock_lock:
        s = sock
    if s is None:
        return None
    try:
        s.settimeout(0)
        chunk = s.recv(128).decode()
        if chunk:
            recv_buffer += chunk
    except (BlockingIOError, socket.timeout):
        pass
    except Exception as e:
        print("Error llegint EV3:", e)
        return None
    msg = None
    while "\n" in recv_buffer:
        line, recv_buffer = recv_buffer.split("\n", 1)
        if line.strip():
            msg = line.strip()
    return msg

def ev3_connector():
    global sock, recv_buffer
    s = connectar_ev3()
    recv_buffer = ""
    with sock_lock:
        sock = s

def fetch_color():
    try:
        with requests.Session() as s:
            res = s.post(COLOR_URL, json={"Nom": NOM}, timeout=1,
                         headers={"Cache-Control": "no-cache"})
            return res.json().get("color", "red")
    except Exception as e:
        print("Error llegint color:", e)
        return "red"

def fetch_sequencia():
    try:
        with requests.Session() as s:
            res = s.post(SEQUENCIA_URL, json={"Nom": NOM}, timeout=1)
            data = res.json()
            return data.get("sequencia", []), data.get("color", "red")
    except Exception as e:
        print("Error llegint seqüència:", e)
        return [], "red"


# ── HTTP updateVision ────────────────────────────────────────────────────
def http_worker():
    while True:
        data = data_queue.get()
        if data is None:
            break
        try:
            requests.post(SERVER_URL, json=data, timeout=1)
        except Exception as e:
            print("Error HTTP:", e)


# ── MJPEG stream ─────────────────────────────────────────────────────────
class MJPEGHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def do_GET(self):
        if self.path == '/stream':
            self.send_response(200)
            self.send_header('Content-Type', 'multipart/x-mixed-replace; boundary=frame')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            try:
                while True:
                    with frame_lock:
                        frame = latest_frame
                    if frame is None:
                        time.sleep(0.05)
                        continue
                    _, jpeg = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
                    data = jpeg.tobytes()
                    self.wfile.write(b'--frame\r\n')
                    self.wfile.write(b'Content-Type: image/jpeg\r\n\r\n')
                    self.wfile.write(data)
                    self.wfile.write(b'\r\n')
                    time.sleep(0.033)
            except (BrokenPipeError, ConnectionResetError):
                pass
        else:
            self.send_response(404)
            self.end_headers()

def stream_worker():
    server = HTTPServer(('0.0.0.0', STREAM_PORT), MJPEGHandler)
    print(f"Stream MJPEG a https://192.168.4.1:{STREAM_PORT}/stream")
    server.serve_forever()


# ── Connexió socket al EV3 ────────────────────────────────────────────────────
def connectar_ev3():
    while True:
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
            s.connect((EV3_IP, EV3_PORT))
            print("Connectat a EV3")
            return s
        except Exception as e:
            print("Error connectant a EV3, reintentant...", e)
            time.sleep(2)


# ── Arrencada ─────────────────────────────────────────────────────────────────
sequencia, COLOR_OBJECTIU = fetch_sequencia()
seq_index = 0
if not sequencia:
    sequencia = [COLOR_OBJECTIU]
print("Seqüència:", sequencia, "| Color inicial:", COLOR_OBJECTIU)

threading.Thread(target=http_worker,   daemon=True).start()
threading.Thread(target=stream_worker, daemon=True).start()

# Connexió al EV3 en un fil separat per no bloquejar el stream
sock = None
sock_lock = threading.Lock()

def ev3_connector():
    global sock
    s = connectar_ev3()
    with sock_lock:
        sock = s

threading.Thread(target=ev3_connector, daemon=True).start()

picam2 = Picamera2()
config = picam2.create_preview_configuration(main={"size": (640, 480)})
picam2.configure(config)
picam2.start()

frame_count = 0

AREA_MIN         = 800     
AREA_MAX         = 200000  
CIRCULARITAT_MIN = 0.65  


def process_mask(mask):
    mask = cv2.erode(mask, None, iterations=2)
    mask = cv2.dilate(mask, None, iterations=2)
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    millor = None
    millor_area = 0
 
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area < AREA_MIN or area > AREA_MAX:
            continue
        perimetre = cv2.arcLength(cnt, True)
        if perimetre == 0:
            continue
        circularitat = (4 * 3.14159 * area) / (perimetre ** 2)
        if circularitat < CIRCULARITAT_MIN:
            continue
        if area > millor_area:
            millor_area = area
            millor = cnt
 
    if millor is not None:
        x, y, w, h = cv2.boundingRect(millor)
        cx = x + w // 2
        cy = y + h // 2 
        return cx, cy, int(millor_area)
 
    return None, None, None

BOX_AREA_MIN    = 20000
BOX_AREA_MAX    = 300000
BOX_RATIO_MIN   = 1.1    # marge inferior del ratio
BOX_RATIO_MAX   = 2.2    # marge superior del ratio
BOX_RECT_MIN    = 0.45   # rectangularitat mínima (àrea / àrea bounding box)
 
def process_mask_box(mask):
    mask = cv2.erode(mask, None, iterations=2)
    mask = cv2.dilate(mask, None, iterations=2) 
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
 
    millor = None
    millor_area = 0
 
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area < BOX_AREA_MIN or area > BOX_AREA_MAX:
            continue
 
        x, y, w, h = cv2.boundingRect(cnt)
        if h == 0:
            continue
 
        # Assegurar que w >= h per calcular ratio correctament
        ratio = max(w, h) / min(w, h)
        if ratio < BOX_RATIO_MIN or ratio > BOX_RATIO_MAX:
            continue
 
        # Rectangularitat: area contorn / area box
        rectangularitat = area / (w * h)
        if rectangularitat < BOX_RECT_MIN:
            continue
 
        if area > millor_area:
            millor_area = area
            millor = (x, y, w, h)
 
    if millor is not None:
        x, y, w, h = millor
        cx = x + w // 2
        cy = y + h // 2
        return cx, cy, int(millor_area)
 
    return None, None, None


while True:
    # ── Refresc seqüència/color ───────────────────────────────────────────────
    frame_count += 1
    if frame_count % COLOR_REFRESH_INTERVAL == 0:
        nova_seq, nou_color = fetch_sequencia()
        if nova_seq and nova_seq != sequencia:
            sequencia = nova_seq
            seq_index = 0
            COLOR_OBJECTIU = sequencia[0]
            print("Nova seqüència:", sequencia)
        elif nou_color != COLOR_OBJECTIU and not nova_seq:
            COLOR_OBJECTIU = nou_color
            print("Color actualitzat:", COLOR_OBJECTIU)

    # ── Captura ───────────────────────────────────────────────────────────────
    frame = picam2.capture_array()
    frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
    with frame_lock:
        latest_frame = frame.copy()
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

    # ── Detecció peça ─────────────────────────────────────────────────────────
    mask_piece = None
    if COLOR_OBJECTIU == "red":
        mask_piece = cv2.inRange(hsv, (0,   120, 70), (10,  255, 255)) + \
                     cv2.inRange(hsv, (170, 120, 70), (180, 255, 255))
    elif COLOR_OBJECTIU == "blue":
        mask_piece = cv2.inRange(hsv, (90, 60, 50), (115, 255, 255))
    elif COLOR_OBJECTIU == "yellow":
        mask_piece = cv2.inRange(hsv, (15, 90, 60), (35, 255, 255))

    mask_box = cv2.inRange(hsv, (10, 10, 40), (35, 90, 220))
    cx_p, cy_p, area_p = process_mask(mask_piece) if mask_piece is not None else (None, None)
    if mask_piece is not None:
        mask_box_neta = cv2.bitwise_and(mask_box, cv2.bitwise_not(mask_piece))
    else:
        mask_box_neta = mask_box
    cx_b, cy_b, area_b = process_mask_box(mask_box_neta)

    # ── Avanç de seqüència ────────────────────────────────────────────────────
    msg_ev3 = llegir_ev3()
    if msg_ev3 == "DELIVERED":
        seq_index += 1
        if seq_index < len(sequencia):
            COLOR_OBJECTIU = sequencia[seq_index]
            print(f"Peça entregada confirmada per EV3. Següent: {COLOR_OBJECTIU} ({seq_index+1}/{len(sequencia)})")
            try:
                with requests.Session() as s2:
                    s2.post(SET_COLOR_URL, json={"Nom": NOM, "color": COLOR_OBJECTIU}, timeout=1)
            except Exception as e:
                print("Error actualitzant color:", e)
        else:
            print("Seqüència completada")
            try:
                with requests.Session() as s:
                    s.post(SEQ_COMPLETADA_URL, json={"Nom": NOM}, timeout=1)
            except Exception as e:
                print("Error marcant seqüència completada:", e)


    # ── Preparar missatge socket i dades HTTP ─────────────────────────────────
    if cx_p is not None:
        missatge = f"P,{cx_p},{cy_p},{area_p}\n"
        data_http = {"Nom": NOM, "tipus": "P", "cx": cx_p, "cy": cy_p, "area": area_p}
        print("PIECE:", cx_p,cy_p, area_p)
    elif cx_b is not None:
        missatge = f"B,{cx_b},{cy_b},{area_b}\n"
        data_http = {"Nom": NOM, "tipus": "B", "cx": cx_b, "cy": cy_b,"area": area_b}
        print("BOX:", cx_b, cy_b, area_b)
    else:
        missatge = "SEARCH\n"
        data_http = {"Nom": NOM, "tipus": "SEARCH", "cx": 0, "cy": 0, "area": 0}

    # ── Enviar per socket al EV3 ──────────────────────────────────────────────
    with sock_lock:
        s = sock
    if s is not None:
        try:
            s.send(missatge.encode())
        except Exception as e:
            print("Error socket, reconnectant...", e)
            try:
                s.close()
            except:
                pass
            with sock_lock:
                sock = None
            threading.Thread(target=ev3_connector, daemon=True).start()

    # ── Enviar per HTTP a la web ──────────────────────────────────────────────
    try:
        data_queue.put_nowait(data_http)
    except queue.Full:
        try:
            data_queue.get_nowait()
        except queue.Empty:
            pass
        data_queue.put_nowait(data_http)

    cv2.imshow("Camera", frame)
    if cv2.waitKey(1) & 0xFF == 27:
        break

    time.sleep(0.02)

data_queue.put(None)
sock.close()
cv2.destroyAllWindows()
picam2.stop()
