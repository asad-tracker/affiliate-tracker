function isValidUuid(str) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

function sanitize(str, maxLength = 255) {
  if (!str) return null;
  return String(str)
    .replace(/[<>'"`;]/g, '')
    .trim()
    .slice(0, maxLength);
}

function isValidSlug(slug) {
  return /^[a-f0-9]{8,16}$/.test(slug);
}

function isValidPayout(payout) {
  const num = parseFloat(payout);
  return !isNaN(num) && num >= 0 && num <= 99999;
}

function isValidDate(str) {
  if (!str) return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(str)) return false;
  const date = new Date(str);
  return date instanceof Date && !isNaN(date);
}

function isValidDateRange(from, to) {
  if (!isValidDate(from) || !isValidDate(to)) return false;
  return new Date(from) <= new Date(to);
}

module.exports = {
  isValidUuid,
  sanitize,
  isValidSlug,
  isValidPayout,
  isValidDate,
  isValidDateRange,
};  