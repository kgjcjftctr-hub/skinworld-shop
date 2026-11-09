"""Banda sonora original para el video de SEGURO, sintetizada localmente con numpy.

Sin muestras ni recursos externos: pad armónico + pulso suave + efectos (whoosh, clics,
golpe del sello, campana final) sincronizados con los tiempos de scene.js.
Uso: python3 audio.py salida.wav
"""
import sys
import wave
import numpy as np

SR = 48000
DUR = 24.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(42)
L = np.zeros(N)
R = np.zeros(N)


def note(f):  # MIDI -> Hz
    return 440.0 * 2 ** ((f - 69) / 12)


def add(sig, start, pan=0.0, gain=1.0):
    i0 = int(start * SR)
    if i0 >= N:
        return
    sig = sig[: N - i0] * gain
    L[i0:i0 + len(sig)] += sig * np.sqrt(0.5 * (1 - pan))
    R[i0:i0 + len(sig)] += sig * np.sqrt(0.5 * (1 + pan))


def env_adsr(n, a, d, s, r, sr=SR):
    a, d, r = int(a * sr), int(d * sr), int(r * sr)
    sus = max(0, n - a - d - r)
    e = np.concatenate([np.linspace(0, 1, a, endpoint=False), np.linspace(1, s, d, endpoint=False),
                        np.full(sus, s), np.linspace(s, 0, r)])
    return np.pad(e, (0, max(0, n - len(e))))[:n]


def lowpass(x, cutoff):
    # filtro de un polo, suficiente para suavizar ruido
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


# ── pad: acordes cálidos, cambian cada ~6 s ─────────────────────────────
chords = [  # (inicio, notas MIDI)
    (0.0, [50, 57, 62, 64, 69]),     # Dsus2/add9
    (6.0, [47, 54, 59, 62, 66]),     # Bm7(add11-ish)
    (12.0, [43, 55, 59, 62, 66]),    # Gmaj7
    (18.0, [45, 57, 61, 64, 69]),    # A
    (22.2, [50, 57, 62, 66, 69, 74]),  # D (resolución en el logotipo)
]
for k, (start, notes) in enumerate(chords):
    end = chords[k + 1][0] if k + 1 < len(chords) else DUR
    dur = end - start + 1.2
    n = int(dur * SR)
    tt = np.arange(n) / SR
    e = env_adsr(n, 1.0, 0.5, 0.85, 1.4)
    for j, m in enumerate(notes):
        f = note(m)
        det = 1 + (j - 2) * 0.0009
        w = (np.sin(2 * np.pi * f * det * tt) + 0.35 * np.sin(2 * np.pi * 2 * f * tt + 0.3)
             + 0.12 * np.sin(2 * np.pi * 3 * f * tt + 1.1))
        trem = 1 + 0.08 * np.sin(2 * np.pi * (0.18 + 0.03 * j) * tt + j)
        add(w * e * trem, start, pan=(j - 2) * 0.25, gain=0.022)

# ── pulso suave (bajo + pluck) a 100 BPM a partir de la escena 2 ──────────
beat = 60 / 100
roots = {0.0: 38, 6.0: 35, 12.0: 31, 18.0: 33}
def root_at(x):
    r = 38
    for k, v in roots.items():
        if x >= k:
            r = v
    return r

b = 4.6
while b < 21.2:
    n = int(0.5 * SR)
    tt = np.arange(n) / SR
    f = note(root_at(b))
    bass = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 7)
    add(bass, b, gain=0.10)
    # pluck en contratiempo
    m = root_at(b) + 24 + [0, 7, 12, 7][int(round((b - 4.6) / beat)) % 4]
    fp = note(m)
    pl = (np.sin(2 * np.pi * fp * tt) + 0.3 * np.sin(4 * np.pi * fp * tt)) * np.exp(-tt * 14)
    add(pl, b + beat / 2, pan=0.3 * np.sin(b), gain=0.035)
    b += beat

