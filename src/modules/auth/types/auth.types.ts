export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
};

export type LoginPayload = {
    email: string;
    password: string;
};
