import Link from 'next/link';
import {C} from '../../lib/content';
import Thumb from '../../components/Thumb';

export const metadata={title:'Machine Learning | Atlas'};

export default function ML(){
  return (
    <div className="wrap">
      <h1>Machine Learning</h1>
      <p className="mu">Pick an algorithm to open its interactive walkthrough, loss curves and full maths.</p>
      {['Supervised','Unsupervised'].map(g=>(
        <section key={g} className="sec">
          <h2>{g} learning</h2>
          <div className="cards">
            {C.map((c,ai)=>c.type===g&&(
              <Link key={c.slug} href={`/ml/${c.slug}`} className="box" style={{'--i':ai}}>
                <Thumb ai={ai}/>
                <h3>{c.name}</h3>
                <p>{c.tag}</p>
                <span className="open">Explore →</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
