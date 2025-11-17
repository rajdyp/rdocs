---
title: Custom Resources & CRDs
linkTitle: CRDs
type: docs
weight: 2
---

## Introduction

Kubernetes has evolved from a container orchestration platform into a universal control plane for managing diverse infrastructure and applications. At the heart of this extensibility lies **Custom Resource Definitions (CRDs)**, a mechanism that allows users to extend the Kubernetes API with domain-specific resources without modifying the core codebase.

## Kubernetes Extensibility Fundamentals

### The Kubernetes API Server: Foundation of Extensibility

Kubernetes operates on a declarative model where all resources are represented as RESTful API objects. The API server serves as:

* **Central Registry**: All cluster state is stored in `etcd` via the API server
* **Validation Gateway**: Ensures resource specifications meet schema requirements
* **Event Hub**: Broadcasts changes to interested controllers
* **RBAC Enforcer**: Controls access to resources

### Extension Mechanisms in Kubernetes

Kubernetes offers multiple extensibility points:

```
Extension Mechanisms  
│  
├── 1. Custom Resource Definitions (CRDs)  
│   └── Extend API with new resource types  
│  
├── 2. API Aggregation Layer  
│   └── Run separate API servers for extensions  
│  
├── 3. Admission Webhooks  
│   ├── Validating Webhooks (validation logic)  
│   └── Mutating Webhooks (modification logic)  
│  
├── 4. Scheduler Extenders  
│   └── Custom scheduling logic  
│  
└── 5. Device Plugins  
    └── Custom hardware resource management
```

### Why CRDs?

CRDs represent the **simplest and most popular** extension mechanism because they:

* Require no separate API server infrastructure
* Integrate seamlessly with kubectl and existing tooling
* Leverage built-in RBAC, storage, and versioning
* Support both simple and complex use cases

**When to Choose CRDs vs API Aggregation:**

| Criterion                      | CRDs | API Aggregation |  
|--------------------------------|------|-----------------|  
| Implementation Complexity      | Low  | High            |  
| Custom Storage Backend         | No   | Yes             |  
| Protocol (non-REST)            | No   | Yes             |  
| Performance (ultra-high scale) | Good | Better          |  
| Development Time               | Days | Week            |

## Understanding Custom Resource Definitions

### What is a CRD?

A **Custom Resource Definition** is a Kubernetes resource that defines a new resource type. Once registered, this new resource type becomes a first-class citizen in the cluster, indistinguishable from native resources like Pods or Services.

### Core Concepts

```
┌─────────────────────────────────────────────────┐  
│  CustomResourceDefinition (CRD)                 │  
│  ┌───────────────────────────────────────────┐  │  
│  │ Metadata:                                 │  │  
│  │  - Name: databases.example.com            │  │  
│  │                                           │  │  
│  │ Spec:                                     │  │  
│  │  - Group: example.com                     │  │  
│  │  - Names:                                 │  │  
│  │     - Kind: Database                      │  │  
│  │     - Plural: databases                   │  │  
│  │  - Scope: Namespaced                      │  │  
│  │  - Versions: [v1alpha1, v1beta1, v1]      │  │  
│  │  - Schema: (OpenAPI v3 validation)        │  │  
│  └───────────────────────────────────────────┘  │  
└─────────────────────────────────────────────────┘  
              ↓ (defines)  
┌─────────────────────────────────────────────────┐  
│  Custom Resource (CR)                           │  
│  ┌───────────────────────────────────────────┐  │  
│  │ apiVersion: example.com/v1                │  │  
│  │ kind: Database                            │  │  
│  │ metadata:                                 │  │  
│  │   name: my-postgres                       │  │  
│  │ spec:                                     │  │  
│  │   size: 100Gi                             │  │  
│  │   replicas: 3                             │  │  
│  └───────────────────────────────────────────┘  │  
└─────────────────────────────────────────────────┘
```

### Anatomy of a CRD

```yaml
apiVersion: apiextensions.k8s.io/v1  
kind: CustomResourceDefinition  
metadata:  
  # Name must match: <plural>.<group>  
  name: databases.example.com  
spec:  
  # Group for REST API: /apis/<group>/<version>  
  group: example.com  
  
  # Scope: Namespaced or Cluster  
  scope: Namespaced  
  
  names:  
    # Plural name for URL: /apis/example.com/v1/databases  
    plural: databases  
    # Singular name for display  
    singular: database  
    # Kind for manifests  
    kind: Database  
    # Short name for kubectl  
    shortNames:  
    - db  
  
  # Versions define the API evolution  
  versions:  
  - name: v1  
    # Served: API serves this version  
    served: true  
    # Storage: One version must be storage version  
    storage: true  
    schema:  
      openAPIV3Schema:  
        type: object  
        properties:  
          spec:  
            type: object  
            properties:  
              size:  
                type: string  
                pattern: '^[0-9]+Gi$'  
              replicas:  
                type: integer  
                minimum: 1  
                maximum: 10  
            required:  
            - size  
            - replicas  
          status:  
            type: object  
            properties:  
              phase:  
                type: string  
                enum:  
                - Pending  
                - Running  
                - Failed  
    # Additional printer columns for kubectl get  
    additionalPrinterColumns:  
    - name: Size  
      type: string  
      jsonPath: .spec.size  
    - name: Replicas  
      type: integer  
      jsonPath: .spec.replicas  
    - name: Status  
      type: string  
      jsonPath: .status.phase  
    - name: Age  
      type: date  
      jsonPath: .metadata.creationTimestamp
```

### How CRDs Extend the Kubernetes API

When a CRD is created:

```
Step 1: CRD Registration  
┌──────────────────┐  
│  kubectl apply   │  
│   -f crd.yaml    │  
└────────┬─────────┘  
         │  
         ▼  
┌─────────────────────────────────────┐  
│   API Server                        │  
│  ┌───────────────────────────────┐  │  
│  │ 1. Validate CRD structure     │  │  
│  │ 2. Store in etcd              │  │  
│  │ 3. Generate REST endpoints:   │  │  
│  │    /apis/example.com/v1/      │  │  
│  │         databases             │  │  
│  │ 4. Enable CRUD operations     │  │  
│  └───────────────────────────────┘  │  
└─────────────────────────────────────┘  
  
Step 2: Custom Resource Creation  
┌──────────────────┐  
│  kubectl apply   │  
│   -f db.yaml     │  
└────────┬─────────┘  
         │  
         ▼  
┌─────────────────────────────────────┐  
│   API Server                        │  
│  ┌───────────────────────────────┐  │  
│  │ 1. Validate against schema    │  │  
│  │ 2. Admission webhooks         │  │  
│  │ 3. Store in etcd              │  │  
│  │ 4. Emit creation event        │  │  
│  └───────────────────────────────┘  │  
└─────────────────────────────────────┘  
         │  
         ▼  
┌─────────────────────────────────────┐  
│   Controller (watches events)       │  
│  ┌───────────────────────────────┐  │  
│  │ 1. Receive creation event     │  │  
│  │ 2. Read desired state (spec)  │  │  
│  │ 3. Reconcile actual state     │  │  
│  │ 4. Update status              │  │  
│  └───────────────────────────────┘  │  
└─────────────────────────────────────┘
```

## The Trinity: Custom Resources, Controllers, and Operators

### Understanding the Relationship

CRDs alone are **passive** - they only define data structures. The power emerges when combined with controllers and operators:

```
┌─────────────────────────────────────────────────────────────┐  
│                     Kubernetes Operator                     │  
│                                                             │  
│  ┌──────────────┐      ┌──────────────┐      ┌──────────┐   │  
│  │              │      │              │      │          │   │  
│  │     CRD      │◄─────┤  Controller  │◄─────┤  Domain  │   │  
│  │  (Schema)    │      │   (Logic)    │      │  Expert  │   │  
│  │              │      │              │      │  (Ops)   │   │  
│  └──────────────┘      └──────────────┘      └──────────┘   │  
│       │                      │                              │  
│       │                      │                              │  
│       ▼                      ▼                              │  
│  Defines what          Implements how                       │  
│  resources             to manage lifecycle                  │  
│  look like             and reconcile state                  │  
│                                                             │  
└─────────────────────────────────────────────────────────────┘
```

### 1. Custom Resource (CR)

**Definition**: An instance of a CRD; represents the **desired state** of your custom resource.

```yaml
apiVersion: example.com/v1  
kind: Database  
metadata:  
  name: production-db  
  namespace: apps  
spec:  
  # Desired state  
  engine: postgresql  
  version: "14.5"  
  size: 500Gi  
  replicas: 3  
  backup:  
    enabled: true  
    schedule: "0 2 * * *"  
status:  
  # Actual state (written by controller)  
  phase: Running  
  endpoint: "postgres.example.com:5432"  
  lastBackup: "2025-10-31T02:00:00Z"
```

