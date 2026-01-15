import { api } from "@/config/api/axios"
import type {
    Category,
    CategoryCreatePayload,
    CategoryUpdatePayload,
    Paginated,
} from "../types/category"

function mapCategory(c: any): Category {
    return {
        id: c.id,
        name: c.name,
        active: !!c.is_active,       // Laravel -> Vue
        image: c.image ?? null,
        image_url: c.image_url ?? null,
        created_at: c.created_at,
        updated_at: c.updated_at,
    }
}

function toFormData(payload: { name?: string; active?: boolean; imageFile?: File | null }) {
    const fd = new FormData();

    if (payload.name !== undefined) fd.append("name", payload.name);

    if (payload.active !== undefined) {
        fd.append("is_active", payload.active ? "1" : "0"); // ✅ FIX
    }

    if (payload.imageFile) fd.append("image", payload.imageFile);

    return fd;
}


// =======================
// ADMIN CRUD
// =======================

export async function fetchCategories(params?: { q?: string; page?: number }) {
    const res = await api.get("/admin/categories", { params })

    // Laravel paginator: { data: [...] }
    const paginator: Paginated<any> | any[] = res.data
    const list = Array.isArray(paginator) ? paginator : paginator.data

    return list.map(mapCategory) as Category[]
}

export async function createCategory(payload: CategoryCreatePayload) {
    const fd = toFormData(payload)

    const res = await api.post("/admin/categories", fd, {
        headers: { "Content-Type": "multipart/form-data" },
    })

    return mapCategory(res.data.category)
}

export async function updateCategory(id: number, payload: CategoryUpdatePayload) {
    const fd = toFormData(payload)

    // multipart PUT -> use POST + _method
    fd.append("_method", "PUT")

    const res = await api.post(`/admin/categories/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
    })

    return mapCategory(res.data.category)
}

export async function deleteCategory(id: number) {
    const res = await api.delete(`/admin/categories/${id}`)
    return res.data
}

// =======================
// OPTIONAL PUBLIC
// =======================

export async function fetchPublicCategories() {
    const res = await api.get("/categories")
    return (res.data as any[]).map(mapCategory) as Category[]
}
