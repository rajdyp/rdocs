---
title: Advanced Topics
linkTitle: Advanced Topics
type: docs
weight: 16
prev: /kubernetes/15-observability
---

## Overview

This chapter covers advanced Kubernetes concepts that extend the platform's capabilities: finalizers, custom resources, operators, service mesh, and GitOps.

```
┌──────────────────────────────────────────────────────────┐
│              Advanced Kubernetes Topics                  │
│                                                          │
│  Finalizers                                              │
│  └─ Graceful deletion, cleanup hooks                     │
│                                                          │
│  Custom Resources (CRD)                                  │
│  └─ Extend Kubernetes API                                │
│                                                          │
│  Operators                                               │
│  └─ Automated application management                     │
│                                                          │
│  Service Mesh                                            │
│  └─ Advanced networking (Istio, Linkerd)                 │
│                                                          │
│  Admission Webhooks                                      │
│  └─ Custom validation/mutation                           │
│                                                          │
│  Helm                                                    │
│  └─ Package management, templating, versioning           │
│                                                          │
│  Kustomize                                               │
│  └─ Configuration management (base + overlays)           │
│                                                          │
│  GitOps                                                  │
│  └─ Infrastructure as Code, declarative deployments      │
└──────────────────────────────────────────────────────────┘
```

## Finalizers

### Problem: Graceful Deletion

```
Without finalizers:
  kubectl delete pod my-pod
     ↓
  Pod immediately terminated
  ├─ No cleanup performed
  ├─ External resources not released
  ├─ Database transactions rolled back
  └─ Data potentially inconsistent

Example:
  Pod with PVC
    ├─ kubectl delete pod
    └─ Pod deleted, PVC still exists (orphaned)
```

### Solution: Finalizers

A **Finalizer** is a metadata key that blocks Kubernetes from deleting a resource until the controller has completed its cleanup tasks.

```
Resource deletion with finalizers:

1. User deletes resource
   kubectl delete pod my-pod

2. Pod deletion initiated (not removed yet)
   ├─ metadata.deletionTimestamp set
   └─ metadata.finalizers still contains entries

3. Controller sees deletionTimestamp
   ├─ Performs cleanup (release ports, close connections)
   └─ Removes finalizer when done

4. Once all finalizers removed
   └─ Resource actually deleted from etcd
```

### Finalizer Manifest

```yaml
# metadata.finalizers

apiVersion: v1
kind: Pod
metadata:
  name: app-with-cleanup
  finalizers:
  - "cleanup.example.com/release-ports"
  - "cleanup.example.com/close-connections"
spec:
  containers:
  - name: app
    image: myapp:1.0
```

### Deletion Flow with Finalizers

```
Timeline:

T=0s:  kubectl delete pod app-with-cleanup
T=0s:  Pod phase changes to "Terminating"
T=0s:  deletionTimestamp = now
       finalizers = ["cleanup/release-ports", "cleanup/close-connections"]

T=1s:  Cleanup controller detects deletionTimestamp
       Performs cleanup:
       ├─ Release ports
       └─ Close database connections

T=2s:  Cleanup complete
       Remove first finalizer:
       finalizers = ["cleanup/release-ports"]

T=3s:  Second cleanup task finishes
       Remove second finalizer:
       finalizers = ["cleanup/close-connections"]

T=4s:  Pod removed from etcd
       Deletion complete
```

### Finalizer kubectl Commands

```bash
# Manual removal (if stuck)
$ kubectl patch <resource> <name> -p '{"metadata":{"finalizers":[]}}' --type=merge

# Check for Finalizers
kubectl get <resource> <name> -o json | jq .metadata.finalizers

# Check for deletionTimestamp
kubectl get <resource> <name> -o json | jq .metadata.deletionTimestamp
```

## Custom Resource Definitions (CRD)

### Problem: Limited Built-in Resources

```
Kubernetes built-in resources:
  ├─ Pod, Deployment, StatefulSet
  ├─ Service, Ingress
  ├─ ConfigMap, Secret
  ├─ PVC, Storage Classes
  └─ ...

What if you need:
  ├─ Database resource
  ├─ Certificate
  ├─ Machine Learning model
  ├─ API gateway
  └─ Custom application resource?
```

### Solution: Custom Resource Definitions

A **CRD** extends the Kubernetes API with custom resource types.

**Important**: CRDs alone only define the schema - they don't create actual infrastructure. To automate actions when CRD instances are created, you need a controller/operator (covered in next section).

```
After creating CRD:
  kubectl create -f database-crd.yaml

You can now use kubectl with your custom resource:
  kubectl apply -f database.yaml
  kubectl get databases           # ✓ Works - shows your Database resource
  kubectl describe database mydb  # ✓ Works - shows the spec you defined
  kubectl delete database mydb    # ✓ Works - deletes the resource

BUT: No actual database pods/services are created yet!
     (You need an Operator/Controller for that)
```

