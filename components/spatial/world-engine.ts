import * as T from "three";
import { CSS3DRenderer, CSS3DObject } from "three/addons/renderers/CSS3DRenderer.js";
import { PMREMGenerator } from "@/vendor/stable-pmrem.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createCssExhibits } from "./css-exhibits";
import { createObjectLabels } from "./object-labels";
import { createGpuProject } from "./project-scenes";
import { createSceneEffects } from "./scene-effects";
import { createCinematics } from "./cinematic-effects";
import { createResearchSimulation } from "./research-simulation";
import { stations, type Exhibit, type StationSlots, type WorldCallbacks, type WorldController } from "./stations";

type HitData = { kind: Exhibit | "destination"; index: number; title: string };
type AnimatedRig = { group: T.Group; kind: string; parts: T.Object3D[] };
const clamp = T.MathUtils.clamp;
const ease = (t: number) => t < .5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
const positionOf = (i: number) => new T.Vector3(...stations[i].position);

/** One continuous WebGL world. Every content panel shares the same physical camera. */
export async function createWorld(host: HTMLDivElement, callbacks: WorldCallbacks): Promise<WorldController | null> {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("webgl2", { alpha: false, antialias: true, powerPreference: "high-performance" });
  let renderer: T.WebGLRenderer | null = null;
  if(context){try { renderer = new T.WebGLRenderer({ canvas, context, antialias: true, powerPreference: "high-performance" }); } catch { /* CSS 3D remains available. */ }}
  host.dataset.renderer=renderer?"webgl":"css3d";
  canvas.className = "universe-canvas";
  canvas.setAttribute("aria-label", "Interactive 3D observatory. Drag to look around, or use the destination controls to navigate.");
  canvas.setAttribute("role", "img");
  host.appendChild(canvas);
  if(renderer){renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;}
  const scene=new T.Scene();
  scene.background=new T.Color(0x05090e);
  scene.fog=new T.FogExp2(0x05090e,.018);
  const camera=new T.PerspectiveCamera(44,1,.1,360);
  const cssScene=new T.Scene();
  const cssRenderer=new CSS3DRenderer();
  cssRenderer.domElement.className="spatial-dom";
  cssRenderer.domElement.style.overflow="clip";
  cssRenderer.domElement.style.pointerEvents="none";
  host.appendChild(cssRenderer.domElement);
  let environment:T.WebGLRenderTarget|null=null;
  if(renderer){const pmrem=new PMREMGenerator(renderer);const room=new RoomEnvironment();environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;room.dispose();pmrem.dispose();}
  scene.add(new T.HemisphereLight(0xd4f9ff,0x131124,2.1));
  const key=new T.PointLight(0x70e7e0,95,45,2);
  const rim=new T.PointLight(0x8c96ff,100,40,2);
  const white=new T.PointLight(0xffffff,55,40,2);
  scene.add(key,rim,white);
  const chrome=new T.MeshPhysicalMaterial({color:0x799197,metalness:1,roughness:.19,clearcoat:1,clearcoatRoughness:.09,envMapIntensity:2.1});
  const darkMetal=new T.MeshStandardMaterial({color:0x101c25,metalness:.85,roughness:.3,envMapIntensity:1.4});
  const textures:T.Texture[]=[];
  const labelDrawers:Array<(light:boolean)=>void>=[];
  const animated:AnimatedRig[]=[];
  const hitMeshes:T.Object3D[]=[];
  const roots:T.Group[]=[];
  const visualRoots:T.Group[]=[];
  const planes:CSS3DObject[]=[];
  const cssRoots:T.Group[]=[];
  const slots={} as StationSlots;
  const selected={project:0,skill:0,research:0};
  const projectModels:ReturnType<typeof createGpuProject>[]=[];
  const energy=createSceneEffects(host);
  const modelCenters:Array<{x:number;y:number;radius:number}>=[];
  let lightX=0,lightY=0,signalStarted=-Infinity,expanded=0,expandedTarget=0;
  let active=0, isPaused=false, alive=true, inView=true, settleFrames=100, readingSurface=false, cameraDirty=true;
  let pixelRatio=1, frameCost=0, qualitySamples=0, qualityChanges=0, lastRaycast=0;
  let activeHits:T.Object3D[]=[];
  let isMobile=false, width=1,height=1, frame=0, last=0, elapsed=0, travel=1;
  let yaw=0,pitch=0,pointerX=0,pointerY=0,dragging=false,moved=false,lastX=0,lastY=0,wheelTime=0;
  const motion=window.matchMedia("(prefers-reduced-motion: reduce)");
  const fromPosition=new T.Vector3(),fromTarget=new T.Vector3(),currentTarget=new T.Vector3();
  const desiredPosition=new T.Vector3(),desiredTarget=new T.Vector3();
  const raycaster=new T.Raycaster(), pointer=new T.Vector2();
  const quaternion=new T.Quaternion();
  const yAxis=new T.Vector3(0,1,0),base=new T.Vector3(),offset=new T.Vector3(),target=new T.Vector3(),temp=new T.Vector3(),scaleTarget=new T.Vector3();
  const lastCameraPosition=new T.Vector3(),lastCameraQuaternion=new T.Quaternion();
  const stationPositions=stations.map((_,i)=>positionOf(i));
  const archivePoses=[[0,.1,.8],[-1.3,.65,-1.25],[.2,1.1,-2.6],[1.5,-.25,-1.3]];
  const makeGlowMaterial=(color:T.ColorRepresentation,opacity=1)=>new T.MeshBasicMaterial({color,transparent:opacity<1,opacity,blending:opacity<1?T.AdditiveBlending:T.NormalBlending,depthWrite:opacity>=1});
  const lineMat=(color:T.ColorRepresentation,opacity=.3)=>new T.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false});
  const sphereGeo=new T.SphereGeometry(.05,8,6);

  function label(text:string,sub:string,color:string,widthUnits=2.5){
    const c=document.createElement("canvas");c.width=768;c.height=192;const ctx=c.getContext("2d");
    const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=Math.min(4,renderer?.capabilities.getMaxAnisotropy()??1);textures.push(texture);
    const redraw=(light:boolean)=>{if(!ctx)return;ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle=light?"#e7eff2":"#07141e";ctx.beginPath();ctx.roundRect(7,10,754,172,14);ctx.fill();ctx.strokeStyle=light?"#60818e":"#527481";ctx.lineWidth=2;ctx.stroke();ctx.textAlign="center";ctx.fillStyle=light?"#193d4d":color;ctx.font='600 39px "Manrope Variable", sans-serif';ctx.fillText(text,384,83,720);ctx.fillStyle=light?"#375966":"#bccfd7";ctx.font='25px monospace';ctx.fillText(sub,384,132,710);texture.needsUpdate=true;};
    labelDrawers.push(redraw);redraw(false);
    const mesh=new T.Mesh(new T.PlaneGeometry(widthUnits,widthUnits/4),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:T.DoubleSide,toneMapped:false}));return mesh;
  }
  function tube(points:T.Vector3[],radius:number,material:T.Material,closed=false){return new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points,closed),Math.max(32,points.length*4),radius,5,closed),material);}
  function ring(radius:number,thickness:number,color:T.ColorRepresentation,opacity=1){return new T.Mesh(new T.TorusGeometry(radius,thickness,6,128),makeGlowMaterial(color,opacity));}
  function mark(object:T.Object3D,kind:HitData["kind"],index:number,title:string){object.userData.hit={kind,index,title} satisfies HitData;object.userData.stationIndex=roots.length-1;hitMeshes.push(object);}
  function network(group:T.Group,radius:number,count:number,color:T.ColorRepresentation){
    const points:T.Vector3[]=[];const coords:number[]=[];
    for(let i=0;i<count;i++){const y=1-2*(i+.5)/count;const a=i*2.399963;const r=Math.sqrt(1-y*y);points.push(new T.Vector3(Math.cos(a)*r,y,Math.sin(a)*r).multiplyScalar(radius));}
    const nodes=new T.InstancedMesh(sphereGeo,new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:1.5,metalness:.3,roughness:.3}),count);
    const mat=new T.Matrix4();points.forEach((p,i)=>{mat.makeTranslation(p.x,p.y,p.z);nodes.setMatrixAt(i,mat);for(let j=i+1;j<points.length;j++){if(p.distanceTo(points[j])<radius*.72)coords.push(p.x,p.y,p.z,points[j].x,points[j].y,points[j].z);}});
    group.add(nodes,new T.LineSegments(new T.BufferGeometry().setAttribute("position",new T.Float32BufferAttribute(coords,3)),lineMat(color,.38)));
  }
  function platform(root:T.Group,color:string,index:number){
    const floor=new T.Mesh(new T.CylinderGeometry(6.9,6.5,.28,96),darkMetal);floor.position.set(0,-3.3,0);root.add(floor);
    const inset=new T.Mesh(new T.CircleGeometry(6.48,96),new T.MeshStandardMaterial({color:0x081219,metalness:.75,roughness:.42,envMapIntensity:.5}));inset.rotation.x=-Math.PI/2;inset.position.y=-3.15;root.add(inset);
    const grid=new T.PolarGridHelper(6.35,24,8,128,0x25424c,0x18303b);grid.position.y=-3.14;root.add(grid);
    [6.6,6.9].forEach((r,i)=>{const rim=ring(r,i===0?.022:.01,color,i===0?.85:.35);rim.rotation.x=Math.PI/2;rim.position.y=-3.11;root.add(rim);});
    const cap=new T.Mesh(new T.CylinderGeometry(1.45,1.85,.2,64),darkMetal);cap.position.set(2.7,-2.95,0);root.add(cap);
    const gridLines:number[]=[];
    for(let i=0;i<52;i++){const a=i*Math.PI*2/52;const outer=6.85,inner=i%4===0?6.35:6.64;gridLines.push(Math.cos(a)*inner,-3.08,Math.sin(a)*inner,Math.cos(a)*outer,-3.08,Math.sin(a)*outer);}
    root.add(new T.LineSegments(new T.BufferGeometry().setAttribute("position",new T.Float32BufferAttribute(gridLines,3)),lineMat(color,.75)));
    const name=label(`SECTOR 0${index+1}`,stations[index].label,color,3.4);name.rotation.x=-Math.PI/2;name.position.set(-2.3,-3.08,3.8);root.add(name);
  }
  function origin(rig:T.Group){
    const silver=new T.MeshPhysicalMaterial({color:0xcbd7dc,metalness:1,roughness:.18,clearcoat:1,envMapIntensity:1.8});
    const core=new T.Mesh(new T.BoxGeometry(.86,.86,.86),silver);core.rotation.set(-.42,.61,.24);rig.add(core);
    const metal=new T.Group();
    [[.87,.44],[-.7,-.44]].forEach(([x,y])=>{const orbit=new T.Mesh(new T.TorusGeometry(1.4,.105,10,96),silver);orbit.rotation.set(x,y,0);metal.add(orbit);});rig.add(metal);
    const shell=new T.Group();network(shell,2.0,40,0x78daca);rig.add(shell);
    const rings=new T.Group();[2.42,2.72,3.02].forEach((r,i)=>{const o=ring(r,.009,0x84decc,.7);o.rotation.set([1.17,.49,-.63][i],[.23,1.19,-.54][i],0);rings.add(o);});rig.add(rings);
    animated.push({group:rig,kind:"origin",parts:[core,metal,shell,rings]});
  }
  function archive(rig:T.Group){
    const names=["HYBRID RECOMMENDER","HIRE MITRA","CHURN ANALYTICS","BOOKMONKEY"];
    const colors=[0xa9bbff,0x83ddc8,0xc2adff,0xf0b797];
    const parts:T.Group[]=[];
    for(let i=0;i<4;i++){
      const card=new T.Group();const back=new T.Mesh(new T.BoxGeometry(2.18,2.8,.16),darkMetal);mark(back,"project",i,names[i]);card.add(back);
      const border=new T.LineSegments(new T.EdgesGeometry(back.geometry),lineMat(colors[i],.9));card.add(border);
      const face=new T.Mesh(new T.PlaneGeometry(2.05,2.66),new T.MeshPhysicalMaterial({color:colors[i],metalness:.4,roughness:.2,transparent:true,opacity:.13,side:T.DoubleSide,depthWrite:false}));face.position.z=.09;card.add(face);
      const title=new T.Group();card.add(title);
      const miniature=createGpuProject(i,chrome,colors[i]);projectModels.push(miniature);
      miniature.group.position.set(0,.1,.28);card.add(miniature.group);
      const hoop=ring(.85,.008,colors[i],.7);hoop.position.set(0,.25,.19);card.add(hoop);rig.add(card);parts.push(card);
    }
    const orbit=ring(3.15,.014,0x7d98e7,.5);orbit.rotation.x=1.25;orbit.position.y=-.5;rig.add(orbit);
    animated.push({group:rig,kind:"archive",parts});
  }
  function researchModel(rig:T.Group){
    const parts:T.Object3D[]=[];
    const names=["CLINICAL DATA","TEMPORAL ENCODING","KNOWLEDGE GRAPH","HYPERGRAPH","CROSS-ATTENTION","FEDERATED LEARNING"];
    const crystal=new T.Group();
    const core=new T.Mesh(new T.OctahedronGeometry(.9),chrome);core.scale.y=1.4;core.rotation.z=.18;crystal.add(core);
    const cage=new T.LineSegments(new T.EdgesGeometry(new T.OctahedronGeometry(1.27)),lineMat(0xffce94,.85));cage.scale.y=1.25;crystal.add(cage);
    const halo=new T.Mesh(new T.TorusGeometry(1.58,.012,6,6),makeGlowMaterial(0xffce94,.8));halo.rotation.z=Math.PI/6;crystal.add(halo);rig.add(crystal);
    for(let i=0;i<6;i++){
      const left=i<3;const row=i%3;const pos=new T.Vector3(left?-2.25:2.25,(1-row)*1.38,.2);
      const tile=new T.Group();tile.position.copy(pos);
      const node=new T.Mesh(new T.CylinderGeometry(.28,.28,.15,6),darkMetal);node.rotation.x=Math.PI/2;mark(node,"research",[0,2,3,4,6,7][i],names[i]);tile.add(node);
      const border=new T.LineSegments(new T.EdgesGeometry(node.geometry),lineMat(0xffcf93,.9));border.rotation.copy(node.rotation);tile.add(border);

      const elbow=new T.Vector3(left?-1.6:1.6,pos.y*.58,0);
      rig.add(new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(left?-.65:.65,0,0),elbow,pos]),lineMat(0xffcf93,.4)));
      rig.add(tile);parts.push(tile);
    }
    parts.push(crystal);animated.push({group:rig,kind:"research",parts});
  }
  function expertise(rig:T.Group){
    const core=new T.Mesh(new T.IcosahedronGeometry(.57,1),chrome);rig.add(core);
    const labels=["CODE","AI / ML","GRAPH LEARNING","DATA","TOOLS","FULL STACK"];
    const parts:T.Object3D[]=[];
    for(let i=0;i<6;i++){
      const a=i*Math.PI/3;const pos=new T.Vector3(Math.cos(a)*2.05,Math.sin(a)*1.85,Math.sin(a*2)*.7);
      const node=new T.Group();node.position.copy(pos);const mesh=new T.Mesh(new T.IcosahedronGeometry(.3,1),new T.MeshStandardMaterial({color:0xd8afff,emissive:0x865bc2,emissiveIntensity:.7,metalness:.65,roughness:.22}));mark(mesh,"skill",i,labels[i]);node.add(mesh);
      const orbit=ring(.43,.007,0xd8afff,.7);orbit.rotation.x=.6;node.add(orbit);

      const geo=new T.BufferGeometry().setFromPoints([new T.Vector3(),pos]);rig.add(new T.Line(geo,lineMat(0xb894ef,.6)));rig.add(node);parts.push(node);
    }
    const net=new T.Group();network(net,1.2,28,0xaa88d2);rig.add(net);parts.push(core);
    animated.push({group:rig,kind:"expertise",parts});
  }
  function journey(rig:T.Group){
    const helix:T.Vector3[]=[];const twin:T.Vector3[]=[];
    for(let i=0;i<=100;i++){const t=i/100,a=t*Math.PI*4;helix.push(new T.Vector3(Math.cos(a)*1.0,t*4.5-2.25,Math.sin(a)*.55));twin.push(new T.Vector3(Math.cos(a+Math.PI)*1.0,t*4.5-2.25,Math.sin(a+Math.PI)*.55));}
    rig.add(tube(helix,.018,chrome),tube(twin,.013,makeGlowMaterial(0x8dc8f0,.9)));
    for(let i=0;i<5;i++){
      const n=i*20+10,p=helix[n],q=twin[n];rig.add(new T.Line(new T.BufferGeometry().setFromPoints([p,q]),lineMat(0x8dd1ff,.4)));
      const node=new T.Mesh(new T.SphereGeometry(.065,10,8),makeGlowMaterial(0xade8ff));node.position.copy(p);rig.add(node);
    }
    const halo=ring(2.55,.008,0x8dd1ff,.55);halo.scale.x=.61;rig.add(halo);animated.push({group:rig,kind:"journey",parts:[]});
  }
  function signal(rig:T.Group){
    const main=new T.Mesh(new T.TorusGeometry(1.82,.17,16,128),chrome);rig.add(main);
    const lens=new T.Mesh(new T.SphereGeometry(1.66,48,32),new T.MeshPhysicalMaterial({color:0x8ed5a9,metalness:.7,roughness:.17,transparent:true,opacity:.17,side:T.DoubleSide,depthWrite:false}));lens.scale.z=.25;rig.add(lens);
    const parts:T.Object3D[]=[];
    [1.52,1.88,2.15,2.44].forEach((r,i)=>{const o=ring(r,i===1?.024:.009,0xc8ee9f,i===1?1:.5);o.position.z=-i*.12;rig.add(o);parts.push(o);});
    const inner=new T.Group();network(inner,.94,24,0xc8ee9f);rig.add(inner);parts.push(inner);
    for(let i=0;i<48;i++){const a=i*Math.PI/24;const tick=new T.Mesh(new T.BoxGeometry(.025,i%4===0?.18:.07,.025),makeGlowMaterial(0xc8ee9f,.8));tick.position.set(Math.sin(a)*2.02,Math.cos(a)*2.02,.04);tick.rotation.z=-a;rig.add(tick);}
    animated.push({group:rig,kind:"signal",parts});
  }

  stations.forEach((station,index)=>{
    const root=new T.Group();root.position.copy(positionOf(index));root.rotation.y=station.angle;roots.push(root);scene.add(root);platform(root,station.color,index);
    const visual=new T.Group();visual.position.set(2.7,0,0);root.add(visual);visualRoots.push(visual);
    [origin,archive,researchModel,expertise,journey,signal][index](visual);
    const element=document.createElement("div");element.className=`spatial-plane plane-${station.id}`;element.style.setProperty("--station",station.color);element.dataset.station=station.id;element.setAttribute("aria-label",station.label);
    const plane=new CSS3DObject(element);slots[station.id]=element;
    const cssRoot=new T.Group();cssRoot.position.copy(root.position);cssRoot.quaternion.copy(root.quaternion);cssScene.add(cssRoot);cssRoot.add(plane);planes.push(plane);cssRoots.push(cssRoot);
  });
  const cssExhibits=renderer?null:createCssExhibits(cssRoots,callbacks);
  const objectLabels=createObjectLabels(cssRoots,callbacks);
  const cinematics=createCinematics(host,visualRoots,cssExhibits?.models,planes);
  const simulation=createResearchSimulation(cssExhibits?cssExhibits.models[2]:visualRoots[2],!renderer);
  objectLabels.select("project",0);objectLabels.select("research",0);objectLabels.select("skill",0);
  const rail=stations.map((_,i)=>positionOf(i).add(new T.Vector3(0,-3.4,0)));scene.add(tube(rail,.018,makeGlowMaterial(0x789aab,.38)));
  const starCount=1600;const starPositions=new Float32Array(starCount*3);
  for(let i=0;i<starCount;i++){starPositions[i*3]=Math.sin(i*127.1)*95;starPositions[i*3+1]=Math.sin(i*311.7)*65;starPositions[i*3+2]=-80+Math.sin(i*74.7)*160;}
  const stars=new T.Points(new T.BufferGeometry().setAttribute("position",new T.BufferAttribute(starPositions,3)),new T.PointsMaterial({color:0xb9d8ef,size:.055,transparent:true,opacity:.65,depthWrite:false,sizeAttenuation:true}));scene.add(stars);
  const atmosphere=new T.Mesh(new T.SphereGeometry(210,24,16),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{light:{value:0}},vertexShader:`varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`varying vec3 vP;uniform float light;void main(){vec3 p=normalize(vP);float a=pow(max(0.,1.-abs(p.y+.12)),14.);float b=pow(max(0.,dot(p,normalize(vec3(.8,.1,-.4)))),8.);vec3 dark=vec3(.009,.017,.028)+vec3(.018,.045,.052)*a+vec3(.04,.027,.075)*b;vec3 dawn=vec3(.56,.65,.68)+vec3(.1,.1,.12)*a;gl_FragColor=vec4(mix(dark,dawn,light),1.);}`}));scene.add(atmosphere);

  function destination(){
    base.copy(stationPositions[active]);quaternion.setFromAxisAngle(yAxis,stations[active].angle);
    const distance=isMobile?11.7:11.2;
    offset.set(Math.sin(yaw)*distance,.8+pitch*3,Math.cos(yaw)*distance).applyQuaternion(quaternion);
    desiredPosition.copy(base).add(offset);desiredTarget.copy(base);desiredTarget.y+=isMobile?.2:.05;
  }
  const contentOnlyMobile=(index:number)=>isMobile&&(index===4||index===5);
  function layout(render=true){
    const r=host.getBoundingClientRect();width=Math.max(1,r.width);height=Math.max(1,r.height);isMobile=width<760||(width<900&&height>width);camera.aspect=width/height;camera.updateProjectionMatrix();
    pixelRatio=Math.min(window.devicePixelRatio,isMobile?1.25:1.6);renderer?.setPixelRatio(pixelRatio);renderer?.setSize(width,height);canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;cssRenderer.setSize(width,height);settleFrames=100;
    const short=height<660;const inset=isMobile?14:width<1100?24:38;
    const top=isMobile?104:short?104:140;const footer=isMobile?100:short?100:124;
    const available=Math.max(130,height-top-footer);
    const modelHeight=isMobile?Math.min(360,Math.max(240,available*.53)):Math.max(90,available-68);
    const panelTop=isMobile?top+modelHeight+12:top;
    const panelHeight=isMobile?Math.max(100,height-footer-panelTop):Math.min(720,available);
    const panelWidth=isMobile?Math.min(width-inset*2,540):Math.min(520,width*.41);
    const panelLeft=isMobile?(width-panelWidth)/2:inset;
    const objectLeft=isMobile?(width-Math.min(620,width-inset*2))/2:panelLeft+panelWidth+24;
    const objectWidth=isMobile?Math.min(620,width-inset*2):Math.max(120,width-objectLeft-inset);
    const layoutCamera=new T.PerspectiveCamera(44,camera.aspect,.1,360);layoutCamera.position.set(0,.8,isMobile?11.7:11.2);layoutCamera.lookAt(0,isMobile?.2:.05,0);layoutCamera.updateMatrixWorld();
    const atPixel=(x:number,y:number,depth:number)=>new T.Vector3((x/width-.5)*2*Math.tan(T.MathUtils.degToRad(22))*depth*camera.aspect,(.5-y/height)*2*Math.tan(T.MathUtils.degToRad(22))*depth,-depth).applyQuaternion(layoutCamera.quaternion).add(layoutCamera.position);
    const panelDepth=isMobile?10.1:9.6;const panelScale=2*Math.tan(T.MathUtils.degToRad(22))*panelDepth/height;
    const objectDepth=12;const objectScale=2*Math.tan(T.MathUtils.degToRad(22))*objectDepth/height;
    const labelDepth=9.0;const labelScale=2*Math.tan(T.MathUtils.degToRad(22))*labelDepth/height;
    const placeLabel=(labelObject:CSS3DObject,x:number,y:number)=>{labelObject.position.copy(atPixel(x,y,labelDepth));labelObject.quaternion.copy(layoutCamera.quaternion);labelObject.scale.setScalar(labelScale);};
    planes.forEach((plane,index)=>{
      const origin=index===0;
      const compactOrigin=origin&&isMobile&&height<760;
      const landscapeOrigin=origin&&!isMobile&&short;
      const originBand=isMobile&&!compactOrigin?Math.min(260,Math.max(180,available-410)):0;
      // Mobile selectors already live in the scroll surface. Reclaim their outer
      // label rows without changing the exhibit's size or its position.
      const mobileLabelSpace=isMobile&&index>=1&&index<=3?(index===1?94:138):0;
      const contentOnly=contentOnlyMobile(index);
      const pTop=origin?(landscapeOrigin?76:compactOrigin?78:top+originBand+6):contentOnly?top:panelTop-mobileLabelSpace;
      const pHeight=origin||contentOnly?height-footer-pTop:panelHeight+mobileLabelSpace;
      const pWidth=landscapeOrigin?width*.66:panelWidth;
      plane.element.style.width=`${pWidth}px`;plane.element.style.height=`${pHeight}px`;
      plane.position.copy(atPixel(panelLeft+pWidth/2,pTop+pHeight/2,panelDepth));plane.quaternion.copy(layoutCamera.quaternion);if(!isMobile)plane.rotateY(.025);plane.scale.setScalar(panelScale);
      const compactLabels=isMobile||short;
      let left=objectLeft,bandTop=!isMobile&&short?76:top,bandWidth=objectWidth,bandHeight=!isMobile&&short?height-footer-76:modelHeight;
      if(origin&&isMobile){
        bandHeight=compactOrigin?(width<360?126:148):originBand;
        bandWidth=compactOrigin?bandHeight:objectWidth;
        left=compactOrigin?width-inset-bandWidth:objectLeft;
        bandTop=compactOrigin?62:top;
      }
      if(landscapeOrigin){left=width*.7;bandWidth=width*.28;bandTop=82;bandHeight=height-188;}
      const sideLabels=!isMobile&&short&&index>=1&&index<=3;
      const gridLabels=index===1||(compactLabels&&(index===2||index===3));
      const labelBand=sideLabels?0:gridLabels?(index===1?94:138):index===5?44:0;
      const geometryHeight=Math.max(95,bandHeight-labelBand);
      const geometryWidth=sideLabels?bandWidth*.43:index===4?Math.max(100,bandWidth*.5-12):bandWidth;
      const geometryBottom=bandTop+geometryHeight;
      const x=sideLabels?left+geometryWidth/2:index===4?left+geometryWidth/2+(isMobile?0:bandWidth*.08):left+bandWidth*(origin&&!isMobile?.44:.5);
      const y=bandTop+geometryHeight/2;
      // Fit actual geometry bounds instead of a single small scale for every exhibit.
      const bounds=[[6.85,6.65],[6.4,4.2],[6.35,4.1],[5.8,4.6],[3.25,5.3],[5.15,5.15]][index];
      const unit=Math.min((geometryWidth-12)/bounds[0],(geometryHeight-12)/bounds[1]);
      modelCenters[index]={x,y,radius:Math.min(geometryWidth,geometryHeight)*.46};
      const modelPosition=atPixel(x,y,objectDepth),scale=unit*objectScale;
      visualRoots[index].position.copy(modelPosition);visualRoots[index].scale.setScalar(scale);
      cssExhibits?.models[index].position.copy(modelPosition);cssExhibits?.models[index].scale.setScalar(scale);
      objectLabels.layout(index,{left,top:bandTop,width:bandWidth,height:bandHeight,x,y,unit,mobile:compactLabels,sideLabels,geometryWidth,geometryBottom},placeLabel);
    });
    host.parentElement?.style.setProperty("--caption-left",`${objectLeft}px`);host.parentElement?.style.setProperty("--caption-top",`${top+modelHeight+8}px`);host.parentElement?.style.setProperty("--caption-width",`${objectWidth}px`);
    energy.layout(width,height,modelCenters);cinematics.layout(modelCenters);
    updateVisibility();
    destination();if(travel>=1){camera.position.copy(desiredPosition);currentTarget.copy(desiredTarget);camera.lookAt(currentTarget);}cameraDirty=true;if(render)draw();
  }
  function updateVisibility(){
    planes.forEach((plane,i)=>{const visible=i===active;plane.visible=visible;plane.element.inert=!visible;plane.element.setAttribute("aria-hidden",String(!visible));plane.element.style.pointerEvents=visible?"auto":"none";});
    roots.forEach((root,i)=>{
      const showExhibit=!contentOnlyMobile(i);
      root.visible=i===active||(travel<1&&root.position.distanceTo(currentTarget)<73);
      visualRoots[i].visible=showExhibit;
      if(cssExhibits){
        cssRoots[i].visible=root.visible;cssExhibits.models[i].visible=showExhibit;
        cssExhibits.models[i].traverse(object=>{if(object instanceof CSS3DObject){object.element.inert=i!==active||!showExhibit;object.element.setAttribute("aria-hidden",String(i!==active||!showExhibit));}});
      }
    });
    objectLabels.setActive(active,contentOnlyMobile(active));activeHits=contentOnlyMobile(active)?[]:hitMeshes.filter(mesh=>mesh.userData.stationIndex===active);cameraDirty=true;
  }
  function draw(){
    if(!alive)return;
    atmosphere.position.copy(camera.position);renderer?.render(scene,camera);
    if(cameraDirty||camera.position.distanceToSquared(lastCameraPosition)>1e-9||1-Math.abs(camera.quaternion.dot(lastCameraQuaternion))>1e-10){cssRenderer.render(cssScene,camera);lastCameraPosition.copy(camera.position);lastCameraQuaternion.copy(camera.quaternion);cameraDirty=false;}
  }
  function arrive(){cinematics.arrive(active,motion.matches||isPaused,!contentOnlyMobile(active));if(active===2)simulation.select(selected.research);}
  function goTo(index:number,immediate=false){
    if(index===active&&travel<1)return;
    settleFrames=100;active=clamp(index,0,stations.length-1);cinematics.travel(immediate||motion.matches||isPaused,isMobile);energy.travel(active,immediate||motion.matches);yaw=0;pitch=0;pointerX=0;pointerY=0;fromPosition.copy(camera.position);fromTarget.copy(currentTarget);destination();travel=immediate||motion.matches?1:0;
    if(travel===1){camera.position.copy(desiredPosition);currentTarget.copy(desiredTarget);camera.lookAt(currentTarget);}host.dataset.destination=stations[active].id;updateVisibility();if(travel===1)arrive();callbacks.onProgress(travel);draw();
  }
  function theme(light:boolean){
    cinematics.theme(light);simulation.theme(light);
    (scene.background as T.Color).set(light?0xa9bbc1:0x05090e);scene.fog=new T.FogExp2(light?0xa9bbc1:0x05090e,light?.022:.018);
    (atmosphere.material as T.ShaderMaterial).uniforms.light.value=light?1:0;if(renderer)renderer.toneMappingExposure=light?1.05:1.25;
    planes.forEach((plane,i)=>plane.element.style.setProperty("--station",light?stations[i].dayColor:stations[i].color));labelDrawers.forEach(redraw=>redraw(light));draw();
  }
  function animate(now:number){
    if(!alive)return;frame=requestAnimationFrame(animate);const interval=1000/(isMobile||qualityChanges>0?30:45);if(now-last<interval)return;const dt=Math.min((now-last)/1000,.065);last=now;
    if(document.hidden||!inView)return;
    const started=performance.now();
    const ambientMotion=!isPaused&&!motion.matches;
    if(!ambientMotion&&travel>=1&&settleFrames<=0&&!dragging)return;
    if(ambientMotion)elapsed+=dt;else settleFrames=Math.max(0,settleFrames-1);
    cinematics.tick(now,!ambientMotion);
    expanded=T.MathUtils.lerp(expanded,expandedTarget,motion.matches?1:Math.min(1,dt*8));if(Math.abs(expanded-expandedTarget)<.001)expanded=expandedTarget;
    if(travel<1){travel=Math.min(1,travel+dt/(isMobile?1.05:1.65));const t=ease(travel);camera.position.lerpVectors(fromPosition,desiredPosition,t);currentTarget.lerpVectors(fromTarget,desiredTarget,t);camera.position.y+=Math.sin(t*Math.PI)*3.5;callbacks.onProgress(travel);if(travel===1){updateVisibility();arrive();}}
    else if(!readingSurface||dragging){destination();target.copy(desiredPosition);if(ambientMotion&&!dragging){target.x+=pointerX*.12;target.y+=pointerY*.08;}if(camera.position.distanceToSquared(target)>1e-7)camera.position.lerp(target,motion.matches?1:.12);if(currentTarget.distanceToSquared(desiredTarget)>1e-7)currentTarget.lerp(desiredTarget,.15);}
    camera.lookAt(currentTarget);key.position.copy(currentTarget).add(temp.set(-4+lightX*3,6+lightY*2,6));rim.position.copy(currentTarget).add(temp.set(5-lightX*2,3,-3));white.position.copy(currentTarget).add(temp.set(0,5,8));
    if(renderer)animated.forEach((a,i)=>{
      if(!roots[i].visible||!visualRoots[i].visible)return;
      if(a.kind==="origin"){if(ambientMotion){a.parts[0].rotation.y=.61+Math.sin(elapsed*.18)*.18;a.parts[1].rotation.z=Math.sin(elapsed*.16)*.1;a.parts[2].rotation.y=elapsed*.045;a.parts[3].rotation.z=elapsed*.028;}}
      if(a.kind==="archive")a.parts.forEach((part,j)=>{const selectedCard=j===selected.project;const relative=(j-selected.project+4)%4;const p=archivePoses[relative];part.position.lerp(temp.set(p[0],p[1]+(ambientMotion?Math.sin(elapsed*.65+j)*.045:0),p[2]),motion.matches?1:.08);part.rotation.y=T.MathUtils.lerp(part.rotation.y,selectedCard?-.15:(relative===1?.4:-.45),.08);part.rotation.z=T.MathUtils.lerp(part.rotation.z,selectedCard?-.055:relative===1?.08:-.12,.08);part.scale.lerp(scaleTarget.setScalar(selectedCard?1:.9),.08);projectModels[j].update(elapsed,selectedCard&&ambientMotion,lightX,lightY);});
      if(a.kind==="research")a.parts.forEach((part,j)=>{if(j===6){if(ambientMotion)part.rotation.y=Math.sin(elapsed*.28)*.15;part.children[0].visible=false;part.children[1].position.z=-expanded*.3;part.children[2].position.z=expanded*.3;return;}part.position.set((j<3?-1:1)*(2.25+expanded*.35),(1-j%3)*(1.38-expanded*.18)+expanded*.17,.2+expanded*(j%2?.45:-.45));const chosen=[0,0,1,2,3,3,4,5,5,5][selected.research]===j;const scale=chosen?1.12:1;part.scale.lerp(scaleTarget.setScalar(scale),.08);});
      if(a.kind==="expertise")a.parts.forEach((part,j)=>{if(j===6){if(ambientMotion)part.rotation.y=elapsed*.2;return;}const scale=j===selected.skill?1.23:1;part.scale.lerp(scaleTarget.setScalar(scale),.08);if(ambientMotion)part.children[0].rotation.y=elapsed*.32;});
      if(a.kind==="signal"&&ambientMotion){a.parts[4].rotation.y=elapsed*.1;a.parts[4].rotation.z=elapsed*.035;a.parts.slice(0,4).forEach((p,j)=>{const scale=1+Math.sin(elapsed*.7+j*.6)*.035;p.scale.setScalar(scale);});}
    });
    if(ambientMotion&&!contentOnlyMobile(active))cssExhibits?.animate(active,elapsed,lightX,lightY,expanded);
    if(active===2&&!ambientMotion)cssExhibits?.expand(expanded);
    if(active===2){const visible=simulation.group.visible;simulation.update(now,ambientMotion,expanded);if(!visible)cameraDirty=true;}
    const signalAge=(now-signalStarted)/1000;
    if(renderer&&active===5&&!contentOnlyMobile(active)&&signalAge<2.2&&ambientMotion){
      const rig=animated[5];rig.parts.slice(0,4).forEach((ring,j)=>{const p=Math.max(0,Math.min(1,(signalAge-j*.12)/1.65));ring.scale.setScalar(1+Math.sin(p*Math.PI)*.18);});
    }
    energy.tick(now,active,lightX,lightY,ambientMotion);draw();
    if(renderer&&travel>=1){frameCost+=performance.now()-started;qualitySamples++;if(qualitySamples===60){if(frameCost/qualitySamples>16&&pixelRatio>.9&&qualityChanges<3){pixelRatio=Math.max(.85,pixelRatio*.8);renderer.setPixelRatio(pixelRatio);renderer.setSize(width,height);qualityChanges++;}frameCost=0;qualitySamples=0;}}

  }
  function hitAt(e:PointerEvent){const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects(activeHits,false)[0]?.object.userData.hit as HitData|undefined;}
  function onMove(e:PointerEvent){if(dragging)settleFrames=120;pointerX=e.clientX/width-.5;pointerY=.5-e.clientY/height;if(dragging){const dx=e.clientX-lastX,dy=e.clientY-lastY;if(Math.abs(dx)+Math.abs(dy)>2)moved=true;yaw=clamp(yaw-dx*.003,-.3,.3);pitch=clamp(pitch+dy*.0015,-.15,.15);lastX=e.clientX;lastY=e.clientY;}else if(performance.now()-lastRaycast>80){lastRaycast=performance.now();const hit=hitAt(e);canvas.style.cursor=hit?"pointer":"grab";host.dataset.hover=hit?.title||"";}}
  function onLightPointer(e:PointerEvent){if(e.pointerType==="touch"||motion.matches)return;lightX=clamp(e.clientX/width-.5,-.5,.5);lightY=clamp(.5-e.clientY/height,-.5,.5);}
  function onLightLeave(){lightX=0;lightY=0;}
  function onDown(e:PointerEvent){settleFrames=120;dragging=true;moved=false;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);}
  function onUp(e:PointerEvent){if(!moved&&travel>=.98){const hit=hitAt(e);if(hit){if(hit.kind==="destination")callbacks.onNavigate(hit.index-active);else callbacks.onSelect(hit.kind,hit.index);}}dragging=false;canvas.style.cursor="grab";}
  function onWheel(e:WheelEvent){if(e.ctrlKey||Math.abs(e.deltaY)<18||travel<1||performance.now()-wheelTime<1500)return;e.preventDefault();wheelTime=performance.now();callbacks.onNavigate(e.deltaY>0?1:-1);}
  function onCancel(){dragging=false;}
  function onSurface(event:Event){readingSurface=event.target instanceof Element&&Boolean(event.target.closest('.spatial-plane,.universe-header,.universe-bottom,[role="dialog"]'));}
  // Chromium can hit-test a transformed CSS3D panel but fail to route its native
  // wheel default to the overflow child. Resolve that child explicitly, including
  // line/page delta modes, while preserving browser zoom and textarea scrolling.
  function onSurfaceWheel(event:WheelEvent){
    if(event.ctrlKey||!event.deltaY||!(event.target instanceof Element))return;
    if(!host.contains(event.target))return;
    // Wheel hit-testing can select the canvas beneath a CSS3D scroll surface.
    // Use the visible panel's projected bounds as well as the DOM event target.
    const activePlane=planes[active].element;
    const rect=activePlane.getBoundingClientRect();
    const overPanel=event.clientX>=rect.left&&event.clientX<=rect.right&&event.clientY>=rect.top&&event.clientY<=rect.bottom;
    const plane=event.target.closest<HTMLElement>(".spatial-plane")||(overPanel?activePlane:null);
    if(!plane)return;
    const content=plane.querySelector<HTMLElement>(".exhibit-content");
    if(!content)return;
    let scroller=content;
    const input=(document.elementFromPoint(event.clientX,event.clientY)||event.target).closest<HTMLTextAreaElement>("textarea");
    if(input&&input.scrollHeight>input.clientHeight&&((event.deltaY>0&&input.scrollTop<input.scrollHeight-input.clientHeight)||(event.deltaY<0&&input.scrollTop>0)))scroller=input;
    const unit=event.deltaMode===1?(parseFloat(getComputedStyle(scroller).lineHeight)||20):event.deltaMode===2?scroller.clientHeight:1;
    event.preventDefault();event.stopPropagation();scroller.scrollTop+=event.deltaY*unit;
  }

  function lost(e:Event){e.preventDefault();inView=false;callbacks.onError();}
  canvas.addEventListener("pointermove",onMove);canvas.addEventListener("pointerdown",onDown);canvas.addEventListener("pointerup",onUp);canvas.addEventListener("pointercancel",onCancel);canvas.addEventListener("wheel",onWheel,{passive:false});canvas.addEventListener("webglcontextlost",lost);
  document.addEventListener("pointermove",onLightPointer,{passive:true});document.documentElement.addEventListener("pointerleave",onLightLeave);
  document.addEventListener("pointerover",onSurface,{passive:true});document.addEventListener("focusin",onSurface);
  window.addEventListener("wheel",onSurfaceWheel,{capture:true,passive:false});
  layout(false);if(renderer)await renderer.compileAsync(scene,camera);
  const resizeObserver=new ResizeObserver(()=>layout());resizeObserver.observe(host);
  const visibility=new IntersectionObserver(([e])=>{inView=e.isIntersecting;});visibility.observe(host);
  goTo(0,true);theme(document.documentElement.dataset.theme==="light");frame=requestAnimationFrame(animate);callbacks.onReady(slots);host.dataset.ready="true";
  return {
    goTo,signal:()=>{signalStarted=performance.now();settleFrames=120;energy.launch(motion.matches);},pause:(value)=>{isPaused=value;settleFrames=120;},theme,
    explode:(value)=>{expandedTarget=value?1:0;settleFrames=120;},
    select:(type,index)=>{selected[type]=index;if(type==="research")simulation.select(index);settleFrames=120;cssExhibits?.select(type,index);objectLabels.select(type,index);},
    dispose:()=>{
      alive=false;cinematics.dispose();simulation.dispose();energy.dispose();document.removeEventListener("pointermove",onLightPointer);document.documentElement.removeEventListener("pointerleave",onLightLeave);document.removeEventListener("pointerover",onSurface);document.removeEventListener("focusin",onSurface);window.removeEventListener("wheel",onSurfaceWheel,true);cancelAnimationFrame(frame);resizeObserver.disconnect();visibility.disconnect();
      canvas.removeEventListener("pointermove",onMove);canvas.removeEventListener("pointerdown",onDown);canvas.removeEventListener("pointerup",onUp);canvas.removeEventListener("pointercancel",onCancel);canvas.removeEventListener("wheel",onWheel);canvas.removeEventListener("webglcontextlost",lost);
      const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>();scene.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Line||o instanceof T.Points){geometries.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());environment?.dispose();renderer?.dispose();canvas.remove();cssRenderer.domElement.remove();
    },
  };
}
