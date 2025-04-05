import { PettyCashEntry, ExpenseCategory, Requester } from '@/types/petty-cash';
import { pettyCashService } from './petty-cash.service';

export type ReportPeriod = {
    startDate: Date;
    endDate: Date;
};

export type CategoryReport = {
    category: ExpenseCategory;
    totalAmount: number;
    count: number;
    entries: PettyCashEntry[];
};

export type RequesterReport = {
    requester: Requester;
    totalAmount: number;
    count: number;
    entries: PettyCashEntry[];
};

export type SummaryReport = {
    totalAmount: number;
    totalEntries: number;
    categoryReports: CategoryReport[];
    requesterReports: RequesterReport[];
    period: ReportPeriod;
};

class ReportService {
    async generateSummaryReport(period: ReportPeriod): Promise<SummaryReport> {
        const allEntries = await pettyCashService.getEntries();

        // กรองรายการตามช่วงเวลา
        const filteredEntries = allEntries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= period.startDate && entryDate <= period.endDate;
        });

        // คำนวณยอดรวมทั้งหมด
        const totalAmount = filteredEntries.reduce((sum, entry) => sum + entry.amount, 0);

        // สร้างรายงานแยกตามประเภท
        const categoryMap = new Map<string, CategoryReport>();

        filteredEntries.forEach(entry => {
            const categoryId = entry.category.id;
            if (!categoryMap.has(categoryId)) {
                categoryMap.set(categoryId, {
                    category: entry.category,
                    totalAmount: 0,
                    count: 0,
                    entries: [],
                });
            }

            const report = categoryMap.get(categoryId)!;
            report.totalAmount += entry.amount;
            report.count += 1;
            report.entries.push(entry);
        });

        // สร้างรายงานแยกตามผู้เบิก
        const requesterMap = new Map<string, RequesterReport>();

        filteredEntries.forEach(entry => {
            const requesterId = entry.requester.id;
            if (!requesterMap.has(requesterId)) {
                requesterMap.set(requesterId, {
                    requester: entry.requester,
                    totalAmount: 0,
                    count: 0,
                    entries: [],
                });
            }

            const report = requesterMap.get(requesterId)!;
            report.totalAmount += entry.amount;
            report.count += 1;
            report.entries.push(entry);
        });

        return {
            totalAmount,
            totalEntries: filteredEntries.length,
            categoryReports: Array.from(categoryMap.values()),
            requesterReports: Array.from(requesterMap.values()),
            period,
        };
    }

    async generateCategoryReport(categoryId: string, period: ReportPeriod): Promise<CategoryReport | null> {
        const allEntries = await pettyCashService.getEntries();

        // กรองรายการตามประเภทและช่วงเวลา
        const filteredEntries = allEntries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entry.category.id === categoryId &&
                entryDate >= period.startDate &&
                entryDate <= period.endDate;
        });

        if (filteredEntries.length === 0) return null;

        const category = filteredEntries[0].category;
        const totalAmount = filteredEntries.reduce((sum, entry) => sum + entry.amount, 0);

        return {
            category,
            totalAmount,
            count: filteredEntries.length,
            entries: filteredEntries,
        };
    }

    async generateRequesterReport(requesterId: string, period: ReportPeriod): Promise<RequesterReport | null> {
        const allEntries = await pettyCashService.getEntries();

        // กรองรายการตามผู้เบิกและช่วงเวลา
        const filteredEntries = allEntries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entry.requester.id === requesterId &&
                entryDate >= period.startDate &&
                entryDate <= period.endDate;
        });

        if (filteredEntries.length === 0) return null;

        const requester = filteredEntries[0].requester;
        const totalAmount = filteredEntries.reduce((sum, entry) => sum + entry.amount, 0);

        return {
            requester,
            totalAmount,
            count: filteredEntries.length,
            entries: filteredEntries,
        };
    }

    async exportToCSV(entries: PettyCashEntry[]): Promise<string> {
        // สร้างหัวข้อ CSV
        const headers = [
            'ID',
            'Date',
            'Amount',
            'Description',
            'Category',
            'Requester',
            'Department',
            'Status',
            'Notes',
            'Created At',
            'Updated At'
        ].join(',');

        // สร้างข้อมูล CSV
        const rows = entries.map(entry => [
            entry.id,
            new Date(entry.date).toISOString().split('T')[0],
            entry.amount,
            `"${entry.description.replace(/"/g, '""')}"`,
            `"${entry.category.name.replace(/"/g, '""')}"`,
            `"${entry.requester.name.replace(/"/g, '""')}"`,
            `"${entry.requester.department.replace(/"/g, '""')}"`,
            entry.status,
            entry.notes ? `"${entry.notes.replace(/"/g, '""')}"` : '',
            new Date(entry.createdAt).toISOString(),
            new Date(entry.updatedAt).toISOString()
        ].join(','));

        return [headers, ...rows].join('\n');
    }
}

export const reportService = new ReportService(); 