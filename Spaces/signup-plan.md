# Playwright Test Plan: Signup (Registration) Module

## Overview
This test plan provides comprehensive coverage for the Signup/Registration module of the SG Lite application. Tests are designed using Playwright with Page Object Model pattern, fixtures, and proper assertions.

## Test Environment Setup
- **Base URL**: `https://sglite.lovable.app`
- **Test Data**: Environment variables for credentials
- **Fixtures**: `signUpPage`, `loginPage`, `page`
- **Timeouts**: 10s for UI elements, 15s for navigation, 60s for page loads

---

## 1. POSITIVE TEST SCENARIOS

### 1.1 Successful Signup Flows

#### TC-SIGNUP-POS-001: Successful signup with valid new email and password
- **Pre-condition**: User is on `/auth` page
- **Steps**:
  1. Click "Sign Up" button to open signup form
  2. Enter valid new email (e.g., `testuser_<timestamp>@example.com`)
  3. Enter valid password (e.g., `Password123!`)
  4. Click "Sign Up" button
- **Expected Results**:
  - Page redirects to `/` (dashboard) or success page
  - User is authenticated (session token in localStorage)
  - Dashboard/home page displays with user data
  - No error messages visible
- **Priority**: Critical

#### TC-SIGNUP-POS-002: Signup with different valid email formats
- **Test Cases**:
  - Email with `+` sign: `user+tag@example.com`
  - Email with subdomain: `user@mail.example.co.uk`
  - Email with numbers: `user123@example.com`
  - Email with hyphens: `user-name@example.com`
- **Expected Results**:
  - All valid formats accepted
  - Signup completes successfully
  - Session created
- **Priority**: High

#### TC-SIGNUP-POS-003: Navigate to login after signup
- **Steps**:
  1. Complete successful signup (TC-SIGNUP-POS-001)
  2. Verify user is logged in
  3. (Optional) Log out and verify able to login with new credentials
- **Expected Results**:
  - Login works with newly created account
  - Email and password accepted
  - Dashboard loads
- **Priority**: Medium

#### TC-SIGNUP-POS-004: Signup form UI displays correctly
- **Steps**:
  1. Navigate to `/auth`
  2. Click "Sign Up" button
  3. Observe form elements
- **Expected Results**:
  - Page heading shows "Sign up"
  - All input fields visible:
    - Email input field
    - Password input field
    - Confirm Password input field (if applicable)
  - Sign Up button visible and enabled
  - Sign In link visible for navigation
- **Priority**: High

---

## 2. NEGATIVE TEST SCENARIOS

### 2.1 Invalid Input Handling

#### TC-SIGNUP-NEG-001: Empty email field
- **Steps**:
  1. Leave email field blank
  2. Fill password field
  3. Click Sign Up
- **Expected Results**:
  - Email field shows validation error
  - Form does not submit
  - Page remains on `/auth`
- **Priority**: High

#### TC-SIGNUP-NEG-002: Empty password field
- **Steps**:
  1. Fill email field with valid email
  2. Leave password field blank
  3. Click Sign Up
- **Expected Results**:
  - Password field shows validation error
  - Form does not submit
  - Page remains on `/auth`
- **Priority**: High

#### TC-SIGNUP-NEG-003: Both fields empty
- **Steps**:
  1. Leave both email and password blank
  2. Click Sign Up
- **Expected Results**:
  - Both fields show validation errors
  - Form does not submit
  - Error messages visible
- **Priority**: High

#### TC-SIGNUP-NEG-004: Invalid email format (missing @)
- **Steps**:
  1. Enter email: `testexample.com` (no @)
  2. Enter valid password
  3. Click Sign Up
- **Expected Results**:
  - Email field shows HTML5 validation error
  - Form does not submit
  - Page remains on `/auth`
- **Priority**: High

#### TC-SIGNUP-NEG-005: Invalid email format (missing domain)
- **Steps**:
  1. Enter email: `test@` 
  2. Enter valid password
  3. Click Sign Up
- **Expected Results**:
  - Email field shows validation error
  - Form does not submit
- **Priority**: High

#### TC-SIGNUP-NEG-006: Invalid email format (email with spaces)
- **Steps**:
  1. Enter email: `test user@example.com` (space in local part)
  2. Enter valid password
  3. Click Sign Up
