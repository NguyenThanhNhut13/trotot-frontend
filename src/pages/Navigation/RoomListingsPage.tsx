"use client"

import { useParams } from 'react-router-dom'
import RoomSearchPage from './RoomSearchPage'

// Ánh xạ từ category slug đến roomType
const categoryToRoomTypeMap: Record<string, "APARTMENT" | "WHOLE_HOUSE" | "BOARDING_HOUSE" | null> = {
  'phong-tro': 'BOARDING_HOUSE',
  'nha-nguyen-can': 'WHOLE_HOUSE', 
  'can-ho': 'APARTMENT',
  'tat-ca': null
}

// Ánh xạ từ category slug đến title hiển thị
const categoryToTitleMap: Record<string, string> = {
  'phong-tro': 'NHÀ TRỌ, PHÒNG TRỌ',
  'nha-nguyen-can': 'NHÀ NGUYÊN CĂN',
  'can-ho': 'CĂN HỘ CHUNG CƯ',
  'tat-ca': 'TẤT CẢ DANH MỤC'
}

/**
 * Trang hiển thị danh sách phòng trọ dựa trên loại phòng được chọn từ URL
 * Sử dụng component RoomSearchPage để hiển thị kết quả tìm kiếm
 */
const RoomListingsPage = () => {
  // Lấy category slug từ URL params
  const { categorySlug = 'tat-ca' } = useParams<{ categorySlug: string }>()
  
  // Xác định roomType dựa trên category slug
  const roomType = categoryToRoomTypeMap[categorySlug as keyof typeof categoryToRoomTypeMap] || null
  
  // Xác định title hiển thị
  const title = categoryToTitleMap[categorySlug as keyof typeof categoryToTitleMap] || 'TẤT CẢ DANH MỤC'
  
  // Chỉ cho phép thay đổi loại phòng khi đang ở trang "tất cả"
  const allowTypeChange = categorySlug === 'tat-ca'
  
  return (
    <RoomSearchPage 
      roomType={roomType} 
      title={title}
      allowTypeChange={allowTypeChange} 
    />
  )
}

export default RoomListingsPage