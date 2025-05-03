
import { createContext, useState } from 'react';
import { toast } from '@/components/ui/sonner';

export const UploadContext = createContext(null);

export const UploadProvider = ({ children }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);

  const uploadFile = async (file, url = null) => {
    try {
      setUploadProgress(1); // Start progress
      
      const formData = new FormData();
      
      if (file) {
        formData.append('document', file);
      } else if (url) {
        formData.append('documentUrl', url);
      } else {
        throw new Error('Either file or URL must be provided');
      }

      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      };
      
      // Create a promise to handle the XHR response
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        
        xhr.onerror = function() {
          reject(new Error('Upload failed due to network error'));
        };
      });

      // Open and send the request
      xhr.open('POST', `${process.env.REACT_APP_API_BASE_URL}/api/documents/upload`);
      xhr.withCredentials = true; // Include cookies
      xhr.send(formData);
      
      // Wait for response
      const response = await uploadPromise;
      
      setUploadedDocuments(prev => [
        { id: response.documentId, fileName: response.fileName, status: "processing", 
          uploadDate: new Date().toISOString() },
        ...prev
      ]);

      // Add new document to list
      const newDocument = {
        id: response.documentId,
        fileName: file ? file.name : url,
        uploadDate: new Date().toISOString(),
        status: 'processing'
      };

        // trigger vectorization
      try {
        await fetch("http://localhost:5000/vectorize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filePath: response.filePath })
        });
        setUploadedDocuments(prev =>
          prev.map(doc =>
            doc.id === response.documentId
              ? { ...doc, status: "vectorized" }
              : doc
          )
        );
        toast.success("Document vectorized!");
      } catch (e) {
        toast.error("Vectorization failed: " + e.message);
      }
      
      setUploadedDocuments(prev => [newDocument, ...prev]);
      setUploadProgress(100);
      
      // Reset progress after a delay
      setTimeout(() => {
        setUploadProgress(0);
      }, 2000);
      
      toast.success('Document uploaded successfully');
      
      // Poll for vectorization status
      pollVectorizationStatus(response.documentId);
      
      return response;
    } catch (error) {
      setUploadProgress(0);
      toast.error(`Upload failed: ${error.message}`);
      throw error;
    }
  };

  // Poll for document processing status
  const pollVectorizationStatus = async (documentId) => {
    try {
      const checkStatus = async () => {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/documents/${documentId}/status`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to check document status');
        }
        
        const data = await response.json();
        
        // Update document status
        setUploadedDocuments(prev => 
          prev.map(doc => 
            doc.id === documentId 
              ? { ...doc, status: data.status } 
              : doc
          )
        );
        
        // Continue polling if document is still processing
        if (data.status === 'processing') {
          setTimeout(checkStatus, 5000); // Check every 5 seconds
        } else if (data.status === 'vectorized') {
          toast.success('Document vectorization complete!');
        } else if (data.status === 'failed') {
          toast.error('Document processing failed. Please try again.');
        }
      };
      
      // Start polling
      setTimeout(checkStatus, 3000); // First check after 3 seconds
    } catch (error) {
      console.error('Error polling document status:', error);
    }
  };

  const value = {
    uploadFile,
    uploadProgress,
    uploadedDocuments,
  };

  return <UploadContext.Provider value={value}>{children}</UploadContext.Provider>;
};
