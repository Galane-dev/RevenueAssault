interface CsvExportParams {
    filename: string;
    headers: string[];
    rows: Array<Array<unknown>>;
}

const normalizeCellValue = (value: unknown): string => {
    if (value === null || value === undefined) {
        return "";
    }

    const raw = String(value).replace(/\r?\n|\r/g, " ").trim();
    const safeValue = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
    return `"${safeValue.replace(/"/g, '""')}"`;
};

const buildCsvContent = (headers: string[], rows: Array<Array<unknown>>): string => {
    const headerLine = headers.map((header) => normalizeCellValue(header)).join(",");
    const rowLines = rows.map((row) => row.map((cell) => normalizeCellValue(cell)).join(","));
    return [headerLine, ...rowLines].join("\n");
};

export const exportToCsv = ({ filename, headers, rows }: CsvExportParams): void => {
    const csvContent = buildCsvContent(headers, rows);
    const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
};
