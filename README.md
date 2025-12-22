# Digital Dockers - AI Workplace Suite

A comprehensive AI-powered workplace productivity platform with role-based dashboards.

## Prerequisites

- Node.js (v18+)
- MongoDB (running locally or URI)
- OpenAI API Key (for AI features)
- Google/Microsoft Client IDs (for OAuth)

## Setup

1.  **Clone the repository** (if not already there).

2.  **Backend Setup**:
    ```bash
    cd digital-dockers-suite/backend
    npm install
    # Configure .env file (copy .env.example)
    npm run dev
    ```

3.  **Frontend Setup**:
    ```bash
    cd digital-dockers-suite/frontend
    npm install
    npm run dev
    ```

    **Alternatively (Root)**:
    ```bash
    cd digital-dockers-suite
    npm install # Install concurrently
    npm run dev # Runs both
    ```

## Features Implemented

- **Role-Based Dashboards**: Admin, PM, Technical, Marketing, Lead.
- **Authentication**: JWT-based auth with Role Middleware.
- **Meeting Summarizer**: Upload audio -> Transcript -> AI Summary.
- **Task Management**: AI-prioritized tasks with time breakdown.
- **Email Generator**: Tone-based email generation.
- **Reports & Documents**: AI analysis of compliance docs.
- **Wellness Check-in**: Employee wellbeing tracking.

## Technology Stack

- **Frontend**: React, Material-UI, Vite
- **Backend**: Node.js, Express, MongoDB
- **AI**: OpenAI GPT-4, Whisper

## Default Roles (Register to test)

- `admin`
- `project_manager`
- `technical_team`
- `marketing_team`
- `technical_lead`

Enjoy building the future of work!
