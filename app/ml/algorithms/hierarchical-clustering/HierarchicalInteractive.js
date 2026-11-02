'use client';

import React, { useState, useMemo } from 'react';
import Tex from '../../../../components/Tex';
import { dist } from '../common';

// Palette for cluster colors matching CSS variables (--p0, --p1, --p2, --p3, --p4)
const CLUSTER_COLORS = [
  '#00b4d8', // Teal/Cyan (--p0)
  '#f59f00', // Amber/Orange (--p1)
  '#10b981', // Emerald/Green (--p2)
  '#a855f7', // Purple/Violet (--p3)
  '#ec4899', // Pink/Rose (--p4)
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#84cc16', // Lime
  '#06b6d4'  // Sky
];

/**
 * Builds the complete agglomerative hierarchical tree and calculates 
 * SVG planar layout coordinates with guaranteed zero line crossings.
 */
export function buildDendrogramTree(points, mode = 1) {
  if (!points || !points.length) return null;

  const N = points.length;
  let clusters = points.map((p, i) => ({
    id: i,
    isLeaf: true,
    leaves: [i],
    dist: 0,
    step: 0,
    pt: p
  }));

  const merges = [];
  while (clusters.length > 1) {
    let minD = Infinity;
    let bestI = 0;
    let bestJ = 1;

    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const pairDists = [];
        clusters[i].leaves.forEach(a => {
          clusters[j].leaves.forEach(b => {
            pairDists.push(dist(points[a], points[b]));
          });
        });

        let d = 0;
        if (mode === 1) d = Math.min(...pairDists); // Single Linkage
        else if (mode === 2) d = Math.max(...pairDists); // Complete Linkage
        else d = pairDists.reduce((s, v) => s + v, 0) / pairDists.length; // Average Linkage

        if (d < minD) {
          minD = d;
          bestI = i;
          bestJ = j;
        }
      }
    }

    const nodeA = clusters[bestI];
    const nodeB = clusters[bestJ];
    const parent = {
      id: N + merges.length,
      isLeaf: false,
      left: nodeA,
      right: nodeB,
      leaves: [...nodeA.leaves, ...nodeB.leaves],
      dist: minD,
      step: merges.length + 1
    };

    nodeA.parent = parent;
    nodeB.parent = parent;
    merges.push(parent);

    clusters.splice(bestJ, 1);
    clusters[bestI] = parent;
  }

  const root = clusters[0];

  // In-order traversal to guarantee planar contiguous layout without branch crossing
  function getLeaves(node) {
    if (node.isLeaf) return [node.id];
    return [...getLeaves(node.left), ...getLeaves(node.right)];
  }
  const orderedLeafIds = getLeaves(root);

  // SVG coordinate layout
  const padLeft = 36;
  const padRight = 18;
  const padTop = 22;
  const padBottom = 28;
  const W = 330 - padLeft - padRight;
  const H = 180 - padTop - padBottom;
  const maxD = Math.max(1, root.dist * 1.08);

  const yCoord = d => padTop + H - (d / maxD) * H;

  const leafCoords = {};
  orderedLeafIds.forEach((id, idx) => {
    leafCoords[id] = {
      x: padLeft + idx * (W / (orderedLeafIds.length - 1 || 1)),
      y: padTop + H
    };
  });

  function assignCoords(node) {
    if (node.isLeaf) {
      node.x = leafCoords[node.id].x;
      node.y = leafCoords[node.id].y;
      return;
    }
    assignCoords(node.left);
    assignCoords(node.right);
    node.x = (node.left.x + node.right.x) / 2;
    node.y = yCoord(node.dist);
  }
  assignCoords(root);

  return {
    root,
    merges,
    orderedLeafIds,
    leafCoords,
    maxD,
    yCoord,
    padLeft,
    padRight,
    padTop,
    padBottom,
    width: 330,
    height: 180
  };
}

