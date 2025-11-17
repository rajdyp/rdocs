---
title: Workload Controllers
linkTitle: Workload Controllers
type: docs
weight: 8
prev: /kubernetes/07-pod-lifecycle
next: /kubernetes/09-services
---

## Overview

Workload Controllers are Kubernetes objects that manage the deployment and lifecycle of pods. They provide automation for common patterns like replication, stateful applications, and scheduled tasks.

```
┌──────────────────────────────────────────────────────────────┐
│                   Workload Controllers                       │
│                                                              │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐           │
│  │Deployment  │  │StatefulSet  │  │  DaemonSet   │           │
│  │(Replicated │  │(Ordered,    │  │ (Every Node) │           │
│  │ workloads) │  │ stateful)   │  │              │           │
│  └────────────┘  └─────────────┘  └──────────────┘           │
│                                                              │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐           │
│  │ ReplicaSet │  │    Job      │  │  CronJob     │           │
│  │ (Low-level)│  │(One-off tasks) │ (Scheduled   │           │
│  │            │  │             │  │  tasks)      │           │
│  └────────────┘  └─────────────┘  └──────────────┘           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## 1. ReplicaSet

### Purpose

A **ReplicaSet** ensures that a specified number of pod replicas are running at all times. It's the low-level controller that maintains desired replica count.

### Key Characteristics

* Maintains a desired number of identical pod replicas
* Recreates pods (self-healing) if they fail or are deleted
* Uses label selectors to identify pods
* Automatically scales up/down

### How ReplicaSet Works

```
ReplicaSet Spec
  replicas: 3
  selector:
    matchLabels:
      app: nginx

  ↓

Desired State: 3 pods with label app=nginx

  ↓

ReplicaSet Controller (continuous reconciliation)

  ├─ Actual pods: 2 running
  ├─ Action: Create 1 more pod
  ↓
 
Pod created with labels:
  app: nginx

  ↓

Desired = Actual = 3 ✓
```

### ReplicaSet Manifest

```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: nginx-rs
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80
```

### kubectl Commands

```bash
# Create ReplicaSet
kubectl -n <namespace> apply -f nginx-rs.yaml

# View ReplicaSets
kubectl -n <namespace> get replicasets

# Detailed information
kubectl -n <namespace> describe rs nginx-rs

# Scale ReplicaSet
kubectl -n <namespace> scale rs nginx-rs --replicas=5

# Delete ReplicaSet
kubectl -n <namespace> delete rs nginx-rs

# Delete ReplicaSet but keep pods
kubectl -n <namespace> delete rs nginx-rs --cascade=orphan
```

### Important Note

**Don't create ReplicaSets directly!** Use Deployments instead, which create and manage ReplicaSets for you.

## Understanding Manifest File Structure

Before diving deeper into Deployments, let's understand the common structure of all Kubernetes manifests:

```yaml
apiVersion: apps/v1      # Which API group/version to use
kind: Deployment         # Type of resource to create
metadata:                # Resource identification
  name: my-app
  labels:
    app: my-app
spec:                    # Desired state configuration
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
      - name: app
        image: nginx
