import React from 'react';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {C} from '../../../lib/content';
import Tex,{Rich} from '../../../components/Tex';
import Visualizer from '../../../components/Visualizer';

export function generateStaticParams(){return C.map(c=>({slug:c.slug}))}
export function generateMetadata({params}){
  const c=C.find(x=>x.slug===params.slug);
  return {title:c?`${c.name} explained | Atlas`:'Not found'};
}

const Sec=({id,t,children})=><section id={id} className="sec"><h2>{t}</h2>{children}</section>;
const Ul=({a})=><ul className="l">{a.map((x,i)=><li key={i}><Rich t={x}/></li>)}</ul>;

export default function Page({params}){
  const ai=C.findIndex(x=>x.slug===params.slug);
  if(ai<0)notFound();
  const c=C[ai],pv=C[ai-1],nx=C[ai+1];
  const toc=[['intuition','Intuition'],['demo','Interactive demo'],['math','Math and loss function'],['steps','Step by step'],['hyper','Hyper-parameters'],['tradeoffs','Strengths and weaknesses'],['use','When to use it'],['code','Code']];
  return (
    <div className="wrap">
      <Link href="/ml">← All ML algorithms</Link>
      <h1>{c.name}</h1>
      <p className="mu">{c.tag}</p>
      <div className="badges">{[c.type,c.task].map(b=><span key={b} className="badge">{b}</span>)}</div>
      <nav className="toc" aria-label="On this page">{toc.map(([id,t])=><a key={id} href={`#${id}`}>{t}</a>)}</nav>

      <Sec id="intuition" t="Intuition"><p><Rich t={c.intuition}/></p></Sec>

      <Sec id="demo" t="Interactive demo">
        <p className="mu" style={{marginBottom:12}}>Press play, or step manually. Pause at any step to read what is happening. The chart tracks the algorithm’s objective or a diagnostic as it learns.</p>
        <Visualizer ai={ai} meta={c} />
      </Sec>

      <Sec id="math" t="Math and loss function">
        {c.math.map(([t,f,n])=>(
          <div className="box" key={t}><h3>{t}</h3><div className="f texbox"><Tex f={f}/></div><p><Rich t={n}/></p></div>
        ))}
        <div className="box"><h3>Complexity</h3><p>{c.cx}</p></div>
      </Sec>

      <Sec id="steps" t="The algorithm, step by step"><ol className="l">{c.steps.map((s,i)=><li key={i}><Rich t={s}/></li>)}</ol></Sec>

      <Sec id="hyper" t="Hyper-parameters you can tune">
        <div className="hp">{c.hyper.map(([n,d])=><React.Fragment key={n}><b>{n}</b><span><Rich t={d}/></span></React.Fragment>)}</div>
      </Sec>

      <Sec id="tradeoffs" t="Strengths and weaknesses">
        <div className="two">
          <div className="box"><h3>Strengths</h3><Ul a={c.pros}/></div>
          <div className="box"><h3>Weaknesses</h3><Ul a={c.cons}/></div>
        </div>
      </Sec>

      <Sec id="use" t="When to use it"><Ul a={c.use}/></Sec>

      <Sec id="code" t="Code (scikit-learn)"><pre className="f">{c.code}</pre></Sec>

      <div className="nav2">
        {pv?<Link href={`/ml/${pv.slug}`}>← {pv.name}</Link>:<span/>}
        {nx?<Link href={`/ml/${nx.slug}`}>{nx.name} →</Link>:<span/>}
      </div>
    </div>
  );
}
