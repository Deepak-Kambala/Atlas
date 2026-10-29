import React from 'react';
import katex from 'katex';

// Renders LaTeX with KaTeX on the server (no client JS needed).
export default function Tex({f,inline}){
  const html=katex.renderToString(f,{displayMode:!inline,throwOnError:false,strict:'ignore'});
  return <span className={inline?'tex':'tex block'} dangerouslySetInnerHTML={{__html:html}}/>;
}

// Plain text with inline LaTeX ($...$) and markdown **bold** formatting (supports nested math in bold)
export function Rich({ t }) {
  if (!t) return null;

  const renderMath = (str, prefix) => {
    return str.split(/\$([^$]+)\$/g).map((seg, idx) => {
      if (idx % 2 === 1) {
        return <Tex key={`${prefix}-tex-${idx}`} f={seg} inline />;
      }
      return seg;
    });
  };

  const parts = t.split(/(\*\*(?:[^*]|\*(?!\*))+?\*\*)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
          const inner = part.slice(2, -2);
          return (
            <strong key={`b-${i}`}>
              {renderMath(inner, `b-${i}`)}
            </strong>
          );
        }
        return (
          <React.Fragment key={`t-${i}`}>
            {renderMath(part, `t-${i}`)}
          </React.Fragment>
        );
      })}
    </>
  );
}