- **Expected Results**:
  - Email validation fails
  - Form does not submit
- **Priority**: Medium

#### TC-SIGNUP-NEG-007: Already registered email
- **Steps**:
  1. Enter email of existing user (`testData.validUser.email`)
  2. Enter valid password
  3. Click Sign Up
- **Expected Results**:
  - Error message displays: "Email already exists" or "Email already registered"
  - Form does not submit
  - Page remains on `/auth`
- **Priority**: Critical

#### TC-SIGNUP-NEG-008: Weak/short password
- **Steps**:
  1. Enter valid email
  2. Enter short password (e.g., `123`, `abc`)
  3. Click Sign Up
- **Expected Results**:
  - Password field shows validation error
  - Error message indicates minimum length requirement
  - Form does not submit
- **Priority**: High

#### TC-SIGNUP-NEG-009: Password with only special characters
- **Steps**:
  1. Enter valid email
  2. Enter password: `!@#$%^&*()`
  3. Click Sign Up
- **Expected Results**:
  - Form either rejects due to password policy or accepts
  - If rejected: error message visible
  - If accepted: signup proceeds (per password policy)
- **Priority**: Medium

#### TC-SIGNUP-NEG-010: Mismatched confirm password (if applicable)
- **Steps**:
  1. Enter valid email
  2. Enter password: `Password123!`
  3. Enter confirm password: `Password456!` (different)
  4. Click Sign Up
- **Expected Results**:
  - Error message: "Passwords do not match"
  - Form does not submit
- **Priority**: High

---

## 3. VALIDATION CHECKS

### 3.1 Email Field Validation

#### TC-VALIDATION-EMAIL-001: HTML5 email format validation
- **Invalid inputs to test**:
  - `user@` (missing domain)
  - `user` (missing @ and domain)
  - `@example.com` (missing local part)
  - `user @example.com` (space before @)
  - `user@example` (missing TLD)
- **Expected Results**:
  - Browser HTML5 validation prevents submission
  - Validation message displayed
- **Priority**: High

#### TC-VALIDATION-EMAIL-002: Valid email formats
- **Valid inputs to test**:
  - `user@example.com`
  - `user+tag@example.com`
  - `user.name@example.com`
  - `user123@example.co.uk`
- **Expected Results**:
  - All formats pass validation
  - Form accepts input
- **Priority**: High

#### TC-VALIDATION-EMAIL-003: Email validation message
- **Steps**:
  1. Enter invalid email
  2. Try to submit
- **Expected Results**:
  - `getEmailValidationMessage()` returns browser message
  - Message is user-friendly
- **Priority**: Medium

#### TC-VALIDATION-EMAIL-004: Case insensitivity
- **Steps**:
  1. Enter email: `USER@EXAMPLE.COM`
  2. Create account
  3. Attempt login with lowercase: `user@example.com`
- **Expected Results**:
  - Signup accepts mixed case
  - Login works with different case (case-insensitive)
- **Priority**: Low

### 3.2 Password Field Validation

#### TC-VALIDATION-PWD-001: Minimum length requirement
- **Steps**:
  1. Enter valid email
  2. Enter password below minimum length (e.g., `Pass1`  if minimum is 8)
  3. Click Sign Up
- **Expected Results**:
  - Password field shows validation error
  - Error message indicates minimum length
  - Form does not submit
- **Priority**: High

#### TC-VALIDATION-PWD-002: Password strength requirements
- **Test different combinations**:
  - Uppercase only: `PASSWORD`
  - Lowercase only: `password`
  - Numbers only: `12345678`
  - Special chars only: `!@#$%^&*`
  - Mixed valid: `Password123!`
- **Expected Results**:
  - Password policy enforced
  - Valid combinations accepted
  - Invalid combinations rejected with message
- **Priority**: High

#### TC-VALIDATION-PWD-003: Password masking
- **Steps**:
  1. Type password in password field
  2. Observe field behavior
- **Expected Results**:
  - Input type is `password`
  - Characters shown as dots/asterisks, not plain text
  - Value not visible in DOM
- **Priority**: High

#### TC-VALIDATION-PWD-004: Password length limits
- **Test cases**:
  - Very long password (1000+ characters)
  - Moderate password (50 characters)
