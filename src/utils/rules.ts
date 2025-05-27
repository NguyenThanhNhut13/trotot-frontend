import * as yup from "yup";

function testPriceMinMax(this: yup.TestContext<yup.AnyObject>) {
  const { price_max, price_min } = this.parent as {
    price_min: string;
    price_max: string;
  };
  if (price_min !== "" && price_max !== "") {
    return Number(price_max) >= Number(price_min);
  }
  return price_min !== "" || price_max !== "";
}

const handleConfirmPasswordYup = (refString: string) => {
  return yup
    .string()
    .required("Nhập lại password là bắt buộc")
    .min(6, "Độ dài từ 6 - 160 ký tự")
    .max(160, "Độ dài từ 6 - 160 ký tự")
    .oneOf([yup.ref(refString)], "Nhập lại password không khớp");
};

export const schema = yup.object({
  credential: yup
    .string()
    .required("Email là bắt buộc")
    .email("Email không đúng định dạng")
    .min(5, "Độ dài từ 5 - 160 ký tự")
    .max(160, "Độ dài từ 5 - 160 ký tự"),
  fullName: yup
    .string()
    .required("Họ tên là bắt buộc")
    .max(160, "Họ tên tối đa 160 ký tự"),
  email: yup
    .string()
    .required("Email là bắt buộc")
    .email("Email không đúng định dạng")
    .min(5, "Độ dài từ 5 - 160 ký tự")
    .max(160, "Độ dài từ 5 - 160 ký tự"),
  password: yup
    .string()
    .required("Password là bắt buộc")
    .min(6, "Độ dài từ 6 - 160 ký tự")
    .max(160, "Độ dài từ 6 - 160 ký tự"),
  confirmPassword: handleConfirmPasswordYup("password"),
  price_min: yup.string().test({
    name: "price-not-allowed",
    message: "Giá không phù hợp",
    test: testPriceMinMax,
  }),
  price_max: yup.string().test({
    name: "price-not-allowed",
    message: "Giá không phù hợp",
    test: testPriceMinMax,
  }),
  displayName: yup
    .string()
    .required("Tên là bắt buộc")
    .max(160, "Độ dài tối đa là 160 ký tự"),
  username: yup
    .string()
    .required("Username là bắt buộc")
    .min(5, "Độ dài từ 5 - 160 ký tự")
    .max(160, "Độ dài từ 5 - 160 ký tự"),
});

export const userSchema = yup.object({
  id: yup.string().required("ID là bắt buộc"),
  fullName: yup
    .string()
    .max(255, "Tên đầy đủ không được vượt quá 255 ký tự")
    .required("Tên đầy đủ là bắt buộc"),
  address: yup
    .string()
    .max(500, "Địa chỉ không được vượt quá 500 ký tự")
    .required("Địa chỉ là bắt buộc"),
  gender: yup
    .string()
    .oneOf(["MALE", "FEMALE", "OTHER", ""], "Giới tính không hợp lệ")
    .required("Giới tính là bắt buộc"),
  dob: yup.string().required("Ngày sinh là bắt buộc"),
  cccd: yup
    .string()
    .max(12, "CCCD không được vượt quá 12 ký tự")
    .required("CCCD là bắt buộc"),
});

export const loginSchema = yup.object({
  credential: yup
    .string()
    .required("Email hoặc số điện thoại là bắt buộc")
    .min(5, "Độ dài từ 5 - 160 ký tự")
    .max(160, "Độ dài từ 5 - 160 ký tự"),
  password: yup
    .string()
    .required("Mật khẩu là bắt buộc")
    .min(6, "Độ dài từ 6 - 160 ký tự")
    .max(160, "Độ dài từ 6 - 160 ký tự"),
});

