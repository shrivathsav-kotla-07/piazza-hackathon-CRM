import React from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const LeadForm = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div className="card fade-in">
      <div className="card-header">
        <h2 className="card-title">Add New Lead</h2>
      </div>
      <div className="card-body">
        <div className="space-y-4">
          <div className="form-group">
            <label className="form-label">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value;
                const capitalizedName = name.replace(/\b\w/g, char => char.toUpperCase());
                setFormData(prev => ({ ...prev, name: capitalizedName }));
              }}
              className="form-input"
              placeholder="Enter lead name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="form-input"
              placeholder="Enter email address"
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              Phone
            </label>
            <PhoneInput
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
              className="form-input"
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onSubmit}
              className="btn btn-primary flex-1"
            >
              Create Lead
            </button>
            <button
              onClick={onCancel}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadForm;
