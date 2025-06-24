'use client';

import React, { useEffect, useState, useCallback } from 'react';
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
import { AdminDashboardData } from '@/types/admin';
import adminService from '@/services/adminService';

const Dashboard = () => {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);

    // Format as yyyy-MM-dd for input type="date"
    const formatDate = (date: Date) => date.toISOString().slice(0, 10);

    const [dashboard, setDashboard] = useState<AdminDashboardData>();
    const [startDateTime, setStartDateTime] = useState<string>(formatDate(sixMonthsAgo));
    const [endDateTime, setEndDateTime] = useState<string>(formatDate(today));

    const fetchDashboardData = useCallback(async () => {
        try {
            const response = await adminService.getDashboardData(startDateTime, endDateTime);
            setDashboard(response);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    }, [startDateTime, endDateTime]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const pieColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];
    const primaryColor = '#2563eb';
    const secondaryColor = '#64748b';

    // Calculate average events per month (based on completed events as they represent actual activity)
    const avgEventsPerMonth = dashboard?.summary ? (dashboard.summary.totalCompletedEvents / 6).toFixed(1) : '0.0'; // 6 months of data

    // Format the month for display in the line chart
    const formattedMonthlyGrowth = dashboard?.monthlyGrowth?.map((item: { month: string; events: number }) => ({
        ...item,
        month: new Date(item.month + '-01').toLocaleString('default', { month: 'short', year: 'numeric' })
    })) ?? [];

    const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: unknown[]; label?: string }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    <p className="text-sm text-gray-600">
                        {payload[0] && typeof payload[0] === 'object' && 'name' in payload[0] && 'value' in payload[0] 
                            ? `${String(payload[0].name)}: ${String(payload[0].value)}`
                            : 'No data'
                        }
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
                                <p className={styles.cardValue}>{dashboard?.summary.totalUsers ?? 0}</p>
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
                                <p className={styles.cardTitle}>Total Active Users</p>
                                <p className={styles.cardValue}>{dashboard?.summary.totalActiveUsers ?? 0}</p>
                            </div>
                            <div className={`${styles.iconContainer} ${styles.green}`}>
                                <svg className={`${styles.icon} ${styles.green}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.dropdownContainer}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <label>
                            Start Date:
                            <input
                                type="date"
                                value={startDateTime}
                                max={endDateTime}
                                onChange={e => setStartDateTime(e.target.value)}
                                style={{ marginLeft: '0.5rem' }}
                            />
                        </label>
                        <label>
                            End Date:
                            <input
                                type="date"
                                value={endDateTime}
                                min={startDateTime}
                            
                                onChange={e => setEndDateTime(e.target.value)}
                                style={{ marginLeft: '0.5rem' }}
                            />
                        </label>
                    </div>
                </div>

                <div className={styles.summaryGrid}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div>
                                <p className={styles.cardTitle}>Total Completed Events</p>
                                <p className={styles.cardValue}>{dashboard?.summary.totalCompletedEvents ?? 0}</p>
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
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={formattedMonthlyGrowth} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={dashboard?.timeDistribution ?? []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie
                                    data={dashboard?.topVenues ?? []}
                                    dataKey="count"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    paddingAngle={1}
                                    label
                                >
                                    {(dashboard?.topVenues ?? []).map((entry: { name: string; count: number }, index: number) => (
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
                            <h3 className={styles.chartTitle}>Top 5 Most Demanded Event Types</h3>
                            <p className={styles.chartSubtitle}>Popular event categories</p>
                        </div>
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie
                                    data={dashboard?.eventTypes ?? []}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    paddingAngle={1}
                                    label
                                >
                                    {(dashboard?.eventTypes ?? []).map((entry: { name: string; value: number }, index: number) => (
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