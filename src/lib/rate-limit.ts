// Sadə in-memory rate limiter (tək instansiyalı deploymentlər üçün kifayətdir).
// Production-da çoxlu instansiya işlədirsinizsə Redis əsaslı limiterə keçin (məs. Upstash).

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { success: false, remaining: 0, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count++;
  return { success: true, remaining: limit - bucket.count };
}

export function getClientKey(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || "unknown";
}
