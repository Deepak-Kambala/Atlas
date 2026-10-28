export const R=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
const G=r=>Math.sqrt(-2*Math.log(r()+1e-9))*Math.cos(6.2832*r());
const cp=v=>Math.max(3,Math.min(97,v)),f2=v=>(+v).toFixed(2),f3=v=>(+v).toFixed(3);
const mean=a=>a.reduce((s,v)=>s+v,0)/a.length,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const blobs=(r,cs,n,sd)=>cs.flatMap((c,k)=>Array.from({length:n},()=>({x:cp(c[0]+G(r)*sd),y:cp(c[1]+G(r)*sd),c:k})));

/* ---------- SUPERVISED ---------- */
function linreg(r){
 const P=Array.from({length:30},()=>{const x=5+r()*90;return{x,y:cp(.6*x+15+G(r)*8),c:5}});
 let m=0,b=.5,it=0;
 const mse=()=>mean(P.map(p=>(m*p.x/100+b-p.y/100)**2));
 const fr=(t,d)=>({t,d,v:mse(),x:it,pts:P,lines:[...P.map(p=>({a:[p.x,p.y],b:[p.x,(m*p.x/100+b)*100],col:'--p0',w:.35})),{a:[0,b*100],b:[100,(m+b)*100],col:'--ac',w:1.3}]});
 const S=[{t:'The data',d:'Supervised regression: every point has an input x (horizontal) and a known answer y (vertical). Goal: learn a line ŷ = m·x + b that predicts y for new values of x.',pts:P},
  fr('A poor first guess',`We start with m = 0 and b = 0.5, a flat line (axes scaled 0–1). Orange segments are residuals: how far the line is from each real point. Mean squared error (MSE) = ${f3(mse())}.`)];
 [1,3,8,20,50,120,300].forEach(n=>{while(it<n){const e=P.map(p=>m*p.x/100+b-p.y/100);m-=.5*2*mean(e.map((v,i)=>v*P[i].x/100));b-=.5*2*mean(e);it++}
  S.push(fr(n==300?'Converged':`After ${n} step${n>1?'s':''}`,`m = ${f2(m)}, b = ${f2(b)}, MSE = ${f3(mse())}. Each gradient-descent step nudges m and b in the direction that shrinks the squared error.`+(n==300?' The line now sits through the middle of the cloud: the best least-squares fit.':'')))});
 return S}
const linclf=svm=>r=>{
 const P=blobs(r,[[32,38],[68,62]],25,12),U=P.map(p=>[(p.x-50)/50,(p.y-50)/50]),Y=P.map(p=>p.c?1:-1);
 let w=[.3,-.2],b=0,it=0;const z=u=>w[0]*u[0]+w[1]*u[1]+b;
 const lineAt=o=>{const n=w[0]**2+w[1]**2,k=(o-b)/n,p=[k*w[0],k*w[1]],q=Math.sqrt(n),d=[-w[1]/q,w[0]/q];return{a:[50+50*(p[0]-3*d[0]),50+50*(p[1]-3*d[1])],b:[50+50*(p[0]+3*d[0]),50+50*(p[1]+3*d[1])]}};
 const loss=()=>svm?mean(U.map((u,i)=>Math.max(0,1-Y[i]*z(u))))+.05*(w[0]**2+w[1]**2):mean(U.map((u,i)=>Math.log(1+Math.exp(-Y[i]*z(u)))));
 const acc=()=>mean(U.map((u,i)=>z(u)*Y[i]>0?1:0));
 const fr=(t,d)=>({t,d,v:loss(),x:it,pts:P.map((p,i)=>({...p,ring:z(U[i])*Y[i]<=0})),
  lines:[{...lineAt(0),col:'--ac',w:1.3},...(svm?[{...lineAt(1),col:'--ac',w:.5,dash:'2 2'},{...lineAt(-1),col:'--ac',w:.5,dash:'2 2'}]:[])],
  field:(x,y)=>{const s=z([(x-50)/50,(y-50)/50]);return[s>0?1:0,svm?Math.min(1,Math.abs(s)):Math.abs(2/(1+Math.exp(-s))-1)]}});
 const step=()=>{let g=[0,0],gb=0;U.forEach((u,i)=>{const y=Y[i],m=y*z(u),c=svm?(m<1?-y:0):-y/(1+Math.exp(m));g[0]+=c*u[0];g[1]+=c*u[1];gb+=c});
  const n=U.length,lr=svm?.3:1;w=[w[0]-lr*(g[0]/n+(svm?.1*w[0]:0)),w[1]-lr*(g[1]/n+(svm?.1*w[1]:0))];b-=lr*gb/n;it++};
 const S=[{t:'The data',d:svm?'Two labelled classes (orange = 0, blue = 1). A Support Vector Machine looks for the straight boundary with the widest possible margin between them.':'Two labelled classes (orange = 0, blue = 1). Logistic regression learns weights w and bias b so that σ(w·x + b) is the probability of class 1. The boundary is where that probability equals 0.5.',pts:P}];
 [0,2,5,15,40,100,250].forEach((n,k)=>{while(it<n)step();
  S.push(fr(k?`After ${n} steps`:'Random starting line',`Step ${it}: ${svm?'hinge loss':'log-loss'} = ${f3(loss())}, accuracy = ${Math.round(acc()*100)}%. Circled points are misclassified. Background shading shows what the model predicts there${svm?'; dashed lines mark the margin, and only points near or inside it move the line.':' (darker = more confident).'}`))});
 return S};
