# Brainimation UI - Mental Health Companion Web App

A progressive web application designed to support mental health and wellness through interactive exercises, mood tracking, AI-powered guidance, and immersive meditation experiences.

## 🌟 Features

### Core Wellness Features
- **Agentic Mood Automation**: Sense → Plan → Support workflow that detects mood (DeepFace-ready), assembles rituals, and updates the UI theme before the user clicks anything.
- **Full-width Landing Experience**: Desktop-first hero with stats, trust indicators, cinematic photography, and CTA pairs that highlight the agentic flow.
- **Mood Detection**: Real-time mood detection via camera with AI analysis and personalized recommendations.
- **Exercises**: Guided breathing techniques, grounding exercises, and meditation practices
  - 4-7-8 Breathing, Box Breathing, Relaxing Breath
  - 5-4-3-2-1 Grounding technique
  - Body Scan meditation and Sleep Preparation
- **Journal**: Private journaling with mood tracking and writing prompts
- **Music Space**: Curated wellness music with mood-based filtering
- **Games**: Mindful games including Memory matching and Bubble Popper
- **Books**: Wellness resource library with reading progress tracking
- **Community**: Connect with others, share experiences, and find support
- **Voice Agent**: AI-powered voice assistant that greets users on dashboard load and narrates planned rituals
- **Crisis Support**: Quick access to crisis resources and immediate help

### Latest Landing Page Updates
- Hero now stretches across 27” displays with layered gradients, depth, and motion.
- Stats + trust indicators highlight usage metrics (rituals completed, streaks, specialists).
- Benefit tiles, feature grid, and testimonials use full-width grids with motion triggers.
- Closing CTA card showcases Lumi with auto voice cue messaging.

### Interactive Onboarding
- First-time user experience with Lumi character guidance
- 4-step interactive onboarding flow
- Persistent state management with localStorage
- Smooth animations and transitions

### Technical Features
- **Sound Effects**: Web Audio API synthesis for immersive feedback
  - Game sounds (correct match, wrong match, level up, etc.)
  - Meditation sounds (breathing cues, mindfulness chimes)
  - Ambient background music
- **Animations**: Framer Motion-powered smooth transitions and visual feedback
- **Dark Mode**: Full dark mode support with theme toggle
- **Responsive Design**: Mobile-first responsive layout
- **Progressive Web App**: Installable as native app with offline support
- **Session Management**: Secure Express-session with HttpOnly cookies

## 🏗️ Project Structure