### Creating a CRD

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: databases.example.com
spec:
  group: example.com
  names:
    kind: Database
    plural: databases
  scope: Namespaced  # Custom resources live inside namespaces (use 'Cluster' for cluster-wide)

  versions:
  - name: v1
    served: true
    storage: true
    schema:
      openAPIV3Schema:
        type: object
        properties:
          spec:
            type: object
            properties:
              engine:
                type: string
                enum: ["postgres", "mysql", "mongodb"]
              version:
                type: string
              storage:
                type: string
                pattern: '^\d+Gi$'
              backup:
                type: object
                properties:
                  enabled:
                    type: boolean
                  frequency:
                    type: string
            required:
            - engine
            - version

          status:
            type: object
            properties:
              phase:
                type: string
                enum: ["Creating", "Ready", "Failed"]
              endpoint:
                type: string
              lastBackup:
                type: string
```

### Using a CRD

```yaml
apiVersion: example.com/v1
kind: Database
metadata:
  name: production-db
  namespace: default
spec:
  engine: postgres
  version: "14"
  storage: 100Gi
  backup:
    enabled: true
    frequency: "daily"

---
# kubectl apply -f database.yaml
# kubectl get databases
# kubectl describe database production-db
```

**What happens after applying this?**

* ✓ Kubernetes stores this Database resource in etcd
* ✓ You can query it with kubectl commands
* ✗ **No actual PostgreSQL database is created**
* ✗ No pods, services, or storage provisioned

To actually provision infrastructure, you need an **Operator**that watches for Database resources and creates the necessary Kubernetes objects.

## Operators

### Problem: Complex Application Management

```
Manual Kubernetes management:
  Deploying a database:
    ├─ Create StatefulSet
    ├─ Create Service
    ├─ Create ConfigMap
    ├─ Create Secret
    ├─ Create PVC
    ├─ Configure backup
    ├─ Setup replication
    ├─ Monitor health
    └─ Manual upgrades, scaling, failover

Challenges:
  ✗ Complex setup process
  ✗ Domain knowledge required
  ✗ Manual operations error-prone
  ✗ Difficult to automate lifecycle
```

### Solution: Operators

An **Operator** is a Kubernetes extension that automates application-specific operational tasks.

```
Operator = CRD + Controller

CRD:
  └─ Database custom resource

Controller:
  ├─ Watches Database resources
  ├─ Creates required StatefulSet
  ├─ Creates required Services
  ├─ Manages backups
  ├─ Handles upgrades
  ├─ Manages replication
  └─ Performs scaling

Result:
  User creates Database resource
  Operator handles everything else
```

### Operator Example

```
PostgreSQL Operator:
  kubectl create database postgres-prod --engine=postgres --version=14

  Operator automatically:
    ├─ Creates StatefulSet (3 replicas)
    ├─ Creates Service
    ├─ Configures replication
    ├─ Sets up backup
    ├─ Creates monitoring
    └─ Exposes at postgres-prod.default.svc

User perspective:
  Simple: kubectl create database postgres-prod
  Complex: Operator handles 50+ resources

Benefits:
  ✓ Easier to use (simple API)
  ✓ Best practices built-in
  ✓ Automated operations (upgrades, backups)
  ✓ Domain knowledge encapsulated
```

### Common Operators

| Operator                      | Purpose                               |
|-------------------------------|---------------------------------------|
| PostgreSQL Operator (Zalando) | PostgreSQL deployment, HA, backups    |
| MySQL Operator                | MySQL deployment, replication         |
| MongoDB Operator              | MongoDB replica sets, sharding        |
| Elasticsearch Operator        | Elasticsearch cluster management      |
| Prometheus Operator           | Prometheus setup, alerts              |
| Cert-Manager                  | Certificate management (Lets Encrypt) |
| Kafka Operator                | Kafka cluster managemen               |

## Admission Webhooks

### Webhook Types

**Validating Webhook** - Validates requests and can approve or reject them.

* **Purpose**: Enforce policies and ensure requests meet criteria
* **Cannot**: Modify the request
* **Examples**: Reject pods without resource limits, enforce naming conventions, block privileged containers

**Mutating Webhook** - Modifies requests before they are persisted (stored in etcd).

* **Purpose**: Inject or modify fields in the object
* **Can**: Change any part of the request
* **Examples**: Inject sidecar containers, set default resource limits, add labels/annotations

### Webhook Execution Order

```
API Request
  ↓
Mutating Webhooks (run first)
  ├─ Modify the object
  └─ Can inject sidecars, set defaults
  ↓
