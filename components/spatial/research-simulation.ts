import * as T from "three";
import { CSS3DObject } from "three/addons/renderers/CSS3DRenderer.js";

const count=12;
/** Illustrative architecture, never patient data or measured predictions. */
export function researchPositions(stage:number,t:number){
  return Array.from({length:count},(_,i)=>{
    const a=i/count*Math.PI*2,side=i<6?-1:1,j=i%6;
    if(stage===0)return new T.Vector3((i%3-1)*.52,(Math.floor(i/3)-1.5)*.38,Math.sin(t*3+i)*.09);
    if(stage===1)return new T.Vector3((i%3-1)*.52,(Math.floor(i/3)-1.5)*.38,0);
    if(stage===2)return new T.Vector3((i-5.5)*.14,Math.sin(i*.7-t*3)*.4,Math.cos(i*.7)*.12);
    if(stage===4||stage===5)return new T.Vector3(side*.42+Math.cos(j*Math.PI/3)*.36,Math.sin(j*Math.PI/3)*.6,side*.12);
    if(stage===6){const merge=.35+.65*(1-t);return new T.Vector3(side*.75*merge,(j-2.5)*.23,Math.sin(j)*.15);}
    if(stage===7){const hospital=Math.floor(i/4),angle=hospital*Math.PI*2/3;return new T.Vector3(Math.cos(angle)*.65+(i%2-.5)*.22,Math.sin(angle)*.65+(Math.floor(i%4/2)-.5)*.22,0);}
    if(stage===8)return new T.Vector3(side*.46,(j-2.5)*.18,0);
    return new T.Vector3(Math.cos(a)*.73,Math.sin(a)*.73,Math.sin(a*2)*.18);
  });
}
export function createResearchSimulation(parent:T.Group,css:boolean){
  const group=new T.Group();parent.add(group);group.position.z=.6;
  const geometry=new T.SphereGeometry(.06,8,6),material=new T.MeshBasicMaterial({color:0xffce94});
  const nodes:T.Mesh[]=[],dots:HTMLElement[]=[],cssLines:HTMLElement[]=[];
  const lineGeometry=new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(new Float32Array(count*6),3));
  const lineMaterial=new T.LineBasicMaterial({color:0xffce94,transparent:true,opacity:.55});
  const links=new T.LineSegments(lineGeometry,lineMaterial);links.frustumCulled=false;
  let surface:HTMLElement|undefined;
  if(css){surface=document.createElement('div');surface.className='research-simulation';surface.setAttribute('aria-hidden','true');const object=new CSS3DObject(surface);object.scale.setScalar(.014);group.add(object);for(let i=0;i<count;i++){const dot=document.createElement('i');dot.className='sim-node';surface.appendChild(dot);dots.push(dot);const line=document.createElement('b');line.className='sim-link';surface.appendChild(line);cssLines.push(line);}}
  else {for(let i=0;i<count;i++){const node=new T.Mesh(geometry,material);group.add(node);nodes.push(node);}group.add(links);}
  const rings=[-1,1].map(side=>{const mesh=new T.Mesh(new T.TorusGeometry(.45,.009,5,32),material);mesh.scale.y=1.45;mesh.position.x=side*.42;if(!css)group.add(mesh);const el=document.createElement('span');el.className='sim-hyperedge';el.style.left=`${side*30}px`;surface?.appendChild(el);return{mesh,el};});
  let stage=0,start=performance.now(),positions=researchPositions(0,0),lastStep=-1,lastExpanded=-1;
  group.visible=false;
  return {
    group,
    theme(light:boolean){material.color.set(light?0x785010:0xffce94);lineMaterial.color.copy(material.color);},
    select(index:number){stage=index;start=performance.now();lastStep=-1;},
    update(now:number,moving:boolean,expanded:number){
      group.visible=true;const age=moving?Math.min(1,(now-start)/3800):1;
      const step=Math.floor(age*90);if(step===lastStep&&expanded===lastExpanded)return;lastStep=step;lastExpanded=expanded;
      positions=researchPositions(stage,age);
      const a=lineGeometry.getAttribute('position') as T.BufferAttribute;
      positions.forEach((p,i)=>{
        const q=positions[stage===7?(Math.floor(i/4)*4+4)%count:(i+1)%count];
        const pulse=moving&&age<1?1+Math.max(0,1-Math.abs(age*count-i)*.7)*1.1:stage===9&&i===3?1.8:1;
        if(css){dots[i].style.transform=`translate3d(${p.x*71.4}px,${-p.y*71.4}px,${p.z*71.4}px) scale(${pulse})`;const dx=(q.x-p.x)*71.4,dy=-(q.y-p.y)*71.4;cssLines[i].style.width=`${Math.hypot(dx,dy)}px`;cssLines[i].style.transform=`translate(${p.x*71.4}px,${-p.y*71.4}px) rotate(${Math.atan2(dy,dx)}rad)`;cssLines[i].style.opacity=stage<2?'.12':'.6';}
        else{nodes[i].position.copy(p);nodes[i].scale.setScalar(pulse);a.setXYZ(i*2,p.x,p.y,p.z);a.setXYZ(i*2+1,q.x,q.y,q.z);}
      });
      a.needsUpdate=true;links.visible=stage>=2;
      rings.forEach(({mesh,el},i)=>{const show=stage===4||stage===5;mesh.visible=show;mesh.position.z=(i?1:-1)*expanded*.3;el.hidden=!show;el.style.transform=`translate(-50%,-50%) translateZ(${(i?1:-1)*expanded*22}px)`;});
    },
    dispose(){geometry.dispose();material.dispose();lineGeometry.dispose();lineMaterial.dispose();rings.forEach(r=>r.mesh.geometry.dispose());group.removeFromParent();surface?.remove();},
  };
}