### 2. Controller

**Definition**: A control loop that watches Custom Resources and reconciles actual state with desired state.

**Core Pattern - Reconciliation Loop**:

```
        ┌────────────────────────────────────────────┐  
        │         Kubernetes Control Loop            │  
        │                                            │  
        │    ┌─────────────────────────────────┐     │  
        │    │                                 │     │  
        │    ▼                                 │     │  
        │  ┌────────────────┐                  │     │  
        │  │  Watch Events  │                  │     │  
        │  │  (Add/Update/  │                  │     │  
        │  │   Delete)      │                  │     │  
        │  └────────┬───────┘                  │     │  
        │           │                          │     │  
        │           ▼                          │     │  
        │  ┌────────────────┐                  │     │  
        │  │ Reconcile()    │──────Error───────┤     │  
        │  │                │    Requeue       │     │  
        │  │ 1. Get Desired │                  │     │  
        │  │    State       │                  │     │  
        │  │ 2. Get Actual  │                  │     │  
        │  │    State       │                  │     │  
        │  │ 3. Calculate   │                  │     │  
        │  │    Diff        │                  │     │  
        │  │ 4. Execute     │                  │     │  
        │  │    Actions     │                  │     │  
        │  │ 5. Update      │                  │     │  
        │  │    Status      │                  │     │  
        │  └────────┬───────┘                  │     │  
        │           │                          │     │  
        │           ▼                          │     │  
        │      Success ────────────────────────┘     │  
        │                                            │  
        └────────────────────────────────────────────┘
```

**Pseudocode Example**:

```go
// Controller reconciliation function  
func (r *DatabaseReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {  
    // 1. Fetch the Custom Resource  
    db := &examplev1.Database{}  
    if err := r.Get(ctx, req.NamespacedName, db); err != nil {  
        if errors.IsNotFound(err) {  
            // Resource deleted, cleanup  
            return ctrl.Result{}, r.cleanup(ctx, req)  
        }  
        return ctrl.Result{}, err  
    }  
  
    // 2. Get current state  
    actualState, err := r.getCurrentDatabaseState(ctx, db)  
    if err != nil {  
        return ctrl.Result{}, err  
    }  
  
    // 3. Compare desired vs actual  
    if actualState.Replicas != db.Spec.Replicas {  
        // 4. Reconcile - scale database  
        if err := r.scaleDatabase(ctx, db, db.Spec.Replicas); err != nil {  
            // Requeue on error  
            return ctrl.Result{RequeueAfter: 30 * time.Second}, err  
        }  
    }  
  
    if actualState.Version != db.Spec.Version {  
        // Upgrade database version  
        if err := r.upgradeDatabase(ctx, db); err != nil {  
            return ctrl.Result{RequeueAfter: 60 * time.Second}, err  
        }  
    }  
  
    // 5. Update status subresource  
    db.Status.Phase = "Running"  
    db.Status.Endpoint = actualState.Endpoint  
    if err := r.Status().Update(ctx, db); err != nil {  
        return ctrl.Result{}, err  
    }  
  
    // Success - requeue periodically for drift detection  
    return ctrl.Result{RequeueAfter: 5 * time.Minute}, nil  
}
```

### 3. Operator

**Definition**: A controller that embeds **domain-specific operational knowledge** to manage complex applications.

**Operator = CRD + Controller + Operational Expertise**

```
Traditional Manual Operations          Operator Pattern  
─────────────────────────────          ────────────────  
  
1. Deploy database                    User: kubectl apply database.yaml  
2. Configure replication              ─────────────────────────────────  
3. Setup backup jobs                        │  
4. Monitor health                           ▼  
5. Handle failures                    Operator handles:  
6. Perform upgrades                   - Deployment  
7. Manage scaling                     - Configuration  
                                      - Backups  
Manual, error-prone,                  - Health checks  
tribal knowledge                      - Failover  
                                      - Upgrades  
                                      - Scaling  
  
                                      Automated, consistent,  
                                      codified knowledge
```

**Operator Capability Levels** (from Operator Framework):

```
Level 5: Auto Pilot  
  │ Automatic tuning, anomaly detection,  
  │ horizontal and vertical scaling  
  │  
Level 4: Deep Insights  
  │ Metrics, alerts, log processing,  
  │ workload analysis  
  │  
Level 3: Full Lifecycle  
  │ App lifecycle (backup, failure recovery,  
  │ upgrades)  
  │  
Level 2: Seamless Upgrades  
  │ Patch and minor version upgrades  
  │  
Level 1: Basic Install  
  │ Automated application provisioning,  
  │ installation  
  │
```

## CRD Lifecycle and Architecture

### 1. CRD Registration Flow

```
┌────────────────────────────────────────────────────────────────┐  
│ Developer                                                      │  
└───────────┬────────────────────────────────────────────────────┘  
            │  
            │ kubectl apply -f crd.yaml  
            │  
            ▼  
┌────────────────────────────────────────────────────────────────┐  
│ Kubernetes API Server                                          │  
│                                                                │  
│  ┌──────────────────────────────────────────────────────────┐  │  
│  │ Step 1: Pre-validation                                   │  │  
│  │  - Check YAML syntax                                     │  │  
│  │  - Validate CRD structure                                │  │  
│  │  - Verify OpenAPI schema validity                        │  │  
│  └────────────────────────┬─────────────────────────────────┘  │  
│                           │                                    │  
│  ┌────────────────────────▼─────────────────────────────────┐  │  
│  │ Step 2: Admission Control                                │  │  
│  │  - Mutating Webhooks (if configured)                     │  │  
│  │  - Validating Webhooks (if configured)                   │  │  
│  │  - RBAC checks                                           │  │  
│  └────────────────────────┬─────────────────────────────────┘  │  
│                           │                                    │  
│  ┌────────────────────────▼─────────────────────────────────┐  │  
│  │ Step 3: Registration                                     │  │  
│  │  - Create new API endpoints                              │  │  
│  │    /apis/<group>/<version>/<resource>                    │  │  
│  │  - Register with API discovery                           │  │  
│  │  - Enable kubectl support                                │  │  
│  └────────────────────────┬─────────────────────────────────┘  │  
│                           │                                    │  
│  ┌────────────────────────▼─────────────────────────────────┐  │  
│  │ Step 4: Storage                                          │  │  
│  │  - Persist CRD definition to etcd                        │  │  
│  │  - Create storage schema for custom resources            │  │  
│  └────────────────────────┬─────────────────────────────────┘  │  
│                           │                                    │  
└───────────────────────────┼────────────────────────────────────┘  
                            │  
                            ▼  
┌────────────────────────────────────────────────────────────────┐  
│ etcd                                                           │  
│  [CRD Definition Stored]                                       │  
│  [Ready to accept Custom Resources]                            │  
└────────────────────────────────────────────────────────────────┘
```

### 2. Custom Resource CRUD Operations

**Create Flow**:

```
kubectl apply -f custom-resource.yaml  
         │  
         ▼  
┌─────────────────────────┐  
│  API Server             │  
│  1. Parse YAML          │  
│  2. Identify type:      │  
│     example.com/v1,     │  
│     Kind: Database      │  
│  3. Lookup CRD schema   │  
│  4. Validate spec       │  
│  5. Run webhooks        │  
│  6. Persist to etcd     │  
│  7. Emit watch event    │  
└────────┬────────────────┘  
         │  
         ├─────────────────────┐  
         │                     │  
         ▼                     ▼  
┌─────────────────┐   ┌────────────────┐  
│ etcd            │   │ Controllers    │  
│ [Resource       │   │ (watching)     │  
│  stored]        │   │                │  
│                 │   │ Informer cache │  
│                 │   │ updated        │  
│                 │   │ ───────────────│  
│                 │   │ Reconcile()    │  
│                 │   │ triggered      │  
└─────────────────┘   └────────────────┘
```

### 3. Controller Watch and Reconciliation

