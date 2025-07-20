export function getLocalizedValue(data, key, locale) {
    const localizedKey = `${key}_${locale}`;
    const fallbackKey = `${key}_ky`; // Fallback to Kyrgyz if localized value is not found
    
    return data?.[localizedKey] || data?.[fallbackKey] || null;
}