```

### Core Fields

* **`apiVersion`** - Tells the control plane which API schema to use for validation and processing

  * Format: `<group>/<version>` (e.g., `apps/v1`, `batch/v1`)
  * Core resources use just the version (e.g., `v1` for Pods, Services)

* **`kind`** - Defines the resource type (Pod, Deployment, Service, ConfigMap, etc.)

  * Determines which controller processes the resource
  * Must match a registered Kubernetes resource type

* **`metadata`** - Provides identity and organization

  * `name`: Unique identifier within a namespace
  * `namespace`: Logical grouping (defaults to `default`)
  * `labels`: Key-value pairs for selection and organization
  * `annotations`: Non-identifying metadata (documentation, tool configs)

* **`spec`** - Describes the desired state. Note the nested levels in a Deployment:

  * **Top-level spec** - Deployment lifecycle (replicas, update strategy, selector)
  * **Pod “template” spec** (under `template.spec`) - Pod configuration (volumes, restart policy, security context)
  * **Container spec** (under `template.spec.containers`) - Individual container settings (image, ports, resources, probes)

### Why This Matters

Understanding these nested `spec` levels is crucial:

* The **Deployment spec** tells Kubernetes how many replicas to maintain
* The **Pod template spec** defines what each pod looks like
* The **Container spec** defines what runs inside each pod

This layered structure allows Kubernetes to manage complex applications declaratively.

<!-- Image not available: image.png (/blob/ccVAAA0b5IF/bU53yEkQZ-86KgARg8CV3A) -->

## 2. Deployment

### Purpose

A **Deployment** is the most common workload controller. It manages one or more identical Pods to run stateless applications by creating ReplicaSets and enabling declarative updates, rollbacks, and scaling.

### Key Characteristics

* Manages ReplicaSets automatically
* Provides rolling updates and rollbacks
* Declarative deployment configuration
* Supports blue-green and canary deployments
* Most common way to deploy applications

### Deployment Architecture

```
Deployment
  └─ spec.replicas: 3
  └─ spec.template (Pod template)
       └─ selector: app=nginx

         ↓ Creates

     ReplicaSet (v1)
       └─ 3 pods

     ReplicaSet (v2)  ← When image changes
       └─ 3 pods
```

### Deployment Manifest

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "100m"
          limits:
            memory: "128Mi"
            cpu: "200m"
```

### kubectl Commands

```bash
# Create deployment
kubectl apply -f nginx-deployment.yaml

# View deployments
kubectl get deployments

# Detailed information
kubectl describe deploy nginx-deployment

# View ReplicaSets created by deployment
kubectl get replicasets

# View pods
kubectl get pods -l app=nginx

# Scale deployment
kubectl scale deploy nginx-deployment --replicas=5

# Edit deployment (opens editor)
kubectl edit deploy nginx-deployment

# Check rollout status
kubectl rollout status deploy/nginx-deployment

# Rollback to previous version
kubectl rollout undo deploy/nginx-deployment

# View rollout history
kubectl rollout history deploy/nginx-deployment

# Rollback to specific revision
kubectl rollout undo deploy/nginx-deployment --to-revision=2

# Pause/resume deployment
kubectl rollout pause deploy/nginx-deployment
kubectl rollout resume deploy/nginx-deployment
```

## 3. Rolling Updates and Rollbacks

### Rolling Update Process

A rolling update gradually replaces old pods with new ones, ensuring no downtime.

```
Rolling Update Initiated
      ↓
1. Create new ReplicaSet
   Kubernetes creates a new ReplicaSet with the updated version of the app
   (updated pod template)
   
      ↓
2. Scale up new Pods (controlled by maxSurge)
   Gradually increase the number of new Pods
   Wait for each pod to pass readiness probe
   
      ↓
3. Scale down old Pods (controlled by maxUnavailable)
   Gradually terminate old version as new Pods become ready
   
      ↓
4. Complete rollout
   The old ReplicaSet reaches zero Pods
   Only the new version remains running
```

**Visual Example:**

```
Initial State (nginx:1.21, replicas=3)
┌─────┬─────┬─────┐
│ P1  │ P2  │ P3  │  (1.21)
└─────┴─────┴─────┘
All 3 pods running old version

Update to nginx:1.22

        ↓
Deployment creates new ReplicaSet with nginx:1.22

        ↓
Step 1 (maxSurge=1, maxUnavailable=0)
┌─────┬─────┬─────┬─────┐
│ P1  │ P2  │ P3  │ P4* │  (1.21, 1.21, 1.21, 1.22*)
└─────┴─────┴─────┴─────┘

Step 2
┌─────┬─────┬─────┬─────┐
│ P1  │ P2  │ P5* │ P4* │  (1.21, 1.21, 1.22*, 1.22*)
└─────┴─────┴─────┴─────┘  (P3 terminated)

Step 3
┌─────┬─────┬─────┐
│ P1  │ P6* │ P4* │      (1.21, 1.22*, 1.22*)
└─────┴─────┴─────┘      (P2 terminated)

Step 4 (Complete)
┌─────┬─────┬─────┐
│ P7* │ P6* │ P4* │      (1.22*, 1.22*, 1.22*)
└─────┴─────┴─────┘      (P1 terminated)

→ All pods now running new version (1.22)
→ Old ReplicaSet scaled to 0, New ReplicaSet at 3
→ Rolling update complete! Zero downtime achieved.
```

