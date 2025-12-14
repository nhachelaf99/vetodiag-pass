
export interface Owner {
    id: string;
    name: string;
    email: string;
    accessCode: string; // The "Owner Pass" ID
    photoUrl?: string;
}

export interface Patient {
    id: string;
    ownerId: string;
    name: string;
    species: string;
    breed: string;
    age: string;
    sex: 'Male' | 'Female';
    weight: string;
    accessCode: string; // The "Patient Pass" ID
    photoUrl?: string;
    microchipId?: string;
    lastVisit?: string;
    vaccinations?: {
        name: string;
        date: string;
        nextDueDate: string;
    }[];
}

// Mock Owners
export const MOCK_OWNERS: Owner[] = [
    {
        id: "owner_123",
        name: "John Doe",
        email: "john.doe@example.com",
        accessCode: "OWN-123-456",
        photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    },
    {
        id: "owner_456",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        accessCode: "OWN-789-012",
        photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
    },
];

// Mock Patients
export const MOCK_PATIENTS: Patient[] = [
    {
        id: "pat_1",
        ownerId: "owner_123",
        name: "Max",
        species: "Canine",
        breed: "Golden Retriever",
        age: "5 years",
        sex: "Male",
        weight: "32 kg",
        accessCode: "PAT-111-AAA",
        photoUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=150&q=80",
        microchipId: "981098109810981",
        lastVisit: "2024-11-15",
        vaccinations: [
            { name: "Rabies", date: "2024-01-15", nextDueDate: "2025-01-15" },
            { name: "DHPP", date: "2024-03-10", nextDueDate: "2025-03-10" },
        ],
    },
    {
        id: "pat_2",
        ownerId: "owner_123",
        name: "Bella",
        species: "Feline",
        breed: "Siamese",
        age: "3 years",
        sex: "Female",
        weight: "4.5 kg",
        accessCode: "PAT-222-BBB",
        photoUrl: "https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=150&q=80",
        microchipId: "982098209820982",
        lastVisit: "2024-10-01",
        vaccinations: [
            { name: "FVRCP", date: "2024-02-20", nextDueDate: "2025-02-20" },
        ],
    },
    {
        id: "pat_3",
        ownerId: "owner_456",
        name: "Charlie",
        species: "Canine",
        breed: "Beagle",
        age: "2 years",
        sex: "Male",
        weight: "12 kg",
        accessCode: "PAT-333-CCC",
        photoUrl: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=150&q=80",
        microchipId: "983098309830983",
        lastVisit: "2024-12-01",
        vaccinations: [
            { name: "Rabies", date: "2024-06-15", nextDueDate: "2025-06-15" },
        ],
    },
];

export const getOwnerById = (id: string) => MOCK_OWNERS.find((o) => o.id === id);
export const getOwnerByAccessCode = (code: string) => MOCK_OWNERS.find((o) => o.accessCode === code);
export const getPatientById = (id: string) => MOCK_PATIENTS.find((p) => p.id === id);
export const getPatientByAccessCode = (code: string) => MOCK_PATIENTS.find((p) => p.accessCode === code);
export const getPatientsByOwnerId = (ownerId: string) => MOCK_PATIENTS.filter((p) => p.ownerId === ownerId);
