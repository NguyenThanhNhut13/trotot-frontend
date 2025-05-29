"use client"

import { useState, useEffect } from "react"
import { Card, Button, Row, Col, Form, Dropdown, Spinner, Offcanvas } from "react-bootstrap"
import { Link, useNavigate } from "react-router-dom"
import { FaSearch, FaMapMarkerAlt, FaHeart, FaFilter, FaTimes } from "react-icons/fa"
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
}

interface SearchRoomPageProps {
  title?: string;
  roomType?: "APARTMENT" | "WHOLE_HOUSE" | "BOARDING_HOUSE" | null;
  allowTypeChange?: boolean; // Cho phép thay đổi loại phòng (true cho AllCategoriesPage)
}

const priceLabelMap: Record<string, string> = {
  all: "Tất cả mức giá",
  "under-1m": "Dưới 1 triệu",
  "1-10m": "1 - 10 triệu",
  "10-30m": "10 - 30 triệu",
  "30-50m": "30 - 50 triệu",
  "50m-plus": "Trên 50 triệu",
  "100m-plus": "Trên 100 triệu",
}

const RoomSearchPage = ({ title = "TẤT CẢ PHÒNG TRỌ", roomType = null, allowTypeChange = false }: SearchRoomPageProps) => {
  const navigate = useNavigate()
  const { isMobile, isTablet } = useResponsive()
  
  // Các state cho dữ liệu và phân trang
  const [listings, setListings] = useState<Listing[]>([])
  const [filteredListings, setFilteredListings] = useState<Listing[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [totalCount, setTotalCount] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

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

  // State cho bộ lọc
  const [selectedFilters, setSelectedFilters] = useState(() => {
    const savedFiltersKey = roomType ? `filters_${roomType}` : 'filters_all';
    const savedFilters = localStorage.getItem(savedFiltersKey)
    if (savedFilters) {
      try {
        return JSON.parse(savedFilters)
      } catch (error) {
        console.error("Error parsing saved filters:", error)
      }
    }
    return {
      area: [] as string[],
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

  // Lưu bộ lọc đã chọn vào localStorage
  useEffect(() => {
    const storageKey = roomType ? `filters_${roomType}` : 'filters_all';
    localStorage.setItem(storageKey, JSON.stringify(selectedFilters))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [selectedFilters, roomType])

  // Các tùy chọn diện tích
  const areaOptions = [
    { id: "under20", label: "Dưới 20 m2" },
    { id: "20-40", label: "20-40 m2" },
    { id: "40-60", label: "40-60 m2" },
    { id: "60-80", label: "60-80 m2" },
    { id: "above80", label: "Trên 80 m2" },
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
        const delay = 3000 + (attempt - 1) * 1000 // 3s, 4s, 5s
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
    // Xác định key dựa trên roomType hiện tại hay activeTab
    const currentType = roomType || activeTab;
    const cacheKey = currentType ? `list${currentType}Pagging` : 'listAllRooms';
    
    const cachedData = localStorage.getItem(cacheKey)
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData)
        setListings(parsedData)
        setFilteredListings(parsedData)
        setTotalCount(parsedData.length)
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
        // Chỉ tìm kiếm khi không có roomType cố định hoặc roomType khớp với parsedParams.roomType
        if (!roomType || !parsedParams.roomType || parsedParams.roomType === roomType) {
          performSearch(parsedParams)
        }
      } catch (error) {
        console.error("Error parsing search params:", error)
      }
    } else if (roomType) {
      // Nếu không có search params nhưng có roomType, tìm kiếm theo roomType
      performSearch({ roomType })
    } else if (activeTab) {
      // Nếu không có search params nhưng có activeTab, tìm kiếm theo activeTab
      performSearch({ roomType: activeTab })
    } else {
      // Nếu không có gì cả, tìm kiếm tất cả
      performSearch({})
    }
  }, [roomType, activeTab])

  // Xử lý khi chọn tab khác (chỉ dùng khi allowTypeChange=true)
  const handleTabChange = (newRoomType: "BOARDING_HOUSE" | "WHOLE_HOUSE" | "APARTMENT" | null) => {
    setActiveTab(newRoomType);

    if (searchParams) {
      // Thêm roomType vào searchParams và tìm kiếm lại
      const newParams = { ...searchParams, roomType: newRoomType };
      performSearch(newParams);
    } else {
      // Nếu không có searchParams, tìm kiếm theo roomType
      performSearch({ roomType: newRoomType });
    }
  };

  // Reset location selections
  const resetLocationSelections = () => {
    setSelectedProvince("")
    setSelectedDistrict("")
    setSelectedWard("")
  }

  // Xử lý basic search
  const handleSearch = () => {
    const currentRoomType = roomType || activeTab;
    const searchParams: any = currentRoomType ? { roomType: currentRoomType } : {};
    
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
    performSearch(searchParams)

    // Close filter sidebar on mobile after search
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
      area: [],
      amenities: [],
      targetAudiences: [],
      surroundingAreas: [],
    })
    setSearchParams(null)
    localStorage.removeItem("searchParams")
    
    // Xác định loại phòng hiện tại để lấy cached data
    const currentType = roomType || activeTab;
    const cacheKey = currentType ? `list${currentType}Pagging` : 'listAllRooms';
    
    const cachedData = localStorage.getItem(cacheKey)
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData)
        setListings(parsedData)
        setFilteredListings(parsedData)
        setTotalCount(parsedData.length)
      } catch (error) {
        console.error("Error parsing cached data:", error)
        performSearch(currentType ? { roomType: currentType } : {})
      }
    } else {
      performSearch(currentType ? { roomType: currentType } : {})
    }

    // Close filter sidebar on mobile after reset
    if (isMobile) {
      setShowFilters(false)
    }
  }

  // Xử lý advanced search (có thêm các bộ lọc phức tạp)
  const handleSearchAdvanced = () => {
    const currentRoomType = roomType || activeTab;
    const searchParams: any = currentRoomType ? { roomType: currentRoomType } : {};
    
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
    if (selectedFilters.area.length > 0) {
      const areaRanges = []
      for (const area of selectedFilters.area) {
        switch (area) {
          case "under20":
            areaRanges.push("0-20")
            break
          case "20-40":
            areaRanges.push("20-40")
            break
          case "40-60":
            areaRanges.push("40-60")
            break
          case "60-80":
            areaRanges.push("60-80")
            break
          case "above80":
            areaRanges.push("80-999")
            break
        }
      }
      searchParams.areaRange = areaRanges.join(",")
    }
    if (selectedFilters.amenities.length > 0) {
      const amenityNames = selectedFilters.amenities
        .map((id: string) => {
          const amenity = amenities.find((a) => a.id.toString() === id)
          return amenity ? amenity.name : ""
        })
        .filter(Boolean)
      if (amenityNames.length > 0) {
        searchParams.amenities = amenityNames.join(",")
      }
    }
    if (selectedFilters.surroundingAreas.length > 0) {
      const areaNames = selectedFilters.surroundingAreas
        .map((id: string) => {
          const area = surroundingAreas.find((a) => a.id.toString() === id)
          return area ? area.name : ""
        })
        .filter(Boolean)
      if (areaNames.length > 0) {
        searchParams.environment = areaNames.join(",")
      }
    }
    if (selectedFilters.targetAudiences.length > 0) {
      const audienceNames = selectedFilters.targetAudiences
        .map((id: string) => {
          const audience = targetAudiences.find((a) => a.id.toString() === id)
          return audience ? audience.name : ""
        })
        .filter(Boolean)
      if (audienceNames.length > 0) {
        searchParams.targetAudience = audienceNames.join(",")
      }
    }
    performSearch(searchParams)

    // Close filter sidebar on mobile after search
    if (isMobile) {
      setShowFilters(false)
    }
  }

  // Xử lý API search
  const performSearch = async (params: any, attempt = 1) => {
    setIsSearching(true)
    setSearchError(null)
    try {
      const searchRoomParams: RoomSearchParams = {
        page: 0,
        size: 25,
      }
      
      // Thêm roomType nếu có
      if (params.roomType) {
        searchRoomParams.roomType = params.roomType
      } else if (roomType) {
        // Sử dụng roomType từ props nếu không có trong params
        searchRoomParams.roomType = roomType
      }

      // Thêm các params khác
      if (params.query) searchRoomParams.street = params.query
      if (params.province) searchRoomParams.city = params.province
      if (params.district) searchRoomParams.district = params.district
      if (params.minPrice !== undefined) searchRoomParams.minPrice = params.minPrice
      if (params.maxPrice !== undefined) searchRoomParams.maxPrice = params.maxPrice
      if (params.areaRange) searchRoomParams.areaRange = params.areaRange

      // Gọi API search
      const response = await roomApi.searchRooms(searchRoomParams)
      if (response.data && response.data.data && response.data.data.content) {
        const transformedListings = response.data.data.content.map((item: Room) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          area: item.area,
          image: item.imageUrls[0],
          location: `${item.district}, ${item.province}`,
        }))
        setListings(transformedListings)
        setFilteredListings(transformedListings)
        setTotalCount(response.data.data.totalElements)
        
        // Lưu searchParams vào localStorage
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
        setTimeout(() => performSearch(params, attempt + 1), 3000 * attempt)
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
  const toggleAreaFilter = (areaId: string) => {
    setSelectedFilters((prev: { area: string[] }) => {
      const newAreas = prev.area.includes(areaId) ? prev.area.filter((id) => id !== areaId) : [...prev.area, areaId]
      const newFilters = { ...prev, area: newAreas }
      filterListings(searchTerm, newFilters)
      return newFilters
    })
  }

  const toggleAmenityFilter = (amenityId: string) => {
    setSelectedFilters((prev: { amenities: string[] }) => {
      const newAmenities = prev.amenities.includes(amenityId)
        ? prev.amenities.filter((id) => id !== amenityId)
        : [...prev.amenities, amenityId]
      const newFilters = { ...prev, amenities: newAmenities }
      filterListings(searchTerm, newFilters)
      return newFilters
    })
  }

  const toggleTargetAudienceFilter = (audienceId: string) => {
    setSelectedFilters((prev: { targetAudiences: string[] }) => {
      const newTargetAudiences = prev.targetAudiences.includes(audienceId)
        ? prev.targetAudiences.filter((id) => id !== audienceId)
        : [...prev.targetAudiences, audienceId]
      const newFilters = { ...prev, targetAudiences: newTargetAudiences }
      filterListings(searchTerm, newFilters)
      return newFilters
    })
  }

  const toggleSurroundingAreaFilter = (areaId: string) => {
    setSelectedFilters((prev: { surroundingAreas: string[] }) => {
      const newSurroundingAreas = prev.surroundingAreas.includes(areaId)
        ? prev.surroundingAreas.filter((id) => id !== areaId)
        : [...prev.surroundingAreas, areaId]
      const newFilters = { ...prev, surroundingAreas: newSurroundingAreas }
      filterListings(searchTerm, newFilters)
      return newFilters
    })
  }

  // Lọc listings theo từ khóa và bộ lọc
  const filterListings = (search: string, filters: typeof selectedFilters) => {
    let result = [...listings]
    if (search) {
      result = result.filter(
        (listing) =>
          listing.title.toLowerCase().includes(search.toLowerCase()) ||
          listing.location.toLowerCase().includes(search.toLowerCase()),
      )
    }
    if (filters.area.length > 0) {
      result = result.filter((listing) => {
        if (filters.area.includes("under20") && listing.area < 20) return true
        if (filters.area.includes("20-40") && listing.area >= 20 && listing.area < 40) return true
        if (filters.area.includes("40-60") && listing.area >= 40 && listing.area < 60) return true
        if (filters.area.includes("60-80") && listing.area >= 60 && listing.area < 80) return true
        if (filters.area.includes("above80") && listing.area >= 80) return true
        return filters.area.length === 0
      })
    }
    setFilteredListings(result)
  }

  // Render filter sidebar - used for both desktop and mobile (via Offcanvas)
  const renderFilterSidebar = () => {
    return (
      <div className="bg-white p-3 rounded shadow-sm mb-4">
        {isMobile && (
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-primary m-0">
              <FaFilter className="me-2" />
              Bộ lọc tìm kiếm
            </h5>
            <Button variant="link" className="p-0 text-muted" onClick={() => setShowFilters(false)}>
              <FaTimes size={20} />
            </Button>
          </div>
        )}

        {!isMobile && (
          <h5 className="fw-bold text-primary mb-3">
            <FaSearch className="me-2" />
            Lọc tìm kiếm
          </h5>
        )}

        {filterError ? (
          <div className="alert alert-danger mb-3">
            {filterError}
            <Button variant="primary" size="sm" className="ms-2" onClick={() => fetchFilters()}>
              Thử lại
            </Button>
          </div>
        ) : (
          <>
            {/* Loại phòng (chỉ hiển thị khi allowTypeChange=true) */}
            {allowTypeChange && (
              <div className="mb-4">
                <h6 className="fw-bold mb-2">Loại phòng</h6>
                <Form.Check
                  type="radio"
                  id="room-type-all"
                  label="Tất cả loại phòng"
                  checked={activeTab === null}
                  onChange={() => handleTabChange(null)}
                  className="mb-2"
                />
                <Form.Check
                  type="radio"
                  id="room-type-boarding"
                  label="Nhà trọ, phòng trọ"
                  checked={activeTab === "BOARDING_HOUSE"}
                  onChange={() => handleTabChange("BOARDING_HOUSE")}
                  className="mb-2"
                />
                <Form.Check
                  type="radio"
                  id="room-type-house"
                  label="Nhà nguyên căn"
                  checked={activeTab === "WHOLE_HOUSE"}
                  onChange={() => handleTabChange("WHOLE_HOUSE")}
                  className="mb-2"
                />
                <Form.Check
                  type="radio"
                  id="room-type-apartment"
                  label="Căn hộ, chung cư"
                  checked={activeTab === "APARTMENT"}
                  onChange={() => handleTabChange("APARTMENT")}
                  className="mb-2"
                />
              </div>
            )}

            <div className="mb-4">
              <h6 className="fw-bold mb-2">Diện tích</h6>
              {areaOptions.map((area) => (
                <Form.Check
                  key={area.id}
                  type="checkbox"
                  id={`area-${area.id}`}
                  label={area.label}
                  className="mb-2"
                  checked={selectedFilters.area.includes(area.id)}
                  onChange={() => toggleAreaFilter(area.id)}
                />
              ))}
            </div>
            <div className="mb-4">
              <h6 className="fw-bold mb-2">Tiện nghi</h6>
              {isLoading ? (
                <p>Đang tải...</p>
              ) : (
                amenities.map((amenity) => (
                  <Form.Check
                    key={amenity.id}
                    type="checkbox"
                    id={`amenity-${amenity.id}`}
                    label={amenity.name}
                    className="mb-2"
                    checked={selectedFilters.amenities.includes(amenity.id.toString())}
                    onChange={() => toggleAmenityFilter(amenity.id.toString())}
                  />
                ))
              )}
            </div>
            <div className="mb-4">
              <h6 className="fw-bold mb-2">Đối tượng thuê</h6>
              {isLoading ? (
                <p>Đang tải...</p>
              ) : (
                targetAudiences.map((audience) => (
                  <Form.Check
                    key={audience.id}
                    type="checkbox"
                    id={`audience-${audience.id}`}
                    label={audience.name}
                    className="mb-2"
                    checked={selectedFilters.targetAudiences.includes(audience.id.toString())}
                    onChange={() => toggleTargetAudienceFilter(audience.id.toString())}
                  />
                ))
              )}
            </div>
            <div className="mb-3">
              <h6 className="fw-bold mb-2">Khu vực xung quanh</h6>
              {isLoading ? (
                <p>Đang tải...</p>
              ) : (
                surroundingAreas.map((area) => (
                  <Form.Check
                    key={area.id}
                    type="checkbox"
                    id={`surrounding-${area.id}`}
                    label={area.name}
                    className="mb-2"
                    checked={selectedFilters.surroundingAreas.includes(area.id.toString())}
                    onChange={() => toggleSurroundingAreaFilter(area.id.toString())}
                  />
                ))
              )}
            </div>
          </>
        )}
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary flex-grow-1" onClick={resetList}>
            Đặt lại
          </button>
          <button className="btn btn-primary flex-grow-1" onClick={handleSearchAdvanced}>
            Áp dụng
          </button>
        </div>
      </div>
    )
  }

  // Xác định tiêu đề hiển thị
  const displayTitle = title.toUpperCase() + (roomType ? " GIÁ RẺ, MỚI NHẤT" : "");

  return (
    <div>
      <div className="text-white py-4" style={{ backgroundColor: "#0145aa" }}>
        <div className="container">
          <h1 className="fw-bold mb-4">{displayTitle}</h1>
          <div className="d-flex flex-wrap align-items-center bg-white p-2" style={{ borderRadius: "8px" }}>
            <div className="d-flex align-items-center flex-grow-1 pe-2">
              <div
                className="bg-primary d-flex justify-content-center align-items-center"
                style={{ width: "45px", height: "45px", borderRadius: "4px" }}
              >
                <FaSearch color="white" size={20} />
              </div>
              <input
                type="text"
                className="form-control border-0 shadow-none ms-2"
                placeholder="Bạn muốn tìm trọ ở đâu?"
                value={searchTerm}
                onChange={handleSearchChange}
                style={{ height: "45px" }}
              />
            </div>

            {/* Category dropdown - chỉ hiển thị khi allowTypeChange=true và không phải mobile */}
            {allowTypeChange && !isMobile && (
              <div className="border-start px-3 d-flex align-items-center" style={{ height: "45px" }}>
                <div className="dropdown">
                  <button
                    className="btn btn-white dropdown-toggle text-start d-flex align-items-center justify-content-between"
                    type="button"
                    id="categoryDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ minWidth: "180px" }}
                  >
                    <span>
                      {activeTab === "BOARDING_HOUSE" 
                        ? "Nhà trọ, phòng trọ"
                        : activeTab === "WHOLE_HOUSE"
                        ? "Nhà nguyên căn" 
                        : activeTab === "APARTMENT"
                        ? "Căn hộ, chung cư"
                        : "Tất cả loại phòng"}
                    </span>
                  </button>
                  <ul className="dropdown-menu" aria-labelledby="categoryDropdown">
                    <li>
                      <a 
                        className="dropdown-item" 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleTabChange(null);
                        }}
                      >
                        Tất cả loại phòng
                      </a>
                    </li>
                    <li>
                      <a 
                        className="dropdown-item" 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleTabChange("BOARDING_HOUSE");
                        }}
                      >
                        Nhà trọ, phòng trọ
                      </a>
                    </li>
                    <li>
                      <a 
                        className="dropdown-item" 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleTabChange("WHOLE_HOUSE");
                        }}
                      >
                        Nhà nguyên căn
                      </a>
                    </li>
                    <li>
                      <a 
                        className="dropdown-item" 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleTabChange("APARTMENT");
                        }}
                      >
                        Căn hộ, chung cư
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Location dropdown - hide on mobile */}
            {!isMobile && (
              <div className="border-start px-3 d-flex align-items-center" style={{ height: "45px" }}>
                <div className="dropdown">
                  <button
                    className="btn btn-white dropdown-toggle text-start d-flex align-items-center justify-content-between"
                    type="button"
                    id="dropdownLocation"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <div className="d-flex align-items-center">
                      {selectedWard ? (
                        <span
                          className="text-truncate d-inline-block"
                          style={{
                            maxWidth: "200px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {(wards.find((w) => w.code === selectedWard)?.name || "") +
                            ", " +
                            (districts.find((d) => d.code === selectedDistrict)?.name || "") +
                            ", " +
                            (provinces.find((p) => p.code === selectedProvince)?.name || "")}
                        </span>
                      ) : selectedDistrict ? (
                        <span
                          className="text-truncate d-inline-block"
                          style={{
                            maxWidth: "200px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {(districts.find((d) => d.code === selectedDistrict)?.name || "") +
                            ", " +
                            (provinces.find((p) => p.code === selectedProvince)?.name || "")}
                        </span>
                      ) : selectedProvince ? (
                        <span
                          className="text-truncate d-inline-block"
                          style={{
                            maxWidth: "200px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {provinces.find((p) => p.code === selectedProvince)?.name || ""}
                        </span>
                      ) : (
                        <span>Địa điểm</span>
                      )}
                    </div>
                  </button>
                  <div className="dropdown-menu p-0 w-100" style={{ zIndex: 1050 }} aria-labelledby="dropdownLocation">
                    <div className="location-form p-0">
                      {locationError ? (
                        <div className="alert alert-danger m-3">
                          {locationError}
                          <Button variant="primary" size="sm" className="ms-2" onClick={() => fetchProvinces()}>
                            Thử lại
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="mb-0">
                            <Form.Select
                              value={selectedProvince}
                              onChange={(e) => {
                                setSelectedProvince(e.target.value)
                                setSelectedDistrict("")
                                setSelectedWard("")
                              }}
                              className="border-0 border-bottom rounded-0 py-3"
                              disabled={loading}
                            >
                              <option value="">Chọn Tỉnh/TP...</option>
                              {Array.isArray(provinces) &&
                                provinces.map((province) => (
                                  <option key={province.code} value={province.code}>
                                    {province.name_with_type}
                                  </option>
                                ))}
                            </Form.Select>
                          </div>
                          <div className="mb-0">
                            <Form.Select
                              value={selectedDistrict}
                              onChange={(e) => {
                                setSelectedDistrict(e.target.value)
                                setSelectedWard("")
                              }}
                              className="border-0 border-bottom rounded-0 py-3"
                              disabled={!selectedProvince || loading}
                            >
                              <option value="">Quận/Huyện...</option>
                              {districts.map((district) => (
                                <option key={district.code} value={district.code}>
                                  {district.name_with_type}
                                </option>
                              ))}
                            </Form.Select>
                          </div>
                          <div className="mb-0">
                            <Form.Select
                              value={selectedWard}
                              onChange={(e) => setSelectedWard(e.target.value)}
                              className="border-0 border-bottom rounded-0 py-3"
                              disabled={!selectedDistrict || loading}
                            >
                              <option value="">Đường phố...</option>
                              {wards.map((ward) => (
                                <option key={ward.id} value={ward.code}>
                                  {ward.name_with_type}
                                </option>
                              ))}
                            </Form.Select>
                          </div>
                        </>
                      )}
                      <div className="d-flex justify-content-between p-2">
                        <Button
                          variant="link"
                          className="text-decoration-none d-flex align-items-center"
                          onClick={resetLocationSelections}
                        >
                          <i className="bi bi-arrow-repeat me-1"></i> Đặt lại
                        </Button>
                        <Button onClick={handleSearch} variant="primary">
                          Tìm ngay
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Price dropdown - hide on mobile */}
            {!isMobile && (
              <div
                className="border-start px-3 d-flex align-items-center"
                style={{ height: "45px", minWidth: "280px" }}
              >
                <Dropdown className="w-100 h-100">
                  <Dropdown.Toggle
                    className="bg-white border-0 w-100 h-100 text-start d-flex align-items-center justify-content-between"
                    style={{ color: "#363940" }}
                  >
                    <span className="text-start w-100">
                      {minPriceInput || maxPriceInput
                        ? `Từ ${minPriceInput || "0"} → ${maxPriceInput || "∞"} triệu`
                        : priceLabelMap[priceRange] || "Mức giá"}
                    </span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="w-100 p-3" style={{ zIndex: 1050 }}>
                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-3">
                        <div className="pe-2 flex-grow-1">
                          <Form.Control
                            type="text"
                            placeholder="Từ"
                            className="rounded"
                            value={minPriceInput}
                            onChange={(e) => {
                              setMinPriceInput(e.target.value)
                              setPriceRange("")
                            }}
                          />
                        </div>
                        <div className="px-2">→</div>
                        <div className="ps-2 flex-grow-1">
                          <Form.Control
                            type="text"
                            placeholder="Đến"
                            className="rounded"
                            value={maxPriceInput}
                            onChange={(e) => {
                              setMaxPriceInput(e.target.value)
                              setPriceRange("")
                            }}
                          />
                        </div>
                      </div>
                      {Object.entries(priceLabelMap).map(([key, label]) => (
                        <Form.Check
                          type="radio"
                          id={key}
                          name="price-range"
                          key={key}
                          label={key === "all" ? <span className="fw-bold">{label}</span> : label}
                          checked={priceRange === key}
                          onChange={() => {
                            setPriceRange(key)
                            setMinPriceInput("")
                            setMaxPriceInput("")
                          }}
                          className="mb-2"
                        />
                      ))}
                    </div>
                    <div className="d-flex justify-content-between p-2">
                      <Button
                        variant="link"
                        className="text-decoration-none d-flex align-items-center"
                        onClick={() => {
                          setMinPriceInput("")
                          setMaxPriceInput("")
                          setPriceRange("all")
                          resetList()
                        }}
                      >
                        <i className="bi bi-arrow-repeat me-1"></i> Đặt lại
                      </Button>
                      <Button onClick={handleSearch} variant="primary">
                        Tìm ngay
                      </Button>
                    </div>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            )}

            {/* Search button */}
            <div className={isMobile ? "ms-2" : "ps-3"}>
              <button
                className="btn text-white d-flex align-items-center"
                style={{
                  backgroundColor: "#ff5a00",
                  borderColor: "#ff5a00",
                  height: "45px",
                  fontWeight: "500",
                }}
                onClick={handleSearch}
              >
                <FaSearch className="me-2" /> {isMobile ? "" : "Tìm kiếm"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-4">
        {searchParams && (
          <div className="alert alert-info mb-3">
            <strong>Kết quả tìm kiếm cho: </strong>
            {searchParams.query && <span>"{searchParams.query}" </span>}
            {searchParams.province && <span>tại {searchParams.province} </span>}
            {searchParams.minPrice && <span>từ {searchParams.minPrice / 1000000} triệu </span>}
            {searchParams.maxPrice && <span>đến {searchParams.maxPrice / 1000000} triệu </span>}
            {searchParams.areaRange && <span>diện tích {searchParams.areaRange}m² </span>}
            <button
              className="btn btn-sm btn-outline-secondary ms-2"
              onClick={() => {
                localStorage.removeItem("searchParams")
                setSearchParams(null)
                setFilteredListings(listings)
                navigate(0)
              }}
            >
              Xóa bộ lọc
            </button>
          </div>
        )}

        {/* Mobile filter button */}
        {isMobile && (
          <div className="d-flex justify-content-between align-items-center mb-3">
            <p className="mb-0">Tổng {totalCount} kết quả</p>
            <Button
              variant="outline-primary"
              className="d-flex align-items-center"
              onClick={() => setShowFilters(true)}
            >
              <FaFilter className="me-2" /> Bộ lọc
            </Button>
          </div>
        )}

        <div className="d-flex flex-column flex-md-row">
          {/* Desktop filter sidebar */}
          {!isMobile && !isTablet && (
            <div className="filter-sidebar" style={{ width: "280px", minWidth: "280px", marginRight: "20px" }}>
              {renderFilterSidebar()}
            </div>
          )}

          {/* Mobile filter sidebar (Offcanvas) */}
          {isMobile && (
            <Offcanvas show={showFilters} onHide={() => setShowFilters(false)} placement="end" style={{ width: "85%" }}>
              <Offcanvas.Body className="p-0">{renderFilterSidebar()}</Offcanvas.Body>
            </Offcanvas>
          )}

          {/* Tablet filter sidebar (Offcanvas) */}
          {isTablet && !isMobile && (
            <Offcanvas
              show={showFilters}
              onHide={() => setShowFilters(false)}
              placement="start"
              style={{ width: "350px" }}
            >
              <Offcanvas.Body className="p-0">{renderFilterSidebar()}</Offcanvas.Body>
            </Offcanvas>
          )}

          {/* Main content */}
          <div className="flex-grow-1">
            {/* Results count and filter button for tablet */}
            {isTablet && !isMobile && (
              <div className="d-flex justify-content-between mb-3">
                <p className="mb-0">Tổng {totalCount} kết quả</p>
                <Button
                  variant="outline-primary"
                  className="d-flex align-items-center"
                  onClick={() => setShowFilters(true)}
                >
                  <FaFilter className="me-2" /> Bộ lọc
                </Button>
              </div>
            )}

            {/* Loading indicator */}
            {isSearching && (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Đang tìm kiếm...</p>
              </div>
            )}

            {/* Search error */}
            {searchError && !isSearching && (
              <div className="alert alert-danger mb-3">
                {searchError}
                <Button
                  variant="primary"
                  size="sm"
                  className="ms-2"
                  onClick={() => {
                    const currentType = roomType || activeTab;
                    performSearch(searchParams || (currentType ? { roomType: currentType } : {}))
                  }}
                >
                  Thử lại
                </Button>
              </div>
            )}

            {/* No results */}
            {!isSearching && !searchError && filteredListings.length === 0 && (
              <div className="alert alert-warning">
                Không tìm thấy kết quả phù hợp. Vui lòng thử lại với các tiêu chí khác.
              </div>
            )}

            {/* Listing results */}
            {!isSearching &&
              !searchError &&
              filteredListings.map((listing) => (
                <Card key={listing.id} className="mb-3 border-0 shadow-sm">
                  <div className="position-relative">
                    <div
                      className="position-absolute bg-danger text-white px-2 py-1"
                      style={{ top: "10px", left: "0", zIndex: 1 }}
                    >
                      HOT
                    </div>
                    <Row className="g-0">
                      <Col xs={12} md={4}>
                        <Card.Img
                          src={listing.image}
                          alt={listing.title}
                          style={{
                            height: isMobile ? "200px" : "100%",
                            objectFit: "cover",
                            width: "100%",
                          }}
                        />
                      </Col>
                      <Col xs={12} md={8}>
                        <Card.Body>
                          <div className="d-flex justify-content-between">
                            <Card.Title className="fw-bold mb-2">{listing.title}</Card.Title>
                            <FaHeart className="text-muted" style={{ cursor: "pointer" }} />
                          </div>
                          <Card.Text className="text-danger fw-bold mb-2">
                            {listing.price.toLocaleString()}/tháng
                          </Card.Text>
                          <div className="d-flex mb-2">
                            <span className="me-3">{listing.area}m²</span>
                          </div>
                          <div className="d-flex align-items-center text-muted mb-2">
                            <FaMapMarkerAlt className="me-1" />
                            {listing.location}
                          </div>
                          <Link to={`/phong-tro/${listing.id}`} className="text-decoration-none">
                            <Button variant="primary" className="mt-1">
                              Xem chi tiết
                            </Button>
                          </Link>
                        </Card.Body>
                      </Col>
                    </Row>
                  </div>
                </Card>
              ))}

            {/* Pagination */}
            {filteredListings.length > 0 && (
              <div className="d-flex justify-content-center mt-4">
                <nav aria-label="Page navigation">
                  <ul className="pagination">
                    <li className="page-item">
                      <a className="page-link" href="#" aria-label="Previous">
                        <span aria-hidden="true">«</span>
                      </a>
                    </li>
                    <li className="page-item active">
                      <a className="page-link" href="#">
                        1
                      </a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">
                        2
                      </a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">
                        3
                      </a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#" aria-label="Next">
                        <span aria-hidden="true">»</span>
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomSearchPage;