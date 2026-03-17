import { useCallback, useEffect, useState } from "react";

export interface DisplaySettings {
  showDistributionPercent: boolean;
}

const STORAGE_KEY = "glitchbomb-display";

const DEFAULT_SETTINGS: DisplaySettings = {
  showDistributionPercent: false,
};

function loadSettings(): DisplaySettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: DisplaySettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function useDisplaySettings() {
  const [settings, setSettings] = useState<DisplaySettings>(loadSettings);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const setShowDistributionPercent = useCallback((show: boolean) => {
    setSettings((prev) => ({ ...prev, showDistributionPercent: show }));
  }, []);

  return {
    displaySettings: settings,
    setShowDistributionPercent,
  };
}
