# ADE Donor Management System - Setup Guide

## Backend Setup (Already Deployed on Render)

Your backend is already running on Render at: `https://adebackend.onrender.com`

### MongoDB Connection
Connected to MongoDB Atlas:
- URI: `mongodb+srv://ADEDatabase:KH3D48RAnFZVGJc1@adebackend.4vnexk2.mongodb.net/adebackend`
- Database: `adebackend`

### API Endpoints

The backend now includes these donor management endpoints:

#### Budgets
- `GET /api/budgets` - Get all budgets
- `GET /api/budgets/:id` - Get budget by ID
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

#### Programs
- `GET /api/programs` - Get all programs
- `GET /api/programs/:id` - Get program by ID
- `POST /api/programs` - Create new program
- `PUT /api/programs/:id` - Update program
- `DELETE /api/programs/:id` - Delete program

#### Expenses
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/:id` - Get expense by ID
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

#### Reports
- `GET /api/reports` - Get all reports
- `GET /api/reports/:id` - Get report by ID
- `POST /api/reports` - Create new report
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report

### Seeding the Database

To populate the database with sample data:

```bash
cd /home/nomad40/Barebohnzdevandconsulting/ADE/adebackend
npm run seed:donor
```

This will create sample:
- 4 budgets
- 5 programs
- 7 expenses
- 4 reports

## Frontend Setup

### Install Dependencies

```bash
cd /home/nomad40/Barebohnzdevandconsulting/ADE/adedonormanagementsystem
npm install
```

### Environment Configuration

The frontend is configured to connect to your backend:

**Development (.env):**
```
VITE_API_URL=https://adebackend.onrender.com/api
```

**Production (.env.production):**
```
VITE_API_URL=https://adebackend.onrender.com/api
```

### Run the Frontend

**Development:**
```bash
npm run dev
```

**Build for Production:**
```bash
npm run build
```

### Deploy to Render

Your frontend can be deployed to Render as a static site:

1. Push your code to GitHub
2. Connect Render to your GitHub repository
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variable: `VITE_API_URL=https://adebackend.onrender.com/api`

## Testing the Integration

1. Start the backend (already running on Render)
2. Seed the database: `npm run seed:donor`
3. Start the frontend: `npm run dev`
4. Navigate to: http://localhost:5173
5. Login (any credentials work for now)
6. Go to Dashboard - it will load data from MongoDB!

## Features Implemented

✅ Backend API with Express + TypeScript
✅ MongoDB integration with Mongoose
✅ CRUD operations for all resources
✅ Frontend API service layer
✅ Dashboard loading live data from MongoDB
✅ Environment configuration for dev/prod
✅ Sample data seeding script

## Next Steps

- Update other pages (Budgets, Programs, Expenses, Reports) to use the API
- Add authentication/authorization
- Add form validation
- Add loading states and error handling
- Deploy frontend to Render
