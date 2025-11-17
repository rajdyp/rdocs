---
title: Pod Lifecycle and Scheduling
linkTitle: Pod Lifecycle and Scheduling
type: docs
weight: 7
prev: /kubernetes/06-pods
next: /kubernetes/08-workload-controllers
---

## Pod Lifecycle

### Pod Phases

```
┌──────────────────────────────────────────────────────────┐
│                   Pod Lifecycle Phases                   │
│                                                          │
│  Pending → Running → Succeeded/Failed                    │
│              ↓                                           │
│           Unknown                                        │
└──────────────────────────────────────────────────────────┘
```

* **Pending** → Pod accepted but awaiting resource allocation, scheduling, and container image downloads.
* **Running** → Pod bound to node, all containers in the Pod have been created, and at least one container is still running.
* **Succeeded** → All containers in the Pod have terminated in success, and will not be restarted.

* The "Succeeded" Pod status is typical for Pods run by `Job` or `CronJob`.

* **Failed** → All containers in the Pod have terminated, and at least one container has terminated in failure.
* **Unknown** → For some reason the state of the Pod could not be obtained (node communication lost).

### Container States

Within a pod, each container has a state:

```yaml
# kubectl describe pod shows container states
Containers:
  nginx:
    State:          Running
      Started:      Mon, 01 Jan 2024 10:00:00 +0000
    Last State:     Terminated
      Reason:       Error
      Exit Code:    1
```

**States:**

* **Waiting**: Container not running (pulling image, waiting for init)
* **Running**: Container executing
* **Terminated**: Container finished or crashed

### Complete Pod Lifecycle

```
User creates Pod
      ↓
API Server validates & stores
      ↓
Pod: Pending (nodeName=null)
      ↓
Scheduler assigns node
      ↓
Pod: Pending (nodeName=worker-1)
      ↓
kubelet pulls images
      ↓
Pod: Pending (containers creating)
      ↓
Init containers run (if any)
      ↓
Init containers succeed
      ↓
Startup probe (if configured)
      ↓
Main containers start
      ↓
Pod: Running
      ↓
Liveness & Readiness probes
      ↓
┌─────────────────┬─────────────────┐
│  Success path   │  Failure path   │
├─────────────────┼─────────────────┤
│ Containers exit │ Container crash │
│ with code 0     │ or killed       │
│       ↓         │       ↓         │
│ Pod: Succeeded  │ Pod: Failed     │
│ (for Jobs)      │ (restartPolicy  │
│                 │  determines     │
│                 │  next action)   │
└─────────────────┴─────────────────┘
```

## Container Restart Policy

```yaml
spec:
  restartPolicy: Always  # Always, OnFailure, Never
```

| Policy    | Behavior                                 | Use Case              |
|-----------|------------------------------------------|-----------------------|
| Always    | Restart on any termination               | Long-running services |
| OnFailure | Restart only on failure (exit code != 0) | Batch jobs            |
| Never     | Never restart                            | One-time tasks        |

**Example:**

```
restartPolicy: Always

Container exits with code 0  → Restart anyway
Container exits with code 1  → Restart
Container crashes            → Restart

Backoff: 10s, 20s, 40s, 80s, 160s, max 5m
```

## Pod Scheduling

### Scheduling Process

```
1. Pod created (nodeName=null)
      ↓
2. Scheduler watches for unscheduled pods
      ↓
3. FILTERING PHASE
   ┌──────────────────────────┐
   │ Filter unsuitable nodes: │
   │ • Insufficient resources │
   │ • Taints without tolerations
   │ • Node selector mismatch │
   │ • Affinity rules violated│
   └──────────┬───────────────┘
              ↓
4. SCORING PHASE
   ┌──────────────────────────┐
   │ Rank remaining nodes:    │
   │ • Resource balance       │
   │ • Affinity preferences   │
   │ • Spread constraints     │
   └──────────┬───────────────┘
              ↓
5. SELECT highest-scored node
      ↓
6. BIND pod to node (update nodeName)
```

### Scheduling Constraints

Control where pods are scheduled.

#### 1. Node Selector (Simple)

**Purpose:** Select nodes with specific labels.

Uses labels on nodes and label selectors (`nodeSelector`) on pods. This is the simplest way to constrain pods to specific nodes.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: gpu-pod
spec:
  nodeSelector:
    gpu: "true"
    zone: us-east-1a
  containers:
  - name: app
    image: ml-app
```

```bash
# Label nodes first
kubectl label nodes worker-1 gpu=true zone=us-east-1a
kubectl label nodes worker-2 gpu=true zone=us-east-1a

