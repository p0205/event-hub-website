export enum UserAccountStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    PENDING = 'PENDING',
    SUSPENDED = 'SUSPENDED',
}

export interface User {
    // id is number for participants from backend, string (uuid) for new frontend additions
    id?: number | string;
    name: string;
    email: string;
    phoneNo?: string | null;
    gender?: string | null;
    faculty?: string | null;
    course?: string | null;
    year?: string | null;
    role?: string | null;
    status?: UserAccountStatus | null;
    mustChangePassword?: number;
    createdAt?: string;
    lastUpdatedAt?: string;
}


