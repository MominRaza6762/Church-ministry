export const toYYYYMMDD = (d) => {
  const date = d instanceof Date ? d : new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const parseLocalDate = (d) => {
  if (d instanceof Date) return d;
  if (typeof d === "string" && d.length === 10) {
    const [y, m, day] = d.split("-").map(Number);
    return new Date(y, m - 1, day); 
  }
  return new Date(d);
};

export const weekdayLong = (d) => {
  const date = parseLocalDate(d);
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[date.getDay()];
};

export const monthLong = (d) => {
  const date = parseLocalDate(d);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return months[date.getMonth()];
};

export const friendlyDate = (d) => {
  const date = parseLocalDate(d);
  return `${weekdayLong(date)}, ${monthLong(date)} ${date.getDate()}, ${date.getFullYear()}`;
};