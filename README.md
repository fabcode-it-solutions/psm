# Parts Management System

**A full-stack automotive marketplace & inventory platform** — built end-to-end with Next.js 14, PostgreSQL, and TypeScript.

This project is a portfolio sample showcasing enterprise-grade architecture for a real-world marketplace: inventory management, dynamic custom fields, role-based access, real-time messaging, and security practices aligned with Australian compliance standards (ACSC Essential Eight).

🔗 **Live Demo**: [overlap-theta.vercel.app](https://overlap-theta.vercel.app/)

---

## What This Project Demonstrates

- **Complex Data Modeling** — a flexible metafields engine that lets admins define custom fields (11+ types) for any entity without touching code
- **Marketplace-Grade Inventory** — multi-variant products, pricing, shipping profiles, demand tracking, and a moderation workflow
- **Hierarchical Data Management** — Brand → Model → Type structure for automotive data, with full CRUD and media support
- **Secure, Role-Based Access** — authentication, granular permissions (SuperAdmin / Admin / User), and audit-grade logging
- **Real-Time Features** — buyer/seller messaging and a notification system with templated emails
- **Production-Ready Security** — CSRF protection, rate limiting, input validation, and a 7-year audit trail
- **Clean, Scalable Codebase** — modular structure, typed end-to-end with TypeScript and Zod, Drizzle ORM for type-safe database access

---

## Key Features

| Feature                   | Highlights                                                                        |
| ------------------------- | --------------------------------------------------------------------------------- |
| **Dynamic Metafields**    | Custom field builder (text, number, boolean, date, select, color, file, and more) |
| **Inventory Management**  | Variants, SKUs, pricing, shipping rules, media galleries                          |
| **Car Catalog**           | Brand/Model/Type hierarchy with logo & image management                           |
| **User & Access Control** | Role-based permissions, OTP verification, password recovery                       |
| **Media Library**         | Multi-file uploads, filtering, bulk actions, CDN-ready delivery                   |
| **Messaging**             | Real-time conversations between buyers and sellers                                |
| **Universal Search**      | Cross-entity search across parts, brands, users, and more                         |
| **Notifications**         | Templated, queue-based email + in-app notifications                               |
| **Security & Compliance** | CSRF, rate limiting, audit logging, Australian ACSC Essential Eight alignment     |

---

## Technology Stack

| Category           | Technology                       |
| ------------------ | -------------------------------- |
| **Framework**      | Next.js 14 (App Router)          |
| **Language**       | TypeScript                       |
| **Database**       | PostgreSQL + Drizzle ORM         |
| **Authentication** | NextAuth.js                      |
| **Validation**     | Zod                              |
| **Styling**        | Tailwind CSS                     |
| **Infrastructure** | AWS S3 (media), Vercel (hosting) |
| **Payments**       | Stripe                           |
| **Logging**        | Winston (audit-grade retention)  |

---

## Architecture Overview

The codebase follows a clean, modular Next.js App Router structure:

```
src/
├── app/               # Routes, pages, and API endpoints
├── component/         # Reusable UI & dashboard components
├── db/                # Drizzle schemas & database layer
├── hooks/             # Custom React hooks for data access
├── libs/              # Security, auth, and shared utilities
├── models/            # Business logic
└── types/             # End-to-end TypeScript definitions
```

Every layer — API, database, and UI — is fully typed, validated, and covers real production concerns (pagination, rate limiting, audit logging) rather than a bare-bones CRUD demo.

---

## Security & Compliance

This project was built with the same security discipline expected in production client work:

- CSRF protection (JWT-based, HttpOnly cookies + header validation)
- Origin validation and rate limiting on sensitive endpoints
- Parameterized queries via Drizzle ORM (SQL injection prevention)
- Role-based access control with audit logging (7-year retention)
- Alignment with the **Australian Government's ACSC Essential Eight** framework

---

## About This Repository

This repository is shared as a **code sample and demonstration of engineering capability** — showcasing how a full-stack marketplace platform is architected, secured, and scaled. Setup instructions, environment configuration, and deployment details are intentionally omitted from this public view; a full walkthrough and codebase access are available on request.

---

_Built with Next.js, PostgreSQL, and a focus on clean, secure, scalable architecture._
