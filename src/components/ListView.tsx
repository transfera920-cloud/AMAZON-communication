import React, { useState } from 'react';
import {
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Signal,
  MapPin,
} from 'lucide-react';
import { CommunicationPoint } from '../types.ts';

interface ListViewProps {
  points: CommunicationPoint[];
}

export const ListView: React.FC<ListViewProps> = ({ points }) => {
  // Store which point id has just been copied (for "已複製" feedback)
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Store expanded TWD97 section set of ids
  const [expandedTwd97, setExpandedTwd97] = useState<Set<number>>(new Set());

  const handleCopy = async (point: CommunicationPoint) => {
    const text = `${point.lat.toFixed(6)},${point.lng.toFixed(6)}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedId(point.id);
      setTimeout(() => {
        setCopiedId((curr) => (curr === point.id ? null : curr));
      }, 2000);
    } catch {
      // Ignore copy error
    }
  };

  const toggleTwd97 = (id: number) => {
    setExpandedTwd97((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (points.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-12 text-center shadow-xs">
        <MapPin className="mx-auto h-12 w-12 text-stone-300" aria-hidden="true" />
        <h3 className="mt-3 text-lg font-bold text-stone-800">查無符合條件的通訊點位</h3>
        <p className="mt-1 text-sm text-stone-500">
          請嘗試調整篩選條件、放寬關鍵字或取消限制條件。
        </p>
      </div>
    );
  }

  // Group by Park and Trail, preserving original id order
  type GroupMap = Map<string, Map<string, CommunicationPoint[]>>;
  const groups: GroupMap = new Map();

  for (const p of points) {
    if (!groups.has(p.park)) {
      groups.set(p.park, new Map());
    }
    const parkMap = groups.get(p.park)!;
    if (!parkMap.has(p.trail)) {
      parkMap.set(p.trail, []);
    }
    parkMap.get(p.trail)!.push(p);
  }

  return (
    <div className="space-y-8">
      {Array.from(groups.entries()).map(([parkName, trailMap]) => (
        <section key={parkName} className="space-y-4">
          {/* Park Section Heading */}
          <div className="flex items-center gap-2 border-b-2 border-emerald-800 pb-2">
            <span className="h-3.5 w-3.5 rounded-full bg-emerald-800" aria-hidden="true" />
            <h2 className="text-lg font-bold tracking-tight text-stone-900 sm:text-xl">
              {parkName}
            </h2>
            <span className="text-xs font-medium text-stone-500">
              ({Array.from(trailMap.values()).reduce((sum, arr) => sum + arr.length, 0)} 處點位)
            </span>
          </div>

          {/* Trails in this park */}
          {Array.from(trailMap.entries()).map(([trailName, trailPoints]) => (
            <div
              key={trailName}
              className="rounded-xl border border-stone-200 bg-stone-50/50 p-3 sm:p-5"
            >
              <div className="mb-3 flex flex-wrap items-baseline gap-2">
                <h3 className="text-base font-bold text-stone-800">
                  {trailName}
                </h3>
                {trailPoints[0]?.system && (
                  <span className="text-xs text-stone-500 font-medium">
                    · 系統：{trailPoints[0].system}
                  </span>
                )}
                <span className="text-xs text-stone-400">
                  ({trailPoints.length} 筆)
                </span>
              </div>

              {/* Cards Grid: 1 col on mobile, 2 col on tablet/desktop */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-2">
                {trailPoints.map((pt) => {
                  const isCopied = copiedId === pt.id;
                  const isTwdExpanded = expandedTwd97.has(pt.id);
                  const googleMapsUrl = `https://www.google.com/maps?q=${pt.lat.toFixed(6)},${pt.lng.toFixed(6)}`;

                  return (
                    <article
                      key={pt.id}
                      className="relative flex flex-col justify-between rounded-lg border border-stone-200 bg-white p-4 shadow-xs transition-shadow hover:shadow-md"
                    >
                      {/* Top: Point Name & Metadata */}
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-base font-bold text-stone-900 leading-snug">
                            {pt.point}
                          </h4>
                          <span className="font-mono text-xs text-stone-400 shrink-0">
                            #{pt.id}
                          </span>
                        </div>

                        {/* Badges / Quiet Inline Metadata */}
                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-600">
                          {pt.list && (
                            <span className="rounded-md bg-stone-100 px-2 py-0.5 text-stone-700 font-medium">
                              {pt.list}
                            </span>
                          )}

                          {pt.signal_dbm !== null && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-800 font-mono font-medium">
                              <Signal className="h-3 w-3" />
                              {pt.signal_dbm} dBm
                            </span>
                          )}
                        </div>

                        {/* Coordinate Callout */}
                        <div className="mt-3 rounded-md bg-stone-50 p-2.5 border border-stone-200/60 font-mono text-xs">
                          <div className="flex items-center justify-between text-stone-700">
                            <span className="text-stone-500 font-sans font-medium">WGS84 座標：</span>
                            <span className="font-bold tabular-nums">
                              {pt.lat.toFixed(6)}, {pt.lng.toFixed(6)}
                            </span>
                          </div>

                          {/* Expandable TWD97 */}
                          {isTwdExpanded && (
                            <div className="mt-2 pt-2 border-t border-stone-200/80 text-[11px] text-stone-600 space-y-0.5">
                              <div className="flex justify-between">
                                <span className="text-stone-500 font-sans">TWD97 X：</span>
                                <span className="tabular-nums">{pt.twd97_x.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-stone-500 font-sans">TWD97 Y：</span>
                                <span className="tabular-nums">{pt.twd97_y.toLocaleString()}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom Action Buttons (min 44px touch targets) */}
                      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopy(pt)}
                            className="min-h-[44px] px-3 text-xs font-medium rounded-md border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 active:bg-stone-100 transition-colors flex items-center gap-1.5"
                            aria-label={`複製點位 ${pt.point} 的 WGS84 座標`}
                          >
                            {isCopied ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                                <span className="font-semibold text-emerald-700">已複製！</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5 text-stone-500" />
                                <span>複製座標</span>
                              </>
                            )}
                          </button>

                          <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-h-[44px] px-3 text-xs font-medium rounded-md border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 active:bg-stone-100 transition-colors inline-flex items-center gap-1.5"
                            aria-label={`在 Google 地圖開啟點位 ${pt.point}（開新分頁）`}
                          >
                            <ExternalLink className="h-3.5 w-3.5 text-stone-500" />
                            <span>Google 地圖</span>
                          </a>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleTwd97(pt.id)}
                          className="min-h-[44px] px-2 text-[11px] font-medium text-stone-500 hover:text-stone-800 flex items-center gap-1"
                          aria-label={isTwdExpanded ? '收合 TWD97 座標' : '查看 TWD97 座標'}
                        >
                          <span>{isTwdExpanded ? '收合 TWD97' : 'TWD97'}</span>
                          {isTwdExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
};
