# Security Policy

## Reporting a Vulnerability

Please report suspected security vulnerabilities privately via **GitHub Security Advisories** on this repository (`https://github.com/youssefmanssouri/gym-crm/security/advisories/new`). Do not disclose exploit details, credentials, or sensitive data in public issues.

## Security Controls

- **Session Integrity:** Session tokens are HMAC-SHA256 signed (`HttpOnly`, `SameSite=Lax`, `Secure` in production). Production (`NODE_ENV=production`) fails closed if `SESSION_SECRET` / `NEXTAUTH_SECRET` is missing or uses a default development key.
- **Role-Based Access Control:** Administrative, staff, and member API routes enforce server-side authentication (`requireAuth` / `requireRole`) and scope `MEMBER` queries to the authenticated user's own records.
- **Read-Only Demo Mode:** Public demo sessions carry a signed `demo: true` claim enforced by middleware to reject data-changing API requests.
- **Input Validation & Headers:** API payloads are validated with Zod; security headers (`CSP`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `HSTS`) are configured in `next.config.js`.
