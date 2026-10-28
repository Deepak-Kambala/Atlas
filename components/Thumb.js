'use client';
import {useMemo} from 'react';
import Viz from './Viz';
import {A,R} from '../lib/algorithms';

// Card preview: a representative frame of the algorithm (same seed as the demo's default data)
export default function Thumb({ai}){
  const f=useMemo(()=>{const a=A[ai],S=a.gen(R(7*97+ai*13+5),a.pm?a.pm[3]:0);return S[ai===7?S.length-3:S.length-1]},[ai]);
  return <div className="thumb" aria-hidden="true"><Viz f={f}/></div>;
}
