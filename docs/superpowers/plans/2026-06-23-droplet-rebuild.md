# Droplet Rebuild (k3s Infra Showcase) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recreate the destroyed DigitalOcean Droplet that served the k3s infra showcase at `k8s.dafandikri.tech`, on the cheapest viable config, and rewire CI/DNS to a stable Reserved IP.

**Architecture:** A fresh 1 GB DigitalOcean droplet (Singapore) runs single-node k3s with built-in Traefik (Let's Encrypt TLS). A Reserved IP fronts the droplet so future rebuilds need no DNS/CI changes. GitHub Actions builds the image to ghcr.io and triggers a `kubectl rollout restart` over SSH on push to `main`. Vercel production (`dafandikri.tech`) is untouched.

**Tech Stack:** DigitalOcean (Droplet + Reserved IP), Ubuntu 24.04, k3s, Traefik v3, Let's Encrypt (ACME HTTP-01), GitHub Actions, ghcr.io, Docker/nginx-unprivileged.

## Global Constraints

- Droplet: **1 GB / 1 vCPU / 25 GB SSD — $6/mo**, region **sgp1**, OS **Ubuntu 24.04 LTS**.
- Use a **Reserved IP**; DNS and `deploy.yml` reference the Reserved IP, never the raw droplet IP.
- SSH user: **root**. New **ed25519** keypair.
- Image: `ghcr.io/dafandikri/portfolio-website:latest`, **public** visibility, `imagePullPolicy: Always`.
- Domain split: `dafandikri.tech` → Vercel (do not touch); `k8s.dafandikri.tech` → Reserved IP.
- ACME resolver name is `letsencrypt` and must match across `traefik-config.yaml` and `ingress.yaml`.
- Ports 22/80/443 must be open before applying the Ingress (ACME HTTP-01 needs 80).
- `GITHUB_TOKEN` is auto-provided — never add it as a secret.
- Throughout this plan, substitute `<RESERVED_IP>` with the actual Reserved IP from Task 2.

---

### Task 1: Provision the droplet with a fresh SSH key

**Files:**
- Local: `~/.ssh/portfolio_droplet` (private) + `~/.ssh/portfolio_droplet.pub` (public) — created

**Interfaces:**
- Produces: a running droplet, its temporary public IP, and the public key registered on it. Consumed by Task 2 (Reserved IP attach) and Task 6 (SSH secret).

- [ ] **Step 1: Generate a dedicated SSH keypair**

```bash
ssh-keygen -t ed25519 -C "portfolio-droplet-2026-06-23" -f ~/.ssh/portfolio_droplet -N ""
```

- [ ] **Step 2: Print the public key (paste into DigitalOcean)**

```bash
cat ~/.ssh/portfolio_droplet.pub
```

- [ ] **Step 3: Create the droplet**

In the DigitalOcean dashboard → Create → Droplets:
- Region: **Singapore (sgp1)**
- Image: **Ubuntu 24.04 (LTS) x64**
- Size: **Basic → Regular → $6/mo (1 GB / 1 vCPU / 25 GB)**
- Authentication: **SSH Key** → add the key printed in Step 2
- Hostname: `portfolio-k3s`
- Create.

(CLI alternative, if `doctl` is configured:)
```bash
doctl compute ssh-key import portfolio-droplet --public-key-file ~/.ssh/portfolio_droplet.pub
doctl compute droplet create portfolio-k3s \
  --region sgp1 --image ubuntu-24-04-x64 --size s-1vcpu-1gb \
  --ssh-keys $(doctl compute ssh-key list --format ID --no-header | head -1) --wait
```

- [ ] **Step 4: Verify SSH access (uses the droplet's temporary IP for now)**

Run (replace `<TMP_IP>` with the droplet's public IP from the dashboard):
```bash
ssh -i ~/.ssh/portfolio_droplet -o StrictHostKeyChecking=accept-new root@<TMP_IP> 'echo connected && uname -a'
```
Expected: prints `connected` and the Ubuntu kernel string.

---

### Task 2: Create and attach a Reserved IP

**Interfaces:**
- Produces: `<RESERVED_IP>` — the stable address used by DNS (Task 4), `deploy.yml` (Task 5), and SSH from CI. Consumed by Tasks 3–8.

- [ ] **Step 1: Create the Reserved IP and assign it to the droplet**

Dashboard → Networking → Reserved IPs → assign to `portfolio-k3s`.

(CLI alternative:)
```bash
doctl compute reserved-ip create --region sgp1
# then, using the IP it returns and the droplet ID:
doctl compute reserved-ip-action assign <RESERVED_IP> <DROPLET_ID>
```

- [ ] **Step 2: Verify SSH works over the Reserved IP**

```bash
ssh -i ~/.ssh/portfolio_droplet -o StrictHostKeyChecking=accept-new root@<RESERVED_IP> 'echo reserved-ip-ok'
```
Expected: prints `reserved-ip-ok`.

---

### Task 3: Firewall + install k3s on the droplet

All steps run **on the droplet** (`ssh -i ~/.ssh/portfolio_droplet root@<RESERVED_IP>`).

**Interfaces:**
- Produces: a single-node k3s cluster with built-in Traefik; `kubectl` usable as root. Consumed by Tasks 5 and 7.

- [ ] **Step 1: Open the firewall (80/443 required for ACME, 22 for SSH)**

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status
```
Expected: status shows 22, 80, 443 ALLOW.

- [ ] **Step 2: Install k3s**

```bash
curl -sfL https://get.k3s.io | sh -
```

- [ ] **Step 3: Verify the node is Ready**

```bash
k3s kubectl get nodes
```
Expected: one node with STATUS `Ready` within ~30s.

- [ ] **Step 4: Verify built-in Traefik is present**

```bash
k3s kubectl get pods -n kube-system | grep traefik
```
Expected: a `traefik-*` pod `Running`.

---

### Task 4: Point DNS at the Reserved IP

**Interfaces:**
- Produces: `k8s.dafandikri.tech` resolving to `<RESERVED_IP>` — prerequisite for the ACME HTTP-01 challenge in Task 7.

- [ ] **Step 1: Add/replace the A record**

At your DNS provider, set (leave the root `@`/CNAME Vercel records untouched):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `k8s` | `<RESERVED_IP>` | 300 |

- [ ] **Step 2: Verify resolution (wait for propagation)**

```bash
dig +short k8s.dafandikri.tech
```
Expected: prints exactly `<RESERVED_IP>`. Do not proceed to Task 7's Ingress until this matches.

---

### Task 5: Rewire the repo to the Reserved IP

**Files:**
- Modify: `.github/workflows/deploy.yml` (two `host:` occurrences — scp step and ssh step)
- Verify: `k8s/deployment.yaml`, `k8s/ingress.yaml`, `k8s/traefik-config.yaml`
- Modify: `README.md` (stale IP references)

**Interfaces:**
- Consumes: `<RESERVED_IP>` from Task 2.
- Produces: a committed repo whose CI targets the new host.

- [ ] **Step 1: Find every reference to the old IP**

```bash
cd "/Users/dafandikri/Documents/Personal/Portfolio Website/portfolio-website"
grep -rn "159.223.49.141" . --exclude-dir=node_modules --exclude-dir=.git
```
Expected: hits in `.github/workflows/deploy.yml` (×2) and `README.md`.

- [ ] **Step 2: Replace old IP with the Reserved IP across tracked files**

```bash
grep -rl "159.223.49.141" . --exclude-dir=node_modules --exclude-dir=.git \
  | xargs sed -i '' 's/159\.223\.49\.141/<RESERVED_IP>/g'
```
(Note: `sed -i ''` is the macOS/BSD form.)

- [ ] **Step 3: Confirm the k8s manifests are intact**

```bash
grep -n "ghcr.io/dafandikri/portfolio-website:latest" k8s/deployment.yaml
grep -n "imagePullPolicy: Always" k8s/deployment.yaml
grep -n "k8s.dafandikri.tech" k8s/ingress.yaml
grep -n "letsencrypt" k8s/ingress.yaml k8s/traefik-config.yaml
```
Expected: each grep returns a match. If any are missing, fix per the spec's "Files to change" table before committing.

- [ ] **Step 4: Verify the old IP is fully gone**

```bash
grep -rn "159.223.49.141" . --exclude-dir=node_modules --exclude-dir=.git || echo "clean"
```
Expected: prints `clean`.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/deploy.yml README.md
git commit -m "chore: repoint droplet deploy + docs to new Reserved IP"
```

---

### Task 6: Set GitHub secrets for CI

**Interfaces:**
- Consumes: the private key from Task 1, `<RESERVED_IP>` from Task 2.
- Produces: a CI pipeline that can SSH to the droplet.

- [ ] **Step 1: Set the SSH private key secret**

```bash
cd "/Users/dafandikri/Documents/Personal/Portfolio Website/portfolio-website"
gh secret set DROPLET_SSH_PRIVATE_KEY < ~/.ssh/portfolio_droplet
```
(Dashboard alternative: Settings → Secrets and variables → Actions → New repository secret → name `DROPLET_SSH_PRIVATE_KEY`, paste the full key including the `-----BEGIN`/`-----END` lines.)

- [ ] **Step 2: Confirm TMDB_API_KEY still exists**

```bash
gh secret list
```
Expected: lists both `DROPLET_SSH_PRIVATE_KEY` and `TMDB_API_KEY`. If `TMDB_API_KEY` is missing, set it from your local `.env`:
```bash
gh secret set TMDB_API_KEY --body "$(grep '^TMDB_API_KEY=' .env | cut -d= -f2)"
```

---

### Task 7: First manual apply of the k8s manifests

Copy manifests to the droplet, then apply **in order**. The ordering matters: Traefik must restart with the ACME resolver before the Ingress requests a cert.

**Interfaces:**
- Consumes: k3s from Task 3, DNS from Task 4, manifests from Task 5.
- Produces: a running `portfolio-app` Deployment reachable over HTTPS.

- [ ] **Step 1: Copy manifests to the droplet**

```bash
cd "/Users/dafandikri/Documents/Personal/Portfolio Website/portfolio-website"
scp -i ~/.ssh/portfolio_droplet -r k8s root@<RESERVED_IP>:/tmp/portfolio-deploy
```

- [ ] **Step 2: Apply namespace + configmap + Traefik ACME config**

```bash
ssh -i ~/.ssh/portfolio_droplet root@<RESERVED_IP> '
  k3s kubectl apply -f /tmp/portfolio-deploy/k8s/namespace.yaml &&
  k3s kubectl apply -f /tmp/portfolio-deploy/k8s/configmap.yaml &&
  k3s kubectl apply -f /tmp/portfolio-deploy/k8s/traefik-config.yaml
'
```
Expected: each prints `created` (or `configured`).

- [ ] **Step 3: Wait for Traefik to roll out with the new config**

```bash
ssh -i ~/.ssh/portfolio_droplet root@<RESERVED_IP> \
  'k3s kubectl rollout status -n kube-system deployment/traefik --timeout=120s'
```
Expected: `deployment "traefik" successfully rolled out`.

- [ ] **Step 4: Apply app deployment + service + ingress**

```bash
ssh -i ~/.ssh/portfolio_droplet root@<RESERVED_IP> '
  k3s kubectl apply -f /tmp/portfolio-deploy/k8s/deployment.yaml &&
  k3s kubectl apply -f /tmp/portfolio-deploy/k8s/service.yaml &&
  k3s kubectl apply -f /tmp/portfolio-deploy/k8s/ingress.yaml
'
```
Expected: each prints `created`.

- [ ] **Step 5: Verify pods are running**

```bash
ssh -i ~/.ssh/portfolio_droplet root@<RESERVED_IP> 'k3s kubectl get pods -n portfolio'
```
Expected: 2 pods, each `1/1 Running`. (If `ImagePullBackOff`: the ghcr image is still private — set it Public per Task 8 Step 1, then `k3s kubectl rollout restart deployment/portfolio-app -n portfolio`.)

---

### Task 8: End-to-end verification

**Interfaces:**
- Consumes: everything above.
- Produces: a verified, CI-driven deployment.

- [ ] **Step 1: Ensure the ghcr image is Public**

GitHub → your profile/repo → Packages → `portfolio-website` → Package settings → Change visibility → **Public**. (k3s pulls with no imagePullSecret, so the image must be public.)

- [ ] **Step 2: Verify TLS + content (allow ~1 min for ACME to issue the cert)**

```bash
curl -sI https://k8s.dafandikri.tech | head -1
```
Expected: `HTTP/2 200`. Opening the URL in a browser shows a valid padlock (Let's Encrypt cert, not self-signed).

- [ ] **Step 3: Verify the CI pipeline end-to-end**

```bash
cd "/Users/dafandikri/Documents/Personal/Portfolio Website/portfolio-website"
git commit --allow-empty -m "ci: trigger deploy to rebuilt droplet"
git push origin main
gh run watch
```
Expected: the "Build and Deploy" workflow completes green in < 5 min; the SSH step ends with `deployment "portfolio-app" successfully rolled out`.

- [ ] **Step 4: Confirm production is unaffected**

```bash
curl -sI https://dafandikri.tech | head -1
```
Expected: `HTTP/2 200` — Vercel still serving, untouched.

- [ ] **Step 5: Commit the updated README/spec if not already pushed**

```bash
git status
# if docs changed:
git add README.md docs/superpowers
git commit -m "docs: record droplet rebuild on Reserved IP"
git push origin main
```

---

## Self-Review

**Spec coverage:** Provision (T1), Reserved IP (T2), firewall+k3s (T3), DNS (T4), repo rewire (T5), secrets (T6), first apply (T7), verification incl. ghcr-public + Vercel-unaffected (T8) — every spec section maps to a task.

**Placeholder scan:** `<RESERVED_IP>` / `<TMP_IP>` / `<DROPLET_ID>` are intentional substitution tokens defined in Global Constraints, not unresolved TODOs. No other placeholders.

**Type/name consistency:** Resolver `letsencrypt`, deployment `portfolio-app`, namespace `portfolio`, host `k8s.dafandikri.tech`, image tag `:latest` used consistently across tasks and match the existing manifests and spec.