Validating Webhooks (run after)
  ├─ Validate the (possibly modified) object
  └─ Approve or reject
  ↓
Object persisted to etcd (if approved)
```

| Feature     | Mutating Webhook              | Validating Webhook             |
|-------------|-------------------------------|--------------------------------|
| Action      | Modify then approve           | Approve/Reject only            |
| Can modify? | Yes                           | No                             |
| Runs        | First                         | After mutations                |
| Use cases   | Inject sidecars, set defaults | Policy enforcement, validation |

### Validating Webhook Example

```yaml
apiVersion: admissionregistration.k8s.io/v1
kind: ValidatingWebhookConfiguration
metadata:
  name: image-policy
webhooks:
- name: image-policy.example.com
  clientConfig:
    service:
      name: webhook-service
      namespace: default
      path: "/validate"
    caBundle: LS0tLS1CRUdJTi... (base64)
  rules:
  - operations: ["CREATE", "UPDATE"]
    apiGroups: [""]
    apiVersions: ["v1"]
    resources: ["pods"]
  admissionReviewVersions: ["v1"]
  sideEffects: None

---
# Webhook service that only allows whitelisted images
apiVersion: v1
kind: Service
metadata:
  name: webhook-service
spec:
  ports:
  - port: 443
    targetPort: 8443
  selector:
    app: image-policy-webhook
```

### Mutating Webhook Example

```yaml
apiVersion: admissionregistration.k8s.io/v1
kind: MutatingWebhookConfiguration
metadata:
  name: add-resource-quotas
webhooks:
- name: add-resources.example.com
  clientConfig:
    service:
      name: webhook-service
      namespace: default
      path: "/mutate"
    caBundle: LS0tLS1CRUdJTi...
  rules:
  - operations: ["CREATE"]
    apiGroups: [""]
    apiVersions: ["v1"]
    resources: ["pods"]

---
# Webhook that adds default resource limits
# Original pod:
#   spec:
#     containers:
#     - name: app
#       image: myapp:1.0

# After webhook mutation:
#   spec:
#     containers:
#     - name: app
#       image: myapp:1.0
#       resources:
#         requests:
#           cpu: 100m
#           memory: 128Mi
#         limits:
#           cpu: 500m
#           memory: 512Mi
```

## Service Mesh

### Problem: Communication Complexity

```
Challenges in microservices:
  ├─ Unencrypted traffic (HTTP)
  ├─ No mutual authentication
  ├─ Retry logic scattered in apps
  ├─ No traffic observability
  ├─ Difficult traffic management
  ├─ Manual circuit breakers
  ├─ Complex ingress/egress controls
  └─ Complex cross-cutting concerns
```

### Solution: Service Mesh

A **Service Mesh** is a dedicated infrastructure layer that handles service-to-service (east-west) communication within a cluster, and can optionally integrate with ingress/egress (north-south) gateways for external traffic. It decouples network logic from business logic.

```
Traffic Types:

East-West (Service-to-Service) - Primary Service Mesh Focus:
  Pod A ←→ Pod B
  Pod B ←→ Pod C
  Internal cluster communication
  (Handled by sidecar proxies)

North-South (Ingress/Egress) - Optional Integration:
  External Client → Ingress Gateway → Services
  Services → External APIs/Databases
  Traffic entering/leaving the cluster
  (Handled by optional gateway components like Istio Ingress Gateway)
```

```
Without Service Mesh:
  Pod A → (HTTP) → Pod B
         ├─ App handles encryption
         ├─ App handles retries
         ├─ App handles circuit break
         ├─ App handles timeouts
         └─ App handles observability

With Service Mesh (Istio):
  Pod A → (HTTP) → sidecar proxy
                        ↓
                   (mTLS, retry, circuit break, trace)
                        ↓
                   sidecar proxy ← Pod B
                   (receives metrics, enforces policies)
```

### Service Mesh Features

| Feature             | Purpose                                                  |
|---------------------|----------------------------------------------------------|
| mTLS                | Automatic encryption between services                    |
| Traffic Management  | Routing, load balancing, retries, canary deployments     |
| Ingress Gateway     | (Optional) Secure external access (north-south traffic)  |
| Egress Control      | (Optional) Control outbound traffic to external services |
| Circuit Breaker     | Prevent cascading failures                               |
| Timeouts/Retries    | Automatic resilience                                     |
| Rate Limiting       | Control traffic flow                                     |
| Distributed Tracing | Understand request flow across services                  |
| Metrics             | Service-level observability                              |
| Access Policies     | Control which services can communicate                   |

### Service Mesh Implementations

| Mesh        | Characteristics                             |
|-------------|---------------------------------------------|
| Istio       | Most feature-rich, complex, large community |
| Linkerd     | Lightweight, fast, simple, built in Rust    |
| Consul      | Strong in multi-cluster, service discovery  |
| AWS AppMesh | AWS-native, works with ECS/EKS              |
| Kuma        | Universal, works with any platform          |

### Istio Example

```yaml
# Enable sidecar injection
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    istio-injection: enabled

