import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { sqlDB, tsDB } from '@/services/DatabaseService';
import { batchJobService } from '@/services/BatchJobService';
import { agentOrchestrator, SchedulingAgent, QualityAgent, MaintenanceAgent, InventoryAgent, AnomalyDetectionAgent } from '@/agents/AgentSystem';

// Sections
import Hero from '@/sections/Hero';
import LogoMarquee from '@/sections/LogoMarquee';
import AgentGrid from '@/sections/AgentGrid';
import MESDiagram from '@/sections/MESDiagram';
import OptimizationDashboard from '@/sections/OptimizationDashboard';
import Testimonials from '@/sections/Testimonials';
import Footer from '@/sections/Footer';
import Navigation from '@/sections/Navigation';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

function App() {
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize services
    const initializeServices = async () => {
      console.log('Initializing AI-MES Platform...');
      
      // Connect databases
      await sqlDB.connect();
      await tsDB.connect();
      
      // Initialize batch job service
      await batchJobService.initialize();
      batchJobService.start();
      
      // Register AI Agents
      const scheduler = new SchedulingAgent('agent-scheduler');
      const qualityAgent = new QualityAgent('agent-quality');
      const maintenanceAgent = new MaintenanceAgent('agent-maintenance');
      const inventoryAgent = new InventoryAgent('agent-inventory');
      const anomalyAgent = new AnomalyDetectionAgent('agent-anomaly');
      
      agentOrchestrator.registerAgent(scheduler);
      agentOrchestrator.registerAgent(qualityAgent);
      agentOrchestrator.registerAgent(maintenanceAgent);
      agentOrchestrator.registerAgent(inventoryAgent);
      agentOrchestrator.registerAgent(anomalyAgent);
      
      await agentOrchestrator.initialize();
      agentOrchestrator.start(5000);
      
      console.log('AI-MES Platform initialized successfully');
    };

    initializeServices();

    // Cleanup
    return () => {
      batchJobService.stop();
      agentOrchestrator.stop();
      sqlDB.disconnect();
      tsDB.disconnect();
    };
  }, []);

  useEffect(() => {
    // Velocity-based skew effect
    let lastScrollY = window.scrollY;
    let skewTarget = 0;
    let currentSkew = 0;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const velocity = scrollY - lastScrollY;
      lastScrollY = scrollY;

      // Calculate target skew based on velocity (max 2deg)
      skewTarget = Math.max(-2, Math.min(2, velocity * 0.05));
    };

    const updateSkew = () => {
      // Smooth interpolation
      currentSkew += (skewTarget - currentSkew) * 0.1;
      
      // Reset skew target
      skewTarget *= 0.95;

      // Apply skew to content
      if (mainRef.current) {
        const content = mainRef.current.querySelectorAll('.velocity-skew');
        content.forEach((el) => {
          (el as HTMLElement).style.transform = `skewY(${currentSkew}deg)`;
        });
      }

      requestAnimationFrame(updateSkew);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateSkew();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div ref={mainRef} className="relative min-h-screen bg-[#f0f5ff] overflow-x-hidden">
      {/* Background Grid */}
      <div className="fixed inset-0 grid-bg pointer-events-none z-0" />
      
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <main className="relative z-10">
        <Hero />
        <LogoMarquee />
        <AgentGrid />
        <MESDiagram />
        <OptimizationDashboard />
        <Testimonials />
        <Footer />
      </main>
    </div>
  );
}

export default App;
