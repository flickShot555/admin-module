
import React, { useState, useRef } from 'react';
import { useUpload } from '../contexts/UploadContext';

const UploadForm = () => {
  const [uploadType, setUploadType] = useState('file');
  const [url, setUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  
  const { uploadDocument, uploadUrl, isUploading } = useUpload();
  
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const file = files[0];
    
    if (!allowedTypes.includes(file.type)) {
      alert('Only PDF and DOCX files are supported');
      return;
    }
    
    try {
      await uploadDocument(file);
    } catch (error) {
      console.error('File upload error:', error);
    }
  };
  
  const handleUrlUpload = async (e) => {
    e.preventDefault();
    if (!url) return;
    
    try {
      await uploadUrl(url);
      setUrl('');
    } catch (error) {
      console.error('URL upload error:', error);
    }
  };
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };
  
  const handleChange = (e) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
    }
  };
  
  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="card">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Document</h2>
      
      <div className="mb-4">
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setUploadType('file')}
            className={`btn ${uploadType === 'file' ? 'btn-primary' : 'btn-secondary'}`}
          >
            File Upload
          </button>
          
          <button
            type="button"
            onClick={() => setUploadType('url')}
            className={`btn ${uploadType === 'url' ? 'btn-primary' : 'btn-secondary'}`}
          >
            URL Upload
          </button>
        </div>
      </div>
      
      {uploadType === 'file' ? (
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
            onChange={handleChange}
            disabled={isUploading}
          />
          
          <div className="space-y-1 text-center">
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              stroke="currentColor" 
              fill="none" 
              viewBox="0 0 48 48" 
              aria-hidden="true"
            >
              <path 
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H8m36-12h-4m4 0H20" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
            <div className="flex text-sm text-gray-600">
              <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                <span>Upload a file</span>
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PDF or DOCX up to 10MB</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleUrlUpload}>
          <div className="mb-4">
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              Document URL
            </label>
            <input
              type="url"
              id="url"
              className="input"
              placeholder="https://example.com/document.pdf"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              disabled={isUploading}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary w-full"
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload URL'}
          </button>
        </form>
      )}
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Supported file types: PDF, DOCX</p>
        <p>Maximum file size: 10MB</p>
      </div>
    </div>
  );
};

export default UploadForm;
