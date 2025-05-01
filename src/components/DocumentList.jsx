
import React from 'react';
import ProgressBar from './ProgressBar';
import { useUpload } from '../contexts/UploadContext';

const DocumentList = () => {
  const { documents, uploadProgress } = useUpload();

  const getStatusBadge = (status) => {
    const statusClasses = {
      uploading: 'bg-blue-100 text-blue-800',
      processing: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      unknown: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || statusClasses.unknown}`}>
        {status === 'uploading' && 'Uploading'}
        {status === 'processing' && 'Processing'}
        {status === 'completed' && 'Completed'}
        {status === 'failed' && 'Failed'}
        {status === 'unknown' && 'Unknown'}
      </span>
    );
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No documents uploaded yet. Use the form to upload a document.
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {documents.map((doc) => (
          <li key={doc.id} className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {doc.name}
                </p>
                <div className="mt-1 flex items-center text-xs text-gray-500 space-x-2">
                  {doc.type !== 'url' && <span>{formatFileSize(doc.size)}</span>}
                  <span>•</span>
                  <span>{formatTimestamp(doc.timestamp)}</span>
                </div>
              </div>
              
              <div className="ml-4 flex-shrink-0">
                {getStatusBadge(doc.status)}
              </div>
            </div>
            
            {doc.status === 'uploading' && (
              <div className="mt-2">
                <ProgressBar progress={uploadProgress[doc.id] || 0} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentList;