- **Expected Results**:
  - Server accepts and handles gracefully
  - No buffer overflow or crashes
- **Priority**: Low

### 3.3 Error Message Validation

#### TC-VALIDATION-ERR-001: Email already exists error
- **Steps**:
  1. Enter email of existing user
  2. Enter valid password
  3. Click Sign Up
- **Expected Results**:
  - Error message displays immediately or after request
  - Message is clear: "Email already exists" or "Email already registered"
  - Message appears in alert/toast/inline element
  - User remains on signup page
- **Priority**: Critical

#### TC-VALIDATION-ERR-002: Invalid input error messages
- **Test different invalid inputs and validate**:
  - Empty field → "This field is required"
  - Invalid email → "Please enter a valid email"
  - Short password → "Password must be at least X characters"
  - Mismatched passwords → "Passwords do not match"
- **Expected Results**:
  - All error messages are user-friendly
  - Messages appear near relevant fields
- **Priority**: High

#### TC-VALIDATION-ERR-003: Server error handling
- **Steps**:
  1. Intercept signup API response
  2. Simulate server error (500)
  3. Verify error handling
- **Expected Results**:
  - User-friendly error message displayed
  - No technical error leak to UI
  - Form remains usable
- **Priority**: Medium

---

## 4. UI TEST SCENARIOS

### 4.1 Form Elements Visibility

#### TC-UI-ELEMENTS-001: All signup form fields visible
- **Expected Results**:
  - `pageHeading` ("Sign Up") visible
  - `emailInput` field visible with label
  - `passwordInput` field visible with label
  - `confirmPasswordInput` field visible (if applicable)
  - `signUpButton` visible
  - `signInButton` visible
- **Priority**: Critical

#### TC-UI-ELEMENTS-002: Form layout responsive
- **Test viewports**:
  - Mobile: 375x667
  - Tablet: 768x1024
  - Desktop: 1920x1080
- **Expected Results**:
  - All fields visible and accessible
  - No overlapping elements
  - Proper spacing maintained
- **Priority**: Medium

### 4.2 Button States and Interactions

#### TC-UI-BUTTONS-001: Sign Up button enabled by default
- **Steps**:
  1. Navigate to signup form
  2. Observe button state
- **Expected Results**:
  - `signUpButton` is enabled
  - Button is clickable
  - No disabled state on load
- **Priority**: High

#### TC-UI-BUTTONS-002: Sign In button navigation
- **Steps**:
  1. Click "Sign In" button on signup form
  2. Verify navigation
- **Expected Results**:
  - Page navigates to login form on same `/auth` page
  - Login form displays
  - Signup form hidden/replaced
- **Priority**: Medium

#### TC-UI-BUTTONS-003: Button loading state (if applicable)
- **Steps**:
  1. Fill form and click Sign Up
  2. Observe button during request
- **Expected Results**:
  - Button shows loading indicator (spinner, text change)
  - Button is disabled during request
  - Button re-enables after response
- **Priority**: Low

### 4.3 Input Field Behavior

#### TC-UI-INPUT-001: Placeholder text visible
- **Expected Results**:
  - Email field: placeholder or label "Email" visible
  - Password field: placeholder or label "Password" visible
  - Confirm password: "Confirm Password" visible
- **Priority**: Medium

#### TC-UI-INPUT-002: Focus management
- **Steps**:
  1. Load signup form
  2. Check initial focus
  3. Tab through fields
- **Expected Results**:
  - Email field receives initial focus (optional, depends on design)
  - Tab order: email → password → confirm password → button
  - All fields focusable via keyboard
- **Priority**: Medium

#### TC-UI-INPUT-003: Input field is enabled
- **Expected Results**:
  - All input fields enabled by default
  - User can type in fields
  - No readonly attributes
- **Priority**: High

---

## 5. EDGE CASES

### 5.1 Input Boundary Testing

#### TC-EDGE-INPUT-001: Very long email address
- **Input**: Email address 254+ characters (max allowed)
- **Expected Results**:
  - Form handles gracefully
  - Either accepts or rejects with validation message
  - No crash or buffer overflow
- **Priority**: Low

#### TC-EDGE-INPUT-002: Extremely long password
- **Input**: 1024+ character password
- **Expected Results**:
  - Server handles without crashing
  - Response time acceptable
  - Form behaves normally
