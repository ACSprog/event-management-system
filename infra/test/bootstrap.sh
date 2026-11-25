#!/usr/bin/env bash
# One-time setup of the TEST environment in Google Cloud (project event-management-system-test).
#
# Run it in Google Cloud Shell (console.cloud.google.com, the >_ button at the top right),
# signed in as a project owner:
#
#   git clone https://github.com/ACSprog/event-management-system.git
#   bash event-management-system/infra/test/bootstrap.sh
#
# It is safe to run again: every step checks first and only creates what is missing.
# It never prints passwords; they go straight into Secret Manager.
#
# What it creates (least privilege, no downloadable keys):
#  - APIs: Cloud SQL, Cloud Run, Artifact Registry, Secret Manager, IAM credentials
#  - Cloud SQL PostgreSQL 16 "ems-test" in africa-south1 (smallest size, backups, encrypted
#    connections only, no open networks), database "ems", owner user "ems_owner"
#  - Secrets: database passwords, API session secret, ticket QR signing key
#  - Artifact Registry "ems" for container images
#  - Service accounts:
#      ems-api      runs the backend (Cloud SQL client, its own secrets only)
#      ems-web      runs the website (may call the backend, nothing else)
#      ems-deployer used by GitHub Actions on master only, through Workload Identity
#                   Federation (keyless: GitHub proves who it is; no JSON key exists)
set -euo pipefail

PROJECT="${PROJECT:-event-management-system-test}"
REGION="${REGION:-africa-south1}"
REPO="${REPO:-ACSprog/event-management-system}"
INSTANCE="ems-test"
DB="ems"

say() { printf '\n\033[1m%s\033[0m\n' "$*"; }
exists() { "$@" >/dev/null 2>&1; }
newpw() { openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c 40; }

say "Project: $PROJECT, region: $REGION"
gcloud config set project "$PROJECT" >/dev/null
PROJECT_NUMBER="$(gcloud projects describe "$PROJECT" --format='value(projectNumber)')"

say "1/7 Enabling APIs (takes a minute the first time)"
gcloud services enable sqladmin.googleapis.com run.googleapis.com artifactregistry.googleapis.com \
  secretmanager.googleapis.com iam.googleapis.com iamcredentials.googleapis.com sts.googleapis.com \
  cloudresourcemanager.googleapis.com

say "2/7 Container registry"
exists gcloud artifacts repositories describe ems --location="$REGION" || \
  gcloud artifacts repositories create ems --repository-format=docker --location="$REGION" \
    --description="EMS container images (test)"

say "3/7 Secrets"
secret() {  # secret NAME VALUE: create once; never overwrite an existing value
  if ! exists gcloud secrets describe "$1"; then
    printf '%s' "$2" | gcloud secrets create "$1" --replication-policy=user-managed --locations="$REGION" --data-file=- >/dev/null
    echo "  created $1"
  else
    echo "  $1 already exists (kept)"
  fi
}
secret db-owner-password "$(newpw)"
secret db-api-password "$(newpw)"
secret api-session-secret "$(openssl rand -base64 64 | tr -d '\n')"
secret ticket-qr-key "$(openssl rand -base64 32 | tr -d '\n')"

say "4/7 Cloud SQL (PostgreSQL 16). Creating the instance takes about 10 minutes the first time"
if ! exists gcloud sql instances describe "$INSTANCE"; then
  gcloud sql instances create "$INSTANCE" \
    --database-version=POSTGRES_16 --edition=ENTERPRISE --tier=db-f1-micro \
    --region="$REGION" --availability-type=zonal \
    --storage-type=SSD --storage-size=10 --storage-auto-increase \
    --backup-start-time=23:00 --retained-backups-count=7 --enable-point-in-time-recovery \
    --ssl-mode=ENCRYPTED_ONLY --deletion-protection \
    --database-flags=cloudsql.iam_authentication=on,log_min_duration_statement=500
fi
exists gcloud sql databases describe "$DB" --instance="$INSTANCE" || gcloud sql databases create "$DB" --instance="$INSTANCE"
OWNER_PW="$(gcloud secrets versions access latest --secret=db-owner-password)"
if exists gcloud sql users describe ems_owner --instance="$INSTANCE"; then
  gcloud sql users set-password ems_owner --instance="$INSTANCE" --password="$OWNER_PW" >/dev/null
