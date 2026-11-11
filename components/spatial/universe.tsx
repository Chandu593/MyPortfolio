"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, Sun, Moon, Accessibility, Download, Orbit } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { profile, projects, education, experience, flagshipResearch, skillGroups } from "@/data/profile";
import { site, validUrl } from "@/data/site";
import ExhibitContent from "./exhibits";
import FuturisticCursor from "./futuristic-cursor";
import { stations, type Exhibit, type StationSlots, type WorldController } from "./stations";

function ReadingContent(){return <div className="reading-content"><h2>{profile.name}</h2><p>{profile.role} · {profile.title}</p><p>{profile.heroSubline}</p><a href={site.resume.url} download={site.resume.fileName}>Download résumé</a><h3>About</h3><p>{profile.about.summary}</p><h3>Projects</h3>{projects.map(p=><article key={p.id}><h4>{p.title}</h4><p>{p.description}</p><p>{p.contribution}</p>{p.metrics&&<p>{p.metrics.join(" · ")}</p>}{validUrl(p.githubUrl)&&<a href={p.githubUrl} target="_blank" rel="noopener noreferrer">Source code ↗</a>}{validUrl(p.demoUrl)&&<a href={p.demoUrl} target="_blank" rel="noopener noreferrer">Live project ↗</a>}</article>)}<h3>Research: Fed-THOR</h3><p>{flagshipResearch.tagline}</p><p>{flagshipResearch.methodology}</p><p>{flagshipResearch.experimentalSetup}</p><p>{flagshipResearch.results}</p><h3>Skills</h3>{skillGroups.map(s=><p key={s.category}><strong>{s.category}: </strong>{s.items.join(", ")}</p>)}<h3>Education</h3>{education.map(e=><article key={e.degree}><h4>{e.degree}</h4><p>{e.institution} · {e.start}–{e.end} · {e.score}</p></article>)}<h3>Experience</h3>{experience.map(e=><article key={e.organization}><h4>{e.role} · {e.organization}</h4><p>{e.start}–{e.end}</p><ul>{e.points.map(p=><li key={p}>{p}</li>)}</ul></article>)}<h3>Connect</h3><a href={`mailto:${profile.email}`}>{profile.email}</a></div>;}

