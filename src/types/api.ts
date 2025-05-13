// Define a generic interface for the paginated response structure returned by Spring Data Page
// src/types/TeamMember.ts

// src/types/PaginatedResponse.ts
export interface PageData<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        offset: number;
        paged: boolean;
        unpaged: boolean;
        sort: {
            sorted: boolean;
            unsorted: boolean;
            empty: boolean;
        };
    };
    totalPages: number;
    totalElements: number;
    last: boolean;
    first: boolean;
    numberOfElements: number;
    size: number;
    number: number;
    sort: {
        sorted: boolean;
        unsorted: boolean;
        empty: boolean;
    };
    empty: boolean;
}
