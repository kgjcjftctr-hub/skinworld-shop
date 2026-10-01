"""Une fotos clave de una persona girando en una secuencia continua (morphing).

Uso: python3 scripts/personas/morph.py <carpeta> <orden: g1,g2,...> <angulos: -43,-30,...> <salida> [cuadros]

En <carpeta> van las fotos clave (g1.png, g2.png...) y, junto a cada una, su
JSON de puntos y su máscara, que saca scripts/personas/puntos.swift con Vision
de macOS. Las fotos se alinean (misma escala de cara y mismo eje del cuello),
y entre cada par se generan cuadros intermedios deformando ambas hacia la forma
intermedia. La salida es RGBA (fondo transparente) en 3:4, lista para
scripts/preparar-persona.mjs. Solo necesita numpy y Pillow.
Ver docs/personas-necesidades.md.
"""
import json
import math
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

origen, orden, angulos, salida = sys.argv[1], sys.argv[2].split(','), [float(a) for a in sys.argv[3].split(',')], sys.argv[4]
N_CUADROS = int(sys.argv[5]) if len(sys.argv) > 5 else 48
MARGEN = 40
MEZCLA = (0.4, 0.6)
# Del contorno de la cara solo sirven la mandíbula y la barbilla; los puntos
# de las sienes caen en el borde lejano y cambian de significado al girar.
CONTORNO_LATERAL = set(range(0, 4)) | set(range(13, 17))
os.makedirs(salida, exist_ok=True)

GRUPOS = ['contorno', 'ojoIzq', 'ojoDer', 'cejaIzq', 'cejaDer', 'nariz', 'crestaNariz', 'lineaMedia',
          'labiosExt', 'labiosInt', 'pupilaIzq', 'pupilaDer']


def cargar(nombre):
    img = np.asarray(Image.open(os.path.join(origen, nombre + '.png')).convert('RGB'), dtype=np.float32) / 255
    mascara = np.asarray(Image.open(os.path.join(origen, nombre + '-mascara.png')).convert('L'), dtype=np.float32) / 255
    datos = json.load(open(os.path.join(origen, nombre + '.json')))
    puntos = np.array([p for g in GRUPOS for p in datos['puntos'][g]], dtype=np.float64)
    return img, mascara, puntos, datos['puntos']


claves = [cargar(n) for n in orden]
H, W = claves[0][0].shape[:2]

# --- Alineación: misma distancia ojos-boca y mismo eje del cuello ---------
def medidas(mascara, grupos):
    ojos = np.array(grupos['pupilaIzq'] + grupos['pupilaDer'])
    boca = np.array(grupos['labiosExt']).mean(0)
    y_ojos = ojos[:, 1].mean()
    escala = boca[1] - y_ojos
    # Eje del cuello: centro de la silueta un poco abajo de la barbilla.
    barbilla = max(p[1] for p in grupos['contorno'])
    fila = int(min(H - 1, barbilla + 0.45 * escala))
    xs = np.nonzero(mascara[fila] > 0.5)[0]
    cuello = (xs.min() + xs.max()) / 2 if len(xs) else W / 2
    return escala, y_ojos, cuello


med = [medidas(c[1], c[3]) for c in claves]
escala_ref = float(np.median([m[0] for m in med]))
y_ref = float(np.median([m[1] for m in med]))


def transformar(img, mascara, puntos, m):
    """Escala y traslada para que todas compartan escala de cara, línea de ojos y cuello centrado."""
    escala, y_ojos, cuello = m
    k = escala_ref / escala
    # x' = k (x - cuello) + W/2 ;  y' = k (y - y_ojos) + y_ref
    def inversa(xp, yp):
        return (xp - W / 2) / k + cuello, (yp - y_ref) / k + y_ojos
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    sx, sy = inversa(xx, yy)
    rgba = np.dstack([img * mascara[..., None], mascara])  # premultiplicado
    out = muestrear(rgba, sx, sy)
    pts = np.column_stack([k * (puntos[:, 0] - cuello) + W / 2, k * (puntos[:, 1] - y_ojos) + y_ref])
    return out, pts


