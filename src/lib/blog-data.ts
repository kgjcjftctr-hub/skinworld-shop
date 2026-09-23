export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  category: string;
  date: string;
  author: string;
  image: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'abcde-de-los-lunares',
    title: 'El ABCDE de los lunares',
    excerpt:
      'Asimetría, bordes, color, diámetro y evolución: cómo reconocer cuándo un lunar debe ser revisado por un dermatólogo.',
    category: 'Dermatología',
    date: '2020-09-02',
    author: 'Dra. Karina Alfaro López',
    image: '/images/blog/abcde-lunares.jpg',
    content: [
      'Los lunares o nevos melanocíticos son neoformaciones (formaciones nuevas) que van apareciendo a lo largo de nuestra vida, casi siempre por exposición solar. Aunque existe una predisposición genética que determina cuántos lunares nos saldrán durante toda la vida, se requiere de luz solar para que se hagan evidentes.',
      'De entrada, piensa que los lunares son buenos. Solo tienen riesgo de malignizarse (convertirse en cáncer) aquellos que están sometidos a traumatismo continuo —por ejemplo, los que se encuentran en zonas de roce como axilas, ingles, plantas de los pies, manos y genitales— y los que están expuestos a radiación solar por periodos prolongados. También tienen mayor riesgo las personas con antecedentes familiares de melanoma maligno o de algún otro tipo de cáncer de piel.',
      'Como todos tenemos lunares en el cuerpo, y en algunas personas son muchos, es difícil llevar el control de las características de cada uno. Sin embargo, cuando un lunar empieza a dar síntomas —comezón, crecimiento brusco, cambio de coloración, sangrado o alguna molestia— es cuando debemos saber cómo "calificarlo". Para que no se nos olvide, lo identificamos como el A B C D E de los lunares.',
      'A. Asimetría. Traza dos líneas rectas que se crucen por la mitad del lunar formando una cruz. Si las contrapartes son parecidas, podemos decir que es simétrico, que es lo más deseable.',
      'B. Bordes. Todos los bordes deben estar bien delimitados, es decir, debemos poder identificar dónde termina el lunar y dónde empieza la piel sana. En algunas ocasiones se puede ver como "chorreado" el pigmento: esto no debe ocurrir. En otras se observa que el tono alrededor es más claro que la piel normal, lo cual también es motivo de consulta con tu dermatólogo.',
      'C. Color. Entre menos colores tenga un lunar, menor riesgo de malignizarse hay. Los colores pueden ir en todas las escalas de café, y también pueden ser rojos o azules. Lo que no debes ver en un lunar es color negro o café muy oscuro. Entre más uniforme sea el color, mejor.',
      'D. Diámetro. Los lunares mayores de 1 cm también son motivo de consulta, aun cuando no cumplan con el resto de los criterios.',
      'E. Evolución. Un lunar normalmente no debe dar síntomas. En cuanto empieces a sentir comezón, a notar crecimiento rápido o sangrado, o si está en alguna parte del cuerpo que roce mucho —párpados, cuello, axilas, ingles, detrás de las rodillas—, también debe ser vigilado.',
      'Actualmente la mayoría de los dermatólogos contamos con una herramienta muy útil, el dermatoscopio, para identificar los lunares y decidir si deben extirparse o no.',
      'La Academia Americana de Dermatología recomienda una revisión dermatológica cada dos años en personas de 40 años o menos, mientras que en personas de mayor edad la revisión debe ser anual.',
      'Recuerda que hay muchos tipos de neoformaciones en la piel: esta escala de medición aplica solamente para nevos melanocíticos.',
    ],
  },
  {
    slug: 'las-8-cosas-que-debes-saber-de-fotoproteccion',
    title: 'Las 8 cosas que debes saber de fotoprotección',
    excerpt:
      'Cómo actúa el sol sobre tu organismo y la guía práctica para elegir, aplicar y reaplicar correctamente tu protector solar.',
    category: 'Protección',
    date: '2020-08-04',
    author: 'Dra. Karina Alfaro López',
    image: '/images/blog/fotoproteccion.jpg',
    content: [
      'Antes de hablar de fotoprotección es importante conocer los efectos del sol en nuestro organismo. Los rayos solares regulan la secreción de algunos neurotransmisores, como la serotonina, que nos ayuda a sentirnos felices; también intervienen en la producción hormonal y en el ciclo sueño-vigilia. Se ha observado que en las épocas del año más frías, cuando no hay actividades al aire libre, aumentan los casos de depresión, siendo más común en mujeres. Entre los síntomas destacan el aumento de apetito y de sueño, menor energía, menor capacidad de concentración, pérdida de interés en el trabajo, irritabilidad y aislamiento social. Estos síntomas son más frecuentes en países ubicados en latitudes más altas, es decir, más alejados del ecuador.',
      'Otro efecto muy importante que se logra exclusivamente con la exposición solar es la producción de vitamina D. La vitamina D ayuda al cuerpo a absorber el calcio y depositarlo en los huesos, de manera que logramos huesos fuertes y sanos. Además, es fundamental para el buen funcionamiento de los músculos y de suma importancia para el sistema inmunológico.',
      'Por otro lado, el sol es el principal causante de la formación de radicales libres, es decir, de la oxidación de todas nuestras células. Esto provoca envejecimiento prematuro, manchas y, peor aún, cáncer de piel; también contribuye a la muerte celular, especialmente de las células de defensa de la piel. Con esto entendemos la necesidad de protegernos.',
      '1. El daño solar se adquiere en los primeros años de vida, de ahí la importancia de cuidar a los más pequeños de la familia, y más si hay antecedentes familiares de cáncer de piel. Las recomendaciones de la Academia Americana de Dermatología son: los recién nacidos y hasta los tres meses de edad no deben exponerse directamente a los rayos del sol; los bebés de 6 a 12 meses deben utilizar pantallas solares —no filtros químicos—, de preferencia de origen mineral; y a partir del año de vida la aplicación de protector solar debe ser diaria, con productos específicamente diseñados para niños.',
      '2. El FPS significa Factor de Protección Solar y nos ayuda a medir la potencia del bloqueador o filtro que estamos utilizando. Cada organismo responde de manera diferente ante la exposición solar, por eso es importante escoger adecuadamente el FPS. Este multiplica el tiempo que tarda una persona en ponerse roja tras la exposición: si alguien de piel clara tarda 5 minutos en enrojecerse, al utilizar un protector con FPS 30 el efecto es el resultado de multiplicar 5 × 30, lo que da 150 minutos de protección. Por ello debemos reaplicar el producto cada 2 a 4 horas.',
      '3. El efecto de cualquier protector solar no es inmediato, por tal motivo debemos aplicarlo al menos 20 minutos antes de la exposición al sol, principalmente en los niños, ya que ellos están más en contacto con agua y sudor, que pueden diluir el producto.',
      '4. En los adultos, y principalmente en mujeres, lo más recomendable es utilizarlo al principio de todas las cremas matutinas. Independientemente de la presentación —gel, fluido, crema o loción—, lo primero que debe tocar nuestra piel es el protector solar; de otra manera se diluye fácilmente con las cremas que aplicamos encima, ya que estas impiden o alteran el nivel de FPS. Actualmente existen protectores solares que también contienen ácido hialurónico u otros humectantes que pueden completar el cuidado de la piel, así es más fácil y práctico utilizar un solo producto por las mañanas.',
      '5. Los rayos solares que manchan, arrugan y producen cáncer de piel atraviesan las nubes y las ventanas. Es decir, los días nublados también se debe aplicar protección solar, así como los días en que no salimos de casa; en esos casos, al menos usarlo en la mañana al despertar.',
      '6. Hay distintas presentaciones de protectores solares, para todos los gustos y necesidades. Una guía práctica para elegir el que más se adecúe a ti: para bebés, pantallas minerales en crema; para escolares, cremas, lociones o spray, aunque este último también se recomienda para zonas pilosas o extensas del cuerpo; para adolescentes, lociones, spray o fluidos; para adultos jóvenes, pastas o polvos compactos, cremas oil free, fluidos o lociones; y para adultos mayores, cremas.',
      '7. Es muy común que al aplicar el protector solar ardan los ojos. Lo que puede disminuir un poco este efecto es aplicar poca cantidad cerca de esa área y esperar al menos 20 minutos antes de exponerse al sol o de realizar alguna actividad física que genere sudor.',
      '8. También se pueden utilizar accesorios que nos protejan del sol. Puedes encontrar camisetas, trajes de baño, lentes, sombreros y gorros, todos con FPS.',
      'Para resumir: aplica protector solar diariamente, salgas o no de casa; que el protector solar sea lo primero que toque tu piel; si vas a estar mucho tiempo al aire libre, reaplícalo al menos cada 4 horas; y recuerda que hay muchos tipos de protector solar, seguramente encontrarás uno que te fascine.',
    ],
  },
  {
    slug: 'el-poder-natural-del-colageno',
    title: 'El poder natural del colágeno',
    excerpt:
      'Qué son los péptidos bioactivos de colágeno y qué observaron los estudios clínicos sobre firmeza, elasticidad y arrugas.',
    category: 'Suplementos',
    date: '2020-09-02',
    author: 'Dra. Karina Alfaro López',
    image: '/images/blog/colageno.jpg',
    content: [
      'El colágeno es el principal componente estructural de la piel: representa alrededor del 80% de su masa seca. Con el paso de los años, la matriz de colágeno se va perdiendo, y a ello se suman factores externos como la radiación ultravioleta, los cambios hormonales y la nutrición. El resultado visible es la pérdida de firmeza y elasticidad, y la aparición de arrugas.',
      'Los suplementos de colágeno de uso cosmético no contienen colágeno completo, sino péptidos bioactivos: fragmentos pequeños obtenidos del colágeno que, tomados por vía oral, llegan al torrente sanguíneo y actúan sobre el metabolismo del colágeno de la piel desde el interior.',
      'Uno de los ingredientes más estudiados en esta categoría es VERISOL, un péptido de colágeno bioactivo optimizado para aplicaciones de belleza. Según los estudios publicados por su fabricante, en un ensayo con 69 mujeres de 35 a 55 años se observó un aumento significativo de la elasticidad de la piel —de hasta 15% frente al placebo— tras cuatro semanas de toma diaria, con el efecto sostenido a las ocho semanas. Un segundo estudio, en mujeres de alrededor de 55 años, reportó una reducción significativa de las arrugas tras cuatro semanas con una dosis de 2.5 g al día, además de una mayor concentración de procolágeno en la piel.',
      'Estos péptidos se obtienen de distintas fuentes —porcina, bovina o marina—, lo que da lugar a calidades y perfiles distintos. Es un dato relevante si sigues alguna restricción alimentaria o religiosa, así que conviene revisar el origen en la etiqueta antes de elegir un producto.',
      'El colágeno oral no sustituye a la fotoprotección ni al cuidado tópico: es un complemento. Los resultados descritos en los estudios corresponden a tomas diarias y sostenidas durante varias semanas, no a un uso ocasional. Como con cualquier suplemento, lo ideal es comentarlo con tu médico antes de iniciarlo, sobre todo si estás embarazada, en lactancia o bajo algún tratamiento.',
      'Fuente de los datos clínicos citados: GELITA (gelita.com), fabricante de VERISOL.',
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