function knn(r,k){
 const P=blobs(r,[[25,30],[72,30],[50,75]],18,10),q={x:35+r()*30,y:35+r()*30,c:5,big:1};
 const D=P.map(p=>({p,d:dist(p,q)})).sort((a,b)=>a.d-b.d),N=D.slice(0,k),v=[0,0,0];N.forEach(n=>v[n.p.c]++);const win=v.indexOf(Math.max(...v)),nm=['orange','blue','green'];
 const cls=(x,y)=>{const t=[0,0,0];P.map(p=>({c:p.c,d:Math.hypot(p.x-x,p.y-y)})).sort((a,b)=>a.d-b.d).slice(0,k).forEach(n=>t[n.c]++);const m=Math.max(...t);return[t.indexOf(m),m/k]};
 const S=[{t:'The data',d:'Three labelled classes. A new unlabelled point (large, grey) arrives. KNN has no training phase: it simply stores the data and looks at neighbours when asked.',pts:[...P,q]},
 {t:'Measure every distance',d:'Compute the straight-line (Euclidean) distance from the new point to every stored point.',pts:[...P,q],lines:P.map(p=>({a:[p.x,p.y],b:[q.x,q.y],col:'--mu',w:.15}))},
 {t:`Pick the ${k} nearest`,d:`Keep only the k = ${k} closest points. The circle reaches the k-th neighbour. Change k with the slider to see the effect.`,pts:[...P,q],lines:N.map(n=>({a:[n.p.x,n.p.y],b:[q.x,q.y],col:'--p'+n.p.c,w:.7})),circles:[{x:q.x,y:q.y,rx:N[k-1].d,ry:N[k-1].d,col:'--tx'}]},
 {t:'Neighbours vote',d:`Votes: orange ${v[0]}, blue ${v[1]}, green ${v[2]}. The majority wins, so the new point is classified as ${nm[win]}.`,pts:[...P,{...q,c:win}],lines:N.map(n=>({a:[n.p.x,n.p.y],b:[q.x,q.y],col:'--p'+n.p.c,w:.7}))},
 {t:'Decision regions',d:'Repeating this vote at every location paints the decision regions. Small k gives jagged, over-fitted borders; large k gives smooth ones that may blur small classes.',pts:[...P,{...q,c:win}],field:cls}];const loo=kk=>{let e=0;P.forEach((p,i)=>{const t=[0,0,0];P.map((o,j)=>({c:o.c,d:j==i?1e9:dist(p,o)})).sort((a,b)=>a.d-b.d).slice(0,kk).forEach(n=>t[n.c]++);if(t.indexOf(Math.max(...t))!=p.c)e++});return e/P.length};S.curve={t:'Leave-one-out error vs k',xl:'k',yl:'error rate',x:Array.from({length:15},(_,i)=>i+1),s:[{n:'error',y:Array.from({length:15},(_,i)=>loo(i+1))}],hi:k};return S}
