"use client"

import { useParams, Link } from "react-router-dom"
import CategorySharedPage from "./CategorySharedPage"
import VideoReviewPage from "./VideoReviewPage"
import BlogPage from "./BlogPage"
import AllCategoriesPage from "./AllCategoriesPage"
import { SHARED_CATEGORIES, VIDEO_CATEGORY, BLOG_CATEGORY, categoryNameMap } from "../../data/categories"
import { useResponsive } from "../../store/hook"

// category -> roomType mapping
const CATEGORY_TO_ROOM_TYPE: Record<string, "APARTMENT" | "WHOLE_HOUSE" | "BOARDING_HOUSE"> = {
  "can-ho-chung-cu": "APARTMENT",
  "nha-nguyen-can": "WHOLE_HOUSE",
  "nha-tro-phong-tro": "BOARDING_HOUSE",
}

const CategoryPage = () => {
  const { type } = useParams()
  const { isMobile } = useResponsive()

  if (!type) return <div>Không xác định danh mục.</div>

  const categoryName = categoryNameMap[type] || type.replaceAll("-", " ")

  return (
    <div className="container px-3 px-md-4 py-3">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb m-0">
          <li className="breadcrumb-item">
            <Link to="/" className="text-primary text-decoration-none fw-bold">
              Trang chủ
            </Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/category" className="text-muted text-decoration-none fw-bold">
              Danh mục
            </Link>
          </li>
          <li className="breadcrumb-item active fw-bold" aria-current="page">
            {categoryName}
          </li>
        </ol>
      </nav>

      {/* Category content */}
      <div className={isMobile ? "px-0" : ""}>
        {type === "tat-ca" && <AllCategoriesPage />}

        {SHARED_CATEGORIES.includes(type) && type !== "tat-ca" && (
          <CategorySharedPage title={categoryName} roomType={CATEGORY_TO_ROOM_TYPE[type]} />
        )}

        {type === VIDEO_CATEGORY && <VideoReviewPage />}
        {type === BLOG_CATEGORY && <BlogPage />}
      </div>
    </div>
  )
}

export default CategoryPage
