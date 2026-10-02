import { FilterState } from '../types.ts';

export function parseFiltersFromUrl(defaultMinDbm: number): Partial<FilterState> {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const result: Partial<FilterState> = {};

  if (params.has('park')) result.park = params.get('park')!;
  if (params.has('system')) result.system = params.get('system')!;
  if (params.has('trail')) result.trail = params.get('trail')!;
  if (params.has('list')) {
    const listStr = params.get('list');
    result.selectedLists = listStr ? listStr.split(',').filter(Boolean) : [];
  }
  if (params.has('q')) result.keyword = params.get('q')!;
  if (params.has('min_dbm')) {
    const val = Number(params.get('min_dbm'));
    if (!isNaN(val)) result.minSignalDbm = val;
  }
  if (params.has('only_signal')) result.onlyWithSignal = params.get('only_signal') === '1';
  if (params.has('view')) {
    const v = params.get('view');
    if (v === 'list' || v === 'map') result.viewMode = v;
  }

  return result;
}

export function syncFiltersToUrl(filters: FilterState, defaultMinDbm: number): void {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams();

  if (filters.park && filters.park !== '全部') params.set('park', filters.park);
  if (filters.system && filters.system !== '全部') params.set('system', filters.system);
  if (filters.trail && filters.trail !== '全部') params.set('trail', filters.trail);
  if (filters.selectedLists.length > 0) params.set('list', filters.selectedLists.join(','));
  if (filters.keyword.trim()) params.set('q', filters.keyword.trim());
  if (filters.minSignalDbm !== defaultMinDbm) params.set('min_dbm', String(filters.minSignalDbm));
  if (filters.onlyWithSignal) params.set('only_signal', '1');
  if (filters.viewMode !== 'map') params.set('view', filters.viewMode);

  const newSearch = params.toString();
  const currentUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '');
  window.history.replaceState(null, '', currentUrl);
}
