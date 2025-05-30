# 🤖 AI Meeting Minutes to Task Converter

AI Meeting Minutes to Task Converter is an intelligent, AI-powered web app that parses natural language meeting transcripts into structured tasks with assignees, deadlines, and priorities. Built with Node.js, Express, React, and OpenAI’s GPT-4o, this tool helps teams convert meeting discussions into actionable, organized task lists effortlessly.

---

## 🚀 Features

- 📝 **Meeting Transcript Parsing** – Paste full meeting notes and automatically extract tasks assigned to team members.
- 📅 **Auto-Extract Task Details** – Detects task description, assignee, due date/time, and priority (defaults to P3 if unspecified).
- 🗂️ **Unified Task Board** – Displays parsed tasks alongside individually added tasks for easy tracking.
- 🎨 **Clean & Responsive UI** – Visually appealing cards with priority color coding, optimized for desktop and mobile.
- 🔄 **Fullstack Application** – React frontend with a TypeScript + Express backend integrated with OpenAI API for smart parsing.

---

## 💡 Example Use Case

Input meeting transcript:

Aman you take the landing page by 10pm tomorrow.
Rajeev you take care of client follow-up by Wednesday.
Shreya please review the marketing deck tonight.
John needs to prepare the P1 presentation slides by Friday morning.
Sarah, can you update the project timeline by end of week?

yaml
Copy
Edit

Output task list:

| Task                         | Assigned To | Due Date          | Priority |
|------------------------------|-------------|-------------------|----------|
| Take the landing page         | Aman        | 10:00 PM, Tomorrow| P3       |
| Client follow-up             | Rajeev      | Wednesday         | P3       |
| Review the marketing deck     | Shreya      | Tonight           | P3       |
| Prepare the presentation slides| John       | Friday morning    | P1       |
| Update the project timeline   | Sarah       | End of week       | P3       |

---

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ai-meeting-minutes-to-task-converter.git
cd ai-meeting-minutes-to-task-converter
```
### 2. Install Dependencies
```bash
npm install
cd client
npm install
```
### 3. Add Your OpenAI API Key
Create a .env file in the root directory:
```bash
OPENAI_API_KEY=sk-your-openai-api-key
```
💡 Get your API key from OpenAI Dashboard

### 4. Run in Development Mode
Start the backend and frontend servers:

In one terminal (backend):
```bash
npm run dev
```
In another terminal (frontend):
```bash
cd client
npm run dev
```
Backend runs on: http://localhost:5000
Frontend runs on: http://localhost:5173

### 🎨 UI Highlights
Task Cards: Clear visual cards with task details and assignee.
Priority Badges: Color-coded badges (P1-red, P2-orange, P3-blue, P4-gray).
Responsive Design: Works smoothly on both desktop and mobile devices.
Clean Layout: Intuitive and minimalistic for easy navigation.

### 📚 Technologies Used
Backend: Node.js, Express, TypeScript
Frontend: React, Vite, TypeScript

AI: OpenAI GPT-4o API for natural language parsing

Validation: Zod for schema validation of AI responses


## 🫡 Output ScreenShots
![Screenshot 2025-05-30 152026](https://github.com/user-attachments/assets/2e51aa72-bdd0-430d-bd45-0cf5cb38ce1d)
![Screenshot 2025-05-30 152109](https://github.com/user-attachments/assets/a554667b-33cc-4789-a40c-1f2e8f8c443b)



