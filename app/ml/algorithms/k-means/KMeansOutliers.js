'use client';

import React, { useState } from 'react';
import Tex from '../../../../components/Tex';

// Dataset for Outliers visualization
// Cluster 1 (left dense group)
const CLUSTER_1_POINTS = [
  { x: 26, y: 38 },
  { x: 34, y: 30 },
  { x: 42, y: 36 },
  { x: 22, y: 52 },
  { x: 30, y: 50 },
  { x: 40, y: 54 },
  { x: 25, y: 68 },
  { x: 35, y: 64 },
  { x: 44, y: 72 }
];

// Cluster 2 (middle dense group)
const CLUSTER_2_POINTS = [
  { x: 62, y: 30 },
  { x: 68, y: 38 },
  { x: 64, y: 52 },
  { x: 70, y: 60 },
  { x: 63, y: 70 }
];

// Distant Outlier on far right
const OUTLIER_POINT = { x: 142, y: 62 };

export default function KMeansOutliers() {
  const [activeTab, setActiveTab] = useState('compare'); // 'compare' | 'undesirable' | 'ideal'
  const [isModalOpen, setIsModalOpen] = useState(false);

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
            className={`kmeans-tab-btn ${activeTab === 'undesirable' ? 'active' : ''}`}
            onClick={() => setActiveTab('undesirable')}
            title="View (A) Undesirable clusters"
          >
            (A)
          </button>
          <button
            type="button"
            className={`kmeans-tab-btn ${activeTab === 'ideal' ? 'active' : ''}`}
            onClick={() => setActiveTab('ideal')}
            title="View (B) Ideal clusters"
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
        {/* DIAGRAM A: Undesirable Clusters (K-Means Failure) */}
        {(activeTab === 'compare' || activeTab === 'undesirable') && (
          <div className="kmeans-case-column init1-case">
            <div className="kmeans-case-header">
              <span className="kmeans-case-tag local-tag">(A): Undesirable clusters</span>
              <span className="kmeans-case-sub">Centroid pulled into empty space</span>
            </div>

            <div className="kmeans-subplot-card">
              <svg viewBox="0 0 168 96" className="kmeans-wide-svg" aria-label="Undesirable clusters with outlier">
                <defs>
                  <marker id="arr-outlier-a" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto">
                    <path d="M 0 1 L 5 3 L 0 5 z" fill="#ffffff" />
                  </marker>
                </defs>

                {/* Coordinate Axes */}
                <line x1="12" y1="88" x2="162" y2="88" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.2" />
                <line x1="12" y1="88" x2="12" y2="8" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.2" />

                {/* Cluster 1 Envelope (Left) */}
                <rect
                  x="16"
                  y="20"
                  width="36"
                  height="60"
                  rx="14"
                  fill="rgba(56, 189, 248, 0.08)"
                  stroke="#38bdf8"
                  strokeWidth="1.3"
                />

                {/* Cluster 2 + Outlier Elongated Envelope (Right) */}
                {/* Tapered path enclosing middle cluster and stretching all the way to outlier */}
                <path
                  d="M 58 22 C 70 20, 78 22, 80 26 L 148 56 C 153 58, 153 66, 148 68 L 80 76 C 78 80, 70 82, 58 80 C 52 78, 48 70, 48 51 C 48 32, 52 24, 58 22 Z"
                  fill="rgba(250, 204, 21, 0.09)"
                  stroke="#facc15"
                  strokeWidth="1.4"
                />

                {/* Cluster 1 Points */}
                {CLUSTER_1_POINTS.map((p, idx) => (
                  <circle key={`c1-${idx}`} cx={p.x} cy={p.y} r="2.3" fill="#38bdf8" stroke="#ffffff" strokeWidth="0.8" />
                ))}

                {/* Cluster 1 Centroid (+) */}
                <g stroke="#38bdf8" strokeWidth="1.8">
                  <line x1="31" y1="52" x2="37" y2="52" />
                  <line x1="34" y1="49" x2="34" y2="55" />
                </g>

                {/* Cluster 2 Points */}
                {CLUSTER_2_POINTS.map((p, idx) => (
                  <circle key={`c2-${idx}`} cx={p.x} cy={p.y} r="2.3" fill="#c084fc" stroke="#ffffff" strokeWidth="0.8" />
                ))}

                {/* Outlier Point */}
                <circle cx={OUTLIER_POINT.x} cy={OUTLIER_POINT.y} r="3" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
                <circle cx={OUTLIER_POINT.x} cy={OUTLIER_POINT.y} r="5.5" fill="none" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="2 2" />

                {/* Dragged Centroid (+) in empty space in yellow */}
                <circle cx="102" cy="52" r="8" fill="#facc15" opacity="0.18" />
                <g stroke="#facc15" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="97" y1="52" x2="107" y2="52" />
                  <line x1="102" y1="47" x2="102" y2="57" />
                </g>
                <text x="102" y="42" textAnchor="middle" fontSize="7.5" fill="#facc15" fontWeight="700">Centroid</text>

                {/* Outlier text and arrow */}
                <text x="142" y="22" fontSize="9" fill="#ffffff" textAnchor="middle" fontWeight="700" letterSpacing="0.02em">outlier</text>
                <line x1="142" y1="26" x2="142" y2="52" stroke="#ffffff" strokeWidth="1.2" markerEnd="url(#arr-outlier-a)" />
              </svg>
            </div>

            <div className="kmeans-final-result bad-result">
              <span className="kmeans-result-title">✕ Distortion:</span>
              <span className="kmeans-result-desc">
                The yellow centroid is pulled far right into empty space. The middle natural group is lumped into an artificial elongated shape.
              </span>
            </div>
          </div>
        )}

        {/* DIAGRAM B: Ideal Clusters (Robust Ground Truth) */}
        {(activeTab === 'compare' || activeTab === 'ideal') && (
          <div className="kmeans-case-column init2-case">
            <div className="kmeans-case-header">
              <span className="kmeans-case-tag optimal-tag">(B): Ideal clusters</span>
              <span className="kmeans-case-sub">Natural groups cleanly preserved</span>
            </div>

            <div className="kmeans-subplot-card">
              <svg viewBox="0 0 168 96" className="kmeans-wide-svg" aria-label="Ideal clusters separating outlier">
                <defs>
                  <marker id="arr-outlier-b" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto">
                    <path d="M 0 1 L 5 3 L 0 5 z" fill="#ffffff" />
                  </marker>
                </defs>

                {/* Coordinate Axes */}
                <line x1="12" y1="88" x2="162" y2="88" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.2" />
                <line x1="12" y1="88" x2="12" y2="8" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.2" />

                {/* Cluster 1 Envelope */}
                <rect
                  x="16"
                  y="20"
                  width="36"
                  height="60"
                  rx="14"
                  fill="rgba(56, 189, 248, 0.08)"
                  stroke="#38bdf8"
                  strokeWidth="1.3"
                />

                {/* Cluster 2 Envelope (Separated from outlier) */}
                <rect
                  x="56"
                  y="20"
                  width="32"
                  height="60"
                  rx="14"
                  fill="rgba(192, 132, 252, 0.08)"
                  stroke="#c084fc"
                  strokeWidth="1.3"
                />

                {/* Cluster 1 Points */}
                {CLUSTER_1_POINTS.map((p, idx) => (
                  <circle key={`c1-b-${idx}`} cx={p.x} cy={p.y} r="2.3" fill="#38bdf8" stroke="#ffffff" strokeWidth="0.8" />
                ))}

                {/* Cluster 1 Centroid (+) */}
                <g stroke="#38bdf8" strokeWidth="1.8">
                  <line x1="31" y1="52" x2="37" y2="52" />
                  <line x1="34" y1="49" x2="34" y2="55" />
                </g>

                {/* Cluster 2 Points */}
                {CLUSTER_2_POINTS.map((p, idx) => (
                  <circle key={`c2-b-${idx}`} cx={p.x} cy={p.y} r="2.3" fill="#c084fc" stroke="#ffffff" strokeWidth="0.8" />
                ))}

                {/* Cluster 2 Centroid (+) placed at actual center */}
                <g stroke="#c084fc" strokeWidth="1.8">
                  <line x1="63" y1="50" x2="69" y2="50" />
                  <line x1="66" y1="47" x2="66" y2="53" />
                </g>

                {/* Outlier Point (Isolated anomaly) */}
                <circle cx={OUTLIER_POINT.x} cy={OUTLIER_POINT.y} r="3" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
                <circle cx={OUTLIER_POINT.x} cy={OUTLIER_POINT.y} r="5.5" fill="none" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="2 2" />

                {/* Outlier text and arrow */}
                <text x="142" y="22" fontSize="9" fill="#ffffff" textAnchor="middle" fontWeight="700" letterSpacing="0.02em">outlier</text>
                <line x1="142" y1="26" x2="142" y2="52" stroke="#ffffff" strokeWidth="1.2" markerEnd="url(#arr-outlier-b)" />
              </svg>
            </div>

            <div className="kmeans-final-result good-result">
              <span className="kmeans-result-title">✓ Solution:</span>
              <span className="kmeans-result-desc">
                Use <strong>k-Medoids (PAM)</strong> or <strong>DBSCAN</strong>, which resist extreme values by choosing actual member medoids or flagging low-density noise.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="kmeans-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="kmeans-modal-dialog" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="kmeans-modal-header">
              <div className="kmeans-modal-title-group">
                <h3 className="kmeans-modal-title">Outlier Sensitivity in K-Means</h3>
                <p className="kmeans-modal-subtitle">
                  How squared distance objective (L2 norm) distorts cluster geometry in the presence of noise
                </p>
              </div>
              <button type="button" className="kmeans-modal-close" onClick={() => setIsModalOpen(false)} aria-label="Close dialog">
                ✕
              </button>
            </div>

            <div className="kmeans-modal-body">
              <div className="kmeans-whiteboard-grid">
                <div className="kmeans-wb-column">
                  <div className="kmeans-wb-col-title">(A): Undesirable clusters (K-Means)</div>
                  <div className="kmeans-wb-plot-box">
                    <div className="kmeans-wb-plot-caption">Centroid pulled towards outlier</div>
                    <svg viewBox="0 0 168 96" className="kmeans-wide-svg">
                      <defs>
                        <marker id="arr-outlier-m1" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto">
                          <path d="M 0 1 L 5 3 L 0 5 z" fill="#ffffff" />
                        </marker>
                      </defs>
                      <line x1="12" y1="88" x2="162" y2="88" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.2" />
                      <line x1="12" y1="88" x2="12" y2="8" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.2" />
                      <rect x="16" y="20" width="36" height="60" rx="14" fill="rgba(56, 189, 248, 0.08)" stroke="#38bdf8" strokeWidth="1.3" />
                      <path d="M 58 22 C 70 20, 78 22, 80 26 L 148 56 C 153 58, 153 66, 148 68 L 80 76 C 78 80, 70 82, 58 80 C 52 78, 48 70, 48 51 C 48 32, 52 24, 58 22 Z" fill="rgba(250, 204, 21, 0.09)" stroke="#facc15" strokeWidth="1.4" />
                      {CLUSTER_1_POINTS.map((p, idx) => (
                        <circle key={`m-c1-${idx}`} cx={p.x} cy={p.y} r="2.3" fill="#38bdf8" stroke="#ffffff" strokeWidth="0.8" />
                      ))}
                      <g stroke="#38bdf8" strokeWidth="1.8">
                        <line x1="31" y1="52" x2="37" y2="52" />
                        <line x1="34" y1="49" x2="34" y2="55" />
                      </g>
                      {CLUSTER_2_POINTS.map((p, idx) => (
                        <circle key={`m-c2-${idx}`} cx={p.x} cy={p.y} r="2.3" fill="#c084fc" stroke="#ffffff" strokeWidth="0.8" />
                      ))}
                      <circle cx={OUTLIER_POINT.x} cy={OUTLIER_POINT.y} r="3" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
                      <circle cx={OUTLIER_POINT.x} cy={OUTLIER_POINT.y} r="5.5" fill="none" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="2 2" />
                      <circle cx="102" cy="52" r="8" fill="#facc15" opacity="0.18" />
                      <g stroke="#facc15" strokeWidth="2.2" strokeLinecap="round">
                        <line x1="97" y1="52" x2="107" y2="52" />
                        <line x1="102" y1="47" x2="102" y2="57" />
                      </g>
                      <text x="102" y="42" textAnchor="middle" fontSize="7.5" fill="#facc15" fontWeight="700">Centroid</text>
                      <text x="142" y="22" fontSize="9" fill="#ffffff" textAnchor="middle" fontWeight="700" letterSpacing="0.02em">outlier</text>
                      <line x1="142" y1="26" x2="142" y2="52" stroke="#ffffff" strokeWidth="1.2" markerEnd="url(#arr-outlier-m1)" />
                    </svg>
                  </div>
                  <div className="kmeans-wb-result-arrow">
                    <span className="arrow-text">Centroid dragged into empty space between Cluster 2 and outlier</span>
                  </div>
                </div>

                <div className="kmeans-wb-column">
                  <div className="kmeans-wb-col-title">(B): Ideal clusters (Robust)</div>
                  <div className="kmeans-wb-plot-box">
                    <div className="kmeans-wb-plot-caption">Natural clusters preserved, outlier isolated</div>
                    <svg viewBox="0 0 168 96" className="kmeans-wide-svg">
                      <defs>
                        <marker id="arr-outlier-m2" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto">
                          <path d="M 0 1 L 5 3 L 0 5 z" fill="#ffffff" />
                        </marker>
                      </defs>
                      <line x1="12" y1="88" x2="162" y2="88" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.2" />
                      <line x1="12" y1="88" x2="12" y2="8" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.2" />
                      <rect x="16" y="20" width="36" height="60" rx="14" fill="rgba(56, 189, 248, 0.08)" stroke="#38bdf8" strokeWidth="1.3" />
                      <rect x="56" y="20" width="32" height="60" rx="14" fill="rgba(192, 132, 252, 0.08)" stroke="#c084fc" strokeWidth="1.3" />
                      {CLUSTER_1_POINTS.map((p, idx) => (
                        <circle key={`m-c1b-${idx}`} cx={p.x} cy={p.y} r="2.3" fill="#38bdf8" stroke="#ffffff" strokeWidth="0.8" />
                      ))}
                      <g stroke="#38bdf8" strokeWidth="1.8">
                        <line x1="31" y1="52" x2="37" y2="52" />
                        <line x1="34" y1="49" x2="34" y2="55" />
                      </g>
                      {CLUSTER_2_POINTS.map((p, idx) => (
                        <circle key={`m-c2b-${idx}`} cx={p.x} cy={p.y} r="2.3" fill="#c084fc" stroke="#ffffff" strokeWidth="0.8" />
                      ))}
                      <g stroke="#c084fc" strokeWidth="1.8">
                        <line x1="63" y1="50" x2="69" y2="50" />
                        <line x1="66" y1="47" x2="66" y2="53" />
                      </g>
                      <circle cx={OUTLIER_POINT.x} cy={OUTLIER_POINT.y} r="3" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
                      <circle cx={OUTLIER_POINT.x} cy={OUTLIER_POINT.y} r="5.5" fill="none" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="2 2" />
                      <text x="142" y="22" fontSize="9" fill="#ffffff" textAnchor="middle" fontWeight="700" letterSpacing="0.02em">outlier</text>
                      <line x1="142" y1="26" x2="142" y2="52" stroke="#ffffff" strokeWidth="1.2" markerEnd="url(#arr-outlier-m2)" />
                    </svg>
                  </div>
                  <div className="kmeans-wb-result-arrow good-arrow">
                    <span className="arrow-text">Clean separation of natural clusters without outlier distortion</span>
                  </div>
                </div>

                <div className="kmeans-wb-note-column">
                  <div className="kmeans-chalk-note">
                    <div className="chalk-highlight">
                      Why does K-Means suffer from outliers?
                    </div>
                    <div className="chalk-bullets">
                      <div className="chalk-bullet-item">
                        <b>Squared Penalties:</b> Distance is squared (<Tex f="d^2" inline />), so an outlier at distance 10 exerts 100× the pull on the centroid compared to a point at distance 1.
                      </div>
                      <div className="chalk-bullet-item">
                        <b>Synthetic Means:</b> The centroid <Tex f="\boldsymbol{\mu}_k = \frac{1}{|C_k|}\sum \mathbf{x}" inline /> is a linear average that is not constrained to be a real data point.
                      </div>
                      <div className="chalk-bullet-item">
                        <b>Remedy — k-Medoids:</b> Minimizes Manhattan/absolute dissimilarities <Tex f="\sum \|\mathbf{x} - \mathbf{m}\|" inline /> and restricts centers to actual points.
                      </div>
                      <div className="chalk-bullet-item">
                        <b>Remedy — DBSCAN:</b> Identifies low-density regions as noise points rather than forcing them into clusters.
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
