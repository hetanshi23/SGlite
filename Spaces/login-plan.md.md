# Playwright Test Plan: Login Module

## Overview
This test plan covers comprehensive testing of the Login module for the SG Lite application. Tests are structured using Playwright with Page Object Model pattern, fixtures, and proper assertions.

## Test Environment Setup
- **Base URL**: `https://sglite.lovable.app`
- **Test Data**: Environment variables for valid/invalid credentials
- **Fixtures**: `loginPage`, `dashboardPage`, `page`
- **Timeouts**: 10s for UI elements, 15s for navigation, 60s for page loads

---

## 1. POSITIVE TEST SCENARIOS

### 1.1 Successful Login Flows
- **TC-LOGIN-POS-001**: Valid email and password login via button click
  - **Steps**: Navigate to /auth, enter valid credentials, click "Sign In"
  - **Assertions**: Redirect to dashboard (/), auth token in localStorage, dashboard elements visible
  - **Priority**: Critical

- **TC-LOGIN-POS-002**: Login using Enter key from password field
  - **Steps**: Fill email and password, press Enter on password field
  - **Assertions**: Same as TC-LOGIN-POS-001
  - **Priority**: High

- **TC-LOGIN-POS-003**: Login with email containing leading/trailing spaces
  - **Steps**: Enter email with spaces (e.g., "  user@example.com  ")
  - **Assertions**: Application trims spaces and logs in successfully
  - **Priority**: Medium

- **TC-LOGIN-POS-004**: Login after page refresh/session restore
  - **Steps**: Login successfully, refresh page
  - **Assertions**: User remains logged in, dashboard loads
  - **Priority**: Medium

### 1.2 UI Validation After Login
- **TC-LOGIN-POS-005**: Dashboard UI elements visibility
  - **Steps**: Complete successful login
  - **Assertions**: Dashboard heading, sidebar, header, navigation cards visible
  - **Priority**: High

- **TC-LOGIN-POS-006**: Session persistence across browser tabs
  - **Steps**: Login in one tab, open new tab to base URL
  - **Assertions**: Second tab shows dashboard (not login page)
  - **Priority**: Medium

---

## 2. NEGATIVE TEST SCENARIOS

### 2.1 Invalid Credentials
- **TC-LOGIN-NEG-001**: Invalid email format
  - **Steps**: Enter "invalid-email" without @ symbol
  - **Assertions**: HTML5 validation prevents submission, error message visible
  - **Priority**: High

- **TC-LOGIN-NEG-002**: Wrong password with valid email
  - **Steps**: Valid email, incorrect password
  - **Assertions**: Error message "Invalid login credentials", stays on auth page
  - **Priority**: Critical

- **TC-LOGIN-NEG-003**: Non-existent email account
  - **Steps**: Random valid email format, any password
  - **Assertions**: Same error message as wrong password
  - **Priority**: High

- **TC-LOGIN-NEG-004**: Multiple consecutive failed login attempts
  - **Steps**: 3-5 failed login attempts in sequence
  - **Assertions**: Consistent error messages, no account lockout (if applicable)
  - **Priority**: Medium

### 2.2 Empty/Missing Fields
- **TC-LOGIN-NEG-005**: Both fields empty
  - **Steps**: Click login button without entering data
  - **Assertions**: HTML5 validation on both fields, form doesn't submit
  - **Priority**: High

- **TC-LOGIN-NEG-006**: Empty email field
  - **Steps**: Fill password only, leave email empty
  - **Assertions**: Email field shows validation error
  - **Priority**: High

- **TC-LOGIN-NEG-007**: Empty password field
  - **Steps**: Fill email only, leave password empty
  - **Assertions**: Password field shows validation error
  - **Priority**: High

---

## 3. VALIDATION CHECKS

### 3.1 Email Field Validation
- **TC-VALIDATION-EMAIL-001**: HTML5 email validation
  - **Input**: "test@", "test", "@test.com", "test.com"
  - **Expected**: Browser validation prevents submission
  - **Priority**: High

