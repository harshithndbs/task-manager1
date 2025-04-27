// src/contexts/SettingsContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';

interface Settings {
  darkMode: boolean;
  language: 'en' | 'es' | 'fr';
  notificationsEnabled: boolean;
  defaultView: 'all' | 'pending' | 'completed';
}

type SettingsContextType = {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
};

const defaultSettings: Settings = {
  darkMode: false,
  language: 'en',
  notificationsEnabled: true,
  defaultView: 'all',
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const storedSettings = localStorage.getItem('task-manager-settings');
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    }
    
    // Apply dark mode if enabled
    if (settings.darkMode) {
      document.body.classList.add('dark');
    }
  }, []);

  // Update settings
  const updateSettings = (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('task-manager-settings', JSON.stringify(updatedSettings));
    
    // Apply dark mode changes
    if (newSettings.darkMode !== undefined) {
      if (newSettings.darkMode) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;