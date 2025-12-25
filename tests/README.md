# Test Utilities

This folder contains various test utilities and scripts for the Task Manager application.

## Files

### `test-login-api.js`
Tests the login API endpoints with different user accounts.

**Usage:**
```bash
node tests/test-login-api.js
```

**What it tests:**
- User account login (`user@test.com`)
- Admin account login (`admin@test.com`)
- Invalid credentials handling
- Server availability check

### `test-database.js`
Tests database connection and checks schema/data.

**Usage:**
```bash
node tests/test-database.js
```

**What it checks:**
- Database connectivity
- Available tables
- User count and sample data
- Schema validation

### `create-test-users.js`
Creates test user accounts in the database.

**Usage:**
```bash
# Create default test users
node tests/create-test-users.js

# Create a specific user
node tests/create-test-users.js email@example.com password123 admin
```

**Default users created:**
- `admin@test.com` / `admin123` (admin role)
- `user@test.com` / `user123` (user role)  
- `demo@test.com` / `demo123` (user role)

### `setup-translations.js`
Populates the database with basic translations and languages.

**Usage:**
```bash
node tests/setup-translations.js
```

**What it creates:**
- Languages: English (en), Hebrew (he), Russian (ru)
- Translation keys for common UI elements
- Translations for all supported languages

## Prerequisites

Make sure you have:
1. Environment variables configured (`.env` file)
2. Database connection working
3. Backend server running (for API tests)

## Quick Test Commands

```bash
# Test everything
npm run test  # if test script is configured

# Or run individual tests
node tests/test-database.js
node tests/test-login-api.js

# Create fresh test users
node tests/create-test-users.js
```
