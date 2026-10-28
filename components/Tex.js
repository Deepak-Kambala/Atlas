import katex from 'katex';

// Renders LaTeX with KaTeX on the server (no client JS needed).
export default function Tex({f,inline}){
  const html=katex.renderToString(f,{displayMode:!inline,throwOnError:false,strict:'ignore'});
  return <span className={inline?'tex':'tex block'} dangerouslySetInnerHTML={{__html:html}}/>;
}

// Plain text with optional inline LaTeX between $...$
export function Rich({t}){
  return <>{t.split(/\$([^$]+)\$/g).map((s,i)=>i%2?<Tex key={i} f={s} inline/>:s)}</>;
}
