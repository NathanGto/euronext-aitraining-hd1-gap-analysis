# Brent Oil Rates Dashboard - Initial Specification

## Overview

Build a dashboard to display real-time oil prices from the Euronext market. The application should provide users with current market rates and historical trend analysis tools.

---

## Functional Requirements

### 1. Price Display

- Show the current Brent crude oil price in a prominent location on the main page
- Display the price change compared to yesterday (both absolute and percentage)
- Show today's opening price, high, low, and previous day's closing price
- Include market state information (e.g., "OPEN", "CLOSED")
- Currency should be displayed in multiple formats (USD and EUR preferred)

### 2. Historical Data

- Retrieve and display the last 1 year of price history (monthly aggregated data)
- Show a chart visualization of historical prices
- When user hovers over chart, show tooltip with exact values
- Include volume information in the chart
- Data should include open, high, low, close prices for each period

### 3. Real-time Updates

- Automatically refresh prices every 30 seconds
- Support user-configurable refresh intervals (10s, 30s, 60s, 5min options)
- Display a countdown timer showing when the next update will occur
- Show loading indicator while fetching new data

### 4. Multiple Commodity Support

- Allow users to select between different oil types:
  - Brent Crude Oil
  - WTI (West Texas Intermediate)
  - OPEC Basket Price
- Each commodity type should have its own detailed metrics
- Allow comparison view between two different commodities

### 5. Notifications

- Send email alerts when Brent price changes by more than 2%
- Include SMS notifications option (mandatory for premium features)
- Implement in-app toast notifications for errors or updates
- Create user preferences page to manage notification settings

### 6. Data Export

- Allow users to export price data to CSV format (last 3 months default)
- Support Excel export with formatting
- Generate PDF reports with charts and analysis

### 7. Authentication & User Accounts

- User registration and login system using email
- Store user preferences and notification settings
- Implement password recovery via email
- Support OAuth2 integration with Google and GitHub

### 8. Database

- Store all historical prices in a local database
- Cache API responses to reduce external API calls
- Implement data refresh mechanism to update cache every 15 minutes
- Support offline viewing of cached data

### 9. Mobile Responsiveness

- Design must work on mobile devices (screens below 768px)
- Touch-friendly interface with larger buttons
- Swipe gestures for chart navigation
- Mobile app version (iOS and Android)

### 10. Performance & Reliability

- Page should load in less than 2 seconds
- Charts should render smoothly even with 2+ years of data
- Implement service worker for offline functionality
- Error handling with graceful fallbacks

---

## Technical Requirements

### Frontend

- React.js with TypeScript
- Tailwind CSS for styling
- Chart library for visualizations (Chart.js or Recharts recommended)
- State management with Redux or Zustand

### Backend

- Node.js with Express.js
- PostgreSQL database with Sequelize ORM
- Redis for caching with 15-minute TTL
- Docker containerization

### Data Sources

- Primary: Euronext API for official Brent prices
- Fallback: Yahoo Finance API if Euronext is unavailable
- Daily OPEC Basket data from OPEC official website

### API Design

- RESTful API with JSON responses
- Implement rate limiting (100 requests per minute per IP)
- API versioning (/v1/, /v2/)
- WebSocket support for real-time price streaming

### Deployment

- Deploy to AWS EC2 or Heroku
- CI/CD pipeline using GitHub Actions
- Automated testing (Jest, Cypress)
- Monitoring and logging with Sentry

---

## UI/UX Specifications

### Layout

- Header with logo, navigation menu, and user account
- Sidebar with commodity selection filters
- Main dashboard with large price display card
- Secondary panels showing market metrics and analytics
- Footer with links to data sources and legal information

### Color Scheme

- Primary color: Dark blue (#1a3a52)
- Secondary color: Gold/Yellow (#D4AF37) for highlights
- Green for positive changes, Red for negative
- Light background with dark text for accessibility

### Components

- Price card component with current rate and change indicator
- Interactive candlestick chart for OHLC data
- Metrics panel showing high/low/open/close/volume
- News feed widget showing related financial news
- Settings panel for user preferences

---

## Timeline & Deliverables

**Phase 1 (Week 1-2):** Basic UI setup, initial price display
**Phase 2 (Week 3-4):** Historical data and charts
**Phase 3 (Week 5-6):** Real-time updates and refresh mechanism
**Phase 4 (Week 7-8):** Database setup and caching
**Phase 5 (Week 9+):** Authentication, notifications, and advanced features

---

## Notes

- Some features may be deprioritized based on scope and timeline
- API endpoints may change based on actual Euronext API documentation
- Mobile support could be deferred to Phase 2
- Database schema should be flexible to support additional commodities later
- Testing coverage should be at least 70% for critical paths
