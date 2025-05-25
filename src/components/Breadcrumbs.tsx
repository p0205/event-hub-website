import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Example of how to use the Breadcrumb component:
// <Breadcrumb>
//   <BreadcrumbList>
//     <BreadcrumbItem>
//       <BreadcrumbLink href="/">Home</BreadcrumbLink>
//     </BreadcrumbItem>
//     <BreadcrumbSeparator />
//     <BreadcrumbItem>
//       <BreadcrumbLink href="/events">Events</BreadcrumbLink>
//     </BreadcrumbItem>
//     <BreadcrumbSeparator />
//     <BreadcrumbItem>
//       <BreadcrumbPage>Current Page</BreadcrumbPage>
//     </BreadcrumbItem>
//   </BreadcrumbList>
// </Breadcrumb>

// Main Breadcrumb container component
// This is like a container that holds all the breadcrumb items
// It's rendered as a <nav> element for proper semantic HTML
const Breadcrumb = React.forwardRef<
	HTMLElement,
	React.ComponentPropsWithoutRef<"nav"> & {
		separator?: React.ReactNode; // Optional custom separator between items
	}
>(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />);
Breadcrumb.displayName = "Breadcrumb";

// BreadcrumbList component - renders as an ordered list (ol)
// This is like a list that holds all the breadcrumb items
// It provides consistent spacing and styling for all items
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

// BreadcrumbItem component - renders as a list item (li)
// Each individual breadcrumb item is wrapped in this component
// For example: "Home", "Events", "Current Page" are each BreadcrumbItems
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

// BreadcrumbLink component - renders as a Next.js Link component
// This is used for clickable breadcrumb items that navigate to other pages
// For example: "Home" and "Events" are BreadcrumbLinks
// Uses Next.js Link for client-side navigation instead of regular <a> tags
// This means clicking these links won't refresh the entire page
const BreadcrumbLink = React.forwardRef<
	HTMLAnchorElement,
	Omit<React.ComponentPropsWithoutRef<"a">, "href"> & {
		asChild?: boolean; // Allows the component to be rendered as a child component
		href: string; // Required URL for navigation
	}
>(({ asChild, className, ...props }, ref) => {
	const Comp = asChild ? Slot : Link; // Use Slot if asChild is true, otherwise use Next.js Link

	return (
		<Comp
			ref={ref}
			className={cn("transition-colors hover:text-foreground", className)}
			{...props}
		/>
	);
});
BreadcrumbLink.displayName = "BreadcrumbLink";

// BreadcrumbPage component - renders as a span
// Used for the current page in the breadcrumb trail (not clickable)
// For example: "Current Page" is a BreadcrumbPage
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

// BreadcrumbSeparator component - renders as a list item
// Used to visually separate breadcrumb items
// For example: "Home > Events > Current Page" - the ">" is a BreadcrumbSeparator
// Default separator is a chevron icon (>) but can be customized
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
		{children ?? <ChevronRight />} {/* Use custom separator if provided, otherwise use chevron */}
	</li>
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

// BreadcrumbEllipsis component - renders as a span
// Used to indicate when there are more breadcrumb items that don't fit
// For example: "Home > ... > Current Page" - the "..." is a BreadcrumbEllipsis
// Shows a "more" icon with screen reader text for accessibility
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
		<span className="sr-only">More</span> {/* Screen reader text */}
	</span>
);
BreadcrumbEllipsis.displayName = "BreadcrumbElipssis";

// Export all components for use in other parts of the application
export {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbPage,
	BreadcrumbSeparator,
	BreadcrumbEllipsis,
};