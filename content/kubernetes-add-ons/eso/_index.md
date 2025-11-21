---
title: External Secrets Operator
linkTitle: Secrets Operator
type: docs
weight: 1
---

## What is External Secrets Operator (ESO)?

External Secrets Operator is a Kubernetes operator that integrates external secret management systems (like AWS Secrets Manager, HashiCorp Vault, Azure Key Vault, Google Secret Manager) with Kubernetes, allowing us to securely manage secrets outside of Kubernetes while making them available as native Kubernetes Secret objects.

### Problem It Solves

* **Security**: Avoids storing secrets directly in Kubernetes (only base64-encoded)
* **Centralization**: Single source of truth for secrets across your organization
* **GitOps-friendly**: Commit secret references to Git, not actual secret values
* **Automation**: Automatic secret rotation and synchronization

### Key Benefits

 ✅ Centralized secret management  
 ✅ Automatic secret rotation  
 ✅ No secrets in Git repositories  
 ✅ Multi-tenancy support  
 ✅ Works with 20+ secret backends  
 ✅ Native Kubernetes integration

## Core Concepts

### The Three Layers

```
┌─────────────────────────────────────────────────────────┐  
│ 1. EXTERNAL SECRET STORE                                │  
│    (AWS/Vault/Azure/GCP/etc.)                           │  
│    → Where actual secrets are stored                    │  
└─────────────────────────────────────────────────────────┘  
                         ↕  
┌─────────────────────────────────────────────────────────┐  
│ 2. SECRETSTORE / CLUSTERSECRETSTORE                     │  
│    (Kubernetes Custom Resource)                         │  
│    → Connection configuration to external store         │  
└─────────────────────────────────────────────────────────┘  
                         ↕  
┌─────────────────────────────────────────────────────────┐  
│ 3. EXTERNALSECRET / CLUSTEREXTERNALSECRET               │  
│    (Kubernetes Custom Resource)                         │  
│    → Instructions for which secrets to fetch            │  
└─────────────────────────────────────────────────────────┘  
                         ↓  
┌─────────────────────────────────────────────────────────┐  
│ 4. KUBERNETES SECRET                                    │  
│    (Native K8s Resource)                                │  
│    → Final secret consumed by applications              │  
└─────────────────────────────────────────────────────────┘
```

### Architecture & Flow

