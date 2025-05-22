import { useParams, Link } from "react-router-dom";
import CategorySharedPage from "./CategorySharedPage";
import VideoReviewPage from "./VideoReviewPage";
import BlogPage from "./BlogPage";
import AllCategoriesPage from "./AllCategoriesPage";
import {
  SHARED_CATEGORIES,
  VIDEO_CATEGORY,
  BLOG_CATEGORY,
  categoryNameMap,
} from "../../data/categories";

// category -> roomType mapping
const CATEGORY_TO_ROOM_TYPE: Record<string, "APARTMENT" | "WHOLE_HOUSE" | "BOARDING_HOUSE"> = {
  "can-ho-chung-cu": "APARTMENT",
  "nha-nguyen-can": "WHOLE_HOUSE",
  "nha-tro-phong-tro": "BOARDING_HOUSE",
};

var i = 0;

const CategoryPage = () => {
  const { type } = useParams();

  if (!type) return <div>Không xác định danh mục.</div>;

  const categoryName = categoryNameMap[type] || type.replaceAll("-", " ");

  return (
    <div>
      {/* ✅ Breadcrumb */}
<p className="text-muted mb-3">
  <Link to="/" className="text-primary text-decoration-none fw-bold" >Trang chủ</Link> /{" "}
  <Link to="/category" className="text-muted text-decoration-none fw-bold">Danh mục</Link> /{" "}
  <strong>{categoryName}</strong>
</p>


      {/* ✅ Giao diện tùy loại */}
      {type === "tat-ca" && <AllCategoriesPage />}

      {SHARED_CATEGORIES.includes(type) && type !== "tat-ca" && (
        <CategorySharedPage title={categoryName} roomType={CATEGORY_TO_ROOM_TYPE[type]} />
      )}

      {type === VIDEO_CATEGORY && <VideoReviewPage />}
      {type === BLOG_CATEGORY && <BlogPage />}
    </div>
  );
};

export default CategoryPage;
