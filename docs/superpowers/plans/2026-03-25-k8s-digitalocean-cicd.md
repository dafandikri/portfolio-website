# k8s + DigitalOcean + GitHub Actions CI/CD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy `portfolio-website` to a k3s cluster on a DigitalOcean Droplet at `k8s.dafandikri.tech` with full GitHub Actions CI/CD, leaving `dafandikri.tech` (Vercel) untouched.

**Architecture:** GitHub Actions builds the Docker image on every push to `main`, pushes to `ghcr.io`, then SSHes into the Droplet and triggers a rolling restart on k3s. Traefik (k3s built-in) handles TLS automatically via Let's Encrypt ACME HTTP-01 with persistent cert storage. HTTP traffic is permanently redirected to HTTPS.

**Tech Stack:** k3s, Traefik v2, Docker, ghcr.io, GitHub Actions (`appleboy/ssh-action`, `docker/build-push-action@v5`), DigitalOcean Droplet (Ubuntu), kubectl

---

## Phase A: Code Changes (commit to repo)

### Task 1: Verify k8s/deployment.yaml

**Files:**
- Verify/Modify: `k8s/deployment.yaml`

> **Note on nginx config:** The Dockerfile bakes `nginx/app.conf` into the image, but the Deployment mounts the ConfigMap `nginx-app-config` over the same path at runtime — the ConfigMap wins. Always edit `k8s/configmap.yaml` for nginx config changes, not `nginx/app.conf`.

- [ ] **Step 1: Check image and pull policy**

```bash
grep -n "image\|imagePullPolicy" k8s/deployment.yaml
```

Expected:
```
          image: ghcr.io/dafandikri/portfolio-website:latest
          imagePullPolicy: Always
```

`imagePullPolicy: Always` is critical — it forces containerd to re-pull `:latest` on every rollout restart. This is the cache-bust mechanism for CI/CD.

If either line is wrong, fix it in `k8s/deployment.yaml` under the container spec.

- [ ] **Step 2: Validate YAML syntax**

```bash
python3 -c "import yaml; yaml.safe_load(open('k8s/deployment.yaml'))" && echo "YAML OK"
```

Expected: `YAML OK`

- [ ] **Step 3: Commit**

```bash
git add k8s/deployment.yaml
git commit -m "feat(k8s): use ghcr.io image with imagePullPolicy Always"
```

---

### Task 2: Create k8s/traefik-config.yaml

**Files:**
- Create: `k8s/traefik-config.yaml`

This HelmChartConfig does three things:
1. Enables the `letsencrypt` ACME resolver (name must match Ingress annotation)
2. Persists TLS certs to a PersistentVolume so they survive Traefik restarts (without this, k3s restarts re-request certs and hit Let's Encrypt's rate limit of 5 duplicate certs/week)
3. Forces HTTP → HTTPS redirect at the entrypoint level

- [ ] **Step 1: Create the file**

Create `k8s/traefik-config.yaml`:

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
      - "--entrypoints.web.http.redirections.entrypoint.to=websecure"
      - "--entrypoints.web.http.redirections.entrypoint.scheme=https"
    persistence:
      enabled: true
      storageClass: local-path
      path: /data
      size: 128Mi
```

- [ ] **Step 2: Validate YAML syntax**

```bash
python3 -c "import yaml; yaml.safe_load(open('k8s/traefik-config.yaml'))" && echo "YAML OK"
```

Expected: `YAML OK`

- [ ] **Step 3: Commit**

```bash
git add k8s/traefik-config.yaml
git commit -m "feat(k8s): configure Traefik ACME resolver with TLS persistence and HTTPS redirect"
```

---

### Task 3: Create k8s/ingress.yaml

**Files:**
- Create: `k8s/ingress.yaml`

- [ ] **Step 1: Create the file**

Create `k8s/ingress.yaml`:

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
                name: portfolio-app
                port:
                  number: 80
  tls:
    - hosts:
        - k8s.dafandikri.tech
```