---
# VirtualService: Control routing (where traffic goes)
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: api
spec:
  hosts:
  - api
  http:
  - match:
    - uri:
        prefix: "/v1"
    route:
    - destination:
        host: api
        subset: v1
      weight: 90
    - destination:
        host: api
        subset: v2
      weight: 10  # 10% canary

---
# DestinationRule: Configure traffic policies for destination (how traffic behaves)
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: api
spec:
  host: api
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 50
    outlierDetection:
      consecutive5xxErrors: 5
      interval: 30s
      baseEjectionTime: 30s

  subsets:
  - name: v1
    labels:
      version: v1
  - name: v2
    labels:
      version: v2

---
# PeerAuthentication: Enforce mTLS
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
spec:
  mtls:
    mode: STRICT  # Enforce mTLS
```

## Package Management with Helm

### Problem: Complex Application Installation

```
Installing a complex app (e.g., PostgreSQL with HA):

Manual approach:
  ├─ Write deployment.yaml (StatefulSet, 200+ lines)
  ├─ Write service.yaml (headless + regular service)
  ├─ Write configmap.yaml (PostgreSQL config)
  ├─ Write secret.yaml (passwords, certificates)
  ├─ Write pvc.yaml (storage claims)
  ├─ Write servicemonitor.yaml (Prometheus integration)
  ├─ Write networkpolicy.yaml (security)
  └─ Manage upgrades manually

Challenges:
  ✗ 500+ lines of YAML to write
  ✗ Complex configuration (dozens of options)
  ✗ No versioning or rollback
  ✗ No dependency management
  ✗ Difficult to share/reuse
  ✗ Manual parameter substitution
  ✗ Hard to upgrade
  ✗ Reinventing the wheel for common apps
```

### Solution: Helm

**Helm** is the package manager for Kubernetes (like apt/yum for Linux, npm for Node.js).

```
Helm approach:
  helm install my-postgres bitnami/postgresql

  Result:
    ✓ PostgreSQL deployed in seconds
    ✓ Best practices built-in
    ✓ Highly configurable (100+ options)
    ✓ Easy upgrades: helm upgrade
    ✓ Easy rollback: helm rollback
    ✓ Version management
    ✓ Community-maintained charts

Simple command = Complex deployment
```

### Helm Core Concepts

| Concept    | Description                                        |
|------------|----------------------------------------------------|
| Chart      | Package containing Kubernetes manifests + metadata |
| Repository | Collection of charts (like package registries)     |
| Release    | Instance of a chart running in the cluster         |
| Values     | Configuration parameters for charts                |
| Template   | Kubernetes YAML with Go templating                 |

```bash
Helm workflow:

# Add repository
helm repo add bitnami https://charts.bitnami.com/bitnami

# Search for charts
helm search repo postgres

# Install chart (creates release)
helm install my-db bitnami/postgresql

# List releases
helm list

# Upgrade release
helm upgrade my-db bitnami/postgresql --set replicaCount=3

# Rollback if needed
helm rollback my-db 1
```

### Using Helm Charts

```bash
# Add repository
helm repo add bitnami https://charts.bitnami.com/bitnami

# Update repository index
helm repo update

# Search for charts
helm search repo postgres

# Show chart information
helm show chart bitnami/postgresql
helm show values bitnami/postgresql

# Install with default values
helm install my-postgres bitnami/postgresql

# Install with custom values
helm install my-postgres bitnami/postgresql \
  --set auth.postgresPassword=secretpassword \
  --set replicaCount=3

# Install with values file
helm install my-postgres bitnami/postgresql -f values.yaml

# List installed releases
helm list
helm list --all-namespaces

# Get release status
helm status my-postgres

# Upgrade release
helm upgrade my-postgres bitnami/postgresql --set replicaCount=5

# Rollback to previous version
helm rollback my-postgres

# Uninstall release
helm uninstall my-postgres
```

### Custom Values File Example

```yaml
# values.yaml - Override default chart values
replicaCount: 3

auth:
  postgresPassword: "prod-password"
  database: "myapp_db"

primary:
  persistence:
    size: 100Gi
  resources:
    requests:
      cpu: 500m
      memory: 1Gi
```

### Creating a Custom Helm Chart

```
# Create new chart
helm create myapp

