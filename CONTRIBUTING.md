# Contributing to Atlas

Thank you for your interest in contributing to **Atlas**! 

Atlas is an interactive, step-by-step visual learning playground designed to help developers, students, and researchers understand **how machine learning algorithms work internally** through genuine mathematical simulations, live telemetry, and clean design.

---

## Table of Contents
1. [Core Principles](#core-principles)
2. [Getting Started](#getting-started)
3. [How to Add a New Algorithm](#how-to-add-a-new-algorithm)
4. [Design & Code Standards](#design--code-standards)
5. [Pull Request Process](#pull-request-process)
6. [Code of Conduct](#code-of-conduct)

---

## Core Principles

Every module and contribution to Atlas should align with these guiding principles:

- **Mathematical Integrity**: Use genuine algorithm calculations (gradient descent, eigenvalue decomposition, distance metrics, covariance, etc.). Do not fake results or create animations that are disconnected from the underlying computation.
- **Explain the "Why", Not Just the "What"**: Visualize intermediate steps, loss curves, gradients, and decision boundaries rather than only presenting static end results.
- **Restrained Developer-Tool Aesthetic**: Follow Atlas's clean, typography-led, high-contrast dark/light design system. Avoid flashy glow effects, unnecessary 3D engines, glassmorphism, or generic dashboard styling.
- **Zero Heavy Dependencies**: Keep the bundle lightweight and fast. Visualizations should rely on clean SVG geometry, canvas, and native CSS/React hooks rather than heavy charting or animation libraries.
- **Accessibility & Responsiveness**: Support keyboard navigation (Space for play/pause, $\leftarrow/\rightarrow$ for stepping), responsive mobile/tablet layouts, and `prefers-reduced-motion`.

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v18.17+ or v20+
- **npm**: v9+ or v10+

### 2. Fork and Clone
```bash
git clone https://github.com/<your-username>/atlas.git
cd atlas
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view Atlas in your browser.

### 5. Build and Test
Always verify that production builds succeed with zero errors:
```bash
npm run build
```

---

## How to Add a New Algorithm

Adding a new algorithm or topic involves three structured steps:

### Step 1: Create the Simulation Engine
Create a new file in `app/ml/algorithms/<your-slug>.js`.

Your module should export a generator function that accepts a deterministic PRNG `r` (and optional parameter value `param`) and returns an array of frame objects:

```javascript
import { cp, f2, f3, mean } from './common';

export function myAlgorithmEngine(r, param = 0) {
  // 1. Generate deterministic sample points
  // 2. Compute steps, gradients, or iterations
  // 3. Return an array of step frames S
  const S = [
    {
      t: 'Initial State',
      d: 'Description of the starting conditions and data.',
      v: initialLoss,  // Numeric value for the live loss chart/sparkline
      x: 0,            // Step index or iteration number
      pts: [...],      // Array of points: { x, y, c } (coordinates 0–100)
      lines: [...],    // Optional lines: { a: [x1, y1], b: [x2, y2], col: '--ac', w: 1 }
      circles: [...],  // Optional circles/ellipses: { cx, cy, rx, ry, col }
      field: (x, y) => [classIndex, intensity] // Optional background decision region
    },
    // ... subsequent step frames
  ];

  return S;
}

export const myAlgorithm = {
  slug: 'my-algorithm',
  n: 'My Algorithm',
  g: 'Supervised', // or 'Unsupervised'
  gen: myAlgorithmEngine,
  pm: ['Parameter Name', minVal, maxVal, defaultVal], // Optional interactive slider
  i: 'Concise one-line summary of the algorithm.'
};
```

### Step 2: Register in the Algorithms Catalog
In `app/ml/algorithms/index.js`:
1. Re-export your file:
   ```javascript
   export * from './my-algorithm.js';
   ```
2. Import the object and append it to `A` and `algorithmsBySlug`:
   ```javascript
   import { myAlgorithm } from './my-algorithm.js';

   export const A = [
     // ...
     myAlgorithm
   ];

   export const algorithmsBySlug = {
     // ...
     'my-algorithm': myAlgorithm
   };
   ```

### Step 3: Add Curriculum Content & Mathematics
In `lib/content.js`, add the corresponding metadata object to `C` at the **exact same index** as in `A`:

```javascript
{
  slug: 'my-algorithm',
  name: 'My Algorithm',
  type: 'Supervised',
  task: 'Classification',
  category: 'Classification', // 'Regression', 'Classification', 'Neural Networks', etc.
  tag: 'One-line technical summary displayed on catalog cards.',
  chart: { t: 'Objective loss title', xl: 'iteration', yl: 'loss' },
  intuition: 'Intuitive 1-2 paragraph mental model explaining how the algorithm works.',
  math: [
    ['Model Formula', '\\hat{y} = f(\\mathbf{x})', 'Plain-text explanation of the formula.'],
    ['Loss Function', 'L(\\mathbf{w}) = ...', 'Explanation of the objective function.']
  ],
  steps: [
    'Step 1 summary...',
    'Step 2 summary...'
  ],
  hyper: [
    ['parameter_name', 'Impact and tuning guidance.']
  ],
  pros: ['Advantage 1', 'Advantage 2'],
  cons: ['Limitation 1', 'Limitation 2'],
  use: ['When to use: ...', 'When to avoid: ...'],
  cx: 'Computational complexity: Training O(...) / Prediction O(...)',
  code: `from sklearn.ensemble import ...`
}
```

---

## Design & Code Standards

- **Theme Tokens**: Never hardcode colors like `#fff` or `#000` in visual components. Use CSS custom properties:
  - `var(--bg)`: Background
  - `var(--cd)`: Card background
  - `var(--tx)`: Primary text
  - `var(--mu)`: Muted text
  - `var(--bd)`: Border hairline
  - `var(--p0)` to `var(--p6)`: Palette accents (orange, blue, green, purple, yellow, slate, red)
- **Mathematical LaTeX**:
  - Always write valid KaTeX LaTeX formulas.
  - Test complex formulas to ensure they render properly on the server.
- **Coordinate System**:
  - SVG canvases in `Viz.js` use normalized coordinates from `(0, 0)` at bottom-left to `(100, 100)` at top-right.
  - Use `cp(val)` from `common.js` to clamp points within `3` to `97` to prevent edge clipping.
- **Zero Memory Leaks**:
  - Always clean up `setTimeout`, `setInterval`, or global `window.addEventListener` listeners in `useEffect` return functions.

---

## Pull Request Process

1. **Create a Topic Branch**:
   ```bash
   git checkout -b feature/my-new-algorithm
   ```
2. **Make Focused Commits**:
   - Write clear, imperative commit messages (e.g., `Add Linear Discriminant Analysis simulation engine`).
3. **Verify Locally**:
   - Run `npm run build` to ensure all static routes generate cleanly.
   - Inspect light mode and dark mode transitions.
   - Check mobile layout responsiveness ($\le 900\text{px}$).
4. **Submit Your Pull Request**:
   - Provide a concise summary of what was added or improved.
   - Mention any new mathematical models or edge cases tested.

---

## Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for everyone. Please be respectful, constructive, and collaborative in all issues, pull requests, and discussions.
