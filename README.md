# 🎵 Music App - Full Stack Projekt

En modern musikstreaming-applikation byggd med React och Node.js. Komplett med JWT-autentisering, MongoDB-databas, avancerad musikspelare och sökfunktionalitet.

---

## 📖 Översikt

Detta är ett fullständigt full stack-projekt som demonstrerar moderna webbutvecklingstekniker:

- **Backend:** REST API med Express.js, MongoDB och JWT-autentisering
- **Frontend:** React-applikation med Context API, custom hooks och musikspelare
- **Features:** Autentisering, rollbaserad åtkomst, sök, spellistor och mer

---

## 🚀 Snabbstart

### 1. Backend (API)

```bash
cd backend
npm install
cp .env.example .env
npm run generate:secrets
# Konfigurera .env med MongoDB URI och secrets
npm run seed:admin
npm run seed
npm run dev
```

Servern körs på `http://localhost:3000`

📚 **[Läs fullständig Backend-dokumentation →](backend/README.md)**

### 2. Frontend (React App)

```bash
cd frontend
npm install
npm run dev
```

Appen körs på `http://localhost:5173`

📚 **[Läs fullständig Frontend-dokumentation →](frontend/README.md)**

---

## 🏗️ Teknisk Stack

### Backend

- **Runtime:** Node.js 18+ (ES Modules)
- **Framework:** Express.js
- **Databas:** MongoDB Atlas (Mongoose)
- **Auth:** JWT (Access & Refresh Tokens)
- **Säkerhet:** bcrypt, CORS, Rate Limiting, httpOnly cookies
- **Validering:** Express-validator

### Frontend

- **Framework:** React 19.2.0
- **Routing:** React Router DOM 7.13.1
- **Build:** Vite 7.3.1
- **Styling:** CSS Modules
- **State:** Context API
- **Auth:** JWT med automatisk token refresh

---

## ✨ Huvudfunktioner

### 🔐 Autentisering & Säkerhet

- JWT-baserad autentisering med access & refresh tokens
- Refresh token i httpOnly cookies (XSS-skydd)
- Automatisk token refresh (transparent för användare)
- Rollbaserad åtkomstkontroll (user/admin)
- Bcrypt lösenordshashning

### 🎵 Musikfunktioner

- Sök låtar, artister och album
- Full-featured musikspelare med play/pause/skip
- Spellisthantering (skapa, redigera, ta bort)
- Artist- och albumsidor med detaljerad info
- Cross-page persistent musikspelare

### 👥 Användarfunktioner

- Registrering och inloggning
- Användarbibliotek
- Personliga spellistor
- Protected routes för autentiserade användare

### 🛠️ Admin-funktioner

- Skapa/uppdatera/ta bort artister
- Hantera album och låtar
- Fullständig CRUD-kontroll över musikdata

---

## 📁 Projektstruktur

```
musicapp-project/
├── backend/              # REST API (Node.js + Express)
│   ├── config/           # Environment konfiguration
│   ├── controllers/      # Business logic
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API endpoints
│   ├── middleware/       # Auth, validering, error handling
│   ├── repositories/     # Data access layer
│   ├── scripts/          # Seed & utility scripts
│   ├── utils/            # Helper functions
│   └── README.md         # Detaljerad backend-dokumentation
├── frontend/             # React Application
│   ├── src/
│   │   ├── components/   # Återanvändbara UI-komponenter
│   │   ├── pages/        # Route-baserade pages
│   │   ├── context/      # React Context (Auth, Player, Theme)
│   │   ├── hooks/        # Custom hooks (useAuth, usePlayer)
│   │   ├── services/     # API kommunikation
│   │   ├── constants/    # Routes, API constants
│   │   └── utils/        # Helper functions
│   └── README.md         # Detaljerad frontend-dokumentation
└── README.md             # Denna fil (projektöversikt)
```

---

## 🎯 Avancerade Koncept & Patterns

Detta projekt demonstrerar flera avancerade tekniker:

### Backend

- ✅ **Layered Architecture** (Routes → Controllers → Repositories → Models)
- ✅ **Repository Pattern** för databasabstraktion
- ✅ **Middleware Pipeline** för validering och auth
- ✅ **Custom Error Handling** med centraliserad error handler
- ✅ **JWT Refresh Token Rotation** för extra säkerhet
- ✅ **Environment Validation** vid server start

### Frontend

- ✅ **Context API** för global state (Auth, Player, Theme)
- ✅ **Custom Hooks** för återanvändbar logik
- ✅ **Protected Routes** med authentication guards
- ✅ **Service Layer** för API-abstraktion
- ✅ **Automatic Token Refresh** (transparent för användaren)
- ✅ **CSS Modules** för scoped styling
- ✅ **Persistent Audio Player** across page navigation

---

## 📚 Detaljerad Dokumentation

För mer information om specifika delar av projektet:

### 📘 [Backend README](backend/README.md)

Innehåller:

- Installation & konfiguration
- API endpoints (fullständig referens)
- Autentiseringsflöde
- Databasschema
- Scripts & seeding
- Säkerhetsimplementation
- Exempel på API-användning
- Troubleshooting

### 📗 [Frontend README](frontend/README.md)

Innehåller:

