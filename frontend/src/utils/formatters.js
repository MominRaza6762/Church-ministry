export const minutesToHhmm = (min) => {
  const m = Number(min) || 0;
  const h = Math.floor(m / 60);
  const r = m - h * 60;
  const hh = String(h).padStart(2, "0");
  const mm = String(r).padStart(2, "0");
  return `${hh}:${mm}`;
};

export const currency = (n) => {
  const num = Number(n) || 0;
  return `${num.toFixed(2)}`;
};