import api from "./api/axios";

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

/**
 * Lấy tất cả appointments với filters
 * @param {{ status?, fromDate?, toDate?, doctorId?, clinicId?, page?, limit? }} params
 */
export const getAllAppointments = (params = {}) =>
    api.get("/appointments/all", { params });

/**
 * Lấy danh sách doctors cho filter dropdown
 */
export const getDoctors = () =>
    api.get("/doctors");

/**
 * Lấy danh sách clinics cho filter dropdown
 */
export const getClinics = () =>
    api.get("/clinics");

// Lấy lịch khám theo bác sĩ (userId của account đăng nhập)
export const getAppointmentsByDoctor = (userId, params = {}) =>
    api.get(`/appointments/${userId}`, { params });

// Cập nhật trạng thái lịch khám
export const updateAppointmentStatus = (appointmentId, data) =>
    api.patch(`/appointments/${appointmentId}/status`, data);

// Đánh giá / trả tình trạng bệnh sau khám
export const rateAppointment = (appointmentId, data) =>
    api.post(`/appointments/${appointmentId}/rate`, data);