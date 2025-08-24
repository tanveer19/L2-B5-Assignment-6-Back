# 💳 Wallet Management System API

A secure role-based digital wallet management system built using Node.js, Express, MongoDB, and TypeScript. Supports three roles: Admin, User, and Agent.

# 🚀 Features

Authentication

JWT-based login system

Secure password hashing using bcrypt

Role-based route protection

🧍 Users
Automatically get a wallet with ৳50 on registration

Top-up own wallet

Withdraw from own wallet

Send money to other users

View own transaction history

🧑‍💼 Agents
Automatically get a wallet with ৳50 on registration

Cash-in to any user’s wallet

Cash-out from any user’s wallet

View commission history (optional)

👮 Admins
View all users, agents, wallets, and transactions

Block/unblock wallets

Approve/suspend agents

(Optional) Set system parameters like transaction fees

🔐 Security
Passwords are hashed

Role and status checks before every action

Wallets are blocked if user is blocked

# 🛠️ Tech Stack

Backend Framework: Express.js

Language: TypeScript

Database: MongoDB with Mongoose

Auth: JWT

Validation: Zod

Password Hashing: bcrypt

Installation

# Clone the project

git clone https://github.com/tanveer19/L2-B5-Assignment-5.git

# Install dependencies

pnpm install

# Create a .env file

cp .env.example .env

# Run in development

pnpm dev

📋 API Endpoints

🔐 Auth

| Method | Endpoint         | Description         |
| ------ | ---------------- | ------------------- |
| POST   | `/user/register` | Register user/agent |
| POST   | `/auth/login`    | Login and get token |

👤 Users

| Method | Endpoint               | Description                |
| ------ | ---------------------- | -------------------------- |
| POST   | `/wallet/add-money`    | Add money to wallet        |
| POST   | `/wallet/withdraw`     | Withdraw from wallet       |
| POST   | `/wallet/send`         | Send money to another user |
| GET    | `/wallet/transactions` | View transaction history   |

🧑‍💼 Agents

| Method | Endpoint          | Description                 |
| ------ | ----------------- | --------------------------- |
| POST   | `/agent/cash-in`  | Add money to user's wallet  |
| POST   | `/agent/cash-out` | Withdraw from user's wallet |

👮 Admins

| Method | Endpoint                     | Description          |
| ------ | ---------------------------- | -------------------- |
| GET    | `/admin/users`               | Get all users        |
| GET    | `/admin/agents`              | Get all agents       |
| GET    | `/admin/wallets`             | Get all wallets      |
| GET    | `/admin/transactions`        | Get all transactions |
| PATCH  | `/admin/wallets/:id/block`   | Block wallet         |
| PATCH  | `/admin/wallets/:id/unblock` | Unblock wallet       |
| PATCH  | `/admin/agents/:id/approve`  | Approve agent        |
| PATCH  | `/admin/agents/:id/suspend`  | Suspend agent        |

🔐 Roles & Access

| Role  | Access                       |
| ----- | ---------------------------- |
| User  | Wallet operations for self   |
| Agent | Wallet operations for others |
| Admin | Full control and management  |

🧪 Testing (Postman)
Use the following steps to test:

Register as user/agent via /auth/register

Login via /auth/login to get token

Set Authorization: Bearer <token> in Postman

Access role-specific routes
