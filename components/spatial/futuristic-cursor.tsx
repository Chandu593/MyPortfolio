"use client";
import { useEffect, useRef } from "react";

/** A hardware-accelerated reticle; no animation loop or React updates per move. */
export default function FuturisticCursor(){
 const cursor=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const element=cursor.current;if(!element)return;
  const fine=window.matchMedia("(hover: hover) and (pointer: fine)");
  let enabled=fine.matches;
  const leave=()=>{element.dataset.visible="false";document.documentElement.classList.remove("has-orbit-cursor");};
  const sync=()=>{enabled=fine.matches;if(!enabled)leave();};
  const move=(event:PointerEvent)=>{
   if(!enabled||event.pointerType==="touch")return;
   const target=event.target instanceof Element?event.target:null;
   if(target?.closest('[role="dialog"],[data-slot="dialog-overlay"]')){leave();return;}
   element.style.transform=`translate3d(${event.clientX}px,${event.clientY}px,0)`;
   element.dataset.visible="true";
   element.dataset.mode=target?.closest('input,textarea,[contenteditable="true"]')?"text":target?.closest('button,a,[role="tab"]')||target?.closest('[data-hover]:not([data-hover=""])')?"active":"orbit";
   document.documentElement.classList.add("has-orbit-cursor");
  };
  const down=()=>{element.dataset.pressed="true";};
  const up=()=>{element.dataset.pressed="false";};
  const keyboard=(event:KeyboardEvent)=>{if(event.key==="Tab")leave();};
  window.addEventListener("pointermove",move,{passive:true});window.addEventListener("pointerdown",down,{passive:true});window.addEventListener("pointerup",up,{passive:true});window.addEventListener("blur",leave);window.addEventListener("keydown",keyboard);
  document.documentElement.addEventListener("pointerleave",leave);fine.addEventListener("change",sync);
  return()=>{window.removeEventListener("pointermove",move);window.removeEventListener("pointerdown",down);window.removeEventListener("pointerup",up);window.removeEventListener("blur",leave);window.removeEventListener("keydown",keyboard);document.documentElement.removeEventListener("pointerleave",leave);fine.removeEventListener("change",sync);leave();};
 },[]);
 return <div ref={cursor} className="orbit-cursor" aria-hidden="true"><span className="cursor-reticle"/><span className="cursor-core"/><span className="cursor-satellite"/></div>;
}
