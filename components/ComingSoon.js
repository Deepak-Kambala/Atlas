'use client';
import React from 'react';
import Link from 'next/link';

export default function ComingSoon({ title, blurb, topics = [] }) {
  return (
    <div className="roadmap-container">
      <div className="roadmap-hero">
        <div className="roadmap-badge">
          <span className="live-status-dot" />
          <span>IN ACTIVE DEVELOPMENT · ROADMAP 2026</span>
        </div>
        <h1 className="roadmap-title">{title}</h1>
        <p className="roadmap-lead">{blurb}</p>

        <div className="roadmap-actions">
          <Link href="/ml" className="btn-roadmap-primary">
            <span>Explore 17 Live ML Models</span>
            <span>→</span>
          </Link>
          <a
            href="https://github.com/Deepak-Kambala/Atlas"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-roadmap-secondary"
          >
            <span>Follow development on GitHub</span>
            <span>↗</span>
          </a>
        </div>
      </div>

      <div className="roadmap-topics-card">
        <div className="roadmap-topics-header">
          <div className="topics-header-left">
            <span className="roadmap-icon">📐</span>
            <div>
              <h2 className="topics-header-title">Planned Interactive Curriculum</h2>
              <p className="topics-header-desc">
                Upcoming visual simulators currently being engineered for this subject area.
              </p>
            </div>
          </div>
          <span className="roadmap-phase-tag">[ PHASE 2 ]</span>
        </div>

        <div className="roadmap-grid">
          {topics.map((t, idx) => (
            <div key={t} className="roadmap-item-card">
              <div className="roadmap-item-num">0{idx + 1}</div>
              <div className="roadmap-item-info">
                <h3 className="roadmap-item-title">{t}</h3>
                <div className="roadmap-item-meta">
                  <span className="roadmap-item-status">
                    <span className="status-dot-pulse" />
                    Interactive Simulator In Progress
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
