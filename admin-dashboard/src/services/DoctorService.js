import api from "./api/axios";


/**
 * GET /api/doctors
 * Lấy danh sách bác sĩ
 */
export const getDoctors = (params = {}) => {
  // params có thể là: status, keyword, page, limit...
  return api.get("/doctors", { params });
};

/**
 * GET /api/doctors/:id
 * Lấy chi tiết bác sĩ
 */
export const getDoctorById = (id, params = {}) => {
  return api.get(`/doctors/${id}`, { params });
};

/**
 * POST /api/doctors
 * Tạo tài khoản bác sĩ (ADMIN)
 */
export const createDoctor = (data) => {
  return api.post("/doctors", data);
};

/**
 * PUT /api/doctors/:id/status
 * Cập nhật trạng thái bác sĩ
 * status: 1 = duyệt, 2 = chờ, 3 = từ chối
 */
export const updateDoctorStatus = (id, data) => {
  /**
   * data = {
   *   status: number,
   *   rejectReason?: string
   * }
   */
  return api.put(`/doctors/${id}/status`, data);
};
