import { api, TOKEN_KEY } from "@/config/api/axios";

export const AuthService = {
    async login(payload: { email: string; password: string }) {
        const res = await api.post("/auth/login", payload);
        localStorage.setItem(TOKEN_KEY, res.data.token);
        return res.data;
    },

    async me() {
        const res = await api.get("/auth/me");
        return res.data;
    },

    async logout() {
        try {
            await api.post("/auth/logout");
        } finally {
            localStorage.removeItem(TOKEN_KEY);
        }
    },
};
