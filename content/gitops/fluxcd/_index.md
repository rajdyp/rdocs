---
title: FluxCD
linkTitle: FluxCD
type: docs
weight: 1
prev: /gitops
next: /gitops/flagger
---

## What is FluxCD?

FluxCD is a **GitOps operator** for Kubernetes that enables continuous delivery by automatically synchronizing cluster state with Git repositories. It embodies the GitOps principles: declarative infrastructure, version control as the single source of truth, and automatic reconciliation.

### GitOps Principles

```
┌─────────────────────────────────────────────────────────┐  
│              GitOps Core Principles                     │  
├─────────────────────────────────────────────────────────┤  
│                                                         │  
│  1. Declarative Configuration                           │  
│     └─> Infrastructure defined as code                  │  
│                                                         │  
│  2. Version Control as Single Source of Truth           │  
│     └─> Git contains desired system state               │  
│                                                         │  
│  3. Automated Delivery                                  │  
│     └─> Changes in Git trigger deployments              │  
│                                                         │  
│  4. Software Agents for Reconciliation                  │  
│     └─> Controllers ensure actual = desired state       │  
│                                                         │  
│  5. Closed Loop (Continuous Reconciliation)             │  
│     └─> System self-heals and corrects drift            │  
│                                                         │  
└─────────────────────────────────────────────────────────┘
```

### Why FluxCD?

* **Declarative**: Define what you want, not how to achieve it
* **Auditable**: All changes tracked in Git
* **Secure**: Pull-based model (no cluster credentials in CI/CD)
* **Scalable**: Handles multi-cluster and multi-tenant scenarios
* **Extensible**: Modular architecture with specialized controllers

## 2. Core Concepts

### Key Terminology

**Source**: Definition of where configuration is stored (Git, Helm, Bucket)  
  
**Kustomization**: Defines how to apply resources from a source to the cluster  
  
**Reconciliation**: Process of ensuring actual state matches desired state  
  
**Revision**: Specific version of source (Git commit, Helm chart version)  
  
**Drift Detection**: Identifying when cluster state diverges from Git

### The GitOps Flow

```
┌──────────┐       ┌──────────┐       ┌──────────┐       ┌──────────┐  
│   Git    │──────>│  Flux    │──────>│ Cluster  │──────>│  Apps    │  
│  Repo    │       │ Controllers      │   API    │       │ Running  │  
└──────────┘       └──────────┘       └──────────┘       └──────────┘  
     │                   │                   │                   │  
     │ Developer         │ Flux watches      │ Applies           │ Containers  
     │ commits           │ for changes       │ manifests         │ deployed  
     │ changes           │ & reconciles      │                   │  
     │                   │                   │                   │  
     └───────────────────┴───────────────────┴───────────────────┘  
              Continuous Synchronization Loop
```

## 3. FluxCD Architecture

### Component Overview

FluxCD v2 (current version) is composed of specialized controllers, each handling specific aspects of the GitOps workflow.

```
┌─────────────────────────────────────────────────────────────────┐  
│                    FluxCD Architecture                          │  
└─────────────────────────────────────────────────────────────────┘  
  
                        ┌────────────────┐  
                        │  Git Repository│  
                        │   (Source of   │  
                        │     Truth)     │  
                        └───────┬────────┘  
                                │  
                    ┌───────────┴───────────┐  
                    │                       │  
            ┌───────▼────────┐     ┌────────▼───────┐  
            │ Source         │     │ Helm           │  
            │ Controller     │     │ Repository     │  
            └───────┬────────┘     └────────┬───────┘  
                    │                       │  
                    └───────────┬───────────┘  
                                │  
                        ┌───────▼────────┐  
                        │ Kustomize      │  
                        │ Controller     │  
                        └───────┬────────┘  
                                │  
                        ┌───────▼────────┐  
                        │ Helm           │  
                        │ Controller     │  
                        └───────┬────────┘  
                                │  
                        ┌───────▼────────┐  
                        │ Notification   │  
                        │ Controller     │  
                        └───────┬────────┘  
                                │  
                        ┌───────▼────────┐  
                        │  Kubernetes    │  
                        │    Cluster     │  
                        └────────────────┘  
  
┌─────────────────────────────────────────────────────────────────┐  
│  Optional Controllers (Advanced Features)                       │  
├─────────────────────────────────────────────────────────────────┤  
│  • Image Reflector Controller  - Scans registries               │  
│  • Image Automation Controller - Updates Git with new images    │  
│  • OCI Repository Controller   - Manages OCI artifacts          │  
└─────────────────────────────────────────────────────────────────┘
```

### Controller Responsibilities

```
┌────────────────────────────────────────────────────────────────┐  
│                    Controller Matrix                           │  
├────────────────┬───────────────────────────────────────────────┤  
│ Controller     │ Primary Responsibility                        │  
├────────────────┼───────────────────────────────────────────────┤  
│ source-        │ Fetches artifacts from Git, Helm repos,       │  
│ controller     │ S3 buckets; produces versioned artifacts      │  
├────────────────┼───────────────────────────────────────────────┤  
│ kustomize-     │ Applies Kustomize overlays; reconciles        │  
│ controller     │ Kubernetes resources                          │  
├────────────────┼───────────────────────────────────────────────┤  
│ helm-          │ Manages Helm releases; performs install,      │  
│ controller     │ upgrade, rollback operations                  │  
├────────────────┼───────────────────────────────────────────────┤  
│ notification-  │ Sends alerts to external systems (Slack,      │  
│ controller     │ Teams, webhooks); receives webhook events     │  
├────────────────┼───────────────────────────────────────────────┤  
│ image-         │ Scans container registries for new image      │  
│ reflector      │ tags; maintains image metadata                │  
├────────────────┼───────────────────────────────────────────────┤  
│ image-         │ Automatically updates Git with new image      │  
│ automation     │ references based on policies                  │  
└────────────────┴───────────────────────────────────────────────┘
```

## 4. Key Controllers and Their Roles

### Source Controller

The Source Controller is responsible for acquiring artifacts from various sources.

```
Source Controller Workflow  
──────────────────────────  
  
Git Repository ──┐  
                 │  
Helm Repository ─┼──> Source Controller ──> Artifact  
                 │                          (stored locally)  
S3 Bucket ───────┘                               │  
                                                 │  
                                                 ▼  
                                          Other Controllers  
                                          (consume artifact)
```

**Supported Source Types:**

```
┌─────────────────┬──────────────────────────────────────────┐  
│ Source Type     │ Description                              │  
├─────────────────┼──────────────────────────────────────────┤  
│ GitRepository   │ Git repo (HTTPS, SSH, or local)          │  
│ HelmRepository  │ Helm chart repository                    │  
│ HelmChart       │ Specific Helm chart from a repository    │  
│ Bucket          │ S3-compatible storage bucket             │  
│ OCIRepository   │ OCI-compliant artifact registry          │  
└─────────────────┴──────────────────────────────────────────┘
```

**Example GitRepository Custom Resource:**

