# Mini CRM

Mini CRM is a modern, feature-rich Customer Relationship Management (CRM) application designed to streamline lead management and automate workflows. It integrates AI-powered features to provide intelligent insights and enhance user productivity.

## 🚀 Features

- **Lead Management**: Create, track, and manage leads effectively.
- **AI-Powered Chat**: Interact with an AI assistant to get lead information and suggestions.
- **Workflow Automation**: Design and automate custom workflows for lead processing.
- **Document Processing**: Upload documents (PDF, images) to automatically extract lead data.
- **Visual Workflow Designer**: A user-friendly drag-and-drop interface to build automation workflows.

## 🛠️ Tech Stack

- **Frontend**:
  - React
  - Vite
  - CSS
- **Backend**:
  - Node.js
  - Express.js
  - Python (FastAPI)
- **Database**:
  - MongoDB
- **AI/ML**:
  - LangChain
  - LangGraph
  - Google Generative AI
  - Ollama

## 📁 Project Structure

```
.
├── hack/                 # Python virtual environment
├── models/               # Mongoose models for MongoDB
│   └── Lead.js
├── routes/               # Express.js routes for the backend
│   └── leads.js
├── src/                  # React frontend source code
│   ├── components/       # UI components
│   ├── services/         # Services for API calls and business logic
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Main React application component
│   ├── main.jsx          # React application entry point
│   └── index.css         # Global CSS styles
├── vite-project/         # Separate Vite project folder
├── .gitignore
├── server.js             # Backend Express.js server entry point
├── new.py                # Python backend for all the servers (workflow automation, document extraction and chat)
├── ti.py                 # Python code for date & time
├── Modelfile             # To create a model specific for the CRM use case
├── requirements.txt      # Python dependencies
├── package.json          # Node.js dependencies and scripts
├── vite.config.js        # Vite configuration file
├── index.html            # Main HTML file for the frontend
└── README.md
```

## Prerequisites

- Node.js (v16 or higher)
- npm
- Python (v3.8 or higher)
- pip
- MongoDB
- ollama app
