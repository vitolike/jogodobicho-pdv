export const BICHOS = [
  ["Avestruz", "01-04", "🪶"], ["Águia", "05-08", "🦅"], ["Burro", "09-12", "🐴"],
  ["Borboleta", "13-16", "🦋"], ["Cachorro", "17-20", "🐕"], ["Cabra", "21-24", "🐐"],
  ["Carneiro", "25-28", "🐏"], ["Camelo", "29-32", "🐪"], ["Cobra", "33-36", "🐍"],
  ["Coelho", "37-40", "🐇"], ["Cavalo", "41-44", "🐎"], ["Elefante", "45-48", "🐘"],
  ["Galo", "49-52", "🐓"], ["Gato", "53-56", "🐈"], ["Jacaré", "57-60", "🐊"],
  ["Leão", "61-64", "🦁"], ["Macaco", "65-68", "🐒"], ["Porco", "69-72", "🐖"],
  ["Pavão", "73-76", "🦚"], ["Peru", "77-80", "🦃"], ["Touro", "81-84", "🐂"],
  ["Tigre", "85-88", "🐅"], ["Urso", "89-92", "🐻"], ["Veado", "93-96", "🦌"],
  ["Vaca", "97-00", "🐄"],
] as const;

export function grupoDaDezena(numero: number) {
  const dezena = numero % 100;
  return dezena === 0 ? 25 : Math.ceil(dezena / 4);
}
