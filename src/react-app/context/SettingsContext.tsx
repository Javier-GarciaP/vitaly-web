import React, { createContext, useContext, useState, useEffect } from 'react';

interface Settings {
    footerText: string;
    useCustomReportDate: boolean;
    customReportDate: string;
}

interface SettingsContextType {
    settings: Settings;
    updateSettings: (newSettings: Partial<Settings>) => void;
    saveSettings: () => void;
    getResolvedDate: (creationDate: string | Date) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings>(() => {
        return {
            footerText: localStorage.getItem("reportFooterText") || "© 2024 Laboratorio Clínico - Todos los derechos reservados",
            useCustomReportDate: localStorage.getItem("useCustomReportDate") === "true",
            customReportDate: localStorage.getItem("customReportDate") || new Date().toISOString().split('T')[0],
        };
    });

    const updateSettings = (newSettings: Partial<Settings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const saveSettings = () => {
        localStorage.setItem("reportFooterText", settings.footerText);
        localStorage.setItem("useCustomReportDate", String(settings.useCustomReportDate));
        localStorage.setItem("customReportDate", settings.customReportDate);
    };

    // Auto-save whenever settings change to ensure "Global State" persistence
    useEffect(() => {
        saveSettings();
    }, [settings]);

    const getResolvedDate = (creationDate: string | Date): string => {
        // If it looks like it's already a formatted long date (e.g. contains " de "), return as is
        if (typeof creationDate === "string" && creationDate.includes(" de ")) {
            return creationDate;
        }

        if (settings.useCustomReportDate && settings.customReportDate) {
            const d = new Date(settings.customReportDate + "T12:00:00");
            if (!isNaN(d.getTime())) {
                return d.toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                });
            }
        }

        // Fallback to creation date
        const d = typeof creationDate === "string" ? new Date(creationDate + "T12:00:00") : creationDate;

        // Final safety check
        if (!d || isNaN(new Date(d).getTime())) {
            return new Date().toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
            });
        }

        return d.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, saveSettings, getResolvedDate }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
