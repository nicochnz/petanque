'use client';

import { useEffect, useState } from 'react';

declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  }

  interface Window {
    deferredPWAInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

const isStandalone = () => {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as NavigatorWithStandalone;
  return window.matchMedia('(display-mode: standalone)').matches || !!nav.standalone;
};

export default function PwaInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    if (isStandalone()) {
      return;
    }

    const stored = window.localStorage.getItem('pwa-install-dismissed');
    const hasDismissed = stored === 'true';

    const handler = (event: Event) => {
      event.preventDefault();
      window.deferredPWAInstallPrompt = event as BeforeInstallPromptEvent;
      setCanInstall(true);
      if (!hasDismissed) {
        setShowPopup(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as EventListener);
    };
  }, []);

  const doInstall = async () => {
    const promptEvent = window.deferredPWAInstallPrompt;
    if (!promptEvent) return;

    promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    window.deferredPWAInstallPrompt = null;
    setShowPopup(false);
    if (choice.outcome === 'dismissed') {
      window.localStorage.setItem('pwa-install-dismissed', 'true');
    }
  };

  if (!canInstall) return null;

  return (
    <>
      {showPopup && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-5 max-w-sm w-full mx-4">
            <h2 className="text-base font-semibold mb-2">Installer l&apos;application</h2>
            <p className="text-sm text-gray-600 mb-4">
              Voulez-vous installer cette application sur votre téléphone pour un accès plus rapide&nbsp;?
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 cursor-pointer"
                onClick={() => {
                  setShowPopup(false);
                  window.localStorage.setItem('pwa-install-dismissed', 'true');
                }}
              >
                Non, merci
              </button>
              <button
                className="px-3 py-1.5 text-sm rounded-lg bg-primary text-white cursor-pointer hover:bg-primary-dark"
                onClick={doInstall}
              >
                Oui, installer
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={doInstall}
        className="fixed bottom-4 right-4 z-[9999] px-3 py-2 rounded-full bg-primary text-white text-xs shadow-lg cursor-pointer hover:bg-primary-dark"
      >
        Installer l&apos;app
      </button>
    </>
  );
}

