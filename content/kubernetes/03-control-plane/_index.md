---
title: Control Plane Components
linkTitle: Control Plane Components
type: docs
weight: 3
prev: /kubernetes/02-cluster-architecture
next: /kubernetes/04-worker-nodes
---

## Overview

The Control Plane is the brain of the Kubernetes cluster. It makes all decisions about cluster state, scheduling, and management. It consists of five main components:

* **kube-api-server** - The front door
* **kube-scheduler** - The matchmaker
* **kube-controller-manager** - The enforcer
* **etcd** - The memory
* **cloud-controller-manager** - The cloud liaison

```
┌───────────────────────────────────────────────────────────────┐
│                       Control Plane                           │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                   kube-api-server                        │ │
│  │         (Central Hub - All traffic flows through)        │ │
│  └───────────────────────┬──────────────────────────────────┘ │
│                          │                                    │
│          ┌───────────────┼───────────────┐                    │
│          │               │               │                    │
│  ┌───────▼──────┐  ┌─────▼─────┐  ┌──────▼────────┐           │
│  │ kube-        │  │   kube-   │  │    etcd       │           │
│  │ scheduler    │  │ controller│  │ (data store)  │           │
│  │              │  │  -manager │  │               │           │
│  └──────────────┘  └───────────┘  └───────────────┘           │
│                                                               │
│          ┌──────────────────────────────────────┐             │
│          │   cloud-controller-manager           │             │
│          │         (optional)                   │             │
│          └──────────────────────────────────────┘             │
└───────────────────────────────────────────────────────────────┘
```

## 1. kube-api-server

### Purpose

The API server is the **front-end for the Kubernetes control plane**. It exposes the Kubernetes API and is the only component that directly interacts with etcd.

### Key Responsibilities

1. **API Gateway**
   - Exposes RESTful API over HTTP/HTTPS
   - Handles all CRUD operations for Kubernetes resources
   - Entry point for all cluster operations

2. **Authentication & Authorization**
   - Authenticates users and service accounts
   - Authorizes requests via RBAC
   - Validates requests via admission controllers

3. **Data Validation**
   - Validates resource definitions
   - Ensures schema compliance
   - Runs mutating and validating webhooks

4. **State Management**
   - Persists cluster state to etcd
   - Serves as the source of truth for current state
   - Provides watch mechanism for real-time updates

### How It Works

```
┌──────────────┐
│   kubectl    │ (or any API client)
└──────┬───────┘
       │ 1. HTTP/HTTPS Request
       │    (authentication credentials)
       ▼
┌──────────────────────────────────────┐
│        kube-api-server               │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │  1. Authentication              │ │
│  │     (Who are you?)              │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │  2. Authorization               │ │
│  │     (What can you do?)          │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │  3. Admission Control           │ │
│  │     (Should we allow this?)     │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │  4. Validation                  │ │
│  │     (Is this valid?)            │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │  5. Persistence to etcd         │ │
│  └─────────────────────────────────┘ │
└──────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│     etcd     │
└──────────────┘
```

### Request Processing Pipeline

```
Request → Authentication → Authorization → Admission Controllers → Validation → etcd
```

**Example Flow:**

```bash
$ kubectl create deployment nginx --image=nginx

1. Authentication: Verify user identity (certificate, token, etc.)
2. Authorization: Check RBAC rules (can this user create deployments?)
3. Admission: Run mutating webhooks (add default values, labels)
4. Admission: Run validating webhooks (custom validation logic)
5. Validation: Validate against API schema
6. Persist: Save to etcd
7. Response: Return created resource to client
```

### Failure Impact

**When API Server Fails:**

* ✅ Existing workloads continue running
* ✅ Networking continues to function
* ❌ No new changes possible (no create/update/delete)
* ❌ No scheduling of new pods
* ❌ No reconciliation by controllers
* ❌ kubectl commands fail

**Recovery:**

* Control plane is unavailable but data plane remains functional
* Restore API server to resume operations

## 2. kube-scheduler

### Purpose

The scheduler is the **matchmaker** that assigns pods to nodes based on resource availability and constraints.

### Key Responsibilities

1. **Pod-to-Node Assignment**
   - Watches for unassigned pods (`nodeName` is null)
   - Finds suitable nodes for each pod
   - Updates pod with `nodeName` field