```yaml
apiVersion: source.toolkit.fluxcd.io/v1  
kind: GitRepository  
metadata:  
  name: my-app  
  namespace: flux-system  
spec:  
  interval: 1m              # Check every minute  
  url: https://github.com/org/repo  
  ref:  
    branch: main  
  secretRef:                # Optional: for private repos  
    name: git-credentials
```

### Kustomize Controller

Applies Kustomize overlays and manages Kubernetes resources.

```
Kustomize Controller Flow  
─────────────────────────  
  
    GitRepository Artifact  
            │  
            ▼  
    ┌───────────────┐  
    │  Kustomize    │  
    │  Controller   │  
    └───────┬───────┘  
            │  
            ├──> 1. Fetch artifact  
            │  
            ├──> 2. Build Kustomization  
            │  
            ├──> 3. Apply to cluster  
            │  
            ├──> 4. Health check  
            │  
            └──> 5. Report status
```

**Example Kustomization Custom Resource:**

```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1  
kind: Kustomization  
metadata:  
  name: my-app  
  namespace: flux-system  
spec:  
  interval: 10m  
  sourceRef:  
    kind: GitRepository  
    name: my-app  
  path: ./kustomize/overlays/production  
  prune: true               # Delete resources not in Git  
  wait: true                # Wait for resources to be ready  
  timeout: 5m  
  healthChecks:  
    - apiVersion: apps/v1  
      kind: Deployment  
      name: my-app  
      namespace: default
```

### Helm Controller

Manages Helm releases declaratively.

```
Helm Controller Flow  
───────────────────  
  
HelmRepository ──┐  
                 ├──> Helm Controller ──> HelmRelease  
HelmChart ───────┘                             │  
                                               │  
                                               ├──> Install  
                                               ├──> Upgrade  
                                               ├──> Test  
                                               ├──> Rollback (on failure)  
                                               └──> Uninstall
```

**Example HelmRelease Custom Resource:**

```yaml
apiVersion: helm.toolkit.fluxcd.io/v2beta1  
kind: HelmRelease  
metadata:  
  name: nginx  
  namespace: flux-system  
spec:  
  interval: 30m  
  chart:  
    spec:  
      chart: nginx  
      version: '>=1.0.0 <2.0.0'  
      sourceRef:  
        kind: HelmRepository  
        name: bitnami  
  values:  
    replicaCount: 3  
    service:  
      type: LoadBalancer  
  install:  
    remediation:  
      retries: 3  
  upgrade:  
    remediation:  
      retries: 3  
      remediateLastFailure: true
```

### Notification Controller

Handles event-driven workflows and integrations.

```
Notification Controller  
──────────────────────  
  
Events from Controllers  
         │  
         ▼  
┌────────────────────┐  
│  Notification      │  
│   Controller       │  
└─────────┬──────────┘  
          │  
          ├──> Slack  
          ├──> Microsoft Teams  
          ├──> Discord  
          ├──> Generic Webhook  
          ├──> Prometheus Alerts  
          └──> Git Commit Status  
  
Incoming Webhooks (Receiver)  
         │  
         ▼  
┌────────────────────┐  
│  Notification      │  
│   Controller       │  
└─────────┬──────────┘  
          │  
          └──> Trigger reconciliation
```

## 5. The Reconciliation Loop

### How Reconciliation Works

Reconciliation is the heart of FluxCD. It's a continuous process that ensures the cluster state matches the desired state in Git.

```
┌────────────────────────────────────────────────────────────────┐  
│              Reconciliation Loop (Detailed)                    │  
└────────────────────────────────────────────────────────────────┘  
  
      START  
        │  
        ▼  
   ┌─────────┐  
   │ Wait for│  
   │ Interval│  
   │ or Event│  
   └────┬────┘  
        │  
        ▼  
   ┌─────────────┐  
   │ Fetch Source│  
   │  (Git/Helm) │  
   └──────┬──────┘  
          │  
          ▼  
   ┌──────────────┐         ┌─────────────┐  
   │ Has Revision │   NO    │   Skip      │  
   │   Changed?   │────────>│ Reconcile   │  
   └──────┬───────┘         └─────────────┘  
          │ YES                    │  
          ▼                        │  
   ┌──────────────┐                │  
   │ Build/Render │                │  
   │  Manifests   │                │  
   └──────┬───────┘                │  
          │                        │  
          ▼                        │  
   ┌──────────────┐                │  
   │ Validate     │                │  
   │ Manifests    │                │  
   └──────┬───────┘                │  
          │                        │  
          ▼                        │  
   ┌──────────────┐                │  
   │ Apply to     │                │  
   │ Cluster      │                │  
   └──────┬───────┘                │  
          │                        │  
          ▼                        │  
   ┌──────────────┐                │  
   │ Wait for     │                │  
   │ Resources    │                │  
   │ Ready        │                │  
   └──────┬───────┘                │  
          │                        │  
          ▼                        │  
   ┌──────────────┐                │  
   │ Health Check │                │  
   └──────┬───────┘                │  
          │                        │  
          ▼                        │  
   ┌──────────────┐                │  
   │ Update Status│                │  
   │ in CRD       │                │  
   └──────┬───────┘                │  
          │                        │  
          └────────────────────────┘  
                   │  
                   ▼  
              Continue Loop
```

### Drift Detection and Correction

```
Drift Scenario  
─────────────  
  
Time: T0  
┌────────────┐         ┌────────────┐  
│    Git     │ matches │  Cluster   │  
│   State    │ ======= │   State    │  
└────────────┘         └────────────┘  
  
Time: T1 (Manual change in cluster)  
┌────────────┐         ┌────────────┐  
│    Git     │   ≠     │  Cluster   │  <- Drift detected!  
│   State    │ ≠≠≠≠≠≠≠ │   State    │  
└────────────┘         └────────────┘  
 replicas: 3           replicas: 5  
                       (manual scale)  
  
Time: T2 (Next reconciliation)  
┌────────────┐         ┌────────────┐  
│    Git     │ matches │  Cluster   │  
│   State    │ ======> │   State    │  <- Corrected!  
└────────────┘         └────────────┘  
 replicas: 3           replicas: 3  
                       (auto-healed)
```

### Reconciliation Triggers

```
┌─────────────────────────────────────────────────────────┐  
│           What Triggers Reconciliation?                 │  
├─────────────────────────────────────────────────────────┤  
│                                                         │  
│  1. Interval Timer                                      │  
│     └─> spec.interval elapsed (e.g., every 1m)          │  
│                                                         │  
│  2. Source Change                                       │  
│     └─> New Git commit or Helm chart version            │  
│                                                         │  
│  3. Webhook Event                                       │  
│     └─> GitHub/GitLab push notification                 │  
│                                                         │  
│  4. Manual Trigger                                      │  
│     └─> flux reconcile command                          │  
│                                                         │  
│  5. Dependency Update                                   │  
│     └─> Parent resource changed                         │  
│                                                         │  
│  6. Resource Deletion/Drift                             │  
│     └─> Prune operation or health check failure         │  
│                                                         │  
└─────────────────────────────────────────────────────────┘
```

## 6. End-to-End Workflow

### Complete Resource Lifecycle

This section traces a complete deployment from code commit to running application, including updates and drift correction.