```
┌───────────────────────────────────────────────────────────────┐  
│ Controller Components                                         │  
│                                                               │  
│  ┌────────────────┐         ┌────────────────┐                │  
│  │  Informer      │◄────────┤  API Server    │                │  
│  │  (Watches CRs) │ Watch   │                │                │  
│  └────────┬───────┘ Events  └────────────────┘                │  
│           │                                                   │  
│           ▼                                                   │  
│  ┌────────────────┐                                           │  
│  │  Local Cache   │  Fast read access                         │  
│  │  (In-memory)   │  Reduces API load                         │  
│  └────────┬───────┘                                           │  
│           │                                                   │  
│           ▼                                                   │  
│  ┌────────────────────────────────────────────┐               │  
│  │  Work Queue                                │               │  
│  │  ┌──────┐  ┌──────┐  ┌──────┐              │               │  
│  │  │ CR-1 │─>│ CR-2 │─>│ CR-3 │              │               │  
│  │  └──────┘  └──────┘  └──────┘              │               │  
│  │                                            │               │  
│  │  Features:                                 │               │  
│  │  - Rate limiting                           │               │  
│  │  - Exponential backoff                     │               │  
│  │  - Deduplication                           │               │  
│  └────────────┬───────────────────────────────┘               │  
│               │                                               │  
│               ▼                                               │  
│  ┌─────────────────────────────────────────────┐              │  
│  │  Worker Pool (Reconciler goroutines)        │              │  
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐     │              │  
│  │  │ Worker 1 │ │ Worker 2 │ │ Worker N │     │              │  
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘     │              │  
│  │       │            │            │           │              │  
│  │       └────────────┼────────────┘           │              │  
│  │                    │                        │              │  
│  │                    ▼                        │              │  
│  │          Reconcile(request)                 │              │  
│  │                    │                        │              │  
│  └────────────────────┼────────────────────────┘              │  
│                       │                                       │  
└───────────────────────┼───────────────────────────────────────┘  
                        │  
                        ▼  
            ┌────────────────────────┐  
            │ Reconciliation Logic   │  
            │ (User-defined)         │  
            │                        │  
            │ - Read desired state   │  
            │ - Read actual state    │  
            │ - Calculate delta      │  
            │ - Execute actions      │  
            │ - Update status        │  
            └────────────────────────┘
```

### 4. Status Subresource Pattern

The status subresource provides **optimistic concurrency** and **separation of concerns**:

```
spec:                        status:  
┌─────────────────┐         ┌──────────────────┐  
│ User writes     │         │ Controller writes│  
│ (desired state) │         │ (observed state) │  
└─────────────────┘         └──────────────────┘  
        │                            ▲  
        │                            │  
        └────────────────┬───────────┘  
                         │  
                    Reconciler  
                    compares
```

**Example**:

```yaml
apiVersion: example.com/v1  
kind: Database  
metadata:  
  name: prod-db  
  generation: 5  # Increments on spec changes  
spec:  
  # What user wants  
  replicas: 3  
  version: "14.5"  
status:  
  # What controller observes  
  observedGeneration: 5  # Tracks which spec was reconciled  
  conditions:  
  - type: Ready  
    status: "True"  
    lastTransitionTime: "2025-10-31T10:00:00Z"  
    reason: AllReplicasReady  
    message: "3/3 replicas are running"  
  - type: BackupCompleted  
    status: "True"  
    lastTransitionTime: "2025-10-31T02:00:00Z"  
  replicas: 3  # Actual count  
  phase: Running
```

## Implementation Essentials

### 1. Versioning Strategy

CRDs support multiple versions to enable API evolution without breaking existing clients.

**Version Types**:

```
v1alpha1  →  v1beta1  →  v1  
   │            │          │  
   │            │          └─── Stable, production-ready  
   │            │               Backward compatibility guaranteed  
   │            │  
   │            └────────────── Feature-complete, may change  
   │                            Before stable release  
   │  
   └─────────────────────────── Experimental, can change  
                                Frequently, no guarantees
```

**Multi-Version CRD Example**:

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
  scope: Namespaced  
  
  versions:  
  # Old version - still served for compatibility  
  - name: v1alpha1  
    served: true  # Accept requests  
    storage: false  # Not the storage version  
    deprecated: true  
    deprecationWarning: "v1alpha1 is deprecated, use v1"  
    schema:  
      openAPIV3Schema:  
        type: object  
        properties:  
          spec:  
            type: object  
            properties:  
              size:  
                type: string  
  
  # Current stable version  
  - name: v1  
    served: true  
    storage: true  # Only one version can be storage version  
    schema:  
      openAPIV3Schema:  
        type: object  
        properties:  
          spec:  
            type: object  
            properties:  
              storage:  # Renamed from 'size'  
                type: object  
                properties:  
                  size:  
                    type: string  
                  class:  
                    type: string  
              replicas:  
                type: integer  
                minimum: 1  
  
  # Conversion strategy  
  conversion:  
    strategy: Webhook  
    webhook:  
      clientConfig:  
        service:  
          namespace: system  
          name: conversion-webhook  
          path: /convert  
      conversionReviewVersions:  
      - v1  
      - v1beta1
```

**Conversion Flow**:

```
User requests v1alpha1          API Server                Conversion Webhook  
       │                             │                            │  
       │ GET /apis/example.com/      │                            │  
       │     v1alpha1/databases/foo  │                            │  
       ├────────────────────────────>│                            │  
       │                             │                            │  
       │                             │ Storage version: v1        │  
       │                             │ Requested: v1alpha1        │  
       │                             │                            │  
       │                             │ POST /convert              │  
       │                             │ {from: v1, to: v1alpha1}   │  
       │                             ├───────────────────────────>│  
       │                             │                            │  
       │                             │                  Convert   │  
       │                             │                  v1 → v1α1 │  
       │                             │                            │  
       │                             │ Response: v1alpha1 object  │  
       │                             │<───────────────────────────┤  
       │                             │                            │  
       │ v1alpha1 response           │                            │  
       │<────────────────────────────┤                            │  
       │                             │                            │
```

### 2. Schema Validation with OpenAPI v3

Validation ensures custom resources meet structural requirements before persistence.

**Validation Features**:

```yaml
schema:  
  openAPIV3Schema:  
    type: object  
    required:  # Mandatory fields  
    - spec  
    properties:  
      spec:  
        type: object  
        properties:  
          # String validation  
          name:  
            type: string  
            minLength: 3  
            maxLength: 63  
            pattern: '^[a-z0-9]([-a-z0-9]*[a-z0-9])?$'  
  
          # Enum validation  
          tier:  
            type: string  
            enum:  
            - free  
            - premium  
            - enterprise  
  
          # Number validation  
          replicas:  
            type: integer  
            minimum: 1  
            maximum: 100  
            multipleOf: 1  
  
          storage:  
            type: string  
            pattern: '^[0-9]+(Gi|Ti)$'  
  
          # Object validation  
          backup:  
            type: object  
            required:  
            - schedule  
            properties:  
              schedule:  
                type: string  
                pattern: '^(@(annually|yearly|monthly|weekly|daily|hourly))|((((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*) ?){5})$'  
              retention:  
                type: integer  
                minimum: 1  
                maximum: 365  
  
          # Array validation  
          regions:  
            type: array  
            minItems: 1  
            maxItems: 5  
            uniqueItems: true  
            items:  
              type: string  
              enum:  
              - us-east-1  
              - us-west-2  
              - eu-west-1  
  
          # Conditional validation (oneOf)  
          storageType:  
            type: string  
            enum:  
            - local  
            - cloud  
  
          storageConfig:  
            oneOf:  
            - properties:  
                storageType:  
                  const: local  
                path:  
                  type: string  
              required:  
              - path  
            - properties:  
                storageType:  
                  const: cloud  
                provider:  
                  type: string  
                bucket:  
                  type: string  
              required:  
              - provider  
              - bucket
```

**Common Validation Patterns**:

```yaml
# 1. Resource limits validation  
resources:  
  type: object  
  properties:  
    cpu:  
      type: string  
      pattern: '^[0-9]+(m|)$'  # 100m, 1, 2  
    memory:  
      type: string  
      pattern: '^[0-9]+(Mi|Gi)$'  # 512Mi, 2Gi  
  
# 2. Domain name validation  
domain:  
  type: string  
  pattern: '^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$'  
  
# 3. Semantic version validation  
version:  
  type: string  
  pattern: '^v?[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$'  
  
# 4. CIDR validation  
cidr:  
  type: string  
  pattern: '^([0-9]{1,3}\.){3}[0-9]{1,3}/[0-9]{1,2}$'  
  
# 5. Default values  
enabled:  
  type: boolean  
  default: false  
  
# 6. Immutable fields (via CEL in Kubernetes 1.25+)  
x-kubernetes-validations:  
- rule: "self.name == oldSelf.name"  
  message: "name is immutable"
