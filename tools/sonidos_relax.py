# Fabrica los sonidos de «🌙 Para relajarse» (NA Salud) → docs/sonidos/*.webm (basatina.es/sonidos/…)
# Todo es sonido sintético hecho con números (ruido filtrado, gotas, olas, pájaros…): no hay grabaciones de nadie,
# así que no hay derechos de autor de terceros. Cada archivo es un bucle de unos minutos que empalma consigo mismo
# sin corte (el final se funde con el principio), y la app lo repite el tiempo que se quiera.
# Uso: python3 tools/sonidos_relax.py            (todos)
#      python3 tools/sonidos_relax.py lluvia mar  (solo esos)
# Necesita numpy, scipy y ffmpeg con libopus.
import os, subprocess, sys
import numpy as np
from scipy.signal import butter, sosfilt, oaconvolve

SR = 48000
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAL = os.path.join(RAIZ, 'docs', 'sonidos')
rng = np.random.default_rng(2026)

def bf(x, kind, f, order=4):
    """filtro Butterworth: kind = 'low' | 'high' | 'band' (f = (f1, f2))"""
    return sosfilt(butter(order, f, btype=kind, fs=SR, output='sos'), x)

def ruido(n): return rng.standard_normal(n)

def color(n, exp):
    """ruido de color con espectro 1/f^exp (1 = rosa, 2 = marrón)"""
    X = np.fft.rfft(ruido(n)); f = np.fft.rfftfreq(n, 1 / SR); f[0] = f[1]
    X *= 1 / f ** (exp / 2); y = np.fft.irfft(X, n); return y / np.std(y)

def lento(n, seg, lo, hi):
    """curva lenta al azar entre lo y hi (un punto cada `seg` segundos, unidos suavemente)"""
    k = int(n / (seg * SR)) + 3; v = rng.uniform(lo, hi, k)
    x = np.arange(n) / (seg * SR); i = np.floor(x).astype(int); fr = x - i
    fr = fr * fr * (3 - 2 * fr)  # suavizado
    return v[i] * (1 - fr) + v[i + 1] * fr

def estereo(f, n):
    return np.stack([f(n), f(n)])

def poner(buf, pos, s, g=1.0, pan=0.0):
    """suma el sonido s (mono) en buf (2×n) a partir de pos, con ganancia y panorama (-1 izq, +1 dcha)"""
    n = buf.shape[1]
    if pos >= n: return
    m = min(len(s), n - pos)
    a = np.sqrt((1 - pan) / 2); b = np.sqrt((1 + pan) / 2)
    buf[0, pos:pos + m] += s[:m] * g * a; buf[1, pos:pos + m] += s[:m] * g * b

def reverb(x, seg=1.4, mezcla=0.3, corte=4500):
    """reverberación sencilla: respuesta de ruido que se apaga poco a poco"""
    m = int(seg * SR); t = np.arange(m) / SR
    out = []
    for c in range(2):
        ir = bf(ruido(m), 'low', corte, 2) * np.exp(-t * 6.9 / seg); ir /= np.sqrt(np.sum(ir ** 2))
        out.append(oaconvolve(x[c], ir)[:x.shape[1]])
    return x * (1 - mezcla) + np.array(out) * mezcla

def bucle(x, cruce):
    """empalme sin corte: los últimos `cruce` segundos se funden con el principio"""
    X = int(cruce * SR); N = x.shape[1] - X
    w = np.sin(np.linspace(0, np.pi / 2, X)) ** 2
    y = x[:, :N].copy(); y[:, :X] = x[:, :X] * np.sqrt(w) + x[:, N:N + X] * np.sqrt(1 - w)
    return y

