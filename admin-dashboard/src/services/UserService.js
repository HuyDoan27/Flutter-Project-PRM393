import api from "./api/axios";


/**
 * GET /api/doctors
 */
export const getUsers = (params = {}) => {
  return api.get("/users", { params });
};

/**
 * GET /api/users?withAppointments=true
 */
export const getUsersWithAppointments = (params = {}) => {
  return api.get("/with-appointments", { params });
};

