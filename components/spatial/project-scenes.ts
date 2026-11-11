import * as T from "three";

type Point = [number, number, number];
type Part = { shape: "box" | "orb" | "ring"; at: Point; size: Point; rotation?: Point; glass?: boolean };
type Scene = { parts: Part[]; paths: Point[][] };
const box = (at: Point, size: Point, rotation?: Point, glass = false): Part => ({ shape: "box", at, size, rotation, glass });
const orb = (at: Point, radius: number): Part => ({ shape: "orb", at, size: [radius, radius, radius], glass: true });
const hoop = (at: Point, radius: number, rotation: Point = [0, 0, 0]): Part => ({ shape: "ring", at, size: [radius, radius, radius], rotation, glass: true });

/** Shared miniature geometry keeps the GPU and CSS 3D experiences consistent. */
export const projectScenes: Scene[] = [
  {
    parts: [box([0, 0, .12], [.48, .48, .48], [.3, .5, .2]), hoop([0, 0, 0], .64, [.9, .25, 0]),
      ...[-1, 0, 1].map(x => orb([x * .65, -.8, .05], .085)),
      ...[-1, 0, 1].map(x => box([x * .57, .79, .05], [.31, .36, .1], [0, x * .2, 0], true))],
    paths: [-1, 0, 1].map(x => [[x * .65, -.8, .05], [x * .25, -.3, .1], [0, 0, .2], [x * .57, .79, .05]]),
  },
  {
    parts: [box([-.52, .12, 0], [.13, 1.3, .3]), box([.52, .12, 0], [.13, 1.3, .3]), box([0, .77, 0], [1.18, .13, .3]),
      ...[-1, 0, 1].map(x => box([x * .42, -.67, .2], [.28, .42, .08], [0, x * .22, -.08], true)),
      hoop([0, .14, .1], .34), orb([0, .96, .12], .08)],
    paths: [-1, 0, 1].map(x => [[x * .42, -.67, .28], [0, -.18, .3], [0, .35, .3], [0, .96, .12]]),
  },
  {
    parts: [box([0, -.84, -.02], [1.62, .12, .72]),
      ...[.42, .65, .92, 1.19, .85].map((height, x) => box([(x - 2) * .3, -.76 + height / 2, .04], [.18, height, .24], undefined, x % 2 === 0)),
      hoop([0, .25, -.2], .73, [.15, 0, .2])],
    paths: [[[-.66, .72, .25], [-.32, .52, .25], [0, .7, .25], [.34, .19, .25], [.7, -.05, .25]]],
  },
  {
    parts: [box([-.44, -.45, 0], [.26, .98, .42], [0, 0, .12]), box([-.08, -.42, -.06], [.27, 1.12, .45]), box([.31, -.48, 0], [.28, .94, .42], [0, 0, -.12]),
      box([-.3, .55, .22], [.62, .64, .07], [-.18, -.38, -.12]), box([.3, .55, .22], [.62, .64, .07], [-.18, .38, .12]),
      hoop([0, -.1, -.2], .8, [1.15, .1, 0]), orb([0, .99, .18], .07)],
    paths: [[[-.7, -.7, .3], [-.3, -.2, .3], [0, .15, .38], [0, .99, .18]], [[.7, -.7, .3], [.3, -.2, .3], [0, .15, .38], [0, .99, .18]]],
  },
];

function pathPosition(path: Point[], progress: number, target: T.Vector3) {
  const t = progress * (path.length - 1), index = Math.min(path.length - 2, Math.floor(t)), local = t - index;
  const a = path[index], b = path[index + 1];
  return target.set(a[0] + (b[0] - a[0]) * local, a[1] + (b[1] - a[1]) * local, a[2] + (b[2] - a[2]) * local);
}

