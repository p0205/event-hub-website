'use client';

import StatsCards from "@/components/StatsCards";
import SummaryCards from "@/components/SummaryCards";
import OrganizerCalendar from "@/components/OrganizerCalendar";
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  console.log(user.id);
  
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