2. **Resource-Aware Scheduling**
   - Considers CPU and memory requests
   - Evaluates node capacity
   - Respects resource limits

3. **Constraint Evaluation**
   - Node selectors
   - Affinity and anti-affinity rules
   - Taints and tolerations
   - Topology spread constraints

4. **Quality of Service**
   - Prioritizes pods based on QoS class
   - Handles pod priority and preemption
   - Ensures fair resource distribution

### Scheduling Process

```
┌──────────────────────────────────────────────────────────────┐
│              Scheduling Decision Process                     │
│                                                              │
│  1. Filtering Phase (Predicate Phase)                        │
│     ┌─────────────────────────────────────────────┐          │
│     │ Filter out unsuitable nodes:                │          │
│     │ • Insufficient resources                    │          │
│     │ • Taints without tolerations                │          │
│     │ • Node selector mismatch                    │          │
│     │ • Volume conflicts                          │          │
│     │ • Hostname conflicts                        │          │
│     └─────────────────────────────────────────────┘          │
│                          │                                   │
│                          ▼                                   │
│  2. Scoring Phase (Priority Phase)                           │
│     ┌─────────────────────────────────────────────┐          │
│     │ Rank remaining nodes:                       │          │
│     │ • Resource utilization balance              │          │
│     │ • Affinity preferences                      │          │
│     │ • Spread across zones/nodes                 │          │
│     │ • Custom priorities                         │          │
│     └─────────────────────────────────────────────┘          │
│                          │                                   │
│                          ▼                                   │
│  3. Selection                                                │
│     ┌─────────────────────────────────────────────┐          │
│     │ Pick node with highest score                │          │
│     └─────────────────────────────────────────────┘          │
│                          │                                   │
│                          ▼                                   │
│  4. Binding                                                  │
│     ┌─────────────────────────────────────────────┐          │
│     │ Update pod with nodeName via API server     │          │
│     └─────────────────────────────────────────────┘          │
└──────────────────────────────────────────────────────────────┘
```

### Scheduling Flow

```
1. New Pod Created
   (nodeName = null, status = Pending)
         │
         ▼
2. Scheduler Detects Unscheduled Pod
   (via watch on API server)
         │
         ▼
3. Filtering Phase
   Node1: ✅ (enough resources)
   Node2: ❌ (tainted)
   Node3: ✅ (enough resources)
   Node4: ❌ (insufficient CPU)
         │
         ▼
4. Scoring Phase
   Node1: Score 75
   Node3: Score 92 ← Winner
         │
         ▼
5. Bind Pod to Node3
   (PATCH pod with nodeName: node3)
         │
         ▼
6. kubelet on Node3 Starts Pod
```

### Scheduling Constraints

**Node Selectors:**

```yaml
spec:
  nodeSelector:
    disktype: ssd
    zone: us-east-1a
```

**Affinity:**

```yaml
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: kubernetes.io/os
            operator: In
            values:
            - linux
```

**Taints and Tolerations:**

```bash
# Taint on node
kubectl taint nodes node1 key=value:NoSchedule
```

```yaml
# Toleration on pod
spec:
  tolerations:
  - key: "key"
    operator: "Equal"
    value: "value"
    effect: "NoSchedule"
```

### Failure Impact

**When Scheduler Fails:**

* ✅ Existing pods continue running
* ✅ Networking and services work
* ❌ New pods stuck in Pending state
* ❌ No pod assignments to nodes

**Key Point:** Scheduler makes scheduling *decisions* but kubelet does actual pod *placement*.

## 3. kube-controller-manager

### Purpose

The controller manager is the **enforcer** that runs controller processes to maintain the desired state of the cluster. It's a "controller of controllers."

### Key Responsibilities

1. **Reconciliation Loops**
   - Continuously compare actual state vs desired state
   - Takes corrective action when they differ
   - Runs approximately every 30 seconds

2. **Self-Healing**
   - Replaces failed pods
   - Updates configurations
   - Manages rolling updates

3. **Resource Management**
   - Creates and manages dependent resources
   - Handles cascading deletes
   - Manages ownership references

### Core Controllers

