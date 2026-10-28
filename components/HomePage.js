'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { C } from '../lib/content';
import Thumb from './Thumb';
import NeuralNetworkVisual from './NeuralNetworkVisual';

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
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const allWithIndex = useMemo(() => C.map((c, i) => ({ ...c, ai: i })), []);

  const getPrimaryTask = task => {
    if (!task) return null;
    return task.split('/')[0].trim().toUpperCase();
  };

  // Filter based on selected category and search query
  const filteredCategories = useMemo(() => {
    return CATEGORIES.map(category => {
      if (selectedCategory !== 'ALL' && category.id !== selectedCategory) {
        return null;
      }

      let items = allWithIndex.filter(c => c.category === category.id);

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        items = items.filter(
          c =>
            c.name.toLowerCase().includes(q) ||
            c.tag.toLowerCase().includes(q) ||
            c.type.toLowerCase().includes(q) ||
            c.task.toLowerCase().includes(q)
        );
      }

      return items.length > 0 ? { ...category, items } : null;
    }).filter(Boolean);
  }, [allWithIndex, selectedCategory, searchQuery]);

  const totalVisibleCount = useMemo(() => {
    return filteredCategories.reduce((sum, cat) => sum + cat.items.length, 0);
  }, [filteredCategories]);

  return (
    <div className="home-layout-wrap">
      {/* 1. Page Introduction / Hero Area */}
      <section className="home-hero-section">
        <div className="home-hero-grid">
          {/* Left Column: Heading, Description */}
          <div className="home-hero-content">
            <h1 className="home-hero-heading">Machine Learning</h1>

            <p className="home-hero-desc">
              Explore core machine learning algorithms through interactive, client-side visualizations.
              Adjust hyperparameters, observe gradient trajectories step-by-step, and bridge the gap between
              mathematical rigor and visual intuition.
            </p>
          </div>

          {/* Right Column: Deep Neural Network Architecture & Inference Engine */}
          <div className="home-hero-visual">
            <NeuralNetworkVisual />
          </div>
        </div>
      </section>

      {/* 2. Interactive Category Filter Bar & Quick Search */}
      <section id="algorithms" className="catalog-control-bar">
        <div className="category-pills-scroll">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`category-filter-pill ${selectedCategory === 'ALL' ? 'active' : ''}`}
          >
            All Models <span className="pill-count">{allWithIndex.length}</span>
          </button>
          {CATEGORIES.map(cat => {
            const count = allWithIndex.filter(c => c.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`category-filter-pill ${selectedCategory === cat.id ? 'active' : ''}`}
              >
                {cat.title} <span className="pill-count">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="catalog-search-wrap">
          <div className="catalog-search-box">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.5" y2="16.5" />
            </svg>
            <input
              type="text"
              placeholder="Filter by name, task, or math concept..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="catalog-search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="catalog-clear-btn" aria-label="Clear filter">
                ×
              </button>
            )}
          </div>
          <span className="catalog-counter-text">
            Showing <b>{totalVisibleCount}</b> of {allWithIndex.length}
          </span>
        </div>
      </section>

      {/* 3. Algorithm Catalog & Content Hierarchy */}
      <section className="home-catalog-section">
        {filteredCategories.length === 0 ? (
          <div className="catalog-empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No algorithms matched &ldquo;{searchQuery}&rdquo;</h3>
            <p>Try clearing your search query or switching categories.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
              className="btn-reset-filters"
            >
              Reset filters
            </button>
          </div>
        ) : (
          filteredCategories.map(category => (
            <div key={category.id} className="algo-family-block">
              <div className="algo-family-header">
                <div className="algo-family-title-wrap">
                  <h2 className="algo-family-title">{category.title}</h2>
                  <p className="algo-family-desc">{category.desc}</p>
                </div>
                <div className="algo-family-hairline" />
                <span className="algo-family-count">[ {category.items.length} ALGORITHMS ]</span>
              </div>

              <div className="algo-cards-grid">
                {category.items.map(c => {
                  const primaryTask = getPrimaryTask(c.task);
                  return (
                    <Link key={c.slug} href={`/ml/${c.slug}`} className="algo-card">
                      <div className="algo-card-preview-wrap">
                        <Thumb ai={c.ai} />
                        <div className="algo-card-overlay-badge">
                          <span>INTERACTIVE</span>
                        </div>
                      </div>

                      <div className="algo-card-badges">
                        <span className="card-badge-pill">{c.type.toUpperCase()}</span>
                        {primaryTask && primaryTask !== c.type.toUpperCase() && (
                          <span className="card-badge-pill highlight">{primaryTask}</span>
                        )}
                      </div>

                      <h3 className="algo-card-name">{c.name}</h3>
                      <p className="algo-card-tagline">{c.tag}</p>

                      <div className="algo-card-action-bar">
                        <span className="algo-card-link-text">
                          <span className="link-arrow-ne">↗</span> Open interactive workspace
                        </span>
                        <span className="algo-card-arrow-icon">→</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