def acabar(nombre, x, rms_db=-21):
    # quitar los graves que no se oyen (el ruido marrón tiene mucha energía por debajo de 20 Hz y engaña al medir el volumen)
    x = np.stack([bf(bf(c, 'high', 35, 2), 'low', 13000, 2) for c in x])
    x *= 10 ** (rms_db / 20) / np.sqrt(np.mean(x ** 2))
    x = np.tanh(x * 1.2) / 1.2  # limitador suave
    os.makedirs(SAL, exist_ok=True)
    raw = os.path.join('/tmp', nombre + '.f32')
    x.T.astype('<f4').tofile(raw)
    dst = os.path.join(SAL, nombre + '.webm')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', raw,
                    '-c:a', 'libopus', '-b:a', '64k', '-application', 'audio', dst], check=True)
    os.remove(raw)
    print('%-10s %5.0f s  %5.0f KB' % (nombre, x.shape[1] / SR, os.path.getsize(dst) / 1024))

# ---------------------------------------------------------------- sonidos
def gotas(n, por_seg, largo_ms, banda, gmin=0.2):
    """muchas gotas: impulsos al azar pasados por un «golpecito» corto filtrado"""
    imp = np.zeros(n); k = rng.poisson(por_seg * n / SR)
    imp[rng.integers(0, n, k)] = rng.exponential(1, k) + gmin
    m = int(largo_ms / 1000 * SR); t = np.arange(m) / SR
    ker = bf(ruido(m), 'band', banda, 2) * np.exp(-t / (largo_ms / 1000 / 5))
    return oaconvolve(imp, ker)[:n]

def lluvia(seg=180, fuerte=1.0):
    n = int((seg + 6) * SR)
    base = estereo(lambda m: bf(color(m, 1), 'band', (300, 6500)), n) * 0.6
    fino = estereo(lambda m: gotas(m, 2600 * fuerte, 6, (1800, 7500)), n); fino /= np.std(fino); fino *= 0.35
    cerca = estereo(lambda m: gotas(m, 18 * fuerte, 25, (900, 4500), 0.5), n); cerca /= np.std(cerca); cerca *= 0.35
    suelo = estereo(lambda m: bf(color(m, 2), 'band', (40, 380)), n) * 0.5
    ola = np.stack([lento(n, 14, 0.8, 1.15), lento(n, 14, 0.8, 1.15)])
    return bucle((base + fino + cerca + suelo) * ola, 6)

def trueno(seg):
    m = int(seg * SR); t = np.arange(m) / SR; env = np.zeros(m)
    for _ in range(rng.integers(3, 7)):
        t0 = rng.uniform(0, seg * 0.45); a = rng.uniform(0.4, 1); sube = rng.uniform(0.15, 0.6); cae = rng.uniform(1.2, 3.5)
        e = np.where(t < t0, 0, np.where(t < t0 + sube, (t - t0) / sube, np.exp(-(t - t0 - sube) / cae)))
        env += a * e
    s = bf(color(m, 2), 'low', rng.uniform(140, 260)) * env
    s += bf(ruido(m), 'band', (60, 500), 2) * env * 0.25
    fin = np.minimum(1, (seg - t) / 1.5); return s * fin

def tormenta(seg=180):
    x = lluvia(seg + 8, 1.25) * 0.85; n = x.shape[1]
    t = rng.uniform(5, 25)
    while t < seg + 2:
        d = rng.uniform(7, 13); poner(x, int(t * SR), trueno(d), rng.uniform(2.5, 4.5), rng.uniform(-0.6, 0.6)); t += rng.uniform(35, 75)
    x = np.concatenate([x, np.zeros((2, int(8 * SR)))], axis=1)[:, :int((seg + 8) * SR)]
    return bucle(x, 8)

def mar(seg=180):
    n = int((seg + 12) * SR); x = np.zeros((2, n)); t = 0.0
    while t < seg + 12:
        P = rng.uniform(8, 13); m = int((P + 6) * SR); tt = np.arange(m) / SR
        sube = rng.uniform(2.5, 4.0); cae = rng.uniform(2.5, 4.5); a = rng.uniform(0.6, 1.0)
        e = np.where(tt < sube, (tt / sube) ** 2, np.exp(-(tt - sube) / cae))
        eh = np.where(tt < sube + 0.3, (np.clip(tt - 0.6, 0, None) / sube) ** 3, np.exp(-(tt - sube - 0.3) / (cae * 0.7)))
        bajo = bf(color(m, 1.6), 'low', 500) * e
        alto = bf(color(m, 1), 'band', (500, 7000)) * eh * 0.6
        espuma = bf(ruido(m), 'high', 3500) * np.exp(-np.abs(tt - sube - 1.2) / 1.2) * 0.12 * (tt > sube)
        pan = rng.uniform(-0.5, 0.5)
        poner(x, int(t * SR), (bajo + alto + espuma) * a, 1, pan)
        poner(x, int(t * SR) + int(0.015 * SR), (bajo + alto) * a * 0.5, 1, -pan)
        t += P * rng.uniform(0.75, 0.95)
    x += estereo(lambda m: bf(color(m, 2), 'low', 300), n) * 0.25
    return bucle(x, 12)

