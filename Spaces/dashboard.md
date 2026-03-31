# Dashboard Module Test Plan

## Overview
This test plan covers the Dashboard module of the SG Lite application. The Dashboard serves as the main landing page after login, displaying key business metrics, alerts, and navigation to other modules. The plan includes comprehensive test scenarios for functionality, UI validation, navigation, data validation, edge cases, security, and performance, with enhanced coverage for inventory navigation, search functionality, category filters, Low Stock behavior, Stock Adjustment workflow, and dashboard card navigation. It aligns with Playwright automation best practices using Page Object Model, reusable methods, and stable locators.

## Test Scenarios

### 1. Functional Test Scenarios

#### TC-DASH-001: Dashboard loads successfully after login
- **Priority**: High
- **Steps**:
  1. Navigate to the application login page
  2. Enter valid username and password
  3. Click the "Sign In" button
  4. Wait for page redirection
- **Expected Results**:
  - Dashboard page loads completely
  - All main sections are visible (Summary cards, Shortage Alerts, Action buttons, Recent Production, Upcoming Demand, Active Plans)
  - No console errors in browser
  - Page title contains "Dashboard" or relevant application name

#### TC-DASH-002: Correct redirection to dashboard after authentication
- **Priority**: High
- **Steps**:
  1. Access the application URL directly (bypassing login)
  2. Verify automatic redirection to login page
  3. Perform successful login
- **Expected Results**:
  - User is redirected to `/dashboard` or equivalent dashboard route
  - URL contains dashboard path
  - Dashboard components load immediately after redirection

#### TC-DASH-003: Data is displayed in all summary cards
- **Priority**: High
- **Steps**:
  1. Login and navigate to dashboard
  2. Verify each summary card loads data
  3. Check Total Items card
  4. Check Low Stock card
  5. Check Purchases (Month) card
  6. Check Sales (Month) card
- **Expected Results**:
  - All four summary cards display numeric values
  - Values are non-negative integers
  - Cards show loading states initially, then populate with data
  - No "N/A" or error placeholders in cards

#### TC-DASH-004: Shortage Alerts section displays correct items
- **Priority**: Medium
- **Steps**:
  1. Login to dashboard
  2. Locate Shortage Alerts section
  3. Verify items with low stock are listed
  4. Check item names and quantities
- **Expected Results**:
  - Items with stock below threshold are displayed
  - Each alert shows item name, current stock, and minimum required
  - Alert icon (warning/exclamation) is visible for each item
  - List is scrollable if more than 5 items

#### TC-DASH-005: Recent Production shows latest entries
- **Priority**: Medium
- **Steps**:
  1. Access dashboard after login
  2. Scroll to Recent Production section
  3. Verify production entries are displayed
  4. Check entry details (date, item, quantity)
- **Expected Results**:
  - Latest 5-10 production entries are shown
  - Entries are sorted by date (most recent first)
  - Each entry shows production date, item name, and quantity produced
  - "View All" link is present for full list

#### TC-DASH-006: Active Plans show correct batch details
- **Priority**: Medium
- **Steps**:
  1. Navigate to dashboard
  2. Locate Active Plans section
  3. Verify batch information is displayed
  4. Check plan details (batch ID, item, status, progress)
- **Expected Results**:
  - Active production plans are listed
  - Each plan shows batch ID, item name, status, and completion percentage
  - Progress bars or indicators reflect current status
  - Plans are sorted by priority or start date

#### TC-DASH-007: Upcoming Demand handles empty and filled states
- **Priority**: Medium
- **Steps**:
  1. Login to dashboard
  2. Check Upcoming Demand section
  3. Verify behavior with no upcoming demand
  4. Add demand entries and recheck
- **Expected Results**:
  - Empty state shows "No upcoming demand entries" message
  - Filled state displays demand items with dates and quantities
  - Items are sorted by due date (soonest first)
  - Each entry shows item name, required quantity, and due date

#### TC-DASH-008: Inventory navigation from dashboard
- **Priority**: High
- **Steps**:
  1. Login to dashboard
  2. Click on "Items & BOM" in sidebar or related links
  3. Verify navigation to inventory page
  4. Check inventory list loads
- **Expected Results**:
  - Redirects to `/items` or inventory page
  - Item list displays with stock levels
  - Search and filter options are available
  - Breadcrumb or back navigation to dashboard

#### TC-DASH-009: Search functionality on dashboard
- **Priority**: Medium
- **Steps**:
  1. Access dashboard
  2. Locate search bar (if present)
  3. Enter item name or keyword
  4. Verify search results
- **Expected Results**:
  - Search bar filters visible items
  - Results highlight matching entries
  - No results show appropriate message
  - Search is case-insensitive and partial match

#### TC-DASH-010: Category filters on dashboard sections
- **Priority**: Medium
- **Steps**:
  1. Login to dashboard
  2. Check filter options in sections (e.g., Recent Production, Shortage Alerts)
  3. Apply category filters
  4. Verify filtered results
