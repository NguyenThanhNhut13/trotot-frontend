/**
 * Định dạng giá tiền thành định dạng tiền tệ VND
 * @param price - Giá tiền dưới dạng chuỗi hoặc số
 * @param showSuffix - Hiển thị hậu tố "/tháng" hay không (mặc định: true)
 * @returns Chuỗi đã định dạng
 */
export const formatCurrency = (price: string | number, showSuffix = true): string => {
  // Nếu là chuỗi, trích xuất giá trị số từ chuỗi
  if (typeof price === 'string') {
    // Tách số từ chuỗi, loại bỏ tất cả ký tự không phải số
    const numericValue = price.replace(/[^\d]/g, '');
    
    // Nếu chuỗi không chứa số hợp lệ, trả về giá trị gốc
    if (!numericValue || isNaN(Number(numericValue))) {
      return price;
    }
    
    price = Number(numericValue);
  }
  
  // Định dạng số thành tiền tệ VND
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(price);
  
  // Thêm hậu tố "/tháng" nếu showSuffix = true
  return showSuffix ? `${formattedPrice}/tháng` : formattedPrice;
};

/**
 * Định dạng diện tích
 * @param area - Diện tích (số)
 * @returns Chuỗi đã định dạng, ví dụ "25 m²"
 */
export const formatArea = (area: number | string): string => {
  if (typeof area === 'string' && !isNaN(Number(area))) {
    area = Number(area);
  }
  
  if (typeof area === 'number') {
    return `${area} m²`;
  }
  
  return `${area}`;
};

/**
 * Chuyển đổi số thành định dạng có dấu phân cách
 * @param num - Số cần định dạng
 * @returns Chuỗi đã định dạng với dấu phân cách hàng nghìn
 */
export const formatNumber = (num: number | string): string => {
  if (typeof num === 'string') {
    num = Number(num.replace(/[^\d.-]/g, ''));
  }
  
  if (isNaN(num)) return '0';
  
  return new Intl.NumberFormat('vi-VN').format(num);
};