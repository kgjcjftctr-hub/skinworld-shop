"""Prepara las fotos de la mujer dentro de la esfera de la sección de necesidades.

Uso: python3 scripts/personas/preparar-estados.py <carpeta> [--salida public/necesidades/estados]

En <carpeta> van perfecta.png (el resultado, igual para todas las categorías) y
una foto por problema: acne, dermatitis, antiedad, manchas, cabello, bebe, solar
y suplementos (.png). Junto a cada una, su JSON de puntos de
scripts/personas/puntos.swift:

    for f in carpeta/*.png; do .next/puntos "$f" "${f%.png}.json" "${f%.png}-mascara.png"; done

Cada problema se alinea con la foto perfecta (escala, giro y posición a partir de
ojos, nariz y boca), así la cabeza queda exactamente en el mismo lugar en todos
los estados. Se recorta un cuadro (la esfera es redonda) con los ojos a la misma
altura y se exporta a WebP para computadora y celular. Al final se registran en
src/data/personas-necesidades.json. Solo necesita numpy y Pillow.
"""
import json
import os
import shutil
import sys

import numpy as np
from PIL import Image

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
CLAVES = {  # nombre del archivo -> slug de la categoría
    'acne': 'acne', 'dermatitis': 'dermatitis', 'antiedad': 'antiedad', 'manchas': 'manchas',
    'cabello': 'cabello-y-unas', 'bebe': 'piel-de-bebe', 'solar': 'proteccion-solar', 'suplementos': 'suplementos',
}
PERFILES = {'escritorio': (1000, 86), 'movil': (640, 80)}
ESTABLES = ['pupilaIzq', 'pupilaDer', 'ojoIzq', 'ojoDer', 'nariz', 'crestaNariz', 'labiosExt', 'lineaMedia']
# Altura de los ojos dentro del cuadro (fracción): deja ver cabello arriba y hombros abajo.
OJOS = 0.42
AIRE = 1.32

args = sys.argv[1:]
carpeta = args[0]
salida = args[args.index('--salida') + 1] if '--salida' in args else os.path.join(RAIZ, 'public', 'necesidades', 'estados')


def datos(nombre):
    return json.load(open(os.path.join(carpeta, nombre + '.json')))['puntos']


def puntos(nombre):
    d = datos(nombre)
    return np.array([p for g in ESTABLES for p in d[g]], dtype=np.float64)


def similitud(desde, hacia):
    """Escala + giro + traslación (Procrustes) que lleva `desde` sobre `hacia`."""
    md, mh = desde.mean(0), hacia.mean(0)
    a, b = desde - md, hacia - mh
    u, s, vt = np.linalg.svd(a.T @ b)
    r = (u @ vt).T
    if np.linalg.det(r) < 0:
        vt[-1] *= -1
        r = (u @ vt).T
    k = s.sum() / (a ** 2).sum()
    return k * r, mh - k * r @ md


def alinear(img, matriz, desplazamiento):
    inv = np.linalg.inv(matriz)
    t = -inv @ desplazamiento
    return img.transform(img.size, Image.AFFINE, (inv[0, 0], inv[0, 1], t[0], inv[1, 0], inv[1, 1], t[1]), resample=Image.BICUBIC)


base_pts = puntos('perfecta')
base = Image.open(os.path.join(carpeta, 'perfecta.png')).convert('RGB')
W, H = base.size
ojos = np.array(datos('perfecta')['pupilaIzq'] + datos('perfecta')['pupilaDer'])
# El cuadro es más ancho que la foto para que quepan cabeza y hombros dentro de la
# esfera; los lados se rellenan con el color del fondo y se funden.
lado = int(round(W * AIRE))
arriba = int(round(ojos[:, 1].mean() - OJOS * lado))
izquierda = (lado - W) // 2

if os.path.isdir(salida):
    shutil.rmtree(salida)


def exportar(img, ruta_sin_ext):
    rutas = {}
    arr = np.asarray(img).astype(np.float32)
    fondo = np.concatenate([arr[:80, :60].reshape(-1, 3), arr[:80, -60:].reshape(-1, 3)]).mean(0)
    lienzo = np.ones((lado, lado, 3), np.float32) * fondo
    # Filas de la foto que caen dentro del cuadro.
    y0, y1 = max(0, arriba), min(H, arriba + lado)
    franja = arr[y0:y1].copy()
    funde = np.ones(W, np.float32)
    borde = 70
    funde[:borde] = np.linspace(0, 1, borde)
    funde[-borde:] = np.linspace(1, 0, borde)
    lienzo_franja = lienzo[y0 - arriba:y1 - arriba, izquierda:izquierda + W]
    lienzo[y0 - arriba:y1 - arriba, izquierda:izquierda + W] = franja * funde[None, :, None] + lienzo_franja * (1 - funde[None, :, None])
    cuadro = Image.fromarray(lienzo.clip(0, 255).astype(np.uint8))
    for perfil, (px, calidad) in PERFILES.items():
        archivo = f'{ruta_sin_ext}-{perfil}.webp'
        os.makedirs(os.path.dirname(archivo), exist_ok=True)
        cuadro.resize((px, px), Image.LANCZOS).save(archivo, 'WEBP', quality=calidad, method=6)
        rutas[perfil] = '/' + os.path.relpath(archivo, os.path.join(RAIZ, 'public')).replace(os.sep, '/')
    return rutas


perfecta = exportar(base, os.path.join(salida, 'perfecta'))
problemas, faltan = {}, []
for clave, slug in CLAVES.items():
    if not os.path.exists(os.path.join(carpeta, clave + '.png')):
        faltan.append(clave)
        continue
    m, d = similitud(puntos(clave), base_pts)
    img = alinear(Image.open(os.path.join(carpeta, clave + '.png')).convert('RGB'), m, d)
    problemas[slug] = exportar(img, os.path.join(salida, slug, 'problema'))
    residuo = np.abs((m @ puntos(clave).T).T + d - base_pts).mean()
    print(f'{clave}: escala {np.sqrt(abs(np.linalg.det(m))):.3f}, error medio de alineación {residuo:.1f}px')

ruta_manifiesto = os.path.join(RAIZ, 'src', 'data', 'personas-necesidades.json')
manifiesto = {
    'nota': 'La misma mujer dentro de la esfera: un problema por categoría y una sola foto con la piel perfecta '
            'como resultado. Alineadas entre sí con scripts/personas/preparar-estados.py. Una categoría sin '
            'problema conserva su arte original. Ver docs/personas-necesidades.md.',
    'perfecta': perfecta,
    'problemas': {slug: problemas.get(slug) for slug in CLAVES.values()},
}
with open(ruta_manifiesto, 'w') as f:
    json.dump(manifiesto, f, ensure_ascii=False, indent=2)
    f.write('\n')
print('manifiesto:', len(problemas), 'de 8 problemas, más la foto perfecta')
if faltan:
    print('faltan:', ', '.join(faltan))
