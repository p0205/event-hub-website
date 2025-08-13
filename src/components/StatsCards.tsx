import { useAuth } from "@/context/AuthContext";
import { eventService } from "@/services";
import { EventStatusCard } from "@/types/event";
import { useState, useEffect } from "react";

export default function StatsCards() {
  const { user } = useAuth();
  const [statsCards, setStatsCards] = useState<EventStatusCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getEventNumberByStatus = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await eventService.getEventNumberByStatus(Number(user!.id));
        setStatsCards(response);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Unknown error";
        setError(`Failed to load events: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };
    getEventNumberByStatus();
  }, [user]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
      {loading ? (
        <div className="col-span-2 text-center p-4 bg-white rounded-xl shadow-md text-gray-500">
          Loading...
        </div>
      ) : error ? (
        <div className="col-span-2 p-4 bg-red-50 border border-red-300 text-red-700 rounded-xl shadow-md">
          {error}
        </div>
      ) : (
        statsCards.map((s, i) => (
          <div key={i} className="bg-white p-3 rounded-xl shadow-md">
            <div className="text-2xl font-bold text-blue-900">{s.totalEvents}</div>
            <div className="text-sm text-gray-600">{s.eventStatus} EVENTS</div>
          </div>
        ))
      )}
    </div>
  );
}