# ------- pájaros
def nota(f, dur, vib=0, vibf=7, arm=0.12):
    """una nota de pájaro: f = frecuencias (array) a lo largo de la nota"""
    m = int(dur * SR); fx = np.interp(np.linspace(0, 1, m), np.linspace(0, 1, len(f)), f)
    if vib: fx = fx * (1 + vib * np.sin(2 * np.pi * vibf * np.arange(m) / SR))
    ph = 2 * np.pi * np.cumsum(fx) / SR
    env = np.sin(np.linspace(0, np.pi, m)) ** 1.5
    return (np.sin(ph) + arm * np.sin(2 * ph)) * env

def silencio(s): return np.zeros(int(s * SR))

def frase_trino():   # carbonero / pinzón: notas rápidas que bajan
    f0 = rng.uniform(3800, 5200); L = []
    for i in range(rng.integers(6, 13)):
        L += [nota([f0, f0 * 0.72], rng.uniform(0.035, 0.05)), silencio(rng.uniform(0.02, 0.035))]
    if rng.random() < 0.6: L.append(nota([f0 * 0.9, f0 * 1.15, f0 * 0.6], 0.16))
    return np.concatenate(L)

def frase_mirlo():   # mirlo: silbidos suaves y largos
    L = []; base = rng.uniform(1600, 2300)
    for i in range(rng.integers(3, 6)):
        a = base * rng.uniform(0.85, 1.35); b = a * rng.uniform(0.8, 1.25)
        L += [nota([a, (a + b) / 2 * 1.05, b], rng.uniform(0.14, 0.32), vib=0.012, vibf=rng.uniform(25, 40), arm=0.2), silencio(rng.uniform(0.03, 0.12))]
    return np.concatenate(L) * 0.9

def frase_gorrion():  # gorrión: chip-chip
    L = []
    for i in range(rng.integers(2, 5)):
        f = rng.uniform(3000, 4200); L += [nota([f * 0.8, f * 1.25, f], rng.uniform(0.05, 0.08), arm=0.35), silencio(rng.uniform(0.08, 0.25))]
    return np.concatenate(L) * 0.7

def frase_petirrojo():  # petirrojo: gorjeo saltarín
    L = []
    for i in range(rng.integers(12, 24)):
        f = rng.uniform(2600, 6800); L += [nota([f, f * rng.uniform(0.8, 1.2)], rng.uniform(0.03, 0.09), vib=0.02, vibf=60), silencio(rng.uniform(0.0, 0.03))]
    return np.concatenate(L) * 0.6

def frase_cuco():
    a = nota([720, 700], 0.22, arm=0.05); b = nota([590, 575], 0.32, arm=0.05)
    L = []
    for i in range(rng.integers(2, 5)): L += [a, silencio(0.12), b, silencio(0.55)]
    return np.concatenate(L) * 0.8