export default function Universe(){
 const host=useRef<HTMLDivElement>(null);const controller=useRef<WorldController|null>(null);const current=useRef(0);
 const [active,setActive]=useState(0),[slots,setSlots]=useState<StationSlots|null>(null),[travelling,setTravelling]=useState(false);
 const progressBar=useRef<HTMLDivElement>(null);const travelState=useRef(false);
 const [researchTab,setResearchTab]=useState("model");
 const [exploded,setExploded]=useState(false);
 const [project,setProject]=useState(0),[skill,setSkill]=useState(0),[researchStage,setResearchStage]=useState(0);
 const [light,setLight]=useState(false),[reading,setReading]=useState(false),[failed,setFailed]=useState(false);
 const navigate=useCallback((index:number)=>{const value=Math.max(0,Math.min(stations.length-1,index));current.current=value;setActive(value);controller.current?.goTo(value);window.history.replaceState(null,"",`#${stations[value].id}`);},[]);
 const select=useCallback((type:Exhibit,index:number)=>{if(type==="project")setProject(index);if(type==="skill")setSkill(index);if(type==="research"){setResearchStage(index);setResearchTab("model");}controller.current?.select(type,index);},[]);
 const navigationRef=useRef(navigate);const selectionRef=useRef(select);
 useEffect(()=>{
   let cancelled=false;const element=host.current;if(!element)return;
   import("./world-engine").then(async({createWorld})=>{
     if(cancelled)return;
     const world=await createWorld(element,{onReady:(value)=>{if(!cancelled)setSlots(value);},onProgress:(value)=>{if(cancelled)return;if(progressBar.current)progressBar.current.style.transform=`scaleX(${value<1?value:0})`;const moving=value<1;if(travelState.current!==moving){travelState.current=moving;setTravelling(moving);}},onSelect:(type,index)=>{if(!cancelled)selectionRef.current(type,index);},onNavigate:(delta)=>{if(!cancelled)navigationRef.current(current.current+delta);},onError:()=>{if(!cancelled)setFailed(true);}});
     if(cancelled){world?.dispose();return;}controller.current=world;
     const initial=stations.findIndex(s=>`#${s.id}`===window.location.hash);if(initial>0){current.current=initial;setActive(initial);controller.current?.goTo(initial,true);}
     setLight(document.documentElement.dataset.theme==="light");
   }).catch((error:unknown)=>{if(!cancelled){console.error("The 3D observatory could not initialize.",error);setFailed(true);}});
   return()=>{cancelled=true;controller.current?.dispose();controller.current=null;};
 },[]);
 useEffect(()=>{
   const handler=(event:KeyboardEvent)=>{const target=event.target;if(target instanceof HTMLElement&&(target.matches("input,textarea,select,[contenteditable=true]")||target.closest('[role="dialog"],[role="tablist"]')))return;if(event.altKey||event.ctrlKey||event.metaKey||reading)return;if(event.key==="ArrowRight"){event.preventDefault();navigate(current.current+1);}if(event.key==="ArrowLeft"){event.preventDefault();navigate(current.current-1);}if(/^[1-6]$/.test(event.key))navigate(Number(event.key)-1);};
   window.addEventListener("keydown",handler);return()=>window.removeEventListener("keydown",handler);
 },[navigate,reading]);
 useEffect(()=>{const hash=()=>{const index=stations.findIndex(s=>`#${s.id}`===window.location.hash);if(index>=0&&index!==current.current)navigate(index);};window.addEventListener("hashchange",hash);return()=>window.removeEventListener("hashchange",hash);},[navigate]);
 useEffect(()=>{controller.current?.pause(reading);},[reading]);
 function toggleTheme(){const next=!light;setLight(next);document.documentElement.dataset.theme=next?"light":"dark";document.documentElement.style.colorScheme=next?"light":"dark";controller.current?.theme(next);try{localStorage.setItem("portfolio-theme",next?"light":"dark");}catch{/* Storage is optional. */}}
 const station=stations[active];
 return <div data-station={station.id} className={`universe ${slots?"is-ready":""} ${light?"is-dawn":""} ${travelling?"is-travelling":""}`} style={{"--station":light?station.dayColor:station.color} as React.CSSProperties}>
   <div ref={host} className="universe-host" aria-hidden={failed||undefined}/>
   <div className="universe-vignette" aria-hidden="true"/>
   <header className="universe-header"><button className="universe-brand" onClick={()=>navigate(0)} aria-label="Return to origin"><span className="cr-monogram">C<span>R</span><i/></span><span>CHANDRA<span>SEKHAR REDDY</span></span></button><div className="world-edition"><span className="edition-line"/>PERSONAL UNIVERSE / 2026</div><div className="universe-controls"><button onClick={toggleTheme} aria-label={light?"Switch to night environment":"Switch to dawn environment"} title={light?"Night environment":"Dawn environment"}>{light?<Moon size={17}/>:<Sun size={17}/>}</button><button onClick={()=>setReading(true)} aria-label="Open accessible reading view" title="Reading view"><Accessibility size={18}/></button><a className="hud-resume" href={site.resume.url} download={site.resume.fileName}>CV<Download size={14}/></a></div></header>
   {!slots&&!failed&&<div className="world-loading" role="status"><Orbit size={34}/><span>Assembling your observatory</span><small>Chandra Sekhar Reddy · AI/ML</small></div>}
   {slots&&!failed&&createPortal(<ExhibitContent station={station.id} project={project} skill={skill} researchStage={researchStage} researchTab={researchTab} onResearchTab={setResearchTab} exploded={exploded} onExplode={()=>{const next=!exploded;setExploded(next);controller.current?.explode(next);setResearchTab("model");}} onSelect={select} onGo={navigate} onSignal={()=>controller.current?.signal()}/>,slots[station.id],station.id)}
   <aside className="world-sector" aria-hidden="true"><span>0{active+1}</span><div>{station.label}<small>{station.position.map(v=>v.toFixed(1)).join(" / ")}</small></div></aside>
   {slots&&!failed&&<div className="scene-object-label" aria-hidden="true"><span className="object-cross">+</span><div>{["THE NEURAL CORE","SELECT AN ARTIFACT","EVOLVING CLINICAL RELATIONSHIPS","SELECT A KNOWLEDGE NODE","A TRAJECTORY IN MOTION","OPEN FOR NEW CONNECTIONS"][active]}<span>{["RESEARCH × ENGINEERING","FOUR SYSTEMS. ONE CURIOUS MIND.","TEMPORAL. RELATIONAL. FEDERATED.","SIX CLUSTERS OF PRACTICE","LEARNING IS NEVER LINEAR","RESEARCH. COLLABORATION. OPPORTUNITY."][active]}</span></div></div>}
   <footer className="universe-bottom"><div className="travel-status"><span>{travelling?"TRAVELLING TO":"YOU ARE IN"}<b>{station.name}</b></span><span className="world-count">0{active+1}<span>/ 06</span></span></div><nav className="spatial-dock" aria-label="Explore the 3D portfolio"><button className="travel-arrow" aria-label="Previous destination" disabled={active===0} onClick={()=>navigate(active-1)}><ArrowLeft size={19}/></button><div className="dock-destinations">{stations.map((s,i)=><button key={s.id} className={i===active?"current":""} aria-current={i===active?"page":undefined} aria-label={`Travel to ${s.name}`} onClick={()=>navigate(i)}><span className="dock-number">0{i+1}</span><span className="dock-label">{s.name}</span><span className="dock-light"/></button>)}</div><button className="travel-arrow" aria-label="Next destination" disabled={active===stations.length-1} onClick={()=>navigate(active+1)}><ArrowRight size={19}/></button></nav></footer>
   <div ref={progressBar} className="camera-progress" aria-hidden="true"/>
   <FuturisticCursor/>
   <div className="sr-only" aria-live="polite">{!travelling?`${station.name}. ${station.description}`:"Travelling through the observatory."}</div>
   <Dialog open={reading||failed} onOpenChange={(open)=>{if(!failed)setReading(open);}}><DialogContent className="reading-dialog" showCloseButton={!failed}><DialogTitle>{failed?"Your portfolio, in reading view":"Reading view"}</DialogTitle><DialogDescription>{failed?"3D rendering isn’t available in this browser. All profile content is accessible below.":"An accessible text companion to the 3D observatory."}</DialogDescription><ReadingContent/>{failed&&<a href={site.resume.url} className="world-primary">Download résumé<ArrowUpRight size={16}/></a>}</DialogContent></Dialog>
   <noscript><div className="noscript-portfolio"><h1>{profile.name}</h1><p>{profile.heroSubline}</p><p>JavaScript is needed to explore the 3D observatory.</p><a href={site.resume.url}>View résumé</a><a href={`mailto:${profile.email}`}>{profile.email}</a></div></noscript>
 </div>;
}
