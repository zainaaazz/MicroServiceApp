# Flexitec Banking App Microservice

A full-stack microservice-based banking application providing secure user authentication, profile & card management, and administrative oversight. Consists of:

- **Backend**: An Express microservice for user & card domains, with its own Azure SQL database, JWT-based auth, role-based access, rate limiting, input validation, logging, and email notifications and OTP, Brute Force attack preventions and detection.
- **Frontend**: A React single-page application consuming the backend API, supporting customer and staff workflows with protected routes, context-driven auth state, and a responsive UI.

---

## Table of Contents

1. [Features](#features)  
2. [Tech Stack](#tech-stack)  

## Features

- **User Authentication**  
  - Email/password login with bcrypt-hashed passwords  
  - Google OAuth2 “Sign in with Google”  
  - Stateless JWT tokens (1h expiry)  

- **Role-Based Access Control**  
  - Customer (role_id = 1) vs. Staff/Admin (role_id = 2)  
  - Fine-grained middleware enforcement  

- **Card Management**  
  - List & mask customer cards  
  - OTP-protected reveal of full card details (PAN, CVV)  
  - Block/unblock cards with email notifications  

- **Security & Validation**  
  - Express-Validator input schemas & sanitization  
  - Parameterized MSSQL queries  
  - Helmet for secure HTTP headers  
  - CORS restricted to the front-end origin  
  - Rate limiting (100 req / 15m per user/IP)
  - Brute force attack prevention and detection  

- **Logging & Monitoring**  
  - Winston: activity.log, security.log, errors.log  
  - Request/activity middleware & centralized error handling  
  - DB health-check script  

---

## Tech Stack

- **Backend**  
  - Node.js & Express  
  - Azure SQL via `mssql`  
  - `jsonwebtoken`, `bcrypt`  
  - `express-validator`, `helmet`, `cors`, `express-rate-limit`  
  - `winston` for logging  
  - `nodemailer` for email notifications and OTPs  
  - Swagger UI

- **Frontend**  
  - React (v18+) & React Router  
  - Context API for global auth state  
  - Fetch API with JWT header injection  
  - Plain CSS & FontAwesome  
  - Responsive layout (sidebar + header)

---

