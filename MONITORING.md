# Monitoring & Observability Guide

## Health Checks

### Application Health Endpoint

Add this to `server/routes.ts`:

```typescript
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

app.get('/health/deep', async (req: Request, res: Response) => {
  try {
    // Check database connection
    await db.query('SELECT 1');
    
    return res.json({
      status: 'ok',
      database: 'connected',
      api: 'running',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(503).json({
      status: 'error',
      database: 'disconnected',
      error: error.message,
    });
  }
});
```

## Logging

### Structured Logging Setup

Install logging package:

```bash
npm install winston
```

Create `lib/logger.ts`:

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'brainimation' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
```

### Usage

```typescript
import logger from './lib/logger';

logger.info('User logged in', { userId: user.id });
logger.error('Database error', { error: err });
logger.warn('Rate limit reached', { ip: req.ip });
```

## Error Tracking with Sentry

Install Sentry:

```bash
npm install @sentry/node @sentry/tracing
```

Initialize in `server/index.ts`:

```typescript
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Tracing.Integrations.Express({ app, request: true }),
  ],
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// ... routes ...

app.use(Sentry.Handlers.errorHandler());
```

## Performance Monitoring

### Browser Performance (Frontend)

```typescript
// client/src/lib/analytics.ts
export function trackPageLoad(pageName: string) {
  if (window.performance) {
    const navigation = window.performance.getEntriesByType('navigation')[0];
    const paint = window.performance.getEntriesByType('paint');
    
    console.log(`Page: ${pageName}`);
    console.log(`Load time: ${navigation.loadEventEnd - navigation.loadEventStart}ms`);
    console.log(`FCP: ${paint.find(p => p.name === 'first-contentful-paint')?.startTime}ms`);
  }
}

export function trackUserAction(action: string, metadata?: object) {
  // Send to analytics service
  console.log(`Action: ${action}`, metadata);
}
```

### Server Performance

```typescript
// server/middleware/performance.ts
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) {
      logger.warn(`Slow request: ${req.method} ${req.path}`, { duration });
    }
  });
  
  next();
});
```

## Metrics Collection

### Prometheus Metrics

Install:

```bash
npm install prom-client
```

Setup:

```typescript
import promClient from 'prom-client';

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 5, 15, 50, 100, 500],
});

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(Date.now() - start);
  });
  next();
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
```

## Alerts & Notifications

### Alert Rules

Create `monitoring/alerting.yaml`:

```yaml
alerts:
  - name: HighErrorRate
    condition: error_rate > 0.05
    duration: 5m
    action: notify_slack

  - name: DatabaseDown
    condition: database_up == 0
    duration: 1m
    action: notify_pagerduty

  - name: HighLatency
    condition: p95_latency > 1000ms
    duration: 10m
    action: notify_slack

  - name: DiskSpaceLow
    condition: disk_free < 20%
    duration: 5m
    action: notify_ops_team
```

### Slack Notifications

```typescript
import axios from 'axios';

async function notifySlack(message: string, severity: 'info' | 'warning' | 'error') {
  const color = severity === 'error' ? 'danger' : severity === 'warning' ? 'warning' : 'good';
  
  await axios.post(process.env.SLACK_WEBHOOK_URL, {
    attachments: [
      {
        color,
        text: message,
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  });
}
```

## Dashboard Recommendations

### Grafana Dashboard

Key metrics to track:

- Request rate (req/sec)
- Error rate (%)
- Response time (p50, p95, p99)
- Database connections
- CPU usage
- Memory usage
- Disk space
- Active users

### Example Grafana Config

```json
{
  "panels": [
    {
      "title": "Request Rate",
      "targets": [
        {
          "expr": "rate(http_requests_total[5m])"
        }
      ]
    },
    {
      "title": "Error Rate",
      "targets": [
        {
          "expr": "rate(http_requests_total{status=~\"5..\"}[5m])"
        }
      ]
    },
    {
      "title": "Response Time (p95)",
      "targets": [
        {
          "expr": "histogram_quantile(0.95, http_request_duration_ms_bucket)"
        }
      ]
    }
  ]
}
```

## Uptime Monitoring

### Using UptimeRobot

1. Create account at https://uptimerobot.com
2. Add monitor for `https://api.brainimation.com/health`
3. Set check interval: 5 minutes
4. Enable alerts for email/Slack

### Custom Monitoring Script

```bash
#!/bin/bash
# scripts/monitor.sh

HEALTH_URL="https://api.brainimation.com/health"
THRESHOLD=3
FAILURES=0

while true; do
  if curl -f $HEALTH_URL > /dev/null 2>&1; then
    FAILURES=0
    echo "[$(date)] ✓ Health check passed"
  else
    FAILURES=$((FAILURES + 1))
    echo "[$(date)] ✗ Health check failed (attempt $FAILURES)"
    
    if [ $FAILURES -ge $THRESHOLD ]; then
      # Send alert
      curl -X POST \
        -H "Content-Type: application/json" \
        -d "{\"text\":\"Application down after $FAILURES failed checks\"}" \
        $SLACK_WEBHOOK_URL
      FAILURES=0
    fi
  fi
  
  sleep 300  # Check every 5 minutes
done
```

## Log Aggregation

### ELK Stack (Elasticsearch, Logstash, Kibana)

```bash
# Using Docker Compose
docker-compose up -d elasticsearch logstash kibana
```

### Filebeat Configuration

```yaml
# filebeat.yml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /app/logs/*.log

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
```

## Database Monitoring

### Query Performance

```sql
-- Enable query logging
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();

-- Check slow queries
SELECT query, mean_time, stddev_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Connection Pooling

```typescript
// server/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
});
```

## Summary

Key monitoring practices:

1. ✅ Health checks on every deployment
2. ✅ Structured logging for all events
3. ✅ Error tracking with Sentry
4. ✅ Performance metrics with Prometheus
5. ✅ Visual monitoring with Grafana
6. ✅ Alerting for critical issues
7. ✅ Log aggregation with ELK
8. ✅ Database query monitoring
9. ✅ Uptime monitoring
10. ✅ Regular backup verification