```
┌────────────────────────────────────────────────────────────────┐  
│         End-to-End FluxCD Workflow (Complete Cycle)            │  
└────────────────────────────────────────────────────────────────┘  
  
PHASE 1: INITIAL SETUP  
─────────────────────  
  
Developer                 Git Repository          FluxCD              Cluster  
    │                           │                    │                   │  
    │  1. flux bootstrap        │                    │                   │  
    ├──────────────────────────>│                    │                   │  
    │                           │  2. Install Flux   │                   │  
    │                           ├───────────────────>│                   │  
    │                           │                    │  3. Create CRDs   │  
    │                           │                    ├──────────────────>│  
    │                           │                    │                   │  
  
  
PHASE 2: APPLICATION DEPLOYMENT  
──────────────────────────────  
  
Developer                 Git Repository          FluxCD                Cluster  
    │                           │                    │                     │  
    │  4. Commit manifests      │                    │                     │  
    ├──────────────────────────>│                    │                     │  
    │                           │                    │                     │  
    │                           │  5. Poll/Webhook   │                     │  
    │                           │<───────────────────┤                     │  
    │                           │                    │                     │  
    │                           │  6. Fetch revision │                     │  
    │                           ├───────────────────>│                     │  
    │                           │                    │                     │  
    │                           │                    │  7. Apply resources │  
    │                           │                    ├────────────────────>│  
    │                           │                    │                     │  
    │                           │                    │  8. Create Pods     │  
    │                           │                    │  9. Pull images     │  
    │                           │                    │ 10. Start containers│  
    │                           │                    │                     │  
    │                           │                    │ 11. Report Ready    │  
    │                           │                    │<────────────────────┤  
    │                           │                    │                     │  
    │                           │ 12. Update status  │                     │   
    │                           │<───────────────────┤                     │  
    │                           │                    │                     │  
  
  
PHASE 3: APPLICATION UPDATE  
──────────────────────────  
  
Developer                 Git Repository          FluxCD              Cluster  
    │                           │                    │                   │  
    │ 13. Update deployment     │                    │                   │  
    │     (new image tag)       │                    │                   │  
    ├──────────────────────────>│                    │                   │  
    │                           │                    │                   │  
    │                           │ 14. Detect change  │                   │  
    │                           │<───────────────────┤                   │  
    │                           │                    │                   │  
    │                           │ 15. Fetch new rev  │                   │  
    │                           ├───────────────────>│                   │  
    │                           │                    │                   │  
    │                           │                    │ 16. Rolling update│  
    │                           │                    ├──────────────────>│  
    │                           │                    │                   │  
    │                           │                    │ 17. New pods up   │  
    │                           │                    │ 18. Old pods down │  
    │                           │                    │                   │  
  
  
PHASE 4: DRIFT DETECTION & CORRECTION  
────────────────────────────────────  
  
Operator                  Git Repository          FluxCD              Cluster  
    │                           │                    │                   │  
    │ 19. Manual change         │                    │                   │  
    │     kubectl scale ...     │                    │                   │  
    ├───────────────────────────────────────────────────────────────────>│  
    │                           │                    │                   │  
    │                           │ 20. Reconcile      │                   │  
    │                           │    interval hits   │                   │  
    │                           │<───────────────────┤                   │  
    │                           │                    │                   │  
    │                           │ 21. Compare states │                   │  
    │                           │                    ├──────────┐        │  
    │                           │                    │          │        │  
    │                           │                    │ 22. Drift│        │  
    │                           │                    │    detected       │  
    │                           │                    │<─────────┘        │  
    │                           │                    │                   │  
    │                           │                    │ 23. Restore state │  
    │                           │                    ├──────────────────>│  
    │                           │                    │                   │  
    │                           │                    │ 24. Alert (opt)   │  
    │                           │                    ├──────────>        │  
    │                           │                    │  Slack/Teams      │  
  
  
PHASE 5: RESOURCE DELETION  
─────────────────────────  
  
Developer                 Git Repository          FluxCD              Cluster  
    │                           │                    │                   │  
    │ 25. Delete manifest       │                    │                   │  
    │     from Git              │                    │                   │  
    ├──────────────────────────>│                    │                   │  
    │                           │                    │                   │  
    │                           │ 26. Detect change  │                   │  
    │                           │<───────────────────┤                   │  
    │                           │                    │                   │  
    │                           │                    │ 27. Prune resource│  
    │                           │                    │    (if enabled)   │  
    │                           │                    ├──────────────────>│  
    │                           │                    │                   │  
    │                           │                    │ 28. Cleanup pods  │  
    │                           │                    │                   │
```

### Detailed State Transitions

```
Resource State Machine  
─────────────────────  
  
    ┌─────────────┐  
    │  Not Exists │  
    │   in Git    │  
    └──────┬──────┘  
           │ Developer commits  
           ▼  
    ┌─────────────┐  
    │  Committed  │  
    │   to Git    │  
    └──────┬──────┘  
           │ Flux detects  
           ▼  
    ┌─────────────┐  
    │ Reconciling │◄──────────┐  
    └──────┬──────┘           │  
           │                  │ Drift or  
           │ Apply successful │ Update  
           ▼                  │  
    ┌─────────────┐           │  
    │   Applied   ├───────────┘  
    │  to Cluster │  
    └──────┬──────┘  
           │  
           ├──> Health check  
           │  
           ▼  
    ┌─────────────┐  
    │   Healthy   │◄──────────┐  
    │   Running   │           │ Continuous  
    └──────┬──────┘           │ Monitoring  
           │                  │  
           └──────────────────┘  
  
           │ Deleted from Git  
           ▼  
    ┌─────────────┐  
    │   Pruned    │  
    │  (Deleted)  │  
    └─────────────┘
```

### Tracing End-to-End Workflow with CLI

This section provides practical CLI commands to trace and observe each phase of the FluxCD workflow in real-time.

#### Phase 1: Initial Setup - Bootstrap FluxCD

```bash
# Bootstrap FluxCD to a cluster (GitHub example)  
flux bootstrap github \  
  --owner=<org-name> \  
  --repository=<repo-name> \  
  --branch=main \  
  --path=./clusters/production \  
  --personal  
  
# Verify installation  
flux check  
  
# Expected output:  
# ► checking prerequisites  
# ✔ Kubernetes 1.28.0 >=1.26.0-0  
# ► checking controllers  
# ✔ helm-controller: deployment ready  
# ✔ kustomize-controller: deployment ready  
# ✔ notification-controller: deployment ready  
# ✔ source-controller: deployment ready  
# ✔ all checks passed  
  
# Check installed components  
kubectl get pods -n flux-system  
  
# View what Flux created in Git  
flux get all
```

**Trace the Bootstrap Process:**

```bash
# Watch Flux controllers start  
watch kubectl get pods -n flux-system  
  
# Check GitRepository for flux-system (Flux manages itself)  
flux get sources git flux-system  
  
# Check Kustomization that manages Flux components  
flux get kustomizations flux-system  
  
# View the sync status  
flux get kustomizations --watch
```

#### Phase 2: Application Deployment - Complete Trace

**Step 1: Commit Your Application Manifests**

