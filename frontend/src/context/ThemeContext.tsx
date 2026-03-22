import React, { createContext, useContext, useState } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    theme: ThemeMode;
    toggleTheme: () => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const deviceColorScheme = useDeviceColorScheme();
    const [theme, setTheme] = useState<ThemeMode>(deviceColorScheme || 'light');

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    const isDark = theme === 'dark';

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useAppTheme = () => {
    const context = useContext(ThemeContext);
    const deviceColorScheme = useDeviceColorScheme();

    if (context === undefined) {
        const fallbackTheme: ThemeMode = deviceColorScheme === 'dark' ? 'dark' : 'light';
        return {
            theme: fallbackTheme,
            toggleTheme: () => { },
            isDark: fallbackTheme === 'dark',
        };
    }

    return context;
};