# Chart structure:
myapp/
├── Chart.yaml          # Chart metadata (name, version, dependencies)
├── values.yaml         # Default values
├── charts/             # Chart dependencies
├── templates/          # Kubernetes manifests (templated)
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── _helpers.tpl   # Template helpers
│   ├── NOTES.txt      # Post-install notes
│   └── tests/
└── .helmignore
```

**Chart.yaml Example:**

```yaml
apiVersion: v2
name: myapp
version: 1.0.0        # Chart version
appVersion: "2.3.1"   # Application version

dependencies:
  - name: postgresql
    version: "12.x.x"
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled
```

**values.yaml Example:**

```yaml
replicaCount: 2

image:
  repository: myapp
  tag: "1.0.0"

resources:
  requests:
    cpu: 100m
    memory: 128Mi

postgresql:
  enabled: true
  auth:
    database: myapp
```

**templates/deployment.yaml Example:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-myapp
spec:
  replicas: {{ .Values.replicaCount }}
  template:
    spec:
      containers:
      - name: myapp
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        resources:
          {{- toYaml .Values.resources | nindent 10 }}
        {{- if .Values.postgresql.enabled }}
        env:
        - name: DB_HOST
          value: {{ .Release.Name }}-postgresql
        {{- end }}
```

### Key Templating Concepts

```yaml
# Access values
{{ .Values.replicaCount }}
{{ .Values.image.tag | default "latest" }}

# Built-in objects
{{ .Chart.Name }}          # Chart name
{{ .Chart.Version }}       # Chart version
{{ .Release.Name }}        # Release name
{{ .Release.Namespace }}   # Target namespace

# Conditionals
{{- if .Values.ingress.enabled }}
# ingress config
{{- end }}

# Loops
{{- range .Values.hosts }}
- host: {{ . }}
{{- end }}
```

### Chart Management

```bash
# Validate chart
helm lint ./myapp

# Render templates locally (dry-run)
helm template my-release ./myapp

# Render with custom values
helm template my-release ./myapp -f prod-values.yaml

# Debug installation
helm install my-release ./myapp --dry-run --debug

# Show computed values
helm get values my-release

# Show manifest
helm get manifest my-release

# Download dependencies
helm dependency update ./myapp

# Package and share
helm package ./myapp
# Creates: myapp-1.0.0.tgz

# Push to OCI registry (Docker Hub, Harbor, etc.)
helm push myapp-1.0.0.tgz oci://registry.example.com/charts
```

### Helm Hooks (Lifecycle Management)

```yaml
# templates/job-migration.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: "{{ .Release.Name }}-db-migration"
  annotations:
    # Run before install/upgrade
    "helm.sh/hook": pre-install,pre-upgrade
    "helm.sh/hook-weight": "0"
    "helm.sh/hook-delete-policy": before-hook-creation
spec:
  template:
    spec:
      containers:
      - name: migration
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        command: ["./migrate.sh"]
        env:
        - name: DB_HOST
          value: {{ include "myapp.fullname" . }}-postgresql
      restartPolicy: Never
```

Available hooks:

* `pre-install` - Before resources are created
* `post-install` - After all resources are created
* `pre-upgrade` - Before upgrade
* `post-upgrade` - After upgrade
* `pre-delete` - Before deletion
* `post-delete` - After deletion
* `pre-rollback` - Before rollback
* `post-rollback` - After rollback

### Common Helm Patterns

**Multi-Environment Values:**

```yaml
# values-dev.yaml
replicaCount: 1
resources:
  requests:
    cpu: 100m
    memory: 128Mi

# values-prod.yaml
replicaCount: 5
resources:
  requests:
    cpu: 1000m
    memory: 2Gi

# Deploy
helm install myapp ./myapp -f values-prod.yaml
```

**Conditional Resources:**

```yaml
# templates/job.yaml
{{- if .Values.migrations.enabled }}
apiVersion: batch/v1
kind: Job
metadata:
  name: migration
spec:
  # ...
{{- end }}
```

**Named Templates for Common Config:**

```yaml
# _helpers.tpl
{{- define "myapp.env" -}}
- name: ENVIRONMENT
  value: {{ .Values.environment }}
- name: LOG_LEVEL
  value: {{ .Values.logLevel }}
{{- end }}

# deployment.yaml
env:
  {{- include "myapp.env" . | nindent 2 }}
```

### Helm Best Practices

```
✓ Use semantic versioning for charts
✓ Document all values in values.yaml
✓ Use _helpers.tpl for common templates
✓ Set resource limits
✓ Use hooks for migrations
✓ Test charts with `helm lint` and `helm test`
✓ Use dependencies for external services
✓ Provide sensible defaults
✓ Use .helmignore for unnecessary files
✓ Add NOTES.txt for post-install instructions

✗ Don't hardcode values (use .Values)
✗ Don't create default namespace
✗ Don't store secrets in charts (use external secrets)
✗ Don't over-template (keep it readable)
```

