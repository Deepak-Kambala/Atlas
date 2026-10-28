'use client';

// Icons are swapped with CSS from <html data-theme>, so there is no state and no flash.
export default function ThemeToggle(){
  const flip=()=>{
    const n=document.documentElement.dataset.theme==='light'?'dark':'light';
    document.documentElement.dataset.theme=n;
    try{localStorage.setItem('theme',n)}catch(e){}
  };
  return (
    <button className="themebtn" onClick={flip} aria-label="Toggle light and dark mode" title="Toggle light / dark">
      <svg className="i-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
      <svg className="i-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
    </button>
  );
}
