# Mini CRM Application

A modern, feature-rich Customer Relationship Management (CRM) application built with React and Vite. This application provides lead management, workflow automation, AI-powered chat, and document processing capabilities.

## 🚀 Features

### Lead Management
- **Add Leads**: Manually create new leads with name, email, and phone number
- **Document Upload**: Upload PDF and image files to automatically extract lead information
- **Lead Dashboard**: View, filter, and manage all leads in a clean table interface
- **Status Updates**: Track lead status (New, Contacted) with easy status updates
- **Lead Actions**: Chat with AI, update status, or delete leads

### AI-Powered Chat
- **Intelligent Responses**: AI assistant that understands context and provides helpful responses
- **Lead Information**: Ask about lead details, contact information, and status
- **Follow-up Suggestions**: Get AI-powered suggestions for follow-up actions
- **Real-time Chat**: Interactive chat interface with message history

### Workflow Automation
- **Visual Workflow Designer**: Drag-and-drop interface for creating automation workflows
- **Email Actions**: Automatically send emails when leads are created
- **Status Updates**: Automatically update lead status based on workflow rules
- **Node Connections**: Connect workflow nodes to create complex automation paths

### Document Processing
- **File Upload**: Support for PDF and image files
- **Data Extraction**: Automatically extract lead information from uploaded documents
- **Drag & Drop**: Intuitive drag-and-drop file upload interface
- **File Validation**: Automatic file type and size validation

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Header.jsx      # Application header with navigation
│   ├── LeadForm.jsx    # Lead creation form
│   ├── UploadArea.jsx  # Document upload interface
│   ├── LeadTable.jsx   # Lead dashboard table
│   ├── WorkflowDesigner.jsx # Workflow automation designer
│   ├── ChatModal.jsx   # AI chat interface
│   ├── Toast.jsx       # Toast notification component
│   └── MiniCRM.jsx     # Main application component
├── services/           # Business logic services
│   ├── leadService.js  # Lead management operations
│   ├── workflowService.js # Workflow automation logic
│   ├── aiService.js    # AI chat functionality
│   └── fileService.js  # File upload and processing
├── utils/              # Utility functions
│   └── toast.js        # Toast notification management
├── App.jsx             # Root application component
├── main.jsx           # Application entry point
└── index.css          # Global styles and component styles
```

## 🛠️ Technology Stack

- **Frontend Framework**: React 19.1.0
- **Build Tool**: Vite 7.0.3
- **Styling**: Custom CSS with utility classes
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useCallback, useRef)

## 🎨 Design System

### Color Palette
- **Primary Blue**: #2563eb (Buttons, links, primary actions)
- **Success Green**: #059669 (Success states, positive actions)
- **Warning Orange**: #f59e0b (Warnings, connecting states)
- **Error Red**: #dc2626 (Errors, destructive actions)
- **Neutral Grays**: Various shades for text, backgrounds, and borders

### Component Classes
- **Buttons**: `.btn`, `.btn-primary`, `.btn-success`, `.btn-secondary`, `.btn-danger`
- **Forms**: `.form-group`, `.form-label`, `.form-input`, `.form-select`
- **Cards**: `.card`, `.card-header`, `.card-body`, `.card-title`
- **Tables**: `.table`, `.table-container`, `.table th`, `.table td`
- **Modals**: `.modal-overlay`, `.modal`, `.modal-header`, `.modal-body`
- **Badges**: `.badge`, `.badge-success`, `.badge-info`, `.badge-warning`

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mini-crm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📖 Usage Guide

### Adding Leads
1. Click the "Add Lead" button in the header
2. Fill in the required fields (name and email)
3. Optionally add a phone number
4. Click "Create Lead" to save

### Uploading Documents
1. Click the "Upload Document" button
2. Drag and drop PDF or image files into the upload area
3. Or click "Choose Files" to browse and select files
4. The system will automatically extract lead information

### Using AI Chat
1. Click the chat icon (💬) next to any lead in the table
2. Ask questions about the lead, such as:
   - "What are the lead details?"
   - "Suggest a follow-up action"
   - "How can I contact this lead?"
3. The AI will provide contextual responses

### Creating Workflows
1. In the Workflow Designer section, click "Add Email Action" or "Add Status Update"
2. Click on nodes to connect them (first click selects, second click connects)
3. Workflows will automatically execute when new leads are created

## 🔧 Customization

### Adding New Components
1. Create a new component file in `src/components/`
2. Import and use the component in `MiniCRM.jsx`
3. Add corresponding styles to `src/index.css`

### Extending Services
1. Add new methods to existing service files in `src/services/`
2. Or create new service files for additional functionality
3. Import and use services in components

### Styling
- All styles are in `src/index.css`
- Use the existing CSS classes for consistency
- Add new utility classes as needed

## 🧪 Features in Detail

### Lead Service (`leadService.js`)
- **createLead()**: Creates new leads with validation
- **updateLeadStatus()**: Updates lead status
- **deleteLead()**: Removes leads from the system
- **filterLeads()**: Filters leads by status
- **validateLead()**: Validates lead data before creation

### Workflow Service (`workflowService.js`)
- **addWorkflowNode()**: Adds new workflow nodes
- **connectNodes()**: Connects workflow nodes
- **executeWorkflow()**: Executes workflow actions
- **canConnectNodes()**: Validates node connections

### AI Service (`aiService.js`)
- **generateResponse()**: Generates AI responses based on user input
- **getInitialGreeting()**: Provides initial AI greeting
- **processMessage()**: Processes user messages
- **extractIntent()**: Extracts user intent from messages

### File Service (`fileService.js`)
- **processFiles()**: Processes uploaded files
- **isValidFileType()**: Validates file types
- **extractDataFromFile()**: Extracts data from files
- **handleDrop()**: Handles drag and drop events

## 🎯 Best Practices

### Code Organization
- **Separation of Concerns**: Business logic in services, UI in components
- **Reusable Components**: Small, focused components that can be reused
- **Service Layer**: Centralized business logic for maintainability
- **Utility Functions**: Common functionality extracted to utilities

### Performance
- **React Hooks**: Efficient state management with hooks
- **Memoization**: Use useCallback for expensive operations
- **Lazy Loading**: Components load only when needed
- **Optimized Rendering**: Minimal re-renders with proper dependencies

### User Experience
- **Responsive Design**: Works on desktop and mobile devices
- **Loading States**: Visual feedback for user actions
- **Error Handling**: Graceful error handling with user-friendly messages
- **Accessibility**: Semantic HTML and keyboard navigation

## 🔮 Future Enhancements

### Planned Features
- **Data Persistence**: Save leads and workflows to local storage or database
- **Export Functionality**: Export leads to CSV or PDF
- **Advanced Workflows**: More complex workflow conditions and actions
- **Real AI Integration**: Connect to actual AI services for better responses
- **User Authentication**: Multi-user support with login/logout
- **Analytics Dashboard**: Lead conversion metrics and insights

### Technical Improvements
- **TypeScript**: Add type safety with TypeScript
- **Testing**: Unit and integration tests
- **State Management**: Redux or Zustand for complex state
- **API Integration**: Backend API for data persistence
- **PWA Features**: Offline support and app-like experience

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **React Team**: For the amazing React framework
- **Vite Team**: For the fast build tool
- **Lucide**: For the beautiful icons
- **Open Source Community**: For inspiration and best practices

---

**Happy Coding! 🚀** 