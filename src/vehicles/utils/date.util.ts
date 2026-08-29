export function formatDateToString(date: Date | string | null | undefined): string {
    if (!date) return '';
    if (date instanceof Date) {
        return date.toISOString().split("T")[0];
    }
    return String(date).split("T")[0];
}