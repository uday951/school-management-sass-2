# 📱 School ERP Mobile Companion App

Sleek, lightweight React Native companion application built with **Expo SDK 57**, **React Navigation v7**, and **Zustand v5** state management.

---

## 🛠 Technology Stack & Architecture

- **Framework:** Expo SDK 57 (Managed workflow).
- **Navigation:** React Navigation v7 (Bottom tabs + Native Stacks).
- **State Management:** Zustand v5 (matching web application state structure).
- **API Engine:** Axios with custom Request & Response interceptors.
- **Secure Key Storage:** iOS Keychain & Android Keystore integration via `expo-secure-store`.
- **Push Notification Register:** `expo-notifications`.

---

## 📂 Project Directory Structure

```
mobile/
├── src/
│   ├── app/
│   │   ├── navigation/        # Root & Role navigators
│   │   └── providers/         # Global provider trees
│   ├── components/
│   │   ├── common/            # Custom common buttons, inputs, badges
│   │   ├── feedback/          # Empty, loading, error handlers
│   │   └── layout/            # Safe area containers
│   ├── features/              # Modular feature sections
│   │   ├── auth/              # Mock & standard logins
│   │   ├── parent/            # 9 parent portal companion dashboards
│   │   ├── teacher/           # 10 teacher portal desks
│   │   └── principal/         # 8 principal management monitors
│   ├── services/
│   │   ├── api/               # API clients & routes
│   │   ├── auth/              # Authentication calls
│   │   ├── notifications/     # Expo Push managers
│   │   └── storage/           # Device secure storage
│   ├── store/                 # Zustand global stores
│   ├── hooks/                 # Network & notification hook listeners
│   ├── utils/                 # General date & formatting tools
│   ├── constants/             # Routes & Roles definitions
│   └── theme/                 # Consolidated style parameters
```

---

## 🔐 Auth & Role Navigation Logic

Authentication tokens are handled securely:
- **Never store passwords locally.** Access tokens are stored securely in `expo-secure-store`.
- On startup, the root navigator (`src/app/navigation/index.jsx`) checks secure storage.
- App selects the navigation stack depending on the role parsed from token payload:
  - `parent` → **Parent Tab Navigation**
  - `teacher` → **Teacher Tab Navigation**
  - `school_admin` / `super_admin` (Principal) → **Principal Tab Navigation**

---

## 🧪 Developer Mock Login Integration

To facilitate developer productivity and testing without active credentials, the Login screen contains **Mock Workspaces buttons**:
1. **Principal Workspace**: Uses the mock token `mock_token_school_admin` matching Mongoose ObjectID `6a6237bed724b22b37b5255a`.
2. **Teacher Workspace**: Uses `mock_token_teacher` matching Sarah Jenkins (`6a6237bed724b22b37b5255a`).
3. **Parent Workspace**: Uses `mock_token_parent` matching Robert Daniel (`6a63785e11b63a63ef656825`).

All backend query operations will hit the active MongoDB database with these ObjectIDs, rendering real data.

---

## ⚙️ Running Locally

1. Create a local environment file `mobile/.env` copying from `.env.example`:
   ```bash
   cp .env.example .env
   ```
2. Configure `EXPO_PUBLIC_API_BASE_URL`:
   - **Android Emulator**: `http://10.0.2.2:5000/api/v1`
   - **iOS Simulator / Web**: `http://localhost:5000/api/v1`
   - **Physical Devices**: `http://<your-lan-ip>:5000/api/v1`
3. Install dependencies and start Expo server:
   ```bash
   npm install
   npm run start
   ```
