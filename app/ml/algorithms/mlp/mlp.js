import { G, cp, f2, f3, mean } from '../common';

/**
 * Multi-layer Perceptron (MLP) Neural Network Simulation Engine
 * Architecture: 2 inputs -> 4 hidden neurons (tanh) -> 1 output neuron (sigmoid).
 * Trains via backpropagation on a non-linearly separable concentric rings dataset.
 */
export function mlpEngine(r) {
  // Non-linear dataset: Concentric circles (Inner cluster Class 1, Outer ring Class 0)
  const P = [];
  // Inner ring: r in [0, 22]
  for (let i = 0; i < 22; i++) {
    const rad = 5 + r() * 16;
    const ang = r() * Math.PI * 2;
    P.push({ x: cp(30 + Math.cos(ang) * rad), y: cp(50 + Math.sin(ang) * rad), c: 1 });
  }
  // Outer ring: r in [30, 45]
  for (let i = 0; i < 26; i++) {
    const rad = 29 + r() * 14;
    const ang = r() * Math.PI * 2;
    P.push({ x: cp(30 + Math.cos(ang) * rad), y: cp(50 + Math.sin(ang) * rad), c: 0 });
  }

  // Neural Network parameters
  // Inputs: x1, x2 (normalized to [-1, 1])
  // Hidden Layer: 4 neurons
  let W1 = Array.from({ length: 4 }, () => [G(r) * 0.8, G(r) * 0.8]);
  let b1 = [0, 0, 0, 0];
  let W2 = [G(r) * 0.8, G(r) * 0.8, G(r) * 0.8, G(r) * 0.8];
  let b2 = 0;

  const sigmoid = z => 1 / (1 + Math.exp(-Math.max(-15, Math.min(15, z))));
  const tanh = z => Math.tanh(z);

  const forward = (x1, x2) => {
    // Normalize inputs around center (30, 50)
    const u = (x1 - 30) / 25;
    const v = (y => (y - 50) / 25)(x2);
    const h = W1.map((w, j) => tanh(w[0] * u + w[1] * v + b1[j]));
    const z2 = W2.reduce((s, w, j) => s + w * h[j], b2);
    const out = sigmoid(z2);
    return { h, out };
  };

  const computeLoss = () => {
    let loss = 0;
    P.forEach(p => {
      const { out } = forward(p.x, p.y);
      const y = p.c;
      loss -= y * Math.log(out + 1e-9) + (1 - y) * Math.log(1 - out + 1e-9);
    });
    return loss / P.length;
  };

  const computeAcc = () => {
    let correct = 0;
    P.forEach(p => {
      const { out } = forward(p.x, p.y);
      if ((out >= 0.5 ? 1 : 0) === p.c) correct++;
    });
    return Math.round((correct / P.length) * 100);
  };

  // Node positions for network visualizer on the right side of the canvas
  // Input: 2 nodes at x=68, Hidden: 4 nodes at x=80, Output: 1 node at x=94
  const inputNodes = [{ x: 68, y: 62 }, { x: 68, y: 38 }];
  const hiddenNodes = [{ x: 80, y: 76 }, { x: 80, y: 58 }, { x: 80, y: 42 }, { x: 80, y: 24 }];
  const outputNodes = [{ x: 94, y: 50 }];

  const buildFrame = (t, d, epoch) => {
    const loss = computeLoss();
    const acc = computeAcc();

    // Synaptic connections lines
    const lines = [];
    // Input to Hidden
    inputNodes.forEach((inp, i) => {
      hiddenNodes.forEach((hid, j) => {
        const w = W1[j][i];
        lines.push({
          a: [inp.x, inp.y],
          b: [hid.x, hid.y],
          col: w > 0 ? '--p1' : '--p0',
          w: Math.max(0.2, Math.min(1.2, Math.abs(w) * 0.45))
        });
      });
    });
    // Hidden to Output
    hiddenNodes.forEach((hid, j) => {
      const w = W2[j];
      lines.push({
        a: [hid.x, hid.y],
        b: [outputNodes[0].x, outputNodes[0].y],
        col: w > 0 ? '--p1' : '--p0',
        w: Math.max(0.2, Math.min(1.2, Math.abs(w) * 0.45))
      });
    });

    // Divider separating classification plane from architecture graph
    lines.push({ a: [60, 0], b: [60, 100], col: '--bd', w: 0.5, dash: '2 2' });

    // Architecture network circles
    const circles = [
      ...inputNodes.map(n => ({ x: n.x, y: n.y, rx: 2.8, ry: 2.8, col: '--mu', fill: '--cd', w: 0.8 })),
      ...hiddenNodes.map((n, j) => ({
        x: n.x,
        y: n.y,
        rx: 3.2,
        ry: 3.2,
        col: '--ac',
        fill: W2[j] > 0 ? '--p1' : '--p0',
        opacity: 0.85,
        w: 0.9
      })),
      ...outputNodes.map(n => ({ x: n.x, y: n.y, rx: 3.6, ry: 3.6, col: '--ac', fill: '--cd', w: 1.1 }))
    ];

    const texts = [
      { x: 30, y: 94, text: 'Decision Plane (2D)', col: '--mu', size: 3.2 },
      { x: 80, y: 94, text: 'Network Architecture', col: '--mu', size: 3.2 },
      { x: 68, y: 70, text: 'x₁', col: '--mu', size: 2.5 },
      { x: 68, y: 30, text: 'x₂', col: '--mu', size: 2.5 },
      { x: 80, y: 84, text: 'Hidden (tanh)', col: '--mu', size: 2.4 },
      { x: 94, y: 42, text: 'ŷ (σ)', col: '--ac', size: 2.6 }
    ];

    return {
      t,
      d,
      v: loss,
      x: epoch,
      pts: P,
      field: (x, y) => {
        if (x > 58) return [5, 0]; // Don't color behind network
        const { out } = forward(x, y);
        return [out >= 0.5 ? 1 : 0, Math.abs(out - 0.5) * 1.8];
      },
      lines,
      circles,
      texts
    };
  };

  const S = [
    {
      t: '1. Non-linear Data Challenge',
      d: 'A single linear model (like Logistic Regression) cannot separate concentric rings. Multi-layer Perceptrons (MLPs) compose non-linear activation functions (tanh, ReLU) to bend decision boundaries into arbitrary topologies.',
      pts: P
    },
    buildFrame(
      '2. Initial Network (Epoch 0)',
      `Random initial weights. The network starts with arbitrary connections. Loss = ${f3(computeLoss())}, Accuracy = ${computeAcc()}%.`,
      0
    )
  ];

  // Train via Mini-batch Stochastic Gradient Descent
  let epoch = 0;
  const epochs = [5, 20, 60, 150, 350, 800];
  const lr = 0.12;

  epochs.forEach(targetEpoch => {
    while (epoch < targetEpoch) {
      // SGD updates
      P.forEach(p => {
        const u = (p.x - 30) / 25;
        const v = (p.y - 50) / 25;
        // Forward
        const h = W1.map((w, j) => tanh(w[0] * u + w[1] * v + b1[j]));
        const z2 = W2.reduce((s, w, j) => s + w * h[j], b2);
        const out = sigmoid(z2);

        // Backward: dL/dz2 = (out - y)
        const dZ2 = out - p.c;
        const dW2 = h.map(val => dZ2 * val);
        const dB2 = dZ2;

        // dL/dh = dZ2 * W2; dL/dz1 = dL/dh * (1 - h^2)
        const dZ1 = h.map((val, j) => dZ2 * W2[j] * (1 - val * val));
        const dW1 = dZ1.map(grad => [grad * u, grad * v]);

        // Weights update
        for (let j = 0; j < 4; j++) {
          W1[j][0] -= lr * dW1[j][0];
          W1[j][1] -= lr * dW1[j][1];
          b1[j] -= lr * dZ1[j];
          W2[j] -= lr * dW2[j];
        }
        b2 -= lr * dB2;
      });
      epoch++;
    }

    S.push(
      buildFrame(
        targetEpoch === 800 ? 'Converged (Non-linear Boundary)' : `Training: Epoch ${epoch}`,
        `Epoch ${epoch}: Loss = ${f3(computeLoss())}, Accuracy = ${computeAcc()}%. Backpropagation propagated prediction errors backward through the network, bending the decision boundary around the inner cluster.`,
        epoch
      )
    );
  });

  return S;
}

export const mlp = {
  slug: 'mlp',
  n: 'Multi-layer Perceptron (MLP)',
  g: 'Supervised',
  gen: mlpEngine,
  i: 'Deep feed-forward network with hidden layers for non-linear learning.'
};
