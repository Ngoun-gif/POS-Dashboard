export type Subcategory = {
    id: number
    category_id: number
    name: string
    active: boolean
    image?: string | null
    image_url?: string | null
    created_at?: string
    updated_at?: string
}

export type SubCategoryCreatePayload = {
    category_id: number
    name: string
    active: boolean
    imageFile?: File | null
}

export type SubCategoryUpdatePayload = {
    category_id?: number
    name?: string
    active?: boolean
    imageFile?: File | null
}
