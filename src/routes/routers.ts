import { createRouter, createWebHistory } from "vue-router";
import MasterSection from "@/layouts/MasterSection.vue";
import Dashboard from "@/modules/dashboard/pages/DashboardPage.vue";
import LoginPage from "@/modules/auth/pages/LoginPage.vue";
import CategoryPage from "@/modules/categories/pages/categryPage.vue"

const routes = [
  { path: "/login", name: "login", component: LoginPage },
  {
    path: "/",
    component: MasterSection,
    meta: { requiresAuth: true },
    children: [
      { path: "", redirect: "/dashboard" },
      { path: "dashboard", name: "dashboard", component: Dashboard },
      { path: "category", name: "category", component: CategoryPage },

    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to) => {
  const { useAuthStore } = await import("@/modules/auth/stores/auth.store");
  const auth = useAuthStore();

  if (to.meta.requiresAuth) {
    if (!auth.user) await auth.fetchMe();
    if (!auth.user) return { name: "login" };
  }

  if (to.name === "login") {
    if (!auth.user) await auth.fetchMe();
    if (auth.user) return { name: "dashboard" };
  }

  return true;
});

export default router;