**Key Points:**

* **maxSurge=1**: Allows 1 extra pod during the update
* **maxUnavailable=0**: Ensures all 3 pods are always available (no downtime)
* **Sequential replacement**: Only proceeds after each new pod becomes Ready
* **Old ReplicaSet persists**: Scaled to 0 but retained for rollback (based on `revisionHistoryLimit`)

### Rolling Update Strategy

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1           # 1 extra pod above replicas during update
      maxUnavailable: 0     # 0 pods can be unavailable during update
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: web:v1
```

### Rollback Process

When a rollback is triggered, Kubernetes follows these steps:

```
Rollback Initiated
      ↓
1. Restore ReplicaSet
   Kubernetes identifies and restores the previous ReplicaSet
   with the stable version of the app

      ↓
2. Scale up old Pods (controlled by maxSurge)
   Gradually increase the number of old (stable) Pods

      ↓
3. Scale down faulty Pods (controlled by maxUnavailable)
   Gradually remove the faulty version as stable Pods become ready

      ↓
4. Complete rollback
   The faulty ReplicaSet reaches zero Pods
   Only the stable version remains running
```

**Example:**

```bash
# Deployment with failing new version
$ kubectl get rs
NAME                      DESIRED   CURRENT   READY
web-app-abc123            0         0         0      # Old stable version
web-app-xyz789            3         3         1      # New failing version (only 1/3 ready)

# Perform rollback
$ kubectl rollout undo deploy/web-app

# During rollback - both ReplicaSets active
$ kubectl get rs
NAME                      DESIRED   CURRENT   READY
web-app-abc123            2         2         2      # Scaling up (stable)
web-app-xyz789            1         1         0      # Scaling down (faulty)

# After rollback - stable version restored
$ kubectl get rs
NAME                      DESIRED   CURRENT   READY
web-app-abc123            3         3         3      # Stable version running
web-app-xyz789            0         0         0      # Faulty version scaled to zero
```

### Understanding `maxSurge` and `maxUnavailable`

| Scenario                 | maxSurge             | maxUnavailable | Behavior |
|--------------------------|----------------------|----------------|-------------------------------------|
| Blue-Green (no downtime) | 100% (replicate all) | 0              | All new + all old temporarily       |
| Rolling (gradual)        | 1 or 25%             | 0              | One at a time, no downtime          |
| Fast Rolling             | 25%                  | 1              | Multiple at once, brief downtime    |
| Resource-constrained     | 0                    | 1              | Kill old then create new (downtime) |

### Practical Example: Blue-Green Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-server
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 3         # Allow 3 extra (100% of replicas)
      maxUnavailable: 0   # Zero downtime
  selector:
    matchLabels:
      app: api
      tier: backend
  template:
    metadata:
      labels:
        app: api
        tier: backend
        version: v2.0
    spec:
      containers:
      - name: api
        image: myapp:v2.0
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
```

### The pod-template-hash Label

The **pod-template-hash** is a special label automatically added by the Deployment controller to distinguish between different ReplicaSets and their pods.

#### Purpose

