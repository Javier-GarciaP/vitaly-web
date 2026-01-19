/**
 * Formatea un número a moneda sin decimales y con separador de miles por punto.
 * Ejemplo: 20000 -> 20.000
 */
export const formatCurrency = (value: number | string): string => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "0";

    return new Intl.NumberFormat("de-DE", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
};

/**
 * Limpia un string de formato de moneda para obtener el número puro.
 * Ejemplo: "20.000" -> 20000
 */
export const cleanCurrencyInput = (value: string): string => {
    return value.replace(/\./g, "");
};

/**
 * Formatea un input de texto a medida que el usuario escribe,
 * agregando los puntos de miles y eliminando caracteres no numéricos.
 */
export const formatCurrencyInput = (value: string): string => {
    const cleanValue = value.replace(/\D/g, "");
    if (!cleanValue) return "";
    return formatCurrency(parseInt(cleanValue));
};

/**
 * Convierte un número a su representación en palabras (Español).
 */
export const numberToWords = (num: number): string => {
    const units = ["", "un", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];
    const tens = ["", "diez", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
    const teens = ["diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve"];
    const hundreds = ["", "cien", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];

    if (num === 0) return "cero";
    if (num === 100) return "cien";

    const convertGroup = (n: number): string => {
        let output = "";
        if (n >= 100) {
            output += (n === 100 ? "cien" : (n < 200 ? "ciento" : hundreds[Math.floor(n / 100)])) + " ";
            n %= 100;
        }
        if (n >= 20) {
            output += tens[Math.floor(n / 10)];
            n %= 10;
            if (n > 0) output += " y " + units[n];
        } else if (n >= 10) {
            output += teens[n - 10];
        } else if (n > 0) {
            output += units[n];
        }
        return output.trim();
    };

    let result = "";
    if (num >= 1000000) {
        const millions = Math.floor(num / 1000000);
        result += (millions === 1 ? "un millón" : convertGroup(millions) + " millones") + " ";
        num %= 1000000;
    }
    if (num >= 1000) {
        const thousands = Math.floor(num / 1000);
        result += (thousands === 1 ? "mil" : convertGroup(thousands) + " mil") + " ";
        num %= 1000;
    }
    if (num > 0) {
        result += convertGroup(num);
    }

    return result.trim().toUpperCase() + " PESOS"; // O la moneda que corresponda
};
