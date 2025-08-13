"use client";
import { useEffect, useState, useCallback } from "react";
import { FaSearch, FaSpinner } from "react-icons/fa";
import styles from './venues.module.css';
import { Venue } from "@/types/event";
import venueService from "@/services/venueService";
import VenuesTable from "./VenuesTable";

export default function ManageVenuesPage() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [currentFloorLevel, setCurrentFloorLevel] = useState(1);

    // Paging state
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [offset, setOffset] = useState(0);

    const fetchVenues = useCallback(async () => {
        try {
            const data = await venueService.fetchVenuesInPage(currentFloorLevel, currentPage, pageSize);
            setVenues(data.content);
            setTotalItems(data.totalElements);
            setTotalPages(data.totalPages);
            setOffset(data.pageable.offset);
        } catch (error: unknown) {
            if (error instanceof Error) {
                alert(error.message || "Failed to fetch venues. Please try again.");
            } else {
                alert("Failed to fetch venues. Please try again.");
            }
        }
    }, [currentPage, pageSize,currentFloorLevel]);

    // Fetch roles on initial load
    useEffect(() => {
        fetchVenues();
    }, [fetchVenues]);


    
    const handleSearch = useCallback(async () => {
        if (!searchQuery.trim()) {
            fetchVenues();
            return;
        }
        try {
            // setIsSearching(true);
            // const data = await roleService.fetchRolesByName(searchQuery);
            // setRoles(data);
        } catch (error: unknown) {
            if (error instanceof Error) {
                alert(error.message || "Failed to search roles");
            } else {
                alert("Failed to search roles");
            }
        } finally {
            setIsSearching(false);
        }
    }, [searchQuery, fetchVenues]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(0); // Reset to the first page on page size change
    };

    const handleFloorLevelChange = async (floorLevel: number) => {
        setCurrentFloorLevel(floorLevel);
    };


    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            handleSearch();
        }, 1000);
        return () => clearTimeout(delayDebounce);
    }, [handleSearch]);

    const handleDeleteVenue = async (id: number) => {
        if (!confirm("Are you sure you want to delete this venue?")) return;

        try {
            await venueService.deleteVenue(id);
            await fetchVenues();
            alert("Venue is deleted successfully");
        } catch (error: unknown) {
            if (error instanceof Error) {
                alert(error.message || "Failed to delete venue. Please try agian.");
            } else {
                alert("Failed to delete venue. Please try agian.");
            }
        }
    };

    const handleEditVenue = async (id: number, venue: Venue) => {

        try {
            await venueService.updateVenue(id, venue);
            await fetchVenues();
            alert("Venue is updated successfully");
        } catch (error: unknown) {
            if (error instanceof Error) {
                alert(error.message || "Failed to update venue. Please try agian.");
            } else {
                alert("Failed to update venue. Please try agian.");
            }
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Venues Management</h1>
                    <div className={styles.searchBar}>
                        <FaSearch className={styles.searchIcon} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Search venues..."
                        />
                        {isSearching && (
                            <FaSpinner className={styles.searchIcon} style={{ right: '1rem', left: 'auto' }} />
                        )}
                    </div>
                </div>

                <VenuesTable
                    venues={venues}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    totalPages={totalPages}
                    offset={offset}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    handleDeleteVenue={handleDeleteVenue}
                    handleEditVenue={handleEditVenue}
                    currentFloorLevel={currentFloorLevel}
                    onFloorLevelChange={handleFloorLevelChange} />
            </div>
        </div>
    );
}