def muestrear(img, sx, sy):
    """Bilineal; fuera de la imagen es transparente."""
    h, w = img.shape[:2]
    x0 = np.floor(sx).astype(np.int32)
    y0 = np.floor(sy).astype(np.int32)
    fx = (sx - x0)[..., None]
    fy = (sy - y0)[..., None]
    def toma(y, x):
        dentro = (x >= 0) & (x < w) & (y >= 0) & (y < h)
        v = img[np.clip(y, 0, h - 1), np.clip(x, 0, w - 1)]
        return v * dentro[..., None]
    a = toma(y0, x0); b = toma(y0, x0 + 1); c = toma(y0 + 1, x0); d = toma(y0 + 1, x0 + 1)
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy


alineadas = [transformar(c[0], c[1], c[2], m) for c, m in zip(claves, med)]


# --- Puntos de silueta por fila (correspondencia natural entre fotos) ------
def silueta(alfa, filas):
    pts = []
    for f in filas:
        xs = np.nonzero(alfa[f] > 0.5)[0]
        pts.append((xs.min(), f, xs.max()) if len(xs) else None)
    return pts


def borde():
    pts = []
    for t in np.linspace(0, 1, 7):
        pts += [(t * (W - 1), 0), (t * (W - 1), H - 1), (0, t * (H - 1)), (W - 1, t * (H - 1))]
    return np.array(pts)


def puntos_par(a, b):
    (ia, pa), (ib, pb) = a, b
    filas = list(range(0, H, 36))
    sa, sb = silueta(ia[..., 3], filas), silueta(ib[..., 3], filas)
    extra_a, extra_b = [], []
    lejos = lambda x: 20 < x < W - 20  # pegado al marco choca con los puntos del borde
    for u, v in zip(sa, sb):
        if u and v:
            if lejos(u[0]) and lejos(v[0]):
                extra_a.append((u[0], u[1])); extra_b.append((v[0], v[1]))
            if lejos(u[2]) and lejos(v[2]):
                extra_a.append((u[2], u[1])); extra_b.append((v[2], v[1]))
    # Puntos de la cara pegados a la silueta (sobre todo el contorno del lado
    # lejano) chocan con los de silueta e invierten triángulos: se quitan.
    def cerca_del_borde(alfa, p):
        f = int(np.clip(round(p[1]), 0, H - 1))
        xs = np.nonzero(alfa[f] > 0.5)[0]
        return len(xs) and min(abs(p[0] - xs.min()), abs(p[0] - xs.max())) < MARGEN
    sirven = [k for k in range(len(pa)) if k not in CONTORNO_LATERAL and not cerca_del_borde(ia[..., 3], pa[k]) and not cerca_del_borde(ib[..., 3], pb[k])]
    pa, pb = pa[sirven], pb[sirven]
    bd = borde()
    A = np.vstack([pa, np.array(extra_a), bd])
    B = np.vstack([pb, np.array(extra_b), bd])
    # Quita puntos casi duplicados (rompen la triangulación).
    media = (A + B) / 2
    quedan, vistos = [], []
    for i, p in enumerate(media):
        if all(np.hypot(*(p - q)) > 6 for q in vistos):
            vistos.append(p); quedan.append(i)
    return A[quedan], B[quedan]


# --- Delaunay (Bowyer-Watson) ---------------------------------------------
def delaunay(pts):
    n = len(pts)
    m = max(W, H) * 10
    p = np.vstack([pts, [[-m, -m], [3 * m, -m], [-m, 3 * m]]])
    tris = [(n, n + 1, n + 2)]
    def circ(t):
        (ax, ay), (bx, by), (cx, cy) = p[t[0]], p[t[1]], p[t[2]]
        d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by))
        ux = ((ax*ax+ay*ay)*(by-cy)+(bx*bx+by*by)*(cy-ay)+(cx*cx+cy*cy)*(ay-by))/d
        uy = ((ax*ax+ay*ay)*(cx-bx)+(bx*bx+by*by)*(ax-cx)+(cx*cx+cy*cy)*(bx-ax))/d
        return ux, uy, (ax-ux)**2+(ay-uy)**2
    cache = {tris[0]: circ(tris[0])}
    for i in range(n):
        x, y = p[i]
        malos = [t for t in tris if (x - cache[t][0])**2 + (y - cache[t][1])**2 < cache[t][2]]
        aristas = {}
        for t in malos:
            for e in ((t[0], t[1]), (t[1], t[2]), (t[2], t[0])):
                k = tuple(sorted(e)); aristas[k] = aristas.get(k, 0) + 1
        tris = [t for t in tris if t not in malos]
        for (u, v), c in aristas.items():
            if c == 1:
                t = (u, v, i); tris.append(t); cache[t] = circ(t)
    return np.array([t for t in tris if max(t) < n])


