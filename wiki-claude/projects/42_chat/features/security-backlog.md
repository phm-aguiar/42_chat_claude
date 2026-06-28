---
title: "Security Backlog — 42 Chat"
category: feature
tags: [security, nginx, hardening, backlog, owasp, tls]
sources:
  - specs/features/SECURITY_BACKLOG.md
summary: "Backlog de hardening do nginx e da aplicação 42 Chat: SEC-001 a SEC-007 (rate limiting, TLS, WAF, JWT gateway, fail2ban, scanning CI, CSP)."
provenance:
  extracted: 0.95
  inferred: 0.05
  ambiguous: 0.00
base_confidence: 0.92
lifecycle: draft
lifecycle_changed: "2026-06-27"
tier: supporting
created: "2026-06-27T00:00:00Z"
updated: "2026-06-27T00:00:00Z"
---

# Security Backlog — 42 Chat

> Itens futuros para hardening do API Gateway (nginx) e da aplicação.
> Derivados da decisão de usar nginx como primeira barreira de segurança.
> Criado em 2026-06-17 durante setup do nginx gateway.

## Features Planejadas

### SEC-001: Rate Limiting + DDoS Mitigation

- Ativar `limit_req` e `limit_conn` já configurados no nginx.conf
- Rate limit por IP: 30 req/s com burst 20
- Conexões simultâneas: max 10 por IP
- Integrar com Redis para rate limiting distribuído (multi-instance)
- **Dependência:** nginx gateway (já deployado)
- **Esforço:** Baixo — configuração já preparada, só precisa ser ativada

### SEC-002: HTTPS/TLS + Let's Encrypt

- Terminação TLS no nginx (certbot + Let's Encrypt)
- Redirect HTTP → HTTPS automático
- HSTS header com `max-age=31536000; includeSubDomains; preload`
- Renovação automática via cron
- **Dependência:** domínio público + SEC-001

### SEC-003: WAF Básico (nginx + ModSecurity)

- ModSecurity com OWASP Core Rule Set (CRS)
- Bloqueio de SQL injection, XSS, path traversal
- Log de violações para análise
- **Dependência:** nginx gateway

### SEC-004: Autenticação JWT no Gateway

- Validar JWT no nginx (nginx-jwt ou lua-resty-jwt)
- Rejeitar requests sem token ANTES de chegar no backend Go
- Cache de chave pública do JWT
- **Dependência:** nginx gateway + OpenResty

### SEC-005: IP Ban + Fail2ban

- Fail2ban lendo logs do nginx
- Ban automático após 5 falhas de auth em 60s
- Integração com iptables/nftables
- **Dependência:** nginx gateway

### SEC-006: Security Scanning Pipeline

- OWASP ZAP ou Nikto scan automatizado no CI
- Dependency scanning (npm audit, go mod tidy)
- Container scanning (Trivy ou Snyk)
- Relatório no PR
- **Dependência:** CI/CD (GitHub Actions)

### SEC-007: CSP + Security Headers Hardening

- Content-Security-Policy granular
- Subresource Integrity (SRI) nos assets
- Feature-Policy / Permissions-Policy completo
- Report-Only mode → enforce depois de tuning
- **Dependência:** build do frontend

## Ordem de Implementação Sugerida

| Prioridade | Feature | Justificativa |
|---|---|---|
| 1 | SEC-001 | Baixo esforço, já configurado, impacto imediato |
| 2 | SEC-003 | Barreira de aplicação antes de TLS |
| 3 | SEC-004 | Validação precoce, menos carga no backend |
| 4 | SEC-002 | Requer domínio público |
| 5 | SEC-005 | Complementa SEC-001 |
| 6 | SEC-006 | Quality gate no CI |
| 7 | SEC-007 | Hardening avançado do frontend |

## Contexto

O nginx atual já tem `server_tokens off`, security headers básicos e zona de rate limiting definida (não ativada). SEC-001 é essencialmente flipar uma flag.

A [[projects/42_chat/features/feature-007-agent-qa|feature 009 (agent-pentester)]] do framework SDD pode ser integrada ao pipeline de segurança quando implementada.

## Relacionado

- [[projects/42_chat/42_chat|42_chat Project]] — Contexto do projeto
- [[references/42-chat-platform-architecture|Platform Architecture]] — Onde o nginx se encaixa
- [[references/42-chat-engineering-requirements|Engineering Requirements]] — NFRs de segurança
