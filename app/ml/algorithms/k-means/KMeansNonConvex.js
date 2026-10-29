'use client';

import React, { useState } from 'react';
import Tex from '../../../../components/Tex';

// Star path centered at (x, y)
const Star = ({ x, y, color = '#38bdf8', size = 5.5 }) => {
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
    <g>
      <circle cx={x} cy={y} r={size * 1.6} fill={color} opacity="0.22" />
      <polygon points={points} fill={color} stroke="#ffffff" strokeWidth="0.8" strokeLinejoin="round" />
    </g>
  );
};

// Exact data points plotted from original lecture diagram
// 1. Inner Cluster (Crescent / Hook manifold - 44 points)
const INNER_CLUSTER_POINTS = [
  { x: 90.6, y: 46.9 },
  { x: 75.5, y: 51.3 },
  { x: 96.4, y: 52.9 },
  { x: 90.0, y: 52.6 },
  { x: 86.7, y: 56.3 },
  { x: 101.6, y: 56.4 },
  { x: 72.5, y: 60.5 },
  { x: 78.5, y: 60.7 },
  { x: 86.4, y: 62.4 },
  { x: 80.6, y: 67.2 },
  { x: 110.8, y: 63.8 },
  { x: 74.1, y: 68.4 },
  { x: 94.8, y: 69.3 },
  { x: 85.1, y: 71.8 },
  { x: 117.6, y: 73.1 },
  { x: 104.2, y: 74.3 },
  { x: 63.1, y: 75.3 },
  { x: 75.4, y: 75.3 },
  { x: 116.8, y: 81.5 },
  { x: 60.6, y: 84.8 },
  { x: 81.2, y: 87.3 },
  { x: 87.1, y: 87.3 },
  { x: 70.0, y: 92.6 },
  { x: 73.3, y: 97.8 },
  { x: 78.5, y: 99.4 },
  { x: 86.1, y: 98.4 },
  { x: 68.5, y: 100.3 },
  { x: 82.4, y: 106.3 },
  { x: 84.0, y: 116.0 },
  { x: 74.2, y: 116.3 },
  { x: 93.2, y: 117.0 },
  { x: 82.9, y: 122.9 },
  { x: 74.2, y: 122.4 },
  { x: 89.4, y: 125.5 },
  { x: 101.7, y: 126.7 },
  { x: 78.5, y: 128.9 },
  { x: 72.5, y: 130.3 },
  { x: 85.4, y: 129.2 },
  { x: 87.5, y: 130.0 },
  { x: 83.7, y: 133.6 },
  { x: 93.6, y: 133.6 },
  { x: 103.3, y: 137.1 },
  { x: 88.3, y: 137.2 },
  { x: 87.9, y: 142.4 }
];

// 2. Outer Cluster (Enclosing Manifold - 70 points)
const OUTER_CLUSTER_POINTS = [
  { x: 116.6, y: 27.7 },
  { x: 140.0, y: 30.6 },
  { x: 120.8, y: 33.5 },
  { x: 129.1, y: 32.8 },
  { x: 137.5, y: 41.0 },
  { x: 150.9, y: 40.9 },
  { x: 162.2, y: 40.9 },
  { x: 119.4, y: 42.0 },
  { x: 130.7, y: 45.3 },
  { x: 145.1, y: 48.9 },
  { x: 163.2, y: 47.8 },
  { x: 137.4, y: 52.6 },
  { x: 149.9, y: 55.1 },
  { x: 164.9, y: 56.8 },
  { x: 144.2, y: 64.9 },
  { x: 164.6, y: 66.0 },
  { x: 152.1, y: 68.4 },
  { x: 142.5, y: 76.4 },
  { x: 159.4, y: 78.0 },
  { x: 147.2, y: 80.6 },
  { x: 152.5, y: 82.7 },
  { x: 144.3, y: 84.8 },
  { x: 159.6, y: 93.7 },
  { x: 145.5, y: 96.0 },
  { x: 144.7, y: 100.5 },
  { x: 140.0, y: 102.8 },
  { x: 158.0, y: 105.3 },
  { x: 148.1, y: 108.3 },
  { x: 141.2, y: 119.8 },
  { x: 153.9, y: 121.9 },
  { x: 160.7, y: 123.4 },
  { x: 49.4, y: 126.7 },
  { x: 37.1, y: 127.8 },
  { x: 149.6, y: 128.9 },
  { x: 138.8, y: 131.4 },
  { x: 49.3, y: 134.7 },
  { x: 156.5, y: 137.7 },
  { x: 40.8, y: 138.3 },
  { x: 133.3, y: 138.3 },
  { x: 144.2, y: 139.7 },
  { x: 53.6, y: 141.1 },
  { x: 42.5, y: 144.9 },
  { x: 56.4, y: 150.5 },
  { x: 132.1, y: 149.8 },
  { x: 144.2, y: 149.9 },
  { x: 153.9, y: 151.6 },
  { x: 65.7, y: 153.1 },
  { x: 125.1, y: 152.9 },
  { x: 44.2, y: 154.2 },
  { x: 57.9, y: 157.8 },
  { x: 63.3, y: 158.9 },
  { x: 46.8, y: 159.5 },
  { x: 128.3, y: 160.0 },
  { x: 148.0, y: 162.4 },
  { x: 61.9, y: 165.0 },
  { x: 75.4, y: 163.6 },
  { x: 112.5, y: 164.7 },
  { x: 97.3, y: 165.8 },
  { x: 137.5, y: 167.9 },
  { x: 82.5, y: 169.5 },
  { x: 53.7, y: 170.9 },
  { x: 94.2, y: 170.5 },
  { x: 130.7, y: 172.0 },
  { x: 120.8, y: 173.1 },
  { x: 71.3, y: 174.4 },
  { x: 90.5, y: 174.3 },
  { x: 64.8, y: 176.8 },
  { x: 105.8, y: 177.0 },
  { x: 78.3, y: 181.7 },
  { x: 94.8, y: 181.7 }
];