# --- Deformación por triángulos -------------------------------------------
def deformar(img, desde, hacia, tris):
    """Lleva img (con puntos `desde`) a la forma `hacia`."""
    indice = Image.new('I', (W, H), 0)
    dr = ImageDraw.Draw(indice)
    for k, t in enumerate(tris):
        dr.polygon([tuple(hacia[j]) for j in t], fill=k + 1, outline=k + 1)
    idx = np.asarray(indice, dtype=np.int32) - 1
    # Afín de destino -> origen por triángulo.
    M = np.zeros((len(tris), 2, 3))
    for k, t in enumerate(tris):
        D = np.column_stack([hacia[list(t)], np.ones(3)])
        S = desde[list(t)]
        try:
            M[k] = np.linalg.solve(D, S).T
        except np.linalg.LinAlgError:
            M[k] = [[1, 0, 0], [0, 1, 0]]
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    validos = idx >= 0
    Mi = M[np.clip(idx, 0, None)]
    sx = Mi[..., 0, 0] * xx + Mi[..., 0, 1] * yy + Mi[..., 0, 2]
    sy = Mi[..., 1, 0] * xx + Mi[..., 1, 1] * yy + Mi[..., 1, 2]
    sx = np.where(validos, sx, xx); sy = np.where(validos, sy, yy)
    return muestrear(img, sx.astype(np.float32), sy.astype(np.float32))


# --- Recorrido: cuadros repartidos por ángulo (con un mínimo por tramo) ----
pesos = [max(abs(angulos[i + 1] - angulos[i]), 8) for i in range(len(angulos) - 1)]
total = sum(pesos)
pares = {}
suave = lambda t: t * t * (3 - 2 * t)

# Recorte 3:4 con aire arriba y desvanecido abajo (el torso se pierde suave).
alto_recorte = int(W * 4 / 3)
arriba = int(min(H - alto_recorte, max(0, y_ref - escala_ref * 3.05)))
desvanecido = np.ones(alto_recorte, dtype=np.float32)
inicio_fade = int(alto_recorte * 0.78)
desvanecido[inicio_fade:] = np.linspace(1, 0, alto_recorte - inicio_fade) ** 1.6

for c in range(N_CUADROS):
    s = c / (N_CUADROS - 1) * total
    i, acum = 0, 0.0
    while i < len(pesos) - 1 and acum + pesos[i] < s:
        acum += pesos[i]; i += 1
    t = min(1.0, max(0.0, (s - acum) / pesos[i]))
    if i not in pares:
        A, B = puntos_par(alineadas[i], alineadas[i + 1])
        pares[i] = (A, B, delaunay((A + B) / 2))
    A, B, tris = pares[i]
    if t < 1e-4:
        cuadro = alineadas[i][0]
    elif t > 1 - 1e-4:
        cuadro = alineadas[i + 1][0]
    else:
        P = (1 - t) * A + t * B
        a = deformar(alineadas[i][0], A, P, tris)
        b = deformar(alineadas[i + 1][0], B, P, tris)
        # La forma cambia de manera continua, pero la mezcla de colores es
        # corta: así casi nunca se ven dos ojos u orejas encimados.
        f = suave(min(1.0, max(0.0, (t - MEZCLA[0]) / (MEZCLA[1] - MEZCLA[0]))))
        cuadro = a * (1 - f) + b * f
        # Bordes firmes: donde solo una foto tiene persona, no queda semitransparente.
        al = cuadro[..., 3:4]
        firme = np.clip((al - 0.18) / 0.5, 0, 1)
        firme = firme * firme * (3 - 2 * firme)
        cuadro = np.dstack([cuadro[..., :3] / np.maximum(al, 1e-4) * firme, firme])
    rgba = cuadro[arriba:arriba + alto_recorte].copy()
    alfa = np.clip(rgba[..., 3], 0, 1) * desvanecido[:, None]
    color = np.where(rgba[..., 3:4] > 1e-4, rgba[..., :3] / np.maximum(rgba[..., 3:4], 1e-4), 0)
    out = np.dstack([np.clip(color, 0, 1), alfa])
    Image.fromarray((out * 255 + 0.5).astype(np.uint8), 'RGBA').save(os.path.join(salida, f'{c + 1:04d}.png'))
    print(f'\rcuadro {c + 1}/{N_CUADROS} (tramo {i + 1}, t={t:.2f})', end='', flush=True)
print('\nlisto', salida)
