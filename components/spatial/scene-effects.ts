import { stations } from "./stations";

type Center = { x: number; y: number; radius: number };
const clamp = (x: number, low: number, high: number) => Math.max(low, Math.min(high, x));

/** A small composited overlay; no post-processing buffer or additional render loop. */
export function createSceneEffects(host: HTMLElement) {
  const layer = document.createElement("div"); layer.className = "scene-energy"; layer.setAttribute("aria-hidden", "true");
  const ns = "http://www.w3.org/2000/svg", svg = document.createElementNS(ns, "svg"), rail = document.createElementNS(ns, "path"), bead = document.createElementNS(ns, "circle");
  svg.classList.add("travel-energy"); rail.setAttribute("fill", "none"); rail.setAttribute("stroke-width", "1.5"); rail.setAttribute("pathLength", "1"); bead.setAttribute("r", "4"); svg.appendChild(rail); svg.appendChild(bead); layer.appendChild(svg);
  const dust = Array.from({length:20}, (_,i) => { const dot = document.createElement("i"); dot.className = "energy-dust"; dot.style.width = dot.style.height = `${i % 4 === 0 ? 4 : 2}px`; layer.appendChild(dot); return dot; });
  const pulses = Array.from({length:3}, () => { const ring = document.createElement("i"); ring.className = "signal-wave"; layer.appendChild(ring); return ring; });
  host.appendChild(layer);
  let centers: Center[] = [], width = 1, height = 1, travelStart = -Infinity, pulseStart = -Infinity, active = 0;
  let start = { x:0, y:0 }, end = { x:0, y:0 };
  let smoothX = 0, smoothY = 0;
  function hideTravel() { svg.style.opacity = "0"; }
  hideTravel();
  return {
    layout(w:number, h:number, points:Center[]) { width=w; height=h; centers=points; svg.setAttribute("viewBox",`0 0 ${w} ${h}`); },
    travel(index:number, reduced:boolean) {
      active=index; pulseStart=-Infinity;
      if (reduced || !centers[index]) { hideTravel(); return; }
      const nav=host.parentElement?.querySelector<HTMLElement>(`.spatial-dock [aria-label="Travel to ${stations[index].name}"]`);
      const rect=nav?.getBoundingClientRect(), bounds=host.getBoundingClientRect();
      start={x:rect?rect.left+rect.width/2-bounds.left:width/2,y:rect?rect.top+rect.height/2-bounds.top:height-45}; end=centers[index];
      rail.setAttribute("d",`M${start.x},${start.y} C${start.x},${start.y-110} ${end.x},${end.y+100} ${end.x},${end.y}`);
      travelStart=performance.now(); svg.style.opacity="1";
    },
    launch(reduced:boolean) { pulseStart=reduced?-Infinity:performance.now(); },
    tick(now:number, index:number, px:number, py:number, moving:boolean) {
      active=index; const center=centers[active]; if(!center)return;
      const root=host.parentElement;
      smoothX+=(px-smoothX)*.09; smoothY+=(py-smoothY)*.09;
      root?.style.setProperty("--light-x",`${50+smoothX*70}%`); root?.style.setProperty("--light-y",`${50-smoothY*70}%`);
      const phase=(now-travelStart)/1850;
      if(phase>=0&&phase<1&&moving){
        const t=1-Math.pow(1-phase,3), s=1-t;
        bead.setAttribute("cx",String(s*s*s*start.x+3*s*s*t*start.x+3*s*t*t*end.x+t*t*t*end.x));
        bead.setAttribute("cy",String(s*s*s*start.y+3*s*s*t*(start.y-110)+3*s*t*t*(end.y+100)+t*t*t*end.y));
        rail.style.strokeDasharray=`${t} 1`; rail.style.opacity=String(Math.sin(phase*Math.PI)*.65); svg.style.opacity=String(Math.min(1,(1-phase)*6));
      } else hideTravel();
      const radius=center.radius;
      dust.forEach((dot,i)=>{
        const show=moving&&(width>=760||i<12); dot.hidden=!show; if(!show)return;
        const a=i*2.39996+now*.000025*(i%2?1:-1), r=radius*(.72+(i%5)*.065);
        const x=center.x+Math.cos(a)*r, y=center.y+Math.sin(a)*r*.72;
        const mouseX=(px+.5)*width, mouseY=(.5-py)*height, dx=x-mouseX,dy=y-mouseY,distance=Math.hypot(dx,dy);
        const push=distance<100?(1-distance/100)*14:0;
        dot.style.transform=`translate3d(${clamp(x+dx/Math.max(1,distance)*push,8,width-8)}px,${clamp(y+dy/Math.max(1,distance)*push,80,height-105)}px,0)`;
        dot.style.opacity=String(.22+(Math.sin(now*.001+i)+1)*.16);
      });
      pulses.forEach((ring,i)=>{
        const t=(now-pulseStart-i*180)/1700, show=moving&&active===5&&t>=0&&t<1;
        ring.hidden=!show;if(!show)return;
        const size=radius*1.15;
        ring.style.width=ring.style.height=`${size}px`; ring.style.left=`${center.x}px`;ring.style.top=`${center.y}px`;
        ring.style.transform=`translate(-50%,-50%) scale(${.35+t*1.15}) rotateX(${30-t*30}deg)`;ring.style.opacity=String((1-t)*.8);
      });
    },
    dispose() { layer.remove(); },
  };
}
