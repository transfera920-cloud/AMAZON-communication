import React, { useState, useMemo, useEffect, useRef } from 'react';
import rawData from './data/communication_points.json';
import { CommunicationPoint, FilterState } from './types.ts';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { FilterPanel } from './components/FilterPanel.tsx';
import { ListView } from './components/ListView.tsx';
import { MapView } from './components/MapView.tsx';
import { AboutSection } from './components/AboutSection.tsx';
import { exportToCsv } from './utils/csvExport.ts';
import { parseFiltersFromUrl, syncFiltersToUrl } from './utils/urlParams.ts';
import { Download, List, Map as MapIcon, RotateCcw } from 'lucide-react';

const allPoints = (rawData as CommunicationPoint[]).filter((p) => !p.coord_warning);

export default function App() {
  // Compute global signal_dbm min/max dynamically
  const { minPossibleDbm, maxPossibleDbm } = useMemo(() => {
    const withSignal = allPoints.filter((p) => p.signal_dbm !== null);
    if (withSignal.length === 0) return { minPossibleDbm: -130, maxPossibleDbm: -50 };
    const values = withSignal.map((p) => p.signal_dbm as number);
    return {
      minPossibleDbm: Math.min(...values),
      maxPossibleDbm: Math.max(...values),
    };
  }, []);

  // Initialize filters (checking URL params on load)
  const [filters, setFilters] = useState<FilterState>(() => {
    const initialFromUrl = parseFiltersFromUrl(minPossibleDbm);
    return {
      park: initialFromUrl.park || '全部',
      system: initialFromUrl.system || '全部',
      trail: initialFromUrl.trail || '全部',
      selectedLists: initialFromUrl.selectedLists || [],
      keyword: initialFromUrl.keyword || '',
      minSignalDbm: initialFromUrl.minSignalDbm ?? minPossibleDbm,
      onlyWithSignal: initialFromUrl.onlyWithSignal || false,
      viewMode: initialFromUrl.viewMode || 'map',
    };
  });

  // Keep track of first render to avoid redundant replaceState
  const isFirstRender = useRef(true);

  // Sync to URL whenever filters change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    syncFiltersToUrl(filters, minPossibleDbm);
  }, [filters, minPossibleDbm]);

  // Dynamically generate Park options with counts
  const parkOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    allPoints.forEach((p) => {
      counts[p.park] = (counts[p.park] || 0) + 1;
    });
    return Object.keys(counts).map((name) => ({
      name,
      count: counts[name],
    }));
  }, []);

  // Dynamically generate System options based on selected park
  const systemOptions = useMemo(() => {
    if (filters.park === '全部') return [];
    const parkPoints = allPoints.filter((p) => p.park === filters.park);
    const systems = new Set<string>();
    parkPoints.forEach((p) => {
      if (p.system) systems.add(p.system);
    });
    return Array.from(systems);
  }, [filters.park]);

  // Dynamically generate Trail options based on selected park & system
  const trailOptions = useMemo(() => {
    let pool = allPoints;
    if (filters.park !== '全部') {
      pool = pool.filter((p) => p.park === filters.park);
    }
    if (filters.system !== '全部' && systemOptions.length > 0) {
      pool = pool.filter((p) => p.system === filters.system);
    }
    const trails = new Set<string>();
    pool.forEach((p) => {
      if (p.trail) trails.add(p.trail);
    });
    return Array.from(trails);
  }, [filters.park, filters.system, systemOptions.length]);

  // Dynamically generate List category options for current park
  const availableListCategories = useMemo(() => {
    let pool = allPoints;
    if (filters.park !== '全部') {
      pool = pool.filter((p) => p.park === filters.park);
    }
    const categories = new Set<string>();
    pool.forEach((p) => {
      if (p.list) categories.add(p.list);
    });
    return Array.from(categories);
  }, [filters.park]);

  // Compute filtered points with useMemo for instant client-side performance
  const filteredPoints = useMemo(() => {
    const kw = filters.keyword.trim().toLowerCase();

    return allPoints.filter((p) => {
      // 1. Park filter
      if (filters.park !== '全部' && p.park !== filters.park) return false;

      // 2. System filter (if park has systems)
      if (
        systemOptions.length > 0 &&
        filters.system !== '全部' &&
        p.system !== filters.system
      ) {
        return false;
      }

      // 3. Trail filter
      if (filters.trail !== '全部' && p.trail !== filters.trail) return false;

      // 4. List categories filter (multi-select)
      if (filters.selectedLists.length > 0) {
        if (!p.list || !filters.selectedLists.includes(p.list)) {
          return false;
        }
      }

      // 5. Keyword search (point name & trail, case-insensitive, K & k equal)
      if (kw) {
        const pointName = p.point.toLowerCase();
        const trailName = p.trail.toLowerCase();
        if (!pointName.includes(kw) && !trailName.includes(kw)) {
          return false;
        }
      }

      // 6. Signal dBm slider
      if (filters.onlyWithSignal && p.signal_dbm === null) {
        return false;
      }
      if (p.signal_dbm !== null && p.signal_dbm < filters.minSignalDbm) {
        return false;
      }

      return true;
    });
  }, [filters, systemOptions.length]);

  // Determine whether currently filtered dataset contains any signal_dbm
  const hasSignalDataInFiltered = useMemo(() => {
    return filteredPoints.some((p) => p.signal_dbm !== null);
  }, [filteredPoints]);

  // Clear all filters handler
  const handleResetFilters = () => {
    setFilters({
      park: '全部',
      system: '全部',
      trail: '全部',
      selectedLists: [],
      keyword: '',
      minSignalDbm: minPossibleDbm,
      onlyWithSignal: false,
      viewMode: filters.viewMode, // retain view mode
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 font-sans text-stone-900">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Filters Section */}
        <section aria-labelledby="filter-section-title">
          <h2 id="filter-section-title" className="sr-only">
            點位篩選
          </h2>
          <FilterPanel
            filters={filters}
            onFilterChange={setFilters}
            onReset={handleResetFilters}
            allPoints={allPoints}
            filteredPoints={filteredPoints}
            parkOptions={parkOptions}
            systemOptions={systemOptions}
            trailOptions={trailOptions}
            availableListCategories={availableListCategories}
            hasSignalDataInFiltered={hasSignalDataInFiltered}
            minPossibleDbm={minPossibleDbm}
            maxPossibleDbm={maxPossibleDbm}
          />
        </section>

        {/* Results Bar: Counts + View Mode Toggle + Export Button */}
        <section
          className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-3.5 shadow-xs sm:flex-row sm:items-center sm:justify-between"
          aria-label="查詢結果工具列"
        >
          {/* Result Count Summary */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-stone-600">查詢結果：</span>
            <span className="text-base font-bold text-emerald-800">
              符合 {filteredPoints.length} 筆
            </span>
            <span className="text-xs text-stone-400">/ 共 {allPoints.length} 筆</span>
          </div>

          {/* Action Controls: View Switch & CSV Export */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Mode Segmented Control */}
            <div
              className="inline-flex rounded-lg border border-stone-300 bg-stone-50 p-1"
              role="radiogroup"
              aria-label="檢視模式切換"
            >
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, viewMode: 'list' }))}
                className={`min-h-[38px] px-3 text-xs sm:text-sm font-medium rounded-md transition-all flex items-center gap-1.5 ${
                  filters.viewMode === 'list'
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                role="radio"
                aria-checked={filters.viewMode === 'list'}
              >
                <List className="h-4 w-4" />
                <span>清單檢視</span>
              </button>

              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, viewMode: 'map' }))}
                className={`min-h-[38px] px-3 text-xs sm:text-sm font-medium rounded-md transition-all flex items-center gap-1.5 ${
                  filters.viewMode === 'map'
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                role="radio"
                aria-checked={filters.viewMode === 'map'}
              >
                <MapIcon className="h-4 w-4" />
                <span>地圖檢視</span>
              </button>
            </div>

            {/* CSV Export Button */}
            <button
              type="button"
              onClick={() => exportToCsv(filteredPoints)}
              disabled={filteredPoints.length === 0}
              className="min-h-[44px] px-3.5 text-xs sm:text-sm font-medium rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 active:bg-emerald-950 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 shadow-xs"
              aria-label={`匯出目前 ${filteredPoints.length} 筆篩選結果為 CSV 檔`}
            >
              <Download className="h-4 w-4" />
              <span className="hidden xs:inline">匯出</span>
              <span>CSV</span>
            </button>
          </div>
        </section>

        {/* Result Content: List or Map View */}
        <section aria-label="點位查詢結果">
          {filters.viewMode === 'list' ? (
            <ListView points={filteredPoints} />
          ) : (
            <MapView points={filteredPoints} />
          )}
        </section>

        {/* Informative SEO and Crawlable Content Section */}
        <AboutSection points={allPoints} />
      </main>

      <Footer />
    </div>
  );
}
