import React, { useState, useEffect } from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export const OfflineAlertBanner: React.FC = () => {
  const { isOnline, isSimulatedOffline, toggleSimulateOffline } = useNetworkStatus();
  const [wasOffline, setWasOffline] = useState(false);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setShowRestored(false);
    } else if (wasOffline) {
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
        setWasOffline(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showRestored) {
    return null;
  }

  if (showRestored) {
    return (
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 mb-4 animate-in slide-in-from-top duration-300">
        <div className="bg-emerald-500/20 border border-emerald-500/40 backdrop-blur-xl rounded-2xl p-3 sm:p-4 text-emerald-200 shadow-[0_8px_32px_rgba(16,185,129,0.25)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">cloud_done</span>
            </div>
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-white leading-tight">
                Connexion internet rétablie !
              </h5>
              <p className="text-[11px] text-emerald-300">
                Vos formulaires et données d'inscription sont prêts pour la synchronisation.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowRestored(false)}
            className="text-emerald-400 hover:text-white p-1 rounded-lg hover:bg-emerald-500/20 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 mb-4 animate-in slide-in-from-top duration-300">
      <div className="bg-rose-950/80 border border-rose-500/50 backdrop-blur-2xl rounded-2xl p-3 sm:p-4 text-rose-200 shadow-[0_8px_32px_rgba(244,63,94,0.35)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center flex-shrink-0 animate-pulse">
            <span className="material-symbols-outlined text-[22px]">wifi_off</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h5 className="text-xs sm:text-sm font-bold text-white leading-tight">
                Vous êtes actuellement hors-ligne
              </h5>
              <span className="bg-rose-500/30 text-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-400/30">
                Sauvegarde locale active
              </span>
            </div>
            <p className="text-[11px] text-rose-200/90 mt-0.5">
              Pas d'inquiétude : toutes vos informations de formulaire sont conservées sur votre appareil. Elles seront validées dès que votre connexion reviendra.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {isSimulatedOffline && (
            <button
              type="button"
              onClick={toggleSimulateOffline}
              className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Désactiver simulation
            </button>
          )}
          <span className="flex items-center gap-1 text-[11px] text-slate-400 bg-white/5 px-2.5 py-1 rounded-xl border border-white/10">
            <span className="material-symbols-outlined text-amber-400 text-[14px]">save</span>
            Brouillon sauvegardé
          </span>
        </div>
      </div>
    </div>
  );
};
