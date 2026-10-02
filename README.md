# 國家公園登山步道・手機通訊點位查詢

本專案由「**[亞馬遜國家山岳協會](https://amazon-hike.com/)**」維護與發布，正式發布網址為 `https://amazon-hike.com/tool25/`。為廣大登山山友提供玉山國家公園、雪霸國家公園與太魯閣國家公園登山步道之手機通訊點位彙整、WGS84／TWD97 座標查詢、互動式多圖層地圖瀏覽與 CSV 匯出功能。

---

## 專案架構與檔案說明

```
.
├── index.html                 # 繁體中文網頁進入點、完整 SEO Meta、Canonical 與 JSON-LD 結構化資料
├── package.json               # 專案相依套件與 "build": "vite build"
├── vite.config.ts             # Vite 設定（base: '/tool25/', outDir: 'dist/tool25'）
├── tsconfig.json              # TypeScript 編譯設定
├── public/
│   ├── robots.txt             # 搜尋引擎檢索指令與 Sitemap 路徑
│   └── sitemap.xml            # Sitemap 網站地圖
├── src/
│   ├── main.tsx               # React 根節點渲染進入點
│   ├── index.css              # Tailwind CSS 與 Leaflet 樣式調校
│   ├── App.tsx                # 主應用程式邏輯、篩選器協同與視圖狀態管理
│   ├── types.ts               # 資料型別定義（CommunicationPoint, FilterState）
│   ├── data/
│   │   └── communication_points.json  # 494 筆國家公園通訊點位原始資料庫
│   ├── components/
│   │   ├── Header.tsx         # 頁首品牌標題與同網域內部超連結
│   │   ├── Footer.tsx         # 頁尾安全聲明、免責叮嚀與同網域內部超連結
│   │   ├── FilterPanel.tsx    # 國家公園、步道系統、步道、清單、dBm與關鍵字篩選面板
│   │   ├── ListView.tsx       # 依國家公園與步道分組之響應式卡片清單、座標複製與展開
│   │   ├── MapView.tsx        # Leaflet 互動地圖（支援臺灣通用電子地圖、OSM、衛星、等高線多圖層）
│   │   └── AboutSection.tsx   # 供爬蟲與山友索引之語意化內容（工具簡介、動態涵蓋範圍、使用方式、FAQ、延伸閱讀）
│   └── utils/
│       ├── csvExport.ts       # UTF-8 BOM 格式 CSV 匯出（支援 Excel 中文不亂碼）
│       └── urlParams.ts       # 篩選條件與 URL Query String 即時雙向同步
└── README.md                  # 專案說明與部署指南
```

---

## 本機開發與執行

### 1. 安裝相依套件
請確認本機已安裝 Node.js (建議 v20 以上)：
```bash
npm install
```

### 2. 啟動本機開發伺服器
```bash
npm run dev
```
啟動後於瀏覽器開啟 `http://localhost:3000/tool25/` 即可預覽。

### 3. 本機建置測試
```bash
npm run build
```
建置輸出檔案將產生於 `dist/tool25/` 資料夾中（包含 `dist/tool25/index.html` 與 `dist/tool25/assets/`）。

---

## Cloudflare Pages / 子目錄部署設定

本專案為 100% 純前端靜態網站（Vite + React + TypeScript），無任何後端或伺服器端路由：

- **子目錄基礎路徑**：`base: '/tool25/'`
- **建置輸出資料夾**：`dist/tool25`
- **靜態檔案輸出**：`dist/tool25/index.html`、`dist/tool25/assets/`、`dist/tool25/sitemap.xml`、`dist/tool25/robots.txt`

---

## 注意事項與安全叮嚀
- 本站通訊點位資料彙整自各國家公園管理處公開巡測與牌示資料。
- 山區通訊狀況受地形屏蔽、植被密度、氣候天候、電信業者頻段與手機天線性能影響甚大，**切勿將手機訊號作為唯一的聯絡或求救依賴**。
- 登高山請務必攜帶衛星通訊定位設備（如 Garmin inReach）、實體指北針、紙本地圖，並預先下載離線航跡圖。
