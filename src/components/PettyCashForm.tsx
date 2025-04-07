import { useState } from 'react';
import { pettyCashService } from '@/services/petty-cash.service';
import { PettyCashEntry, ExpenseCategory, Requester } from '@/types/petty-cash';

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
        category: '',
        requester: '',
        notes: '',
    });

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setIsSubmitting(true);

        try {
            // Validate form data
            if (!formData.category) {
                setError('Please select a category');
                setIsSubmitting(false);
                return;
            }

            if (!formData.requester) {
                setError('Please select a requester');
                setIsSubmitting(false);
                return;
            }

            const selectedCategory = mockCategories.find(cat => cat.id === formData.category);
            const selectedRequester = mockRequesters.find(req => req.id === formData.requester);

            if (!selectedCategory || !selectedRequester) {
                setError('Invalid category or requester');
                setIsSubmitting(false);
                return;
            }

            // Create new entry
            const newEntry: Omit<PettyCashEntry, 'id' | 'createdAt' | 'updatedAt'> = {
                date: new Date(formData.date),
                amount: parseFloat(formData.amount),
                description: formData.description,
                category: selectedCategory,
                requester: selectedRequester,
                notes: formData.notes,
                status: 'pending',
            };

            await pettyCashService.createEntry(newEntry);

            // Reset form and show success message
            setFormData({
                date: new Date().toISOString().split('T')[0],
                amount: '',
                description: '',
                category: '',
                requester: '',
                notes: '',
            });
            setSuccess(true);
        } catch (err) {
            setError('Failed to create entry');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-4">
            <h2 className="text-xl font-bold mb-4">New Petty Cash Entry</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    Entry created successfully
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-4 sm:p-6 border border-gray-200">
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 h-10 px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Amount (THB) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 h-10 px-3 py-2"
                            inputMode="decimal"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            placeholder="Brief description of the expense"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 h-10 px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 h-10 px-3 py-2"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Requester <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="requester"
                            value={formData.requester}
                            onChange={handleChange}
                            required
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 h-10 px-3 py-2"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Additional notes or details"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 px-3 py-2"
                        ></textarea>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 w-full sm:w-auto text-base font-medium"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </form>
        </div>
    );
} 