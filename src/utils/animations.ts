import { useEffect, useRef } from 'react';

/* ── scroll-triggered entrance (CSS transitions + IntersectionObserver) ── */
export function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If already in viewport, skip animation but ensure visible
    if (el.getBoundingClientRect().top < window.innerHeight * 0.85) return;

    // 1. Instantly place element at hidden state (no transition)
    el.style.opacity = '0';
    el.style.transform = 'translateY(60px)';

    // 2. Force-reflow so the hidden state is committed
    void el.offsetWidth;

    // 3. Now enable transition (no property changed, so no animation starts)
    el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';

    if (!('IntersectionObserver' in window)) {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      return;
    }

    // 4. Watch for scroll — trigger when element's top reaches 85 % of viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          observer.unobserve(el);
        }
      },
      { rootMargin: '0px 0px -15% 0px', threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

export function useStaggerReveal<T extends HTMLElement>(stagger = 0.15) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const children = Array.from(el.children) as HTMLElement[];
    if (!children.length) return;

    if (el.getBoundingClientRect().top < window.innerHeight * 0.85) return;

    children.forEach((child) => {
      child.style.opacity = '0';
      child.style.transform = 'translateY(40px)';
    });
    void el.offsetWidth;
    children.forEach((child, i) => {
      child.style.transition = `opacity 0.6s ease, transform 0.6s ease`;
      child.style.transitionDelay = `${i * stagger}s`;
    });

    if (!('IntersectionObserver' in window)) {
      children.forEach((child) => {
        child.style.opacity = '1';
        child.style.transform = 'translateY(0)';
      });
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          children.forEach((child) => {
            child.style.opacity = '1';
            child.style.transform = 'translateY(0)';
          });
          observer.unobserve(el);
        }
      },
      { rootMargin: '0px 0px -15% 0px', threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [stagger]);
  return ref;
}

/* ── hero entrance (keeps GSAP for the stagger effect) ── */
export function useHeroReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    let ctx: any;
    import('gsap').then(({ gsap }) => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        const spans = el.querySelectorAll('span, p, .hero-btn');
        gsap.from(spans, {
          y: 40,
          opacity: 0,
          duration: 0.7,
          stagger: 0.2,
          ease: 'power3.out',
        });
      });
    });
    return () => { cancelled = true; ctx?.revert(); };
  }, []);
  return ref;
}