```

### 3. Admission Webhooks

Webhooks provide dynamic validation and mutation beyond static schema validation.

**Webhook Types**:

```
┌──────────────────────────────────────────────────────────┐  
│ Admission Control Flow                                   │  
│                                                          │  
│  API Request                                             │  
│      │                                                   │  
│      ▼                                                   │  
│  ┌────────────────────┐                                  │  
│  │ Schema Validation  │                                  │  
│  └─────────┬──────────┘                                  │  
│            │                                             │  
│            ▼                                             │  
│  ┌────────────────────┐                                  │  
│  │ Mutating Webhooks  │ ──> Modify request               │  
│  │ (in order)         │     Add defaults, inject         │  
│  │                    │     sidecars, set labels         │  
│  └─────────┬──────────┘                                  │  
│            │                                             │  
│            ▼                                             │  
│  ┌────────────────────┐                                  │  
│  │ Schema Validation  │ ──> Re-validate after mutation   │  
│  │ (again)            │                                  │  
│  └─────────┬──────────┘                                  │  
│            │                                             │  
│            ▼                                             │  
│  ┌────────────────────┐                                  │  
│  │ Validating Webhooks│ ──> Accept or reject             │  
│  │ (in parallel)      │     Business logic validation    │  
│  └─────────┬──────────┘                                  │  
│            │                                             │  
│            ▼                                             │  
│  ┌────────────────────┐                                  │  
│  │ Persist to etcd    │                                  │  
│  └────────────────────┘                                  │  
│                                                          │  
└──────────────────────────────────────────────────────────┘
```

**Validating Webhook Example**:

```yaml
apiVersion: admissionregistration.k8s.io/v1  
kind: ValidatingWebhookConfiguration  
metadata:  
  name: database-validator  
webhooks:  
- name: validate.databases.example.com  
  clientConfig:  
    service:  
      namespace: database-system  
      name: webhook-service  
      path: /validate  
      port: 443  
    caBundle: <base64-encoded-ca-cert>  
  
  rules:  
  - apiGroups:  
    - example.com  
    apiVersions:  
    - v1  
    operations:  
    - CREATE  
    - UPDATE  
    resources:  
    - databases  
    scope: Namespaced  
  
  admissionReviewVersions:  
  - v1  
  - v1beta1  
  
  sideEffects: None  
  timeoutSeconds: 10  
  failurePolicy: Fail  # or Ignore  
  
  namespaceSelector:  
    matchLabels:  
      environment: production
```

**Webhook Handler Pseudocode**:

```go
func (h *DatabaseValidator) Handle(ctx context.Context, req admission.Request) admission.Response {  
    db := &Database{}  
    if err := json.Unmarshal(req.Object.Raw, db); err != nil {  
        return admission.Errored(http.StatusBadRequest, err)  
    }  
  
    // Business logic validation  
  
    // 1. Check quota  
    if db.Spec.Replicas > h.maxReplicasPerNamespace {  
        return admission.Denied(fmt.Sprintf(  
            "Replica count %d exceeds namespace limit %d",  
            db.Spec.Replicas, h.maxReplicasPerNamespace,  
        ))  
    }  
  
    // 2. Validate resource availability  
    totalStorage := h.calculateNamespaceStorage(ctx, req.Namespace)  
    requestedStorage := parseStorage(db.Spec.Size)  
    if totalStorage + requestedStorage > h.namespaceQuota {  
        return admission.Denied("Storage quota exceeded")  
    }  
  
    // 3. Cross-field validation  
    if db.Spec.Tier == "free" && db.Spec.Replicas > 1 {  
        return admission.Denied("Free tier does not support replication")  
    }  
  
    // 4. External validation (e.g., license check)  
    if db.Spec.Tier == "enterprise" {  
        if !h.validateLicense(ctx, req.Namespace) {  
            return admission.Denied("No valid enterprise license found")  
        }  
    }  
  
    // 5. Immutability check on UPDATE  
    if req.Operation == admissionv1.Update {  
        oldDB := &Database{}  
        json.Unmarshal(req.OldObject.Raw, oldDB)  
  
        if db.Spec.Engine != oldDB.Spec.Engine {  
            return admission.Denied("Cannot change database engine")  
        }  
    }  
  
    return admission.Allowed("")  
}
```

**Mutating Webhook Example**:

```go
func (h *DatabaseDefaulter) Handle(ctx context.Context, req admission.Request) admission.Response {  
    db := &Database{}  
    if err := json.Unmarshal(req.Object.Raw, db); err != nil {  
        return admission.Errored(http.StatusBadRequest, err)  
    }  
  
    // Apply defaults  
    if db.Spec.Version == "" {  
        db.Spec.Version = h.defaultVersion  // e.g., "14.5"  
    }  
  
    if db.Spec.Replicas == 0 {  
        db.Spec.Replicas = 1  
    }  
  
    // Inject labels  
    if db.Labels == nil {  
        db.Labels = make(map[string]string)  
    }  
    db.Labels["managed-by"] = "database-operator"  
    db.Labels["tier"] = db.Spec.Tier  
  
    // Add annotations  
    if db.Annotations == nil {  
        db.Annotations = make(map[string]string)  
    }  
    db.Annotations["last-defaulted"] = time.Now().Format(time.RFC3339)  
  
    // Marshal modified object  
    marshaledDB, err := json.Marshal(db)  
    if err != nil {  
        return admission.Errored(http.StatusInternalServerError, err)  
    }  
  
    // Return patch  
    return admission.PatchResponseFromRaw(req.Object.Raw, marshaledDB)  
}
```

### 4. Subresources: Status and Scale

**Status Subresource**:

Enables controllers to update status independently of spec, preventing conflicts.

```yaml
versions:  
- name: v1  
  served: true  
  storage: true  
  schema:  
    # ... schema definition ...  
  
  # Enable status subresource  
  subresources:  
    status: {}
```

**Benefits**:

* Separate RBAC permissions (users can't modify status)
* Optimistic concurrency (separate resourceVersions)
* Cleaner API design

**Usage**:

```go
// User updates spec  
db.Spec.Replicas = 5  
client.Update(ctx, db)  // Updates spec only  
  
// Controller updates status  
db.Status.Phase = "Scaling"  
db.Status.Replicas = 3  
client.Status().Update(ctx, db)  // Updates status only
```

**Scale Subresource**:

Enables `kubectl scale` and HPA (Horizontal Pod Autoscaler) support.

```yaml
subresources:  
  status: {}  
  scale:  
    # Path to replica count in spec  
    specReplicasPath: .spec.replicas  
    # Path to replica count in status  
    statusReplicasPath: .status.replicas  
    # Optional: label selector path  
    labelSelectorPath: .status.labelSelector
```

**Enables**:

```bash
kubectl scale database/my-db --replicas=10  
kubectl autoscale database/my-db --min=3 --max=20 --cpu-percent=75
```

## Real-World Examples

### Example 1: Simple Configuration CRD

**Use Case**: Manage application configuration as Kubernetes resources.

```yaml
apiVersion: apiextensions.k8s.io/v1  
kind: CustomResourceDefinition  
metadata:  
  name: appconfigs.config.example.com  
spec:  
  group: config.example.com  
  names:  
    kind: AppConfig  
    plural: appconfigs  
    singular: appconfig  
  scope: Namespaced  
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
              application:  
                type: string  
              environment:  
                type: string  
                enum: [dev, staging, production]  
              config:  
                type: object  
                x-kubernetes-preserve-unknown-fields: true  
              secretRefs:  
                type: array  
                items:  
                  type: string
```

**Custom Resource**:

```yaml
apiVersion: config.example.com/v1  
kind: AppConfig  
metadata:  
  name: frontend-prod  
  namespace: production  
spec:  
  application: frontend  
  environment: production  
  config:  
    apiEndpoint: https://api.example.com  
    features:  
      newUI: true  
      betaFeatures: false  
    cache:  
      ttl: 3600  
      maxSize: 1000  
  secretRefs:  
  - api-credentials  
  - oauth-config
