# 國家公園登山步道・手機通訊點位查詢

本專案由「**[亞馬遜國家山岳協會](https://amazon-hike.com/)**」維護與發布，為登山山友提供玉山國家公園、雪霸國家公園與太魯閣國家公園登山步道之手機通訊點位彙整、WGS84／TWD97 座標查詢、互動式地圖瀏覽與 CSV 匯出功能。

---

## 專案架構與檔案說明

```
.
├── index.html                 # 繁體中文網頁進入點與 SEO Meta 標籤設定
├── package.json               # 專案相依套件與建置指令
├── vite.config.ts             # Vite 設定（設定 base: './' 確保靜態部署無誤）
├── tsconfig.json              # TypeScript 編譯設定
├── src/
│   ├── main.tsx               # React 根節點渲染進入點
│   ├── index.css              # Tailwind CSS 與 Leaflet 樣式調校
│   ├── App.tsx                # 主應用程式邏輯、篩選器協同與視圖狀態管理
│   ├── types.ts               # 資料型別定義（CommunicationPoint, FilterState）
│   ├── data/
│   │   └── communication_points.json  # 494 筆國家公園通訊點位原始資料庫
│   ├── components/
│   │   ├── Header.tsx         # 頁首品牌標題與亞馬遜國家山岳協會超連結
│   │   ├── Footer.tsx         # 頁尾安全聲明、免責叮嚀與版權宣告
│   │   ├── FilterPanel.tsx    # 國家公園、步道系統、步道、清單、dBm與關鍵字篩選面板
│   │   ├── ListView.tsx       # 依國家公園與步道分組之響應式卡片清單、座標複製與展開
│   │   └── MapView.tsx        # Leaflet + OpenStreetMap 圓點標記地圖與圖例
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
啟動後於瀏覽器開啟 `http://localhost:3000` 即可預覽。

### 3. 本機建置測試
```bash
npm run build
```
建置輸出檔案將產生於 `dist/` 資料夾中。

---

## Cloudflare Pages 部署設定

本專案為 100% 純前端靜態網站（Vite + React + TypeScript），無任何後端或伺服器端路由，非常適合直接部署至 Cloudflare Pages：

1. 將本專案推送（Push）至 GitHub 儲存庫。
2. 登入 **Cloudflare Dashboard**，進入 **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**。
3. 選取該專案儲存庫，並設定以下建置參數：
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. 於 **Environment variables (環境變數)** 中新增：
   - `NODE_VERSION`: `20`
5. 點擊 **Save and Deploy**，即可自動完成建置並獲取全域 CDN 網址。

---

## 注意事項與安全叮嚀
- 本站通訊點位資料彙整自各國家公園管理處公開巡測與牌示資料。
- 山區通訊狀況受地形屏蔽、植被密度、氣候天候、電信業者頻段與手機天線性能影響甚大，**切勿將手機訊號作為唯一的聯絡或求救依賴**。
- 登高山請務必攜帶衛星通訊定位設備（如 Garmin inReach）、實體指北針、紙本地圖，並預先下載離線航跡圖。