- **Priority**: Low

#### TC-EDGE-INPUT-003: Very long name (if name field exists)
- **Input**: 500+ character name
- **Expected Results**:
  - Form handles gracefully
  - Truncated or validated appropriately
- **Priority**: Low

### 5.2 Special Characters and Encoding

#### TC-EDGE-SPECIAL-001: Password with special characters
- **Input**: `P@ss!#$%^&*w0rd`
- **Expected Results**:
  - Password accepts all special characters
  - Form processes correctly
  - Characters not escaped incorrectly
- **Priority**: Medium

#### TC-EDGE-SPECIAL-002: Email with special characters
- **Valid inputs**:
  - `user+tag@example.com`
  - `user.name@example.com`
  - `user_name@example.com`
- **Expected Results**:
  - All valid formats accepted
  - Form processes correctly
- **Priority**: Medium

#### TC-EDGE-SPECIAL-003: Unicode characters in password
- **Input**: Password with emojis/unicode: `P@ss🚀2026!`
- **Expected Results**:
  - Accepted or rejected based on policy
  - No encoding issues
- **Priority**: Low

#### TC-EDGE-SPECIAL-004: Unicode in email domain
- **Input**: International email: `user@例子.测试`
- **Expected Results**:
  - Handled according to internationalization policy
  - No corrupted output
- **Priority**: Low

### 5.3 Rapid/Multiple Submissions

#### TC-EDGE-RAPID-001: Double-click Sign Up button
- **Steps**:
  1. Fill form with valid data
  2. Double-click Sign Up button
  3. Verify only one account created
- **Expected Results**:
  - Only one signup request sent
  - Only one account created
  - No duplicate processing
- **Priority**: Medium

#### TC-EDGE-RAPID-002: Multiple rapid signup attempts
- **Steps**:
  1. Attempt signup with same email multiple times rapidly
  2. Monitor network requests
- **Expected Results**:
  - Rate limiting applied (if applicable)
  - Or only first request processes
  - No duplicate accounts
- **Priority**: Low

---

## 6. SECURITY SCENARIOS

### 6.1 Password Security

#### TC-SECURITY-PWD-001: Password field masking
- **Steps**:
  1. Type password in password field
  2. Inspect field in browser DevTools
- **Expected Results**:
  - Input type attribute is `password`
  - Value attribute not visible/accessible
  - Characters displayed as dots/asterisks
- **Priority**: Critical

#### TC-SECURITY-PWD-002: Password not visible in DOM
- **Steps**:
  1. Enter password and submit form
  2. Check network tab - POST request payload
- **Expected Results**:
  - Password encrypted in transit (HTTPS)
  - No plain text password in page source
  - No password logged in console
- **Priority**: High

#### TC-SECURITY-PWD-003: Password not in error messages
- **Steps**:
  1. Submit with wrong password (if testing)
  2. Observe error message
- **Expected Results**:
  - Error messages do not contain password
  - Error messages are generic and safe
- **Priority**: High

### 6.2 Account Security

#### TC-SECURITY-ACC-001: Duplicate email prevention
- **Steps**:
  1. Signup with email A
  2. Attempt signup again with email A
- **Expected Results**:
  - Second signup rejected
  - Error message: "Email already registered"
  - Only one account exists
- **Priority**: Critical

#### TC-SECURITY-ACC-002: Unauthorized access after signup
- **Steps**:
  1. Complete signup
  2. Log out
  3. Try accessing `/dashboard` without login
- **Expected Results**:
  - Redirect to `/auth`
  - Must login before accessing dashboard
- **Priority**: High

### 6.3 Session and Token Security

#### TC-SECURITY-SESSION-001: Auth token created after signup
- **Steps**:
  1. Complete signup
  2. Check localStorage for auth token
- **Expected Results**:
  - Token exists: `localStorage.getItem('sglite-auth-token')`
  - Token is non-empty string
  - Token is valid JWT (if applicable)
- **Priority**: High

#### TC-SECURITY-SESSION-002: Token not exposed in URLs/logs
- **Steps**:
  1. Complete signup
  2. Check URL bar
  3. Check browser console
- **Expected Results**:
  - URL does not contain token/credentials
  - Console does not log sensitive data
