# Personas de la sección «Encuentra soluciones por problema»

La sección ya tiene el sistema listo. La página se queda fija (en computadora, tableta y celular) y
lo único que se mueve es la persona: entra por la izquierda, gira sobre su eje, mejora durante el
giro, sigue girando y sale por la derecha; cuando ya salió, entra la de la siguiente categoría.
Nunca hay dos personas ni dos versiones de la misma persona en pantalla. Todo lo controla el scroll
(avanza al bajar, retrocede al subir).

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
| Encuadre | Plano medio corto (cabeza y hombros), persona centrada, con aire arriba. Para Cabello y Uñas, hasta media espalda para que se vea el largo del cabello. |
| Formato | Vertical **3:4**, mínimo **1080 × 1440**. MP4 (H.264), MOV o WebM; o PNG/JPG numerados. |
| Fondo | **Liso** del color de la categoría (tabla abajo) o **transparente** (PNG con alfa). |
| Luz | Editorial suave, principal desde arriba a la izquierda, sin sombras duras. Igual en todo el video. |
| Identidad | La misma persona de principio a fin: rostro, peinado, ropa y fondo estables, sin parpadeos ni deformaciones. |

### Realismo (obligatorio)

- Condiciones **moderadas**: acné leve a moderado, dermatitis ligera, manchas naturales, líneas de
  expresión normales, cabello ligeramente opaco. Nada severo ni impactante.
- La mejora tampoco es mágica: se conservan **poros, textura, líneas de expresión, pequeñas
  imperfecciones y rasgos**. Nada de piel de plástico ni filtros de belleza.
- Una sola cabeza: nunca dos versiones de la misma persona lado a lado. Es una sola persona que gira
  y cambia durante el giro.

---

## Las 8 personas

Ocho personas distintas (edad, sexo y tono de piel variados, pensadas para clientes en México). Cada
problema se muestra como se ve en la realidad y **solo donde corresponde**: granos únicamente en
Acné. La descripción sale de fuentes dermatológicas (al final) y de lo que vende cada categoría.

| Slug | Persona | Cómo se ve el problema (inicio del giro) | Cómo se ve al final | Fondo |
|---|---|---|---|---|
| `acne` | Mujer de 19–23 años, piel morena clara. | Acné leve a moderado: unas cuantas pápulas rojas y 2–3 pústulas pequeñas en mejillas, mentón y línea de la mandíbula; puntos negros en nariz y frente; algunas marcas cafés de granos anteriores (en piel morena las marcas quedan cafés, no rojas). | Casi sin lesiones inflamadas y con menos enrojecimiento. Se ven los poros y quedan marcas cafés tenues: las marcas tardan más que los granos en irse. | `#f6e9eb` |
| `dermatitis` | Hombre de 30–38 años, piel morena media. | Dermatitis atópica en la cara: parches secos y ásperos con descamación fina en mejillas, párpados y alrededor de la boca. En piel morena se ven más oscuros, grisáceos o violáceos que rojos. Labios resecos. **Sin granos.** | Piel hidratada, sin descamación, textura lisa y tono más parejo; puede quedar un leve oscurecimiento donde estaban los parches. | `#f3eae0` |
| `antiedad` | Mujer de 50–55 años, piel clara a media. | Fotoenvejecimiento normal para su edad: patas de gallo, líneas en la frente, surcos junto a la nariz, textura áspera, piel opaca y ojeras leves. **Sin granos ni manchas exageradas.** | Más hidratada y luminosa, textura más lisa y líneas finas suavizadas. Los surcos y las arrugas marcadas siguen ahí: **no rejuvenece**, sigue teniendo su edad. | `#e8dce8` |
| `manchas` | Mujer de 35–45 años, piel morena (fototipo IV). | Melasma («paño»): manchas café claro a oscuro, **simétricas** y de borde irregular en pómulos, frente, dorso de la nariz y labio superior. **Sin granos.** | Manchas más claras y difusas, tono más uniforme y luminoso. **No desaparecen por completo.** | `#f1e0d8` |
| `cabello-y-unas` | Mujer de 40–48 años con cabello largo, suelto, a media espalda. Suéter oscuro. | Cabello opaco, seco y con frizz, puntas abiertas y algo de quiebre; caspa visible: copos blancos finos en la raya y sobre los hombros del suéter oscuro. **La piel de la cara no cambia.** | Cabello con brillo, puntas definidas y más cuerpo; cuero cabelludo y hombros limpios. | `#e3ccd3` |
| `piel-de-bebe` | Bebé de 6–9 meses con mameluco, en brazos de su mamá o papá; del adulto solo se ven brazos y hombro. Lo que gira es el adulto, despacio, con el bebé de frente. | Resequedad o eccema infantil leve: mejillas con parches secos, ásperos y un poco rojizos; algo de resequedad alrededor de la boca. Nada de llagas, heridas ni bebé llorando. | Mejillas suaves, hidratadas y con su color natural. Escena tierna, luz cálida. | `#faf2ed` |
| `proteccion-solar` | Hombre de 25–32 años, al aire libre con luz de sol directa (fondo de cielo claro o pared cálida desenfocada). | No es una enfermedad: es **protección**. Al empezar el giro tiene rayas blancas de protector solar recién puesto en pómulos, nariz y frente, y la piel con un poco de brillo por el calor. | El protector ya está extendido y absorbido: piel pareja, cómoda y luminosa bajo el sol, sin capa blanca. **No se muestra que el protector «cure» una quemadura.** | `#f4edde` |
| `suplementos` | Mujer u hombre de 28–38 años con ropa deportiva (la categoría vende proteína, BCAA y colágeno). | Cansancio, como se ve tras dormir poco: ojeras, párpados algo caídos, piel opaca y pálida, labios resecos, mirada cansada. **Sin granos.** | Descansada: piel con color y luminosidad, ojeras más suaves, mirada despierta. **Sin músculos nuevos ni cambios corporales**: nada que parezca promesa médica. | `#e4d9e1` |

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

