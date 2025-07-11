import React, { useState, useCallback, useRef, useEffect } from 'react';
import { LeadService } from '../services/leadService';
import { WorkflowService } from '../services/workflowService';
import { AIService } from '../services/aiService';
import { FileService } from '../services/fileService';
import { ToastManager } from '../utils/toast';

// Import components
import Header from './Header';
import LeadForm from './LeadForm';
import UploadArea from './UploadArea';
import LeadTable from './LeadTable';
import WorkflowDesigner from './WorkflowDesigner';
import ChatModal from './ChatModal';
import Toast from './Toast';

const MiniCRM = () => {
  // State management
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState({ field: 'createdAt', order: 'desc' });
  const [showModal, setShowModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '' // This will now hold the full phone number including country code
  });

  // Workflow state
  const [workflowNodes, setWorkflowNodes] = useState([
    { id: 'trigger', type: 'trigger', label: 'Lead Created', x: 50, y: 50 }
  ]);
  const [workflowConnections, setWorkflowConnections] = useState([]);
  const [connectingFrom, setConnectingFrom] = useState(null);

  const fileInputRef = useRef(null);

  const fetchLeads = useCallback(async (page, currentFilter, currentSort) => {
    try {
      const data = await LeadService.getLeads(page, currentFilter, currentSort);
      setLeads(data.leads);
      setPagination({
        page: data.page,
        pages: data.pages,
        total: data.total,
      });
    } catch (error) {
      showToast('Error fetching leads', 'error');
    }
  }, []);

  useEffect(() => {
    fetchLeads(1, filter, sort);
  }, [filter, sort, fetchLeads]);

  // Toast notification handler
  const showToast = (message, type = 'success') => {
    const toastData = ToastManager.show(message, type);
    setToast(toastData);
    ToastManager.autoHide(toastData, setToast);
  };

  // Lead management functions
  const addLead = async (leadData) => {
    const validation = LeadService.validateLead(leadData);
    
    if (!validation.isValid) {
      showToast(validation.errors[0], 'error');
      return null;
    }

    try {
      const newLead = await LeadService.createLead({
        ...leadData,
        status: 'New',
        source: 'Manual'
      });
      
      // Re-fetch leads to ensure correct sorting
      await fetchLeads(pagination.page, filter, sort);
      
      // Execute workflow
      executeWorkflow(newLead);
      
      showToast('Lead created successfully!');
      return newLead;
    } catch (error) {
      showToast('Error creating lead. Please try again.', 'error');
      return null;
    }
  };

  const updateLeadStatus = async (id, newStatus) => {
    try {
      const updatedLead = await LeadService.updateLeadStatus(id, newStatus);
      
      // If the current filter is 'Contacted' and the status changes to 'New', or if the filter is 'New' and status changes to 'Contacted', remove the lead from the table
      if ((filter === 'Contacted' && newStatus === 'New') || (filter === 'New' && newStatus === 'Contacted')) {
        setLeads(prev => prev.filter(lead => lead._id !== id));
      } else {
        // Otherwise, just update the lead's status in the table
        setLeads(prev => prev.map(lead => (lead._id === id ? updatedLead : lead)));
      }
      showToast(`Lead status updated to ${newStatus}`);
    } catch (error) {
      showToast('Error updating lead status', 'error');
    }
  };

  const deleteLead = async (id) => {
    try {
      await LeadService.deleteLead(id);
      setLeads(prev => prev.filter(lead => lead._id !== id));
      showToast('Lead deleted successfully');
    } catch (error) {
      showToast('Error deleting lead', 'error');
    }
  };

  // Form handlers
  const handleFormSubmit = async () => {
    const newLead = await addLead(formData); // formData.phone already contains the full number
    if (newLead) {
      setFormData({ name: '', email: '', phone: '' });
    }
  };

  // File upload handlers
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const processFiles = (files) => {
    const processedLeads = FileService.processFiles(files);
    
    processedLeads.forEach(leadData => {
      addLead(leadData);
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Chat handlers
  const handleChatSubmit = () => {
    if (!inputMessage.trim()) return;

    const userMessage = { 
      type: 'user', 
      content: inputMessage,
      timestamp: new Date().toISOString()
    };
    
    const aiResponse = AIService.processMessage(inputMessage, selectedLead);
    
    setChatMessages(prev => [...prev, userMessage, aiResponse]);
    setInputMessage('');
  };

  const openChatModal = (lead) => {
    setSelectedLead(lead);
    setChatMessages([{
      type: 'ai',
      content: AIService.getInitialGreeting(lead),
      timestamp: new Date().toISOString()
    }]);
    setShowModal(true);
  };

  // Workflow functions
  const addWorkflowNode = (nodeType) => {
    const updatedNodes = WorkflowService.addWorkflowNode(workflowNodes, nodeType);
    setWorkflowNodes(updatedNodes);
    showToast(`${updatedNodes[updatedNodes.length - 1].label} action added to workflow`);
  };

  const connectNodes = (fromId, toId) => {
    const updatedConnections = WorkflowService.connectNodes(workflowConnections, fromId, toId);
    setWorkflowConnections(updatedConnections);
    showToast('Nodes connected successfully');
  };

  const executeWorkflow = (lead) => {
    const actions = WorkflowService.executeWorkflow(lead, workflowNodes);
    
    actions.forEach(action => {
      setTimeout(() => {
        if (action.type === 'email') {
          showToast(action.message);
        } else if (action.type === 'status') {
          updateLeadStatus(lead.id, action.newStatus);
        }
      }, action.delay);
    });
  };

  const handleNodeClick = (node) => {
    if (connectingFrom) {
      if (WorkflowService.canConnectNodes(connectingFrom, node)) {
        connectNodes(connectingFrom.id, node.id);
      }
      setConnectingFrom(null);
    } else {
      setConnectingFrom(node);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        onAddLead={() => {
          setShowForm(true);
          setShowUpload(false);
        }}
        onUploadDocument={() => {
          setShowUpload(true);
          setShowForm(false);
        }}
      />

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lead Management Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Manual Form */}
            <LeadForm 
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleFormSubmit}
              onCancel={() => setShowForm(false)}
              isVisible={showForm}
            />

            {/* Document Upload */}
            <UploadArea 
              isVisible={showUpload}
              dragActive={dragActive}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onFileSelect={handleFileSelect}
              onCancel={() => setShowUpload(false)}
              fileInputRef={fileInputRef}
            />

            {/* Lead Dashboard */}
            <LeadTable
              leads={leads}
              filter={filter}
              onFilterChange={(newFilter) => {
                setFilter(newFilter);
                fetchLeads(1, newFilter, sort);
              }}
              sort={sort}
              onSortChange={setSort}
              onChat={openChatModal}
              onUpdateStatus={updateLeadStatus}
              onDelete={deleteLead}
              pagination={pagination}
              onPageChange={(page) => fetchLeads(page, filter, sort)}
            />
          </div>

          {/* Workflow Designer Section */}
          <div className="space-y-6">
            <WorkflowDesigner 
              workflowNodes={workflowNodes}
              workflowConnections={workflowConnections}
              connectingFrom={connectingFrom}
              onAddNode={addWorkflowNode}
              onNodeClick={handleNodeClick}
            />
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      <ChatModal 
        isVisible={showModal}
        selectedLead={selectedLead}
        chatMessages={chatMessages}
        inputMessage={inputMessage}
        onInputChange={(e) => setInputMessage(e.target.value)}
        onSubmit={handleChatSubmit}
        onClose={() => setShowModal(false)}
      />

      {/* Toast Notification */}
      <Toast toast={toast} />
    </div>
  );
};

export default MiniCRM;
