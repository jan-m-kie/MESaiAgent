import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadingRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Headline split-text reveal
      gsap.fromTo(
        headlineRef.current,
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          delay: 0.2,
          ease: 'power3.out',
        }
      );

      // Subheading fade in
      gsap.fromTo(
        subheadingRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.5,
          ease: 'power3.out',
        }
      );

      // CTA buttons
      gsap.fromTo(
        ctaRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          delay: 0.7,
          ease: 'power3.out',
        }
      );

      // Dashboard 3D perspective swing
      gsap.fromTo(
        dashboardRef.current,
        { rotateY: 45, opacity: 0, x: 100 },
        {
          rotateY: 0,
          opacity: 1,
          x: 0,
          duration: 1.4,
          delay: 0.4,
          ease: 'power3.out',
        }
      );

      // Scroll effects
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          if (dashboardRef.current) {
            gsap.to(dashboardRef.current, {
              y: -self.progress * 100,
              scale: 1 - self.progress * 0.1,
              duration: 0.1,
            });
          }
          if (headlineRef.current) {
            gsap.to(headlineRef.current, {
              filter: `blur(${self.progress * 10}px)`,
              duration: 0.1,
            });
          }
        },
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // Mouse follow effect for dashboard
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      
      const rect = heroRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      
      setMousePosition({ x, y });
    };

    const hero = heroRef.current;
    if (hero) {
      hero.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (hero) {
        hero.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  // Apply 3D tilt to dashboard
  useEffect(() => {
    if (dashboardRef.current) {
      gsap.to(dashboardRef.current, {
        rotateY: mousePosition.x * 5,
        rotateX: -mousePosition.y * 5,
        duration: 0.5,
        ease: 'power2.out',
      });
    }
  }, [mousePosition]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center pt-20 overflow-hidden"
    >
      {/* Animated Background Mesh */}
      <div className="absolute inset-0 overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="mesh-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2467ec" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#1db98b" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#e96829" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          {/* Animated Grid Lines */}
          <g className="opacity-30">
            {[...Array(20)].map((_, i) => (
              <line
                key={`h-${i}`}
                x1="0"
                y1={`${i * 5}%`}
                x2="100%"
                y2={`${i * 5 + 2}%`}
                stroke="url(#mesh-gradient)"
                strokeWidth="1"
                className="animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
            {[...Array(20)].map((_, i) => (
              <line
                key={`v-${i}`}
                x1={`${i * 5}%`}
                y1="0"
                x2={`${i * 5 + 2}%`}
                y2="100%"
                stroke="url(#mesh-gradient)"
                strokeWidth="1"
                className="animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </g>
          
          {/* Floating Orbs */}
          <circle
            cx="20%"
            cy="30%"
            r="150"
            fill="#2467ec"
            fillOpacity="0.05"
            className="animate-pulse"
          />
          <circle
            cx="80%"
            cy="70%"
            r="200"
            fill="#1db98b"
            fillOpacity="0.05"
            className="animate-pulse"
            style={{ animationDelay: '1s' }}
          />
          <circle
            cx="60%"
            cy="20%"
            r="100"
            fill="#e96829"
            fillOpacity="0.05"
            className="animate-pulse"
            style={{ animationDelay: '2s' }}
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2467ec]/10 border border-[#2467ec]/20">
              <Sparkles className="w-4 h-4 text-[#2467ec]" />
              <span className="text-sm font-medium text-[#2467ec]">
                ISA-95 Compliant MES Platform
              </span>
            </div>

            {/* Headline */}
            <h1
              ref={headlineRef}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold font-['Onest'] leading-tight text-gray-900"
            >
              AI-Native MES for{' '}
              <span className="gradient-text">Autonomous Manufacturing</span>
            </h1>

            {/* Subheading */}
            <p
              ref={subheadingRef}
              className="text-lg sm:text-xl text-gray-600 max-w-xl leading-relaxed"
            >
              Orchestrate your factory floor with intelligent agents that predict, 
              adapt, and optimize in real-time. Built on ISA-95 standards with 
              dual-database architecture.
            </p>

            {/* CTA Buttons */}
            <div ref={ctaRef} className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-[#2467ec] hover:bg-[#1a52c4] text-white px-8 py-6 text-lg font-medium magnetic neural-glow group"
              >
                Explore the Platform
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-gray-300 hover:border-[#2467ec] hover:text-[#2467ec] px-8 py-6 text-lg font-medium group"
              >
                <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-8 border-t border-gray-200">
              <div>
                <div className="text-3xl font-bold text-[#2467ec]">99.9%</div>
                <div className="text-sm text-gray-500">Uptime</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#1db98b]">35%</div>
                <div className="text-sm text-gray-500">Efficiency Gain</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#e96829]">50ms</div>
                <div className="text-sm text-gray-500">Response Time</div>
              </div>
            </div>
          </div>

          {/* Right Content - Dashboard Image */}
          <div
            ref={dashboardRef}
            className="relative perspective-1000"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl transform-style-3d">
              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[#2467ec] via-[#1db98b] to-[#e96829] opacity-20 blur-2xl rounded-3xl" />
              
              {/* Dashboard Image */}
              <img
                src="/hero-dashboard.jpg"
                alt="AI-MES Dashboard"
                className="relative w-full rounded-2xl border border-gray-200/50"
              />
              
              {/* Floating Stats Cards */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 border border-gray-100 breathing">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1db98b]/10 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-[#1db98b] animate-pulse" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">OEE Score</div>
                    <div className="text-xl font-bold text-gray-900">92.5%</div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-xl p-4 border border-gray-100 breathing" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#2467ec]/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#2467ec]" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">AI Agents</div>
                    <div className="text-xl font-bold text-gray-900">5 Active</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f0f5ff] to-transparent pointer-events-none" />
    </section>
  );
};

export default Hero;
