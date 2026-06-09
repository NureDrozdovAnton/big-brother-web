export function formatDate(dateStr: string, locale: string): string {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(locale === "uk" ? "uk-UA" : "en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: locale !== "uk",
    }).format(date);
}

export function formatDateShort(dateStr: string, locale: string): string {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(locale === "uk" ? "uk-UA" : "en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
}

export function sortByLocale(a: string, b: string, locale: string): number {
    return a.localeCompare(b, locale === "uk" ? "uk-UA" : "en-US", {
        sensitivity: "base",
        numeric: true,
    });
}

export function exportAsJson(data: unknown, filename: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export function exportAsCsv(rows: Record<string, unknown>[], filename: string) {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
            headers
                .map((h) => {
                    const val = String(row[h] ?? "").replace(/"/g, '""');
                    return `"${val}"`;
                })
                .join(","),
        ),
    ].join("\n");
    const blob = new Blob(["﻿" + csvContent], {
        type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
