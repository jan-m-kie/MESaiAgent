import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

const logos = [
  { name: 'Siemens', color: '#009999' },
  { name: 'Rockwell', color: '#CD163F' },
  { name: 'Schneider', color: '#3DCD58' },
  { name: 'ABB', color: '#FF0000' },
  { name: 'Honeywell', color: '#E1251B' },
  { name: 'Emerson', color: '#0047BB' },
  { name: 'Mitsubishi', color: '#E60012' },
  { name: 'SAP', color: '#0FAAFF' },
  { name: 'Oracle', color: '#F80000' },
  { name: 'Microsoft', color: '#00A4EF' },
];

const LogoMarquee = () => {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredLogo, setHoveredLogo] = useState<string | null>(null);

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    // Velocity-based speed adjustment
    let scrollVelocity = 0;

    const handleScroll = () => {
      scrollVelocity = Math.abs(window.scrollY - (handleScroll as any).lastScrollY || 0);
      (handleScroll as any).lastScrollY = window.scrollY;

      // Adjust speed based on scroll velocity
      const speedMultiplier = Math.min(5, 1 + scrollVelocity * 0.1);

      gsap.to(marquee.querySelectorAll('.marquee-content'), {
        duration: 0.5,
        timeScale: speedMultiplier,
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section className="py-16 overflow-hidden bg-white/50 backdrop-blur-sm border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <p className="text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
          Trusted by Industry Leaders
        </p>
      </div>

      <div
        ref={marqueeRef}
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => {
          setIsPaused(false);
          setHoveredLogo(null);
        }}
      >
        {/* Gradient Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#f0f5ff] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#f0f5ff] to-transparent z-10 pointer-events-none" />

        {/* Marquee Container */}
        <div
          className={`flex ${isPaused ? '' : 'animate-marquee'}`}
          style={{
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
          {/* First Set */}
          <div className="marquee-content flex items-center gap-16 px-8">
            {logos.map((logo, index) => (
              <div
                key={`logo-1-${index}`}
                className={`flex-shrink-0 transition-all duration-300 cursor-pointer ${
                  hoveredLogo && hoveredLogo !== logo.name
                    ? 'opacity-30'
                    : hoveredLogo === logo.name
                    ? 'scale-110 opacity-100'
                    : 'opacity-60'
                }`}
                onMouseEnter={() => setHoveredLogo(logo.name)}
                onMouseLeave={() => setHoveredLogo(null)}
              >
                <div
                  className="flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300"
                  style={{
                    backgroundColor: hoveredLogo === logo.name ? `${logo.color}10` : 'transparent',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: logo.color }}
                  >
                    {logo.name.charAt(0)}
                  </div>
                  <span
                    className="text-lg font-semibold"
                    style={{ color: hoveredLogo === logo.name ? logo.color : '#626262' }}
                  >
                    {logo.name}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Duplicate Set for Seamless Loop */}
          <div className="marquee-content flex items-center gap-16 px-8">
            {logos.map((logo, index) => (
              <div
                key={`logo-2-${index}`}
                className={`flex-shrink-0 transition-all duration-300 cursor-pointer ${
                  hoveredLogo && hoveredLogo !== logo.name
                    ? 'opacity-30'
                    : hoveredLogo === logo.name
                    ? 'scale-110 opacity-100'
                    : 'opacity-60'
                }`}
                onMouseEnter={() => setHoveredLogo(logo.name)}
                onMouseLeave={() => setHoveredLogo(null)}
              >
                <div
                  className="flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300"
                  style={{
                    backgroundColor: hoveredLogo === logo.name ? `${logo.color}10` : 'transparent',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: logo.color }}
                  >
                    {logo.name.charAt(0)}
                  </div>
                  <span
                    className="text-lg font-semibold"
                    style={{ color: hoveredLogo === logo.name ? logo.color : '#626262' }}
                  >
                    {logo.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LogoMarquee;
