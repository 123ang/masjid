'use client';

import { Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t mt-auto">
      <div className="px-6 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>© {currentYear} Masjid Al-Huda Padang Matsirat</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Dibuat dengan</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>untuk ummah</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
