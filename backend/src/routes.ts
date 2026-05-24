import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { createRecord } from './services';

const router = Router();

type RouteDefinition = {
  method: string;
  path: string;
  purpose: string;
  response_shape: any;
};

const routeDefinitions: RouteDefinition[] = [
  {
    "method": "get",
    "path": "/health",
    "purpose": "Return backend status, version, and active policy summary.",
    "response_shape": {
      "status": "ok",
      "service": "headerjack-api",
      "version": "string",
      "policy": {
        "auditOnly": "boolean",
        "maxConcurrency": "number",
        "maxRequestsPerRun": "number",
        "allowCustomHeaders": "boolean"
      }
    }
  },
  {
    "method": "get",
    "path": "/policy",
    "purpose": "Expose current execution constraints and validation rules.",
    "response_shape": {
      "allowlistRequired": "boolean",
      "auditOnly": "boolean",
      "restrictedMethods": [
        "string"
      ],
      "requiredHeaderNormalization": "boolean",
      "mutationCategories": [
        "string"
      ],
      "limits": {}
    }
  },
  {
    "method": "get",
    "path": "/allowlist",
    "purpose": "Fetch configured allowlist entries.",
    "response_shape": {
      "entries": [
        {}
      ]
    }
  },
  {
    "method": "post",
    "path": "/allowlist/validate",
    "purpose": "Validate prospective allowlist entries without saving.",
    "response_shape": {
      "valid": "boolean",
      "errors": [
        {}
      ],
      "normalizedEntries": [
        {}
      ]
    }
  },
  {
    "method": "put",
    "path": "/allowlist",
    "purpose": "Replace active allowlist with validated entries.",
    "response_shape": {
      "saved": "boolean",
      "entries": [
        {}
      ]
    }
  },
  {
    "method": "get",
    "path": "/profiles",
    "purpose": "List saved target profiles.",
    "response_shape": {
      "profiles": [
        {}
      ]
    }
  },
  {
    "method": "post",
    "path": "/profiles/validate",
    "purpose": "Validate a target profile against allowlist and policy constraints.",
    "response_shape": {
      "valid": "boolean",
      "errors": [
        {}
      ],
      "normalizedProfile": {}
    }
  },
  {
    "method": "post",
    "path": "/profiles",
    "purpose": "Create a target profile.",
    "response_shape": {
      "profile": {}
    }
  },
  {
    "method": "put",
    "path": "/profiles/:profileId",
    "purpose": "Update a target profile.",
    "response_shape": {
      "profile": {}
    }
  },
  {
    "method": "delete",
    "path": "/profiles/:profileId",
    "purpose": "Delete a target profile.",
    "response_shape": {
      "deleted": "boolean",
      "profileId": "string"
    }
  },
  {
    "method": "get",
    "path": "/cookies/:profileId",
    "purpose": "Retrieve scoped cookie jar entries for a profile.",
    "response_shape": {
      "profileId": "string",
      "cookies": [
        {}
      ]
    }
  },
  {
    "method": "put",
    "path": "/cookies/:profileId",
    "purpose": "Replace cookie jar entries for a profile.",
    "response_shape": {
      "saved": "boolean",
      "profileId": "string",
      "cookies": [
        {}
      ]
    }
  },
  {
    "method": "post",
    "path": "/mutations/preview",
    "purpose": "Generate a validated preview of baseline and mutated request variants.",
    "response_shape": {
      "planId": "string",
      "baseline": {},
      "variants": [
        {}
      ],
      "truncated": "boolean"
    }
  },
  {
    "method": "post",
    "path": "/runs",
    "purpose": "Start a replay run for a prepared mutation plan.",
    "response_shape": {
      "runId": "string",
      "status": "queued|running",
      "queuedCount": "number",
      "policyApplied": {}
    }
  },
  {
    "method": "get",
    "path": "/runs",
    "purpose": "List recent runs and statuses.",
    "response_shape": {
      "runs": [
        {}
      ]
    }
  },
  {
    "method": "get",
    "path": "/runs/:runId",
    "purpose": "Get run summary and current progress.",
    "response_shape": {
      "run": {}
    }
  },
  {
    "method": "post",
    "path": "/runs/:runId/cancel",
    "purpose": "Request cancellation of an active run.",
    "response_shape": {
      "runId": "string",
      "cancelRequested": "boolean",
      "status": "running|cancelled"
    }
  },
  {
    "method": "get",
    "path": "/runs/:runId/results",
    "purpose": "Retrieve normalized result records and heuristic findings for a run.",
    "response_shape": {
      "runId": "string",
      "baselineResultId": "string|null",
      "results": [
        {}
      ]
    }
  },
  {
    "method": "post",
    "path": "/exports/notes",
    "purpose": "Generate exportable notes and request templates from selected results.",
    "response_shape": {
      "format": "text|json",
      "generatedAt": "string",
      "content": "string",
      "requestTemplates": [
        {}
      ]
    }
  }
];

