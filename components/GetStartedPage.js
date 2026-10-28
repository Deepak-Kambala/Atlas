'use client';
import React from 'react';
import Link from 'next/link';
import SimpleHeroVisual from './SimpleHeroVisual';

export default function GetStartedPage() {
  return (
    <div className="home-container">
      {/* 1. Main Hero Split */}
      <main className="home-hero">
        <div className="home-hero-inner">
          {/* Left Column: Copy, CTA, Topics */}
          <div className="home-hero-copy">
            <h1 className="home-title">
              Understand the math.<br />
              <span className="hero-gradient-text">Explore the algorithms.</span>
            </h1>

            <p className="home-lead">
              A high-fidelity visual laboratory for machine learning and its mathematical foundations.
              Manipulate parameters in real time, step through algorithm state machines, and build true intuition
              behind loss surfaces and convergence.
            </p>

            <div className="home-action-row">
              <Link href="/ml" className="home-cta">
                <span>Get Started</span>
                <span className="cta-arrow">→</span>
              </Link>
              <a
                href="https://github.com/Deepak-Kambala/Atlas"
                target="_blank"
                rel="noopener noreferrer"
                className="home-secondary-btn"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>Star on GitHub</span>
              </a>
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
                <span>Probability &amp; Stats</span>
              </Link>
              <span className="topic-dot">·</span>

              <Link href="/ml" className="topic-item highlight">
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

          {/* Right Column: 3D Math Loss Surface Console */}
          <div className="home-hero-graphic">
            <SimpleHeroVisual />
          </div>
        </div>
      </main>

      {/* Core Pillars / Features Section */}
      <section className="home-features">
        <div className="home-features-inner">
          <div className="feature-col">
            <div className="feature-icon-circle">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="7 4 19 12 7 20 7 4" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="feature-text">
              <h3>See it in motion</h3>
              <p>Watch algorithms evolve, one computation at a time. Step through execution frames and inspect what happens inside weights and gradients at each stage.</p>
            </div>
          </div>

          <div className="feature-col">
            <div className="feature-icon-circle">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="8" x2="20" y2="8" />
                <circle cx="9" cy="8" r="2.5" fill="var(--cd)" />
                <line x1="4" y1="16" x2="20" y2="16" />
                <circle cx="15" cy="16" r="2.5" fill="var(--cd)" />
              </svg>
            </div>
            <div className="feature-text">
              <h3>Experiment, don&apos;t just observe</h3>
              <p>Modify learning rates, tweak regularization constants, change polynomial degrees, and observe instantaneous changes in bias, variance, and margins.</p>
            </div>
          </div>

          <div className="feature-col">
            <div className="feature-icon-circle">
              <span className="sigma-icon">Σ</span>
            </div>
            <div className="feature-text">
              <h3>From equations to intuition</h3>
              <p>Connect rigorous mathematical formulas with geometric shapes. Understand why normal equations, decision boundaries, and loss surfaces behave the way they do.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
