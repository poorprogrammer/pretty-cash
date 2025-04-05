import { useEffect, useState } from 'react';
import { PettyCashEntry } from '@/types/petty-cash';
import { pettyCashService } from '@/services/petty-cash.service';

export default function PettyCashList() {
    const [entries, setEntries] = useState<PettyCashEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    useEffect(() => {
        loadEntries();
    }, []);

    const loadEntries = async () => {
        try {
            setLoading(true);
            const data = await pettyCashService.getEntries();
            setEntries(data);
            setError(null);
        } catch (err) {
            setError('Failed to load entries');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: string, newStatus: PettyCashEntry['status']) => {
        try {
            await pettyCashService.updateEntry(id, { status: newStatus });
            await loadEntries();
        } catch (err) {
            setError('Failed to update status');
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await pettyCashService.deleteEntry(id);
            setDeleteConfirmId(null);
            await loadEntries();
        } catch (err) {
            setError('Failed to delete entry');
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg text-gray-700">Loading entries...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h2 className="text-xl font-bold mb-4">Petty Cash Entries</h2>

            {entries.length === 0 ? (
                <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 text-center">
                    <p className="text-gray-700">No entries found. Create a new entry to get started.</p>
                </div>
            ) : (
                <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {entries.map(entry => (
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
                                            <select
                                                value={entry.status}
                                                onChange={(e) => handleStatusChange(entry.id, e.target.value as PettyCashEntry['status'])}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 text-sm"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="approved">Approved</option>
                                                <option value="rejected">Rejected</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {deleteConfirmId === entry.id ? (
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleDelete(entry.id)}
                                                        className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                                                    >
                                                        Yes, delete
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirmId(null)}
                                                        className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setDeleteConfirmId(entry.id)}
                                                    className="text-red-600 hover:text-red-900 text-xs font-medium"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
} 