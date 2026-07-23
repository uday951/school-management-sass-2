# Enterprise Backend Project Structure Guidelines
## Node.js, Express.js & MongoDB Architecture Directory Blueprint

This document defines the production-ready directory structure, module layout, file responsibilities, dependency boundaries, import rules, and coding conventions for the backend system.

---

## 1. Master Project Directory Tree

```
backend/
├── config/                      # Global environment and service integrations
│   ├── database.js
│   ├── jwt.js
│   ├── cloudinary.js
│   ├── mail.js
│   ├── cors.js
│   ├── helmet.js
│   └── rate-limit.js
├── src/
│   ├── app.js                   # Express application setup
│   ├── server.js                # Server entry point & listener
│   ├── constants/               # System-wide static values & HTTP messages
│   │   ├── http-status.js
│   │   ├── roles.js
│   │   └── permissions.js
│   ├── enums/                   # Fixed set of typed constant enumerations
│   ├── types/                   # JSDoc type definitions
│   ├── interfaces/              # Contract signatures for services & repos
│   ├── controllers/             # Global / shared controller wrappers
│   ├── services/                # Shared domain services
│   ├── repositories/            # Base repositories & shared data queries
│   ├── models/                  # Base Mongoose models & discriminators
│   ├── validators/              # Common input validation schemas
│   ├── dto/                     # Data Transfer Objects for data sanitization
│   ├── middlewares/             # Request processing filters & guards
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   ├── permission.middleware.js
│   │   ├── validation.middleware.js
│   │   ├── error.middleware.js
│   │   ├── not-found.middleware.js
│   │   └── upload.middleware.js
│   ├── modules/                 # Encapsulated domain business modules
│   │   ├── student/
│   │   ├── teacher/
│   │   ├── school/
│   │   ├── academic/
│   │   ├── attendance/
│   │   ├── fees/
│   │   ├── reports/
│   │   └── settings/
│   ├── utils/                   # Pure utility functions & handlers
│   │   ├── pagination.util.js
│   │   ├── search.util.js
│   │   ├── filter.util.js
│   │   ├── response.util.js
│   │   ├── logger.util.js
│   │   ├── apiError.util.js
│   │   └── asyncHandler.util.js
│   ├── helpers/                 # Helper logic & formatting tools
│   ├── hooks/                   # Mongoose global lifecycle hooks
│   ├── events/                  # EventEmitter definitions & bus
│   ├── jobs/                    # Scheduled cron background tasks
│   ├── queues/                  # Message queue task processors
│   ├── templates/               # Layout templates (PDF, exports)
│   ├── emails/                  # Nodemailer HTML email templates
│   ├── notifications/           # Push notification payload builders
│   ├── permissions/             # Security permission matrices & registries
│   └── policies/                # Resource ownership evaluation policies
├── uploads/                     # Temporary staging for file processing
├── logs/                        # Rotating system log files
├── docs/                        # OpenAPI / Swagger specifications
├── tests/                       # Automated test suites
│   ├── unit/
│   ├── integration/
│   └── fixtures/
└── scripts/                     # Seeders & maintenance automation scripts
```

---

## 2. Directory Responsibilities, Allowed Files & Import Rules

### `config/`
* **Purpose:** Centralized application and external service configuration.
* **Responsibility:** Load process environment variables and export initialized settings objects.
* **Allowed Files:** Standard configuration scripts ending in `.js` (e.g., `database.js`, `cloudinary.js`).
* **Import Rules:** Can import external npm packages and `dotenv`. May be imported anywhere. Must NOT import controllers, services, repositories, or models.
* **Dependency Rules:** Zero internal application dependencies.

### `src/controllers/`
* **Purpose:** Process HTTP requests and format HTTP responses.
* **Responsibility:** Extract parameters, trigger validators/services, and construct uniform responses.
* **Allowed Files:** Express controller functions ending in `.controller.js`.
* **Import Rules:** Can import services, DTOs, response utilities, and constants. Must NOT import models or repositories directly.
* **Dependency Rules:** Depends on `services/`, `dto/`, `utils/`.