```
BrainimationUI/main/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── animations/        # Animation components (Lumi, breathing, visualizations)
│   │   │   ├── layout/            # Page layout (Header, Nav, CrisisButton)
│   │   │   ├── ui/                # Reusable UI components
│   │   │   ├── Onboarding.tsx     # First-time user experience
│   │   │   ├── ThemeProvider.tsx  # Dark mode theming
│   │   │   └── ThemeToggle.tsx    # Theme switcher
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx      # Main dashboard (entry point)
│   │   │   ├── Landing.tsx        # Public landing page
│   │   │   ├── Login.tsx          # Authentication
│   │   │   ├── MoodDetection.tsx  # Mood camera & selection
│   │   │   ├── Exercises.tsx      # Guided exercises
│   │   │   ├── Journal.tsx        # Digital journal
│   │   │   ├── MusicSpace.tsx     # Music library
│   │   │   ├── GamesSpace.tsx     # Mindful games
│   │   │   ├── BooksSpace.tsx     # Book resources
│   │   │   ├── Community.tsx      # Social features
│   │   │   ├── VoiceAgent.tsx     # Voice assistant
│   │   │   ├── Crisis.tsx         # Crisis support
│   │   │   └── not-found.tsx      # 404 page
│   │   ├── hooks/
│   │   │   ├── useAuth.ts         # Authentication state
│   │   │   ├── useOnboarding.ts   # Onboarding persistence
│   │   │   └── use-toast.ts       # Toast notifications
│   │   ├── lib/
│   │   │   ├── soundManager.ts    # Web Audio API sounds
│   │   │   ├── authUtils.ts       # Auth utilities
│   │   │   ├── aiMocks.ts         # Mock AI responses
│   │   │   └── utils.ts           # General utilities
│   │   ├── App.tsx                # Main app component
│   │   └── main.tsx               # Entry point
│   ├── public/
│   │   ├── manifest.json          # PWA manifest
│   │   └── [background images]
│   └── index.html
├── server/
│   ├── index.ts                   # Express server
│   ├── auth.ts                    # Authentication routes
│   ├── routes.ts                  # API endpoints
│   ├── db.ts                      # Database setup
│   ├── storage.ts                 # File storage
│   └── vite.ts                    # Vite integration
├── shared/
│   └── schema.ts                  # TypeScript types & schemas
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── drizzle.config.ts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser with Web Audio API support

### Installation

1. **Clone and Install**
```bash
cd BrainimationUI/main
npm install
```

2. **Environment Setup**
Create `.env` file (if needed):
```env
VITE_API_URL=http://localhost:5000
```

3. **Development Server**
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

4. **Build for Production**
```bash
npm run build
npm run preview
```

## 📚 Key Components

### Authentication Flow
1. **Landing Page** → Desktop-first storytelling + CTA
2. **Login Page** → Currently uses mock personas for demo exploration (pending integration with real IdP)
3. **Dashboard** → Main app (shows onboarding on first visit)
4. **Onboarding** → 4-step interactive guide
5. **Mood Detection** → Quick mood check (from onboarding)
6. **All Spaces** → Access to wellness features

### Onboarding System
- **Step 1**: Lumi character greeting with floating animation
- **Step 2**: Mood detection explanation (30 seconds)
- **Step 3**: Camera/mood selection redirect
- **Step 4**: Completion confirmation
- Stored in localStorage to persist across sessions
- Can be reset for testing via `useOnboarding().resetOnboarding()`

### Sound System
Built with Web Audio API synthesis (no external files needed):

**Game Sounds**
```typescript
soundManager.playGameSound('correctMatch')  // Success sound
soundManager.playGameSound('wrongMatch')    // Error sound
soundManager.playGameSound('levelUp')       // Achievement sound
soundManager.playGameSound('gameStart')     // Game initiation
```

**Meditation Sounds**
```typescript
soundManager.playBreatheIn()   // 528Hz healing frequency
soundManager.playBreatheOut()  // 440Hz (A4 note)
```

**Interaction Sounds**
```typescript
soundManager.playClick()       // UI interaction
soundManager.playSuccess()     // Completion/success
soundManager.playError()       // Error/failure
```

## 🎨 Design System

### Colors
- **Primary**: Purple/Indigo (wellness, calm)
- **Accent**: Cyan/Teal (energy, focus)
- **Success**: Green (completion, positive)
- **Error**: Red (alerts, attention)
- **Mood Colors**: 
  - Happy: Yellow
  - Sad: Blue
  - Anxious: Orange
  - Tired: Purple
  - Stressed: Red
  - Neutral: Gray

### Typography
- **Display**: Bold, large (headings)
- **Semibold**: Action items, cards
- **Regular**: Body text
- **Small**: Descriptions, captions

### Animations
- **Page Transitions**: Fade in/out with 0.3s duration
- **Card Hover**: Elevation with shadow
- **Button Interactions**: Scale and color feedback
- **List Items**: Staggered animation with 50ms delay
- **Current Step**: Pulse animation for active state

## 🤖 Agentic Mood Flow

| Step | Description | Implementation |
|------|-------------|----------------|
| Sense | Blend camera mood detection (DeepFace-ready) with recent activity and journals | `MoodDetection.tsx`, `/api/mood` |
| Plan | Ollama-backed planner (coming soon) assembles rituals (breathwork, journaling, invites) | Server `routes.ts` + upcoming `agentPlan` service |
| Support | Lumi voice agent speaks immediately on dashboard load, guiding through the plan | `VoiceAgent.tsx`, `/api/voice-agent` |

> **Note:** Until real auth + data sources land, the project still exposes mock personas via `/api/auth/demo-users`. Removing those mocks will require plugging in your identity provider and database in `server/auth.ts` and `server/storage.ts`.

## 🔐 Authentication

### Session Management
- Express-session with secure HttpOnly cookies
- 7-day session expiry
- Automatic cleanup of expired sessions
- Protected API routes via middleware

### User Data
- Secure password handling
- Session-based authentication (mock personas for demo mode; swap with real IdP)
- User profiles and preferences
- Journal entries and mood history

## 🎮 Exercises & Games

### Breathing Exercises
- **4-7-8 Breathing**: Classic anxiety reduction (3 min)
- **Box Breathing**: Navy SEAL technique (4 min)
- **Relaxing Breath**: Gentle stress relief (2 min)

### Grounding Techniques
- **5-4-3-2-1**: Sensory awareness exercise (5 min)
- **Body Scan**: Progressive muscle relaxation (10 min)
- **Sleep Prep**: Bedtime meditation (8 min)

### Games
- **Memory Match**: Mindful pattern recognition
- **Bubble Popper**: Stress relief through interaction
- Sound effects for correct/incorrect actions
- Progress tracking and level system

## 📊 Mood Tracking

### Detection Methods
1. **Camera-based**: AI-powered facial emotion recognition
2. **Manual Selection**: Simple mood buttons
3. **Journal Integration**: Mood tagging with entries

### Recommendations
- Activity suggestions based on detected mood
- Personalized exercise recommendations
- Music playlist suggestions
- Community support resources

## 🌐 Community Features

### Posts & Interaction
- Create wellness posts and updates
- Comment and reply system
- Like/upvote posts
- Search and filter by category
- Mood-based sorting

### Categories
- Motivation & Support
- Daily Wellness Tips
- Mental Health Resources
- Success Stories
- Ask for Help

## 📱 Progressive Web App

### Installation
- Add to home screen on mobile
- Works offline with service worker
- App icon and splash screen
- Full-screen launch experience

### Manifest
Configured in `public/manifest.json`:
- App name: "Soul: Mental Health Companion"
- Icon: App branding
- Theme colors: Purple/Indigo
- Display: Standalone fullscreen

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # TypeScript type checking
npm run lint         # Lint code
```

