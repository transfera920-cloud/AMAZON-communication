import { CommunicationPoint } from '../types.ts';

export function exportToCsv(points: CommunicationPoint[]): void {
  const headers = [
    '國家公園',
    '步道系統',
    '步道名稱',
    '點位名稱',
    '緯度',
    '經度',
    'TWD97 X',
    'TWD97 Y',
    '訊號強度',
    '清單類別',
    '座標備註',
  ];

  const escapeCsv = (str: string | number | null | undefined): string => {
    if (str === null || str === undefined) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = points.map((p) => [
    escapeCsv(p.park),
    escapeCsv(p.system ?? ''),
    escapeCsv(p.trail),
    escapeCsv(p.point),
    escapeCsv(p.lat.toFixed(6)),
    escapeCsv(p.lng.toFixed(6)),
    escapeCsv(p.twd97_x),
    escapeCsv(p.twd97_y),
    escapeCsv(p.signal_dbm !== null ? `${p.signal_dbm} dBm` : ''),
    escapeCsv(p.list ?? ''),
    escapeCsv(p.coord_warning ?? ''),
  ]);

  const csvContent =
    '\uFEFF' +
    [headers.map((h) => `"${h}"`).join(','), ...rows.map((r) => r.join(','))].join(
      '\r\n'
    );

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const now = new Date();
  const dateStr =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `國家公園登山步道手機通訊點位_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