### `src/services/`
* **Purpose:** Execute core business logic and orchestration.
* **Responsibility:** Perform domain calculations, enforce business rules, coordinate repositories, and call external services.
* **Allowed Files:** Domain service classes or objects ending in `.service.js`.
* **Import Rules:** Can import repositories, helpers, utilities, events, and external libraries. Must NOT import controllers or Express request/response objects.
* **Dependency Rules:** Depends on `repositories/`, `utils/`, `helpers/`, `events/`.

### `src/repositories/`
* **Purpose:** Data access abstraction layer.
* **Responsibility:** Execute raw Mongoose queries, apply multi-tenant filters, handle soft deletes, and perform pagination queries.
* **Allowed Files:** Data repository classes ending in `.repository.js`.
* **Import Rules:** Can import Mongoose models, constants, and query utilities. Must NOT import services or controllers.
* **Dependency Rules:** Depends on `models/`, `utils/`.

### `src/models/`
* **Purpose:** Mongoose schema definitions and database ORM configuration.
* **Responsibility:** Define collection schemas, field constraints, hooks, virtuals, and indexes.
* **Allowed Files:** Mongoose models ending in `.model.js`.
* **Import Rules:** Can import Mongoose and constants. Must NOT import repositories, services, or controllers.
* **Dependency Rules:** Independent data schema layer.

### `src/middlewares/`
* **Purpose:** Request pipeline filters and guards.
* **Responsibility:** Perform authentication, check permissions, validate request bodies, handle errors, and process uploads.
* **Allowed Files:** Middleware functions ending in `.middleware.js`.
* **Import Rules:** Can import services, utilities, permissions, and configuration.
* **Dependency Rules:** Intercepts routes before controllers.

### `src/validators/`
* **Purpose:** Input validation schemas.
* **Responsibility:** Define express-validator chains to sanitize and validate incoming body, param, and query data.
* **Allowed Files:** Validation definitions ending in `.validator.js`.
* **Import Rules:** Can import express-validator and constants.
* **Dependency Rules:** Used by validation middleware.

### `src/dto/`
* **Purpose:** Data Transfer Objects.
* **Responsibility:** Transform and sanitize internal objects before returning data to the client (filtering out sensitive fields like passwords).
* **Allowed Files:** DTO transformer classes/functions ending in `.dto.js`.
* **Import Rules:** Can import utility transformers.
* **Dependency Rules:** Pure data formatting functions.

### `src/utils/`
* **Purpose:** Reusable pure utility functions.
* **Responsibility:** Provide helper mechanisms like response wrapping, async error handling, pagination calculation, and logging.
* **Allowed Files:** Utility functions ending in `.util.js`.
* **Import Rules:** Can import external utilities (e.g., winston). Must be application-independent.
* **Dependency Rules:** Used across all layers.

### `src/helpers/`
* **Purpose:** Formatters and transformation functions.
* **Responsibility:** Format dates, format currencies, parse strings, and compute standard text templates.
* **Allowed Files:** Helper scripts ending in `.helper.js`.
* **Import Rules:** Pure JavaScript helper utilities.

### `src/constants/`
* **Purpose:** System-wide immutable static values.
* **Responsibility:** Store HTTP status codes, system roles, permission strings, and status flags.
* **Allowed Files:** Constant maps ending in `.js`.

### `src/enums/`
* **Purpose:** Fixed data enumerations.
* **Responsibility:** Store state sets (e.g., student status, fee payment status, leave approval states).

### `src/types/` & `src/interfaces/`
* **Purpose:** System contract definitions.
* **Responsibility:** Define JSDoc typings and interface contracts to ensure consistency across repositories and services.

### `src/hooks/`
* **Purpose:** Global Mongoose lifecycle hooks.
* **Responsibility:** Intercept database operations to automatically inject `tenantId` and `isDeleted: false` filters.

