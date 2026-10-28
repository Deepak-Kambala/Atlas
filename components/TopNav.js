'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import ThemeToggle from './ThemeToggle';

const T=[['/linear-algebra','Linear Algebra'],['/calculus-optimization','Calculus & Optimization'],['/probability-statistics','Probability & Statistics'],['/ml','Machine Learning']];

export default function TopNav(){
  const p=usePathname();
  if(p==='/')return null;
  return (
    <header className="top">
      <div className="topin">
        <Link href="/" className="brand">
          <img src="/icon.png" alt="Atlas Logo" className="brand-icon" width="24" height="24" />
          <span>Atlas</span>
        </Link>
        <ThemeToggle />
        <nav aria-label="Subjects">
          {T.map(([h,n])=>{const on=p.startsWith(h);return <Link key={h} href={h} className={'tabl'+(on?' on':'')} aria-current={on?'page':undefined}>{n}</Link>})}
        </nav>
      </div>
    </header>
  );
}
