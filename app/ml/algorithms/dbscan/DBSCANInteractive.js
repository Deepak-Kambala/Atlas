'use client';

import React, { useState, useMemo } from 'react';
import Tex from '../../../../components/Tex';
import {
  STATQUEST_C1_BLOB,
  STATQUEST_C1_TAIL,
  STATQUEST_C2,
  STATQUEST_NOISE
} from './dbscan';

// Combine into canonical StatQuest 74-point dataset
const ALL_POINTS = [
  ...STATQUEST_C1_BLOB.map((p, idx) => ({ ...p, id: idx, group: 'c1' })),
  ...STATQUEST_C1_TAIL.map((p, idx) => ({ ...p, id: idx + STATQUEST_C1_BLOB.length, group: 'c1' })),
  ...STATQUEST_C2.map((p, idx) => ({ ...p, id: idx + STATQUEST_C1_BLOB.length + STATQUEST_C1_TAIL.length, group: 'c2' })),
  ...STATQUEST_NOISE.map((p, idx) => ({ ...p, id: idx + STATQUEST_C1_BLOB.length + STATQUEST_C1_TAIL.length + STATQUEST_C2.length, group: 'noise' }))
];

export default function DBSCANInteractive({ activeEps = 8.5, onSelectEps }) {
  const [activeTab, setActiveTab] = useState('inspect'); // 'inspect' | 'types' | 'clusters'
  const [eps, setEps] = useState(typeof activeEps === 'number' ? activeEps : 8.5);
  const [selectedPointId, setSelectedPointId] = useState(10); // Default to a core point in the blob (id: 10)
  const minPts = 4; // 4 other points

  const dist = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

  // Compute neighborhoods and classifications for all 74 points
  const { neighborhoods, isCore, isBorder, isNoise, clusterLabels, numClusters } = useMemo(() => {
    const P = ALL_POINTS;
    // count other points within eps
    const nb = P.map((p, i) => P.reduce((acc, q, j) => (j !== i && dist(p, q) <= eps ? acc.concat(j) : acc), []));
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
        P.forEach((_, v) => {
          if (dist(P[u], P[v]) <= eps) {
            if (L[v] < 0) {
              L[v] = nc;
              q.push(v);
            }
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

  const selectedPoint = ALL_POINTS.find(p => p.id === selectedPointId) || ALL_POINTS[10];
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
          TAB 1: Inspect Orange ε-Circle on Any Point (StatQuest Style)
          ========================================================================= */}
      {activeTab === 'inspect' && (
        <div className="dbscan-tab-content">
          <div className="dbscan-card-header">
            <h4 className="dbscan-card-title">Inspect Orange ε-Circle</h4>
            <span className="dbscan-pill-badge">
              Radius ε: <b>{eps.toFixed(1)}px</b>
            </span>
          </div>

          <p className="dbscan-card-desc">
            <b>Click any point below</b> to draw its orange neighborhood circle. A point needs at least <b>MinPts = 4 other points</b> inside its circle to become a Core Point.
          </p>

          {/* Quick preset buttons matching StatQuest walkthrough */}
          <div className="dbscan-preset-pills">
            <button
              type="button"
              className={`dbscan-preset-btn ${selectedPointId === 10 ? 'active' : ''}`}
              onClick={() => setSelectedPointId(10)}
            >
              ● Core Sample (#10)
            </button>
            <button
              type="button"
              className={`dbscan-preset-btn ${selectedPointId === 31 ? 'active' : ''}`}
              onClick={() => setSelectedPointId(31)}
            >
              ◌ Border Sample (#31)
            </button>
            <button
              type="button"
              className={`dbscan-preset-btn ${selectedPointId === 73 ? 'active' : ''}`}
              onClick={() => setSelectedPointId(73)}
            >
              ⨂ Noise Sample (#73)
            </button>
          </div>

          {/* Interactive SVG Canvas */}
          <div className="dbscan-svg-container">
            <svg viewBox="5 8 94 85" className="dbscan-svg" aria-label="StatQuest DBSCAN interactive circle inspector">
              {/* Subtle background coordinate grid */}
              <line x1="10" y1="50" x2="94" y2="50" stroke="var(--bd)" strokeWidth="0.4" strokeDasharray="2 3" opacity="0.5" />
              <line x1="50" y1="10" x2="50" y2="90" stroke="var(--bd)" strokeWidth="0.4" strokeDasharray="2 3" opacity="0.5" />

              {/* Connecting dashed lines from selected point to neighbors inside circle */}
              {selectedNb.map(j => (
                <line
                  key={`line-${j}`}
                  x1={selectedPoint.x}
                  y1={100 - selectedPoint.y}
                  x2={ALL_POINTS[j].x}
                  y2={100 - ALL_POINTS[j].y}
                  stroke={selectedIsCore ? 'var(--p0)' : selectedIsBorder ? 'var(--p3)' : 'var(--p6)'}
                  strokeWidth="0.6"
                  strokeDasharray="1.5 1.5"
                />
              ))}

              {/* The StatQuest Orange Translucent ε-Circle */}
              <circle
                cx={selectedPoint.x}
                cy={100 - selectedPoint.y}
                r={eps}
                fill="rgba(255, 175, 55, 0.42)"
                stroke="#f59f00"
                strokeWidth="1.2"
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
                            ? 'var(--p0)' // Red/orange core center like StatQuest Image 3
                            : selectedIsBorder
                            ? 'var(--tx)'
                            : 'var(--mu)'
                          : inCircle
                          ? 'var(--tx)'
                          : 'var(--cd)'
                      }
                      stroke="var(--tx)"
                      strokeWidth={isSelected ? '0.8' : inCircle ? '0.5' : '0.25'}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Interactive Slider */}
          <div className="dbscan-slider-control-group">
            <div className="dbscan-slider-label-row">
              <span className="dbscan-slider-title">Adjust Circle Radius (ε):</span>
              <span className="dbscan-slider-val">{eps.toFixed(1)} px</span>
            </div>
            <input
              type="range"
              min="5"
              max="14"
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
                  ? '◌ BORDER POINT (NON-CORE)'
                  : '⨂ NOISE OUTLIER'}
              </span>
              <span className="dbscan-count-badge">
                Neighbors in circle: <b>{selectedNb.length} other points</b> (MinPts = 4)
              </span>
            </div>

            <p className="dbscan-status-text">
              {selectedIsCore ? (
                <>
                  Point #{selectedPoint.id} overlaps <b>{selectedNb.length} other points</b> ($\ge 4$). Because it reaches at least 4 neighbors, its center turns red and it initiates a cluster!
                </>
              ) : selectedIsBorder ? (
                <>
                  Point #{selectedPoint.id} overlaps only <b>{selectedNb.length} other points</b> ($&lt; 4$). It is a Non-Core point, but because it overlaps a Core Point&apos;s circle, it joins the cluster edge.
                </>
              ) : (
                <>
                  Point #{selectedPoint.id} overlaps only <b>{selectedNb.length} other points</b> ($&lt; 4$) and does not touch any Core Point. DBSCAN marks it as isolated Noise.
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
            DBSCAN assigns every point into one of three roles based on orange circle overlap and density connectivity.
          </p>

          <div className="dbscan-type-grid">
            <div className="dbscan-type-card core">
              <div className="dbscan-type-header">
                <span className="dbscan-type-dot core" />
                <span className="dbscan-type-title">Core Points</span>
                <span className="dbscan-type-count">{coreCount} pts</span>
              </div>
              <div className="dbscan-type-math">
                <Tex f="|N_\varepsilon(\mathbf{p})| \ge 4 \text{ other points}" inline />
              </div>
              <p className="dbscan-type-desc">
                Dense interior points whose orange circles overlap at least 4 other points. They form the backbone of clusters.
              </p>
            </div>

            <div className="dbscan-type-card border">
              <div className="dbscan-type-header">
                <span className="dbscan-type-dot border" />
                <span className="dbscan-type-title">Non-Core / Border Points</span>
                <span className="dbscan-type-count">{borderCount} pts</span>
              </div>
              <div className="dbscan-type-math">
                <Tex f="|N_\varepsilon(\mathbf{p})| < 4 \land \text{Touches Core Circle}" inline />
              </div>
              <p className="dbscan-type-desc">
                Perimeter points with &lt; 4 neighbors that fall inside a Core Point&apos;s orange circle. They join the cluster at the end.
              </p>
            </div>

            <div className="dbscan-type-card noise">
              <div className="dbscan-type-header">
                <span className="dbscan-type-dot noise" />
                <span className="dbscan-type-title">Noise Outliers</span>
                <span className="dbscan-type-count">{noiseCount} pts</span>
              </div>
              <div className="dbscan-type-math">
                <Tex f="|N_\varepsilon(\mathbf{p})| < 4 \land \text{Never Touches Core}" inline />
              </div>
              <p className="dbscan-type-desc">
                Isolated points that never overlap any Core Point&apos;s orange circle. DBSCAN safely flags them as noise.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: Final 2 Clusters Discovered (StatQuest Image 1)
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
            DBSCAN chained through overlapping orange circles to discover exactly <b>2 natural clusters</b> (Green &amp; Blue), leaving the 5 noise points isolated!
          </p>

          <div className="dbscan-cluster-stat-grid">
            <div className="dbscan-cluster-box c1">
              <div className="dbscan-cluster-title">Cluster 1: Green Sweeping Hook</div>
              <div className="dbscan-cluster-val">53 Points</div>
              <div className="dbscan-cluster-sub">Dense blob + sweeping curved tail</div>
            </div>

            <div className="dbscan-cluster-box c2">
              <div className="dbscan-cluster-title">Cluster 2: Blue Compact Circle</div>
              <div className="dbscan-cluster-val">16 Points</div>
              <div className="dbscan-cluster-sub">Separate upper-right cluster</div>
            </div>

            <div className="dbscan-cluster-box noise">
              <div className="dbscan-cluster-title">Noise Points: Grey Outliers</div>
              <div className="dbscan-cluster-val">5 Points</div>
              <div className="dbscan-cluster-sub">Isolated points that never touch any core circle</div>
            </div>
          </div>

          <div className="dbscan-insight-box">
            <span className="dbscan-insight-tag">WHY K-MEANS FAILS HERE</span>
            <p className="dbscan-insight-text">
              K-Means assumes spherical clusters and has no concept of noise. It would artificially slice the sweeping green hook into two halves and drag cluster centers out toward the 5 grey outliers. DBSCAN follows density chains naturally and isolates noise completely!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
