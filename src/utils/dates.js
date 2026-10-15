const pad = (n) => String(n).padStart(2, "0");
export const parseLocalDate = (str) => {
  if (!str) return new Date(0);
  const [ano, mes, dia] = String(str).slice(0, 10).split("-").map(Number);
  return new Date(ano, mes - 1, dia);
};

export const toISODateLocal = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const hojeISO = () => toISODateLocal(new Date());

export const formatDateBR = (str) => {
  if (!str) return "";
  const d = parseLocalDate(str);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

export const diasAte = (str) => {
  if (!str) return null;
  const alvo = parseLocalDate(str);
  const agora = new Date();
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  return Math.round((alvo - hoje) / 86400000);
};