# Deploying SaaSVoice to a GCP free-tier VM

This guide deploys SaaSVoice to a single **Compute Engine `e2-micro`** VM using
only free-tier-friendly resources. The app and PostgreSQL both run as Docker
containers on the VM, with data on the VM's persistent disk.

> **Costs are your responsibility.** The `e2-micro` instance is free-tier
> eligible in `us-west1`, `us-central1`, and `us-east1` (one per month, within
> limits), but **network egress, extra disk, and other services can cost
> money**. Set the budget alert below and read the "What might cost money"
> section before you start.

Placeholders to replace as you go:

| Placeholder | Meaning | Example |
| --- | --- | --- |
| `PROJECT_ID` | New GCP project id | `saasvoice-mvp` |
| `BILLING_ACCOUNT_ID` | Your billing account | `0X0X0X-0X0X0X-0X0X0X` |
| `REGION` | Free-tier region | `us-central1` |
| `ZONE` | Zone in that region | `us-central1-a` |
| `DOMAIN_NAME` | (Optional) your domain | `saasvoice.example.com` |

---

## 1. Install and authenticate the gcloud CLI

Install the [gcloud CLI](https://cloud.google.com/sdk/docs/install), then:

```bash
gcloud auth login
```

## 2. Create a project

```bash
gcloud projects create PROJECT_ID
gcloud config set project PROJECT_ID
```

## 3. Link billing (required even for free tier)

```bash
gcloud billing accounts list
gcloud billing projects link PROJECT_ID --billing-account=BILLING_ACCOUNT_ID
```

## 4. Create a budget alert (do this now)

Protects you from surprise charges. Replace the billing account, and adjust the
amount if you like.

```bash
gcloud billing budgets create \
  --billing-account=BILLING_ACCOUNT_ID \
  --display-name="SaaSVoice budget" \
  --budget-amount=5USD \
  --threshold-rule=percent=0.5 \
  --threshold-rule=percent=0.9 \
  --threshold-rule=percent=1.0
```

> If the `budgets` command isn't available, create the budget in the console:
> **Billing → Budgets & alerts → Create budget**.

## 5. Enable Compute Engine

```bash
gcloud services enable compute.googleapis.com
```

## 6. Create the VM (e2-micro, Ubuntu LTS)

Note the **`--tags=saasvoice`** — the firewall rules below target that tag, so
it must match.

```bash
gcloud compute instances create saasvoice-vm \
  --project=PROJECT_ID \
  --zone=ZONE \
  --machine-type=e2-micro \
  --image-family=ubuntu-2404-lts-amd64 \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=30GB \
  --boot-disk-type=pd-standard \
  --tags=saasvoice
```

> Keep the disk at **30GB** (the free-tier standard persistent disk limit).

## 7. Open only the ports you need

```bash
# SSH
gcloud compute firewall-rules create allow-saasvoice-ssh \
  --allow=tcp:22 --target-tags=saasvoice --description="SSH"

# HTTP
gcloud compute firewall-rules create allow-saasvoice-http \
  --allow=tcp:80 --target-tags=saasvoice --description="HTTP"

# HTTPS (only if you'll use a domain + the Caddy TLS proxy)
gcloud compute firewall-rules create allow-saasvoice-https \
  --allow=tcp:443 --target-tags=saasvoice --description="HTTPS"
```

If you are running HTTP-only on port 3000 for a quick test, also open it
temporarily (not recommended for real use — prefer the proxy on 80/443):

```bash
gcloud compute firewall-rules create allow-saasvoice-app \
  --allow=tcp:3000 --target-tags=saasvoice --description="App (temporary)"
```

## 8. SSH into the VM

```bash
gcloud compute ssh saasvoice-vm --zone=ZONE
```

Everything from here runs **on the VM**.

## 9. Add swap (important on a 1GB e2-micro)

The `e2-micro` has ~1GB RAM. A swap file keeps the build and Postgres from
running out of memory.

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h
```

## 10. Install Docker + Compose plugin

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Run docker without sudo (log out/in afterwards for it to take effect)
sudo usermod -aG docker $USER
newgrp docker
```

## 11. Clone the repo

```bash
git clone https://github.com/Shakargy/saasvoice.git
cd saasvoice
```

## 12. Create the `.env` file

```bash
cp .env.example .env
nano .env
```

Set at least these for production:

- `POSTGRES_PASSWORD` — a long random value: `openssl rand -base64 24`
- `NEXTAUTH_SECRET` — another: `openssl rand -base64 32`
- `NEXTAUTH_URL` / `APP_URL` — your public URL
  (`http://VM_EXTERNAL_IP` for a quick test, or `https://DOMAIN_NAME` with the proxy)
- `AI_PROVIDER` — leave as `mock`, or set `gemini` + `GEMINI_API_KEY`
- `DOMAIN_NAME` — only if you use the TLS proxy

> The production compose builds `DATABASE_URL` from the `POSTGRES_*` values, so
> you don't need to set `DATABASE_URL` for the Docker deployment.

## 13. Start the stack

Migrations run automatically on container start.

```bash
# HTTP only (app on port 3000)
docker compose up -d --build

# OR with the Caddy TLS proxy (needs DOMAIN_NAME + DNS pointed at the VM)
docker compose --profile proxy up -d --build
```

Check it:

```bash
docker compose ps
docker compose logs -f app
```

## 14. Create your first user

Open the app and register at `/register`, **or** seed a demo account:

```bash
docker compose exec app node node_modules/prisma/build/index.js db seed || true
# (If seeding isn't wired in the image, just register via the web UI.)
```

The simplest path is to register through the web UI.

## 15. (Optional) Domain + automatic HTTPS

1. Point an `A` record for `DOMAIN_NAME` at the VM's external IP.
2. Set `DOMAIN_NAME` in `.env`.
3. Start with the proxy profile (step 13). Caddy fetches a Let's Encrypt
   certificate automatically once DNS resolves and ports 80/443 are open.

## 16. Monitor disk, memory, and logs

```bash
df -h            # disk usage — keep well under 30GB
free -h          # memory + swap
docker stats     # per-container CPU/memory
docker compose logs --tail=100 app
```

## 17. Stop the VM to avoid usage when idle

Stopping the VM halts compute charges (a stopped VM still keeps its disk, which
is within the free tier at 30GB).

```bash
gcloud compute instances stop saasvoice-vm --zone=ZONE
gcloud compute instances start saasvoice-vm --zone=ZONE
```

---

## What might cost money

- **Network egress** beyond the free monthly allowance (the most likely charge).
- **More than one** `e2-micro`, or a larger machine type.
- **Disk over 30GB**, snapshots, or extra persistent disks.
- A **static external IP that is reserved but not attached**.
- Any of these (intentionally **not** used here): **Cloud SQL**, **GKE**,
  load balancers, Cloud NAT, paid logging/monitoring tiers.

## Updating to a new version

```bash
cd saasvoice
git pull
docker compose up -d --build
```

Migrations run automatically on the next start.

## Tearing everything down

```bash
gcloud compute instances delete saasvoice-vm --zone=ZONE
gcloud compute firewall-rules delete allow-saasvoice-ssh allow-saasvoice-http allow-saasvoice-https
# Optionally delete the whole project:
gcloud projects delete PROJECT_ID
```
