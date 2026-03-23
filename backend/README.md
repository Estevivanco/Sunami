# 🎵 Music App - Backend API

En modern REST API för musikstreaming-applikation byggd med Node.js, Express och MongoDB. API:et hanterar autentisering, artister, album, låtar och spellistor med omfattande säkerhetsfunktioner.

---

## 📋 Innehåll

- [Teknisk Stack](#-teknisk-stack)
- [Funktioner](#-funktioner)
- [Installation](#-installation)
- [Miljövariabler](#-miljövariabler)
- [Projektstruktur](#-projektstruktur)
- [API Endpoints](#-api-endpoints)
- [Autentisering](#-autentisering)
- [Databasschema](#-databasschema)
- [Scripts](#-scripts)
- [Säkerhet](#-säkerhet)

---

## 🚀 Teknisk Stack

- **Runtime**: Node.js v18+ (ES Modules)
- **Framework**: Express.js
- **Databas**: MongoDB Atlas (Mongoose ODM)
- **Autentisering**: JWT (Access & Refresh Tokens)
- **Validering**: Express-validator
- **Säkerhet**: bcrypt, CORS, Rate Limiting, httpOnly Cookies
- **Dev Tools**: Nodemon, Morgan, dotenv

---

## ✨ Funktioner

### Autentisering & Auktorisering

- ✅ JWT-baserad autentisering med Access & Refresh Tokens
- ✅ Refresh token i httpOnly cookies (skydd mot XSS)
- ✅ Refresh token rotation för extra säkerhet
- ✅ Rollbaserad åtkomstkontroll (user/admin)
- ✅ Bcrypt lösenordshashning
- ✅ Automatisk inloggning efter registrering

### API Features

- ✅ RESTful API-design
- ✅ Global felsökning med centraliserad error handler
- ✅ Sökfunktionalitet för låtar och artister
- ✅ Repository-pattern för databasåtkomst
- ✅ Input-validering med Express-validator
- ✅ CORS-konfiguration
- ✅ Request logging med Morgan

### Data Management

- ✅ CRUD för artister, album, låtar och spellistor
- ✅ Användarhantering och profiler
- ✅ Likes/favoriter för låtar, album och spellistor
- ✅ Relationer mellan entities (population)
- ✅ Admin-specifika endpoints för datahantering

---

## 📦 Installation

### Förutsättningar

- Node.js v18 eller högre
- MongoDB Atlas-konto (eller lokal MongoDB)
- npm eller yarn

### Steg för steg

1. **Klona projektet och navigera till backend:**

```bash
cd backend
```

2. **Installera dependencies:**

```bash
npm install
```

3. **Skapa `.env` fil:**

```bash
cp .env.example .env
```

4. **Konfigurera miljövariabler** (se [Miljövariabler](#-miljövariabler))

5. **Generera JWT-secrets:**

```bash
npm run generate:secrets
```

6. **Skapa admin-användare:**

```bash
npm run seed:admin
```

7. **Seedа databas (valfritt):**

```bash
npm run seed
npm run seed:playlists
```

8. **Starta servern:**

```bash
# Development
npm run dev

# Production
npm start
```

Servern körs på: `http://localhost:3000`

---

## 🔐 Miljövariabler

Skapa en `.env` fil i backend-mappen med följande:

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/musicapp

# JWT Secrets (generera med npm run generate:secrets)
JWT_SECRET=din_access_token_secret_här
JWT_REFRESH_SECRET=din_refresh_token_secret_här

# JWT Expiration
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Admin User (för seeding)
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ditt_säkra_lösenord

# CORS (frontend URL)
FRONTEND_URL=http://localhost:5173

# Spotify API (om du vill använda Spotify-integration)
SPOTIFY_CLIENT_ID=din_spotify_client_id
SPOTIFY_CLIENT_SECRET=din_spotify_client_secret
```

**Viktigt:**

- Använd `npm run generate:secrets` för att skapa säkra JWT-secrets
- Ändra ADMIN_PASSWORD till något säkert
- Lägg aldrig `.env` filen i version control

---

## 📁 Projektstruktur

```
backend/
├── config/
│   └── env.js                    # Environment config & validering
├── controllers/
│   ├── albumController.js        # Album business logic
│   ├── artistController.js       # Artist business logic
│   ├── authController.js         # Auth business logic
│   ├── playlistController.js     # Playlist business logic
│   ├── songController.js         # Song business logic
│   └── userController.js         # User business logic
├── db/
│   └── connection.js             # MongoDB connection
├── middleware/
│   ├── auth.js                   # JWT auth & authorization
│   ├── errorHandler.js           # Global error handler
│   ├── albumValidation.js        # Album validering
│   ├── artistValidation.js       # Artist validering
│   ├── playlistValidation.js     # Playlist validering
│   ├── songValidation.js         # Song validering
│   └── userValidation.js         # User/auth validering
├── models/
│   ├── Album.js                  # Album schema
│   ├── Artist.js                 # Artist schema
│   ├── Playlist.js               # Playlist schema
│   ├── Song.js                   # Song schema
│   └── User.js                   # User schema
├── repositories/
│   ├── albumRepository.js        # Album data access
│   ├── artistRepository.js       # Artist data access
│   ├── playlistRepository.js     # Playlist data access
│   ├── songRepository.js         # Song data access
│   └── userRepository.js         # User data access
├── routes/
│   ├── api.js                    # Route aggregator
│   ├── albumRoutes.js            # Album endpoints
│   ├── artistRoutes.js           # Artist endpoints
│   ├── authRoutes.js             # Auth endpoints
│   ├── playlistRoutes.js         # Playlist endpoints
│   ├── songRoutes.js             # Song endpoints
│   └── userRoutes.js             # User endpoints
├── scripts/
│   ├── generateSecrets.js        # Generera JWT secrets
│   ├── seedAdmin.js              # Skapa admin user
│   ├── seedFromJson.js           # Seeda databas från JSON
│   └── createCuratedPlaylists.js # Skapa spellistor
├── utils/
│   ├── tokens.js                 # JWT token utils
│   ├── AppError.js               # Custom error class
│   └── catchAsync.js             # Async error wrapper
├── .env                          # Environment variables
├── .env.example                  # Example env vars
├── index.js                      # Application entry point
└── package.json                  # Dependencies & scripts
```

### Arkitektur

Projektet följer en **layered architecture**:

1. **Routes** → Definierar endpoints
2. **Middleware** → Validering & autentisering
3. **Controllers** → Business logic & orchestration
4. **Repositories** → Databasåtkomst
5. **Models** → Mongoose schemas

**Fördelar:**

- Separation of concerns
- Enkel testbarhet
- Skalbar struktur
- DRY (Don't Repeat Yourself)

---

## 🛣️ API Endpoints

**Base URL:** `http://localhost:3000/api`

### Autentisering

| Method | Endpoint         | Beskrivning             | Auth |
| ------ | ---------------- | ----------------------- | ---- |
| POST   | `/auth/register` | Registrera ny användare | Nej  |
| POST   | `/auth/login`    | Logga in                | Nej  |
| POST   | `/auth/refresh`  | Förnya access token     | Nej  |
| POST   | `/auth/logout`   | Logga ut                | Ja   |

### Användare

| Method | Endpoint              | Beskrivning           | Auth |
| ------ | --------------------- | --------------------- | ---- |
| GET    | `/users/me`           | Hämta egen profil     | Ja   |
| PUT    | `/users/me`           | Uppdatera profil      | Ja   |
| GET    | `/users/me/playlists` | Hämta egna spellistor | Ja   |

### Artister

| Method | Endpoint                      | Beskrivning           | Auth  |
| ------ | ----------------------------- | --------------------- | ----- |
| GET    | `/artists`                    | Hämta alla artister   | Nej   |
| GET    | `/artists/:id`                | Hämta specifik artist | Nej   |
| GET    | `/artists/:id/songs`          | Hämta artists låtar   | Nej   |
| GET    | `/artists/:id/songs?q=search` | Sök i artists låtar   | Nej   |
| GET    | `/artists/:id/albums`         | Hämta artists album   | Nej   |
| POST   | `/artists`                    | Skapa artist          | Admin |
| PUT    | `/artists/:id`                | Uppdatera artist      | Admin |
| DELETE | `/artists/:id`                | Ta bort artist        | Admin |

### Album

| Method | Endpoint      | Beskrivning           | Auth  |
| ------ | ------------- | --------------------- | ----- |
| GET    | `/albums`     | Hämta alla album      | Nej   |
| GET    | `/albums/:id` | Hämta specifikt album | Nej   |
| POST   | `/albums`     | Skapa album           | Admin |
| PUT    | `/albums/:id` | Uppdatera album       | Admin |
| DELETE | `/albums/:id` | Ta bort album         | Admin |

### Låtar

| Method | Endpoint          | Beskrivning             | Auth  |
| ------ | ----------------- | ----------------------- | ----- |
| GET    | `/songs`          | Hämta alla låtar        | Nej   |
| GET    | `/songs?q=search` | Sök låtar (titel/genre) | Nej   |
| GET    | `/songs/:id`      | Hämta specifik låt      | Nej   |
| POST   | `/songs`          | Skapa låt               | Admin |
| PUT    | `/songs/:id`      | Uppdatera låt           | Admin |
| DELETE | `/songs/:id`      | Ta bort låt             | Admin |

### Spellistor

| Method | Endpoint                       | Beskrivning              | Auth |
| ------ | ------------------------------ | ------------------------ | ---- |
| GET    | `/playlists`                   | Hämta alla spellistor    | Nej  |
| GET    | `/playlists/:id`               | Hämta specifik spellista | Nej  |
| POST   | `/playlists`                   | Skapa spellista          | Ja   |
| PUT    | `/playlists/:id`               | Uppdatera spellista      | Ja   |
| DELETE | `/playlists/:id`               | Ta bort spellista        | Ja   |
| POST   | `/playlists/:id/songs`         | Lägg till låt            | Ja   |
| DELETE | `/playlists/:id/songs/:songId` | Ta bort låt              | Ja   |

---

## 🔒 Autentisering

### JWT Token System

API:et använder ett **dubbelt token-system**:

#### Access Token

- **Livslängd:** 15 minuter (standard)
- **Lagring:** localStorage (frontend)
- **Användning:** Skickas i Authorization header för varje request
- **Format:** `Authorization: Bearer <access_token>`

#### Refresh Token

- **Livslängd:** 7 dagar (standard)
- **Lagring:** httpOnly cookie (säkert mot XSS)
- **Användning:** Används för att förnya access token
- **Säkerhet:** Refresh token rotation implementerat

### Token Flow

```
1. Login → Få både access & refresh token
2. Request med access token → Success
3. Access token expired → 401 error
4. Frontend kallar /auth/refresh automatiskt
5. Få ny access token (och ny refresh token)
6. Upprepa request med ny access token
```

### Rollbaserad Åtkomst

**User (vanlig användare):**

- Skapa/hantera egna spellistor
- Läsa all publik data
- Uppdatera egen profil

**Admin:**

- Allt som user kan
- Skapa/uppdatera/ta bort artister
- Skapa/uppdatera/ta bort album
- Skapa/uppdatera/ta bort låtar

### Middleware

```javascript
// Endast inloggade användare
authenticateToken;

// Endast admins
authenticateToken + requireAdmin;
```

---

## 💾 Databasschema

### User

```javascript
{
  username: String (unique, min 3 chars),
  email: String (unique, valid email),
  password: String (hashed, min 8 chars),
  role: String (enum: "user", "admin"),
  createdAt: Date,
  updatedAt: Date
}
```

### Artist

```javascript
{
  name: String (required),
  bio: String,
  genres: [String],
  image: String (URL),
  createdAt: Date,
  updatedAt: Date
}
```

### Album

```javascript
{
  title: String (required),
  artist: ObjectId (ref: Artist),
  releaseYear: Number,
  coverImage: String (URL),
  genre: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Song

```javascript
{
  title: String (required),
  artist: ObjectId (ref: Artist),
  album: ObjectId (ref: Album),
  duration: Number (seconds),
  genre: String,
  audioUrl: String (URL),
  playCount: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Playlist

```javascript
{
  name: String (required),
  description: String,
  user: ObjectId (ref: User),
  songs: [ObjectId] (ref: Song),
  isPublic: Boolean (default: true),
  coverImage: String (URL),
  createdAt: Date,
  updatedAt: Date
}
```

### Relationer

- Artist → Album (1:N)
- Artist → Song (1:N)
- Album → Song (1:N)
- User → Playlist (1:N)
- Playlist → Song (N:M)

---

## 🛠️ Scripts

```bash
# Starta servern
npm start              # Production mode
npm run dev            # Development med nodemon

# Database seeding
npm run seed:admin     # Skapa admin user från .env
npm run seed           # Seedа artister, album, låtar från JSON
npm run seed:playlists # Skapa kurerade spellistor

# Utils
npm run generate:secrets  # Generera säkra JWT secrets
```

### Seed Data

1. **Skapa admin:**

```bash
npm run seed:admin
```

Använder credentials från `.env` filen.

2. **Seedа musik-data:**

```bash
npm run seed
```

Laddar in artister, album och låtar från `data/musicData.json`.

3. **Skapa spellistor:**

```bash
npm run seed:playlists
```

Skapar kurerade spellistor baserat på genre/tema.

---

## 🔐 Säkerhet

### Implementerade Säkerhetsåtgärder

✅ **Password Security**

- bcrypt hashning med salt rounds
- Minimum 8 tecken
- Password inte selectable by default

✅ **JWT Security**

- Separata secrets för access & refresh tokens
- Korta access token livslängder
- Refresh token rotation
- httpOnly cookies för refresh tokens

✅ **Input Validation**

- Express-validator för all input
- Email format validation
- Required fields checking
- Data sanitization

✅ **CORS Protection**

- Whitelist för allowed origins
- Credentials support
- Configured methods

✅ **Rate Limiting**

- Login endpoint rate limited
- Förhindrar brute force attacks

✅ **Error Handling**

- Centralized error handler
- No sensitive data i error messages
- Development vs production error responses

✅ **Database Security**

- MongoDB connection string i environment variables
- Mongoose schema validation
- No raw queries

### Best Practices

- ✅ Environment variables för secrets
- ✅ HTTPS i production (rekommenderat)
- ✅ Regular dependency updates
- ✅ Input sanitization
- ✅ Logged errors utan sensitive data

---

## 📝 Exempel på API-användning

### Registrera och Logga In

```bash
# Registrera ny användare
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepass123"
  }'

# Logga in
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepass123"
  }'
```

### Använd Access Token

```bash
# Hämta egen profil
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Sök låtar
curl -X GET "http://localhost:3000/api/songs?q=love"

# Skapa spellista (kräver auth)
curl -X POST http://localhost:3000/api/playlists \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Playlist",
    "description": "Best songs ever",
    "isPublic": true
  }'
```

---

## 🐛 Felsökning

### Vanliga Problem

**Problem:** `JWT_SECRET is not defined`

- **Lösning:** Kör `npm run generate:secrets` och lägg till i `.env`

**Problem:** `MongoDB connection failed`

- **Lösning:** Kontrollera MONGODB_URI i `.env`, whitelist IP i MongoDB Atlas

**Problem:** `CORS error from frontend`

- **Lösning:** Sätt rätt FRONTEND_URL i `.env`

**Problem:** `Unauthorized 401 error`

- **Lösning:** Kontrollera att access token skickas i Authorization header

### Logs

Servern loggar alla requests med Morgan i development mode:

```
GET /api/songs 200 45.123 ms
POST /api/auth/login 401 12.456 ms
```

---

## 📄 Licens

ISC

---

## 👨‍💻 Utvecklare

Byggt med ❤️ för musikälskare
