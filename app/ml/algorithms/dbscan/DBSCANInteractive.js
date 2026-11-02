'use client';

import React, { useState, useMemo } from 'react';
import Tex from '../../../../components/Tex';

// Canonical 2-cluster dataset: 16 points in Cluster 1, 16 points in Cluster 2, 5 Noise points
const CLUSTER_1_POINTS = [
  { id: 0, x: 28, y: 50 }, { id: 1, x: 32, y: 52 }, { id: 2, x: 30, y: 46 }, { id: 3, x: 34, y: 48 },
  { id: 4, x: 26, y: 46 }, { id: 5, x: 31, y: 56 }, { id: 6, x: 36, y: 53 }, { id: 7, x: 27, y: 54 },
  { id: 8, x: 35, y: 44 }, { id: 9, x: 24, y: 50 }, { id: 10, x: 38, y: 49 }, { id: 11, x: 33, y: 40 },
  { id: 12, x: 22, y: 45 }, { id: 13, x: 39, y: 57 }, { id: 14, x: 29, y: 62 }, { id: 15, x: 42, y: 46 }
];

const CLUSTER_2_POINTS = [
  { id: 16, x: 68, y: 50 }, { id: 17, x: 72, y: 52 }, { id: 18, x: 70, y: 46 }, { id: 19, x: 74, y: 48 },
  { id: 20, x: 66, y: 46 }, { id: 21, x: 71, y: 56 }, { id: 22, x: 76, y: 53 }, { id: 23, x: 67, y: 54 },
  { id: 24, x: 75, y: 44 }, { id: 25, x: 64, y: 50 }, { id: 26, x: 78, y: 49 }, { id: 27, x: 73, y: 40 },
  { id: 28, x: 62, y: 45 }, { id: 29, x: 79, y: 57 }, { id: 30, x: 69, y: 62 }, { id: 31, x: 82, y: 46 }
];

const NOISE_POINTS = [
  { id: 32, x: 12, y: 82 }, { id: 33, x: 88, y: 85 }, { id: 34, x: 50, y: 88 }, { id: 35, x: 15, y: 18 }, { id: 36, x: 85, y: 16 }
];

const ALL_POINTS = [...CLUSTER_1_POINTS, ...CLUSTER_2_POINTS, ...NOISE_POINTS];

