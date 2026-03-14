import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { contentAPI } from '../services/api';

interface ContentContextType {
  content: any;
  loading: boolean;
  error: string | null;
  refreshContent: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const data = await contentAPI.getAll();
      setContent(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching content:', err);
      setError(err.message || 'Failed to fetch content');
      // Set default fallback content
      setContent({
        systemInfo: {
          name: 'ADE Donor Management System',
          tagline: 'Welcome to your management dashboard'
        },
        navigation: {
          mainMenu: []
        },
        forms: {
          common: {
            submitButton: 'Submit',
            cancelButton: 'Cancel',
            saveButton: 'Save',
            editButton: 'Edit',
            deleteButton: 'Delete',
            addButton: 'Add New'
          }
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const refreshContent = async () => {
    await fetchContent();
  };

  return (
    <ContentContext.Provider value={{ content, loading, error, refreshContent }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
