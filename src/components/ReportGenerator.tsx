import { useState } from 'react';
import { reportService } from '@/services/report.service';
import { ReportPeriod, SummaryReport, CategoryReport, RequesterReport } from '@/types/petty-cash';

// Mock data - ในระบบจริงควรดึงจาก API
const mockCategories = [
    { id: '1', name: 'Office Supplies', description: 'Office supplies and materials' },
    { id: '2', name: 'Travel', description: 'Travel expenses' },
    { id: '3', name: 'Meals', description: 'Food and beverages' },
];

const mockRequesters = [
    { id: '1', name: 'John Doe', department: 'IT' },
    { id: '2', name: 'Jane Smith', department: 'HR' },
    { id: '3', name: 'Bob Wilson', department: 'Finance' },
];

export default function ReportGenerator() {
    const [reportType, setReportType] = useState<'summary' | 'category' | 'requester'>('summary');
    const [startDate, setStartDate] = useState<string>(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedRequester, setSelectedRequester] = useState<string>('');
    const [reportData, setReportData] = useState<SummaryReport | CategoryReport | RequesterReport | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const generateReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const period: ReportPeriod = {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            };

            let report;
            switch (reportType) {
                case 'summary':
                    report = await reportService.generateSummaryReport(period);
                    break;
                case 'category':
                    if (!selectedCategory) {
                        throw new Error('Please select a category');
                    }
                    report = await reportService.generateCategoryReport(selectedCategory, period);
                    break;
                case 'requester':
                    if (!selectedRequester) {
                        throw new Error('Please select a requester');
                    }
                    report = await reportService.generateRequesterReport(selectedRequester, period);
                    break;
            }
            setReportData(report);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate report');
            setReportData(null);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = async () => {
        if (!reportData) return;
        try {
            const csv = await reportService.exportToCSV(reportData.entries);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `petty-cash-report-${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
        } catch (err) {
            setError('Failed to export report');
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h2 className="text-xl font-bold mb-4">Generate Reports</h2>

            <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Report Type
                        </label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value as 'summary' | 'category' | 'requester')}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900"
                        >
                            <option value="summary">Summary Report</option>
                            <option value="category">Category Report</option>
                            <option value="requester">Requester Report</option>
                        </select>
                    </div>

                    {reportType === 'category' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900"
                            >
                                <option value="">Select a category</option>
                                {mockCategories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {reportType === 'requester' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Requester
                            </label>
                            <select
                                value={selectedRequester}
                                onChange={(e) => setSelectedRequester(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900"
                            >
                                <option value="">Select a requester</option>
                                {mockRequesters.map(requester => (
                                    <option key={requester.id} value={requester.id}>
                                        {requester.name} ({requester.department})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-2">
                    <button
                        onClick={generateReport}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {loading ? 'Generating...' : 'Generate Report'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {reportData && (
                <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">
                                {reportType === 'summary' ? 'Summary Report' :
                                    reportType === 'category' ? 'Category Report' : 'Requester Report'}
                            </h3>
                            <button
                                onClick={exportToCSV}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                            >
                                Export to CSV
                            </button>
                        </div>
                    </div>

                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-sm font-medium text-gray-500">Total Amount</div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {reportData.totalAmount.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-sm font-medium text-gray-500">Total Entries</div>
                                <div className="text-2xl font-bold text-gray-900">{reportData.totalEntries}</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-sm font-medium text-gray-500">Average Amount</div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {(reportData.totalAmount / reportData.totalEntries).toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Requester</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {reportData.entries.map(entry => (
                                        <tr key={entry.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(entry.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                {entry.amount.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {entry.description}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {entry.category.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {entry.requester.name} ({entry.requester.department})
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium
                                                    ${entry.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        entry.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            entry.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-yellow-100 text-yellow-800'}`}>
                                                    {entry.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 