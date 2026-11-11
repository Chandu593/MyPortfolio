import * as T from "three";
import { CSS3DObject } from "three/addons/renderers/CSS3DRenderer.js";
import { stations, type Exhibit, type WorldCallbacks } from "./stations";

type Frame = { left:number; top:number; width:number; height:number; x:number; y:number; unit:number; mobile:boolean; sideLabels:boolean; geometryWidth:number; geometryBottom:number };
type Place = (object:CSS3DObject,x:number,y:number)=>void;

/** Labels share the scene camera but retain readable CSS-pixel dimensions. */
export function createObjectLabels(roots:T.Group[],callbacks:WorldCallbacks){
  const labels:CSS3DObject[][]=roots.map(()=>[]);
  const groups=[
    stations.map((_,i)=>`0${i+1}`),
    ["HYBRID RECOMMENDER","HIRE MITRA","CHURN ANALYTICS","BOOKMONKEY",],
    ["CLINICAL DATA","TEMPORAL ENCODING","KNOWLEDGE GRAPH","HYPERGRAPH","CROSS-ATTENTION","FEDERATED LEARNING"],
    ["CODE","AI / ML","GRAPH LEARNING","DATA","TOOLS","FULL STACK"],
    ["NOW / M.TECH AI","2025 / B.TECH","2023 / INTERNSHIPS","2021 / HIGHER SECONDARY","2019 / SCHOOL"],
    ["LET’S CONNECT"],
  ];
  groups.forEach((names,station)=>names.forEach((name,index)=>{
    const interactive=station<4;
    const element=document.createElement(interactive?"button":"div");
    element.className=`object-label object-label-${station}${station===0?" object-label-number":""}`;
    element.textContent=name;
    if(interactive){
      element.setAttribute("type","button");
      element.setAttribute("aria-label",station===0?`Travel to ${stations[index].name}`:`Explore ${name}`);
      element.addEventListener("click",()=>{
        if(station===0)callbacks.onNavigate(index);
        else callbacks.onSelect(station===1?"project":station===2?"research":"skill",station===2?[0,2,3,4,6,7][index]:index);
      });
    }
    const object=new CSS3DObject(element);roots[station].add(object);labels[station].push(object);
  }));
  return {
    layout(station:number,f:Frame,place:Place){
      const {left,top,width,height,x,y,unit,mobile,sideLabels,geometryWidth,geometryBottom}=f;
      labels[station].forEach((object,n)=>{
        let px=x,py=y,labelWidth=160;
        if(station===0){
          const a=-Math.PI/2+n*Math.PI/3;
          px=x+Math.cos(a)*3.15*unit;py=y+Math.sin(a)*2.75*unit;
          labelWidth=mobile&&width<190?26:32;
        }else if(station===4){
          labelWidth=Math.min(mobile?164:215,width*.46);
          px=Math.min(left+width-labelWidth/2-2,x+1.65*unit+16+labelWidth/2);py=y+(n-2)*Math.max(mobile?45:50,.9*unit);
        }else if(station===5){
          labelWidth=Math.min(240,width-12);py=geometryBottom+23;
        }else if(sideLabels){
          const rows=station===1?2:3;
          const column=station===1?n%2:n<3?0:1;
          const row=station===1?Math.floor(n/2):n%3;
          labelWidth=(width-geometryWidth-24)/2;
          px=left+geometryWidth+16+column*(labelWidth+8)+labelWidth/2;
          py=top+height/2+(row-(rows-1)/2)*48;
        }else if(mobile||station===1){
          const rows=station===1?2:3;
          labelWidth=(width-12)/2;
          const column=station===1?n%2:n<3?0:1;
          const row=station===1?Math.floor(n/2):n%3;
          px=left+column*(labelWidth+12)+labelWidth/2;
          const rowHeight=Math.min(46,(top+height-geometryBottom-6)/rows);
          py=geometryBottom+6+rowHeight*(row+.5);
        }else if(station===2){
          labelWidth=Math.min(178,width*.3);
          px=x+(n<3?-2.25:2.25)*unit;py=y+(n%3-1)*1.38*unit+Math.max(26,.48*unit);
        }else{
          const a=n*Math.PI/3;
          labelWidth=Math.min(166,width*.28);
          px=x+Math.cos(a)*2.05*unit;py=y-Math.sin(a)*1.85*unit+Math.max(30,.55*unit);
        }
        object.element.style.width=`${labelWidth}px`;
        object.element.dataset.compact=String(mobile);
        place(object,px,py);
      });
    },
    setActive(active:number,hideExhibit=false){labels.forEach((group,i)=>group.forEach(object=>{
      const visible=i===active&&!hideExhibit;
      object.visible=visible;object.element.inert=!visible;object.element.setAttribute("aria-hidden",String(!visible));
    }));},
    select(kind:Exhibit,index:number){
      const station=kind==="project"?1:kind==="research"?2:3;
      const chosen=kind==="research"?[0,0,1,2,3,3,4,5,5,5][index]:index;
      labels[station].forEach((object,n)=>object.element.setAttribute("aria-pressed",String(n===chosen)));
    },
  };
}