const users: Array<{ id: string; name: string; email: string; password?: string; createdAt: string }> = [];
const sessions = new Map<string, string>();
const attempts: any[] = [];

function success(res: Response, data: unknown) {
  return res.json({
    success: true,
    data,
    error: null
  });
}

function failure(res: Response, statusCode: number, code: string, message: string) {
  return res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      code,
      message,
      details: null
    }
  });
}

function readCookie(req: Request, name: string): string | null {
  const raw = req.headers.cookie || "";
  const parts = raw.split(";").map((part) => part.trim());
  const match = parts.find((part) => part.startsWith(name + "="));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function currentUser(req: Request) {
  const sessionId = readCookie(req, "damocles_session");
  if (!sessionId) return null;

  const userId = sessions.get(sessionId);
  if (!userId) return null;

  const user = users.find((candidate) => candidate.id === userId);
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  };
}

function createSession(res: Response, userId: string) {
  const sessionId = randomUUID();
  sessions.set(sessionId, userId);

  res.setHeader(
    "Set-Cookie",
    `damocles_session=${encodeURIComponent(sessionId)}; HttpOnly; Path=/; SameSite=Lax`
  );
}

function sampleScenarioSummary() {
  return {
    id: "starter",
    title: "Starter Record",
    difficulty: "beginner",
    category: "legitimate",
    completed: false,
    bestScore: null,
    maxScore: 100
  };
}

function sampleScenarioDetail(id: string) {
  return {
    id,
    title: "Starter Record",
    difficulty: "beginner",
    category: "legitimate",
    email: {
      fromName: "Training System",
      fromEmail: "training@example.com",
      replyToEmail: null,
      subject: "Starter training record",
      receivedAt: new Date().toISOString(),
      bodyText: "This is a safe generated starter record used to verify the app workflow.",
      displayLinks: [],
      attachments: [],
      metadataHints: []
    },
    availableRedFlags: [],
    maxScore: 100
  };
}

function sampleFeedback(id: string) {
  return {
    id,
    scenarioId: "starter",
    scenarioTitle: "Starter Record",
    classification: "legitimate",
    correctClassification: "legitimate",
    isClassificationCorrect: true,
    selectedRedFlags: [],
    correctSelectedRedFlags: [],
    incorrectSelectedRedFlags: [],
    missedRedFlags: [],
    scoreAwarded: 100,
    maxScore: 100,
    explanation: "The generated backend returned a valid starter feedback response.",
    preventionTips: ["Use the generated project workflow to replace starter records with domain-specific records."],
    submittedAt: new Date().toISOString()
  };
}

