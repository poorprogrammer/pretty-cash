import { PettyCashEntry, PettyCashStatus, ExpenseCategory, Requester } from '@/types/petty-cash';

// Mock data - ในระบบจริงควรดึงจาก API
const mockCategories: ExpenseCategory[] = [
    { id: '1', name: 'Office Supplies', description: 'Office supplies and materials' },
    { id: '2', name: 'Travel', description: 'Travel expenses' },
    { id: '3', name: 'Meals', description: 'Food and beverages' },
];

const mockRequesters: Requester[] = [
    { id: '1', name: 'John Doe', department: 'IT' },
    { id: '2', name: 'Jane Smith', department: 'HR' },
    { id: '3', name: 'Bob Wilson', department: 'Finance' },
];

// Fallback UUID generation function
function generateUUID(): string {
    // Check if crypto.randomUUID is available
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    // Fallback implementation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

class PettyCashService {
    private entries: PettyCashEntry[] = [];

    async createEntry(entry: Omit<PettyCashEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<PettyCashEntry> {
        const newEntry: PettyCashEntry = {
            ...entry,
            id: generateUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.entries.push(newEntry);
        return newEntry;
    }

    async getEntries(): Promise<PettyCashEntry[]> {
        return [...this.entries];
    }

    async getEntryById(id: string): Promise<PettyCashEntry | null> {
        return this.entries.find(entry => entry.id === id) || null;
    }

    async updateEntry(id: string, updates: Partial<PettyCashEntry>): Promise<PettyCashEntry | null> {
        const index = this.entries.findIndex(entry => entry.id === id);
        if (index === -1) return null;

        const updatedEntry = {
            ...this.entries[index],
            ...updates,
            updatedAt: new Date(),
        };
        this.entries[index] = updatedEntry;
        return updatedEntry;
    }

    async updateStatus(id: string, status: PettyCashStatus): Promise<PettyCashEntry | null> {
        return this.updateEntry(id, { status });
    }

    async deleteEntry(id: string): Promise<boolean> {
        const initialLength = this.entries.length;
        this.entries = this.entries.filter(entry => entry.id !== id);
        return this.entries.length < initialLength;
    }

    async getEntriesByStatus(status: PettyCashEntry['status']): Promise<PettyCashEntry[]> {
        return this.entries.filter(entry => entry.status === status);
    }

    async getEntriesByRequester(requesterId: string): Promise<PettyCashEntry[]> {
        return this.entries.filter(entry => entry.requester.id === requesterId);
    }

    async getCategories(): Promise<ExpenseCategory[]> {
        return [...mockCategories];
    }

    async getRequesters(): Promise<Requester[]> {
        return [...mockRequesters];
    }
}

export const pettyCashService = new PettyCashService(); 