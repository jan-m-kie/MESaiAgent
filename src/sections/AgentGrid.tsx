import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import {
  Calendar,
  ShieldCheck,
  Package,
  Wrench,
  Factory,
  Truck,
  Brain,
  Zap,
} from 'lucide-react';

interface AgentCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  capabilities: string[];
  status: 'ACTIVE' | 'LEARNING' | 'IDLE';
}

const agents: AgentCard[] = [
  {
    id: 'scheduler',
    title: 'Production Scheduler',
    description: 'AI-powered scheduling that optimizes resource allocation and minimizes downtime.',
    icon: Calendar,
    color: '#2467ec',
    capabilities: ['Schedule Optimization', 'Conflict Resolution', 'Priority Management'],
    status: 'ACTIVE',
  },
  {
    id: 'quality',
    title: 'Quality Assurance',
    description: 'Real-time defect detection and predictive quality analytics.',
    icon: ShieldCheck,
    color: '#1db98b',
    capabilities: ['Defect Detection', 'Root Cause Analysis', 'Compliance Monitoring'],
    status: 'ACTIVE',
  },
  {
    id: 'inventory',
    title: 'Inventory Management',
    description: 'Intelligent inventory optimization with demand forecasting.',
    icon: Package,
    color: '#e96829',
    capabilities: ['Demand Forecasting', 'Reorder Optimization', 'Expiry Management'],
    status: 'LEARNING',
  },
  {
    id: 'maintenance',
    title: 'Predictive Maintenance',
    description: 'Predict equipment failures before they happen with ML models.',
    icon: Wrench,
    color: '#d11f36',
    capabilities: ['Failure Prediction', 'Health Monitoring', 'Parts Forecasting'],
    status: 'ACTIVE',
  },
  {
    id: 'shopfloor',
    title: 'Shop Floor Control',
    description: 'Real-time production monitoring and control automation.',
    icon: Factory,
    color: '#2467ec',
    capabilities: ['Real-time Monitoring', 'Auto-adjustment', 'OEE Tracking'],
    status: 'ACTIVE',
  },
  {
    id: 'supplychain',
    title: 'Supply Chain Sync',
    description: 'End-to-end supply chain visibility and synchronization.',
    icon: Truck,
    color: '#1db98b',
    capabilities: ['Supplier Integration', 'Lead Time Optimization', 'Risk Management'],
    status: 'IDLE',
  },
];

const AgentCardComponent = ({
  agent,
  index,
}: {
  agent: AgentCard;
  index: number;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isFlipped, setIsFlipped] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const Icon = agent.icon;

  return (
    <div
      ref={cardRef}
      className="group relative perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div
        className={`relative h-full bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-500 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{
          boxShadow: isFlipped
            ? `0 20px 40px -10px ${agent.color}30`
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Spotlight Effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, ${agent.color}15, transparent 50%)`,
          }}
        />

        {/* Scanline Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none scanline" />

        {/* Front Face */}
        <div className="relative p-6 h-full backface-hidden">
          {/* Status Indicator */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full animate-pulse ${
                agent.status === 'ACTIVE'
                  ? 'bg-[#1db98b]'
                  : agent.status === 'LEARNING'
                  ? 'bg-[#e96829]'
                  : 'bg-gray-400'
              }`}
            />
            <span className="text-xs font-medium text-gray-500">{agent.status}</span>
          </div>

          {/* Icon */}
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110"
            style={{ backgroundColor: `${agent.color}15` }}
          >
            <Icon
              className="w-7 h-7 transition-all duration-500 group-hover:rotate-[360deg]"
              style={{ color: agent.color }}
            />
          </div>

          {/* Content */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 font-['Onest']">
            {agent.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            {agent.description}
          </p>

          {/* Capabilities */}
          <div className="flex flex-wrap gap-2">
            {agent.capabilities.map((cap, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: `${agent.color}10`,
                  color: agent.color,
                }}
              >
                {cap}
              </span>
            ))}
          </div>
        </div>

        {/* Back Face */}
        <div
          className="absolute inset-0 p-6 backface-hidden rotate-y-180"
          style={{ backgroundColor: agent.color }}
        >
          <div className="h-full flex flex-col justify-between text-white">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5" />
                <span className="text-sm font-medium opacity-80">AI Capabilities</span>
              </div>
              <ul className="space-y-3">
                {agent.capabilities.map((cap, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Zap className="w-4 h-4 opacity-60" />
                    <span className="text-sm">{cap}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">98.5%</div>
                  <div className="text-xs opacity-70">Accuracy</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-xs opacity-70">Monitoring</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AgentGrid = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading animation
      gsap.fromTo(
        headingRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Grid cards staggered flip animation
      const cards = gridRef.current?.querySelectorAll('.group');
      if (cards) {
        gsap.fromTo(
          cards,
          { rotateX: 90, opacity: 0, y: 50 },
          {
            rotateX: 0,
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="agents"
      ref={sectionRef}
      className="py-24 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div ref={headingRef} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2467ec]/10 border border-[#2467ec]/20 mb-6">
            <Brain className="w-4 h-4 text-[#2467ec]" />
            <span className="text-sm font-medium text-[#2467ec]">
              AI-Powered Capabilities
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 font-['Onest']">
            Intelligent Agents for Every Layer
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Modular intelligence that adapts to your manufacturing needs. 
            Each agent specializes in a specific domain, working together seamlessly.
          </p>
        </div>

        {/* Agent Grid */}
        <div
          ref={gridRef}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {agents.map((agent, index) => (
            <AgentCardComponent key={agent.id} agent={agent} index={index} />
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '6', label: 'AI Agents', color: '#2467ec' },
            { value: '15K+', label: 'Decisions/Day', color: '#1db98b' },
            { value: '99.9%', label: 'Uptime', color: '#e96829' },
            { value: '35%', label: 'Efficiency Gain', color: '#d11f36' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div
                className="text-4xl font-bold mb-1 font-['Onest']"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AgentGrid;