Key constraints:
- `traefik.ingress.kubernetes.io/` prefix on ALL annotations (bare `router.*` keys are silently ignored by Traefik)
- `certresolver: letsencrypt` must match the resolver name in `traefik-config.yaml`
- `service.name: portfolio-app` must match the Service name exactly

- [ ] **Step 2: Validate YAML syntax**

```bash
python3 -c "import yaml; yaml.safe_load(open('k8s/ingress.yaml'))" && echo "YAML OK"
```

Expected: `YAML OK`

- [ ] **Step 3: Cross-check service name matches**

```bash
grep "^  name:" k8s/service.yaml
```

Expected: `  name: portfolio-app` — must match `backend.service.name` in ingress.yaml.

- [ ] **Step 4: Commit**

```bash
git add k8s/ingress.yaml
git commit -m "feat(k8s): add Traefik Ingress for k8s.dafandikri.tech with TLS"
```

---

### Task 4: Create .github/workflows/deploy.yml

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create directory**

```bash
mkdir -p .github/workflows
```

- [ ] **Step 2: Create the workflow file**

Create `.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write   # required to push to ghcr.io

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ghcr.io/dafandikri/portfolio-website:latest
          build-args: |
            TMDB_API_KEY=${{ secrets.TMDB_API_KEY }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Deploy to k3s
        uses: appleboy/ssh-action@v1
        with:
          host: 159.223.49.141
          username: root
          key: ${{ secrets.DROPLET_SSH_PRIVATE_KEY }}
          script: |
            k3s kubectl rollout restart deployment/portfolio-app -n portfolio
            k3s kubectl rollout status deployment/portfolio-app -n portfolio --timeout=120s
```

- [ ] **Step 3: Validate YAML syntax**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy.yml'))" && echo "YAML OK"
```

Expected: `YAML OK`

- [ ] **Step 4: Commit and push**

```bash
git add .github/workflows/deploy.yml
git commit -m "feat(ci): add GitHub Actions build and deploy to k3s"
git push origin main
```

The push triggers the workflow — it will fail at the deploy step until server setup is complete. That is expected. Check `https://github.com/dafandikri/portfolio-website/actions` to confirm the workflow started.

---

## Phase B: Server Setup (one-time, run from your local terminal)

### Task 5: Resize DigitalOcean Droplet

- [ ] **Step 1: Power off**

Go to: https://cloud.digitalocean.com → Droplets → your Droplet → Power → Turn Off

Wait for status to show "Off" before continuing.

- [ ] **Step 2: Resize**

Droplet page → Resize → Select **"2 GB RAM / 1 vCPU / 50 GB SSD"** ($12/mo) → **Resize Disk = NO** (keeps flexibility to resize up later without needing to increase disk) → Resize. Takes ~2 min.

- [ ] **Step 3: Power on and wait for SSH**

Power On. Wait for "Active" status, then verify SSH is up before proceeding:

```bash
ssh root@159.223.49.141 echo "SSH OK"
```

Expected: `SSH OK` — if it hangs or refuses, wait 30 more seconds and retry. Do NOT run Task 6 until this passes.

---

### Task 6: Clean up Droplet and install k3s

All commands via `ssh root@159.223.49.141`.

- [ ] **Step 1: Stop and remove all Docker containers**

```bash
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true
```

- [ ] **Step 2: Remove OpenClaw files**

OpenClaw stores files in the home directory. Check what's there, then remove:

```bash
ls ~/
# Look for: openclaw, claude-remote, .openclaw, or similar directories
rm -rf ~/openclaw ~/claude-remote ~/.openclaw
# If you see other OpenClaw-related dirs in ls, remove those too
```

- [ ] **Step 3: Free disk space**

```bash
docker system prune -af --volumes
df -h
```

Expected: at least 10 GB free on the root filesystem.

- [ ] **Step 4: Open firewall ports**

