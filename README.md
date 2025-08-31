# Expense Tracker

A modern, responsive expense tracking web application built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Dashboard**: Overview of expenses with charts and statistics
- **Salary Tracking**: Set and manage monthly salary for budget comparison
- **Yearly Expense Chart**: 12-month bar chart showing expenses vs salary
- **Add Expenses**: Easy-to-use form for adding new expenses
- **Expense Management**: View, edit, and delete expenses
- **Categories**: Pre-defined expense categories with icons
- **Search & Filter**: Find expenses by title, description, or category
- **Light/Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop and mobile devices
- **Charts**: Visual representation of spending by category and time

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form
- **Date Handling**: date-fns

## Project Structure

```
expense-tracker/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── expenses/      # Expense CRUD operations
│   │   │   ├── categories/    # Category management
│   │   │   └── stats/         # Statistics endpoint
│   │   ├── dashboard/         # Dashboard page
│   │   ├── expenses/          # Expense management pages
│   │   │   ├── add/          # Add expense page
│   │   │   └── [id]/edit/    # Edit expense page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/            # Reusable components
│   │   ├── ExpenseForm.tsx    # Form for adding/editing expenses
│   │   ├── ExpenseList.tsx    # List of expenses with sorting
│   │   ├── ExpenseChart.tsx   # Charts for expense visualization
│   │   └── Navigation.tsx     # Main navigation component
│   ├── lib/                   # Utility functions and data
│   │   ├── data.ts           # Mock data storage (replace with DB)
│   │   └── utils.ts          # Helper functions
│   └── types/                 # TypeScript type definitions
│       └── index.ts          # Shared types
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:3000`

## API Endpoints

- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/[id]` - Get expense by ID
- `PUT /api/expenses/[id]` - Update expense
- `DELETE /api/expenses/[id]` - Delete expense
- `GET /api/categories` - Get all categories
- `GET /api/stats` - Get expense statistics

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Customization

### Adding New Categories

Edit the `categories` array in `src/lib/data.ts` to add new expense categories with custom icons and colors.

### Database Integration

Replace the mock data storage in `src/lib/data.ts` with your preferred database solution (PostgreSQL, MongoDB, etc.).

### Styling

Customize the design by modifying the Tailwind configuration in `tailwind.config.js` or updating the component styles.

## Future Enhancements

- User authentication and multi-user support
- Budget planning and alerts
- Expense import/export functionality
- Recurring expense tracking
- Advanced reporting and analytics
- Mobile app version

## License

MIT License