```yaml
# Create a simple application manifest  
cat <<EOF > apps/production/deployment.yaml  
apiVersion: apps/v1  
kind: Deployment  
metadata:  
  name: my-app  
  namespace: default  
spec:  
  replicas: 3  
  selector:  
    matchLabels:  
      app: my-app  
  template:  
    metadata:  
      labels:  
        app: my-app  
    spec:  
      containers:  
      - name: my-app  
        image: nginx:1.21  
        ports:  
        - containerPort: 80  
EOF  
  
# Commit and push  
git add apps/production/deployment.yaml  
git commit -m "Add my-app deployment"  
git push origin main
```

**Step 2: Watch FluxCD Detect the Change**

```bash
# Watch source controller detect the new commit  
flux get sources git --watch  
  
# Expected output shows new revision:  
# NAME     REVISION        SUSPENDED  READY  MESSAGE  
# my-app   main@sha1:abc123  False    True   stored artifact for revision 'main@sha1:abc123'  
  
# Check the actual GitRepository resource  
kubectl get gitrepository -n flux-system my-app -o yaml  
  
# Look for status.artifact.revision  
kubectl get gitrepository -n flux-system my-app \  
  -o jsonpath='{.status.artifact.revision}'  
  
# View source controller logs  
flux logs --kind=GitRepository --name=my-app  
  
# Alternative: Watch all source controller logs  
kubectl logs -n flux-system deployment/source-controller -f
```

**Step 3: Watch Kustomization Reconciliation**

```bash
# Monitor kustomization status  
flux get kustomizations --watch  
  
# Get detailed status of specific kustomization  
flux get kustomization my-app  
  
# Expected output:  
# NAME    REVISION        SUSPENDED  READY  MESSAGE  
# my-app  main@sha1:abc123  False    True   Applied revision: main@sha1:abc123  
  
# Check what resources were applied  
kubectl get kustomization -n flux-system my-app -o yaml  
  
# View applied resources in status  
kubectl get kustomization -n flux-system my-app \  
  -o jsonpath='{.status.inventory.entries[*]}' | jq  
  
# Watch kustomize-controller logs  
flux logs --kind=Kustomization --name=my-app --follow  
  
# Alternative: Direct controller logs  
kubectl logs -n flux-system deployment/kustomize-controller -f
```

**Step 4: Verify Resources in Cluster**

```bash
# Check if deployment was created  
kubectl get deployment my-app -n default  
  
# Watch pods come up  
kubectl get pods -n default -l app=my-app --watch  
  
# Check deployment status  
kubectl rollout status deployment/my-app -n default  
  
# View events  
kubectl get events -n default --sort-by='.lastTimestamp' | grep my-app  
  
# Get full resource details  
kubectl describe deployment my-app -n default
```

**Step 5: Check Complete Resource Tree**

```bash
# View dependency tree  
flux tree kustomization my-app  
  
# Expected output shows all managed resources:  
# Kustomization/flux-system/my-app  
# └── Deployment/default/my-app  
#     └── ReplicaSet/default/my-app-xxxxx  
#         ├── Pod/default/my-app-xxxxx-aaaa  
#         ├── Pod/default/my-app-xxxxx-bbbb  
#         └── Pod/default/my-app-xxxxx-cccc  
  
# Export current configuration  
flux export kustomization my-app
```

#### Phase 3: Application Update - Trace the Update

**Step 1: Update the Image Version**

```bash
# Update deployment with new image  
sed -i 's/nginx:1.21/nginx:1.22/g' apps/production/deployment.yaml  
  
# Commit the change  
git add apps/production/deployment.yaml  
git commit -m "Update nginx to 1.22"  
git push origin main  
  
# Note the commit SHA for tracking  
git rev-parse HEAD
```

**Step 2: Watch Flux Detect and Apply Update**

```bash
# Monitor source for new revision  
flux get sources git my-app --watch  
  
# Force reconciliation (optional, for immediate update)  
flux reconcile source git my-app --with-source  
  
# Watch the reconciliation happen  
flux get kustomizations my-app --watch  
  
# View real-time reconciliation events  
kubectl get events -n flux-system --watch | grep my-app  
  
# Check kustomization status shows new revision  
kubectl get kustomization -n flux-system my-app \  
  -o jsonpath='{.status.lastAppliedRevision}'
```

**Step 3: Trace Rolling Update in Cluster**

```bash
# Watch deployment rollout  
kubectl rollout status deployment/my-app -n default --watch  
  
# Monitor pods during update (see old terminating, new starting)  
kubectl get pods -n default -l app=my-app --watch  
  
# View rollout history  
kubectl rollout history deployment/my-app -n default  
  
# Check revision details  
kubectl rollout history deployment/my-app -n default --revision=2  
  
# Verify new image  
kubectl get deployment my-app -n default \  
  -o jsonpath='{.spec.template.spec.containers[0].image}'
```

**Step 4: Timeline of the Update**

```bash
# View complete event timeline  
kubectl get events -n default --sort-by='.lastTimestamp' \  
  | grep -E 'my-app|Scaled|Pulling|Created|Started'  
  
# Example output:  
# 5m    Normal  ScalingReplicaSet  deployment/my-app    Scaled up to 4  
# 4m    Normal  Pulling            pod/my-app-new       Pulling image "nginx:1.22"  
# 4m    Normal  Pulled             pod/my-app-new       Successfully pulled image  
# 4m    Normal  Created            pod/my-app-new       Created container  
# 4m    Normal  Started            pod/my-app-new       Started container  
# 3m    Normal  ScalingReplicaSet  deployment/my-app    Scaled down to 3  
  
# Check Flux events  
flux events --for Kustomization/my-app
```

#### Phase 4: Drift Detection and Correction - Real-Time Trace

**Step 1: Introduce Manual Drift**

```bash
# Manually scale the deployment (simulating drift)  
kubectl scale deployment my-app -n default --replicas=5  
  
# Verify the drift  
kubectl get deployment my-app -n default  
  
# Check what Git says (should be 3 replicas)  
grep replicas apps/production/deployment.yaml
```

**Step 2: Watch Flux Detect Drift**

```bash
# Check current kustomization status  
flux get kustomization my-app  
  
# Trigger reconciliation immediately (or wait for interval)  
flux reconcile kustomization my-app  
  
# Watch reconciliation correct the drift  
kubectl get deployment my-app -n default --watch  
  
# View Flux logs showing drift detection  
flux logs --kind=Kustomization --name=my-app --since=5m  
  
# Check kustomize-controller logs for drift details  
kubectl logs -n flux-system deployment/kustomize-controller \  
  --tail=50 | grep -A 10 "drift"
```

**Step 3: Continuous Monitoring**

```bash
# Set up a watch to see drift correction in real-time  
watch -n 2 'echo "=== Git State ===" && \  
  grep replicas apps/production/deployment.yaml && \  
  echo && echo "=== Cluster State ===" && \  
  kubectl get deployment my-app -n default -o jsonpath="{.spec.replicas}"'  
  
# Alternative: Use flux diff to see divergence  
flux diff kustomization my-app  
  
# Monitor reconciliation intervals  
flux get kustomization my-app \  
  -o jsonpath='{.status.conditions[?(@.type=="Ready")].message}'
```

