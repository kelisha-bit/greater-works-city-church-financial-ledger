import React, { useRef, useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';

const STORAGE_KEYS = [
  'churchLedgerTransactions',
  'churchLedgerBudgets',
  'churchLedgerCustomCategories',
] as const;

type StorageKey = typeof STORAGE_KEYS[number];

type BackupPayloadV1 = {
  version: 1;
  exportedAt: string; // ISO date
  data: Record<StorageKey, unknown | null>;
};

const fileMime = 'application/json';

function isMonthKey(key: string) {
  return /^\d{4}-\d{2}$/.test(key);
}

function isTransactionsArray(val: unknown): val is Array<Record<string, unknown>> {
  if (!Array.isArray(val)) return false;
  return val.every((t) =>
    t && typeof t === 'object' &&
    typeof (t as any).date === 'string' &&
    typeof (t as any).description === 'string' &&
    typeof (t as any).category === 'string' &&
    typeof (t as any).amount === 'number' &&
    typeof (t as any).type === 'string'
  );
}

function isBudgetsMap(val: unknown): val is Record<string, Record<string, number>> {
  if (!val || typeof val !== 'object' || Array.isArray(val)) return false;
  return Object.entries(val as Record<string, unknown>).every(([month, catMap]) => {
    if (!isMonthKey(month) || !catMap || typeof catMap !== 'object' || Array.isArray(catMap)) return false;
    return Object.entries(catMap as Record<string, unknown>).every(([, amount]) => typeof amount === 'number');
  });
}

function isStringArray(val: unknown): val is string[] {
  return Array.isArray(val) && val.every((v) => typeof v === 'string');
}

const BackupRestore: React.FC = () => {
  const { transactions } = useTransactions();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<{
    data: Record<StorageKey, unknown | null>;
    summary: string;
  } | null>(null);

  const handleExportTransactionsCSV = () => {
    if (transactions.length === 0) {
      setError('No transactions to export.');
      return;
    }

    const headers = ['Date', 'Description', 'Category', 'Amount', 'Type', 'Donor Name', 'Donor Contact'];
    const csvRows = [
      headers.join(','),
      ...transactions.map(row =>
        headers.map(header => {
          let value: any;
          switch (header) {
            case 'Date': value = row.date; break;
            case 'Description': value = row.description; break;
            case 'Category': value = row.category; break;
            case 'Amount': value = row.amount; break;
            case 'Type': value = row.type; break;
            case 'Donor Name': value = row.donorName || ''; break;
            case 'Donor Contact': value = row.donorContact || ''; break;
            default: value = '';
          }
          // Escape quotes and wrap in quotes
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(',')
      )
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gwcc-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setError(null);
    setMessage('Transactions exported as CSV.');
  };

  const handleExport = () => {
    const data: Record<StorageKey, unknown | null> = {
      churchLedgerTransactions: null,
      churchLedgerBudgets: null,
      churchLedgerCustomCategories: null,
    };
    STORAGE_KEYS.forEach((key) => {
      try {
        const raw = window.localStorage.getItem(key);
        data[key] = raw ? JSON.parse(raw) : null;
      } catch (e) {
        data[key] = null;
      }
    });

    const payload: BackupPayloadV1 = {
      version: 1,
      exportedAt: new Date().toISOString(),
      data,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: fileMime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gwcc-ledger-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setError(null);
    setMessage('Backup downloaded.');
  };

  const handleImportClick = () => {
    setMessage(null);
    setError(null);
    fileInputRef.current?.click();
  };

  const buildSummary = (data: Record<StorageKey, unknown | null>) => {
    const txCount = Array.isArray(data.churchLedgerTransactions) ? (data.churchLedgerTransactions as any[]).length : 0;
    const monthCount = data.churchLedgerBudgets && typeof data.churchLedgerBudgets === 'object' && !Array.isArray(data.churchLedgerBudgets)
      ? Object.keys(data.churchLedgerBudgets as object).length
      : 0;
    const catCount = Array.isArray(data.churchLedgerCustomCategories) ? (data.churchLedgerCustomCategories as any[]).length : 0;
    return `Transactions: ${txCount}, Budget months: ${monthCount}, Custom categories: ${catCount}`;
  };

  const validateAndPrepare = (json: unknown) => {
    // Accept v1 payload { version, exportedAt, data } or legacy { key: value }
    let data: Record<StorageKey, unknown | null> | null = null;
    if (json && typeof json === 'object' && 'version' in (json as any) && (json as any).version === 1 && 'data' in (json as any)) {
      data = (json as any).data as Record<StorageKey, unknown | null>;
    } else if (json && typeof json === 'object') {
      // Legacy: assume root contains keys
      data = {
        churchLedgerTransactions: (json as any).churchLedgerTransactions ?? null,
        churchLedgerBudgets: (json as any).churchLedgerBudgets ?? null,
        churchLedgerCustomCategories: (json as any).churchLedgerCustomCategories ?? null,
      };
    }

    if (!data) {
      throw new Error('Unrecognized backup format.');
    }

    // Validate shapes if present
    if (data.churchLedgerTransactions !== null && !isTransactionsArray(data.churchLedgerTransactions)) {
      throw new Error('Invalid transactions in backup.');
    }
    if (data.churchLedgerBudgets !== null && !isBudgetsMap(data.churchLedgerBudgets)) {
      throw new Error('Invalid budgets map in backup.');
    }
    if (data.churchLedgerCustomCategories !== null && !isStringArray(data.churchLedgerCustomCategories)) {
      throw new Error('Invalid custom categories in backup.');
    }

    return data;
  };

  const handleImportFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const data = validateAndPrepare(json);
      setPendingImport({ data, summary: buildSummary(data) });
      setMessage(null);
      setError(null);
    } catch (err: any) {
      setPendingImport(null);
      setMessage(null);
      setError(err?.message || 'Invalid backup file. Please select a valid JSON.');
    }
  };

  const applyImport = () => {
    if (!pendingImport) return;
    const { data } = pendingImport;
    let restored = 0;
    (STORAGE_KEYS as readonly StorageKey[]).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        window.localStorage.setItem(key, JSON.stringify((data as any)[key]));
        restored += 1;
      }
    });
    setPendingImport(null);
    setMessage(`Restore complete. ${restored} key(s) updated. Reloading...`);
    setError(null);
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <section className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold text-slate-800">Backup & Restore</h2>
      <p className="text-sm text-slate-500 mb-3">Export or import your data (transactions, budgets, categories) as a JSON file.</p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleExport}
          className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
        >
          Export Data
        </button>
        <button
          type="button"
          onClick={handleExportTransactionsCSV}
          className="px-3 py-2 rounded-md bg-green-600 text-white text-sm hover:bg-green-700 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-500"
        >
          Export Transactions CSV
        </button>
        <button
          type="button"
          onClick={handleImportClick}
          className="px-3 py-2 rounded-md bg-slate-600 text-white text-sm hover:bg-slate-700 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
        >
          Import Data
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleImportFile}
        />
      </div>

      {message && (
        <p className="mt-3 text-sm text-green-700" role="status" aria-live="polite">{message}</p>
      )}
      {error && (
        <p className="mt-3 text-sm text-red-700" role="alert" aria-live="assertive">{error}</p>
      )}

      {pendingImport && (
        <div className="mt-4 border border-slate-200 rounded-md p-3 bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-800">Import preview</h3>
          <p className="text-sm text-slate-600">{pendingImport.summary}</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={applyImport}
              className="px-3 py-2 rounded-md bg-green-600 text-white text-sm hover:bg-green-700 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
            >
              Apply Import
            </button>
            <button
              type="button"
              onClick={() => setPendingImport(null)}
              className="px-3 py-2 rounded-md bg-slate-200 text-slate-800 text-sm hover:bg-slate-300 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default BackupRestore;
