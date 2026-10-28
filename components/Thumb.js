'use client';
import React, { useMemo } from 'react';
import Viz from './Viz';
import { A, R } from '../lib/algorithms';

// Card preview: a representative frame of the algorithm
export default function Thumb({ ai }) {
  const f = useMemo(() => {
    const a = A[ai];
    if (!a) return null;
    try {
      const S = a.gen(R(7 * 97 + ai * 13 + 5), a.pm ? a.pm[3] : 0);
      if (!S || !S.length) return null;
      if (a.slug === 'bias-variance') return S[3] || S[S.length - 1];
      if (a.slug === 'cross-validation') return S[2] || S[S.length - 1];
      if (a.slug === 'decision-tree') return S[Math.max(0, S.length - 3)];
      return S[S.length - 1];
    } catch (e) {
      return null;
    }
  }, [ai]);

  if (!f) return null;
  return (
    <div className="card-thumb" aria-hidden="true">
      <Viz f={f} />
    </div>
  );
}
