import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { UploadContext } from '../contexts/UploadContext';
import ProgressBar from '../components/ProgressBar';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { uploadFile, uploadProgress, uploadedDocuments } = useContext(UploadContext);
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentUrl, setDocumentUrl] = useState('');
  const [uploadType, setUploadType] = useState('file'); // 'file', 'url', or 'json'
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if ((uploadType === 'file' || uploadType === 'json') && selectedFile) {
      await uploadFile(selectedFile);
      setSelectedFile(null);
      e.target.reset();
    } else if (uploadType === 'url' && documentUrl) {
      await uploadFile(null, documentUrl);
      setDocumentUrl('');
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Determine the accept attribute dynamically
  const acceptTypes = uploadType === 'json'
    ? '.json'
    : '.pdf,.docx,.doc';

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Document Admin</h1>
            </div>
            <div className="flex items-center">
              {user && <span className="mr-4">Welcome Abbas Khan {user.username}</span>}
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
          
          <div className="mb-4">
            <div className="flex space-x-4">
              <button
                onClick={() => setUploadType('file')}
                className={`px-4 py-2 rounded ${
                  uploadType === 'file' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Upload File
              </button>
              <button
                onClick={() => setUploadType('url')}
                className={`px-4 py-2 rounded ${
                  uploadType === 'url' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Upload from URL
              </button>
              <button
                onClick={() => setUploadType('json')}
                className={`px-4 py-2 rounded ${
                  uploadType === 'json'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Upload JSON
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {uploadType === 'url' ? (
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Document URL</label>
                <input
                  type="url"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="https://example.com/document.pdf"
                  required
                />
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Select {uploadType === 'json' ? 'JSON File' : 'File (PDF, DOCX)'}
                </label>
                <input
                  type="file"
                  accept={acceptTypes}
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={
                ((uploadType === 'file' || uploadType === 'json') && !selectedFile) || 
                (uploadType === 'url' && !documentUrl) ||
                (uploadProgress > 0 && uploadProgress < 100)
              }
            >
              {uploadProgress > 0 && uploadProgress < 100
                ? 'Uploading...'
                : 'Upload Document'
              }
            </button>
          </form>

          {uploadProgress > 0 && (
            <div className="mt-4">
              <ProgressBar progress={uploadProgress} />
            </div>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Uploaded Documents</h2>
          
          {uploadedDocuments.length === 0 ? (
            <p className="text-gray-500">No documents uploaded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Uploaded
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {uploadedDocuments.map((doc) => (
                    <tr key={doc.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {doc.fileName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(doc.uploadDate).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            doc.status === 'vectorized' 
                              ? 'bg-green-100 text-green-800'
                              : doc.status === 'processing'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {doc.status === 'vectorized' 
                            ? 'Vectorized'
                            : doc.status === 'processing'
                              ? 'Processing'
                              : 'Failed'
                          }
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
