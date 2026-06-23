# Design: Recreate k3s Infra Showcase on a New DigitalOcean Droplet

**Date:** 2026-06-23
**Status:** Approved (recommended defaults; revise before provisioning if needed)
**Supersedes operationally:** `2026-03-25-k8s-digitalocean-cicd-design.md` (the original build, whose droplet `159.223.49.141` was destroyed)

---

## Goal

Replace the destroyed DigitalOcean Droplet that hosted the k3s infrastructure showcase at
`k8s.dafandikri.tech`. The showcase exists to demonstrate cloud/infra skills (k3s, Traefik,
Let's Encrypt, GitHub Actions CI/CD) for internship applications.

The production site `dafandikri.tech` runs on Vercel and is **completely unaffected** — it was
never on the droplet.

End state: new droplet → k3s → Traefik + Let's Encrypt TLS → 2-replica nginx app, redeployed
automatically by GitHub Actions on every push to `main`.

---

## Context: what was lost vs. what survives

| Survives (no action) | Lost with the droplet |
|----------------------|------------------------|
| `dafandikri.tech` (Vercel production) | The droplet host + its public IP `159.223.49.141` |
| Repo code: `Dockerfile`, `k8s/*.yaml`, `nginx/*` | The k3s cluster + running pods |
| `.github/workflows/deploy.yml` (structure) | The droplet's installed k3s/Traefik state |
| ghcr.io image + CI build pipeline | The SSH trust to the old host |
| `TMDB_API_KEY` GitHub secret | (assume `DROPLET_SSH_PRIVATE_KEY` must be reissued) |

This is therefore a **recreate-and-rewire** task, not a rebuild. The architecture and nearly all
files already exist; the work is provisioning a fresh host and repointing the IP-dependent pieces.

---

## Provisioning decisions

Items marked ⚠️ are recommended defaults chosen in the absence of explicit user input. They are
cheap to change before provisioning — revise this section if any are wrong.

| Item | Value | Rationale |
|------|-------|-----------|
| Provider | DigitalOcean Droplet | Same as before; matches the showcase narrative |
| Size | **1 GB RAM / 1 vCPU / 25 GB SSD — $6/mo** (cheapest) | App pods are static `nginx-unprivileged` (~15–40 MB each); the memory weight is k3s's control plane (~500 MB), not the app. 1 GB comfortably runs k3s + Traefik + 2 nginx replicas. At $6/mo the $113.18 credit lasts ~18 months |
| Reserved IP | **Yes** | Point DNS at the Reserved IP **once**; future destroy/rebuild just re-attaches the same IP — no DNS or workflow edits. Directly prevents the failure mode that caused this rework. Free while attached to an active droplet |
| Region | **Singapore (sgp1)** | Lowest latency from Indonesia |
| Isolation | **Dedicated droplet** (not shared with the Hermes agent) | k3s expects to own the host; sharing invites resource contention and muddies the clean-infra-showcase story. $6/mo buys clean separation |
| OS | Ubuntu 24.04 LTS | Current LTS; k3s install script supported |
| SSH user | `root` | k3s kubeconfig at `/etc/rancher/k3s/k3s.yaml` is root-readable by default |
| SSH key | New `ed25519` keypair | Old key trusted the destroyed host; reissue cleanly |

---

## Architecture (unchanged from the original showcase)

```
git push to main
    │
    ├── Vercel Git integration (unchanged)
    │       └── dafandikri.tech  (CDN, production)
    │
    └── GitHub Actions workflow
            │
            ▼
        1. Build Docker image (TMDB_API_KEY injected at build;
           Letterboxd reviews fetched at build time via scripts/fetch-letterboxd.js)
        2. Push → ghcr.io/dafandikri/portfolio-website:latest
        3. SSH into <RESERVED_IP> as root (appleboy/ssh-action)
        4. k3s kubectl rollout restart deployment/portfolio-app -n portfolio
           (imagePullPolicy: Always re-pulls :latest — the intentional cache-bust)
        5. k3s kubectl rollout status ... --timeout=120s

Internet → :80/:443
         → Traefik v3 (k3s built-in, Let's Encrypt via ACME HTTP-01)
         → portfolio-app Service ClusterIP :80
         → portfolio-app Pods :8080 (nginx-unprivileged, 2 replicas)
```

**Domain split (unchanged):**
- `dafandikri.tech` → Vercel (production)
- `k8s.dafandikri.tech` → `<RESERVED_IP>` (k3s infra demo)

---

## Components & responsibilities

Each unit has one clear job and a well-defined interface:

- **DigitalOcean Droplet** — the host. Interface: SSH (22) + HTTP/HTTPS (80/443). Depends on: nothing.
- **Reserved IP** — stable public address. Interface: attaches to exactly one droplet. Lets the
  droplet be replaced without changing DNS or CI.
- **k3s** — single-node cluster + built-in Traefik. Interface: `kubectl` locally as root.
- **Traefik (k3s built-in)** — edge proxy + TLS. Interface: Ingress objects + ACME resolver
  `letsencrypt`. Depends on: ports 80/443 open, DNS resolving to the host (for HTTP-01 challenge).
- **App workload** — `portfolio-app` Deployment (2 replicas) + Service + ConfigMap (nginx config).
  Interface: Service ClusterIP :80 → pods :8080. Depends on: ghcr.io image being public.
- **GitHub Actions** — CI/CD. Interface: push to `main`. Depends on: `TMDB_API_KEY` and
  `DROPLET_SSH_PRIVATE_KEY` secrets, and the Reserved IP in `deploy.yml`.

---

## Files to change in the repo

| Action | File | Change |
|--------|------|--------|
| Modify | `.github/workflows/deploy.yml` | Replace `host: 159.223.49.141` (appears **twice** — scp step and ssh step) with the Reserved IP |
| Verify | `k8s/deployment.yaml` | Confirm `image: ghcr.io/dafandikri/portfolio-website:latest` and `imagePullPolicy: Always` |
| Verify | `k8s/ingress.yaml` | Confirm host `k8s.dafandikri.tech` and certresolver `letsencrypt` |
| Verify | `k8s/traefik-config.yaml` | Confirm ACME email + resolver name `letsencrypt` |
| Update | `README.md` | Update the Reserved IP / any stale `159.223.49.141` references |

No application code changes. The Dockerfile and nginx configs are reused verbatim.

---

## Implementation sequence (detailed in the plan)

1. **Provision** — create droplet (sgp1, 1 GB / $6, Ubuntu 24.04) with the new SSH public key;
   create a Reserved IP and attach it to the droplet.
2. **Firewall** — `ufw allow 22/tcp 80/tcp 443/tcp`; `ufw --force enable`. (80/443 required or the
   ACME HTTP-01 challenge fails.)
3. **Install k3s** — `curl -sfL https://get.k3s.io | sh -`; verify `k3s kubectl get nodes` → Ready.
4. **DNS** — A record `k8s` → Reserved IP, low TTL. **Must resolve before applying the Ingress**
   (Let's Encrypt hits `http://k8s.dafandikri.tech/.well-known/acme-challenge/...`).
5. **Rewire repo** — set the Reserved IP in `deploy.yml` (×2); commit.
6. **GitHub secrets** — set new `DROPLET_SSH_PRIVATE_KEY` (full key incl. BEGIN/END lines);
   confirm `TMDB_API_KEY` still present. `GITHUB_TOKEN` is auto-provided — do not add it.
7. **First apply** (on droplet, in order): `namespace` → `configmap` → `traefik-config` →
   wait for Traefik rollout → `deployment` → `service` → `ingress`.
8. **Verify** (see Success Criteria).

---

## Success criteria

- `https://k8s.dafandikri.tech` loads the portfolio with valid TLS (green padlock).
- `kubectl get pods -n portfolio` shows **2 pods, each `1/1 Running`**.
- A push to `main` triggers GitHub Actions and completes a rollout in **< 5 min**.
- `dafandikri.tech` (Vercel) continues to work, completely unaffected.

---

## Risks & mitigations

| Risk | Mitigation |
|------|------------|
| ACME cert fails to issue | Ensure DNS resolves to Reserved IP **and** ufw allows 80/443 **before** applying Ingress |
| ghcr image private (GitHub default) | After first push, set package visibility → Public (repo → Packages → Change visibility) |
| Memory pressure on 1 GB | nginx pods are tiny, so steady state is fine; if a rollout ever pressures RAM, set `maxSurge: 0` / `maxUnavailable: 1` on the Deployment, or resize the droplet up (Reserved IP keeps the same address) |
| Reserved IP forgotten on rebuild | DNS points at Reserved IP, so only the re-attach step matters; documented in plan |
| Old IP lingering in code/docs | Grep for `159.223.49.141` across the repo and replace |

---

## Out of scope

- Migrating production off Vercel.
- Multi-node / HA k3s.
- Switching to Docker Compose (explicitly rejected — k3s is the showcase point).
- Application feature changes.
