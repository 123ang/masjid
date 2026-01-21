'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

export type PublicDashboardSlide = {
  key: string;
  content: React.ReactNode;
};

export default function PublicDashboardCarousel({
  slides,
  autoAdvanceMs = 10000,
  className,
}: {
  slides: PublicDashboardSlide[];
  autoAdvanceMs?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  const count = slides.length;
  const canRotate = count > 1;

  const safeIndex = useMemo(() => {
    if (count === 0) return 0;
    return ((index % count) + count) % count;
  }, [count, index]);

  useEffect(() => {
    if (!canRotate || !playing) return;
    const id = window.setInterval(() => {
      setIndex((i) => i + 1);
    }, autoAdvanceMs);
    return () => window.clearInterval(id);
  }, [autoAdvanceMs, canRotate, playing]);

  if (count === 0) return null;

  return (
    <div className={cn('relative h-full w-full flex flex-col', className)}>
      {/* Slides - centered content */}
      <div className="flex-1 overflow-hidden">
        <div
          className="flex h-full w-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${safeIndex * 100}%)` }}
        >
          {slides.map((s) => (
            <section
              key={s.key}
              className="min-w-full h-full overflow-y-auto flex items-center justify-center"
            >
              <div className="w-full max-w-7xl p-4 sm:p-6">{s.content}</div>
            </section>
          ))}
        </div>
      </div>

      {/* Controls at bottom */}
      {canRotate && (
        <div className="flex flex-col items-center justify-center gap-3 py-4 border-t bg-white/50">
          {/* Dots (on top) */}
          <div className="flex items-center gap-2">
            {slides.map((s, i) => {
              const active = i === safeIndex;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={cn(
                    'h-2.5 w-2.5 rounded-full transition-colors border',
                    active ? 'bg-green-600 border-green-600' : 'bg-white border-gray-300 hover:border-green-400'
                  )}
                />
              );
            })}
          </div>

          {/* Navigation buttons (below dots) */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setIndex((i) => i - 1)}
              aria-label="Previous"
              className="h-8 w-8 bg-white/80"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? 'Pause autoplay' : 'Play autoplay'}
              className="h-8 w-8 bg-white/80"
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setIndex((i) => i + 1)}
              aria-label="Next"
              className="h-8 w-8 bg-white/80"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
