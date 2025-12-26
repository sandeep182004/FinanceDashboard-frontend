# Customizable Finance Dashboard - Frontend

Production-quality Next.js frontend for a customizable finance dashboard with stock widgets.

## 🏗️ Architecture

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── dashboard/         # Dashboard orchestration components
│   ├── widgets/           # Finance-specific widgets (FinanceCard, LineChart)
│   ├── common/            # Reusable UI patterns (Modal, ErrorBoundary)
│   └── ui/                # Base UI components (Button, Input, Card)
├── store/                 # Zustand store for state management
├── services/              # API integration (axios client, stock service)
├── hooks/                 # Custom React hooks (useAutoRefresh, useWidget)
├── types/                 # TypeScript type definitions
└── utils/                 # Helper utilities (localStorage)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Backend server running at `NEXT_PUBLIC_BACKEND_URL`

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
# Edit .env.local and set your backend URL
# NEXT_PUBLIC_BACKEND_URL=http://your-backend-url:port

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Key Features

### State Management
- **Zustand Store** (`store/widgetStore.ts`): Single source of truth
- **Automatic Persistence**: All widgets and layout saved to localStorage
- **Hydration**: Widgets restored on page reload

### Widget Types
1. **Finance Card**: Displays current price, change %, and auto-refresh
2. **Line Chart**: Shows historical price data (30-day default)

### Widget Capabilities
- ✅ Add/remove widgets dynamically
- ✅ Rename widgets
- ✅ Configurable auto-refresh intervals
- ✅ Manual refresh button
- ✅ Error states and loading indicators
- ✅ Persistent layout (localStorage)

### UI Components
- Responsive Tailwind CSS styling
- Error boundaries for graceful error handling
- Loading spinners for async operations
- Modal for widget creation
- Button and input components

## 🔧 Configuration

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

### Customizable Settings
- Widget grid columns (default: 3)
- Widget grid gap (default: 4 - Tailwind spacing)
- Widget refresh intervals (minimum 5000ms)
- Widget types (extensible)

## 📡 API Integration

### Expected Backend Endpoints

**Get Stock Quote:**
```
GET /api/proxy/alpha/quote?symbol=AAPL
Response: {
  symbol: string,
  price: number,
  change: number,
  changePercent: number,
  timestamp: number
}
```

**Get Historical Prices:**
```
GET /api/proxy/alpha/history?symbol=AAPL&days=30
Response: Array<{
  timestamp: number,
  price: number
}>
```

## 🎨 Styling

- **Framework**: Tailwind CSS v3
- **Colors**: Blue (#2563eb), Gray palette, Red for negatives
- **Responsive**: Mobile-first, adapts to all screen sizes

## 🔄 Data Flow

```
User Action
    ↓
Zustand Store
    ↓
localStorage.setItem()
    ↓
Component Re-render
    ↓
API Call (async)
    ↓
Display Data
```

## 📝 Component Responsibilities

### Store (`store/widgetStore.ts`)
- Manages widget CRUD operations
- Handles layout configuration
- Persists state to localStorage
- Provides hydration on mount

### Services (`services/`)
- **api.ts**: Axios instance with BASE_URL configuration
- **stockService.ts**: Stock API wrappers (quote, history)

### Hooks (`hooks/`)
- **useAutoRefresh.ts**: Handles interval-based refresh logic
- **useWidget.ts**: Widget-specific state and actions

### Dashboard (`components/dashboard/`)
- **Dashboard.tsx**: Main component, orchestrates hydration
- **WidgetActions.tsx**: Add widget modal and form
- **WidgetGrid.tsx**: Grid layout and empty state

### Widgets (`components/widgets/`)
- **FinanceCard.tsx**: Price display widget
- **LineChart.tsx**: Historical price chart
- **Widget.tsx**: Router to correct widget type

## ✨ Best Practices

1. **Type Safety**: Full TypeScript throughout
2. **Component Isolation**: Small, focused, testable components
3. **State Colocation**: Store only lives in Zustand
4. **Error Handling**: Graceful fallbacks and error boundaries
5. **Performance**: Memoized selectors, conditional rendering
6. **Accessibility**: Semantic HTML, ARIA labels where needed

## 🚦 Development Tips

### Adding a New Widget Type
1. Create widget component in `components/widgets/`
2. Add type to `Widget` interface in `store/types.ts`
3. Update `WidgetContainer.tsx` switch statement
4. Update `WidgetActions.tsx` form options

### Customizing Styling
- Edit `tailwind.config.ts` for colors and spacing
- All Tailwind classes available out of the box
- Component styles in individual files

### Debugging
- Check browser console for API errors
- localStorage contents visible in DevTools
- Zustand store accessible in console: `import { useWidgetStore } from '@/store/widgetStore'`

## 📦 Dependencies

- **next**: v15 - React framework with App Router
- **react**: v19 - UI library
- **zustand**: v4 - Lightweight state management
- **axios**: v1.7 - HTTP client
- **recharts**: v2.15 - React charting library
- **tailwindcss**: v3.4 - Utility CSS framework

## 🛠️ Building for Production

```bash
# Build optimized bundle
npm run build

# Start production server
npm start

# Type checking
npm run type-check
```

## 📄 License

Production code - use as needed for your project.
