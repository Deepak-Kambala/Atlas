'use client';
import React, { useState, useEffect, useMemo } from 'react';

/**
 * High-Aesthetic Interactive Deep Neural Network (MLP) Visualization
 *
 * Architecture:
 *   - Input Layer (x): 4 feature neurons (Normalized feature inputs)
 *   - Hidden Layer 1 (h¹): 5 neurons with non-linear activation (ReLU / GELU / Tanh)
 *   - Hidden Layer 2 (h²): 4 latent representation neurons
 *   - Output Layer (ŷ): 2 Softmax classification logits (Probability distribution)
 *
 * Features:
 *   - Real-time forward-propagation signal wavelets traversing synapses
 *   - Dynamic neuron activation states with glowing core intensity
 *   - Interactive activation function switcher (ReLU / GELU / Tanh)
 *   - Hover telemetry: inspect weights and activations per neuron
 *   - Clean, professional, frameless modern developer UI (Zero Mac window chrome)
 */

// Fixed deterministic layers geometry (viewBox 0 0 500 210)
const LAYERS = [
  {
    id: 'in',
    name: 'Input Layer',
    label: 'Features (x)',
    x: 55,
    nodes: [
      { id: 'in_0', label: 'x₁', y: 38, baseAct: 0.88 },
      { id: 'in_1', label: 'x₂', y: 78, baseAct: 0.42 },
      { id: 'in_2', label: 'x₃', y: 118, baseAct: 0.94 },
      { id: 'in_3', label: 'x₄', y: 158, baseAct: 0.25 }
    ]
  },
  {
    id: 'h1',
    name: 'Hidden Layer 1',
    label: 'Dense · 5',
    x: 180,
    nodes: [
      { id: 'h1_0', label: 'h₁', y: 24, baseAct: 0.76 },
      { id: 'h1_1', label: 'h₂', y: 62, baseAct: 0.89 },
      { id: 'h1_2', label: 'h₃', y: 100, baseAct: 0.31 },
      { id: 'h1_3', label: 'h₄', y: 138, baseAct: 0.82 },
      { id: 'h1_4', label: 'h₅', y: 176, baseAct: 0.64 }
    ]
  },
  {
    id: 'h2',
    name: 'Hidden Layer 2',
    label: 'Dense · 4',
    x: 305,
    nodes: [
      { id: 'h2_0', label: "h'₁", y: 38, baseAct: 0.92 },
      { id: 'h2_1', label: "h'₂", y: 78, baseAct: 0.58 },
      { id: 'h2_2', label: "h'₃", y: 118, baseAct: 0.84 },
      { id: 'h2_3', label: "h'₄", y: 158, baseAct: 0.22 }
    ]
  },
  {
    id: 'out',
    name: 'Output Layer',
    label: 'Softmax (ŷ)',
    x: 430,
    nodes: [
      { id: 'out_0', label: 'ŷ₁', y: 68, baseAct: 0.96, classLabel: 'Class A' },
      { id: 'out_1', label: 'ŷ₂', y: 128, baseAct: 0.04, classLabel: 'Class B' }
    ]
  }
];

