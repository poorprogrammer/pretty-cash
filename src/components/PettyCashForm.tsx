import { useState } from 'react';
import { PettyCashEntry, ExpenseCategory, Requester } from '@/types/petty-cash';
import { pettyCashService } from '@/services/petty-cash.service';

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

export default function PettyCashForm() {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        description: '',
        categoryId: '',
        requesterId: '',
        notes: '',
    });

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        try {
            const category = mockCategories.find(c => c.id === formData.categoryId);
            const requester = mockRequesters.find(r => r.id === formData.requesterId);

            if (!category || !requester) {
                throw new Error('Invalid category or requester');
            }

            const entry: Omit<PettyCashEntry, 'id' | 'createdAt' | 'updatedAt'> = {
                date: new Date(formData.date),
                amount: parseFloat(formData.amount),
                description: formData.description,
                category,
                requester,
                status: 'pending',
                notes: formData.notes || undefined,
            };

            await pettyCashService.createEntry(entry);
            setSuccess(true);
            setFormData({
                date: new Date().toISOString().split('T')[0],
                amount: '',
                description: '',
                categoryId: '',
                requesterId: '',
                notes: '',
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create entry');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h2 className="text-xl font-bold mb-4">New Petty Cash Entry</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    Entry created successfully!
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Amount (THB)</label>
                    <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                        min="0"
                        step="0.01"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <input
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    >
                        <option value="">Select a category</option>
                        {mockCategories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Requester</label>
                    <select
                        name="requesterId"
                        value={formData.requesterId}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    >
                        <option value="">Select a requester</option>
                        {mockRequesters.map(requester => (
                            <option key={requester.id} value={requester.id}>
                                {requester.name} ({requester.department})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        rows={3}
                    />
                </div>

                <div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Create Entry
                    </button>
                </div>
            </form>
        </div>
    );
} 