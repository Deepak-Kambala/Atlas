'use client';
import React,{useMemo} from 'react';
const h=React.createElement;
export default function Viz({f}){
 const fld=useMemo(()=>{if(!f.field)return null;const o=[];for(let i=0;i<25;i++)for(let j=0;j<25;j++){const x=i*4,y=j*4,[k,s]=f.field(x+2,y+2);o.push(h('rect',{key:i*25+j,x,y:96-y,width:4.05,height:4.05,style:{fill:`var(--p${k})`,opacity:.07+.3*s}}))}return o},[f]);
 const st=(c,w,d)=>({stroke:`var(${c||'--mu'})`,strokeWidth:w||.4,strokeDasharray:d,fill:'none'});
 return h('svg',{viewBox:'-2 -2 104 104',role:'img','aria-label':f.t},
  h('rect',{x:0,y:0,width:100,height:100,style:{fill:'none',stroke:'var(--bd)',strokeWidth:.5}}),fld,
  [25,50,75].map(v=>h('g',{key:v,style:{stroke:'var(--bd)',strokeWidth:.15}},h('line',{x1:v,y1:0,x2:v,y2:100}),h('line',{x1:0,y1:v,x2:100,y2:v}))),
  h('g',{key:f.t,className:'fadein'},
   (f.lines||[]).map((l,i)=>h('line',{key:'l'+i,x1:l.a[0],y1:100-l.a[1],x2:l.b[0],y2:100-l.b[1],style:st(l.col,l.w,l.dash)})),
   (f.circles||[]).map((c,i)=>h('ellipse',{key:'e'+i,cx:c.x,cy:100-c.y,rx:c.rx,ry:c.ry,style:st(c.col,.6,'2 1.5')}))),
  (f.pts||[]).map((p,i)=>h('g',{key:'p'+i,className:'pt',style:{transform:`translate(${p.x}px,${100-p.y}px)`}},
   h('circle',{r:p.r||(p.big?2.8:1.7),style:p.h?{fill:'var(--cd)',stroke:`var(--p${p.c})`,strokeWidth:.6}:{fill:`var(--p${p.c})`,stroke:p.big?'var(--tx)':'var(--cd)',strokeWidth:p.big?.5:.25}}),
   p.ring&&h('circle',{r:3.2,style:st('--tx',.4)}))));
}