# Pod will only schedule on nodes with BOTH labels
```

**Use cases:**

* Schedule GPU workloads only on GPU nodes
* Pin pods to specific availability zones
* Separate dev/prod workloads on different node pools

**Limitations:**

* All labels must match (AND logic only)
* No "preferred" scheduling (hard requirement only)
* Limited expressiveness

#### 2. Node Affinity (Flexible)

**Purpose:** More expressive and flexible node selection with support for required and preferred rules.

Provides more control than `nodeSelector` with support for operators and soft/hard constraints.

```yaml
spec:
  affinity:
    nodeAffinity:
      # HARD requirement (must match)
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: kubernetes.io/os
            operator: In
            values:
            - linux
          - key: node-type
            operator: NotIn
            values:
            - spot  # Don't schedule on spot instances

      # SOFT preference (try to match, but not required)
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100  # Higher weight = stronger preference (1-100)
        preference:
          matchExpressions:
          - key: disktype
            operator: In
            values:
            - ssd
      - weight: 50
        preference:
          matchExpressions:
          - key: zone
            operator: In
            values:
            - us-east-1a
```

**Operators:**

* `In` - Label value in list
* `NotIn` - Label value not in list
* `Exists` - Label key exists (ignore value)
* `DoesNotExist` - Label key doesn't exist
* `Gt` - Greater than (numeric comparison)
* `Lt` - Less than (numeric comparison)

**Key difference from nodeSelector:**

```yaml
nodeSelector:
  gpu: "true"      ← Simple, hard requirement only

nodeAffinity:
  required:        ← Hard requirement (like nodeSelector)
    - gpu: "true"
  preferred:       ← Soft preference (NEW!)
    - ssd: "true"  ← Try to match, but okay if not available
```

**Use cases:**

* Prefer SSD nodes but allow HDD if needed
* Multiple OR conditions (`nodeSelectorTerms` is OR)
* Complex label matching logic

#### 3. Pod Affinity/Anti-Affinity

**Purpose:** Define rules for Pod placement based on node or Pod attributes (more flexible).

Schedule pods relative to OTHER pods, not just node labels.

#### Pod Affinity (Preferred Placement)

**What it does:** Allows Pods to prefer certain nodes or co-locate with other Pods.

```yaml
spec:
  affinity:
    podAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchLabels:
            app: cache  # Find pods with app=cache
        topologyKey: kubernetes.io/hostname  # Co-locate on same node
```

**Result:**

```
If cache pod is on node-1:
  → This pod MUST also schedule on node-1

If no cache pod exists:
  → This pod cannot be scheduled (pending)
```

**Common topologyKey values:**

```
kubernetes.io/hostname         → Same physical node
topology.kubernetes.io/zone    → Same availability zone
topology.kubernetes.io/region  → Same region
```

**Use cases:**

* Co-locate app with its cache (reduce latency)
* Schedule related microservices together
* Data locality requirements

#### Pod Anti-Affinity (Avoid Placement)

**What it does:** Prevents Pods from being scheduled on the same node, zone, or near other specific Pods (can replicate DaemonSet behavior).

```yaml
spec:
  affinity:
    podAntiAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchLabels:
            app: web  # Find pods with app=web
        topologyKey: kubernetes.io/hostname  # Avoid same node
```

**Result:**

```
If web pod already on node-1:
  → This web pod MUST schedule on different node

Ensures high availability:
  Node-1: web-pod-1
  Node-2: web-pod-2  ← Spread across nodes
  Node-3: web-pod-3
```

**Use case: Spread replicas across nodes**

```yaml
# Ensure replicas never share a node
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  template:
    spec:
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchLabels:
                app: web
            topologyKey: kubernetes.io/hostname
```

**Soft vs Hard Rules:**

```yaml
# HARD (required): Pod won't schedule if rule can't be satisfied
requiredDuringSchedulingIgnoredDuringExecution:
  - labelSelector:
      matchLabels:
        app: cache
    topologyKey: kubernetes.io/hostname

# SOFT (preferred): Try to satisfy, but schedule anyway if impossible
preferredDuringSchedulingIgnoredDuringExecution:
  - weight: 100
    podAffinityTerm:
      labelSelector:
        matchLabels:
          app: cache
      topologyKey: kubernetes.io/hostname
```

**Common use cases:**

* **High Availability:** Spread replicas across zones
* **Performance:** Co-locate related services
* **Compliance:** Separate production from non-production

#### 4. Taints and Tolerations

**Purpose:** Restrict Pod scheduling on nodes using a repel mechanism. Taints act as locks on nodes; tolerations are the keys for pods.

#### Taints (Node-Level Rule)

**What it does:** Applied to nodes to repel unwanted Pods.

Think of taints as "keep out" signs on nodes. Only pods with matching tolerations can schedule there.

```bash
# Taint a node
kubectl taint nodes <node-name> <key>=<value>:effect

