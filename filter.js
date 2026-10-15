/**
 * Lọc sản phẩm — hàm thuần, dễ test (T11, T12).
 * Không phân biệt hoa/thường và dấu tiếng Việt:
 *   "ca phe" khớp "Cà phê sữa đá".
 */
window.BL = window.BL || {};

/** "Cà phê sữa" → "ca phe sua" */
BL.normalizeText = function (s) {
  return String(s == null ? '' : s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // bỏ dấu tổ hợp
    .replace(/đ/g, 'd')              // đ không tách được bằng NFD
    .trim();
};

/**
 * @param {Array} products  danh sách sản phẩm
 * @param {string} q        từ khóa tìm (có thể rỗng)
 * @param {string} category danh mục ('' hoặc 'all' = Tất cả)
 * @returns {Array} giao của hai điều kiện lọc
 */
BL.filterProducts = function (products, q, category) {
  var kw = BL.normalizeText(q);
  var cat = category && category !== 'all' ? category : '';
  return (products || []).filter(function (p) {
    var okCat = !cat || p.category === cat;
    var okQ = !kw || BL.normalizeText(p.name).indexOf(kw) !== -1;
    return okCat && okQ;
  });
};

/** Danh sách danh mục duy nhất (giữ thứ tự xuất hiện). */
BL.collectCategories = function (products) {
  var seen = {};
  var out = [];
  (products || []).forEach(function (p) {
    if (p.category && !seen[p.category]) {
      seen[p.category] = true;
      out.push(p.category);
    }
  });
  return out;
};
