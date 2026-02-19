import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Michael Chen',
    role: 'VP of Manufacturing',
    company: 'Precision Industries',
    content: 'AI-MES has transformed our operations. The predictive maintenance agent alone has reduced unplanned downtime by 60%. The AI agents work seamlessly together, optimizing our entire production flow.',
    rating: 5,
    avatar: 'MC',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    role: 'Plant Manager',
    company: 'AutoTech Solutions',
    content: 'The real-time optimization capabilities are incredible. We have seen a 35% improvement in OEE within the first three months. The ISA-95 compliance made integration with our existing systems seamless.',
    rating: 5,
    avatar: 'SJ',
  },
  {
    id: '3',
    name: 'Robert Williams',
    role: 'Director of Operations',
    company: 'Global Manufacturing Corp',
    content: 'The dual database architecture handles our massive IoT data streams effortlessly. Batch jobs process millions of records overnight, and the AI agents provide actionable insights every morning.',
    rating: 5,
    avatar: 'RW',
  },
  {
    id: '4',
    name: 'Emily Davis',
    role: 'Quality Assurance Lead',
    company: 'MedDevice Pro',
    content: 'Quality control has never been better. The AI-powered defect detection catches issues before they become problems. Our defect rate dropped by 80% after implementation.',
    rating: 5,
    avatar: 'ED',
  },
  {
    id: '5',
    name: 'David Park',
    role: 'CTO',
    company: 'SmartFactory Inc',
    content: 'The agent orchestration system is brilliant. Each AI agent specializes in its domain but they collaborate seamlessly. It is like having a team of expert analysts working 24/7.',
    rating: 5,
    avatar: 'DP',
  },
];

const Testimonials = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading animation
      gsap.fromTo(
        '.testimonials-heading',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) {
        goToNext();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, isAnimating]);

  const goToNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToPrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const getCardStyle = (index: number) => {
    const diff = index - currentIndex;
    const normalizedDiff = ((diff + testimonials.length) % testimonials.length);
    
    if (normalizedDiff === 0) {
      // Current card
      return {
        transform: 'translateX(0) scale(1) rotateY(0deg)',
        opacity: 1,
        zIndex: 10,
        filter: 'blur(0px)',
      };
    } else if (normalizedDiff === 1 || normalizedDiff === -testimonials.length + 1) {
      // Next card
      return {
        transform: 'translateX(60%) scale(0.85) rotateY(-15deg)',
        opacity: 0.5,
        zIndex: 5,
        filter: 'blur(2px)',
      };
    } else if (normalizedDiff === testimonials.length - 1 || normalizedDiff === -1) {
      // Previous card
      return {
        transform: 'translateX(-60%) scale(0.85) rotateY(15deg)',
        opacity: 0.5,
        zIndex: 5,
        filter: 'blur(2px)',
      };
    } else {
      // Hidden cards
      return {
        transform: 'translateX(0) scale(0.7)',
        opacity: 0,
        zIndex: 0,
        filter: 'blur(4px)',
      };
    }
  };

  return (
    <section
      ref={sectionRef}
      className="py-24 relative overflow-hidden"
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-[#2467ec]/5 to-transparent rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="testimonials-heading text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2467ec]/10 border border-[#2467ec]/20 mb-6">
            <Quote className="w-4 h-4 text-[#2467ec]" />
            <span className="text-sm font-medium text-[#2467ec]">
              Customer Stories
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 font-['Onest']">
            Trusted by Industry Leaders
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how manufacturers are transforming their operations with AI-MES.
          </p>
        </div>

        {/* 3D Carousel */}
        <div
          ref={carouselRef}
          className="relative h-[400px] perspective-1000"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className="absolute w-full max-w-2xl transition-all duration-500 ease-precision"
                style={{
                  ...getCardStyle(index),
                  transformStyle: 'preserve-3d',
                }}
              >
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                  {/* Quote Icon */}
                  <Quote className="w-10 h-10 text-[#2467ec]/20 mb-4" />

                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-[#e96829] text-[#e96829]"
                      />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-lg text-gray-700 leading-relaxed mb-6">
                    "{testimonial.content}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2467ec] to-[#1db98b] flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-2 hover:border-[#2467ec] hover:text-[#2467ec]"
              onClick={goToPrev}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (!isAnimating) {
                      setIsAnimating(true);
                      setCurrentIndex(index);
                      setTimeout(() => setIsAnimating(false), 500);
                    }
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'w-8 bg-[#2467ec]'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-2 hover:border-[#2467ec] hover:text-[#2467ec]"
              onClick={goToNext}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '500+', label: 'Manufacturers' },
            { value: '50M+', label: 'Devices Connected' },
            { value: '99.9%', label: 'Uptime SLA' },
            { value: '24/7', label: 'AI Monitoring' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-[#2467ec] font-['Onest']">
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

export default Testimonials;
