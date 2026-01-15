import { defineStore } from "pinia";
import { AuthService } from "../services/auth.service";
import type { User } from "../types/auth.types";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: null as User | null,
        loading: false,
    }),

    getters: {
        isLoggedIn: (s) => !!s.user, // ✅ session-based
    },

    actions: {
        async login(email: string, password: string) {
            this.loading = true;
            try {
                await AuthService.login({ email, password });
                this.user = await AuthService.me();
            } finally {
                this.loading = false;
            }
        },

        async fetchMe() {
            this.loading = true;
            try {
                this.user = await AuthService.me();
                return this.user;
            } catch {
                this.user = null;
                return null;
            } finally {
                this.loading = false;
            }
        },

        async logout() {
            try {
                await AuthService.logout();
            } finally {
                this.user = null;
            }
        },
    },
});