- **TC-VALIDATION-EMAIL-002**: Email with spaces
  - **Input**: "test @example.com"
  - **Expected**: Validation error (spaces not allowed in email)
  - **Priority**: Medium

- **TC-VALIDATION-EMAIL-003**: Case sensitivity
  - **Input**: "USER@EXAMPLE.COM" vs "user@example.com"
  - **Expected**: Case insensitive login (if backend allows)
  - **Priority**: Low

### 3.2 Password Field Validation
- **TC-VALIDATION-PWD-001**: Minimum length requirements
  - **Input**: Passwords shorter than minimum (e.g., "123", "ab")
  - **Expected**: Validation error or server rejection
  - **Priority**: High

- **TC-VALIDATION-PWD-002**: Special characters only
  - **Input**: "!@#$%^&*()"
  - **Expected**: Server validation (may accept or reject)
  - **Priority**: Medium

- **TC-VALIDATION-PWD-003**: Very long passwords
  - **Input**: 1000+ character password
  - **Expected**: Server handles gracefully
  - **Priority**: Low

### 3.3 Error Message Validation
- **TC-VALIDATION-ERR-001**: Invalid credentials message
  - **Expected**: "Invalid login credentials" or similar
  - **Priority**: Critical

- **TC-VALIDATION-ERR-002**: Network error messages
  - **Expected**: Graceful error handling, no crashes
  - **Priority**: High

- **TC-VALIDATION-ERR-003**: Timeout error messages
  - **Expected**: User-friendly timeout messages
  - **Priority**: Medium

---

## 4. UI TEST SCENARIOS

### 4.1 Form Elements Visibility
- **TC-UI-ELEMENTS-001**: All login form elements visible
  - **Elements**: Email input, password input, login button, sign up button, page heading
  - **Priority**: Critical

- **TC-UI-ELEMENTS-002**: Form elements enabled state
  - **Expected**: All inputs and buttons enabled by default
  - **Priority**: High

- **TC-UI-ELEMENTS-003**: Focus management
  - **Expected**: Email field focused on page load
  - **Priority**: Medium

### 4.2 Button States and Interactions
- **TC-UI-BUTTONS-001**: Login button states
  - **States**: Enabled/disabled based on form validity
  - **Priority**: High

- **TC-UI-BUTTONS-002**: Sign Up button navigation
  - **Expected**: Redirects to signup page or shows signup form
  - **Priority**: Medium

- **TC-UI-BUTTONS-003**: Button loading states
  - **Expected**: Button shows loading indicator during API call
  - **Priority**: Medium

### 4.3 Responsive Design
- **TC-UI-RESPONSIVE-001**: Mobile viewport (375x667)
  - **Expected**: Form elements properly sized and accessible
  - **Priority**: Medium

- **TC-UI-RESPONSIVE-002**: Tablet viewport (768x1024)
  - **Expected**: Layout adjusts appropriately
  - **Priority**: Medium

- **TC-UI-RESPONSIVE-003**: Desktop viewport (1920x1080)
  - **Expected**: Form centered and properly styled
  - **Priority**: Low

---

## 5. EDGE CASES

### 5.1 Input Boundary Testing
- **TC-EDGE-INPUT-001**: Maximum email length
  - **Input**: 254+ character email address
  - **Expected**: Handles gracefully or validates
  - **Priority**: Low

- **TC-EDGE-INPUT-002**: Unicode characters in email
  - **Input**: Email with international characters (e.g., "tëst@example.com")
  - **Expected**: Accepts or rejects based on backend rules
  - **Priority**: Low

- **TC-EDGE-INPUT-003**: SQL injection attempts
  - **Input**: Email: "'; DROP TABLE users; --"
  - **Expected**: Sanitized, no injection possible
  - **Priority**: High

