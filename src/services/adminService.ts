import { AdminDashboardData } from '@/types/admin';
import api from './api';
import { HttpStatusCode } from 'axios';
import { convertToLocalDateTime } from '@/helpers/eventHelpers';

interface VenueUtilizationReportRequest {
    startDateTime: string;  // ISO-8601 format
    endDateTime: string;    // ISO-8601 format
    venueIds?: number[];    // Optional array of venue IDs to filter
}


const adminService = {

    getDashboardData: async (startDateTime:string, endDateTime:string): Promise<AdminDashboardData> => {
        try {
            startDateTime = convertToLocalDateTime(startDateTime);
            endDateTime = convertToLocalDateTime(endDateTime);
            const response = await api.get('/admin/dashboard',{
                params: {
                    "startDateTime" : startDateTime,
                    "endDateTime" : endDateTime,
                }
            }
                
            );

            if (response.status !== HttpStatusCode.Ok) {
                throw new Error('Failed to get dashboard data');
            }

            console.log(response.data);
            return response.data;
        } catch (error: any) {
            console.error('Error generating venue utilization report:', error);
            throw new Error(error.response?.data?.message || 'Failed to generate venue utilization report');
        }
    },

    /**
     * Generates a venue utilization report for the specified time period and venues
     * @param request - The report request parameters including date range and optional venue filters
     * @returns Promise<Blob> - The generated PDF report as a Blob
     * @throws Error if the report generation fails
     */
    generateVenueUtilizationReport: async (request: VenueUtilizationReportRequest): Promise<Blob> => {
        try {
            const response = await api.post('/admin/report/venue-utilization', request, {
                responseType: 'blob'
            });

            if (response.status !== HttpStatusCode.Ok) {
                throw new Error('Failed to generate venue utilization report');
            }

            return response.data;
        } catch (error: any) {
            console.error('Error generating venue utilization report:', error);
            throw new Error(error.response?.data?.message || 'Failed to generate venue utilization report');
        }
    },

    generateEventTypePerformanceReport: async (startDateTime: string, endDateTime:string): Promise<Blob> => {
        try {
            const response = await api.get('/admin/report/event-types-performance', {
                params:{
                    "startDateTime": startDateTime,
                    "endDateTime": endDateTime
                },
                 responseType: 'blob'
            });

            if (response.status !== HttpStatusCode.Ok) {
                throw new Error('Failed to generate event types performance report');
            }

            return response.data;
        } catch (error: any) {
            console.error('Error generating event types performance report:', error);
            throw new Error(error.response?.data?.message || 'Failed to generate event types performance report');
        }
    }
};

export default adminService;
