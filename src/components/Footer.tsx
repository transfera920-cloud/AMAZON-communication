import React from 'react';
import { Mountain, ExternalLink, AlertTriangle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-stone-200 bg-stone-900 text-stone-300">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600 text-white">
                <Mountain className="h-4 w-4" aria-hidden="true" />
              </span>
              <a
                href="https://amazon-hike.com/"
                className="inline-flex items-center gap-1 text-base font-bold text-white hover:text-emerald-300 transition-colors"
                aria-label="前往亞馬遜國家山岳協會官方網站"
              >
                <span>亞馬遜國家山岳協會</span>
              </a>
            </div>
            <p className="text-xs text-stone-400">
              致力於推廣安全登山、無痕山林與山岳環境永續保護。
            </p>
          </div>

          <div className="max-w-xl rounded-lg border border-amber-900/50 bg-stone-800/80 p-3.5 text-xs text-stone-300">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" aria-hidden="true" />
              <p className="leading-relaxed">
                <strong className="text-amber-300">安全叮嚀：</strong>
                資料來源：國家公園通訊點彙整。通訊狀況會因地形、天候與電信業者而異，僅供參考，請勿作為唯一的聯絡或求救依賴。入山請備妥衛星通訊設備（如 inReach）、傳統指北針、紙本地圖與離線 GPX 航跡。
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
