export interface AdminDashboardData {
    summary: DashboardSummary;
    monthlyGrowth: EventMonthlyGrowth[];
    timeDistribution: EventTimeDistribution[];
    topVenues: TopVenue[];
    eventTypes: EventTypeData[];
}

interface EventMonthlyGrowth {
    month: string;
    events: number;
}

interface EventTimeDistribution {
    hour: string;
    count: number;
}

interface TopVenue {
    name: string;
    count: number;
}

interface EventTypeData {
    name: string;
    value: number;
}

interface DashboardSummary {
    totalUsers: number;
    totalActiveUsers: number;
    totalCompletedEvents: number;
}

export interface EventTypePerformanceData {
    eventType: string;
    eventsHeld: number;
    totalRegistrations: number;
    avgRegPerEvent: number;
    avgFillRate: number;
    avgAttendanceRate: number;
}

/**
 @Data
@AllArgsConstructor
@NoArgsConstructor
public class EventTypePerformanceData {
    private String eventType;
    private int eventsHeld;
    private int totalRegistrations;
    private double avgRegPerEvent;
    private double avgFillRate;
    private Double avgAttendanceRate; // Nullable for N/A
}
} 
 */