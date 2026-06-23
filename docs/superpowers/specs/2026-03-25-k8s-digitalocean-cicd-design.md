# Design: k8s + DigitalOcean Droplet + GitHub Actions CI/CD

**Date:** 2026-03-25
**Status:** Approved by user

---

## Goal

Deploy `dafandikri/portfolio-website` to a self-managed k3s cluster on a DigitalOcean Droplet
as an infrastructure showcase for computer networks/cloud infra internship applications.
The existing Vercel deployment at `dafandikri.tech` is left untouched.

---

## Architecture

```
git push to main
    │
    ├── Vercel Git integration (unchanged)
    │       └── dafandikri.tech  (CDN, production)
    │
    └── GitHub Actions workflow
            │
            ▼
        1. Build Docker image (TMDB_API_KEY injected at build)
           Note: build-with-reviews fetches Letterboxd data at build time —
           this is intentional; TMDB_API_KEY secret is required for CI.
        2. Push → ghcr.io/dafandikri/portfolio-website:latest
        3. SSH into 159.223.49.141 as root (via appleboy/ssh-action)
        4. k3s kubectl rollout restart deployment/portfolio-app -n portfolio
           imagePullPolicy: Always ensures containerd re-pulls :latest even
           when the tag hasn't changed — this is the intentional cache-bust mechanism.
        5. k3s kubectl rollout status deployment/portfolio-app -n portfolio
           (wait for rollout to complete before marking workflow as success)

Internet → :80/:443
         → Traefik v2 (k3s built-in, Let's Encrypt via ACME HTTP-01)
         → portfolio-app Service ClusterIP :80
         → portfolio-app Pods :8080 (nginx-unprivileged)
```

**Domain split:**
- `dafandikri.tech` → Vercel (production, always-on CDN)
- `k8s.dafandikri.tech` → 159.223.49.141 (k3s infra demo)

---

## Droplet Setup

| Property | Value |
|----------|-------|
| Provider | DigitalOcean |
| IP | 159.223.49.141 |
| Resize | 4GB → 2GB Basic ($24 → $12/mo, saves $144/yr) |
| SSH user | root (kubeconfig at `/etc/rancher/k3s/k3s.yaml` is root-readable by default) |

### Step-by-step: Resize + Clean + Install

**Resize (causes brief downtime, ~2 min):**
1. DigitalOcean dashboard → Droplets → Power Off
2. Resize → select "2 GB / 1 vCPU" ($12/mo) → **Resize Disk = NO** (keep flexibility to resize up later)
3. Power On — IP stays the same (`159.223.49.141`)

**Clean up OpenClaw:**
```bash
ssh root@159.223.49.141

# Stop and remove all containers
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true

# Remove OpenClaw files (adjust paths as needed)
rm -rf ~/openclaw ~/claude-remote ~/.openclaw

# Free disk space
docker system prune -af --volumes
```

