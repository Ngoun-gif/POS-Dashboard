import { api } from "@/config/api/axios";
import type {
    Subcategory,
    SubCategoryCreatePayload,
    SubCategoryUpdatePayload,
} from "../types/Subcategory.ts";

// ✅ derive backend host from VITE_API_URL (remove trailing /api)
const API_URL = import.meta.env.VITE_API_URL as string; // http://127.0.0.1:8000/api
const BACKEND_URL = API_URL.replace(/\/api\/?$/, "");   // http://127.0.0.1:8000

function buildImageUrl(path?: string | null) {
    return path ? `${BACKEND_URL}/storage/${path}` : null;
}

function mapSubCategory(s: any): Subcategory {
    const imagePath = s.image ?? null;

    return {
        id: s.id,
        category_id: s.category_id,
        name: s.name,
        active: !!s.is_active,
        image: imagePath,
        // ✅ use backend image_url if exists, else build from image path
        image_url: s.image_url ?? buildImageUrl(imagePath),
        created_at: s.created_at,
        updated_at: s.updated_at,
    };
}

function toFormData(payload: {
    category_id?: number;
    name?: string;
    active?: boolean;
    imageFile?: File | null;
}) {
    const fd = new FormData();

    if (payload.category_id !== undefined) fd.append("category_id", String(payload.category_id));
    if (payload.name !== undefined) fd.append("name", payload.name);

    if (payload.active !== undefined) {
        fd.append("is_active", payload.active ? "1" : "0");
    }

    if (payload.imageFile) fd.append("image", payload.imageFile);

    return fd;
}

export async function fetchSubCategories(params?: { q?: string; category_id?: number }) {
    const res = await api.get("/admin/sub-categories", { params });
    const list = res.data.data ?? res.data;
    return (list as any[]).map(mapSubCategory) as Subcategory[];
}

export async function createSubCategory(payload: SubCategoryCreatePayload) {
    const fd = toFormData(payload);

    const res = await api.post("/admin/sub-categories", fd, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    const obj = res.data.sub_category ?? res.data.data ?? res.data;
    return mapSubCategory(obj);
}

export async function updateSubCategory(id: number, payload: SubCategoryUpdatePayload) {
    const fd = toFormData(payload);
    fd.append("_method", "PUT");

    const res = await api.post(`/admin/sub-categories/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    const obj = res.data.sub_category ?? res.data.data ?? res.data;
    return mapSubCategory(obj);
}

export async function deleteSubCategory(id: number) {
    const res = await api.delete(`/admin/sub-categories/${id}`);
    return res.data;
}
