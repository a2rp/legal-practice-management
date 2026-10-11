export const formatCurrency = (amount) => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
}).format(Number(amount) || 0);

export const formatDate = (value, options = { month: "short", day: "numeric", year: "numeric" }) => {
    if (!value) return "Not set";
    const date = new Date(`${value}T12:00:00`);
    return new Intl.DateTimeFormat("en-US", options).format(date);
};

export const formatToday = () => new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
}).format(new Date());

export const createId = (prefix) => {
    const suffix = globalThis.crypto?.randomUUID?.().slice(0, 8) ?? Math.random().toString(36).slice(2, 10);
    return `${prefix}-${suffix.toUpperCase()}`;
};

export const downloadCsv = (filename, rows) => {
    if (!rows.length) return false;
    const quote = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = rows.map((row) => row.map(quote).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    return true;
};
