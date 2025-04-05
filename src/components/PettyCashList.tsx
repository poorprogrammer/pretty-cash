import { useEffect, useState } from 'react';
import { PettyCashEntry } from '@/types/petty-cash';
import { pettyCashService } from '@/services/petty-cash.service';

export default function PettyCashList() {
    const [entries, setEntries] = useState<PettyCashEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
            await pettyCashService.updateStatus(id, newStatus);
            await loadEntries();
        } catch (err) {
            setError('Failed to update status');
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this entry?')) return;

        try {
            await pettyCashService.deleteEntry(id);
            await loadEntries();
        } catch (err) {
            setError('Failed to delete entry');
            console.error(err);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Petty Cash Entries</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2 border">Date</th>
                            <th className="px-4 py-2 border">Amount</th>
                            <th className="px-4 py-2 border">Description</th>
                            <th className="px-4 py-2 border">Category</th>
                            <th className="px-4 py-2 border">Requester</th>
                            <th className="px-4 py-2 border">Status</th>
                            <th className="px-4 py-2 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((entry) => (
                            <tr key={entry.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 border">
                                    {new Date(entry.date).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-2 border">
                                    {entry.amount.toLocaleString('th-TH', {
                                        style: 'currency',
                                        currency: 'THB',
                                    })}
                                </td>
                                <td className="px-4 py-2 border">{entry.description}</td>
                                <td className="px-4 py-2 border">{entry.category.name}</td>
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
                                <td className="px-4 py-2 border">
                                    <div className="flex gap-2">
                                        <select
                                            className="border rounded px-2 py-1"
                                            value={entry.status}
                                            onChange={(e) => handleStatusChange(entry.id, e.target.value as PettyCashEntry['status'])}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approved</option>
                                            <option value="rejected">Rejected</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                        <button
                                            onClick={() => handleDelete(entry.id)}
                                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
} 