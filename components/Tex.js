import React from 'react';
import katex from 'katex';

// Renders LaTeX with KaTeX on the server (no client JS needed).
export default function Tex({f,inline}){
  const html=katex.renderToString(f,{displayMode:!inline,throwOnError:false,strict:'ignore'});
  return <span className={inline?'tex':'tex block'} dangerouslySetInnerHTML={{__html:html}}/>;
}

// Plain text with optional inline LaTeX between $...$ and **bold** formatting
export function Rich({t}){
  if (!t) return null;
  return (
    <>
      {t.split(/\$([^$]+)\$/g).map((seg, i) => {
        if (i % 2 === 1) {
          return <Tex key={i} f={seg} inline />;
        }
        const parts = seg.split(/\*\*([^*]+)\*\*/g);
        if (parts.length === 1) return seg;
        return (
          <React.Fragment key={i}>
            {parts.map((sub, j) => (j % 2 === 1 ? <strong key={j}>{sub}</strong> : sub))}
          </React.Fragment>
        );
      })}
    </>
  );
}