- **Expected Results**:
  - Filters reduce displayed items by category
  - Selected category shows relevant data
  - "All" option resets to full list
  - Filters persist during session

#### TC-DASH-011: Low Stock behavior and alerts
- **Priority**: High
- **Steps**:
  1. Set items to low stock levels
  2. Load dashboard
  3. Check Low Stock card and Shortage Alerts
  4. Click on low stock alerts
- **Expected Results**:
  - Low Stock card shows accurate count
  - Alerts list specific items with quantities
  - Clicking alerts navigates to stock adjustment
  - Visual indicators (red/warning) for critical stock

#### TC-DASH-012: Stock Adjustment workflow from dashboard
- **Priority**: High
- **Steps**:
  1. Access dashboard with low stock alerts
  2. Click on a shortage alert
  3. Navigate to stock adjustment page
  4. Perform stock adjustment
  5. Return to dashboard and verify update
- **Expected Results**:
  - Alert click redirects to adjustment form
  - Adjustment updates stock levels
  - Dashboard reflects changes after adjustment
  - Confirmation message appears

### 2. UI Validation Scenarios

#### TC-DASH-013: Visibility of all dashboard components
- **Priority**: High
- **Steps**:
  1. Load dashboard page
  2. Verify presence of all major components
  3. Check sidebar navigation
  4. Verify main content areas
- **Expected Results**:
  - Sidebar navigation is visible and expanded
  - Summary cards grid is displayed
  - All sections (Shortage Alerts, Recent Production, etc.) are visible
  - Action buttons are present and enabled

#### TC-DASH-009: Correct labels and values in summary cards
- **Priority**: Medium
- **Steps**:
  1. Access dashboard
  2. Examine each summary card
  3. Verify card titles and data formats
  4. Check value formatting (numbers, currency)
- **Expected Results**:
  - Card titles: "Total Items", "Low Stock", "Purchases (Month)", "Sales (Month)"
  - Values are properly formatted (e.g., currency symbols for monetary values)
  - Icons are displayed correctly for each card type
  - Card layouts are consistent

#### TC-DASH-015: Proper alignment and layout of sections
- **Priority**: Medium
- **Steps**:
  1. Load dashboard on different screen sizes
  2. Check section positioning
  3. Verify responsive behavior
  4. Examine spacing and alignment
- **Expected Results**:
  - Sections are properly aligned in grid layout
  - Cards maintain consistent spacing
  - Content doesn't overflow containers
  - Layout adapts to screen size changes

#### TC-DASH-016: Icons and warning indicators display correctly
- **Priority**: Low
- **Steps**:
  1. Navigate to dashboard
  2. Check Low Stock card icon
  3. Verify Shortage Alerts warning icons
  4. Examine other visual indicators
- **Expected Results**:
  - Warning icons (exclamation triangles) appear for alerts
  - Icons are properly sized and colored
  - Icons enhance but don't replace text information
  - Consistent iconography throughout the dashboard

### 3. Navigation Scenarios

#### TC-DASH-017: Sidebar navigation redirects to correct modules
- **Priority**: High
- **Steps**:
  1. Click each sidebar navigation item
  2. Verify page redirection
  3. Check URL changes
  4. Confirm correct page loads
- **Expected Results**:
  - Dashboard: stays on current page or reloads
  - Daily Entry: redirects to `/daily-entry`
  - Production: redirects to `/production`
  - Purchases: redirects to `/purchases`
  - Sales: redirects to `/sales`
  - Demand: redirects to `/demand`
  - Items & BOM: redirects to `/items`
  - Planner: redirects to `/planner`
  - Business Summary: redirects to `/business-summary`

#### TC-DASH-018: Action buttons and dashboard cards navigate correctly
- **Priority**: High
- **Steps**:
  1. Locate action buttons on dashboard
  2. Click "Log Production" button
  3. Click "Add Purchase" button
  4. Click "Add Sale" button
  5. Click on Low Stock card
  6. Click on Purchases card
  7. Click on Sales card
  8. Verify navigation for each
- **Expected Results**:
  - "Log Production" redirects to production logging page
  - "Add Purchase" redirects to purchase creation form
  - "Add Sale" redirects to sales entry form
  - Low Stock card redirects to stock adjustment or inventory page
  - Purchases card redirects to purchases module
  - Sales card redirects to sales module
  - All buttons and cards open relevant modules/pages

### 4. Data Validation Scenarios

#### TC-DASH-019: Values in cards are numeric and formatted correctly
- **Priority**: Medium
- **Steps**:
  1. Load dashboard with data
  2. Examine each summary card value
  3. Verify number formatting
  4. Check for special characters
- **Expected Results**:
  - All card values are positive numbers
  - Large numbers use appropriate separators (commas)
  - Currency values include proper symbols
  - No invalid characters in numeric fields

