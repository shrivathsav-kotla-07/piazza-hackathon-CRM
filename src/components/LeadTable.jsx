import React from 'react';
import { Filter, MessageSquare, Edit3, Trash2, User, ChevronsUpDown } from 'lucide-react';

const LeadTable = ({
  leads,
  filter,
  onFilterChange,
  sort,
  onSortChange,
  onIndividualChat, // Renamed from onChat
  onUpdateStatus,
  onDelete,
  pagination,
  onPageChange,
  onOpenChat, // New prop for the header chat button
}) => {
  const handleSort = (field) => {
    const order = sort.field === field && sort.order === 'asc' ? 'desc' : 'asc';
    onSortChange({ field, order });
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h2 className="card-title">Lead Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={filter}
              onChange={(e) => onFilterChange(e.target.value)}
              className="form-select"
            >
              <option value="all">All Leads</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
            </select>
            <button
              onClick={onOpenChat}
              className="btn btn-sm btn-info ml-2"
              title="Open Chat"
            >
              <MessageSquare size={16} />
              <span>Chat</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className="cursor-pointer">
                <div className="flex items-center">
                  Name <ChevronsUpDown size={14} className="ml-1" />
                </div>
              </th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Source</th>
              <th onClick={() => handleSort('createdAt')} className="cursor-pointer">
                <div className="flex items-center">
                  Date Created <ChevronsUpDown size={14} className="ml-1" />
                </div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead._id} className="hover:bg-gray-50">
                <td>
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <div className="text-sm font-medium text-gray-900">
                      {lead.name}
                    </div>
                  </div>
                </td>
                <td className="text-sm text-gray-900">
                  {lead.email}
                </td>
                <td className="text-sm text-gray-900">
                  {lead.phone || 'N/A'}
                </td>
                <td>
                  <span className={`badge ${
                    lead.status === 'New' 
                      ? 'badge-success' 
                      : 'badge-info'
                  }`}>
                    {lead.status}
                  </span>
                </td>
                <td>
                  <span className={`badge ${
                    lead.source === 'Manual' 
                      ? 'badge-purple' 
                      : 'badge-orange'
                  }`}>
                    {lead.source}
                  </span>
                </td>
                <td className="text-sm text-gray-900">
                  {new Date(lead.createdAt).toLocaleString()}
                </td>
                <td>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onIndividualChat(lead)} // Use the renamed prop
                      className="btn btn-icon text-blue-600 hover:text-blue-900"
                      title="Interact"
                    >
                      <MessageSquare size={16} />
                    </button>
                    <button
                      onClick={() => onUpdateStatus(lead._id, 'Contacted')}
                      className={`btn btn-icon text-green-600 hover:text-green-900 ${lead.status === 'Contacted' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title="Mark as Contacted"
                      disabled={lead.status === 'Contacted'}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this lead?')) {
                          onDelete(lead._id);
                        }
                      }}
                      className="btn btn-icon text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {leads.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {filter === 'New'
              ? 'You have contacted all the leads. No new leads left.!'
              : filter === 'Contacted'
              ? 'No contacted leads. Start contacting to see the leads!'
              : 'No leads found. Create your first lead to get started!'}
          </div>
        )}
      </div>
      <div className="card-footer flex items-center justify-between">
        <span className="text-sm text-gray-600 ml-4">
          Page {pagination.page} of {pagination.pages}
        </span>
        <div className="flex space-x-1">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="btn btn-sm"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="btn btn-sm"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadTable;
