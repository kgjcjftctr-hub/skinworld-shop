# Personas de la sección «Encuentra soluciones por problema»

La sección ya tiene el sistema listo: cada categoría muestra a una persona que entra por la
izquierda, gira sobre su eje, mejora durante el giro, sigue girando y sale por la derecha. Todo lo
controla el scroll (avanza al bajar, retrocede al subir).

**Lo único que falta son los assets.** Mientras una categoría no tenga su secuencia, se sigue viendo
la escultura actual: nada se rompe ni aparece vacío.

Para revisar la coreografía sin assets: abrir el inicio con `?muestra=personas` en la URL. Se usa
una esfera de prueba con textura de piel (no es un asset final).

---

## Qué hay que entregar por categoría

Un **video de 4 a 6 segundos** (o una carpeta con sus cuadros en orden) de **una misma persona**:

| Requisito | Valor |
|---|---|
| Movimiento | Giro lento sobre su eje vertical, de **¾ izquierdo (≈ −60°)** a **¾ derecho (≈ +60°)**. Cámara fija, sin zoom. |
| Mejora | Ocurre **entre el 35 % y el 68 % del video** y termina **antes** de que acabe el giro. Después sigue girando ya mejorada. |
| Encuadre | Plano medio corto (cabeza y hombros), persona centrada, con aire arriba. Para Cabello y Uñas puede entrar una mano. |
| Formato | Vertical **3:4**, mínimo **1080 × 1440**. MP4 (H.264), MOV o WebM; o PNG/JPG numerados. |
| Fondo | **Liso** del color de la categoría (tabla abajo) o **transparente** (PNG con alfa). |
| Luz | Editorial suave, principal desde arriba a la izquierda, sin sombras duras. Igual en todo el video. |
| Identidad | La misma persona de principio a fin: rostro, peinado, ropa y fondo estables, sin parpadeos ni deformaciones. |

### Realismo (obligatorio)

- Condiciones **moderadas**: acné leve a moderado, dermatitis ligera, manchas naturales, líneas de
  expresión normales, cabello ligeramente opaco. Nada severo ni impactante.
- La mejora tampoco es mágica: se conservan **poros, textura, líneas de expresión, pequeñas
  imperfecciones y rasgos**. Nada de piel de plástico ni filtros de belleza.
- Nunca dos versiones de la misma persona en pantalla: es una sola persona transformándose.

---

## Las 8 personas

| Slug | Categoría | Persona y estado inicial | Estado final | Fondo |
|---|---|---|---|---|
| `acne` | Acné | Persona joven (18–24) con acné leve a moderado: algunos granitos, pequeñas imperfecciones, enrojecimiento localizado en mejillas y mentón. | Piel más uniforme y calmada; quedan poros y alguna marca muy leve. | `#f6e9eb` |
| `dermatitis` | Dermatitis | Otra persona, piel sensible: irritación leve, zonas ligeramente rojizas y algo de resequedad en mejillas. | Piel calmada e hidratada, tono parejo. | `#f3eae0` |
| `antiedad` | Antiedad | Persona adulta (45–55) con líneas de expresión naturales y textura ligeramente marcada. **No** envejecida en exceso. | Piel más hidratada, luminosa y uniforme. **Conserva las líneas**: no rejuvenece 20 años. | `#e8dce8` |
| `manchas` | Manchas | Otra persona con hiperpigmentación moderada: pequeñas manchas en pómulos y frente. | Tono más uniforme y luminoso; manchas muy atenuadas, no borradas. | `#f1e0d8` |
| `cabello-y-unas` | Cabello y Uñas | Otra persona con cabello ligeramente seco, opaco o frágil en puntas. Una mano con uñas cortas, naturales. | Cabello con brillo y aspecto sano; uñas cuidadas. | `#e3ccd3` |
| `piel-de-bebe` | Piel de Bebé | **Escena delicada, no médica**: madre o padre sosteniendo a su bebé, piel con algo de resequedad leve. | Sensación de piel hidratada, protegida y cuidada; luz más cálida. Sin «antes/después» exagerado. | `#faf2ed` |
| `proteccion-solar` | Protección Solar | Otra persona con piel normal, al aire libre en luz de día. **Sin quemaduras**. | La misma piel, con sensación de protección: luz solar cálida, piel luminosa e hidratada. | `#f4edde` |
| `suplementos` | Suplementos | Otra persona con apariencia normal, algo cansada. | Sensación de bienestar y luminosidad. **Sin promesas médicas visuales.** | `#e4d9e1` |

