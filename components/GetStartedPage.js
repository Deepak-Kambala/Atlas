'use client';
import React from 'react';
import Link from 'next/link';
import SimpleHeroVisual from './SimpleHeroVisual';

export default function GetStartedPage() {
  return (
    <div className="home-container">
      {/* Main Hero Split */}
      <main className="home-hero">
        <div className="home-hero-inner">
          {/* Left Column: Copy, CTA, Topics */}
          <div className="home-hero-copy">
            <div className="home-eyebrow">
              <span className="eyebrow-dash">—</span> ATLAS · INTERACTIVE ALGORITHM EXPLORATION
            </div>
            <h1 className="home-title">
              Understand the math.<br />
              Explore the algorithms.
            </h1>
            <p className="home-lead">
              An interactive playground for exploring machine learning and the mathematics behind it.
              Experiment with algorithms, inspect their inner workings, and see how changing the inputs changes the results.
            </p>

            <div className="home-action">
              <Link href="/ml" className="home-cta">
                Get started →
              </Link>
            </div>

            {/* Horizontal Topics Ribbon */}
            <div className="home-topics">
              <Link href="/linear-algebra" className="topic-item">
                <svg viewBox="0 0 24 24" className="topic-icon" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                </svg>
                <span>Linear Algebra</span>
              </Link>
              <span className="topic-dot">·</span>

              <Link href="/calculus-optimization" className="topic-item">
                <svg viewBox="0 0 24 24" className="topic-icon" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 18c4-2 7-12 11-12s5 12 7 12" />
                </svg>
                <span>Calculus &amp; Optimization</span>
              </Link>
              <span className="topic-dot">·</span>

              <Link href="/probability-statistics" className="topic-item">
                <svg viewBox="0 0 24 24" className="topic-icon" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 20h16M7 16v-4M12 16V8M17 16v-6" strokeLinecap="round" />
                </svg>
                <span>Probability &amp; Statistics</span>
              </Link>
              <span className="topic-dot">·</span>

              <Link href="/ml" className="topic-item">
                <svg viewBox="0 0 24 24" className="topic-icon" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="5" cy="6" r="2.5" />
                  <circle cx="5" cy="18" r="2.5" />
                  <circle cx="19" cy="12" r="2.5" />
                  <path d="M7.5 7.2l9 3.6M7.5 16.8l9-3.6" />
                </svg>
                <span>Machine Learning</span>
              </Link>
            </div>
          </div>

          {/* Right Column: 3D Math Loss Surface Graphic */}
          <div className="home-hero-graphic">
            <SimpleHeroVisual />
          </div>
        </div>
      </main>

      {/* Bottom Features Section (3 columns with dividers) */}
      <section className="home-features">
        <div className="home-features-inner">
          <div className="feature-col">
            <div className="feature-icon-circle">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="7 4 19 12 7 20 7 4" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="feature-text">
              <h3>See it in motion</h3>
              <p>Watch algorithms evolve, one computation at a time. Step through their execution and inspect what happens at each stage.</p>
            </div>
          </div>

          <div className="feature-col">
            <div className="feature-icon-circle">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="8" x2="20" y2="8" />
                <circle cx="9" cy="8" r="2.5" fill="var(--cd)" />
                <line x1="4" y1="16" x2="20" y2="16" />
                <circle cx="15" cy="16" r="2.5" fill="var(--cd)" />
              </svg>
            </div>
            <div className="feature-text">
              <h3>Experiment, don&apos;t just observe</h3>
              <p>Change parameters, manipulate inputs, and explore how they shape the outcome.</p>
            </div>
          </div>

          <div className="feature-col">
            <div className="feature-icon-circle">
              <span className="sigma-icon">Σ</span>
            </div>
            <div className="feature-text">
              <h3>From equations to intuition</h3>
              <p>Connect mathematical foundations with visual results and understand why algorithms behave the way they do.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
