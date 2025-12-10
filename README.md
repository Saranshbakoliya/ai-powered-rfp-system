AI-Powered RFP Management System

This is a full-stack application that automates the Request for Proposal (RFP) process using AI.
It allows users to create RFPs from natural language, manage vendors, extract proposals from vendor email text, and run inbox polling in safe demo mode.
Email sending is also supported in mock mode (logged to console).

Features:

Create structured RFPs from natural language using AI (Groq)

Add and list vendors

Create proposals from pasted vendor email replies

View proposals for a specific RFP

Poll inbox in safe demo mode (no IMAP required)

Send RFP emails in mock mode (no SMTP required)

Tech Stack:

Node.js + Express.js backend

SQLite database

Groq AI API for extraction

Vanilla JavaScript frontend (HTML/JS)

Mock email + safe polling system

Project Structure:
backend/ → API, database, AI logic
frontend/ → index.html and UI logic
.env → environment variables (not uploaded)

Setup:
Backend:

cd backend

npm install

npm start

Frontend:
Open frontend/index.html using Live Server.

Environment Variables:
Use .env.example to create your own .env file.
If SMTP/IMAP are not provided, email and polling run in safe demo mode.

How to Use:

Create an RFP using natural language.

Add vendors to the system.

Paste vendor email text to auto-create proposals.

Load proposals for an RFP.

Poll inbox (safe mode).

Send RFP (mock mode).