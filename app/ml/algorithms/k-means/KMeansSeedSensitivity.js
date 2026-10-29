'use client';

import React, { useState } from 'react';
import Tex from '../../../../components/Tex';

// Star path centered at (0, 0)
const Star = ({ x, y, color, size = 6.5, label, labelPosition = 'top' }) => {
  const points = [
    [0, -size],
    [size * 0.28, -size * 0.32],
    [size * 0.95, -size * 0.31],
    [size * 0.4, size * 0.12],
    [size * 0.61, size * 0.81],
    [0, size * 0.38],
    [-size * 0.61, size * 0.81],
    [-size * 0.4, size * 0.12],
    [-size * 0.95, -size * 0.31],
    [-size * 0.28, -size * 0.32]
  ]
    .map(([px, py]) => `${x + px},${y + py}`)
    .join(' ');

  return (
    <g className="kmeans-star-centroid">
      {/* Outer glow ring */}
      <circle cx={x} cy={y} r={size * 1.5} fill={color} opacity="0.18" />
      <polygon
        points={points}
        fill={color}
        stroke="#ffffff"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      {label && (
        <text
          x={x}
          y={labelPosition === 'top' ? y - size - 3 : y + size + 8}
          textAnchor="middle"
          fontSize="7.5"
          fontWeight="600"
          fill={color}
          style={{ letterSpacing: '0.02em' }}
        >
          {label}
        </text>
      )}
    </g>
  );
};

// Data points representing the two vertical columns of points
const LEFT_POINTS = [
  { x: 42, y: 30 },
  { x: 38, y: 44 },
  { x: 45, y: 58 },
  { x: 40, y: 74 },
  { x: 44, y: 88 },
  { x: 41, y: 102 }
];

const RIGHT_POINTS = [
  { x: 106, y: 30 },
  { x: 110, y: 44 },
  { x: 104, y: 58 },
  { x: 109, y: 74 },
  { x: 105, y: 88 },
  { x: 108, y: 102 }
];

const ALL_POINTS = [...LEFT_POINTS, ...RIGHT_POINTS];

