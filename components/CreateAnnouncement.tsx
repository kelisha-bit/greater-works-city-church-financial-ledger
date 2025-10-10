import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { UserRole } from '../types';

export interface AnnouncementFormData {
  title: string;
  message: string;
  audience: 'all' | 'members' | 'specific';
  specificRecipients: string[];
  priority: 'low' | 'medium' | 'high';
  scheduledFor?: Date | null;
}

interface CreateAnnouncementProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateAnnouncement: React.FC<CreateAnnouncementProps> = ({ onSuccess, onCancel }) => {
  const { user, userRole } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: '',
    message: '',
    audience: 'all',
    specificRecipients: [],
    priority: 'medium',
    scheduledFor: null,
  });

  // Check if user is admin
  const isAdmin = userRole === UserRole.ADMIN;

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'specificRecipients' 
        ? value.split(',').map(item => item.trim()) 
        : value
    }));
  };

  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      scheduledFor: e.target.value ? new Date(e.target.value) : null
    }));
  };

  // Generate announcement with AI
  const generateWithAI = async () => {
    if (!formData.title) {
      setError('Please enter a title to generate content');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // In a real app, you would call your AI service here
      // This is a mock implementation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock AI-generated content based on the title
      const aiGeneratedContent = `Dear ${formData.audience === 'all' ? 'everyone' : 'members'},\n\n${formData.title}. We wanted to share this important update with you. `;
      
      setFormData(prev => ({
        ...prev,
        message: aiGeneratedContent
      }));
    } catch (err) {
      console.error('Error generating content:', err);
      setError('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      setError('Only administrators can create announcements');
      return;
    }

    if (!formData.title || !formData.message) {
      setError('Title and message are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await addDoc(collection(db, 'announcements'), {
        ...formData,
        createdBy: user?.email || 'System',
        createdAt: serverTimestamp(),
        date: formData.scheduledFor || serverTimestamp(),
        status: 'published',
      });

      setSuccess(true);
      
      // Reset form
      setFormData({
        title: '',
        message: '',
        audience: 'all',
        specificRecipients: [],
        priority: 'medium',
        scheduledFor: null,
      });

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error creating announcement:', err);
      setError('Failed to create announcement. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If not admin, don't render the form
  if (!isAdmin) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">You don't have permission to create announcements.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Create New Announcement</h2>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">Announcement created successfully!</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleChange}
                className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                placeholder="Announcement title"
                required
              />
              <button
                type="button"
                onClick={generateWithAI}
                disabled={isGenerating || !formData.title}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    AI Generate
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Message *
            </label>
            <div className="mt-1">
              <textarea
                id="message"
                name="message"
                rows={6}
                value={formData.message}
                onChange={handleChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                placeholder="Write your announcement here..."
                required
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              You can use Markdown for formatting
            </p>
          </div>

          <div>
            <label htmlFor="audience" className="block text-sm font-medium text-gray-700">
              Audience
            </label>
            <select
              id="audience"
              name="audience"
              value={formData.audience}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All Users</option>
              <option value="members">All Members</option>
              <option value="specific">Specific Members</option>
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {formData.audience === 'specific' && (
            <div className="sm:col-span-2">
              <label htmlFor="specificRecipients" className="block text-sm font-medium text-gray-700">
                Member Emails (comma-separated)
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="specificRecipients"
                  id="specificRecipients"
                  value={formData.specificRecipients.join(', ')}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="member1@example.com, member2@example.com"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="scheduledFor" className="block text-sm font-medium text-gray-700">
              Schedule for (optional)
            </label>
            <div className="mt-1">
              <input
                type="datetime-local"
                name="scheduledFor"
                id="scheduledFor"
                value={formData.scheduledFor ? formData.scheduledFor.toISOString().slice(0, 16) : ''}
                onChange={handleDateChange}
                min={new Date().toISOString().slice(0, 16)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Leave empty to send immediately
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              'Publish Announcement'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAnnouncement;
