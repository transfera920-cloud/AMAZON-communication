export interface CommunicationPoint {
  id: number;
  park: string;
  system: string | null;
  trail: string;
  point: string;
  lat: number;
  lng: number;
  twd97_x: number;
  twd97_y: number;
  signal_dbm: number | null;
  list: string | null;
  coord_warning: string | null;
}

export interface FilterState {
  park: string; // '全部' or specific park name
  system: string; // '全部' or specific system
  trail: string; // '全部' or specific trail
  selectedLists: string[]; // Selected list categories
  keyword: string; // Search keyword
  minSignalDbm: number; // Slider minimum dBm
  onlyWithSignal: boolean; // Only show items with signal_dbm
  viewMode: 'list' | 'map';
}
