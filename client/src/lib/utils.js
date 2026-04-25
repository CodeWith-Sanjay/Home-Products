export function cn(...inputs) {
  return inputs
    .filter(Boolean)
    .map((input) => String(input).trim())
    .join(" ");
}