export function createGpuProject(index: number, metal: T.Material, color: number) {
  const scene = projectScenes[index], group = new T.Group();
  const accent = new T.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: .55, metalness: .7, roughness: .22 });
  const lineMaterial = new T.LineBasicMaterial({ color, transparent: true, opacity: .55 });
  scene.parts.forEach(part => {
    const geometry = part.shape === "box" ? new T.BoxGeometry(...part.size) : part.shape === "ring" ? new T.TorusGeometry(part.size[0], .014, 5, 48) : new T.SphereGeometry(part.size[0], 10, 8);
    const mesh = new T.Mesh(geometry, part.glass ? accent : metal);
    mesh.position.set(...part.at); if (part.rotation) mesh.rotation.set(...part.rotation); group.add(mesh);
  });
  const sparks = scene.paths.map(path => {
    group.add(new T.Line(new T.BufferGeometry().setFromPoints(path.map(p => new T.Vector3(...p))), lineMaterial));
    const spark = new T.Mesh(new T.SphereGeometry(.045, 8, 6), new T.MeshBasicMaterial({ color: 0xe5fffa }));
    group.add(spark); return spark;
  });
  return { group, update(time: number, energized: boolean, x: number, y: number) {
    group.rotation.set(y * .1, x * .24, 0);
    accent.emissiveIntensity = energized ? .85 : .35;
    sparks.forEach((spark, i) => { spark.visible = energized; if (energized) pathPosition(scene.paths[i], (time * .3 + i / sparks.length) % 1, spark.position); });
  } };
}

export function createCssProject(parent: HTMLElement, index: number) {
  const scene = projectScenes[index], scale = 71.4;
  const group = document.createElement("div"); group.className = "project-miniature"; parent.appendChild(group);
  const position = (p: Point) => `translate3d(${p[0] * scale}px,${-p[1] * scale}px,${p[2] * scale}px)`;
  scene.parts.forEach(part => {
    const element = document.createElement("div"); element.className = `mini-${part.shape}${part.glass ? " mini-accent" : ""}`;
    const r = part.rotation ?? [0, 0, 0];
    element.style.transform = `${position(part.at)} rotateX(${-r[0]}rad) rotateY(${r[1]}rad) rotateZ(${-r[2]}rad)`;
    group.appendChild(element);
    if (part.shape === "box") {
      const [w, h, d] = part.size.map(v => v * scale);
      [[w,h,"",d/2],[w,h,"rotateY(180deg)",d/2],[d,h,"rotateY(90deg)",w/2],[d,h,"rotateY(-90deg)",w/2],[w,d,"rotateX(90deg)",h/2],[w,d,"rotateX(-90deg)",h/2]].forEach(([width,height,rotation,z]) => {
        const face = document.createElement("i"); face.className = "mini-face";
        face.style.width = `${width}px`; face.style.height = `${height}px`; face.style.transform = `translate(-50%,-50%) ${rotation} translateZ(${z}px)`; element.appendChild(face);
      });
    } else {
      const diameter = part.size[0] * 2 * scale;
      element.style.width = `${diameter}px`; element.style.height = `${diameter}px`; element.style.margin = `${-diameter / 2}px`;
    }
  });
  const sparks = scene.paths.map(path => {
    path.slice(1).forEach((b, i) => {
      const a = path[i], start = new T.Vector3(a[0], -a[1], a[2]).multiplyScalar(scale), end = new T.Vector3(b[0], -b[1], b[2]).multiplyScalar(scale), delta = end.clone().sub(start);
      const matrix = new T.Matrix4().compose(start.clone().add(end).multiplyScalar(.5), new T.Quaternion().setFromUnitVectors(new T.Vector3(1,0,0), delta.clone().normalize()), new T.Vector3(1,1,1));
      const line = document.createElement("i"); line.className = "mini-link"; line.style.width = `${delta.length()}px`; line.style.transform = `translate(-50%,-50%) matrix3d(${matrix.elements.join(",")})`; group.appendChild(line);
    });
    const spark = document.createElement("i"); spark.className = "mini-spark"; group.appendChild(spark); return spark;
  });
  const point = new T.Vector3();
  return { update(time: number, energized: boolean, x: number, y: number) {
    group.style.transform = `rotateX(${-y * .1}rad) rotateY(${x * .24}rad)`;
    sparks.forEach((spark, i) => { spark.hidden = !energized; if (energized) { pathPosition(scene.paths[i], (time * .3 + i / sparks.length) % 1, point); spark.style.transform = position([point.x,point.y,point.z]); } });
  } };
}
