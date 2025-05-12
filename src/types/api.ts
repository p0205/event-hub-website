// Define a generic interface for the paginated response structure returned by Spring Data Page
export interface PageData<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number; // 0-indexed page number from backend
    size: number;
    numberOfElements: number;
    first: boolean;
    last: boolean;
    empty: boolean;
    // Optional: include sort and pageable if you need to use them
    // sort?: { sorted: boolean, unsorted: boolean, empty: boolean };
    // pageable?: { ... }; // Structure of Pageable can be complex, define if needed
}
