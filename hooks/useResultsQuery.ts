import { useQuery } from '@tanstack/react-query';

// Mock data
const MOCK_RESULTS = [
    {
        id: 1,
        title: "Annual Wellness Panel",
        pet: "Rocky",
        date: "Oct 27, 2023",
        type: "Blood Work",
        doctor: "Dr. Emily Carter",
        status: "Normal",
        downloadUrl: "#",
    },
    {
        id: 2,
        title: "X-Ray: Right Hind Leg",
        pet: "Milo",
        date: "Nov 5, 2023",
        type: "Imaging",
        doctor: "Dr. James Rodriguez",
        status: "Review Needed",
        downloadUrl: "#",
    },
    {
        id: 3,
        title: "Fecal Analysis",
        pet: "Daisy",
        date: "Nov 18, 2023",
        type: "Lab Test",
        doctor: "Lab Corp",
        status: "Normal",
        downloadUrl: "#",
    },
];

export function useResultsQuery() {
    return useQuery({
        queryKey: ['results'],
        queryFn: async () => {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            return MOCK_RESULTS;
        },
        staleTime: Infinity, // Keep static data fresh
    });
}