### Technology Stack
- **Frontend**: React 18.3 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Routing**: Wouter (lightweight)
- **Animations**: Framer Motion
- **State**: React Query + custom hooks
- **Forms**: React Hook Form + Zod validation
- **Server**: Express.js
- **Database**: Drizzle ORM
- **Build**: Vite

### Type Safety
- Full TypeScript coverage
- Shared types between client & server
- Zod schema validation
- React Query type inference

## 🎯 Wellness Features

### Daily Routine Support
- Morning breathing exercises
- Midday stress relief
- Evening journal prompts
- Bedtime meditation

### Mood Check-ins
- Quick mood selection
- Confidence tracking
- Pattern recognition over time
- Trend visualization

### Resource Library
- 50+ meditation guides
- Wellness books and articles
- Exercise instructions
- Music playlists

## 🚀 Performance

### Optimizations
- Code splitting with Vite
- Image optimization
- Lazy loading for routes
- Efficient re-renders with React Query
- Web Audio API synthesis (no external audio files)

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## 📈 Analytics & Tracking

### User Metrics
- Session duration
- Exercises completed
- Mood trend patterns
- Community engagement
- Feature usage statistics

## 🛡️ Security

- HTTPS in production
- Secure session cookies
- CSRF protection
- Input validation (Zod)
- Rate limiting on API endpoints
- User data privacy

## 🤝 Contributing

This is an internal project for Soul Mental Health Platform. For contributions:
1. Follow the existing code style
2. Ensure TypeScript types are properly defined
3. Add animations for better UX
4. Test on mobile devices
5. Update documentation

## 📝 License

Proprietary - Soul Mental Health Platform

## 💬 Support

For issues or questions:
- Check existing issues in the repository
- Review documentation in code comments
- Test with browser DevTools console
- Verify localStorage state in DevTools

## 🎓 Learning Resources

### Key Files to Study
- `client/src/components/Onboarding.tsx` - Animation patterns & state management
- `client/src/lib/soundManager.ts` - Web Audio API implementation
- `client/src/hooks/useOnboarding.ts` - localStorage persistence
- `client/src/pages/MoodDetection.tsx` - Complete flow example

### Animation Patterns
- Framer Motion with Spring physics
- Staggered list animations
- Modal transitions
- Hover effects
- Pulse animations for active states

## 🚀 Deployment

### Quick Start Deployment

#### Docker Compose (Recommended)
```bash
# Build and start all services
docker-compose up -d

# Verify health
curl http://localhost:5001/health
```

