import type { Express, Request, Response, NextFunction, RequestHandler } from "express";
import session from "express-session";
import { storage } from "./storage";

interface MockUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  claims?: {
    sub: string;
  };
}

declare module "express-session" {
  interface SessionData {
    userId?: string;
    returnTo?: string;
  }
}

declare global {
  namespace Express {
    interface User extends MockUser {}
  }
}

const mockUsers: MockUser[] = [
  {
    id: "demo-1",
    email: "sophia@lumi.ai",
    firstName: "Sophia",
    lastName: "Ray",
    profileImageUrl: "https://i.pravatar.cc/150?img=47",
  },
  {
    id: "demo-2",
    email: "amir@lumi.ai",
    firstName: "Amir",
    lastName: "Chen",
    profileImageUrl: "https://i.pravatar.cc/150?img=59",
  },
  {
    id: "guest",
    email: "guest@example.com",
    firstName: "Guest",
    lastName: "User",
    profileImageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
];

export function setupMockAuth(app: Express) {
  app.set("trust proxy", 1);

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "mock-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    })
  );

  app.post("/api/mock/login", async (req: Request, res: Response) => {
    const { userId, email } = req.body ?? {};
    let user = mockUsers.find((candidate) => candidate.id === userId || candidate.email === email);
    if (!user) {
      user = mockUsers[0];
    }

    req.session.userId = user.id;
    const sharedProfile = {
      id: user.id,
      email: user.email,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      profileImageUrl: user.profileImageUrl ?? null,
    };

    await storage.upsertUser(
      user.id === "guest"
        ? {
            ...sharedProfile,
            isGuest: true,
            hasCompletedTour: false,
            currentMood: null,
          }
        : sharedProfile
    );

    res.json({ success: true, user });
  });

  // Backwards-compatible public auth endpoints (no Replit dependency)
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { userId, email } = req.body ?? {};
    let user = mockUsers.find((candidate) => candidate.id === userId || candidate.email === email);
    if (!user) {
      user = mockUsers[0];
    }

    req.session.userId = user.id;
    const sharedProfile = {
      id: user.id,
      email: user.email,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      profileImageUrl: user.profileImageUrl ?? null,
    };

    await storage.upsertUser(
      user.id === "guest"
        ? {
            ...sharedProfile,
            isGuest: true,
            hasCompletedTour: false,
            currentMood: null,
          }
        : sharedProfile
    );

    res.json({ success: true, user });
  });

  app.post("/api/mock/logout", (req: Request, res: Response) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
        return res.status(500).json({ success: false, message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
  });

  app.get("/api/auth/demo-users", (_req: Request, res: Response) => {
    res.json(
      mockUsers.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.profileImageUrl,
        tagline:
          user.id === "guest"
            ? "Try Lumi without any commitment"
            : user.id === "demo-2"
            ? "Product designer rediscovering balance"
            : "Grounded mindfulness coach",
        mood: user.id === "guest" ? "neutral" : user.id === "demo-2" ? "stressed" : "happy",
      }))
    );
  });
}

export const ensureAuthenticated: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await storage.getUser(userId);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  (req as any).user = {
    id: user.id,
    email: user.email ?? "",
    firstName: user.firstName,
    lastName: user.lastName,
    profileImageUrl: user.profileImageUrl,
    claims: {
      sub: user.id,
    },
  } satisfies MockUser;

  next();
};

export const optionalAuth: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.session.userId;

  if (!userId) {
    const guestUser: MockUser = {
      id: "guest",
      email: "guest@example.com",
      firstName: "Guest",
      lastName: "User",
      profileImageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      claims: { sub: "guest" },
    };
    (req as any).user = guestUser;
    return next();
  }

  const user = await storage.getUser(userId);
  if (!user) {
    const guestUser: MockUser = {
      id: "guest",
      email: "guest@example.com",
      firstName: "Guest",
      lastName: "User",
      profileImageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      claims: { sub: "guest" },
    };
    (req as any).user = guestUser;
    return next();
  }

  (req as any).user = {
    id: user.id,
    email: user.email ?? "",
    firstName: user.firstName,
    lastName: user.lastName,
    profileImageUrl: user.profileImageUrl,
    claims: {
      sub: user.id,
    },
  } satisfies MockUser;

  next();
};
