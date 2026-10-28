// Order must match the exported `A` array in lib/algorithms.js
export const C = [
{slug:'linear-regression',name:'Linear Regression',type:'Supervised',task:'Regression',tag:'Predict a number by fitting the best straight line.',
 chart:{t:'Loss during training: mean squared error',xl:'iteration',yl:'MSE'},
 intuition:'Imagine pinning a stiff ruler to a scatter plot so it passes as close to every point as possible. The ruler is the model. “Close” is measured by squaring the vertical gap between each point and the ruler and averaging: the line with the smallest average squared gap wins. Gradient descent finds it by repeatedly nudging the slope and intercept downhill on that error.',
 math:[['Model','\\hat{y} = m\\,x + b \\qquad \\text{(many features: } \\hat{y} = \\mathbf{w}^\\top \\mathbf{x} + b\\text{)}','A weighted sum of inputs plus an intercept.'],
  ['Loss function: Mean Squared Error','L(m,b) = \\frac{1}{n}\\sum_{i=1}^{n}\\bigl(y_i - (m x_i + b)\\bigr)^2','Squaring makes errors positive and punishes big misses far more than small ones. This is the curve in the chart above.'],
  ['Gradients','\\begin{aligned}\\frac{\\partial L}{\\partial m} &= \\frac{2}{n}\\sum_i (\\hat{y}_i - y_i)\\,x_i \\\\ \\frac{\\partial L}{\\partial b} &= \\frac{2}{n}\\sum_i (\\hat{y}_i - y_i)\\end{aligned}','The direction in which the loss grows fastest. We walk the opposite way.'],
  ['Update rule','\\begin{aligned} m &\\leftarrow m - \\alpha\\,\\frac{\\partial L}{\\partial m}\\\\ b &\\leftarrow b - \\alpha\\,\\frac{\\partial L}{\\partial b}\\end{aligned}','α is the learning rate (step size).'],
  ['Closed-form solution','\\mathbf{w} = (X^\\top X)^{-1} X^\\top \\mathbf{y}','The exact minimiser (normal equation), no iterations needed. Fine for few features.'],
  ['Quality metric: R²','R^2 = 1 - \\frac{\\sum_i (y_i-\\hat{y}_i)^2}{\\sum_i (y_i-\\bar{y})^2}','1 is perfect; 0 means no better than always predicting the mean.']],
 steps:['Start with any m and b (here m = 0, b = 0.5).','Predict ŷ for every training point.','Compute the loss (MSE) from the residuals.','Compute the gradient of the loss with respect to m and b.','Move m and b a small step (α) against the gradient.','Repeat until the loss stops decreasing.'],
 hyper:[['Learning rate α','Too large and the loss bounces or explodes; too small and training crawls.'],['Iterations','How many updates to run; stop when the loss curve flattens.'],['Regularisation','Ridge adds λ‖w‖² and Lasso adds λ‖w‖₁ to the loss to shrink weights and fight over-fitting.'],['Feature scaling','Not a parameter, but gradient descent converges much faster when features share a scale.']],
 pros:['Fast, simple, and easy to interpret (each weight is an effect size).','Closed-form solution available.','Strong baseline for any numeric prediction.'],
 cons:['Only captures straight-line relationships (unless you add polynomial features).','Very sensitive to outliers because errors are squared.','Breaks down with highly correlated features unless regularised.'],
 use:['Use for: price or demand forecasting, trend lines, a first baseline.','Avoid when the relationship is clearly curved or the target is a category.'],
 cx:'Training: O(n·d² + d³) closed form, or O(n·d) per gradient step. Prediction: O(d).',
 code:`from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score

model = LinearRegression().fit(X_train, y_train)
print(model.coef_, model.intercept_)
print("R2:", r2_score(y_test, model.predict(X_test)))`},

{slug:'logistic-regression',name:'Logistic Regression',type:'Supervised',task:'Classification',tag:'Predict a class using a probability from a linear boundary.',
 chart:{t:'Loss during training: log-loss (cross-entropy)',xl:'iteration',yl:'log-loss'},
 intuition:'Linear regression can output any number, but a probability must stay between 0 and 1. Logistic regression computes a linear score and squeezes it through an S-shaped sigmoid curve. Far on one side of the boundary the probability approaches 1, far on the other it approaches 0, and exactly on the line it is 0.5. Despite the name, it is a classifier.',
 math:[['Model','\\begin{aligned} z &= \\mathbf{w}^\\top\\mathbf{x} + b\\\\ p &= \\sigma(z) = \\frac{1}{1+e^{-z}}\\end{aligned}','p is the predicted probability of class 1.'],
  ['Loss function: log-loss (cross-entropy)','L = -\\frac{1}{n}\\sum_{i=1}^{n}\\Bigl[y_i\\log p_i + (1-y_i)\\log(1-p_i)\\Bigr]','Confident wrong answers are punished heavily (log of a tiny number). It is the negative log-likelihood of the data.'],
  ['Gradient','\\begin{aligned}\\frac{\\partial L}{\\partial \\mathbf{w}} &= \\frac{1}{n}\\sum_i (p_i - y_i)\\,\\mathbf{x}_i\\\\ \\frac{\\partial L}{\\partial b} &= \\frac{1}{n}\\sum_i (p_i - y_i)\\end{aligned}','Same elegant form as linear regression: prediction minus truth, times input.'],
  ['Decision rule','\\hat{y}=1 \\iff p \\ge 0.5 \\iff \\mathbf{w}^\\top\\mathbf{x}+b \\ge 0','The boundary is a straight line (hyperplane).'],
  ['Log-odds view','\\log\\frac{p}{1-p} = \\mathbf{w}^\\top\\mathbf{x} + b','Each weight is the change in log-odds per unit of that feature.'],
  ['Regularised loss','L_{\\text{reg}} = L + \\frac{1}{2C}\\lVert\\mathbf{w}\\rVert^2','Smaller C means stronger shrinkage.']],
 steps:['Start with small random weights.','Compute z = w·x + b for each point and squash it with the sigmoid to get p.','Measure log-loss against the true labels.','Compute the gradient (p − y) · x averaged over the data.','Update w and b downhill.','Repeat; classify with p ≥ 0.5.'],
 hyper:[['C (inverse regularisation)','Small C: simpler model, wider tolerance. Large C: fits the training data harder.'],['Penalty','L2 shrinks all weights; L1 drives some weights to exactly zero (feature selection).'],['Threshold','0.5 by default; move it to trade precision against recall.'],['Learning rate / iterations','Only matter for gradient-descent solvers.']],
 pros:['Outputs calibrated-looking probabilities.','Fast, stable, and interpretable.','Works well when classes are roughly linearly separable.'],
 cons:['Linear boundary only (without feature engineering).','Struggles when classes overlap in complex shapes.','Sensitive to unscaled features and multicollinearity.'],
 use:['Use for: spam detection, churn, medical risk scores, any baseline classifier.','Avoid for strongly non-linear boundaries (try trees or kernel SVMs).'],
 cx:'Training: O(n·d) per iteration. Prediction: O(d).',
 code:`from sklearn.linear_model import LogisticRegression

clf = LogisticRegression(C=1.0).fit(X_train, y_train)
print(clf.predict_proba(X_test[:3]))
print("accuracy:", clf.score(X_test, y_test))`},

{slug:'svm',name:'Support Vector Machine (SVM)',type:'Supervised',task:'Classification',tag:'Find the boundary with the widest margin between classes.',
 chart:{t:'Loss during training: hinge loss + regularisation',xl:'iteration',yl:'loss'},
 intuition:'Many lines can separate two classes, but some are riskier than others. An SVM picks the one that stays as far as possible from the nearest points of both classes, like building the widest possible road between two towns. Only the points touching the road edges (the support vectors) matter; everything else could be deleted without changing the answer.',
 math:[['Margin','\\text{margin width} = \\frac{2}{\\lVert\\mathbf{w}\\rVert}','Maximising the margin means minimising ‖w‖.'],
  ['Hard-margin problem','\\begin{aligned}&\\min_{\\mathbf{w},b}\\ \\tfrac12\\lVert\\mathbf{w}\\rVert^2\\\\ &\\text{s.t. } y_i(\\mathbf{w}^\\top\\mathbf{x}_i+b)\\ge 1,\\ \\ y_i\\in\\{-1,+1\\}\\end{aligned}','Requires perfectly separable data.'],
  ['Loss function: hinge loss (soft margin)','L = \\lambda\\lVert\\mathbf{w}\\rVert^2 + \\frac{1}{n}\\sum_{i=1}^{n}\\max\\bigl(0,\\,1-y_i(\\mathbf{w}^\\top\\mathbf{x}_i+b)\\bigr)','Zero loss for points safely outside the margin; grows linearly for points inside it or misclassified. Plotted above.'],
  ['Sub-gradient step','\\mathbf{w}\\leftarrow\\mathbf{w}-\\alpha\\begin{cases}2\\lambda\\mathbf{w}-y_i\\mathbf{x}_i & \\text{if } y_i(\\mathbf{w}^\\top\\mathbf{x}_i+b)<1\\\\ 2\\lambda\\mathbf{w} & \\text{otherwise}\\end{cases}','Only margin violators push the boundary.'],
  ['Kernel trick','K(\\mathbf{x},\\mathbf{x}\') = \\exp\\!\\bigl(-\\gamma\\lVert\\mathbf{x}-\\mathbf{x}\'\\rVert^2\\bigr)','Computes similarity in a very high-dimensional space without building it, giving curved boundaries.'],
  ['Prediction','f(\\mathbf{x}) = \\operatorname{sign}\\Bigl(\\sum_i \\alpha_i y_i K(\\mathbf{x}_i,\\mathbf{x}) + b\\Bigr)','Sum over support vectors only (αᵢ > 0).']],
 steps:['Pick a starting line.','Find points inside or beyond the margin (hinge loss > 0).','Move the line away from those violators while keeping ‖w‖ small.','Repeat until the margin is as wide as the data allows.','Keep the support vectors; discard the rest.','Optionally use a kernel to bend the boundary.'],
 hyper:[['C (≈ 1/λ)','Large C: punish violations hard, narrow margin, risk of over-fitting. Small C: wide margin, tolerates errors.'],['Kernel','linear, polynomial or RBF; RBF is the common default for non-linear data.'],['γ (RBF width)','High γ gives wiggly, local boundaries; low γ gives smooth ones.']],
 pros:['Effective in high dimensions.','Max-margin boundary generalises well.','Kernels handle non-linear data.'],
 cons:['Slow on very large datasets.','Needs feature scaling.','No direct probabilities; hyper-parameters need tuning.'],
 use:['Use for: text classification, small-to-medium datasets with many features.','Avoid for millions of rows or heavily noisy overlapping classes.'],
 cx:'Training: roughly O(n²·d) to O(n³). Prediction: O(support vectors · d).',
 code:`from sklearn.svm import SVC
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

clf = make_pipeline(StandardScaler(), SVC(kernel="rbf", C=1.0, gamma="scale"))
clf.fit(X_train, y_train)
print(clf.score(X_test, y_test))`},

{slug:'knn',name:'k-Nearest Neighbours (KNN)',type:'Supervised',task:'Classification / regression',tag:'Classify a point by a vote among its k closest labelled points.',
 intuition:'“Tell me who your neighbours are and I will tell you who you are.” KNN never builds a model. It memorises the training data, and when a new point arrives it looks up the k most similar examples and lets them vote. Small k follows the data closely (and chases noise); large k smooths things out. There is no loss function to minimise, so k is chosen by checking validation error, as in the chart above.',
 math:[['Distance (Minkowski)','\\begin{aligned}d(\\mathbf{a},\\mathbf{b}) &= \\Bigl(\\sum_j |a_j-b_j|^p\\Bigr)^{1/p}\\\\ &p=2:\\ \\text{Euclidean},\\quad p=1:\\ \\text{Manhattan}\\end{aligned}','The notion of “close”. Features must be on comparable scales.'],
  ['Classification','\\hat{y} = \\arg\\max_{c}\\sum_{i\\in N_k(\\mathbf{x})}\\mathbf{1}[y_i=c]','Majority vote among the k nearest neighbours N_k(x).'],
  ['Weighted vote','w_i = \\frac{1}{d(\\mathbf{x},\\mathbf{x}_i)}','Closer neighbours count more.'],
  ['Regression','\\hat{y} = \\frac{1}{k}\\sum_{i\\in N_k(\\mathbf{x})} y_i','Average of neighbours’ values.'],
  ['Choosing k: leave-one-out error','\\text{error}(k)=\\frac{1}{n}\\sum_{i=1}^{n}\\mathbf{1}\\bigl[\\mathrm{KNN}_k^{(-i)}(\\mathbf{x}_i)\\ne y_i\\bigr]','Plotted above for k = 1…15. The dashed line marks your current k.'],
  ['Curse of dimensionality','\\frac{d_{\\text{farthest}}}{d_{\\text{nearest}}}\\to 1 \\quad\\text{as } d\\to\\infty','In many dimensions all points look equally far, so neighbours stop being meaningful.']],
 steps:['Store all labelled training points (no training).','Receive a new point.','Compute its distance to every stored point.','Select the k smallest distances.','Take the majority vote (or average for regression).','Return the result.'],
 hyper:[['k','Odd values avoid ties. Tune with cross-validation.'],['Distance metric','Euclidean, Manhattan, cosine …'],['Weights','uniform or distance-weighted voting.'],['Scaling','Always scale features; otherwise the largest-range feature dominates.']],
 pros:['Very simple, no training time.','Naturally handles multi-class and non-linear boundaries.','Easy to explain.'],
 cons:['Slow predictions on big data (scans everything).','Hurt by irrelevant features and high dimensions.','Needs lots of memory and feature scaling.'],
 use:['Use for: small datasets, recommendation-style “similar items”, quick baselines.','Avoid for high-dimensional or very large datasets.'],
 cx:'Training: O(1) (store data). Prediction: O(n·d) brute force, less with KD-trees.',
 code:`from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

clf = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=5))
clf.fit(X_train, y_train)
print(clf.score(X_test, y_test))`},

{slug:'decision-tree',name:'Decision Tree',type:'Supervised',task:'Classification / regression',tag:'Learn yes/no questions that split data into pure regions.',
 chart:{t:'Impurity during training: weighted Gini',xl:'split number',yl:'weighted Gini'},
 intuition:'A decision tree plays twenty questions. At each step it asks the single yes/no question about one feature that best separates the classes, then repeats inside each answer group. Each split lowers impurity, the chart above, until regions are pure or a depth limit is hit. Predicting is just following the questions down to a leaf.',
 math:[['Loss function (impurity): Gini','G = 1-\\sum_{c} p_c^2','0 when a region holds one class; higher when mixed (max 0.5 for two classes).'],
  ['Alternative: entropy','H = -\\sum_c p_c\\log_2 p_c','Similar behaviour; measures disorder in bits.'],
  ['Score of a split','G_{\\text{split}} = \\frac{n_L}{n}G(\\text{left}) + \\frac{n_R}{n}G(\\text{right})','Weighted average impurity of the two children. Lower is better.'],
  ['Information gain','\\text{Gain} = G(\\text{parent}) - G_{\\text{split}}','The tree picks the feature and threshold with the largest gain.'],
  ['Regression trees','\\text{impurity} = \\frac{1}{n}\\sum_i (y_i-\\bar{y})^2','Variance replaces Gini; leaves predict the mean.'],
  ['Cost-complexity pruning','R_\\alpha(T) = R(T) + \\alpha\\,|\\text{leaves}(T)|','Penalises size; larger α gives a smaller tree.']],
 steps:['Start with all data in one node.','Try every feature and every threshold between sorted values.','Choose the split with the lowest weighted impurity.','Divide the data and recurse on each child.','Stop when a node is pure, too small, or at max depth.','Each leaf predicts its majority class.'],
 hyper:[['max_depth','Main control on over-fitting; deeper trees memorise training data.'],['min_samples_split / leaf','Minimum samples needed to split or to keep a leaf.'],['criterion','gini or entropy.'],['ccp_alpha','Pruning strength.']],
 pros:['Easy to visualise and explain.','Handles mixed feature types; no scaling needed.','Captures non-linear interactions.'],
 cons:['Overfits easily.','Unstable: small data changes can change the tree.','Axis-aligned splits approximate diagonal boundaries poorly.'],
 use:['Use for: interpretable rules, mixed data, building block for Random Forests and boosting.','Avoid as a lone model on noisy data without pruning.'],
 cx:'Training: O(n·d·log n) per level. Prediction: O(depth).',
 code:`from sklearn.tree import DecisionTreeClassifier, export_text

clf = DecisionTreeClassifier(max_depth=3, criterion="gini").fit(X_train, y_train)
print(export_text(clf))
print(clf.score(X_test, y_test))`},

{slug:'naive-bayes',name:'Naive Bayes',type:'Supervised',task:'Classification',tag:'Bayes’ rule with per-class bell curves and independent features.',
 intuition:'Naive Bayes asks, “Given that I see these feature values, which class most probably produced them?” It learns what each class typically looks like (a bell curve per feature), then uses Bayes’ rule to flip that into a probability for each class. The “naive” shortcut assumes features are independent within a class, which is rarely exactly true but makes the maths cheap and works surprisingly well.',
 math:[['Bayes’ rule','P(c\\mid\\mathbf{x}) = \\frac{P(\\mathbf{x}\\mid c)\\,P(c)}{P(\\mathbf{x})}','Posterior ∝ likelihood × prior.'],
  ['Naive independence','P(\\mathbf{x}\\mid c) = \\prod_{j} P(x_j\\mid c)','Multiply per-feature likelihoods.'],
  ['Gaussian likelihood','P(x_j\\mid c) = \\frac{1}{\\sigma\\sqrt{2\\pi}}\\exp\\!\\Bigl(-\\frac{(x_j-\\mu)^2}{2\\sigma^2}\\Bigr)','The bell curves in the chart above, one per class.'],
  ['Decision rule (log form)','\\hat{y} = \\arg\\max_c\\Bigl[\\log P(c)+\\sum_j\\log P(x_j\\mid c)\\Bigr]','Logs avoid numerical underflow from multiplying tiny numbers.'],
  ['Loss / training objective','\\max\\ \\sum_i \\log P(\\mathbf{x}_i,y_i)\\quad(\\text{equivalently minimise the negative log-likelihood})','Maximum-likelihood estimates are just per-class means, variances and class frequencies, so training is counting.'],
  ['Laplace smoothing (discrete features)','P(x_j=v\\mid c) = \\frac{\\text{count}+1}{n_c+V}','Prevents a single unseen value from zeroing the whole product.']],
 steps:['Count how common each class is (priors).','For each class and feature, compute mean and standard deviation.','For a new point, evaluate each class’s bell curves at its feature values.','Multiply by the class prior (add logs).','Normalise to get probabilities.','Pick the class with the highest posterior.'],
 hyper:[['var_smoothing','Adds a tiny variance floor for numerical stability.'],['Variant','Gaussian (continuous), Multinomial (word counts), Bernoulli (binary).'],['alpha (Laplace)','Smoothing for the discrete variants.'],['Priors','Set manually if class frequencies in production differ.']],
 pros:['Extremely fast, works with little data.','Great for text (spam, sentiment).','Naturally multi-class.'],
 cons:['Independence assumption is often false.','Probabilities are poorly calibrated.','Cannot learn feature interactions.'],
 use:['Use for: text classification, quick baselines, real-time systems.','Avoid when features are strongly correlated and accuracy is critical.'],
 cx:'Training: O(n·d). Prediction: O(c·d).',
 code:`from sklearn.naive_bayes import GaussianNB

clf = GaussianNB().fit(X_train, y_train)
print(clf.theta_)   # class means
print(clf.predict_proba(X_test[:3]))`},

{slug:'k-means',name:'K-Means Clustering',type:'Unsupervised',task:'Clustering',tag:'Split data into K groups around moving centroids.',
 chart:{t:'Objective during training: inertia (WCSS)',xl:'round',yl:'inertia'},
 intuition:'Drop K flags on the map. Every point walks to its nearest flag, then each flag moves to the centre of the crowd that gathered around it. Repeat. The flags settle where the groups are. Each round can only lower the total squared distance from points to their flag, so the algorithm always converges, though possibly to a local optimum.',
 math:[['Objective (loss): inertia / WCSS','J=\\sum_{k=1}^{K}\\sum_{\\mathbf{x}\\in C_k}\\lVert\\mathbf{x}-\\boldsymbol{\\mu}_k\\rVert^2','Total squared distance to the assigned centroid. This is the curve above.'],
  ['Assignment step','C_k=\\{\\mathbf{x}: \\lVert\\mathbf{x}-\\boldsymbol{\\mu}_k\\rVert\\le\\lVert\\mathbf{x}-\\boldsymbol{\\mu}_j\\rVert\\ \\ \\forall j\\}','Nearest centroid wins.'],
  ['Update step','\\boldsymbol{\\mu}_k=\\frac{1}{|C_k|}\\sum_{\\mathbf{x}\\in C_k}\\mathbf{x}','The mean minimises squared distance, so J can only fall.'],
  ['k-means++ initialisation','P(\\mathbf{x}\\text{ chosen as next centroid})\\propto D(\\mathbf{x})^2','D(x) = distance to the nearest chosen centroid. Spreads starting points out.'],
  ['Choosing K: elbow','\\text{plot } J \\text{ against } K \\text{ and look for the bend}','Beyond the “elbow” extra clusters give little improvement.'],
  ['Choosing K: silhouette','s=\\frac{b-a}{\\max(a,b)}','a = mean distance within own cluster, b = to nearest other cluster. Closer to 1 is better.']],
 steps:['Choose K and place K starting centroids.','Assign every point to its nearest centroid.','Move each centroid to the mean of its points.','Recompute assignments.','Stop when assignments no longer change.','Optionally restart several times and keep the lowest J.'],
 hyper:[['K','Number of clusters; must be chosen (elbow, silhouette, domain knowledge).'],['init','k-means++ is the sensible default.'],['n_init','Number of random restarts; guards against bad local optima.'],['Scaling','Required: distance is the whole algorithm.']],
 pros:['Simple, fast, scales to large data.','Easy to interpret via centroids.','Works well on round, similar-sized clusters.'],
 cons:['Must choose K in advance.','Assumes spherical, equal-size clusters.','Sensitive to initialisation and outliers.'],
 use:['Use for: customer segmentation, colour quantisation, pre-processing.','Avoid for odd shapes (try DBSCAN) or heavy outliers.'],
 cx:'O(n·K·d) per iteration.',
 code:`from sklearn.cluster import KMeans

km = KMeans(n_clusters=3, init="k-means++", n_init=10, random_state=0).fit(X)
print(km.cluster_centers_)
print("inertia:", km.inertia_)`},

{slug:'hierarchical-clustering',name:'Hierarchical Clustering',type:'Unsupervised',task:'Clustering',tag:'Build clusters bottom-up by merging the closest pair each time.',
 chart:{t:'Merge distance at each step (dendrogram height)',xl:'merge number',yl:'distance'},
 intuition:'Start with every point as its own cluster, then repeatedly glue together the two closest clusters until only one remains. The full history forms a tree called a dendrogram. A sudden jump in merge distance (see chart) means you are forcing together groups that really are far apart, which is a natural place to cut the tree and read off the clusters. No K is needed upfront.',
 math:[['Single linkage','d(A,B)=\\min_{a\\in A,\\,b\\in B}\\lVert a-b\\rVert','Nearest members. Can chain clusters into long strands (what this demo uses).'],
  ['Complete linkage','d(A,B)=\\max_{a\\in A,\\,b\\in B}\\lVert a-b\\rVert','Farthest members. Compact clusters.'],
  ['Average linkage','d(A,B)=\\frac{1}{|A||B|}\\sum_{a\\in A}\\sum_{b\\in B}\\lVert a-b\\rVert','A compromise between the two.'],
  ['Ward linkage','\\Delta(A,B)=\\frac{|A||B|}{|A|+|B|}\\lVert\\boldsymbol{\\mu}_A-\\boldsymbol{\\mu}_B\\rVert^2','Merges the pair that increases total within-cluster variance least.'],
  ['Objective','\\text{merge the pair of clusters minimising } d(A,B)','There is no global loss; it is a greedy procedure. The chart shows the cost of each greedy merge.'],
  ['Cutting the dendrogram','\\text{choose a height } h;\\ \\text{clusters}=\\text{branches below } h','Largest vertical gap in merge distances suggests the number of clusters.']],
 steps:['Treat each point as a cluster.','Compute distances between all cluster pairs using the chosen linkage.','Merge the closest pair.','Update distances to the new cluster.','Repeat until one cluster remains.','Cut the dendrogram at the desired height.'],
 hyper:[['linkage','single, complete, average or ward; changes the shapes found.'],['metric','Euclidean, Manhattan, cosine …'],['n_clusters / distance_threshold','Where to cut the tree.']],
 pros:['No need to choose K first.','Dendrogram shows structure at every scale.','Deterministic result.'],
 cons:['Expensive for large datasets.','Greedy: merges can never be undone.','Sensitive to noise and linkage choice.'],
 use:['Use for: gene expression, taxonomies, small datasets where hierarchy matters.','Avoid for more than ~10,000 points.'],
 cx:'Time O(n² log n) to O(n³); memory O(n²).',
 code:`from sklearn.cluster import AgglomerativeClustering
from scipy.cluster.hierarchy import linkage, dendrogram

labels = AgglomerativeClustering(n_clusters=3, linkage="ward").fit_predict(X)
Z = linkage(X, method="ward")   # plot with dendrogram(Z)`},

{slug:'dbscan',name:'DBSCAN',type:'Unsupervised',task:'Clustering / outlier detection',tag:'Grow clusters from dense regions and flag outliers as noise.',
 intuition:'DBSCAN thinks of clusters as crowds. A point in a crowded neighbourhood is a core point; clusters grow outward by hopping from core point to nearby core point, so they can take any shape. Points near a crowd but not crowded themselves join as border points, and isolated points are labelled noise instead of being forced into a cluster. You do not choose K, but you do choose how close is “close” (ε).',
 math:[['ε-neighbourhood','N_\\varepsilon(p)=\\{q: d(p,q)\\le\\varepsilon\\}','All points within radius ε of p.'],
  ['Core point','|N_\\varepsilon(p)|\\ge \\text{minPts}','Dense enough to seed or extend a cluster.'],
  ['Density-reachable','p=p_1,\\dots,p_m=q,\\qquad p_i\\ \\text{core},\\ d(p_i,p_{i+1})\\le\\varepsilon','This chaining lets clusters follow curves.'],
  ['Border and noise','\\begin{aligned}\\text{border}&:\\ \\text{within }\\varepsilon\\text{ of a core point, but not core}\\\\ \\text{noise}&:\\ \\text{neither core nor border}\\end{aligned}','Noise gets label −1.'],
  ['Objective','\\text{no loss function: a rule-based procedure}','DBSCAN is a rule-based procedure rather than an optimisation. Quality is judged with the k-distance plot, silhouette or domain knowledge.'],
  ['Choosing ε: k-distance plot','\\text{sort } d_k(p)=\\text{distance from } p \\text{ to its } k\\text{-th nearest neighbour}','The knee of the curve above suggests ε; the dashed line is your current ε.']],
 steps:['Pick an unvisited point and count neighbours within ε.','If fewer than minPts, mark as noise (it may later become a border point).','Otherwise start a new cluster with this core point.','Add its neighbours; for every core neighbour, add its neighbours too.','Continue until no more points can be added.','Repeat with the next unvisited point.'],
 hyper:[['ε (eps)','Too small: everything becomes noise. Too large: clusters merge.'],['minPts','Rule of thumb: at least dimensions + 1; larger for noisy data.'],['metric','Distance function; scale your features first.']],
 pros:['Finds arbitrary-shaped clusters.','No need to specify K.','Detects outliers naturally.'],
 cons:['Struggles when clusters have very different densities.','Sensitive to ε and minPts.','Distance becomes less meaningful in high dimensions.'],
 use:['Use for: geospatial data, anomaly detection, non-round clusters.','Avoid with varying densities (try HDBSCAN).'],
 cx:'O(n log n) with a spatial index; O(n²) without.',
 code:`from sklearn.cluster import DBSCAN

db = DBSCAN(eps=0.3, min_samples=4).fit(X)
print(set(db.labels_))                # -1 means noise
print("core points:", len(db.core_sample_indices_))`},

{slug:'pca',name:'Principal Component Analysis (PCA)',type:'Unsupervised',task:'Dimensionality reduction',tag:'Find the directions of greatest variance to reduce dimensions.',
 intuition:'Photograph a long thin cloud of points. From the side you see its full length; from the end it looks like a dot. PCA finds the best angle: the direction along which the data is most spread out (PC1), then the next best direction at a right angle (PC2), and so on. Keeping only the first few directions compresses the data while preserving most of its information.',
 math:[['Centre the data','\\tilde{X}=X-\\boldsymbol{\\mu}','Subtract each feature’s mean.'],
  ['Covariance matrix','C=\\frac{1}{n-1}\\tilde{X}^\\top\\tilde{X}','How features vary together.'],
  ['Eigen-decomposition','C\\,\\mathbf{v}_j=\\lambda_j\\,\\mathbf{v}_j','Eigenvectors v_j are the principal components; eigenvalues λ_j are the variance along each.'],
  ['Explained variance ratio','\\mathrm{EVR}_j=\\frac{\\lambda_j}{\\sum_i\\lambda_i}','The bar chart above. Keep enough components to reach, say, 95%.'],
  ['Projection','Z=\\tilde{X}\\,V_k','Coordinates in the new k-dimensional space (V_k = top k eigenvectors).'],
  ['Objective / loss: reconstruction error','\\min\\ \\bigl\\lVert\\tilde{X}-\\tilde{X}V_kV_k^\\top\\bigr\\rVert_F^2=(n-1)\\sum_{j>k}\\lambda_j','PCA is exactly the k-dimensional projection with the least squared information lost: the dashed lines in the demo.']],
 steps:['Standardise the features.','Compute the covariance matrix.','Find its eigenvectors and eigenvalues (or use SVD).','Sort components by eigenvalue, largest first.','Keep the top k components.','Project the data onto them.'],
 hyper:[['n_components','Number to keep, or a variance target such as 0.95.'],['whiten','Rescales components to unit variance.'],['Scaling','Essential: otherwise large-unit features dominate.']],
 pros:['Removes redundancy and noise.','Speeds up downstream models and enables 2D/3D plots.','No hyper-parameters beyond k.'],
 cons:['Only linear structure.','Components are hard to interpret.','Sensitive to scaling and outliers.'],
 use:['Use for: visualisation, compression, de-correlating features.','Avoid when you need interpretable original features or non-linear structure (try t-SNE or UMAP).'],
 cx:'O(n·d² + d³) via covariance; faster randomised SVD exists.',
 code:`from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

Xs = StandardScaler().fit_transform(X)
pca = PCA(n_components=0.95).fit(Xs)
print(pca.explained_variance_ratio_)
Z = pca.transform(Xs)`}
];
