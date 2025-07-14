import React from 'react';
import { Users, Plus, Upload, Workflow } from 'lucide-react';

const Header = ({ onAddLead, onUploadDocument, onToggleWorkflow }) => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <Users className="logo-icon" />
            <h1>Mini-CRM</h1>
          </div>
          <div className="header-actions">
            <button
              onClick={onAddLead}
              className="btn btn-primary"
            >
              <Plus size={16} />
              <span>Add Lead</span>
            </button>
            <button
              onClick={onUploadDocument}
              className="btn btn-success"
            >
              <Upload size={16} />
              <span>Upload Document</span>
            </button>
            <button
              onClick={onToggleWorkflow}
              className="btn btn-secondary"
            >
              {/* Use a generic icon if Workflow is not available */}
              <span>Workflow Designer</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 