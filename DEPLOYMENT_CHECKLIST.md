# Production Deployment Checklist

## Pre-Deployment

- [ ] All code reviewed and merged to main
- [ ] Tests passing (unit, integration, e2e)
- [ ] Database migrations tested locally
- [ ] Security audit completed
- [ ] Dependencies updated and audited
- [ ] No hardcoded secrets in code
- [ ] Performance testing completed
- [ ] Load testing completed
- [ ] Backup strategy verified
- [ ] Disaster recovery plan documented

## Infrastructure Setup

- [ ] Domain configured and DNS pointing to servers
- [ ] SSL/TLS certificates obtained (Let's Encrypt)
- [ ] PostgreSQL database provisioned and secured
- [ ] Redis cache provisioned
- [ ] Load balancer configured
- [ ] Auto-scaling policies configured
- [ ] Monitoring and logging infrastructure ready
- [ ] Error tracking (Sentry) configured
- [ ] Analytics (Google Analytics) configured
- [ ] CDN configured for static assets

## Environment Configuration

- [ ] All environment variables configured
- [ ] Secrets stored in secure vault (AWS Secrets Manager, etc.)
- [ ] DATABASE_URL pointing to production database
- [ ] SESSION_SECRET set to strong random value
- [ ] JWT_SECRET set to strong random value
- [ ] OPENAI_API_KEY configured
- [ ] SENTRY_DSN configured
- [ ] Email service configured for notifications
- [ ] Backup credentials configured

## Security Hardening

- [ ] SSL/TLS enforced (HTTPS only)
- [ ] Security headers configured in Nginx
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] CSRF protection enabled
- [ ] Database user permissions restricted
- [ ] SSH key-based authentication only
- [ ] Firewall rules configured
- [ ] DDoS protection enabled
- [ ] Regular security updates scheduled

## Monitoring & Alerting

- [ ] Health checks configured
- [ ] Uptime monitoring (UptimeRobot, etc.)
- [ ] Error tracking (Sentry) active
- [ ] Performance metrics (Prometheus) collecting
- [ ] Log aggregation (ELK/CloudWatch) active
- [ ] Alert channels configured (Slack, PagerDuty)
- [ ] Dashboard (Grafana) created and accessible
- [ ] On-call rotation established
- [ ] Incident response plan documented

## Deployment Steps

### 1. Database Preparation

```bash
# Backup existing database (if upgrading)
pg_dump $PRODUCTION_DATABASE_URL > backup_$(date +%s).sql

# Run migrations
DATABASE_URL=$PRODUCTION_DATABASE_URL npm run db:push
```

### 2. Application Deployment

```bash
# Build Docker image
docker build -t brainimation:latest .

# Tag with version
docker tag brainimation:latest brainimation:$(git describe --tags)

# Push to registry
docker push brainimation:latest

# Update docker-compose
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Verify health
curl https://api.brainimation.com/health
```

### 3. Smoke Tests

```bash
# Health check
curl -f https://api.brainimation.com/health || exit 1

# Login test
curl -X POST https://api.brainimation.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}' || exit 1

# Frontend availability
curl -f https://brainimation.com || exit 1
```

### 4. Post-Deployment Verification

- [ ] Frontend loads successfully
- [ ] Authentication works
- [ ] Database queries working
- [ ] API endpoints responding
- [ ] Error tracking functional
- [ ] Logs flowing to aggregation service
- [ ] Metrics being collected
- [ ] Alerts functioning
- [ ] Performance acceptable
- [ ] No unusual error rates

## Rollback Plan

If issues detected:

```bash
# Rollback to previous version
docker-compose -f docker-compose.prod.yml pull brainimation:previous
docker-compose -f docker-compose.prod.yml up -d

# Rollback database (if needed)
# Restore from backup
psql $PRODUCTION_DATABASE_URL < backup_$TIMESTAMP.sql
```

## Post-Deployment

- [ ] Monitor error rates for 24 hours
- [ ] Performance metrics within targets
- [ ] No unexpected database load
- [ ] User feedback positive
- [ ] Logs analyzed for issues
- [ ] Deployment documented
- [ ] Team notified of changes
- [ ] Analytics showing normal traffic
- [ ] Backup verified
- [ ] Documentation updated

## Maintenance Windows

- **Regular**: Database maintenance windows (Tuesdays, 2-4 AM UTC)
- **Dependency updates**: Monthly security updates
- **Certificate renewal**: Automatic (Let's Encrypt)
- **Backups**: Daily at 1 AM UTC

## Success Criteria

✅ Deployment successful when:

1. All smoke tests pass
2. Error rate < 0.1%
3. p95 response time < 500ms
4. 99.9% uptime maintained
5. No critical alerts triggered
6. Users reporting normal experience
7. Zero database issues
8. All monitoring systems operational
9. Backup verified and accessible
10. Team consensus on stability

## Support Contacts

- **On-Call**: Check PagerDuty rotation
- **Slack Channel**: #brainimation-incidents
- **Email**: ops@brainimation.com
- **Emergency**: +1-XXX-XXX-XXXX

## Additional Resources

- [Deployment Guide](./DEPLOYMENT.md)
- [Security Guidelines](./SECURITY.md)
- [Monitoring Setup](./MONITORING.md)
- [Troubleshooting](./docs/troubleshooting.md)

---

**Last Updated**: December 3, 2025
**Prepared By**: DevOps Team
**Status**: Ready for Production