#### Traditional Deployment
```bash
# Install dependencies
npm install

# Run migrations
npm run db:push

# Build for production
npm run build

# Start server
npm start
```

### Deployment Platforms

- **Docker/Kubernetes**: Use provided `Dockerfile` and `docker-compose.yml`
- **Heroku**: `git push heroku main` (with PostgreSQL add-on)
- **AWS**: Deploy to ECS, RDS, or Elastic Beanstalk
- **Vercel**: Full-stack deployment with serverless backend
- **Railway**: Simple Git-based deployment with built-in DB

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📊 Monitoring & Operations

### Health Checks
- **Liveness**: `GET /health` - Application status
- **Readiness**: `GET /health/deep` - Full system check (DB connection)

### Logging & Monitoring
- Structured JSON logging with Winston
- Error tracking with Sentry
- Performance metrics with Prometheus
- Real-time monitoring with Grafana

See [MONITORING.md](./MONITORING.md) for complete setup guide.

## 🛡️ Security

### Built-in Security Features
- Secure session management with HttpOnly cookies
- CSRF protection on all forms
- Rate limiting on sensitive endpoints
- Input validation with Zod
- SQL injection prevention via ORM
- HTTPS enforcement in production
- Security headers (CSP, HSTS, X-Frame-Options)

### Security Setup
1. Rotate all environment secrets
2. Enable HTTPS with valid SSL certificates
3. Configure database user permissions
4. Set up backup strategy
5. Enable monitoring and alerting
6. Review SECURITY.md for checklist

See [SECURITY.md](./SECURITY.md) for comprehensive security guide.

## 📦 CI/CD Pipeline

Automated GitHub Actions workflow includes:

1. **Test Stage**
   - Type checking with TypeScript
   - Unit tests with Vitest
   - Code quality checks

2. **Build Stage**
   - Docker image creation
   - Push to container registry
   - Build artifacts verification

3. **Deploy Stage** (main branch only)
   - Automated deployment to production
   - Database migrations
   - Health checks post-deployment

Trigger deployments: `git push origin main`

## 🧪 Testing

### Run Tests
```bash
npm run test              # Run all tests
npm run test:ui          # Interactive test UI
npm run test:coverage    # Coverage report
```

### Test Structure
- API endpoint tests in `tests/api.test.ts`
- Component tests in component folders
- End-to-end tests with Cypress (optional)

## 📝 Documentation

- **[README.md](./README.md)** - Project overview and features
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment guides for all platforms
- **[MONITORING.md](./MONITORING.md)** - Observability and monitoring setup
- **[SECURITY.md](./SECURITY.md)** - Security best practices and checklist
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines (if applicable)

## 🌟 Future Roadmap

### Planned Features
- [ ] Replace mock auth + seeded data with real IdP + Postgres wiring (see `server/auth.ts` & `server/storage.ts`)
- [ ] Real AI mood detection backend (DeepFace or TensorFlow.js service)
- [ ] Voice processing and transcription (Ollama/Whisper)
- [ ] Advanced mood analytics dashboard with trends
- [ ] Social features expansion (group therapy, buddy system)
- [ ] Offline mode improvements with better sync
- [ ] Multi-language support (i18n)
- [ ] Integration with wearables (Apple Watch, Fitbit)
- [ ] Push notifications for reminders and checkups
- [ ] Export data (journal, mood history, reports)
- [ ] Advanced search and filtering across all spaces

### Performance Goals
- Target Lighthouse score: 95+
- First Contentful Paint: < 1s
- Time to Interactive: < 2s
- Core Web Vitals: All green
- 99.9% uptime SLA
- Sub-100ms API response time (p95)

### Infrastructure Improvements
- [ ] Multi-region deployment support
- [ ] Database read replicas
- [ ] CDN integration for static assets
- [ ] Advanced caching strategies
- [ ] Load balancing and auto-scaling
- [ ] Disaster recovery procedures
- [ ] Advanced logging and analytics

---

**Last Updated**: December 3, 2025  
**Version**: 1.0.0  
**Status**: Production Ready

## Quick Links

- 🐳 [Docker Setup](./Dockerfile)
- ⚙️ [Environment Variables](./.env.example)
- 📊 [GitHub Actions](./.github/workflows/ci-cd.yml)
- 🔧 [Development Scripts](./scripts/)
- 💾 [Database Config](./drizzle.config.ts)