function tree(r,maxD){
 const P=blobs(r,[[25,30],[72,28],[50,76],[75,70]],14,10);
 const gini=a=>{if(!a.length)return 0;const c={};a.forEach(p=>c[p.c]=(c[p.c]||0)+1);return 1-Object.values(c).reduce((s,v)=>s+(v/a.length)**2,0)};
 const best=a=>{let B=null;['x','y'].forEach(f=>{const v=a.map(p=>p[f]).sort((p,q)=>p-q);for(let i=1;i<v.length;i++){if(v[i]==v[i-1])continue;const t=(v[i]+v[i-1])/2,L=a.filter(p=>p[f]<=t),Q=a.filter(p=>p[f]>t),g=(L.length*gini(L)+Q.length*gini(Q))/a.length;if(!B||g<B.g)B={f,t,g,L,R:Q}}});return B};
 const maj=a=>{const c=[0,0,0,0,0];a.forEach(p=>c[p.c]++);return c.indexOf(Math.max(...c))};
 let LV=[{a:P,r:[0,0,100,100],d:0}];const seg=[],S=[];
 const fr=(t,d)=>{const L=LV;return{t,d,v:L.reduce((s,l)=>s+l.a.length*gini(l.a),0)/P.length,x:S.length,pts:P,lines:seg.map(s=>({...s,col:'--tx',w:1})),field:(x,y)=>{const l=L.find(l=>x>=l.r[0]&&x<l.r[2]&&y>=l.r[1]&&y<l.r[3])||L[0];return[maj(l.a),.85-gini(l.a)]}}};
 S.push(fr('No splits yet',`Four labelled classes. With no questions asked, the best guess everywhere is the majority class. Gini impurity = ${f3(gini(P))} (0 means perfectly pure, higher means more mixed).`));
 const q=[LV[0]];
 while(q.length){const n=q.shift();if(n.d>=maxD||n.a.length<4||gini(n.a)<.02)continue;const s=best(n.a);if(!s)continue;
  const[x0,y0,x1,y1]=n.r,vx=s.f=='x',c1={a:s.L,r:vx?[x0,y0,s.t,y1]:[x0,y0,x1,s.t],d:n.d+1},c2={a:s.R,r:vx?[s.t,y0,x1,y1]:[x0,s.t,x1,y1],d:n.d+1};
  LV=LV.filter(l=>l!==n).concat(c1,c2);q.push(c1,c2);seg.push({a:vx?[s.t,y0]:[x0,s.t],b:vx?[s.t,y1]:[x1,s.t]});
  S.push(fr(`Split ${S.length}: ${s.f} ≤ ${s.t.toFixed(0)}?`,`This region had Gini ${f3(gini(n.a))}. The tree tries every threshold on x and y and keeps the question that makes the two halves purest (weighted Gini ${f3(s.g)}). Each region predicts its majority class.`))}
 S.push(fr('Finished',`The tree stopped because regions are pure enough or max depth (${maxD}) was reached. Every new point follows the questions to a region and takes its class. Deeper trees fit the training data more tightly but risk over-fitting.`));
 return S}
function nb(r){
 const P=blobs(r,[[35,38],[65,62]],25,13),C=[0,1].map(k=>P.filter(p=>p.c==k)),sd=(a,f)=>{const m=mean(a.map(p=>p[f]));return Math.sqrt(mean(a.map(p=>(p[f]-m)**2)))};
 const st=C.map(a=>({mx:mean(a.map(p=>p.x)),my:mean(a.map(p=>p.y)),sx:sd(a,'x'),sy:sd(a,'y'),pr:a.length/P.length}));
 const lp=(s,x,y)=>Math.log(s.pr)-Math.log(s.sx*s.sy)-(x-s.mx)**2/(2*s.sx**2)-(y-s.my)**2/(2*s.sy**2);
 const post=(x,y)=>{const a=lp(st[0],x,y),b=lp(st[1],x,y),m=Math.max(a,b),e0=Math.exp(a-m),e1=Math.exp(b-m);return e1/(e0+e1)};
 const q={x:44+r()*14,y:46+r()*12,c:5,big:1},p1=post(q.x,q.y),mk=st.map((s,k)=>({x:s.mx,y:s.my,c:k,big:1}));
 const el=st.flatMap((s,k)=>[1,2].map(m=>({x:s.mx,y:s.my,rx:s.sx*m,ry:s.sy*m,col:'--p'+k})));
 const S=[{t:'The data',d:'Two labelled classes (orange and blue). Naive Bayes will model each class as a bell curve per feature, then use Bayes’ rule to score new points.',pts:P},
 {t:'Learn each class',d:'Training is just counting: for each class, compute the mean and standard deviation of x and of y, plus how common the class is. Ellipses show 1σ and 2σ. They are axis-aligned because “naive” means features are assumed independent given the class.',pts:[...P,...mk],circles:el},
 {t:'Score a new point',d:`Multiply each class’s prior by how likely the point’s x and its y are under that class’s bell curves, then normalise. P(blue) = ${(p1*100).toFixed(0)}%, P(orange) = ${((1-p1)*100).toFixed(0)}%. The larger one wins.`,pts:[...P,...mk,{...q,c:p1>.5?1:0}],circles:el},
 {t:'Decision regions',d:'Doing this everywhere gives the decision boundary. It curves slightly when the classes have different spreads.',pts:[...P,{...q,c:p1>.5?1:0}],field:(x,y)=>{const p=post(x,y);return[p>.5?1:0,Math.abs(2*p-1)]}}];const gx=Array.from({length:41},(_,i)=>i*2.5),pd=(s,x)=>Math.exp(-((x-s.mx)**2)/(2*s.sx**2))/(s.sx*2.5066);S.curve={t:'Class-conditional density of feature x',xl:'x value',yl:'density',x:gx,s:[{n:'orange class',y:gx.map(x=>pd(st[0],x)),col:'--p0'},{n:'blue class',y:gx.map(x=>pd(st[1],x)),col:'--p1'}]};return S}

