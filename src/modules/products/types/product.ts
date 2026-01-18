export type Product = {
    id: number
    sub_category_id: number
    name: string
    description: string | null
    active: boolean

    thumbnail: string | null
    thumbnail_url: string | null

    created_at?: string
    updated_at?: string
}

export type ProductCreatePayload = {
    sub_category_id: number
    name: string
    description?: string | null
    active: boolean
    thumbnailFile?: File | null
}

export type ProductUpdatePayload = {
    sub_category_id?: number
    name?: string
    description?: string | null
    active?: boolean
    thumbnailFile?: File | null
}
