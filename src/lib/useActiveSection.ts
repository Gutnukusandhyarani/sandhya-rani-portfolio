import { useEffect, useState } from 'react';
import { navItems } from '../data/portfolio';

export function useActiveSection() {
  const [active, setActive] = useState('home');
  useEffect(() => {
    // Scroll-based so it also works for the lazily loaded sections.
    let raf = 0;
    const compute = () => {
      raf = 0;
      const line = window.innerHeight * 0.45;
      let current = 'home';
      for (const n of navItems) {
        const el = document.getElementById(n.id);
        if (el && el.getBoundingClientRect().top <= line) current = n.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return active;
}