# ── efectos ──────────────────────────────────────────────────────────────
def whoosh(start, dur, gain=0.06, rise=True):
    n = int(dur * SR)
    noise = lowpass(rng.standard_normal(n), 1800)
    tt = np.linspace(0, 1, n)
    e = np.sin(np.pi * tt) ** 2 * (tt if rise else 1 - tt) ** 0.3
    add(noise * e, start, pan=-0.2, gain=gain)
    add(np.roll(noise, 997) * e, start, pan=0.2, gain=gain)


def tick(start, freq=2400, gain=0.05, pan=0.0):
    n = int(0.08 * SR)
    tt = np.arange(n) / SR
    add(np.sin(2 * np.pi * freq * tt) * np.exp(-tt * 70), start, pan=pan, gain=gain)


def blip(start, notes, gain=0.07, step=0.09, pan=0.0):
    for i, m in enumerate(notes):
        n = int(0.6 * SR)
        tt = np.arange(n) / SR
        f = note(m)
        s = (np.sin(2 * np.pi * f * tt) + 0.2 * np.sin(2 * np.pi * 2 * f * tt)) * np.exp(-tt * 6) * np.minimum(1, tt * 400)
        add(s, start + i * step, pan=pan, gain=gain)


def thud(start, gain=0.35):
    n = int(0.7 * SR)
    tt = np.arange(n) / SR
    f = 95 * np.exp(-tt * 6) + 48
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 7)
    click = lowpass(rng.standard_normal(n), 3000) * np.exp(-tt * 45) * 0.5
    add(body + click, start, gain=gain)


def chime(start, gain=0.08):
    for i, m in enumerate([74, 78, 81, 86]):
        n = int(2.6 * SR)
        tt = np.arange(n) / SR
        f = note(m)
        s = (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(2 * np.pi * 2.76 * f * tt) * np.exp(-tt * 3)) * np.exp(-tt * 1.6)
        add(s * np.minimum(1, tt * 300), start + i * 0.07, pan=-0.3 + i * 0.2, gain=gain)


# escena 1: llegan las tarjetas
for i, ta in enumerate([1.75, 2.03, 2.2, 2.31, 2.59]):
    tick(ta, freq=1800 + 220 * i, gain=0.035, pan=[-0.6, -0.3, 0, 0.3, 0.6][i])
whoosh(0.3, 2.2, gain=0.035)
# escena 2: la tarjeta protagonista avanza, cambia de estado dos veces
whoosh(4.3, 1.4, gain=0.05)
tick(6.45, freq=2600, gain=0.05); blip(6.45, [74, 81], gain=0.06)
tick(7.95, freq=2600, gain=0.05); blip(7.95, [76, 83], gain=0.06)
# escena 3: aparece la próxima acción
whoosh(9.2, 1.5, gain=0.05)
blip(10.5, [69, 76, 81], gain=0.055, pan=0.3)
# escena 4: borrador + sello «Revisión humana»
whoosh(13.2, 1.4, gain=0.055)
thud(15.55)
# escena 5: historial
whoosh(17.6, 1.2, gain=0.05)
tick(18.15, freq=2200, gain=0.045)
blip(19.05, [74, 78, 81], gain=0.05)
blip(19.95, [69, 71], gain=0.04, step=0.16)  # neutro: resultado por confirmar
# cierre
whoosh(21.0, 1.6, gain=0.06)
chime(22.35)

# ── mezcla final ─────────────────────────────────────────────────────────
mix = np.stack([L, R], axis=1)
fade_in = np.minimum(1, t / 0.6)
fade_out = np.minimum(1, (DUR - t) / 1.2)
mix *= (fade_in * fade_out)[:, None]
mix = np.tanh(mix * 1.6) / np.tanh(1.6)  # saturación suave
mix *= 0.89 / np.max(np.abs(mix))         # pico ≈ -1 dBFS
pcm = (mix * 32767).astype(np.int16)

out = sys.argv[1] if len(sys.argv) > 1 else 'audio.wav'
with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('audio listo', out, f'{DUR}s')
