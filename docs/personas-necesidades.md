# La mujer de «Encuentra soluciones por problema»

La sección se queda fija y el scroll gira unos **anillos de cristal rosa claro** con cantos
redondeados alrededor de **la misma mujer, de frente y quieta**. El anillo ancho es esmerilado: al
ponerse de canto la tapa por completo. Los tres delgados son de cristal transparente y la enmarcan.

Por categoría se ve primero **el problema** y luego **la piel perfecta**. La foto solo cambia cuando
el anillo ancho la tapa. La sección entra ya con el título y el anillo cerrado, que se abre para
revelarla, así que no queda espacio vacío después de la portada. Todo es reversible.

## Assets

`~/Downloads/skinworld-personas/esfera/` (generadas en ChatGPT a partir de la mujer de la
referencia): `perfecta.png` (piel perfecta, cabello suelto con ondas; es el resultado de las 8
categorías) y un problema por categoría editado desde esa misma foto: `acne`, `dermatitis`,
`antiedad`, `manchas`, `cabello` (cabello muy descuidado, piel perfecta), `bebe` (piel sensible
e irritada), `solar` (quemadura y manchas por sol), `suplementos` (cansancio marcado).

## Cómo se preparan

```bash
swiftc -O scripts/personas/puntos.swift -o .next/puntos          # Vision de macOS, no instala nada
for f in carpeta/*.png; do .next/puntos "$f" "${f%.png}.json" "${f%.png}-mascara.png"; done
python3 scripts/personas/preparar-estados.py carpeta              # numpy + Pillow
```

`preparar-estados.py` alinea cada problema con la foto perfecta (error medio ≤ 1 px), recorta un
cuadro con los ojos a la misma altura (los lados se rellenan con el fondo) y exporta WebP
(1000 px computadora, 640 px celular) en `public/necesidades/estados/`, y escribe
`src/data/personas-necesidades.json`. Para cambiar un problema basta con reemplazar su foto y
volver a correrlo. Una categoría sin foto conserva su escultura.

## Código

- `necesidades-timeline.ts`: giro de los anillos y foto visible para cada punto del scroll (`estadoAnillos`).
- `necesidades-anillos.ts`: la escena WebGL con three.js: vidrio con transmisión real, entorno rosa
  propio, bandas redondeadas y la foto en un disco. Se renderiza solo cuando cambia el scroll.
- `necesidades-motor.ts`: GSAP ScrollTrigger. Carga three.js solo cuando la sección está cerca y,
  sin WebGL, muestra la foto sola. Solo decodifica la foto visible y sus vecinas.
- `necesidades-personas.ts`: manifiesto y precarga.
- `src/styles/necesidades.css`: posición del estudio, máscara redonda y retratos fijos (movimiento reducido).
- `tests/necesidades.test.mjs`: reversibilidad, orden de los estados, que la foto solo cambie con el
  anillo ancho tapándola, índice y existencia de cada foto (`node --test tests/`).

## Antes de publicar

Son fotos generadas con IA que muestran una mejora junto a productos: conviene un aviso breve
como «Imágenes ilustrativas generadas con IA».
