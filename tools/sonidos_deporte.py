"""
🔊 Sonidos de los avisos de deporte (21 nov. 2026), hechos aquí con matemáticas (sin grabaciones de nadie,
así no hay derechos de autor de por medio):
  - bn_fanfarria.ogg: bombos y trompetas para «¡Hoy juega tu equipo!»
  - bn_ovacion.ogg:   ovación y aplausos del público para el resultado final
Se guardan en app/src/main/res/raw. Uso: python3 tools/sonidos_deporte.py  (necesita numpy, scipy y ffmpeg)
"""
import os, subprocess, tempfile
import numpy as np
from scipy.signal import butter, lfilter
from scipy.io import wavfile

SR = 44100
rng = np.random.default_rng(7)
OUT = os.path.join(os.path.dirname(__file__), "..", "app", "src", "main", "res", "raw")


def bp(x, lo, hi, o=2):
    b, a = butter(o, [lo / (SR / 2), hi / (SR / 2)], btype="band"); return lfilter(b, a, x)


def lp(x, f, o=2):
    b, a = butter(o, f / (SR / 2)); return lfilter(b, a, x)


def env(n, at, rel):
    e = np.ones(n); a = int(at * SR); r = int(rel * SR)
    if a: e[:a] = np.linspace(0, 1, a)
    if r: e[-r:] *= np.linspace(1, 0, r)
    return e


def trompeta(f, dur, vol=1.0):
    t = np.arange(int(dur * SR)) / SR
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.5 * t) * np.clip(t / 0.25, 0, 1)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    # timbre de metal: muchos armónicos, más brillantes al soplar fuerte
    s = sum((1 / k) * np.sin(k * ph) * (1 if k < 6 else 0.6) for k in range(1, 12))
    s = lp(s, 2600 + 1800 * vol)
    return s * env(len(t), 0.03, min(0.12, dur / 3)) * vol


def bombo(dur=0.5, f0=90):
    t = np.arange(int(dur * SR)) / SR
    f = f0 * (1 + 1.5 * np.exp(-t * 30))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    s += lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 40) * 0.3
    return s


def caja(dur=0.18):
    t = np.arange(int(dur * SR)) / SR
    return bp(rng.standard_normal(len(t)), 1200, 6000) * np.exp(-t * 26) * 0.6 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.3


def pon(buf, s, at):
    i = int(at * SR); buf[i:i + len(s)] += s[:max(0, len(buf) - i)]


def fanfarria():
    L = 3.6; m = np.zeros(int(L * SR))
    # redoble de caja que va creciendo
    for k in range(18):
        pon(m, caja() * (0.3 + 0.7 * k / 18), k * 0.045)
    # bombos
    for at in (0.82, 1.22, 1.62, 2.02, 2.4):
        pon(m, bombo() * 1.2, at)
    # trompetas: llamada de fanfarria (sol-do-mi-sol … do agudo largo), a dos voces
    G4, C5, E5, G5, C6 = 392.0, 523.25, 659.25, 783.99, 1046.5
    notas = [(G4, .82, .16), (G4, 1.0, .12), (C5, 1.12, .28), (E5, 1.42, .18), (G5, 1.62, .38), (E5, 2.02, .18), (G5, 2.2, .2), (C6, 2.4, 1.1)]
    for f, at, d in notas:
        pon(m, trompeta(f, d, 1.0), at)
        pon(m, trompeta(f * 0.75, d, 0.5) * 0.45, at)      # segunda voz, una cuarta por debajo
    # platillo final
    t = np.arange(int(1.2 * SR)) / SR
    pon(m, bp(rng.standard_normal(len(t)), 4000, 12000) * np.exp(-t * 3) * 0.35, 2.4)
    return m


def sala(x, seg=1.2, mezcla=0.35):
    """Eco de pabellón: se mezcla con una respuesta de ruido que se apaga poco a poco."""
    from scipy.signal import fftconvolve
    t = np.arange(int(seg * SR)) / SR
    ir = rng.standard_normal(len(t)) * np.exp(-t * 4.5); ir = lp(ir, 5000); ir /= np.sqrt(np.sum(ir ** 2))
    w = fftconvolve(x, ir)[:len(x)]
    return x * (1 - mezcla) + w * mezcla * 2.2


def ovacion():
    """Aplausos y bullicio de la afición: 70 personas aplaudiendo cada una a su ritmo + el rugido de la grada."""
    L = 4.8; n = int(L * SR); t = np.arange(n) / SR
    forma = np.clip(t / 0.35, 0, 1) * np.clip((L - t) / 1.6, 0, 1) ** 1.3
    m = np.zeros(n)
    # aplausos: cada persona tiene su ritmo (3,5-6 palmadas por segundo), su fuerza y el «tono» de sus manos
    for _ in range(70):
        rit = rng.uniform(3.5, 6.0); at = rng.uniform(0, 0.4); fuerza = rng.uniform(0.4, 1.0)
        f1 = rng.uniform(700, 1500); f2 = f1 * rng.uniform(2.2, 4.5)
        d = int(0.018 * SR); tt = np.arange(d) / SR
        base = bp(rng.standard_normal(d * 40), f1, min(f2, 9000))
        k = 0
        while at < L - 0.05:
            seg = base[(k % 40) * d:(k % 40 + 1) * d] * np.exp(-tt * rng.uniform(180, 320))
            g = np.interp(at, t, forma) * fuerza * rng.uniform(0.7, 1.15)
            pon(m, seg * g, at)
            at += 1 / rit * rng.uniform(0.9, 1.1); k += 1
    m /= np.max(np.abs(m)) + 1e-9
    # bullicio de la afición: rugido grave + muchas voces (ruido con «vocales» que cambian despacio)
    rugido = lp(rng.standard_normal(n), 700) * 0.5
    voces = np.zeros(n)
    for _ in range(14):
        c = rng.uniform(450, 1300); lfo = rng.uniform(0.3, 1.2)
        v = bp(rng.standard_normal(n), c * 0.8, c * 1.25) * (0.5 + 0.5 * np.sin(2 * np.pi * lfo * t + rng.uniform(0, 6)))
        voces += v
    voces /= np.max(np.abs(voces)) + 1e-9
    grada = (rugido / (np.max(np.abs(rugido)) + 1e-9) * 0.45 + voces * 0.55)
    grada *= np.clip(t / 0.25, 0, 1) * (0.75 + 0.25 * np.clip(t / 1.2, 0, 1)) * np.clip((L - t) / 1.8, 0, 1)
    mez = m * 0.75 + grada * 0.5
    return sala(mez, 1.4, 0.4)


def guarda(x, nombre):
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.89
    os.makedirs(OUT, exist_ok=True)
    with tempfile.TemporaryDirectory() as d:
        w = os.path.join(d, "a.wav"); wavfile.write(w, SR, (x * 32767).astype(np.int16))
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", w, "-c:a", "libvorbis", "-q:a", "4", os.path.join(OUT, nombre)], check=True)
    print("✔", nombre)


if __name__ == "__main__":
    guarda(fanfarria(), "bn_fanfarria.ogg")
    guarda(ovacion(), "bn_ovacion.ogg")
