"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Card, Button, Row, Col, Form, Dropdown, Spinner, Offcanvas, Badge, Pagination } from "react-bootstrap"
import { Link, useNavigate } from "react-router-dom"
import {
  FaSearch,
  FaMapMarkerAlt,
  FaHeart,
  FaRegHeart,
  FaFilter,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaSortAmountDown,
  FaSortAmountUp,
  FaRuler,
  FaEye,
  FaClock,
  FaHome,
} from "react-icons/fa"
import type { Amenity, Room, RoomSearchParams, SurroundingArea, TargetAudience } from "../../types/room.type"
import roomApi from "../../apis/room.api"
import type { District, Province, Ward } from "../../types/address.type"
import addressAPI from "../../apis/address.api"
import { toast } from "react-toastify"
import { useResponsive } from "../../store/hook"

export interface Listing {
  id: number
  title: string
  price: number
  area: number
  image: string
  location: string
  createdAt?: string
  viewCount?: number
}

interface SelectedFilters {
  area: string
  amenities: string[]
  targetAudiences: string[]
  surroundingAreas: string[]
}

interface SearchRoomPageProps {
  title?: string
  roomType?: "APARTMENT" | "WHOLE_HOUSE" | "BOARDING_HOUSE" | null
  allowTypeChange?: boolean
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalElements: number
  size: number
}

// const priceLabelMap: Record<string, string> = {
//   all: "Tất cả mức giá",
//   "under-1m": "Dưới 1 triệu",
//   "1-10m": "1 - 10 triệu",
//   "10-30m": "10 - 30 triệu",
//   "30-50m": "30 - 50 triệu",
//   "50m-plus": "Trên 50 triệu",
//   "100m-plus": "Trên 100 triệu",
// }

const sortOptions = [
  { value: "createdAt,desc", label: "Mới nhất", icon: FaClock },
  { value: "createdAt,asc", label: "Cũ nhất", icon: FaClock },
  { value: "price,asc", label: "Giá thấp đến cao", icon: FaSortAmountUp },
  { value: "price,desc", label: "Giá cao đến thấp", icon: FaSortAmountDown },
  { value: "area,desc", label: "Diện tích lớn nhất", icon: FaRuler },
  { value: "area,asc", label: "Diện tích nhỏ nhất", icon: FaRuler },
]

