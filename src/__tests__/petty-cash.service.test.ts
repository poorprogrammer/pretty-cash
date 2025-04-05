import { pettyCashService } from '@/services/petty-cash.service';
import { PettyCashEntry, PettyCashStatus } from '@/types/petty-cash';

describe('PettyCashService', () => {
    const mockCategory = {
        id: '1',
        name: 'Office Supplies',
        description: 'Office supplies and materials',
    };

    const mockRequester = {
        id: '1',
        name: 'John Doe',
        department: 'IT',
    };

    const mockEntry = {
        date: new Date(),
        amount: 1000,
        description: 'Printer paper',
        category: mockCategory,
        requester: mockRequester,
        status: 'pending' as PettyCashStatus,
    };

    beforeEach(() => {
        // Clear the entries array before each test
        (pettyCashService as any).entries = [];
    });

    it('should create a new entry', async () => {
        const entry = await pettyCashService.createEntry(mockEntry);

        expect(entry).toHaveProperty('id');
        expect(entry.amount).toBe(mockEntry.amount);
        expect(entry.description).toBe(mockEntry.description);
        expect(entry.status).toBe('pending');
    });

    it('should get all entries', async () => {
        await pettyCashService.createEntry(mockEntry);
        const entries = await pettyCashService.getEntries();

        expect(entries).toHaveLength(1);
        expect(entries[0].description).toBe(mockEntry.description);
    });

    it('should get entry by id', async () => {
        const created = await pettyCashService.createEntry(mockEntry);
        const found = await pettyCashService.getEntryById(created.id);

        expect(found).toBeTruthy();
        expect(found?.id).toBe(created.id);
    });

    it('should update entry status', async () => {
        const created = await pettyCashService.createEntry(mockEntry);
        const updated = await pettyCashService.updateStatus(created.id, 'approved');

        expect(updated).toBeTruthy();
        expect(updated?.status).toBe('approved');
    });

    it('should delete entry', async () => {
        const created = await pettyCashService.createEntry(mockEntry);
        const deleted = await pettyCashService.deleteEntry(created.id);

        expect(deleted).toBe(true);
        const entries = await pettyCashService.getEntries();
        expect(entries).toHaveLength(0);
    });

    it('should get entries by status', async () => {
        await pettyCashService.createEntry(mockEntry);
        const pendingEntries = await pettyCashService.getEntriesByStatus('pending');

        expect(pendingEntries).toHaveLength(1);
        expect(pendingEntries[0].status).toBe('pending');
    });

    it('should get entries by requester', async () => {
        await pettyCashService.createEntry(mockEntry);
        const requesterEntries = await pettyCashService.getEntriesByRequester(mockRequester.id);

        expect(requesterEntries).toHaveLength(1);
        expect(requesterEntries[0].requester.id).toBe(mockRequester.id);
    });
}); 