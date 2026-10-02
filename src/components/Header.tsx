import React from 'react';
import { Mountain, ExternalLink } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-stone-200 bg-stone-900 text-stone-100 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
              <Mountain className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <a
                href="https://amazon-hike.com/"
                className="group block"
                aria-label="前往亞馬遜國家山岳協會官方網站"
              >
                <div className="inline-flex items-center gap-1.5 text-base font-bold tracking-tight text-white transition-colors group-hover:text-emerald-300 sm:text-lg">
                  <span>亞馬遜國家山岳協會</span>
                </div>
                <div className="text-xs tracking-wider text-stone-400 group-hover:text-stone-300 transition-colors">
                  AMAZON ALPINE ASSOCIATION
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Page Title */}
        <div className="mt-4 border-t border-stone-800/90 pt-3">
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl">
            國家公園登山步道・手機通訊點位查詢
          </h1>
        </div>
      </div>
    </header>
  );
};