```bash
ufw allow 22/tcp    # keep SSH — CRITICAL, do this first
ufw allow 80/tcp    # HTTP (Let's Encrypt ACME challenge + redirect to HTTPS)
ufw allow 443/tcp   # HTTPS
ufw --force enable
ufw status
```

Expected `ufw status` shows 22, 80, 443 allowed. Verify 22 is open before enabling — if SSH closes, you're locked out.

- [ ] **Step 5: Install k3s**

```bash
curl -sfL https://get.k3s.io | sh -
```

Wait ~1 min. k3s installs as a systemd service.

- [ ] **Step 6: Verify k3s node is Ready**

```bash
k3s kubectl get nodes
```

Expected: node shows `Ready` status. If it shows `NotReady`, wait 30s and retry.

- [ ] **Step 7: Verify Traefik is listening on port 80**

This is the critical check before attempting Let's Encrypt. Traefik binds to host ports 80/443 via k3s's built-in service load balancer (klipper-lb).

```bash
curl -v http://159.223.49.141/
```

Expected: Traefik 404 page (HTML with "404 page not found"). This confirms port 80 is reachable through Traefik. If the connection is refused, wait 60s for klipper-lb to start and retry. Do NOT proceed to Task 9 until this returns a Traefik response.

---

### Task 7: Configure DNS

- [ ] **Step 1: Add A record**

Go to your DNS provider (wherever `dafandikri.tech` is managed):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `k8s` | `159.223.49.141` | 300 |

The existing root `@` / CNAME records for Vercel stay unchanged.

- [ ] **Step 2: Verify propagation**

```bash
dig k8s.dafandikri.tech +short
```

Expected: `159.223.49.141`

Wait 2–5 min for TTL=300 propagation. **Do NOT apply the Ingress (Task 9 Step 7) until this resolves.** Let's Encrypt HTTP-01 challenge must reach the Droplet at `k8s.dafandikri.tech`, or cert issuance fails.

---

### Task 8: Add GitHub Secrets

- [ ] **Step 1: Get SSH private key**

On your local machine (not the Droplet):

```bash
cat ~/.ssh/id_ed25519    # or id_rsa — use whichever key authenticates to 159.223.49.141
```

Copy the full output including the `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----` lines.

- [ ] **Step 2: Add secrets to GitHub**

Go to: `https://github.com/dafandikri/portfolio-website` → Settings → Secrets and variables → Actions → New repository secret

| Secret name | Value |
|-------------|-------|
| `DROPLET_SSH_PRIVATE_KEY` | Full private key contents (BEGIN + END lines included) |
| `TMDB_API_KEY` | Your TMDB API key |

`GITHUB_TOKEN` is provided automatically by GitHub — do NOT add it as a secret.

---

## Phase C: First-Time k8s Deployment

### Task 9: Apply manifests and make image public

All kubectl commands via `ssh root@159.223.49.141`. The repo was pushed in Phase A — clone it on the Droplet.

- [ ] **Step 1: Clone repo on Droplet**

```bash
cd ~
git clone https://github.com/dafandikri/portfolio-website.git
cd portfolio-website
```

- [ ] **Step 2: Apply namespace**

```bash
kubectl apply -f k8s/namespace.yaml
kubectl get namespace portfolio
```

Expected: `portfolio   Active`

- [ ] **Step 3: Apply ConfigMap**

```bash
kubectl apply -f k8s/configmap.yaml
kubectl get configmap -n portfolio
```

Expected: `nginx-app-config` in the list.

- [ ] **Step 4: Apply Traefik config and wait**

```bash
kubectl apply -f k8s/traefik-config.yaml

# Traefik restarts to load ACME config — wait for it (~30-60s)
kubectl rollout status -n kube-system deployment/traefik --timeout=120s
```

Expected: `deployment "traefik" successfully rolled out`

- [ ] **Step 5: Re-verify port 80 after Traefik restart**

```bash
curl -v http://159.223.49.141/
```

Expected: Still returns Traefik response (now with HTTP→HTTPS redirect: 301). If HTTPS redirect is active you'll see `Location: https://159.223.49.141/` in curl output — that's correct.

