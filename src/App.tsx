import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { initSmoothScroll, ScrollTrigger } from './lib/scroll';
import Loader from './components/Loader';
import Nav from './components/Nav';
import PullCord from './components/PullCord';
import Hero from './components/Hero';

// Below-the-fold sections are split into their own chunk.
const Below = lazy(() => import('./components/Below'));

export default function App() {
  const [ready, setReady] = useState(false);
  const done = useCallback(() => setReady(true), []);

  useEffect(() => initSmoothScroll(), []);
  useEffect(() => {
    if (ready) window.setTimeout(() => ScrollTrigger.refresh(), 300);
  }, [ready]);

  return (
    <MotionConfig reducedMotion="user">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Loader onDone={done} />
      <PullCord />
      <Nav ready={ready} />
      <main id="main">
        <Hero ready={ready} />
        <Suspense fallback={<div className="min-h-screen" />}>
          <Below />
        </Suspense>
      </main>
      <div className="grain" aria-hidden="true" />
    </MotionConfig>
  );
}
