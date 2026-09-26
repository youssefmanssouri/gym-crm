# Gym CRM — Fitness Facility & Member Operations Platform

> **Modern Fitness Facility Management System** featuring member lifecycle management, QR attendance verification, workout programming, nutrition protocol planning, inventory point-of-sale (POS), and operational telemetry.
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
- *Demo Credentials Note: Quick-fill buttons are provided on the login page for Admin, Manager, Trainer, Receptionist, and Member roles.*

---

## 📋 Overview

Fitness facilities require coordinated front-desk attendance verification, member subscription tracking, trainer workout allocation, and financial ledgering. When member data, equipment inventory, and billing records live in disconnected silos, operations slow down and management loses operational visibility.

**Apex Gym CRM** centralizes facility operations into a high-contrast, responsive dashboard engineered with Next.js 14 App Router, TypeScript, and Prisma ORM.

---

## 🚀 Core Implemented Modules

1. **Operations Dashboard**: Facility benchmarks, monthly & weekly revenue indicators, peak utilization velocity charts, and 6-month historical trends.
2. **Member CRM**: Searchable member directory with status filters (`ACTIVE`, `INACTIVE`, `EXPIRED`, `FROZEN`), weight goal tracking, and digital QR passes.
3. **Membership Plans & Assignment**: Configurable subscription tiers, promo discount engine, and direct member plan assignment workflow.
4. **Attendance Access Terminal**: Front-desk QR code verification terminal with real-time pass validation and access logs.
5. **Trainer Hub & Workout Builder**: Multi-exercise routine builder (sets, reps, rest intervals) with Google Gemini AI routine generation and smart fallbacks.
6. **Nutrition Protocol Builder**: Macro-balanced dietary planner (protein, carbohydrates, fats) matched to target caloric requirements with meal scheduling.
7. **Payments & Billing**: Transaction ledger with invoice numbers (`INV-YYYY-XXXXX`), payment methods, printable receipts, and dynamic aggregates.
8. **Inventory & Point-of-Sale (POS)**: Supplement and merchandise catalog, stock level monitoring, low-stock warnings, and transactional POS checkout.
9. **Staff Directory & Security Audit Trail**: Staff management across 5 roles (`ADMIN`, `MANAGER`, `TRAINER`, `RECEPTIONIST`, `MEMBER`) and system audit logs.
10. **AI Intelligence Suite**: Conversational fitness assistant, predictive retention modeling, and strategic revenue recommendations.
11. **Reports & Analytics**: One-click sanitized CSV exports for financial ledgers, member directories, and facility attendance logs.
12. **System Settings**: Facility branding, operating hours, and sales tax rate configuration.

---

## 🏗️ Architecture & Fault Tolerance

```text
Browser Client (React 18 / Tailwind CSS / Framer Motion)
               │
               ▼
   Next.js 14 App Router (Dynamic Routes & Server Actions)
               │
               ▼
   Prisma ORM & Resilient Dual-Mode Data Layer
         ┌─────┴────────────────┐
         ▼                      ▼
  PostgreSQL Database    Deterministic Demo Fallback
  (When Connected)       (Zero-Downtime Offline Resilience)
```

| Technology | Functional Purpose |
|------------|-------------------|
| **Next.js 14 (App Router)** | Code-split modular workspace with dynamic imports and fast navigation |
| **TypeScript (Strict)** | Strict end-to-end typing for member profiles, attendance logs, and financial records |
| **Prisma ORM & PostgreSQL** | Entity relations, schema migrations, and structured data models |
| **Google Gemini API** | AI workout split generation, nutrition planning, and strategic recommendations |
| **Tailwind CSS** | Dark-mode terminal design system with responsive mobile drawer |
| **Zod** | Runtime schema validation protecting all 20 API mutation endpoints |

---

## ⚙️ Local Development Setup

### 1. Clone & Install

```bash
git clone https://github.com/youssefmanssouri/gym-crm.git
cd gym-crm
npm install
```

### 2. Configure Environment

Create a `.env` file based on `.env.example`:

```env
DATABASE_URL="postgresql://gym_user:gym_password@localhost:5432/gym_crm?schema=public"
NEXTAUTH_SECRET="your-development-session-secret"
GEMINI_API_KEY="" # Optional: Application uses deterministic heuristics if omitted
```

*Note: A live PostgreSQL database is optional for local UI and demo exploration. The application includes a resilient demo fallback mode.*

### 3. Initialize Database (Optional)

```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

The repository includes comprehensive automated test suites covering authentication, CRUD persistence, RBAC permissions, and demo coherence:

```bash
node scratch/test-phase3b.js        # 45 Core CRM & Persistence tests
node scratch/test-phase3d.js        # 45 Workout, Nutrition, AI & IDOR tests
node scratch/test-demo-coherence.js # Demo fallback & checkout coherence
```

---

## 👤 Author

**Youssef Manssouri**
- Portfolio: [https://www.youssefmanssouri.site](https://www.youssefmanssouri.site)
- LinkedIn: [linkedin.com/in/youssef-manssouri-24b4662ba](https://www.linkedin.com/in/youssef-manssouri-24b4662ba/)
- Email: [manssouriyoussef33@gmail.com](mailto:manssouriyoussef33@gmail.com)