* **Uniquely identifies each ReplicaSet** created by a Deployment
* **Inherited by Pods** - Flows from Deployment → ReplicaSet → Pod
* **Prevents selector conflicts** during rolling updates when multiple ReplicaSets coexist
* **Enables safe concurrent operation** of old and new pod versions
* Computed as a hash of the pod template specification

#### How It Works

```
Deployment: hello-deploy
  spec.template (pod template)
    └─ Hash of template → "54f5d46964"

         ↓ Creates ReplicaSet

ReplicaSet: hello-deploy-54f5d46964
  metadata.labels:
    pod-template-hash: 54f5d46964
  spec.selector:
    app: hello-world
    pod-template-hash: 54f5d46964

         ↓ Creates Pods

Pods: hello-deploy-54f5d46964-xxxxx
  metadata.labels:
    app: hello-world
    pod-template-hash: 54f5d46964
```

#### Example: Viewing pod-template-hash

```bash
# View Deployment and its ReplicaSet
$ kubectl describe deploy hello-deploy
Name:                   hello-deploy
Namespace:              default
...
NewReplicaSet:          hello-deploy-54f5d46964 (3/3 replicas created)
OldReplicaSets:         <none>

# View ReplicaSet with pod-template-hash
$ kubectl describe rs hello-deploy-54f5d46964
Name:           hello-deploy-54f5d46964
Namespace:      default
Selector:       app=hello-world,pod-template-hash=54f5d46964
Labels:         app=hello-world
                pod-template-hash=54f5d46964
...

# View Pods with labels
$ kubectl get pods --show-labels
NAME                            READY   STATUS    LABELS
hello-deploy-54f5d46964-7xkqm   1/1     Running   app=hello-world,pod-template-hash=54f5d46964
hello-deploy-54f5d46964-m9tn2   1/1     Running   app=hello-world,pod-template-hash=54f5d46964
hello-deploy-54f5d46964-vwxyz   1/1     Running   app=hello-world,pod-template-hash=54f5d46964
```

### Deployment Configuration Parameters

Deployments support several important configuration parameters that control update behavior, rollback capability, and readiness timing.

#### revisionHistoryLimit

**Purpose:** Controls how many old ReplicaSets to retain for rollback capability.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 10
  revisionHistoryLimit: 5  # Keep 5 old ReplicaSets for rollback
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
      - name: web
        image: web:v1.0
```

#### progressDeadlineSeconds

**Purpose:** Sets a timeout for deployment progress. If the deployment doesn't make progress within this time, it's marked as failed.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 10
  progressDeadlineSeconds: 600  # 10 minutes timeout
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
      - name: web
        image: web:v2.0
```

**What counts as "progress":**

* New pod becomes ready
* Old pod is terminated
* Any change in the deployment status

#### minReadySeconds (confirm stability)

**Purpose:** Minimum time a pod must be ready (without any containers crashing) before it's considered available.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 10
  minReadySeconds: 30  # Wait 30 seconds after pod is ready
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
      - name: web
        image: web:v1.0
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          periodSeconds: 5
```

**How it works:**

```
Pod Lifecycle during Rolling Update:

1. Pod created → STATUS: Pending
2. Container starts → STATUS: Running
3. Readiness probe passes → STATUS: Ready
4. Wait minReadySeconds (30s) → STATUS: Still Ready
5. Pod considered Available → Rolling update continues

If pod crashes during minReadySeconds:
3. Readiness probe passes → STATUS: Ready
4. Wait 15s... → Container crashes
5. Pod NOT considered Available → Rolling update PAUSES
```

**Use case:** Preventing premature rollouts.

#### Complete Example with All Parameters

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: production-app
spec:
  replicas: 10
  revisionHistoryLimit: 5           # Keep 5 old versions for rollback
  progressDeadlineSeconds: 600      # Fail after 10 minutes of no progress
  minReadySeconds: 30               # Wait 30s after ready before continuing
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 2                   # Allow 2 extra pods during update
      maxUnavailable: 0             # Zero downtime
  selector:
    matchLabels:
      app: production-app
  template:
    metadata:
      labels:
        app: production-app
    spec:
      containers:
      - name: app
        image: myapp:v2.0
        ports:
        - containerPort: 8080
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
          failureThreshold: 3
        livenessProbe:
          httpGet:
            path: /health/alive
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
```