# Examples:
kubectl taint nodes worker-1 workload=database:NoSchedule
kubectl taint nodes worker-2 dedicated=gpu:NoSchedule
kubectl taint nodes worker-3 maintenance=true:NoExecute
```

**Taint Effects:**

| Effect           | Behavior                                     | Use Case                              |
|------------------|----------------------------------------------|---------------------------------------|
| NoSchedule       | Dont schedule new pods (existing pods stay)  | Reserve nodes for specific workloads  |
| PreferNoSchedule | Try to avoid scheduling (soft)               | Prefer not to use, but okay if needed |
| NoExecute        | Evict existing pods + dont schedule new ones | Drain nodes for maintenance           |

```
NoSchedule:
  Existing pods: ✅ Stay running
  New pods:      ❌ Cannot schedule (unless toleration)

PreferNoSchedule:
  Existing pods: ✅ Stay running
  New pods:      ⚠️ Avoid if possible, but can schedule

NoExecute:
  Existing pods: ❌ Evicted (unless toleration)
  New pods:      ❌ Cannot schedule (unless toleration)
```

#### Tolerations (Pod-Level Rule)

**What it does:** Applied to Pods to allow scheduling on tainted nodes.

Tolerations are the "key" that unlocks tainted nodes.

```yaml
spec:
  tolerations:
  # Exact match toleration
  - key: "workload"
    operator: "Equal"
    value: "database"
    effect: "NoSchedule"

  # Tolerate any value for this key
  - key: "workload"
    operator: "Exists"
    effect: "NoSchedule"

  # Tolerate ALL taints (universal key)
  - operator: "Exists"
```

**Toleration Operators:**

```yaml
Equal:   # key, value, and effect must match
  - key: "gpu"
    operator: "Equal"
    value: "nvidia"
    effect: "NoSchedule"

Exists:  # Only key and effect must match (any value)
  - key: "gpu"
    operator: "Exists"
    effect: "NoSchedule"

Exists (no key):  # Tolerates everything
  - operator: "Exists"
```

#### Use Case 1: Dedicated Nodes

**Scenario:** Reserve nodes for database workloads only.

```bash
# Step 1: Taint database nodes
kubectl taint nodes db-node-1 workload=database:NoSchedule
kubectl taint nodes db-node-2 workload=database:NoSchedule

# Result: Regular pods CANNOT schedule on these nodes
```

```yaml
# Step 2: Database pods get toleration
apiVersion: v1
kind: Pod
metadata:
  name: postgres
spec:
  tolerations:
  - key: "workload"
    operator: "Equal"
    value: "database"
    effect: "NoSchedule"

  containers:
  - name: postgres
    image: postgres:14
```

**Result:**

```
db-node-1:  ✅ postgres pods only
db-node-2:  ✅ postgres pods only
worker-1:   ✅ regular pods only
worker-2:   ✅ regular pods only
```

#### Use Case 2: Node Maintenance

**Scenario:** Evict all pods from a node being taken down.

```bash
# Taint with NoExecute effect
kubectl taint nodes worker-1 maintenance=true:NoExecute

# All pods without matching toleration are EVICTED
```

**Result:**

```
Before:
  worker-1: [pod-1] [pod-2] [pod-3]

After taint:
  worker-1: []  ← All pods evicted

  worker-2: [pod-1] [pod-2]  ← Rescheduled here
  worker-3: [pod-3]          ← Rescheduled here
```

#### Use Case 3: GPU Nodes

```bash
# Reserve GPU nodes for ML workloads
kubectl taint nodes gpu-node-1 nvidia.com/gpu=true:NoSchedule
```

```yaml
# ML workload with toleration
spec:
  tolerations:
  - key: "nvidia.com/gpu"
    operator: "Exists"
    effect: "NoSchedule"

  resources:
    limits:
      nvidia.com/gpu: 1
```

#### Use Case 4: Spot Instances

```bash
# Mark spot instances (can be terminated anytime)
kubectl taint nodes spot-1 node.kubernetes.io/instance-type=spot:NoSchedule
```

```yaml
# Non-critical workload tolerates spot instances
spec:
  tolerations:
  - key: "node.kubernetes.io/instance-type"
    operator: "Equal"
    value: "spot"
    effect: "NoSchedule"
```

**Common Built-in Taints:**

Kubernetes automatically applies these taints:

```yaml
# Node not ready
node.kubernetes.io/not-ready:NoExecute

# Unreachable node
node.kubernetes.io/unreachable:NoExecute

# Out of disk
node.kubernetes.io/out-of-disk:NoSchedule

