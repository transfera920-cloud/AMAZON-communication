import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  CheckCircle2,
  Loader2,
  Download,
  Share,
  Info,
  AlertTriangle,
} from 'lucide-react';

export const OfflineStatus: React.FC = () => {
  const [swSupported] = useState(
    () => typeof window !== 'undefined' && 'serviceWorker' in navigator
  );
  const [isOnline, setIsOnline] = useState(
    () => (typeof navigator !== 'undefined' ? navigator.onLine : true)
  );
  const [isReady, setIsReady] = useState(
    () =>
      typeof navigator !== 'undefined' &&
      'serviceWorker' in navigator &&
      !!navigator.serviceWorker.controller
  );

  // Accordion open state: defaults to true on first visit, then remembered in localStorage
  const [isOpen, setIsOpen] = useState(() => {
    try {
      return localStorage.getItem('tool25_offline_hint_seen') !== '1';
    } catch {
      return true;
    }
  });

  // PWA install prompt state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (!swSupported) return;

    // Check if Service Worker is ready
    navigator.serviceWorker.ready.then(() => {
      if (navigator.serviceWorker.controller) {
        setIsReady(true);
      }
    });

    const handleControllerChange = () => {
      setIsReady(true);
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Detect standalone display mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Mark as seen so future visits default to collapsed
    try {
      if (localStorage.getItem('tool25_offline_hint_seen') !== '1') {
        localStorage.setItem('tool25_offline_hint_seen', '1');
      }
    } catch {
      // Ignore localStorage errors
    }

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [swSupported]);

  // If browser does not support Service Worker, do not display
  if (!swSupported) {
    return null;
  }

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } catch {
      // Ignore install prompt error
    }
  };

  const handleToggle = (e: React.SyntheticEvent<HTMLDetailsElement>) => {
    setIsOpen(e.currentTarget.open);
    try {
      localStorage.setItem('tool25_offline_hint_seen', '1');
    } catch {
      // Ignore localStorage errors
    }
  };

  // Determine current status styling and message
  let statusBg = 'bg-stone-100 border-stone-200 text-stone-700';
  let statusIcon = <Loader2 className="h-4 w-4 animate-spin text-stone-500 shrink-0" />;
  let statusText = '離線功能準備中…請保持連網並稍候';

  if (!isOnline) {
    // Priority: Offline status
    statusBg = 'bg-amber-50 border-amber-200 text-amber-900';
    statusIcon = <WifiOff className="h-4 w-4 text-amber-600 shrink-0" />;
    statusText =
      '目前離線：篩選、清單、座標與 CSV 匯出可正常使用；地圖僅顯示先前瀏覽過的區域底圖';
  } else if (isReady) {
    // Ready for offline use
    statusBg = 'bg-emerald-50 border-emerald-200 text-emerald-900';
    statusIcon = <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />;
    statusText = '✓ 已可離線使用（程式與點位資料已存入此裝置）';
  }

  return (
    <div className="w-full border-b border-stone-200 bg-white">
      {/* 1. Status Bar */}
      <div
        role="status"
        aria-live="polite"
        className={`border-b px-4 py-2 sm:px-6 transition-colors duration-200 ${statusBg}`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-medium leading-tight">
            {statusIcon}
            <span>{statusText}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="shrink-0 text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline underline-offset-2 transition-colors min-h-[36px] flex items-center"
            aria-label="切換查看如何離線使用說明"
          >
            {isOpen ? '收合說明' : '如何離線使用？'}
          </button>
        </div>
      </div>

      {/* 2. Collapsible Offline Instructions (<details>) */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <details
          open={isOpen}
          onToggle={handleToggle}
          className="group border-b border-stone-100 py-3 text-stone-800"
        >
          <summary className="cursor-pointer select-none text-xs sm:text-sm font-semibold text-stone-700 hover:text-emerald-800 transition-colors flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Info className="h-4 w-4 text-emerald-700" />
              如何離線使用？（出發前必看）
            </span>
            <span className="text-xs text-stone-400 group-open:rotate-180 transition-transform">
              ▼
            </span>
          </summary>

          <div className="mt-3 rounded-lg bg-stone-50 border border-stone-200/80 p-4 sm:p-5 text-xs sm:text-sm space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-1.5">
              出發前請先做這三件事
            </h3>

            {/* Three key actions */}
            <ol className="list-decimal list-inside space-y-1.5 text-stone-700 pl-0.5 leading-relaxed">
              <li>
                <strong className="text-stone-900">連網確認就緒：</strong>
                在有網路時開啟本頁，等上方狀態列顯示「<strong>✓ 已可離線使用</strong>」。
              </li>
              <li>
                <strong className="text-stone-900">預先滑動地圖：</strong>
                切換至「地圖檢視」，在地圖上放大、移動瀏覽預定前往的步道與周邊山區（<strong>只有看過的區域，離線時才有底圖</strong>）。
              </li>
              <li>
                <strong className="text-stone-900">安裝至裝置：</strong>
                建議安裝到手機或電腦主畫面，登山期間即使完全無通訊訊號，也能直接單擊開啟。
              </li>
            </ol>

            {/* Key details */}
            <div className="pt-2 border-t border-stone-200/60 space-y-1 text-stone-600 leading-relaxed">
              <p>
                • <strong>離線功能保證：</strong>山區離線時，通訊點位彩色圓點、WGS84／TWD97 座標、關鍵字篩選、清單瀏覽與 CSV 匯出功能皆可完全正常運作；未瀏覽過的地圖區域底圖將顯示為淺灰空白底色。
              </p>
              <p>
                • <strong>網站更新機制：</strong>若後續點位資料有更新，只需重新連上網路開啟本頁兩次，即可取得最新版。
              </p>
            </div>

            {/* Installation guide block */}
            {!isInstalled && (
              <div className="pt-3 border-t border-stone-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-stone-600">
                  <strong className="text-stone-800">安裝指引：</strong>
                  {deferredPrompt && '支援快速安裝，點擊右方按鈕即可加到主畫面。'}
                  {isIOS && 'iOS Safari 請點擊瀏覽器底部的「分享」按鈕（⎋），再選擇「加入主畫面」。'}
                  {!deferredPrompt && !isIOS && '可使用瀏覽器選單中的「安裝」或「加入主畫面」。'}
                </div>

                {deferredPrompt && (
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="min-h-[44px] px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0"
                    aria-label="安裝國家公園登山通訊點位應用程式到此裝置"
                  >
                    <Download className="h-4 w-4" />
                    <span>安裝到此裝置</span>
                  </button>
                )}

                {isIOS && (
                  <div className="inline-flex items-center gap-1 text-xs text-emerald-900 font-semibold bg-emerald-100/70 border border-emerald-200 px-3 py-1.5 rounded-lg shrink-0">
                    <Share className="h-3.5 w-3.5 text-emerald-800" />
                    <span>點下方分享按鈕 → 加入主畫面</span>
                  </div>
                )}
              </div>
            )}

            {/* Safety Reminder */}
            <div className="pt-2 border-t border-stone-200/60 flex items-start gap-1.5 text-xs text-amber-900 bg-amber-50/70 border border-amber-200/80 rounded-md p-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>安全提醒：</strong>離線功能僅協助查詢通訊位置與備查，高山氣候多變，絕對不能取代實體指北針、紙本地圖與雙向衛星通訊設備（如 inReach）。
              </span>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};