## Configuration Management with Kustomize

### Problem: Duplicated Configuration Across Environments

```
Traditional approach (duplicated YAML):

manifests/
├─ dev/
│  ├─ deployment.yaml       # 200 lines
│  ├─ service.yaml          # 50 lines
│  └─ configmap.yaml        # 30 lines
├─ staging/
│  ├─ deployment.yaml       # 200 lines (95% same as dev)
│  ├─ service.yaml          # 50 lines (almost identical)
│  └─ configmap.yaml        # 30 lines (few differences)
└─ production/
   ├─ deployment.yaml       # 200 lines (95% same as dev)
   ├─ service.yaml          # 50 lines (almost identical)
   └─ configmap.yaml        # 30 lines (few differences)

Problems:
  ✗ Massive duplication (600+ lines repeated 3x)
  ✗ Hard to maintain (update 3 files for 1 change)
  ✗ Error-prone (miss updating one environment)
  ✗ Difficult to see differences between environments
  ✗ No inheritance or composition
```

### Solution: Kustomize

**Kustomize** is a template-free configuration management tool for Kubernetes that uses layering and patching.

```
Kustomize approach (DRY):

kustomize/
├─ base/                    # Common configuration
│  ├─ deployment.yaml       # 200 lines (define once)
│  ├─ service.yaml          # 50 lines (define once)
│  ├─ configmap.yaml        # 30 lines (define once)
│  └─ kustomization.yaml    # References above files
└─ overlays/
   ├─ dev/
   │  └─ kustomization.yaml # 10 lines (only differences)
   ├─ staging/
   │  └─ kustomization.yaml # 15 lines (only differences)
   └─ production/
      ├─ kustomization.yaml # 20 lines (only differences)
      └─ replicas.yaml      # 5 lines (patch)

Benefits:
  ✓ Define base once (280 lines)
  ✓ Small overlays for differences (50 lines total)
  ✓ Easy to maintain (update base, all envs inherit)
  ✓ Clear environment differences
  ✓ Built into kubectl (no extra tools)
```

### Kustomize Core Concepts

| Concept     | Purpose                                               |
|-------------|-------------------------------------------------------|
| Base        | Common configuration shared across environment        |
| Overlay     | Environment-specific customizations                   |
| Patch       | Modifications applied to base resources               |
| Transformer | Built-in modifications (labels, namespaces, replicas) |
| Generator   | Generate ConfigMaps and Secrets                       |

### Basic Kustomize Structure

```yaml
# base/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 1  # Default, will be overridden
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:latest  # Will be overridden
        resources:
          requests:
            cpu: 100m
            memory: 128Mi

---
# base/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp
spec:
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 8080

---
# base/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
- deployment.yaml
- service.yaml

commonLabels:
  app: myapp
  managed-by: kustomize
```

### Development Overlay

```yaml
# overlays/dev/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

# Reference base
bases:
- ../../base

# Namespace for dev
namespace: dev

# Add labels
commonLabels:
  environment: dev

# Override image
images:
- name: myapp
  newName: myapp
  newTag: dev-latest

# Set replicas
replicas:
- name: myapp
  count: 1

# Add ConfigMap
configMapGenerator:
- name: myapp-config
  literals:
  - LOG_LEVEL=debug
  - ENVIRONMENT=development
```

### Production Overlay

```yaml
# overlays/production/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

bases:
- ../../base

namespace: production

commonLabels:
  environment: production

# Production image with specific tag
images:
- name: myapp
  newName: myapp
  newTag: v1.2.3

# Scale up for production
replicas:
- name: myapp
  count: 5

# Production config
configMapGenerator:
- name: myapp-config
  literals:
  - LOG_LEVEL=info
  - ENVIRONMENT=production

# Apply production-specific patches
patches:
- path: resources.yaml

---
# overlays/production/resources.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  template:
    spec:
      containers:
      - name: myapp
        resources:
          requests:
            cpu: 500m
            memory: 512Mi
          limits:
            cpu: 1000m
            memory: 1Gi
```

### Using Kustomize

```bash
# Build and view output (doesn't apply)
kubectl kustomize overlays/dev

# Apply directly
kubectl apply -k overlays/dev

# Apply production
kubectl apply -k overlays/production

# Diff before applying
kubectl diff -k overlays/production

# Delete resources
kubectl delete -k overlays/dev
```

### Advanced Patching Strategies

**When to use patches:**

* Base config doesn't have what you need for a specific environment
* Need to add sidecars only in production
* Need precise modifications to specific fields

**Strategic Merge Patch** - Best for adding/modifying large sections (containers, volumes):

