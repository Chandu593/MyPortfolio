import * as T from "three";
import { CSS3DObject } from "three/addons/renderers/CSS3DRenderer.js";

type Center = {x:number;y:number;radius:number};
/** Bounded, one-shot effects. The world owns the only animation loop. */
export function createCinematics(host:HTMLElement, models:T.Group[], cssModels:T.Group[]|undefined, panels:CSS3DObject[]) {
  const portal=document.createElement("div");portal.className="space-fold";portal.setAttribute("aria-hidden","true");
  for(let i=0;i<14;i++){const ray=document.createElement("i");ray.style.setProperty("--ray-angle",`${i*360/14}deg`);portal.appendChild(ray);}
  const ring=document.createElement("b");portal.appendChild(ring);host.appendChild(portal);
  const scan=document.createElement("div");scan.className="material-scan";scan.setAttribute("aria-hidden","true");host.appendChild(scan);
  const borders=panels.map((panel,i)=>{const edge=document.createElement("div");edge.className="panel-hologram";edge.setAttribute("aria-hidden","true");if(i)panel.element.appendChild(edge);return edge;});
  const wire=new T.MeshBasicMaterial({color:0xb6f5f1,wireframe:true,transparent:true,opacity:.8,depthWrite:false});
  const saved=new Map<T.Mesh,T.Material|T.Material[]>();
  const surfaces=cssModels?.map(group=>group.children.find(child=>child instanceof CSS3DObject) as CSS3DObject|undefined);
  let animations:Animation[]=[],centers:Center[]=[],started=-Infinity;
  function restore(){saved.forEach((material,mesh)=>{mesh.material=material;});saved.clear();surfaces?.forEach(surface=>{if(surface)delete surface.element.dataset.materializing;});}
  function cancel(){animations.forEach(a=>a.cancel());animations=[];restore();started=-Infinity;}
  function play(el:HTMLElement,frames:Keyframe[],duration:number){const a=el.animate(frames,{duration,easing:"cubic-bezier(.16,1,.3,1)"});animations.push(a);return a;}
  function scroll(event:Event){const el=event.target;if(!(el instanceof HTMLElement)||!el.matches('.exhibit-content')||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;const p=el.closest<HTMLElement>('.spatial-plane');if(!p)return;const prior=Number(el.dataset.lastScroll||0);const down=el.scrollTop>=prior;el.dataset.lastScroll=String(el.scrollTop);const edge=p.querySelector<HTMLElement>('.panel-hologram');if(edge){edge.getAnimations().forEach(a=>a.cancel());edge.animate([{opacity:.8,boxShadow:`inset 0 ${down?-2:2}px 0 var(--station)`},{opacity:0,boxShadow:`inset 0 ${down?-2:2}px 0 var(--station)`}],{duration:360});}}
  function visibility(){if(document.hidden)cancel();}
  host.addEventListener('scroll',scroll,true);document.addEventListener('visibilitychange',visibility);
  return {
    theme(light:boolean){wire.color.set(light?0x255b81:0xb6f5f1);},
    layout(points:Center[]){centers=points;},
    travel(reduced:boolean,mobile:boolean){cancel();if(reduced)return;portal.dataset.mobile=String(mobile);play(portal,[{opacity:0,transform:'scale(.35)'},{opacity:.52,offset:.3},{opacity:0,transform:'scale(2.1)'}],mobile?680:1050);},
    arrive(index:number,reduced:boolean,showObject:boolean){
      restore();started=reduced?-Infinity:performance.now();
      if(reduced)return;
      if(index)play(borders[index],[{opacity:.9,clipPath:'inset(0 100% 99% 0)'},{opacity:.8,clipPath:'inset(0 0 98% 0)',offset:.3},{opacity:.7,clipPath:'inset(0 0 0 0)',offset:.7},{opacity:0,clipPath:'inset(0 0 0 0)'}],850);
      if(!showObject)return;
      const c=centers[index];if(c){scan.style.left=`${c.x-c.radius}px`;scan.style.top=`${c.y-c.radius}px`;scan.style.width=scan.style.height=`${c.radius*2}px`;play(scan,[{opacity:0,clipPath:'inset(0 0 100% 0)'},{opacity:.65,offset:.2},{opacity:.25,clipPath:'inset(80% 0 0 0)',offset:.8},{opacity:0,clipPath:'inset(100% 0 0 0)'}],1050);}
      if(cssModels){const surface=surfaces?.[index];if(surface)surface.element.dataset.materializing='wire';}
      else models[index].traverse(object=>{if(object instanceof T.Mesh){saved.set(object,object.material);object.material=wire;}});
    },
    tick(now:number,reduced:boolean){if(reduced){cancel();return;}if(started!==-Infinity&&now-started>480){restore();started=-Infinity;}},
    cancel,
    dispose(){cancel();wire.dispose();portal.remove();scan.remove();borders.forEach(e=>e.remove());host.removeEventListener('scroll',scroll,true);document.removeEventListener('visibilitychange',visibility);},
  };
}