/* ---------- UNSUPERVISED ---------- */
function kmeans(r,K){
 const P=blobs(r,[[24,28],[70,30],[48,74]],20,9),g=P.map(p=>({...p,c:5}));let C=[];const ids=new Set();
 while(C.length<K){const i=Math.floor(r()*P.length);if(!ids.has(i)){ids.add(i);C.push({x:P[i].x,y:P[i].y})}}
 const cen=c=>c.map((o,k)=>({x:o.x,y:o.y,c:k,big:1})),S=[{t:'The data',d:`Unlabelled points: there are no answers to learn from. K-Means will try to discover K = ${K} groups on its own.`,pts:g},
  {t:'Pick starting centroids',d:`Choose ${K} random data points as the first centroids (large dots). A different random start can give a different result, so try “New data”.`,pts:[...g,...cen(C)]}];
 let prev='';
 for(let it=1;it<=12;it++){
  const as=P.map(p=>({...p,c:C.map((o,k)=>[dist(p,o),k]).sort((a,b)=>a[0]-b[0])[0][1]})),key=as.map(p=>p.c).join(''),inr=as.reduce((s,p)=>s+dist(p,C[p.c])**2,0);
  if(key==prev){S.push({t:'Converged',v:inr,x:it,d:`Assignments did not change, so the centroids would not move either. Final inertia (sum of squared distances) = ${Math.round(inr)}. K-Means always stops, but maybe at a local optimum.`,pts:[...as,...cen(C)]});break}
  S.push({t:`Round ${it}: assign`,v:inr,x:it,d:`Every point joins its nearest centroid and takes its colour. Inertia (sum of squared distances to centroids) = ${Math.round(inr)}.`,pts:[...as,...cen(C)],lines:as.map(p=>({a:[p.x,p.y],b:[C[p.c].x,C[p.c].y],col:'--p'+p.c,w:.25}))});
  const NC=C.map((o,k)=>{const m=as.filter(p=>p.c==k);return m.length?{x:mean(m.map(p=>p.x)),y:mean(m.map(p=>p.y))}:o});
  S.push({t:`Round ${it}: update`,d:'Each centroid moves to the average position of the points assigned to it (white lines show the move). Then we assign again.',pts:[...as,...cen(NC)],lines:C.map((o,k)=>({a:[o.x,o.y],b:[NC[k].x,NC[k].y],col:'--tx',w:1.2}))});
  prev=key;C=NC}
 return S}
