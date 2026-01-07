Wallet & Transaction Management System
📖 Project Overview

This project is a bKash-like digital wallet application built with modern web technologies.
It includes:

User features → registration, login, wallet management, transactions.

Agent features → agent verification, manage assigned users.

Admin features → user/agent management, wallet monitoring, transaction reports.

Secure authentication & authorization with role-based access.

The goal is to simulate a real-world fintech wallet system where users can deposit, withdraw, send money, and admins/agents manage operations.

⚙️ Setup Instructions
1️⃣ Clone the repository

git clone https://github.com/tanveer19/L2-B5-Assignment-6-Back.git
cd L2-B5-Assignment-6-Back

2️⃣ Install dependencies

Using pnpm (preferred):

pnpm install

Or with npm:

npm install

3️⃣ Setup environment variables

Create a .env file in the root directory with:

# Backend

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000

4️⃣ Run the project

Start backend & frontend together (if configured with workspaces):

pnpm dev

Or separately:

cd backend && pnpm dev
cd frontend && pnpm dev

5️⃣ Build for production
pnpm build

🛠 Technology Stack
Frontend

⚛️ React (with Vite + TypeScript)

🎨 Tailwind CSS + shadcn/ui (UI components)

🔄 Redux Toolkit (RTK Query) for state & API calls

Backend

🟢 Node.js + Express.js

🗄 MongoDB + Mongoose

🔐 JWT Authentication

⚡ TypeScript for type safety

Tools & Others

📦 pnpm (fast package manager)

🔄 Prisma / Mongoose middleware for DB logic

🌍 Live URL https://l2-b5-assignment-6-back.vercel.app

📌 Relevant Notes

Default user roles: USER, AGENT, ADMIN

New users/agents get a wallet initialized with ৳50

Admin can block/unblock users & agents

Transactions include deposit, withdraw, send money

Project follows modular folder structure for scalability