```
### Complete Flow Diagram  
┌─────────────────────────────────────────────────────────────────┐  
│                     KUBERNETES CLUSTER                          │  
│                                                                 │  
│  ┌──────────────────────────────────────────────────────────┐   │  
│  │ 1. Administrator Creates Resources                       │   │  
│  │                                                          │   │  
│  │  ┌────────────────┐      ┌──────────────────┐            │   │  
│  │  │ SecretStore    │      │ ExternalSecret   │            │   │  
│  │  ├────────────────┤      ├──────────────────┤            │   │  
│  │  │ Provider: AWS  │      │ secretStoreRef   │            │   │  
│  │  │ Region: us-e-1 │      │ target: db-creds │            │   │  
│  │  │ Auth: IAM Role │      │ data:            │            │   │  
│  │  └────────────────┘      │  - key: password │            │   │  
│  │                          └──────────────────┘            │   │  
│  └──────────────────────────────────────────────────────────┘   │  
│                              │                                  │  
│                              │ watches                          │  
│                              ▼                                  │  
│  ┌──────────────────────────────────────────────────────────┐   │  
│  │ 2. External Secrets Operator (Controller)                │   │  
│  │                                                          │   │  
│  │    ┌─────────────────────────────────────┐               │   │  
│  │    │  • Watches ExternalSecret resources │               │   │  
│  │    │  • Reads SecretStore config         │               │   │  
│  │    │  • Authenticates with provider      │               │   │  
│  │    │  • Fetches secret data              │               │   │  
│  │    │  • Creates/Updates K8s Secret       │               │   │  
│  │    └─────────────────────────────────────┘               │   │  
│  │                                                          │   │  
│  └──────────────────────────────────────────────────────────┘   │  
│                              │                                  │  
│                              │ API call                         │  
│                              ▼                                  │  
└─────────────────────────────────────────────────────────────────┘  
                               │  
                               │ HTTPS/TLS  
                               │  
        ┌──────────────────────┼──────────────────────┐  
        │                      │                      │  
        ▼                      ▼                      ▼  
┌───────────────┐      ┌──────────────┐      ┌──────────────┐  
│ AWS Secrets   │      │  HashiCorp   │      │ Azure Key    │  
│   Manager     │      │    Vault     │      │    Vault     │  
├───────────────┤      ├──────────────┤      ├──────────────┤  
│ Secret:       │      │ Path: db/    │      │ Secret:      │  
│ db-password   │      │ prod/creds   │      │ db-creds     │  
│               │      │              │      │              │  
│ Value:        │      │ Value:       │      │ Value:       │  
│ "sup3rS3cr3t" │      │ "v4ultP@ss"  │      │ "azur3P@ss"  │  
└───────────────┘      └──────────────┘      └──────────────┘  
        │                      │                      │  
        └──────────────────────┼──────────────────────┘  
                               │  
                    3. Returns secret data  
                               │  
                               ▼  
┌─────────────────────────────────────────────────────────────────┐  
│                     KUBERNETES CLUSTER                          │  
│                                                                 │  
│  ┌──────────────────────────────────────────────────────────┐   │  
│  │ 4. Operator Creates/Updates Native K8s Secret            │   │  
│  │                                                          │   │  
│  │  ┌────────────────────────────────────────┐              │   │  
│  │  │ Secret: db-creds (type: Opaque)        │              │   │  
│  │  ├────────────────────────────────────────┤              │   │  
│  │  │ data:                                  │              │   │  
│  │  │   password: c3VwM3JTM2NyM3Q= (base64)  │              │   │  
│  │  └────────────────────────────────────────┘              │   │  
│  │                                                          │   │  
│  └──────────────────────────────────────────────────────────┘   │  
│                              │                                  │  
│                              │ mounts as volume/env             │  
│                              ▼                                  │  
│  ┌──────────────────────────────────────────────────────────┐   │  
│  │ 5. Application Pod Consumes Secret                       │   │  
│  │                                                          │   │  
│  │  ┌────────────────────────────────────┐                  │   │  
│  │  │  App Container                     │                  │   │  
│  │  │  ┌──────────────────────────────┐  │                  │   │  
│  │  │  │ ENV: DB_PASSWORD=sup3rS3cr3t │  │                  │   │  
│  │  │  │ (or mounted as file)         │  │                  │   │  
│  │  │  └──────────────────────────────┘  │                  │   │  
│  │  └────────────────────────────────────┘                  │   │  
│  │                                                          │   │  
│  └──────────────────────────────────────────────────────────┘   │  
│                                                                 │  
└─────────────────────────────────────────────────────────────────┘  
  
┌─────────────────────────────────────────────────────────────────┐  
│ 6. Continuous Reconciliation Loop                               │  
│    • Operator polls external secret store (configurable,        │  
│      default: 1 hour, can be set per ExternalSecret)            │  
│    • Updates K8s Secret if external value changed               │  
│    • Pods get updated secrets on restart or with reloader       │  
└─────────────────────────────────────────────────────────────────┘
```

## Resource Types

### Summary Table

| Resource                  | Scope     | Purpose                                                      |  
|---------------------------|-----------|--------------------------------------------------------------|  
| **SecretStore**           | Namespace | Connection config for one namespace                          |  
| **ClusterSecretStore**    | Cluster   | Connection config usable by all namespaces                   |  
| **ExternalSecret**        | Namespace | Syncs one secret to one namespace                            |  
| **ClusterExternalSecret** | Cluster   | Template that creates ExternalSecrets in multiple namespaces |

### SecretStore

**Purpose**: Namespace-scoped configuration that defines HOW to connect to an external secret provider.

- **Key Points**:

   - Lives in a single namespace
   - Only ExternalSecrets in the same namespace can use it
   - Contains authentication credentials/references
   - Does NOT store actual secrets

### ClusterSecretStore

**Purpose**: Cluster-wide configuration that can be referenced from any namespace.

- **Key Points**:

   - Cluster-scoped (no namespace)
   - Can be used by ExternalSecrets in ANY namespace
   - Useful for shared secret backends
   - Common for platform teams to provide

### ExternalSecret

**Purpose**: Defines WHICH secrets to fetch from the external store and HOW to map them to a Kubernetes Secret.

- **Key Points**:

   - Namespace-scoped
   - References a SecretStore or ClusterSecretStore
   - Specifies target Kubernetes Secret name
   - Defines data mapping from external to K8s Secret
   - Supports templates for data transformation

### ClusterExternalSecret

**Purpose**: Cluster-wide template that automatically creates `ExternalSecret` resources in multiple namespaces.

