"""Secuencia de PRUEBA para la sección de necesidades (no es un asset final).

Renderiza una esfera con textura de piel que gira sobre su eje vertical y cuya
superficie mejora de forma continua entre el 35 % y el 68 % del giro. Sirve
solo para revisar la coreografía de scroll mientras llegan las secuencias
reales de cada persona (ver docs/personas-necesidades.md). Se muestra
únicamente con ?muestra=personas en la URL.

Uso: python3 scripts/generar-muestra-personas.py
"""
import json, os
import numpy as np
from PIL import Image

RAIZ = os.path.join(os.path.dirname(__file__), '..', 'public', 'necesidades', 'muestra')
rng = np.random.default_rng(3)

# Textura en coordenadas de longitud/latitud.
TW, TH = 1024, 512
lon = np.linspace(-np.pi, np.pi, TW, endpoint=False)[None, :]
lat = np.linspace(np.pi / 2, -np.pi / 2, TH)[:, None]
poros = rng.normal(0, 1, (TH, TW))
from PIL import ImageFilter
def suavizar(a, r):
    im = Image.fromarray(((a - a.min()) / (np.ptp(a) + 1e-9) * 255).astype('uint8'))
    return np.asarray(im.filter(ImageFilter.GaussianBlur(r))).astype(float) / 255
poros_fino = suavizar(poros, 0.8) - 0.5
textura_media = suavizar(rng.normal(0, 1, (TH, TW)), 6) - 0.5
manchas = np.zeros((TH, TW))
for _ in range(26):
    cx, cy = rng.uniform(-2.6, 2.6), rng.uniform(-0.9, 0.9)
    r = rng.uniform(0.03, 0.075)
    d = np.sqrt(((np.angle(np.exp(1j * (lon - cx)))) * np.cos(lat)) ** 2 + (lat - cy) ** 2)
    manchas = np.maximum(manchas, np.exp(-(d / r) ** 2) * rng.uniform(0.6, 1.0))
rojez = suavizar(rng.normal(0, 1, (TH, TW)), 22)

def cuadro(alto, frac, giro):
    ancho = int(alto * 3 / 4)
    radio = ancho * 0.4
    cx, cy = ancho / 2, alto * 0.47
    yy, xx = np.mgrid[0:alto, 0:ancho].astype(float)
    nx, ny = (xx - cx) / radio, (cy - yy) / radio
    rr = nx ** 2 + ny ** 2
    dentro = rr <= 1
    nz = np.sqrt(np.clip(1 - rr, 0, 1))
    la = np.arcsin(np.clip(ny, -1, 1))
    lo = np.arctan2(nx, nz) + giro
    u = ((lo + np.pi) % (2 * np.pi)) / (2 * np.pi) * (TW - 1)
    v = (np.pi / 2 - la) / np.pi * (TH - 1)
    ui, vi = u.astype(int), v.astype(int)
    mejora = np.clip((frac - 0.35) / (0.68 - 0.35), 0, 1)
    mejora = mejora * mejora * (3 - 2 * mejora)
    m = manchas[vi, ui] * (1 - mejora)
    r_ = rojez[vi, ui] * (1 - 0.8 * mejora)
    p = poros_fino[vi, ui]
    t = textura_media[vi, ui] * (1 - 0.5 * mejora)
    base = np.array([233, 196, 182]) / 255
    col = base[None, None, :] + 0.05 * t[..., None] + 0.035 * p[..., None]
    col += (r_[..., None] - 0.5) * np.array([0.10, -0.04, -0.03]) * 0.9
    col = col * (1 - m[..., None]) + np.array([0.80, 0.47, 0.47]) * m[..., None]
    # Luz editorial: principal desde arriba a la izquierda, envolvente suave y brillo.
    L = np.array([-0.45, 0.55, 0.7]); L /= np.linalg.norm(L)
    N = np.stack([nx, ny, nz], -1)
    N = np.nan_to_num(N)
    difusa = np.clip((N @ L + 0.35) / 1.35, 0, 1)
    H = L + np.array([0, 0, 1]); H /= np.linalg.norm(H)
    brillo = np.clip(np.nan_to_num(N @ H), 0, 1) ** (60 - 20 * mejora) * (0.1 + 0.12 * mejora)
    luz = 0.5 + 0.62 * difusa + 0.06 * mejora
    rgb = np.clip(col * luz[..., None] + brillo[..., None], 0, 1)
    borde = np.clip((1 - np.sqrt(rr)) * radio / 1.5, 0, 1)
    a = (dentro * borde * 255).astype('uint8')
    img = np.dstack([(rgb * 255).astype('uint8'), a])
    return Image.fromarray(img)

manifiesto = {}
for perfil, alto, n in (('escritorio', 1100, 48), ('movil', 760, 32)):
    carpeta = os.path.join(RAIZ, perfil)
    os.makedirs(carpeta, exist_ok=True)
    for k in range(n):
        frac = k / (n - 1)
        giro = np.radians(-75 + 150 * frac)
        cuadro(alto, frac, giro).save(os.path.join(carpeta, f'{k + 1:04d}.webp'), 'WEBP', quality=78, method=5)
    manifiesto[perfil] = {'cuadros': n, 'ancho': int(alto * 3 / 4), 'alto': alto}
print(json.dumps(manifiesto))