- Installation & setup
- Context API arkitektur
- Custom hooks (useAuth, usePlayer, useFetch)
- Routing & navigation
- Protected routes implementation
- Component structure
- State management
- Best practices
- Avancerade koncept

---

## 🔧 Utvecklingsverktyg

### Backend Development

```bash
npm run dev              # Starta dev server med nodemon
npm run seed:admin       # Skapa admin user
npm run seed             # Seedа musikdata
npm run generate:secrets # Generera JWT secrets
```

### Frontend Development

```bash
npm run dev              # Starta Vite dev server
npm run build            # Bygga för production
npm run preview          # Preview production build
npm run lint             # Kör ESLint
```

---

## 🚦 API Endpoints (Snabbreferens)

**Base URL:** `http://localhost:3000/api`

### Publika Endpoints

```
GET    /artists          - Hämta alla artister
GET    /artists/:id      - Hämta specifik artist
GET    /albums           - Hämta alla album
GET    /songs            - Hämta alla låtar
GET    /songs?q=search   - Sök låtar
POST   /auth/register    - Registrera ny användare
POST   /auth/login       - Logga in
```

### Autentiserade Endpoints

```
GET    /users/me         - Hämta egen profil
POST   /playlists        - Skapa spellista
PUT    /playlists/:id    - Uppdatera spellista
POST   /auth/logout      - Logga ut
```

### Admin Endpoints

```
POST   /artists          - Skapa artist
PUT    /artists/:id      - Uppdatera artist
DELETE /artists/:id      - Ta bort artist
POST   /songs            - Skapa låt
```

**Se [Backend README](backend/README.md) för fullständig API-dokumentation**

---

## 🔐 Miljövariabler

### Backend (.env)

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
PORT=3000
FRONTEND_URL=http://localhost:5173
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=...
```

### Frontend

API URL konfigureras i `frontend/src/constants/api.js`:

```javascript
export const API_BASE_URL = "http://localhost:3000/api";
```

---

## 🎓 Lärdomar & Syfte

Detta projekt är byggt för att demonstrera:

1. **Full Stack Development** - Backend och frontend integration
2. **Modern React** - Context API, hooks, routing
3. **RESTful API Design** - Proper endpoints och HTTP methods
4. **Authentication & Authorization** - JWT med refresh tokens
5. **Database Design** - MongoDB relations och schemas
6. **Security Best Practices** - Encryption, CORS, validation
7. **Code Organization** - Layered architecture, separation of concerns
8. **Developer Experience** - Scripts, documentation, error handling

---

## 📦 Databasöversikt

### Collections

- **users** - Användarkonton (username, email, password, role)
- **artists** - Artister (namn, bio, genres, bild)
- **albums** - Album (titel, artist, år, cover)
- **songs** - Låtar (titel, artist, album, duration, audioUrl)
- **playlists** - Spellistor (namn, användare, låtar)

### Relationer

```
User → Playlist (1:N)
Artist → Album (1:N)
Artist → Song (1:N)
Album → Song (1:N)
Playlist → Song (N:M)
```

---

## 🐛 Troubleshooting

### Backend startar inte

- ✅ Kontrollera MongoDB URI i `.env`
- ✅ Kör `npm run generate:secrets` för JWT secrets
- ✅ Whitelist IP i MongoDB Atlas

### Frontend får CORS-error

- ✅ Sätt rätt `FRONTEND_URL` i backend `.env`
- ✅ Kontrollera att backend körs

### Autentisering fungerar inte

- ✅ Kontrollera att JWT secrets är satta
- ✅ Clear localStorage i browser
- ✅ Kolla att cookies är aktiverade

**För mer detaljer, se respektive README:**

- [Backend Troubleshooting](backend/README.md#-felsökning)
- [Frontend Troubleshooting](frontend/README.md#-troubleshooting)

---

## 🚀 Deployment Tips

### Backend (t.ex. Render, Railway)

```bash
npm start
# Sätt NODE_ENV=production
# Konfigurera environment variables
# Sätt domän för FRONTEND_URL
```

### Frontend (t.ex. Vercel, Netlify)

```bash
npm run build
# Uppdatera API_BASE_URL till production backend
# Deploy från dist/ mappen
```

---

## 📝 TODO / Future Features

Potentiella förbättringar:

- [ ] TypeScript migration
- [ ] React Query för API state
- [ ] Admin dashboard (frontend)
- [ ] Social features (följ artister, dela spellistor)
- [ ] Audio visualizer
- [ ] Infinite scroll för låtlistor
- [ ] PWA support (offline listening)
- [ ] WebSocket för real-time updates
- [ ] Unit & integration tests
- [ ] CI/CD pipeline

---

## 📄 Licens

ISC

---

## 👨‍💻 Utvecklare

Byggt med ❤️ som ett full stack-projekt för att demonstrera moderna webbutvecklingstekniker.

---

## 📖 Kom Igång Nu

1. **Kör Backend:** Se [Backend README](backend/README.md)
2. **Kör Frontend:** Se [Frontend README](frontend/README.md)
3. **Testa API:et:** Använd Postman eller frontend:en
4. **Utforska koden:** Detaljerad dokumentation i respektive README

**Lycka till med kodandet! 🎵**
