import { Bell } from "lucide-react";
import Link from "next/link";

export default function Topbar() {
  return (
    <nav className="w-full h-16 bg-[#fcba03] shadow-md flex items-center justify-between px-6">
      {/* Left - Title */}
      <div className="font-bold text-xl text-black">
        <img src="/ftmkLogo.png" alt="Logo" className="h-8 inline-block mr-2" />
        Event Hub
      </div>
    
      <div className="flex items-center gap-4">
      
        
        <Link href="/public/calendar" className="font-bold">
          Discover Events
        </Link>
      </div>
    </nav>
  );
}
