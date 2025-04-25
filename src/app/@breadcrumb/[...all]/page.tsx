// src/app/@breadcrumb/[...all]/page.tsx
// This is a Server Component by default.
// It's a catch-all route within a Parallel Route (@breadcrumb)
// designed to generate breadcrumbs based on the URL segments.

import {
    Breadcrumb, // Assuming this is the main container component
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "../../../components/Breadcrumbs"; // Adjust path as needed

import React from "react";
import type { ReactElement } from "react";

// Helper function to format URL segments into readable text
// (You might already have this in your global Breadcrumbs component or a utils file)
const formatSegment = (segment: string) => {
    console.log("HI, do you see me? This is from all page.tsx ")
    if (!segment) return 'Home'; // Handle the root segment (empty string)
    // Replace hyphens with spaces and capitalize the first letter of each word
    const words = segment.replace(/-/g, ' ').split(' ');
    const formattedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1) );
    return formattedWords.join(' ');
};


// This Server Component receives the catch-all params
export default async function BreadcrumbSlot({
    params,
}: { params: { all: string[] } }) {

    // >>> AWAIT params before accessing its properties <<<
    // This resolves the Next.js error.
    const awaitedParams = await params;

    // The 'all' parameter is an array of all segments matched by [...all]
    const segments = awaitedParams.all;

    const breadcrumbItems: ReactElement[] = [];
    let breadcrumbPage: ReactElement = <></>; // To hold the last, non-linked item

    // Iterate through the segments to build breadcrumb items
    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i]; // Get the current segment

        // Construct the href path for this segment
        // Example: for segments ["events", "pending", "21"]
        // i=0: segment="events", href="/events"
        // i=1: segment="pending", href="/events/pending"
        // i=2: segment="21",      href="/events/pending/21" (This will be the last item)
        const href = '/' + segments.slice(0, i + 1).join('/');

        const isLast = i === segments.length - 1; // Check if this is the last segment

        // Format the segment text for display
        const formattedName = formatSegment(segment);

        if (isLast) {
            // The last item is the current page, typically not a link
            breadcrumbPage = (
                <BreadcrumbItem key={href}> {/* Use href as key for uniqueness */}
                    <BreadcrumbPage className="capitalize">{formattedName}</BreadcrumbPage>
                </BreadcrumbItem>
            );
        } else {
            // Other items are links
            breadcrumbItems.push(
                <React.Fragment key={href}> {/* Use href as key for fragment */}
                    <BreadcrumbItem>
                        <BreadcrumbLink href={href} className="capitalize">
                            {formattedName}
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                     {/* Add separator AFTER the linked item */}
                     <BreadcrumbSeparator />
                </React.Fragment>,
            );
        }
    }

    // Render the full breadcrumb structure
    return (
        <Breadcrumb> {/* Assuming Breadcrumb is the main wrapper */}
            <BreadcrumbList> {/* Assuming BreadcrumbList wraps the items */}
                {/* Add the Home link */}
               

                {/* Add separator after Home if there are other segments */}
                {segments.length > 0 }

                {/* Render the dynamically generated linked items */}
                {breadcrumbItems}

                {/* Render the last item (current page) */}
                {/* The separator before the last item is handled in the loop for breadcrumbItems */}
                {breadcrumbPage}

            </BreadcrumbList>
        </Breadcrumb>
    );
}
