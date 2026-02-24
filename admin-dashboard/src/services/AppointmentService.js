import api from "./api/axios";

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