### 5.2 Special Characters and Encoding
- **TC-EDGE-SPECIAL-001**: Password with special characters
  - **Input**: "P@ssw0rd!#$%^&*()"
  - **Expected**: Accepts and processes correctly
  - **Priority**: Medium

- **TC-EDGE-SPECIAL-002**: Email with special characters
  - **Input**: "test+tag@example.com", "test@example.co.uk"
  - **Expected**: Valid email formats accepted
  - **Priority**: Medium

- **TC-EDGE-SPECIAL-003**: Right-to-left text input
  - **Input**: Arabic/Hebrew characters
  - **Expected**: Input fields handle RTL text
  - **Priority**: Low

### 5.3 Browser-Specific Edge Cases
- **TC-EDGE-BROWSER-001**: Autofill behavior
  - **Steps**: Use browser autofill for credentials
  - **Expected**: Form accepts autofilled values
  - **Priority**: Medium

- **TC-EDGE-BROWSER-002**: Form submission via browser refresh
  - **Steps**: Fill form, refresh page
  - **Expected**: Form data cleared appropriately
  - **Priority**: Low

---

## 6. SECURITY SCENARIOS

### 6.1 Password Security
- **TC-SECURITY-PWD-001**: Password masking
  - **Expected**: Password field type="password", dots/asterisks shown
  - **Priority**: Critical

- **TC-SECURITY-PWD-002**: Password not visible in DOM
  - **Expected**: Password value not exposed in page source
  - **Priority**: High

- **TC-SECURITY-PWD-003**: Password not logged in console
  - **Expected**: No password values in browser console
  - **Priority**: Medium

### 6.2 Session Security
- **TC-SECURITY-SESSION-001**: Auth token storage
  - **Expected**: JWT or session token in localStorage
  - **Priority**: High

- **TC-SECURITY-SESSION-002**: Session expiration
  - **Steps**: Login, wait for token expiry
  - **Expected**: Automatic logout or token refresh
  - **Priority**: Medium

- **TC-SECURITY-SESSION-003**: Concurrent sessions
  - **Steps**: Login from multiple browsers/tabs
  - **Expected**: All sessions valid or managed appropriately
  - **Priority**: Low

### 6.3 Unauthorized Access Prevention
- **TC-SECURITY-AUTH-001**: Direct URL access to protected pages
  - **Steps**: Navigate directly to /dashboard without login
  - **Expected**: Redirect to /auth
  - **Priority**: Critical

- **TC-SECURITY-AUTH-002**: API endpoint access without auth
  - **Steps**: Call protected API endpoints without token
  - **Expected**: 401 Unauthorized responses
  - **Priority**: High

- **TC-SECURITY-AUTH-003**: Token tampering
  - **Steps**: Modify localStorage token
  - **Expected**: Invalid token rejected, logout triggered
  - **Priority**: Medium

---

## 7. PERFORMANCE SCENARIOS

### 7.1 Response Time Testing
- **TC-PERF-RESPONSE-001**: Login API response time
  - **Expected**: < 3 seconds for successful login
  - **Priority**: High

- **TC-PERF-RESPONSE-002**: Page load time
  - **Expected**: < 5 seconds for /auth page load
  - **Priority**: High

- **TC-PERF-RESPONSE-003**: Dashboard load after login
  - **Expected**: < 10 seconds for full dashboard load
  - **Priority**: Medium

### 7.2 Network Condition Testing
- **TC-PERF-NETWORK-001**: Slow network (2G simulation)
  - **Expected**: Graceful loading, no crashes
  - **Priority**: Medium

- **TC-PERF-NETWORK-002**: Intermittent connectivity
  - **Steps**: Network on/off during login attempt
  - **Expected**: Proper error handling
  - **Priority**: Medium

- **TC-PERF-NETWORK-003**: Timeout handling
  - **Steps**: API calls timeout
  - **Expected**: User-friendly timeout messages
  - **Priority**: High

