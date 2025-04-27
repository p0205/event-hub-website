
export interface Participant {
    // id is number for participants from backend, string (uuid) for new frontend additions
    id: number | string;
    name: string;
    email: string;
    phoneNo?: string | null; // Matches backend field name
    gender?: string | null;
    faculty?: string | null;
    course?: string | null;
    year?: string | null;
    role?: string | null; // Matches backend field name
}
