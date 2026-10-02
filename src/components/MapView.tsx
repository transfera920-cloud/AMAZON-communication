import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CommunicationPoint } from '../types.ts';
import { MapPin, Layers } from 'lucide-react';

interface MapViewProps {
  points: CommunicationPoint[];
}

// Colors for parks (classic outdoor palette)
const PARK_COLORS: Record<string, string> = {
  玉山國家公園: '#059669', // Emerald
  雪霸國家公園: '#0284c7', // Sky Blue
  太魯閣國家公園: '#d97706', // Amber
};

const DEFAULT_COLOR = '#4b5563';

export const MapView: React.FC<MapViewProps> = ({ points }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize map and tile layer choices
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        preferCanvas: true, // High performance for rendering points
        center: [23.85, 121.05],
        zoom: 8,
        zoomControl: true,
      });

      const transparent1x1 =
        'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

      // 1. OpenStreetMap
      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> 貢獻者',
        maxZoom: 19,
        errorTileUrl: transparent1x1,
      });

      // 2. 臺灣通用電子地圖 (NLSC)
      const emapLayer = L.tileLayer(
        'https://wmts.nlsc.gov.tw/wmts/EMAP/default/GoogleMapsCompatible/{z}/{y}/{x}',
        {
          attribution:
            '&copy; <a href="https://maps.nlsc.gov.tw/" target="_blank" rel="noopener noreferrer">國土測繪圖資服務雲</a>',
          maxZoom: 19,
          errorTileUrl: transparent1x1,
        }
      );

      // 3. Esri 衛星空照圖
      const satelliteLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution:
            '&copy; <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri, Maxar</a>',
          maxZoom: 18,
          errorTileUrl: transparent1x1,
        }
      );

      // 4. OpenTopoMap 等高線地形圖
      const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://opentopomap.org" target="_blank" rel="noopener noreferrer">OpenTopoMap</a>',
        maxZoom: 17,
        errorTileUrl: transparent1x1,
      });

      // Default active base layer: 臺灣通用電子地圖 (若載入失敗亦可切換至 OSM)
      emapLayer.addTo(map);

      // Layer switcher control
      const baseMaps = {
        '臺灣通用電子地圖': emapLayer,
        'OpenStreetMap 街圖': osmLayer,
        '衛星空照圖': satelliteLayer,
        '等高線地形圖': topoLayer,
      };

      L.control
        .layers(baseMaps, undefined, {
          position: 'topleft',
          collapsed: true,
        })
        .addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;

      // Invalidate size once DOM layout is settled
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        layerGroupRef.current = null;
      }
    };
  }, []);

  // Update markers when points change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    if (points.length === 0) return;

    const bounds: L.LatLngTuple[] = [];

    points.forEach((pt) => {
      const parkColor = PARK_COLORS[pt.park] || DEFAULT_COLOR;

      // Render dot markers using L.circleMarker with canvas
      const marker = L.circleMarker([pt.lat, pt.lng], {
        radius: 6,
        fillColor: parkColor,
        color: '#ffffff',
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.88,
      });

      // Construct popup content
      const googleMapsUrl = `https://www.google.com/maps?q=${pt.lat.toFixed(6)},${pt.lng.toFixed(6)}`;
      const signalHtml =
        pt.signal_dbm !== null
          ? `<div style="font-size:12px;color:#047857;margin-top:2px;font-weight:600;">📶 訊號：${pt.signal_dbm} dBm</div>`
          : '';

      const popupContent = `
        <div style="font-family:system-ui,-apple-system,sans-serif;max-width:240px;line-height:1.4;">
          <div style="font-size:11px;color:#6b7280;margin-bottom:2px;">${pt.park} ${pt.system ? `· ${pt.system}` : ''}</div>
          <div style="font-size:14px;font-weight:700;color:#111827;margin-bottom:2px;">${pt.point}</div>
          <div style="font-size:12px;color:#4b5563;">步道：${pt.trail}</div>
          ${signalHtml}
          <div style="font-size:11px;color:#6b7280;margin-top:4px;font-family:monospace;">
            ${pt.lat.toFixed(6)}, ${pt.lng.toFixed(6)}
          </div>
          <div style="margin-top:8px;">
            <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:4px 8px;background:#059669;color:#ffffff;text-decoration:none;border-radius:4px;font-size:11px;font-weight:600;">
              在 Google 地圖開啟 ↗
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.addTo(layerGroup);
      bounds.push([pt.lat, pt.lng]);
    });

    if (bounds.length > 0) {
      try {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      } catch {
        // Fallback
      }
    }
  }, [points]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xs">
      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        className="h-[62vh] min-h-[480px] w-full z-0 bg-[#e7e5e4]"
        aria-label="手機通訊點位互動地圖"
      />

      {/* Floating Legend */}
      <div className="absolute top-3 right-3 z-[1000] rounded-lg border border-stone-200/90 bg-white/95 p-3 shadow-md backdrop-blur-xs text-xs text-stone-700">
        <h4 className="font-bold text-stone-900 mb-2 border-b border-stone-100 pb-1">
          國家公園圖例
        </h4>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full shrink-0 border border-white shadow-xs"
              style={{ backgroundColor: PARK_COLORS['玉山國家公園'] }}
            />
            <span className="font-medium">玉山國家公園</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full shrink-0 border border-white shadow-xs"
              style={{ backgroundColor: PARK_COLORS['雪霸國家公園'] }}
            />
            <span className="font-medium">雪霸國家公園</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full shrink-0 border border-white shadow-xs"
              style={{ backgroundColor: PARK_COLORS['太魯閣國家公園'] }}
            />
            <span className="font-medium">太魯閣國家公園</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-stone-100 text-[10px] text-stone-400 flex items-center gap-1">
          <Layers className="h-3 w-3" />
          <span>左上角可切換圖層</span>
        </div>
      </div>

      {/* Empty State Overlay */}
      {points.length === 0 && (
        <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-white/80 backdrop-blur-xs p-6 text-center">
          <MapPin className="h-10 w-10 text-stone-400 mb-2" />
          <p className="text-base font-bold text-stone-800">目前篩選無可顯示之地圖點位</p>
          <p className="text-xs text-stone-500 mt-1">請調整篩選器以載入點位資料</p>
        </div>
      )}
    </div>
  );
};
