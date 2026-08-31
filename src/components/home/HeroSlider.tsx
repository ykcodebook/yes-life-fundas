import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Pause, Play, Clock } from 'lucide-react';
import type { Article } from '../../lib/supabase/types';

interface SlideItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  slug: string;
  image: string;
  readingTime: number;
}

interface HeroSliderProps {
  featuredArticles: Article[];
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ featuredArticles }) => {
  const slides: SlideItem[] = featuredArticles.length > 0
    ? featuredArticles.map((art) => ({
        id: art.id,
        title: art.title,
        subtitle: art.subtitle || art.excerpt || 'Intentional principles for conscious living and inner peace.',
        category: art.category?.name || 'Life & Wisdom',
        slug: art.slug,
        image: art.cover_image || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1600&auto=format&fit=crop',
        readingTime: art.reading_time_minutes || 5,
      }))
    : [
        {
          id: '1',
          title: 'The Art of Nervous System Regulation: How to Return to Calm',
          subtitle: 'Understanding somatic cues, the vagus nerve, and gentle daily rituals that dissolve chronic tension.',
          category: 'Holistic Healing',
          slug: 'the-art-of-nervous-system-regulation-return-to-calm',
          image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1600&auto=format&fit=crop',
          readingTime: 6,
        },
        {
          id: '2',
          title: 'Slow Living as Spiritual Resistance: Reclaiming Depth in a Hurried Age',
          subtitle: 'How slowing down your morning and embracing stillness cultivates an extraordinary richness of soul.',
          category: 'Intentional Living',
          slug: 'slow-living-as-spiritual-resistance-reclaiming-depth',
          image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=1600&auto=format&fit=crop',
          readingTime: 5,
        },
        {
          id: '3',
          title: 'The Architecture of Inner Peace: Ancient Philosophy for Modern Anxiety',
          subtitle: 'How Stoic detachment, Taoist fluidity, and mindfulness create an unshakeable sanctuary within.',
          category: 'Mindset & Philosophy',
          slug: 'the-architecture-of-inner-peace-ancient-philosophy-modern-anxiety',
          image: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?q=80&w=1600&auto=format&fit=crop',
          readingTime: 6,
        },
        {
          id: '4',
          title: 'The Asymmetry of Regret: Why the Untaken Path Weighs More Than Failure',
          subtitle: 'A philosophical examination of courage, silent compromises, and living without hesitation.',
          category: 'Life & Wisdom',
          slug: 'the-asymmetry-of-regret-why-inaction-costs-more-than-failure',
          image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=1600&auto=format&fit=crop',
          readingTime: 7,
        },
      ];

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isAutoPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
      }, 6000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoPlaying, slides.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const currentSlide = slides[currentIndex];

  return (
    <div
      className="relative w-full overflow-hidden bg-zinc-950 text-white min-h-[460px] sm:min-h-[560px] md:min-h-[640px] flex items-end font-sans group select-none"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background Image Carousel with Crossfade and Subtle Zoom */}
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none -z-10'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className={`w-full h-full object-cover transform transition-transform duration-10000 ease-out ${
              idx === currentIndex ? 'scale-105' : 'scale-100'
            }`}
          />
          {/* Multi-layered cinematic gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/40 to-transparent" />
        </div>
      ))}

      {/* Main Inner Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 flex flex-col justify-end">
        <div className="max-w-3xl space-y-4">
          {/* Welcome Tag & Category Pill */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500 text-white text-xs font-bold uppercase tracking-wider shadow-md">
              <Sparkles className="w-3 h-3" />
              <span>{currentSlide.category}</span>
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-zinc-300 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 font-medium">
              <Clock className="w-3 h-3 text-brand-400" />
              <span>{currentSlide.readingTime} min read</span>
            </span>
          </div>

          {/* Title */}
          <a
            href={`/articles/${currentSlide.slug}`}
            className="block group/title"
          >
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white group-hover/title:text-brand-300 transition-colors leading-[1.15]">
              {currentSlide.title}
            </h1>
          </a>

          {/* Subtitle / Excerpt */}
          <p className="text-sm sm:text-base md:text-lg text-zinc-200 font-serif leading-relaxed max-w-2xl line-clamp-2 sm:line-clamp-3 text-shadow">
            {currentSlide.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href={`/articles/${currentSlide.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-xl transition-all active:scale-95"
            >
              <span>Read Full Essay</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href={`/category/${currentSlide.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/15 font-semibold text-xs transition-all"
            >
              <span>Explore {currentSlide.category}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Arrows (Sides) */}
      <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-3 sm:px-6 pointer-events-none z-20">
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous slide"
          className="pointer-events-auto w-11 h-11 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/15 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next slide"
          className="pointer-events-auto w-11 h-11 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/15 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Controls Bar: Slide Dots & Autoplay Toggle */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-8 z-20 flex items-center gap-3 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 shadow-lg">
        <button
          type="button"
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          aria-label={isAutoPlaying ? 'Pause autoplay' : 'Resume autoplay'}
          className="text-zinc-300 hover:text-white transition-colors"
        >
          {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <div className="w-px h-3.5 bg-white/20" />
        <div className="flex items-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all rounded-full ${
                idx === currentIndex
                  ? 'w-6 h-2 bg-brand-400'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