- **Key Points**:

   - Cluster-scoped
   - Creates ExternalSecrets in matching namespaces
   - Uses namespace selectors (labels/names)
   - Perfect for distributing common secrets (image pull secrets, CA certs)
   - DRY principle - define once, deploy everywhere

### PushSecret

**Purpose**: Reverse synchronization - pushes Kubernetes Secrets TO external secret stores (opposite of ExternalSecret).

- **Key Points**:

   - Namespace-scoped
   - Syncs K8s Secret data to external providers
   - Supports same providers as ExternalSecret
   - Can sync entire secrets or specific keys
   - **Useful for**:
        - Sharing K8s-generated secrets (certs, tokens) with external systems
        - Backing up secrets to external stores
        - Multi-cluster secret distribution

```
┌────────────────────────────────────────────────────────┐  
│ ClusterExternalSecret (cluster-scoped)                 │  
│ ┌────────────────────────────────────────────┐         │  
│ │ Defines:                                   │         │  
│ │ - Which namespaces get the secret          │         │  
│ │ - Template for ExternalSecret              │         │  
│ │ - What secrets to sync                     │         │  
│ └────────────────────────────────────────────┘         │  
└────────────────────────────────────────────────────────┘  
                         │  
                         │ Automatically creates  
                         ▼  
┌────────────────────────────────────────────────────────┐  
│ Multiple Namespaces                                    │  
│                                                        │  
│  namespace: team-a                                     │  
│  ┌──────────────────────────────────┐                  │  
│  │ ExternalSecret                   │                  │  
│  └──────────────────────────────────┘                  │  
│           ↓                                            │  
│  ┌──────────────────────────────────┐                  │  
│  │ Secret                           │                  │  
│  └──────────────────────────────────┘                  │  
│                                                        │  
│  namespace: team-b                                     │  
│  ┌──────────────────────────────────┐                  │  
│  │ ExternalSecret                   │                  │  
│  └──────────────────────────────────┘                  │  
│           ↓                                            │  
│  ┌──────────────────────────────────┐                  │  
│  │ Secret                           │                  │  
│  └──────────────────────────────────┘                  │  
└────────────────────────────────────────────────────────┘
```

### The Collision Scenario

```
┌─────────────────────────────────────────────────────────┐  
│ Team A (First)                                          │  
│                                                         │  
│  namespace: abc-namespace                               │  
│  labels: team=abc-team, monitoring=enabled              │  
│                                                         │  
│  ┌──────────────────────────────────────┐               │  
│  │ ExternalSecret                       │               │  
│  │ name: datadog-secret                 │ ◄──── Manually created  
│  │ target: datadog-api-key              │               │  
│  └──────────────────────────────────────┘               │  
│           ↓                                             │  
│  ┌──────────────────────────────────────┐               │  
│  │ Secret: datadog-api-key              │               │  
│  └──────────────────────────────────────┘               │  
└─────────────────────────────────────────────────────────┘  
  
                    ⚠️  COLLISION  ⚠️  
  
┌─────────────────────────────────────────────────────────┐  
│ Team B (Later)                                          │  
│                                                         │  
│  ┌──────────────────────────────────────┐               │  
│  │ ClusterExternalSecret                │               │  
│  │ name: datadog-monitoring             │               │  
│  │                                      │               │  
│  │ namespaceSelector:                   │               │  
│  │   matchLabels:                       │               │  
│  │     monitoring: enabled              │ ◄──── Your namespace matches!  
│  │                                      │               │  
│  │ externalSecretSpec:                  │               │  
│  │   target:                            │               │  
│  │     name: datadog-secret             │ ◄──── Same name!  
│  └──────────────────────────────────────┘               │  
└─────────────────────────────────────────────────────────┘  
                         │  
                         │ Tries to create  
                         ▼  
┌─────────────────────────────────────────────────────────┐  
│ abc-namespace                                           │  
│                                                         │  
│  ❌ ERROR: ExternalSecret "datadog-secret" already      │  
│     exists but is not managed by ClusterExternalSecret  │  
│                                                         │  
│  The ClusterExternalSecret controller cannot            │  
│  create/update the ExternalSecret because:              │  
│  - Its owned by a different resource (you)              │  
│  - OwnerReferences don't match                          │  
└─────────────────────────────────────────────────────────┘
```

### How to Check for Collision?

#### Check ExternalSecret Status

```bash
kubectl get externalsecret -n <namespace>
```

#### Check ExternalSecret Ownership

