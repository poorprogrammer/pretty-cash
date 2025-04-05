'use client';

import { useState } from 'react';
import PettyCashList from '@/components/PettyCashList';
import PettyCashForm from '@/components/PettyCashForm';
import ReportGenerator from '@/components/ReportGenerator';

type Tab = 'list' | 'new' | 'reports';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('list');

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Petty Cash Management</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('list')}
                className={`${activeTab === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                List Entries
              </button>
              <button
                onClick={() => setActiveTab('new')}
                className={`${activeTab === 'new'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                New Entry
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`${activeTab === 'reports'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Reports
              </button>
            </nav>
          </div>

          {activeTab === 'list' && <PettyCashList />}
          {activeTab === 'new' && <PettyCashForm />}
          {activeTab === 'reports' && <ReportGenerator />}
        </div>
      </main>
    </div>
  );
}