- **Priority**: Medium

#### TC-SECURITY-SESSION-003: HTTPS enforcement
- **Steps**:
  1. Observe signup request in network
- **Expected Results**:
  - All requests use HTTPS
  - No HTTP fallback
- **Priority**: High

---

## 7. PERFORMANCE SCENARIOS

### 7.1 Response Time Testing

#### TC-PERF-RESPONSE-001: Signup API response time
- **Steps**:
  1. Record timestamp before clicking Sign Up
  2. Wait for API response
  3. Record timestamp
  4. Calculate elapsed time
- **Expected Results**:
  - Response time < 3 seconds
  - Average response time < 1.5 seconds
  - No timeouts
- **Priority**: High

#### TC-PERF-RESPONSE-002: Page load time for signup form
- **Steps**:
  1. Measure time to load `/auth` page
  2. Verify signup form interactive
- **Expected Results**:
  - Page fully loaded < 5 seconds
  - Form interactive < 3 seconds
  - No blocking resources
- **Priority**: Medium

#### TC-PERF-RESPONSE-003: Redirect to dashboard after signup
- **Steps**:
  1. Complete signup
  2. Measure time to dashboard interactive state
- **Expected Results**:
  - Redirect happens < 2 seconds after API success
  - Dashboard fully loaded < 10 seconds
- **Priority**: Medium

### 7.2 Network Condition Testing

#### TC-PERF-NETWORK-001: Slow network (throttled 2G)
- **Steps**:
  1. Enable Chrome DevTools throttling: 2G
  2. Complete signup flow
- **Expected Results**:
  - Form remains usable
  - Error handling graceful
  - No crashes
  - Timeout message if applicable
- **Priority**: Medium

#### TC-PERF-NETWORK-002: Intermittent connectivity
- **Steps**:
  1. Simulate network on/off during signup
- **Expected Results**:
  - Appropriate error message
  - User can retry
  - No orphaned requests
- **Priority**: Medium

#### TC-PERF-NETWORK-003: Timeout handling
- **Steps**:
  1. Set API request timeout to 1 second
  2. Attempt signup
- **Expected Results**:
  - Timeout error message displayed
  - Clear message to user
  - Form remains usable for retry
- **Priority**: High

### 7.3 Resource Usage

#### TC-PERF-RESOURCE-001: Memory usage during signup
- **Steps**:
  1. Monitor memory consumption
  2. Complete signup flow
  3. Check memory after completion
- **Expected Results**:
  - No excessive memory consumption
  - Memory released after navigation
  - No memory leaks
- **Priority**: Low

#### TC-PERF-RESOURCE-002: CPU usage during form interaction
- **Steps**:
  1. Monitor CPU usage
  2. Type in fields
  3. Interact with form
- **Expected Results**:
  - Smooth 60 FPS interaction
  - No CPU spikes
  - CPU returns to baseline after interaction
- **Priority**: Low

---

## 8. ACCESSIBILITY TESTING (Optional)

### 8.1 Keyboard Navigation

#### TC-A11Y-KEYBOARD-001: Tab through form fields
- **Steps**:
  1. Load signup form
  2. Press Tab repeatedly
  3. Verify order of focus
- **Expected Results**:
  - Logical tab order: email → password → confirm password → button
  - All interactive elements focusable
  - Focus indicator visible
- **Priority**: Medium

#### TC-A11Y-KEYBOARD-002: Enter key submission
- **Steps**:
  1. Fill form with valid data
  2. Press Enter in password field or button
- **Expected Results**:
  - Form submits
  - Signup completes
- **Priority**: Medium

#### TC-A11Y-KEYBOARD-003: Escape key behavior
- **Steps**:
  1. Fill form partially
  2. Press Escape
- **Expected Results**:
  - Modal closes (if applicable) or graceful handling
  - Or no action taken (depends on design)
- **Priority**: Low

### 8.2 Screen Reader Support

#### TC-A11Y-SCREENREADER-001: Form labels announced
- **Steps**:
  1. Use screen reader (NVDA/JAWS)
  2. Navigate form
- **Expected Results**:
  - Each field has associated label
  - Labels announced to screen reader user
  - Input purpose clear
- **Priority**: Medium

