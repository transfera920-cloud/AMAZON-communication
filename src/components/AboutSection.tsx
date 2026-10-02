import React, { useMemo } from 'react';
import { CommunicationPoint } from '../types.ts';
import { Compass, BookOpen, HelpCircle, MapPin, CheckCircle2 } from 'lucide-react';

interface AboutSectionProps {
  points: CommunicationPoint[];
}

export const AboutSection: React.FC<AboutSectionProps> = ({ points }) => {
  // Dynamically compute points and unique trails count for each national park
  const parkStats = useMemo(() => {
    const stats: Record<string, { pointsCount: number; trails: Set<string> }> = {};

    points.forEach((p) => {
      if (!stats[p.park]) {
        stats[p.park] = { pointsCount: 0, trails: new Set() };
      }
      stats[p.park].pointsCount += 1;
      if (p.trail) {
        stats[p.park].trails.add(p.trail);
      }
    });

    return Object.entries(stats).map(([name, data]) => ({
      name,
      pointsCount: data.pointsCount,
      trailsCount: data.trails.size,
    }));
  }, [points]);

  const totalPoints = points.length;
  const totalTrails = useMemo(() => {
    const allTrails = new Set<string>();
    points.forEach((p) => {
      if (p.trail) allTrails.add(`${p.park}__${p.trail}`);
    });
    return allTrails.size;
  }, [points]);

  return (
    <section
      aria-labelledby="about-tool-heading"
      className="mt-12 rounded-xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs space-y-8 text-stone-800"
    >
      {/* 1. 工具簡介 */}
      <div>
        <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-700 text-white">
            <Compass className="h-4 w-4" aria-hidden="true" />
          </span>
          <h2 id="about-tool-heading" className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
            工具簡介
          </h2>
        </div>
        <p className="mt-4 text-sm sm:text-base leading-relaxed text-stone-700">
          「國家公園登山步道・手機通訊點位查詢」是專為台灣登山者與山友打造的行前通訊規劃輔助工具。登山者可在出發前依據目標國家公園、步道系統、步道名稱、清單類別、訊號強度（dBm）與地名關鍵字進行多維度篩選。系統不僅整合了 OpenStreetMap、臺灣通用電子地圖與衛星空照等多元圖資的互動地圖檢視，更清楚標註每一點位之 WGS84 經緯度與台灣常用 TWD97 二度分帶座標，並支援一鍵複製座標至剪貼簿與匯出標準 CSV 試算表，方便山友將關鍵通訊座標匯入 GPS 導航裝置或離線地圖中。
        </p>
      </div>

      {/* 2. 涵蓋範圍（動態計算） */}
      <div>
        <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-700 text-white">
            <MapPin className="h-4 w-4" aria-hidden="true" />
          </span>
          <h2 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
            涵蓋範圍
          </h2>
        </div>
        <p className="mt-3 text-sm text-stone-600">
          目前系統彙整之登山通訊資料共涵蓋全台三大高山型國家公園，合計收錄 {totalPoints} 處經實測或設有通訊標示牌之點位，涵蓋 {totalTrails} 條熱門與百岳縱走登山路線：
        </p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {parkStats.map((park) => (
            <div
              key={park.name}
              className="rounded-lg border border-stone-200 bg-stone-50 p-4 transition-colors hover:border-emerald-600/40"
            >
              <h3 className="text-base font-bold text-stone-900">{park.name}</h3>
              <div className="mt-2 space-y-1 text-sm text-stone-600">
                <p>
                  收錄點位：<strong className="text-emerald-800 font-semibold">{park.pointsCount}</strong> 處
                </p>
                <p>
                  涵蓋步道：<strong className="text-stone-800 font-semibold">{park.trailsCount}</strong> 條
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. 使用方式 */}
      <div>
        <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-700 text-white">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          </span>
          <h2 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
            使用方式
          </h2>
        </div>
        <ol className="mt-4 space-y-3 text-sm sm:text-base text-stone-700 list-decimal list-inside pl-1">
          <li className="leading-relaxed">
            <strong className="text-stone-900">選取行程園區與步道：</strong>
            於頁面上方點選欲前往的國家公園（如玉山、雪霸或太魯閣），接著於下拉選單選取步道系統或特定路線，或直接輸入點位名稱（例如「排雲山莊」、「黑水塘」）即時檢索。
          </li>
          <li className="leading-relaxed">
            <strong className="text-stone-900">切換地圖或清單檢視：</strong>
            利用工具列切換「地圖檢視」了解點位在山脈稜線的地理分佈與通訊覆蓋帶，或切換至「清單檢視」查閱完整座標與路標里程資訊。
          </li>
          <li className="leading-relaxed">
            <strong className="text-stone-900">備份座標或匯入導航：</strong>
            點選卡片上的「複製座標」即可取得 WGS84 十進位度數（支援直接貼入 Google 地圖或 Garmin 裝置），亦可點擊「匯出 CSV」下載整條路線通訊點清單以供離線查閱。
          </li>
          <li className="leading-relaxed">
            <strong className="text-stone-900">行前通報與留守機制：</strong>
            登山前將預計行經的可通訊點位與預估抵達時間列入登山計畫書，並交付留守人，以便在指定點位向山下回報平安。
          </li>
        </ol>
      </div>

      {/* 4. 常見問題 */}
      <div>
        <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-700 text-white">
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
          </span>
          <h2 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
            常見問題
          </h2>
        </div>
        <div className="mt-4 space-y-3">
          <details className="group rounded-lg border border-stone-200 bg-stone-50 p-4 open:bg-white transition-colors">
            <summary className="cursor-pointer text-base font-semibold text-stone-900 flex items-center justify-between">
              <span>什麼是國家公園登山步道手機通訊點位？</span>
              <span className="ml-2 text-stone-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-3 text-sm text-stone-600 leading-relaxed">
              通訊點位係指經國家公園管理處或電信業者現場巡檢測試，確認在特定地理座標或步道里程標示牌處具備行動通訊訊號（至少能接收 1 格以上微弱訊號或進行簡訊／語音通話）之地點。管理處亦常於步道現場合適開闊處設置「手機通訊點標示牌」，供山友辨識。
            </p>
          </details>

          <details className="group rounded-lg border border-stone-200 bg-stone-50 p-4 open:bg-white transition-colors">
            <summary className="cursor-pointer text-base font-semibold text-stone-900 flex items-center justify-between">
              <span>TWD97 座標與 WGS84 座標差在哪裡？</span>
              <span className="ml-2 text-stone-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-3 text-sm text-stone-600 leading-relaxed">
              WGS84 為全球通用之衛星定位座標系統，採用經緯度十進位度表示（如 23.475793, 120.900170），常見於智慧型手機、Google 地圖與各式航行軟體。TWD97 則為台灣官方採用之橫麥卡托二度分帶投影平面直角座標（單位為公尺，包含 X 橫座標與 Y 縱座標），為台灣公部門搜救、紙本地圖網格及專業測量時不可或缺的基準座標。
            </p>
          </details>

          <details className="group rounded-lg border border-stone-200 bg-stone-50 p-4 open:bg-white transition-colors">
            <summary className="cursor-pointer text-base font-semibold text-stone-900 flex items-center justify-between">
              <span>訊號強度（dBm）數值如何解讀？</span>
              <span className="ml-2 text-stone-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-3 text-sm text-stone-600 leading-relaxed">
              dBm（毫瓦分貝）是測量行動通訊接收功率強度的物理單位，數值皆為負數。<strong>數值越大（越接近 0）代表訊號強度越佳</strong>。通常高於 -85 dBm 為良好訊號；-90 至 -105 dBm 之間通話或上網基本可用；低於 -115 dBm 則為邊緣微弱訊號，可能僅支援文字簡訊或特定方位才能勉強連線。未標註 dBm 數值之點位係以現場標示牌或巡測紀錄為依據。
            </p>
          </details>

          <details className="group rounded-lg border border-stone-200 bg-stone-50 p-4 open:bg-white transition-colors">
            <summary className="cursor-pointer text-base font-semibold text-stone-900 flex items-center justify-between">
              <span>資料來源為何？資料會定期更新嗎？</span>
              <span className="ml-2 text-stone-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-3 text-sm text-stone-600 leading-relaxed">
              本站資料來源為「國家公園通訊點彙整」。實際通訊覆蓋會因各電信業者後續基地台擴建、天候狀況、林木茂密度及地形遮蔽而有所消長。本站持續彙整公開最新測試資訊以優化圖資精確度。
            </p>
          </details>

          <details className="group rounded-lg border border-stone-200 bg-stone-50 p-4 open:bg-white transition-colors">
            <summary className="cursor-pointer text-base font-semibold text-stone-900 flex items-center justify-between">
              <span>通訊點位是否能作為唯一的山難求救依賴？</span>
              <span className="ml-2 text-stone-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-3 text-sm text-stone-600 leading-relaxed">
              <strong>絕對不行。</strong>通訊點位資訊僅供行前規劃與通訊備查參考，嚴禁作為唯一的聯絡或求救依賴。高山氣候多變，電信基地台與手機電力在惡劣天候或低溫下可能中斷。山友入山務必備妥雙向衛星通訊設備（如 inReach 等）、傳統實體指北針、紙本地圖，並預先下載離線 GPX 航跡檔案，落實自主安全管理。
            </p>
          </details>
        </div>
      </div>

      {/* 5. 延伸閱讀（同分頁開啟） */}
      <div>
        <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-700 text-white">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
          </span>
          <h2 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
            延伸閱讀
          </h2>
        </div>
        <p className="mt-3 text-sm text-stone-600">
          深入了解安全登山技術與野外導航核心知識，推薦閱讀亞馬遜國家山岳協會專題指南：
        </p>
        <ul className="mt-4 space-y-2 text-sm sm:text-base">
          <li>
            <a
              href="https://amazon-hike.com/chapter13/"
              className="text-emerald-800 hover:text-emerald-950 font-medium underline underline-offset-4 decoration-emerald-500/50 hover:decoration-emerald-800 transition-colors"
            >
              完整登山離線 GPX 軌跡載入與實務教學指南
            </a>
            <span className="text-stone-500 text-xs sm:text-sm ml-2">（學習如何將登山航點與 GPX 匯入手機離線地圖導航）</span>
          </li>
          <li>
            <a
              href="https://amazon-hike.com/chapter03/"
              className="text-emerald-800 hover:text-emerald-950 font-medium underline underline-offset-4 decoration-emerald-500/50 hover:decoration-emerald-800 transition-colors"
            >
              登山地圖判讀與野外定位導航實戰指南
            </a>
            <span className="text-stone-500 text-xs sm:text-sm ml-2">（掌握等高線判讀、指北針使用與迷途防範應變原則）</span>
          </li>
        </ul>
      </div>
    </section>
  );
};