function hier(r){
 const P=blobs(r,[[24,30],[68,26],[50,76]],5,8).map(p=>({...p,c:5}));let CL=P.map((_,i)=>[i]);const links=[];
 const col=()=>{const c=P.map(()=>5);CL.forEach(m=>{if(m.length>1)m.forEach(i=>c[i]=Math.min(...m)%5)});return P.map((p,i)=>({...p,c:c[i]}))};
 const S=[{t:'The data',d:'Unlabelled points. Agglomerative clustering starts with every point as its own cluster, then repeatedly merges the two closest clusters.',pts:P}];
 while(CL.length>1){let B=null;
  for(let i=0;i<CL.length;i++)for(let j=i+1;j<CL.length;j++)CL[i].forEach(a=>CL[j].forEach(b=>{const d=dist(P[a],P[b]);if(!B||d<B.d)B={i,j,a,b,d}}));
  links.push({a:[P[B.a].x,P[B.a].y],b:[P[B.b].x,P[B.b].y],col:'--tx',w:.5});
  CL[B.i]=CL[B.i].concat(CL[B.j]);CL.splice(B.j,1);const n=CL.length;
  S.push({t:`Merge ${S.length}`,v:B.d,x:S.length,d:`The two closest clusters join (gap ${B.d.toFixed(1)}, measured between their nearest members: “single linkage”). ${n} cluster${n>1?'s':''} left.`+(n==3?' These are the 3 natural groups. The next merges must bridge big gaps.':'')+(n==1?' Everything is one cluster. The full merge history is the dendrogram; cutting it at any height gives that many clusters.':''),pts:col(),lines:links.map((l,k)=>k==links.length-1?{...l,w:1.4,col:'--ac'}:l)})}
 return S}
function dbscan(r,eps){
 const P=[],MP=4;
 for(let i=0;i<36;i++){const t=Math.PI*i/35;P.push({x:cp(35+25*Math.cos(t)+G(r)*1.8),y:cp(42+25*Math.sin(t)+G(r)*1.8),c:5});P.push({x:cp(62+25*Math.cos(t)+G(r)*1.8),y:cp(58-25*Math.sin(t)+G(r)*1.8),c:5})}
 for(let i=0;i<8;i++)P.push({x:cp(5+r()*90),y:cp(5+r()*90),c:5});
 const nb=P.map(p=>P.reduce((a,q,j)=>dist(p,q)<=eps?a.concat(j):a,[])),core=nb.map(a=>a.length>=MP),L=P.map(()=>-1);let nc=0;
 core.forEach((c,i)=>{if(!c||L[i]>=0)return;const q=[i];L[i]=nc;while(q.length){const u=q.shift();if(!core[u])continue;nb[u].forEach(v=>{if(L[v]<0){L[v]=nc;q.push(v)}})}nc++});
 const CC=[0,1,3,2],paint=u=>P.map((p,i)=>L[i]>=0&&L[i]<=u?{...p,c:CC[L[i]%4],h:!core[i]}:{...p,c:5});
 const s0=Math.max(0,core.indexOf(true)),sz=j=>L.filter(v=>v==j).length;
 const S=[{t:'The data',d:'Unlabelled points in two interlocking crescents plus a few random stray points. K-Means would struggle with this shape.',pts:P},
 {t:'The ε-neighbourhood',d:`DBSCAN asks one question per point: how many neighbours lie within distance ε = ${eps} (the circle)? This point has ${nb[s0].length}. With at least ${MP} neighbours it is a core point. Change ε with the slider.`,pts:P.map((p,i)=>({...p,c:nb[s0].includes(i)?1:5})),circles:[{x:P[s0].x,y:P[s0].y,rx:eps,ry:eps,col:'--tx'}]},
 {t:'Core, border, noise',d:'Green = core (dense neighbourhood). Amber rings = border (near a core point but not dense themselves). Red = noise (isolated).',pts:P.map((p,i)=>({...p,c:core[i]?2:L[i]>=0?4:6,h:!core[i]&&L[i]>=0}))}];
 for(let j=0;j<nc;j++)S.push({t:`Grow cluster ${j+1}`,d:`Start at an unvisited core point, add all its neighbours, and keep spreading through core points. This cluster now has ${sz(j)} points. It can follow any shape.`,pts:paint(j)});
 S.push({t:'Noise left over',d:`Final result: ${nc} cluster${nc!=1?'s':''}, found without choosing K. Red points have too few neighbours to join any cluster, so DBSCAN labels them noise instead of forcing them in.`,pts:paint(nc).map((p,i)=>L[i]<0?{...p,c:6}:p)});
 const kd=P.map(p=>P.map(o=>dist(p,o)).sort((a,b)=>a-b)[MP-1]).sort((a,b)=>a-b);S.curve={t:'Sorted k-distance plot (k = 4)',xl:'points, sorted by distance',yl:'distance to 4th nearest',x:kd.map((_,i)=>i),s:[{n:'k-distance',y:kd}],hi:eps,hy:1};return S}