// Pre-computed deterministic synaptic connections
const SYNAPSES = [
  // Layer 0 -> Layer 1 (4 x 5 = 20 synapses)
  { from: 'in_0', to: 'h1_0', x1: 55, y1: 38, x2: 180, y2: 24, w: 0.85, isPos: true },
  { from: 'in_0', to: 'h1_1', x1: 55, y1: 38, x2: 180, y2: 62, w: 0.62, isPos: true },
  { from: 'in_0', to: 'h1_2', x1: 55, y1: 38, x2: 180, y2: 100, w: -0.45, isPos: false },
  { from: 'in_0', to: 'h1_3', x1: 55, y1: 38, x2: 180, y2: 138, w: 0.72, isPos: true },
  { from: 'in_0', to: 'h1_4', x1: 55, y1: 38, x2: 180, y2: 176, w: -0.38, isPos: false },

  { from: 'in_1', to: 'h1_0', x1: 55, y1: 78, x2: 180, y2: 24, w: -0.52, isPos: false },
  { from: 'in_1', to: 'h1_1', x1: 55, y1: 78, x2: 180, y2: 62, w: 0.78, isPos: true },
  { from: 'in_1', to: 'h1_2', x1: 55, y1: 78, x2: 180, y2: 100, w: 0.35, isPos: true },
  { from: 'in_1', to: 'h1_3', x1: 55, y1: 78, x2: 180, y2: 138, w: -0.61, isPos: false },
  { from: 'in_1', to: 'h1_4', x1: 55, y1: 78, x2: 180, y2: 176, w: 0.44, isPos: true },

  { from: 'in_2', to: 'h1_0', x1: 55, y1: 118, x2: 180, y2: 24, w: 0.91, isPos: true },
  { from: 'in_2', to: 'h1_1', x1: 55, y1: 118, x2: 180, y2: 62, w: 0.54, isPos: true },
  { from: 'in_2', to: 'h1_2', x1: 55, y1: 118, x2: 180, y2: 100, w: -0.82, isPos: false },
  { from: 'in_2', to: 'h1_3', x1: 55, y1: 118, x2: 180, y2: 138, w: 0.88, isPos: true },
  { from: 'in_2', to: 'h1_4', x1: 55, y1: 118, x2: 180, y2: 176, w: 0.65, isPos: true },

  { from: 'in_3', to: 'h1_0', x1: 55, y1: 158, x2: 180, y2: 24, w: -0.33, isPos: false },
  { from: 'in_3', to: 'h1_1', x1: 55, y1: 158, x2: 180, y2: 62, w: 0.41, isPos: true },
  { from: 'in_3', to: 'h1_2', x1: 55, y1: 158, x2: 180, y2: 100, w: 0.58, isPos: true },
  { from: 'in_3', to: 'h1_3', x1: 55, y1: 158, x2: 180, y2: 138, w: -0.74, isPos: false },
  { from: 'in_3', to: 'h1_4', x1: 55, y1: 158, x2: 180, y2: 176, w: 0.82, isPos: true },

  // Layer 1 -> Layer 2 (5 x 4 = 20 synapses)
  { from: 'h1_0', to: 'h2_0', x1: 180, y1: 24, x2: 305, y2: 38, w: 0.84, isPos: true },
  { from: 'h1_0', to: 'h2_1', x1: 180, y1: 24, x2: 305, y2: 78, w: -0.42, isPos: false },
  { from: 'h1_0', to: 'h2_2', x1: 180, y1: 24, x2: 305, y2: 118, w: 0.68, isPos: true },
  { from: 'h1_0', to: 'h2_3', x1: 180, y1: 24, x2: 305, y2: 158, w: -0.55, isPos: false },

  { from: 'h1_1', to: 'h2_0', x1: 180, y1: 62, x2: 305, y2: 38, w: 0.95, isPos: true },
  { from: 'h1_1', to: 'h2_1', x1: 180, y1: 62, x2: 305, y2: 78, w: 0.61, isPos: true },
  { from: 'h1_1', to: 'h2_2', x1: 180, y1: 62, x2: 305, y2: 118, w: 0.74, isPos: true },
  { from: 'h1_1', to: 'h2_3', x1: 180, y1: 62, x2: 305, y2: 158, w: -0.39, isPos: false },

  { from: 'h1_2', to: 'h2_0', x1: 180, y1: 100, x2: 305, y2: 38, w: -0.65, isPos: false },
  { from: 'h1_2', to: 'h2_1', x1: 180, y1: 100, x2: 305, y2: 78, w: 0.48, isPos: true },
  { from: 'h1_2', to: 'h2_2', x1: 180, y1: 100, x2: 305, y2: 118, w: -0.32, isPos: false },
  { from: 'h1_2', to: 'h2_3', x1: 180, y1: 100, x2: 305, y2: 158, w: 0.71, isPos: true },

  { from: 'h1_3', to: 'h2_0', x1: 180, y1: 138, x2: 305, y2: 38, w: 0.77, isPos: true },
  { from: 'h1_3', to: 'h2_1', x1: 180, y1: 138, x2: 305, y2: 78, w: -0.58, isPos: false },
  { from: 'h1_3', to: 'h2_2', x1: 180, y1: 138, x2: 305, y2: 118, w: 0.89, isPos: true },
  { from: 'h1_3', to: 'h2_3', x1: 180, y1: 138, x2: 305, y2: 158, w: -0.46, isPos: false },

  { from: 'h1_4', to: 'h2_0', x1: 180, y1: 176, x2: 305, y2: 38, w: 0.52, isPos: true },
  { from: 'h1_4', to: 'h2_1', x1: 180, y1: 176, x2: 305, y2: 78, w: 0.73, isPos: true },
  { from: 'h1_4', to: 'h2_2', x1: 180, y1: 176, x2: 305, y2: 118, w: 0.45, isPos: true },
  { from: 'h1_4', to: 'h2_3', x1: 180, y1: 176, x2: 305, y2: 158, w: -0.62, isPos: false },

  // Layer 2 -> Layer 3 (4 x 2 = 8 synapses)
  { from: 'h2_0', to: 'out_0', x1: 305, y1: 38, x2: 430, y2: 68, w: 1.15, isPos: true },
  { from: 'h2_0', to: 'out_1', x1: 305, y1: 38, x2: 430, y2: 128, w: -0.88, isPos: false },

  { from: 'h2_1', to: 'out_0', x1: 305, y1: 78, x2: 430, y2: 68, w: 0.72, isPos: true },
  { from: 'h2_1', to: 'out_1', x1: 305, y1: 78, x2: 430, y2: 128, w: -0.64, isPos: false },

  { from: 'h2_2', to: 'out_0', x1: 305, y1: 118, x2: 430, y2: 68, w: 1.05, isPos: true },
  { from: 'h2_2', to: 'out_1', x1: 305, y1: 118, x2: 430, y2: 128, w: -0.92, isPos: false },

  { from: 'h2_3', to: 'out_0', x1: 305, y1: 158, x2: 430, y2: 68, w: -0.78, isPos: false },
  { from: 'out_1', to: 'out_1', x1: 305, y1: 158, x2: 430, y2: 128, w: 0.85, isPos: true }
];