function valueFor(typeName: unknown, key: string, req: Request, res: Response): unknown {
  const type = String(typeName || "");

  if (key === "user") {
    return currentUser(req);
  }

  if (key === "loggedOut") {
    return true;
  }

  if (key === "status") {
    return "ok";
  }

  if (key === "service") {
    return "Generated Backend";
  }

  if (key === "version") {
    return "1.0.0";
  }

  if (key === "scenarios" || type.includes("ScenarioSummary[]")) {
    return [sampleScenarioSummary()];
  }

  if (key === "scenario" || type.includes("ScenarioDetail")) {
    return sampleScenarioDetail(req.params.scenarioId || "starter");
  }

  if (key === "attempts" || type.includes("AttemptSummary[]")) {
    return attempts.map((attempt) => ({
      id: attempt.id,
      scenarioId: attempt.scenarioId || "starter",
      scenarioTitle: "Starter Record",
      scoreAwarded: attempt.scoreAwarded || 100,
      maxScore: 100,
      isClassificationCorrect: true,
      submittedAt: attempt.submittedAt
    }));
  }

  if (key === "attempt" && type.includes("AttemptFeedback")) {
    return sampleFeedback(req.params.attemptId || "starter");
  }

  if (key === "attempt" || type.includes("AttemptResult")) {
    const attempt = createRecord({
      scenarioId: req.params.scenarioId || "starter",
      scoreAwarded: 100,
      maxScore: 100,
      submittedAt: new Date().toISOString(),
      feedbackPath: ""
    });
    attempts.push(attempt);

    return {
      id: attempt.id,
      scenarioId: attempt.scenarioId,
      isClassificationCorrect: true,
      scoreAwarded: 100,
      maxScore: 100,
      submittedAt: attempt.submittedAt,
      feedbackPath: `/attempts/${attempt.id}/feedback`
    };
  }

  if (key === "summary" || type.includes("ProgressSummary")) {
    return {
      userId: currentUser(req)?.id || "anonymous",
      completedScenarioCount: attempts.length,
      totalAttemptCount: attempts.length,
      averageScorePercent: attempts.length ? 100 : 0,
      classificationAccuracyPercent: attempts.length ? 100 : 0,
      bestScoreTotal: attempts.length * 100,
      maxPossibleScoreTotal: attempts.length * 100,
      recentStreak: attempts.length
    };
  }

  if (key === "resources" || type.includes("EducationalResource[]")) {
    return [
      {
        id: "resource-1",
        title: "Generated Project Guide",
        summary: "A starter guide served from the backend API.",
        content: "This generated backend is connected to the frontend through typed API calls.",
        category: "getting-started",
        estimatedReadMinutes: 3
      }
    ];
  }

  if (type.includes("[]")) {
    return [];
  }

  if (type.includes("boolean")) {
    return true;
  }

  if (type.includes("number")) {
    return 0;
  }

  if (type.includes("string")) {
    return "";
  }

  return null;
}

function buildData(shape: any, req: Request, res: Response): Record<string, unknown> {
  const dataShape = shape?.data;

  if (!dataShape || typeof dataShape !== "object") {
    return {};
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(dataShape)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = buildData({ data: value }, req, res);
    } else {
      result[key] = valueFor(value, key, req, res);
    }
  }

  return result;
}

router.post("/auth/register", (req, res) => {
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (!name || !email || password.length < 8) {
    return failure(res, 400, "VALIDATION_ERROR", "Name, valid email, and password with 8+ characters are required.");
  }

  const existing = users.find((user) => user.email === email);
  if (existing) {
    return failure(res, 409, "EMAIL_ALREADY_REGISTERED", "Email is already registered.");
  }

  const user = {
    id: randomUUID(),
    name,
    email,
    password,
    createdAt: new Date().toISOString()
  };

  users.push(user);
  createSession(res, user.id);

  return success(res, {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    }
  });
});

router.post("/auth/login", (req, res) => {
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";

  const user = users.find((candidate) => candidate.email === email && candidate.password === password);
  if (!user) {
    return failure(res, 401, "INVALID_CREDENTIALS", "Invalid email or password.");
  }

  createSession(res, user.id);

  return success(res, {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    }
  });
});

router.post("/auth/logout", (req, res) => {
  const sessionId = readCookie(req, "damocles_session");
  if (sessionId) {
    sessions.delete(sessionId);
  }

  res.setHeader("Set-Cookie", "damocles_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax");
  return success(res, { loggedOut: true });
});

router.get("/auth/session", (req, res) => {
  return success(res, { user: currentUser(req) });
});

for (const route of routeDefinitions) {
  const method = route.method.toLowerCase();

  if (route.path.startsWith("/auth/")) {
    continue;
  }

  if (typeof (router as any)[method] === "function") {
    (router as any)[method](route.path, (req: Request, res: Response) => {
      return success(res, buildData(route.response_shape, req, res));
    });
  }
}

export default router;
