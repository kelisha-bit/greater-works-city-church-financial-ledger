import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { useAnnouncements } from '../hooks/useAnnouncements';

const AnnouncementManagement: React.FC = () => {
  const { userRole } = useAuth();
  const { clearOldAnnouncements, loading } = useAnnouncements();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [clearOptions, setClearOptions] = useState({
    olderThanDays: 30,
    status: '' as '' | 'draft' | 'published' | 'archived',
    audience: '' as '' | 'all' | 'members' | 'specific',
    archiveInstead: false,
  });
  const [previewResult, setPreviewResult] = useState<{ deleted: number; announcements: any[] } | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const isAdmin = userRole === UserRole.ADMIN;

  if (!isAdmin) {
    return null;
  }

  const handlePreview = async () => {
    setIsPreviewing(true);
    try {
      const result = await clearOldAnnouncements({
        ...clearOptions,
        status: clearOptions.status || undefined,
        audience: clearOptions.audience || undefined,
        dryRun: true,
      });
      setPreviewResult(result);
    } catch (error) {
      console.error('Error previewing clear operation:', error);
      alert('Failed to preview clear operation');
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleClear = async () => {
    setIsClearing(true);
    try {
      const result = await clearOldAnnouncements({
        ...clearOptions,
        status: clearOptions.status || undefined,
        audience: clearOptions.audience || undefined,
        dryRun: false,
      });
      
      alert(`Successfully ${clearOptions.archiveInstead ? 'archived' : 'cleared'} ${result.deleted} old announcements`);
      setShowClearDialog(false);
      setPreviewResult(null);
      setClearOptions({
        olderThanDays: 30,
        status: '',
        audience: '',
        archiveInstead: false,
      });
    } catch (error) {
      console.error('Error clearing announcements:', error);
      alert('Failed to clear announcements');
    } finally {
      setIsClearing(false);
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'published': return 'Published';
      case 'archived': return 'Archived';
      default: return 'All Statuses';
    }
  };

  const getAudienceDisplayName = (audience: string) => {
    switch (audience) {
      case 'all': return 'All Users';
      case 'members': return 'All Members';
      case 'specific': return 'Specific Members';
      default: return 'All Audiences';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Announcement Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage and clean up old announcements
          </p>
        </div>
        
        <button
          onClick={() => setShowClearDialog(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Clear Old Announcements
        </button>
      </div>

      {/* Clear Dialog */}
      {showClearDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Clear Old Announcements</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Clear announcements older than (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={clearOptions.olderThanDays}
                    onChange={(e) => setClearOptions(prev => ({ ...prev, olderThanDays: parseInt(e.target.value) || 30 }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status Filter
                  </label>
                  <select
                    value={clearOptions.status}
                    onChange={(e) => setClearOptions(prev => ({ ...prev, status: e.target.value as any }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  >
                    <option value="">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Audience Filter
                  </label>
                  <select
                    value={clearOptions.audience}
                    onChange={(e) => setClearOptions(prev => ({ ...prev, audience: e.target.value as any }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  >
                    <option value="">All Audiences</option>
                    <option value="all">All Users</option>
                    <option value="members">All Members</option>
                    <option value="specific">Specific Members</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    id="archive-instead"
                    type="checkbox"
                    checked={clearOptions.archiveInstead}
                    onChange={(e) => setClearOptions(prev => ({ ...prev, archiveInstead: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="archive-instead" className="ml-2 block text-sm text-gray-700">
                    Archive instead of delete (safer option)
                  </label>
                </div>
              </div>

              {/* Preview Section */}
              {previewResult && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">Preview</h4>
                  <p className="text-sm text-yellow-700">
                    This will {clearOptions.archiveInstead ? 'archive' : 'delete'} <strong>{previewResult.deleted}</strong> announcements older than {clearOptions.olderThanDays} days
                    {clearOptions.status && ` with status "${getStatusDisplayName(clearOptions.status)}"`}
                    {clearOptions.audience && ` for audience "${getAudienceDisplayName(clearOptions.audience)}"`}.
                  </p>
                  {previewResult.announcements.length > 0 && (
                    <div className="mt-2 max-h-32 overflow-y-auto">
                      <p className="text-xs text-yellow-600 font-medium">
                        Announcements to be {clearOptions.archiveInstead ? 'archived' : 'deleted'}:
                      </p>
                      <ul className="text-xs text-yellow-600 list-disc list-inside">
                        {previewResult.announcements.slice(0, 5).map((announcement, index) => (
                          <li key={index}>
                            {announcement.title} ({new Date(announcement.date).toLocaleDateString()})
                          </li>
                        ))}
                        {previewResult.announcements.length > 5 && (
                          <li>... and {previewResult.announcements.length - 5} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowClearDialog(false);
                    setPreviewResult(null);
                    setClearOptions({
                      olderThanDays: 30,
                      status: '',
                      audience: '',
                      archiveInstead: false,
                    });
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handlePreview}
                  disabled={isPreviewing || loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {isPreviewing ? 'Previewing...' : 'Preview'}
                </button>
                
                <button
                  onClick={handleClear}
                  disabled={isClearing || loading || !previewResult}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  {isClearing ? 'Clearing...' : 'Clear'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementManagement;
