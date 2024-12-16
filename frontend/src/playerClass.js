export function getPlayerClass(elo) {
  if (elo >= 2400) return "Grand Maître";
  if (elo >= 2200) return "Maître International";
  if (elo >= 2000) return "Maître FIDE";
  if (elo >= 1800) return "Expert";
  if (elo >= 1600) return "Classe A";
  if (elo >= 1400) return "Classe B";
  if (elo >= 1200) return "Classe C";
  return "Débutant";
}
