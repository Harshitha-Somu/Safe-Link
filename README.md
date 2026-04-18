# Safe-Link — URL Spam & Phishing Detection System

Safe-Link is a full-stack web application that analyzes URLs to identify phishing, spam, and potentially malicious links using a multi-level security pipeline. The system evaluates keywords, shortened links, domain reputation, and external threat intelligence to generate a clear risk score and classification.

The project focuses on **practical cybersecurity concepts, explainable risk analysis, and full-stack system design**.

---

## Features

- URL validation and structured input handling  
- Multi-level URL scanning system:
  - Keyword-based phishing detection
  - Shortened URL expansion
  - Google Safe Browsing API check
  - Domain reputation and WHOIS analysis
  - Final risk classification
- Visual risk score and status indicator
- Scan history (database-backed)
- Shareable scan report links
- Responsive user interface

---

## Risk Classification

| Score Range | Risk Level |
|------------|------------|
| 0.00 – 0.25 | Safe |
| 0.26 – 0.50 | Low Risk |
| 0.51 – 0.75 | Suspicious |
| 0.76 – 1.00 | Spam |

---

## System Design Overview

### Frontend
- Accepts URL input
- Displays scan results and risk score
- Shows recent scan history
- Generates shareable report links

### Backend
- REST API for scan creation and retrieval
- Multi-stage analysis engine
- External API integration
- Database persistence layer

---

## Technology Stack

### Frontend
- React (TypeScript)
- Wouter (Routing)
- TanStack React Query (API state management)
- Tailwind CSS (Styling)
- Framer Motion (Animations)

### Backend
- Node.js
- Express
- TypeScript
- Axios (External API calls)
- WHOIS lookup service

### Database
- PostgreSQL
- Drizzle ORM

---

## Risk Scoring Logic

The system computes a normalized risk score based on multiple signals:

- Presence of phishing-related keywords
- Use of URL shorteners
- Google Safe Browsing threat matches
- HTTPS availability
- Domain age and registrar data
- Risky top-level domains

Each signal contributes a weighted value to the final score, which is mapped to a risk category.

---

## Installation

### Clone the repository
```bash
git clone https://github.com/Harshitha-Somu/Safe-Link.git
cd Safe-Link
```

### Install dependencies
```bash
npm install
```

### Environment setup
Create a `.env` file:
```env
DATABASE_URL=your_postgresql_url
GOOGLE_SAFE_BROWSING_API_KEY=your_api_key
```

### Run database migration
```bash
npm run db:push
```

### Start development server
```bash
npm run dev
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|------------|
| POST | `/api/scans` | Create a new scan |
| GET | `/api/scans` | Get recent scans |
| GET | `/api/scans/:id` | Get scan report |

---

## UML & Documentation

The project includes:
- System Architecture Diagram
- Sequence Diagram
- Class Diagram
- Data Flow Diagram

These describe request flow, risk computation, and data storage design.

---

## Future Improvements

- User authentication and personal dashboards
- PDF export for reports
- Email alerts for high-risk links
- ML-based classification using trained models
- Browser extension

---

## Author

**Harshitha Somu**  
GitHub: https://github.com/Harshitha-Somu

---

## Academic Use

This project is suitable for:
- Cybersecurity demonstrations
- Full-stack development evaluation
- System design and UML presentations
- API integration case studies
