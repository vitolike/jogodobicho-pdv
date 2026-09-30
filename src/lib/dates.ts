const OFFSET = 3;

export function brasiliaDay(data: string) {
  // ponytail: offset fixo; trocar por Temporal quando o Brasil voltar a adotar horário de verão.
  const inicio = new Date(`${data}T${String(OFFSET).padStart(2, "0")}:00:00.000Z`);
  const fim = new Date(inicio);
  fim.setUTCDate(fim.getUTCDate() + 1);
  return { inicio, fim };
}

export function hojeBrasilia() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}
