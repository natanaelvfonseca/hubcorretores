export function sanitizeCurrencyEditingValue(value: string) {
  return value.replace(/[^\d,.-]/g, "");
}

export function formatCurrencyInputBRL(value: string) {
  const sanitized = sanitizeCurrencyEditingValue(value).trim();
  if (!sanitized) return "";

  if (/[.,]/.test(sanitized)) {
    const normalized = sanitized.replace(/\./g, "").replace(",", ".");
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) {
      return parsed.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  }

  const digits = sanitized.replace(/\D/g, "");
  if (!digits) return "";

  return Number(digits).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function getCurrencyEditingValue(value: string) {
  if (!value) return "";

  if (/[.,]/.test(value)) {
    const normalized = value.replace(/\./g, "").replace(",", ".");
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) {
      return String(Math.trunc(parsed));
    }
  }

  return value.replace(/\D/g, "");
}