## 4. StatefulSet

### Purpose

A **StatefulSet** manages stateful applications where pods need:

* Stable, unique network identities
* Persistent storage per pod
* Ordered, graceful deployment and scaling

### Key Characteristics

* Stable pod names: `app-0`, `app-1`, `app-2`
* Stable network identity via Headless Service
* Persistent storage per pod
* Ordered deployment: sequential (0, 1, 2...)
* Ordered termination: reverse sequential (2, 1, 0)

### StatefulSet vs Deployment

| Aspect      | Deployment      | StatefulSet                |
|-------------|-----------------|----------------------------|
| Pod names   | Random hash     | Ordered (app-0, app-1)     |
| Identity    | Interchangeable | Unique, stable             |
| Storage     | Ephemeral       | Persistent per pod         |
| Start order | Parallel        | Sequential                 |
| Use cases   | Web apps, APIs  | Databases, message brokers |

### StatefulSet Architecture

```bash
StatefulSet: mysql
  replicas: 3
  serviceName: mysql

  ↓

Pods with stable identity:
┌────────────┐  ┌────────────┐  ┌────────────┐
│  mysql-0   │  │  mysql-1   │  │  mysql-2   │
│ IP fixed   │  │ IP fixed   │  │ IP fixed   │
│ (via DNS)  │  │ (via DNS)  │  │ (via DNS)  │
└────────────┘  └────────────┘  └────────────┘

      ↓               ↓               ↓

┌────────────┐  ┌────────────┐  ┌────────────┐
│  PVC-0     │  │  PVC-1     │  │  PVC-2     │
│ data-0     │  │ data-1     │  │ data-2     │
└────────────┘  └────────────┘  └────────────┘
```

### StatefulSet Manifest

```yaml
apiVersion: v1
kind: Service
metadata:
  name: mysql
spec:
  clusterIP: None  # Headless service
  selector:
    app: mysql
  ports:
  - port: 3306
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
spec:
  serviceName: mysql  # Required: name of headless service
  replicas: 3
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
        ports:
        - containerPort: 3306
        env:
        - name: MYSQL_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mysql-secret
              key: root-password
        volumeMounts:
        - name: data
          mountPath: /var/lib/mysql
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: fast-ssd
      resources:
        requests:
          storage: 10Gi
```

### kubectl Commands

```bash
# Create StatefulSet
kubectl -n <namespace> apply -f mysql-statefulset.yaml

# View StatefulSets
kubectl -n <namespace> get statefulsets

# Detailed information
kubectl -n <namespace> describe sts mysql

# View pods (notice ordered names)
kubectl -n <namespace> get pods -l app=mysql

# View PersistentVolumeClaims created
kubectl -n <namespace> get pvc

# Scale StatefulSet
kubectl -n <namespace> scale sts mysql --replicas=5

# Ordered scaling: waits for pod 3 to be ready before starting 4
```

### StatefulSet Deployment Order

```
# Scaling up (replicas: 1 → 3)
Step 1: mysql-0 starts
        (waits until Ready)
Step 2: mysql-1 starts
        (waits until Ready)
Step 3: mysql-2 starts
        (waits until Ready)

# Scaling down (replicas: 3 → 1)
Step 1: mysql-2 deleted
        (waits until deleted)
Step 2: mysql-1 deleted
        (waits until deleted)
Step 3: mysql-0 remains
```

## 5. DaemonSet

### Purpose

A **DaemonSet** ensures that a pod runs on **every node** (or selected nodes) in the cluster. Used for cluster-wide services like logging, monitoring, and networking.

### Key Characteristics