export default function DBSCANInteractive({ activeEps = 7.5, onSelectEps }) {
  const [activeTab, setActiveTab] = useState('inspect'); // 'inspect' | 'types' | 'clusters'
  const [eps, setEps] = useState(typeof activeEps === 'number' ? activeEps : 7.5);
  const [selectedPointId, setSelectedPointId] = useState(1); // Default to a core point (id: 1)
  const minPts = 4;

  const dist = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

  // Compute neighborhoods and classifications for all points
  const { neighborhoods, isCore, isBorder, isNoise, clusterLabels, numClusters } = useMemo(() => {
    const P = ALL_POINTS;
    const nb = P.map(p => P.reduce((acc, q, j) => (dist(p, q) <= eps ? acc.concat(j) : acc), []));
    const core = nb.map(a => a.length >= minPts);

    // Connected components of core points
    const L = P.map(() => -1);
    let nc = 0;

    core.forEach((c, i) => {
      if (!c || L[i] >= 0) return;
      const q = [i];
      L[i] = nc;
      while (q.length) {
        const u = q.shift();
        if (!core[u]) continue;
        nb[u].forEach(v => {
          if (L[v] < 0) {
            L[v] = nc;
            q.push(v);
          }
        });
      }
      nc++;
    });

    const border = P.map((p, i) => !core[i] && L[i] >= 0);
    const noise = P.map((p, i) => L[i] < 0);

    return {
      neighborhoods: nb,
      isCore: core,
      isBorder: border,
      isNoise: noise,
      clusterLabels: L,
      numClusters: nc
    };
  }, [eps]);

  const selectedPoint = ALL_POINTS.find(p => p.id === selectedPointId) || ALL_POINTS[1];
  const selectedNb = neighborhoods[selectedPoint.id] || [];
  const selectedIsCore = isCore[selectedPoint.id];
  const selectedIsBorder = isBorder[selectedPoint.id];
  const selectedIsNoise = isNoise[selectedPoint.id];

  const handleEpsChange = val => {
    setEps(val);
    if (onSelectEps) onSelectEps(val);
  };

  const coreCount = isCore.filter(Boolean).length;
  const borderCount = isBorder.filter(Boolean).length;
  const noiseCount = isNoise.filter(Boolean).length;

  return (
    <div className="dbscan-interactive-card">
      <div className="telemetry-eyebrow">INTERACTIVE EXPLORER · DBSCAN</div>

      {/* Navigation Tabs */}
      <div className="dbscan-tab-bar">
        <button
          type="button"
          className={`dbscan-tab-btn ${activeTab === 'inspect' ? 'active' : ''}`}
          onClick={() => setActiveTab('inspect')}
        >
          Inspect Circles
        </button>
        <button
          type="button"
          className={`dbscan-tab-btn ${activeTab === 'types' ? 'active' : ''}`}
          onClick={() => setActiveTab('types')}
        >
          Point Types
        </button>
        <button
          type="button"
          className={`dbscan-tab-btn ${activeTab === 'clusters' ? 'active' : ''}`}
          onClick={() => setActiveTab('clusters')}
        >
          2 Clusters
        </button>
      </div>

      {/* =========================================================================
          TAB 1: Inspect ε-Circle on Any Point
          ========================================================================= */}
      {activeTab === 'inspect' && (
        <div className="dbscan-tab-content">
          <div className="dbscan-card-header">
            <h4 className="dbscan-card-title">Inspect ε-Neighborhood Circle</h4>
            <span className="dbscan-pill-badge">
              Radius ε: <b>{eps.toFixed(1)}px</b>
            </span>
          </div>

          <p className="dbscan-card-desc">
            <b>Click any point below</b> to draw its ε-neighborhood circle. A point needs at least <b>MinPts = 4</b> neighbors inside its circle to become a Core Point.
          </p>

          {/* Quick preset buttons */}
          <div className="dbscan-preset-pills">
            <button
              type="button"
              className={`dbscan-preset-btn ${selectedPointId === 1 ? 'active' : ''}`}
              onClick={() => setSelectedPointId(1)}
            >
              ● Core Sample (#1)
            </button>
            <button
              type="button"
              className={`dbscan-preset-btn ${selectedPointId === 15 ? 'active' : ''}`}
              onClick={() => setSelectedPointId(15)}
            >
              ◌ Border Sample (#15)
            </button>
            <button
              type="button"
              className={`dbscan-preset-btn ${selectedPointId === 34 ? 'active' : ''}`}
              onClick={() => setSelectedPointId(34)}
            >
              ⨂ Noise Sample (#34)
            </button>
          </div>

          {/* Interactive SVG Canvas */}
          <div className="dbscan-svg-container">
            <svg viewBox="5 10 90 85" className="dbscan-svg" aria-label="Interactive DBSCAN circle inspector">
              {/* Subtle grid */}
              <line x1="10" y1="50" x2="90" y2="50" stroke="var(--bd)" strokeWidth="0.4" strokeDasharray="2 3" opacity="0.6" />
              <line x1="50" y1="15" x2="50" y2="85" stroke="var(--bd)" strokeWidth="0.4" strokeDasharray="2 3" opacity="0.6" />

              {/* Connecting lines from selected point to neighbors inside circle */}
              {selectedNb
                .filter(j => j !== selectedPoint.id)
                .map(j => (
                  <line
                    key={`line-${j}`}
                    x1={selectedPoint.x}
                    y1={100 - selectedPoint.y}
                    x2={ALL_POINTS[j].x}
                    y2={100 - ALL_POINTS[j].y}
                    stroke={selectedIsCore ? 'var(--p2)' : selectedIsBorder ? 'var(--p3)' : 'var(--p6)'}
                    strokeWidth="0.5"
                    strokeDasharray="1.5 1.5"
                  />
                ))}

              {/* The ε-neighborhood circle */}
              <circle
                cx={selectedPoint.x}
                cy={100 - selectedPoint.y}
                r={eps}
                fill={
                  selectedIsCore
                    ? 'rgba(81, 207, 102, 0.08)'
                    : selectedIsBorder
                    ? 'rgba(255, 192, 72, 0.08)'
                    : 'rgba(255, 107, 107, 0.08)'
                }
                stroke={selectedIsCore ? 'var(--p2)' : selectedIsBorder ? 'var(--p3)' : 'var(--p6)'}
                strokeWidth="1.2"
                strokeDasharray="2 2"
              />

              {/* Data points */}
              {ALL_POINTS.map(p => {
                const isSelected = p.id === selectedPoint.id;
                const inCircle = selectedNb.includes(p.id);

                return (
                  <g
                    key={p.id}
                    className="dbscan-node-pt"
                    onClick={() => setSelectedPointId(p.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Outer ring if selected */}
                    {isSelected && (
                      <circle
                        cx={p.x}
                        cy={100 - p.y}
                        r="4.2"
                        fill="none"
                        stroke="var(--tx)"
                        strokeWidth="0.8"
                      />
                    )}

                    <circle
                      cx={p.x}
                      cy={100 - p.y}
                      r={isSelected ? '3.0' : inCircle ? '2.4' : '1.9'}
                      fill={
                        isSelected
                          ? selectedIsCore
                            ? 'var(--p2)'
                            : selectedIsBorder
                            ? 'var(--p3)'
                            : 'var(--p6)'
                          : inCircle
                          ? 'var(--tx)'
                          : 'var(--cd)'
                      }
                      stroke="var(--tx)"
                      strokeWidth={isSelected ? '0.8' : inCircle ? '0.5' : '0.3'}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Interactive Slider */}
          <div className="dbscan-slider-control-group">
            <div className="dbscan-slider-label-row">
              <span className="dbscan-slider-title">Adjust Neighborhood Radius (ε):</span>
              <span className="dbscan-slider-val">{eps.toFixed(1)} px</span>
            </div>
            <input
              type="range"
              min="4"
              max="12"
              step="0.5"
              value={eps}
              onChange={e => handleEpsChange(Number(e.target.value))}
              className="dbscan-slider"
              aria-label="Neighborhood radius eps slider"
            />
          </div>

          {/* Status Box for Selected Point */}
          <div
            className={`dbscan-status-card ${
              selectedIsCore ? 'core' : selectedIsBorder ? 'border' : 'noise'
            }`}
          >
            <div className="dbscan-status-header">
              <span className="dbscan-status-badge">
                {selectedIsCore
                  ? '● CORE POINT'
                  : selectedIsBorder
                  ? '◌ BORDER POINT'
                  : '⨂ NOISE OUTLIER'}
              </span>
              <span className="dbscan-count-badge">
                Neighbors in circle: <b>{selectedNb.length}</b> (MinPts = 4)
              </span>
            </div>

            <p className="dbscan-status-text">
              {selectedIsCore ? (
                <>
                  Point #{selectedPoint.id} has <b>{selectedNb.length} neighbors</b> ($\ge 4$). Its neighborhood is dense enough to initiate and expand a cluster.
                </>
              ) : selectedIsBorder ? (
                <>
                  Point #{selectedPoint.id} has only <b>{selectedNb.length} neighbors</b> ($&lt; 4$). However, it touches a Core Point, so it forms the edge of the cluster!
                </>
              ) : (
                <>
                  Point #{selectedPoint.id} has only <b>{selectedNb.length} neighbor</b> ($&lt; 4$) and does not touch any Core Point. DBSCAN isolates it as Noise.
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: Point Types Breakdown (Core, Border, Noise)
          ========================================================================= */}
      {activeTab === 'types' && (
        <div className="dbscan-tab-content">
          <div className="dbscan-card-header">
            <h4 className="dbscan-card-title">How Points are Categorized</h4>
            <span className="dbscan-pill-badge">
              Total Points: <b>{ALL_POINTS.length}</b>
            </span>
          </div>

          <p className="dbscan-card-desc">
            DBSCAN assigns every point into one of three distinct roles based on density and neighborhood reachability.
          </p>

          <div className="dbscan-type-grid">
            <div className="dbscan-type-card core">
              <div className="dbscan-type-header">
                <span className="dbscan-type-dot core" />
                <span className="dbscan-type-title">Core Points</span>
                <span className="dbscan-type-count">{coreCount} pts</span>
              </div>
              <div className="dbscan-type-math">
                <Tex f="|N_\varepsilon(\mathbf{p})| \ge \text{MinPts}" inline />
              </div>
              <p className="dbscan-type-desc">
                Dense centers of clusters with at least 4 neighbors within ε radius.
              </p>
            </div>

            <div className="dbscan-type-card border">
              <div className="dbscan-type-header">
                <span className="dbscan-type-dot border" />
                <span className="dbscan-type-title">Border Points</span>
                <span className="dbscan-type-count">{borderCount} pts</span>
              </div>
              <div className="dbscan-type-math">
                <Tex f="|N_\varepsilon(\mathbf{p})| < \text{MinPts} \land \text{Core nearby}" inline />
              </div>
              <p className="dbscan-type-desc">
                Perimeter points with &lt; 4 neighbors, but within ε radius of a core point.
              </p>
            </div>

            <div className="dbscan-type-card noise">
              <div className="dbscan-type-header">
                <span className="dbscan-type-dot noise" />
                <span className="dbscan-type-title">Noise Points</span>
                <span className="dbscan-type-count">{noiseCount} pts</span>
              </div>
              <div className="dbscan-type-math">
                <Tex f="|N_\varepsilon(\mathbf{p})| < \text{MinPts} \land \text{No Core}" inline />
              </div>
              <p className="dbscan-type-desc">
                Isolated points with &lt; 4 neighbors and no reachable core points.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: Final 2 Clusters Discovered
          ========================================================================= */}
      {activeTab === 'clusters' && (
        <div className="dbscan-tab-content">
          <div className="dbscan-card-header">
            <h4 className="dbscan-card-title">Final 2 Clusters Discovered</h4>
            <span className="dbscan-pill-badge">
              Clusters Found: <b>{numClusters}</b>
            </span>
          </div>

          <p className="dbscan-card-desc">
            DBSCAN connected overlapping core points to discover exactly <b>2 natural clusters</b> without needing K=2 specified in advance!
          </p>

          <div className="dbscan-cluster-stat-grid">
            <div className="dbscan-cluster-box c1">
              <div className="dbscan-cluster-title">Cluster 1 (Left)</div>
              <div className="dbscan-cluster-val">16 Points</div>
              <div className="dbscan-cluster-sub">11 Core + 5 Border points</div>
            </div>

            <div className="dbscan-cluster-box c2">
              <div className="dbscan-cluster-title">Cluster 2 (Right)</div>
              <div className="dbscan-cluster-val">16 Points</div>
              <div className="dbscan-cluster-sub">11 Core + 5 Border points</div>
            </div>

            <div className="dbscan-cluster-box noise">
              <div className="dbscan-cluster-title">Noise / Outliers</div>
              <div className="dbscan-cluster-val">5 Points</div>
              <div className="dbscan-cluster-sub">Isolated from both clusters</div>
            </div>
          </div>

          <div className="dbscan-insight-box">
            <span className="dbscan-insight-tag">KEY ADVANTAGE OVER K-MEANS</span>
            <p className="dbscan-insight-text">
              Notice that the gap between the two clusters is larger than ε ({eps}px), so they never merge into one. Meanwhile, the 5 red noise points are completely ignored rather than dragging the cluster centers!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

