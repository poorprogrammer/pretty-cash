export type ExpenseCategory = {
    id: string;
    name: string;
    description?: string;
};

export type Requester = {
    id: string;
    name: string;
    department: string;
};

export type PettyCashStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export type PettyCashEntry = {
    id: string;
    date: Date;
    amount: number;
    description: string;
    category: ExpenseCategory;
    requester: Requester;
    status: PettyCashStatus;
    receiptUrl?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}; 