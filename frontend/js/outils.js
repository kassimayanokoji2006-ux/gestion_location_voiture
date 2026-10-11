export function echapper(valeur) {
  return String(valeur ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function argent(valeur) {
  return Number(valeur).toLocaleString("fr-FR") + " Ar";
}