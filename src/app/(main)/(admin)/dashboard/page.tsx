'use client';

import React, { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    BarChart,
    Bar,
    CartesianGrid,
} from 'recharts';
import styles from './dashboard.module.css';

const Dashboard = () => {
    const [summary, setSummary] = useState({
        totalUsers: 0,
        totalActiveEvents: 0,
        totalCompletedEvents: 0,
    });

    const [eventMonthlyGrowth, setEventMonthlyGrowth] = useState<{ month: string; events: number; }[]>([]);
    const [eventTimeDist, setEventTimeDist] = useState<{ hour: string; count: number; }[]>([]);
    const [topVenues, setTopVenues] = useState<{ name: string; count: number; }[]>([]);
    const [eventTypeData, setEventTypeData] = useState<{ name: string; value: number; }[]>([]);

    useEffect(() => {
        // Simulate API fetch
        setSummary({
            totalUsers: 320,
            totalActiveEvents: 23,
            totalCompletedEvents: 33,
        });

        setEventMonthlyGrowth([
            { month: 'Jan', events: 3 },
            { month: 'Feb', events: 5 },
            { month: 'Mar', events: 7 },
            { month: 'Apr', events: 9 },
            { month: 'May', events: 12 },
            { month: 'Jun', events: 15 },
        ]);

        setEventTimeDist([
            { hour: '08:00', count: 2 },
            { hour: '09:00', count: 4 },
            { hour: '10:00', count: 7 },
            { hour: '11:00', count: 8 },
            { hour: '12:00', count: 6 },
            { hour: '13:00', count: 5 },
            { hour: '14:00', count: 4 },
            { hour: '15:00', count: 6 },
            { hour: '16:00', count: 3 },
            { hour: '17:00', count: 2 },
            { hour: '18:00', count: 1 },
        ]);

        setTopVenues([
            { name: 'Auditorium A', count: 12 },
            { name: 'Lab 2', count: 9 },
            { name: 'Seminar Hall', count: 7 },
            { name: 'FTMK Room 101', count: 5 },
            { name: 'Gallery', count: 4 },
        ]);

        setEventTypeData([
            { name: 'Talk', value: 14 },
            { name: 'Workshop', value: 10 },
            { name: 'Competition', value: 6 },
            { name: 'Exhibition', value: 4 },
            { name: 'Seminar', value: 3 },
        ]);
    }, []);

    const pieColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];
    const primaryColor = '#2563eb';
    const secondaryColor = '#64748b';

    // Calculate average events per month (based on completed events as they represent actual activity)
    const avgEventsPerMonth = (summary.totalCompletedEvents / 6).toFixed(1); // 6 months of data

    const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    <p className="text-sm text-gray-600">
                        {payload[0].name}: {payload[0].value}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.container}>
                <div className={styles.header}>
                <h1>Dashboard</h1>
                       
                   
                </div>

                {/* Summary Cards */}
                <div className={styles.summaryGrid}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div>
                                <p className={styles.cardTitle}>Total Users</p>
                                <p className={styles.cardValue}>{summary.totalUsers}</p>
                            </div>
                            <div className={`${styles.iconContainer} ${styles.blue}`}>
                                <svg className={`${styles.icon} ${styles.blue}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div>
                                <p className={styles.cardTitle}>Total Active Events</p>
                                <p className={styles.cardValue}>{summary.totalActiveEvents}</p>
                            </div>
                            <div className={`${styles.iconContainer} ${styles.green}`}>
                                <svg className={`${styles.icon} ${styles.green}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div>
                                <p className={styles.cardTitle}>Total Completed Events</p>
                                <p className={styles.cardValue}>{summary.totalCompletedEvents}</p>
                            </div>
                            <div className={`${styles.iconContainer} ${styles.purple}`}>
                                <svg className={`${styles.icon} ${styles.purple}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div>
                                <p className={styles.cardTitle}>Avg. Completed/Month</p>
                                <p className={styles.cardValue}>{avgEventsPerMonth}</p>
                            </div>
                            <div className={`${styles.iconContainer} ${styles.orange}`}>
                                <svg className={`${styles.icon} ${styles.orange}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className={styles.chartGrid}>
                    {/* Monthly Growth Chart */}
                    <div className={styles.chartBox}>
                        <div className={styles.chartHeader}>
                            <h3 className={styles.chartTitle}>Monthly Event Growth</h3>
                            <p className={styles.chartSubtitle}>Event creation trends over time</p>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={eventMonthlyGrowth} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="month" 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <YAxis 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <Tooltip content={CustomTooltip} />
                                <Line 
                                    type="monotone" 
                                    dataKey="events" 
                                    stroke={primaryColor} 
                                    strokeWidth={3}
                                    dot={{ fill: primaryColor, strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, stroke: primaryColor, strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Time Distribution Chart */}
                    <div className={styles.chartBox}>
                        <div className={styles.chartHeader}>
                            <h3 className={styles.chartTitle}>Event Distribution by Hour</h3>
                            <p className={styles.chartSubtitle}>Peak usage times throughout the day</p>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={eventTimeDist} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="hour" 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <YAxis 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <Tooltip content={CustomTooltip} />
                                <Bar 
                                    dataKey="count" 
                                    fill={secondaryColor}
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Venue Usage Chart */}
                    <div className={styles.chartBox}>
                        <div className={styles.chartHeader}>
                            <h3 className={styles.chartTitle}>Top 5 Most Used Venues</h3>
                            <p className={styles.chartSubtitle}>Venue utilization breakdown</p>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={topVenues}
                                    dataKey="count"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    paddingAngle={1}
                                    label
                                >
                                    {topVenues.map((entry, index) => (
                                        <Cell 
                                            key={`cell-venue-${index}`} 
                                            fill={pieColors[index % pieColors.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={CustomTooltip} />
                                <Legend 
                                    wrapperStyle={{ paddingTop: '20px' }}
                                    iconType="circle"
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Event Types Chart */}
                    <div className={styles.chartBox}>
                        <div className={styles.chartHeader}>
                            <h3 className={styles.chartTitle}>Most Demanded Event Types</h3>
                            <p className={styles.chartSubtitle}>Popular event categories</p>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={eventTypeData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    paddingAngle={1}
                                    label
                                >
                                    {eventTypeData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={pieColors[index % pieColors.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={CustomTooltip} />
                                <Legend 
                                    wrapperStyle={{ paddingTop: '20px' }}
                                    iconType="circle"
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;