* One pod per node (or selected nodes)
* Automatically creates pods on new nodes
* Automatically deletes pods from removed nodes
* No replicas field (number of nodes determines count)
* No built-in canary deployment support (unlike Deployments)
* Rolling updates controlled by `updateStrategy.rollingUpdate.maxUnavailable` (how many nodes can update simultaneously)

### DaemonSet Use Cases

```
┌────────────┐  ┌────────────┐  ┌────────────┐
│  Worker-1  │  │  Worker-2  │  │  Worker-3  │
│            │  │            │  │            │
│  ┌────┐    │  │  ┌────┐    │  │  ┌────┐    │
│  │ Pod│    │  │  │ Pod│    │  │  │ Pod│    │
│  └────┘    │  │  └────┘    │  │  └────┘    │
│            │  │            │  │            │
└────────────┘  └────────────┘  └────────────┘

DaemonSet: fluentd
  3 workers → 3 fluentd pods
  4 workers → 4 fluentd pods (auto-created)
  2 workers → 2 fluentd pods (auto-deleted)
```

### DaemonSet Manifest

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd
  namespace: kube-system
spec:
  selector:
    matchLabels:
      app: fluentd
  template:
    metadata:
      labels:
        app: fluentd
    spec:
      tolerations:
      - key: node-role.kubernetes.io/master
        effect: NoSchedule
      containers:
      - name: fluentd
        image: fluent/fluentd:v1.14
        volumeMounts:
        - name: varlog
          mountPath: /var/log
        - name: varlibdockercontainers
          mountPath: /var/lib/docker/containers
          readOnly: true
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
      - name: varlibdockercontainers
        hostPath:
          path: /var/lib/docker/containers
```

### DaemonSet with Node Selector

Use **nodeSelector** (or **nodeAffinity**) inside the DaemonSet spec to restrict Pod placement to specific target nodes instead of running on every node in the cluster.

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: nvidia-gpu-device-plugin
spec:
  selector:
    matchLabels:
      app: nvidia-gpu
  template:
    metadata:
      labels:
        app: nvidia-gpu
    spec:
      nodeSelector:
        accelerator: nvidia    # Only run on nodes labeled accelerator=nvidia
      containers:
      - name: nvidia-device-plugin
        image: nvidia/k8s-device-plugin:1.11
        securityContext:
          allowPrivilegeEscalation: false
          capabilities:
            drop: ["ALL"]
        volumeMounts:
        - name: device-metrics
          mountPath: /var/lib/kubelet/device-plugins
      volumes:
      - name: device-metrics
        hostPath:
          path: /var/lib/kubelet/device-plugins
```

### kubectl Commands

```bash
# Create DaemonSet
kubectl -n <namespace> apply -f fluentd-daemonset.yaml

# View DaemonSets
kubectl -n <namespace> get daemonsets

# Detailed information
kubectl -n <namespace> describe ds fluentd

# View pods created by DaemonSet
kubectl -n <namespace> get pods -l app=fluentd

# View on which nodes DaemonSet pods are running
kubectl -n <namespace> get pods -l app=fluentd -o wide
```

## 6. Jobs

### Purpose

A **Job** creates one or more pods and ensures they complete successfully. Used for batch processing, one-time tasks, and finite work.

### Key Characteristics

* Creates pods that run to completion
* Does not automatically restart after completion
* Can run multiple pods in parallel
* Tracks job completion
* Can retry on failure

### Job Manifest

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: pi-calculation
spec:
  completions: 1        # Number of pods that must complete
  parallelism: 1        # Number of pods running in parallel
  backoffLimit: 3       # Number of retries on failure
  ttlSecondsAfterFinished: 3600  # Delete after 1 hour
  template:
    spec:
      containers:
      - name: pi
        image: perl:5.34
        command: ["perl"]
        args: ["-Mbignum=bpi",
               "-wle",
               "print bpi(2000)"]
      restartPolicy: Never  # Don't restart after completion
