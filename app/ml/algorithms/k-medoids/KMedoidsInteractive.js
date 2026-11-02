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
  const [outlierDist, setOutlierDist] = useState(65); // Outlier distance offset: 0 to 95
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
      <div className="telemetry-eyebrow">INTERACTIVE EXPLORER · K-MEDOIDS</div>

      {/* Navigation Tabs */}
      <div className="kmedoids-tab-bar">
        <button
          type="button"
          className={`kmedoids-tab-btn ${activeTab === 'outliers' ? 'active' : ''}`}
          onClick={() => setActiveTab('outliers')}
        >
          Outlier Shield
        </button>
        <button
          type="button"
          className={`kmedoids-tab-btn ${activeTab === 'swap' ? 'active' : ''}`}
          onClick={() => setActiveTab('swap')}
        >
          Captain Swap Test
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
            <h4 className="kmedoids-card-title">Centroid vs. Medoid: Outlier Test</h4>
            <span className="kmedoids-pill-badge">
              Outlier Distance: <b>+{outlierDist}px</b>
            </span>
          </div>

          <p className="kmedoids-card-desc">
            Drag the slider to move the outlier farther away. Watch how the <b>K-Means Centroid</b> gets pulled
            out into empty space, while the <b>K-Medoids Medoid</b> stays locked onto real point #5.
          </p>

          {/* Interactive Slider */}
          <div className="kmedoids-slider-control-group">
            <div className="kmedoids-slider-label-row">
              <span className="kmedoids-slider-title">Drag Outlier Position:</span>
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

          {/* Visual Legend Bar above SVG */}
          <div className="kmedoids-visual-legend">
            <div className="kmedoids-legend-badge medoid">
              <span className="kmedoids-legend-dot medoid" />
              <span><b>K-Medoids:</b> Point #5 (Zero drift)</span>
            </div>
            <div className="kmedoids-legend-badge kmeans">
              <span className="kmedoids-legend-dot kmeans" />
              <span><b>K-Means:</b> Average (Dragged)</span>
            </div>
            <div className="kmedoids-legend-badge outlier">
              <span className="kmedoids-legend-dot outlier" />
              <span><b>Outlier:</b> Far point</span>
            </div>
          </div>

          {/* Clean Visual SVG Canvas */}
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

              {/* Cluster Data Points */}
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

              {/* Baseline Center indicator */}
              <circle
                cx={BASE_CENTROID_X}
                cy={BASE_CENTROID_Y}
                r="1.5"
                fill="var(--mu)"
                opacity="0.4"
              />

              {/* Centroid Drift Vector Arrow */}
              {centroidDrift > 0.8 && (
                <line
                  x1={BASE_CENTROID_X}
                  y1={BASE_CENTROID_Y}
                  x2={kmeansCentroid.x}
                  y2={kmeansCentroid.y}
                  stroke="var(--p0)"
                  strokeWidth="0.9"
                  strokeDasharray="2 2"
                />
              )}

              {/* K-Means Centroid (Orange Diamond) with masked pill badge */}
              <g transform={`translate(${kmeansCentroid.x}, ${kmeansCentroid.y})`}>
                <polygon
                  points="0,-4.5 4.5,0 0,4.5 -4.5,0"
                  fill="var(--p0)"
                  stroke="var(--tx)"
                  strokeWidth="0.75"
                />
                <g transform="translate(0, 9)">
                  <rect
                    x="-16"
                    y="-5"
                    width="32"
                    height="10"
                    rx="3"
                    fill="var(--cd)"
                    stroke="var(--p0)"
                    strokeWidth="0.7"
                  />
                  <text
                    x="0"
                    y="1.2"
                    textAnchor="middle"
                    fill="var(--p0)"
                    fontSize="3.6"
                    fontFamily="var(--mono)"
                    fontWeight="700"
                  >
                    Centroid
                  </text>
                </g>
              </g>

              {/* K-Medoids Medoid (Green Double Ring on Real Member #5) with masked pill badge */}
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
              </g>

              {/* Fixed Medoid Pill pinned cleanly above the cluster */}
              <g transform="translate(46, 30)">
                <line x1="0" y1="5.5" x2="0" y2="19" stroke="var(--p2)" strokeWidth="0.6" strokeDasharray="1.5 1.5" />
                <rect
                  x="-18"
                  y="-5.5"
                  width="36"
                  height="11"
                  rx="3"
                  fill="var(--cd)"
                  stroke="var(--p2)"
                  strokeWidth="0.8"
                />
                <text
                  x="0"
                  y="1.2"
                  textAnchor="middle"
                  fill="var(--p2)"
                  fontSize="3.8"
                  fontFamily="var(--mono)"
                  fontWeight="700"
                >
                  Medoid #5
                </text>
              </g>

              {/* Outlier Point with masked pill badge */}
              <g className="kmedoids-outlier-pt" transform={`translate(${outlierX}, ${outlierY})`}>
                <circle
                  cx="0"
                  cy="0"
                  r="3.2"
                  fill="var(--p6)"
                  stroke="var(--tx)"
                  strokeWidth="0.8"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="6.5"
                  fill="none"
                  stroke="var(--p6)"
                  strokeWidth="0.75"
                  strokeDasharray="2 2"
                />
                <g transform="translate(0, -10)">
                  <rect
                    x="-14"
                    y="-5"
                    width="28"
                    height="10"
                    rx="3"
                    fill="var(--cd)"
                    stroke="var(--p6)"
                    strokeWidth="0.7"
                  />
                  <text
                    x="0"
                    y="1.2"
                    textAnchor="middle"
                    fill="var(--p6)"
                    fontSize="3.6"
                    fontFamily="var(--mono)"
                    fontWeight="700"
                  >
                    Outlier
                  </text>
                </g>
              </g>
            </svg>
          </div>

          {/* Real-time Telemetry Grid */}
          <div className="kmedoids-telemetry-grid">
            <div className="kmedoids-telemetry-box kmeans-box">
              <div className="kmedoids-box-eyebrow">K-MEANS (AVERAGE)</div>
              <div className="kmedoids-box-val-row">
                <span className="kmedoids-drift-label">Drift from Cluster:</span>
                <span className="kmedoids-drift-val warning">+{centroidDrift.toFixed(1)} px</span>
              </div>
              <div className="kmedoids-box-sub">
                The outlier drags the average out into empty space. The center becomes a meaningless synthetic point.
              </div>
            </div>

            <div className="kmedoids-telemetry-box kmedoids-box">
              <div className="kmedoids-box-eyebrow">K-MEDOIDS (TEAM CAPTAIN)</div>
              <div className="kmedoids-box-val-row">
                <span className="kmedoids-drift-label">Drift from Cluster:</span>
                <span className="kmedoids-drift-val success">{medoidDrift.toFixed(1)} px (0.0)</span>
              </div>
              <div className="kmedoids-box-sub">
                Center is locked to real member #5. The faraway outlier has zero leverage to move the captain.
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
            <h4 className="kmedoids-card-title">Captain Swap Tester</h4>
            <span className="kmedoids-pill-badge">
              Selected: <b>Point #{currentCandidate.id}</b>
            </span>
          </div>

          <p className="kmedoids-card-desc">
            <b>Click any numbered point</b> to test it as the cluster captain. The spider lines calculate walking distance to all members. The true medoid minimizes this total distance.
          </p>

          {/* Interactive SVG Canvas with numbers INSIDE circles (No colliding text) */}
          <div className="kmedoids-svg-container">
            <svg viewBox="20 34 46 44" className="kmedoids-svg" aria-label="Interactive PAM Candidate Swap Tester">
              {/* Spider lines from candidate medoid to all other points */}
              {swapPoints.map(p => (
                <line
                  key={`line-${p.id}`}
                  x1={currentCandidate.x}
                  y1={currentCandidate.y}
                  x2={p.x}
                  y2={p.y}
                  stroke={isCandidateOptimal ? 'var(--p2)' : 'var(--p0)'}
                  strokeWidth="0.38"
                  strokeDasharray="1.2 1.2"
                  opacity="0.75"
                />
              ))}

              {/* Data points with numbers neatly inside circles */}
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
                    {/* Outer glow ring when selected */}
                    {isSelected && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="4.2"
                        fill="none"
                        stroke={isOptimal ? 'var(--p2)' : 'var(--p0)'}
                        strokeWidth="0.8"
                        strokeDasharray={isOptimal ? 'none' : '1.5 1'}
                      />
                    )}

                    {/* Point Circle */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isSelected ? '2.9' : '2.3'}
                      fill={
                        isSelected
                          ? isOptimal
                            ? 'var(--p2)'
                            : 'var(--p0)'
                          : isOptimal
                          ? 'var(--p2)'
                          : 'var(--cd)'
                      }
                      stroke={isOptimal ? 'var(--p2)' : 'var(--tx)'}
                      strokeWidth={isSelected ? '0.7' : '0.4'}
                    />

                    {/* Number label centered INSIDE circle */}
                    <text
                      x={p.x}
                      y={p.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={isSelected || isOptimal ? 'var(--bg)' : 'var(--tx)'}
                      fontSize="1.9"
                      fontFamily="var(--mono)"
                      fontWeight="700"
                    >
                      {p.id}
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
                {isCandidateOptimal ? '✓ OPTIMAL MEDOID (#5)' : `✕ SUBOPTIMAL POINT (#${currentCandidate.id})`}
              </span>
              <span className="kmedoids-cost-badge">
                Total Walking Distance: <b>{currentCandidateCost.toFixed(1)}</b>
              </span>
            </div>

            <p className="kmedoids-status-desc">
              {isCandidateOptimal ? (
                <>
                  Point #5 is the true center of the cluster. Swapping to any other point increases the total walking distance for the group, so PAM locks this as the optimal medoid.
                </>
              ) : (
                <>
                  Choosing Point #{currentCandidate.id} increases total distance by <Tex f={`\\Delta J = +${deltaCost.toFixed(1)}`} inline /> above optimal. PAM rejects points like this and swaps toward the dense center (Point #5).
                </>
              )}
            </p>

            {!isCandidateOptimal && (
              <div className="kmedoids-swap-actions">
                <button
                  type="button"
                  className="kmedoids-action-btn primary"
                  onClick={() => setSelectedPointId(optimalMedoid.id)}
                >
                  ★ Snap to Optimal Medoid (Point #5)
                </button>
              </div>
            )}
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
            K-Means is mathematically forced to use straight-line Euclidean distance because it needs to compute an arithmetic average. <b>K-Medoids works with any distance metric</b> or even non-coordinate pairwise distances.
          </p>

          <div className="kmedoids-metric-compare-grid">
            <div className={`kmedoids-metric-card ${metricType === 'manhattan' ? 'highlight' : ''}`}>
              <div className="kmedoids-metric-title">Manhattan Distance (L1)</div>
              <div className="kmedoids-metric-math">
                <Tex f="d_1(\mathbf{x}, \mathbf{y}) = \sum |x_j - y_j|" inline />
              </div>
              <p className="kmedoids-metric-text">
                Measures city-block grid walking distance. Gives the absolute highest resistance against extreme outlier corruption.
              </p>
            </div>

            <div className={`kmedoids-metric-card ${metricType === 'euclidean' ? 'highlight' : ''}`}>
              <div className="kmedoids-metric-title">Euclidean Distance (L2)</div>
              <div className="kmedoids-metric-math">
                <Tex f="d_2(\mathbf{x}, \mathbf{y}) = \sqrt{\sum (x_j - y_j)^2}" inline />
              </div>
              <p className="kmedoids-metric-text">
                Measures straight-line distance. In K-Medoids, the center is still forced to be an actual sample point rather than an average.
              </p>
            </div>
          </div>

          <div className="kmedoids-insight-box">
            <span className="kmedoids-insight-tag">SUPERPOWER: NON-COORDINATE DATA</span>
            <p className="kmedoids-insight-text">
              In DNA genetics, text similarity, or network routing, coordinates often do not exist. You only have pairwise distances (like text edit distance or hops on a network). <b>K-Means is impossible here</b>, but <b>K-Medoids runs natively</b> on the distance matrix!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
