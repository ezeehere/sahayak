# Sahayak – Local Job Finder System

Sahayak is a modern local job finder web application designed to connect nearby job seekers with local shop owners. The platform focuses on small businesses such as pharmacies, grocery stores, restaurants, stationery shops, garment stores, and other local service providers who need quick manpower.

The system supports three roles: Job Seeker, Shop Owner, and Admin. Each role has a separate dashboard and role-based workflow.

---

## Project Overview

Many local job opportunities are still shared through word of mouth, posters, or informal contacts. This makes it difficult for job seekers to discover nearby work and for shop owners to find suitable workers quickly.

Sahayak solves this problem by providing a simple digital platform where:

* Job seekers can browse nearby jobs, save jobs, apply online, and contact shop owners.
* Shop owners can create shop profiles, post jobs, manage jobs, and review applicants.
* Admin can manage users, jobs, and categories.

The project is built as a responsive Progressive Web App so it works smoothly on both desktop and mobile devices.

---

## Features

### Job Seeker

* Register and login as a job seeker
* Create and update seeker profile
* Browse approved local jobs
* Search jobs by title, category, shop, or location
* Filter jobs by category
* View full job details
* Save and remove saved jobs
* Apply for jobs
* Track application status
* Contact shop owner through phone or WhatsApp
* Mobile-friendly job browsing experience

### Shop Owner

* Register and login as a shop owner
* Create and update shop profile
* Post new jobs
* View all posted jobs
* Close or reopen jobs
* View applicants for posted jobs
* Update applicant status as pending, shortlisted, rejected, or hired
* Mobile-friendly owner dashboard

### Admin

* Admin dashboard with real-time system counts
* Manage users
* Change user roles
* Manage jobs
* Update job status
* Manage job categories
* Add and delete categories

### General Features

* Role-based authentication
* Supabase database integration
* Protected routes
* Multi-language support
* Responsive mobile-first UI
* Progressive Web App support
* Installable on mobile devices
* Clean dashboard design
* React Router support with Vercel deployment configuration

---

## Tech Stack

### Frontend

* React
* Vite
* React Router DOM
* CSS
* Lucide React Icons

### Backend / Database

* Supabase
* PostgreSQL
* Supabase Authentication
* Supabase Row Level Security

### Deployment

* Vercel

---

## User Roles

### 1. Job Seeker

A job seeker can search and apply for local jobs. They can maintain their profile, save jobs, view applications, and directly contact shop owners.

### 2. Shop Owner

A shop owner can create a shop profile, post jobs, manage job listings, and review job applications.

### 3. Admin

Admin controls the platform by managing users, jobs, and categories.

---

## Folder Structure

```text
sahayak/
├── public/
│   ├── manifest.webmanifest
│   ├── sahayak-icon.svg
│   └── sw.js
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── MobileBottomNav.jsx
│   │   ├── LanguageToggle.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── LanguageContext.jsx
│   ├── i18n/
│   │   └── translations.js
│   ├── lib/
│   │   └── supabase.js
│   ├── pages/
│   │   ├── admin/
│   │   ├── owner/
│   │   ├── seeker/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── index.html
├── package.json
├── vercel.json
└── README.md
```

---

## Database Tables

The project uses the following main tables in Supabase:

* `profiles`
* `seeker_profiles`
* `shop_profiles`
* `categories`
* `jobs`
* `applications`
* `saved_jobs`

### Main Table Purpose

| Table           | Purpose                                                |
| --------------- | ------------------------------------------------------ |
| profiles        | Stores basic user details and role                     |
| seeker_profiles | Stores job seeker skills, experience, and availability |
| shop_profiles   | Stores shop owner business details                     |
| categories      | Stores job categories                                  |
| jobs            | Stores job posts created by shop owners                |
| applications    | Stores job applications submitted by seekers           |
| saved_jobs      | Stores jobs saved by seekers                           |

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Use the Supabase anon public key only. Do not use the service role key in the frontend.