```

### Job Patterns

```bash
Pattern: Single pod, single completion
┌──────────┐
│   Job    │
│          │
│ ┌──────┐ │
│ │ Pod1 │ │ → Success → Cleanup
│ └──────┘ │
└──────────┘

Pattern: Multiple pods, all must complete
┌──────────────────┐
│   Job            │
│  completions: 3  │
│                  │
│ ┌──────┬──────┬──────┐
│ │ Pod1 │ Pod2 │ Pod3 │
│ └──────┴──────┴──────┘
│   All succeed → Cleanup
└──────────────────┘

Pattern: Parallel work processing
┌──────────────────┐
│   Job            │
│ completions: 10  │
│ parallelism: 3   │
│                  │
│ ┌──────┬──────┬──────┐  Wave 1
│ │ Pod1 │ Pod2 │ Pod3 │
│ └──────┴──────┴──────┘
│          ↓ (complete)
│ ┌──────┬──────┬──────┐  Wave 2
│ │ Pod4 │ Pod5 │ Pod6 │
│ └──────┴──────┴──────┘
│          ... continues
└──────────────────┘
```

### Job for Parallel Processing

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: data-processor
spec:
  completions: 10        # Must process 10 items
  parallelism: 3         # Process 3 items in parallel
  backoffLimit: 4
  template:
    spec:
      containers:
      - name: worker
        image: worker:1.0
        env:
        - name: ITEM_ID
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
      restartPolicy: OnFailure
```

### kubectl Commands

```bash
# Create Job
kubectl -n <namespace> apply -f job.yaml

# View Jobs
kubectl -n <namespace> get jobs

# Detailed information
kubectl -n <namespace> describe job pi-calculation

# View Job pods
kubectl -n <namespace> get pods -l job-name=pi-calculation

# View Job logs
kubectl -n <namespace> logs -l job-name=pi-calculation

# Delete Job
kubectl -n <namespace> delete job pi-calculation

# Delete Job but keep pods (for inspection)
kubectl -n <namespace> delete job pi-calculation --cascade=orphan
```

## 7. CronJob

### Purpose

A **CronJob** creates Jobs on a schedule (cron-like). Used for periodic tasks like backups, cleanup, and reports.

### CronJob Schedule Format

```
┌───────────── minute (0-59)
│ ┌───────────── hour (0-23)
│ │ ┌───────────── day of month (1-31)
│ │ │ ┌───────────── month (1-12)
│ │ │ │ ┌───────────── day of week (0-6)
│ │ │ │ │
│ │ │ │ │
* * * * *
│ │ │ │ └─ Sunday (0) or Monday-Saturday (1-6)
│ │ │ └─── January (1) to December (12)
│ │ └───── 1st to 31st day of month
│ └─────── 0 to 23 hours
└───────── 0 to 59 minutes

Examples:
*/5 * * * *       → Every 5 minutes
0 * * * *         → Every hour at minute 0
0 0 * * *         → Every day at midnight
0 0 1 * *         → First day of each month
0 9 * * 1-5       → Weekdays at 9 AM (Mon-Fri)
*/30 * * * *      → Every 30 minutes
```

### CronJob Manifest

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: database-backup
spec:
  schedule: "0 2 * * *"  # Every day at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: backup-tool:1.0
            command:
            - /bin/sh
            - -c
            - |
              mysqldump --all-databases \
                > backup-$(date +%Y%m%d-%H%M%S).sql && \
              aws s3 cp backup-*.sql s3://backup-bucket/
            env:
            - name: DB_HOST
              value: mysql.default.svc.cluster.local
          restartPolicy: OnFailure
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 3
  concurrencyPolicy: Forbid