| Controller                 | Purpose                                               |
|----------------------------|-------------------------------------------------------|
| Node Controller            | Monitors node health, marks nodes as NotReady         |
| Replication Controller     | Ensures desired number of pod replicas                |
| Endpoints Controller       | Populates endpoints objects (links Services and Pods) |
| Service Account Controller | Creates default service accounts for namespaces       |
| Namespace Controller       | Handles namespace lifecycle                           |
| Job Controller             | Manages job completions                               |
| Deployment Controller      | Manages deployments and ReplicaSets                   |
| StatefulSet Controller     | Manages stateful applications                         |
| DaemonSet Controller       | Ensures pods run on all/selected nodes                |
| CronJob Controller         | Manages scheduled jobs                                |

### Reconciliation Loop

```
┌─────────────────────────────────────────────────────────────┐
│                  Controller Reconciliation Loop             │
│                                                             │
│  ┌──────────────────────┐                                   │
│  │   Desired State      │                                   │
│  │   (from etcd/spec)   │                                   │
│  └──────────┬───────────┘                                   │
│             │                                               │
│             ▼                                               │
│  ┌─────────────────────────────┐                            │
│  │   Compare States            │                            │
│  │   Desired vs Actual         │                            │
│  └─────────────┬───────────────┘                            │
│                │                                            │
│      ┌─────────┴─────────┐                                  │
│      │                   │                                  │
│      ▼                   ▼                                  │
│  ┌────────┐         ┌────────┐                              │
│  │ Match? │         │Differ? │                              │
│  │        │         │        │                              │
│  └────┬───┘         └───┬────┘                              │
│       │                 │                                   │
│       │                 ▼                                   │
│       │     ┌────────────────────┐                          │
│       │     │  Take Action       │                          │
│       │     │  (create/update/   │                          │
│       │     │   delete resources)│                          │
│       │     └──────────┬─────────┘                          │
│       │                │                                    │
│       └────────────────┘                                    │
│                        │                                    │
│                        ▼                                    │
│            ┌──────────────────────┐                         │
│            │   Actual State       │                         │
│            │   (current reality)  │                         │
│            └──────────────────────┘                         │
│                                                             │
│ Repeats continuously (~30 seconds)                          │ 
└─────────────────────────────────────────────────────────────┘
```

### Example: Deployment Controller

```
Scenario: Deployment spec has replicas: 3, but only 2 pods running

┌──────────────────────────────────────────────┐
│  Deployment Controller Reconciliation        │
│                                              │
│  1. Watch Deployment resources               │
│     ↓                                        │
│  2. Detect: Desired=3, Actual=2              │
│     ↓                                        │
│  3. Action: Create ReplicaSet/Update         │
│     ↓                                        │
│  4. ReplicaSet Controller takes over         │
│     ↓                                        │
│  5. ReplicaSet creates missing Pod           │
│     ↓                                        │
│  6. Scheduler assigns Pod to Node            │
│     ↓                                        │
│  7. kubelet starts Pod                       │
│     ↓                                        │
│  8. State reconciled: Actual=3               │
└──────────────────────────────────────────────┘
```

### Failure Impact

**When Controller Manager Fails:**

* ✅ Existing pods continue running
* ✅ Services and networking work
* ❌ No self-healing (failed pods not replaced)
* ❌ No scaling operations
* ❌ No rolling updates
* ❌ No reconciliation

## 4. etcd

### Purpose

etcd is the **distributed key-value store** that serves as Kubernetes' brain—it's the single source of truth for all cluster data.

### Key Characteristics

1. **Distributed and Consistent**
   - Uses Raft consensus algorithm
   - Requires quorum for writes
   - Strongly consistent reads

2. **Key-Value Store**
   - Stores all Kubernetes objects
   - Supports watch mechanism
   - Provides versioning

3. **Critical Component**
   - Only component that persists state
   - Directly accessed only by API server
   - Loss means cluster rebuild

### What's Stored in etcd?

```
/registry/
├── pods/
│   └── default/
│       └── nginx-pod
├── services/
│   └── default/
│       └── kubernetes
├── deployments/
│   └── default/
│       └── web-app
├── secrets/
│   └── default/
│       └── db-password
├── configmaps/
├── nodes/
├── namespaces/
└── ... (all Kubernetes resources)
```

### etcd Cluster and Quorum

**Quorum Requirements:**

