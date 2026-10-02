import React, { useState } from 'react';
import { Search, RotateCcw, Filter, ChevronDown, ChevronUp, Signal } from 'lucide-react';
import { FilterState, CommunicationPoint } from '../types.ts';

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (updater: (prev: FilterState) => FilterState) => void;
  onReset: () => void;
  allPoints: CommunicationPoint[];
  filteredPoints: CommunicationPoint[];
  parkOptions: { name: string; count: number }[];
  systemOptions: string[];
  trailOptions: string[];
  availableListCategories: string[];
  hasSignalDataInFiltered: boolean;
  minPossibleDbm: number;
  maxPossibleDbm: number;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onReset,
  allPoints,
  parkOptions,
  systemOptions,
  trailOptions,
  availableListCategories,
  hasSignalDataInFiltered,
  minPossibleDbm,
  maxPossibleDbm,
}) => {
  // Mobile accordion collapse state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Check if any non-default filter is active
  const isFiltered =
    filters.park !== '全部' ||
    filters.system !== '全部' ||
    filters.trail !== '全部' ||
    filters.selectedLists.length > 0 ||
    filters.keyword.trim() !== '' ||
    filters.minSignalDbm !== minPossibleDbm ||
    filters.onlyWithSignal;

  const totalPointsCount = allPoints.length;

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs sm:p-6">
      {/* Mobile Toggle Bar */}
      <div className="flex items-center justify-between sm:hidden">
        <button
          type="button"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className="flex min-h-[44px] items-center gap-2 text-base font-semibold text-stone-900"
          aria-expanded={isMobileOpen}
          aria-controls="filter-body"
        >
          <Filter className="h-5 w-5 text-emerald-700" />
          <span>篩選條件</span>
          {isFiltered && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
              已套用
            </span>
          )}
        </button>

        <div className="flex items-center gap-2">
          {isFiltered && (
            <button
              type="button"
              onClick={onReset}
              className="flex min-h-[44px] items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-900 px-2"
              aria-label="重設所有篩選"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              清除
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center text-stone-500"
            aria-label={isMobileOpen ? '收合篩選區' : '展開篩選區'}
          >
            {isMobileOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Filter Body: always visible on sm+, collapsible on mobile */}
      <div
        id="filter-body"
        className={`${isMobileOpen ? 'block pt-4' : 'hidden sm:block'}`}
      >
        {/* Row 1: Park Selection Pills */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
            1. 國家公園
          </label>
          <div className="flex flex-wrap gap-2" role="group" aria-label="國家公園篩選">
            <button
              type="button"
              onClick={() =>
                onFilterChange((prev) => ({
                  ...prev,
                  park: '全部',
                  system: '全部',
                  trail: '全部',
                  selectedLists: [],
                }))
              }
              className={`min-h-[44px] px-4 py-2 text-sm font-medium rounded-full transition-all duration-150 flex items-center gap-1.5 ${
                filters.park === '全部'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <span>全部</span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  filters.park === '全部' ? 'bg-emerald-950/60 text-emerald-100' : 'bg-stone-200/80 text-stone-600'
                }`}
              >
                {totalPointsCount}
              </span>
            </button>

            {parkOptions.map((p) => {
              const isActive = filters.park === p.name;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() =>
                    onFilterChange((prev) => ({
                      ...prev,
                      park: p.name,
                      system: '全部',
                      trail: '全部',
                      selectedLists: [],
                    }))
                  }
                  className={`min-h-[44px] px-4 py-2 text-sm font-medium rounded-full transition-all duration-150 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <span>{p.name}</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-emerald-950/60 text-emerald-100' : 'bg-stone-200/80 text-stone-600'
                    }`}
                  >
                    {p.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Trail System (if applicable) & Trail Name Dropdowns */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* System Dropdown: Only shown when selected park has system values */}
          {systemOptions.length > 0 && (
            <div>
              <label
                htmlFor="filter-system"
                className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1"
              >
                2. 步道系統
              </label>
              <select
                id="filter-system"
                value={filters.system}
                onChange={(e) =>
                  onFilterChange((prev) => ({
                    ...prev,
                    system: e.target.value,
                    trail: '全部', // reset trail when system changes
                  }))
                }
                className="w-full min-h-[44px] rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                <option value="全部">全部步道系統</option>
                {systemOptions.map((sys) => (
                  <option key={sys} value={sys}>
                    {sys}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Trail Dropdown */}
          <div className={systemOptions.length === 0 ? 'sm:col-span-2 lg:col-span-1' : ''}>
            <label
              htmlFor="filter-trail"
              className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1"
            >
              {systemOptions.length > 0 ? '3. 步道名稱' : '2. 步道名稱'}
            </label>
            <select
              id="filter-trail"
              value={filters.trail}
              onChange={(e) =>
                onFilterChange((prev) => ({
                  ...prev,
                  trail: e.target.value,
                }))
              }
              className="w-full min-h-[44px] rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="全部">全部步道</option>
              {trailOptions.map((tr) => (
                <option key={tr} value={tr}>
                  {tr}
                </option>
              ))}
            </select>
          </div>

          {/* Search Keyword Input */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label
              htmlFor="filter-keyword"
              className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1"
            >
              關鍵字搜尋（點位／步道）
            </label>
            <div className="relative">
              <input
                id="filter-keyword"
                type="text"
                value={filters.keyword}
                onChange={(e) =>
                  onFilterChange((prev) => ({
                    ...prev,
                    keyword: e.target.value,
                  }))
                }
                placeholder="例如：登山口、黑水塘、主峰、0.5k..."
                className="w-full min-h-[44px] rounded-lg border border-stone-300 bg-white pl-10 pr-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
              <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-stone-400" />
            </div>
          </div>
        </div>

        {/* Row 3: List Categories Multi-Select (shown only when selected park contains list values) */}
        {availableListCategories.length > 0 && (
          <div className="mt-4 pt-3 border-t border-stone-100">
            <span className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              清單類別（可複選）
            </span>
            <div className="flex flex-wrap gap-2">
              {availableListCategories.map((cat) => {
                const isSelected = filters.selectedLists.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      onFilterChange((prev) => {
                        const nextLists = isSelected
                          ? prev.selectedLists.filter((l) => l !== cat)
                          : [...prev.selectedLists, cat];
                        return { ...prev, selectedLists: nextLists };
                      });
                    }}
                    className={`min-h-[40px] px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-semibold'
                        : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isSelected ? 'bg-emerald-600' : 'bg-stone-300'
                      }`}
                    />
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Row 4: Signal dBm Slider (shown only when currently filtered points have signal data) */}
        {hasSignalDataInFiltered && (
          <div className="mt-4 pt-3 border-t border-stone-100">
            <div className="rounded-lg bg-stone-50 p-3 border border-stone-200/70 max-w-xl">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
                  <Signal className="h-4 w-4 text-emerald-600" />
                  訊號強度限制：
                  <span className="font-mono text-emerald-700">≥ {filters.minSignalDbm} dBm</span>
                </span>
                <span className="text-[11px] text-stone-500">數值越大（越接近 0）訊號越強</span>
              </div>
              <input
                type="range"
                min={minPossibleDbm}
                max={maxPossibleDbm}
                step="1"
                value={filters.minSignalDbm}
                onChange={(e) =>
                  onFilterChange((prev) => ({
                    ...prev,
                    minSignalDbm: Number(e.target.value),
                  }))
                }
                className="w-full mt-2 accent-emerald-600 cursor-pointer"
                aria-label="訊號強度最低限制滑桿"
              />
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="only-signal-checkbox"
                  checked={filters.onlyWithSignal}
                  onChange={(e) =>
                    onFilterChange((prev) => ({
                      ...prev,
                      onlyWithSignal: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded-sm border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="only-signal-checkbox" className="text-xs text-stone-600 select-none cursor-pointer">
                  只看有訊號強度資料的點位
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
