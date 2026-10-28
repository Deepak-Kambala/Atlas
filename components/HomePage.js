'use client';
import React from 'react';
import Link from 'next/link';
import { C } from '../lib/content';
import Thumb from './Thumb';
import SimpleHeroVisual from './SimpleHeroVisual';

export default function HomePage() {
  const supervised = C.map((c, i) => ({ ...c, ai: i })).filter(c => c.type === 'Supervised');
  const unsupervised = C.map((c, i) => ({ ...c, ai: i })).filter(c => c.type === 'Unsupervised');

  const getPrimaryTask = task => {
    if (!task) return null;
    return task.split('/')[0].trim().toUpperCase();
  };

  return (
    <div className="home-layout-wrap">
      {/* 1. Page Introduction / Hero Area */}
      <section className="home-hero-section">
        <div className="home-hero-grid">
          {/* Left Column: Eyebrow, Heading, Description, Action */}
          <div className="home-hero-content">
            <div className="home-hero-eyebrow">
              <span className="eyebrow-dash">—</span> EXPLORE THE FOUNDATIONS
            </div>
            <h1 className="home-hero-heading">Machine Learning</h1>
            <p className="home-hero-desc">
              Explore core machine learning algorithms through interactive visualizations.
              Adjust parameters, see how the models learn, and understand what&apos;s happening behind the scenes.
            </p>
            <div className="home-hero-actions">
              <a href="#algorithms" className="btn-start-exploring">
                Start exploring →
              </a>
            </div>
          </div>

          {/* Right Column: Clean 3D Optimization Surface */}
          <div className="home-hero-visual">
            <SimpleHeroVisual />
          </div>
        </div>
      </section>

      {/* 2. Algorithm Catalog & Content Hierarchy */}
      <section id="algorithms" className="home-catalog-section">
        {/* Family 1: Supervised Learning */}
        <div className="algo-family-block">
          <div className="algo-family-header">
            <h2 className="algo-family-title">Supervised Learning</h2>
            <div className="algo-family-hairline" />
            <span className="algo-family-count">{supervised.length} ALGORITHMS</span>
          </div>

          <div className="algo-cards-grid">
            {supervised.map(c => {
              const primaryTask = getPrimaryTask(c.task);
              return (
                <Link key={c.slug} href={`/ml/${c.slug}`} className="algo-card">
                  <div className="algo-card-preview-wrap">
                    <Thumb ai={c.ai} />
                  </div>

                  <div className="algo-card-badges">
                    <span className="card-badge-pill">{c.type.toUpperCase()}</span>
                    {primaryTask && primaryTask !== c.type.toUpperCase() && (
                      <span className="card-badge-pill">{primaryTask}</span>
                    )}
                  </div>

                  <h3 className="algo-card-name">{c.name}</h3>
                  <p className="algo-card-tagline">{c.tag}</p>

                  <div className="algo-card-action-bar">
                    <span className="algo-card-link-text">
                      <span className="link-arrow-ne">↗</span> Explore algorithm
                    </span>
                    <span className="algo-card-arrow-icon">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Family 2: Unsupervised Learning */}
        <div className="algo-family-block">
          <div className="algo-family-header">
            <h2 className="algo-family-title">Unsupervised Learning</h2>
            <div className="algo-family-hairline" />
            <span className="algo-family-count">{unsupervised.length} ALGORITHMS</span>
          </div>

          <div className="algo-cards-grid">
            {unsupervised.map(c => {
              const primaryTask = getPrimaryTask(c.task);
              return (
                <Link key={c.slug} href={`/ml/${c.slug}`} className="algo-card">
                  <div className="algo-card-preview-wrap">
                    <Thumb ai={c.ai} />
                  </div>

                  <div className="algo-card-badges">
                    <span className="card-badge-pill">{c.type.toUpperCase()}</span>
                    {primaryTask && primaryTask !== c.type.toUpperCase() && (
                      <span className="card-badge-pill">{primaryTask}</span>
                    )}
                  </div>

                  <h3 className="algo-card-name">{c.name}</h3>
                  <p className="algo-card-tagline">{c.tag}</p>

                  <div className="algo-card-action-bar">
                    <span className="algo-card-link-text">
                      <span className="link-arrow-ne">↗</span> Explore algorithm
                    </span>
                    <span className="algo-card-arrow-icon">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
