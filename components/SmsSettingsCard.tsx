import React, { useState, useEffect } from 'react';
import { useSmsSettings } from '../hooks/useSmsSettings';
import { Switch } from '@headlessui/react';

const SmsSettingsCard: React.FC = () => {
  const { smsSettings, loading, error, updateSmsSettings } = useSmsSettings();
  const [enabled, setEnabled] = useState(false);
  const [templateText, setTemplateText] = useState('');
  const [sendWindowStart, setSendWindowStart] = useState('08:00');
  const [sendWindowEnd, setSendWindowEnd] = useState('20:00');

  useEffect(() => {
    if (smsSettings) {
      setEnabled(smsSettings.enabled);
      setTemplateText(smsSettings.templateText);
      setSendWindowStart(smsSettings.sendWindowStart);
      setSendWindowEnd(smsSettings.sendWindowEnd);
    }
  }, [smsSettings]);

  const handleSave = async () => {
    await updateSmsSettings({
      enabled,
      templateText,
      sendWindowStart,
      sendWindowEnd,
    });
    alert('SMS settings updated successfully!');
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">SMS Settings</h3>
        <p>Loading settings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">SMS Settings</h3>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">SMS Settings</h3>
        <p className="mt-1 text-sm text-gray-500">Manage your automated SMS donation receipt preferences.</p>
      </div>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <span className="flex-grow flex flex-col">
            <span className="text-sm font-medium text-gray-900">Enable SMS Receipts</span>
            <span className="text-sm text-gray-500">Send automated SMS receipts for donations.</span>
          </span>
          <Switch
            checked={enabled}
            onChange={setEnabled}
            className={`${
              enabled ? 'bg-blue-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            <span
              className={`${
                enabled ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>

        <div>
          <label htmlFor="templateText" className="block text-sm font-medium text-gray-700">
            SMS Receipt Template
          </label>
          <textarea
            id="templateText"
            rows={4}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={templateText}
            onChange={(e) => setTemplateText(e.target.value)}
            placeholder="Thank you for your donation of {{amount}} to {{churchName}} on {{date}}. God bless you!"
          />
          <p className="mt-2 text-sm text-gray-500">
            Use placeholders like <code className="font-mono text-xs text-blue-600">{{amount}}</code>, <code className="font-mono text-xs text-blue-600">{{churchName}}</code>, <code className="font-mono text-xs text-blue-600">{{date}}</code>, <code className="font-mono text-xs text-blue-600">{{donorName}}</code>.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sendWindowStart" className="block text-sm font-medium text-gray-700">
              Send Window Start (24-hour format)
            </label>
            <input
              type="time"
              id="sendWindowStart"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={sendWindowStart}
              onChange={(e) => setSendWindowStart(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="sendWindowEnd" className="block text-sm font-medium text-gray-700">
              Send Window End (24-hour format)
            </label>
            <input
              type="time"
              id="sendWindowEnd"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={sendWindowEnd}
              onChange={(e) => setSendWindowEnd(e.target.value)}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save SMS Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmsSettingsCard;