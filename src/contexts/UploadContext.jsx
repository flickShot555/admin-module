
import React, { createContext, useState, useContext } from 'react';

const UploadContext = createContext(null);

export const UploadProvider = ({ children }) => {
  const [documents, setDocuments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const addDocument = (doc) => {
    setDocuments(prev => [...prev, doc]);
  };

  const updateDocumentStatus = (docId, status) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === docId ? { ...doc, status } : doc
      )
    );
  };

  const updateUploadProgress = (docId, progress) => {
    setUploadProgress(prev => ({
      ...prev,
      [docId]: progress
    }));
  };

  const uploadDocument = async (file) => {
    setError(null);
    setIsUploading(true);
    
    // Generate a temporary ID for tracking
    const docId = Date.now().toString();
    
    const newDoc = {
      id: docId,
      name: file.name,
      type: file.type,
      size: file.size,
      timestamp: new Date().toISOString(),
      status: 'uploading',
    };
    
    addDocument(newDoc);
    updateUploadProgress(docId, 0);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Frontend logic ends and backend call begins
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          updateUploadProgress(docId, progress);
        }
      });
      
      xhr.onload = async () => {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);
          updateDocumentStatus(docId, 'processing');
          
          // Poll for document processing status
          pollProcessingStatus(docId, result.jobId);
        } else {
          updateDocumentStatus(docId, 'failed');
          setError(`Upload failed: ${xhr.statusText}`);
        }
      };
      
      xhr.onerror = () => {
        updateDocumentStatus(docId, 'failed');
        setError('Network error occurred during upload');
      };
      
      xhr.open('POST', `${process.env.REACT_APP_API_BASE_URL}/api/documents/upload`, true);
      xhr.withCredentials = true; // Include cookies in the request
      xhr.send(formData);
    } catch (err) {
      updateDocumentStatus(docId, 'failed');
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
    
    return docId;
  };
  
  const pollProcessingStatus = async (docId, jobId) => {
    const checkStatus = async () => {
      try {
        // Frontend logic ends and backend call begins
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/documents/status/${jobId}`,
          {
            credentials: 'include', // Include cookies in the request
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch document status');
        }
        
        const result = await response.json();
        
        if (result.status === 'completed') {
          updateDocumentStatus(docId, 'completed');
          return true;
        } else if (result.status === 'failed') {
          updateDocumentStatus(docId, 'failed');
          return true;
        } else {
          updateDocumentStatus(docId, result.status);
          return false;
        }
      } catch (err) {
        console.error('Status polling error:', err);
        updateDocumentStatus(docId, 'unknown');
        return true;
      }
    };
    
    const poll = async () => {
      const isDone = await checkStatus();
      if (!isDone) {
        setTimeout(poll, 5000); // Check every 5 seconds
      }
    };
    
    poll();
  };

  const uploadUrl = async (url) => {
    setError(null);
    setIsUploading(true);
    
    const docId = Date.now().toString();
    
    const newDoc = {
      id: docId,
      name: url,
      type: 'url',
      timestamp: new Date().toISOString(),
      status: 'uploading',
    };
    
    addDocument(newDoc);
    
    try {
      // Frontend logic ends and backend call begins
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/documents/upload-url`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies in the request
          body: JSON.stringify({ url }),
        }
      );
      
      if (!response.ok) {
        throw new Error('URL upload failed');
      }
      
      const result = await response.json();
      updateDocumentStatus(docId, 'processing');
      
      // Poll for document processing status
      pollProcessingStatus(docId, result.jobId);
    } catch (err) {
      updateDocumentStatus(docId, 'failed');
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
    
    return docId;
  };

  const value = {
    documents,
    uploadProgress,
    isUploading,
    error,
    uploadDocument,
    uploadUrl,
  };

  return <UploadContext.Provider value={value}>{children}</UploadContext.Provider>;
};

export const useUpload = () => {
  const context = useContext(UploadContext);
  if (context === null) {
    throw new Error('useUpload must be used within an UploadProvider');
  }
  return context;
};