#### Phase 5: Resource Deletion - Trace Cleanup

**Step 1: Remove Resource from Git**

```bash
# Delete the deployment manifest  
git rm apps/production/deployment.yaml  
git commit -m "Remove my-app"  
git push origin main
```

**Step 2: Watch Flux Prune Resources**

```bash
# Ensure prune is enabled in your Kustomization  
kubectl get kustomization -n flux-system my-app \  
  -o jsonpath='{.spec.prune}'  
  
# Should output: true  
  
# Watch for the deletion  
kubectl get deployment my-app -n default --watch  
  
# View Flux logs during pruning  
flux logs --kind=Kustomization --name=my-app --follow  
  
# Check events  
flux events --for Kustomization/my-app  
  
# Verify resource is gone  
kubectl get deployment my-app -n default  
# Should return: Error from server (NotFound)
```

**Step 3: Confirm Complete Cleanup**

```bash
# Check if any resources remain  
kubectl get all -n default -l app=my-app  
  
# Verify in Flux inventory  
kubectl get kustomization -n flux-system my-app \  
  -o jsonpath='{.status.inventory.entries}' | jq  
  
# Should show empty or no entries for deleted resources
```

#### Advanced Tracing Techniques

**1. Real-Time Multi-Window Monitoring**  
  
Set up multiple terminal windows to watch different aspects simultaneously:

```bash
# Terminal 1: Watch Flux resources  
watch -n 2 flux get all  
  
# Terminal 2: Watch cluster resources  
watch -n 2 kubectl get pods,deployments,services -n default  
  
# Terminal 3: Stream Flux logs  
flux logs --all-namespaces --follow  
  
# Terminal 4: Watch events  
kubectl get events -A --watch --sort-by='.lastTimestamp'
```

**2. Trace Specific Resource Through Pipeline**

```bash
# Create a script to trace a resource  
cat <<'EOF' > trace-resource.sh  
#!/bin/bash  
RESOURCE_NAME=$1  
NAMESPACE=${2:-default}  
  
echo "=== Git Source Status ==="  
flux get sources git  
  
echo -e "\n=== Kustomization Status ==="  
flux get kustomizations  
  
echo -e "\n=== Cluster Resource ==="  
kubectl get all -n $NAMESPACE -l app=$RESOURCE_NAME  
  
echo -e "\n=== Recent Events ==="  
kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | tail -10  
  
echo -e "\n=== Flux Events ==="  
flux events --for Kustomization/my-app | tail -10  
EOF  
  
chmod +x trace-resource.sh  
./trace-resource.sh my-app default
```

**3. Detailed Reconciliation Timing**

```bash
# Get reconciliation timing information  
kubectl get kustomization -n flux-system my-app \  
  -o jsonpath='{.status.lastAppliedRevision}{"\n"}  
              Last Applied: {.status.lastAttemptedRevision}{"\n"}  
              Last Handoff: {.status.lastHandoffTime}{"\n"}  
              Observed Generation: {.status.observedGeneration}{"\n"}'  
  
# Check source fetch timing  
kubectl get gitrepository -n flux-system my-app \  
  -o jsonpath='{.status.artifact.lastUpdateTime}'  
  
# Calculate time between commit and deployment  
git log -1 --format="%ai"  # Git commit time  
kubectl get deployment my-app -n default \  
  -o jsonpath='{.metadata.creationTimestamp}'  # K8s creation time
```

**4. Webhook-Based Immediate Reconciliation**

```bash
# Set up a webhook receiver for instant updates  
flux create receiver my-app-receiver \  
  --type github \  
  --event ping \  
  --event push \  
  --secret-ref webhook-token \  
  --resource GitRepository/my-app  
  
# Get webhook URL  
flux get receivers  
  
# Test webhook manually  
flux reconcile source git my-app  
  
# Monitor webhook activity  
kubectl logs -n flux-system deployment/notification-controller -f
```

**5. Debugging Failed Reconciliations**

```bash
# Check for failures  
flux get all | grep -i false  
  
# Get detailed error messages  
kubectl describe kustomization -n flux-system my-app  
  
# View conditions  
kubectl get kustomization -n flux-system my-app \  
  -o jsonpath='{.status.conditions[*]}' | jq  
  
# Check specific failure reason  
kubectl get kustomization -n flux-system my-app \  
  -o jsonpath='{.status.conditions[?(@.type=="Ready")].message}'  
  
# Deep dive into controller logs with level filtering  
flux logs --kind=Kustomization --name=my-app --level=error  
  
# Check for resource conflicts  
kubectl get kustomization -n flux-system my-app \  
  -o jsonpath='{.status.lastAppliedRevision}' && echo  
kubectl get kustomization -n flux-system my-app \  
  -o jsonpath='{.status.lastAttemptedRevision}' && echo  
# If different, there's a problem with the last attempt
```

**6. Monitoring Reconciliation Metrics**

```bash
# Port-forward to see Prometheus metrics  
kubectl port-forward -n flux-system svc/source-controller 8080:80  
  
# In another terminal, query metrics  
curl localhost:8080/metrics | grep gotk_reconcile  
  
# Key metrics to watch:  
# - gotk_reconcile_condition{type="Ready"}  
# - gotk_reconcile_duration_seconds  
# - gotk_reconcile_requests_total  
  
# Use kubectl top to monitor resource usage  
kubectl top pods -n flux-system
```

**7. Complete Trace Script**  
  
Here's a comprehensive script to trace the entire workflow:

```bash
cat <<'EOF' > flux-trace.sh  
#!/bin/bash  
  
GREEN='\033[0;32m'  
BLUE='\033[0;34m'  
YELLOW='\033[1;33m'  
NC='\033[0m' # No Color  
  
KUSTOMIZATION=${1:-my-app}  
  
echo -e "${BLUE}=== FluxCD End-to-End Trace ===${NC}\n"  
  
echo -e "${GREEN}1. Checking Flux System Health${NC}"  
flux check  
  
echo -e "\n${GREEN}2. Git Source Status${NC}"  
flux get sources git  
REVISION=$(kubectl get gitrepository -n flux-system $KUSTOMIZATION -o jsonpath='{.status.artifact.revision}' 2>/dev/null)  
echo "Current Revision: $REVISION"  
  
echo -e "\n${GREEN}3. Kustomization Status${NC}"  
flux get kustomization $KUSTOMIZATION  
READY=$(kubectl get kustomization -n flux-system $KUSTOMIZATION -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}' 2>/dev/null)  
echo "Ready Status: $READY"  
  
echo -e "\n${GREEN}4. Applied Resources (Inventory)${NC}"  
kubectl get kustomization -n flux-system $KUSTOMIZATION -o jsonpath='{.status.inventory.entries[*]}' 2>/dev/null | jq -r '.[] | "\(.id) - \(.v)"'  
  
echo -e "\n${GREEN}5. Cluster Resources${NC}"  
kubectl get all -n default -l app=$KUSTOMIZATION 2>/dev/null  
  
echo -e "\n${GREEN}6. Recent Reconciliation Events${NC}"  
flux events --for Kustomization/$KUSTOMIZATION 2>/dev/null | head -10  
  
echo -e "\n${GREEN}7. Reconciliation Timing${NC}"  
LAST_APPLIED=$(kubectl get kustomization -n flux-system $KUSTOMIZATION -o jsonpath='{.status.lastAppliedRevision}' 2>/dev/null)  
LAST_ATTEMPTED=$(kubectl get kustomization -n flux-system $KUSTOMIZATION -o jsonpath='{.status.lastAttemptedRevision}' 2>/dev/null)  
echo "Last Applied Revision:   $LAST_APPLIED"  
echo "Last Attempted Revision: $LAST_ATTEMPTED"  
  
if [ "$LAST_APPLIED" != "$LAST_ATTEMPTED" ]; then  
    echo -e "${YELLOW}WARNING: Last applied and attempted revisions differ!${NC}"  
fi  
  
echo -e "\n${GREEN}8. Dependency Tree${NC}"  
flux tree kustomization $KUSTOMIZATION 2>/dev/null  
  
echo -e "\n${BLUE}=== Trace Complete ===${NC}"  
EOF  
  
chmod +x flux-trace.sh  
./flux-trace.sh my-app
```

