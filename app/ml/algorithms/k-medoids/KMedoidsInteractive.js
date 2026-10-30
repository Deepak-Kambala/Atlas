'use client';

import React, { useState, useMemo } from 'react';
import Tex from '../../../../components/Tex';

// Fixed cluster of 10 points for the interactive outlier resilience test
const BASE_CLUSTER_POINTS = [
  { id: 0, x: 38, y: 52 },
  { id: 1, x: 44, y: 44 },
  { id: 2, x: 48, y: 62 },
  { id: 3, x: 34, y: 60 },
  { id: 4, x: 54, y: 48 },
  { id: 5, x: 46, y: 54 }, // True central exemplar / medoid
  { id: 6, x: 40, y: 68 },
  { id: 7, x: 56, y: 64 },
  { id: 8, x: 32, y: 48 },
  { id: 9, x: 50, y: 56 }
];

// Reference baseline centroid without outlier
const BASE_CENTROID_X = BASE_CLUSTER_POINTS.reduce((s, p) => s + p.x, 0) / BASE_CLUSTER_POINTS.length;
const BASE_CENTROID_Y = BASE_CLUSTER_POINTS.reduce((s, p) => s + p.y, 0) / BASE_CLUSTER_POINTS.length;

export default function KMedoidsInteractive({ activeK = 3, onSelectK }) {
  const [activeTab, setActiveTab] = useState('outliers'); // 'outliers' | 'swap' | 'metric'
  const [outlierDist, setOutlierDist] = useState(65); // Outlier distance offset: 0 to 100
  const [metricType, setMetricType] = useState('manhattan'); // 'manhattan' | 'euclidean'
  const [selectedPointId, setSelectedPointId] = useState(5); // Active candidate medoid in swap tester

  // Distance helper based on active metric
  const calcDist = (p1, p2, metric) => {
    const dx = Math.abs(p1.x - p2.x);
    const dy = Math.abs(p1.y - p2.y);
    return metric === 'manhattan' ? dx + dy : Math.hypot(dx, dy);
  };

  // 1. Telemetry for Outlier Resilience Tab
  const outlierX = 50 + outlierDist * 0.95;
  const outlierY = 54 + outlierDist * 0.38;
  const outlierPoint = { x: outlierX, y: outlierY, isOutlier: true };

  const allPointsWithOutlier = useMemo(() => {
    return [...BASE_CLUSTER_POINTS, outlierPoint];
  }, [outlierPoint]);

  // Compute K-Means Centroid (arithmetic coordinate average of all points including outlier)
  const kmeansCentroid = useMemo(() => {
    const sumX = allPointsWithOutlier.reduce((s, p) => s + p.x, 0);
    const sumY = allPointsWithOutlier.reduce((s, p) => s + p.y, 0);
    const N = allPointsWithOutlier.length;
    return {
      x: sumX / N,
      y: sumY / N
    };
  }, [allPointsWithOutlier]);

  // Compute K-Medoids Medoid (actual data point in the dataset that minimizes total dissimilarity)
  const kmedoidsMedoid = useMemo(() => {
    let bestPoint = BASE_CLUSTER_POINTS[0];
    let bestCost = Infinity;

    allPointsWithOutlier.forEach(cand => {
      const cost = allPointsWithOutlier.reduce((acc, p) => acc + calcDist(p, cand, metricType), 0);
      if (cost < bestCost) {
        bestCost = cost;
        bestPoint = cand;
      }
    });

    return {
      ...bestPoint,
      cost: bestCost
    };
  }, [allPointsWithOutlier, metricType]);

  // Centroid drift from baseline cluster center
  const centroidDrift = Math.hypot(kmeansCentroid.x - BASE_CENTROID_X, kmeansCentroid.y - BASE_CENTROID_Y);
  const medoidDrift = Math.hypot(kmedoidsMedoid.x - BASE_CLUSTER_POINTS[5].x, kmedoidsMedoid.y - BASE_CLUSTER_POINTS[5].y);

  // 2. Telemetry for PAM Candidate Swap Tester Tab
  const swapPoints = BASE_CLUSTER_POINTS;
  const optimalMedoid = useMemo(() => {
    let best = swapPoints[0];
    let minCost = Infinity;
    swapPoints.forEach(cand => {
      const cost = swapPoints.reduce((acc, p) => acc + calcDist(p, cand, metricType), 0);
      if (cost < minCost) {
        minCost = cost;
        best = { ...cand, cost };
      }
    });
    return best;
  }, [swapPoints, metricType]);

  const currentCandidate = swapPoints.find(p => p.id === selectedPointId) || swapPoints[5];
  const currentCandidateCost = swapPoints.reduce((acc, p) => acc + calcDist(p, currentCandidate, metricType), 0);
  const deltaCost = currentCandidateCost - optimalMedoid.cost;
  const isCandidateOptimal = Math.abs(deltaCost) < 0.01;

  return (
    <div className="kmedoids-interactive-card">
      <div className="telemetry-eyebrow">INTERACTIVE EXPLORER · K-MEDOIDS (PAM)</div>

      {/* Navigation Tabs */}
      <div className="kmedoids-tab-bar">
        <button
          type="button"
          className={`kmedoids-tab-btn ${activeTab === 'outliers' ? 'active' : ''}`}
          onClick={() => setActiveTab('outliers')}
        >
          Outlier Resilience
        </button>
        <button
          type="button"
          className={`kmedoids-tab-btn ${activeTab === 'swap' ? 'active' : ''}`}
          onClick={() => setActiveTab('swap')}
        >
          PAM Swap Tester
        </button>
        <button
          type="button"
          className={`kmedoids-tab-btn ${activeTab === 'metric' ? 'active' : ''}`}
          onClick={() => setActiveTab('metric')}
        >
          Distance Metrics
        </button>
      </div>

      {/* =========================================================================
          TAB 1: Outlier Resilience Comparison (K-Means vs K-Medoids)
          ========================================================================= */}
      {activeTab === 'outliers' && (
        <div className="kmedoids-tab-content">
          <div className="kmedoids-card-header">
            <h4 className="kmedoids-card-title">Centroid vs. Medoid: Resistance to Outliers</h4>
            <span className="kmedoids-pill-badge">
              Outlier Offset: <b>+{outlierDist}px</b>
            </span>
          </div>

          <p className="kmedoids-card-desc">
            Drag the slider to move the outlier farther away. Notice how the <b>K-Means Centroid</b> gets pulled
            straight out of the cluster into empty space, while the <b>K-Medoids Medoid</b> stays rock-solid on the
            true exemplar data point.
          </p>

          {/* Interactive Slider */}
          <div className="kmedoids-slider-control-group">
            <div className="kmedoids-slider-label-row">
              <span className="kmedoids-slider-title">Outlier Distance from Cluster:</span>
              <span className="kmedoids-slider-val">{outlierDist} px</span>
            </div>
            <input
              type="range"
              min="0"
              max="95"
              value={outlierDist}
              onChange={e => setOutlierDist(Number(e.target.value))}
              className="kmedoids-slider"
              aria-label="Outlier distance slider"
            />
          </div>

          {/* Interactive Visual SVG Canvas */}
          <div className="kmedoids-svg-container">
            <svg viewBox="10 20 145 80" className="kmedoids-svg" aria-label="K-Means vs K-Medoids Outlier Comparison">
              {/* Subtle coordinate grid */}
              <line x1="20" y1="25" x2="20" y2="95" stroke="var(--bd)" strokeWidth="0.5" strokeDasharray="2 3" />
              <line x1="20" y1="95" x2="150" y2="95" stroke="var(--bd)" strokeWidth="0.5" strokeDasharray="2 3" />

              {/* Cluster Hull / Halo */}
              <ellipse
                cx={BASE_CENTROID_X}
                cy={BASE_CENTROID_Y}
                rx="18"
                ry="16"
                fill="rgba(56, 189, 248, 0.05)"
                stroke="var(--p1)"
                strokeWidth="0.6"
                strokeDasharray="2 2"
              />

              {/* Data points */}
              {BASE_CLUSTER_POINTS.map(p => (
                <circle
                  key={p.id}
                  cx={p.x}
                  cy={p.y}
                  r="2.2"
                  fill="var(--p1)"
                  stroke="var(--bg)"
                  strokeWidth="0.6"
                />
              ))}

              {/* Outlier Point */}
              <g className="kmedoids-outlier-pt">
                <circle
                  cx={outlierX}
                  cy={outlierY}
                  r="3.2"
                  fill="var(--p6)"
                  stroke="var(--tx)"
                  strokeWidth="0.8"
                />
                <circle
                  cx={outlierX}
                  cy={outlierY}
                  r="6.5"
                  fill="none"
                  stroke="var(--p6)"
                  strokeWidth="0.75"
                  strokeDasharray="2 2"
                />
                <text
                  x={outlierX}
                  y={outlierY - 8.5}
                  textAnchor="middle"
                  fill="var(--p6)"
                  fontSize="4.2"
                  fontFamily="var(--mono)"
                  fontWeight="700"
                >
                  Extreme Outlier
                </text>
              </g>

              {/* Baseline Center indicator */}
              <circle
                cx={BASE_CENTROID_X}
                cy={BASE_CENTROID_Y}
                r="1.2"
                fill="var(--mu)"
                opacity="0.6"
              />

              {/* Centroid Drift Vector Arrow */}
              {centroidDrift > 0.8 && (
                <line
                  x1={BASE_CENTROID_X}
                  y1={BASE_CENTROID_Y}
                  x2={kmeansCentroid.x}
                  y2={kmeansCentroid.y}
                  stroke="var(--p0)"
                  strokeWidth="0.85"
                  strokeDasharray="1.5 1.5"
                />
              )}

              {/* K-Means Centroid (Orange Diamond) */}
              <g transform={`translate(${kmeansCentroid.x}, ${kmeansCentroid.y})`}>
                <polygon
                  points="0,-4 4,0 0,4 -4,0"
                  fill="var(--p0)"
                  stroke="var(--tx)"
                  strokeWidth="0.75"
                />
                <text
                  x="0"
                  y="8.5"
                  textAnchor="middle"
                  fill="var(--p0)"
                  fontSize="3.8"
                  fontFamily="var(--mono)"
                  fontWeight="700"
                >
                  K-Means Centroid
                </text>
              </g>

              {/* K-Medoids Medoid (Green Double Ring on Real Member) */}
              <g transform={`translate(${kmedoidsMedoid.x}, ${kmedoidsMedoid.y})`}>
                <circle
                  cx="0"
                  cy="0"
                  r="4.4"
                  fill="none"
                  stroke="var(--p2)"
                  strokeWidth="1.2"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="2.5"
                  fill="var(--p2)"
                  stroke="var(--bg)"
                  strokeWidth="0.6"
                />
                <text
                  x="0"
                  y="-6.5"
                  textAnchor="middle"
                  fill="var(--p2)"
                  fontSize="3.8"
                  fontFamily="var(--mono)"
                  fontWeight="700"
                >
                  K-Medoids (Real Sample #{kmedoidsMedoid.id ?? '5'})
                </text>
              </g>
            </svg>
          </div>

          {/* Real-time Telemetry Grid */}
          <div className="kmedoids-telemetry-grid">
            <div className="kmedoids-telemetry-box kmeans-box">
              <div className="kmedoids-box-eyebrow">K-MEANS (CENTROID)</div>
              <div className="kmedoids-box-val-row">
                <span className="kmedoids-drift-label">Centroid Drift:</span>
                <span className="kmedoids-drift-val warning">+{centroidDrift.toFixed(1)} px</span>
              </div>
              <div className="kmedoids-box-sub">
                Dragged into empty space by squared error <Tex f="d^2" inline />. Center is an imaginary synthetic coordinate.
              </div>
            </div>

            <div className="kmedoids-telemetry-box kmedoids-box">
              <div className="kmedoids-box-eyebrow">K-MEDOIDS (PAM MEDOID)</div>
              <div className="kmedoids-box-val-row">
                <span className="kmedoids-drift-label">Medoid Drift:</span>
                <span className="kmedoids-drift-val success">{medoidDrift.toFixed(1)} px (0.0)</span>
              </div>
              <div className="kmedoids-box-sub">
                Center is strictly locked to actual data sample #{kmedoidsMedoid.id ?? '5'}. The distant outlier has 0 influence on position.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: Interactive PAM Medoid Swap Simulator
          ========================================================================= */}
      {activeTab === 'swap' && (
        <div className="kmedoids-tab-content">
          <div className="kmedoids-card-header">
            <h4 className="kmedoids-card-title">PAM Candidate Swap Tester</h4>
            <span className="kmedoids-pill-badge">
              Active: <b>Sample #{currentCandidate.id}</b>
            </span>
          </div>

          <p className="kmedoids-card-desc">
            <b>Click any point</b> in the cluster to evaluate it as a candidate medoid. The spider web shows the distance
            lines from every observation to that point. PAM swaps medoids whenever a candidate yields a lower total dissimilarity.
          </p>

          {/* Interactive SVG Canvas */}
          <div className="kmedoids-svg-container">
            <svg viewBox="20 30 50 50" className="kmedoids-svg" aria-label="Interactive PAM Candidate Swap Tester">
              {/* Spider lines from candidate medoid to all other points */}
              {swapPoints.map(p => (
                <line
                  key={`line-${p.id}`}
                  x1={currentCandidate.x}
                  y1={currentCandidate.y}
                  x2={p.x}
                  y2={p.y}
                  stroke={isCandidateOptimal ? 'var(--p2)' : 'var(--p0)'}
                  strokeWidth="0.4"
                  strokeDasharray="1.2 1.5"
                  opacity="0.8"
                />
              ))}

              {/* Data points */}
              {swapPoints.map(p => {
                const isSelected = p.id === currentCandidate.id;
                const isOptimal = p.id === optimalMedoid.id;

                return (
                  <g
                    key={p.id}
                    className="kmedoids-clickable-pt"
                    onClick={() => setSelectedPointId(p.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Outer halo if selected */}
                    {isSelected && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="3.5"
                        fill="none"
                        stroke={isOptimal ? 'var(--p2)' : 'var(--p0)'}
                        strokeWidth="0.8"
                        strokeDasharray={isOptimal ? 'none' : '1.5 1'}
                      />
                    )}

                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isSelected ? '2.4' : '1.6'}
                      fill={isSelected ? (isOptimal ? 'var(--p2)' : 'var(--p0)') : 'var(--p1)'}
                      stroke="var(--tx)"
                      strokeWidth={isSelected ? '0.6' : '0.2'}
                    />

                    {/* Point index label */}
                    <text
                      x={p.x}
                      y={p.y - 3}
                      textAnchor="middle"
                      fill="var(--mu)"
                      fontSize="2.4"
                      fontFamily="var(--mono)"
                    >
                      #{p.id}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Candidate Evaluation Status Box */}
          <div className={`kmedoids-swap-status-box ${isCandidateOptimal ? 'optimal' : 'suboptimal'}`}>
            <div className="kmedoids-status-header">
              <span className="kmedoids-status-tag">
                {isCandidateOptimal ? '✓ OPTIMAL MEDOID' : '✕ SUBOPTIMAL CANDIDATE'}
              </span>
              <span className="kmedoids-cost-badge">
                Total Dissimilarity: <b>{currentCandidateCost.toFixed(1)}</b>
              </span>
            </div>

            <p className="kmedoids-status-desc">
              {isCandidateOptimal ? (
                <>
                  Sample #{currentCandidate.id} minimizes the sum of absolute distances to all cluster members. Any swap
                  away from this medoid increases total dissimilarity (<Tex f="\Delta J > 0" inline />), so PAM terminates here.
                </>
              ) : (
                <>
                  If PAM swaps to this point, cost increases by <Tex f={`\\Delta J = +${deltaCost.toFixed(1)}`} inline /> above
                  optimal. PAM evaluates candidate points and swaps toward the dense center (Sample #{optimalMedoid.id}).
                </>
              )}
            </p>

            <div className="kmedoids-swap-actions">
              <button
                type="button"
                className="kmedoids-action-btn primary"
                onClick={() => setSelectedPointId(optimalMedoid.id)}
              >
                ★ Snap to Optimal Medoid (Sample #{optimalMedoid.id})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: Metric Comparison (Manhattan L1 vs Euclidean L2)
          ========================================================================= */}
      {activeTab === 'metric' && (
        <div className="kmedoids-tab-content">
          <div className="kmedoids-card-header">
            <h4 className="kmedoids-card-title">Distance Metric Flexibility</h4>
            <div className="kmedoids-metric-pills">
              <button
                type="button"
                className={`kmedoids-metric-btn ${metricType === 'manhattan' ? 'active' : ''}`}
                onClick={() => setMetricType('manhattan')}
              >
                Manhattan (L1)
              </button>
              <button
                type="button"
                className={`kmedoids-metric-btn ${metricType === 'euclidean' ? 'active' : ''}`}
                onClick={() => setMetricType('euclidean')}
              >
                Euclidean (L2)
              </button>
            </div>
          </div>

          <p className="kmedoids-card-desc">
            A major advantage of K-Medoids over K-Means is <b>metric freedom</b>. Because K-Means computes an arithmetic mean
            (<Tex f="\boldsymbol{\mu} = \frac{1}{|C|}\sum \mathbf{x}" inline />), it is mathematically constrained to Euclidean coordinate spaces.
            K-Medoids works with <b>any arbitrary distance metric</b> or precomputed dissimilarity matrix.
          </p>

          <div className="kmedoids-metric-compare-grid">
            <div className={`kmedoids-metric-card ${metricType === 'manhattan' ? 'highlight' : ''}`}>
              <div className="kmedoids-metric-title">Manhattan Distance (<Tex f="L_1" inline />)</div>
              <div className="kmedoids-metric-math">
                <Tex f="d_1(\mathbf{x}, \mathbf{y}) = \sum_j |x_j - y_j|" inline />
              </div>
              <p className="kmedoids-metric-text">
                Measures rectilinear grid / city-block distances. Minimizing <Tex f="L_1" inline /> dissimilarity yields the <b>geometric median</b>,
                providing the strongest possible robustness against heavy-tailed outliers.
              </p>
            </div>

            <div className={`kmedoids-metric-card ${metricType === 'euclidean' ? 'highlight' : ''}`}>
              <div className="kmedoids-metric-title">Euclidean Distance (<Tex f="L_2" inline />)</div>
              <div className="kmedoids-metric-math">
                <Tex f="d_2(\mathbf{x}, \mathbf{y}) = \sqrt{\sum_j (x_j - y_j)^2}" inline />
              </div>
              <p className="kmedoids-metric-text">
                Measures straight-line distance. When used with K-Medoids, the center is still forced to be an actual sample point,
                preventing outlier pull without squaring errors.
              </p>
            </div>
          </div>

          <div className="kmedoids-insight-box">
            <span className="kmedoids-insight-tag">REAL-WORLD APPLICATION</span>
            <p className="kmedoids-insight-text">
              In genomics, text analysis, and graph theory, coordinates often don&apos;t exist. You only have pairwise
              dissimilarities (e.g. edit distance between DNA sequences, Jaccard distance between text documents, or shortest
              paths on a graph). <b>K-Means is impossible here</b>, but <b>K-Medoids runs natively</b> on the distance matrix.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

