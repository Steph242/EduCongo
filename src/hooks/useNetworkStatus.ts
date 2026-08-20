import { useState, useEffect } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  effectiveType?: string;
  rtt?: number;
  downlink?: number;
  lastChanged: Date;
  isSimulatedOffline: boolean;
}

export function useNetworkStatus() {
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(() => {
    try {
      return localStorage.getItem('educongo_simulated_offline') === 'true';
    } catch {
      return false;
    }
  });

  const [isRealOnline, setIsRealOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const [lastChanged, setLastChanged] = useState<Date>(new Date());
  const [networkInfo, setNetworkInfo] = useState<{
    effectiveType?: string;
    rtt?: number;
    downlink?: number;
  }>({});

  useEffect(() => {
    const handleOnline = () => {
      setIsRealOnline(true);
      setLastChanged(new Date());
    };

    const handleOffline = () => {
      setIsRealOnline(false);
      setLastChanged(new Date());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Read NetworkInformation API if available
    const nav = navigator as any;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    if (connection) {
      const updateConnectionInfo = () => {
        setNetworkInfo({
          effectiveType: connection.effectiveType,
          rtt: connection.rtt,
          downlink: connection.downlink,
        });
      };
      updateConnectionInfo();
      connection.addEventListener('change', updateConnectionInfo);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        connection.removeEventListener('change', updateConnectionInfo);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleSimulateOffline = () => {
    setIsSimulatedOffline((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('educongo_simulated_offline', String(next));
      } catch {}
      setLastChanged(new Date());
      return next;
    });
  };

  const isEffectiveOnline = !isSimulatedOffline && isRealOnline;

  return {
    isOnline: isEffectiveOnline,
    isRealOnline,
    isSimulatedOffline,
    toggleSimulateOffline,
    lastChanged,
    networkInfo,
  };
}
