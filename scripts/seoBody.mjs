// 建置時把「國家公園 → 步道」清單寫進首頁 HTML，讓爬蟲不用執行 JavaScript 就能看到內容。
// React 載入後 createRoot 會直接取代 #root 的內容，不影響畫面。
import fs from 'fs';
import path from 'path';

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export function buildSeoBody(rootDir) {
  const file = path.resolve(rootDir, 'src/data/communication_points.json');
  const raw = fs.readFileSync(file, 'utf-8').replace(/^\uFEFF/, '');
  const points = JSON.parse(raw);

  const parks = new Map(); // park -> Map(trail -> count)
  for (const p of points) {
    if (!p.park || !p.trail) continue;
    if (!parks.has(p.park)) parks.set(p.park, new Map());
    const trails = parks.get(p.park);
    trails.set(p.trail, (trails.get(p.trail) || 0) + 1);
  }

  const sections = [...parks.entries()]
    .map(([park, trails]) => {
      const total = [...trails.values()].reduce((a, b) => a + b, 0);
      const items = [...trails.entries()]
        .map(([trail, n]) => `<li>${esc(trail)}（${n} 筆點位）</li>`)
        .join('');
      return `<section><h2>${esc(park)}</h2><p>共 ${total} 筆手機通訊點位，涵蓋 ${trails.size} 條步道。</p><ul>${items}</ul></section>`;
    })
    .join('');

  return (
    '<main id="seo-fallback">' +
    '<nav aria-label="麵包屑"><a href="https://amazon-hike.com/">亞馬遜國家山岳協會</a> › <a href="https://amazon-hike.com/tools">登山工具</a> › 國家公園登山步道手機通訊點位查詢</nav>' +
    '<h1>國家公園登山步道手機通訊點位查詢</h1>' +
    `<p>本工具由亞馬遜國家山岳協會提供，彙整玉山、雪霸、太魯閣國家公園登山步道共 ${points.length} 筆手機通訊點位，提供 WGS84 與 TWD97 座標，供登山山友於出發前進行通訊備查與行前安全規劃。</p>` +
    sections +
    '<p>請開啟瀏覽器 JavaScript 功能，以使用互動式地圖、即時篩選與 CSV 匯出功能。</p>' +
    '</main>'
  );
}
