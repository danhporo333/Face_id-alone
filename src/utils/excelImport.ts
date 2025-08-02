import xlsx from "xlsx";

/**
 * Đọc file Excel và ánh xạ cột không phân biệt hoa thường
 * @param filePath Đường dẫn file
 * @param columnMap Map tên cột Excel => tên field trong DB
 */
export function parseExcelFile<T>(
  filePath: string,
  columnMap: Record<string, string>
): T[] {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawData = xlsx.utils.sheet_to_json<any>(worksheet);

  return rawData.map((row: any) => {
    const mapped: any = {};
    Object.keys(row).forEach((col) => {
      const key = col.trim().toLowerCase();
      const dbField = columnMap[key];
      if (dbField) mapped[dbField] = row[col];
    });
    return mapped;
  });
}
