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

  // Tab 2: Step-by-Step Chain Reaction state
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1); // 1x or 2x
  const playTimerRef = useRef(null);

  // Tab 3: Reachability state
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

    // 2. Core points: has at least minPts other neighbors inside its circle
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
  // TAB 2: Step-by-Step Chain Reaction Walkthrough
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
      desc: `Ready to start! We have ${N} unvisited points with circle radius ε = ${eps.toFixed(1)}px and MinPts = ${minPts} neighbors.`
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
          desc: `Checking Point #${i}: has only ${nb[i].length} neighbors (needs ${minPts}). For now, it stands alone as noise.`
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
        desc: `Point #${i} is crowded with ${nb[i].length} neighbors (≥ ${minPts})! Starting Cluster ${currentC + 1} and adding all its neighbors to the waiting list.`
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
              desc: `Neighbor #${q} is ALSO crowded (${nb[q].length} neighbors)! It pulls in ${newNeighbors.length} more neighbors to keep expanding.`
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
              desc: `Neighbor #${q} is on the edge (only ${nb[q].length} neighbors). It joins Cluster ${currentC + 1}, but has no more neighbors to pull in.`
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
            desc: `Point #${q} was previously thought to be noise, but touches a Core Point! Rescued as an edge (border) point for Cluster ${currentC + 1}.`
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
        desc: `Waiting list empty! Cluster ${currentC + 1} is fully assembled with ${labels.filter(l => l === currentC).length} points.`
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
      desc: `All points checked! Found ${clusterCount} natural clusters and left ${labels.filter(l => l < 0).length} lonely outliers as noise.`
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
  // TAB 3: How Points Connect (Reachability & Connectivity)
  // =========================================================================
  const reachabilityAnalysis = useMemo(() => {
    const P = points;
    const nb = clustering.neighborhoods;
    const core = clustering.isCore;

    const pA = points.find(p => p.id === ptAId) || points[0];
    const pB = points.find(p => p.id === ptBId) || points[1];

    // 1. Direct Touch (Asymmetric): p is directly reachable from q iff p ∈ N_ε(q) AND q is Core
    const aDirectFromB = nb[pB.id]?.includes(pA.id) && core[pB.id];
    const bDirectFromA = nb[pA.id]?.includes(pB.id) && core[pA.id];

    // 2. Chain Connection: Find shortest directed path of core hops from start to target
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

    // 3. Same Cluster (Common Ancestor): ∃ common ancestor core point o such that o ~> pA AND o ~> pB
    let commonAncestor = null;
    let pathToAFromO = null;
    let pathToBFromO = null;

    if (clustering.clusterLabels[pA.id] >= 0 && clustering.clusterLabels[pA.id] === clustering.clusterLabels[pB.id]) {
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
  // TAB 4: Finding Best Radius: Sorted k-Distance Elbow Plot
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

    // Kneedle elbow detector
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
          Point Types &amp; Circles
        </button>
        <button
          type="button"
          className={`dbscan-tab-btn ${activeTab === 'expansion' ? 'active' : ''}`}
          onClick={() => setActiveTab('expansion')}
        >
          How Clusters Grow
        </button>
        <button
          type="button"
          className={`dbscan-tab-btn ${activeTab === 'reachability' ? 'active' : ''}`}
          onClick={() => setActiveTab('reachability')}
        >
          How Points Connect
        </button>
        <button
          type="button"
          className={`dbscan-tab-btn ${activeTab === 'kdist' ? 'active' : ''}`}
          onClick={() => setActiveTab('kdist')}
        >
          Finding Best Radius (ε)
        </button>
      </div>

      {/* =========================================================================
          TAB 1: Point Types & Circles Inspector
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
            <b>Click any point below</b> to draw its circle. If a point has at least <b>{minPts} neighbors</b> inside its circle, it becomes a crowded <b>Core Point</b>. Edge points join the crowd, and lonely points become <b>Noise</b>.
          </p>

          {/* Quick preset buttons */}
          <div className="dbscan-preset-pills">
            <button
              type="button"
              className={`dbscan-preset-btn ${selectedIsCore ? 'active' : ''}`}
              onClick={() => {
                const firstCore = points.find(p => clustering.isCore[p.id]);
                if (firstCore) setSelectedPointId(firstCore.id);
              }}
            >
              ● Try Core Point (Crowded)
            </button>
            <button
              type="button"
              className={`dbscan-preset-btn ${selectedIsBorder ? 'active' : ''}`}
              onClick={() => {
                const firstBorder = points.find(p => clustering.isBorder[p.id]);
                if (firstBorder) setSelectedPointId(firstBorder.id);
              }}
            >
              ◌ Try Border Point (On Edge)
            </button>
            <button
              type="button"
              className={`dbscan-preset-btn ${selectedIsNoise ? 'active' : ''}`}
              onClick={() => {
                const firstNoise = points.find(p => clustering.isNoise[p.id]);
                if (firstNoise) setSelectedPointId(firstNoise.id);
              }}
            >
              ⨂ Try Noise Point (Lonely)
            </button>
          </div>

          {/* Interactive SVG Canvas */}
          <div className="dbscan-svg-container">
            <svg viewBox="0 0 102 102" className="dbscan-svg" aria-label="DBSCAN interactive scatter plot">
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
                <span className="dbscan-slider-title">Circle Radius (ε):</span>
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
                <span>Small Circle (3.0px)</span>
                <span>Large Circle (16.0px)</span>
              </div>
            </div>

            <div className="dbscan-slider-control-group">
              <div className="dbscan-slider-label-row">
                <span className="dbscan-slider-title">Crowd Threshold (MinPts):</span>
                <span className="dbscan-slider-val">{minPts} neighbors</span>
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
                <span>Easy to Join (2)</span>
                <span>Hard to Join (8)</span>
              </div>
            </div>
          </div>

          {/* Simple Status Box */}
          <div
            className={`dbscan-status-card ${
              selectedIsCore ? 'core' : selectedIsBorder ? 'border' : 'noise'
            }`}
          >
            <div className="dbscan-status-header">
              <span className="dbscan-status-badge">
                {selectedIsCore
                  ? `● CROWDED CORE POINT (CLUSTER ${selectedCluster + 1})`
                  : selectedIsBorder
                  ? `◌ BORDER POINT (JOINS CLUSTER ${selectedCluster + 1})`
                  : '⨂ LONELY NOISE OUTLIER (-1)'}
              </span>
              <span className="dbscan-count-badge">
                Neighbors in circle: <b>{selectedNb.length} points</b> (Goal: {minPts})
              </span>
            </div>

            <p className="dbscan-status-text">
              {selectedIsCore ? (
                <>
                  Point #{selectedPoint.id} touches <b>{selectedNb.length} other points</b> (&ge; {minPts}). Because it has enough neighbors, it is a crowded <b>Core Point</b> that can start or expand a cluster!
                </>
              ) : selectedIsBorder ? (
                <>
                  Point #{selectedPoint.id} only touches <b>{selectedNb.length} other points</b> (&lt; {minPts}). It is not crowded enough to be a Core Point, but because it sits inside a Core Point&apos;s circle, it joins the cluster edge.
                </>
              ) : (
                <>
                  Point #{selectedPoint.id} only touches <b>{selectedNb.length} other points</b> (&lt; {minPts}) and does not touch any Core Point. DBSCAN leaves it alone as unclustered <b>Noise</b>.
                </>
              )}
            </p>
          </div>

          {/* Simple Summary Pills */}
          <div className="dbscan-summary-pill-grid">
            <div className="dbscan-summary-pill">
              <span className="dbscan-summary-pill-title">Core Points (Crowded)</span>
              <span className="dbscan-summary-pill-val" style={{ color: 'var(--p2)' }}>{clustering.coreCount}</span>
            </div>
            <div className="dbscan-summary-pill">
              <span className="dbscan-summary-pill-title">Border Points (Edges)</span>
              <span className="dbscan-summary-pill-val" style={{ color: 'var(--p1)' }}>{clustering.borderCount}</span>
            </div>
            <div className="dbscan-summary-pill">
              <span className="dbscan-summary-pill-title">Noise (Lonely Outliers)</span>
              <span className="dbscan-summary-pill-val" style={{ color: 'var(--p6)' }}>{clustering.noiseCount}</span>
            </div>
            <div className="dbscan-summary-pill">
              <span className="dbscan-summary-pill-title">Clusters Found</span>
              <span className="dbscan-summary-pill-val" style={{ color: 'var(--tx)' }}>{clustering.numClusters}</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: How Clusters Grow (Step-by-Step Chain Reaction)
          ========================================================================= */}
      {activeTab === 'expansion' && (
        <div className="dbscan-tab-content">
          <div className="dbscan-card-header">
            <h4 className="dbscan-card-title">Step-by-Step Chain Reaction</h4>
            <span className="dbscan-pill-badge">
              Step {stepIdx + 1} of {bfsSteps.length}
            </span>
          </div>

          <p className="dbscan-card-desc">
            Watch how DBSCAN discovers clusters point-by-point. A crowded Core Point pulls in all its neighbors. Any neighbor that is also crowded pulls in its own neighbors—spreading the cluster like falling dominoes!
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
              ◀ Back
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
              Next ▶
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

          {/* Simple Telemetry Row */}
          <div className="dbscan-telemetry-row">
            <div className="dbscan-telemetry-chip">
              Active Cluster: <b>{currentBfsStep.clusterId >= 0 ? `Cluster ${currentBfsStep.clusterId + 1}` : 'None'}</b>
            </div>
            <div className="dbscan-telemetry-chip">
              Waiting List: <b>{currentBfsStep.queue?.length || 0} pts</b>
            </div>
            <div className="dbscan-telemetry-chip">
              Points Clustered: <b>{currentBfsStep.labels?.filter(l => l >= 0).length || 0} pts</b>
            </div>
          </div>

          {/* Canvas for Chain Reaction */}
          <div className="dbscan-svg-container">
            <svg viewBox="0 0 102 102" className="dbscan-svg" aria-label="DBSCAN chain reaction step animation">
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
                    {/* Active point halo */}
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

                    {/* Waiting list highlight */}
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

          {/* Simple Step Explanation Log */}
          <div className="dbscan-step-log">
            <span style={{ color: 'var(--p1)', fontWeight: 'bold' }}>&gt; </span>
            {currentBfsStep.desc}
          </div>

          {/* Waiting List Chips */}
          {currentBfsStep.queue?.length > 0 && (
            <div className="dbscan-queue-chips">
              <span style={{ fontSize: '11px', color: 'var(--mu)', marginRight: '4px' }}>Waiting to Explore:</span>
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
          TAB 3: How Points Connect (Reachability & Chains)
          ========================================================================= */}
      {activeTab === 'reachability' && (
        <div className="dbscan-tab-content">
          <div className="dbscan-card-header">
            <h4 className="dbscan-card-title">Can Point A Reach Point B?</h4>
            <span className="dbscan-pill-badge">Connecting Chains</span>
          </div>

          <p className="dbscan-card-desc">
            A cluster is formed by chaining crowded points together. Pick any two points to see whether they touch directly, connect through a chain of crowded hops, or are completely separated!
          </p>

          {/* Point Selection Controls */}
          <div className="dbscan-pair-row">
            <span className="dbscan-pair-label">Compare Pair:</span>
            <button
              type="button"
              className={`dbscan-point-btn ptA ${pickingTarget === 'A' ? 'active' : ''}`}
              onClick={() => setPickingTarget(pickingTarget === 'A' ? null : 'A')}
            >
              Point A: #{reachabilityAnalysis.pA.id} ({clustering.isCore[reachabilityAnalysis.pA.id] ? 'Core' : clustering.isBorder[reachabilityAnalysis.pA.id] ? 'Border' : 'Noise'})
            </button>
            <span style={{ color: 'var(--mu)', fontSize: '11px' }}>and</span>
            <button
              type="button"
              className={`dbscan-point-btn ptB ${pickingTarget === 'B' ? 'active' : ''}`}
              onClick={() => setPickingTarget(pickingTarget === 'B' ? null : 'B')}
            >
              Point B: #{reachabilityAnalysis.pB.id} ({clustering.isCore[reachabilityAnalysis.pB.id] ? 'Core' : clustering.isBorder[reachabilityAnalysis.pB.id] ? 'Border' : 'Noise'})
            </button>
            {pickingTarget && (
              <span style={{ fontSize: '11px', color: 'var(--p1)', marginLeft: 'auto' }}>
                Click any point in the plot to assign Point {pickingTarget}!
              </span>
            )}
          </div>

          {/* Simple Preset Scenarios */}
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
              Core ↔ Core (Inside Cluster)
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
              Core ↔ Border (One-Way Touch!)
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
              Cluster ↔ Noise (Separated)
            </button>
          </div>

          {/* Canvas with Directed Reachability Arrows */}
          <div className="dbscan-svg-container">
            <svg viewBox="0 0 102 102" className="dbscan-svg" aria-label="DBSCAN reachability directed graph">
              <defs>
                <marker id="dbscan-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--p1)" />
                </marker>
                <marker id="dbscan-arrow-cyan" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--p0)" />
                </marker>
                <marker id="dbscan-arrow-green" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--p2)" />
                </marker>
              </defs>

              <line x1="5" y1="50" x2="95" y2="50" stroke="var(--bd)" strokeWidth="0.3" strokeDasharray="2 3" opacity="0.4" />
              <line x1="50" y1="5" x2="50" y2="95" stroke="var(--bd)" strokeWidth="0.3" strokeDasharray="2 3" opacity="0.4" />

              {/* Case 1: Both paths exist (Mutual Core-to-Core connection in same cluster) */}
              {reachabilityAnalysis.pathToBFromA && reachabilityAnalysis.pathToAFromB && (
                reachabilityAnalysis.pathToBFromA.slice(0, -1).map((nodeId, idx) => {
                  const nextId = reachabilityAnalysis.pathToBFromA[idx + 1];
                  return (
                    <line
                      key={`path-mutual-${idx}`}
                      x1={points[nodeId].x}
                      y1={100 - points[nodeId].y}
                      x2={points[nextId].x}
                      y2={100 - points[nextId].y}
                      stroke="var(--p2)"
                      strokeWidth="1.2"
                    />
                  );
                })
              )}

              {/* Case 2: One-way path from A to B (B is border point) */}
              {reachabilityAnalysis.pathToBFromA && !reachabilityAnalysis.pathToAFromB && (
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
                      strokeWidth="1.2"
                      markerEnd="url(#dbscan-arrow-cyan)"
                    />
                  );
                })
              )}

              {/* Case 3: One-way path from B to A (A is border point) */}
              {reachabilityAnalysis.pathToAFromB && !reachabilityAnalysis.pathToBFromA && (
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
                      strokeWidth="1.2"
                      markerEnd="url(#dbscan-arrow)"
                    />
                  );
                })
              )}

              {/* Case 4: Neither reaches directly, but density-connected via common ancestor o */}
              {!reachabilityAnalysis.pathToBFromA && !reachabilityAnalysis.pathToAFromB && reachabilityAnalysis.commonAncestor !== null && (
                <>
                  {reachabilityAnalysis.pathToAFromO && (
                    reachabilityAnalysis.pathToAFromO.slice(0, -1).map((nodeId, idx) => {
                      const nextId = reachabilityAnalysis.pathToAFromO[idx + 1];
                      return (
                        <line
                          key={`path-oa-${idx}`}
                          x1={points[nodeId].x}
                          y1={100 - points[nodeId].y}
                          x2={points[nextId].x}
                          y2={100 - points[nextId].y}
                          stroke="var(--p0)"
                          strokeWidth="0.9"
                          strokeDasharray="2 2"
                        />
                      );
                    })
                  )}
                  {reachabilityAnalysis.pathToBFromO && (
                    reachabilityAnalysis.pathToBFromO.slice(0, -1).map((nodeId, idx) => {
                      const nextId = reachabilityAnalysis.pathToBFromO[idx + 1];
                      return (
                        <line
                          key={`path-ob-${idx}`}
                          x1={points[nodeId].x}
                          y1={100 - points[nodeId].y}
                          x2={points[nextId].x}
                          y2={100 - points[nextId].y}
                          stroke="var(--p1)"
                          strokeWidth="0.9"
                          strokeDasharray="2 2"
                        />
                      );
                    })
                  )}
                </>
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

          {/* Simple Relation Verdict Cards */}
          <div className="dbscan-relation-grid">
            <div className={`dbscan-relation-box ${reachabilityAnalysis.aDirectFromB || reachabilityAnalysis.bDirectFromA ? 'true' : 'false'}`}>
              <span className="dbscan-relation-tag">
                {reachabilityAnalysis.aDirectFromB && reachabilityAnalysis.bDirectFromA
                  ? 'MUTUAL DIRECT TOUCH'
                  : reachabilityAnalysis.bDirectFromA
                  ? 'A → B (ONE-WAY TOUCH)'
                  : reachabilityAnalysis.aDirectFromB
                  ? 'B → A (ONE-WAY TOUCH)'
                  : 'NO DIRECT TOUCH'}
              </span>
              <div className="dbscan-relation-title">1. Direct Touch</div>
              <p className="dbscan-relation-desc">
                {reachabilityAnalysis.bDirectFromA && !reachabilityAnalysis.aDirectFromB
                  ? `Point B sits inside crowded Core Point A's circle. But because B is an edge point, A cannot be reached from B!`
                  : reachabilityAnalysis.aDirectFromB && !reachabilityAnalysis.bDirectFromA
                  ? `Point A sits inside crowded Core Point B's circle. But because A is an edge point, B cannot be reached from A!`
                  : reachabilityAnalysis.aDirectFromB && reachabilityAnalysis.bDirectFromA
                  ? `Both points are crowded Core Points inside each other's circle. They touch directly!`
                  : `Neither point sits inside the other's circle as a crowded Core Point.`}
              </p>
            </div>

            <div className={`dbscan-relation-box ${reachabilityAnalysis.pathToBFromA || reachabilityAnalysis.pathToAFromB ? 'true' : 'false'}`}>
              <span className="dbscan-relation-tag">
                {reachabilityAnalysis.pathToBFromA && reachabilityAnalysis.pathToAFromB
                  ? 'CONNECTED BOTH WAYS'
                  : reachabilityAnalysis.pathToBFromA
                  ? 'A ⤳ B (ONE-WAY CHAIN)'
                  : reachabilityAnalysis.pathToAFromB
                  ? 'B ⤳ A (ONE-WAY CHAIN)'
                  : 'NOT CONNECTED'}
              </span>
              <div className="dbscan-relation-title">2. Chain Connection</div>
              <p className="dbscan-relation-desc">
                {reachabilityAnalysis.pathToBFromA
                  ? `Connected across a chain of ${reachabilityAnalysis.pathToBFromA.length} crowded hops from A to B.`
                  : reachabilityAnalysis.pathToAFromB
                  ? `Connected across a chain of ${reachabilityAnalysis.pathToAFromB.length} crowded hops from B to A.`
                  : `No chain of crowded points connects Point A and Point B.`}
              </p>
            </div>

            <div className={`dbscan-relation-box ${reachabilityAnalysis.isDensityConnected ? 'true' : 'false'}`}>
              <span className="dbscan-relation-tag">
                {reachabilityAnalysis.isDensityConnected ? 'SAME CLUSTER (YES)' : 'SEPARATE (NO)'}
              </span>
              <div className="dbscan-relation-title">3. Same Cluster</div>
              <p className="dbscan-relation-desc">
                {reachabilityAnalysis.isDensityConnected
                  ? `Yes! Both points share crowded center #${reachabilityAnalysis.commonAncestor}, meaning they belong to the same cluster.`
                  : `No common crowded point reaches both points. They belong to different clusters or one is lonely noise.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: Finding the Best Radius (The Elbow / Knee Plot)
          ========================================================================= */}
      {activeTab === 'kdist' && (
        <div className="dbscan-tab-content">
          <div className="dbscan-card-header">
            <h4 className="dbscan-card-title">The Elbow / Knee Plot</h4>
            <span className="dbscan-pill-badge">
              Best Radius ε*: <b>{kDistAnalysis.kneeVal.toFixed(1)}px</b>
            </span>
          </div>

          <p className="dbscan-card-desc">
            How do you choose the circle radius ε without guessing? We measure each point&apos;s distance to its 4th nearest neighbor, then sort them from closest to farthest. Points inside dense crowds have short distances; lonely outliers shoot up sharply. The <b>bend (elbow)</b> in the curve marks the ideal radius!
          </p>

          {/* Interactive k-Distance Line Chart */}
          <div className="dbscan-kdist-wrap">
            <svg viewBox="0 0 320 160" className="dbscan-kdist-svg" aria-label="Sorted k-distance plot">
              {/* Axes and Grid Lines */}
              <line x1="35" y1="135" x2="305" y2="135" stroke="var(--bd)" strokeWidth="0.8" />
              <line x1="35" y1="15" x2="35" y2="135" stroke="var(--bd)" strokeWidth="0.8" />

              {/* Dynamic Y-axis Ticks */}
              {(() => {
                const maxV = Math.ceil(kDistAnalysis.maxVal / 5) * 5;
                const step = maxV > 25 ? 10 : 5;
                const ticks = [];
                for (let t = 0; t <= maxV; t += step) ticks.push(t);
                return ticks.map(tick => {
                  const yPos = 135 - (tick / kDistAnalysis.maxVal) * 120;
                  if (yPos < 10) return null;
                  return (
                    <g key={`ytick-${tick}`}>
                      <line x1="30" y1={yPos} x2="35" y2={yPos} stroke="var(--bd)" strokeWidth="0.6" />
                      <text x="26" y={yPos + 3} fill="var(--mu)" fontSize="8" textAnchor="end" fontFamily="var(--mono)">
                        {tick}
                      </text>
                      <line x1="35" y1={yPos} x2="305" y2={yPos} stroke="var(--bd)" strokeWidth="0.3" strokeDasharray="2 3" opacity="0.3" />
                    </g>
                  );
                });
              })()}

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
                      Current Radius ε = {eps.toFixed(1)}px
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
                      Elbow Bend ({kDistAnalysis.kneeVal.toFixed(1)}px)
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
                Points Sorted from Closest Neighbor to Farthest →
              </text>
              <text x="15" y="75" fill="var(--mu)" fontSize="8" textAnchor="middle" fontFamily="var(--sans)" transform="rotate(-90 15 75)">
                Distance to 4th Neighbor (px)
              </text>
            </svg>

            <div className="dbscan-kdist-legend">
              <span className="dbscan-kdist-badge knee">
                ● Recommended Radius (Elbow): ε ≈ {kDistAnalysis.kneeVal.toFixed(1)}px
              </span>
              <span>
                Points inside clusters: <b>{kDistAnalysis.sorted.filter(s => s.d <= eps).length}</b> / {points.length}
              </span>
            </div>
          </div>

          {/* Simple Practical Insight */}
          <div className="dbscan-insight-box">
            <span className="dbscan-insight-tag">HOW TO READ THIS PLOT</span>
            <p className="dbscan-insight-text">
              1. Points on the flat left side have close neighbors—they form tight clusters.<br />
              2. Look for the <b>elbow bend</b> where the line suddenly shoots upward.<br />
              3. Setting the radius ε at this bend captures the natural clusters while leaving lonely outliers as noise!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