#### TC-A11Y-SCREENREADER-002: Error announcements
- **Steps**:
  1. Submit form with invalid data
  2. Listen for error announcements
- **Expected Results**:
  - Error messages announced
  - Error location communicated
  - User knows what to fix
- **Priority**: Medium

#### TC-A11Y-SCREENREADER-003: Button purpose
- **Steps**:
  1. Navigate to Sign Up button
  2. Listen to announcement
- **Expected Results**:
  - Button text/label clearly announced
  - Button purpose understood
  - Loading state announced during submission
- **Priority**: Low

### 8.3 Color Contrast

#### TC-A11Y-CONTRAST-001: Form labels contrast
- **Expected Results**:
  - Labels meet WCAG AA standard (4.5:1 ratio)
  - Text readable against background
- **Priority**: Medium

#### TC-A11Y-CONTRAST-002: Error/success message contrast
- **Expected Results**:
  - Error messages (red) have sufficient contrast
  - Success messages (green) have sufficient contrast
  - Not relying only on color
- **Priority**: Medium

---

## 9. TEST AUTOMATION STRUCTURE

### 9.1 Test File Organization

```
tests/auth/
├── signup-positive.spec.ts     # Successful signup scenarios
├── signup-negative.spec.ts     # Invalid input handling
├── signup-validation.spec.ts   # Email, password validation
├── signup-ui.spec.ts          # UI/UX specific tests
├── signup-security.spec.ts    # Security-focused tests
├── signup-performance.spec.ts # Performance tests
└── signup-accessibility.spec.ts # A11y tests
```

### 9.2 Page Objects

- **SignUpPage.ts**:
  - `goto()`, `signUp()`, `getSignUpPageHeading()`
  - `emailInput`, `passwordInput`, `confirmPasswordInput`
  - `signUpButton`, `signInButton`
  - `isEmailInvalid()`, `isPasswordInvalid()`
  - `getEmailValidationMessage()`, `getPasswordValidationMessage()`
  - `getErrorMessage()`

- **LoginPage.ts**:
  - Used to test "Sign In" link from signup
  - `getAuthToken()` for session verification

- **DashboardPage.ts**:
  - Used to verify post-signup redirect

### 9.3 Test Data Management

- **utils/testData.ts**:
  - `validUser`: existing email and password
  - `newUser`: password for new signup accounts
  - Dynamic email generation: `testuser_<timestamp>@example.com`

- **Fixtures**: `signUpPage`, `page`, `loginPage`, `dashboardPage`

### 9.4 Reporting and CI/CD

- HTML reports with screenshots
- Video recordings for failed tests
- Parallel execution (4 workers)
- Test results in `test-results/`
- CI integration with GitHub Actions

---

## 10. TEST EXECUTION STRATEGY

### 10.1 Smoke Tests

- **TC-SIGNUP-POS-001**: Basic successful signup
- **TC-SIGNUP-NEG-007**: Duplicate email handling
- **TC-UI-ELEMENTS-001**: Form visibility

### 10.2 Regression Tests

- All critical and high priority tests
- Cross-browser execution (Chrome, Firefox, Safari)
- Mobile responsiveness validation

### 10.3 Maintenance

- **Weekly**: Full suite execution
- **Bi-weekly**: Cross-browser validation
- **Monthly**: Performance baseline updates

---

## 11. RISK ASSESSMENT

### 11.1 High Risk Areas

- Account creation with duplicate emails
- Password encryption and security
- Session token management
- Input sanitization (SQL injection prevention)
- HTTPS enforcement

### 11.2 Medium Risk Areas

- Field validation consistency
- Error message clarity
- Performance under load
- Accessibility compliance
- Mobile responsiveness

### 11.3 Low Risk Areas

- Edge case input handling
- Unicode character support
- Advanced accessibility features

---

## 12. SUCCESS CRITERIA

- **Test Coverage**: > 95% of signup functionality
- **Pass Rate**: > 98% in stable environment
- **Performance**: Signup API < 3s, page load < 5s
- **Security**: No critical vulnerabilities
- **Accessibility**: WCAG AA compliance
- **Cross-browser**: Consistent behavior across Chrome, Firefox, Safari, Edge
- **Error Handling**: All error paths covered with appropriate messages
- **Data Validation**: All invalid inputs rejected appropriately
