// // src/components/Breadcrumbs.tsx
// 'use client'; // This is a Client Component because it uses usePathname

// import { usePathname } from 'next/navigation';
// import Link from 'next/link';
// import React from 'react'; // Import React for Fragment

// // Helper function to format URL segments into readable text
// const formatSegment = (segment: string) => {
//   if (!segment) return 'Home'; // Handle the root segment (empty string)

//   // Replace hyphens with spaces and capitalize the first letter of each word
//   const words = segment.replace(/-/g, ' ').split(' ');
//   const formattedWords = words.map(word =>
//     word.charAt(0).toUpperCase() + word.slice(1)
//   );
//   return formattedWords.join(' ');
// };

// export default function Breadcrumbs() {
//   const pathname = usePathname();

//   // Split the pathname by '/', filter out empty segments
//   // Example: "/dashboard/create-event" -> ["dashboard", "create-event"]
//   const segments = pathname.split('/').filter(segment => segment.length > 0);

//   // Build the breadcrumb trail
//   const breadcrumbItems = segments.map((segment, index) => {
//     // Construct the URL path for this breadcrumb item
//     // For "/dashboard/create-event", the paths are:
//     // index 0: segment="dashboard", href="/dashboard"
//     // index 1: segment="create-event", href="/dashboard/create-event"
//     const href = '/' + segments.slice(0, index + 1).join('/');

//     const isLast = index === segments.length - 1; // Check if this is the last segment
//     const name = formatSegment(segment); // Format the segment text

//     return (
//       <React.Fragment key={href}>
//         {/* Add a separator before this item if it's not the first one */}
//         {index > 0 && (
//           <span className="breadcrumb-separator"> &gt; </span>
//         )}
//         {/* If it's the last item, display as text (current page) */}
//         {isLast ? (
//           <span className="breadcrumb-current">{name}</span>
//         ) : (
//           // Otherwise, display as a link
//           (<Link href={href} className="breadcrumb-link" >
//             {name}
//           </Link>)
//         )}
//       </React.Fragment>
//     );
//   });

//    // Add a "Home" breadcrumb at the beginning if not on the home page
//    // The home page is "/"
//    const homeBreadcrumb = pathname !== '/' ? (
//      <React.Fragment>
//        <Link href="/" className="breadcrumb-link">
//          Home
//        </Link>
//        {/* Add a separator after Home if there are other segments */}
//        {segments.length > 0 && <span className="breadcrumb-separator"> &gt; </span>}
//      </React.Fragment>
//    ) : null; // Don't show Home breadcrumb if already on the home page

//   return (
//     <nav aria-label="breadcrumb" className="breadcrumbs-container">
//       {/* Render the Home breadcrumb if it exists */}
//       {homeBreadcrumb}
//       {/* Render the breadcrumb items based on URL segments */}
//       {breadcrumbItems}
//     </nav>
//   );
// }

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

const Breadcrumb = React.forwardRef<
	HTMLElement,
	React.ComponentPropsWithoutRef<"nav"> & {
		separator?: React.ReactNode;
	}
>(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />);
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbList = React.forwardRef<
	HTMLOListElement,
	React.ComponentPropsWithoutRef<"ol">
>(({ className, ...props }, ref) => (
	<ol
		ref={ref}
		className={cn(
			"flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
			className,
		)}
		{...props}
	/>
));
BreadcrumbList.displayName = "BreadcrumbList";

const BreadcrumbItem = React.forwardRef<
	HTMLLIElement,
	React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
	<li
		ref={ref}
		className={cn("inline-flex items-center gap-1.5", className)}
		{...props}
	/>
));
BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbLink = React.forwardRef<
	HTMLAnchorElement,
	React.ComponentPropsWithoutRef<"a"> & {
		asChild?: boolean;
	}
>(({ asChild, className, ...props }, ref) => {
	const Comp = asChild ? Slot : "a";

	return (
		<Comp
			ref={ref}
			className={cn("transition-colors hover:text-foreground", className)}
			{...props}
		/>
	);
});
BreadcrumbLink.displayName = "BreadcrumbLink";

const BreadcrumbPage = React.forwardRef<
	HTMLSpanElement,
	React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
	<span
		ref={ref}
		role="link"
		aria-disabled="true"
		aria-current="page"
		className={cn("font-normal text-foreground", className)}
		{...props}
	/>
));
BreadcrumbPage.displayName = "BreadcrumbPage";

const BreadcrumbSeparator = ({
	children,
	className,
	...props
}: React.ComponentProps<"li">) => (
	<li
		role="presentation"
		aria-hidden="true"
		className={cn("[&>svg]:size-3.5", className)}
		{...props}
	>
		{children ?? <ChevronRight />}
	</li>
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

const BreadcrumbEllipsis = ({
	className,
	...props
}: React.ComponentProps<"span">) => (
	<span
		role="presentation"
		aria-hidden="true"
		className={cn("flex h-9 w-9 items-center justify-center", className)}
		{...props}
	>
		<MoreHorizontal className="h-4 w-4" />
		<span className="sr-only">More</span>
	</span>
);
BreadcrumbEllipsis.displayName = "BreadcrumbElipssis";

export {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbPage,
	BreadcrumbSeparator,
	BreadcrumbEllipsis,
};