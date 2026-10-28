import React from 'react';
import { notFound } from 'next/navigation';
import { C } from '../../../lib/content';
import AlgorithmWorkspace from '../../../components/AlgorithmWorkspace';

export function generateStaticParams() {
  return C.map(c => ({ slug: c.slug }));
}

export function generateMetadata({ params }) {
  const c = C.find(x => x.slug === params.slug);
  return { title: c ? `${c.name} | Interactive Workspace | Atlas` : 'Not found' };
}

export default function Page({ params }) {
  const ai = C.findIndex(x => x.slug === params.slug);
  if (ai < 0) notFound();
  const c = C[ai], pv = C[ai - 1], nx = C[ai + 1];

  return <AlgorithmWorkspace meta={c} ai={ai} prev={pv} next={nx} />;
}