**8. Live Dashboard in Terminal**

```bash
# Install k9s for interactive monitoring (if not already installed)  
# k9s  
  
# Or use watch with custom dashboard  
watch -n 5 '  
echo "=== FLUX SOURCES ==="  
flux get sources git  
echo ""  
echo "=== FLUX KUSTOMIZATIONS ==="  
flux get kustomizations  
echo ""  
echo "=== CLUSTER PODS ==="  
kubectl get pods -n default  
echo ""  
echo "=== LAST 5 EVENTS ==="  
kubectl get events -n flux-system --sort-by=.lastTimestamp | tail -5  
'
```

These CLI tracing techniques allow you to observe every step of the FluxCD workflow in real-time, from Git commit detection through resource deployment, updates, drift correction, and deletion.

## 7. Advanced Features

### Image Automation

Automatically update Git with new container image tags.

```
Image Automation Workflow  
────────────────────────  
  
Container Registry                 FluxCD                    Git Repository  
       │                             │                              │  
       │  1. New image pushed        │                              │  
       ├────────────────────────────>│                              │  
       │       v1.2.3                │                              │  
       │                             │                              │  
       │  2. Image Reflector         │                              │  
       │     scans registry          │                              │  
       │<────────────────────────────┤                              │  
       │                             │                              │  
       │  3. Returns metadata        │                              │  
       ├────────────────────────────>│                              │  
       │                             │                              │  
       │                             │  4. Image Automation         │  
       │                             │     matches policy           │  
       │                             │     (e.g., semver)           │  
       │                             │                              │  
       │                             │  5. Update manifest          │  
       │                             │     with new tag             │  
       │                             ├─────────────────────────────>│  
       │                             │                              │  
       │                             │  6. Git commit created       │  
       │                             │<─────────────────────────────┤  
       │                             │                              │  
       │                             │  7. Trigger reconciliation   │  
       │                             │                              │  
       │                             ▼                              │  
       │                      Deploy v1.2.3                         │
```

**Example Image Repository:**

```yaml
apiVersion: image.toolkit.fluxcd.io/v1beta1  
kind: ImageRepository  
metadata:  
  name: my-app  
  namespace: flux-system  
spec:  
  image: ghcr.io/org/my-app  
  interval: 5m
```

**Example Image Policy:**

```yaml
apiVersion: image.toolkit.fluxcd.io/v1beta1  
kind: ImagePolicy  
metadata:  
  name: my-app  
  namespace: flux-system  
spec:  
  imageRepositoryRef:  
    name: my-app  
  policy:  
    semver:  
      range: '>=1.0.0 <2.0.0'
```

**Example Image Update Automation:**

```yaml
apiVersion: image.toolkit.fluxcd.io/v1beta1  
kind: ImageUpdateAutomation  
metadata:  
  name: my-app  
  namespace: flux-system  
spec:  
  interval: 30m  
  sourceRef:  
    kind: GitRepository  
    name: my-app  
  git:  
    checkout:  
      ref:  
        branch: main  
    commit:  
      author:  
        email: fluxcdbot@users.noreply.github.com  
        name: fluxcdbot  
      messageTemplate: 'Update image to {{range .Updated.Images}}{{println .}}{{end}}'  
    push:  
      branch: main  
  update:  
    path: ./k8s  
    strategy: Setters
```

### Multi-Tenancy

FluxCD supports multi-tenant configurations where different teams manage different namespaces.

```
Multi-Tenant Architecture  
────────────────────────  
  
Git Repository Structure:  
├── clusters/  
│   └── production/  
│       ├── flux-system/          <- Platform team  
│       ├── team-a/                <- Team A  
│       └── team-b/                <- Team B  
├── teams/  
│   ├── team-a/  
│   │   ├── base/  
│   │   └── production/  
│   └── team-b/  
│       ├── base/  
│       └── production/  
  
  
┌────────────────────────────────────────────────────────────┐  
│                   Cluster View                             │  
├────────────────────────────────────────────────────────────┤  
│                                                            │  
│  flux-system namespace (Platform Team)                     │  
│  ├── GitRepository: team-a-repo                            │  
│  ├── GitRepository: team-b-repo                            │  
│  ├── Kustomization: team-a (targetNamespace: team-a)       │  
│  └── Kustomization: team-b (targetNamespace: team-b)       │  
│                                                            │  
│  team-a namespace (Team A)                                 │  
│  ├── Deployment: app-a                                     │  
│  └── Service: app-a                                        │  
│                                                            │  
│  team-b namespace (Team B)                                 │  
│  ├── Deployment: app-b                                     │  
│  └── Service: app-b                                        │  
│                                                            │  
└────────────────────────────────────────────────────────────┘
```

### Progressive Delivery with Flagger

Flagger extends FluxCD with canary deployments, A/B testing, and blue-green deployments.

```
Canary Deployment with Flagger  
──────────────────────────────  
  
Initial State (v1.0):  
┌──────────────┐  
│ Production   │  100% traffic  
│   v1.0       │  
└──────────────┘  
  
Canary Analysis Begins (v1.1):  
┌──────────────┐       ┌──────────────┐  
│ Production   │  95%  │   Canary     │  5%  
│   v1.0       │───────│   v1.1       │  
└──────────────┘       └──────────────┘  
                            │  
                            ▼  
                       Monitor metrics  
                       (latency, errors)  
  
Progressive Traffic Shift:  
┌──────────────┐       ┌──────────────┐  
│ Production   │  50%  │   Canary     │  50%  
│   v1.0       │───────│   v1.1       │  
└──────────────┘       └──────────────┘  
  
Promotion (Success):  
┌──────────────┐  
│ Production   │  100% traffic  
│   v1.1       │  
└──────────────┘  
  
Rollback (Failure):  
┌──────────────┐  
│ Production   │  100% traffic (rolled back)  
│   v1.0       │  
└──────────────┘
```

### Secrets Management

FluxCD integrates with various secrets management solutions.