export default function HierarchicalInteractive({
  currentStep = 0,
  totalSteps = 15,
  onStepChange,
  activeLinkage = 1,
  onSelectLinkage,
  frames = []
}) {
  const [activeTab, setActiveTab] = useState('parallel'); // 'parallel' | 'cut' | 'linkage'
  const [cutThreshold, setCutThreshold] = useState(25); // Height threshold for interactive cutting
  const [hoveredPointId, setHoveredPointId] = useState(null);

  // Extract raw points from first frame
  const points = useMemo(() => {
    if (frames && frames[0] && frames[0].pts) {
      return frames[0].pts.map((p, idx) => ({ ...p, id: p.id ?? idx }));
    }
    return [];
  }, [frames]);

  // Compute dendrogram geometry based on active linkage mode
  const dendro = useMemo(() => {
    const mode = Math.max(1, Math.min(3, Math.round(activeLinkage || 1)));
    return buildDendrogramTree(points, mode);
  }, [points, activeLinkage]);

  // Step-level active merge info
  const activeMerge = useMemo(() => {
    if (!dendro || currentStep <= 0) return null;
    return dendro.merges[currentStep - 1] || null;
  }, [dendro, currentStep]);

  // Compute cluster partition given the horizontal cut line threshold
  const cutClusters = useMemo(() => {
    if (!dendro) return [];
    const clusters = [];

    function traverse(node) {
      if (node.dist <= cutThreshold || node.isLeaf) {
        clusters.push(node.leaves);
        return;
      }
      traverse(node.left);
      traverse(node.right);
    }
    traverse(dendro.root);

    return clusters;
  }, [dendro, cutThreshold]);

  // Map each leaf ID to its cluster color index based on the cut threshold
  const pointCutColorMap = useMemo(() => {
    const map = {};
    cutClusters.forEach((cl, cIdx) => {
      cl.forEach(ptId => {
        map[ptId] = CLUSTER_COLORS[cIdx % CLUSTER_COLORS.length];
      });
    });
    return map;
  }, [cutClusters]);

  // Map each leaf ID to its current cluster color in the main simulation frame
  const pointSimColorMap = useMemo(() => {
    const map = {};
    if (frames && frames[currentStep] && frames[currentStep].pts) {
      frames[currentStep].pts.forEach((p, idx) => {
        const id = p.id ?? idx;
        map[id] = p.c === 5 ? 'var(--mu)' : `var(--p${p.c})`;
      });
    }
    return map;
  }, [frames, currentStep]);

  if (!dendro) {
    return (
      <div className="hier-interactive-card">
        <div className="telemetry-eyebrow">INTERACTIVE DENDROGRAM</div>
        <p className="hier-card-desc">Generating hierarchical tree structure...</p>
      </div>
    );
  }

  const { root, merges, orderedLeafIds, maxD, yCoord, padLeft, padTop, width, height } = dendro;

  // Determine which linkage mode name is active
  const linkageNames = {
    1: 'Single Linkage (Min)',
    2: 'Complete Linkage (Max)',
    3: 'Average Linkage (Mean)'
  };
  const currentLinkageName = linkageNames[Math.round(activeLinkage)] || 'Single Linkage (Min)';

  return (
    <div className="hier-interactive-card">
      <div className="telemetry-eyebrow">PARALLEL DENDROGRAM EXPLORER</div>

      {/* Navigation Tabs */}
      <div className="hier-tab-bar">
        <button
          type="button"
          className={`hier-tab-btn ${activeTab === 'parallel' ? 'active' : ''}`}
          onClick={() => setActiveTab('parallel')}
        >
          Live Dendrogram
        </button>
        <button
          type="button"
          className={`hier-tab-btn ${activeTab === 'cut' ? 'active' : ''}`}
          onClick={() => setActiveTab('cut')}
        >
          Cut Threshold (τ)
        </button>
        <button
          type="button"
          className={`hier-tab-btn ${activeTab === 'linkage' ? 'active' : ''}`}
          onClick={() => setActiveTab('linkage')}
        >
          Linkage Strategy
        </button>
      </div>

      {/* =========================================================================
          TAB 1: Parallel Dendrogram (Live Playback Synchronization)
          ========================================================================= */}
      {activeTab === 'parallel' && (
        <div className="hier-tab-content">
          <div className="hier-card-header">
            <div>
              <h4 className="hier-card-title">Parallel Dendrogram Construction</h4>
              <span className="hier-card-sub">Synchronized step-by-step with 2D cluster plot</span>
            </div>
            <span className="hier-pill-badge">
              Step <b>{currentStep}</b> of {merges.length}
            </span>
          </div>

          <p className="hier-card-desc">
            As you play or step the simulation, watch each U-branch rise up at its exact <b>merge distance (height)</b>. Click any branch or leaf to inspect.
          </p>

          {/* SVG Dendrogram Canvas */}
          <div className="hier-svg-wrap">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="hier-dendro-svg"
              aria-label="Parallel Dendrogram Tree"
            >
              {/* Background Distance Scale (Left Y-Axis) */}
              <g className="hier-axis-scale">
                <line
                  x1={padLeft - 8}
                  y1={yCoord(0)}
                  x2={padLeft - 8}
                  y2={yCoord(maxD * 0.95)}
                  stroke="var(--bd)"
                  strokeWidth="0.8"
                />
                {[0, maxD * 0.25, maxD * 0.5, maxD * 0.75, maxD * 0.95].map(dVal => (
                  <g key={`axis-${dVal}`} transform={`translate(${padLeft - 8}, ${yCoord(dVal)})`}>
                    <line x1="-3" y1="0" x2="3" y2="0" stroke="var(--bd)" strokeWidth="0.6" />
                    <text
                      x="-6"
                      y="1.5"
                      textAnchor="end"
                      fill="var(--mu)"
                      fontSize="2.8"
                      fontFamily="var(--mono)"
                    >
                      {dVal.toFixed(0)}
                    </text>
                  </g>
                ))}
                {/* Y-axis label */}
                <text
                  x="8"
                  y={height / 2}
                  textAnchor="middle"
                  transform={`rotate(-90 8 ${height / 2})`}
                  fill="var(--mu)"
                  fontSize="2.9"
                  fontFamily="var(--mono)"
                  letterSpacing="0.05em"
                >
                  HEIGHT (DISTANCE)
                </text>
              </g>

              {/* Dendrogram Merge Branches */}
              {merges.map((m, mIdx) => {
                const stepNum = mIdx + 1;
                const isFormed = stepNum <= currentStep;
                const isCurrent = stepNum === currentStep;

                // U-shaped path: child A up, across to child B, down to child B
                const leftX = m.left.x;
                const leftY = m.left.y;
                const rightX = m.right.x;
                const rightY = m.right.y;
                const barY = m.y;

                const pathData = `M ${leftX} ${leftY} V ${barY} H ${rightX} V ${rightY}`;

                return (
                  <g
                    key={`merge-${m.id}`}
                    className={`hier-branch-group ${isCurrent ? 'active-pulse' : ''}`}
                    onClick={() => onStepChange && onStepChange(stepNum)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Visual hit area for easy clicking */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="7"
                    />

                    {/* Branch Line */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke={
                        isCurrent
                          ? 'var(--p1)'
                          : isFormed
                          ? 'var(--tx)'
                          : 'var(--bd)'
                      }
                      strokeWidth={isCurrent ? '1.8' : isFormed ? '0.9' : '0.45'}
                      strokeDasharray={isFormed ? 'none' : '1.5 1.5'}
                      opacity={isFormed ? 1 : 0.25}
                      className="hier-branch-path"
                    />

                    {/* Active Pulse Marker on Current Merge */}
                    {isCurrent && (
                      <g transform={`translate(${m.x}, ${barY})`}>
                        <circle cx="0" cy="0" r="3.2" fill="var(--p1)" opacity="0.35" className="ping" />
                        <circle cx="0" cy="0" r="1.8" fill="var(--p1)" stroke="var(--bg)" strokeWidth="0.5" />
                        <rect
                          x="-14"
                          y="-8"
                          width="28"
                          height="6.5"
                          rx="1.5"
                          fill="var(--cd)"
                          stroke="var(--p1)"
                          strokeWidth="0.5"
                        />
                        <text
                          x="0"
                          y="-3.8"
                          textAnchor="middle"
                          fill="var(--p1)"
                          fontSize="2.7"
                          fontFamily="var(--mono)"
                          fontWeight="700"
                        >
                          d={m.dist.toFixed(1)}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Leaf Nodes Along Bottom Axis */}
              {orderedLeafIds.map(id => {
                const pt = points[id];
                const coords = dendro.leafCoords[id];
                const isHovered = hoveredPointId === id;
                const col = pointSimColorMap[id] || 'var(--mu)';

                return (
                  <g
                    key={`leaf-${id}`}
                    transform={`translate(${coords.x}, ${coords.y})`}
                    className="hier-leaf-node"
                    onMouseEnter={() => setHoveredPointId(id)}
                    onMouseLeave={() => setHoveredPointId(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Leaf Circle Marker */}
                    <circle
                      cx="0"
                      cy="0"
                      r={isHovered ? '3.0' : '2.0'}
                      fill={col}
                      stroke="var(--bg)"
                      strokeWidth="0.5"
                    />

                    {/* Leaf Label */}
                    <text
                      x="0"
                      y="5.5"
                      textAnchor="middle"
                      fill={isHovered ? 'var(--tx)' : 'var(--mu)'}
                      fontSize={isHovered ? '3.2' : '2.8'}
                      fontFamily="var(--mono)"
                      fontWeight={isHovered ? '700' : '500'}
                    >
                      P{id}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Real-Time Step Information Card */}
          <div className="hier-status-card">
            {currentStep === 0 ? (
              <div>
                <div className="hier-status-badge initial">INITIAL STATE (15 CLUSTERS)</div>
                <p className="hier-status-text">
                  Every point begins in its own isolated cluster. Step forward or hit <b>Play</b> to observe the closest pairs merge bottom-up.
                </p>
              </div>
            ) : activeMerge ? (
              <div>
                <div className="hier-status-badge merge">
                  MERGE #{currentStep} · DISTANCE d = {activeMerge.dist.toFixed(1)}
                </div>
                <p className="hier-status-text">
                  Joined cluster with points <b>[{activeMerge.left.leaves.map(id => `P${id}`).join(', ')}]</b> and{' '}
                  <b>[{activeMerge.right.leaves.map(id => `P${id}`).join(', ')}]</b> at linkage distance{' '}
                  <b>{activeMerge.dist.toFixed(1)}</b>.
                </p>
                <div className="hier-step-meta-row">
                  <span className="hier-meta-item">
                    Clusters Remaining: <b>{merges.length - currentStep + 1}</b>
                  </span>
                  <span className="hier-meta-item">
                    Strategy: <b>{currentLinkageName}</b>
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <div className="hier-status-badge complete">ROOT COMPLETE (1 CLUSTER)</div>
                <p className="hier-status-text">
                  All 15 points have merged into the single root cluster. The complete tree height represents the dataset diameter.
                </p>
              </div>
            )}
          </div>

          {/* Quick Playback Bar */}
          <div className="hier-playback-bar">
            <button
              type="button"
              className="hier-mini-btn"
              onClick={() => onStepChange && onStepChange(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              ◀ Prev Merge
            </button>
            <input
              type="range"
              min="0"
              max={merges.length}
              value={currentStep}
              onChange={e => onStepChange && onStepChange(Number(e.target.value))}
              className="hier-step-slider"
            />
            <button
              type="button"
              className="hier-mini-btn"
              onClick={() => onStepChange && onStepChange(Math.min(merges.length, currentStep + 1))}
              disabled={currentStep >= merges.length}
            >
              Next Merge ▶
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: Cut Threshold (τ) — Converting Dendrogram to K Flat Clusters
          ========================================================================= */}
      {activeTab === 'cut' && (
        <div className="hier-tab-content">
          <div className="hier-card-header">
            <div>
              <h4 className="hier-card-title">Cut Dendrogram with Threshold Line (τ)</h4>
              <span className="hier-card-sub">Horizontal slice determines resulting K clusters</span>
            </div>
            <span className="hier-pill-badge primary">
              Cut Height: <b>{cutThreshold.toFixed(1)}</b>
            </span>
          </div>

          <p className="hier-card-desc">
            Drag the cut line across the dendrogram. Any vertical branch severed by the line creates a separate cluster.
          </p>

          {/* SVG Dendrogram with Interactive Cut Line */}
          <div className="hier-svg-wrap">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="hier-dendro-svg"
              aria-label="Interactive Cut Line Dendrogram"
            >
              {/* Distance Axis */}
              <g className="hier-axis-scale">
                <line
                  x1={padLeft - 8}
                  y1={yCoord(0)}
                  x2={padLeft - 8}
                  y2={yCoord(maxD * 0.95)}
                  stroke="var(--bd)"
                  strokeWidth="0.8"
                />
                {[0, maxD * 0.25, maxD * 0.5, maxD * 0.75, maxD * 0.95].map(dVal => (
                  <g key={`cut-axis-${dVal}`} transform={`translate(${padLeft - 8}, ${yCoord(dVal)})`}>
                    <line x1="-3" y1="0" x2="3" y2="0" stroke="var(--bd)" strokeWidth="0.6" />
                    <text
                      x="-6"
                      y="1.5"
                      textAnchor="end"
                      fill="var(--mu)"
                      fontSize="2.8"
                      fontFamily="var(--mono)"
                    >
                      {dVal.toFixed(0)}
                    </text>
                  </g>
                ))}
              </g>

              {/* Full Tree Branches colored by resulting cut cluster */}
              {merges.map(m => {
                const leftX = m.left.x;
                const leftY = m.left.y;
                const rightX = m.right.x;
                const rightY = m.right.y;
                const barY = m.y;
                const pathData = `M ${leftX} ${leftY} V ${barY} H ${rightX} V ${rightY}`;

                // If this node is below the cut threshold, color by its cluster
                const isBelowCut = m.dist <= cutThreshold;
                const clusterColor = isBelowCut
                  ? pointCutColorMap[m.leaves[0]] || 'var(--tx)'
                  : 'var(--bd)';

                return (
                  <path
                    key={`cut-branch-${m.id}`}
                    d={pathData}
                    fill="none"
                    stroke={clusterColor}
                    strokeWidth={isBelowCut ? '1.2' : '0.8'}
                    opacity={isBelowCut ? 1 : 0.45}
                  />
                );
              })}

              {/* Leaf Nodes */}
              {orderedLeafIds.map(id => {
                const coords = dendro.leafCoords[id];
                const col = pointCutColorMap[id] || 'var(--mu)';
                return (
                  <g key={`cut-leaf-${id}`} transform={`translate(${coords.x}, ${coords.y})`}>
                    <circle cx="0" cy="0" r="2.2" fill={col} stroke="var(--bg)" strokeWidth="0.5" />
                    <text
                      x="0"
                      y="5.5"
                      textAnchor="middle"
                      fill="var(--mu)"
                      fontSize="2.8"
                      fontFamily="var(--mono)"
                    >
                      P{id}
                    </text>
                  </g>
                );
              })}

              {/* Interactive Horizontal Cut Line */}
              <g transform={`translate(0, ${yCoord(cutThreshold)})`}>
                <line
                  x1={padLeft - 10}
                  y1="0"
                  x2={width - 5}
                  y2="0"
                  stroke="#ec4899"
                  strokeWidth="1.3"
                  strokeDasharray="3 2"
                />
                <rect
                  x={width - 44}
                  y="-4.5"
                  width="40"
                  height="9"
                  rx="2"
                  fill="#ec4899"
                />
                <text
                  x={width - 24}
                  y="1.2"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="2.7"
                  fontFamily="var(--mono)"
                  fontWeight="700"
                >
                  τ = {cutThreshold.toFixed(1)}
                </text>
              </g>
            </svg>
          </div>

          {/* Interactive Slider & Presets */}
          <div className="hier-slider-box">
            <div className="hier-slider-label-row">
              <span className="hier-slider-title">Cut Line Threshold (τ):</span>
              <span className="hier-slider-val">{cutThreshold.toFixed(1)} px</span>
            </div>
            <input
              type="range"
              min="1"
              max={Math.floor(maxD * 0.98)}
              step="0.5"
              value={cutThreshold}
              onChange={e => setCutThreshold(Number(e.target.value))}
              className="hier-range-slider"
            />
          </div>

          {/* Quick Presets */}
          <div className="hier-presets-row">
            <span className="hier-presets-label">Target Clusters:</span>
            <button
              type="button"
              className={`hier-preset-chip ${cutClusters.length === 3 ? 'active' : ''}`}
              onClick={() => setCutThreshold(24)}
            >
              ★ 3 Natural Clusters
            </button>
            <button
              type="button"
              className={`hier-preset-chip ${cutClusters.length === 2 ? 'active' : ''}`}
              onClick={() => setCutThreshold(Math.min(maxD * 0.9, root.dist - 1))}
            >
              2 Macro Clusters
            </button>
            <button
              type="button"
              className={`hier-preset-chip ${cutClusters.length === 4 ? 'active' : ''}`}
              onClick={() => setCutThreshold(14)}
            >
              4 Fine Clusters
            </button>
          </div>

          {/* Telemetry Card: Resulting K Clusters Breakdown */}
          <div className="hier-clusters-telemetry">
            <div className="hier-clusters-telemetry-header">
              <span className="hier-k-badge">K = {cutClusters.length} Clusters Produced</span>
              <span className="hier-meta-hint">Cut cleanly isolates foundational groups</span>
            </div>

            <div className="hier-cluster-chips-wrap">
              {cutClusters.map((cl, idx) => (
                <div
                  key={`cl-chip-${idx}`}
                  className="hier-cluster-chip-item"
                  style={{ borderColor: CLUSTER_COLORS[idx % CLUSTER_COLORS.length] }}
                >
                  <span
                    className="hier-cluster-chip-dot"
                    style={{ background: CLUSTER_COLORS[idx % CLUSTER_COLORS.length] }}
                  />
                  <span className="hier-cluster-chip-title">Cluster {idx + 1}:</span>
                  <span className="hier-cluster-chip-members">
                    {cl.map(id => `P${id}`).join(', ')} ({cl.length} pts)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: Linkage Strategy Comparison
          ========================================================================= */}
      {activeTab === 'linkage' && (
        <div className="hier-tab-content">
          <div className="hier-card-header">
            <div>
              <h4 className="hier-card-title">Linkage Distance Metrics</h4>
              <span className="hier-card-sub">Controls how distance between clusters is defined</span>
            </div>
          </div>

          <p className="hier-card-desc">
            The linkage criterion dictates tree morphology. Switch linkage to observe how the tree branches adapt:
          </p>

          <div className="hier-linkage-grid">
            <div
              className={`hier-linkage-card ${Math.round(activeLinkage) === 1 ? 'selected' : ''}`}
              onClick={() => onSelectLinkage && onSelectLinkage(1)}
              style={{ cursor: 'pointer' }}
            >
              <div className="hier-linkage-top">
                <span className="hier-linkage-tag">SINGLE LINKAGE</span>
                <span className="hier-linkage-badge">Min Distance</span>
              </div>
              <div className="hier-linkage-math">
                <Tex f="D(A, B) = \min_{a \in A, b \in B} d(a, b)" inline />
              </div>
              <p className="hier-linkage-desc">
                Finds the closest pair of points between clusters. Can create non-globular shapes, but suffers from <b>chaining</b> (elongated stringy merges).
              </p>
            </div>

            <div
              className={`hier-linkage-card ${Math.round(activeLinkage) === 2 ? 'selected' : ''}`}
              onClick={() => onSelectLinkage && onSelectLinkage(2)}
              style={{ cursor: 'pointer' }}
            >
              <div className="hier-linkage-top">
                <span className="hier-linkage-tag">COMPLETE LINKAGE</span>
                <span className="hier-linkage-badge">Max Distance</span>
              </div>
              <div className="hier-linkage-math">
                <Tex f="D(A, B) = \max_{a \in A, b \in B} d(a, b)" inline />
              </div>
              <p className="hier-linkage-desc">
                Finds the furthest pair of points. Forces compact, balanced, spherical clusters and prevents chaining, but is sensitive to outliers.
              </p>
            </div>

            <div
              className={`hier-linkage-card ${Math.round(activeLinkage) === 3 ? 'selected' : ''}`}
              onClick={() => onSelectLinkage && onSelectLinkage(3)}
              style={{ cursor: 'pointer' }}
            >
              <div className="hier-linkage-top">
                <span className="hier-linkage-tag">AVERAGE LINKAGE</span>
                <span className="hier-linkage-badge">Mean Distance</span>
              </div>
              <div className="hier-linkage-math">
                <Tex f="D(A, B) = \frac{1}{|A||B|} \sum d(a, b)" inline />
              </div>
              <p className="hier-linkage-desc">
                A robust compromise calculating the average distance across all pairs. Balances cluster compactness with resistance to extreme noise.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

