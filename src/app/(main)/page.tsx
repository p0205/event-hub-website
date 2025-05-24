
import StatsCards from "@/components/StatsCards";
import SummaryCards from "@/components/SummaryCards";
import OrganizerCalendar from "@/components/OrganizerCalendar";
// import { getUserFromCookie } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  // const user = await getUserFromCookie();
  
  //   if (!user) {
  //     redirect('/sign-in'); // this will not render anything before redirect
  //   }
  return (

    <div>
      {/* Topbar */}
  

      {/* Page Body: Sidebar + Content */}
        {/* Sidebar (width 64 = 16rem) */}


        {/* Main Content */}
        <main className="space-y-6">
          <StatsCards />
          <OrganizerCalendar />
          <SummaryCards />
        </main>
      </div>
  );
}