### `src/events/`
* **Purpose:** Internal event emitter bus.
* **Responsibility:** Emit domain events (e.g., `STUDENT_ADMITTED`, `FEE_PAID`) for asynchronous notification dispatching.

### `src/jobs/` & `src/queues/`
* **Purpose:** Asynchronous and scheduled task handling.
* **Responsibility:** Run scheduled cron jobs (e.g., daily attendance summaries, fee overdue reminders) and queue workers.

### `uploads/`
* **Purpose:** Temporary disk staging.
* **Responsibility:** Store incoming file buffers from Multer prior to streaming to Cloudinary. Files are auto-cleared upon upload completion.

### `logs/`
* **Purpose:** Application log storage.
* **Responsibility:** Hold rotating daily log files (`info.log`, `error.log`, `audit.log`) created by Winston.

### `templates/` & `emails/`
* **Purpose:** Output rendering layouts.
* **Responsibility:** Store HTML email templates for Nodemailer and layout templates for generated reports and certificates.

### `notifications/`
* **Purpose:** Push and SMS payload builders.
* **Responsibility:** Format message strings and JSON payloads for push notifications and SMS integrations.

### `permissions/` & `policies/`
* **Purpose:** Fine-grained security definitions.
* **Responsibility:** Map permissions to system roles and evaluate resource ownership rules (e.g., ensuring a parent can only view their own child's profile).

### `docs/`
* **Purpose:** OpenAPI / Swagger documentation specifications.
* **Responsibility:** Hold API documentation files (`swagger.json` or `.yaml`).

### `tests/`
* **Purpose:** Automated test suites.
* **Responsibility:** House unit tests (`tests/unit/`), integration API tests (`tests/integration/`), and mock data fixtures (`tests/fixtures/`).

### `scripts/`
* **Purpose:** Automation and maintenance tooling.
* **Responsibility:** Store database seeders, super admin creation scripts, and migration helpers.

---

## 3. Business Module Folder Structure Design

Every business domain is organized under `src/modules/<module-name>/`. This keeps all logic for a single feature encapsulated.

```
src/modules/student/
├── student.controller.js      # Processes HTTP requests for students
├── student.service.js         # Student domain business logic
├── student.repository.js      # Student database queries
├── student.validator.js       # Input validation schemas for student endpoints
├── student.routes.js          # Student API route definitions
├── student.model.js          # Mongoose schema for Student collection
├── student.dto.js            # DTO serialization for student responses
└── student.constants.js      # Module-specific constants & status enums
```

### Business Modules Inventory
1. **`student/`**: Admissions, promotions, transfers, directory, student documents, and profiles.
2. **`teacher/`**: Teacher rosters, subject allocations, class schedules, and profiles.
3. **`school/`**: Campus configurations, institution setups, houses, and board settings.
4. **`academic/`**: Classes, sections, subjects, timetables, and academic terms.
5. **`attendance/`**: Daily student and staff attendance marking, leave applications, and summaries.
6. **`fees/`**: Fee structures, invoice generation, payment collections, discounts, and receipts.
7. **`reports/`**: Academic report cards, attendance reports, finance ledgers, and export engines.
8. **`settings/`**: System configurations, RBAC permissions assignment, and tenant settings.

---

## 4. Configuration Layout (`config/`)

Each configuration module handles a single concern:

* **`database.js`**: Connects to MongoDB Atlas using Mongoose, configures pool size, reconnect parameters, and debug logging.
* **`jwt.js`**: Exports secret keys, expiration durations (access: 15m, refresh: 7d), and issuer settings.
* **`cloudinary.js`**: Configures Cloudinary SDK with API key, secret, and cloud name credentials.
* **`mail.js`**: Configures Nodemailer SMTP transport with host, port, authentication, and default sender details.
* **`cors.js`**: Configures allowed origins, headers, credentials support, and HTTP methods.
* **`helmet.js`**: Configures Helmet HTTP response headers for security protection (CSP, HSTS, frameguard).
* **`rate-limit.js`**: Configures `express-rate-limit` windows and maximum request counts per IP.

---

## 5. Middleware Layout (`src/middlewares/`)

Middleware components intercept requests in a predictable sequence:

1. **`auth.middleware.js`**: Verifies JWT Access tokens from `Authorization` headers. Attaches `req.user` object.
2. **`role.middleware.js`**: Checks `req.user.role` against allowed roles for the endpoint.
3. **`permission.middleware.js`**: Evaluates `req.user.permissions` against required action permissions.
4. **`validation.middleware.js`**: Checks express-validator results; if errors exist, passes them to the error handler.
5. **`upload.middleware.js`**: Configures Multer for temporary storage, file size caps, and mime-type filters.
6. **`not-found.middleware.js`**: Catches requests to unmapped routes and passes a 404 error to the error handler.
7. **`error.middleware.js`**: Global error handling middleware. Formats all exceptions into a standard JSON response structure.

---

## 6. Reusable Utilities Design (`src/utils/`)

* **`pagination.util.js`**: Calculates skip offsets and formats standard pagination meta objects (`currentPage`, `totalPages`, `totalCount`, `hasNextPage`).
* **`search.util.js`**: Constructs MongoDB `$regex` search filters across designated text fields.
* **`filter.util.js`**: Sanitizes query parameters and transforms them into safe Mongoose query objects.
* **`response.util.js`**: Helper function to format consistent success JSON responses.
* **`logger.util.js`**: Configures Winston loggers for `stdout`, `info.log`, `error.log`, and `audit.log`.
* **`apiError.util.js`**: Custom operational error class extending `Error` to encapsulate HTTP status codes and error details.
* **`asyncHandler.util.js`**: Higher-order function wrapper to catch unhandled promise rejections in async routes without repetitive try/catch blocks.

---

## 7. Testing & API Documentation Layout

### Testing (`tests/`)
* **`tests/unit/`**: Unit tests for services and pure utility functions using Jest.
* **`tests/integration/`**: End-to-end API route tests using Supertest.
* **`tests/fixtures/`**: Mock dataset generators and static JSON payloads for tests.

### API Documentation (`docs/`)
* **`docs/openapi.yaml`**: Complete Swagger/OpenAPI specification defining endpoints, authentication schemes, schemas, and example payloads.
* **`docs/postman_collection.json`**: Exported Postman collection for rapid API testing.

---

## 8. Environment Variable Structure (`.env.example`)

```env
# SERVER CONFIGURATION
PORT=5000
NODE_ENV=development
APP_URL=http://localhost:5000

# DATABASE CONFIGURATION
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/school_erp?retryWrites=true&w=majority

# JWT CONFIGURATION
JWT_ACCESS_SECRET=your_access_secret_key_here
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_REFRESH_EXPIRATION=7d

# CLOUDINARY STORAGE
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# MAIL CONFIGURATION (SMTP)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
EMAIL_FROM="Metropolitan Academy <no-reply@metropolitan.edu>"

# SECURITY & RATE LIMITING
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 9. Naming Conventions

* **Files & Folders**: Lowercase `camelCase` or kebab-case (e.g., `student.controller.js`, `auth.middleware.js`).
* **Classes & Models**: PascalCase (e.g., `StudentService`, `StudentModel`).
* **Functions & Variables**: Lowercase `camelCase` (e.g., `getStudentById`, `formattedData`).
* **Constants & Enums**: Uppercase `SNAKE_CASE` (e.g., `HTTP_STATUS_CODES`, `USER_ROLES`).
* **Database Collections**: Plural lowercase (e.g., `students`, `attendance`, `invoices`).
* **API Endpoints**: Plural lowercase kebab-case (e.g., `/api/v1/collect-fees`, `/api/v1/student-leaves`).