### 7.3 Resource Usage
- **TC-PERF-RESOURCE-001**: Memory usage during login
  - **Expected**: No excessive memory consumption
  - **Priority**: Low

- **TC-PERF-RESOURCE-002**: CPU usage during form interactions
  - **Expected**: Smooth UI interactions
  - **Priority**: Low

---

## 8. CROSS-BROWSER COMPATIBILITY

### 8.1 Browser Matrix
- **Chrome**: Latest stable version
- **Firefox**: Latest stable version
- **Safari**: Latest stable version
- **Edge**: Latest stable version

### 8.2 Browser-Specific Tests
- **TC-BROWSER-CHROME-001**: Chrome autofill behavior
- **TC-BROWSER-FF-001**: Firefox form validation styling
- **TC-BROWSER-SAFARI-001**: Safari password manager integration
- **TC-BROWSER-EDGE-001**: Edge security features

---

## 9. ACCESSIBILITY TESTING

### 9.1 Keyboard Navigation
- **TC-A11Y-KEYBOARD-001**: Tab order through form elements
- **TC-A11Y-KEYBOARD-002**: Enter key submission
- **TC-A11Y-KEYBOARD-003**: Escape key behavior

### 9.2 Screen Reader Support
- **TC-A11Y-SCREENREADER-001**: Form labels and instructions
- **TC-A11Y-SCREENREADER-002**: Error message announcements
- **TC-A11Y-SCREENREADER-003**: Success state announcements

### 9.3 Color Contrast
- **TC-A11Y-CONTRAST-001**: Form elements meet WCAG AA standards
- **TC-A11Y-CONTRAST-002**: Error states have sufficient contrast

---

## 10. TEST AUTOMATION STRUCTURE

### 10.1 Test File Organization
```
tests/auth/
├── login-positive.spec.ts    # Successful login scenarios
├── login-negative.spec.ts    # Failed login scenarios
├── login-validation.spec.ts  # Field validation tests
├── login-ui.spec.ts         # UI/UX specific tests
├── login-security.spec.ts   # Security-focused tests
├── login-performance.spec.ts # Performance tests
└── login-accessibility.spec.ts # A11y tests
```

### 10.2 Page Objects
- `LoginPage.ts`: Login form interactions
- `DashboardPage.ts`: Post-login validation
- Shared fixtures in `pageFixtures.ts`

### 10.3 Test Data Management
- Environment variables for credentials
- Test data factory for dynamic test data
- Mock data for negative scenarios

### 10.4 Reporting and CI/CD
- HTML reports with screenshots
- Video recordings for failures
- Parallel execution configuration
- Test results integration with CI pipeline

---

## 11. TEST EXECUTION STRATEGY

### 11.1 Smoke Tests
- **TC-SMOKE-001**: Basic login with valid credentials
- **TC-SMOKE-002**: Basic login with invalid credentials
- **TC-SMOKE-003**: Form elements visibility

### 11.2 Regression Tests
- All critical and high priority tests
- Cross-browser execution
- Mobile responsiveness

### 11.3 Maintenance
- Weekly full suite execution
- Bi-weekly cross-browser validation
- Monthly performance benchmark updates

---

## 12. RISK ASSESSMENT

### 12.1 High Risk Areas
- Authentication bypass vulnerabilities
- Session management issues
- Password exposure in logs/client-side
- Cross-site scripting (XSS) in error messages

### 12.2 Medium Risk Areas
- Performance degradation under load
- Browser compatibility issues
- Accessibility compliance
- Mobile responsiveness

### 12.3 Low Risk Areas
- Edge case input handling
- Unicode character support
- Advanced security features

---

## 13. SUCCESS CRITERIA

- **Test Coverage**: > 95% of login functionality
- **Pass Rate**: > 98% in stable environment
- **Performance**: All response times within acceptable limits
- **Security**: No critical or high severity vulnerabilities
- **Accessibility**: WCAG AA compliance
- **Cross-browser**: Consistent behavior across supported browsers