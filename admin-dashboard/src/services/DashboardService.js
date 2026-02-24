import api from "./api/axios";

/**
 * Lấy thống kê dashboard (ADMIN)
 * GET /api/dashboard
 */
export const getDashboardStats = () => {
    return api.get("/dashboard");
};
