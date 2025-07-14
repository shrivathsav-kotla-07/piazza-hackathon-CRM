# Installation Guide

This guide will walk you through the steps to get this application up and running on your local machine.

## Prerequisites

- [Node.js](https://nodejs.org/) (which includes npm)
- [Python](https://www.python.org/)
- [Ollama](https://ollama.ai/)

## 1. Set up Ollama

First, you need to have Ollama running.

a. **Install and run Ollama:**
   Follow the instructions on the [Ollama website](https://ollama.ai/) to download and install it for your operating system. Download the model of your choice (llama3.2 in this case) with the command:
   ```bash
   ollama pull model_name
   ```

b. **Create the model:**
   Open your terminal and run the following command to create the model from the provided `Modelfile` (change the name of the model in the file if needed):
   ```bash
   ollama create model -f Modelfile
   ```

## 2. Configure Environment Variables

You'll need to set up a `.env` file to store your credentials and other configuration.

a. **Create a `.env` file** in the root of the project.

b. **Add the following variables** to the `.env` file, replacing the placeholder values with your actual credentials:
   ```
   MONGO_DETAILS="mongo_db_url_link"
   GEMINI_API_KEY="google_api_link"
   GMAIL_USER=your_email@gmail.com
   GMAIL_APP_PASSWORD=your_google_app_password
   ```

## 3. Install Dependencies

There are dependencies for both the Python backend and the Node.js frontend.

a. **Install Python dependencies:**
   It's recommended to use a virtual environment.
   ```bash
   python -m venv hack
   source hack/bin/activate  # On Windows, use `hack\Scripts\activate`
   pip install -r requirements.txt
   ```

b. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

## 4. Update Python Script

You need to manually update the `new.py` file with your Gmail credentials.

- Open `new.py` and replace `'your_email@gmail.com'` and `'your_google_app_password'` with your actual Gmail username and app password.

## 5. Run the Application

The application consists of three parts that need to be running simultaneously: the Node.js server, the FastAPI server, and the React frontend.

a. **Start the Node.js server:**
   This server handles lead management.
   ```bash
   node server.js
   ```

b. **Start the FastAPI server:**
   This server handles the AI-related tasks. Open a new terminal for this command.
   ```bash
   uvicorn new:app --reload
   ```

c. **Start the React frontend:**
   This is the user interface. Open a third terminal for this command.
   ```bash
   npm run dev
   ```

Once all three services are running, you can access the application in your browser at the address provided by the `npm run dev` command (usually `http://localhost:5173`).
