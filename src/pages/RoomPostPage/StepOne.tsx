"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Form, Button, Container, Row, Col, Card, Spinner, Offcanvas } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useForm, type Resolver } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { formCreateRoom, type FormCreateRoomSchema } from "../../utils/rules"
import { useMutation } from "@tanstack/react-query"
import roomApi from "../../apis/room.api"
import mediaAPI from "../../apis/media.api"
import type { Amenity, TargetAudience, SurroundingArea } from "../../types/room.type"
import Sidebar from "../MainPage/Sidebar"
import type { District, Province, Ward } from "../../types/address.type"
import addressAPI from "../../apis/address.api"
import {
  FaCamera,
  FaCloudUploadAlt,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaShower,
  FaBed,
  FaUtensils,
  FaCouch,
  FaUser,
  FaHome,
  FaBars,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa"
import * as cocoSsd from "@tensorflow-models/coco-ssd"
import "@tensorflow/tfjs"
import { useAppSelector } from "../../store/hook"

type ImageFeedback = {
  url: string
  feedback: string
  objectFlags: Record<string, boolean>
}

const StepOne = () => {
  const navigate = useNavigate()
  const { profile } = useAppSelector((state) => state.user)
  const [loading, setLoading] = useState(false)
  const [amenitiesList, setAmenitiesList] = useState<Amenity[]>([])
  const [targetAudiencesList, setTargetAudiencesList] = useState<TargetAudience[]>([])
  const [surroundingAreasList, setSurroundingAreasList] = useState<SurroundingArea[]>([])

  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [wards, setWards] = useState<Ward[]>([])

  const [selectedProvince, setSelectedProvince] = useState<string>("")
  const [selectedDistrict, setSelectedDistrict] = useState<string>("")
  const [selectedWard, setSelectedWard] = useState<string>("")
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null)
  const [imageFeedbacks, setImageFeedbacks] = useState<ImageFeedback[]>([])
  const [missingSuggestions, setMissingSuggestions] = useState<string>("")
  const [formProgress, setFormProgress] = useState(0)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)

  useEffect(() => {
    cocoSsd.load().then(setModel)
  }, [])

  // Set up form with validation
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormCreateRoomSchema>({
    resolver: yupResolver(formCreateRoom) as Resolver<FormCreateRoomSchema>,
    defaultValues: {
      address: {
        id: 77,
        province: "",
        district: "",
        ward: "",
        street: "",
        houseNumber: "",
        latitude: 1,
        longitude: 1,
      },
      posterName: profile?.fullName || "",
    },
  })

  // Calculate form progress
  const watchedFields = watch()
  useEffect(() => {
    const requiredFields = ["title", "roomType", "price", "area", "description", "posterName", "posterPhone"]
    const filledFields = requiredFields.filter((field) => {
      const value = watchedFields[field as keyof FormCreateRoomSchema]
      return value !== undefined && value !== null && value !== ""
    })
    const progress = (filledFields.length / requiredFields.length) * 100
    setFormProgress(progress)
  }, [watchedFields])

  // Create mutation for room creation
  const createRoomMutation = useMutation({
    mutationFn: async (body: FormCreateRoomSchema) => {
      const formData = new FormData()

      Object.entries(body).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === "address") {
            // Parse object thành từng trường
            Object.entries(value).forEach(([subKey, subValue]) => {
              formData.append(`address.${subKey}`, String(subValue))
            })
          } else if (
            ["amenities", "targetAudiences", "surroundingAreas", "images"].includes(key) &&
            Array.isArray(value)
          ) {
            value.forEach((item, index) => {
              if (typeof item === "object") {
                Object.entries(item).forEach(([k, v]) => {
                  formData.append(`${key}[${index}].${k}`, String(v))
                })
              } else {
                formData.append(`${key}[${index}]`, String(item))
              }
            })
          } else {
            formData.append(key, String(value))
          }
        }
      })

      return roomApi.createRoom(formData)
    },
    retry: 3,
    retryDelay: (attempt) => 3000 + (attempt - 1) * 1000,
    onSuccess: async (data) => {
      console.log("Mutation Success Response:", data)
      navigate("/post-room")
      toast.success("Đăng tin thành công!")
      localStorage.removeItem("listAPARTMENTPagging")
      localStorage.removeItem("listBOARDING_HOUSEPagging")
      localStorage.removeItem("listWHOLE_HOUSEPagging")
    },
    onError: (error) => {
      console.error("Mutation Error:", error)
      toast.error("Có lỗi xảy ra khi đăng tin. Vui lòng thử lại.")
    },
  })

  const onSubmit = async (data: FormCreateRoomSchema) => {
    try {
      // Start loading
      setLoading(true)
      
      // Validate image upload
      if (imageFiles.length === 0) {
        toast.error("Vui lòng tải lên ít nhất một hình ảnh")
        return
      }

      console.log("Uploading images...")
      // Upload images
      const uploadedImages = await uploadImages()
      if (!uploadedImages || uploadedImages.length === 0) {
        toast.error("Có lỗi xảy ra khi tải hình ảnh. Vui lòng thử lại.")
        return
      }
      console.log("Images uploaded successfully:", uploadedImages)

      // Set uploaded images to form data
      data.images = uploadedImages

      // Ensure selfManaged is boolean
      data.selfManaged = typeof data.selfManaged === "string" ? data.selfManaged === "true" : Boolean(data.selfManaged)
      
      console.log("Submitting form data:", data)
      // Submit data - use the mutation directly
      createRoomMutation.mutate(data)
    } catch (error) {
      console.error("Error in form submission:", error)
      toast.error("Có lỗi xảy ra khi xử lý biểu mẫu. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  // Fetch required data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Try to get data from localStorage first
        const amenitiesLS = localStorage.getItem(`amenities`)
        const targetAudiencesLS = localStorage.getItem(`targetAudiences`)
        const surroundingAreasLS = localStorage.getItem(`surroundingAreas`)
        const provincesLS = localStorage.getItem("provinces")

        // Check if all data is available in localStorage
        if (amenitiesLS && targetAudiencesLS && surroundingAreasLS && provincesLS) {
          setAmenitiesList(JSON.parse(amenitiesLS))
          setTargetAudiencesList(JSON.parse(targetAudiencesLS))
          setSurroundingAreasList(JSON.parse(surroundingAreasLS))
          setProvinces(JSON.parse(provincesLS))
          setLoading(false)
          return
        }

        // Fetch data from API if not available in localStorage
        const [amenitiesRes, audiencesRes, areasRes, provincesRes] = await Promise.all([
          roomApi.getAmenities(),
          roomApi.getTargetAudiences(),
          roomApi.getSurroundingAreas(),
          addressAPI.getProvinces(),
        ])

        if (amenitiesRes.data?.data) {
          setAmenitiesList(amenitiesRes.data.data)
          localStorage.setItem(`amenities`, JSON.stringify(amenitiesRes.data.data))
        }

        if (audiencesRes.data?.data) {
          setTargetAudiencesList(audiencesRes.data.data)
          localStorage.setItem(`targetAudiences`, JSON.stringify(audiencesRes.data.data))
        }

        if (areasRes.data?.data) {
          setSurroundingAreasList(areasRes.data.data)
          localStorage.setItem(`surroundingAreas`, JSON.stringify(areasRes.data.data))
        }

        if (provincesRes.data?.data?.data) {
          setProvinces(provincesRes.data.data.data)
          localStorage.setItem("provinces", JSON.stringify(provincesRes.data.data.data))
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Không thể tải dữ liệu. Vui lòng thử lại sau.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Clean up image previews when component unmounts
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  // Fetch districts when province changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!selectedProvince) {
        setDistricts([])
        return
      }

      try {
        setLoading(true)
        const response = await addressAPI.getDistricts(selectedProvince)
        if (response.data?.data?.data) {
          setDistricts(response.data.data.data as District[])
        }
      } catch (error) {
        console.error("Error fetching districts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDistricts()
    setSelectedDistrict("")
    setSelectedWard("")
    setWards([])
  }, [selectedProvince])

  // Fetch wards when district changes
  useEffect(() => {
    const fetchWards = async () => {
      if (!selectedDistrict) {
        setWards([])
        return
      }

      try {
        setLoading(true)
        const response = await addressAPI.getWards(selectedDistrict)
        if (response.data?.data?.data) {
          setWards(response.data.data.data as Ward[])
        }
      } catch (error) {
        console.error("Error fetching wards:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWards()
    setSelectedWard("")
  }, [selectedDistrict])

  // Handle checkbox changes for amenities, target audiences, surrounding areas
  const handleCheckboxChange = (
    id: number,
    name: string,
    type: "amenities" | "targetAudiences" | "surroundingAreas",
    checked: boolean,
  ) => {
    const currentValues = watch(type) || []

    if (checked) {
      setValue(type, [...currentValues, { id, name }])
    } else {
      setValue(
        type,
        currentValues.filter((item) => item.id !== id),
      )
    }
  }

  const analyzeImage = (file: File, url: string): Promise<ImageFeedback> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.src = url

      img.onload = async () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")!
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const predictions = await model!.detect(img)
        const classes = predictions.map((p) => p.class)

        const objectFlags: Record<string, boolean> = {
          bed: false,
          chair: false,
          table: false,
          tv: false,
          refrigerator: false,
          window: false,
          sink: false,
          toilet: false,
          microwave: false,
          laptop: false,
        }

        classes.forEach((cls) => {
          if (objectFlags.hasOwnProperty(cls)) objectFlags[cls] = true
        })

        const detected: string[] = []
        if (objectFlags.bed) detected.push("Giường")
        if (objectFlags.table || objectFlags.chair) detected.push("Bàn/Ghế")
        if (objectFlags.tv) detected.push("TV")
        if (objectFlags.refrigerator) detected.push("Tủ lạnh")
        if (objectFlags.window) detected.push("Cửa sổ")
        if (objectFlags.sink || objectFlags.toilet) detected.push("Nhà vệ sinh")
        if (objectFlags.microwave) detected.push("Bếp điện")
        if (objectFlags.laptop) detected.push("Bàn làm việc")

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const pixels = imageData.data
        let totalBrightness = 0
        for (let i = 0; i < pixels.length; i += 4) {
          totalBrightness += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3
        }
        const avgBrightness = totalBrightness / (pixels.length / 4)

        let feedback = `✅ Vật thể phát hiện: ${detected.join(", ") || "Không rõ vật thể chính"}.\n`
        feedback += avgBrightness < 100 ? "⚠️ Ảnh hơi tối. Nên chụp lại với ánh sáng tốt hơn.\n" : "💡 Ảnh đủ sáng.\n"

        resolve({ url, feedback, objectFlags })
      }
    })
  }

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files || files.length === 0) return

    // Limit to 10 images total
    const remainingSlots = 10 - imageFiles.length
    const filesToAdd = files.slice(0, remainingSlots)

    if (filesToAdd.length === 0) {
      toast.warning("Bạn đã đạt giới hạn 10 ảnh")
      return
    }

    // Create preview URLs for new files
    const newPreviewUrls = filesToAdd.map((file) => URL.createObjectURL(file))

    // Update state immediately
    setImageFiles((prevFiles) => [...prevFiles, ...filesToAdd])
    setImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviewUrls])

    // Run AI analysis if model is loaded
    if (model) {
      const newFeedbacks: ImageFeedback[] = []
      const allDetectedFlags: Record<string, boolean> = {
        bed: false,
        chair: false,
        table: false,
        tv: false,
        refrigerator: false,
        window: false,
        sink: false,
        toilet: false,
        microwave: false,
        laptop: false,
      }

      // Tổng hợp từ ảnh đã có trước đó
      imageFeedbacks.forEach((item) => {
        Object.keys(item.objectFlags).forEach((key) => {
          allDetectedFlags[key] ||= item.objectFlags[key]
        })
      })

      // Phân tích ảnh mới
      for (let i = 0; i < filesToAdd.length; i++) {
        const file = filesToAdd[i]
        const url = newPreviewUrls[i]
        try {
          const result = await analyzeImage(file, url)
          newFeedbacks.push(result)

          Object.keys(result.objectFlags).forEach((key) => {
            allDetectedFlags[key] ||= result.objectFlags[key]
          })
        } catch (error) {
          console.error("Error analyzing image:", error)
        }
      }

      setImageFeedbacks((prev) => [...prev, ...newFeedbacks])

      // Cập nhật gợi ý
      const missing: string[] = []
      if (!allDetectedFlags.window) missing.push("cửa sổ")
      if (!allDetectedFlags.bed) missing.push("giường")
      if (!allDetectedFlags.tv && !allDetectedFlags.refrigerator) missing.push("TV hoặc Tủ lạnh")
      if (!allDetectedFlags.sink && !allDetectedFlags.toilet) missing.push("hình ảnh nhà vệ sinh")

      if (missing.length > 0) {
        setMissingSuggestions(`📌 Gợi ý bổ sung: ${missing.join(", ")}.`)
      } else {
        setMissingSuggestions("👍 Bộ ảnh đã khá đầy đủ cho việc đăng trọ.")
      }
    }

    // Reset input value để có thể chọn lại cùng file
    e.target.value = ""
  }

  // Remove selected image
  const handleRemoveImage = (index: number) => {
    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index])

    // Remove from arrays
    const newFiles = imageFiles.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    const newFeedbacks = imageFeedbacks.filter((_, i) => i !== index)

    setImageFiles(newFiles)
    setImagePreviews(newPreviews)
    setImageFeedbacks(newFeedbacks)

    // Cập nhật lại gợi ý nếu còn ảnh
    if (newFeedbacks.length > 0) {
      const combinedFlags: Record<string, boolean> = {
        bed: false,
        chair: false,
        table: false,
        tv: false,
        refrigerator: false,
        window: false,
        sink: false,
        toilet: false,
        microwave: false,
        laptop: false,
      }

      newFeedbacks.forEach((item) => {
        Object.keys(item.objectFlags).forEach((key) => {
          combinedFlags[key] ||= item.objectFlags[key]
        })
      })

      const missing: string[] = []
      if (!combinedFlags.window) missing.push("cửa sổ")
      if (!combinedFlags.bed) missing.push("giường")
      if (!combinedFlags.tv && !combinedFlags.refrigerator) missing.push("TV hoặc Tủ lạnh")
      if (!combinedFlags.sink && !combinedFlags.toilet) missing.push("hình ảnh nhà vệ sinh")

      if (missing.length > 0) {
        setMissingSuggestions(`📌 Gợi ý bổ sung: ${missing.join(", ")}.`)
      } else {
        setMissingSuggestions("👍 Bộ ảnh đã khá đầy đủ cho việc đăng trọ.")
      }
    } else {
      setMissingSuggestions("")
    }
  }

  // Upload images
  const uploadImages = async () => {
    if (imageFiles.length === 0) return []

    try {
      let uploadedImages
      if (imageFiles.length === 1) {
        // Upload single file
        const response = await mediaAPI.uploadFile(imageFiles[0])
        console.log("Single Image Upload Response:", response)
        const mediaItem = response.data.data
        uploadedImages = [
          {
            id: 30,
            publicId: mediaItem.publicId,
            imageUrl: mediaItem.imageUrl,
          },
        ]
      } else {
        // Upload multiple files
        const response = await mediaAPI.uploadFiles(imageFiles)
        console.log("Multiple Images Upload Response:", response)
        uploadedImages = response.data.data.map((media: any) => ({
          id: 30,
          publicId: media.publicId,
          imageUrl: media.imageUrl,
        }))
      }
      return uploadedImages
    } catch (error) {
      console.error("Error uploading images:", error)
      toast.error("Không thể tải lên hình ảnh. Vui lòng thử lại.")
      throw error
    }
  }

  if (loading && !amenitiesList.length) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  return (
    <div className="bg-light min-vh-100">
      <Container fluid>
        <Row>
          {/* Mobile Header */}
          <div className="d-lg-none sticky-top bg-white border-bottom p-3 shadow-sm">
            <div className="d-flex align-items-center gap-3">
              <Button
                variant="outline-secondary"
                size="sm"
                className="d-flex align-items-center justify-content-center"
                onClick={() => setShowMobileSidebar(true)}
                style={{ width: "40px", height: "40px", borderRadius: "8px" }}
              >
                <FaBars size={16} />
              </Button>
              <h6 className="mb-0 fw-semibold" style={{ color: "#0054cd" }}>
                Đăng tin mới
              </h6>
            </div>
          </div>

          {/* Desktop Sidebar */}
          <Col lg={3} className="d-none d-lg-block px-0">
            <div style={{ position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
              <Sidebar />
            </div>
          </Col>

          {/* Mobile Sidebar Offcanvas */}
          <Offcanvas
            show={showMobileSidebar}
            onHide={() => setShowMobileSidebar(false)}
            placement="start"
            className="d-lg-none"
            style={{ width: "280px" }}
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Menu</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="p-0">
              <Sidebar />
            </Offcanvas.Body>
          </Offcanvas>

          {/* Main Content */}
          <Col lg={9} className="px-3 px-md-4">
            <div className="py-4">
              {/* Enhanced Header */}
              <div className="mb-4">
                <h1 className="h2 mb-2 fw-bold text-dark">Đăng tin mới</h1>
                <p className="text-muted mb-3">Điền đầy đủ thông tin để đăng tin cho thuê phòng trọ</p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <small className="text-muted">Tiến độ hoàn thành</small>
                    <small className="fw-medium" style={{ color: "#0054cd" }}>
                      {Math.round(formProgress)}%
                    </small>
                  </div>
                  <div className="progress" style={{ height: "8px" }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{
                        width: `${formProgress}%`,
                        backgroundColor: "#0054cd",
                      }}
                    />
                  </div>
                </div>
              </div>

              <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Hidden fields */}
                <Form.Control
                  type="number"
                  value={profile?.id}
                  className={errors.userId ? "is-invalid d-none" : "d-none"}
                  {...register("userId")}
                />
                <Form.Control
                  type="text"
                  value={new Date().toISOString()}
                  className={errors.createdAt ? "is-invalid d-none" : "d-none"}
                  {...register("createdAt")}
                />
                <Form.Control
                  type="text"
                  value={new Date().toISOString()}
                  className={errors.updatedAt ? "is-invalid d-none" : "d-none"}
                  {...register("updatedAt")}
                />

                {/* Basic Information Card */}
                <Card className="mb-4 shadow-sm border-0">
                  <Card.Header
                    className="text-white py-3"
                    style={{
                      background: "linear-gradient(135deg, #0054cd 0%, #0046a8 100%)",
                      borderRadius: "0.375rem 0.375rem 0 0",
                    }}
                  >
                    <h5 className="mb-0 d-flex align-items-center">
                      <FaInfoCircle className="me-2" /> Thông tin cơ bản
                    </h5>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <Row className="mb-3">
                      <Col lg={8}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            Tiêu đề <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Nhập tiêu đề tin đăng"
                            className={`${errors.title ? "is-invalid" : ""} rounded-3`}
                            {...register("title")}
                          />
                          {errors.title && <div className="invalid-feedback">{errors.title.message}</div>}
                        </Form.Group>
                      </Col>

                      <Col lg={4}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            Loại phòng <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Select
                            className={`${errors.roomType ? "is-invalid" : ""} rounded-3`}
                            {...register("roomType")}
                          >
                            <option value="BOARDING_HOUSE">Phòng trọ</option>
                            <option value="WHOLE_HOUSE">Nhà nguyên căn</option>
                            <option value="APARTMENT">Căn hộ</option>
                          </Form.Select>
                          {errors.roomType && <div className="invalid-feedback">{errors.roomType.message}</div>}
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row className="mb-4">
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            Giá thuê (VNĐ/tháng) <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="Nhập giá thuê"
                            className={`${errors.price ? "is-invalid" : ""} rounded-3`}
                            {...register("price")}
                          />
                          {errors.price && <div className="invalid-feedback">{errors.price.message}</div>}
                        </Form.Group>
                      </Col>

                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            Diện tích (m²) <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="Nhập diện tích"
                            className={`${errors.area ? "is-invalid" : ""} rounded-3`}
                            {...register("area")}
                          />
                          {errors.area && <div className="invalid-feedback">{errors.area.message}</div>}
                        </Form.Group>
                      </Col>

                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Đặt cọc (VNĐ)</Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="Nhập số tiền đặt cọc"
                            className="rounded-3"
                            {...register("deposit")}
                          />
                          {errors.deposit && <div className="invalid-feedback">{errors.deposit.message}</div>}
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        Mô tả chi tiết <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        placeholder="Mô tả chi tiết về phòng trọ, tiện ích, điều kiện, quy định..."
                        className={`${errors.description ? "is-invalid" : ""} rounded-3`}
                        {...register("description")}
                      />
                      {errors.description && <div className="invalid-feedback">{errors.description.message}</div>}
                      <Form.Text className="text-muted">
                        Mô tả càng chi tiết, cơ hội tìm được người thuê càng cao
                      </Form.Text>
                    </Form.Group>
                  </Card.Body>
                </Card>

                {/* Room Details Card */}
                <Card className="mb-4 shadow-sm border-0">
                  <Card.Header
                    className="text-white py-3"
                    style={{
                      background: "linear-gradient(135deg, #0054cd 0%, #0046a8 100%)",
                      borderRadius: "0.375rem 0.375rem 0 0",
                    }}
                  >
                    <h5 className="mb-0 d-flex align-items-center">
                      <FaHome className="me-2" /> Thông tin phòng
                    </h5>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <Row className="mb-4">
                      <Col md={6} lg={3}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Tổng số phòng</Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="Nhập số phòng"
                            className={`${errors.totalRooms ? "is-invalid" : ""} rounded-3`}
                            {...register("totalRooms")}
                          />
                          {errors.totalRooms && <div className="invalid-feedback">{errors.totalRooms.message}</div>}
                        </Form.Group>
                      </Col>

                      <Col md={6} lg={3}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Số người tối đa</Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="Nhập số người ở tối đa"
                            className={`${errors.maxPeople ? "is-invalid" : ""} rounded-3`}
                            {...register("maxPeople")}
                          />
                          {errors.maxPeople && <div className="invalid-feedback">{errors.maxPeople.message}</div>}
                        </Form.Group>
                      </Col>

                      <Col md={6} lg={3}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Đối tượng thuê</Form.Label>
                          <Form.Select
                            className={`${errors.forGender ? "is-invalid" : ""} rounded-3`}
                            {...register("forGender")}
                          >
                            <option value="ALL">Tất cả</option>
                            <option value="MALE">Nam</option>
                            <option value="FEMALE">Nữ</option>
                          </Form.Select>
                          {errors.forGender && <div className="invalid-feedback">{errors.forGender.message}</div>}
                        </Form.Group>
                      </Col>

                      <Col md={6} lg={3}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Chủ trọ quản lý</Form.Label>
                          <Form.Select
                            className={`${errors.selfManaged ? "is-invalid" : ""} rounded-3`}
                            {...register("selfManaged")}
                          >
                            <option value="false">Không</option>
                            <option value="true">Có</option>
                          </Form.Select>
                          {errors.selfManaged && <div className="invalid-feedback">{errors.selfManaged.message}</div>}
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6} lg={3}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold d-flex align-items-center">
                            <FaCouch className="me-2" style={{ color: "#0054cd" }} />
                            Phòng khách
                          </Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="Số phòng khách"
                            className={`${errors.numberOfLivingRooms ? "is-invalid" : ""} rounded-3`}
                            {...register("numberOfLivingRooms", {})}
                          />
                          {errors.numberOfLivingRooms && (
                            <div className="invalid-feedback">{errors.numberOfLivingRooms.message}</div>
                          )}
                        </Form.Group>
                      </Col>

                      <Col md={6} lg={3}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold d-flex align-items-center">
                            <FaBed className="me-2" style={{ color: "#0054cd" }} />
                            Phòng ngủ
                          </Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="Số phòng ngủ"
                            className={`${errors.numberOfBedrooms ? "is-invalid" : ""} rounded-3`}
                            {...register("numberOfBedrooms", {})}
                          />
                          {errors.numberOfBedrooms && (
                            <div className="invalid-feedback">{errors.numberOfBedrooms.message}</div>
                          )}
                        </Form.Group>
                      </Col>

                      <Col md={6} lg={3}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold d-flex align-items-center">
                            <FaShower className="me-2" style={{ color: "#0054cd" }} />
                            Phòng tắm
                          </Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="Số phòng tắm"
                            className={`${errors.numberOfBathrooms ? "is-invalid" : ""} rounded-3`}
                            {...register("numberOfBathrooms", {})}
                          />
                          {errors.numberOfBathrooms && (
                            <div className="invalid-feedback">{errors.numberOfBathrooms.message}</div>
                          )}
                        </Form.Group>
                      </Col>

                      <Col md={6} lg={3}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold d-flex align-items-center">
                            <FaUtensils className="me-2" style={{ color: "#0054cd" }} />
                            Nhà bếp
                          </Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="Số nhà bếp"
                            className={`${errors.numberOfKitchens ? "is-invalid" : ""} rounded-3`}
                            {...register("numberOfKitchens", {})}
                          />
                          {errors.numberOfKitchens && (
                            <div className="invalid-feedback">{errors.numberOfKitchens.message}</div>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Address Card */}
                <Card className="mb-4 shadow-sm border-0">
                  <Card.Header
                    className="text-white py-3"
                    style={{
                      background: "linear-gradient(135deg, #0054cd 0%, #0046a8 100%)",
                      borderRadius: "0.375rem 0.375rem 0 0",
                    }}
                  >
                    <h5 className="mb-0 d-flex align-items-center">
                      <FaMapMarkerAlt className="me-2" /> Địa chỉ cho thuê
                    </h5>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <Row className="mb-3">
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            Tỉnh/Thành phố <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Select
                            value={selectedProvince}
                            onChange={(e) => {
                              const selectedCode = e.target.value
                              const selected = provinces.find((p) => p.code.toString() === selectedCode)
                              setSelectedProvince(selectedCode)
                              setValue("address.province", selected?.name || "")
                            }}
                            className={`${errors.address?.province ? "is-invalid" : ""} rounded-3`}
                          >
                            <option value="">Chọn Tỉnh/Thành phố</option>
                            {provinces.map((province) => (
                              <option key={province.code} value={province.code}>
                                {province.name_with_type}
                              </option>
                            ))}
                          </Form.Select>
                          {errors.address?.province && (
                            <div className="invalid-feedback">{errors.address.province.message}</div>
                          )}
                        </Form.Group>
                      </Col>

                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            Quận/Huyện <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Select
                            value={selectedDistrict}
                            onChange={(e) => {
                              const value = e.target.value
                              const selected = districts.find((d) => d.code.toString() === value)
                              setSelectedDistrict(value)
                              setValue("address.district", selected?.name_with_type || "")
                            }}
                            disabled={!selectedProvince}
                            className={`${errors.address?.district ? "is-invalid" : ""} rounded-3`}
                          >
                            <option value="">Chọn Quận/Huyện</option>
                            {districts.map((district) => (
                              <option key={district.code} value={district.code}>
                                {district.name_with_type}
                              </option>
                            ))}
                          </Form.Select>
                          {errors.address?.district && (
                            <div className="invalid-feedback">{errors.address.district.message}</div>
                          )}
                        </Form.Group>
                      </Col>

                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            Phường/Xã <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Select
                            value={selectedWard}
                            onChange={(e) => {
                              const value = e.target.value
                              const selected = wards.find((w) => w.code.toString() === value)
                              setSelectedWard(value)
                              setValue("address.ward", selected?.name_with_type || "")
                            }}
                            disabled={!selectedDistrict}
                            className={`${errors.address?.ward ? "is-invalid" : ""} rounded-3`}
                          >
                            <option value="">Chọn Phường/Xã</option>
                            {wards.map((ward) => (
                              <option key={ward.code} value={ward.code}>
                                {ward.name_with_type}
                              </option>
                            ))}
                          </Form.Select>
                          {errors.address?.ward && (
                            <div className="invalid-feedback">{errors.address.ward.message}</div>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            Đường/Phố <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Nhập tên đường/phố"
                            className={`${errors.address?.street ? "is-invalid" : ""} rounded-3`}
                            {...register("address.street")}
                          />
                          {errors.address?.street && (
                            <div className="invalid-feedback">{errors.address.street.message}</div>
                          )}
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            Số nhà <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Nhập số nhà"
                            className={`${errors.address?.houseNumber ? "is-invalid" : ""} rounded-3`}
                            {...register("address.houseNumber")}
                          />
                          {errors.address?.houseNumber && (
                            <div className="invalid-feedback">{errors.address.houseNumber.message}</div>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Amenities Card */}
                <Card className="mb-4 shadow-sm border-0">
                  <Card.Header
                    className="text-white py-3"
                    style={{
                      background: "linear-gradient(135deg, #0054cd 0%, #0046a8 100%)",
                      borderRadius: "0.375rem 0.375rem 0 0",
                    }}
                  >
                    <h5 className="mb-0">Tiện ích</h5>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <p className="text-muted mb-4">Chọn tiện ích có sẵn tại phòng trọ</p>
                    <Row>
                      {amenitiesList.map((amenity) => (
                        <Col xs={6} md={4} lg={3} key={amenity.id} className="mb-3">
                          <Form.Check
                            type="checkbox"
                            id={`amenity-${amenity.id}`}
                            label={amenity.name}
                            onChange={(e) =>
                              handleCheckboxChange(amenity.id, amenity.name, "amenities", e.target.checked)
                            }
                            className="user-select-none"
                          />
                        </Col>
                      ))}
                    </Row>
                  </Card.Body>
                </Card>

                {/* Target Audiences Card */}
                <Card className="mb-4 shadow-sm border-0">
                  <Card.Header
                    className="text-white py-3"
                    style={{
                      background: "linear-gradient(135deg, #0054cd 0%, #0046a8 100%)",
                      borderRadius: "0.375rem 0.375rem 0 0",
                    }}
                  >
                    <h5 className="mb-0">Đối tượng phù hợp</h5>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <p className="text-muted mb-4">Chọn đối tượng phù hợp để thuê phòng của bạn</p>
                    <Row>
                      {targetAudiencesList.map((audience) => (
                        <Col xs={6} md={4} lg={3} key={audience.id} className="mb-3">
                          <Form.Check
                            type="checkbox"
                            id={`audience-${audience.id}`}
                            label={audience.name}
                            onChange={(e) =>
                              handleCheckboxChange(audience.id, audience.name, "targetAudiences", e.target.checked)
                            }
                            className="user-select-none"
                          />
                        </Col>
                      ))}
                    </Row>
                  </Card.Body>
                </Card>

                {/* Surrounding Areas Card */}
                <Card className="mb-4 shadow-sm border-0">
                  <Card.Header
                    className="text-white py-3"
                    style={{
                      background: "linear-gradient(135deg, #0054cd 0%, #0046a8 100%)",
                      borderRadius: "0.375rem 0.375rem 0 0",
                    }}
                  >
                    <h5 className="mb-0">Khu vực xung quanh</h5>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <p className="text-muted mb-4">Chọn các địa điểm gần phòng trọ của bạn</p>
                    <Row>
                      {surroundingAreasList.map((area) => (
                        <Col xs={6} md={4} lg={3} key={area.id} className="mb-3">
                          <Form.Check
                            type="checkbox"
                            id={`area-${area.id}`}
                            label={area.name}
                            onChange={(e) =>
                              handleCheckboxChange(area.id, area.name, "surroundingAreas", e.target.checked)
                            }
                            className="user-select-none"
                          />
                        </Col>
                      ))}
                    </Row>
                  </Card.Body>
                </Card>

                {/* Images Card */}
                <Card className="mb-4 shadow-sm border-0">
                  <Card.Header
                    className="text-white py-3"
                    style={{
                      background: "linear-gradient(135deg, #0054cd 0%, #0046a8 100%)",
                      borderRadius: "0.375rem 0.375rem 0 0",
                    }}
                  >
                    <h5 className="mb-0 d-flex align-items-center">
                      <FaCamera className="me-2" /> Hình ảnh
                    </h5>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <p className="text-muted mb-4">
                      Thêm hình ảnh giúp người thuê dễ dàng tìm thấy phòng của bạn. Đăng tối đa 10 ảnh.
                    </p>

                    <div className="mb-4">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                        id="images-input"
                      />

                      <div
                        className="border border-2 border-dashed rounded-3 p-4 text-center"
                        style={{
                          borderColor: "#dee2e6",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          minHeight: "120px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onClick={() => document.getElementById("images-input")?.click()}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#0054cd"
                          e.currentTarget.style.backgroundColor = "#f8f9ff"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#dee2e6"
                          e.currentTarget.style.backgroundColor = "transparent"
                        }}
                      >
                        <div>
                          <FaCloudUploadAlt size={32} className="text-muted mb-2" />
                          <p className="text-muted mb-1">Nhấn để tải ảnh lên hoặc kéo thả ảnh vào đây</p>
                          <small className="text-muted">PNG, JPG, GIF tối đa 10MB mỗi ảnh</small>
                        </div>
                      </div>

                      {imagePreviews.length === 0 && errors.images && (
                        <div className="text-danger mt-3">{errors.images.message}</div>
                      )}

                      {imagePreviews.length > 0 && (
                        <div className="mt-4">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <p className="fw-semibold mb-0">Ảnh đã chọn ({imagePreviews.length}/10)</p>
                            {imagePreviews.length >= 3 && (
                              <span className="badge bg-success d-flex align-items-center">
                                <FaCheckCircle className="me-1" size={12} />
                                Đủ ảnh
                              </span>
                            )}
                          </div>
                          <Row className="g-3">
                            {imagePreviews.map((preview, index) => (
                              <Col xs={6} md={4} lg={3} xl={2} key={index}>
                                <div className="position-relative">
                                  <img
                                    src={preview || "/placeholder.svg"}
                                    alt={`Preview ${index + 1}`}
                                    className="img-thumbnail w-100"
                                    style={{
                                      height: "120px",
                                      objectFit: "cover",
                                    }}
                                  />
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    className="position-absolute top-0 end-0 rounded-circle"
                                    style={{
                                      width: "24px",
                                      height: "24px",
                                      padding: 0,
                                      transform: "translate(25%, -25%)",
                                    }}
                                    onClick={() => handleRemoveImage(index)}
                                  >
                                    <FaTimes size={10} />
                                  </Button>
                                </div>
                              </Col>
                            ))}
                          </Row>
                        </div>
                      )}

                      {imagePreviews.length < 3 && imagePreviews.length > 0 && (
                        <div className="alert alert-warning mt-3 d-flex align-items-center">
                          <FaExclamationTriangle className="me-2" />
                          Khuyến nghị tải lên ít nhất 3 ảnh để tăng cơ hội được thuê
                        </div>
                      )}

                      {imageFeedbacks.length > 0 && (
                        <div
                          className="mt-3 p-3 rounded-3"
                          style={{
                            background: "linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)",
                            border: "1px solid #e1f5fe",
                          }}
                        >
                          <strong style={{ color: "#0054cd" }}>{missingSuggestions}</strong>
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>

                {/* Contact Information Card */}
                <Card className="mb-4 shadow-sm border-0">
                  <Card.Header
                    className="text-white py-3"
                    style={{
                      background: "linear-gradient(135deg, #0054cd 0%, #0046a8 100%)",
                      borderRadius: "0.375rem 0.375rem 0 0",
                    }}
                  >
                    <h5 className="mb-0 d-flex align-items-center">
                      <FaUser className="me-2" /> Thông tin liên hệ
                    </h5>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            Tên người liên hệ <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Nhập tên người liên hệ"
                            value={profile?.fullName}
                            className={`${errors.posterName ? "is-invalid" : ""} rounded-3`}
                            {...register("posterName")}
                          />
                          {errors.posterName && <div className="invalid-feedback">{errors.posterName.message}</div>}
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            Số điện thoại <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Nhập số điện thoại"
                            className={`${errors.posterPhone ? "is-invalid" : ""} rounded-3`}
                            {...register("posterPhone")}
                          />
                          {errors.posterPhone && <div className="invalid-feedback">{errors.posterPhone.message}</div>}
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Submit Button */}
                <div className="text-center pt-4 pb-5">
                  <Button
                    type="submit"
                    size="lg"
                    className="px-5 py-3 fw-semibold"
                    style={{
                      backgroundColor: "#0054cd",
                      borderColor: "#0054cd",
                      fontSize: "1.1rem",
                      borderRadius: "12px",
                      minWidth: "200px",
                    }}
                    disabled={loading || isSubmitting}
                  >
                    {loading || isSubmitting ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Đang xử lý...
                      </>
                    ) : (
                      "Đăng tin"
                    )}
                  </Button>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default StepOne
