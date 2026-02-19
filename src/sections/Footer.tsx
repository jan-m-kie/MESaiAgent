import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  Factory,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Github,
  Youtube,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Footer = () => {
  const footerRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // CTA settling effect
      gsap.fromTo(
        ctaRef.current,
        { scale: 1.2, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const footerLinks = {
    Product: [
      { label: 'Features', href: '#' },
      { label: 'AI Agents', href: '#agents' },
      { label: 'Analytics', href: '#analytics' },
      { label: 'Integrations', href: '#' },
      { label: 'Pricing', href: '#' },
    ],
    Solutions: [
      { label: 'Discrete Manufacturing', href: '#' },
      { label: 'Process Manufacturing', href: '#' },
      { label: 'Food & Beverage', href: '#' },
      { label: 'Pharmaceutical', href: '#' },
      { label: 'Automotive', href: '#' },
    ],
    Resources: [
      { label: 'Documentation', href: '#' },
      { label: 'API Reference', href: '#' },
      { label: 'Case Studies', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Webinars', href: '#' },
    ],
    Company: [
      { label: 'About Us', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Partners', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Press Kit', href: '#' },
    ],
  };

  return (
    <footer ref={footerRef} className="relative bg-gray-900 text-white">
      {/* CTA Section */}
      <div ref={ctaRef} className="relative py-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2467ec]/20 to-[#1db98b]/20" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2467ec]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#1db98b]/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 font-['Onest']">
            Ready to Transform Your Factory?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join hundreds of manufacturers using AI-MES to optimize their operations 
            with intelligent agents and real-time analytics.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-6 text-lg font-medium group"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg font-medium"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
            {/* Brand Column */}
            <div className="col-span-2">
              <a href="#" className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2467ec] to-[#1db98b] flex items-center justify-center">
                  <Factory className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl font-['Onest']">AI-MES</span>
              </a>
              <p className="text-gray-400 text-sm mb-6 max-w-xs">
                AI-native Manufacturing Execution System built on ISA-95 standards 
                with intelligent agents and dual-database architecture.
              </p>

              {/* Newsletter */}
              <div className="mb-6">
                <p className="text-sm font-medium mb-3">Subscribe to our newsletter</p>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  />
                  <Button className="bg-[#2467ec] hover:bg-[#1a52c4] px-4">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-4">
                {[
                  { icon: Linkedin, href: '#' },
                  { icon: Twitter, href: '#' },
                  { icon: Github, href: '#' },
                  { icon: Youtube, href: '#' },
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-[#2467ec] hover:text-white transition-colors"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link Columns */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="font-semibold text-white mb-4">{title}</h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-gray-400 hover:text-white text-sm transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Cookie Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Security
              </a>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>contact@ai-mes.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800 text-center text-sm text-gray-500">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MapPin className="w-4 h-4" />
              <span>123 Innovation Drive, San Francisco, CA 94105</span>
            </div>
            <p>© 2024 AI-MES Platform. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
