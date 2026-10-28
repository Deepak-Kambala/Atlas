'use client';
import React,{useState,useEffect,useMemo} from 'react';
import Viz from './Viz';
import Chart from './Chart';
import {A,R} from '../lib/algorithms';
const h=React.createElement;
export default function Visualizer({ai,meta}){
 const[seed,setSeed]=useState(7),[pv,setPv]=useState({}),[i,setI]=useState(0),[play,setPlay]=useState(false),[spd,setSpd]=useState(4);
 const a=A[ai],pm=a.pm?(pv[ai]??a.pm[3]):0;
 const S=useMemo(()=>a.gen(R(seed*97+ai*13+5),pm),[ai,seed,pm]),n=S.length,ix=Math.min(i,n-1),f=S[ix];
 useEffect(()=>{if(!play)return;const t=setTimeout(()=>ix<n-1?setI(ix+1):setPlay(false),spd*1000);return()=>clearTimeout(t)},[play,ix,spd,n]);
 useEffect(()=>{const k=e=>{if(e.target.tagName=='INPUT'||e.target.tagName=='BUTTON')return;
  if(e.key=='ArrowRight')setI(v=>Math.min(v+1,n-1));if(e.key=='ArrowLeft')setI(v=>Math.max(v-1,0));if(e.key==' '){e.preventDefault();setPlay(p=>!p)}};
  addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[n]);
 const reset=()=>{setI(0);setPlay(false)};
 const pr=S.map((fr,j)=>({j,x:fr.x??j,v:fr.v})).filter(p=>p.v!==undefined),cur=[...pr].reverse().find(p=>p.j<=ix),cv=S.curve;
 const charts=[pr.length>1&&h(Chart,{key:'a',t:meta.chart.t,xl:meta.chart.xl,yl:meta.chart.yl,xs:pr.map(p=>p.x),series:[{n:'v',y:pr.map(p=>p.v)}],mark:cur&&cur.x}),
  cv&&h(Chart,{key:'b',t:cv.t,xl:cv.xl,yl:cv.yl,xs:cv.x,series:cv.s,mark:cv.hi,hy:cv.hy,bar:cv.bar})];
 return h('div',null,
  h('main',null,
   h('div',null,h('div',{className:'viz'},h(Viz,{f})),charts),
   h('aside',null,
    h('div',{className:'card'},h('h3',null,a.n),h('p',{className:'mu'},a.i,' ',a.g=='Supervised'?'Learns from labelled examples (colours = known answers).':'Learns structure from unlabelled data.')),
    h('div',{className:'card','aria-live':'polite'},h('p',{className:'mu'},`Step ${ix+1} of ${n}`),h('div',{key:ix,className:'fadein'},h('h3',null,f.t),h('p',null,f.d)),play&&h('div',{className:'bar',key:ix+'-'+spd,style:{animationDuration:spd+'s'}})),
    h('div',{className:'card'},
     h('div',{className:'row'},h('button',{onClick:reset,title:'Restart'},'↺'),h('button',{onClick:()=>setI(Math.max(0,ix-1))},'◀ Back'),
      h('button',{className:'go',onClick:()=>{if(!play&&ix>=n-1)setI(0);setPlay(!play)}},play?'⏸ Pause':'▶ Play'),h('button',{onClick:()=>setI(Math.min(n-1,ix+1))},'Next ▶')),
     h('div',{className:'row'},h('span',{className:'mu'},'Step'),h('input',{type:'range',min:0,max:n-1,value:ix,onChange:e=>{setI(+e.target.value);setPlay(false)},'aria-label':'Step'})),
     h('div',{className:'row'},h('span',{className:'mu'},`Seconds per step: ${spd}`),h('input',{type:'range',min:1,max:10,value:spd,onChange:e=>setSpd(+e.target.value),'aria-label':'Seconds per step'})),
     a.pm&&h('div',{className:'row'},h('span',{className:'mu'},`${a.pm[0]} = ${pm}`),h('input',{type:'range',min:a.pm[1],max:a.pm[2],value:pm,onChange:e=>{setPv({...pv,[ai]:+e.target.value});setI(0);setPlay(false)},'aria-label':a.pm[0]})),
     h('div',{className:'row'},h('button',{onClick:()=>{setSeed(seed+1);setI(0);setPlay(false)}},'New data'),h('span',{className:'mu'},'Keys: space = play/pause, ←/→ = step'))))));
}