| Cluster Size | Quorum Needed | Tolerated Failures |
|--------------|---------------|--------------------|
| 1 node       | 1             | 0 (not HA)         |
| 3 nodes      | 2             | 1                  |
| 5 nodes      | 3             | 2                  |
| 7 nodes      | 4             | 3                  |

**Formula:** Quorum = (N/2) + 1

**Why odd numbers?**

* 3 nodes and 4 nodes both tolerate 1 failure
* No benefit to even numbers
* Odd numbers are more efficient

### Failure Scenarios

**Quorum Loss (e.g., 2 out of 3 nodes fail):**

* Cluster becomes **read-only**
* Cannot make any changes
* Existing workloads continue
* Need to restore quorum to recover

**Total Loss:**

* Cluster is **unrecoverable**
* Full rebuild required
* Highlights importance of backups

### etcd Best Practices

* **Backups**

```bash
# Backup etcd
ETCDCTL_API=3 etcdctl snapshot save snapshot.db

# Restore from backup
ETCDCTL_API=3 etcdctl snapshot restore snapshot.db
```

* **Placement**

* Run on dedicated nodes (production)
* Or stack with control plane (simpler)
* Use fast SSD storage

* **Monitoring**

* Monitor cluster health
* Track database size
* Alert on quorum issues

## 5. cloud-controller-manager

### Purpose

The cloud-controller-manager integrates Kubernetes with cloud provider APIs, managing cloud-specific resources.

### Key Responsibilities

1. **Node Controller**
   - Checks cloud provider to determine if nodes have been deleted
   - Updates node addresses

2. **Route Controller**
   - Sets up routes in cloud infrastructure
   - Enables pod-to-pod communication across nodes

3. **Service Controller**
   - Creates, updates, deletes cloud load balancers
   - Manages LoadBalancer service types

4. **Volume Controller**
   - Creates, attaches, mounts cloud volumes
   - Manages persistent storage

### Cloud-Specific Controllers

**AWS:**

* IAM Controller
* VPC Controller
* ELB/NLB Controller

**GCP:**

* GCE Controller
* Cloud Load Balancer Controller

**Azure:**

* Azure Disk Controller
* Azure Load Balancer Controller

### Failure Impact

**When Cloud Controller Manager Fails:**

* ✅ Existing workloads continue
* ✅ Core Kubernetes functions work
* ❌ Cannot create cloud load balancers
* ❌ Cannot attach cloud volumes
* ❌ Cloud-specific features unavailable

## Component Interactions

### Complete Flow: Pod Creation

```
User
  │
  │ kubectl create pod
  ▼
kube-api-server
  │
  │ 1. Authenticate & Authorize
  │ 2. Validate
  │ 3. Store in etcd
  ▼
etcd
  │
  │ (Pod stored with nodeName=null)
  │
  ▼
kube-scheduler (watching)
  │
  │ 1. Detect unscheduled pod
  │ 2. Find suitable node
  │ 3. Bind pod to node
  ▼
kube-api-server
  │
  │ Update pod with nodeName
  ▼
etcd
  │
  │ (Pod now has nodeName assigned)
  │
  ▼
kubelet (watching on assigned node)
  │
  │ 1. Pull image
  │ 2. Start container
  │ 3. Report status
  ▼
kube-api-server
  │
  │ Update pod status
  ▼
etcd
  │
  │ (Pod status: Running)
  ▼
kube-controller-manager
  │
  │ Verify desired state achieved
  └─ Continue monitoring
```

## Summary

The Control Plane components work together as a cohesive system:

| Component          | Role               | Analog                       |
|--------------------|--------------------|------------------------------|
| API Server         | Gateway & Enforcer | Front desk receptionist      |
| Scheduler          | Resource Matcher   | Event planner seating guests |
| Controller Manager | State Enforcer     | Building superintendent      |
| etcd               | Data Store         | Filing cabinet               |
| Cloud Controller   | Cloud Integration  | Cloud liaison                |

**Critical Understanding:**

* All components communicate through the API server
* Only API server talks to etcd
* Components watch for changes (event-driven)
* Reconciliation is continuous, not reactive

---

**Key Takeaways:**

* API server is the central hub—all communication flows through it
* Scheduler makes decisions, kubelet executes
* Controllers ensure desired state through reconciliation loops
* etcd is the single source of truth
* Failure of individual components has specific, predictable impacts
