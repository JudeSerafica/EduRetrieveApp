## Welcome to EduRetrieve !!

Course Module Sharing Application with AI Assistance
🚀 Project Overview
EduRetrieve is a full-stack web application designed to facilitate the sharing and discovery of course modules. It empowers users to upload educational content, manage their saved modules, and interact with an AI assistant to enhance their learning experience. Whether you're looking to share your knowledge or find new study materials, EduRetrieve provides a streamlined platform.

✨ Features
User Authentication: Secure sign-up and login for user accounts powered by Firebase Authentication.

Module Management: Upload, view, and manage course modules.

Module Saving: Save modules to your personal collection for easy access.

AI Chat Integration: Interact with a Google Gemini-powered AI assistant for queries, explanations, or content generation related to your studies.

Dashboard Overview: A centralized dashboard to view available modules and manage your activities.

Responsive Design: A clean, modern UI that adapts to various screen sizes.

🛠️ Tech Stack
EduRetrieve is built as a monorepo, separating the client and server applications.

Client (Frontend)
React.js: A JavaScript library for building user interfaces.

React Router: For declarative routing within the application.

Firebase SDK:

Authentication: User login, registration, and session management.

Firestore: NoSQL cloud database for storing module metadata and user data.

Storage: Cloud storage for uploaded module files.

react-icons: For beautiful and easily customizable SVG icons.

CSS: For styling and design.

Server (Backend)
Node.js: JavaScript runtime for the server.

Express.js: A fast, unopinionated, minimalist web framework for Node.js.

Firebase Admin SDK: For privileged interactions with Firebase services (e.g., managing users, accessing Firestore, Google Cloud Storage).

@google/generative-ai: SDK for integrating with Google's Gemini AI models.

@google-cloud/storage: For managing file uploads to Google Cloud Storage.

multer: Middleware for handling multipart/form-data, primarily for file uploads.

cors: Node.js middleware for enabling Cross-Origin Resource Sharing.

dotenv: For loading environment variables from a .env file.

Monorepo Tooling
concurrently: Allows running multiple npm scripts concurrently (e.g., client and server together).

⚙️ Prerequisites
Before you begin, ensure you have the following installed on your system:

Node.js: (v18.x or higher recommended)

npm: (Comes with Node.js)

Git: For cloning the repository.

🚀 Getting Started
Follow these steps to get EduRetrieve up and running on your local machine.

1. Clone the Repository
First, clone the project repository to your local machine:

git clone https://github.com/your-username/EduRetrieve.git
cd EduRetrieve

2. Install Dependencies
This project is a monorepo. Use the provided script to install dependencies for both the client and server, as well as root-level tools:

npm run install-all

This command will:

Install concurrently in the root.

Install all dependencies for the client/ project.

Install all dependencies for the server/ project.

3. Environment Variables (Crucial!)
Both the client and server projects require environment variables for configuration and security.

A. Firebase Project Setup
Create a Firebase Project: Go to the Firebase Console and create a new project.

Enable Services: Enable Firebase Authentication, Firestore Database, and Cloud Storage for your project.

Firebase Web App Config (for Client):

In Firebase Console, go to "Project settings" (gear icon) > "General".

Scroll down to "Your apps" and add a new web app (</>).

Copy the Firebase configuration object.

Firebase Admin SDK Credentials (for Server):

In Firebase Console, go to "Project settings" (gear icon) > "Service accounts".

Click "Generate new private key" and download the JSON file. Rename this file to EduRetrieve-ServiceAccount.json and place it directly inside your server/ directory (next to package.json). This file is extremely sensitive and is already ignored by .gitignore for your security.

B. Google Gemini API Key
Obtain a Gemini API Key: Go to Google AI Studio and generate a new API key. This key is specifically configured for generative AI models.

C. Create .env Files
Create two .env files, one in the client/ directory and one in the server/ directory:

client/.env:

REACT_APP_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
REACT_APP_FIREBASE_MEASUREMENT_ID=YOUR_FIREBASE_MEASUREMENT_ID
# (Optional) If your server runs on a different port than 5000:
# REACT_APP_SERVER_BASE_URL=http://localhost:YOUR_SERVER_PORT

Replace placeholders with values from your Firebase web app config.

server/.env:

GEMINI_API_KEY=YOUR_GEMINI_API_KEY_FROM_AI_STUDIO
FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID # Found in your Firebase web app config or project settings
PORT=5000 # Or any port you prefer for the server
# Set this to the path of your downloaded service account key.
# It should be relative to the server/ directory.
GOOGLE_APPLICATION_CREDENTIALS=./EduRetrieve-ServiceAccount.json

Replace YOUR_GEMINI_API_KEY_FROM_AI_STUDIO with the key copied from Google AI Studio.
Replace YOUR_FIREBASE_PROJECT_ID with your actual project ID.

4. Run the Application
Once all dependencies are installed and environment variables are set, you can start both the client and server with a single command from the root directory:

npm start

This command uses concurrently to:

Start the React development server (npm start --prefix client)

Start the Node.js backend server (npm start --prefix server)

The client will typically run on http://localhost:3000 and the server on http://localhost:5000 (or your specified PORT).

📂 Project Structure
EduRetrieve/
├── client/                 # React frontend application
│   ├── public/             # Static assets
│   ├── src/                # React source code
│   │   ├── components/     # Reusable React components (Header, Sidebar, Modals, etc.)
│   │   ├── pages/          # Top-level page components (Dashboard, Chats, Login, Upload, etc.)
│   │   ├── layouts/        # Layout components (e.g., DashboardLayout)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── Styles/         # Global styles (App.css)
│   │   ├── App.js          # Main React application component
│   │   ├── firebaseConfig.js # Firebase client-side config
│   │   └── index.js        # Entry point for React app
│   ├── .env                # Client-side environment variables
│   ├── .gitignore          # Client-specific Git ignore rules (though root .gitignore covers most)
│   ├── package.json        # Client dependencies and scripts
│   └── ...
│
├── server/                 # Node.js backend application
│   ├── src/                # Server source code
│   │   ├── model/          # Database models / data interaction logic (e.g., Model.js for Gemini, moduleModel.js for Firestore)
│   │   ├── controllers/    # Request handlers / business logic
│   │   ├── routes/         # API routes definitions
│   │   ├── middleware/     # Express middleware (e.g., authentication)
│   │   ├── utils/          # Utility functions
│   │   ├── config/         # Server configurations (e.g., firebaseAdminConfig.js)
│   │   └── index.js        # Server entry point
│   ├── EduRetrieve-ServiceAccount.json # Firebase Admin SDK service account key (IGNORED BY GIT)
│   ├── .env                # Server-side environment variables
│   ├── package.json        # Server dependencies and scripts
│   └── ...
│
├── node_modules/           # Root-level Node.js dependencies (e.g., concurrently)
├── .gitignore              # Global Git ignore rules for the monorepo
├── package.json            # Root monorepo dependencies and scripts
└── README.md               # This file

🤝 Contributing
Contributions are welcome! If you have suggestions or find issues, please open an issue or submit a pull request.

📄 License
This project is licensed under the MIT Li