```yaml
# Use case: Add logging sidecar only in production
# overlays/production/deployment-patch.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  template:
    spec:
      # Add sidecar container
      containers:
      - name: logging-sidecar
        image: fluentd:latest
        volumeMounts:
        - name: logs
          mountPath: /var/log
      volumes:
      - name: logs
        emptyDir: {}

---
# overlays/production/kustomization.yaml
patches:
- path: deployment-patch.yaml
```

**JSON 6902 Patch** - Best for precise modifications (change single value, add array item):

```yaml
# Use case: Scale up to 10 replicas and enable feature flag in production
# overlays/production/kustomization.yaml
patches:
- target:
    kind: Deployment
    name: myapp
  patch: |-
    - op: replace
      path: /spec/replicas
      value: 10
    - op: add
      path: /spec/template/spec/containers/0/env/-
      value:
        name: FEATURE_FLAG
        value: "enabled"
```

### Kustomize Components (Optional Features)

**When to use components:**

* Feature that's optional across multiple environments (e.g., monitoring, security policies)
* Want to enable/disable a bundle of resources together
* Avoid duplicating the same configuration across overlays

**Example: Optional monitoring that can be enabled in any environment**

```yaml
# components/monitoring/kustomization.yaml
# Reusable monitoring configuration
apiVersion: kustomize.config.k8s.io/v1alpha1
kind: Component

resources:
- servicemonitor.yaml

patches:
- patch: |-
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: not-important
    spec:
      template:
        metadata:
          annotations:
            prometheus.io/scrape: "true"
            prometheus.io/port: "8080"

---
# Enable monitoring in production
# overlays/production/kustomization.yaml
components:
- ../../components/monitoring

---
# Enable monitoring in staging too (reusable!)
# overlays/staging/kustomization.yaml
components:
- ../../components/monitoring
```

### Kustomize vs Helm

| Feature            | Kustomize                | Helm                            |
|--------------------|--------------------------|---------------------------------|
| Approach           | Base + overlay + patches | Charts with templates + values  |
| Complexity         | Simple, declarative      | More complex, imperative        |
| Built-in           | Yes (kubectl)            | Separate tool                   |
| Package management | No                       | Yes (charts, repos)             |
| Learning curve     | Gentle                   | Steeper                         |
| Use case           | Environment variations   | Complex apps, reusable packages |

```
When to use Kustomize:
  ✓ Managing multiple environments (dev/staging/prod)
  ✓ Simple overlay/patch patterns
  ✓ Want to avoid templating
  ✓ GitOps workflows
  ✓ Team prefers pure YAML

When to use Helm:
  ✓ Complex applications with many parameters
  ✓ Reusable packages across teams
  ✓ Need dependency management
  ✓ Want package versioning
  ✓ Installing third-party apps
```

### Complete Kustomize Example

```
# Directory structure
myapp/
├─ base/
│  ├─ deployment.yaml
│  ├─ service.yaml
│  ├─ configmap.yaml
│  └─ kustomization.yaml
├─ overlays/
│  ├─ dev/
│  │  ├─ kustomization.yaml
│  │  └─ resources-patch.yaml
│  ├─ staging/
│  │  ├─ kustomization.yaml
│  │  └─ replicas.yaml
│  └─ production/
│     ├─ kustomization.yaml
│     ├─ replicas.yaml
│     ├─ resources-patch.yaml
│     └─ ingress.yaml
└─ components/
   ├─ monitoring/
   │  └─ kustomization.yaml
   └─ security/
      └─ kustomization.yaml

# Apply to specific environment
kubectl apply -k overlays/production

# Result: Production deployment with:
  ├─ Base configuration
  ├─ Production namespace
  ├─ Production image tag
  ├─ 5 replicas
  ├─ Higher resource limits
  ├─ Monitoring annotations
  └─ Production ingress
```

## GitOps

### Problem: Imperative Cluster Management

```
Imperative approach:
  kubectl apply -f deployment.yaml
  kubectl patch deployment myapp ...
  kubectl scale deployment myapp --replicas=5
  kubectl set image deployment/myapp app=myapp:v2

Issues:
  ✗ Manual operations (error-prone)
  ✗ No version history
  ✗ Difficult to reproduce
  ✗ Audit trail incomplete
  ✗ Complex cluster state
  ✗ Manual deployments
```

### Solution: GitOps

**GitOps** treats infrastructure as code with Git as the single source of truth.

```
GitOps workflow:

1. Developer commits code to Git
   git commit -m "Update app version"
   git push

2. Git triggers CI/CD pipeline
   ├─ Build container image
   ├─ Update manifests (image tag)
   └─ Push manifests to Git

3. GitOps operator watches Git repo
   ├─ Detects manifest changes
   ├─ Compares desired state (Git) with actual state (cluster)
   └─ Automatically applies changes

4. Cluster converges to desired state
   kubectl apply -f manifests/  (automatic)

Result:
  ✓ Git is single source of truth
  ✓ All changes version controlled
  ✓ Reproducible deployments
  ✓ Complete audit trail
  ✓ Easy rollbacks (git revert)
  ✓ Automated deployments
```

