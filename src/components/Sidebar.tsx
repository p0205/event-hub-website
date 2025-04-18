'use client';
import { Calendar, BarChart, Settings, LogOut } from 'lucide-react';

export default function Sidebar() {
  return (
    <div className="w-64 bg-white h-screen p-4  ">
      <nav className="space-y-4 text-sm">
        {/* <div className="flex items-center gap-2 cursor-pointer font-semibold text-gray-600"> Dashboard</div> */}
        <div className="text-gray-500">Home</div>
        <div className="pl-4 text-gray-600 space-y-2">
          <div className="font-semibold cursor-pointer">
            <a href="/">Dashboard</a>
            </div>
        </div>
        <div className="text-gray-500">Events</div>
        <div className="font-semibold cursor-pointer pl-4 text-gray-600 space-y-2">
          <div>
          <a href="/events/create" className="block hover:text-blue-600">Create Event</a>            </div>
          <div>
            <a href="/events/pending-events">Pending Events</a>
          </div>
          <div>
            <a href="/events/active-events">Active Events</a>
          </div>
          <div>Completed Events</div>
        </div>
        <div className="mt-4 text-gray-500">Reports</div>
        <div className=" font-semibold cursor-pointer  pl-4 text-gray-600 space-y-2">
          <div>Generate Reports</div>
          <div>My Reports</div>
        </div>
        <hr className="my-4 border-gray-300" />
        <div className="cursor-pointer mt-6 font-semibold flex items-center gap-2 text-gray-600">Account Settings</div>
        <div className="flex items-center gap-2 text-red-500 mt-2 cursor-pointer"><LogOut size={18}/> Logout</div>
      </nav>
    </div>
  );
}