#### TC-DASH-020: Data consistency between sections
- **Priority**: Medium
- **Steps**:
  1. Compare data across sections
  2. Check Recent Production vs Active Plans
  3. Verify Shortage Alerts vs Low Stock card
  4. Cross-reference quantities and dates
- **Expected Results**:
  - Production data is consistent between Recent Production and Active Plans
  - Low stock items appear in both Low Stock card and Shortage Alerts
  - Dates and quantities match across related sections
  - No conflicting information displayed

#### TC-DASH-021: Handling of empty states
- **Priority**: Medium
- **Steps**:
  1. Access dashboard with no data
  2. Check each section's empty state
  3. Verify user-friendly messages
  4. Test with partial data
- **Expected Results**:
  - Empty sections show appropriate messages ("No recent production", "No upcoming demand")
  - UI remains stable with no data
  - Empty states are visually distinct but not alarming
  - Sections gracefully handle zero records

### 5. Edge Cases

#### TC-DASH-022: No data in dashboard sections
- **Priority**: Medium
- **Steps**:
  1. Setup test environment with no data
  2. Load dashboard
  3. Verify all sections handle empty data
  4. Check for error handling
- **Expected Results**:
  - Dashboard loads without errors
  - All sections display appropriate empty states
  - Summary cards show zero values or "N/A"
  - No broken images or missing elements

#### TC-DASH-023: High/large data values
- **Priority**: Low
- **Steps**:
  1. Populate database with large numbers
  2. Load dashboard
  3. Check value display formatting
  4. Verify UI handles large values
- **Expected Results**:
  - Large numbers are properly formatted (e.g., 1,000,000)
  - UI layout doesn't break with large values
  - Values remain readable and accurate
  - No overflow or truncation issues

#### TC-DASH-024: Low stock warning scenarios
- **Priority**: Medium
- **Steps**:
  1. Set items to low stock levels
  2. Load dashboard
  3. Check Low Stock card and Shortage Alerts
  4. Verify warning thresholds
- **Expected Results**:
  - Low Stock card shows count of items below threshold
  - Shortage Alerts lists specific items and quantities
  - Warning icons are prominently displayed
  - Critical stock levels trigger appropriate alerts

### 6. Security Scenarios

#### TC-DASH-025: Unauthorized user cannot access dashboard
- **Priority**: High
- **Steps**:
  1. Attempt direct access to dashboard URL without login
  2. Try accessing dashboard with invalid session
  3. Check response for unauthorized access
- **Expected Results**:
  - Direct URL access redirects to login page
  - Invalid sessions are terminated
  - No dashboard data is exposed to unauthorized users
  - Appropriate error messages are displayed

#### TC-DASH-026: Direct URL access redirects to login if not authenticated
- **Priority**: High
- **Steps**:
  1. Open browser in incognito mode
  2. Navigate directly to dashboard URL
  3. Attempt to access dashboard routes
- **Expected Results**:
  - User is redirected to login page
  - URL changes to `/auth` or login route
  - No dashboard content is displayed
  - Login form is presented

### 7. Performance Scenarios

#### TC-DASH-027: Dashboard loads within acceptable time
- **Priority**: Medium
- **Steps**:
  1. Clear browser cache
  2. Login and navigate to dashboard
  3. Measure page load time
  4. Check component rendering time
- **Expected Results**:
  - Dashboard loads within 3 seconds
  - All components render within 5 seconds
  - No long loading spinners (>10 seconds)
  - Page becomes interactive quickly

#### TC-DASH-028: API response time for dashboard data
- **Priority**: Medium
- **Steps**:
  1. Monitor network requests during dashboard load
  2. Check API response times for data endpoints
  3. Verify data loading performance
- **Expected Results**:
  - API responses return within 2 seconds
  - Dashboard data loads efficiently
  - No timeout errors for data requests
  - Cached data loads faster on subsequent visits

## Test Execution Guidelines

### Prerequisites
- Valid user credentials for login
- Test data in database (items, production records, etc.)
- Stable network connection
- Supported browsers (Chrome, Firefox, Safari, Edge)

### Test Data Requirements
- Sample items with various stock levels
- Production records with different dates
- Active production plans
- Upcoming demand entries
- User accounts with appropriate permissions

### Automation Considerations
- Use Page Object Model (POM) for maintainable code with reusable methods
- Implement fixtures for common setup/teardown and data management
- Include explicit waits for dynamic content loading using stable locators (data-testid, role attributes)
- Add screenshot and video capture on failures for debugging
- Use data-driven testing for multiple scenarios with test data parameterization
- Implement proper error handling and reporting with detailed logs
- Follow Playwright best practices: avoid flaky selectors, use semantic locators, handle async operations properly
- Ensure cross-browser compatibility and responsive design testing

### Reporting
- Document test results with screenshots
- Log performance metrics
- Track defects with detailed reproduction steps
- Maintain test execution history</content>
<parameter name="filePath">d:\Test\SGlite\Spaces\dashboard.md