- [ ] **Step 6: Make ghcr.io image public BEFORE deploying**

Go to: `https://github.com/dafandikri?tab=packages`

If `portfolio-website` package doesn't exist yet, trigger the CI/CD first:
```bash
# On your LOCAL machine — push a trivial change to trigger the build
cd "/Users/dafandikri/Documents/Personal/Portfolio Website/portfolio-website"
git commit --allow-empty -m "ci: trigger first image build"
git push origin main
```

Wait for the GitHub Actions build step to complete (the deploy step will fail — that's fine). Then:
- GitHub → your profile → Packages → `portfolio-website` → Package settings → Change visibility → **Public**

This is required before the Deployment can pull the image. GitHub defaults new packages to private.

- [ ] **Step 7: Apply Deployment and Service**

```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

- [ ] **Step 8: Wait for pods to be Running**

```bash
kubectl get pods -n portfolio -w
```

Wait until both pods show `1/1 Running`. Press Ctrl+C when done. If pods show `ImagePullBackOff`, the image is still private — go back to Step 6.

- [ ] **Step 9: Apply Ingress (DNS must resolve first)**

```bash
# Verify DNS before this step
dig k8s.dafandikri.tech +short   # must return 159.223.49.141

kubectl apply -f k8s/ingress.yaml
kubectl get ingress -n portfolio
```

Expected: Ingress shows `k8s.dafandikri.tech` as host.

---

## Phase D: Verify End-to-End

### Task 10: Full verification

- [ ] **Step 1: Watch for TLS cert issuance (~1-2 min)**

```bash
# On Droplet
kubectl logs -n kube-system deployment/traefik --follow | grep -i "acme\|cert\|letsencrypt"
```

Look for successful cert fetch. Ctrl+C when done.

- [ ] **Step 2: Test HTTPS in browser**

Open: `https://k8s.dafandikri.tech`

Expected: Portfolio loads with valid TLS (green padlock). `http://k8s.dafandikri.tech` should redirect to HTTPS automatically.

- [ ] **Step 3: Verify pod status**

```bash
kubectl get pods -n portfolio
```

Expected (2 pods, each 1 container — no sidecars):
```
NAME                             READY   STATUS    RESTARTS
portfolio-app-xxxxxxxxx-xxxxx    1/1     Running   0
portfolio-app-xxxxxxxxx-xxxxx    1/1     Running   0
```

- [ ] **Step 4: Test CI/CD end-to-end**

On your local machine:

```bash
cd "/Users/dafandikri/Documents/Personal/Portfolio Website/portfolio-website"
git commit --allow-empty -m "test: verify full CI/CD pipeline"
git push origin main
```

Watch: `https://github.com/dafandikri/portfolio-website/actions` — workflow should complete in < 5 min.

After it finishes, check Droplet:
```bash
kubectl get pods -n portfolio
# New AGE timestamps confirm pods restarted via rolling update
```

- [ ] **Step 5: Verify Vercel is unaffected**

Open: `https://dafandikri.tech`

Expected: Site loads normally from Vercel. Both pipelines ran independently from the same push.

---

## Droplet Scale-Back Reference Guide

> Use anytime you want to save money (e.g. between internship applications).

**Scale down to $6/mo (minimum):**
1. DigitalOcean → Droplet → Power Off
2. Resize → 1 GB RAM / 1 vCPU ($6/mo) → **Resize Disk = NO**
3. Power On
4. Verify: `ssh root@159.223.49.141 && kubectl get pods -n portfolio`

**Scale back up:**
1. Power Off → Resize → 2 GB ($12/mo) → Power On

**What persists across resize:** k3s state, TLS certs (on PV), all k8s resources. Pods restart automatically via systemd. No re-deployment needed.

**Minimum viable:** 1 GB RAM ($6/mo). k3s + Traefik + 2 pods ≈ 400 MB. Works fine, just less headroom.
