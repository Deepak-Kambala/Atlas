'use client';
import React from 'react';
import Link from 'next/link';
import { C } from '../lib/content';
import Thumb from './Thumb';
import GitBranchVisual from './GitBranchVisual';

const CATEGORIES = [
  {
    id: 'Regression',
    title: 'Regression',
    desc: 'Predict continuous targets by fitting linear models, regularized loss functions, and polynomial curves.'
  },
  {
    id: 'Classification',
    title: 'Classification',
    desc: 'Separate data into discrete classes using probabilistic models, margins, partitions, and discriminant axes.'
  },
  {
    id: 'Neural Networks',
    title: 'Neural Networks',
    desc: 'Feed-forward multi-layer perceptrons learning non-linear representations via backpropagation.'
  },
  {
    id: 'Model Evaluation',
    title: 'Model Evaluation',
    desc: 'Assess generalization error and avoid leakage through cross-validation and resampling.'
  },
  {
    id: 'Clustering',
    title: 'Clustering',
    desc: 'Discover latent groupings, centroids, exemplars, and hierarchical structures in unlabeled data.'
  },
  {
    id: 'Dimensionality Reduction',
    title: 'Dimensionality Reduction',
    desc: 'Compress high-dimensional spaces to extract principal components and visualize variance.'
  }
];

export default function HomePage() {
  const allWithIndex = C.map((c, i) => ({ ...c, ai: i }));

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
              Adjust parameters, see how models learn step-by-step, and understand the mathematics behind the scenes.
            </p>
            <div className="home-hero-actions">
              <a href="#algorithms" className="btn-start-exploring">
                Start exploring →
              </a>
            </div>
          </div>

          {/* Right Column: Clean Git Branching & Merging Visualization */}
          <div className="home-hero-visual">
            <GitBranchVisual />
          </div>
        </div>
      </section>

      {/* 2. Algorithm Catalog & Content Hierarchy (6 Structured Categories) */}
      <section id="algorithms" className="home-catalog-section">
        {CATEGORIES.map(category => {
          const items = allWithIndex.filter(c => c.category === category.id);
          if (items.length === 0) return null;

          return (
            <div key={category.id} className="algo-family-block">
              <div className="algo-family-header">
                <div className="algo-family-title-wrap">
                  <h2 className="algo-family-title">{category.title}</h2>
                  <p className="algo-family-desc">{category.desc}</p>
                </div>
                <div className="algo-family-hairline" />
                <span className="algo-family-count">{items.length} ALGORITHMS</span>
              </div>

              <div className="algo-cards-grid">
                {items.map(c => {
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
          );
        })}
      </section>
    </div>
  );
}
