import React from 'react';
import { Users, Plus, Upload } from 'lucide-react';

const Header = ({ onAddLead, onUploadDocument }) => {
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
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 