```
┌────────────────────────────────────────────────────────────┐  
│           Secrets Management Options                       │  
├────────────────────────────────────────────────────────────┤  
│                                                            │  
│  1. Mozilla SOPS (Simple and Encrypted)                    │  
│     Git ──> Encrypted YAML ──> FluxCD ──> Decrypt ──> K8s  │  
│                                                            │  
│  2. Sealed Secrets (Bitnami)                               │  
│     Git ──> SealedSecret ──> Controller ──> Secret ──> K8s │  
│                                                            │  
│  3. External Secrets Operator                              │  
│     External Vault ──> ESO ──> K8s Secret                  │  
│     (AWS, Azure, GCP, Vault)                               │  
│                                                            │  
│  4. Vault (HashiCorp)                                      │  
│     Vault ──> Vault Agent ──> K8s Secret                   │  
│                                                            │  
└────────────────────────────────────────────────────────────┘
```

**Example with SOPS:**

```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1  
kind: Kustomization  
metadata:  
  name: my-app  
  namespace: flux-system  
spec:  
  interval: 10m  
  sourceRef:  
    kind: GitRepository  
    name: my-app  
  path: ./kustomize/production  
  decryption:  
    provider: sops  
    secretRef:  
      name: sops-gpg
```

## 8. Practical Examples

### Example 1: Simple Application Deployment

**Directory Structure:**

```
my-app-repo/  
├── apps/  
│   └── production/  
│       ├── deployment.yaml  
│       ├── service.yaml  
│       └── kustomization.yaml  
└── clusters/  
    └── production/  
        └── apps.yaml
```

**clusters/production/apps.yaml:**

```yaml
---  
apiVersion: source.toolkit.fluxcd.io/v1  
kind: GitRepository  
metadata:  
  name: my-app  
  namespace: flux-system  
spec:  
  interval: 1m  
  url: https://github.com/org/my-app-repo  
  ref:  
    branch: main  
---  
apiVersion: kustomize.toolkit.fluxcd.io/v1  
kind: Kustomization  
metadata:  
  name: my-app  
  namespace: flux-system  
spec:  
  interval: 10m  
  targetNamespace: default  
  sourceRef:  
    kind: GitRepository  
    name: my-app  
  path: ./apps/production  
  prune: true  
  wait: true
```

**apps/production/deployment.yaml:**

```yaml
apiVersion: apps/v1  
kind: Deployment  
metadata:  
  name: my-app  
spec:  
  replicas: 3  
  selector:  
    matchLabels:  
      app: my-app  
  template:  
    metadata:  
      labels:  
        app: my-app  
    spec:  
      containers:  
      - name: my-app  
        image: ghcr.io/org/my-app:v1.0.0  
        ports:  
        - containerPort: 8080
```

### Example 2: Helm Chart Deployment

```yaml
---  
apiVersion: source.toolkit.fluxcd.io/v1beta2  
kind: HelmRepository  
metadata:  
  name: bitnami  
  namespace: flux-system  
spec:  
  interval: 30m  
  url: https://charts.bitnami.com/bitnami  
---  
apiVersion: helm.toolkit.fluxcd.io/v2beta1  
kind: HelmRelease  
metadata:  
  name: redis  
  namespace: flux-system  
spec:  
  interval: 30m  
  releaseName: redis  
  targetNamespace: database  
  chart:  
    spec:  
      chart: redis  
      version: '17.x'  
      sourceRef:  
        kind: HelmRepository  
        name: bitnami  
  values:  
    architecture: standalone  
    auth:  
      enabled: true  
      password: changeme  
    master:  
      persistence:  
        enabled: true  
        size: 8Gi
```

### Example 3: Dependencies Between Resources

```yaml
---  
apiVersion: kustomize.toolkit.fluxcd.io/v1  
kind: Kustomization  
metadata:  
  name: infrastructure  
  namespace: flux-system  
spec:  
  interval: 10m  
  sourceRef:  
    kind: GitRepository  
    name: my-repo  
  path: ./infrastructure  
  prune: true  
---  
apiVersion: kustomize.toolkit.fluxcd.io/v1  
kind: Kustomization  
metadata:  
  name: applications  
  namespace: flux-system  
spec:  
  dependsOn:  
    - name: infrastructure    # Wait for infrastructure first  
  interval: 10m  
  sourceRef:  
    kind: GitRepository  
    name: my-repo  
  path: ./applications  
  prune: true
```

**Dependency Chain:**

```
infrastructure Kustomization  
         │  
         │ Creates: namespaces, CRDs, RBAC  
         │  
         ▼ (dependsOn)  
applications Kustomization  
         │  
         │ Creates: Deployments, Services  
         ▼  
     Running Apps
```

## 9. Best Practices

### Repository Structure

```
Recommended GitOps Repository Structure  
──────────────────────────────────────  
  
Option 1: Monorepo (Single Repository)  
├── clusters/  
│   ├── production/  
│   │   ├── flux-system/  
│   │   ├── infrastructure.yaml  
│   │   └── applications.yaml  
│   ├── staging/  
│   └── development/  
├── infrastructure/  
│   ├── base/  
│   ├── production/  
│   └── staging/  
└── applications/  
    ├── app-1/  
    ├── app-2/  
    └── shared/  
  
Option 2: Multi-repo (Separate Repositories)  
Repo: flux-config  
├── clusters/  
│   └── production/  
│       ├── infrastructure.yaml  
│       └── applications.yaml  
  
Repo: infrastructure  
├── base/  
└── overlays/  
  
Repo: app-1  
├── k8s/  
└── src/
```

### Configuration Guidelines

```
┌────────────────────────────────────────────────────────────┐  
│                  Best Practices                            │  
├────────────────────────────────────────────────────────────┤  
│                                                            │  
│  1. Intervals                                              │  
│     ├─ GitRepository: 1m (fast feedback)                   │  
│     ├─ HelmRepository: 30m (charts change less often)      │  
│     ├─ Kustomization: 10m (balance between load/speed)     │  
│     └─ HelmRelease: 30m                                    │  
│                                                            │  
│  2. Health Checks                                          │  
│     └─ Always enable wait and health checks for critical   │  
│        resources                                           │  
│                                                            │  
│  3. Pruning                                                │  
│     └─ Enable prune: true to clean up deleted resources    │  
│                                                            │  
│  4. Notifications                                          │  
│     └─ Set up alerts for failed reconciliations            │  
│                                                            │  
│  5. Resource Limits                                        │  
│     └─ Set CPU/memory limits on Flux controllers           │  
│                                                            │  
│  6. Webhooks                                               │  
│     └─ Use webhooks for instant reconciliation on push     │  
│                                                            │  
│  7. Dependencies                                           │  
│     └─ Use dependsOn for ordered deployments               │  
│                                                            │  
│  8. Secrets                                                │  
│     └─ Never commit plaintext secrets to Git               │  
│                                                            │  
└────────────────────────────────────────────────────────────┘
```

### Monitoring and Observability

