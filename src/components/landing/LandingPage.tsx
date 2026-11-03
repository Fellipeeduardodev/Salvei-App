import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { LandingHeader } from './LandingHeader';
import { LandingHero } from './LandingHero';
import { LandingIntegrations } from './LandingIntegrations';
import { LandingComparison } from './LandingComparison';
import { LandingAlternativeMatrix } from './LandingAlternativeMatrix';
import { LandingWorkflow } from './LandingWorkflow';
import { LandingBento } from './LandingBento';
import { LandingPricing } from './LandingPricing';
import { LandingFAQ } from './LandingFAQ';
import { LandingCTA } from './LandingCTA';
import { LandingFooter } from './LandingFooter';

gsap.registerPlugin(ScrollTrigger);

export interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  isLoggedIn?: boolean;
  onGoToApp?: () => void;
  onEnterGuestMode?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  isLoggedIn = false,
  onGoToApp,
  onEnterGuestMode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Setup smooth inertia scroll with Lenis synchronized with GSAP ScrollTrigger
  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });
    (window as any).lenis = lenis;
    (window as any).gsap = gsap;
    (window as any).ScrollTrigger = ScrollTrigger;

    // Connect Lenis cleanly to GSAP ScrollTrigger (single source of scroll truth)
    lenis.on('scroll', ScrollTrigger.update);

    const tickerCb = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCb);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCb);
      (window as any).lenis = null;
      (window as any).gsap = null;
      (window as any).ScrollTrigger = null;
      lenis.destroy();
    };
  }, []);

  // 2. GSAP ScrollTrigger and Entrance Animations (Linear / Apple-grade fluid micro-motion)
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Hero Entrance Timeline: Snappy & Organic
      const heroTl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      heroTl
        .fromTo('.gsap-hero-badge', { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, delay: 0.05 })
        .fromTo('.gsap-hero-title', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.35')
        .fromTo('.gsap-hero-sub', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, '-=0.4')
        .fromTo('.gsap-hero-actions', { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.4')
        .fromTo(
          '.gsap-hero-mockup',
          { y: 18, opacity: 0, scale: 0.99 },
          { y: 0, opacity: 1, scale: 1, duration: 0.75, ease: 'power2.out' },
          '-=0.35'
        );

      // Integrations Chips: Ultra-subtle stagger
      gsap.fromTo(
        '.gsap-integrations-chip',
        { y: 12, opacity: 0 },
        {
          scrollTrigger: {
            trigger: '.gsap-integrations-chip',
            start: 'top 94%',
            once: true,
          },
          y: 0,
          opacity: 1,
          stagger: 0.04,
          duration: 0.5,
          ease: 'power2.out',
        }
      );

      // Comparison Section: Clean vertical reveal without jarring horizontal sliding
      gsap.fromTo(
        '.gsap-compare-left',
        { y: 18, opacity: 0 },
        {
          scrollTrigger: {
            trigger: '#comparativo',
            start: 'top 90%',
            once: true,
          },
          y: 0,
          opacity: 1,
          duration: 0.65,
          ease: 'power2.out',
        }
      );

      gsap.fromTo(
        '.gsap-compare-right',
        { y: 22, opacity: 0 },
        {
          scrollTrigger: {
            trigger: '#comparativo',
            start: 'top 90%',
            once: true,
          },
          y: 0,
          opacity: 1,
          duration: 0.7,
          delay: 0.08,
          ease: 'power2.out',
        }
      );

      // Alternatives Comparison Matrix (Por que não o Pinterest, Notion ou Pastas?)
      gsap.fromTo(
        '#comparativo-ferramentas',
        { y: 18, opacity: 0 },
        {
          scrollTrigger: {
            trigger: '#comparativo-ferramentas',
            start: 'top 90%',
            once: true,
          },
          y: 0,
          opacity: 1,
          duration: 0.65,
          ease: 'power2.out',
        }
      );

      // 3-Step Workflow: Smooth vertical stagger & stage lift
      gsap.fromTo(
        '.gsap-workflow-step',
        { y: 16, opacity: 0 },
        {
          scrollTrigger: {
            trigger: '#como-funciona',
            start: 'top 90%',
            once: true,
          },
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.6,
          ease: 'power2.out',
        }
      );

      gsap.fromTo(
        '.gsap-workflow-stage',
        { y: 18, opacity: 0 },
        {
          scrollTrigger: {
            trigger: '#como-funciona',
            start: 'top 88%',
            once: true,
          },
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power2.out',
        }
      );

      // Bento Grid Cards: Soft, unified cascade
      gsap.fromTo(
        '.gsap-bento-card',
        { y: 18, opacity: 0 },
        {
          scrollTrigger: {
            trigger: '#recursos',
            start: 'top 90%',
            once: true,
          },
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.65,
          ease: 'power2.out',
        }
      );

      // Pricing Cards: Clear transparent pricing stagger
      gsap.fromTo(
        '.gsap-pricing-card',
        { y: 18, opacity: 0 },
        {
          scrollTrigger: {
            trigger: '#precos',
            start: 'top 90%',
            once: true,
          },
          y: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 0.65,
          ease: 'power2.out',
        }
      );

      // FAQ Items: Crisp, low-latency accordion cascade
      gsap.fromTo(
        '.gsap-faq-item',
        { y: 12, opacity: 0 },
        {
          scrollTrigger: {
            trigger: '#faq',
            start: 'top 90%',
            once: true,
          },
          y: 0,
          opacity: 1,
          stagger: 0.04,
          duration: 0.5,
          ease: 'power2.out',
        }
      );

      // Dark CTA Banner: Gentle settle
      gsap.fromTo(
        '.gsap-cta-card',
        { y: 20, opacity: 0 },
        {
          scrollTrigger: {
            trigger: '.gsap-cta-card',
            start: 'top 92%',
            once: true,
          },
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power2.out',
        }
      );
    }, containerRef);

    // Debounced layout refresh to prevent layout thrashing and stutters
    let refreshTimeout: number | null = null;
    const debouncedRefresh = () => {
      if (refreshTimeout) clearTimeout(refreshTimeout);
      refreshTimeout = window.setTimeout(() => {
        ScrollTrigger.refresh();
      }, 150);
    };

    const initialTimer = setTimeout(debouncedRefresh, 200);
    document.fonts?.ready?.then(debouncedRefresh);
    window.addEventListener('resize', debouncedRefresh);

    let ro: ResizeObserver | null = null;
    if (containerRef.current && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(debouncedRefresh);
      ro.observe(containerRef.current);
    }

    return () => {
      clearTimeout(initialTimer);
      if (refreshTimeout) clearTimeout(refreshTimeout);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', debouncedRefresh);
      ctx.revert();
    };
  }, []);

  // 3. Ensure title and clean theme on landing page
  useEffect(() => {
    const originalTitle = document.title;
    document.title = 'Salvei — Guarde o que te inspira. Crie no seu tempo.';

    const root = document.documentElement;
    const wasDark = root.classList.contains('dark');
    root.classList.remove('dark');
    root.style.colorScheme = 'light';

    return () => {
      document.title = originalTitle;
      if (wasDark) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      }
    };
  }, []);

  const handleDemoClick = () => {
    if (onEnterGuestMode) {
      onEnterGuestMode();
      return;
    }
    if (isLoggedIn && onGoToApp) {
      onGoToApp();
      return;
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full overflow-x-clip bg-[#FAF7F2] text-[#0F172A] selection:bg-[#4355DB] selection:text-white antialiased font-['Inter']"
    >
      {/* 1. Floating Pill Navigation Bar */}
      <LandingHeader
        onOpenAuth={onOpenAuth}
        isLoggedIn={isLoggedIn}
        onGoToApp={onGoToApp}
        onEnterGuestMode={onEnterGuestMode}
      />

      {/* Main Content Sections: Focused, Authentic & High-Impact */}
      <main id="main-content">
        {/* 2. Hero with Faithful Salvei App Window & Animated Mouse (Untouched!) */}
        <LandingHero
          onOpenAuth={onOpenAuth}
          onDemoClick={handleDemoClick}
        />

        {/* 3. Social Proof & Ecosystem Partner Logos (Figma, Linear, Notion, Raycast, Dribbble) */}
        <LandingIntegrations />

        {/* 4. Editorial Comparison: O improviso de sempre vs. O Salvei */}
        <LandingComparison />

        {/* 5. Alternative Matrix: Por que não o Pinterest, Notion ou Pastas? */}
        <LandingAlternativeMatrix onOpenAuth={onOpenAuth} />

        {/* 6. 3-Step Progressive Workflow: Da descoberta à biblioteca */}
        <LandingWorkflow />

        {/* 7. Real Product Feature Bento */}
        <LandingBento onOpenAuth={onOpenAuth} />

        {/* 8. Transparent Pricing */}
        <LandingPricing onOpenAuth={onOpenAuth} />

        {/* 9. Frequently Asked Questions Accordion */}
        <LandingFAQ />

        {/* 10. Final High-Contrast Dark CTA Banner */}
        <LandingCTA
          onOpenAuth={onOpenAuth}
          onDemoClick={handleDemoClick}
        />
      </main>

      {/* 10. Complete Structured Footer */}
      <LandingFooter onOpenAuth={onOpenAuth} />
    </div>
  );
};