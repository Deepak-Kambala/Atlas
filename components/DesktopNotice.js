'use client';
import {useState} from 'react';

// Visible only on small screens (see .mobnote in globals.css)
export default function DesktopNotice(){
  const [open,setOpen]=useState(true);
  if(!open)return null;
  return (
    <div className="mobnote" role="note">
      <span>Better to view on desktop for better experience</span>
      <button onClick={()=>setOpen(false)} aria-label="Dismiss notice">✕</button>
    </div>
  );
}
