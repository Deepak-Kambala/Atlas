import Link from 'next/link';
import ThemeToggle from '../components/ThemeToggle';

export const metadata={title:'Atlas | Learn Math & ML Visually'};

export default function Intro(){
  return (
    <div className="hero">
      <div className="floatT"><ThemeToggle /></div>
      <div className="heroin">
        <div className="hero-logo">
          <img src="/logo-dark.png" alt="Atlas" className="hero-logo-img" width="150" height="150" />
        </div>
        <p className="eyebrow">Atlas · Interactive Learning</p>
        <h1>See how machines learn, <em>one step at a time.</em></h1>
        <p className="lead">Step through real algorithms, watch the loss fall, and pause to read the maths behind every move. Machine learning is ready now; the maths behind it is coming soon.</p>
        <Link href="/ml" className="cta">Get started →</Link>
        <div className="chips">
          <span className="chip">Linear Algebra<i>coming soon</i></span>
          <span className="chip">Calculus &amp; Optimization<i>coming soon</i></span>
          <span className="chip">Probability &amp; Statistics<i>coming soon</i></span>
          <span className="chip">Machine Learning<i>10 algorithms</i></span>
        </div>
        <div className="feat">
          <div className="box"><h3>Step by step</h3><p>Play, pause and scrub through each stage of an algorithm.</p></div>
          <div className="box"><h3>Loss and maths</h3><p>Live loss curves next to the formulas that drive them.</p></div>
          <div className="box"><h3>Complete pages</h3><p>Intuition, hyper-parameters, trade-offs and code for each topic.</p></div>
        </div>
      </div>
    </div>
  );
}
