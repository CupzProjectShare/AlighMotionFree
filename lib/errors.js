function friendlyApiError(raw) {
  if (!raw) return 'permintaan gagal.'
  const s = String(raw)
  if (/invalid|unauthori[sz]ed|api key/i.test(s)) return 'API key atau data permintaan tidak valid.'
  if (/expired|oob.*expired/i.test(s)) return 'link sudah kedaluwarsa. minta link baru.'
  if (/already.*used|used.*code/i.test(s)) return 'link sudah pernah digunakan.'
  if (/not found|tidak ditemukan/i.test(s)) return 'data tidak ditemukan.'
  if (/timeout|timed out/i.test(s)) return 'server API tidak merespons tepat waktu.'
  return s
}
module.exports = { friendlyApiError }