const ALL_POINTS = [
  ...INNER_CLUSTER_POINTS.map(p => ({ ...p, naturalCluster: 1 })),
  ...OUTER_CLUSTER_POINTS.map(p => ({ ...p, naturalCluster: 2 }))
];

// K-Means centroids and horizontal partition line
const STAR_TOP = { x: 122.4, y: 73.3 };
const STAR_BOTTOM = { x: 101.8, y: 149.1 };
const KMEANS_DIVIDER_Y = 118.5;

export default function KMeansNonConvex() {
  const [activeTab, setActiveTab] = useState('compare'); // 'compare' | 'natural' | 'kmeans'
  const [isModalOpen, setIsModalOpen] = useState(false);

  const renderPoint = (p, idx, isKmeansView) => {
    let fill = '#38bdf8';
    let stroke = 'rgba(255, 255, 255, 0.4)';

    if (isKmeansView) {
      // Partitioned by K-Means top vs bottom
      const isTop = p.y <= KMEANS_DIVIDER_Y;
      fill = isTop ? '#38bdf8' : '#c084fc';
    } else {
      // Natural ground truth clusters
      fill = p.naturalCluster === 1 ? '#38bdf8' : '#c084fc';
    }

    return (
      <circle
        key={`pt-${idx}`}
        cx={p.x}
        cy={p.y}
        r="2.2"
        fill={fill}
        stroke={stroke}
        strokeWidth="0.8"
      />
    );
  };

  return (
    <div className="kmeans-sensitivity-container">
      {/* Controls */}
      <div className="kmeans-control-bar">
        <div className="kmeans-unified-bar">
          <button
            type="button"
            className={`kmeans-tab-btn ${activeTab === 'compare' ? 'active' : ''}`}
            onClick={() => setActiveTab('compare')}
          >
            Compare
          </button>
          <button
            type="button"
            className={`kmeans-tab-btn ${activeTab === 'natural' ? 'active' : ''}`}
            onClick={() => setActiveTab('natural')}
            title="View (A) Natural clusters"
          >
            (A)
          </button>
          <button
            type="button"
            className={`kmeans-tab-btn ${activeTab === 'kmeans' ? 'active' : ''}`}
            onClick={() => setActiveTab('kmeans')}
            title="View (B) K-Means clusters"
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

      {/* Diagrams Grid */}
      <div className="kmeans-diagrams-grid">
        {/* DIAGRAM A: Two Natural Clusters */}
        {(activeTab === 'compare' || activeTab === 'natural') && (
          <div className="kmeans-case-column init2-case">
            <div className="kmeans-case-header">
              <span className="kmeans-case-tag optimal-tag">(A): Two natural clusters</span>
              <span className="kmeans-case-sub">Non-convex interlocking shapes</span>
            </div>

            <div className="kmeans-subplot-card">
              <svg viewBox="0 0 195 210" className="kmeans-wide-svg" aria-label="Two natural non-convex clusters">
                <defs>
                  <marker id="arr-axis-a" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto">
                    <path d="M 0 1 L 5 3 L 0 5 z" fill="rgba(255, 255, 255, 0.5)" />
                  </marker>
                </defs>

                {/* Coordinate Axes */}
                <line x1="15" y1="198" x2="190" y2="198" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.2" markerEnd="url(#arr-axis-a)" />
                <line x1="15" y1="198" x2="15" y2="10" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.2" markerEnd="url(#arr-axis-a)" />

                {/* Natural Data Points (114 points) */}
                {ALL_POINTS.map((p, idx) => renderPoint(p, idx, false))}
              </svg>
            </div>

            <div className="kmeans-final-result good-result">
              <span className="kmeans-result-title">Ground Truth Structure:</span>
              <span className="kmeans-result-desc">
                An inner hook cluster (44 points) surrounded by an interlocking outer manifold (70 points).
              </span>
            </div>
          </div>
        )}

        {/* DIAGRAM B: K-Means Failure */}
        {(activeTab === 'compare' || activeTab === 'kmeans') && (
          <div className="kmeans-case-column init1-case">
            <div className="kmeans-case-header">
              <span className="kmeans-case-tag local-tag">(B): k-means clusters</span>
              <span className="kmeans-case-sub">Sliced horizontally by Voronoi line</span>
            </div>

            <div className="kmeans-subplot-card">
              <svg viewBox="0 0 195 210" className="kmeans-wide-svg" aria-label="K-means linear split failure">
                <defs>
                  <marker id="arr-axis-b" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto">
                    <path d="M 0 1 L 5 3 L 0 5 z" fill="rgba(255, 255, 255, 0.5)" />
                  </marker>
                </defs>

                {/* Coordinate Axes */}
                <line x1="15" y1="198" x2="190" y2="198" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.2" markerEnd="url(#arr-axis-b)" />
                <line x1="15" y1="198" x2="15" y2="10" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.2" markerEnd="url(#arr-axis-b)" />

                {/* Top Cluster Capsule (Balloon shape matching the original drawing) */}
                <path
                  d="M 54 116 C 50 78, 62 38, 102 20 C 145 16, 178 35, 175 75 C 174 100, 168 116, 150 116 Z"
                  fill="rgba(56, 189, 248, 0.08)"
                  stroke="#ffffff"
                  strokeWidth="1.3"
                />

                {/* Bottom Cluster Capsule (Bowl shape matching the original drawing) */}
                <path
                  d="M 28 122 L 175 122 C 176 150, 160 188, 120 194 C 76 195, 26 182, 28 122 Z"
                  fill="rgba(192, 132, 252, 0.08)"
                  stroke="#ffffff"
                  strokeWidth="1.3"
                />

                {/* Linear Voronoi Divider Line */}
                <line
                  x1="24"
                  y1={KMEANS_DIVIDER_Y}
                  x2="182"
                  y2={KMEANS_DIVIDER_Y}
                  stroke="#ffffff"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />

                {/* Data Points partitioned by Top vs Bottom */}
                {ALL_POINTS.map((p, idx) => renderPoint(p, idx, true))}

                {/* Centroids: Cyan Stars */}
                <Star x={STAR_TOP.x} y={STAR_TOP.y} color="#38bdf8" size={6} />
                <Star x={STAR_BOTTOM.x} y={STAR_BOTTOM.y} color="#38bdf8" size={6} />
              </svg>
            </div>

            <div className="kmeans-final-result bad-result">
              <span className="kmeans-result-title">✕ Structural Failure:</span>
              <span className="kmeans-result-desc">
                Linear hyperplane cuts across both manifolds. The top halves are merged into one cluster, and the bottom halves into another.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Solution / Takeaway footer */}
      <div className="kmeans-takeaway-footer">
        <span className="kmeans-takeaway-label">Recommended Alternative:</span> Use <strong>DBSCAN</strong> (density-connected paths) or <strong>Spectral Clustering</strong> (graph laplacian embeddings) to discover arbitrary non-convex geometries.
      </div>

      {/* Modal Dialog for Full Whiteboard View */}
      {isModalOpen && (
        <div className="kmeans-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="kmeans-modal-dialog" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="kmeans-modal-header">
              <div className="kmeans-modal-title-group">
                <h3 className="kmeans-modal-title">Non-Hyper-Ellipsoidal Clusters in K-Means</h3>
                <p className="kmeans-modal-subtitle">
                  High-fidelity plot of interlocking non-convex manifolds vs linear Voronoi tessellation
                </p>
              </div>
              <button type="button" className="kmeans-modal-close" onClick={() => setIsModalOpen(false)} aria-label="Close dialog">
                ✕
              </button>
            </div>

            <div className="kmeans-modal-body">
              <div className="kmeans-whiteboard-grid">
                {/* Column A */}
                <div className="kmeans-wb-column">
                  <div className="kmeans-wb-col-title">(A): Two natural clusters</div>
                  <div className="kmeans-wb-plot-box">
                    <div className="kmeans-wb-plot-caption">114 points across two curved manifolds</div>
                    <svg viewBox="0 0 195 210" className="kmeans-wide-svg">
                      <line x1="15" y1="198" x2="190" y2="198" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.2" />
                      <line x1="15" y1="198" x2="15" y2="10" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.2" />
                      {ALL_POINTS.map((p, idx) => renderPoint(p, idx, false))}
                    </svg>
                  </div>
                  <div className="kmeans-wb-result-arrow good-arrow">
                    <span className="arrow-text">Points are connected along density curves, not Euclidean spheres</span>
                  </div>
                </div>

                {/* Column B */}
                <div className="kmeans-wb-column">
                  <div className="kmeans-wb-col-title">(B): k-means clusters</div>
                  <div className="kmeans-wb-plot-box">
                    <div className="kmeans-wb-plot-caption">Linear boundary &amp; balloon / bowl capsules</div>
                    <svg viewBox="0 0 195 210" className="kmeans-wide-svg">
                      <line x1="15" y1="198" x2="190" y2="198" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.2" />
                      <line x1="15" y1="198" x2="15" y2="10" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.2" />
                      <path
                        d="M 54 116 C 50 78, 62 38, 102 20 C 145 16, 178 35, 175 75 C 174 100, 168 116, 150 116 Z"
                        fill="rgba(56, 189, 248, 0.08)"
                        stroke="#ffffff"
                        strokeWidth="1.3"
                      />
                      <path
                        d="M 28 122 L 175 122 C 176 150, 160 188, 120 194 C 76 195, 26 182, 28 122 Z"
                        fill="rgba(192, 132, 252, 0.08)"
                        stroke="#ffffff"
                        strokeWidth="1.3"
                      />
                      <line
                        x1="24"
                        y1={KMEANS_DIVIDER_Y}
                        x2="182"
                        y2={KMEANS_DIVIDER_Y}
                        stroke="#ffffff"
                        strokeWidth="1.2"
                        strokeDasharray="3 3"
                      />
                      {ALL_POINTS.map((p, idx) => renderPoint(p, idx, true))}
                      <Star x={STAR_TOP.x} y={STAR_TOP.y} color="#38bdf8" size={6} />
                      <Star x={STAR_BOTTOM.x} y={STAR_BOTTOM.y} color="#38bdf8" size={6} />
                    </svg>
                  </div>
                  <div className="kmeans-wb-result-arrow">
                    <span className="arrow-text">Cyan stars settle in the middle, tearing both natural shapes</span>
                  </div>
                </div>

                {/* Chalk Note */}
                <div className="kmeans-wb-note-column">
                  <div className="kmeans-chalk-note">
                    <div className="chalk-highlight">
                      Why does K-Means fail on non-hyper-ellipsoids?
                    </div>
                    <div className="chalk-bullets">
                      <div className="chalk-bullet-item">
                        <b>Voronoi Half-Spaces:</b> The decision boundary between any two centroids <Tex f="\boldsymbol{\mu}_1" inline /> and <Tex f="\boldsymbol{\mu}_2" inline /> is a flat hyperplane:
                        <div style={{ margin: '4px 0' }}>
                          <Tex f="\{ \mathbf{x} : \|\mathbf{x} - \boldsymbol{\mu}_1\| \le \|\mathbf{x} - \boldsymbol{\mu}_2\| \}" />
                        </div>
                      </div>
                      <div className="chalk-bullet-item">
                        <b>Convexity Guarantee:</b> Every cluster formed by K-Means is necessarily a convex polyhedron. It is mathematically incapable of forming non-convex shapes (curves, rings, hooks).
                      </div>
                      <div className="chalk-bullet-item">
                        <b>Remedy — DBSCAN:</b> Groups points based on local density reachability (<Tex f="\epsilon, \text{MinPts}" inline />), following complex continuous manifolds regardless of geometric shape.
                      </div>
                      <div className="chalk-bullet-item">
                        <b>Remedy — Spectral:</b> Projects data into eigenvector space using Graph Laplacians to make non-linear manifolds linearly separable.
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
