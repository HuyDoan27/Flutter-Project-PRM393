import api from "./api/axios";


export const loginApi = (email, password) =>
    api.post("/auth/login", { email, password });

export const logoutApi = () => {
    const token = localStorage.getItem("token");
    return api.post(
        "/auth/logout",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
    );
};