import { PettyCashEntry, PettyCashStatus } from '@/types/petty-cash';

class PettyCashService {
    private entries: PettyCashEntry[] = [];

    async createEntry(entry: Omit<PettyCashEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<PettyCashEntry> {
        const newEntry: PettyCashEntry = {
            ...entry,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.entries.push(newEntry);
        return newEntry;
    }

    async getEntries(): Promise<PettyCashEntry[]> {
        return this.entries;
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
        const index = this.entries.findIndex(entry => entry.id === id);
        if (index === -1) return false;

        this.entries.splice(index, 1);
        return true;
    }

    async getEntriesByStatus(status: PettyCashStatus): Promise<PettyCashEntry[]> {
        return this.entries.filter(entry => entry.status === status);
    }

    async getEntriesByRequester(requesterId: string): Promise<PettyCashEntry[]> {
        return this.entries.filter(entry => entry.requester.id === requesterId);
    }
}

export const pettyCashService = new PettyCashService(); 