// Sub-plot rendering a single coordinate frame
function ClusterPlot({
  title,
  subLabel,
  stage = 'seeds', // 'seeds' | 'iter1' | 'iter2'
  mode = 'init1', // 'init1' (bad/local min) | 'init2' (good/global)
  width = 150,
  height = 140
}) {
  const cyanColor = '#38bdf8';
  const purpleColor = '#c084fc';

  // Centroid coordinates per stage & mode
  let cyanPos = { x: 42, y: 44 };
  let purplePos = { x: 42, y: 92 };

  if (mode === 'init1') {
    // Both seeds in left cluster
    if (stage === 'seeds') {
      cyanPos = { x: 42, y: 44 };
      purplePos = { x: 42, y: 92 };
    } else if (stage === 'iter1') {
      cyanPos = { x: 42, y: 44 };
      purplePos = { x: 42, y: 92 };
    } else if (stage === 'iter2') {
      // Centroids migrate to center of upper and lower horizontal partitions
      cyanPos = { x: 74, y: 44 };
      purplePos = { x: 74, y: 88 };
    }
  } else {
    // One seed in each cluster
    if (stage === 'seeds') {
      purplePos = { x: 42, y: 64 };
      cyanPos = { x: 106, y: 54 };
    } else if (stage === 'iter1') {
      purplePos = { x: 42, y: 64 };
      cyanPos = { x: 106, y: 54 };
    } else if (stage === 'iter2') {
      purplePos = { x: 42, y: 66 };
      cyanPos = { x: 107, y: 66 };
    }
  }

  return (
    <div className="kmeans-subplot-card">
      <div className="kmeans-subplot-header">
        <span className="kmeans-subplot-title">{title}</span>
        {subLabel && <span className="kmeans-subplot-sub">{subLabel}</span>}
      </div>

      <svg
        viewBox="0 0 148 136"
        className="kmeans-mini-svg"
        aria-label={`${title} - ${subLabel || ''}`}
      >
        <defs>
          <marker
            id="km-axis-arr"
            viewBox="0 0 6 6"
            refX="5"
            refY="3"
            markerWidth="4"
            markerHeight="4"
            orient="auto"
          >
            <path d="M 0 1 L 5 3 L 0 5 z" fill="rgba(255, 255, 255, 0.5)" />
          </marker>
        </defs>

        {/* Coordinate Axes */}
        <line
          x1="18"
          y1="120"
          x2="140"
          y2="120"
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth="1.2"
          markerEnd="url(#km-axis-arr)"
        />
        <line
          x1="18"
          y1="120"
          x2="18"
          y2="14"
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth="1.2"
          markerEnd="url(#km-axis-arr)"
        />

        {/* Cluster assignment envelopes for Iteration 1 and 2 */}
        {stage !== 'seeds' && mode === 'init1' && (
          <g className="kmeans-envelopes-horizontal">
            {/* Top horizontal cluster (cyan) */}
            <rect
              x="26"
              y="20"
              width="96"
              height="48"
              rx="18"
              fill={cyanColor}
              fillOpacity="0.10"
              stroke={cyanColor}
              strokeWidth="1.2"
              strokeDasharray={stage === 'iter1' ? '4 3' : 'none'}
            />
            {/* Bottom horizontal cluster (purple) */}
            <rect
              x="26"
              y="66"
              width="96"
              height="48"
              rx="18"
              fill={purpleColor}
              fillOpacity="0.10"
              stroke={purpleColor}
              strokeWidth="1.2"
              strokeDasharray={stage === 'iter1' ? '4 3' : 'none'}
            />
          </g>
        )}

        {stage !== 'seeds' && mode === 'init2' && (
          <g className="kmeans-envelopes-vertical">
            {/* Left vertical cluster (purple) */}
            <rect
              x="28"
              y="18"
              width="28"
              height="96"
              rx="14"
              fill={purpleColor}
              fillOpacity="0.10"
              stroke={purpleColor}
              strokeWidth="1.2"
              strokeDasharray={stage === 'iter1' ? '4 3' : 'none'}
            />
            {/* Right vertical cluster (cyan) */}
            <rect
              x="93"
              y="18"
              width="28"
              height="96"
              rx="14"
              fill={cyanColor}
              fillOpacity="0.10"
              stroke={cyanColor}
              strokeWidth="1.2"
              strokeDasharray={stage === 'iter1' ? '4 3' : 'none'}
            />
          </g>
        )}

        {/* Data points */}
        {ALL_POINTS.map((pt, pIdx) => {
          let pointFill = 'var(--tx)';
          let pointStroke = 'var(--bg)';

          if (stage !== 'seeds') {
            if (mode === 'init1') {
              // Top 3 of left & right are cyan, bottom 3 are purple
              const isTop = pt.y <= 60;
              pointFill = isTop ? cyanColor : purpleColor;
            } else {
              // Left cluster is purple, right is cyan
              const isLeft = pt.x <= 70;
              pointFill = isLeft ? purpleColor : cyanColor;
            }
          }

          return (
            <circle
              key={pIdx}
              cx={pt.x}
              cy={pt.y}
              r="2.8"
              fill={pointFill}
              stroke={pointStroke}
              strokeWidth="1"
              opacity="0.95"
            />
          );
        })}

        {/* Centroid Stars */}
        <Star
          x={cyanPos.x}
          y={cyanPos.y}
          color={cyanColor}
          size={5.5}
        />
        <Star
          x={purplePos.x}
          y={purplePos.y}
          color={purpleColor}
          size={5.5}
        />
      </svg>
    </div>
  );
}

