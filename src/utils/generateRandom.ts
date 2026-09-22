/**
 * Generate a random number or string
 * @param type - "number" or "string"
 * @param length - length of the string (ignored for number unless max provided)
 * @param min - minimum number (for number type)
 * @param max - maximum number (for number type)
 */
export function generateRandom(type: "string", length: number = 8): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
