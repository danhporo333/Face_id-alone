/**
 * Validate phone number format
 * Accepts formats:
 * - 0xxxxxxxxx (10 digits)
 * - 84xxxxxxxxx (11 digits)
 */
export const validatePhoneNumber = (phone: string): boolean => {
  // Remove spaces and dashes
  phone = phone.replace(/[\s-]/g, "");

  // Check Vietnamese phone number format
  const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  return phoneRegex.test(phone);
};

/**
 * Validate required string field
 */
export const validateRequired = (value: string, fieldName: string): string => {
  if (!value || value.trim() === "") {
    throw new Error(`${fieldName} không được để trống`);
  }
  return value.trim();
};

/**
 * Validate string length
 */
export const validateLength = (
  value: string,
  fieldName: string,
  maxLength: number
): string => {
  if (value && value.length > maxLength) {
    throw new Error(`${fieldName} không được vượt quá ${maxLength} ký tự`);
  }
  return value;
};

/**
 * Đọc file Excel và ánh xạ cột không phân biệt hoa thường
 * @param filePath Đường dẫn file
 * @param columnMap Map tên cột Excel => tên field trong DB
 */