```

### CronJob Parameters

| Parameter                  | Purpose                                  |
|----------------------------|------------------------------------------|
| schedule                   | Cron schedule expression                 |
| jobTemplate                | Template for Jobs to create              |
| successfulJobsHistoryLimit | Keep last N successful jobs (default: 3) |
| failedJobsHistoryLimit     | Keep last N failed jobs (default: 3)     |
| concurrencyPolicy          | Allow/forbid concurrent job runs         |
| suspend                    | Temporarily disable cron (true/false)    |

### Concurrency Policy

```yaml
concurrencyPolicy: Allow        # Multiple jobs can run simultaneously
concurrencyPolicy: Forbid       # Skip if previous job hasn't finished
concurrencyPolicy: Replace      # Cancel previous job and start new one
```

### CronJob Examples

```yaml
# Hourly cleanup
apiVersion: batch/v1
kind: CronJob
metadata:
  name: cleanup-old-logs
spec:
  schedule: "0 * * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: cleanup
            image: alpine:3.15
            command:
            - /bin/sh
            - -c
            - find /logs -type f -mtime +7 -delete
            volumeMounts:
            - name: logs
              mountPath: /logs
          volumes:
          - name: logs
            hostPath:
              path: /var/log/app
          restartPolicy: OnFailure

---

# Daily report generation
apiVersion: batch/v1
kind: CronJob
metadata:
  name: generate-daily-report
spec:
  schedule: "0 6 * * *"  # 6 AM every day
  jobTemplate:
    spec:
      template:
        spec:
          serviceAccountName: report-generator
          containers:
          - name: reporter
            image: report-generator:1.0
            args:
            - --date
            - $(date +%Y-%m-%d)
          restartPolicy: OnFailure
```

### kubectl Commands

```bash
# Create CronJob
kubectl -n <namespace> apply -f backup-cronjob.yaml

# View CronJobs
kubectl -n <namespace> get cronjobs

# Detailed information
kubectl -n <namespace> describe cronjob database-backup

# View Jobs created by CronJob
kubectl -n <namespace> get jobs -l cronjob=database-backup

# Suspend CronJob (stop running)
kubectl -n <namespace> patch cronjob database-backup \
  -p '{"spec" : {"suspend" : true }}'

# Resume CronJob
kubectl -n <namespace> patch cronjob database-backup \
  -p '{"spec" : {"suspend" : false }}'
```

## Workload Controller Comparison

| Feature      | Deployment     | StatefulSet        | DaemonSet           | Job               | CronJob         |
|--------------|----------------|--------------------|---------------------|-------------------|-----------------|
| Pod Identity | Random         | Stable (ordered)   | N/A                 | Random            | N/A             |
| Persistence  | Ephemeral      | Per-pod storage    | N/A                 | Ephemeral         | Ephemeral       |
| Replicas     | Specified      | Specified          | Per-node            | Multiple or one   | Multiple        |
| Order        | Parallel       | Sequential         | Any order           | Parallel          | Sequential      |
| Restart      | Always         | Always             | Always              | Never (OnFailure) | Per schedule    |
| Use Case     | Web apps, APIs | Databases, brokers | Logging, monitoring | Batch wor         | Scheduled tasks |

## Summary

Workload controllers are the foundation of Kubernetes application deployment:

* **ReplicaSet** - Low-level controller (use Deployments instead)
* **Deployment** - Most common for stateless applications
* **StatefulSet** - For stateful applications requiring stable identity
* **DaemonSet** - For cluster-wide services on every node
* **Job** - For batch work with completion guarantees
* **CronJob** - For scheduled periodic tasks

**Key Takeaways:**

* Deployments are the go-to for stateless workloads
* StatefulSets provide stable identity and persistent storage
* DaemonSets ensure cluster-wide coverage
* Jobs and CronJobs handle batch and scheduled work
* All use labels and selectors for pod identification
* Rolling updates minimize downtime

---

**Key Takeaways:**

* Use Deployments for most applications
* Use StatefulSets for databases and stateful services
* Use DaemonSets for cluster-wide services
* Use Jobs for batch processing and CronJobs for scheduling
* Understanding controller patterns is essential for Kubernetes operation
