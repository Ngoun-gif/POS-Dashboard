export type Category = {
    id: number
    name: string
    active: boolean

    // backend
    image?: string | null        // stored path
    image_url?: string | null    // full url for <img>

    created_at?: string
    updated_at?: string
}

export type CategoryCreatePayload = {
    name: string
    active: boolean
    imageFile?: File | null
}

export type CategoryUpdatePayload = {
    name?: string
    active?: boolean
    imageFile?: File | null
}

// If your admin list is paginated in Laravel
export type Paginated<T> = {
    data: T[]
    current_page: number
    last_page: number
    per_page: number
    total: number
}
