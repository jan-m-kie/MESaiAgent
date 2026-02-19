import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const MESDiagram = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const diagramRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Get all nodes
      const nodes = nodesRef.current?.querySelectorAll('.mes-node');
      const lines = linesRef.current?.querySelectorAll('.connection-line');
      const dataPackets = linesRef.current?.querySelectorAll('.data-packet');

      if (!nodes || !lines) return;

      // Initial state - nodes close together
      gsap.set(nodes, {
        scale: 0.8,
        opacity: 0,
      });

      gsap.set(lines, {
        strokeDasharray: 1000,
        strokeDashoffset: 1000,
      });

      // Exploded view animation on scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 60%',
          end: 'center center',
          scrub: 1,
        },
      });

      // Animate nodes exploding outward
      tl.to(nodes, {
        scale: 1,
        opacity: 1,
        duration: 1,
        stagger: 0.05,
        ease: 'power2.out',
      });

      // Draw connection lines
      tl.to(
        lines,
        {
          strokeDashoffset: 0,
          duration: 1.5,
          stagger: 0.1,
          ease: 'power2.inOut',
        },
        '-=0.5'
      );

      // Animate data packets
      if (dataPackets) {
        dataPackets.forEach((packet, i) => {
          gsap.to(packet, {
            motionPath: {
              path: (packet as any).dataset.path,
              align: (packet as any).dataset.path,
              alignOrigin: [0.5, 0.5],
            },
            duration: 3 + i * 0.5,
            repeat: -1,
            ease: 'none',
          });
        });
      }

      // Continuous floating animation for nodes
      nodes.forEach((node, i) => {
        gsap.to(node, {
          y: '+=10',
          duration: 2 + i * 0.3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const modules = [
    { id: 'erp', name: 'ERP Integration', color: '#2467ec', position: 'top-left' },
    { id: 'workorders', name: 'Work Orders', color: '#e96829', position: 'top' },
    { id: 'scheduling', name: 'Production Scheduling', color: '#1db98b', position: 'top-right' },
    { id: 'inventory', name: 'Inventory Management', color: '#2467ec', position: 'right' },
    { id: 'quality', name: 'Quality Control', color: '#e96829', position: 'bottom-right' },
    { id: 'maintenance', name: 'Maintenance Management', color: '#1db98b', position: 'bottom' },
    { id: 'shopfloor', name: 'Shop Floor Control', color: '#2467ec', position: 'bottom-left' },
    { id: 'iot', name: 'IoT Data Collection', color: '#e96829', position: 'left' },
  ];

  return (
    <section
      id="platform"
      ref={sectionRef}
      className="py-24 relative overflow-hidden"
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2467ec]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#1db98b]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1db98b]/10 border border-[#1db98b]/20 mb-6">
            <span className="text-sm font-medium text-[#1db98b]">
              ISA-95 Architecture
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 font-['Onest']">
            Real-Time Intelligence
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our MES platform connects every layer of your manufacturing operation, 
            from enterprise systems to shop floor equipment.
          </p>
        </div>

        {/* Diagram Container */}
        <div ref={diagramRef} className="relative">
          {/* SVG Connections */}
          <svg
            ref={linesRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
          >
            <defs>
              <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2467ec" />
                <stop offset="50%" stopColor="#1db98b" />
                <stop offset="100%" stopColor="#e96829" />
              </linearGradient>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#2467ec" />
              </marker>
            </defs>

            {/* Connection Lines */}
            {modules.map((module, i) => {
              const angle = (i / modules.length) * 2 * Math.PI - Math.PI / 2;
              const x1 = 50 + 30 * Math.cos(angle);
              const y1 = 50 + 30 * Math.sin(angle);
              
              return (
                <line
                  key={module.id}
                  className="connection-line"
                  x1={`${x1}%`}
                  y1={`${y1}%`}
                  x2="50%"
                  y2="50%"
                  stroke="url(#line-gradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  markerEnd="url(#arrowhead)"
                />
              );
            })}

            {/* Data Packets */}
            {modules.map((module, i) => {
              const angle = (i / modules.length) * 2 * Math.PI - Math.PI / 2;
              const x1 = 50 + 30 * Math.cos(angle);
              const y1 = 50 + 30 * Math.sin(angle);
              
              return (
                <circle
                  key={`packet-${module.id}`}
                  className="data-packet"
                  r="4"
                  fill="#2467ec"
                  data-path={`M ${x1} ${y1} L 50 50`}
                >
                  <animateMotion
                    dur={`${3 + i * 0.5}s`}
                    repeatCount="indefinite"
                    path={`M ${x1 * 8} ${y1 * 5} L 400 250`}
                  />
                </circle>
              );
            })}
          </svg>

          {/* MES Diagram Image */}
          <div ref={nodesRef} className="relative flex items-center justify-center min-h-[500px]">
            {/* Central MES Node */}
            <div className="mes-node absolute z-20">
              <div className="relative">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[#2467ec] to-[#1a52c4] flex items-center justify-center shadow-2xl neural-glow">
                  <div className="text-center text-white">
                    <div className="text-2xl font-bold font-['Onest']">MES</div>
                    <div className="text-xs opacity-80">Core</div>
                  </div>
                </div>
                {/* Orbiting Ring */}
                <div className="absolute -inset-4 border-2 border-dashed border-[#2467ec]/30 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
              </div>
            </div>

            {/* Surrounding Module Nodes */}
            {modules.map((module, i) => {
              const angle = (i / modules.length) * 2 * Math.PI - Math.PI / 2;
              const x = 50 + 35 * Math.cos(angle);
              const y = 50 + 35 * Math.sin(angle);
              
              return (
                <div
                  key={module.id}
                  className="mes-node absolute"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div
                    className="px-4 py-3 rounded-xl shadow-lg border-2 transition-all duration-300 hover:scale-110 cursor-pointer"
                    style={{
                      backgroundColor: 'white',
                      borderColor: module.color,
                    }}
                  >
                    <div
                      className="text-sm font-semibold whitespace-nowrap"
                      style={{ color: module.color }}
                    >
                      {module.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature List */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Dual Database Architecture',
              description: 'SQL for relational data, TimeSeries for IoT sensor data',
              icon: '🗄️',
            },
            {
              title: 'AI Agent Orchestration',
              description: 'Intelligent agents work together to optimize operations',
              icon: '🤖',
            },
            {
              title: 'Batch Job Processing',
              description: 'Background processing for reports, analytics, and maintenance',
              icon: '⚙️',
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-[#2467ec] transition-colors"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 font-['Onest']">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MESDiagram;
