import { Breadcrumb, BreadcrumbList, BreadcrumbLink } from "@/components/Breadcrumbs";
import { BreadcrumbItem } from "@heroui/react";

export default function BreadcrumbSlot() {
	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href="/">Home</BreadcrumbLink>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	);
}