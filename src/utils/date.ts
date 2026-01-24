/**
 * Utilidades para manejo de fechas consistentes en toda la aplicación.
 * Se estandariza el uso de la zona horaria de Caracas para evitar desfases
 * entre el cliente (local) y el servidor (UTC).
 */

/**
 * Retorna la fecha actual en formato YYYY-MM-DD (ISO local de Caracas).
 * Evita el salto de día que ocurre con .toISOString() después de las 8:00 PM (UTC-4).
 */
export const getTodayDate = (): string => {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Caracas",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());
};

/**
 * Formatea una fecha para visualización (ej: "16 de enero, 2026").
 */
export const formatDisplayDate = (date: string | Date): string => {
    const d = typeof date === "string" ? new Date(date + "T12:00:00") : date;
    return d.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

/**
 * Retorna el nombre del día de la semana actual.
 */
export const getDayName = (): string => {
    return new Date().toLocaleDateString("es-ES", { weekday: "long" });
};

/**
 * Resuelve la fecha que debe mostrarse en un reporte basándose en la configuración.
 */
export const getResolvedReportDate = (creationDate: string | Date): string => {
    const useCustom = localStorage.getItem("useCustomReportDate") === "true";
    const customValue = localStorage.getItem("customReportDate");

    if (useCustom && customValue) {
        return formatDisplayDate(customValue);
    }
    return formatDisplayDate(creationDate);
};
