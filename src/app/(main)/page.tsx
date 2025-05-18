
import StatsCards from "@/components/StatsCards";
import SummaryCards from "@/components/SummaryCards";
import OrganizerCalendar from "@/components/OrganizerCalendar";

export default function Home() {
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
