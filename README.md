# Gym CRM — Fitness Facility & Member Operations Platform

> **Operational Gym Management CRM** designed for front-desk check-in verification, membership renewal tracking, class capacity planning, and recurring revenue telemetry.
>
> Designed & Developed by **[Youssef Manssouri](https://www.youssefmanssouri.site)**.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-3A171C?style=flat-square&logo=vercel)](https://gym-crm-gules.vercel.app)
[![Case Study](https://img.shields.io/badge/Portfolio-Case%20Study-A65F4B?style=flat-square)](https://www.youssefmanssouri.site/projects/gym-crm)
[![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

---

## 🌐 Live Access

- **Live Application Demo**: [https://gym-crm-gules.vercel.app](https://gym-crm-gules.vercel.app)
- **Engineering Case Study**: [https://www.youssefmanssouri.site/projects/gym-crm](https://www.youssefmanssouri.site/projects/gym-crm)
- *Note: The live demo operates in a protected read-only environment with synthetic data to protect operational integrity.*

---

## 📋 Overview

Fitness facilities frequently face front-desk check-in bottlenecks, unmonitored expired memberships, and disjointed group class schedules. When member data, class rosters, and billing records live in separate places, front-desk staff lose time and facility management lacks immediate visibility into facility velocity.

**Gym CRM** centralizes member verification, subscription renewal tracking, trainer class allocation, and facility revenue into a single, high-contrast operational dashboard.

---

## 🚀 Core Capabilities

1. **Reception Check-In Terminal**: Rapid member lookups by name or ID with instant visual verification of membership validity.
2. **Member Directory & Subscription Tracker**: Complete member registry with status filters (Active, Expired, Suspended), emergency contacts, and renewal history.
3. **Class Scheduling & Capacity Matrix**: Group workout and class planner with trainer assignments, time slots, and attendee capacity limits.
4. **Revenue & MRR Telemetry**: Monthly recurring revenue summaries, membership tier distribution, and renewal forecasts.
5. **Role-Based Operations**: Tailored permissions ensuring front-desk staff, trainers, and facility managers access appropriate tools.

---

## 🏗️ Architecture

`	ext
Browser Client (React / Tailwind CSS)
               │
               ▼
   Next.js App Router (Operational Views & Server Actions)
               │
               ▼
   Prisma ORM (Data Access Layer & Entity Relations)
               │
               ▼
   PostgreSQL / SQLite Database
`

| Technology | Functional Purpose |
|------------|-------------------|
| **Next.js** | Front-desk operations portal with responsive views and fast transitions |
| **TypeScript** | Strict data typing for member profiles, attendance logs, and class rosters |
| **PostgreSQL & Prisma ORM** | Structured member records, plan tiers, and booking capacity models |
| **Tailwind CSS** | High-contrast front-desk terminal UI and visual status indicators |

---

## 📦 What Was Built (Build Scope)

- Reception desk attendance check-in terminal with instant search
- Member directory with Active, Expired, and Frozen subscription badges
- Group class scheduling matrix with trainer allocations & attendee capacity
- Monthly recurring revenue (MRR) summaries & membership tier breakdown
- Role-based operations interface designed for front-desk and management staff
- Fully responsive interface optimized across mobile, tablet, and desktop

---

## ⚙️ Local Development Setup

### 1. Clone & Install

`ash
git clone https://github.com/youssefmanssouri/gym-crm.git
cd gym-crm
npm install
`

### 2. Configure Environment

Create a .env file based on .env.example:

`env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
`

### 3. Initialize Database & Seed

`ash
npx prisma db push
npm run db:seed
`

### 4. Run Development Server

`ash
npm run dev
`

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👤 Author

**Youssef Manssouri**
- Portfolio: [https://www.youssefmanssouri.site](https://www.youssefmanssouri.site)
- LinkedIn: [linkedin.com/in/youssef-manssouri-24b4662ba](https://www.linkedin.com/in/youssef-manssouri-24b4662ba/)
- Email: [manssouriyoussef33@gmail.com](mailto:manssouriyoussef33@gmail.com)