import * as THREE from 'three';

/**
 * Giroscopio de cristal en WebGL: la foto de la mujer en el centro (quieta) y
 * anillos de vidrio rosa esmerilado que giran a su alrededor. El vidrio usa
 * transmisión real (refracta y desenfoca lo que hay detrás), superficie pulida
 * con reflejos e iridiscencia. El anillo principal, al ponerse de canto frente
 * al rostro, la tapa por completo: ese es el momento en que cambia la foto.
 *
 * Se renderiza solo cuando cambia el scroll o llega una foto (no hay bucle).
 */

const PROFUNDIDAD = 4.4;
const CENTRO_ROSTRO = 0.06; // altura del rostro en la foto (unidades de escena; la foto mide 2×2)

function vidrio(color: string, aspereza: number) {
  return new THREE.MeshPhysicalMaterial({
    color,
    transmission: 1,
    roughness: aspereza,
    thickness: 0.45,
    ior: 1.5,
    attenuationColor: new THREE.Color('#f6c3d7'),
    attenuationDistance: 1.6,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    iridescence: 0.8,
    iridescenceIOR: 1.35,
    specularIntensity: 1,
    envMapIntensity: 1.25,
    side: THREE.FrontSide,
  });
}

/**
 * Banda de cristal con grosor y cantos redondeados: un rectángulo de esquinas
 * redondas (alto × grosor) que se gira alrededor del eje del anillo.
 */
function bandaRedondeada(radio: number, alto: number, grosor: number, segmentos: number) {
  const r = Math.min(grosor / 2, alto / 2) * 0.98;
  const puntos: THREE.Vector2[] = [];
  const esquina = (cx: number, cy: number, desde: number) => {
    for (let k = 0; k <= 8; k++) {
      const a = desde + (k / 8) * (Math.PI / 2);
      puntos.push(new THREE.Vector2(cx + r * Math.cos(a), cy + r * Math.sin(a)));
    }
  };
  const dentro = radio - grosor / 2, fuera = radio + grosor / 2, h = alto / 2;
  // Recorrido cerrado: abajo-fuera → arriba-fuera → arriba-dentro → abajo-dentro.
  esquina(fuera - r, -h + r, -Math.PI / 2);
  esquina(fuera - r, h - r, 0);
  esquina(dentro + r, h - r, Math.PI / 2);
  esquina(dentro + r, -h + r, Math.PI);
  puntos.push(puntos[0].clone());
  const g = new THREE.LatheGeometry(puntos, segmentos);
  g.computeVertexNormals();
  return g;
}

export class Anillos {
  private renderer: THREE.WebGLRenderer;
  private escena = new THREE.Scene();
  private camara = new THREE.PerspectiveCamera(31, 1, 0.1, 20);
  private foto: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private principal: THREE.Object3D;
  private cruzado: THREE.Object3D;
  private oblicuo: THREE.Object3D;
  private interior: THREE.Object3D;
  private texturas = new Map<string, THREE.Texture>();
  private actual = '';

