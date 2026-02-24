import api from "./api/axios";

/** Lấy tất cả phòng khám (kèm doctors) */
export const getClinics = () =>
    api.get("/clinics");

/** Tạo phòng khám mới */
export const createClinic = (data) =>
    api.post("clinics/create", data);

/** Cập nhật phòng khám */
export const updateClinic = (id, data) =>
    api.put(`clinics/admin/clinics/${id}`, data);

/** Lấy chuyên khoa theo phòng khám */
export const getSpecialtiesByClinic = (id) =>
    api.get(`clinics/${id}/specialties`);

/** Lấy tất cả chuyên khoa (dùng cho multi-select khi create) */
export const getAllSpecialties = () =>
    api.get("/specialties");