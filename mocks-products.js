/**
 * Dữ liệu mock cho Task 3: 20 sản phẩm
 *   - 15 món nước (Cà phê 4, Trà 4, Đá xay 4, Nước ép 3)
 *   - 5 món ăn vặt
 * Trong đó có 1 món stock = 0 để demo trạng thái "Hết hàng".
 */
window.BL = window.BL || {};

BL.MOCK_PRODUCTS = [
  // — Cà phê (4) —
  { id: 1, name: 'Cà phê sữa đá', price: 29000, imageUrl: 'https://winci.com.vn/wp-content/uploads/2023/12/Cach-Pha-Ca-Phe-Sua-Da-Sai-Gon-Tuyet-Dinh-2023.jpg', stock: 40, category: 'Cà phê', emoji: '☕' },
  { id: 2, name: 'Cà phê đen đá', price: 25000, imageUrl: 'ca-phe-den-da.jpg', stock: 32, category: 'Cà phê', emoji: '🖤' },
  { id: 3, name: 'Bạc xỉu', price: 32000, imageUrl: 'https://1shop.vn/datafiles/38/2023-08/37010212-bac-xiu-2-105200.jpg', stock: 28, category: 'Cà phê', emoji: '🥛' },
  { id: 4, name: 'Cà phê cốt dừa', price: 35000, imageUrl: 'https://lypham.vn/wp-content/uploads/2024/09/ca-phe-cot-dua.jpg', stock: 24, category: 'Cà phê', emoji: '🥥' },
  // — Trà (4) —
  { id: 5, name: 'Trà đào cam sả', price: 39000, imageUrl: 'https://horecavn.com/wp-content/uploads/2024/05/huong-dan-cong-thuc-tra-dao-cam-sa-hut-khach-ngon-kho-cuong_20240526180655.jpg', stock: 35, category: 'Trà', emoji: '🍑' },
  { id: 6, name: 'Trà sữa trân châu', price: 36000, imageUrl: null, stock: 45, category: 'Trà', emoji: '🧋' },
  { id: 7, name: 'Trà vải hoa hồng', price: 42000, imageUrl: null, stock: 18, category: 'Trà', emoji: '🌹' },
  { id: 8, name: 'Trà chanh muối', price: 33000, imageUrl: null, stock: 0,  category: 'Trà', emoji: '🍋' }, // hết hàng
  // — Đá xay (4) —
  { id: 9,  name: 'Đá xay caramel', price: 45000, imageUrl: null, stock: 22, category: 'Đá xay', emoji: '🥤' },
  { id: 10, name: 'Đá xay socola', price: 47000, imageUrl: null, stock: 20, category: 'Đá xay', emoji: '🍫' },
  { id: 11, name: 'Sinh tố bơ', price: 42000, imageUrl: null, stock: 15, category: 'Đá xay', emoji: '🥑' },
  { id: 12, name: 'Sinh tố dâu tây', price: 44000, imageUrl: null, stock: 12, category: 'Đá xay', emoji: '🍓' },
  // — Nước ép (3) —
  { id: 13, name: 'Nước cam ép', price: 30000, imageUrl: null, stock: 50, category: 'Nước ép', emoji: '🍊' },
  { id: 14, name: 'Nước ép dưa hấu', price: 32000, imageUrl: null, stock: 26, category: 'Nước ép', emoji: '🍉' },
  { id: 15, name: 'Soda bạc hà', price: 35000, imageUrl: null, stock: 30, category: 'Nước ép', emoji: '🌿' },
  // — Ăn vặt (5) —
  { id: 16, name: 'Bánh tráng nướng', price: 25000, imageUrl: null, stock: 17, category: 'Ăn vặt', emoji: '🫓' },
  { id: 17, name: 'Khoai lang chiên', price: 30000, imageUrl: null, stock: 21, category: 'Ăn vặt', emoji: '🍠' },
  { id: 18, name: 'Gỏi cuốn (2 cuốn)', price: 32000, imageUrl: null, stock: 19, category: 'Ăn vặt', emoji: '🥬' },
  { id: 19, name: 'Gà rán giòn', price: 49000, imageUrl: null, stock: 14, category: 'Ăn vặt', emoji: '🍗' },
  { id: 20, name: 'Bánh mì nướng bơ', price: 22000, imageUrl: null, stock: 25, category: 'Ăn vặt', emoji: '🥖' },
];