### GitOps Tools

| Tool   | Description                            |
|--------|----------------------------------------|
| FluxCD | CNCF project, lightweight, declarative |
| ArgoCD | Web UI, popular, Git-driven            |

### FluxCD Example

```yaml
# GitRepository: Define the source
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: myapp-manifests
  namespace: flux-system
spec:
  interval: 1m
  url: https://github.com/myorg/myapp-manifests.git
  ref:
    branch: main

---
# Kustomization: Define what to deploy
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: myapp-production
  namespace: flux-system
spec:
  interval: 5m
  path: ./kustomize/overlays/production
  prune: true          # Delete resources removed from Git
  sourceRef:
    kind: GitRepository
    name: myapp-manifests
  targetNamespace: production
  healthChecks:
    - apiVersion: apps/v1
      kind: Deployment
      name: myapp
      namespace: production

---
# Git repository structure:
# myapp-manifests/
# ├─ kustomize/
# │  ├─ base/
# │  │  ├─ deployment.yaml
# │  │  ├─ service.yaml
# │  │  └─ kustomization.yaml
# │  └─ overlays/
# │     ├─ dev/
# │     │  ├─ kustomization.yaml
# │     │  └─ patches.yaml
# │     ├─ staging/
# │     └─ production/
# │        └─ kustomization.yaml
```

### GitOps Benefits

```
Advantages:
  ✓ Single source of truth (Git)
  ✓ Declarative infrastructure
  ✓ Full audit trail
  ✓ Easy rollbacks (git revert)
  ✓ Reproducible deployments
  ✓ Reduced manual errors
  ✓ Clear approval workflows
  ✓ Better disaster recovery

Workflow:
  1. Commit changes to Git
  2. CI/CD builds and tests
  3. Merge to main/production branch
  4. GitOps operator automatically syncs
  5. Deployment complete (hands-off)
```

## Advanced Security: Pod Security Policy

### Pod Security Policy (Deprecated in 1.25+)

```yaml
# Old approach: PodSecurityPolicy
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: restricted
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
  - ALL
  allowedCapabilities: []
  volumes:
  - 'configMap'
  - 'emptyDir'
  - 'projected'
  - 'secret'
  - 'downwardAPI'
  - 'persistentVolumeClaim'
  hostNetwork: false
  hostIPC: false
  hostPID: false
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'MustRunAs'
    seLinuxOptions:
      level: "s0:c123,c456"
  fsGroup:
    rule: 'MustRunAs'
    ranges:
      - min: 1
        max: 65535
  readOnlyRootFilesystem: true

---
# PodSecurityPolicyBinding
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: restricted-psp
rules:
- apiGroups: ["policy"]
  resources: ["podsecuritypolicies"]
  verbs: ["use"]
  resourceNames: ["restricted"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: restricted-psp
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: restricted-psp
subjects:
- kind: ServiceAccount
  name: default
  namespace: default
```

## Advanced Networking: Network Policies

### Complex Network Policy

```yaml
# Deny all traffic by default
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress

---
# Allow specific traffic
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend-to-backend
spec:
  podSelector:
    matchLabels:
      tier: backend
  policyTypes:
  - Ingress
  - Egress

  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: frontend
    podSelector:
      matchLabels:
        tier: frontend
    ports:
    - protocol: TCP
      port: 8080

  egress:
  # Allow DNS
  - to:
    - namespaceSelector: {}
    - podSelector:
        matchLabels:
          k8s-app: kube-dns
    ports:
    - protocol: UDP
      port: 53

  # Allow to database
  - to:
    - podSelector:
        matchLabels:
          tier: database
    ports:
    - protocol: TCP
      port: 5432

  # Allow HTTPS external
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: TCP
      port: 443
```

## Summary

Advanced Kubernetes topics extend core functionality:

* **Finalizers** - Graceful deletion and cleanup
* **CRDs** - Extend Kubernetes API with custom resources
* **Operators** - Automate complex application management
* **Admission Webhooks** - Custom validation and mutation
* **Service Mesh** - Advanced service-to-service communication
* **GitOps** - Infrastructure as Code with Git as source of truth

---

**Key Takeaways:**

* Finalizers enable graceful cleanup
* CRDs extend Kubernetes API
* Operators encapsulate domain knowledge
* Webhooks enforce custom policies
* Service Mesh adds enterprise networking features
* GitOps provides declarative, auditable deployments
* These tools solve advanced operational challenges
