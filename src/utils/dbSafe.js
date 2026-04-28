const ALLOWED_SORT_COLUMNS = {
  clicks:      ['created_at', 'gclid', 'keyword_id', 'device', 'country'],
  conversions: ['created_at', 'payout'],
  campaigns:   ['created_at', 'name', 'country'],
};

function safeSortColumn(table, column, fallback = 'created_at') {
  const allowed = ALLOWED_SORT_COLUMNS[table] || [];
  return allowed.includes(column) ? column : fallback;
}

function safeInt(val, min = 1, max = 1000, fallback = 50) {
  const n = parseInt(val);
  if (isNaN(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

function safePagination(query) {
  return {
    limit:  safeInt(query.limit,  1, 1000, 50),
    offset: safeInt(query.offset, 0, 99999, 0),
  };
}

module.exports = { safeSortColumn, safeInt, safePagination };