```bash
kubectl get externalsecret datadog-secret -n <namespace> -o yaml | grep -A 5 ownerReferences
```

* **If owned by ClusterExternalSecret**:

```yaml
ownerReferences:  
- apiVersion: external-secrets.io/v1beta1  
  kind: ClusterExternalSecret  
  name: datadog-monitoring  
  uid: abc-123-def  
  controller: true  
  blockOwnerDeletion: true
```

* **If manually created**:

```yaml
# No ownerReferences field  
metadata:  
  name: datadog-secret  
  namespace: your-namespace  
  # ownerReferences is absent
```

## Templates

### What Are Templates?

Templates allow us to **transform and customize** secret data before it becomes a Kubernetes Secret. Instead of copying values directly, we can:

- Combine multiple secrets
- Reformat data (JSON, YAML, .env files)
- Add static configuration
- Apply transformations

### Template Mechanisms

- **Inline Templates (in ExternalSecret)** → Define transformation logic directly in the ExternalSecret spec.
- **TemplateFrom (reference external sources)** → Reference ConfigMaps or other resources as templates.
- **Benefits of TemplateFrom**:

    - Separate configuration from secret definition
    - Reuse templates across multiple ExternalSecrets
    - Easier to manage complex templates
    - Platform teams can provide standard templates

```
### Template Flow Visualization  
┌─────────────────────────────────────────────────────────┐  
│ External Secret Store                                   │  
│                                                         │  
│  prod/db/username  →  "dbadmin"                         │  
│  prod/db/password  →  "secret123"                       │  
│  prod/db/host      →  "db.example.com"                  │  
│  prod/db/port      →  "5432"                            │  
└─────────────────────────────────────────────────────────┘  
                         │  
                         │ ESO Fetches  
                         ▼  
┌─────────────────────────────────────────────────────────┐  
│ ExternalSecret with Template                            │  
│                                                         │  
│  template:                                              │  
│    data:                                                │  
│      DATABASE_URL: "postgres://{{ .username }}:{{       │  
│        .password }}@{{ .host }}:{{ .port }}/mydb"       │  
└─────────────────────────────────────────────────────────┘  
                         │  
                         │ Template Rendered  
                         ▼  
┌─────────────────────────────────────────────────────────┐  
│ Kubernetes Secret (base64 encoded)                      │  
│                                                         │  
│  data:                                                  │  
│    DATABASE_URL: "postgres://dbadmin:secret123@db.      │  
│      example.com:5432/mydb"                             │  
└─────────────────────────────────────────────────────────┘  
                         │  
                         │ Mounted/Injected  
                         ▼  
┌─────────────────────────────────────────────────────────┐  
│ Application Pod                                         │  
│                                                         │  
│  Environment Variable or File Mount Available           │  
└─────────────────────────────────────────────────────────┘
```

## Common Use Cases

- **Database Credentials** → Application needs database credentials from AWS Secrets Manager.
- **Multi-Environment Setup** → Different secrets for dev/staging/prod, same structure.
- **Docker Registry Credentials (ClusterExternalSecret)** → All namespaces need the same Docker registry credentials.
- **TLS Certificates** → Sync TLS certificates from Vault to Kubernetes for Ingress.
- **Configuration File with Multiple Secrets** → Application needs a single config file with secrets from different sources.

## Quick Reference Commands

### Installation

```bash
# Helm installation  
helm repo add external-secrets https://charts.external-secrets.io  
helm install external-secrets external-secrets/external-secrets -n external-secrets-system --create-namespace  
  
# Verify installation  
kubectl get pods -n external-secrets-system
```

### Debugging

```bash
# Check ExternalSecret status  
kubectl describe externalsecret <name> -n <namespace>  
  
# Check generated Secret  
kubectl get secret <target-secret-name> -n <namespace>  
  
# View operator logs  
kubectl logs -n external-secrets-system deployment/external-secrets  
  
# Check SecretStore status  
kubectl get secretstore -n <namespace>  
kubectl describe secretstore <name> -n <namespace>  
  
# Check ClusterSecretStore  
kubectl get clustersecretstore  
kubectl describe clustersecretstore <name>
```

### Common Status Conditions

```yaml
# Healthy ExternalSecret  
status:  
  conditions:  
  - type: Ready  
    status: "True"  
    reason: SecretSynced  
  
# Failed sync  
status:  
  conditions:  
  - type: Ready  
    status: "False"  
    reason: SecretSyncedError  
    message: "could not fetch secret: access denied"
```
