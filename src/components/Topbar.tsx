  
  
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

      {/* Right - Notification & Profile */}
      <div className="flex items-center gap-4">
        {/* Notification Icon */}
        <button className="relative">
          <Bell className="text-black" size={22} />
          {/* Example notification dot */}
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-600 rounded-full"></span>
        </button>

        {/* Profile Image - Link to Profile Settings */}
        <Link href="/profile-settings">
          <img
            src="/profile.png"
            alt="Profile"
            className="w-9 h-9 rounded-full cursor-pointer border-2 border-white"
          />
        </Link>
      </div>
    </nav>
  );
}