```
Monitoring Stack  
───────────────  
  
┌─────────────────────────────────────────────────────────┐  
│  Flux Metrics (Prometheus)                              │  
├─────────────────────────────────────────────────────────┤  
│  • gotk_reconcile_condition (status of reconciliations) │  
│  • gotk_reconcile_duration_seconds (performance)        │  
│  • gotk_suspend_status (suspended resources)            │  
└─────────────────────────────────────────────────────────┘  
         │  
         ▼  
┌─────────────────────────────────────────────────────────┐  
│  Grafana Dashboards                                     │  
├─────────────────────────────────────────────────────────┤  
│  • Flux Cluster Stats                                   │  
│  • Flux Control Panel                                   │  
│  • Resource Reconciliation Status                       │  
└─────────────────────────────────────────────────────────┘  
         │  
         ▼  
┌─────────────────────────────────────────────────────────┐  
│  Alerts (Prometheus Alertmanager)                       │  
├─────────────────────────────────────────────────────────┤  
│  • Reconciliation failures                              │  
│  • Suspended resources                                  │  
│  • Source unavailable                                   │  
└─────────────────────────────────────────────────────────┘
```

**Key Metrics to Monitor:**

```
# Alert when reconciliation is failing  
- alert: FluxReconciliationFailure  
  expr: gotk_reconcile_condition{type="Ready",status="False"} == 1  
  for: 10m  
  annotations:  
    summary: "Flux reconciliation failing for {{ $labels.name }}"  
  
# Alert when reconciliation is taking too long  
- alert: FluxReconciliationSlow  
  expr: gotk_reconcile_duration_seconds > 300  
  for: 5m  
  annotations:  
    summary: "Flux reconciliation slow for {{ $labels.name }}"
```

## 10. Troubleshooting

### Common Issues and Solutions

```
┌────────────────────────────────────────────────────────────┐  
│              Troubleshooting Decision Tree                 │  
└────────────────────────────────────────────────────────────┘  
  
Is reconciliation happening?  
│  
├─ NO ──> Check:  
│         ├─ Resource suspended? (flux get all)  
│         ├─ Controller running? (kubectl get pods -n flux-system)  
│         └─ Interval configured? (Check spec.interval)  
│  
└─ YES ──> Is it succeeding?  
           │  
           ├─ NO ──> Check:  
           │         ├─ Status condition (flux get kustomizations)  
           │         ├─ Events (kubectl describe)  
           │         ├─ Logs (flux logs)  
           │         └─ Source accessible? (flux get sources)  
           │  
           └─ YES ──> Is cluster state correct?  
                     │  
                     ├─ NO ──> Check:  
                     │         ├─ Drift? (kubectl diff)  
                     │         ├─ Health checks passing?  
                     │         └─ Prune enabled?  
                     │  
                     └─ YES ──> All working!
```

### Useful Commands

```bash
# Check all Flux resources  
flux get all  
  
# Check specific resource type  
flux get kustomizations  
flux get helmreleases  
flux get sources git  
  
# View logs  
flux logs --level=error  
flux logs --kind=Kustomization --name=my-app  
  
# Force reconciliation  
flux reconcile kustomization my-app --with-source  
  
# Suspend/resume reconciliation  
flux suspend kustomization my-app  
flux resume kustomization my-app  
  
# Check what would be applied  
flux diff kustomization my-app  
  
# Export current configuration  
flux export kustomization my-app  
  
# Trace dependencies  
flux tree kustomization my-app  
  
# Check system status  
flux check
```

### Common Error Scenarios

```
┌────────────────────────────────────────────────────────────┐  
│  Error: "Source not found"                                 │  
├────────────────────────────────────────────────────────────┤  
│  Cause: GitRepository/HelmRepository doesn't exist         │  
│  Solution: Check sourceRef.name matches actual resource    │  
└────────────────────────────────────────────────────────────┘  
  
┌────────────────────────────────────────────────────────────┐  
│  Error: "Authentication failed"                            │  
├────────────────────────────────────────────────────────────┤  
│  Cause: Missing or invalid credentials                     │  
│  Solution:                                                 │  
│    1. Check secretRef exists                               │  
│    2. Verify secret contains correct keys                  │  
│    3. For SSH: known_hosts, identity                       │  
│    4. For HTTPS: username, password                        │  
└────────────────────────────────────────────────────────────┘  
  
┌────────────────────────────────────────────────────────────┐  
│  Error: "Health check failed"                              │  
├────────────────────────────────────────────────────────────┤  
│  Cause: Resource not becoming ready within timeout         │  
│  Solution:                                                 │  
│    1. Increase spec.timeout                                │  
│    2. Check resource status: kubectl describe              │  
│    3. Review application logs                              │  
│    4. Verify dependencies are ready                        │  
└────────────────────────────────────────────────────────────┘  
  
┌────────────────────────────────────────────────────────────┐  
│  Error: "Dependency not ready"                             │  
├────────────────────────────────────────────────────────────┤  
│  Cause: Resource in dependsOn is not ready                 │  
│  Solution: Check dependency status first                   │  
│    flux get kustomization <dependency-name>                │  
└────────────────────────────────────────────────────────────┘
```

### Debug Workflow

```
Systematic Debugging Process  
────────────────────────────  
  
Step 1: Check Flux System Health  
└─> flux check  
  
Step 2: List All Resources  
└─> flux get all  
  
Step 3: Identify Failed Resources  
└─> flux get kustomizations | grep False  
  
Step 4: Examine Specific Resource  
└─> kubectl describe kustomization -n flux-system <name>  
  
Step 5: Check Events  
└─> kubectl get events -n flux-system --sort-by='.lastTimestamp'  
  
Step 6: Review Logs  
└─> flux logs --kind=Kustomization --name=<name>  
  
Step 7: Verify Source  
└─> flux get sources git  
  
Step 8: Check Git Repository Access  
└─> kubectl get gitrepository -n flux-system <name> -o yaml  
  
Step 9: Manual Reconciliation Test  
└─> flux reconcile kustomization <name> --with-source  
  
Step 10: Inspect Cluster Resources  
└─> kubectl get all -n <target-namespace>
```

## Summary

FluxCD implements GitOps for Kubernetes through:

* **Declarative Configuration**: All desired state lives in Git
* **Specialized Controllers**: Each handles specific aspects (sources, kustomize, helm, notifications)
* **Continuous Reconciliation**: Automatic sync and drift correction
* **Extensibility**: Image automation, multi-tenancy, progressive delivery
* **Security**: Pull-based model, secret management integrations

**The Core Loop:**

```
Git Commit ──> Flux Detects ──> Apply to Cluster ──> Monitor Health ──> Repeat  
                    ▲                                       │  
                    │                                       │  
                    └───────────────────────────────────────┘  
                              (Continuous)
```

FluxCD enables teams to:

* Deploy faster with confidence
* Maintain consistency across environments
* Audit all changes through Git history
* Automatically recover from drift
* Scale operations across multiple clusters

This guide covered the fundamentals through advanced features. For production use, combine these concepts with proper monitoring, secrets management, and team workflows specific to your organization.

## Additional Resources

* **Official Documentation**: <https://fluxcd.io/docs/>
* **GitHub**: <https://github.com/fluxcd/flux2>
* **Best Practices Guide**: <https://fluxcd.io/flux/guides/>