# Memory pressure
node.kubernetes.io/memory-pressure:NoSchedule

# Disk pressure
node.kubernetes.io/disk-pressure:NoSchedule

# Network unavailable
node.kubernetes.io/network-unavailable:NoSchedule

# Unschedulable
node.kubernetes.io/unschedulable:NoSchedule
```

**Taints vs Affinity:**

| Mechanism            | Purpose                         | Default Behavior     |
|----------------------|---------------------------------|----------------------|
| Taints + Tolerations | Repel pods (deny by default)    | Pods CANNOT schedule |
| Node Affinity        | Attract pods (allow by default) | Pods CAN schedule    |

```
Taints:    "Keep everyone out except those with permission"
Affinity:  "Prefer these nodes, but others are okay"
```

#### 5. Topology Spread Constraints

**Purpose:** Control pod distribution across failure-domains (e.g., regions, zones, nodes, etc.) to improve availability and resource utilization.

**What it does:** Spreads pods across topology domains (zones, nodes, regions) based on constraints.

```yaml
spec:
  topologySpreadConstraints:
  - maxSkew: 1
    topologyKey: topology.kubernetes.io/zone
    whenUnsatisfiable: DoNotSchedule
    labelSelector:
      matchLabels:
        app: web
```

**Key Parameters:**

```yaml
maxSkew: 1
  # Maximum allowed difference in pod count between domains
  # Lower = more even distribution
  # Higher = more flexibility

topologyKey: topology.kubernetes.io/zone
  # Label key that defines topology domains
  # Common values:
  #   - kubernetes.io/hostname (spread across nodes)
  #   - topology.kubernetes.io/zone (spread across AZs)
  #   - topology.kubernetes.io/region (spread across regions)

whenUnsatisfiable: DoNotSchedule
  # DoNotSchedule: Hard constraint (pod stays pending)
  # ScheduleAnyway: Soft constraint (best effort)

labelSelector:
  matchLabels:
    app: web
  # Which pods to consider when calculating spread
```

**Example Result:**

```
Configuration:
  maxSkew: 1
  topologyKey: topology.kubernetes.io/zone

Initial state (unbalanced):
  us-east-1a: [pod-1] [pod-2] [pod-3]  ← 3 pods
  us-east-1b: [pod-4]                   ← 1 pod
  us-east-1c: []                        ← 0 pods

  Difference: 3 - 0 = 3 (violates maxSkew=1!)

After topology spread:
  us-east-1a: [pod-1] [pod-2]           ← 2 pods
  us-east-1b: [pod-3] [pod-4]           ← 2 pods
  us-east-1c: [pod-5]                   ← 1 pod

  Difference: 2 - 1 = 1 ✅ (satisfies maxSkew=1)
```

#### Use Case 1: High Availability Across Zones

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 6
  template:
    spec:
      topologySpreadConstraints:
      - maxSkew: 1
        topologyKey: topology.kubernetes.io/zone
        whenUnsatisfiable: DoNotSchedule
        labelSelector:
          matchLabels:
            app: web
```

**Result:**

```
Zone A: 2 pods  ← maxSkew=1 ensures
Zone B: 2 pods  ← no more than 1 pod
Zone C: 2 pods  ← difference between zones

If Zone A fails:
  ✅ Still have 4/6 pods running (66% availability)
```

#### Use Case 2: Spread Across Nodes

```yaml
spec:
  topologySpreadConstraints:
  - maxSkew: 1
    topologyKey: kubernetes.io/hostname
    whenUnsatisfiable: DoNotSchedule
    labelSelector:
      matchLabels:
        app: cache
```

**Result:**

```
node-1: [cache-1]  ← 1 pod per node
node-2: [cache-2]  ← Avoids single point of failure
node-3: [cache-3]
node-4: [cache-4]
```

#### Use Case 3: Multiple Constraints

```yaml
spec:
  topologySpreadConstraints:
  # Spread across zones
  - maxSkew: 1
    topologyKey: topology.kubernetes.io/zone
    whenUnsatisfiable: DoNotSchedule
    labelSelector:
      matchLabels:
        app: web

  # Also spread across nodes within each zone
  - maxSkew: 2
    topologyKey: kubernetes.io/hostname
    whenUnsatisfiable: ScheduleAnyway  # Soft constraint
    labelSelector:
      matchLabels:
        app: web
```

**`whenUnsatisfiable` Comparison:**

```
DoNotSchedule:
  # Hard constraint
  # Pod stays Pending if constraint cannot be satisfied
  # Use for: Critical availability requirements

ScheduleAnyway:
  # Soft constraint (best effort)
  # Pod schedules even if constraint violated
  # Use for: Preferences, optimization
```