---

## Installation and Setup

### 1. Clone the repository

```bash
git clone your_repository_url
cd sahayak
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add environment variables

Create a `.env` file and add your Supabase credentials.

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the development server

```bash
npm run dev
```

Open the local URL shown in the terminal.

---

## Build for Production

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## Deployment on Vercel

The project includes a `vercel.json` file to support React Router routes after deployment.

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

### Vercel Settings

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Add Environment Variables in Vercel

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

After adding environment variables, redeploy the project.

---

## Supabase Auth Configuration

In Supabase dashboard, go to:

```text
Authentication → URL Configuration
```

Set the Site URL:

```text
https://your-vercel-app.vercel.app
```

Add Redirect URL:

```text
https://your-vercel-app.vercel.app/*
```

---

## Progressive Web App Support

Sahayak includes basic PWA support using:

* `manifest.webmanifest`
* `sahayak-icon.svg`
* `sw.js`
* service worker registration

This allows the application to behave like an installable mobile web app after deployment on HTTPS.

---

## Important Routes

### Public Routes

| Route       | Page     |
| ----------- | -------- |
| `/`         | Home     |
| `/login`    | Login    |
| `/register` | Register |

### Job Seeker Routes

| Route                  | Page             |
| ---------------------- | ---------------- |
| `/seeker/dashboard`    | Seeker Dashboard |
| `/seeker/profile`      | Seeker Profile   |
| `/seeker/jobs`         | Browse Jobs      |
| `/seeker/jobs/:id`     | Job Details      |
| `/seeker/saved`        | Saved Jobs       |
| `/seeker/applications` | My Applications  |

### Shop Owner Routes

| Route                 | Page            |
| --------------------- | --------------- |
| `/owner/dashboard`    | Owner Dashboard |
| `/owner/shop-profile` | Shop Profile    |
| `/owner/post-job`     | Post Job        |
| `/owner/jobs`         | My Jobs         |
| `/owner/applicants`   | Applicants      |

### Admin Routes

| Route               | Page              |
| ------------------- | ----------------- |
| `/admin/dashboard`  | Admin Dashboard   |
| `/admin/users`      | Manage Users      |
| `/admin/jobs`       | Manage Jobs       |
| `/admin/categories` | Manage Categories |

---

## Project Workflow

### Job Seeker Workflow

1. Register as job seeker
2. Login
3. Complete profile
4. Browse jobs
5. Save or apply for jobs
6. Track application status
7. Contact shop owner if needed

### Shop Owner Workflow

1. Register as shop owner
2. Login
3. Create shop profile
4. Post job
5. Manage job listings
6. View applicants
7. Update applicant status

### Admin Workflow

1. Login as admin
2. View dashboard statistics
3. Manage users
4. Manage jobs
5. Manage categories

---

## Design Approach

The application uses a clean, mobile-first design system with:

* Rounded cards
* Bold typography
* Soft background colors
* Simple dashboard layouts
* Compact mobile navigation
* Bottom navigation for mobile users
* Clean role-based UI

The mobile layout is optimized so users can quickly access the most important actions without unnecessary clutter.

---

## Future Enhancements

* Location-based job recommendations
* Resume upload
* Owner verification system
* Notification system
* Job expiry date
* Applicant shortlisting filters
* Admin analytics charts
* Email notifications
* In-app chat between seeker and owner
* Advanced search by salary and job type

---

## Project Status

The project is functional and ready for academic demonstration or basic production deployment.

Completed modules:

* Authentication
* Role-based dashboards
* Job posting
* Job browsing
* Job application
* Saved jobs
* Applicant management
* Admin management
* Mobile responsive UI
* PWA setup
* Vercel deployment support

---

## Author

**Ezaz Ahmed Khan**

Project: **Sahayak – Local Job Finder System**

---

## License

This project is created for academic and learning purposes.