const RoomSearchPage = ({
  title = "TẤT CẢ PHÒNG TRỌ",
  roomType = null,
  allowTypeChange = false,
}: SearchRoomPageProps) => {
  const navigate = useNavigate()
  const { isMobile, isTablet } = useResponsive()

  // Pagination state
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 12,
  })

  // Sort state
  const [sortBy, setSortBy] = useState("createdAt,desc")

  // Các state cho dữ liệu và phân trang
  const [listings, setListings] = useState<Listing[]>([])
  const [filteredListings, setFilteredListings] = useState<Listing[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [savedRoomIds, setSavedRoomIds] = useState<number[]>([])

  // State cho việc chọn loại phòng trọ
  const [activeTab, setActiveTab] = useState<"BOARDING_HOUSE" | "WHOLE_HOUSE" | "APARTMENT" | null>(roomType)

  // State cho dữ liệu từ API
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [targetAudiences, setTargetAudiences] = useState<TargetAudience[]>([])
  const [surroundingAreas, setSurroundingAreas] = useState<SurroundingArea[]>([])

  // State cho trạng thái loading và error
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [searchParams, setSearchParams] = useState<any>(null)
  const [filterError, setFilterError] = useState<string | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)

  // State cho việc hiển thị "xem thêm" trong các danh sách filter
  const [showAllAmenities, setShowAllAmenities] = useState(false)

  // State cho bộ lọc
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>(() => {
    const savedFiltersKey = roomType ? `filters_${roomType}` : "filters_all"
    const savedFilters = localStorage.getItem(savedFiltersKey)
    if (savedFilters) {
      try {
        return JSON.parse(savedFilters) as SelectedFilters
      } catch (error) {
        console.error("Error parsing saved filters:", error)
      }
    }
    return {
      area: "",
      amenities: [] as string[],
      targetAudiences: [] as string[],
      surroundingAreas: [] as string[],
    }
  })

  // State cho địa điểm
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [locationError, setLocationError] = useState<string | null>(null)

  const [selectedProvince, setSelectedProvince] = useState<string>("")
  const [selectedDistrict, setSelectedDistrict] = useState<string>("")
  const [selectedWard, setSelectedWard] = useState<string>("")

  // State cho mức giá
  const [priceRange, setPriceRange] = useState("all")
  const [minPriceInput, setMinPriceInput] = useState("")
  const [maxPriceInput, setMaxPriceInput] = useState("")

  const [loading, setLoading] = useState(false)
  const maxRetries = 3

  // Handle save/unsave room
  const handleToggleSave = async (roomId: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const isLoggedIn = localStorage.getItem("accessToken")
    if (!isLoggedIn) {
      toast.info("Vui lòng đăng nhập để lưu phòng trọ")
      return
    }

    try {
      const isSaved = savedRoomIds.includes(roomId)

      if (isSaved) {
        await roomApi.removeFromWishList(roomId)
        setSavedRoomIds((prev) => prev.filter((id) => id !== roomId))
        toast.success("Đã xóa khỏi danh sách yêu thích")
      } else {
        await roomApi.addToWishList(roomId)
        setSavedRoomIds((prev) => [...prev, roomId])
        toast.success("Đã lưu tin thành công")
      }
    } catch (error) {
      console.error("Error updating wishlist:", error)
      toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.")
    }
  }

  // Fetch saved room IDs
  useEffect(() => {
    const fetchSavedRooms = async () => {
      const isLoggedIn = localStorage.getItem("accessToken")
      if (!isLoggedIn) return

      try {
        const response = await roomApi.getSavedRoomIds()
        if (response.data?.data?.roomIds) {
          setSavedRoomIds(response.data.data.roomIds)
        }
      } catch (error) {
        console.error("Error fetching saved rooms:", error)
      }
    }

    fetchSavedRooms()
  }, [])

  // Lưu bộ lọc đã chọn vào localStorage
  useEffect(() => {
    const storageKey = roomType ? `filters_${roomType}` : "filters_all"
    localStorage.setItem(storageKey, JSON.stringify(selectedFilters))
  }, [selectedFilters, roomType])

  // Các tùy chọn diện tích
  const areaOptions = [
    { id: "under20", label: "Dưới 20 m²" },
    { id: "20-40", label: "20-40 m²" },
    { id: "40-60", label: "40-60 m²" },
    { id: "60-80", label: "60-80 m²" },
    { id: "above80", label: "Trên 80 m²" },
  ]

  // Lấy dữ liệu bộ lọc từ API hoặc cache
  const fetchFilters = async (attempt = 1) => {
    setIsLoading(true)
    setFilterError(null)

    const amenitiesLS = localStorage.getItem(`amenities`)
    const targetAudiencesLS = localStorage.getItem(`targetAudiences`)
    const surroundingAreasLS = localStorage.getItem(`surroundingAreas`)

    if (amenitiesLS && targetAudiencesLS && surroundingAreasLS) {
      try {
        setAmenities(JSON.parse(amenitiesLS))
        setTargetAudiences(JSON.parse(targetAudiencesLS))
        setSurroundingAreas(JSON.parse(surroundingAreasLS))
        setIsLoading(false)
        return
      } catch (error) {
        console.error("Error parsing cached data:", error)
      }
    }

    try {
      const [amenitiesResponse, targetAudiencesResponse, surroundingAreasResponse] = await Promise.all([
        roomApi.getAmenities(),
        roomApi.getTargetAudiences(),
        roomApi.getSurroundingAreas(),
      ])

      if (amenitiesResponse.data && amenitiesResponse.data.data) {
        localStorage.setItem(`amenities`, JSON.stringify(amenitiesResponse.data.data))
        setAmenities(amenitiesResponse.data.data)
      }
      if (targetAudiencesResponse.data && targetAudiencesResponse.data.data) {
        localStorage.setItem(`targetAudiences`, JSON.stringify(targetAudiencesResponse.data.data))
        setTargetAudiences(targetAudiencesResponse.data.data)
      }
      if (surroundingAreasResponse.data && surroundingAreasResponse.data.data) {
        localStorage.setItem(`surroundingAreas`, JSON.stringify(surroundingAreasResponse.data.data))
        setSurroundingAreas(surroundingAreasResponse.data.data)
      }
    } catch (error) {
      console.error(`Attempt ${attempt}: Error fetching filters:`, error)
      if (attempt <= maxRetries) {
        const delay = 3000 + (attempt - 1) * 1000
        setTimeout(() => fetchFilters(attempt + 1), delay)
      } else {
        setFilterError("Không thể tải bộ lọc. Vui lòng thử lại sau.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch bộ lọc khi component mount
  useEffect(() => {
    fetchFilters()
  }, [])

  // Lấy danh sách tỉnh/thành phố
  const fetchProvinces = async (attempt = 1) => {
    if (localStorage.getItem("provinces")) {
      const cachedProvinces = localStorage.getItem("provinces")
      if (cachedProvinces) {
        setProvinces(JSON.parse(cachedProvinces) as Province[])
        return
      }
    }

    try {
      setLoading(true)
      setLocationError(null)
      const response = await addressAPI.getProvinces()
      if (response.data && response.data.data && response.data.data.data) {
        setProvinces(response.data.data.data as Province[])
        localStorage.setItem("provinces", JSON.stringify(response.data.data.data as Province[]))
      }
    } catch (error: any) {
      console.error(`Attempt ${attempt}: Error fetching provinces:`, error)
      if (attempt <= maxRetries) {
        setTimeout(() => fetchProvinces(attempt + 1), 3000 * attempt)
      } else if (error.response?.status === 429) {
        setLocationError("Đã vượt quá giới hạn gọi API. Vui lòng thử lại sau.")
        toast.error("Đã vượt quá giới hạn gọi API. Vui lòng chờ và thử lại sau.", {
          autoClose: 5000,
        })
      } else {
        setLocationError("Không thể tải danh sách tỉnh/thành phố. Vui lòng thử lại sau.")
      }
    } finally {
      setLoading(false)
    }
  }

  // Fetch tỉnh/thành phố khi component mount
  useEffect(() => {
    fetchProvinces()
  }, [])

  // Fetch quận/huyện khi chọn tỉnh/thành phố
  const fetchDistricts = async (attempt = 1) => {
    if (!selectedProvince) {
      setDistricts([])
      return
    }

    try {
      setLoading(true)
      setLocationError(null)
      const response = await addressAPI.getDistricts(selectedProvince)
      if (response.data && response.data.data && response.data.data.data) {
        setDistricts(response.data.data.data as District[])
      }
    } catch (error: any) {
      console.error(`Attempt ${attempt}: Error fetching districts:`, error)
      if (attempt <= maxRetries) {
        setTimeout(() => fetchDistricts(attempt + 1), 3000 * attempt)
      } else if (error.response?.status === 429) {
        setLocationError("Đã vượt quá giới hạn gọi API. Vui lòng thử lại sau.")
        toast.error("Đã vượt quá giới hạn gọi API. Vui lòng chờ và thử lại sau.", {
          autoClose: 5000,
        })
      } else {
        setLocationError("Không thể tải danh sách quận/huyện. Vui lòng thử lại sau.")
      }
    } finally {
      setLoading(false)
    }
  }

  // Fetch quận/huyện khi thay đổi tỉnh/thành phố
  useEffect(() => {
    fetchDistricts()
    setSelectedDistrict("")
    setSelectedWard("")
    setWards([])
  }, [selectedProvince])

  // Fetch phường/xã khi chọn quận/huyện
  const fetchWards = async (attempt = 1) => {
    if (!selectedDistrict) {
      setWards([])
      return
    }

    try {
      setLoading(true)
      setLocationError(null)
      const response = await addressAPI.getWards(selectedDistrict)
      if (response.data && response.data.data && response.data.data.data) {
        setWards(response.data.data.data as Ward[])
      }
    } catch (error: any) {
      console.error(`Attempt ${attempt}: Error fetching wards:`, error)
      if (attempt <= maxRetries) {
        setTimeout(() => fetchWards(attempt + 1), 3000 * attempt)
      } else if (error.response?.status === 429) {
        setLocationError("Đã vượt quá giới hạn gọi API. Vui lòng thử lại sau.")
        toast.error("Đã vượt quá giới hạn gọi API. Vui lòng chờ và thử lại sau.", {
          autoClose: 5000,
        })
      } else {
        setLocationError("Không thể tải danh sách phường/xã. Vui lòng thử lại sau.")
      }
    } finally {
      setLoading(false)
    }
  }

  // Fetch phường/xã khi thay đổi quận/huyện
  useEffect(() => {
    fetchWards()
    setSelectedWard("")
  }, [selectedDistrict])

  // Lấy dữ liệu cache nếu có
  useEffect(() => {
    const currentType = roomType || activeTab
    const cacheKey = currentType ? `list${currentType}Pagging` : "listAllRooms"

    const cachedData = localStorage.getItem(cacheKey)
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData)
        setListings(parsedData)
        setFilteredListings(parsedData)
        setPagination((prev) => ({
          ...prev,
          totalElements: parsedData.length,
          totalPages: Math.ceil(parsedData.length / prev.size),
        }))
      } catch (error) {
        console.error("Error parsing cached data:", error)
      }
    }
  }, [roomType, activeTab])

  // Nếu có search params trong localStorage thì thực hiện tìm kiếm
  useEffect(() => {
    const params = localStorage.getItem("searchParams")
    if (params) {
      try {
        const parsedParams = JSON.parse(params)
        setSearchParams(parsedParams)
        if (!roomType || !parsedParams.roomType || parsedParams.roomType === roomType) {
          performSearch(parsedParams, 0)
        }
      } catch (error) {
        console.error("Error parsing search params:", error)
      }
    } else if (roomType) {
      performSearch({ roomType }, 0)
    } else if (activeTab) {
      performSearch({ roomType: activeTab }, 0)
    } else {
      performSearch({}, 0)
    }
  }, [roomType, activeTab])

  // Xử lý khi chọn tab khác (chỉ dùng khi allowTypeChange=true)
  const handleTabChange = (newRoomType: "BOARDING_HOUSE" | "WHOLE_HOUSE" | "APARTMENT" | null) => {
    setActiveTab(newRoomType)
    setPagination((prev) => ({ ...prev, currentPage: 0 }))

    if (searchParams) {
      const newParams = { ...searchParams, roomType: newRoomType }
      performSearch(newParams, 0)
    } else {
      performSearch({ roomType: newRoomType }, 0)
    }
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }))

    const currentType = roomType || activeTab
    const searchParamsToUse = searchParams || (currentType ? { roomType: currentType } : {})

    performSearch(searchParamsToUse, page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Handle sort change
  const handleSortChange = (newSort: string) => {
    setSortBy(newSort)
    setPagination((prev) => ({ ...prev, currentPage: 0 }))

    const currentType = roomType || activeTab
    const searchParamsToUse = searchParams || (currentType ? { roomType: currentType } : {})

    performSearch(searchParamsToUse, 0, newSort)
  }

  // Reset location selections
  const resetLocationSelections = () => {
    setSelectedProvince("")
    setSelectedDistrict("")
    setSelectedWard("")
  }

  // Xử lý basic search
  const handleSearch = () => {
    const currentRoomType = roomType || activeTab
    const searchParams: any = currentRoomType ? { roomType: currentRoomType } : {}

    if (selectedProvince) {
      const provinceName = provinces.find((p) => p.code === selectedProvince)?.name
      searchParams.province = provinceName
    }
    if (selectedDistrict) {
      const districtName = districts.find((d) => d.code === selectedDistrict)?.name
      searchParams.district = districtName
    }
    if (selectedWard) {
      const wardName = wards.find((w) => w.code === selectedWard)?.name
      searchParams.ward = wardName
    }
    if (priceRange && priceRange !== "all") {
      switch (priceRange) {
        case "under-1m":
          searchParams.maxPrice = 1000000
          break
        case "1-10m":
          searchParams.minPrice = 1000000
          searchParams.maxPrice = 10000000
          break
        case "10-30m":
          searchParams.minPrice = 10000000
          searchParams.maxPrice = 30000000
          break
        case "30-50m":
          searchParams.minPrice = 30000000
          searchParams.maxPrice = 50000000
          break
        case "50m-plus":
          searchParams.minPrice = 50000000
          break
        case "100m-plus":
          searchParams.minPrice = 100000000
          break
      }
    } else if (minPriceInput || maxPriceInput) {
      if (minPriceInput) {
        searchParams.minPrice = Number.parseFloat(minPriceInput) * 1000000
      }
      if (maxPriceInput) {
        searchParams.maxPrice = Number.parseFloat(maxPriceInput) * 1000000
      }
    }
    if (searchTerm) {
      searchParams.query = searchTerm
    }

    setPagination((prev) => ({ ...prev, currentPage: 0 }))
    performSearch(searchParams, 0)

    if (isMobile) {
      setShowFilters(false)
    }
  }

  // Reset tất cả bộ lọc
  const resetList = () => {
    setSearchTerm("")
    setPriceRange("all")
    setMinPriceInput("")
    setMaxPriceInput("")
    resetLocationSelections()
    setSelectedFilters({
      area: "",
      amenities: [],
      targetAudiences: [],
      surroundingAreas: [],
    })
    setSearchParams(null)
    setSortBy("createdAt,desc")
    localStorage.removeItem("searchParams")

    const currentType = roomType || activeTab
    setPagination((prev) => ({ ...prev, currentPage: 0 }))

    const cacheKey = currentType ? `list${currentType}Pagging` : "listAllRooms"
    const cachedData = localStorage.getItem(cacheKey)

    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData)
        setListings(parsedData)
        setFilteredListings(parsedData)
        setPagination((prev) => ({
          ...prev,
          totalElements: parsedData.length,
          totalPages: Math.ceil(parsedData.length / prev.size),
        }))
      } catch (error) {
        console.error("Error parsing cached data:", error)
        performSearch(currentType ? { roomType: currentType } : {}, 0)
      }
    } else {
      performSearch(currentType ? { roomType: currentType } : {}, 0)
    }

    if (isMobile) {
      setShowFilters(false)
    }
  }

  // Xử lý advanced search (có thêm các bộ lọc phức tạp)
  const handleSearchAdvanced = () => {
    filterListings(searchTerm, selectedFilters)

    if (isMobile) {
      setShowFilters(false)
    }
  }

  // Xử lý API search với pagination và sorting
  const performSearch = async (params: any, page = 0, sort: string = sortBy, attempt = 1) => {
    setIsSearching(true)
    setSearchError(null)

    try {
      const searchRoomParams: RoomSearchParams = {
        page: page,
        size: pagination.size,
        sort: sort,
      }

      if (params.roomType) {
        searchRoomParams.roomType = params.roomType
      } else if (roomType) {
        searchRoomParams.roomType = roomType
      }

      if (params.query) searchRoomParams.street = params.query
      if (params.province) searchRoomParams.city = params.province
      if (params.district) searchRoomParams.district = params.district
      if (params.minPrice !== undefined) searchRoomParams.minPrice = params.minPrice
      if (params.maxPrice !== undefined) searchRoomParams.maxPrice = params.maxPrice
      if (params.areaRange || (selectedFilters.area && params.roomType)) {
        const areaRange =
          params.areaRange ||
          (() => {
            switch (selectedFilters.area) {
              case "under20":
                return "0-20"
              case "20-40":
                return "20-40"
              case "40-60":
                return "40-60"
              case "60-80":
                return "60-80"
              case "above80":
                return "80-999"
              default:
                return ""
            }
          })()

        if (areaRange) {
          searchRoomParams.areaRange = areaRange
        }
      }

      const response = await roomApi.searchRooms(searchRoomParams)
      if (response.data && response.data.data) {
        const { content, totalElements, totalPages, size, page } = response.data.data

        const transformedListings = content.map((item: Room) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          area: item.area,
          image: item.imageUrls[0],
          location: `${item.district}, ${item.province}`,
          createdAt: item.createdAt,
          viewCount: Math.floor(Math.random() * 100) + 10,
        }))

        setListings(transformedListings)
        setFilteredListings(transformedListings)
        setPagination({
          currentPage: typeof page !== "undefined" ? page : 0,
          totalPages: totalPages,
          totalElements: totalElements,
          size: size,
        })

        if (Object.keys(params).length > 0) {
          localStorage.setItem("searchParams", JSON.stringify(params))
          setSearchParams(params)
        }
      }
    } catch (error: any) {
      console.error(`Attempt ${attempt}: Error searching rooms:`, error)
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers["retry-after"] || 5
        setSearchError("Đã vượt quá giới hạn gọi API. Vui lòng thử lại sau.")
        toast.error(`Đã vượt quá giới hạn gọi API. Vui lòng chờ ${retryAfter} giây và thử lại.`, {
          autoClose: retryAfter * 1000,
        })
      } else if (attempt <= maxRetries) {
        setTimeout(() => performSearch(params, page, sort, attempt + 1), 3000 * attempt)
      } else {
        setSearchError("Không thể tìm kiếm phòng. Vui lòng thử lại sau.")
      }
    } finally {
      setIsSearching(false)
    }
  }

  // Xử lý tìm kiếm theo từ khóa
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    filterListings(e.target.value, selectedFilters)
  }

  // Xử lý các toggle filter
  const setAreaFilter = (areaId: string) => {
    setSelectedFilters((prev: SelectedFilters) => {
      const newArea = prev.area === areaId ? "" : areaId
      const newFilters = { ...prev, area: newArea }
      filterListings(searchTerm, newFilters)
      return newFilters
    })
  }

  const toggleAmenityFilter = (amenityId: string) => {
    setSelectedFilters((prev: SelectedFilters) => {
      const newAmenities = prev.amenities.includes(amenityId)
        ? prev.amenities.filter((id) => id !== amenityId)
        : [...prev.amenities, amenityId]
      const newFilters = { ...prev, amenities: newAmenities }
      filterListings(searchTerm, newFilters)
      return newFilters
    })
  }

  const toggleTargetAudienceFilter = (audienceId: string) => {
    setSelectedFilters((prev: SelectedFilters) => {
      const newTargetAudiences = prev.targetAudiences.includes(audienceId)
        ? prev.targetAudiences.filter((id) => id !== audienceId)
        : [...prev.targetAudiences, audienceId]
      const newFilters = { ...prev, targetAudiences: newTargetAudiences }
      filterListings(searchTerm, newFilters)
      return newFilters
    })
  }

  const toggleSurroundingAreaFilter = (areaId: string) => {
    setSelectedFilters((prev: SelectedFilters) => {
      const newSurroundingAreas = prev.surroundingAreas.includes(areaId)
        ? prev.surroundingAreas.filter((id) => id !== areaId)
        : [...prev.surroundingAreas, areaId]
      const newFilters = { ...prev, surroundingAreas: newSurroundingAreas }
      filterListings(searchTerm, newFilters)
      return newFilters
    })
  }

  // Lọc listings theo từ khóa và bộ lọc
  const filterListings = (search: string, filters: SelectedFilters) => {
    let result = [...listings]
    if (search) {
      result = result.filter(
        (listing) =>
          listing.title.toLowerCase().includes(search.toLowerCase()) ||
          listing.location.toLowerCase().includes(search.toLowerCase()),
      )
    }
    if (filters.area) {
      result = result.filter((listing) => {
        switch (filters.area) {
          case "under20":
            return listing.area < 20
          case "20-40":
            return listing.area >= 20 && listing.area < 40
          case "40-60":
            return listing.area >= 40 && listing.area < 60
          case "60-80":
            return listing.area >= 60 && listing.area < 80
          case "above80":
            return listing.area >= 80
          default:
            return true
        }
      })
    }
    setFilteredListings(result)
  }

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const createdDate = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Vừa đăng"
    if (diffInHours < 24) return `${diffInHours} giờ trước`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} ngày trước`
    return "Hơn 1 tuần trước"
  }

  // Render filter sidebar
  const renderFilterSidebar = () => {
    const visibleAmenities = showAllAmenities ? amenities : amenities.slice(0, 6)

    return (
      <div className="bg-white rounded-4 shadow-sm border-0 overflow-hidden">
        {isMobile && (
          <div
            className="d-flex justify-content-between align-items-center p-4 border-bottom"
            style={{ backgroundColor: "#0046a8" }}
          >
            <h5 className="fw-bold text-white m-0">
              <FaFilter className="me-2" />
              Bộ lọc tìm kiếm
            </h5>
            <Button variant="link" className="p-0 text-white" onClick={() => setShowFilters(false)}>
              <FaTimes size={20} />
            </Button>
          </div>
        )}

        <div className="p-4">
          {!isMobile && (
            <h5 className="fw-bold mb-4" style={{ color: "#0046a8" }}>
              <FaFilter className="me-2" />
              Bộ lọc tìm kiếm
            </h5>
          )}

          {filterError ? (
            <div className="alert alert-danger border-0 rounded-3 mb-3">
              <div className="small">{filterError}</div>
              <Button variant="primary" size="sm" className="mt-2" onClick={() => fetchFilters()}>
                Thử lại
              </Button>
            </div>
          ) : (
            <>
              {/* Loại phòng */}
              {allowTypeChange && (
                <div className="mb-4">
                  <h6 className="fw-bold mb-3" style={{ color: "#0046a8" }}>
                    <FaHome className="me-2" />
                    Loại phòng
                  </h6>
                  <div className="d-grid gap-2">
                    {[
                      { value: null, label: "Tất cả loại phòng" },
                      { value: "BOARDING_HOUSE", label: "Nhà trọ, phòng trọ" },
                      { value: "WHOLE_HOUSE", label: "Nhà nguyên căn" },
                      { value: "APARTMENT", label: "Căn hộ, chung cư" },
                    ].map((option) => (
                      <div
                        key={option.value || "all"}
                        className={`p-3 rounded-3 border cursor-pointer transition-all ${
                          activeTab === option.value
                            ? "border-primary bg-primary bg-opacity-10 text-primary"
                            : "border-light hover-shadow"
                        }`}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleTabChange(option.value as any)}
                      >
                        <div className="d-flex align-items-center">
                          <Form.Check
                            type="radio"
                            checked={activeTab === option.value}
                            onChange={() => {}}
                            className="me-2"
                          />
                          <span className="fw-medium">{option.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Diện tích */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3" style={{ color: "#0046a8" }}>
                  <FaRuler className="me-2" />
                  Diện tích
                </h6>
                <div className="d-grid gap-2">
                  {[...areaOptions, { id: "", label: "Tất cả diện tích" }].map((area) => (
                    <div
                      key={area.id || "all"}
                      className={`p-3 rounded-3 border cursor-pointer transition-all ${
                        selectedFilters.area === area.id
                          ? "border-primary bg-primary bg-opacity-10 text-primary"
                          : "border-light hover-shadow"
                      }`}
                      style={{ cursor: "pointer" }}
                      onClick={() => setAreaFilter(area.id)}
                    >
                      <div className="d-flex align-items-center">
                        <Form.Check
                          type="radio"
                          checked={selectedFilters.area === area.id}
                          onChange={() => {}}
                          className="me-2"
                        />
                        <span className="fw-medium">{area.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tiện nghi */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3" style={{ color: "#0046a8" }}>
                  Tiện nghi
                </h6>
                {isLoading ? (
                  <div className="text-center py-3">
                    <Spinner animation="border" size="sm" />
                  </div>
                ) : (
                  <>
                    <div className="d-grid gap-2">
                      {visibleAmenities.map((amenity) => (
                        <div
                          key={amenity.id}
                          className={`p-3 rounded-3 border cursor-pointer transition-all ${
                            selectedFilters.amenities.includes(amenity.id.toString())
                              ? "border-primary bg-primary bg-opacity-10 text-primary"
                              : "border-light hover-shadow"
                          }`}
                          style={{ cursor: "pointer" }}
                          onClick={() => toggleAmenityFilter(amenity.id.toString())}
                        >
                          <div className="d-flex align-items-center">
                            <Form.Check
                              type="checkbox"
                              checked={selectedFilters.amenities.includes(amenity.id.toString())}
                              onChange={() => {}}
                              className="me-2"
                            />
                            <span className="fw-medium">{amenity.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {amenities.length > 6 && (
                      <div className="text-center mt-3">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="rounded-pill px-4"
                          onClick={() => setShowAllAmenities(!showAllAmenities)}
                        >
                          {showAllAmenities ? (
                            <>
                              <FaChevronUp className="me-2" size={12} />
                              Thu gọn
                            </>
                          ) : (
                            <>
                              <FaChevronDown className="me-2" size={12} />
                              Xem thêm {amenities.length - 6} tiện nghi
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Đối tượng thuê */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3" style={{ color: "#0046a8" }}>
                  Đối tượng thuê
                </h6>
                {isLoading ? (
                  <div className="text-center py-3">
                    <Spinner animation="border" size="sm" />
                  </div>
                ) : (
                  <div className="d-grid gap-2">
                    {targetAudiences.map((audience) => (
                      <div
                        key={audience.id}
                        className={`p-3 rounded-3 border cursor-pointer transition-all ${
                          selectedFilters.targetAudiences.includes(audience.id.toString())
                            ? "border-primary bg-primary bg-opacity-10 text-primary"
                            : "border-light hover-shadow"
                        }`}
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleTargetAudienceFilter(audience.id.toString())}
                      >
                        <div className="d-flex align-items-center">
                          <Form.Check
                            type="checkbox"
                            checked={selectedFilters.targetAudiences.includes(audience.id.toString())}
                            onChange={() => {}}
                            className="me-2"
                          />
                          <span className="fw-medium">{audience.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Khu vực xung quanh */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3" style={{ color: "#0046a8" }}>
                  Khu vực xung quanh
                </h6>
                {isLoading ? (
                  <div className="text-center py-3">
                    <Spinner animation="border" size="sm" />
                  </div>
                ) : (
                  <div className="d-grid gap-2">
                    {surroundingAreas.map((area) => (
                      <div
                        key={area.id}
                        className={`p-3 rounded-3 border cursor-pointer transition-all ${
                          selectedFilters.surroundingAreas.includes(area.id.toString())
                            ? "border-primary bg-primary bg-opacity-10 text-primary"
                            : "border-light hover-shadow"
                        }`}
                        style={{ cursor: "pointer" }}
                        onClick={() => toggleSurroundingAreaFilter(area.id.toString())}
                      >
                        <div className="d-flex align-items-center">
                          <Form.Check
                            type="checkbox"
                            checked={selectedFilters.surroundingAreas.includes(area.id.toString())}
                            onChange={() => {}}
                            className="me-2"
                          />
                          <span className="fw-medium">{area.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Action buttons */}
          <div className="d-grid gap-2 mt-4">
            <Button variant="outline-secondary" className="rounded-pill py-2 fw-medium" onClick={resetList}>
              Đặt lại bộ lọc
            </Button>
            <Button
              variant="primary"
              className="rounded-pill py-2 fw-medium"
              style={{ backgroundColor: "#0046a8", borderColor: "#0046a8" }}
              onClick={handleSearchAdvanced}
            >
              Áp dụng bộ lọc
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Render pagination
  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null

    const pages = []
    const maxVisiblePages = isMobile ? 3 : 5
    const halfVisible = Math.floor(maxVisiblePages / 2)

    let startPage = Math.max(0, pagination.currentPage - halfVisible)
    const endPage = Math.min(pagination.totalPages - 1, startPage + maxVisiblePages - 1)

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return (
      <div className="d-flex justify-content-center mt-5">
        <Pagination className="mb-0">
          <Pagination.First disabled={pagination.currentPage === 0} onClick={() => handlePageChange(0)} />
          <Pagination.Prev
            disabled={pagination.currentPage === 0}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
          />

          {startPage > 0 && (
            <>
              <Pagination.Item onClick={() => handlePageChange(0)}>1</Pagination.Item>
              {startPage > 1 && <Pagination.Ellipsis />}
            </>
          )}

          {pages.map((page) => (
            <Pagination.Item key={page} active={page === pagination.currentPage} onClick={() => handlePageChange(page)}>
              {page + 1}
            </Pagination.Item>
          ))}

          {endPage < pagination.totalPages - 1 && (
            <>
              {endPage < pagination.totalPages - 2 && <Pagination.Ellipsis />}
              <Pagination.Item onClick={() => handlePageChange(pagination.totalPages - 1)}>
                {pagination.totalPages}
              </Pagination.Item>
            </>
          )}

          <Pagination.Next
            disabled={pagination.currentPage === pagination.totalPages - 1}
            onClick={() => handlePageChange(pagination.currentPage + 1)}
          />
          <Pagination.Last
            disabled={pagination.currentPage === pagination.totalPages - 1}
            onClick={() => handlePageChange(pagination.totalPages - 1)}
          />
        </Pagination>
      </div>
    )
  }

  const displayTitle = title.toUpperCase() + (roomType ? " GIÁ RẺ, MỚI NHẤT" : "")

  return (
    <div className="bg-light min-vh-100">
      {/* Header Section */}
      <div
        className="text-white py-5 position-relative"
        style={{
          background: "linear-gradient(135deg, #0046a8 0%, #0056d3 100%)",
          zIndex: 1,
        }}
      >
        <div className="container">
          <h1 className="fw-bold mb-4 text-center">{displayTitle}</h1>

          {/* Enhanced Search Bar */}
          <div className="search-container position-relative mb-n4" style={{ zIndex: 2 }}>
            <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
              <Card.Body className="p-4">
                <Row className="g-3 align-items-center">
                  {/* Search Input */}
                  <Col xs={12} lg={4}>
                    <div className="d-flex align-items-center bg-light rounded-3 p-3">
                      <div
                        className="d-flex justify-content-center align-items-center me-3 rounded-2"
                        style={{
                          width: "40px",
                          height: "40px",
                          backgroundColor: "#0046a8",
                          flexShrink: 0,
                        }}
                      >
                        <FaSearch color="white" size={16} />
                      </div>
                      <Form.Control
                        type="text"
                        placeholder="Bạn muốn tìm trọ ở đâu?"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="border-0 shadow-none bg-transparent"
                        style={{ fontSize: "16px" }}
                      />
                    </div>
                  </Col>

                  {/* Category Dropdown */}
                  {allowTypeChange && !isMobile && (
                    <Col xs={12} lg={3}>
                      <Dropdown className="w-100">
                        <Dropdown.Toggle
                          className="w-100 bg-light border-0 text-dark d-flex align-items-center justify-content-between rounded-3 p-3"
                          style={{ fontSize: "16px" }}
                        >
                          <span className="text-truncate">
                            {activeTab === "BOARDING_HOUSE"
                              ? "Nhà trọ, phòng trọ"
                              : activeTab === "WHOLE_HOUSE"
                                ? "Nhà nguyên căn"
                                : activeTab === "APARTMENT"
                                  ? "Căn hộ, chung cư"
                                  : "Tất cả loại phòng"}
                          </span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="w-100 border-0 shadow rounded-3">
                          {[
                            { value: null, label: "Tất cả loại phòng" },
                            { value: "BOARDING_HOUSE", label: "Nhà trọ, phòng trọ" },
                            { value: "WHOLE_HOUSE", label: "Nhà nguyên căn" },
                            { value: "APARTMENT", label: "Căn hộ, chung cư" },
                          ].map((option) => (
                            <Dropdown.Item
                              key={option.value || "all"}
                              onClick={() => handleTabChange(option.value as any)}
                              className={activeTab === option.value ? "active" : ""}
                            >
                              {option.label}
                            </Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>
                    </Col>
                  )}

                  {/* Location Dropdown */}
                  {!isMobile && (
                    <Col xs={12} lg={3}>
                      <Dropdown className="w-100">
                        <Dropdown.Toggle
                          className="w-100 bg-light border-0 text-dark d-flex align-items-center justify-content-between rounded-3 p-3"
                          style={{ fontSize: "16px" }}
                        >
                          <span className="text-truncate">
                            {selectedWard
                              ? `${wards.find((w) => w.code === selectedWard)?.name}, ${districts.find((d) => d.code === selectedDistrict)?.name}`
                              : selectedDistrict
                                ? `${districts.find((d) => d.code === selectedDistrict)?.name}, ${provinces.find((p) => p.code === selectedProvince)?.name}`
                                : selectedProvince
                                  ? provinces.find((p) => p.code === selectedProvince)?.name
                                  : "Chọn địa điểm"}
                          </span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="w-100 border-0 shadow rounded-3 p-0" style={{ zIndex: 1050 }}>
                          {locationError ? (
                            <div className="p-3">
                              <div className="alert alert-danger border-0 rounded-3 mb-2">
                                <small>{locationError}</small>
                              </div>
                              <Button variant="primary" size="sm" onClick={() => fetchProvinces()}>
                                Thử lại
                              </Button>
                            </div>
                          ) : (
                            <div className="p-3">
                              <Form.Select
                                value={selectedProvince}
                                onChange={(e) => {
                                  setSelectedProvince(e.target.value)
                                  setSelectedDistrict("")
                                  setSelectedWard("")
                                }}
                                className="mb-3 border-0 bg-light rounded-3"
                                disabled={loading}
                              >
                                <option value="">Chọn Tỉnh/TP...</option>
                                {provinces.map((province) => (
                                  <option key={province.code} value={province.code}>
                                    {province.name_with_type}
                                  </option>
                                ))}
                              </Form.Select>

                              <Form.Select
                                value={selectedDistrict}
                                onChange={(e) => {
                                  setSelectedDistrict(e.target.value)
                                  setSelectedWard("")
                                }}
                                className="mb-3 border-0 bg-light rounded-3"
                                disabled={!selectedProvince || loading}
                              >
                                <option value="">Quận/Huyện...</option>
                                {districts.map((district) => (
                                  <option key={district.code} value={district.code}>
                                    {district.name_with_type}
                                  </option>
                                ))}
                              </Form.Select>

                              <Form.Select
                                value={selectedWard}
                                onChange={(e) => setSelectedWard(e.target.value)}
                                className="mb-3 border-0 bg-light rounded-3"
                                disabled={!selectedDistrict || loading}
                              >
                                <option value="">Đường phố...</option>
                                {wards.map((ward) => (
                                  <option key={ward.id} value={ward.code}>
                                    {ward.name_with_type}
                                  </option>
                                ))}
                              </Form.Select>

                              <div className="d-flex gap-2">
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  className="rounded-pill"
                                  onClick={resetLocationSelections}
                                >
                                  Đặt lại
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="rounded-pill"
                                  style={{ backgroundColor: "#0046a8", borderColor: "#0046a8" }}
                                  onClick={handleSearch}
                                >
                                  Áp dụng
                                </Button>
                              </div>
                            </div>
                          )}
                        </Dropdown.Menu>
                      </Dropdown>
                    </Col>
                  )}

                  {/* Search Button */}
                  <Col xs={12} lg={2}>
                    <Button
                      className="w-100 rounded-3 py-3 fw-bold border-0"
                      style={{
                        backgroundColor: "#ff5a00",
                        fontSize: "16px",
                      }}
                      onClick={handleSearch}
                    >
                      <FaSearch className="me-2" />
                      Tìm kiếm
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mt-5 pt-4">
        {/* Search Results Info */}
        {searchParams && (
          <Card className="border-0 shadow-sm rounded-3 mb-4">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center justify-content-between flex-wrap">
                <div>
                  <h6 className="fw-bold text-primary mb-2">Kết quả tìm kiếm</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {searchParams.query && (
                      <Badge bg="primary" className="rounded-pill px-3 py-2">
                        "{searchParams.query}"
                      </Badge>
                    )}
                    {searchParams.province && (
                      <Badge bg="secondary" className="rounded-pill px-3 py-2">
                        {searchParams.province}
                      </Badge>
                    )}
                    {searchParams.minPrice && (
                      <Badge bg="success" className="rounded-pill px-3 py-2">
                        Từ {searchParams.minPrice / 1000000} triệu
                      </Badge>
                    )}
                    {searchParams.maxPrice && (
                      <Badge bg="success" className="rounded-pill px-3 py-2">
                        Đến {searchParams.maxPrice / 1000000} triệu
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="rounded-pill"
                  onClick={() => {
                    localStorage.removeItem("searchParams")
                    setSearchParams(null)
                    setFilteredListings(listings)
                    navigate(0)
                  }}
                >
                  <FaTimes className="me-1" />
                  Xóa bộ lọc
                </Button>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Results Header */}
        <div className="mb-4">
          {/* Desktop Layout */}
          <div className="d-none d-md-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0">Tổng {pagination.totalElements.toLocaleString()} kết quả</h5>

            {/* Sort Dropdown */}
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary" className="d-flex align-items-center rounded-pill px-4">
                {React.createElement(sortOptions.find((opt) => opt.value === sortBy)?.icon || FaClock, {
                  className: "me-2",
                  size: 14,
                })}
                {sortOptions.find((opt) => opt.value === sortBy)?.label || "Sắp xếp"}
              </Dropdown.Toggle>
              <Dropdown.Menu className="border-0 shadow rounded-3">
                {sortOptions.map((option) => (
                  <Dropdown.Item
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={sortBy === option.value ? "active" : ""}
                  >
                    <option.icon className="me-2" size={14} />
                    {option.label}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {/* Mobile Layout */}
          <div className="d-md-none">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">Tổng {pagination.totalElements.toLocaleString()} kết quả</h6>
            </div>

            <div className="d-flex gap-2">
              {/* Filter Button */}
              <Button
                variant="outline-primary"
                className="d-flex align-items-center justify-content-center rounded-pill flex-fill"
                onClick={() => setShowFilters(true)}
                style={{ height: "44px" }}
              >
                <FaFilter className="me-2" size={14} />
                Bộ lọc
              </Button>

              {/* Sort Dropdown */}
              <Dropdown className="flex-fill">
                <Dropdown.Toggle
                  variant="outline-primary"
                  className="w-100 d-flex align-items-center justify-content-center rounded-pill"
                  style={{ height: "44px" }}
                >
                  {React.createElement(sortOptions.find((opt) => opt.value === sortBy)?.icon || FaClock, {
                    className: "me-2",
                    size: 14,
                  })}
                  <span className="d-none d-sm-inline">
                    {sortOptions.find((opt) => opt.value === sortBy)?.label || "Sắp xếp"}
                  </span>
                  <span className="d-sm-none">Sắp xếp</span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="border-0 shadow rounded-3 w-100">
                  {sortOptions.map((option) => (
                    <Dropdown.Item
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={sortBy === option.value ? "active" : ""}
                    >
                      <option.icon className="me-2" size={14} />
                      {option.label}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>

          {/* Tablet Layout */}
          <div className="d-none d-sm-flex d-md-none justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <h6 className="fw-bold mb-0">Tổng {pagination.totalElements.toLocaleString()} kết quả</h6>

              <Button
                variant="outline-primary"
                className="d-flex align-items-center rounded-pill px-4"
                onClick={() => setShowFilters(true)}
              >
                <FaFilter className="me-2" />
                Bộ lọc
              </Button>
            </div>

            {/* Sort Dropdown */}
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary" className="d-flex align-items-center rounded-pill px-4">
                {React.createElement(sortOptions.find((opt) => opt.value === sortBy)?.icon || FaClock, {
                  className: "me-2",
                  size: 14,
                })}
                {sortOptions.find((opt) => opt.value === sortBy)?.label || "Sắp xếp"}
              </Dropdown.Toggle>
              <Dropdown.Menu className="border-0 shadow rounded-3">
                {sortOptions.map((option) => (
                  <Dropdown.Item
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={sortBy === option.value ? "active" : ""}
                  >
                    <option.icon className="me-2" size={14} />
                    {option.label}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        <Row className="g-4">
          {/* Desktop Filter Sidebar */}
          {!isMobile && !isTablet && (
            <Col lg={3}>
              <div className="sticky-top" style={{ top: "20px" }}>
                {renderFilterSidebar()}
              </div>
            </Col>
          )}

          {/* Mobile/Tablet Filter Offcanvas */}
          <Offcanvas
            show={showFilters}
            onHide={() => setShowFilters(false)}
            placement={isMobile ? "bottom" : "start"}
            style={{
              height: isMobile ? "90vh" : "100vh",
              width: isTablet ? "400px" : "100%",
            }}
          >
            <Offcanvas.Body className="p-0">{renderFilterSidebar()}</Offcanvas.Body>
          </Offcanvas>

          {/* Main Content */}
          <Col lg={!isMobile && !isTablet ? 9 : 12}>
            {/* Loading State */}
            {isSearching && (
              <div className="text-center py-5">
                <Spinner animation="border" style={{ color: "#0046a8", width: "3rem", height: "3rem" }} />
                <p className="mt-3 text-muted">Đang tìm kiếm phòng trọ...</p>
              </div>
            )}

            {/* Error State */}
            {searchError && !isSearching && (
              <Card className="border-0 shadow-sm rounded-3">
                <Card.Body className="text-center py-5">
                  <div className="text-danger mb-3">
                    <FaTimes size={48} />
                  </div>
                  <h5 className="text-danger mb-3">Có lỗi xảy ra</h5>
                  <p className="text-muted mb-3">{searchError}</p>
                  <Button
                    variant="primary"
                    className="rounded-pill px-4"
                    style={{ backgroundColor: "#0046a8", borderColor: "#0046a8" }}
                    onClick={() => {
                      const currentType = roomType || activeTab
                      performSearch(
                        searchParams || (currentType ? { roomType: currentType } : {}),
                        pagination.currentPage,
                      )
                    }}
                  >
                    Thử lại
                  </Button>
                </Card.Body>
              </Card>
            )}

            {/* No Results */}
            {!isSearching && !searchError && filteredListings.length === 0 && (
              <Card className="border-0 shadow-sm rounded-3">
                <Card.Body className="text-center py-5">
                  <div className="text-warning mb-3">
                    <FaSearch size={48} />
                  </div>
                  <h5 className="text-muted mb-3">Không tìm thấy kết quả</h5>
                  <p className="text-muted mb-3">
                    Không tìm thấy phòng trọ phù hợp với tiêu chí tìm kiếm. Vui lòng thử lại với các bộ lọc khác.
                  </p>
                  <Button variant="outline-primary" className="rounded-pill px-4" onClick={resetList}>
                    Đặt lại bộ lọc
                  </Button>
                </Card.Body>
              </Card>
            )}

            {/* Room Listings */}
            {!isSearching && !searchError && filteredListings.length > 0 && (
              <>
                <Row className="g-4">
                  {filteredListings.map((listing) => (
                    <Col key={listing.id} xs={12} sm={6} lg={4}>
                      <Card
                        className="h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative room-card"
                        style={{
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          if (!isMobile) {
                            e.currentTarget.style.transform = "translateY(-8px)"
                            e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,70,168,0.15)"
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isMobile) {
                            e.currentTarget.style.transform = "translateY(0)"
                            e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)"
                          }
                        }}
                      >
                        {/* HOT Badge */}
                        <Badge
                          bg="danger"
                          className="position-absolute top-0 start-0 m-3 rounded-pill px-3 py-2 fw-bold"
                          style={{ zIndex: 2, fontSize: "0.75rem" }}
                        >
                          HOT
                        </Badge>

                        {/* Save Button */}
                        <Button
                          variant="light"
                          size="sm"
                          className="position-absolute top-0 end-0 m-3 rounded-circle border-0 shadow-sm"
                          style={{
                            zIndex: 2,
                            width: "40px",
                            height: "40px",
                            backgroundColor: "rgba(255,255,255,0.9)",
                          }}
                          onClick={(e) => handleToggleSave(listing.id, e)}
                        >
                          {savedRoomIds.includes(listing.id) ? (
                            <FaHeart className="text-danger" size={16} />
                          ) : (
                            <FaRegHeart className="text-muted" size={16} />
                          )}
                        </Button>

                        {/* Room Image */}
                        <Link to={`/phong-tro/${listing.id}`} className="text-decoration-none">
                          <div
                            className="position-relative overflow-hidden"
                            style={{ height: isMobile ? "200px" : "220px" }}
                          >
                            <img
                              src={listing.image || "/placeholder.svg?height=220&width=300"}
                              alt={listing.title}
                              className="w-100 h-100"
                              style={{
                                objectFit: "cover",
                                transition: "transform 0.3s ease",
                              }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = "/placeholder.svg?height=220&width=300"
                              }}
                              onMouseEnter={(e) => {
                                if (!isMobile) {
                                  e.currentTarget.style.transform = "scale(1.05)"
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isMobile) {
                                  e.currentTarget.style.transform = "scale(1)"
                                }
                              }}
                            />

                            {/* View Count Overlay */}
                            <div
                              className="position-absolute bottom-0 end-0 m-3 px-2 py-1 rounded-pill text-white d-flex align-items-center"
                              style={{
                                backgroundColor: "rgba(0,0,0,0.7)",
                                fontSize: "0.75rem",
                              }}
                            >
                              <FaEye className="me-1" size={12} />
                              {listing.viewCount || Math.floor(Math.random() * 100) + 10}
                            </div>
                          </div>

                          <Card.Body className="p-4">
                            {/* Title */}
                            <Card.Title
                              className="fw-bold mb-3 text-dark"
                              style={{
                                fontSize: isMobile ? "1rem" : "1.1rem",
                                lineHeight: "1.4",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                              title={listing.title}
                            >
                              {listing.title}
                            </Card.Title>

                            {/* Price and Area */}
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <div
                                className="fw-bold"
                                style={{
                                  color: "#0046a8",
                                  fontSize: isMobile ? "1.1rem" : "1.2rem",
                                }}
                              >
                                {listing.price.toLocaleString()}₫<small className="text-muted fw-normal">/tháng</small>
                              </div>
                              <Badge bg="light" text="dark" className="rounded-pill px-3 py-2">
                                <FaRuler className="me-1" size={12} />
                                {listing.area}m²
                              </Badge>
                            </div>

                            {/* Location */}
                            <div className="d-flex align-items-center text-muted mb-3">
                              <FaMapMarkerAlt className="me-2 flex-shrink-0" size={14} />
                              <span className="text-truncate" style={{ fontSize: "0.9rem" }} title={listing.location}>
                                {listing.location}
                              </span>
                            </div>

                            {/* Time Posted */}
                            {listing.createdAt && (
                              <div className="d-flex align-items-center text-muted">
                                <FaClock className="me-2 flex-shrink-0" size={12} />
                                <small>{formatTimeAgo(listing.createdAt)}</small>
                              </div>
                            )}
                          </Card.Body>
                        </Link>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {/* Pagination */}
                {renderPagination()}
              </>
            )}
          </Col>
        </Row>
      </div>

      {/* Custom Styles */}
      <style>{`
        .room-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,70,168,0.15);
        }
        
        .hover-shadow:hover {
          box-shadow: 0 4px 12px rgba(0,70,168,0.15);
        }
        
        .transition-all {
          transition: all 0.3s ease;
        }
        
        .cursor-pointer {
          cursor: pointer;
        }

        .dropdown-menu {
          z-index: 1050 !important;
        }
        
        @media (max-width: 768px) {
          .room-card:hover {
            transform: none;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
        }
      `}</style>
    </div>
  )
}

export default RoomSearchPage
