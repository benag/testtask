# Test Suite - Task Manager Application

## 🧪 Test-Driven Development Implementation

This directory contains comprehensive tests demonstrating **Test-Driven Development (TDD)** practices for our multi-language Task Manager application.

## 📊 Current Test Coverage: **81.25%** ✅

### ✅ **24 Passing Tests** covering:

## 🔧 **Core Functionality Tests**

### **1. Authentication & Security** (`basic.test.ts`)
- ✅ **Password Hashing** - bcrypt implementation
- ✅ **JWT Token Generation** - Secure token creation
- ✅ **JWT Token Verification** - Token validation
- ✅ **Input Validation** - Email format validation
- ✅ **Security Measures** - Invalid token handling

### **2. API Endpoints** (`endpoints.test.ts`)
- ✅ **Health Check Endpoints** - `/api/health`, `/api/ping`
- ✅ **Validation Endpoints** - Input sanitization
- ✅ **Language Support** - Multi-language API
- ✅ **Error Handling** - 404, malformed JSON
- ✅ **HTTP Methods** - GET, POST, OPTIONS (CORS)

### **3. Configuration & Validation** (`config.test.ts`)
- ✅ **Environment Setup** - Test environment validation
- ✅ **Database URL Validation** - PostgreSQL connection strings
- ✅ **Application Constants** - Task statuses, priorities, roles
- ✅ **Multi-language Support** - English, Hebrew (RTL), Russian
- ✅ **User Role Hierarchy** - Admin vs User permissions
- ✅ **Input Sanitization** - XSS protection
- ✅ **Utility Functions** - Date formatting, slug generation

## 🌍 **Multi-Language Testing**

### **Supported Languages:**
- 🇺🇸 **English** (LTR)
- 🇮🇱 **Hebrew** (RTL) 
- 🇷🇺 **Russian** (LTR)

### **Translation Features Tested:**
- Language detection and switching
- RTL (Right-to-Left) language support
- Task status translations
- Error message localization
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
