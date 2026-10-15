/**
 * Trạng thái đơn — nhãn tiếng Việt + màu.
 * Trạng thái lạ rơi về nhánh mặc định để không crash.
 */
window.BL = window.BL || {};

BL.STATUS_META = {
  PENDING: { label: 'Chờ thanh toán', className: 'is-pending' },
  PAID: { label: 'Đã thanh toán', className: 'is-paid' },
  PREPARING: { label: 'Đang pha chế', className: 'is-preparing' },
  READY: { label: 'Sẵn sàng lấy', className: 'is-ready' },
  COMPLETED: { label: 'Hoàn thành', className: 'is-completed' },
  PAYMENT_FAILED: { label: 'Thanh toán lỗi', className: 'is-failed' },
  CANCELLED: { label: 'Đã hủy', className: 'is-cancelled' },
};

/** Trả về HTML badge an toàn (escape nhãn). */
BL.statusBadge = function (status) {
  var meta = BL.STATUS_META[status] || {
    label: status ? String(status) : 'Không rõ',
    className: 'is-unknown',
  };
  return (
    '<span class="badge ' + meta.className + '">' +
    '<span class="badge-dot" aria-hidden="true"></span>' +
    BL.esc(meta.label) +
    '</span>'
  );
};

/** Số món hiển thị trên thẻ đơn. */
BL.itemCountLabel = function (count) {
  return count + ' món';
};