function pca(r){
 const a=.6,P=Array.from({length:40},()=>{const t=G(r)*20,n=G(r)*4.5;return{x:cp(50+t*Math.cos(a)-n*Math.sin(a)),y:cp(50+t*Math.sin(a)+n*Math.cos(a)),c:5}});
 const mx=mean(P.map(p=>p.x)),my=mean(P.map(p=>p.y)),cxx=mean(P.map(p=>(p.x-mx)**2)),cyy=mean(P.map(p=>(p.y-my)**2)),cxy=mean(P.map(p=>(p.x-mx)*(p.y-my)));
 const th=.5*Math.atan2(2*cxy,cxx-cyy),tr=(cxx+cyy)/2,df=Math.sqrt(((cxx-cyy)/2)**2+cxy**2),l1=tr+df,l2=tr-df,u=[Math.cos(th),Math.sin(th)],v=[-u[1],u[0]];
 const ax=(w,s,col,wd)=>({a:[mx-w[0]*s,my-w[1]*s],b:[mx+w[0]*s,my+w[1]*s],col,w:wd}),pr=P.map(p=>{const t=(p.x-mx)*u[0]+(p.y-my)*u[1];return{x:mx+t*u[0],y:my+t*u[1]}});
 const ev=Math.round(l1/(l1+l2)*100),M={x:mx,y:my,c:3,big:1};
 const S=[{t:'The data',d:'Unlabelled points with two features (x and y). They are correlated: when x grows, y tends to grow too. PCA finds the directions along which the data varies most.',pts:P},
 {t:'Centre the data',d:'First find the mean (purple dot) and treat it as the origin. PCA describes spread around the centre.',pts:[...P,M],lines:[{a:[mx,0],b:[mx,100],col:'--mu',w:.2,dash:'2 2'},{a:[0,my],b:[100,my],col:'--mu',w:.2,dash:'2 2'}]},
 {t:'Find the principal components',d:`The covariance matrix captures how x and y vary together. Its eigenvectors are the principal components: PC1 (white) points along the greatest spread, PC2 (green) is perpendicular. PC1 carries ${ev}% of the variance, PC2 ${100-ev}%.`,pts:[...P,M],lines:[ax(u,2.2*Math.sqrt(l1),'--ac',1.5),ax(v,2.2*Math.sqrt(l2),'--p2',1.5)]},
 {t:'Project onto PC1',d:`Dropping each point onto PC1 turns 2 dimensions into 1 while keeping ${ev}% of the variance. The dashed lines show the information thrown away. This is dimensionality reduction.`,pts:[...P,...pr.map(p=>({...p,c:0,r:1.2}))],lines:[ax(u,2.2*Math.sqrt(l1),'--ac',1.5),...P.map((p,i)=>({a:[p.x,p.y],b:[pr[i].x,pr[i].y],col:'--p0',w:.3,dash:'1 1'}))]}];S.curve={t:'Variance explained by each component',xl:'component',yl:'% of variance',bar:1,x:['PC1','PC2'],s:[{n:'variance',y:[ev,100-ev]}]};return S}

export const A=[
{n:'Linear Regression',g:'Supervised',gen:linreg,i:'Predicts a number by fitting the best straight line.'},
{n:'Logistic Regression',g:'Supervised',gen:linclf(0),i:'Predicts a class using a probability from a linear boundary.'},
{n:'SVM',g:'Supervised',gen:linclf(1),i:'Finds the boundary with the widest margin between classes.'},
{n:'k-Nearest Neighbours',g:'Supervised',gen:knn,pm:['k',1,15,5],i:'Classifies a point by a vote among its k closest labelled points.'},
{n:'Decision Tree',g:'Supervised',gen:tree,pm:['max depth',1,4,3],i:'Learns a series of yes/no questions that split the data into pure regions.'},
{n:'Naive Bayes',g:'Supervised',gen:nb,i:'Uses Bayes’ rule with per-class bell curves and independent features.'},
{n:'K-Means',g:'Unsupervised',gen:kmeans,pm:['K',2,5,3],i:'Splits data into K groups around moving centroids.'},
{n:'Hierarchical',g:'Unsupervised',gen:hier,i:'Builds clusters bottom-up by merging the closest pair each time.'},
{n:'DBSCAN',g:'Unsupervised',gen:dbscan,pm:['ε (eps)',4,12,7],i:'Grows clusters from dense regions and flags outliers as noise.'},
{n:'PCA',g:'Unsupervised',gen:pca,i:'Finds the directions of greatest variance to reduce dimensions.'}];