else
  gcloud sql users create ems_owner --instance="$INSTANCE" --password="$OWNER_PW" >/dev/null
fi
unset OWNER_PW
# The API's login user (ems_api_login) is created by the deploy pipeline inside the database,
# as a plain member of the ems_api role, so row-level security always applies to it.
CONNECTION="$(gcloud sql instances describe "$INSTANCE" --format='value(connectionName)')"

say "5/7 Service accounts"
sa() { exists gcloud iam service-accounts describe "$1@$PROJECT.iam.gserviceaccount.com" || \
  gcloud iam service-accounts create "$1" --display-name="$2"; }
sa ems-api "EMS backend (Cloud Run)"
sa ems-web "EMS website (Cloud Run)"
sa ems-deployer "EMS deploys from GitHub Actions (master only)"
API_SA="ems-api@$PROJECT.iam.gserviceaccount.com"
WEB_SA="ems-web@$PROJECT.iam.gserviceaccount.com"
DEPLOY_SA="ems-deployer@$PROJECT.iam.gserviceaccount.com"
sleep 5   # new service accounts take a moment to appear everywhere

say "6/7 Permissions (least privilege)"
role() { gcloud projects add-iam-policy-binding "$PROJECT" --member="serviceAccount:$1" --role="$2" --condition=None >/dev/null; echo "  $2 -> ${1%%@*}"; }
secret_role() { gcloud secrets add-iam-policy-binding "$1" --member="serviceAccount:$2" --role=roles/secretmanager.secretAccessor >/dev/null; echo "  secret $1 -> ${2%%@*}"; }
# Backend: connect to Cloud SQL; read only its own secrets.
role "$API_SA" roles/cloudsql.client
for s in db-api-password api-session-secret ticket-qr-key; do secret_role "$s" "$API_SA"; done
# Deployer: deploy Cloud Run services, push images, run migrations through the Cloud SQL proxy.
role "$DEPLOY_SA" roles/run.admin
role "$DEPLOY_SA" roles/cloudsql.client
gcloud artifacts repositories add-iam-policy-binding ems --location="$REGION" \
  --member="serviceAccount:$DEPLOY_SA" --role=roles/artifactregistry.writer >/dev/null; echo "  artifactregistry.writer (repo ems) -> ems-deployer"
for s in db-owner-password db-api-password; do secret_role "$s" "$DEPLOY_SA"; done
for runtime in "$API_SA" "$WEB_SA"; do
  gcloud iam service-accounts add-iam-policy-binding "$runtime" --member="serviceAccount:$DEPLOY_SA" \
    --role=roles/iam.serviceAccountUser >/dev/null; echo "  may deploy as ${runtime%%@*}"
done

say "7/7 Keyless sign-in for GitHub Actions (Workload Identity Federation)"
exists gcloud iam workload-identity-pools describe github --location=global || \
  gcloud iam workload-identity-pools create github --location=global --display-name="GitHub Actions"
exists gcloud iam workload-identity-pools providers describe github-actions --location=global --workload-identity-pool=github || \
  gcloud iam workload-identity-pools providers create-oidc github-actions --location=global --workload-identity-pool=github \
    --display-name="GitHub Actions (EMS repo)" --issuer-uri="https://token.actions.githubusercontent.com" \
    --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.ref=assertion.ref" \
    --attribute-condition="assertion.repository=='$REPO' && assertion.ref=='refs/heads/master'"
gcloud iam service-accounts add-iam-policy-binding "$DEPLOY_SA" --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github/attribute.repository/$REPO" >/dev/null
PROVIDER="projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github/providers/github-actions"

say "Done. Add these as GitHub repository VARIABLES (not secrets; none of them is sensitive):"
cat <<EOF

  https://github.com/$REPO/settings/variables/actions/new

  GCP_PROJECT        $PROJECT
  GCP_REGION         $REGION
  GCP_WIF_PROVIDER   $PROVIDER
  GCP_DEPLOY_SA      $DEPLOY_SA
  CLOUDSQL_INSTANCE  $CONNECTION

Then open https://github.com/$REPO/actions, choose "Deploy test backend" and click
"Run workflow". It migrates the database, loads the sample data and deploys the backend.
EOF
