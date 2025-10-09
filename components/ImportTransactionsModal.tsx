import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Transaction, TransactionType, UserRole } from '../types';
import { INCOME_CATEGORIES } from '../constants';
import { useAuth } from '../context/AuthContext';

interface ImportTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (transactions: Omit<Transaction, 'id'>[]) => void;
  expenseCategories: string[];
}

type CsvData = string[][];
type ColumnMapping = {
  date: string;
  description: string;
  amount: string;
  category?: string;
  type?: string;
};

const APP_FIELDS: (keyof ColumnMapping)[] = ['date', 'description', 'amount', 'category', 'type'];
const REQUIRED_FIELDS: (keyof ColumnMapping)[] = ['date', 'description', 'amount'];

const ImportTransactionsModal: React.FC<ImportTransactionsModalProps> = ({ isOpen, onClose, onImport, expenseCategories }) => {
  const { userRole } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<CsvData>([]);
  const [mapping, setMapping] = useState<Partial<ColumnMapping>>({});
  const [error, setError] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<{ success: number; failed: number } | null>(null);

  // Check if user has permission to import transactions
  if (userRole === UserRole.VIEWER) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold text-slate-800">Import Transactions from CSV</h2>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-800" aria-label="Close">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="text-yellow-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Access Restricted:</strong> You need ADMIN or EDITOR permissions to import transactions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end items-center p-4 border-t gap-4">
            <button onClick={onClose} className="text-slate-600 font-medium py-2 px-4 rounded-md hover:bg-slate-100">Close</button>
          </div>
        </div>
      </div>
    );
  }

  const resetState = useCallback(() => {
    setFile(null);
    setCsvHeaders([]);
    setCsvData([]);
    setMapping({});
    setError(null);
    setImportSummary(null);
  }, []);

  const handleClose = () => {
    resetState();
    onClose();
  };
  
  const parseCsv = useCallback((text: string) => {
    const lines = text.trim().split(/\r\n|\n/);
    if (lines.length < 2) {
      setError("CSV must have a header row and at least one data row.");
      return;
    }
    const headers = lines[0].split(',').map(h => h.trim());
    const data = lines.slice(1).map(line => line.split(',').map(d => d.trim()));
    
    setCsvHeaders(headers);
    setCsvData(data);
    autoMapColumns(headers);
  }, []);

  const autoMapColumns = (headers: string[]) => {
    const newMapping: Partial<ColumnMapping> = {};
    const lowerHeaders = headers.map(h => h.toLowerCase());

    const map = (fieldName: keyof ColumnMapping, keywords: string[]) => {
      const headerIndex = lowerHeaders.findIndex(h => keywords.some(kw => h.includes(kw)));
      if (headerIndex !== -1) {
        newMapping[fieldName] = headers[headerIndex];
      }
    };
    
    map('date', ['date']);
    map('description', ['desc', 'details', 'memo']);
    map('amount', ['amount', 'value', 'total']);
    map('category', ['category', 'group']);
    map('type', ['type']);

    setMapping(newMapping);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    resetState();
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv') {
        setError('Please select a valid CSV file.');
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        parseCsv(text);
      };
      reader.onerror = () => setError("Failed to read the file.");
      reader.readAsText(selectedFile);
    }
  };

  const handleMappingChange = (appField: keyof ColumnMapping, csvHeader: string) => {
    setMapping(prev => ({ ...prev, [appField]: csvHeader }));
  };

  const handleImport = () => {
    setError(null);
    setImportSummary(null);

    const newTransactions: Omit<Transaction, 'id'>[] = [];
    let failedCount = 0;

    const getIndex = (field: keyof ColumnMapping) => mapping[field] ? csvHeaders.indexOf(mapping[field]!) : -1;
    const dateIndex = getIndex('date');
    const descIndex = getIndex('description');
    const amountIndex = getIndex('amount');
    const catIndex = getIndex('category');
    const typeIndex = getIndex('type');

    csvData.forEach(row => {
      try {
        const dateStr = row[dateIndex];
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) throw new Error('Invalid date');

        const description = row[descIndex];
        if (!description) throw new Error('Missing description');

        let amountVal = row[amountIndex].replace(/[^0-9.-]+/g, "");
        let amount = parseFloat(amountVal);
        if (isNaN(amount)) throw new Error('Invalid amount');

        let type: TransactionType;
        const typeStr = typeIndex > -1 ? row[typeIndex]?.toLowerCase() : '';
        if (typeStr.includes('income') || typeStr.includes('credit')) {
          type = TransactionType.INCOME;
        } else if (typeStr.includes('expense') || typeStr.includes('debit')) {
          type = TransactionType.EXPENSE;
        } else {
          // Infer from amount sign
          type = amount >= 0 ? TransactionType.INCOME : TransactionType.EXPENSE;
        }
        amount = Math.abs(amount);

        const allCategories = [...INCOME_CATEGORIES, ...expenseCategories];
        let category = catIndex > -1 ? row[catIndex] : 'Other';
        if (!allCategories.find(c => c.toLowerCase() === category.toLowerCase())) {
          category = 'Other';
        }

        newTransactions.push({
          date: date.toISOString().split('T')[0],
          description,
          amount,
          type,
          category,
        });
      } catch (e) {
        failedCount++;
      }
    });

    if (newTransactions.length > 0) {
      onImport(newTransactions);
    }
    setImportSummary({ success: newTransactions.length, failed: failedCount });
  };

  const isImportDisabled = useMemo(() => {
    return REQUIRED_FIELDS.some(field => !mapping[field]);
  }, [mapping]);

  const previewData = useMemo(() => {
    if (csvData.length === 0) return [];
    
    return csvData.slice(0, 5).map(row => {
      const transaction: any = {};
      APP_FIELDS.forEach(field => {
        const header = mapping[field];
        if (header) {
          const index = csvHeaders.indexOf(header);
          transaction[field] = row[index];
        }
      });
      return transaction;
    });
  }, [csvData, csvHeaders, mapping]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-slate-800">Import Transactions from CSV</h2>
          <button onClick={handleClose} className="text-slate-500 hover:text-slate-800" aria-label="Close">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto">
          {importSummary ? (
            <div className="text-center p-8">
                <h3 className="text-2xl font-bold text-green-600 mb-2">Import Complete!</h3>
                <p className="text-slate-600">Successfully imported {importSummary.success} transactions.</p>
                {importSummary.failed > 0 && <p className="text-red-500 mt-1">{importSummary.failed} rows were skipped due to errors.</p>}
                <button onClick={handleClose} className="mt-6 bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700">Finish</button>
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="csv-upload" className="block text-sm font-medium text-slate-700 mb-1">Step 1: Upload CSV File</label>
                <p className="text-xs text-slate-500 mb-2">Ensure your CSV has a header row. Required columns are Date, Description, and Amount.</p>
                <input id="csv-upload" type="file" accept=".csv" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              {csvHeaders.length > 0 && (
                <>
                  <div>
                    <h3 className="text-md font-medium text-slate-700 mb-2">Step 2: Map Columns</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-md bg-slate-50">
                      {APP_FIELDS.map(field => (
                        <div key={field}>
                          <label htmlFor={`map-${field}`} className="block text-sm font-medium text-slate-600 capitalize">
                            {field} {REQUIRED_FIELDS.includes(field) && <span className="text-red-500">*</span>}
                          </label>
                          <select
                            id={`map-${field}`}
                            value={mapping[field] || ''}
                            onChange={(e) => handleMappingChange(field, e.target.value)}
                            className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          >
                            <option value="">Select CSV Column</option>
                            {csvHeaders.map(header => <option key={header} value={header}>{header}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md font-medium text-slate-700 mb-2">Step 3: Preview Data</h3>
                    <div className="overflow-x-auto border rounded-md">
                      <table className="min-w-full text-sm">
                        <thead className="bg-slate-100">
                          <tr>
                            {APP_FIELDS.map(field => mapping[field] && <th key={field} className="p-2 text-left font-medium text-slate-600 capitalize">{field}</th>)}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {previewData.map((row, i) => (
                            <tr key={i}>
                              {APP_FIELDS.map(field => mapping[field] && <td key={field} className="p-2 text-slate-500 truncate max-w-xs">{row[field]}</td>)}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {!importSummary && (
            <div className="flex justify-end items-center p-4 border-t gap-4">
                <button onClick={handleClose} className="text-slate-600 font-medium py-2 px-4 rounded-md hover:bg-slate-100">Cancel</button>
                <button onClick={handleImport} disabled={isImportDisabled} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed">
                Import Transactions
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default ImportTransactionsModal;
