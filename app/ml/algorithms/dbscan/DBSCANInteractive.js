'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Tex from '../../../../components/Tex';
import { DATASETS } from './dbscan';

// Cluster color palette matching Atlas theme variables
const CLUSTER_COLORS = [
  'var(--p2)', // Cluster 1: Emerald/Green
  'var(--p0)', // Cluster 2: Cyan/Teal
  'var(--p1)', // Cluster 3: Amber/Orange
  'var(--p3)', // Cluster 4: Purple/Violet
  'var(--p4)', // Cluster 5: Pink/Rose
  '#6366f1',  // Cluster 6: Indigo
  '#14b8a6'   // Cluster 7: Teal
];

export default function DBSCANInteractive({ activeEps = 8.5, onSelectEps }) {
  const [activeTab, setActiveTab] = useState('inspect'); // 'inspect' | 'expansion' | 'reachability' | 'kdist'
  const [datasetKey, setDatasetKey] = useState('statquest');
  const [eps, setEps] = useState(typeof activeEps === 'number' ? activeEps : 8.5);
  const [minPts, setMinPts] = useState(4);
  const [selectedPointId, setSelectedPointId] = useState(10); // Center point in StatQuest blob

  // Tab 2: Step-by-Step BFS state
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1); // 1x or 2x
  const playTimerRef = useRef(null);

  // Tab 3: Reachability & Connectivity state
  const [ptAId, setPtAId] = useState(10);
  const [ptBId, setPtBId] = useState(31);
  const [pickingTarget, setPickingTarget] = useState(null); // 'A' | 'B' | null

  // Tab 4: k-Distance knee state
  const [hoveredKDistId, setHoveredKDistId] = useState(null);

  // Active dataset
  const activeDataset = DATASETS[datasetKey] || DATASETS.statquest;
  const points = activeDataset.points;

  // Sync eps with parent workspace if provided
  useEffect(() => {
    if (typeof activeEps === 'number' && Math.abs(activeEps - eps) > 0.05 && datasetKey === 'statquest') {
      setEps(activeEps);
    }
  }, [activeEps, datasetKey]);

  const handleEpsChange = val => {
    setEps(val);
    if (onSelectEps && datasetKey === 'statquest') onSelectEps(val);
  };

  const handleDatasetChange = key => {
    setDatasetKey(key);
    const ds = DATASETS[key];
    if (ds) {
      setEps(ds.defaultEps);
      setMinPts(ds.defaultMinPts);
      setSelectedPointId(ds.points[0]?.id ?? 0);
      setPtAId(ds.points[0]?.id ?? 0);
      setPtBId(ds.points[Math.min(ds.points.length - 1, 20)]?.id ?? 1);
      setStepIdx(0);
      setIsPlaying(false);
      if (onSelectEps && key === 'statquest') onSelectEps(ds.defaultEps);
    }
  };

  const dist = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

  // Compute full DBSCAN clustering telemetry for active dataset
  const clustering = useMemo(() => {
    const P = points;
    const N = P.length;

    // 1. Compute ε-neighborhoods (excluding point itself for counting other neighbors)
    const nb = P.map((p, i) =>
      P.reduce((acc, q, j) => (j !== i && dist(p, q) <= eps ? acc.concat(j) : acc), [])
    );

    // 2. Core points condition: |N_ε(p)| ≥ minPts other points
    const core = nb.map(a => a.length >= minPts);

    // 3. Cluster formation via BFS over core points
    const labels = P.map(() => -1);
    let nc = 0;

    core.forEach((c, i) => {
      if (!c || labels[i] >= 0) return;
      const q = [i];
      labels[i] = nc;

      while (q.length) {
        const u = q.shift();
        if (!core[u]) continue;
        nb[u].forEach(v => {
          if (labels[v] < 0) {
            labels[v] = nc;
            q.push(v);
          }
        });
      }
      nc++;
    });

    const border = P.map((p, i) => !core[i] && labels[i] >= 0);
    const noise = P.map((p, i) => labels[i] < 0);

    return {
      neighborhoods: nb,
      isCore: core,
      isBorder: border,
      isNoise: noise,
      clusterLabels: labels,
      numClusters: nc,
      coreCount: core.filter(Boolean).length,
      borderCount: border.filter(Boolean).length,
      noiseCount: noise.filter(Boolean).length
    };
  }, [points, eps, minPts]);

  // Selected point data
  const selectedPoint = points.find(p => p.id === selectedPointId) || points[0];
  const selectedNb = clustering.neighborhoods[selectedPoint.id] || [];
  const selectedIsCore = clustering.isCore[selectedPoint.id];
  const selectedIsBorder = clustering.isBorder[selectedPoint.id];
  const selectedIsNoise = clustering.isNoise[selectedPoint.id];
  const selectedCluster = clustering.clusterLabels[selectedPoint.id];

  // =========================================================================
  // TAB 2: Precomputed Step-by-Step BFS Execution Steps (Ester et al. 1996)
  // =========================================================================
  const bfsSteps = useMemo(() => {
    const P = points;
    const N = P.length;
    const nb = clustering.neighborhoods;
    const core = clustering.isCore;

    const labels = Array(N).fill(-1);
    const visited = Array(N).fill(false);
    const steps = [];
    let clusterCount = 0;

    steps.push({
      step: 0,
      type: 'init',
      activeId: -1,
      clusterId: -1,
      queue: [],
      labels: [...labels],
      desc: `Algorithm initialized with N = ${N} unvisited points, ε = ${eps.toFixed(1)}, and MinPts = ${minPts}.`
    });

    for (let i = 0; i < N; i++) {
      if (visited[i]) continue;
      visited[i] = true;

      if (!core[i]) {
        steps.push({
          step: steps.length,
          type: 'noise_flag',
          activeId: i,
          clusterId: -1,
          queue: [],
          labels: [...labels],
          desc: `Point #${i} has only ${nb[i].length} neighbors (< MinPts ${minPts}). Provisionally flagged as NOISE.`
        });
        continue;
      }

      // Point is a Core point: initiate new cluster
      const currentC = clusterCount;
      labels[i] = currentC;
      const queue = [...nb[i]];

      steps.push({
        step: steps.length,
        type: 'seed_core',
        activeId: i,
        clusterId: currentC,
        queue: [...queue],
        labels: [...labels],
        desc: `Point #${i} is a CORE point with ${nb[i].length} neighbors (≥ ${minPts}). Initiating Cluster ${currentC + 1} and queuing all ${queue.length} neighbors.`
      });

      let qIdx = 0;
      while (qIdx < queue.length) {
        const q = queue[qIdx++];

        if (!visited[q]) {
          visited[q] = true;
          labels[q] = currentC;

          if (core[q]) {
            // Frontier point is also Core: expand queue with new unvisited neighbors
            const newNeighbors = nb[q].filter(v => !queue.includes(v) && v !== i);
            queue.push(...newNeighbors);

            steps.push({
              step: steps.length,
              type: 'expand_core',
              activeId: q,
              clusterId: currentC,
              queue: queue.slice(qIdx),
              labels: [...labels],
              desc: `Frontier point #${q} is also a CORE point (${nb[q].length} neighbors). Appending ${newNeighbors.length} new neighbors to the expansion queue.`
            });
          } else {
            // Frontier point is Border: joins cluster without expanding queue
            steps.push({
              step: steps.length,
              type: 'add_border',
              activeId: q,
              clusterId: currentC,
              queue: queue.slice(qIdx),
              labels: [...labels],
              desc: `Frontier point #${q} has only ${nb[q].length} neighbors (< ${minPts}). Assigned as a BORDER point to Cluster ${currentC + 1} (does not expand).`
            });
          }
        } else if (labels[q] === -1) {
          // Point was provisionally marked as noise earlier, now rescued by core!
          labels[q] = currentC;
          steps.push({
            step: steps.length,
            type: 'rescue_noise',
            activeId: q,
            clusterId: currentC,
            queue: queue.slice(qIdx),
            labels: [...labels],
            desc: `Point #${q} was previously flagged as noise, but falls within a Core point's circle! Rescued as a BORDER point for Cluster ${currentC + 1}.`
          });
        }
      }

      steps.push({
        step: steps.length,
        type: 'cluster_done',
        activeId: i,
        clusterId: currentC,
        queue: [],
        labels: [...labels],
        desc: `Expansion queue empty! Cluster ${currentC + 1} completely formed with ${labels.filter(l => l === currentC).length} points.`
      });

      clusterCount++;
    }

    steps.push({
      step: steps.length,
      type: 'finished',
      activeId: -1,
      clusterId: -1,
      queue: [],
      labels: [...labels],
      desc: `DBSCAN complete! Found ${clusterCount} clusters and flagged ${labels.filter(l => l < 0).length} noise outliers.`
    });

    return steps;
  }, [points, eps, minPts, clustering]);

  // Stepper playback timer
  useEffect(() => {
    if (isPlaying) {
      const delay = playSpeed === 2 ? 350 : 700;
      playTimerRef.current = setTimeout(() => {
        setStepIdx(prev => {
          if (prev >= bfsSteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, delay);
    }
    return () => clearTimeout(playTimerRef.current);
  }, [isPlaying, stepIdx, bfsSteps.length, playSpeed]);

  const currentBfsStep = bfsSteps[Math.min(stepIdx, bfsSteps.length - 1)] || bfsSteps[0];

  // =========================================================================
  // TAB 3: Formal Reachability & Connectivity Graph (Ester et al. 1996)
  // =========================================================================
  const reachabilityAnalysis = useMemo(() => {
    const P = points;
    const nb = clustering.neighborhoods;
    const core = clustering.isCore;

    const pA = points.find(p => p.id === ptAId) || points[0];
    const pB = points.find(p => p.id === ptBId) || points[1];

    // 1. Direct Density-Reachability (Asymmetric)
    // p is directly density-reachable from q iff p ∈ N_ε(q) AND q is Core
    const aDirectFromB = nb[pB.id]?.includes(pA.id) && core[pB.id];
    const bDirectFromA = nb[pA.id]?.includes(pB.id) && core[pA.id];

    // 2. Density-Reachability (Chain of core points, Asymmetric for border)
    // Find shortest directed path of core hops from start to target
    function findDirectedPath(startId, targetId) {
      if (startId === targetId) return [startId];
      if (!core[startId]) return null;

      const q = [[startId]];
      const visited = new Set([startId]);

      while (q.length) {
        const path = q.shift();
        const curr = path[path.length - 1];

        for (const neighbor of nb[curr] || []) {
          if (neighbor === targetId) return [...path, neighbor];
          if (!visited.has(neighbor) && core[neighbor]) {
            visited.add(neighbor);
            q.push([...path, neighbor]);
          }
        }
      }
      return null;
    }

    const pathToAFromB = findDirectedPath(pB.id, pA.id);
    const pathToBFromA = findDirectedPath(pA.id, pB.id);

    // 3. Density-Connectivity (Symmetric equivalence relation)
    // ∃ common ancestor core point o such that o ~> pA AND o ~> pB
    let commonAncestor = null;
    let pathToAFromO = null;
    let pathToBFromO = null;

    if (clustering.clusterLabels[pA.id] >= 0 && clustering.clusterLabels[pA.id] === clustering.clusterLabels[pB.id]) {
      // Points belong to the same cluster, therefore they MUST be density-connected!
      const coreIds = P.map((_, i) => i).filter(i => core[i] && clustering.clusterLabels[i] === clustering.clusterLabels[pA.id]);

      for (const c of coreIds) {
        const p1 = findDirectedPath(c, pA.id);
        const p2 = findDirectedPath(c, pB.id);
        if (p1 && p2) {
          commonAncestor = c;
          pathToAFromO = p1;
          pathToBFromO = p2;
          break;
        }
      }
    }

    return {
      pA,
      pB,
      aDirectFromB,
      bDirectFromA,
      pathToAFromB,
      pathToBFromA,
      isDensityConnected: commonAncestor !== null,
      commonAncestor,
      pathToAFromO,
      pathToBFromO
    };
  }, [points, ptAId, ptBId, clustering]);

  // =========================================================================
  // TAB 4: Parameter Selection: Sorted k-Distance Knee Plot (Ester et al. §4.2)
  // =========================================================================
  const kDistAnalysis = useMemo(() => {
    const P = points;
    const N = P.length;
    const k = minPts; // Distance to k-th nearest neighbor

    const rawKDist = P.map((p, i) => {
      const allDists = P.map((q, j) => (i === j ? Infinity : dist(p, q))).sort((a, b) => a - b);
      const kDistVal = allDists[Math.min(k - 1, allDists.length - 1)];
      return { id: i, d: kDistVal, pt: p };
    });

    // Sort ascending
    const sorted = [...rawKDist].sort((a, b) => a.d - b.d);

    // Kneedle algorithm to detect optimal elbow/knee point
    let kneeIdx = Math.floor(N * 0.7);
    if (N >= 3) {
      const p1 = { x: 0, y: sorted[0].d };
      const p2 = { x: N - 1, y: sorted[N - 1].d };
      const lineLen = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;

      let maxDist = -1;
      for (let i = 0; i < N; i++) {
        const p0 = { x: i, y: sorted[i].d };
        const perpDist =
          Math.abs((p2.y - p1.y) * p0.x - (p2.x - p1.x) * p0.y + p2.x * p1.y - p2.y * p1.x) / lineLen;
        if (perpDist > maxDist) {
          maxDist = perpDist;
          kneeIdx = i;
        }
      }
    }

    const kneeItem = sorted[kneeIdx] || sorted[0];
    const maxVal = Math.max(15, sorted[sorted.length - 1]?.d * 1.08 || 15);

    return {
      sorted,
      kneeIdx,
      kneeVal: kneeItem.d,
      kneePointId: kneeItem.id,
      maxVal
    };
  }, [points, minPts]);

  return (
    <div className="dbscan-interactive-card">
      <div className="telemetry-eyebrow">INTERACTIVE EXPLORER · DBSCAN</div>

      {/* Dataset Picker Pill Bar */}
      <div className="dbscan-dataset-bar">
        {Object.entries(DATASETS).map(([key, ds]) => (
          <button
            key={key}
            type="button"
            className={`dbscan-dataset-btn ${datasetKey === key ? 'active' : ''}`}
            onClick={() => handleDatasetChange(key)}
          >
            {ds.name}
          </button>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="dbscan-tab-bar">
        <button
          type="button"
          className={`dbscan-tab-btn ${activeTab === 'inspect' ? 'active' : ''}`}
          onClick={() => setActiveTab('inspect')}
        >
          Neighborhood &amp; Core
        </button>
        <button
          type="button"
          className={`dbscan-tab-btn ${activeTab === 'expansion' ? 'active' : ''}`}
          onClick={() => setActiveTab('expansion')}
        >
          BFS Expansion Queue
        </button>
        <button
          type="button"
          className={`dbscan-tab-btn ${activeTab === 'reachability' ? 'active' : ''}`}
          onClick={() => setActiveTab('reachability')}
        >
          Reachability Theory
        </button>
        <button
          type="button"
          className={`dbscan-tab-btn ${activeTab === 'kdist' ? 'active' : ''}`}
          onClick={() => setActiveTab('kdist')}
        >
          k-Distance Knee (§4.2)
        </button>
      </div>

      {/* =========================================================================
          TAB 1: Neighborhood & Core Point Inspector
          ========================================================================= */}
      {activeTab === 'inspect' && (
        <div className="dbscan-tab-content">
          <div className="dbscan-card-header">
            <h4 className="dbscan-card-title">{activeDataset.name}</h4>
            <span className="dbscan-pill-badge">
              Radius ε: <b>{eps.toFixed(1)}px</b> · MinPts: <b>{minPts} neighbors</b>
            </span>
          </div>

          <p className="dbscan-card-desc">
            <b>Click any point below</b> to draw its translucent ε-circle. Points needing at least <b>MinPts = {minPts} neighbors</b> inside their circle become Core Points.
          </p>

          {/* Quick preset buttons for active dataset */}
          <div className="dbscan-preset-pills">
            <button
              type="button"
              className={`dbscan-preset-btn ${selectedIsCore ? 'active' : ''}`}
              onClick={() => {
                const firstCore = points.find(p => clustering.isCore[p.id]);
                if (firstCore) setSelectedPointId(firstCore.id);
              }}
            >
              ● Sample Core Point
            </button>
            <button
              type="button"
              className={`dbscan-preset-btn ${selectedIsBorder ? 'active' : ''}`}
              onClick={() => {
                const firstBorder = points.find(p => clustering.isBorder[p.id]);
                if (firstBorder) setSelectedPointId(firstBorder.id);
              }}
            >
              ◌ Sample Border Point
            </button>
            <button
              type="button"
              className={`dbscan-preset-btn ${selectedIsNoise ? 'active' : ''}`}
              onClick={() => {
                const firstNoise = points.find(p => clustering.isNoise[p.id]);
                if (firstNoise) setSelectedPointId(firstNoise.id);
              }}
            >
              ⨂ Sample Noise Outlier
            </button>
          </div>

          {/* Interactive SVG Canvas */}
          <div className="dbscan-svg-container">
            <svg viewBox="0 0 100 100" className="dbscan-svg" aria-label="DBSCAN interactive scatter plot">
              {/* Subtle coordinate grid lines */}
              <line x1="5" y1="50" x2="95" y2="50" stroke="var(--bd)" strokeWidth="0.3" strokeDasharray="2 3" opacity="0.4" />
              <line x1="50" y1="5" x2="50" y2="95" stroke="var(--bd)" strokeWidth="0.3" strokeDasharray="2 3" opacity="0.4" />

              {/* Connecting dashed rays to neighbors in circle */}
              {selectedNb.map(j => (
                <line
                  key={`ray-${j}`}
                  x1={selectedPoint.x}
                  y1={100 - selectedPoint.y}
                  x2={points[j].x}
                  y2={100 - points[j].y}
                  stroke={selectedIsCore ? 'var(--p1)' : 'var(--mu)'}
                  strokeWidth="0.6"
                  strokeDasharray="1.5 1.5"
                />
              ))}

              {/* Translucent ε-Circle */}
              <circle
                cx={selectedPoint.x}
                cy={100 - selectedPoint.y}
                r={eps}
                fill="rgba(245, 159, 0, 0.28)"
                stroke="var(--p1)"
                strokeWidth="1.2"
              />

              {/* Points */}
              {points.map(p => {
                const isSelected = p.id === selectedPoint.id;
                const inCircle = selectedNb.includes(p.id);
                const isCore = clustering.isCore[p.id];
                const isBorder = clustering.isBorder[p.id];
                const cLabel = clustering.clusterLabels[p.id];
                const clusterColor = cLabel >= 0 ? CLUSTER_COLORS[cLabel % CLUSTER_COLORS.length] : 'var(--mu)';

                return (
                  <g
                    key={p.id}
                    className="dbscan-node-pt"
                    onClick={() => setSelectedPointId(p.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Outer halo ring if selected */}
                    {isSelected && (
                      <circle
                        cx={p.x}
                        cy={100 - p.y}
                        r="4.4"
                        fill="none"
                        stroke="var(--tx)"
                        strokeWidth="0.9"
                      />
                    )}

                    {/* Core Point halo */}
                    {isCore && (
                      <circle
                        cx={p.x}
                        cy={100 - p.y}
                        r="2.8"
                        fill="none"
                        stroke={clusterColor}
                        strokeWidth="0.7"
                        opacity="0.8"
                      />
                    )}

                    {/* Point Circle */}
                    <circle
                      cx={p.x}
                      cy={100 - p.y}
                      r={isSelected ? '3.0' : inCircle ? '2.3' : '1.8'}
                      fill={
                        isCore
                          ? clusterColor
                          : isBorder
                          ? 'var(--bg)'
                          : 'var(--mu)'
                      }
                      stroke={
                        isCore
                          ? 'var(--tx)'
                          : isBorder
                          ? clusterColor
                          : 'var(--tx)'
                      }
                      strokeWidth={isBorder ? '1.2' : '0.4'}
                    />

                    {/* Cross marker for noise */}
                    {!isCore && !isBorder && (
                      <line
                        x1={p.x - 0.9}
                        y1={100 - p.y - 0.9}
                        x2={p.x + 0.9}
                        y2={100 - p.y + 0.9}
                        stroke="var(--bg)"
                        strokeWidth="0.4"
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Dual Sliders: Radius eps and MinPts */}
          <div className="dbscan-controls-grid">
            <div className="dbscan-slider-control-group">
              <div className="dbscan-slider-label-row">
                <span className="dbscan-slider-title">Radius (ε):</span>
                <span className="dbscan-slider-val">{eps.toFixed(1)} px</span>
              </div>
              <div className="dbscan-slider-track-wrap">
                <input
                  type="range"
                  min="3.0"
                  max="16.0"
                  step="0.5"
                  value={eps}
                  onChange={e => handleEpsChange(Number(e.target.value))}
                  className="dbscan-slider"
                  aria-label="Neighborhood radius eps slider"
                />
              </div>
              <div className="dbscan-slider-scale-row">
                <span>Tight (3.0px)</span>
                <span>Wide (16.0px)</span>
              </div>
            </div>

            <div className="dbscan-slider-control-group">
              <div className="dbscan-slider-label-row">
                <span className="dbscan-slider-title">MinPts (Threshold):</span>
                <span className="dbscan-slider-val">{minPts} other pts</span>
              </div>
              <div className="dbscan-slider-track-wrap">
                <input
                  type="range"
                  min="2"
                  max="8"
                  step="1"
                  value={minPts}
                  onChange={e => setMinPts(Number(e.target.value))}
                  className="dbscan-slider"
                  aria-label="MinPts threshold slider"
                />
              </div>
              <div className="dbscan-slider-scale-row">
                <span>Sparse (2 pts)</span>
                <span>Dense (8 pts)</span>
              </div>
            </div>
          </div>

          {/* Live Classification Status Box */}
          <div
            className={`dbscan-status-card ${
              selectedIsCore ? 'core' : selectedIsBorder ? 'border' : 'noise'
            }`}
          >
            <div className="dbscan-status-header">
              <span className="dbscan-status-badge">
                {selectedIsCore
                  ? `● CORE POINT (CLUSTER ${selectedCluster + 1})`
                  : selectedIsBorder
                  ? `◌ BORDER POINT (JOINED CLUSTER ${selectedCluster + 1})`
                  : '⨂ NOISE OUTLIER (-1)'}
              </span>
              <span className="dbscan-count-badge">
                Neighbors within ε: <b>{selectedNb.length} points</b> (MinPts = {minPts})
              </span>
            </div>

            <p className="dbscan-status-text">
              {selectedIsCore ? (
                <>
                  Point #{selectedPoint.id} overlaps <b>{selectedNb.length} other points</b> (&ge; {minPts}). Because it satisfies <Tex f="|N_\varepsilon(\mathbf{p})| \ge \text{MinPts}" inline />, it is a dense <b>Core Point</b> that seeds and propagates cluster expansion!
                </>
              ) : selectedIsBorder ? (
                <>
                  Point #{selectedPoint.id} overlaps only <b>{selectedNb.length} other points</b> (&lt; {minPts}). It is non-core, but because it falls within distance &epsilon; of a Core Point, it is density-reachable and joins the cluster border.
                </>
              ) : (
                <>
                  Point #{selectedPoint.id} overlaps only <b>{selectedNb.length} other points</b> (&lt; {minPts}) and does not touch any Core Point. DBSCAN safely flags it as unassigned <b>Noise (Label -1)</b>.
                </>
              )}
            </p>
          </div>

          {/* Live Summary Pills */}
          <div className="dbscan-summary-pill-grid">
            <div className="dbscan-summary-pill">
              <span className="dbscan-summary-pill-title">Core Points</span>
              <span className="dbscan-summary-pill-val" style={{ color: 'var(--p2)' }}>{clustering.coreCount}</span>
            </div>
            <div className="dbscan-summary-pill">
              <span className="dbscan-summary-pill-title">Border Points</span>
              <span className="dbscan-summary-pill-val" style={{ color: 'var(--p1)' }}>{clustering.borderCount}</span>
            </div>
            <div className="dbscan-summary-pill">
              <span className="dbscan-summary-pill-title">Noise Outliers</span>
              <span className="dbscan-summary-pill-val" style={{ color: 'var(--p6)' }}>{clustering.noiseCount}</span>
            </div>
            <div className="dbscan-summary-pill">
              <span className="dbscan-summary-pill-title">Clusters Discovered</span>
              <span className="dbscan-summary-pill-val" style={{ color: 'var(--tx)' }}>{clustering.numClusters}</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: Step-by-Step BFS Expansion Queue (Ester et al. 1996)
          ========================================================================= */}
      {activeTab === 'expansion' && (
        <div className="dbscan-tab-content">
          <div className="dbscan-card-header">
            <h4 className="dbscan-card-title">Algorithmic Queue Walkthrough</h4>
            <span className="dbscan-pill-badge">
              Step {stepIdx + 1} of {bfsSteps.length}
            </span>
          </div>

          <p className="dbscan-card-desc">
            Visualizing the exact breadth-first frontier queue ($S$) from Ester et al. (1996). Core points push new neighbors to the queue; border points join the cluster without expanding.
          </p>

          {/* Stepper Playback Controls */}
          <div className="dbscan-stepper-bar">
            <button
              type="button"
              className="dbscan-step-btn"
              onClick={() => {
                setStepIdx(0);
                setIsPlaying(false);
              }}
              disabled={stepIdx === 0}
              title="Reset to beginning"
            >
              ⏮ Reset
            </button>
            <button
              type="button"
              className="dbscan-step-btn"
              onClick={() => {
                setStepIdx(s => Math.max(0, s - 1));
                setIsPlaying(false);
              }}
              disabled={stepIdx === 0}
              title="Previous step"
            >
              ◀ Step
            </button>
            <button
              type="button"
              className={`dbscan-step-btn ${isPlaying ? '' : 'play'}`}
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? 'Pause simulation' : 'Auto-play simulation'}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
            <button
              type="button"
              className="dbscan-step-btn"
              onClick={() => {
                setStepIdx(s => Math.min(bfsSteps.length - 1, s + 1));
                setIsPlaying(false);
              }}
              disabled={stepIdx >= bfsSteps.length - 1}
              title="Next step"
            >
              Step ▶
            </button>
            <button
              type="button"
              className="dbscan-step-btn"
              onClick={() => setPlaySpeed(s => (s === 1 ? 2 : 1))}
              title="Toggle speed"
            >
              {playSpeed}x Speed
            </button>

            <div className="dbscan-step-scrubber">
              <input
                type="range"
                min="0"
                max={Math.max(0, bfsSteps.length - 1)}
                value={stepIdx}
                onChange={e => {
                  setStepIdx(Number(e.target.value));
                  setIsPlaying(false);
                }}
                className="dbscan-slider"
                aria-label="Simulation step scrubber"
              />
              <span className="dbscan-step-counter">
                {stepIdx + 1} / {bfsSteps.length}
              </span>
            </div>
          </div>

          {/* Telemetry Row */}
          <div className="dbscan-telemetry-row">
            <div className="dbscan-telemetry-chip">
              Active Cluster: <b>{currentBfsStep.clusterId >= 0 ? `C${currentBfsStep.clusterId + 1}` : 'None'}</b>
            </div>
            <div className="dbscan-telemetry-chip">
              Queue Size |S|: <b>{currentBfsStep.queue?.length || 0} pts</b>
            </div>
            <div className="dbscan-telemetry-chip">
              Clustered: <b>{currentBfsStep.labels?.filter(l => l >= 0).length || 0} pts</b>
            </div>
          </div>

          {/* Canvas for BFS Step View */}
          <div className="dbscan-svg-container">
            <svg viewBox="0 0 100 100" className="dbscan-svg" aria-label="DBSCAN BFS step animation">
              <line x1="5" y1="50" x2="95" y2="50" stroke="var(--bd)" strokeWidth="0.3" strokeDasharray="2 3" opacity="0.4" />
              <line x1="50" y1="5" x2="50" y2="95" stroke="var(--bd)" strokeWidth="0.3" strokeDasharray="2 3" opacity="0.4" />

              {/* Active point's ε-circle */}
              {currentBfsStep.activeId >= 0 && (
                <circle
                  cx={points[currentBfsStep.activeId].x}
                  cy={100 - points[currentBfsStep.activeId].y}
                  r={eps}
                  fill="rgba(0, 180, 216, 0.22)"
                  stroke="var(--p0)"
                  strokeWidth="1.2"
                />
              )}

              {/* Points */}
              {points.map(p => {
                const isActive = p.id === currentBfsStep.activeId;
                const inQueue = currentBfsStep.queue?.includes(p.id);
                const cLabel = currentBfsStep.labels?.[p.id];
                const hasCluster = cLabel >= 0;
                const clusterColor = hasCluster ? CLUSTER_COLORS[cLabel % CLUSTER_COLORS.length] : 'var(--mu)';

                return (
                  <g key={p.id}>
                    {/* Active point pulsing halo */}
                    {isActive && (
                      <circle
                        cx={p.x}
                        cy={100 - p.y}
                        r="4.6"
                        fill="none"
                        stroke="var(--p0)"
                        strokeWidth="1.0"
                      />
                    )}

                    {/* Queue member highlight */}
                    {inQueue && !isActive && (
                      <circle
                        cx={p.x}
                        cy={100 - p.y}
                        r="3.6"
                        fill="none"
                        stroke="var(--p1)"
                        strokeWidth="0.8"
                        strokeDasharray="1.5 1.5"
                      />
                    )}

                    <circle
                      cx={p.x}
                      cy={100 - p.y}
                      r={isActive ? '3.2' : inQueue ? '2.4' : '1.8'}
                      fill={
                        isActive
                          ? 'var(--p0)'
                          : hasCluster
                          ? clusterColor
                          : inQueue
                          ? 'var(--p1)'
                          : 'var(--cd)'
                      }
                      stroke="var(--tx)"
                      strokeWidth={isActive ? '0.8' : '0.3'}
                      opacity={hasCluster || inQueue || isActive ? 1.0 : 0.45}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Algorithmic Log Box */}
          <div className="dbscan-step-log">
            <span style={{ color: 'var(--p1)', fontWeight: 'bold' }}>&gt; </span>
            {currentBfsStep.desc}
          </div>

          {/* Queue Items Chips */}
          {currentBfsStep.queue?.length > 0 && (
            <div className="dbscan-queue-chips">
              <span style={{ fontSize: '11px', color: 'var(--mu)', marginRight: '4px' }}>Queue S:</span>
              {currentBfsStep.queue.slice(0, 15).map(qId => (
                <span key={qId} className="dbscan-queue-pill">
                  #{qId}
                </span>
              ))}
              {currentBfsStep.queue.length > 15 && (
                <span style={{ fontSize: '10px', color: 'var(--mu)' }}>
                  +{currentBfsStep.queue.length - 15} more
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: Reachability & Connectivity Theory Lab (Ester et al. 1996)
          ========================================================================= */}
      {activeTab === 'reachability' && (
        <div className="dbscan-tab-content">
          <div className="dbscan-card-header">
            <h4 className="dbscan-card-title">Formal Density-Reachability Lab</h4>
            <span className="dbscan-pill-badge">Ester et al. (1996) Theorems</span>
          </div>

          <p className="dbscan-card-desc">
            Test the 3 foundational mathematical definitions of DBSCAN between <b>Point A</b> and <b>Point B</b>. Notice how direct reachability is <i>asymmetric</i> for border points, while density-connectivity is symmetric and reflexive!
          </p>

          {/* Point Selection Controls */}
          <div className="dbscan-pair-row">
            <span className="dbscan-pair-label">Selected Pair:</span>
            <button
              type="button"
              className={`dbscan-point-btn ptA ${pickingTarget === 'A' ? 'active' : ''}`}
              onClick={() => setPickingTarget(pickingTarget === 'A' ? null : 'A')}
            >
              Point A: #{reachabilityAnalysis.pA.id} ({clustering.isCore[reachabilityAnalysis.pA.id] ? 'Core' : clustering.isBorder[reachabilityAnalysis.pA.id] ? 'Border' : 'Noise'})
            </button>
            <span style={{ color: 'var(--mu)', fontSize: '11px' }}>vs</span>
            <button
              type="button"
              className={`dbscan-point-btn ptB ${pickingTarget === 'B' ? 'active' : ''}`}
              onClick={() => setPickingTarget(pickingTarget === 'B' ? null : 'B')}
            >
              Point B: #{reachabilityAnalysis.pB.id} ({clustering.isCore[reachabilityAnalysis.pB.id] ? 'Core' : clustering.isBorder[reachabilityAnalysis.pB.id] ? 'Border' : 'Noise'})
            </button>
            {pickingTarget && (
              <span style={{ fontSize: '11px', color: 'var(--p1)', marginLeft: 'auto' }}>
                Click any point in the SVG to assign Point {pickingTarget}!
              </span>
            )}
          </div>

          {/* Preset Pair Scenarios */}
          <div className="dbscan-preset-pills">
            <button
              type="button"
              className="dbscan-preset-btn"
              onClick={() => {
                const corePoints = points.filter(p => clustering.isCore[p.id]);
                if (corePoints.length >= 2) {
                  setPtAId(corePoints[0].id);
                  setPtBId(corePoints[Math.min(corePoints.length - 1, 6)].id);
                }
              }}
            >
              Core ↔ Core
            </button>
            <button
              type="button"
              className="dbscan-preset-btn"
              onClick={() => {
                const c = points.find(p => clustering.isCore[p.id]);
                const b = points.find(p => clustering.isBorder[p.id]);
                if (c && b) {
                  setPtAId(c.id);
                  setPtBId(b.id);
                }
              }}
            >
              Core ↔ Border (Asymmetric!)
            </button>
            <button
              type="button"
              className="dbscan-preset-btn"
              onClick={() => {
                const c = points.find(p => clustering.isCore[p.id]);
                const n = points.find(p => clustering.isNoise[p.id]);
                if (c && n) {
                  setPtAId(c.id);
                  setPtBId(n.id);
                }
              }}
            >
              Cluster ↔ Noise (Disconnected)
            </button>
          </div>

          {/* Canvas with Directed Reachability Arrows */}
          <div className="dbscan-svg-container">
            <svg viewBox="0 0 100 100" className="dbscan-svg" aria-label="DBSCAN reachability directed graph">
              <defs>
                <marker id="dbscan-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--p1)" />
                </marker>
                <marker id="dbscan-arrow-cyan" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--p0)" />
                </marker>
              </defs>

              <line x1="5" y1="50" x2="95" y2="50" stroke="var(--bd)" strokeWidth="0.3" strokeDasharray="2 3" opacity="0.4" />
              <line x1="50" y1="5" x2="50" y2="95" stroke="var(--bd)" strokeWidth="0.3" strokeDasharray="2 3" opacity="0.4" />

              {/* Directed paths from B to A if density-reachable */}
              {reachabilityAnalysis.pathToAFromB && reachabilityAnalysis.pathToAFromB.length > 1 && (
                reachabilityAnalysis.pathToAFromB.slice(0, -1).map((nodeId, idx) => {
                  const nextId = reachabilityAnalysis.pathToAFromB[idx + 1];
                  return (
                    <line
                      key={`path-ba-${idx}`}
                      x1={points[nodeId].x}
                      y1={100 - points[nodeId].y}
                      x2={points[nextId].x}
                      y2={100 - points[nextId].y}
                      stroke="var(--p1)"
                      strokeWidth="1.0"
                      markerEnd="url(#dbscan-arrow)"
                    />
                  );
                })
              )}

              {/* Directed paths from A to B if density-reachable */}
              {reachabilityAnalysis.pathToBFromA && reachabilityAnalysis.pathToBFromA.length > 1 && (
                reachabilityAnalysis.pathToBFromA.slice(0, -1).map((nodeId, idx) => {
                  const nextId = reachabilityAnalysis.pathToBFromA[idx + 1];
                  return (
                    <line
                      key={`path-ab-${idx}`}
                      x1={points[nodeId].x}
                      y1={100 - points[nodeId].y}
                      x2={points[nextId].x}
                      y2={100 - points[nextId].y}
                      stroke="var(--p0)"
                      strokeWidth="1.0"
                      markerEnd="url(#dbscan-arrow-cyan)"
                    />
                  );
                })
              )}

              {/* Common Ancestor Branches if density-connected */}
              {reachabilityAnalysis.commonAncestor !== null && reachabilityAnalysis.pathToAFromO && (
                reachabilityAnalysis.pathToAFromO.slice(0, -1).map((nodeId, idx) => {
                  const nextId = reachabilityAnalysis.pathToAFromO[idx + 1];
                  return (
                    <line
                      key={`path-oa-${idx}`}
                      x1={points[nodeId].x}
                      y1={100 - points[nodeId].y}
                      x2={points[nextId].x}
                      y2={100 - points[nextId].y}
                      stroke="var(--p2)"
                      strokeWidth="0.8"
                      strokeDasharray="2 2"
                    />
                  );
                })
              )}

              {/* Data points */}
              {points.map(p => {
                const isA = p.id === reachabilityAnalysis.pA.id;
                const isB = p.id === reachabilityAnalysis.pB.id;
                const isAncestor = p.id === reachabilityAnalysis.commonAncestor;
                const isCore = clustering.isCore[p.id];
                const cLabel = clustering.clusterLabels[p.id];
                const clusterColor = cLabel >= 0 ? CLUSTER_COLORS[cLabel % CLUSTER_COLORS.length] : 'var(--mu)';

                return (
                  <g
                    key={p.id}
                    onClick={() => {
                      if (pickingTarget === 'A') {
                        setPtAId(p.id);
                        setPickingTarget(null);
                      } else if (pickingTarget === 'B') {
                        setPtBId(p.id);
                        setPickingTarget(null);
                      } else {
                        setPtAId(p.id);
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Ring for A or B */}
                    {(isA || isB) && (
                      <circle
                        cx={p.x}
                        cy={100 - p.y}
                        r="4.8"
                        fill="none"
                        stroke={isA ? 'var(--p0)' : 'var(--p1)'}
                        strokeWidth="1.2"
                      />
                    )}

                    {/* Common ancestor marker */}
                    {isAncestor && !isA && !isB && (
                      <circle
                        cx={p.x}
                        cy={100 - p.y}
                        r="4.2"
                        fill="none"
                        stroke="var(--p2)"
                        strokeWidth="1.0"
                        strokeDasharray="1.5 1.5"
                      />
                    )}

                    <circle
                      cx={p.x}
                      cy={100 - p.y}
                      r={isA || isB || isAncestor ? '3.2' : '1.8'}
                      fill={
                        isA
                          ? 'var(--p0)'
                          : isB
                          ? 'var(--p1)'
                          : isAncestor
                          ? 'var(--p2)'
                          : isCore
                          ? clusterColor
                          : 'var(--cd)'
                      }
                      stroke="var(--tx)"
                      strokeWidth={isA || isB ? '0.8' : '0.3'}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Formal Relation Verdict Cards */}
          <div className="dbscan-relation-grid">
            <div className={`dbscan-relation-box ${reachabilityAnalysis.aDirectFromB || reachabilityAnalysis.bDirectFromA ? 'true' : 'false'}`}>
              <span className="dbscan-relation-tag">
                {reachabilityAnalysis.aDirectFromB && reachabilityAnalysis.bDirectFromA
                  ? 'MUTUAL DIRECT REACHABLE'
                  : reachabilityAnalysis.bDirectFromA
                  ? 'A → B (ASYMMETRIC DIRECT)'
                  : reachabilityAnalysis.aDirectFromB
                  ? 'B → A (ASYMMETRIC DIRECT)'
                  : 'NOT DIRECTLY REACHABLE'}
              </span>
              <div className="dbscan-relation-title">1. Direct Density-Reachability</div>
              <p className="dbscan-relation-desc">
                {reachabilityAnalysis.bDirectFromA && !reachabilityAnalysis.aDirectFromB
                  ? `Point B is directly reachable from Core Point A (B ∈ N_ε(A)). But because B is a Border point, A is NOT directly reachable from B!`
                  : reachabilityAnalysis.aDirectFromB && !reachabilityAnalysis.bDirectFromA
                  ? `Point A is directly reachable from Core Point B (A ∈ N_ε(B)). But because A is a Border point, B is NOT reachable from A!`
                  : reachabilityAnalysis.aDirectFromB && reachabilityAnalysis.bDirectFromA
                  ? `Both points are Core Points within distance ε, so direct reachability holds symmetrically.`
                  : `Neither point lies within the other's ε-neighborhood with Core status.`}
              </p>
            </div>

            <div className={`dbscan-relation-box ${reachabilityAnalysis.pathToBFromA || reachabilityAnalysis.pathToAFromB ? 'true' : 'false'}`}>
              <span className="dbscan-relation-tag">
                {reachabilityAnalysis.pathToBFromA && reachabilityAnalysis.pathToAFromB
                  ? 'MUTUAL DENSITY-REACHABLE'
                  : reachabilityAnalysis.pathToBFromA
                  ? 'A ⤳ B (ASYMMETRIC CHAIN)'
                  : reachabilityAnalysis.pathToAFromB
                  ? 'B ⤳ A (ASYMMETRIC CHAIN)'
                  : 'NOT DENSITY-REACHABLE'}
              </span>
              <div className="dbscan-relation-title">2. Density-Reachability</div>
              <p className="dbscan-relation-desc">
                {reachabilityAnalysis.pathToBFromA
                  ? `Connected via directed chain of ${reachabilityAnalysis.pathToBFromA.length} core hops from A to B.`
                  : reachabilityAnalysis.pathToAFromB
                  ? `Connected via directed chain of ${reachabilityAnalysis.pathToAFromB.length} core hops from B to A.`
                  : `No directed path of Core hops connects Point A and Point B.`}
              </p>
            </div>

            <div className={`dbscan-relation-box ${reachabilityAnalysis.isDensityConnected ? 'true' : 'false'}`}>
              <span className="dbscan-relation-tag">
                {reachabilityAnalysis.isDensityConnected ? 'DENSITY-CONNECTED (TRUE)' : 'NOT CONNECTED (FALSE)'}
              </span>
              <div className="dbscan-relation-title">3. Density-Connectivity</div>
              <p className="dbscan-relation-desc">
                {reachabilityAnalysis.isDensityConnected
                  ? `Symmetric and reflexive! Both points share common ancestor Core Point #${reachabilityAnalysis.commonAncestor}, making them belong to the same cluster.`
                  : `No common core ancestor reaches both points. They belong to separate clusters or noise.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: Parameter Selection: Sorted k-Distance Knee Plot (Ester et al. §4.2)
          ========================================================================= */}
      {activeTab === 'kdist' && (
        <div className="dbscan-tab-content">
          <div className="dbscan-card-header">
            <h4 className="dbscan-card-title">Sorted k-Distance Plot (k = {minPts})</h4>
            <span className="dbscan-pill-badge">
              Recommended Knee ε*: <b>{kDistAnalysis.kneeVal.toFixed(1)}px</b>
            </span>
          </div>

          <p className="dbscan-card-desc">
            Section 4.2 of Ester et al. (1996) introduces the <b>sorted k-dist plot</b> to eliminate trial-and-error. Plotting the distance of each point to its $k$-th nearest neighbor reveals a sharp <b>knee / elbow</b>: points before the knee belong to dense clusters; points after shoot up into noise!
          </p>

          {/* Interactive k-Distance Line Chart */}
          <div className="dbscan-kdist-wrap">
            <svg viewBox="0 0 320 160" className="dbscan-kdist-svg" aria-label="Sorted k-distance plot">
              {/* Plot Margins: left=35, right=15, top=15, bottom=25 */}
              {/* Axes and Grid Lines */}
              <line x1="35" y1="135" x2="305" y2="135" stroke="var(--bd)" strokeWidth="0.8" />
              <line x1="35" y1="15" x2="35" y2="135" stroke="var(--bd)" strokeWidth="0.8" />

              {/* Y-axis Ticks */}
              {[0, 5, 10, 15].map(tick => {
                const yPos = 135 - (tick / kDistAnalysis.maxVal) * 120;
                return (
                  <g key={`ytick-${tick}`}>
                    <line x1="30" y1={yPos} x2="35" y2={yPos} stroke="var(--bd)" strokeWidth="0.6" />
                    <text x="26" y={yPos + 3} fill="var(--mu)" fontSize="8" textAnchor="end" fontFamily="var(--mono)">
                      {tick}
                    </text>
                    <line x1="35" y1={yPos} x2="305" y2={yPos} stroke="var(--bd)" strokeWidth="0.3" strokeDasharray="2 3" opacity="0.3" />
                  </g>
                );
              })}

              {/* Interactive Horizontal Line for Active ε */}
              {(() => {
                const epsY = Math.max(15, Math.min(135, 135 - (eps / kDistAnalysis.maxVal) * 120));
                return (
                  <g>
                    <line
                      x1="35"
                      y1={epsY}
                      x2="305"
                      y2={epsY}
                      stroke="var(--p1)"
                      strokeWidth="1.2"
                      strokeDasharray="3 2"
                    />
                    <text x="303" y={epsY - 4} fill="var(--p1)" fontSize="8.5" textAnchor="end" fontFamily="var(--mono)" fontWeight="bold">
                      Active ε = {eps.toFixed(1)}px
                    </text>
                  </g>
                );
              })()}

              {/* Optimal Knee Line */}
              {(() => {
                const kneeY = 135 - (kDistAnalysis.kneeVal / kDistAnalysis.maxVal) * 120;
                const kneeX = 35 + (kDistAnalysis.kneeIdx / (kDistAnalysis.sorted.length - 1 || 1)) * 270;
                return (
                  <g>
                    <circle cx={kneeX} cy={kneeY} r="4" fill="none" stroke="var(--p2)" strokeWidth="1.2" />
                    <circle cx={kneeX} cy={kneeY} r="2" fill="var(--p2)" />
                    <text x={kneeX} y={kneeY - 7} fill="var(--p2)" fontSize="8" textAnchor="middle" fontFamily="var(--mono)" fontWeight="bold">
                      Elbow Knee ({kDistAnalysis.kneeVal.toFixed(1)}px)
                    </text>
                  </g>
                );
              })()}

              {/* Sorted Curve Points and Line */}
              {(() => {
                const pts = kDistAnalysis.sorted.map((item, idx) => {
                  const x = 35 + (idx / (kDistAnalysis.sorted.length - 1 || 1)) * 270;
                  const y = 135 - (item.d / kDistAnalysis.maxVal) * 120;
                  return { x, y, id: item.id, d: item.d };
                });

                const pathData = pts.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '');

                return (
                  <g>
                    <path d={pathData} fill="none" stroke="var(--tx)" strokeWidth="1.4" />
                    {pts.map(p => {
                      const isHovered = hoveredKDistId === p.id;
                      const isKnee = p.id === kDistAnalysis.kneePointId;
                      return (
                        <circle
                          key={`kd-${p.id}`}
                          cx={p.x}
                          cy={p.y}
                          r={isHovered ? '3.5' : isKnee ? '2.5' : '1.4'}
                          fill={isHovered ? 'var(--p1)' : isKnee ? 'var(--p2)' : 'var(--tx)'}
                          stroke="var(--bg)"
                          strokeWidth="0.5"
                          onMouseEnter={() => setHoveredKDistId(p.id)}
                          onMouseLeave={() => setHoveredKDistId(null)}
                          onClick={() => setSelectedPointId(p.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      );
                    })}
                  </g>
                );
              })()}

              {/* Axis Labels */}
              <text x="170" y="152" fill="var(--mu)" fontSize="8.5" textAnchor="middle" fontFamily="var(--sans)">
                Points Sorted by k-Distance (Ascending) →
              </text>
              <text x="15" y="75" fill="var(--mu)" fontSize="8" textAnchor="middle" fontFamily="var(--sans)" transform="rotate(-90 15 75)">
                k-Distance to {minPts}th Neighbor (px)
              </text>
            </svg>

            <div className="dbscan-kdist-legend">
              <span className="dbscan-kdist-badge knee">
                ● Optimal Elbow Knee: ε ≈ {kDistAnalysis.kneeVal.toFixed(1)}px
              </span>
              <span>
                Points with k-dist ≤ ε: <b>{kDistAnalysis.sorted.filter(s => s.d <= eps).length}</b> / {points.length} (Cluster Core)
              </span>
            </div>
          </div>

          {/* Practical Heuristic Insight */}
          <div className="dbscan-insight-box">
            <span className="dbscan-insight-tag">ESTER ET AL. (1996) PARAMETER HEURISTIC</span>
            <p className="dbscan-insight-text">
              1. Fix <Tex f="k = \text{MinPts}" inline /> (default 4 for 2D data).<br />
              2. Compute the distance to the $k$-th nearest neighbor for every data point and sort ascending.<br />
              3. Set &epsilon; equal to the value at the <b>elbow / knee</b> of the curve. Points below the knee have stable intra-cluster density; points above shoot up into background noise!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
