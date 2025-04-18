const summaries = [
    { value: "85%", label: "Recent Event Attendance Rate" },
    { value: "4.7", label: "Overall Feedback Score" },
  ];
  
  export default function SummaryCards() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {summaries.map((s, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow-md">
            <div className="text-2xl font-bold text-blue-700">{s.value}</div>
            <div className="text-sm text-gray-600">{s.label}</div>
          </div>
        ))}
      </div>
    );
  }
  