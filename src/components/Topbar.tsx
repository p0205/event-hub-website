'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Topbar() {
  const pathname = usePathname();
  const isDiscoverEventsActive = pathname === "/public/calendar";

  return (
    <nav className="w-full h-16 bg-[#fcba03] shadow-md flex items-center justify-between px-6">
      {/* Left - Title */}
      <div className="font-bold text-xl text-black">
        <img src="/ftmkLogo.png" alt="Logo" className="h-8 inline-block mr-2" />
        Event Hub
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/public/calendar"
          className={`font-bold px-4 py-2 rounded-lg transition-all duration-300 ease-in-out relative group /* Add group class here */
    ${isDiscoverEventsActive
              ? 'text-black'
              : 'hover:text-gray-400'
            }`}
        >
          Discover Events
          {isDiscoverEventsActive && (
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-black rounded-full /* Underline bar */"></div>
          )}
        </Link>
      </div>
    </nav>
  );
}