def bosque(seg=240):
    n = int((seg + 8) * SR)
    gust = np.stack([lento(n, 9, 0.15, 0.7), lento(n, 9, 0.15, 0.7)])
    viento = estereo(lambda m: bf(color(m, 1), 'band', (150, 1400)), n) * gust * 0.45
    hojas = estereo(lambda m: bf(ruido(m), 'high', 2500), n) * gust ** 2 * 0.06
    aves = np.zeros((2, n)); t = 0.5
    tipos = [(frase_trino, 3), (frase_mirlo, 3), (frase_gorrion, 2), (frase_petirrojo, 2), (frase_cuco, 0.5)]
    pesos = np.array([w for _, w in tipos]); pesos = pesos / pesos.sum()
    while t < seg + 6:
        f = tipos[rng.choice(len(tipos), p=pesos)][0]; s = f()
        lejos = rng.uniform(0, 1); s = bf(s, 'low', 9000 - 5500 * lejos, 2)
        poner(aves, int(t * SR), s, 0.5 * (1 - 0.7 * lejos), rng.uniform(-0.85, 0.85))
        t += len(s) / SR + rng.uniform(0.6, 4.5)
    aves = reverb(aves, 1.3, 0.35)
    return bucle(viento + hojas + aves * 1.6, 8)

def rio(seg=180):
    n = int((seg + 6) * SR); x = np.zeros((2, n))
    for c in range(2):
        k = int(300 * (seg + 6)); pos = rng.integers(0, n, k)
        f0 = np.exp(rng.uniform(np.log(350), np.log(2600), k)); dur = rng.uniform(0.008, 0.04, k); amp = rng.exponential(1, k)
        for p, f, d, a in zip(pos, f0, dur, amp):
            m = int(d * SR); tt = np.arange(m) / SR
            ff = f * (1 + 1.8 * tt / d)  # la burbuja sube de tono al cerrarse
            s = np.sin(2 * np.pi * np.cumsum(ff) / SR) * np.exp(-tt / (d / 3))
            e = min(n, p + m); x[c, p:e] += a * s[:e - p] * (1.0 / np.sqrt(f / 350))
    x /= np.std(x)
    fondo = estereo(lambda m: bf(color(m, 1), 'band', (250, 7000)), n) * 0.7
    grave = estereo(lambda m: bf(color(m, 2), 'low', 250), n) * 0.3
    mod = np.stack([lento(n, 6, 0.85, 1.1), lento(n, 6, 0.85, 1.1)])
    return bucle((x * 0.55 + fondo + grave) * mod, 6)

def hoguera(seg=180):
    n = int((seg + 6) * SR)
    rugido = estereo(lambda m: bf(color(m, 2), 'band', (40, 260)), n) * np.stack([lento(n, 3, 0.6, 1.1), lento(n, 3, 0.6, 1.1)])
    llama = estereo(lambda m: bf(color(m, 1), 'band', (300, 1500)), n) * 0.25 * np.stack([lento(n, 1.5, 0.4, 1), lento(n, 1.5, 0.4, 1)])
    x = rugido + llama; t = 0.0
    while t < seg + 5:
        rafaga = rng.random() < 0.15; k = rng.integers(3, 12) if rafaga else 1
        for j in range(k):
            m = int(rng.uniform(0.0015, 0.006) * SR); tt = np.arange(m) / SR
            s = bf(ruido(m), 'band', (rng.uniform(900, 2500), 7000), 2) * np.exp(-tt / (m / SR / 4))
            poner(x, int((t + j * rng.uniform(0.01, 0.05)) * SR), s, rng.uniform(0.4, 1.6), rng.uniform(-0.7, 0.7))
        if rng.random() < 0.04:  # chasquido gordo
            m = int(0.03 * SR); tt = np.arange(m) / SR
            poner(x, int(t * SR), bf(ruido(m), 'band', (400, 2500), 2) * np.exp(-tt / 0.006), rng.uniform(2, 3.5), rng.uniform(-0.5, 0.5))
        t += rng.exponential(0.12)
    return bucle(x, 6)

def rosa(seg=180):
    n = int((seg + 4) * SR); return bucle(estereo(lambda m: bf(color(m, 1), 'low', 12000), n), 4)

def marron(seg=180):
    n = int((seg + 4) * SR); return bucle(estereo(lambda m: bf(color(m, 2), 'high', 25), n), 4)

SONIDOS = {'lluvia': lluvia, 'tormenta': tormenta, 'mar': mar, 'bosque': bosque, 'rio': rio, 'hoguera': hoguera, 'rosa': rosa, 'marron': marron}

if __name__ == '__main__':
    for k in (sys.argv[1:] or SONIDOS):
        acabar(k, SONIDOS[k]())
