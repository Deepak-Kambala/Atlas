import React from 'react';
const h=React.createElement,fm=v=>Math.abs(v)>=100?v.toFixed(0):Math.abs(v)>=1?v.toFixed(1):v.toFixed(3);

// Line chart (or bars). `mark` = x value to highlight, or a y value when hy is set.
export default function Chart({t,xl,yl,xs,series,mark,hy,bar}){
 const W=320,H=190,L=46,B=34,T=8,Rt=10,pw=W-L-Rt,ph=H-T-B,n=xs.length;
 const all=series.flatMap(s=>s.y).concat(hy&&mark!=null?[mark]:[]);
 let y0=Math.min(...all),y1=Math.max(...all);if(y0>=0||bar)y0=0;if(y1===y0)y1=y0+1;
 const x0=Math.min(...xs),x1=Math.max(...xs);
 const px=(v,i)=>bar?L+(i+.5)/n*pw:L+(v-x0)/((x1-x0)||1)*pw,py=v=>T+ph-(v-y0)/(y1-y0)*ph;
 const mi=!hy&&mark!=null?xs.indexOf(mark):-1,tx={style:{fill:'var(--mu)',fontSize:9}},ln={stroke:'var(--bd)'};
 return h('div',{className:'box'},h('h3',null,t),
  h('svg',{className:'ch',viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':t},
   h('line',{x1:L,y1:T,x2:L,y2:T+ph,style:ln}),h('line',{x1:L,y1:T+ph,x2:W-Rt,y2:T+ph,style:ln}),
   [y0,(y0+y1)/2,y1].map((v,i)=>h('text',{key:'y'+i,x:L-4,y:py(v)+3,textAnchor:'end',...tx},fm(v))),
   bar?xs.map((v,i)=>h('text',{key:'x'+i,x:px(v,i),y:T+ph+12,textAnchor:'middle',...tx},v))
      :[x0,x1].map((v,i)=>h('text',{key:'x'+i,x:i?W-Rt:L,y:T+ph+12,textAnchor:i?'end':'start',...tx},fm(v))),
   h('text',{x:L+pw/2,y:H-6,textAnchor:'middle',...tx},xl),
   h('text',{x:9,y:T+ph/2,transform:`rotate(-90 9 ${T+ph/2})`,textAnchor:'middle',...tx},yl),
   series.map((s,k)=>bar
    ?s.y.map((v,i)=>h('rect',{key:k+'-'+i,x:px(0,i)-pw/n*.3,y:py(v),width:pw/n*.6,height:T+ph-py(v),style:{fill:'var(--ac)'}}))
    :h('polyline',{key:k,points:xs.map((x,i)=>px(x,i)+','+py(s.y[i])).join(' '),style:{fill:'none',stroke:`var(${s.col||'--ac'})`,strokeWidth:1.8}})),
   mi>=0&&h('line',{x1:px(mark,mi),y1:T,x2:px(mark,mi),y2:T+ph,style:{stroke:'var(--p6)',strokeDasharray:'3 3'}}),
   mi>=0&&!bar&&h('circle',{cx:px(mark,mi),cy:py(series[0].y[mi]),r:3.5,style:{fill:'var(--p6)'}}),
   hy&&mark!=null&&h('line',{x1:L,y1:py(mark),x2:W-Rt,y2:py(mark),style:{stroke:'var(--p6)',strokeDasharray:'3 3'}}),
   hy&&mark!=null&&h('text',{x:W-Rt-2,y:py(mark)-3,textAnchor:'end',style:{fill:'var(--p6)',fontSize:9}},'ε = '+mark)),
  series.length>1&&h('p',{className:'mu'},series.map(s=>s.n).join(' · ')));
}
