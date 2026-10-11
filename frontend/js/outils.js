// Protège le texte injecté dans le HTML (équivalent de la protection automatique de React)
export function echapper(valeur) {
  return String(valeur ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// 255000 -> "255 000 Ar"
export function argent(valeur) {
  return Number(valeur).toLocaleString("fr-FR") + " Ar";
}
