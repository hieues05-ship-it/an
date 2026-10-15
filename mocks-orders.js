/**
 * Dữ liệu mock cho Task 9: 7 đơn phủ đủ 7 trạng thái.
 * Mới nhất ở đầu mảng. Một đơn (id 4) có item thiếu productName
 * để demo fallback "Sản phẩm #id".
 */
window.BL = window.BL || {};

BL.MOCK_ORDERS = [
  {
    id: 1051, userId: 1, status: 'READY', total: 116000, createdAt: '2026-10-14T09:52:00+07:00',
    items: [
      { id: 1, orderId: 1051, productId: 1,  productName: 'Cà phê sữa đá',   size: 'M', qty: 2, lineTotal: 58000 },
      { id: 2, orderId: 1051, productId: 16, productName: 'Bánh tráng nướng', size: '—', qty: 1, lineTotal: 25000 },
      { id: 3, orderId: 1051, productId: 13, productName: 'Nước cam ép',      size: 'M', qty: 1, lineTotal: 33000 }
    ],
  },
  {
    id: 1050, userId: 1, status: 'PREPARING', total: 81000, createdAt: '2026-10-14T09:31:00+07:00',
    items: [
      { id: 4, orderId: 1050, productId: 6,  productName: 'Trà sữa trân châu', size: 'L', qty: 1, lineTotal: 42000 },
      { id: 5, orderId: 1050, productId: 19, productName: 'Gà rán giòn',       size: '—', qty: 1, lineTotal: 39000 }
    ],
  },
  {
    id: 1049, userId: 1, status: 'PAID', total: 76000, createdAt: '2026-10-14T09:15:00+07:00',
    items: [
      { id: 6, orderId: 1049, productId: 9,  productName: 'Đá xay caramel', size: 'M', qty: 1, lineTotal: 45000 },
      { id: 7, orderId: 1049, productId: 17, productName: 'Khoai lang chiên', size: '—', qty: 1, lineTotal: 31000 }
    ],
  },
  {
    id: 1048, userId: 1, status: 'PENDING', total: 64000, createdAt: '2026-10-14T08:47:00+07:00',
    items: [
      { id: 8,  orderId: 1048, productId: 3,  productName: null,               size: 'M', qty: 1, lineTotal: 32000 }, // thiếu tên → fallback
      { id: 9,  orderId: 1048, productId: 20, productName: 'Bánh mì nướng bơ', size: '—', qty: 1, lineTotal: 22000 },
      { id: 10, orderId: 1048, productId: 15, productName: 'Soda bạc hà',      size: 'M', qty: 1, lineTotal: 10000 }
    ],
  },
  {
    id: 1047, userId: 1, status: 'COMPLETED', total: 123000, createdAt: '2026-10-13T20:05:00+07:00',
    items: [
      { id: 11, orderId: 1047, productId: 10, productName: 'Đá xay socola',  size: 'M', qty: 2, lineTotal: 94000 },
      { id: 12, orderId: 1047, productId: 18, productName: 'Gỏi cuốn (2 cuốn)', size: '—', qty: 1, lineTotal: 29000 }
    ],
  },
  {
    id: 1046, userId: 1, status: 'PAYMENT_FAILED', total: 71000, createdAt: '2026-10-13T10:22:00+07:00',
    items: [
      { id: 13, orderId: 1046, productId: 5,  productName: 'Trà đào cam sả', size: 'L', qty: 1, lineTotal: 45000 },
      { id: 14, orderId: 1046, productId: 14, productName: 'Nước ép dưa hấu', size: 'M', qty: 1, lineTotal: 26000 }
    ],
  },
  {
    id: 1045, userId: 1, status: 'CANCELLED', total: 58000, createdAt: '2026-10-12T15:40:00+07:00',
    items: [
      { id: 15, orderId: 1045, productId: 11, productName: 'Sinh tố bơ', size: 'M', qty: 1, lineTotal: 42000 },
      { id: 16, orderId: 1045, productId: 16, productName: 'Bánh tráng nướng', size: '—', qty: 1, lineTotal: 16000 }
    ],
  },
];
