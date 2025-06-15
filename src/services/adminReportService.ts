import api from './api';
import { HttpStatusCode } from 'axios';

interface VenueUtilizationReportRequest {
    startDateTime: string;  // ISO-8601 format
    endDateTime: string;    // ISO-8601 format
    venueIds?: number[];    // Optional array of venue IDs to filter
}

const adminReportService = {
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
    }
};

export default adminReportService;
