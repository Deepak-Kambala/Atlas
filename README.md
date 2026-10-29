# Atlas

> **Atlas** is an interactive, step-by-step visual learning platform for Machine Learning and Mathematical foundations (Linear Algebra, Calculus & Optimization, Probability & Statistics).

Each algorithm features:
- **Intuition**: Conceptual explanations with real-world mental models.
- **Interactive SVG Visualizer**: Step-by-step step scrubbing, animation speed control, parameter tuning, and dynamic SVG canvas re-rendering.
- **Live Loss & Diagnostic Curves**: Plotting MSE, Log-Loss, margin distances, silhouette scores, or inertia dynamically as the algorithm trains.
- **Mathematical Formulations**: Mathematical definitions and loss functions rendered with KaTeX.
- **Hyperparameter Analysis**: Breakdown of effects, trade-offs, and failure modes.
- **Production Code**: Reference implementations using standard libraries (e.g., `scikit-learn`).

---

## Getting Started

### Prerequisites
- **Node.js**: v18.17+ or v20+ recommended
- **npm**: v9+ / v10+

### Installation
Install the project dependencies:
```bash
npm install
```

### Running Locally
To launch the development server:
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
To create an optimized production build and run it:
```bash
npm run build
npm start
```

---

## Project Structure

```
atlas/
├── app/                               # Next.js 14 App Router routes & layouts
│   ├── layout.js                      # Root HTML layout with KaTeX fonts & theme initializers
│   ├── template.js                    # Transition wrapper for page-to-page navigation
│   ├── globals.css                    # Design system, themes (light/dark), and responsive styles
│   ├── page.js                        # Atlas home / intro hero page
│   ├── ml/
│   │   ├── page.js                    # Machine Learning algorithm overview & card catalog
│   │   ├── [slug]/
│   │   │   └── page.js                # Individual algorithm interactive page (SSG statically generated)
│   │   └── algorithms/                # Topic-based algorithm simulation modules
│   │       ├── common.js              # Shared math, PRNG, and geometry helpers
│   │       ├── k-means/               # K-Means algorithm directory
│   │       │   ├── k-means.js         # K-Means simulation engine & metadata
│   │       │   ├── KMeansSeedSensitivity.js # Interactive seed sensitivity & local minima visual
│   │       │   └── index.js           # Directory export entrypoint
│   │       ├── linear-regression/     # Linear Regression directory
│   │       ├── logistic-regression/   # Logistic Regression directory
│   │       ├── svm/                   # Support Vector Machine directory
│   │       ├── ...                    # Dedicated directory per algorithm
│   │       └── index.js               # Re-exports individual modules, A list, and slug lookups
│   ├── linear-algebra/page.js         # Linear Algebra curriculum
│   ├── calculus-optimization/page.js  # Calculus & Optimization curriculum
│   └── probability-statistics/page.js # Probability & Statistics curriculum
├── components/                        # UI and Visualizer React Components
│   ├── AlgorithmWorkspace.js          # Dominant viewport workspace, step scrubber, toolbar, and contextual panels
│   ├── Viz.js                         # Dynamic SVG canvas rendering decision fields, vectors, polygons, and points
│   ├── Chart.js                       # SVG line and bar charts tracking loss and diagnostic metrics
│   ├── Tex.js                         # KaTeX server-side math renderer and inline rich text formatter
│   ├── Thumb.js                       # Algorithm thumbnail generator using seed-stable preview frames
│   ├── TopNav.js                      # Persistent navigation header with dark/light theme toggle and Cmd+K search
│   ├── ThemeToggle.js                 # Theme switcher with zero-flash localStorage persistence
│   ├── DesktopNotice.js               # Notice banner for mobile viewports
│   ├── GitBranchVisual.js             # Animated Git branching and merging SVG hero graphic
│   ├── SimpleHeroVisual.js            # 3D optimization surface hero visual
│   └── ComingSoon.js                  # Placeholder layout for upcoming math modules
├── lib/                               # Data & Curriculum
│   ├── algorithms.js                  # Re-export bridge to topic algorithms
│   └── content.js                     # Curriculum content, LaTeX equations, explanations, and code
├── next.config.js                     # Next.js configuration
├── package.json                       # Dependencies, scripts, and project metadata
└── README.md                          # Documentation
```

---

## Machine Learning Visualizations Included

1. **Linear Regression** (Supervised / Regression) — Gradient descent minimizing Mean Squared Error (MSE).
2. **Logistic Regression** (Supervised / Classification) — Sigmoid boundary convergence on Cross-Entropy loss.
3. **Support Vector Machines (SVM)** (Supervised / Classification) — Maximum margin hyperplane and support vector identification.
4. **k-Nearest Neighbors (KNN)** (Supervised / Classification) — Voronoi-like decision regions and metric querying.
5. **Decision Tree** (Supervised / Classification) — Orthogonal threshold splitting via Gini impurity reduction.
6. **Naïve Bayes** (Supervised / Classification) — Gaussian likelihood estimation and posterior decision boundaries.
7. **K-Means Clustering** (Unsupervised / Clustering) — Centroid recalculation and Voronoi partition convergence.
8. **Hierarchical Clustering** (Unsupervised / Clustering) — Agglomerative Ward/complete linkage merge passes.
9. **DBSCAN** (Unsupervised / Clustering) — Density-reachable core, border, and noise point traversal.
10. **Principal Component Analysis (PCA)** (Unsupervised / Dimensionality Reduction) — Maximum variance projection onto eigenvectors.

---

## Adding New Algorithms

1. **Simulation Generator & Visuals**: Create a dedicated folder in `app/ml/algorithms/<algorithm-slug>/` containing `<algorithm-slug>.js`, any algorithm-specific visuals, and an `index.js` exporting them. Use utilities from `../common`.
2. **Register Algorithm**: Add the export to `app/ml/algorithms/index.js` in the ordered `A` array and `algorithmsBySlug` map.
3. **Content & Math**: Add the corresponding curriculum entry to `C` in `lib/content.js`, matching the index in `A`. Include LaTeX formulas, hyper-parameters, strengths, and scikit-learn code.