**Topology Spread vs Pod Anti-Affinity:**

| Feature      | Topology Spread            | Pod Anti-Affinity          |
|--------------|----------------------------|----------------------------|
| Distribution | Even spread with maxSkew   | Binary (same/different)    |
| Flexibility  | Gradual (maxSkew=1,2,3...) | All-or-nothing             |
| Use Case     | Balance across zones       | Separate critical replicas |

```
Pod Anti-Affinity:
  ✅ Good: "Never put 2 replicas on same node"
  ❌ Limited: Can't express "spread evenly"

Topology Spread:
  ✅ Good: "Spread evenly with max difference of 1"
  ✅ Flexible: Control degree of spreading
```

#### 6. `nodeName` Field

**Purpose:** Directly assigns a Pod to a specific node (hard binding, no scheduling logic).

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: manual-pod
spec:
  nodeName: worker-node-2  # ← Hard-coded assignment
  containers:
  - name: nginx
    image: nginx
```

**How it works:**

```
# Normal Scheduling
  Pod created
    ↓
  Scheduler evaluates all nodes
    ↓
  Filtering phase (resource checks, taints, etc.)
    ↓
  Scoring phase (best node selection)
    ↓
  Pod assigned to chosen node

# With nodeName
  Pod created with nodeName=worker-node-2
    ↓
  Scheduler SKIPPED entirely
    ↓
  Pod assigned directly to worker-node-2
    ↓
  kubelet on worker-node-2 starts pod
```

**Characteristics:**

```
✅ Bypasses scheduler completely
✅ No resource checks
✅ No taint/toleration checks
✅ No affinity evaluation
❌ No validation if node exists
❌ No validation if node has capacity
❌ Pod fails if node doesn't exist or can't run it
```

**When to use:**

```
✅ Good use cases:
  - Debugging (force pod to specific node)
  - DaemonSets (Kubernetes uses this internally)
  - Static pods (kubelet manages directly)
  - Testing node-specific behavior

❌ Avoid for:
  - Production workloads
  - Applications requiring HA
  - Anywhere scheduler intelligence is needed
```

## Pod Priority and Preemption

### The Problem

**Scenario:** Your cluster is at capacity (all resources used). A critical pod needs to start NOW, but there's no room.

```
Cluster at 100% capacity:
  node-1: [batch-job-1] [batch-job-2] [batch-job-3]
  node-2: [batch-job-4] [batch-job-5] [batch-job-6]
  node-3: [batch-job-7] [batch-job-8] [batch-job-9]

Critical API pod needs to start:
  api-pod: Pending (no resources available)

Question: Should low-priority batch jobs block critical API?
Answer: No! Priority + Preemption solves this.
```

### What is Pod Priority?

**Pod Priority** assigns importance levels to pods. Higher priority = more important.

Think of it like airline boarding:

```
Priority 2000000: First Class    (critical services)
Priority 1000:    Business       (important apps)
Priority 0:       Economy        (batch jobs, default)
```

**How it works:**

```yaml
# Step 1: Define PriorityClass (cluster-wide)
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: critical-priority
value: 1000000           # Higher number = higher priority
globalDefault: false     # Don't apply to all pods automatically
description: "Critical production services"
```

```yaml
# Step 2: Reference PriorityClass in Pod
apiVersion: v1
kind: Pod
metadata:
  name: api-server
spec:
  priorityClassName: critical-priority  # ← Uses priority value 1000000
  containers:
  - name: api
    image: api-server:v1
```

**Built-in Priority Classes:**

Kubernetes comes with two system priorities:

```bash
# View built-in priorities
kubectl get priorityclasses

NAME                      VALUE        GLOBAL-DEFAULT
system-cluster-critical   2000000000   false
system-node-critical      2000001000   false
```

These are reserved for Kubernetes system components (kube-proxy, CoreDNS, etc.).

### What is Preemption?

**Preemption** is when the scheduler evicts (kills) lower-priority pods to make room for higher-priority pods.

**When it happens:**

```
1. High-priority pod created
      ↓
2. Scheduler tries to find a node with resources
      ↓
3. No node has enough resources (cluster full)
      ↓
4. Scheduler looks for lower-priority pods to evict
      ↓
5. Evicts lower-priority pods to free resources
      ↓
6. Schedules high-priority pod
```

### Preventing Preemption

Sometimes you want priority WITHOUT evicting other pods:

```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: high-priority-no-eviction
value: 5000
preemptionPolicy: Never  # ← Won't evict other pods
description: "Important but won't preempt others"
```

**Behavior:**

```
Pod with preemptionPolicy: Never

If resources available:
  ✅ Schedules immediately (uses priority for queue ordering)

