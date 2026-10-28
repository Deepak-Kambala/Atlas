'use client';

import React, { useState, useEffect } from 'react';
import GradientASCII from './GradientASCII';

export default function BackgroundASCII() {
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const getTheme = () => document.documentElement.dataset.theme || 'dark';
    setTheme(getTheme());

    const observer = new MutationObserver(() => {
      setTheme(getTheme());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  if (!mounted) {
    return <div className="global-bg-ascii" aria-hidden="true" />;
  }

  const isLight = theme === 'light';

  const darkColors = ['#080e24', '#0f2b5c', '#0284c7', '#38bdf8'];
  const lightColors = ['#e0f2fe', '#bae6fd', '#38bdf8', '#0284c7'];

  return (
    <div className="global-bg-ascii" aria-hidden="true">
      <GradientASCII
        colors={isLight ? lightColors : darkColors}
        shape="horizon"
        characters=" =+xX0S8#@"
        cellSize={16}
        density={0.65}
        glyphOpacity={isLight ? 0.28 : 0.42}
        gradientOpacity={isLight ? 0.35 : 0.55}
        glow={0.25}
        flow={0.6}
        speed={0.7}
        softness={0.6}
        grain={0.05}
        lightMode={isLight}
        mouseInteraction={true}
        clickEffect="wave"
      />
    </div>
  );
}

