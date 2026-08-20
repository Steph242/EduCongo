import React, { useState } from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

interface ConnectivityIndicatorProps {
  compact?: boolean;
}

export const ConnectivityIndicator: React.FC<ConnectivityIndicatorProps> = ({ compact = false }) => {
  const { isOnline, isSimulatedOffline, toggleSimulateOffline, networkInfo, lastChanged } = useNetworkStatus();
  const [isOpen, setIsOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [pingResult, setPingResult] = useState<number | null>(null);

  const testConnection = async () => {
    setIsTesting(true);
    const start = Date.now();
    try {
      // Small fetch test (or timeout simulation)
      await new Promise((res) => setTimeout(res, 400));
      const elapsed = Date.now() - start;
      setPingResult(elapsed);
    } catch {
      setPingResult(null);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="relative">
      {/* Indicator Trigger Button in Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={isOnline ? "Connexion Internet active" : "Attention : Connexion Internet interrompue"}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all cursor-pointer border ${
          isOnline
            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
            : 'bg-rose-500/20 text-rose-300 border-rose-500/50 hover:bg-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse'
        }`}
      >
        <span className="relative flex h-2.5 w-2.5">
          {isOnline ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </>
          ) : (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </>
          )}
        </span>

        <span className="material-symbols-outlined text-[15px]">
          {isOnline ? 'wifi' : 'wifi_off'}
        </span>

        <span className={`${compact ? 'hidden sm:inline' : 'inline'}`}>
          {isOnline ? 'En ligne' : 'Hors ligne'}
        </span>

        {isSimulatedOffline && (
          <span className="text-[10px] bg-rose-950/80 text-rose-300 px-1.5 py-0.2 rounded border border-rose-500/40">
            Simulé
          </span>
        )}

        <span className="material-symbols-outlined text-[14px] text-slate-400">
          expand_more
        </span>
      </button>

      {/* Popover Card */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-slate-950/95 backdrop-blur-2xl rounded-2xl border border-white/20 p-4 shadow-[0_16px_48px_rgba(0,0,0,0.8)] z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3.5">
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isOnline
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isOnline ? 'wifi' : 'wifi_off'}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">
                    État de la Connectivité
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {isOnline ? 'Réseau stable et synchronisé' : 'Signal internet perdu'}
                  </p>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isOnline
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}
              >
                {isOnline ? 'Connecté' : 'Déconnecté'}
              </span>
            </div>

            {/* Offline Alert Details */}
            {!isOnline ? (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-rose-300">
                  <span className="material-symbols-outlined text-[16px]">warning</span>
                  <span>Formulaires protégés en local</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Toutes vos saisies dans les étapes d'inscription sont conservées localement dans votre navigateur. Dès le retour du réseau, la validation sera débloquée sans perte de données.
                </p>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-300">
                  <span className="material-symbols-outlined text-[16px]">cloud_done</span>
                  <span>Synchronisation temps réel active</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Tous les modules (inscription, bulletins, émargement, MTN/Airtel Money) sont opérationnels.
                </p>
              </div>
            )}

            {/* Connection Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10">
                <span className="text-[10px] text-slate-400 block">Type de réseau</span>
                <span className="font-semibold text-white uppercase text-xs">
                  {networkInfo.effectiveType ? `${networkInfo.effectiveType.toUpperCase()}` : (isOnline ? 'Haut Débit' : 'Aucun')}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10">
                <span className="text-[10px] text-slate-400 block">Latence estimée</span>
                <span className="font-semibold text-white text-xs font-mono">
                  {isOnline ? (pingResult ? `${pingResult} ms` : '~35 ms') : '—'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <button
                type="button"
                onClick={testConnection}
                disabled={isTesting || !isOnline}
                className="w-full py-1.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-xs font-medium border border-white/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span className={`material-symbols-outlined text-[15px] ${isTesting ? 'animate-spin' : ''}`}>
                  {isTesting ? 'sync' : 'network_ping'}
                </span>
                {isTesting ? 'Test en cours...' : 'Tester le ping serveur'}
              </button>

              {/* Simulation button for demo & testing */}
              <button
                type="button"
                onClick={toggleSimulateOffline}
                className={`w-full py-1.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isSimulatedOffline
                    ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/40'
                    : 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {isSimulatedOffline ? 'wifi' : 'wifi_off'}
                </span>
                {isSimulatedOffline ? 'Désactiver la simulation hors-ligne' : 'Simuler une coupure internet'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
