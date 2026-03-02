# Revenue Assault

## What is Revenue Assault?

Revenue Assault is a high-performance Opportunity Management and CRM platform designed to streamline the sales pipeline. It enables sales teams to manage client relationships, track deal progress through custom stages, manage activity notes, and monitor estimated revenue—all within a secure, role-based environment.

## Why Choose Revenue Assault?

Revenue Assault prioritizes operational speed and data integrity. By utilizing a robust local-first state management architecture backed by centralized API synchronization, it ensures that Sales Managers and Representatives can manage high-volume pipelines without friction. With granular permission controls (RBAC), your sensitive deal data is protected and visible only to authorized personnel.

---

# Documentation

## Software Requirement Specification

### Overview

Revenue Assault provides a comprehensive interface for the modern sales cycle. Users can manage the entire lifecycle of an opportunity from Lead Discovery to final Closing (Won/Lost), maintaining a complete audit trail of activity through integrated notes and stage history.

### Components and Functional Requirements

**1. Opportunity & Pipeline Management**
* **Deal Tracking:** Create and monitor opportunities with metadata including estimated value, currency, and probability.
* **Stage Workflow:** Transition deals through a 6-stage pipeline (Discovery, Qualification, Proposal, Negotiation, Won, Lost).
* **Smart Filtering:** Filter opportunities by sales stage, search terms, and client specific data.

**2. Authentication and Role-Based Access (RBAC)**
* **Role Management:** Support for Admin, SalesManager, BDM, and SalesRep roles.
* **Permission Guarding:** Actions like deleting opportunities or assigning reps are restricted to specific management roles.
* **Unique Profiles:** Users access data relevant to their assigned accounts and regions.

**3. Activity & Note Subsystem**
* **Unified Notes:** Attach activity logs and messages directly to opportunities or clients.
* **Real-time Updates:** View and send updates in real-time to ensure team-wide alignment on deal status.
* **Audit Trail:** Automatic logging of stage changes and loss reasons.

---

# Design

## [UI Design](https://www.figma.com/design/97l0hfe6ogeRn0mjbfe4Gy/Untitled?node-id=0-1&m=dev&t=j02J3MH5C7mYCmF1-1)

The interface utilizes a "Dark Mode" aesthetic powered by Ant Design, optimized for long-form data entry and dashboard monitoring.

---

# Running Application

## FRONTEND
1. Clone the repository and navigate to the project folder.
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Access the application at `http://localhost:3000`

## Development
* Ensure the `.env` file is configured with the correct `NEXT_PUBLIC_API_URL`.
* Uses **React Context API** and **Redux-Actions** for state management.
* Styled using **Ant Design ConfigProvider** for custom branding.

## Production
The production build is optimized for performance and type safety.
Visit: [galane-dev.github.io/RevenueAssault/](https://revenue-assault.vercel.app/)