  constructor(readonly canvas: HTMLCanvasElement, movil: boolean) {
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !movil, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, movil ? 1.5 : 1.75));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.transmissionResolutionScale = movil ? 0.5 : 0.75;

    // Entorno de estudio rosa con paneles de luz blanca: los reflejos del
    // vidrio son blancos y rosados, nunca grises.
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const estudio = new THREE.Scene();
    const cuarto = new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), new THREE.ShaderMaterial({
      side: THREE.BackSide,
      vertexShader: 'varying vec3 p; void main() { p = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'varying vec3 p; void main() { float h = normalize(p).y * 0.5 + 0.5; gl_FragColor = vec4(mix(vec3(0.86, 0.55, 0.66), vec3(1.0, 0.93, 0.96), h), 1.0); }',
    }));
    estudio.add(cuarto);
    const panel = (x: number, y: number, z: number, w: number, h: number, k: number) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(k, k, k), side: THREE.DoubleSide }));
      m.position.set(x, y, z);
      m.lookAt(0, 0, 0);
      estudio.add(m);
    };
    panel(-4, 5, 5, 5, 2.5, 4);
    panel(5, 1, 4, 2, 5, 2.5);
    panel(0, -5, 3, 6, 1.5, 1.6);
    this.escena.environment = pmrem.fromScene(estudio, 0.02).texture;
    pmrem.dispose();
    estudio.traverse(o => { (o as THREE.Mesh).geometry?.dispose(); ((o as THREE.Mesh).material as THREE.Material | undefined)?.dispose(); });
    const luz = new THREE.DirectionalLight('#fff4f8', 2.2);
    luz.position.set(-2.5, 3, 4);
    this.escena.add(luz, new THREE.AmbientLight('#ffe6ef', 0.6));

    this.camara.position.set(0, 0, PROFUNDIDAD);
    this.camara.lookAt(0, 0, 0);

    // La mujer: un plano opaco (la transmisión del vidrio solo ve lo opaco).
    this.foto = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
      uniforms: { mapa: { value: null }, fondo: { value: new THREE.Color('#f6e9eb') }, hay: { value: 0 } },
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform sampler2D mapa; uniform vec3 fondo; uniform float hay; varying vec2 vUv;
        void main() {
          vec3 foto = hay > 0.5 ? texture2D(mapa, vUv).rgb : fondo;
          // Disco: fuera del círculo no se pinta nada (se ve la sección);
          // dentro, la foto se funde con el fondo hacia el borde.
          float d = distance(vUv, vec2(0.5));
          if (d > 0.5) discard;
          float borde = smoothstep(0.5, 0.38, d);
          gl_FragColor = vec4(mix(fondo, foto, borde), 1.0);
          #include <colorspace_fragment>
        }`,
      toneMapped: false,
    }));
    this.escena.add(this.foto);

    const segmentos = movil ? 96 : 160;
    const banda = (radio: number, alto: number, color: string, aspereza: number) => {
      const grosor = Math.min(0.16, alto * 0.55);
      const m = new THREE.Mesh(bandaRedondeada(radio, alto, grosor, segmentos), vidrio(color, aspereza));
      const grupo = new THREE.Group();
      grupo.add(m);
      grupo.position.y = CENTRO_ROSTRO;
      this.escena.add(grupo);
      return grupo;
    };
    // El principal es ancho: de canto tapa todo el rostro.
    this.principal = banda(1.08, 1.06, '#ffe4ee', 0.58);
    // Los demás son cristal claro: refractan al cruzarla, pero no la ocultan.
    this.cruzado = banda(1.0, 0.26, '#ffe2ed', 0.08);
    this.oblicuo = banda(1.1, 0.2, '#ffe8f1', 0.06);
    this.interior = banda(0.9, 0.14, '#ffeef5', 0.05);
  }

  /** Color de fondo de la categoría, para fundir los bordes de la foto. */
  fondo(color: string) {
    this.foto.material.uniforms.fondo.value.set(color).convertSRGBToLinear();
  }

  medir(lado: number) {
    this.renderer.setSize(lado, lado, false);
    this.camara.aspect = 1;
    this.camara.updateProjectionMatrix();
  }

  /** Usa una foto ya decodificada; devuelve false si todavía no hay una. */
  ponerFoto(url: string, img: HTMLImageElement | null) {
    if (url === this.actual) return true;
    let tex = this.texturas.get(url);
    if (!tex && img) {
      tex = new THREE.Texture(img);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      tex.needsUpdate = true;
      this.texturas.set(url, tex);
    }
    if (!tex) return false;
    this.foto.material.uniforms.mapa.value = tex;
    this.foto.material.uniforms.hay.value = 1;
    this.actual = url;
    return true;
  }

  /** Suelta texturas que ya no están cerca. */
  conservar(urls: (string | null)[]) {
    const quedan = new Set(urls.filter(Boolean));
    for (const [url, tex] of this.texturas) {
      if (!quedan.has(url) && url !== this.actual) { tex.dispose(); this.texturas.delete(url); }
    }
  }

  /**
   * `giro` en grados del anillo principal: múltiplos de 180 = de canto frente al
   * rostro (la tapa), 90 + 180k = de frente (la enmarca y se ve nítida).
   */
  pintar(giro: number) {
    const r = THREE.MathUtils.degToRad(giro);
    // Principal: de canto (tapa el rostro) en múltiplos de 180°, de frente en 90°.
    this.principal.rotation.set(r, 0, 0);
    // Los delgados enmarcan el rostro (casi de frente, inclinados) mientras ella
    // se ve, giran en el plano y se ladean más cuando el principal se cierra.
    const cerrado = Math.abs(Math.cos(r));
    const marco = (anillo: THREE.Object3D, fase: number, inclinacion: number, vueltas: number) => {
      anillo.rotation.order = 'ZXY';
      anillo.rotation.set(Math.PI / 2 + (inclinacion + 0.5 * cerrado) * Math.sin(r * 0.5 + fase), 0, r * vueltas + fase);
    };
    marco(this.cruzado, 0.4, 0.55, 0.45);
    marco(this.oblicuo, 2.2, 0.62, -0.3);
    marco(this.interior, 4.1, 0.45, 0.7);
    this.renderer.render(this.escena, this.camara);
  }

  destruir() {
    this.texturas.forEach(t => t.dispose());
    this.escena.traverse(o => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      const mat = m.material as THREE.Material | undefined;
      mat?.dispose();
    });
    this.escena.environment?.dispose();
    this.renderer.dispose();
  }
}

export function hayWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}
