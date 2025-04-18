const stats = [
    { value: 24, label: "Upcoming Events" },
    { value: 12, label: "Active Events" },
    { value: 56, label: "Completed Events" },
    { value: 320, label: "Total Participants" },
  ];
  
  export default function StatsCards() {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow-md">
            <div className="text-2xl font-bold text-blue-900">{s.value}</div>
            <div className="text-sm text-gray-600">{s.label}</div>
          </div>
        ))}
      </div>
    );
  }
  