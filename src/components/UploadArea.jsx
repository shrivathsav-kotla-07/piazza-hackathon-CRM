import React from 'react';
import { FileText } from 'lucide-react';

const UploadArea = ({ 
  isVisible, 
  dragActive, 
  onDragOver, 
  onDragLeave, 
  onDrop, 
  onFileSelect, 
  onCancel, 
  fileInputRef,
  uploadedFileName,
  processingProgress
}) => {
  if (!isVisible) return null;

  return (
    <div className="card fade-in">
      <div className="card-header">
        <h2 className="card-title">Upload Document</h2>
      </div>
      <div className="card-body">
        <div
          className={`upload-area ${dragActive ? 'drag-active' : ''}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              <FileText className="upload-icon" />
            </div>
            {uploadedFileName ? (
              <div className="text-center">
                <p className="upload-text font-semibold">{uploadedFileName}</p>
                {processingProgress === 1 && <p className="upload-subtext">Uploading...</p>}
                {processingProgress === 2 && <p className="upload-subtext">Processing document...</p>}
                {processingProgress === 3 && <p className="upload-subtext text-green-600">Extraction complete!</p>}
              </div>
            ) : (
              <div>
                <p className="upload-text">
                  Drop your PDF or image files here
                </p>
                <p className="upload-subtext">
                  or click to browse
                </p>
              </div>
            )}
            {!uploadedFileName && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-primary"
              >
                Choose Files
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,image/*"
              onChange={onFileSelect}
              className="hidden"
            />
          </div>
        </div>
        <button
          onClick={onCancel}
          className="btn btn-secondary w-full mt-4"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default UploadArea;