Base común (va antes de cada prompt): *Photorealistic editorial portrait, head and shoulders,
vertical 3:4, plain seamless background in {color}, soft key light from the upper left, natural
skin texture with visible pores, no makeup unless stated, no beauty filter, neutral calm expression.*

Imagen inicial en **¾ izquierdo**; imagen final de **la misma persona** en **¾ derecho** (usar la
inicial como referencia).

- **Acné** — inicio: *Mexican woman, 21, light-brown skin, mild to moderate acne: a few red papules
  and two or three small pustules on the cheeks, chin and jawline, blackheads on the nose and
  forehead, a few brown post-acne marks.* Final: *same woman, almost no inflamed spots, less
  redness, pores still visible, faint brown marks remain.*
- **Dermatitis** — inicio: *Mexican man, 34, medium-brown skin, facial atopic dermatitis: dry,
  rough, finely scaling patches on the cheeks, eyelids and around the mouth that look darker and
  slightly greyish-violet rather than red, dry lips, no acne.* Final: *same man, hydrated smooth
  skin, no scaling, more even tone, slight residual darkening where the patches were.*
- **Antiedad** — inicio: *woman, 53, light-medium skin, natural photoaging: crow's feet, forehead
  lines, nasolabial folds, rough dull texture, mild under-eye shadows, no acne.* Final: *same woman,
  same age, more hydrated and luminous skin, smoother texture, fine lines softened, deep folds still
  present.*
- **Manchas** — inicio: *Mexican woman, 40, brown skin (Fitzpatrick IV), melasma: symmetrical
  light-to-dark brown patches with irregular borders on both cheekbones, forehead, bridge of the
  nose and upper lip, no acne.* Final: *same woman, patches lighter and more diffuse, more even and
  luminous tone, not completely erased.*
- **Cabello y Uñas** — inicio: *woman, 45, long loose hair to mid-back, dull dry frizzy hair with
  split ends, fine white dandruff flakes along the parting and on the shoulders of a dark sweater,
  skin normal.* Final: *same woman, glossy healthy hair with defined ends and more body, clean
  scalp and shoulders, skin unchanged.*
- **Piel de Bebé** — inicio: *a 7-month-old baby in a soft onesie held in a parent's arms (only
  the adult's arms and shoulder visible), baby facing camera, mild infant dryness: rough, slightly
  reddish dry patches on both cheeks, calm baby, tender warm scene.* Final: *same baby and parent,
  soft hydrated cheeks with natural color, warm light.*
- **Protección Solar** — inicio: *Mexican man, 28, outdoors in direct sunlight, warm blurred
  background, freshly applied white streaks of sunscreen on the cheekbones, nose and forehead,
  slight shine from the heat.* Final: *same man, sunscreen fully blended and invisible, even,
  comfortable, luminous skin in the sun.*
- **Suplementos** — inicio: *woman, 32, athletic wear, tired look from poor sleep: dark under-eye
  circles, slightly heavy eyelids, dull pale skin, dry lips.* Final: *same woman, rested look,
  healthy color and glow, softer under-eye circles, alert eyes, same body.*

### Fuentes de la investigación

- Acné: [StatPearls – Acne Vulgaris](https://www.ncbi.nlm.nih.gov/sites/books/NBK459173/),
  [acné en mujeres adultas (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC5986265/).
- Dermatitis: [Cleveland Clinic – eccema en piel morena](https://health.clevelandclinic.org/eczema-in-skin-of-color),
  [Healthline – dermatitis atópica en la cara](https://www.healthline.com/health/atopic-dermatitis-face).
- Antiedad: [tretinoína en fotoenvejecimiento (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC12615114/),
  [Cleveland Clinic – retinol](https://my.clevelandclinic.org/health/treatments/23293-retinol).
- Manchas: [Cleveland Clinic – melasma](https://my.clevelandclinic.org/health/diseases/21454-melasma),
  [MedlinePlus – melasma](https://medlineplus.gov/ency/article/000836.htm).
- Cabello y Uñas: [uñas frágiles (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC6994568/).
- Piel de Bebé: [Cleveland Clinic – eccema del bebé](https://my.clevelandclinic.org/health/diseases/23408-baby-eczema).
- Protección Solar: [Cleveland Clinic – daño solar](https://my.clevelandclinic.org/health/diseases/5240-sun-damage-protecting-yourself),
  [DermNet – manchas solares](https://dermnetnz.org/topics/brown-spots-and-freckles).
- Suplementos: [AASM – la cara de la falta de sueño](https://aasm.org/study-reveals-the-face-of-sleep-deprivation/),
  [estudio de restricción de sueño en 24 mujeres](https://www.sciencedirect.com/science/article/pii/S1389945721005761).

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
- Pantallas muy bajas (menos de 560 px de alto en celular o 620 px en computadora): las categorías
  quedan como bloques normales y la persona cruza mientras el bloque pasa por la pantalla.

## Antes de publicar con personas

Las imágenes generadas con IA que muestran una mejora de la piel junto a productos pueden leerse
como una promesa de resultado. Conviene revisar el texto legal y considerar un aviso breve del tipo
«Imágenes ilustrativas generadas con IA».
