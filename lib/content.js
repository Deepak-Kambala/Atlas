// Order must match the exported `A` array in app/ml/algorithms/index.js
export const C = [
  // =========================================================================
  // 1. REGRESSION
  // =========================================================================
  {
    slug: 'linear-regression',
    name: 'Linear Regression',
    type: 'Supervised',
    task: 'Regression',
    category: 'Regression',
    tag: 'Predict a numeric target by fitting the best straight line.',
    chart: { t: 'Loss during training: mean squared error', xl: 'iteration', yl: 'MSE' },
    intuition:
      'Imagine pinning a stiff ruler to a scatter plot so it passes as close to every point as possible. The ruler is the model. “Close” is measured by squaring the vertical gap between each point and the ruler and averaging: the line with the smallest average squared gap wins. Gradient descent finds it by repeatedly nudging the slope and intercept downhill on that error.',
    math: [
      ['Model', '\\hat{y} = m\\,x + b \\qquad \\text{(many features: } \\hat{y} = \\mathbf{w}^\\top \\mathbf{x} + b\\text{)}', 'A weighted sum of inputs plus an intercept.'],
      ['Loss function: Mean Squared Error', 'L(m,b) = \\frac{1}{n}\\sum_{i=1}^{n}\\bigl(y_i - (m x_i + b)\\bigr)^2', 'Squaring makes errors positive and punishes big misses far more than small ones. This is the curve in the chart above.'],
      ['Gradients', '\\begin{aligned}\\frac{\\partial L}{\\partial m} &= \\frac{2}{n}\\sum_i (\\hat{y}_i - y_i)\\,x_i \\\\ \\frac{\\partial L}{\\partial b} &= \\frac{2}{n}\\sum_i (\\hat{y}_i - y_i)\\end{aligned}', 'The direction in which the loss grows fastest. We walk the opposite way.'],
      ['Update rule', '\\begin{aligned} m &\\leftarrow m - \\alpha\\,\\frac{\\partial L}{\\partial m}\\\\ b &\\leftarrow b - \\alpha\\,\\frac{\\partial L}{\\partial b}\\end{aligned}', 'α is the learning rate (step size).'],
      ['Closed-form solution', '\\mathbf{w} = (X^\\top X)^{-1} X^\\top \\mathbf{y}', 'The exact minimiser (normal equation), no iterations needed. Fine for few features.'],
      ['Quality metric: R²', 'R^2 = 1 - \\frac{\\sum_i (y_i-\\hat{y}_i)^2}{\\sum_i (y_i-\\bar{y})^2}', '1 is perfect; 0 means no better than always predicting the mean.']
    ],
    steps: [
      'Start with any m and b (here m = 0, b = 0.5).',
      'Predict ŷ for every training point.',
      'Compute the loss (MSE) from the residuals.',
      'Compute the gradient of the loss with respect to m and b.',
      'Move m and b a small step (α) against the gradient.',
      'Repeat until the loss stops decreasing.'
    ],
    hyper: [
      ['Learning rate α', 'Too large and the loss bounces or explodes; too small and training crawls.'],
      ['Iterations', 'How many updates to run; stop when the loss curve flattens.'],
      ['Regularisation', 'Ridge adds λ‖w‖² and Lasso adds λ‖w‖₁ to the loss to shrink weights and fight over-fitting.'],
      ['Feature scaling', 'Not a parameter, but gradient descent converges much faster when features share a scale.']
    ],
    pros: [
      'Fast, simple, and easy to interpret (each weight is an effect size).',
      'Closed-form solution available.',
      'Strong baseline for any numeric prediction.'
    ],
    cons: [
      'Only captures straight-line relationships (unless you add polynomial features).',
      'Very sensitive to outliers because errors are squared.',
      'Breaks down with highly correlated features unless regularised.'
    ],
    use: [
      'Use for: price or demand forecasting, trend lines, a first baseline.',
      'Avoid when the relationship is clearly curved or the target is a category.'
    ],
    cx: 'Training: O(n·d² + d³) closed form, or O(n·d) per gradient step. Prediction: O(d).',
    code: `from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score

model = LinearRegression().fit(X_train, y_train)
print("Coefficients:", model.coef_, model.intercept_)
print("R2 score:", r2_score(y_test, model.predict(X_test)))`
  },

  {
    slug: 'multiple-linear-regression',
    name: 'Multiple Linear Regression',
    type: 'Supervised',
    task: 'Regression',
    category: 'Regression',
    tag: 'Fit a multidimensional hyperplane across multiple input features.',
    chart: { t: 'Multivariate MSE loss during gradient descent', xl: 'iteration', yl: 'MSE' },
    intuition:
      'When an outcome depends on several variables at once (e.g., house price based on size and bedrooms), multiple linear regression fits a plane in 3D or a hyperplane in higher dimensions. Each feature gets its own slope coefficient w_j, showing its unique contribution while holding all other features constant.',
    math: [
      ['Multivariate Model', '\\hat{y} = w_1 x_1 + w_2 x_2 + \\dots + w_p x_p + b = \\mathbf{w}^\\top \\mathbf{x} + b', 'A linear combination of all p input features plus an intercept.'],
      ['Matrix Formulation', '\\hat{\\mathbf{y}} = X \\mathbf{w}', 'X is the n × (p+1) design matrix with a prepended column of 1s.'],
      ['Loss function (MSE)', 'L(\\mathbf{w}) = \\frac{1}{n} \\|\\mathbf{y} - X\\mathbf{w}\\|^2_2', 'Sum of squared perpendicular distances along the target axis.'],
      ['Normal Equation', '\\mathbf{w}^* = (X^\\top X)^{-1} X^\\top \\mathbf{y}', 'Exact analytical solution minimizing squared error across all dimensions simultaneously.'],
      ['Adjusted R²', 'R^2_{\\text{adj}} = 1 - (1-R^2)\\frac{n-1}{n-p-1}', 'Penalizes the addition of useless features that artificially inflate standard R².'],
      ['Multicollinearity & VIF', '\\mathrm{VIF}_j = \\frac{1}{1 - R_j^2}', 'Variance Inflation Factor; VIF > 5 indicates severe redundancy among features.']
    ],
    steps: [
      'Assemble features x₁, x₂, ..., x_p into design matrix X.',
      'Initialize plane weights w₁, w₂ and bias b.',
      'Project predictions ŷ onto the 3D plane for each point.',
      'Compute residual vertical offsets (y - ŷ).',
      'Compute multivariate gradient vector ∇w L.',
      'Update plane orientation downhill until convergence.'
    ],
    hyper: [
      ['Learning rate α', 'Step size for gradient descent.'],
      ['Feature Normalization', 'Standardize (z-score) features so steep gradients along one axis do not dominate.'],
      ['Feature Selection', 'Remove collinear features to keep (XᵀX) invertible and stable.']
    ],
    pros: [
      'Captures simultaneous multi-variable dependencies.',
      'Coefficients quantify partial derivatives (ceteris paribus).',
      'Extremely computationally efficient.'
    ],
    cons: [
      'Suffers from multicollinearity when features are correlated.',
      'Still restricted to planar (linear) response surfaces.',
      'Inverting XᵀX is O(p³) which fails when p > n.'
    ],
    use: [
      'Use for: real estate valuation, econometric modeling, multi-sensor calibration.',
      'Avoid when inputs have strong non-linear interactions without feature transformations.'
    ],
    cx: 'Training: O(n·p² + p³) normal equation, or O(n·p) per gradient step. Prediction: O(p).',
    code: `from sklearn.linear_model import LinearRegression
import numpy as np

# Multi-feature regression (e.g. 2 features)
model = LinearRegression().fit(X_train, y_train)
print("Weights w1, w2:", model.coef_)
print("Intercept b:", model.intercept_)
print("Predictions:", model.predict(X_test[:3]))`
  },

  {
    slug: 'ridge-regression',
    name: 'Ridge Regression',
    type: 'Supervised',
    task: 'Regression',
    category: 'Regression',
    tag: 'Shrink coefficients with an L2 penalty to guard against overfitting.',
    chart: { t: 'Total regularized loss (MSE + λ||w||²)', xl: 'penalty step', yl: 'loss' },
    intuition:
      'When features are collinear or noisy, standard linear regression tends to produce huge positive and negative coefficients that cancel each other out and explode on unseen data. Ridge regression adds a leash: it penalizes the squared size of the weights (L2 penalty). By accepting a tiny amount of bias on the training set, it drastically reduces variance on test data.',
    math: [
      ['Objective Function', 'L_{\\text{ridge}}(\\mathbf{w}) = \\frac{1}{n}\\|\\mathbf{y} - X\\mathbf{w}\\|^2_2 + \\lambda \\|\\mathbf{w}\\|^2_2', 'MSE plus λ times the squared Euclidean norm of coefficients.'],
      ['Ridge Normal Equation', '\\mathbf{w}^* = (X^\\top X + \\lambda I)^{-1} X^\\top \\mathbf{y}', 'Adding λI to XᵀX ensures the matrix is always non-singular and strictly invertible!'],
      ['SVD Shrinkage Factor', 'w_{\\text{ridge}} = \\sum_{i} \\frac{\\sigma_i^2}{\\sigma_i^2 + \\lambda} \\frac{\\mathbf{u}_i^\\top \\mathbf{y}}{\\sigma_i} \\mathbf{v}_i', 'Directions with tiny singular values (noise) are shrunk close to zero.'],
      ['L2 Constraint Ball', '\\min \\|\\mathbf{y}-X\\mathbf{w}\\|^2 \\quad \\text{s.t. } \\|\\mathbf{w}\\|^2_2 \\le t', 'Geometric view: spherical constraint boundary touches the elliptical loss contours.']
    ],
    steps: [
      'Standardize all input features to zero mean and unit variance.',
      'Select regularization parameter λ (or alpha).',
      'Compute (XᵀX + λI) with the positive diagonal ridge.',
      'Solve for shrunk weight vector w*.',
      'Observe how large coefficients shrink toward zero.',
      'Tune λ using cross-validation to find the optimal trade-off.'
    ],
    hyper: [
      ['λ / alpha (penalty)', 'λ=0 is OLS. Large λ forces all weights toward 0, making the model rigid.'],
      ['Solver', 'lsqr, svd, cholesky, or sag depending on dataset sparsity and size.']
    ],
    pros: [
      'Prevents catastrophic overfitting in collinear or high-dimensional settings.',
      'Always has a unique, closed-form, stable solution.',
      'Trades small bias for large variance reduction.'
    ],
    cons: [
      'Does not set coefficients to exactly zero (cannot perform hard feature selection like Lasso).',
      'Requires careful feature scaling beforehand.',
      'Must tune hyperparameter λ.'
    ],
    use: [
      'Use when: features are correlated (e.g. gene expression, financial metrics) or p > n.',
      'Avoid when you need a sparse model with fewer non-zero variables.'
    ],
    cx: 'Training: O(n·p² + p³). Prediction: O(p).',
    code: `from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

# Ridge regression with L2 penalty lambda=1.0
model = make_pipeline(StandardScaler(), Ridge(alpha=1.0))
model.fit(X_train, y_train)
print("Shrunk coefficients:", model.named_steps['ridge'].coef_)`
  },

  {
    slug: 'bias-variance',
    name: 'Bias–Variance Trade-off',
    type: 'Supervised',
    task: 'Regression',
    category: 'Regression',
    tag: 'Analyze model complexity, underfitting, overfitting, and generalization error.',
    chart: { t: 'Generalization Error Decomposition vs Model Capacity', xl: 'complexity (degree)', yl: 'MSE' },
    intuition:
      'Every machine learning algorithm faces a fundamental tension. A model that is too simple (high bias) fails to capture the true underlying signal (underfitting). A model that is too complex (high variance) memorizes the random noise of the training sample (overfitting). The goal is to find the sweet spot that minimizes total expected error on unseen test data.',
    math: [
      ['Error Decomposition', '\\mathbb{E}\\bigl[(y - \\hat{f}(x))^2\\bigr] = \\operatorname{Bias}\\bigl[\\hat{f}(x)\\bigr]^2 + \\operatorname{Var}\\bigl[\\hat{f}(x)\\bigr] + \\sigma^2', 'Total error is the sum of squared bias, variance, and irreducible noise.'],
      ['Bias Definition', '\\operatorname{Bias}\\bigl[\\hat{f}(x)\\bigr] = \\mathbb{E}\\bigl[\\hat{f}(x)\\bigr] - f(x)', 'Difference between the expected prediction of our model and the true relation.'],
      ['Variance Definition', '\\operatorname{Var}\\bigl[\\hat{f}(x)\\bigr] = \\mathbb{E}\\Bigl[\\bigl(\\hat{f}(x) - \\mathbb{E}[\\hat{f}(x)]\\bigr)^2\\Bigr]', 'How much predictions fluctuate across different random training datasets.'],
      ['Irreducible Noise σ²', '\\sigma^2 = \\operatorname{Var}[\\epsilon]', 'Noise inherent in the world; no model can ever beat this floor.']
    ],
    steps: [
      'Generate sample data from a non-linear underlying function.',
      'Fit a linear model (Degree 1): observe high bias / underfitting.',
      'Fit a quadratic / cubic model: observe low bias, balanced variance.',
      'Fit a high-degree polynomial (Degree 8+): observe training error reach zero while test error explodes.',
      'Plot training error vs test error across model complexities.',
      'Identify the minimum of the U-shaped test error curve.'
    ],
    hyper: [
      ['Model Capacity', 'Polynomial degree, tree depth, or number of neural network parameters.'],
      ['Regularization Strength', 'Reduces effective capacity to control variance without changing architecture.']
    ],
    pros: [
      'Universal mental model applicable to all supervised learning.',
      'Directly diagnoses whether a project needs more data or more features.'
    ],
    cons: [
      'Theoretical concept; bias and variance cannot be measured separately in real-world unlabeled production data without holdouts.'
    ],
    use: [
      'Use to diagnose models: if training error is high -> underfitting (increase capacity). If test error is much higher than train -> overfitting (add data, regularize).'
    ],
    cx: 'Conceptual analysis across model fits.',
    code: `import numpy as np
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error

# Compare degrees 1, 3, and 9
for d in [1, 3, 9]:
    pipe = make_pipeline(PolynomialFeatures(d), LinearRegression())
    pipe.fit(X_train, y_train)
    print(f"Degree {d} - Train MSE:", mean_squared_error(y_train, pipe.predict(X_train)))
    print(f"Degree {d} - Test MSE:", mean_squared_error(y_test, pipe.predict(X_test)))`
  },

  // =========================================================================
  // 2. CLASSIFICATION
  // =========================================================================
  {
    slug: 'logistic-regression',
    name: 'Logistic Regression',
    type: 'Supervised',
    task: 'Classification',
    category: 'Classification',
    tag: 'Predict a class probability from a linear decision boundary.',
    chart: { t: 'Loss during training: log-loss (cross-entropy)', xl: 'iteration', yl: 'log-loss' },
    intuition:
      'Linear regression can output any number, but a probability must stay between 0 and 1. Logistic regression computes a linear score and squeezes it through an S-shaped sigmoid curve. Far on one side of the boundary the probability approaches 1, far on the other it approaches 0, and exactly on the line it is 0.5. Despite the name, it is a classifier.',
    math: [
      ['Model', '\\begin{aligned} z &= \\mathbf{w}^\\top\\mathbf{x} + b\\\\ p &= \\sigma(z) = \\frac{1}{1+e^{-z}}\\end{aligned}', 'p is the predicted probability of class 1.'],
      ['Loss function: log-loss (cross-entropy)', 'L = -\\frac{1}{n}\\sum_{i=1}^{n}\\Bigl[y_i\\log p_i + (1-y_i)\\log(1-p_i)\\Bigr]', 'Confident wrong answers are punished heavily. Negative log-likelihood of Bernoulli data.'],
      ['Gradient', '\\begin{aligned}\\frac{\\partial L}{\\partial \\mathbf{w}} &= \\frac{1}{n}\\sum_i (p_i - y_i)\\,\\mathbf{x}_i\\\\ \\frac{\\partial L}{\\partial b} &= \\frac{1}{n}\\sum_i (p_i - y_i)\\end{aligned}', 'Same elegant form as linear regression: prediction minus truth, times input.'],
      ['Decision rule', '\\hat{y}=1 \\iff p \\ge 0.5 \\iff \\mathbf{w}^\\top\\mathbf{x}+b \\ge 0', 'The boundary is a straight line (hyperplane).'],
      ['Log-odds view', '\\log\\frac{p}{1-p} = \\mathbf{w}^\\top\\mathbf{x} + b', 'Each weight is the change in log-odds per unit of that feature.']
    ],
    steps: [
      'Start with small random weights.',
      'Compute z = w·x + b for each point and squash it with the sigmoid to get p.',
      'Measure log-loss against the true labels.',
      'Compute the gradient (p − y) · x averaged over the data.',
      'Update w and b downhill.',
      'Repeat; classify with p ≥ 0.5.'
    ],
    hyper: [
      ['C (inverse regularization)', 'Small C: simpler model, wider tolerance. Large C: fits the training data harder.'],
      ['Penalty', 'L2 shrinks all weights; L1 drives some weights to exactly zero.'],
      ['Threshold', '0.5 by default; move it to trade precision against recall.']
    ],
    pros: [
      'Outputs calibrated probabilities.',
      'Fast, stable, convex, and interpretable.',
      'Works well when classes are roughly linearly separable.'
    ],
    cons: [
      'Linear boundary only without non-linear feature engineering.',
      'Struggles when classes overlap in complex topological shapes.',
      'Sensitive to multicollinearity.'
    ],
    use: [
      'Use for: spam detection, churn prediction, medical risk scoring, default probability.',
      'Avoid for strongly non-linear boundaries.'
    ],
    cx: 'Training: O(n·d) per iteration. Prediction: O(d).',
    code: `from sklearn.linear_model import LogisticRegression

clf = LogisticRegression(C=1.0).fit(X_train, y_train)
print("Probabilities:", clf.predict_proba(X_test[:3]))
print("Accuracy:", clf.score(X_test, y_test))`
  },

  {
    slug: 'svm',
    name: 'Support Vector Machine (SVM)',
    type: 'Supervised',
    task: 'Classification',
    category: 'Classification',
    tag: 'Find the boundary with the widest margin between classes.',
    chart: { t: 'Loss during training: hinge loss + regularisation', xl: 'iteration', yl: 'loss' },
    intuition:
      'Many lines can separate two classes, but some are riskier than others. An SVM picks the one that stays as far as possible from the nearest points of both classes, like building the widest possible road between two towns. Only the points touching the road edges (the support vectors) matter; everything else could be deleted without changing the answer.',
    math: [
      ['Margin', '\\text{margin width} = \\frac{2}{\\lVert\\mathbf{w}\\rVert}', 'Maximising the margin means minimising ‖w‖.'],
      ['Hard-margin problem', '\\begin{aligned}&\\min_{\\mathbf{w},b}\\ \\tfrac12\\lVert\\mathbf{w}\\rVert^2\\\\ &\\text{s.t. } y_i(\\mathbf{w}^\\top\\mathbf{x}_i+b)\\ge 1,\\ \\ y_i\\in\\{-1,+1\\}\\end{aligned}', 'Requires perfectly separable data.'],
      ['Hinge loss (soft margin)', 'L = \\lambda\\lVert\\mathbf{w}\\rVert^2 + \\frac{1}{n}\\sum_{i=1}^{n}\\max\\bigl(0,\\,1-y_i(\\mathbf{w}^\\top\\mathbf{x}_i+b)\\bigr)', 'Zero loss for points safely outside the margin; grows linearly for points inside it or misclassified.'],
      ['Kernel trick', 'K(\\mathbf{x},\\mathbf{x}\') = \\exp\\!\\bigl(-\\gamma\\lVert\\mathbf{x}-\\mathbf{x}\'\\rVert^2\\bigr)', 'Computes similarity in a higher-dimensional space without building it, giving curved boundaries.']
    ],
    steps: [
      'Pick a starting line.',
      'Find points inside or beyond the margin (hinge loss > 0).',
      'Move the line away from those violators while keeping ‖w‖ small.',
      'Repeat until the margin is as wide as the data allows.',
      'Keep the support vectors; discard the rest.',
      'Optionally use a kernel to bend the boundary.'
    ],
    hyper: [
      ['C (≈ 1/λ)', 'Large C: punish violations hard, narrow margin, risk of overfitting. Small C: wide margin, tolerates errors.'],
      ['Kernel', 'linear, polynomial, or RBF.'],
      ['γ (RBF width)', 'High γ gives wiggly, local boundaries; low γ gives smooth ones.']
    ],
    pros: [
      'Effective in high dimensions.',
      'Max-margin boundary generalises well.',
      'Kernels handle non-linear data.'
    ],
    cons: [
      'Slow on very large datasets (O(n²) to O(n³)).',
      'Requires feature scaling.',
      'No direct probabilities without Platt scaling.'
    ],
    use: [
      'Use for: text classification, bioinformatics, image feature classification.',
      'Avoid for datasets with millions of rows.'
    ],
    cx: 'Training: roughly O(n²·d) to O(n³). Prediction: O(support vectors · d).',
    code: `from sklearn.svm import SVC
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

clf = make_pipeline(StandardScaler(), SVC(kernel="rbf", C=1.0, gamma="scale"))
clf.fit(X_train, y_train)
print("Accuracy:", clf.score(X_test, y_test))`
  },

  {
    slug: 'knn',
    name: 'k-Nearest Neighbours (KNN)',
    type: 'Supervised',
    task: 'Classification',
    category: 'Classification',
    tag: 'Classify a point by a vote among its k closest labelled points.',
    intuition:
      '“Tell me who your neighbours are and I will tell you who you are.” KNN never builds an explicit parametric model. It memorises the training data, and when a new point arrives it looks up the k most similar examples and lets them vote. Small k follows the data closely (and chases noise); large k smooths things out.',
    math: [
      ['Minkowski Distance', 'd(\\mathbf{a},\\mathbf{b}) = \\Bigl(\\sum_j |a_j-b_j|^p\\Bigr)^{1/p}', 'p=2 is Euclidean distance; p=1 is Manhattan distance.'],
      ['Majority Vote Rule', '\\hat{y} = \\arg\\max_{c}\\sum_{i\\in N_k(\\mathbf{x})}\\mathbf{1}[y_i=c]', 'Plurality vote among the k closest points in feature space.'],
      ['Distance Weighted Voting', 'w_i = \\frac{1}{d(\\mathbf{x},\\mathbf{x}_i) + \\epsilon}', 'Closer neighbors have a stronger say in the classification.']
    ],
    steps: [
      'Store all labelled training points (no training computation).',
      'Receive a new query point.',
      'Compute its distance to every stored point.',
      'Select the k smallest distances.',
      'Take the majority vote among those k points.',
      'Assign the winning class.'
    ],
    hyper: [
      ['k', 'Odd values avoid ties in binary classification.'],
      ['Distance metric', 'Euclidean, Manhattan, or Cosine.'],
      ['Scaling', 'Always scale features so wide-range features do not dominate distance.']
    ],
    pros: [
      'Simple, transparent, zero training time.',
      'Naturally handles complex multi-class non-linear boundaries.',
      'No assumptions about data distributions.'
    ],
    cons: [
      'Expensive inference on large datasets (scans all points).',
      'Curse of dimensionality in high dimensions.',
      'High memory storage requirements.'
    ],
    use: [
      'Use for: recommendation systems (user similarity), small-scale classification.',
      'Avoid for high-dimensional data (d > 50) or latency-critical applications.'
    ],
    cx: 'Training: O(1). Prediction: O(n·d) brute force, or O(d·log n) with KD-trees.',
    code: `from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

clf = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=5))
clf.fit(X_train, y_train)
print("Score:", clf.score(X_test, y_test))`
  },

  {
    slug: 'decision-tree',
    name: 'Decision Tree',
    type: 'Supervised',
    task: 'Classification',
    category: 'Classification',
    tag: 'Learn yes/no questions that partition data into pure regions.',
    chart: { t: 'Impurity during training: weighted Gini', xl: 'split number', yl: 'weighted Gini' },
    intuition:
      'A decision tree plays twenty questions. At each step it asks the single yes/no question about one feature that best separates the classes, then repeats inside each answer group. Each split lowers impurity until regions are pure or a depth limit is hit. Predicting is just following the questions down to a leaf.',
    math: [
      ['Gini Impurity', 'G = 1-\\sum_{c} p_c^2', '0 when all points in a region belong to one class; max 0.5 for balanced binary classes.'],
      ['Entropy', 'H = -\\sum_c p_c\\log_2 p_c', 'Information-theoretic measure of uncertainty in bits.'],
      ['Split Score', 'G_{\\text{split}} = \\frac{n_L}{n}G(\\text{left}) + \\frac{n_R}{n}G(\\text{right})', 'Weighted average impurity of the two child partitions.']
    ],
    steps: [
      'Start with all data in the root node.',
      'Scan every feature and candidate split threshold.',
      'Pick the split with the lowest weighted child impurity.',
      'Divide the dataset into left and right branches.',
      'Recurse until nodes are pure or max_depth is reached.',
      'Leaves predict the majority class.'
    ],
    hyper: [
      ['max_depth', 'Controls tree height; prevents memorizing training noise.'],
      ['min_samples_split', 'Minimum samples required to create a new branch.'],
      ['criterion', 'gini or entropy.']
    ],
    pros: [
      'Completely interpretable and explainable flowchart rules.',
      'Requires no feature scaling.',
      'Naturally handles non-linear interactions and categorical features.'
    ],
    cons: [
      'High variance: tiny data changes can alter the whole tree.',
      'Axis-aligned splits struggle with diagonal boundaries.',
      'Prone to severe overfitting without pruning.'
    ],
    use: [
      'Use for: medical diagnosis rules, credit risk, foundation for Random Forests & XGBoost.',
      'Avoid as a single model on noisy continuous data.'
    ],
    cx: 'Training: O(n·d·log n) per level. Prediction: O(depth).',
    code: `from sklearn.tree import DecisionTreeClassifier, export_text

clf = DecisionTreeClassifier(max_depth=3, criterion="gini").fit(X_train, y_train)
print(export_text(clf))
print("Accuracy:", clf.score(X_test, y_test))`
  },

  {
    slug: 'naive-bayes',
    name: 'Naive Bayes',
    type: 'Supervised',
    task: 'Classification',
    category: 'Classification',
    tag: 'Bayes’ rule with per-class bell curves and independent features.',
    intuition:
      'Naive Bayes asks, “Given that I see these feature values, which class most probably produced them?” It learns what each class typically looks like (a bell curve per feature), then uses Bayes’ rule to flip that into a probability for each class. The “naive” shortcut assumes features are independent within a class, which is rarely exactly true but makes the maths cheap and works surprisingly well.',
    math: [
      ['Bayes’ Rule', 'P(c\\mid\\mathbf{x}) = \\frac{P(\\mathbf{x}\\mid c)\\,P(c)}{P(\\mathbf{x})}', 'Posterior is proportional to Likelihood times Prior.'],
      ['Conditional Independence', 'P(\\mathbf{x}\\mid c) = \\prod_{j=1}^d P(x_j\\mid c)', 'The naive assumption allowing fast 1D likelihood multiplication.'],
      ['Gaussian Likelihood', 'P(x_j\\mid c) = \\frac{1}{\\sigma_{jc}\\sqrt{2\\pi}}\\exp\\!\\Bigl(-\\frac{(x_j-\\mu_{jc})^2}{2\\sigma_{jc}^2}\\Bigr)', 'Univariate normal distribution for continuous features.']
    ],
    steps: [
      'Compute class prior probabilities P(c) from sample counts.',
      'Compute mean μ and variance σ² for each feature within each class.',
      'Evaluate Gaussian densities at the query feature values.',
      'Multiply likelihoods across features with class priors in log space.',
      'Pick the class with the highest posterior score.'
    ],
    hyper: [
      ['var_smoothing', 'Small variance floor added to prevent zero division.'],
      ['Variant', 'Gaussian (continuous), Multinomial (word counts), Bernoulli (binary).']
    ],
    pros: [
      'Extremely fast training and low memory consumption.',
      'Excels with text classification and high-dimensional sparse data.',
      'Requires very little training data to converge.'
    ],
    cons: [
      'Independence assumption ignores correlations among features.',
      'Predicted probabilities are typically over-confident.'
    ],
    use: [
      'Use for: spam filtering, sentiment analysis, quick real-time classification.',
      'Avoid when feature correlations are critical.'
    ],
    cx: 'Training: O(n·d). Prediction: O(c·d).',
    code: `from sklearn.naive_bayes import GaussianNB

clf = GaussianNB().fit(X_train, y_train)
print("Class Priors:", clf.class_prior_)
print("Predictions:", clf.predict(X_test[:3]))`
  },

  {
    slug: 'lda',
    name: 'Linear Discriminant Analysis (LDA)',
    type: 'Supervised',
    task: 'Classification',
    category: 'Classification',
    tag: 'Project data onto an axis maximizing between-class over within-class scatter.',
    chart: { t: 'Fisher Criterion separation score', xl: 'step', yl: 'score' },
    intuition:
      'While PCA finds the direction of greatest overall variance, Linear Discriminant Analysis specifically finds the direction that best separates different classes. It maximizes the distance between class means while minimizing the spread within each class. Points projected onto this Fisher axis are cleanly separated by a perpendicular threshold.',
    math: [
      ['Fisher Criterion', 'J(\\mathbf{w}) = \\frac{\\mathbf{w}^\\top S_B \\mathbf{w}}{\\mathbf{w}^\\top S_W \\mathbf{w}}', 'Ratio of between-class scatter S_B to within-class scatter S_W.'],
      ['Within-Class Scatter', 'S_W = \\sum_{c} \\sum_{\\mathbf{x} \\in C_c} (\\mathbf{x} - \\boldsymbol{\\mu}_c)(\\mathbf{x} - \\boldsymbol{\\mu}_c)^\\top', 'Sum of covariance matrices within each class.'],
      ['Between-Class Scatter', 'S_B = (\\boldsymbol{\\mu}_1 - \\boldsymbol{\\mu}_2)(\\boldsymbol{\\mu}_1 - \\boldsymbol{\\mu}_2)^\\top', 'Outer product of the difference between class centroids.'],
      ['Optimal Projection Vector', '\\mathbf{w} = S_W^{-1}(\\boldsymbol{\\mu}_1 - \\boldsymbol{\\mu}_2)', 'Solution to the generalized eigenvalue problem.']
    ],
    steps: [
      'Compute the d-dimensional mean vector for each class.',
      'Compute the within-class scatter matrix S_W.',
      'Compute the between-class scatter matrix S_B.',
      'Solve for the optimal projection direction w = S_W⁻¹(μ₁ - μ₂).',
      'Project all samples onto vector w.',
      'Set the decision boundary at the midpoint between projected centroids.'
    ],
    hyper: [
      ['solver', 'svd, lsqr, or eigen.'],
      ['shrinkage', 'Regularization for S_W when sample count n is small relative to d.']
    ],
    pros: [
      'Analytic closed-form solution with no iterations required.',
      'Both a powerful linear classifier and a supervised dimensionality reducer.',
      'Highly effective when Gaussian assumptions hold.'
    ],
    cons: [
      'Assumes all classes share identical covariance matrices.',
      'Restricted to linear boundaries (QDA is needed for quadratic curves).',
      'Cannot exceed C-1 projection dimensions (where C is class count).'
    ],
    use: [
      'Use for: face recognition (Fisherfaces), medical biomarker screening, supervised feature reduction.',
      'Avoid when classes have very different covariances or complex multi-modal clusters.'
    ],
    cx: 'Training: O(n·d² + d³). Prediction: O(d).',
    code: `from sklearn.discriminant_analysis import LinearDiscriminantAnalysis

lda = LinearDiscriminantAnalysis(n_components=1)
X_proj = lda.fit_transform(X_train, y_train)
print("Projected shape:", X_proj.shape)
print("Accuracy:", lda.score(X_test, y_test))`
  },

  // =========================================================================
  // 3. NEURAL NETWORKS
  // =========================================================================
  {
    slug: 'mlp',
    name: 'Multi-layer Perceptron (MLP)',
    type: 'Supervised',
    task: 'Classification',
    category: 'Neural Networks',
    tag: 'Deep feed-forward network with hidden layers for non-linear learning.',
    chart: { t: 'Cross-entropy loss over training epochs', xl: 'epoch', yl: 'loss' },
    intuition:
      'A single linear perceptron can only draw straight lines. A Multi-layer Perceptron (MLP) chains multiple layers of artificial neurons together through non-linear activation functions (like tanh or ReLU). Early layers learn simple spatial primitives; deeper layers combine them into flexible, curved decision boundaries that can wrap around arbitrary non-linear shapes like concentric rings.',
    math: [
      ['Hidden Layer Activation', '\\mathbf{h} = \\tanh(W^{(1)}\\mathbf{x} + \\mathbf{b}^{(1)})', 'Non-linear squashing function that gives the network universal approximation power.'],
      ['Output Layer', '\\hat{y} = \\sigma(W^{(2)}\\mathbf{h} + b^{(2)}) = \\frac{1}{1 + e^{-z^{(2)}}}', 'Sigmoid squashing producing class probability p ∈ (0, 1).'],
      ['Binary Cross-Entropy Loss', 'L = -\\frac{1}{n}\\sum_i \\Bigl[y_i \\log \\hat{y}_i + (1-y_i)\\log(1-\\hat{y}_i)\\Bigr]', 'Quantifies divergence between predicted probabilities and binary truth.'],
      ['Backpropagation Chain Rule', '\\frac{\\partial L}{\\partial W^{(1)}} = \\frac{\\partial L}{\\partial z^{(2)}} W^{(2)} \\odot (1 - \\mathbf{h}^2) \\, \\mathbf{x}^\\top', 'Errors propagate backward through layers to compute parameter gradients.']
    ],
    steps: [
      'Initialize network weights randomly to break symmetry.',
      'Forward pass: multiply inputs through hidden layers and apply activation functions.',
      'Compute loss on the batch predictions.',
      'Backward pass: propagate errors backward using the calculus chain rule.',
      'Compute partial derivatives with respect to every weight and bias.',
      'Update parameters using gradient descent (SGD / Adam).'
    ],
    hyper: [
      ['hidden_layer_sizes', 'Number of hidden layers and neurons per layer.'],
      ['activation', 'relu, tanh, or logistic.'],
      ['learning_rate_init', 'Step size for weight adjustments.'],
      ['max_iter', 'Number of training epochs.']
    ],
    pros: [
      'Universal approximator: can learn any continuous non-linear function.',
      'Flexible architecture customizable to any tabular, visual, or sequence task.'
    ],
    cons: [
      'Black-box nature: difficult to inspect and interpret learned weights.',
      'Prone to vanishing/exploding gradients and local minima without careful tuning.',
      'Requires substantial training samples and computational power.'
    ],
    use: [
      'Use for: non-linear classification, speech recognition, image embeddings, complex interactions.',
      'Avoid when simple linear or tree models achieve comparable accuracy with full interpretability.'
    ],
    cx: 'Training: O(epochs · n · weights). Prediction: O(weights).',
    code: `from sklearn.neural_network import MLPClassifier

clf = MLPClassifier(hidden_layer_sizes=(16, 8), activation="tanh", max_iter=500)
clf.fit(X_train, y_train)
print("Accuracy:", clf.score(X_test, y_test))`
  },

  // =========================================================================
  // 4. MODEL EVALUATION
  // =========================================================================
  {
    slug: 'cross-validation',
    name: 'k-Fold Cross-Validation',
    type: 'Supervised',
    task: 'Model Evaluation',
    category: 'Model Evaluation',
    tag: 'Partition data into k folds to evaluate out-of-sample performance.',
    chart: { t: 'Validation error across k distinct folds', xl: 'fold', yl: 'val MSE' },
    intuition:
      'Evaluating a model on the same data it learned from produces wildly optimistic illusions. A single train/test split can also be misleading if a lucky or unlucky split occurs. k-Fold Cross-Validation splits the dataset into k equal slices. It trains on k-1 slices and tests on the remaining slice, rotating through all k permutations so every single data point serves as a test sample exactly once.',
    math: [
      ['k-Fold CV Score', '\\mathrm{CV}_{(k)} = \\frac{1}{k}\\sum_{i=1}^k \\mathrm{MSE}_i', 'Average validation score across all k rotation iterations.'],
      ['Leave-One-Out (LOO) Variant', '\\mathrm{CV}_{(\\mathrm{LOO})} = \\frac{1}{n}\\sum_{i=1}^n L\\bigl(y_i, \\hat{f}^{(-i)}(x_i)\\bigr)', 'Special extreme case where k = n: each single sample is held out in turn.'],
      ['Standard Error of the Mean', '\\mathrm{SE} = \\frac{\\sigma_{\\mathrm{folds}}}{\\sqrt{k}}', 'Quantifies the uncertainty and stability of the validation estimate.']
    ],
    steps: [
      'Shuffle and partition data into k equal-sized folds.',
      'Designate Fold 1 as the validation set; train model on Folds 2...k.',
      'Compute validation metric on Fold 1.',
      'Rotate: designate Fold 2 as validation; train on remaining folds.',
      'Repeat until all k folds have served as the validation set.',
      'Average validation scores across folds to compute CV estimate.'
    ],
    hyper: [
      ['k (number of folds)', 'Standard defaults are k=5 or k=10. k=N yields Leave-One-Out (LOO).'],
      ['shuffle', 'Whether to shuffle samples before splitting.'],
      ['stratified', 'Ensures each fold preserves original class distribution percentages.']
    ],
    pros: [
      'Utilizes all data for both training and validation without waste.',
      'Provides an honest estimate of generalization performance with variance bounds.',
      'Guards against accidental overfitting to a single arbitrary validation split.'
    ],
    cons: [
      'Multiplies computational training time by a factor of k.'
    ],
    use: [
      'Use for: model selection, hyperparameter tuning, validation on small-to-medium datasets.',
      'Avoid without time-aware splitting on temporal / time-series data.'
    ],
    cx: 'Cost: k × (single model training time).',
    code: `from sklearn.model_selection import cross_val_score, KFold
from sklearn.linear_model import Ridge

# 5-Fold cross-validation
kf = KFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(Ridge(), X, y, cv=kf, scoring="r2")
print("Fold R2 scores:", scores)
print("Mean CV Score:", scores.mean(), "+/-", scores.std())`
  },

  // =========================================================================
  // 5. CLUSTERING
  // =========================================================================
  {
    slug: 'k-means',
    name: 'K-Means Clustering',
    type: 'Unsupervised',
    task: 'Clustering',
    category: 'Clustering',
    tag: 'Split data into K groups around moving centroids.',
    chart: { t: 'Objective during training: inertia (WCSS)', xl: 'round', yl: 'inertia' },
    intuition:
      'Drop K flags on the map. Every point walks to its nearest flag, then each flag moves to the centre of the crowd that gathered around it. Repeat. The flags settle where the groups are. Each round can only lower the total squared distance from points to their flag, so the algorithm always converges, though possibly to a local optimum.',
    math: [
      ['Objective: inertia / WCSS', 'J=\\sum_{k=1}^{K}\\sum_{\\mathbf{x}\\in C_k}\\lVert\\mathbf{x}-\\boldsymbol{\\mu}_k\\rVert^2', 'Total squared distance to assigned centroids.'],
      ['Assignment Step', 'C_k=\\{\\mathbf{x}: \\lVert\\mathbf{x}-\\boldsymbol{\\mu}_k\\rVert\\le\\lVert\\mathbf{x}-\\boldsymbol{\\mu}_j\\rVert\\ \\ \\forall j\\}', 'Nearest centroid wins.'],
      ['Update Step', '\\boldsymbol{\\mu}_k=\\frac{1}{|C_k|}\\sum_{\\mathbf{x}\\in C_k}\\mathbf{x}', 'Centroid moves to the arithmetic mean of its points.'],
      ['Silhouette Score', 's=\\frac{b-a}{\\max(a,b)}', 'a = mean intra-cluster distance, b = mean nearest-cluster distance. Closer to 1 is better.']
    ],
    steps: [
      'Choose K and place K starting centroids.',
      'Assign every point to its nearest centroid.',
      'Move each centroid to the mean of its points.',
      'Recompute assignments.',
      'Stop when assignments no longer change.',
      'Restart several times to escape bad local optima.'
    ],
    hyper: [
      ['K', 'Number of clusters to discover.'],
      ['init', 'k-means++ is the smart default.'],
      ['n_init', 'Number of random restarts.']
    ],
    pros: [
      'Simple, fast, scales to large data.',
      'Easy to interpret via centroids.',
      'Works well on round, similar-sized clusters.'
    ],
    cons: [
      'Must choose K in advance.',
      'Assumes spherical, equal-size clusters.',
      'Very sensitive to initial placement and outliers.'
    ],
    use: [
      'Use for: customer segmentation, colour quantization, vector quantization.',
      'Avoid for non-convex geometries or heavy outliers.'
    ],
    cx: 'O(n·K·d) per iteration.',
    code: `from sklearn.cluster import KMeans

km = KMeans(n_clusters=3, init="k-means++", n_init=10, random_state=0).fit(X)
print("Centroids:", km.cluster_centers_)
print("Inertia:", km.inertia_)`
  },

  {
    slug: 'k-medoids',
    name: 'k-Medoids (PAM)',
    type: 'Unsupervised',
    task: 'Clustering',
    category: 'Clustering',
    tag: 'Group data around actual member medoids to resist extreme outliers.',
    chart: { t: 'Total Absolute Dissimilarity Cost per PAM iteration', xl: 'swap', yl: 'cost' },
    intuition:
      'In k-Means, cluster centers are synthetic averages (centroids). If a dataset contains extreme outliers, the average gets dragged far away from the true cluster. k-Medoids restricts cluster centers to be actual data points (medoids) and minimizes absolute distances instead of squared errors. This makes it dramatically more robust to noise, corrupted inputs, and arbitrary distance metrics.',
    math: [
      ['PAM Objective Function', 'J = \\sum_{i=1}^n \\min_{k=1\\dots K} d(\\mathbf{x}_i, \\mathbf{m}_k)', 'Sum of absolute dissimilarities from each sample to its nearest actual medoid point.'],
      ['Medoid Selection Rule', '\\mathbf{m}_k = \\arg\\min_{\\mathbf{y} \\in C_k} \\sum_{\\mathbf{x} \\in C_k} d(\\mathbf{x}, \\mathbf{y})', 'The medoid is the most centrally located actual member of the cluster.'],
      ['PAM Swap Cost Difference', '\\Delta J = J_{\\text{swap}(m_i \\leftrightarrow o_h)} - J_{\\text{current}}', 'Swap a medoid with a non-medoid candidate if ΔJ < 0.']
    ],
    steps: [
      'Select K actual data points to serve as initial medoids.',
      'Assign each non-medoid point to its closest medoid.',
      'For each medoid and candidate non-medoid, calculate cost change ΔJ of swapping them.',
      'Execute the swap that yields the greatest cost reduction.',
      'Repeat until no further swaps decrease the total dissimilarity.'
    ],
    hyper: [
      ['n_clusters (K)', 'Number of clusters.'],
      ['metric', 'euclidean, manhattan, or cosine.'],
      ['method', 'pam or faster alternate heuristic.']
    ],
    pros: [
      'Extremely robust to outliers and noise.',
      'Medoids are real data points with direct real-world meaning.',
      'Works with arbitrary distance metrics without requiring coordinate averaging.'
    ],
    cons: [
      'Computationally expensive: full PAM swap search is O(K(n-K)²).'
    ],
    use: [
      'Use for: noisy sensor data, customer personas (real exemplar users), non-Euclidean distance clustering.',
      'Avoid on huge datasets with hundreds of thousands of rows without sampling.'
    ],
    cx: 'O(K·(n-K)²) per PAM iteration.',
    code: `from sklearn_extra.cluster import KMedoids

kmed = KMedoids(n_clusters=3, metric="manhattan", random_state=0).fit(X)
print("Medoid point indices:", kmed.medoid_indices_)
print("Labels:", kmed.labels_)`
  },

  {
    slug: 'hierarchical-clustering',
    name: 'Hierarchical Clustering',
    type: 'Unsupervised',
    task: 'Clustering',
    category: 'Clustering',
    tag: 'Build clusters bottom-up or top-down with selectable linkage.',
    chart: { t: 'Merge distance at each step (dendrogram height)', xl: 'merge number', yl: 'distance' },
    intuition:
      'Start with every point as its own cluster, then repeatedly glue together the two closest clusters until only one remains (agglomerative bottom-up), or start with one cluster and recursively split it (divisive top-down). The full history forms a tree called a dendrogram. Cutting the dendrogram at any height gives a complete clustering without needing to guess K in advance.',
    math: [
      ['Single Linkage', 'd(A,B)=\\min_{a\\in A,\\,b\\in B}\\lVert a-b\\rVert', 'Distance between nearest pair. Finds long snake-like chains.'],
      ['Complete Linkage', 'd(A,B)=\\max_{a\\in A,\\,b\\in B}\\lVert a-b\\rVert', 'Distance between furthest pair. Enforces tight compact spheres.'],
      ['Average Linkage', 'd(A,B)=\\frac{1}{|A||B|}\\sum_{a\\in A}\\sum_{b\\in B}\\lVert a-b\\rVert', 'Balanced compromise between single and complete linkage.'],
      ['Ward Linkage', '\\Delta(A,B)=\\frac{|A||B|}{|A|+|B|}\\lVert\\boldsymbol{\\mu}_A-\\boldsymbol{\\mu}_B\\rVert^2', 'Merges clusters that minimize the increase in total within-cluster variance.']
    ],
    steps: [
      'Treat each sample as a singleton cluster.',
      'Compute distance matrix between all clusters using chosen linkage.',
      'Merge the closest pair of clusters.',
      'Update distance matrix to incorporate the merged cluster.',
      'Repeat until all points belong to one root cluster.',
      'Cut dendrogram at chosen height or cluster count.'
    ],
    hyper: [
      ['linkage', 'single, complete, average, or ward.'],
      ['n_clusters / distance_threshold', 'Where to cut the dendrogram tree.']
    ],
    pros: [
      'No need to specify K upfront; full hierarchy is captured.',
      'Dendrogram provides intuitive multiscale visualization.',
      'Deterministic output.'
    ],
    cons: [
      'High computational cost: O(n³) or O(n² log n).',
      'Greedy: previous merges cannot be undone.'
    ],
    use: [
      'Use for: phylogenetics, taxonomy, document topic hierarchies.',
      'Avoid for large datasets (n > 10,000).'
    ],
    cx: 'Time O(n² log n) to O(n³); memory O(n²).',
    code: `from sklearn.cluster import AgglomerativeClustering

# Agglomerative clustering with complete linkage
cluster = AgglomerativeClustering(n_clusters=3, linkage="complete")
labels = cluster.fit_predict(X)
print("Cluster assignments:", labels)`
  },

  {
    slug: 'dbscan',
    name: 'DBSCAN',
    type: 'Unsupervised',
    task: 'Clustering',
    category: 'Clustering',
    tag: 'Grow clusters from dense regions and flag outliers as noise.',
    intuition:
      'DBSCAN thinks of clusters as crowds. A point in a crowded neighbourhood is a core point; clusters grow outward by hopping from core point to nearby core point, so they can take any shape. Points near a crowd but not crowded themselves join as border points, and isolated points are labelled noise instead of being forced into a cluster.',
    math: [
      ['ε-Neighbourhood', 'N_\\varepsilon(p)=\\{q: d(p,q)\\le\\varepsilon\\}', 'All points within radius ε of p.'],
      ['Core Point Condition', '|N_\\varepsilon(p)|\\ge \\text{minPts}', 'Point is dense enough to seed or expand a cluster.'],
      ['Density-Connected', '\\text{chain of core points connecting } p \\text{ and } q', 'Enables clusters to snake through arbitrary non-convex geometries.'],
      ['Noise Label', 'p \\notin \\bigcup_k C_k \\implies \\text{label}(p) = -1', 'Unassigned points are flagged as noise outliers.']
    ],
    steps: [
      'Find the ε-neighborhood of each point.',
      'Identify core points with at least minPts neighbors.',
      'Find connected components of core points.',
      'Assign non-core points within ε of a core point to the cluster (border points).',
      'Label all remaining isolated points as noise (-1).'
    ],
    hyper: [
      ['eps (ε)', 'Neighborhood radius.'],
      ['min_samples (minPts)', 'Minimum neighbors to form a dense core.']
    ],
    pros: [
      'Discovers arbitrary, non-spherical geometric shapes.',
      'Automatically identifies and isolates noise and outliers.',
      'Does not require specifying K in advance.'
    ],
    cons: [
      'Fails when clusters have substantially different densities.',
      'Sensitive to eps parameter choice.'
    ],
    use: [
      'Use for: spatial GPS anomaly detection, non-convex cluster shapes.',
      'Avoid with high-dimensional data or varying density clusters.'
    ],
    cx: 'O(n log n) with spatial index; O(n²) worst case.',
    code: `from sklearn.cluster import DBSCAN

db = DBSCAN(eps=0.3, min_samples=5).fit(X)
print("Clusters found:", set(db.labels_))
print("Noise count:", list(db.labels_).count(-1))`
  },

  // =========================================================================
  // 6. DIMENSIONALITY REDUCTION
  // =========================================================================
  {
    slug: 'pca',
    name: 'Principal Component Analysis (PCA)',
    type: 'Unsupervised',
    task: 'Dimensionality reduction',
    category: 'Dimensionality Reduction',
    tag: 'Find orthogonal directions of maximum variance to compress dimensions.',
    chart: { t: 'Explained variance ratio per principal component', xl: 'component', yl: 'variance ratio' },
    intuition:
      'Photograph a long thin cloud of points. From the side you see its full length; from the end it looks like a dot. PCA finds the best angle: the direction along which the data is most spread out (PC1), then the next best direction at a right angle (PC2), and so on. Keeping only the first few directions compresses the data while preserving most of its information.',
    math: [
      ['Center the Data', '\\tilde{X}=X-\\boldsymbol{\\mu}', 'Subtract the mean of each feature.'],
      ['Covariance Matrix', 'C=\\frac{1}{n-1}\\tilde{X}^\\top\\tilde{X}', 'Measures pairwise linear relationships between features.'],
      ['Eigen-decomposition', 'C\\,\\mathbf{v}_j=\\lambda_j\\,\\mathbf{v}_j', 'Eigenvectors v_j are principal components; eigenvalues λ_j are the variances.'],
      ['Explained Variance Ratio', '\\mathrm{EVR}_j=\\frac{\\lambda_j}{\\sum_i\\lambda_i}', 'Fraction of total dataset information retained by component j.'],
      ['Projection', 'Z=\\tilde{X}\\,V_k', 'Coordinates in the compressed k-dimensional subspace.'],
      ['Reconstruction Error', '\\min \\|\\tilde{X} - \\tilde{X}V_k V_k^\\top\\|_F^2 = (n-1)\\sum_{j > k} \\lambda_j', 'PCA is the linear projection that minimizes mean squared reconstruction loss.']
    ],
    steps: [
      'Standardize the features (zero mean, unit variance).',
      'Compute the covariance matrix C.',
      'Compute eigenvectors and eigenvalues of C (or SVD of X).',
      'Sort eigenvectors in descending order of eigenvalues.',
      'Select top k eigenvectors to form projection matrix V_k.',
      'Project data into k dimensions: Z = X V_k.'
    ],
    hyper: [
      ['n_components', 'Target number of dimensions or variance percentage (e.g. 0.95).'],
      ['whiten', 'Rescales component projections to unit variance.']
    ],
    pros: [
      'Removes multi-collinearity and redundancy.',
      'Enables 2D/3D visualization of high-dimensional datasets.',
      'Minimizes information loss for linear projections.'
    ],
    cons: [
      'Components are linear combinations that can be hard to interpret.',
      'Cannot capture non-linear manifold structures (unlike t-SNE / UMAP).'
    ],
    use: [
      'Use for: data compression, image compression, 2D plotting, noise filtering.',
      'Avoid when preserving original named feature identity is required.'
    ],
    cx: 'O(n·d² + d³) via covariance matrix, or O(n·d·k) via randomized SVD.',
    code: `from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

Xs = StandardScaler().fit_transform(X)
pca = PCA(n_components=2).fit(Xs)
print("Explained variance ratio:", pca.explained_variance_ratio_)
X_reduced = pca.transform(Xs)`
  }
];
