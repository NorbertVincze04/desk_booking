export function normalizeLevel(level) {
  const safe = String(level || "").toLowerCase();

  if (safe === "error" || safe === "critical") {
    return "critical";
  }

  if (safe === "warning" || safe === "high") {
    return "high";
  }

  if (safe === "note" || safe === "moderate" || safe === "medium") {
    return "moderate";
  }

  if (safe === "low") {
    return "low";
  }

  return "info";
}

export function securitySeverityToLevel(securitySeverityValue) {
  const num = Number.parseFloat(String(securitySeverityValue || "0"));

  if (!Number.isFinite(num)) {
    return "moderate";
  }

  if (num >= 9.0) {
    return "critical";
  }

  if (num >= 7.0) {
    return "high";
  }

  if (num >= 4.0) {
    return "moderate";
  }

  if (num > 0.0) {
    return "low";
  }

  return "info";
}