export const formCreateRoom = yup.object({
  userId: yup
    .number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? undefined : value
    )
    .required("User ID là bắt buộc"),
  address: yup.object({
    id: yup.number().required("ID địa chỉ là bắt buộc"),
    province: yup.string().required("Tỉnh/Thành phố là bắt buộc"),
    district: yup.string().required("Quận/Huyện là bắt buộc"),
    ward: yup.string().required("Phường/Xã là bắt buộc"),
    street: yup.string().required("Đường là bắt buộc"),
    houseNumber: yup.string().required("Số nhà là bắt buộc"),
    latitude: yup.number(),
    longitude: yup.number(),
  }),
  title: yup
    .string()
    .required("Tên phòng trọ")
    .max(200, "Tên phòng trọ không được quá 200 ký tự"),
  description: yup
    .string()
    .required("Mô tả là bắt buộc")
    .max(2000, "Mô tả không được quá 2000 ký tự")
    .test(
      "min-words",
      "Mô tả phải có ít nhất 10 từ",
      (value) =>
        typeof value === "string" && value.trim().split(/\s+/).length >= 10
    ),
  price: yup
    .number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? undefined : value
    )
    .required("Giá là bắt buộc")
    .positive("Giá phải là số dương"),
  area: yup
    .number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? undefined : value
    )
    .required("Diện tích là bắt buộc")
    .positive("Diện tích phải là số dương"),
  selfManaged: yup.boolean().required("Quản lý bản thân là bắt buộc"),
  totalRooms: yup
    .number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? undefined : value
    )
    .required("Tổng số phòng là bắt buộc")
    .positive("Tổng số phòng phải là số dương")
    .integer("Tổng số phòng phải là số nguyên"),
  maxPeople: yup
    .number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? undefined : value
    )
    .required("Số người tối đa là bắt buộc")
    .positive("Số người tối đa phải là số dương")
    .integer("Số người tối đa phải là số nguyên"),
  forGender: yup
    .string()
    .oneOf(["ALL", "MALE", "FEMALE", "OTHER"], "Giới tính không hợp lệ")
    .required("Giới tính là bắt buộc"),
  deposit: yup
    .number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? undefined : value
    )
    .required("Tiền đặt cọc là bắt buộc")
    .min(0, "Tiền đặt cọc không được âm"),
  posterName: yup
    .string()
    .required("Tên người đăng là bắt buộc")
    .max(100, "Tên người đăng không được quá 100 ký tự"),
  posterPhone: yup
    .string()
    .required("Số điện thoại người đăng là bắt buộc")
    .matches(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ"),
  // Simplify the images validation to make it work better
  images: yup
    .array()
    .of(
      yup.object({
        id: yup.number().required("ID hình ảnh là bắt buộc"),
        publicId: yup.string(),
        imageUrl: yup.string(),
      })
    )
    .default([]), // Use default empty array
  roomType: yup
    .string()
    .oneOf(
      ["APARTMENT", "WHOLE_HOUSE", "BOARDING_HOUSE"],
      "Loại phòng không hợp lệ"
    )
    .required("Loại phòng là bắt buộc"),
  amenities: yup.array().of(
    yup.object({
      id: yup.number().required("ID tiện ích là bắt buộc"),
      name: yup.string().required("Tên tiện ích là bắt buộc"),
    })
  ),
  surroundingAreas: yup.array().of(
    yup.object({
      id: yup.number().required("ID khu vực xung quanh là bắt buộc"),
      name: yup.string().required("Tên khu vực xung quanh là bắt buộc"),
    })
  ),
  targetAudiences: yup.array().of(
    yup.object({
      id: yup.number().required("ID đối tượng mục tiêu là bắt buộc"),
      name: yup.string().required("Tên đối tượng mục tiêu là bắt buộc"),
    })
  ),
  numberOfLivingRooms: yup
    .number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? undefined : value
    )
    .required("Số phòng khách là bắt buộc")
    .min(0, "Số phòng khách không được âm")
    .integer("Số phòng khách phải là số nguyên"),
  numberOfKitchens: yup
    .number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? undefined : value
    )
    .required("Số nhà bếp là bắt buộc")
    .min(0, "Số nhà bếp không được âm")
    .integer("Số nhà bếp phải là số nguyên"),
  numberOfBathrooms: yup
    .number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? undefined : value
    )
    .required("Số phòng tắm là bắt buộc")
    .min(0, "Số phòng tắm không được âm")
    .integer("Số phòng tắm phải là số nguyên"),
  numberOfBedrooms: yup
    .number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? undefined : value
    )
    .required("Số phòng ngủ là bắt buộc")
    .min(0, "Số phòng ngủ không được âm")
    .integer("Số phòng ngủ phải là số nguyên"),
  createdAt: yup.string(),
  updatedAt: yup.string(),
});

export type FormCreateRoomSchema = yup.InferType<typeof formCreateRoom>;

export type UserSchema = yup.InferType<typeof userSchema>;

export type Schema = yup.InferType<typeof schema>;

export type LoginSchema = yup.InferType<typeof loginSchema>;
