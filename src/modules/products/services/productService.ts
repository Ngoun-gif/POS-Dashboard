import { api } from "@/config/api/axios"
import type { Product, ProductCreatePayload, ProductUpdatePayload } from "../types/product"

// derive backend host from VITE_API_URL (remove /api)
const API_URL = import.meta.env.VITE_API_URL as string
const BACKEND_URL = API_URL.replace(/\/api\/?$/, "")

function buildFileUrl(path?: string | null) {
    return path ? `${BACKEND_URL}/storage/${path}` : null
}

function mapProduct(p: any): Product {
    const thumbPath = p.thumbnail ?? null
    return {
        id: p.id,
        sub_category_id: p.sub_category_id,
        name: p.name,
        description: p.description ?? null,
        active: !!p.is_active,

        thumbnail: thumbPath,
        thumbnail_url: p.thumbnail_url ?? buildFileUrl(thumbPath),

        created_at: p.created_at,
        updated_at: p.updated_at,
    }
}

function toFormData(payload: {
    sub_category_id?: number
    name?: string
    description?: string | null
    active?: boolean
    thumbnailFile?: File | null
}) {
    const fd = new FormData()

    if (payload.sub_category_id !== undefined) fd.append("sub_category_id", String(payload.sub_category_id))
    if (payload.name !== undefined) fd.append("name", payload.name)
    if (payload.description !== undefined) fd.append("description", payload.description ?? "")

    if (payload.active !== undefined) fd.append("is_active", payload.active ? "1" : "0")

    // file field name must match backend: thumbnail
    if (payload.thumbnailFile) fd.append("thumbnail", payload.thumbnailFile)

    return fd
}

// ADMIN LIST (supports pagination or array)
export async function fetchProducts(params?: { q?: string; sub_category_id?: number; page?: number }) {
    const res = await api.get("/admin/products", { params })
    const list = res.data.data ?? res.data
    return (list as any[]).map(mapProduct) as Product[]
}

export async function createProduct(payload: ProductCreatePayload) {
    const fd = toFormData(payload)
    const res = await api.post("/admin/products", fd, {
        headers: { "Content-Type": "multipart/form-data" },
    })
    return mapProduct(res.data.product ?? res.data.data ?? res.data)
}

export async function updateProduct(id: number, payload: ProductUpdatePayload) {
    const fd = toFormData(payload)
    fd.append("_method", "PUT")

    const res = await api.post(`/admin/products/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
    })
    return mapProduct(res.data.product ?? res.data.data ?? res.data)
}

export async function deleteProduct(id: number) {
    const res = await api.delete(`/admin/products/${id}`)
    return res.data
}

// Public
export async function fetchPublicProductsBySubCategory(subCategoryId: number) {
    const res = await api.get(`/sub-categories/${subCategoryId}/products`)
    return (res.data as any[]).map(mapProduct) as Product[]
}

export async function fetchPublicProduct(id: number) {
    const res = await api.get(`/products/${id}`)
    return mapProduct(res.data)
}
