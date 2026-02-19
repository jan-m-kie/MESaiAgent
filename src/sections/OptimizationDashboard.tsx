import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { TrendingUp, TrendingDown, Minus, Activity, Clock, Zap } from 'lucide-react';

interface Metric {
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  color: string;
}

const OptimizationDashboard = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [animatedValues, setAnimatedValues] = useState<number[]>([0, 0, 0, 0]);

  const metrics: Metric[] = [
    { label: 'OEE', value: 85, unit: '%', trend: 'up', change: 5.2, color: '#2467ec' },
    { label: 'Availability', value: 92, unit: '%', trend: 'up', change: 2.1, color: '#1db98b' },
    { label: 'Performance', value: 88, unit: '%', trend: 'stable', change: 0, color: '#e96829' },
    { label: 'Quality', value: 98, unit: '%', trend: 'up', change: 1.5, color: '#2467ec' },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Dashboard image reveal
      gsap.fromTo(
        dashboardRef.current,
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Stats cards with counter animation
      const statCards = statsRef.current?.querySelectorAll('.stat-card');
      if (statCards) {
        gsap.fromTo(
          statCards,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
            onComplete: () => {
              // Animate counter values
              metrics.forEach((metric, index) => {
                gsap.to(
                  { value: 0 },
                  {
                    value: metric.value,
                    duration: 2,
                    ease: 'power2.out',
                    onUpdate: function () {
                      setAnimatedValues((prev) => {
                        const newValues = [...prev];
                        newValues[index] = Math.round(this.targets()[0].value);
                        return newValues;
                      });
                    },
                  }
                );
              });
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-[#1db98b]';
      case 'down':
        return 'text-[#d11f36]';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <section
      id="analytics"
      ref={sectionRef}
      className="py-24 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e96829]/10 border border-[#e96829]/20 mb-6">
            <Activity className="w-4 h-4 text-[#e96829]" />
            <span className="text-sm font-medium text-[#e96829]">
              Real-Time Optimization
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 font-['Onest']">
            AI-Powered Optimization
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Continuous monitoring and optimization of your manufacturing metrics 
            with predictive analytics and intelligent recommendations.
          </p>
        </div>

        {/* Dashboard Image with Overlapping Stats */}
        <div className="relative mb-16">
          {/* Dashboard Image */}
          <div ref={dashboardRef} className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="/optimization-dashboard.jpg"
              alt="Optimization Dashboard"
              className="w-full"
            />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>

          {/* Floating Stats Cards */}
          <div
            ref={statsRef}
            className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {metrics.map((metric, index) => (
                <div
                  key={metric.label}
                  className="stat-card glass rounded-xl p-4 shimmer"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">{metric.label}</span>
                    <div
                      className={`flex items-center gap-1 text-xs font-medium ${getTrendColor(
                        metric.trend
                      )}`}
                    >
                      {getTrendIcon(metric.trend)}
                      <span>
                        {metric.change > 0 ? '+' : ''}
                        {metric.change}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-3xl font-bold font-['Onest']"
                      style={{ color: metric.color }}
                    >
                      {animatedValues[index]}
                    </span>
                    <span className="text-lg text-gray-400">{metric.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          {/* Throughput */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#2467ec]/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#2467ec]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Throughput</h3>
                <p className="text-sm text-gray-500">Units per hour</p>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-gray-900 font-['Onest']">
                1,250
              </span>
              <span className="text-sm text-[#1db98b] flex items-center gap-1 mb-1">
                <TrendingUp className="w-4 h-4" />
                +12%
              </span>
            </div>
            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2467ec] rounded-full transition-all duration-1000"
                style={{ width: '78%' }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Target: 1,600 units/hour
            </p>
          </div>

          {/* Downtime */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#d11f36]/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#d11f36]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Downtime</h3>
                <p className="text-sm text-gray-500">Last 24 hours</p>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-gray-900 font-['Onest']">
                2.4
              </span>
              <span className="text-lg text-gray-400">hours</span>
            </div>
            <div className="mt-4 space-y-2">
              {[
                { label: 'Unplanned', value: 1.2, color: '#d11f36' },
                { label: 'Planned', value: 0.8, color: '#e96829' },
                { label: 'Setup', value: 0.4, color: '#2467ec' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600 flex-1">{item.label}</span>
                  <span className="text-sm font-medium">{item.value}h</span>
                </div>
              ))}
            </div>
          </div>

          {/* Efficiency */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#1db98b]/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#1db98b]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Efficiency</h3>
                <p className="text-sm text-gray-500">Overall trend</p>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-[#1db98b] font-['Onest']">
                +35%
              </span>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              AI-driven optimizations have improved overall equipment efficiency 
              by 35% since implementation.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2467ec] to-[#1db98b] border-2 border-white flex items-center justify-center text-xs text-white font-medium"
                  >
                    {i}
                  </div>
                ))}
              </div>
              <span className="text-sm text-gray-500">
                3 agents contributing
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OptimizationDashboard;