**Open firewall ports** (REQUIRED — Let's Encrypt ACME HTTP-01 challenge will fail without this):
```bash
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp   # keep SSH open
ufw --force enable
ufw status
```

**Install k3s:**
```bash
curl -sfL https://get.k3s.io | sh -

# Verify — kubectl is available to root via k3s
k3s kubectl get nodes
# Expected: node shows Ready status

# kubectl symlink (k3s already creates this, but verify)
kubectl get nodes  # should work too
```

---

## Container Registry

| Property | Value |
|----------|-------|
| Registry | GitHub Container Registry (ghcr.io) |
| Image | `ghcr.io/dafandikri/portfolio-website:latest` |
| Visibility | **Public** (must be set manually after first push — GitHub defaults new packages to private even on public repos: repo → Packages → portfolio-website → Change visibility → Public) |
| Tag strategy | `latest` only — `imagePullPolicy: Always` in Deployment handles cache invalidation |
| Pull auth | None needed (public image, no `imagePullSecret` required in k3s) |

---

## k8s Manifests

### Nginx config: Dockerfile vs ConfigMap

The Dockerfile bakes in `nginx/app.conf` at build time. The Deployment mounts the ConfigMap
`nginx-app-config` at the same path via `subPath`, which overwrites the baked-in file at runtime.

**Both files must stay in sync.** The ConfigMap (`k8s/configmap.yaml`) is the authoritative
config in k8s. If they diverge, the ConfigMap version runs silently.
The cleanest long-term fix is to remove `COPY nginx/app.conf` from the Dockerfile —
but for now, keeping them in sync is sufficient.

### Files to modify

**`k8s/deployment.yaml`** — update image:
```yaml
image: ghcr.io/dafandikri/portfolio-website:latest
imagePullPolicy: Always   # ← CRITICAL: enables cache-bust on rollout restart
```

### Files to create

**`k8s/traefik-config.yaml`** — configure Let's Encrypt ACME resolver on k3s's built-in Traefik.
The resolver name `letsencrypt` must match what the Ingress annotation references.
```yaml
apiVersion: helm.cattle.io/v1
kind: HelmChartConfig
metadata:
  name: traefik
  namespace: kube-system
spec:
  valuesContent: |-
    additionalArguments:
      - "--certificatesresolvers.letsencrypt.acme.email=dafandikri@gmail.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/data/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
```

**`k8s/ingress.yaml`** — Traefik Ingress for `k8s.dafandikri.tech`:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: portfolio-ingress
  namespace: portfolio
  annotations:
    traefik.ingress.kubernetes.io/router.entrypoints: web,websecure
    traefik.ingress.kubernetes.io/router.tls: "true"
    traefik.ingress.kubernetes.io/router.tls.certresolver: letsencrypt
spec:
  rules:
    - host: k8s.dafandikri.tech
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: portfolio-app   # must match Service name in service.yaml
                port:
                  number: 80
  tls:
    - hosts:
        - k8s.dafandikri.tech
```

### First-time apply order (run on Droplet after k3s install)

```bash
# 1. Namespace first
kubectl apply -f k8s/namespace.yaml

# 2. ConfigMap
kubectl apply -f k8s/configmap.yaml

# 3. Traefik ACME config — triggers a Traefik restart
kubectl apply -f k8s/traefik-config.yaml

# 4. Wait for Traefik to restart with new config before applying Ingress
kubectl rollout status -n kube-system deployment/traefik --timeout=120s

# 5. App manifests
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# 6. Ingress last (Traefik must have ACME resolver ready)
kubectl apply -f k8s/ingress.yaml
```

---

## GitHub Actions CI/CD Workflow

**File:** `.github/workflows/deploy.yml`
**Trigger:** push to `main`

**SSH action:** `appleboy/ssh-action` — handles SSH private key newlines correctly.
Do NOT manually write the key to a temp file; the action manages this.

**Steps:**
1. `actions/checkout@v4`
2. `docker/login-action` → ghcr.io using `GITHUB_TOKEN` (auto-provided, no setup needed)
3. `docker/build-push-action` → build with `TMDB_API_KEY` build arg, push `:latest`
4. `appleboy/ssh-action` → SSH into `159.223.49.141` as root:
   ```bash
   k3s kubectl rollout restart deployment/portfolio-app -n portfolio
   k3s kubectl rollout status deployment/portfolio-app -n portfolio --timeout=120s
   ```

**GitHub Secrets** (Settings → Secrets and variables → Actions → New repository secret):

| Secret name | Value |
|-------------|-------|
| `TMDB_API_KEY` | Your TMDB API key |
| `DROPLET_SSH_PRIVATE_KEY` | Full contents of your local `~/.ssh/id_rsa` or `~/.ssh/id_ed25519` — paste the entire key including `-----BEGIN` and `-----END` lines |

`GITHUB_TOKEN` is auto-provided — do not add it as a secret.

---

## DNS

Add to your DNS provider (Namecheap / Cloudflare / etc.):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `k8s` | `159.223.49.141` | 300 |

The existing root `@` / CNAME records for Vercel stay unchanged.

**DNS must resolve before applying the Ingress** — Let's Encrypt HTTP-01 challenge
hits `http://k8s.dafandikri.tech/.well-known/acme-challenge/...`.
If DNS isn't pointing at the Droplet yet, the cert will fail to issue.

---

## Success Criteria

- `git push` to `main` triggers GitHub Actions workflow
- Workflow completes in < 5 min (build is the slow step, ~2-3 min)
- `https://k8s.dafandikri.tech` loads portfolio with valid TLS (green padlock)
- On Droplet: `kubectl get pods -n portfolio` shows **2 pods, each `1/1 Running`**
  (1/1 = 1 container per pod, 2 pods = 2 replicas — NOT 2/2 which would mean a sidecar)
- `dafandikri.tech` (Vercel) continues to work, completely unaffected

---

## Files Created / Modified Summary

| Action | File |
|--------|------|
| Modify | `k8s/deployment.yaml` — image → ghcr.io, confirm `imagePullPolicy: Always` |
| Create | `k8s/traefik-config.yaml` — ACME/Let's Encrypt resolver |
| Create | `k8s/ingress.yaml` — Traefik Ingress for k8s.dafandikri.tech |
| Create | `.github/workflows/deploy.yml` — CI/CD pipeline |