export default function KMeansSeedSensitivity() {
  const [activeView, setActiveView] = useState('compare'); // 'compare' | 'init1' | 'init2'
  const [stage, setStage] = useState('all'); // 'all' | 'seeds' | 'iter1' | 'iter2'
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="kmeans-sensitivity-container">
      {/* Control Tabs */}
      <div className="kmeans-control-bar">
        <div className="kmeans-unified-bar">
          <button
            type="button"
            className={`kmeans-tab-btn ${activeView === 'compare' ? 'active' : ''}`}
            onClick={() => setActiveView('compare')}
          >
            Compare
          </button>
          <button
            type="button"
            className={`kmeans-tab-btn ${activeView === 'init1' ? 'active' : ''}`}
            onClick={() => setActiveView('init1')}
            title="View (A) Bad seeds / Local min"
          >
            (A)
          </button>
          <button
            type="button"
            className={`kmeans-tab-btn ${activeView === 'init2' ? 'active' : ''}`}
            onClick={() => setActiveView('init2')}
            title="View (B) Good seeds / Global min"
          >
            (B)
          </button>
          <span className="kmeans-bar-divider" />
          <button
            type="button"
            className="kmeans-tab-btn kmeans-enlarge-tab-btn"
            onClick={() => setIsModalOpen(true)}
            title="Open enlarged view"
          >
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
            Enlarge
          </button>
        </div>
      </div>

      {/* Embedded Diagrams View */}
      <div className="kmeans-diagrams-grid">
        {/* INITIALIZATION 1: Suboptimal / Local Minimum */}
        {(activeView === 'compare' || activeView === 'init1') && (
          <div className="kmeans-case-column init1-case">
            <div className="kmeans-case-header">
              <span className="kmeans-case-tag local-tag">Bad Seeds (Local Min)</span>
              <span className="kmeans-case-sub">Both seeds placed in Left Cluster</span>
            </div>

            <div className="kmeans-case-stages">
              <ClusterPlot
                title="Seeds (Centroids)"
                subLabel="Both in left group"
                stage="seeds"
                mode="init1"
              />
              <div className="kmeans-stage-divider">↓</div>
              <div className="kmeans-iter-row">
                <ClusterPlot
                  title="Iteration 1"
                  subLabel="Horizontal"
                  stage="iter1"
                  mode="init1"
                />
                <ClusterPlot
                  title="Iteration 2"
                  subLabel="Converged"
                  stage="iter2"
                  mode="init1"
                />
              </div>
            </div>

            <div className="kmeans-final-result bad-result">
              <span className="kmeans-result-title">✕ Suboptimal Minimum:</span>
              <span className="kmeans-result-desc">
                Trapped in poor local minimum (splits horizontal bands instead of natural vertical groups).
              </span>
            </div>
          </div>
        )}

        {/* INITIALIZATION 2: Optimal / Global Minimum */}
        {(activeView === 'compare' || activeView === 'init2') && (
          <div className="kmeans-case-column init2-case">
            <div className="kmeans-case-header">
              <span className="kmeans-case-tag optimal-tag">Good Seeds (Global Min)</span>
              <span className="kmeans-case-sub">One seed in each natural cluster</span>
            </div>

            <div className="kmeans-case-stages">
              <ClusterPlot
                title="Seeds (Centroids)"
                subLabel="One per cluster"
                stage="seeds"
                mode="init2"
              />
              <div className="kmeans-stage-divider">↓</div>
              <div className="kmeans-iter-row">
                <ClusterPlot
                  title="Iteration 1"
                  subLabel="Vertical"
                  stage="iter1"
                  mode="init2"
                />
                <ClusterPlot
                  title="Iteration 2"
                  subLabel="Converged"
                  stage="iter2"
                  mode="init2"
                />
              </div>
            </div>

            <div className="kmeans-final-result good-result">
              <span className="kmeans-result-title">✓ Global Optimum:</span>
              <span className="kmeans-result-desc">
                Achieves true global optimum (cleanly recovers natural vertical clusters).
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Solution / Takeaway footer */}
      <div className="kmeans-takeaway-footer">
        <span className="kmeans-takeaway-label">Practical Remedy:</span> Use{' '}
        <code>init=&quot;k-means++&quot;</code> (spreads seeds far apart) and run multiple random restarts (<code>n_init=10</code>).
      </div>

      {/* Full-view Modal Dialog */}
      {isModalOpen && (
        <div className="kmeans-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div
            className="kmeans-modal-dialog"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="kmeans-modal-header">
              <div className="kmeans-modal-title-group">
                <h3 className="kmeans-modal-title">Sensitivity to Initial Seeds in K-Means</h3>
                <p className="kmeans-modal-subtitle">
                  Visual proof of how non-convex inertia can cause convergence to poor local minima
                </p>
              </div>
              <button
                type="button"
                className="kmeans-modal-close"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <div className="kmeans-modal-body">
              {/* Whiteboard Layout: Two Columns + Right Explanatory Column */}
              <div className="kmeans-whiteboard-grid">
                {/* Column 1: Initialization 1 */}
                <div className="kmeans-wb-column">
                  <div className="kmeans-wb-col-title">Initialization 1 (Bad Seeds)</div>
                  <div className="kmeans-wb-plot-box">
                    <div className="kmeans-wb-plot-caption">Random selection of seeds (centroids)</div>
                    <ClusterPlot stage="seeds" mode="init1" />
                  </div>

                  <div className="kmeans-wb-iter-pair">
                    <div className="kmeans-wb-plot-box">
                      <div className="kmeans-wb-plot-caption">Iteration 1</div>
                      <ClusterPlot stage="iter1" mode="init1" />
                    </div>
                    <div className="kmeans-wb-plot-box">
                      <div className="kmeans-wb-plot-caption">Iteration 2</div>
                      <ClusterPlot stage="iter2" mode="init1" />
                    </div>
                  </div>

                  <div className="kmeans-wb-result-arrow">
                    <span className="arrow-sym">↓</span>
                    <span className="arrow-text">final answer for initialization 1 (Local Minimum)</span>
                  </div>
                </div>

                {/* Column 2: Initialization 2 */}
                <div className="kmeans-wb-column">
                  <div className="kmeans-wb-col-title">Initialization 2 (Good Seeds)</div>
                  <div className="kmeans-wb-plot-box">
                    <div className="kmeans-wb-plot-caption">Random selection of seeds (centroids)</div>
                    <ClusterPlot stage="seeds" mode="init2" />
                  </div>

                  <div className="kmeans-wb-iter-pair">
                    <div className="kmeans-wb-plot-box">
                      <div className="kmeans-wb-plot-caption">Iteration 1</div>
                      <ClusterPlot stage="iter1" mode="init2" />
                    </div>
                    <div className="kmeans-wb-plot-box">
                      <div className="kmeans-wb-plot-caption">Iteration 2</div>
                      <ClusterPlot stage="iter2" mode="init2" />
                    </div>
                  </div>

                  <div className="kmeans-wb-result-arrow good-arrow">
                    <span className="arrow-sym">↓</span>
                    <span className="arrow-text">final answer for initialization 2 (Global Optimum)</span>
                  </div>
                </div>

                {/* Right Column: Mathematical Note matching the original drawing */}
                <div className="kmeans-wb-note-column">
                  <div className="kmeans-chalk-note">
                    <div className="chalk-highlight">
                      K-means loss function is <u>not</u> convex, hence may get stuck to local minima.
                    </div>
                    <div className="chalk-math">
                      <Tex f="J = \sum_{k=1}^{K}\sum_{\mathbf{x} \in C_k} \|\mathbf{x} - \boldsymbol{\mu}_k\|^2" />
                    </div>
                    <div className="chalk-bullets">
                      <div className="chalk-bullet-item">
                        <b>Inertia Objective:</b> Sum of squared Euclidean distances to assigned centroids.
                      </div>
                      <div className="chalk-bullet-item">
                        <b>Voronoi Partitions:</b> When initial seeds are adjacent, initial boundaries bisect the space orthogonally to the cluster separation.
                      </div>
                      <div className="chalk-bullet-item">
                        <b>k-means++ remedy:</b> Probabilistically samples next seeds proportional to squared distance $D(x)^2$ from closest existing centroid.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

