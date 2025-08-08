import React from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { addDummyAccount, removeDummyAccount } from '../store/slices/smtpSlice.js';

const ReduxTest: React.FC = () => {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((state) => state.smtp.accounts);

  // Handle nested API response structure
  const getAccountsArray = () => {
    if (Array.isArray(accounts)) return accounts;
    if (accounts?.data?.accounts && Array.isArray(accounts.data.accounts)) return accounts.data.accounts;
    if (accounts?.accounts && Array.isArray(accounts.accounts)) return accounts.accounts;
    return [];
  };

  const accountsArray = getAccountsArray();

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">🔧 Redux Status Test</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{accountsArray.length}</div>
          <div className="text-sm text-blue-800">Total Accounts</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{accountsArray.filter((acc: any) => acc.is_active).length}</div>
          <div className="text-sm text-green-800">Active Accounts</div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={() => dispatch(addDummyAccount())}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Test Account
        </button>
        
        <button
          onClick={() => dispatch(removeDummyAccount())}
          disabled={accounts.length === 0}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Remove Test Account
        </button>
        
        <div className="text-sm text-gray-600">
          Redux Store Status: <span className="font-semibold text-green-600">✅ Connected</span>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <details>
          <summary className="cursor-pointer">View Account Names</summary>
          <ul className="mt-2 space-y-1">
            {accounts.map((account: any, index: any) => (
              <li key={account.id} className="text-gray-600">
                {index + 1}. {account.name} ({account.provider})
              </li>
            ))}
          </ul>
        </details>
      </div>
    </div>
  );
};

export default ReduxTest;
