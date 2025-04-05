import { useState, useEffect } from 'react';
import { reportService, ReportPeriod, SummaryReport, CategoryReport, RequesterReport } from '@/services/report.service';
import { ExpenseCategory, Requester } from '@/types/petty-cash';

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

type ReportType = 'summary' | 'category' | 'requester';

export default function ReportGenerator() {
    const [reportType, setReportType] = useState<ReportType>('summary');
    const [startDate, setStartDate] = useState<string>(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedRequester, setSelectedRequester] = useState<string>('');

    const [summaryReport, setSummaryReport] = useState<SummaryReport | null>(null);
    const [categoryReport, setCategoryReport] = useState<CategoryReport | null>(null);
    const [requesterReport, setRequesterReport] = useState<RequesterReport | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [csvData, setCsvData] = useState<string | null>(null);

    const generateReport = async () => {
        setLoading(true);
        setError(null);
        setCsvData(null);

        try {
            const period: ReportPeriod = {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            };

            if (reportType === 'summary') {
                const report = await reportService.generateSummaryReport(period);
                setSummaryReport(report);
                setCategoryReport(null);
                setRequesterReport(null);
            } else if (reportType === 'category' && selectedCategory) {
                const report = await reportService.generateCategoryReport(selectedCategory, period);
                setCategoryReport(report);
                setSummaryReport(null);
                setRequesterReport(null);
            } else if (reportType === 'requester' && selectedRequester) {
                const report = await reportService.generateRequesterReport(selectedRequester, period);
                setRequesterReport(report);
                setSummaryReport(null);
                setCategoryReport(null);
            }
        } catch (err) {
            setError('Failed to generate report');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = async () => {
        try {
            let entries: any[] = [];

            if (reportType === 'summary' && summaryReport) {
                entries = summaryReport.categoryReports.flatMap(report => report.entries);
            } else if (reportType === 'category' && categoryReport) {
                entries = categoryReport.entries;
            } else if (reportType === 'requester' && requesterReport) {
                entries = requesterReport.entries;
            }

            if (entries.length > 0) {
                const csv = await reportService.exportToCSV(entries);
                setCsvData(csv);

                // สร้างไฟล์ CSV และดาวน์โหลด
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', `petty-cash-report-${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (err) {
            setError('Failed to export CSV');
            console.error(err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-xl font-bold mb-4">Generate Reports</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value as ReportType)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="summary">Summary Report</option>
                            <option value="category">Category Report</option>
                            <option value="requester">Requester Report</option>
                        </select>
                    </div>

                    {reportType === 'category' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Requester</label>
                            <select
                                value={selectedRequester}
                                onChange={(e) => setSelectedRequester(e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={generateReport}
                        disabled={loading || (reportType === 'category' && !selectedCategory) || (reportType === 'requester' && !selectedRequester)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {loading ? 'Generating...' : 'Generate Report'}
                    </button>
                </div>
            </div>

            {/* Summary Report */}
            {summaryReport && (
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Summary Report</h3>
                        <button
                            onClick={exportToCSV}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                        >
                            Export to CSV
                        </button>
                    </div>

                    <div className="mb-4">
                        <p className="text-sm text-gray-500">
                            Period: {new Date(summaryReport.period.startDate).toLocaleDateString()} - {new Date(summaryReport.period.endDate).toLocaleDateString()}
                        </p>
                        <p className="text-lg font-semibold">
                            Total Amount: {summaryReport.totalAmount.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                        </p>
                        <p className="text-sm text-gray-500">
                            Total Entries: {summaryReport.totalEntries}
                        </p>
                    </div>

                    <div className="mb-6">
                        <h4 className="font-medium mb-2">By Category</h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-4 py-2 border">Category</th>
                                        <th className="px-4 py-2 border">Count</th>
                                        <th className="px-4 py-2 border">Total Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summaryReport.categoryReports.map(report => (
                                        <tr key={report.category.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 border">{report.category.name}</td>
                                            <td className="px-4 py-2 border">{report.count}</td>
                                            <td className="px-4 py-2 border">
                                                {report.totalAmount.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-medium mb-2">By Requester</h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-4 py-2 border">Requester</th>
                                        <th className="px-4 py-2 border">Department</th>
                                        <th className="px-4 py-2 border">Count</th>
                                        <th className="px-4 py-2 border">Total Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summaryReport.requesterReports.map(report => (
                                        <tr key={report.requester.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 border">{report.requester.name}</td>
                                            <td className="px-4 py-2 border">{report.requester.department}</td>
                                            <td className="px-4 py-2 border">{report.count}</td>
                                            <td className="px-4 py-2 border">
                                                {report.totalAmount.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Category Report */}
            {categoryReport && (
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Category Report: {categoryReport.category.name}</h3>
                        <button
                            onClick={exportToCSV}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                        >
                            Export to CSV
                        </button>
                    </div>

                    <div className="mb-4">
                        <p className="text-sm text-gray-500">
                            Period: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                        </p>
                        <p className="text-lg font-semibold">
                            Total Amount: {categoryReport.totalAmount.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                        </p>
                        <p className="text-sm text-gray-500">
                            Total Entries: {categoryReport.count}
                        </p>
                    </div>

                    <div>
                        <h4 className="font-medium mb-2">Entries</h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-4 py-2 border">Date</th>
                                        <th className="px-4 py-2 border">Amount</th>
                                        <th className="px-4 py-2 border">Description</th>
                                        <th className="px-4 py-2 border">Requester</th>
                                        <th className="px-4 py-2 border">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categoryReport.entries.map(entry => (
                                        <tr key={entry.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 border">
                                                {new Date(entry.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-2 border">
                                                {entry.amount.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                                            </td>
                                            <td className="px-4 py-2 border">{entry.description}</td>
                                            <td className="px-4 py-2 border">
                                                {entry.requester.name} ({entry.requester.department})
                                            </td>
                                            <td className="px-4 py-2 border">
                                                <span className={`px-2 py-1 rounded-full text-sm ${entry.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        entry.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            entry.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                    }`}>
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

            {/* Requester Report */}
            {requesterReport && (
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                            Requester Report: {requesterReport.requester.name} ({requesterReport.requester.department})
                        </h3>
                        <button
                            onClick={exportToCSV}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                        >
                            Export to CSV
                        </button>
                    </div>

                    <div className="mb-4">
                        <p className="text-sm text-gray-500">
                            Period: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                        </p>
                        <p className="text-lg font-semibold">
                            Total Amount: {requesterReport.totalAmount.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                        </p>
                        <p className="text-sm text-gray-500">
                            Total Entries: {requesterReport.count}
                        </p>
                    </div>

                    <div>
                        <h4 className="font-medium mb-2">Entries</h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-4 py-2 border">Date</th>
                                        <th className="px-4 py-2 border">Amount</th>
                                        <th className="px-4 py-2 border">Description</th>
                                        <th className="px-4 py-2 border">Category</th>
                                        <th className="px-4 py-2 border">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requesterReport.entries.map(entry => (
                                        <tr key={entry.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 border">
                                                {new Date(entry.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-2 border">
                                                {entry.amount.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                                            </td>
                                            <td className="px-4 py-2 border">{entry.description}</td>
                                            <td className="px-4 py-2 border">{entry.category.name}</td>
                                            <td className="px-4 py-2 border">
                                                <span className={`px-2 py-1 rounded-full text-sm ${entry.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        entry.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            entry.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                    }`}>
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