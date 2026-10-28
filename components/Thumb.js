'use client';
import React, { useMemo } from 'react';
import Viz from './Viz';
import { A, R } from '../lib/algorithms';

// Card preview: a representative frame of the algorithm (same seed as the demo's default data)
export default function Thumb({ ai }) {
  const f = useMemo(() => {
    const a = A[ai];
    if (!a) return null;
    const S = a.gen(R(7 * 97 + ai * 13 + 5), a.pm ? a.pm[3] : 0);
    return S[ai === 7 ? S.length - 3 : S.length - 1];
  }, [ai]);

  if (!f) return null;
  return (
    <div className="card-thumb" aria-hidden="true">
      <Viz f={f} />
    </div>
  );
}