```

**Controller Logic** (Pseudocode):

```go
func (r *AppConfigReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {  
    config := &AppConfig{}  
    if err := r.Get(ctx, req.NamespacedName, config); err != nil {  
        return ctrl.Result{}, client.IgnoreNotFound(err)  
    }  
  
    // 1. Generate ConfigMap from config  
    configMap := &corev1.ConfigMap{  
        ObjectMeta: metav1.ObjectMeta{  
            Name:      config.Name + "-config",  
            Namespace: config.Namespace,  
            OwnerReferences: []metav1.OwnerReference{  
                *metav1.NewControllerRef(config, AppConfigGVK),  
            },  
        },  
        Data: map[string]string{  
            "config.json": marshalConfig(config.Spec.Config),  
        },  
    }  
  
    if err := r.CreateOrUpdate(ctx, configMap); err != nil {  
        return ctrl.Result{}, err  
    }  
  
    // 2. Validate secret references  
    for _, secretName := range config.Spec.SecretRefs {  
        secret := &corev1.Secret{}  
        if err := r.Get(ctx, client.ObjectKey{  
            Name: secretName,  
            Namespace: config.Namespace,  
        }, secret); err != nil {  
            config.Status.Conditions = append(config.Status.Conditions, Condition{  
                Type: "SecretReady",  
                Status: "False",  
                Reason: "SecretNotFound",  
                Message: fmt.Sprintf("Secret %s not found", secretName),  
            })  
            return ctrl.Result{RequeueAfter: 30 * time.Second}, nil  
        }  
    }  
  
    // 3. Update status  
    config.Status.Phase = "Ready"  
    config.Status.ConfigMapName = configMap.Name  
    r.Status().Update(ctx, config)  
  
    return ctrl.Result{RequeueAfter: 5 * time.Minute}, nil  
}
```

## Advanced Topics

### 1. Controller Patterns and Best Practices

#### Level-Triggered vs Edge-Triggered

```
Edge-Triggered (Anti-pattern)          Level-Triggered (Recommended)  
─────────────────────────             ────────────────────────────  
  
Watch for CREATE/UPDATE/DELETE         Always reconcile to desired state  
events                                  regardless of event type  
  
if event == CREATE:                     func Reconcile():  
    create_resources()                      desired := getDesiredState()  
elif event == UPDATE:                       actual := getActualState()  
    update_resources()  
elif event == DELETE:                       if desired != actual:  
    cleanup_resources()                         makeItSo()  
  
Problems:                               Benefits:  
- Missed events cause drift            - Self-healing  
- Complex state tracking               - Handles missed events  
- Doesn't handle external changes      - Simpler logic
```

#### Idempotency

Every reconciliation should be **idempotent** - safe to run multiple times:

```go
func (r *Reconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {  
    // ✅ Good: Check if resource exists  
    configMap := &corev1.ConfigMap{}  
    err := r.Get(ctx, client.ObjectKey{  
        Name:      "my-config",  
        Namespace: req.Namespace,  
    }, configMap)  
  
    if errors.IsNotFound(err) {  
        // Create only if doesn't exist  
        configMap = buildConfigMap()  
        return ctrl.Result{}, r.Create(ctx, configMap)  
    }  
  
    // ❌ Bad: Always create  
    // return ctrl.Result{}, r.Create(ctx, buildConfigMap())  
    // This will fail on subsequent reconciliations  
}
```

#### Owner References and Cascading Deletion

```go
// Set owner reference for automatic cleanup  
func (r *Reconciler) createChildResource(ctx context.Context, parent *MyResource) error {  
    child := &corev1.ConfigMap{  
        ObjectMeta: metav1.ObjectMeta{  
            Name:      parent.Name + "-config",  
            Namespace: parent.Namespace,  
        },  
        Data: map[string]string{  
            "key": "value",  
        },  
    }  
  
    // Set owner reference - when parent is deleted, child is auto-deleted  
    if err := controllerutil.SetControllerReference(parent, child, r.Scheme); err != nil {  
        return err  
    }  
  
    return r.Create(ctx, child)  
}
```

**Owner Reference Structure**:

```yaml
apiVersion: v1  
kind: ConfigMap  
metadata:  
  name: my-resource-config  
  namespace: default  
  ownerReferences:  
  - apiVersion: example.com/v1  
    kind: MyResource  
    name: my-resource  
    uid: 12345-67890  
    controller: true  
    blockOwnerDeletion: true  
data:  
  key: value
```

#### Finalizers for Cleanup

```go
const finalizerName = "example.com/finalizer"  
  
func (r *Reconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {  
    resource := &MyResource{}  
    if err := r.Get(ctx, req.NamespacedName, resource); err != nil {  
        return ctrl.Result{}, client.IgnoreNotFound(err)  
    }  
  
    // Handle deletion  
    if !resource.DeletionTimestamp.IsZero() {  
        if controllerutil.ContainsFinalizer(resource, finalizerName) {  
            // Perform cleanup (e.g., delete external resources)  
            if err := r.cleanupExternalResources(ctx, resource); err != nil {  
                return ctrl.Result{}, err  
            }  
  
            // Remove finalizer  
            controllerutil.RemoveFinalizer(resource, finalizerName)  
            if err := r.Update(ctx, resource); err != nil {  
                return ctrl.Result{}, err  
            }  
        }  
        return ctrl.Result{}, nil  
    }  
  
    // Add finalizer if not present  
    if !controllerutil.ContainsFinalizer(resource, finalizerName) {  
        controllerutil.AddFinalizer(resource, finalizerName)  
        if err := r.Update(ctx, resource); err != nil {  
            return ctrl.Result{}, err  
        }  
    }  
  
    // Normal reconciliation logic...  
    return ctrl.Result{}, nil  
}
```

#### Requeue Strategies

```go
func (r *Reconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {  
    // 1. Success - don't requeue  
    return ctrl.Result{}, nil  
  
    // 2. Success - requeue after delay (periodic reconciliation)  
    return ctrl.Result{RequeueAfter: 5 * time.Minute}, nil  
  
    // 3. Error - requeue with exponential backoff (automatic)  
    return ctrl.Result{}, fmt.Errorf("temporary error")  
  
    // 4. Immediate requeue  
    return ctrl.Result{Requeue: true}, nil  
  
    // 5. Conditional requeue  
    if resource.Status.Phase == "Pending" {  
        // Requeue quickly during provisioning  
        return ctrl.Result{RequeueAfter: 10 * time.Second}, nil  
    }  
    // Slower requeue for stable resources  
    return ctrl.Result{RequeueAfter: 5 * time.Minute}, nil  
}
```

### 2. Operator SDK and Frameworks

#### Comparison of Frameworks

| Framework           | Languag         | Complexity | Use Case                                  |  
|---------------------|-----------------|------------|-------------------------------------------|  
| **Kubebuilder**     | Go              | Medium     | General-purpose, batteries included       |  
| **Operator SDK**    | Go/Ansible/Helm | Low-High   | Multiple approaches, beginners to experts |  
| **Metacontroller**  | Any (webhooks)  | Medium     | Lightweight, language-agnostic            |

#### Kubebuilder Project Structure

```
my-operator/  
├── api/  
│   └── v1/  
│       ├── myresource_types.go     # CRD Go types  
│       └── zz_generated.deepcopy.go  
├── config/  
│   ├── crd/                         # Generated CRD YAML  
│   ├── rbac/                        # RBAC manifests  
│   ├── manager/                     # Deployment manifests  
│   └── samples/                     # Example CRs  
├── controllers/  
│   └── myresource_controller.go     # Reconciliation logic  
├── main.go                          # Entry point  
├── Dockerfile  
├── Makefile  
└── PROJECT                          # Kubebuilder metadata
```

#### Quick Start with Operator SDK

```bash
# Initialize project  
operator-sdk init --domain example.com --repo github.com/example/my-operator  
  
# Create API and controller  
operator-sdk create api --group apps --version v1 --kind MyApp --resource --controller  
  
# Generate CRD manifests  
make manifests  
  
# Install CRDs  
make install  
  
# Run locally  
make run  
  
# Build and push image  
make docker-build docker-push IMG=example.com/my-operator:v1.0.0  
  
# Deploy to cluster  
make deploy IMG=example.com/my-operator:v1.0.0
```

### 3. Performance Optimization

#### Informer Caching

Controllers use **informers** (local caches) to reduce API server load:

```False
Without Cache                      With Informer Cache  
────────────                      ────────────────────  
  
Reconcile()                        Reconcile()  
    │                                  │  
    ▼                                  ▼  
API GET request                   Local cache lookup  
    │                             (in-memory)  
    ▼                                  │  
API Server                             │  
    │                             Only on cache miss  
    ▼                                  ▼  
etcd                              API Server (watch)  
  
100ms+ latency                    <1ms latency  
High API load                     Minimal API load
```

#### Optimize Reconciliation

```go
// ❌ Bad: Fetch everything on every reconciliation  
func (r *Reconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {  
    resource := &MyResource{}  
    r.Get(ctx, req.NamespacedName, resource)  
  
    // Fetch all pods every time  
    podList := &corev1.PodList{}  
    r.List(ctx, podList, client.InNamespace(req.Namespace))  
  
    for _, pod := range podList.Items {  
        // Process each pod...  
    }  
}  
  
// ✅ Good: Use label selectors and owner references  
func (r *Reconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {  
    resource := &MyResource{}  
    r.Get(ctx, req.NamespacedName, resource)  
  
    // Only fetch related pods  
    podList := &corev1.PodList{}  
    r.List(ctx, podList,  
        client.InNamespace(req.Namespace),  
        client.MatchingLabels{"app": resource.Name},  
    )  
  
    // Even better: use owner reference filtering  
    ownedPods := &corev1.PodList{}  
    r.List(ctx, ownedPods,  
        client.InNamespace(req.Namespace),  
        client.MatchingFields{"metadata.ownerReferences.uid": string(resource.UID)},  
    )  
}
```

#### Predicate Filtering

Reduce unnecessary reconciliations:

```go
import (  
    "sigs.k8s.io/controller-runtime/pkg/predicate"  
)  
  
func (r *Reconciler) SetupWithManager(mgr ctrl.Manager) error {  
    return ctrl.NewControllerManagedBy(mgr).  
        For(&MyResource{}).  
        WithEventFilter(predicate.Funcs{  
            // Only reconcile on spec changes, not status  
            UpdateFunc: func(e event.UpdateEvent) bool {  
                oldObj := e.ObjectOld.(*MyResource)  
                newObj := e.ObjectNew.(*MyResource)  
                return !reflect.DeepEqual(oldObj.Spec, newObj.Spec)  
            },  
            // Ignore deletion events if no finalizers  
            DeleteFunc: func(e event.DeleteEvent) bool {  
                return len(e.Object.GetFinalizers()) > 0  
            },  
        }).  
        Complete(r)  
}
```

#### Rate Limiting and Worker Pool Tuning

```go
import (  
    "golang.org/x/time/rate"  
    "k8s.io/client-go/util/workqueue"  
)  
  
func main() {  
    mgr, err := ctrl.NewManager(ctrl.GetConfigOrDie(), ctrl.Options{  
        // Controller-specific rate limiter  
        Controller: ctrl.ControllerOptions{  
            MaxConcurrentReconciles: 10,  // Worker pool size  
            RateLimiter: workqueue.NewMaxOfRateLimiter(  
                // Base rate: 10 req/sec, burst 100  
                workqueue.NewItemExponentialFailureRateLimiter(5*time.Millisecond, 1000*time.Second),  
                &workqueue.BucketRateLimiter{Limiter: rate.NewLimiter(rate.Limit(10), 100)},  
            ),  
        },  
    })  
}
```

#### Batch Operations

```go
// ❌ Bad: Update resources one by one  
for _, obj := range objects {  
    if err := r.Update(ctx, obj); err != nil {  
        return err  
    }  
}  
  
// ✅ Good: Use batch operations or strategic merge  
patch := client.MergeFrom(oldObj.DeepCopy())  
newObj.Spec.Replicas = 5  
if err := r.Patch(ctx, newObj, patch); err != nil {  
    return err  
}
```

### 4. Multi-Tenancy and Scope

#### Namespace vs Cluster Scope

```yaml
# Namespace-scoped CRD  
spec:  
  scope: Namespaced  
  # Resources exist within namespaces  
  # RBAC can be namespace-specific  
  # Good for: application-level resources  
  
# Cluster-scoped CRD  
spec:  
  scope: Cluster  
  # Resources are cluster-wide  
  # Requires cluster-level permissions  
  # Good for: infrastructure resources (storage classes, nodes)
```

#### Namespace Isolation with RBAC

```yaml
# Role allowing users to manage their own databases  
apiVersion: rbac.authorization.k8s.io/v1  
kind: Role  
metadata:  
  name: database-admin  
  namespace: team-a  
rules:  
- apiGroups: ["db.example.com"]  
  resources: ["databases"]  
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]  
  
---  
# Operator needs cluster-wide view  
apiVersion: rbac.authorization.k8s.io/v1  
kind: ClusterRole  
metadata:  
  name: database-operator  
rules:  
- apiGroups: ["db.example.com"]  
  resources: ["databases"]  
  verbs: ["get", "list", "watch", "create", "update", "patch"]  
- apiGroups: ["db.example.com"]  
  resources: ["databases/status"]  
  verbs: ["get", "update", "patch"]  
- apiGroups: ["apps"]  
  resources: ["statefulsets"]  
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
```

#### Namespace Selector for Operators

```go
// Watch only specific namespaces  
func (r *Reconciler) SetupWithManager(mgr ctrl.Manager) error {  
    return ctrl.NewControllerManagedBy(mgr).  
        For(&MyResource{}).  
        WithEventFilter(predicate.NewPredicateFuncs(func(obj client.Object) bool {  
            // Only reconcile resources in allowed namespaces  
            allowedNamespaces := []string{"prod", "staging"}  
            for _, ns := range allowedNamespaces {  
                if obj.GetNamespace() == ns {  
                    return true  
                }  
            }  
            return false  
        })).  
        Complete(r)  
}
```

## Best Practices

### 1. API Design Principles

#### Versioning Strategy

```
Development Phase           Version Strategy  
─────────────────          ────────────────  
  
Initial development    →   v1alpha1  
  - Rapid iteration  
  - Breaking changes OK  
  - Not recommended for  
    production  
          │  
          ▼  
Feature complete      →   v1beta1  
  - API stabilizing  
  - Deprecation warnings  
    for breaking changes  
  - Limited production use  
          │  
          ▼  
Production ready      →   v1  
  - API frozen  
  - Backward compatibility  
    required  
  - Long-term support
```

#### Spec vs Status Separation

```yaml
# ✅ Good: Clear separation  
spec:  
  # What user wants (input)  
  replicas: 3  
  version: "14.5"  
  
status:  
  # What controller observes (output)  
  readyReplicas: 3  
  currentVersion: "14.5"  
  phase: Running  
  
# ❌ Bad: Mixing input and output  
spec:  
  replicas: 3  
  currentReplicas: 3  # This is status!  
  phase: Running       # This is status!
```

#### Conditions Pattern

```yaml
status:  
  # Use structured conditions for complex state  
  conditions:  
  - type: Ready  
    status: "True"  
    lastTransitionTime: "2025-10-31T10:00:00Z"  
    reason: AllComponentsHealthy  
    message: "All 3 replicas are ready"  
  
  - type: Degraded  
    status: "False"  
    lastTransitionTime: "2025-10-30T15:00:00Z"  
    reason: NoIssues  
  
  - type: Progressing  
    status: "False"  
    lastTransitionTime: "2025-10-31T09:55:00Z"  
    reason: DeploymentComplete  
  
  - type: BackupReady  
    status: "True"  
    lastTransitionTime: "2025-10-31T02:00:00Z"  
    reason: BackupSucceeded  
    message: "Backup completed: 45Gi stored"
```

### 2. Error Handling and Observability

#### Meaningful Status Updates

```go
func (r *Reconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {  
    resource := &MyResource{}  
    if err := r.Get(ctx, req.NamespacedName, resource); err != nil {  
        return ctrl.Result{}, client.IgnoreNotFound(err)  
    }  
  
    // Update status with meaningful information  
    defer func() {  
        if err := r.Status().Update(ctx, resource); err != nil {  
            ctrl.LoggerFrom(ctx).Error(err, "Failed to update status")  
        }  
    }()  
  
    // Set progressing condition  
    r.setCondition(resource, "Progressing", metav1.ConditionTrue,  
        "Reconciling", "Starting reconciliation")  
  
    // Perform work  
    if err := r.doWork(ctx, resource); err != nil {  
        // Update status with error details  
        resource.Status.Phase = "Failed"  
        r.setCondition(resource, "Ready", metav1.ConditionFalse,  
            "ReconciliationFailed", err.Error())  
  
        // Return error for requeue with backoff  
        return ctrl.Result{}, err  
    }  
  
    // Success  
    resource.Status.Phase = "Ready"  
    r.setCondition(resource, "Ready", metav1.ConditionTrue,  
        "ReconciliationSucceeded", "Resource is ready")  
    r.setCondition(resource, "Progressing", metav1.ConditionFalse,  
        "ReconciliationComplete", "")  
  
    return ctrl.Result{RequeueAfter: 5 * time.Minute}, nil  
}
```

#### Structured Logging

```go
import (  
    "github.com/go-logr/logr"  
    ctrl "sigs.k8s.io/controller-runtime"  
)  
  
func (r *Reconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {  
    log := ctrl.LoggerFrom(ctx)  
  
    // ✅ Good: Structured logging  
    log.Info("Reconciling resource",  
        "namespace", req.Namespace,  
        "name", req.Name,  
        "generation", resource.Generation,  
    )  
  
    log.V(1).Info("Detailed debug info",  
        "spec", resource.Spec,  
    )  
  
    if err != nil {  
        log.Error(err, "Failed to create StatefulSet",  
            "replicas", resource.Spec.Replicas,  
            "version", resource.Spec.Version,  
        )  
    }  
  
    // ❌ Bad: Unstructured logging  
    // fmt.Printf("Reconciling %s/%s\n", req.Namespace, req.Name)  
}
```

#### Metrics and Monitoring

```go
import (  
    "github.com/prometheus/client_golang/prometheus"  
    "sigs.k8s.io/controller-runtime/pkg/metrics"  
)  
  
var (  
    reconciliationDuration = prometheus.NewHistogramVec(  
        prometheus.HistogramOpts{  
            Name: "controller_reconciliation_duration_seconds",  
            Help: "Duration of reconciliation per resource",  
        },  
        []string{"controller", "namespace", "name", "result"},  
    )  
  
    reconciliationTotal = prometheus.NewCounterVec(  
        prometheus.CounterOpts{  
            Name: "controller_reconciliation_total",  
            Help: "Total number of reconciliations",  
        },  
        []string{"controller", "result"},  
    )  
)  
  
func init() {  
    metrics.Registry.MustRegister(reconciliationDuration, reconciliationTotal)  
}  
  
func (r *Reconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {  
    start := time.Now()  
    result := "success"  
  
    defer func() {  
        duration := time.Since(start).Seconds()  
        reconciliationDuration.WithLabelValues(  
            "database-controller",  
            req.Namespace,  
            req.Name,  
            result,  
        ).Observe(duration)  
  
        reconciliationTotal.WithLabelValues("database-controller", result).Inc()  
    }()  
  
    // Reconciliation logic...  
    if err != nil {  
        result = "error"  
        return ctrl.Result{}, err  
    }  
  
    return ctrl.Result{}, nil  
}
```

### 3. Testing Strategies

#### Unit Tests with Fake Client

```go
import (  
    "testing"  
    "sigs.k8s.io/controller-runtime/pkg/client/fake"  
)  
  
func TestReconcile(t *testing.T) {  
    // Create fake client with initial objects  
    db := &dbv1.Database{  
        ObjectMeta: metav1.ObjectMeta{  
            Name:      "test-db",  
            Namespace: "default",  
        },  
        Spec: dbv1.DatabaseSpec{  
            Replicas: 3,  
            Engine:   "postgresql",  
        },  
    }  
  
    fakeClient := fake.NewClientBuilder().  
        WithScheme(scheme).  
        WithObjects(db).  
        WithStatusSubresource(db).  
        Build()  
  
    r := &DatabaseReconciler{  
        Client: fakeClient,  
        Scheme: scheme,  
    }  
  
    // Execute reconciliation  
    result, err := r.Reconcile(context.Background(), ctrl.Request{  
        NamespacedName: client.ObjectKeyFromObject(db),  
    })  
  
    // Assertions  
    if err != nil {  
        t.Fatalf("Reconcile failed: %v", err)  
    }  
  
    // Verify StatefulSet was created  
    sts := &appsv1.StatefulSet{}  
    err = fakeClient.Get(context.Background(),  
        client.ObjectKey{Name: "test-db", Namespace: "default"},  
        sts,  
    )  
    if err != nil {  
        t.Fatalf("StatefulSet not created: %v", err)  
    }  
  
    if *sts.Spec.Replicas != 3 {  
        t.Errorf("Expected 3 replicas, got %d", *sts.Spec.Replicas)  
    }  
}
```

#### Integration Tests with EnvTest

```go
import (  
    "sigs.k8s.io/controller-runtime/pkg/envtest"  
)  
  
func TestControllerIntegration(t *testing.T) {  
    // Start test environment (real API server + etcd)  
    testEnv := &envtest.Environment{  
        CRDDirectoryPaths: []string{"config/crd"},  
    }  
  
    cfg, err := testEnv.Start()  
    if err != nil {  
        t.Fatal(err)  
    }  
    defer testEnv.Stop()  
  
    // Create manager and controller  
    mgr, err := ctrl.NewManager(cfg, ctrl.Options{})  
    if err != nil {  
        t.Fatal(err)  
    }  
  
    reconciler := &DatabaseReconciler{  
        Client: mgr.GetClient(),  
        Scheme: mgr.GetScheme(),  
    }  
  
    if err := reconciler.SetupWithManager(mgr); err != nil {  
        t.Fatal(err)  
    }  
  
    // Start manager in background  
    go func() {  
        if err := mgr.Start(context.Background()); err != nil {  
            t.Error(err)  
        }  
    }()  
  
    // Create test resource  
    db := &dbv1.Database{...}  
    if err := mgr.GetClient().Create(context.Background(), db); err != nil {  
        t.Fatal(err)  
    }  
  
    // Wait and verify  
    time.Sleep(2 * time.Second)  
  
    // Assertions...  
}
```

### 4. Documentation

```yaml
apiVersion: apiextensions.k8s.io/v1  
kind: CustomResourceDefinition  
metadata:  
  name: databases.db.example.com  
spec:  
  group: db.example.com  
  names:  
    kind: Database  
    plural: databases  
  versions:  
  - name: v1  
    schema:  
      openAPIV3Schema:  
        type: object  
        description: "Database represents a managed database instance"  
        properties:  
          spec:  
            type: object  
            description: "Desired state of the database"  
            properties:  
              replicas:  
                type: integer  
                description: |  
                  Number of database replicas. Must be between 1 and 10.  
                  For high availability, use 3 or more replicas.  
                minimum: 1  
                maximum: 10  
                example: 3  
              engine:  
                type: string  
                description: "Database engine type"  
                enum:  
                - postgresql  
                - mysql  
                - mongodb  
                example: "postgresql"
```

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. CRD Not Registered

**Symptoms**:

```bash
$ kubectl apply -f myresource.yaml  
error: unable to recognize "myresource.yaml": no matches for kind "MyResource" in version "example.com/v1"
```

**Diagnosis**:

```bash
# Check if CRD exists  
kubectl get crd myresources.example.com  
  
# Check CRD status  
kubectl describe crd myresources.example.com  
  
# View API resources  
kubectl api-resources | grep example.com
```

**Solutions**:

* Ensure CRD is installed: `kubectl apply -f crd.yaml`
* Verify CRD name matches `<plural>.<group>` format
* Check for validation errors in CRD

#### 2. Validation Failures

**Symptoms**:

```bash
Error from server (BadRequest): error when creating "resource.yaml":  
Database in version "v1" cannot be handled as a Database:  
validation failure list:  
spec.replicas in body should be greater than or equal to 1
```

**Diagnosis**:

```bash
# Validate against schema  
kubectl apply -f resource.yaml --dry-run=server  
  
# Get CRD schema  
kubectl get crd databases.example.com -o jsonpath='{.spec.versions[0].schema}' | jq
```

**Solutions**:

* Review OpenAPI schema requirements
* Check required fields
* Validate enum values and patterns
* Ensure numeric constraints are met

#### 3. Controller Not Reconciling

**Symptoms**:

* Resource created but status never updates
* Resources not being created/updated

**Diagnosis**:

```bash
# Check controller logs  
kubectl logs -n <namespace> deployment/<controller-name>  
  
# Check controller is running  
kubectl get pods -n <namespace>  
  
# Verify RBAC permissions  
kubectl auth can-i list databases --as=system:serviceaccount:<namespace>:<sa-name>  
  
# Check for events  
kubectl get events -n <namespace> --sort-by='.lastTimestamp'
```

**Debug Checklist**:

* Controller pod running?
* RBAC permissions correct?
* Watch/informer configured?
* Errors in logs?
* Resource generation vs observedGeneration match?

**Controller Debug Code**:

```go
func (r *Reconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {  
    log := ctrl.LoggerFrom(ctx)  
    log.Info("Reconciliation triggered", "request", req)  
  
    // Add debug logging throughout  
    resource := &MyResource{}  
    if err := r.Get(ctx, req.NamespacedName, resource); err != nil {  
        log.Error(err, "Failed to get resource")  
        return ctrl.Result{}, client.IgnoreNotFound(err)  
    }  
  
    log.V(1).Info("Resource retrieved", "spec", resource.Spec, "status", resource.Status)  
  
    // ... rest of reconciliation  
}
```

#### 4. Webhook Timeout

**Symptoms**:

```bash
Error from server (Timeout): error when creating "resource.yaml":  
Timeout: request did not complete within requested timeout
```

**Diagnosis**:

```bash
# Check webhook service  
kubectl get svc -n <namespace> <webhook-service>  
  
# Check webhook endpoints  
kubectl get endpoints -n <namespace> <webhook-service>  
  
# Test webhook connectivity  
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- \  
  curl -k https://<webhook-service>.<namespace>.svc:443/validate  
  
# Check webhook configuration  
kubectl get validatingwebhookconfiguration <name> -o yaml
```

**Solutions**:

* Ensure webhook pod is running
* Verify service and endpoints exist
* Check network policies
* Increase `timeoutSeconds` in webhook config
* Set `failurePolicy: Ignore` for non-critical webhooks

#### 5. Status Subresource Issues

**Symptoms**:

* Status updates don't persist
* Spec changes when updating status

**Diagnosis**:

```bash
# Check if status subresource is enabled  
kubectl get crd databases.example.com -o jsonpath='{.spec.versions[0].subresources}'
```

**Solution**:

```yaml
# Ensure status subresource is defined  
versions:  
- name: v1  
  subresources:  
    status: {}  # Must be present
```

**Correct Update Pattern**:

```go
// ✅ Update status using status client  
resource.Status.Phase = "Running"  
if err := r.Status().Update(ctx, resource); err != nil {  
    return ctrl.Result{}, err  
}  
  
// ❌ Wrong: Updates spec instead  
// if err := r.Update(ctx, resource); err != nil {
```

#### 6. Version Conversion Failures

**Symptoms**:

```bash
Error: conversion webhook failed: Post "https://...": context deadline exceeded
```

**Debug**:

```bash
# Check conversion webhook logs  
kubectl logs -n <namespace> <conversion-webhook-pod>  
  
# Test conversion webhook  
kubectl get crd <name> -o jsonpath='{.spec.conversion}'
```

#### 7. High Memory/CPU Usage

**Symptoms**:

* Controller OOMKilled
* High CPU usage
* Slow reconciliations

**Diagnosis**:

```bash
# Check resource usage  
kubectl top pod -n <namespace>  
  
# Enable profiling  
kubectl port-forward -n <namespace> <pod> 8080:8080  
curl http://localhost:8080/debug/pprof/heap > heap.prof  
go tool pprof -http=:8081 heap.prof
```

**Optimizations**:

* Reduce reconciliation frequency
* Add predicate filters
* Use label selectors
* Increase resource limits
* Profile and optimize hot paths

## Security Considerations

### 1. RBAC Best Practices

#### Principle of Least Privilege

```yaml
# ❌ Bad: Overly permissive  
apiVersion: rbac.authorization.k8s.io/v1  
kind: ClusterRole  
metadata:  
  name: database-operator  
rules:  
- apiGroups: ["*"]  
  resources: ["*"]  
  verbs: ["*"]  
  
# ✅ Good: Minimal required permissions  
apiVersion: rbac.authorization.k8s.io/v1  
kind: ClusterRole  
metadata:  
  name: database-operator  
rules:  
# CRD permissions  
- apiGroups: ["db.example.com"]  
  resources: ["databases"]  
  verbs: ["get", "list", "watch"]  
- apiGroups: ["db.example.com"]  
  resources: ["databases/status"]  
  verbs: ["get", "update", "patch"]  
  
# Managed resource permissions  
- apiGroups: ["apps"]  
  resources: ["statefulsets"]  
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]  
- apiGroups: [""]  
  resources: ["services", "configmaps", "secrets"]  
  verbs: ["get", "list", "watch", "create", "update", "patch"]  
  
# No delete on secrets (read-only)  
- apiGroups: [""]  
  resources: ["secrets"]  
  verbs: ["get", "list", "watch"]  
  
# Events for troubleshooting  
- apiGroups: [""]  
  resources: ["events"]  
  verbs: ["create", "patch"]
```

#### Separate User and Controller Permissions

```yaml
# User role: Can create/delete databases  
apiVersion: rbac.authorization.k8s.io/v1  
kind: Role  
metadata:  
  name: database-user  
  namespace: apps  
rules:  
- apiGroups: ["db.example.com"]  
  resources: ["databases"]  
  verbs: ["get", "list", "watch", "create", "delete"]  
# Note: No access to status or underlying resources  
  
---  
# Controller role: Can manage status and child resources  
apiVersion: rbac.authorization.k8s.io/v1  
kind: Role  
metadata:  
  name: database-controller  
  namespace: apps  
rules:  
- apiGroups: ["db.example.com"]  
  resources: ["databases"]  
  verbs: ["get", "list", "watch"]  
- apiGroups: ["db.example.com"]  
  resources: ["databases/status"]  
  verbs: ["get", "update", "patch"]  
- apiGroups: ["apps"]  
  resources: ["statefulsets"]  
  verbs: ["*"]
```

### 2. Admission Control Security

#### Input Validation

```go
func (v *Validator) ValidateCreate(ctx context.Context, obj runtime.Object) error {  
    db := obj.(*Database)  
  
    // 1. Prevent privilege escalation  
    if db.Spec.RunAsRoot {  
        return fmt.Errorf("running as root is not allowed")  
    }  
  
    // 2. Validate image source  
    allowedRegistries := []string{"docker.io/library", "gcr.io/mycompany"}  
    imageAllowed := false  
    for _, registry := range allowedRegistries {  
        if strings.HasPrefix(db.Spec.Image, registry) {  
            imageAllowed = true  
            break  
        }  
    }  
    if !imageAllowed {  
        return fmt.Errorf("image must be from allowed registry")  
    }  
  
    // 3. Resource limits enforcement  
    if db.Spec.Resources.Limits.Memory().Value() > maxMemoryBytes {  
        return fmt.Errorf("memory limit exceeds maximum allowed")  
    }  
  
    // 4. Prevent hostPath volumes  
    for _, volume := range db.Spec.Volumes {  
        if volume.HostPath != nil {  
            return fmt.Errorf("hostPath volumes are not allowed")  
        }  
    }  
  
    return nil  
}
```

#### Secret Management

```go
// ❌ Bad: Log secrets  
log.Info("Database created", "password", db.Spec.Password)  
  
// ✅ Good: Reference secrets, never embed  
type DatabaseSpec struct {  
    PasswordSecretRef corev1.SecretReference `json:"passwordSecretRef"`  
}  
  
func (r *Reconciler) getPassword(ctx context.Context, db *Database) (string, error) {  
    secret := &corev1.Secret{}  
    if err := r.Get(ctx, client.ObjectKey{  
        Name:      db.Spec.PasswordSecretRef.Name,  
        Namespace: db.Namespace,  
    }, secret); err != nil {  
        return "", err  
    }  
  
    password, ok := secret.Data["password"]  
    if !ok {  
        return "", fmt.Errorf("password key not found in secret")  
    }  
  
    return string(password), nil  
}
```

### 3. Network Policies

```yaml
# Restrict controller network access  
apiVersion: networking.k8s.io/v1  
kind: NetworkPolicy  
metadata:  
  name: database-controller  
  namespace: database-system  
spec:  
  podSelector:  
    matchLabels:  
      app: database-controller  
  policyTypes:  
  - Egress  
  - Ingress  
  
  egress:  
  # Allow API server access  
  - to:  
    - namespaceSelector:  
        matchLabels:  
          name: kube-system  
    ports:  
    - protocol: TCP  
      port: 443  
  
  # Allow DNS  
  - to:  
    - namespaceSelector:  
        matchLabels:  
          name: kube-system  
    ports:  
    - protocol: UDP  
      port: 53  
  
  # Allow managed database pods  
  - to:  
    - podSelector:  
        matchLabels:  
          managed-by: database-operator  
    ports:  
    - protocol: TCP  
      port: 5432  
  
  ingress:  
  # Only webhook calls  
  - from:  
    - namespaceSelector: {}  
    ports:  
    - protocol: TCP  
      port: 9443
```

### 4. Security Scanning

```docker
# Minimal container image  
FROM gcr.io/distroless/static:nonroot  
WORKDIR /  
COPY --chown=nonroot:nonroot manager .  
USER 65532:65532  
ENTRYPOINT ["/manager"]
```

```yaml
# Pod Security Standards  
apiVersion: v1  
kind: Namespace  
metadata:  
  name: database-system  
  labels:  
    pod-security.kubernetes.io/enforce: restricted  
    pod-security.kubernetes.io/audit: restricted  
    pod-security.kubernetes.io/warn: restricted
```

## Conclusion

Custom Resource Definitions (CRDs) are a powerful mechanism for extending Kubernetes to manage custom workloads and domain-specific resources. This guide has covered:

 ✅ **Fundamentals**: How CRDs extend the Kubernetes API server  
 ✅ **Architecture**: The relationship between CRDs, Custom Resources, Controllers, and Operators  
 ✅ **Implementation**: Versioning, validation, webhooks, and subresources  
 ✅ **Real-World Examples**: From simple configuration to complex database operators  
 ✅ **Advanced Topics**: Performance optimization, controller patterns, and multi-tenancy  
 ✅ **Best Practices**: API design, error handling, testing, and observability  
 ✅ **Operations**: Troubleshooting common issues and security hardening  

### Key Takeaways

* **CRDs make Kubernetes programmable** - extend the platform without forking
* **Controllers implement business logic** - reconcile desired state with actual state
* **Operators codify operational knowledge** - automate complex lifecycle management
* **Design for declarative APIs** - clear separation of spec (input) and status (output)
* **Think in terms of reconciliation loops** - level-triggered, idempotent logic
* **Security is paramount** - RBAC, admission control, and secret management
* **Observability is critical** - structured logging, metrics, and meaningful status

### Resources

- **Documentation**:
    - [Kubernetes CRD Documentation](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/)
    - [Kubebuilder Book](https://book.kubebuilder.io/)
    - [Operator SDK](https://sdk.operatorframework.io/)
- **Code Examples**:
    - [Sample Controller](https://github.com/kubernetes/sample-controller)
    - [Kubebuilder Examples](https://github.com/kubernetes-sigs/kubebuilder)