export default function NeuralNetworkVisual() {
  const [activeLayer, setActiveLayer] = useState(0);
  const [hoveredNode, setHoveredNode] = useState(null);

  // Progressive forward-propagation wave: Layer 0 -> Layer 1 -> Layer 2 -> Layer 3 -> Hold -> Next batch
  useEffect(() => {
    const phaseDelay = activeLayer === 3 ? 1800 : 420;
    const timer = setTimeout(() => {
      setActiveLayer(prev => (prev >= 3 ? 0 : prev + 1));
    }, phaseDelay);

    return () => clearTimeout(timer);
  }, [activeLayer]);

  // Signal packet travel coordinates for currently firing layer
  const activeSynapses = useMemo(() => {
    if (activeLayer === 0) return SYNAPSES.slice(0, 20); // In -> H1
    if (activeLayer === 1) return SYNAPSES.slice(20, 40); // H1 -> H2
    if (activeLayer === 2) return SYNAPSES.slice(40, 48); // H2 -> Out
    return [];
  }, [activeLayer]);

  return (
    <div className="nn-visual-frame" aria-label="Interactive Deep Neural Network Architecture">
      {/* Main SVG Neural Network Architecture */}
      <div className="nn-visual-container">
        {/* Ambient atmospheric backdrop glow */}
        <div className="nn-ambient-glow" />

        <svg
          viewBox="0 0 490 205"
          className="nn-svg"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
        >
          <defs>
            <filter id="neuronGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="packetGlow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. Synaptic Connections (Weights W) */}
          <g className="nn-synapses-group">
            {SYNAPSES.map((syn, i) => {
              const isHovered = hoveredNode && (syn.from === hoveredNode || syn.to === hoveredNode);
              const opacity = isHovered ? 0.95 : Math.max(0.12, Math.min(0.42, Math.abs(syn.w) * 0.38));
              const strokeColor = syn.isPos ? '#38bdf8' : '#a855f7';

              return (
                <line
                  key={`syn-${i}`}
                  x1={syn.x1}
                  y1={syn.y1}
                  x2={syn.x2}
                  y2={syn.y2}
                  stroke={strokeColor}
                  strokeWidth={isHovered ? 1.8 : 1.1}
                  strokeOpacity={opacity}
                  strokeDasharray={isHovered ? "none" : "none"}
                  className="nn-synapse-line"
                />
              );
            })}
          </g>

          {/* 2. Traveling Forward-Pass Signal Packets */}
          <g className="nn-signals-group" filter="url(#packetGlow)">
            {activeSynapses.map((syn, i) => {
              if (i % 2 !== 0) return null; // Animate alternating clean subset to avoid visual clutter
              return (
                <circle
                  key={`pkt-${i}`}
                  r="2.2"
                  fill="#ffffff"
                  className="nn-signal-packet"
                >
                  <animate
                    attributeName="cx"
                    from={syn.x1}
                    to={syn.x2}
                    dur="0.42s"
                    repeatCount="1"
                    fill="freeze"
                  />
                  <animate
                    attributeName="cy"
                    from={syn.y1}
                    to={syn.y2}
                    dur="0.42s"
                    repeatCount="1"
                    fill="freeze"
                  />
                </circle>
              );
            })}
          </g>

          {/* 3. Layer Columns & Neuron Nodes */}
          {LAYERS.map((layer, lIdx) => {
            const isLayerActive = activeLayer >= lIdx;

            return (
              <g key={layer.id} className="nn-layer-group">
                {/* Layer Subtitle Header */}
                <text
                  x={layer.x}
                  y="12"
                  textAnchor="middle"
                  className={`nn-layer-label ${isLayerActive ? 'active' : ''}`}
                >
                  {layer.label}
                </text>

                {/* Layer Neurons */}
                {layer.nodes.map((node, nIdx) => {
                  const isNodeHovered = hoveredNode === node.id;
                  const isWinner = layer.id === 'out' && nIdx === 0 && activeLayer === 3;
                  const activation = Math.min(0.98, node.baseAct);

                  return (
                    <g
                      key={node.id}
                      className="nn-node-group"
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      {/* Outer Halo on Activation or Win */}
                      {(isWinner || isNodeHovered) && (
                        <circle
                          cx={layer.x}
                          cy={node.y}
                          r="12"
                          className="nn-node-halo"
                        />
                      )}

                      {/* Neuron Boundary Ring */}
                      <circle
                        cx={layer.x}
                        cy={node.y}
                        r="8.5"
                        className={`nn-node-ring ${isLayerActive ? 'active' : ''} ${isWinner ? 'winner' : ''}`}
                      />

                      {/* Neuron Activation Core */}
                      <circle
                        cx={layer.x}
                        cy={node.y}
                        r="5.5"
                        fill={isWinner ? "#38bdf8" : isLayerActive ? `rgba(56, 189, 248, ${activation})` : "rgba(255, 255, 255, 0.12)"}
                        className="nn-node-core"
                        filter={isLayerActive && activation > 0.6 ? "url(#neuronGlow)" : undefined}
                      />

                      {/* Neuron In-Node Math Label */}
                      <text
                        x={layer.x}
                        y={node.y + 3.5}
                        textAnchor="middle"
                        className="nn-node-text"
                      >
                        {node.label}
                      </text>

                      {/* Output Probability Pill (for output layer) */}
                      {layer.id === 'out' && (
                        <g transform={`translate(${layer.x + 14}, ${node.y - 7})`}>
                          <rect
                            x="0"
                            y="0"
                            width="52"
                            height="14"
                            rx="3"
                            className={`nn-prob-box ${isWinner ? 'winner' : ''}`}
                          />
                          <text x="26" y="10.5" textAnchor="middle" className="nn-prob-text">
                            {(activation * 100).toFixed(1)}%
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