If NO resources available:
  ❌ Stays Pending (won't evict lower-priority pods)
  ⏳ Waits for resources to free up naturally
```

**Use case:**

```
Important workload that should start first, but shouldnt
kick out other running workloads.

Example: Database backup job
  - Important (run before other batch jobs)
  - But shouldnt evict running application pods
```

### Priority vs Preemption

| Feature    | Purpose              | Effect                                             |
|------------|----------------------|----------------------------------------------------|
| Priority   | Scheduling order     | Which pod schedules first when resources available |
| Preemption | Resource reclamation | Whether to evict lower-priority pods               |

```
Priority without Preemption:
  → High-priority pod goes to front of queue
  → But waits if no resources available
  → preemptionPolicy: Never

Priority with Preemption (default):
  → High-priority pod goes to front of queue
  → Can evict lower-priority pods if needed
  → preemptionPolicy: PreemptLowerPriority
```

### Default Priority

**What happens if no `priorityClassName` specified?**

```yaml
# Pod without priority
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  # No priorityClassName specified
  containers:
  - name: app
    image: myapp
```

**Result:**

```yaml
Default priority: 0

Unless globalDefault: true is set on a PriorityClass:

apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: default-priority
value: 100
globalDefault: true  # ← All pods without priorityClassName get this

Then pods default to priority: 100
```

## Quality of Service (QoS)

Kubernetes assigns QoS classes based on resources. They are used by Kubernetes to decide which Pods to evict from a Node experiencing Node Pressure.

### QoS classes

#### 1. Guaranteed (Highest Priority)

```yaml
resources:
  requests:
    memory: "1Gi"
    cpu: "1"
  limits:
    memory: "1Gi"  # Same as requests
    cpu: "1"       # Same as requests
```

**Requirements:**

* Every container has CPU and memory limits
* Requests == limits

#### 2. Burstable

```yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "500m"
  limits:
    memory: "1Gi"  # Different from requests
    cpu: "1"
```

**Requirements:**

* At least one container has CPU or memory request or limit
* Requests != limits

#### 3. BestEffort (Lowest Priority)

```yaml
# No resources defined
containers:
- name: app
  image: nginx
```

### Eviction Order (Resource Pressure)

```
Node runs low on memory/disk
      ↓
1. Evict BestEffort pods first
      ↓
2. Evict Burstable pods (exceeding requests)
      ↓
3. Evict Burstable pods (within requests)
      ↓
4. Evict Guaranteed pods (last resort)
```

## Pod Disruption Budgets (PDB)

**Purpose:** Ensures minimum availability for a set of pods during voluntary disruptions (e.g., node drains, rolling updates, or manual pod deletions).

Think of PDB as a "safety net" that prevents us from accidentally taking down too many pods at once.

### What Are Voluntary vs Involuntary Disruptions?

**Voluntary Disruptions** (PDB protects against these):

```
✅ kubectl drain node-1          (admin draining node)
✅ kubectl delete pod my-pod     (manual deletion)
✅ Deployment rolling update     (controlled update)
✅ Cluster autoscaler scaling    (removing nodes)
✅ Node maintenance              (planned downtime)
```

**Involuntary Disruptions** (PDB does NOT protect against these):

```
❌ Node hardware failure         (unexpected crash)
❌ Node runs out of resources    (OOM, disk full)
❌ Network partition             (network issues)
❌ Kernel panic                  (OS crash)
❌ Pod eviction due to pressure  (system-driven)
```

**Key point:** PDB only prevents **human-initiated** or **automated voluntary** disruptions.

### How It Works

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: web-pdb
spec:
  minAvailable: 2      # OR use maxUnavailable: 1
  selector:
    matchLabels:
      app: web
```

**Two ways to specify the budget:**

| Field          | Meaning                             | Example                                         |
|----------------|-------------------------------------|-------------------------------------------------|
| minAvailable   | Minimum pods that MUST stay running | `minAvailable: 2` = At least 2 pods must be up  |
| maxUnavailable | Maximum pods that CAN be down       | `maxUnavailable: 1` = At most 1 pod can be down |

```
3 replicas, minAvailable: 2
  ✅ Can disrupt 1 pod (2 remain)
  ❌ Cannot disrupt 2 pods (only 1 remains)

3 replicas, maxUnavailable: 1
  ✅ Can disrupt 1 pod
  ❌ Cannot disrupt 2 pods
```

### What PDB Prevents

**1. Draining nodes when it would violate budget**

```
# 3 web pods: node-1 has 1, node-2 has 2
# PDB: minAvailable: 2

kubectl drain node-1
  ✅ Allowed (1 pod evicted, 2 remain on node-2)

kubectl drain node-2
  ❌ Blocked! (would evict 2 pods, leaving only 1)
  Error: Cannot evict pod web-xxx: violates PodDisruptionBudget
```

**2. Scaling down when it would violate budget**

```
# 3 replicas, PDB: minAvailable: 2

kubectl scale deployment web --replicas=2
  ✅ Allowed (still have 2 pods)

kubectl scale deployment web --replicas=1
  ❌ Blocked! (would violate minAvailable: 2)
```

**3. Rolling updates that are too aggressive**

```
# Deployment with 3 replicas
# PDB: minAvailable: 2

strategy:
  rollingUpdate:
    maxUnavailable: 2  # Wants to take down 2 pods

# Kubernetes will reduce maxUnavailable to 1
# to respect PDB (keeping 2 pods available)
```

### Special Case: Single Replica

**Important:** If only one replica exists, no disruption will be allowed.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: single-pod-app
spec:
  replicas: 1  # Only 1 replica
---
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: single-pod-pdb
spec:
  minAvailable: 1
  selector:
    matchLabels:
      app: single-pod-app
```

**Result:**

```bash
kubectl drain node-1
  ❌ Error: Cannot evict pod single-pod-app-xxx
     Reason: Would violate PodDisruptionBudget (0 would remain)

# To drain anyway, you must bypass PDB:
kubectl drain node-1 --disable-eviction
  ✅ Forces drain (ignores PDB)
```

### Percentage Values

You can use percentages instead of absolute numbers:

```yaml
spec:
  minAvailable: 50%    # At least 50% of pods must be up
  # OR
  maxUnavailable: 30%  # At most 30% can be down
```

**Example:**

```
10 replicas, minAvailable: 50%
  → Must keep at least 5 pods running
  → Can disrupt up to 5 pods

10 replicas, maxUnavailable: 30%
  → Can disrupt at most 3 pods
  → Must keep at least 7 pods running
```

## Pod Lifecycle Hooks

### Purpose

Lifecycle hooks allow you to run code at specific points in a container's lifecycle:

* **PostStart**: Right after container starts
* **PreStop**: Right before container terminates

### PostStart Hook

**What it does:** Runs **immediately after** a container is created.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: lifecycle-demo
spec:
  containers:
  - name: app
    image: nginx
    lifecycle:
      postStart:
        exec:
          command: ["/bin/sh", "-c", "echo 'Container started' > /tmp/startup.log"]
```

**Flow:**Container created → `postStart` hook + `ENTRYPOINT` start around the same time → container running

### PreStop Hook

**What it does:** Executes **immediately before** a container is terminated.

**Purpose:** Helps manage pod state (finish in-flight requests, flush logs, close DB connections, etc.) before termination.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: graceful-shutdown
spec:
  terminationGracePeriodSeconds: 60
  containers:
  - name: nginx
    image: nginx
    lifecycle:
      preStop:
        exec:
          command: ["/bin/sh", "-c", "nginx -s quit; sleep 30"]
```

**Flow:**Pod deleted → preStop hook runs (blocking) → SIGTERM sent to container → wait up to terminationGracePeriodSeconds → SIGKILL if still not exited

* **Important:** preStop hook counts against  `terminationGracePeriodSeconds`.

**Better understanding:**

```yaml
# WRONG: This doesn't work as expected
spec:
  terminationGracePeriodSeconds: 30
  containers:
  - name: app
    lifecycle:
      preStop:
        exec:
          command: ["/bin/sh", "-c", "sleep 60"]  # 60s sleep

# What happens:
# t=0s:   preStop starts
# t=30s:  terminationGracePeriodSeconds expires
# t=30s:  SIGKILL sent (preStop still running!)
# Result: Forcefully killed mid-cleanup!

# CORRECT: Ensure preStop + app shutdown < grace period
spec:
  terminationGracePeriodSeconds: 90  # Total time budget
  containers:
  - name: app
    lifecycle:
      preStop:
        exec:
          command: ["/bin/sh", "-c", "sleep 15"]  # 15s buffer
  # Leaves 75s for app to handle SIGTERM and shutdown
```

### Pod Deletion Flow with PreStop Hook

```
1. Pod deletion triggered (kubectl delete or eviction)
      ↓
2. Pod marked as Terminating
   + Removed from Service endpoints (stops receiving traffic)
      ↓
3. PARALLEL actions:
   ├─> preStop hook executed (if configured) ← BLOCKING
   └─> Pod removed from iptables rules (no new connections)
      ↓
4. preStop completes (Kubernetes waits for preStop to finish)
      ↓
5. SIGTERM sent to all containers in pod
      ↓
6. Wait for terminationGracePeriodSeconds (default 30s)
      ↓
7. If containers exit within timeout → Pod terminated gracefully
      ↓
8. If containers still running → SIGKILL sent (force kill)
      ↓
9. Pod removed from cluster (etcd)
```

### Real-World Example: Web Server Graceful Shutdown

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-server
spec:
  terminationGracePeriodSeconds: 60  # Give app time to shutdown
  containers:
  - name: nginx
    image: nginx
    ports:
    - containerPort: 80
    lifecycle:
      preStop:
        exec:
          command: ["/bin/sh", "-c", "/graceful-shutdown.sh"]  # Drain connections
```

**Script: graceful-shutdown.sh**

```bash
#!/bin/sh

# 1. Stop accepting new connections
nginx -s quit  # Graceful nginx shutdown

# 2. Wait for in-flight requests to complete
# (Nginx will finish active requests but won't accept new ones)
sleep 20

# 3. Flush logs
sync

# preStop completes, then SIGTERM sent
# Total: 20s preStop + 40s for SIGTERM = 60s grace period
```

**What happens:**

```
t=0s:   kubectl delete pod web-server
t=0s:   Pod removed from Service endpoints
t=0s:   preStop starts
        → nginx -s quit (stop accepting new connections)
        → sleep 20 (finish active requests)
t=20s:  preStop completes
t=20s:  SIGTERM sent to nginx
t=30s:  nginx exits gracefully
t=30s:  Pod removed

✅ No dropped connections
✅ All requests completed
✅ Clean shutdown
```

### Use Cases

**PostStart:**

* Register with service discovery
* Initialize local cache
* Send startup notification

**PreStop:**

* Finish in-flight requests
* Flush logs to remote storage
* Close database connections gracefully
* Deregister from service discovery
* Save application state

## Termination Grace Period

### What is terminationGracePeriodSeconds?

`terminationGracePeriodSeconds` defines the **total time budget** Kubernetes gives a pod to shut down gracefully before forcefully killing it.

**Key Concept:**

```
terminationGracePeriodSeconds = Total time from deletion to forced kill

This includes:
1. Time for preStop hook execution
2. Time for application to handle SIGTERM
3. Time for cleanup operations

Default: 30 seconds
```

### Critical Understanding: It's a Total Budget

```
terminationGracePeriodSeconds: 60

Real behavior:
├─ preStop hook: 15s      ┐
├─ SIGTERM handling: 40s  ├─ Total: 55s (within 60s budget)
└─ Pod exits: t=55s       ┘

If total exceeds 60s:
├─ preStop hook: 15s      ┐
├─ SIGTERM handling: 50s  ├─ Would be 65s...
└─ t=60s: SIGKILL!        ┘ But killed at 60s!
```

### Verifying Your Settings

**Check if pods are being killed prematurely:**

```bash
# Look for SIGKILL in pod events
kubectl describe pod my-pod

Events:
  Type     Reason     Message
  ----     ------     -------
  Normal   Killing    Stopping container app
  Warning  Failed     Error: exit code 137

# Exit code 137 = 128 + 9 (SIGKILL)
# Means: Pod was forcefully killed
# Solution: Increase terminationGracePeriodSeconds
```

### Special Cases

**1. Immediate deletion (bypass grace period):**

```bash
# Force delete without waiting
kubectl delete pod my-pod --grace-period=0 --force

# Warning: Skips graceful shutdown completely!
# Use only when pod is stuck or for non-critical workloads
```

**2. Infinite grace period (not recommended):**

```yaml
spec:
  terminationGracePeriodSeconds: 0  # Not what you think!
  # 0 means "use default (30s)", NOT infinite

# To have a very long grace period:
  terminationGracePeriodSeconds: 3600  # 1 hour
```

**3. Per-container grace period:**

```
Note: terminationGracePeriodSeconds is pod-level, not container-level.
All containers in a pod share the same grace period.

Pod with 2 containers:
  terminationGracePeriodSeconds: 60
  ↓
  Both containers get SIGTERM simultaneously
  Both must exit within 60s total
  If any container still running at 60s → both get SIGKILL
```

## Summary

**Pod Lifecycle:**

* Pending → Running → Succeeded/Failed
* Container states: Waiting, Running, Terminated
* Restart policies control container restart behavior

**Scheduling:**

* Filtering → Scoring → Selection → Binding
* Control via nodeSelector, affinity, taints/tolerations
* Topology spread for distribution

**Resource Management:**

* Priority classes for important workloads
* QoS classes determine eviction order
* PDBs protect availability during disruptions

---

**Key Takeaways:**

* Understand pod phases for troubleshooting
* Use scheduling constraints to control placement
* QoS classes are automatic based on resource definitions
* PDBs prevent over-disruption during maintenance
* Graceful shutdown requires proper termination handling
