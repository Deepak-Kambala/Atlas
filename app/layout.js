import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import 'katex/dist/katex.min.css';
import './globals.css';
import TopNav from '../components/TopNav';
import DesktopNotice from '../components/DesktopNotice';

export const metadata={
  title:'Atlas | Math & ML Visualizations',
  description:'Atlas: Interactive, step-by-step visual lessons in machine learning, linear algebra, calculus, and probability.',
  icons:{
    icon:'/favicon.ico',
    shortcut:'/favicon.ico',
    apple:'/apple-touch-icon.png'
  }
};

const THEME_JS="(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='dark'}})()";

export default function RootLayout({children}){
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script dangerouslySetInnerHTML={{__html:THEME_JS}} />
      </head>
      <body>
        <div className="progress" aria-hidden="true" />
        <DesktopNotice />
        <TopNav />
        {children}
      </body>
    </html>
  );
}
