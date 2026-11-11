import * as T from "three";
import { createCssProject } from "./project-scenes";
import { CSS3DObject } from "three/addons/renderers/CSS3DRenderer.js";
import { stations, type Exhibit, type WorldCallbacks } from "./stations";

/** A real CSS 3D scene for browsers where hardware WebGL is unavailable. */
export function createCssExhibits(roots:T.Group[], callbacks:WorldCallbacks){
  const models:T.Group[]=[];
  const displays:HTMLElement[][]=[];
  const selected={project:0,skill:0,research:0};
  const projects:ReturnType<typeof createCssProject>[]=[];
  function element(tag:string,className:string,parent:HTMLElement,text?:string){const el=document.createElement(tag);el.className=className;if(text)el.textContent=text;parent.appendChild(el);return el;}
  function ring(parent:HTMLElement,radius:number,rotation:string,className=""){const el=element("div",`css-orbit ${className}`,parent);el.style.width=`${radius*2}px`;el.style.height=`${radius*2}px`;el.style.transform=`translate(-50%,-50%) ${rotation}`;return el;}
  function point(parent:HTMLElement,x:number,y:number,z:number,size=7){const el=element("i","css-node",parent);el.style.width=`${size}px`;el.style.height=`${size}px`;el.style.transform=`translate3d(${x}px,${y}px,${z}px) translate(-50%,-50%)`;return el;}
  function line(parent:HTMLElement,start:T.Vector3,end:T.Vector3){const delta=end.clone().sub(start);const mid=start.clone().add(end).multiplyScalar(.5);const q=new T.Quaternion().setFromUnitVectors(new T.Vector3(1,0,0),delta.clone().normalize());const matrix=new T.Matrix4().compose(mid,q,new T.Vector3(1,1,1));const el=element("i","css-connection",parent);el.style.width=`${delta.length()}px`;el.style.transform=`translate(-50%,-50%) matrix3d(${matrix.elements.join(",")})`;return el;}
  function globe(parent:HTMLElement,radius:number,count:number){
    const vertices:T.Vector3[]=[];
    for(let i=0;i<count;i++){const y=1-2*(i+.5)/count,a=i*2.399963,r=Math.sqrt(1-y*y);vertices.push(new T.Vector3(Math.cos(a)*r,y,Math.sin(a)*r).multiplyScalar(radius));}
    vertices.forEach((v,i)=>{point(parent,v.x,v.y,v.z);for(let j=i+1;j<vertices.length;j++)if(v.distanceTo(vertices[j])<radius*.8)line(parent,v,vertices[j]);});
  }
  function cube(parent:HTMLElement,size:number){const group=element("div","css-cube",parent);const faceTransforms=["","rotateY(180deg)","rotateY(90deg)","rotateY(-90deg)","rotateX(90deg)","rotateX(-90deg)"];faceTransforms.forEach((r)=>{const face=element("div","css-cube-face",group);face.style.width=`${size}px`;face.style.height=`${size}px`;face.style.transform=`translate(-50%,-50%) ${r} translateZ(${size/2}px)`;});return group;}
  function button(parent:HTMLElement,title:string,type:Exhibit,index:number){const el=element("button","css-exhibit-target",parent,title) as HTMLButtonElement;el.setAttribute("aria-label",`Explore ${title}`);el.addEventListener("click",()=>callbacks.onSelect(type,index));return el;}
  roots.forEach((root,index)=>{
    const floor=element("div","css-platform",document.createElement("div"));floor.style.setProperty("--object-color",stations[index].color);floor.setAttribute("aria-hidden","true");
    for(let n=0;n<4;n++)ring(floor,170+n*58,"");
    for(let n=0;n<12;n++){const spoke=element("i","css-floor-spoke",floor);spoke.style.transform=`rotate(${n*30}deg)`;}
    const floorObject=new CSS3DObject(floor);floorObject.scale.setScalar(.019);floorObject.rotation.x=-Math.PI/2;floorObject.position.y=-3.12;root.add(floorObject);
    const group=new T.Group();root.add(group);models.push(group);
    const surface=element("div",`css-world-model css-model-${index}`,document.createElement("div"));surface.style.setProperty("--object-color",stations[index].color);surface.setAttribute("role","group");surface.setAttribute("aria-label",`${stations[index].name} three dimensional exhibit`);
    const obj=new CSS3DObject(surface);obj.scale.setScalar(.014);group.add(obj);displays[index]=[];
    if(index===0){
      const lattice=element("div","css-lattice",surface);globe(lattice,142,40);displays[index].push(lattice);
      const core=cube(surface,61);core.style.transform="rotateX(-24deg) rotateY(35deg) rotateZ(14deg)";
      [[173,"rotateX(67deg) rotateY(13deg)"],[195,"rotateY(68deg) rotateX(28deg)"],[215,"rotateX(-36deg) rotateY(-31deg)"]].forEach(([r,rotation])=>ring(surface,Number(r),String(rotation)));
      const metal=element("div","css-metal-orbits",surface);ring(metal,100,"rotateX(50deg) rotateY(25deg)","css-metal-ring");ring(metal,100,"rotateX(-40deg) rotateY(-25deg)","css-metal-ring");displays[index].push(metal);

    }
    if(index===1){
      ["HYBRID RECOMMENDER","HIRE MITRA","CHURN ANALYTICS","BOOKMONKEY"].forEach((name,n)=>{const card=button(surface,"","project",n);card.classList.add("css-project-card");card.setAttribute("aria-label",`Explore ${name}`);const symbol=element("div","css-artifact-symbol",card);projects.push(createCssProject(symbol,n));displays[index].push(card);});ring(surface,226,"rotateX(68deg)");
    }
    if(index===2){
      const crystal=element("div","css-research-crystal",surface);
      const core=cube(crystal,91);core.style.transform="rotateX(28deg) rotateY(38deg) rotateZ(42deg)";
      const vertices=Array.from({length:6},(_,n)=>new T.Vector3(Math.cos(n*Math.PI/3)*116,Math.sin(n*Math.PI/3)*116,0));
      vertices.forEach((v,n)=>line(crystal,v,vertices[(n+1)%6]));
      ["CLINICAL DATA","TEMPORAL ENCODING","KNOWLEDGE GRAPH","HYPERGRAPH","CROSS-ATTENTION","FEDERATED LEARNING"].forEach((name,n)=>{
        const left=n<3,x=left?-161:161,y=(n%3-1)*98;
        const pos=new T.Vector3(x,y,14),elbow=new T.Vector3(left?-110:110,y*.58,0);
        line(surface,new T.Vector3(left?-47:47,0,0),elbow);line(surface,elbow,pos);
        const node=button(surface,"","research",[0,2,3,4,6,7][n]);node.classList.add("css-research-node");node.setAttribute("aria-label",`Explore ${name}`);node.style.transform=`translate3d(${x}px,${y}px,14px)`;
        const gem=cube(node,28);gem.style.transform="rotateX(18deg) rotateY(25deg) rotateZ(45deg)";
        displays[index].push(node);
      });
      displays[index].push(crystal);
    }
    if(index===3){
      globe(surface,72,18);const core=cube(surface,35);core.style.transform="rotateX(35deg) rotateY(35deg)";
      ["CODE","AI / ML","GRAPH LEARNING","DATA","TOOLS","FULL STACK"].forEach((name,n)=>{const a=n*Math.PI/3;const p=new T.Vector3(Math.cos(a)*155,Math.sin(a)*133,Math.sin(a*2)*50);line(surface,new T.Vector3(),p);const node=button(surface,"","skill",n);node.classList.add("css-skill-node");node.setAttribute("aria-label",`Explore ${name}`);node.style.transform=`translate3d(${p.x}px,${p.y}px,${p.z}px)`;point(node,0,0,0,29);ring(node,31,"rotateX(50deg)");displays[index].push(node);});
    }
    if(index===4){
      const paths:T.Vector3[][]=[[],[]];for(let n=0;n<=80;n++){const t=n/80,a=t*Math.PI*4;paths.forEach((path,j)=>path.push(new T.Vector3(Math.cos(a+j*Math.PI)*71.4,(t-.5)*321.4,Math.sin(a+j*Math.PI)*39.3)));}
      paths.forEach(path=>path.forEach((v,n)=>{if(n)line(surface,path[n-1],v).classList.add("css-helix-strand");}));
      for(let n=0;n<5;n++){const v=paths[0][n*16+8],other=paths[1][n*16+8];line(surface,v,other);point(surface,v.x,v.y,v.z,9);}
      ring(surface,182,"scaleX(.61)");
    }
    if(index===5){
      const portal=element("div","css-signal-portal",surface);[109,131,154,175].forEach((r,n)=>ring(portal,r,`translateZ(${-n*10}px)`,n===1?"css-metal-ring":""));globe(portal,67,22);displays[index].push(portal);for(let n=0;n<32;n++){const a=n*Math.PI/16;point(surface,Math.cos(a)*143,Math.sin(a)*143,8,n%4===0?5:2);}
    }
  });
  function updateSelection(){
    displays[1].forEach((card,n)=>{const r=(n-selected.project+4)%4;const poses=[[0,0,60],[-95,-40,-75],[15,-75,-180],[109,15,-85]];const p=poses[r];card.style.transform=`translate(-50%,-50%) translate3d(${p[0]}px,${p[1]}px,${p[2]}px) rotateY(${r===0?-9:r===1?23:-25}deg) rotateZ(${r===0?-3:r===1?4:-7}deg)`;card.classList.toggle("is-selected",r===0);card.setAttribute("aria-pressed",String(r===0));});
    displays[2].slice(0,6).forEach((layer,n)=>layer.classList.toggle("is-selected",[0,0,1,2,3,3,4,5,5,5][selected.research]===n));displays[3].forEach((node,n)=>node.classList.toggle("is-selected",n===selected.skill));
  }
  function expand(value:number){displays[2].slice(0,6).forEach((node,n)=>{const x=(n<3?-1:1)*(161+value*25),y=(n%3-1)*(98-value*13)-value*12;node.style.transform=`translate3d(${x}px,${y}px,${14+value*(n%2?32:-32)}px)`;});}
  updateSelection();
  return {models,expand,animate:(active:number,elapsed:number,x=0,y=0,expanded=0)=>{if(active===1)projects.forEach((project,index)=>project.update(elapsed,index===selected.project,x,y));if(active===0){displays[0][0].style.transform=`rotateY(${elapsed*3}deg)`;displays[0][1].style.transform=`rotateZ(${Math.sin(elapsed*.16)*6}deg)`;}if(active===2){expand(expanded);displays[2][6].style.transform=`rotateY(${Math.sin(elapsed*.28)*8}deg)`;}if(active===5)displays[5][0].style.transform=`rotateY(${Math.sin(elapsed*.2)*12}deg)`;},select:(kind:Exhibit,index:number)=>{selected[kind]=index;updateSelection();}};
}