---

## Cómo generarlos con IA

1. **Imagen inicial** (estado del problema, persona en ¾ izquierdo) e **imagen final** (la misma
   persona mejorada, en ¾ derecho). Usar la imagen inicial como referencia para la final, para que
   sea la misma persona.
2. **Video** con una herramienta de video que acepte **primer y último cuadro**: se le dan las dos
   imágenes y el prompt de movimiento. Así la herramienta hace el giro y la mejora en una sola toma.
3. **Revisar**: misma identidad en todo el video, sin parpadeo, sin manos o rasgos deformados, la
   mejora termina antes del final.
4. **Entregar el video** a Claude Code, o correr:

   ```bash
   node --experimental-websocket scripts/preparar-persona.mjs acne ruta/al/video.mp4
   ```

   El script saca 48 cuadros para computadora y 32 para celular, los optimiza en WebP, los guarda en
   `public/necesidades/personas/<slug>/` y registra la persona en
   `src/data/personas-necesidades.json`. Desde ese momento la categoría ya muestra a la persona.

### Prompt base de movimiento (en inglés, funciona mejor en los generadores)

> Studio portrait video, 3:4 vertical, fixed camera. The same person slowly rotates on a turntable
> from a three-quarter left view to a three-quarter right view in one continuous move. Soft
> editorial key light from the upper left, plain seamless background in {color}. During the middle
> of the turn the skin gradually and subtly improves; the improvement is complete before the end of
> the rotation, then the person keeps turning. Photorealistic skin with visible pores and natural
> texture, no beauty filter, no plastic skin, no flicker, identity and clothing stay identical.

### Prompts de imagen por persona

- **Acné, inicio**: *Photorealistic head-and-shoulders portrait of a young adult, three-quarter
  left view, mild to moderate acne on cheeks and chin with localized redness, visible pores, natural
  skin texture, plain {#f6e9eb} background, soft editorial light, no makeup, neutral expression.*
  **Final**: *same person, three-quarter right view, calmer and more even skin, pores still
  visible, one or two faint marks remain, same light and background.*
- **Dermatitis**: *…sensitive skin with mild irritation and slightly reddish dry patches on the
  cheeks…* → *…calm, hydrated, even-toned skin…*
- **Antiedad**: *…adult in their late 40s, natural expression lines and slightly marked texture,
  not exaggerated…* → *…more hydrated, luminous, even skin, expression lines still present, same
  age…*
- **Manchas**: *…moderate hyperpigmentation, small sun spots on cheekbones and forehead…* → *…more
  even, luminous tone, spots softened but not erased…*
- **Cabello y Uñas**: *…slightly dry, dull hair with frizzy ends, one hand near the face with
  short natural nails…* → *…healthy shiny hair, cared-for nails…*
- **Piel de Bebé**: *…a parent gently holding a baby, tender premium editorial scene, baby skin
  slightly dry…* → *…same scene, soft warm light, baby skin looks hydrated and cared for…*
- **Protección Solar**: *…person outdoors in warm daylight, normal healthy skin, no sunburn…* →
  *…same person, luminous protected-looking skin, warm sunlight glow…*
- **Suplementos**: *…person with a normal, slightly tired appearance…* → *…same person radiating
  well-being and luminosity, no medical claims…*

---

## Detalles técnicos

- Código: `src/components/sections/necesidades-personas.ts` (carga y dibujo),
  `necesidades-timeline.ts` (coreografía), `necesidades-motor.ts` (scroll),
  `src/styles/necesidades.css` (capas).
- Carga: los cuadros bajan de lo general a lo fino (cada 8, 4, 2, 1) y solo para la categoría en
  pantalla y sus vecinas; las lejanas se liberan. Peso esperado: 1.5–2.5 MB por persona en
  computadora y 0.6–1 MB en celular.
- Modo `doble` (opcional): si se tienen dos secuencias alineadas cuadro por cuadro (antes y
  después), se pasan con `--despues` y el sistema las funde entre el 35 % y el 68 % del giro.
- Movimiento reducido: se muestra un solo cuadro fijo, ya mejorado.

## Antes de publicar con personas

Las imágenes generadas con IA que muestran una mejora de la piel junto a productos pueden leerse
como una promesa de resultado. Conviene revisar el texto legal y considerar un aviso breve del tipo
«Imágenes ilustrativas generadas con IA».
