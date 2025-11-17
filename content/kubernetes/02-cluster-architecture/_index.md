---
title: Architecture
linkTitle: Architecture
type: docs
weight: 2
prev: /kubernetes/01-introduction
next: /kubernetes/03-control-plane
---

## Overview

A Kubernetes cluster consists of two main parts:

* **Control Plane** (Master Nodes) - The "brain" that manages the cluster
* **Worker Nodes** (Data Plane) - The "muscle" that runs application workloads

```
┌──────────────────────────────────────────────────────────────────┐
│                     Kubernetes Cluster                           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    Control Plane                           │  │
│  │              (Cluster Management Layer)                    │  │
│  │                                                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │  │
│  │  │ API Server   │  │  Scheduler   │  │ Controller   │      │  │
│  │  │              │  │              │  │  Manager     │      │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │  │
│  │                                                            │  │
│  │  ┌──────────────┐  ┌──────────────────────────────────┐    │  │
│  │  │     etcd     │  │   cloud-controller-manager       │    │  │
│  │  │ (datastore)  │  │      (optional)                  │    │  │
│  │  └──────────────┘  └──────────────────────────────────┘    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              │ API calls                         │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                     Worker Nodes                           │  │
│  │              (Application Workload Layer)                  │  │
│  │                                                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │  │
│  │  │  Worker-1    │  │  Worker-2    │  │  Worker-N    │      │  │
│  │  │              │  │              │  │              │      │  │
│  │  │  ┌────────┐  │  │  ┌────────┐  │  │  ┌────────┐  │      │  │
│  │  │  │ kubelet│  │  │  │ kubelet│  │  │  │ kubelet│  │      │  │
│  │  │  └────────┘  │  │  └────────┘  │  │  └────────┘  │      │  │
│  │  │  ┌────────┐  │  │  ┌────────┐  │  │  ┌────────┐  │      │  │
│  │  │  │kube-   │  │  │  │kube-   │  │  │  │kube-   │  │      │  │
│  │  │  │proxy   │  │  │  │proxy   │  │  │  │proxy   │  │      │  │
│  │  │  └────────┘  │  │  └────────┘  │  │  └────────┘  │      │  │
│  │  │  ┌────────┐  │  │  ┌────────┐  │  │  ┌────────┐  │      │  │
│  │  │  │Container  │  │  │Container  │  │  │Container  │      │  │
│  │  │  │Runtime │  │  │  │Runtime │  │  │  │Runtime │  │      │  │
│  │  │  └────────┘  │  │  └────────┘  │  │  └────────┘  │      │  │
│  │  │              │  │              │  │              │      │  │
│  │  │  ┌────────┐  │  │  ┌────────┐  │  │  ┌────────┐  │      │  │
│  │  │  │  Pods  │  │  │  │  Pods  │  │  │  │  Pods  │  │      │  │
│  │  │  └────────┘  │  │  └────────┘  │  │  └────────┘  │      │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Control Plane vs Data Plane

### Control Plane (Master Nodes)

**Purpose**: Makes all decisions about the cluster, including scheduling, detecting and responding to cluster events.

**Key Responsibilities:**

* Maintain cluster state
* Schedule workloads
* Detect and respond to cluster events
* Expose the Kubernetes API
* Store cluster data

**Components:**

* `kube-api-server` - Front-end for the control plane
* `kube-scheduler` - Assigns pods to nodes
* `kube-controller-manager` - Runs controller processes
* `etcd` - Distributed key-value store
* `cloud-controller-manager` - Cloud provider integration (optional)

**Production Considerations:**

* Typically runs on dedicated nodes
* Should have 3 or more replicas for high availability
* Does not run user workloads
* Isolated from worker node failures

### Data Plane (Worker Nodes)

**Purpose**: Run application workloads (containers) and provide runtime environment.

**Key Responsibilities:**

* Run pods (application containers)
* Monitor pod health
* Provide networking for pods
* Report status to control plane

**Components:**

* `kubelet` - Node agent
* `kube-proxy` - Network proxy
* `Container Runtime` - Runs containers (containerd, CRI-O)

**Production Considerations:**

* Can scale independently from control plane
* Nodes can be heterogeneous (different sizes, types)
* Workload placement controlled by scheduler
* Can drain nodes for maintenance

## Communication Patterns

### 1. Control Plane to Node

The control plane communicates with nodes through:

```
┌──────────────────┐
│   API Server     │
└────────┬─────────┘
         │ Watch API
         │ (persistent connection)
         ▼
┌──────────────────┐
│     kubelet      │ (on each worker node)
└──────────────────┘
```

* **kubelet → API Server**: kubelet connects to API server (not reverse)
* **Watch mechanism**: kubelet watches for pod assignments
* **Status updates**: kubelet reports node and pod status

### 2. Node to Control Plane

Nodes communicate status back to control plane:

```
Worker Node                    Control Plane
┌──────────────────┐          ┌──────────────────┐
│     kubelet      │────────▶ │   API Server     │
└──────────────────┘  Status  └──────────────────┘
                      Updates          │
                                       ▼
                                ┌──────────────┐
                                │     etcd     │
                                └──────────────┘
```

* Heartbeats (node health)
* Pod status updates
* Resource usage metrics

### 3. User to Cluster

Users interact with the cluster through the API:

```
┌──────────────────┐
│  kubectl / User  │
└────────┬─────────┘
         │ HTTP/HTTPS
         │ (authenticated & authorized)
         ▼
┌──────────────────┐
│   API Server     │
└──────────────────┘
```

* All cluster operations go through API server
* Authentication and authorization enforced
* REST API or client libraries (kubectl)

### 4. Pod to Pod

Pods communicate directly:

```
┌──────────────────┐          ┌──────────────────┐
│   Pod A          │          │   Pod B          │
│   (10.244.1.5)   │─────────▶│   (10.244.2.8)   │
└──────────────────┘          └──────────────────┘
         │                             ▲
         │ CNI handles routing         │
         └─────────────────────────────┘
```

* Direct IP connectivity (no NAT)
* CNI plugin handles routing
* Flat network across cluster

## Namespaces: Virtual Cluster Isolation

### What are Namespaces?

Namespaces provide a mechanism for isolating groups of resources within a single cluster. They are virtual clusters backed by the same physical cluster, enabling multiple teams, projects, or environments to share cluster resources while maintaining logical separation.

```
┌────────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                          │
│                                                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │  Namespace: dev │  │ Namespace: prod │  │ Namespace: qa  │  │
│  │                 │  │                 │  │                │  │
│  │  ┌───┐  ┌───┐   │  │  ┌───┐  ┌───┐   │  │  ┌───┐  ┌───┐  │  │
│  │  │Pod│  │Pod│   │  │  │Pod│  │Pod│   │  │  │Pod│  │Pod│  │  │
│  │  └───┘  └───┘   │  │  └───┘  └───┘   │  │  └───┘  └───┘  │  │
│  │  ┌────────┐     │  │  ┌────────┐     │  │  ┌────────┐    │  │
│  │  │Service │     │  │  │Service │     │  │  │Service │    │  │
│  │  └────────┘     │  │  └────────┘     │  │  └────────┘    │  │
│  └─────────────────┘  └─────────────────┘  └────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Why Use Namespaces?

**1. Multi-tenancy**

* Isolate resources for different teams or projects
* Prevent accidental interference between teams
* Separate dev, staging, and production environments

**2. Resource Organization**

* Logical grouping of related resources
* Easier resource management and discovery
* Clear ownership boundaries

**3. Resource Quotas and Limits**

* Set resource consumption limits per namespace
* Prevent resource exhaustion by a single team
* Fair resource allocation across teams

**4. Access Control**

* Apply RBAC policies at namespace level
* Restrict what users can see and modify
* Granular permissions per namespace

**5. Policy Enforcement**

* Apply network policies per namespace
* Namespace-specific pod security standards
* Environment-specific configurations

### Built-in Namespaces

Kubernetes creates several namespaces by default:

```bash
kubectl get namespaces
```

| Namespace       | Purpose                                                       | Typical Resources                                |
|-----------------|---------------------------------------------------------------|--------------------------------------------------|
| default         | Default namespace for resources without a specified namespace | User workloads created without `-n` flag         |
| kube-system     | Kubernetes system components                                  | CoreDNS, kube-proxy, CNI plugins, metrics-server |
| kube-public     | Publicly readable resources (even by unauthenticated users)   | Cluster information, public ConfigMaps           |
| kube-node-lease | Node heartbeat objects for performance                        | Lease objects for node health                    |

**Best Practice:** Avoid using `default` namespace for production workloads. Create dedicated namespaces instead.

### Namespace-Scoped vs Cluster-Scoped Resources

#### Namespace-Scoped Resources

These resources exist within a namespace:

* Pods
* Services
* Deployments, ReplicaSets, StatefulSets, DaemonSets
* ConfigMaps and Secrets
* ServiceAccounts
* Roles and RoleBindings
* PersistentVolumeClaims
* Ingress resources

```bash
# List namespace-scoped resources
kubectl api-resources --namespaced=true
```

#### Cluster-Scoped Resources

These resources exist at cluster level (not in any namespace):

* Nodes
* PersistentVolumes
* StorageClasses
* ClusterRoles and ClusterRoleBindings
* Namespaces themselves
* CustomResourceDefinitions (CRDs)

```bash
# List cluster-scoped resources
kubectl api-resources --namespaced=false
```

### Working with Namespaces

#### Creating Namespaces

**Imperative:**

```bash
# Create namespace
kubectl create namespace development
```

**Declarative:**

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: development
  labels:
    environment: dev
    team: backend
```

#### Setting Default Namespace

**Using kubectl context:**

```bash
# Set default namespace for current context
kubectl config set-context --current --namespace=development

# Verify current namespace
kubectl config view --minify | grep namespace:

# Now all commands use 'development' by default
kubectl get pods  # Lists pods in 'development'
```

### Resource Quotas

Limit resource consumption within a namespace:

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: development
spec:
  hard:
    # Compute resources
    requests.cpu: "10"
    requests.memory: 20Gi
    limits.cpu: "20"
    limits.memory: 40Gi

    # Object counts
    pods: "50"
    services: "10"
    configmaps: "20"
    persistentvolumeclaims: "10"
    secrets: "20"
```

**Check quota usage:**

```bash
kubectl get resourcequota -n development
kubectl describe resourcequota compute-quota -n development
```

### LimitRange

Set default resource limits for containers in a namespace:

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: resource-limits
  namespace: development
spec:
  limits:
  # Container limits
  - type: Container
    default:  # Default limits
      cpu: 500m
      memory: 512Mi
    defaultRequest:  # Default requests
      cpu: 100m
      memory: 128Mi
    max:  # Maximum allowed
      cpu: 2
      memory: 2Gi
    min:  # Minimum required
      cpu: 50m
      memory: 64Mi

  # Pod limits
  - type: Pod
    max:
      cpu: 4
      memory: 4Gi
```

**Check limit range:**

```bash
kubectl describe limitrange resource-limits -n development
```

### Cross-Namespace Service Access

Services can be accessed across namespaces using DNS:

```
<service-name>.<namespace>.svc.cluster.local
```

**Example:**

```yaml
# Service in 'database' namespace
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: database
spec:
  ports:
  - port: 5432
  selector:
    app: postgres
```

**Access from 'app' namespace:**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
  namespace: app
spec:
  containers:
  - name: app
    image: myapp
    env:
    - name: DB_HOST
      # Full DNS name including namespace
      value: "postgres.database.svc.cluster.local"
    - name: DB_PORT
      value: "5432"
```

**DNS resolution patterns:**

* Within same namespace: `service-name`
* Cross-namespace: `service-name.namespace-name`
* Fully qualified: `service-name.namespace-name.svc.cluster.local`

### Namespace Lifecycle

#### Viewing Namespace Status

```bash
# List all namespaces
kubectl get namespaces

# Detailed namespace info
kubectl describe namespace development

# View namespace as YAML
kubectl get namespace development -o yaml
```

#### Deleting Namespaces

```bash
# Delete namespace (WARNING: deletes ALL resources in it)
kubectl delete namespace development
```

**What happens during namespace deletion:**

* Namespace status changes to `Terminating`
* Admission controllers prevent new resource creation
* Kubernetes deletes all resources in the namespace
* Finalizers are processed
* Namespace is removed once all resources are deleted

**Grace period issues:**

If deletion hangs, check for:

* Resources with finalizers
* API services that are unavailable
* Custom resources without proper cleanup

**Force delete (use with caution):**

```bash
kubectl delete namespace development --force --grace-period=0
```

### Namespace Limitations

**What namespaces DON'T provide:**

* **Not security boundaries:** Network policies required for true isolation
* **Not separate clusters:** Resources share nodes and network
* **No performance isolation:** QoS and resource quotas needed
* **No separate upgrades:** Cluster upgrades affect all namespaces
* **Not for different Kubernetes versions:** Use separate clusters

**When to use separate clusters instead:**

* Strict security requirements
* Different Kubernetes versions needed
* Complete infrastructure isolation
* Regulatory compliance requirements
* Different cloud providers or regions

### Troubleshooting Namespace Issues

```bash
# Check if namespace exists
kubectl get namespace myapp

# See all resources in namespace
kubectl api-resources --verbs=list --namespaced -o name | \
  xargs -n 1 kubectl get --show-kind --ignore-not-found -n myapp

# Check namespace events
kubectl get events -n myapp --sort-by='.lastTimestamp'

# Identify stuck namespace
kubectl get namespace myapp -o json | jq '.status'

# Remove finalizers from stuck namespace (emergency only)
kubectl get namespace myapp -o json | \
  jq '.spec.finalizers = []' | \
  kubectl replace --raw "/api/v1/namespaces/myapp/finalize" -f -
```

## Cluster Components Overview

### Control Plane Components

| Component                | Purpose                                       | Failure Impact                                        |
|--------------------------|-----------------------------------------------|-------------------------------------------------------|
| kube-api-server          | API front-end, handles all cluster operations | No new changes possible, but workloads keep running   |
| kube-scheduler           | Assigns pods to nodes                         | New pods not scheduled                                |
| kube-controller-manager  | Runs reconciliation loops                     | No self-healing, no automatic recovery                |
| etcd                     | Stores all cluster data                       | Quorum loss = read-only; total loss = cluster rebuild |
| cloud-controller-manager | Cloud provider integration                    | Cloud-specific features unavailable                   |

### Worker Node Components

| Component         | Purpose                  | Failure Impact                      |
|-------------------|--------------------------|-------------------------------------|
| kubelet           | Manages pods on the node | Pods on that node not managed       |
| kube-proxy        | Maintains network rules  | Service routing broken on that node |
| Container Runtime | Runs containers          | Containers cannot start             |

### Add-on Components

| Component          | Purpose                   | Required?             |
|--------------------|---------------------------|-----------------------|
| CoreDNS            | Service discovery via DNS | Highly recommended    |
| CNI Plugin         | Pod networking            | Required              |
| Metrics Server     | Resource metrics          | For HPA/VPA           |
| Dashboard          | Web UI                    | Optional              |
| Ingress Controller | HTTP/HTTPS routing        | For ingress resources |

## Cluster Setup Patterns

### Single-Node Cluster (Development)

```
┌─────────────────────────────────┐
│        Single Node              │
│                                 │
│  ┌───────────────────────────┐  │
│  │  Control Plane Components │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │  Worker Node Components   │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │    Application Pods       │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘

Examples: minikube, kind, k3s
```

### Multi-Node Cluster (Production)

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Master Node 1   │  │  Master Node 2   │  │  Master Node 3   │
│  (Control Plane) │  │  (Control Plane) │  │  (Control Plane) │
└──────────────────┘  └──────────────────┘  └──────────────────┘
         │                     │                     │
         └─────────────────────┴─────────────────────┘
                               │
                               │ API
                               │
         ┌─────────────────────┴─────────────────────┐
         │                                           │
┌────────▼────────┐  ┌──────────────────┐  ┌─────────▼───────┐
│   Worker Node 1 │  │   Worker Node 2  │  │   Worker Node N │
│   (Pods)        │  │   (Pods)         │  │   (Pods)        │
└─────────────────┘  └──────────────────┘  └─────────────────┘

- HA control plane (3+ masters)
- Multiple worker nodes
- etcd can be stacked or external
```

### Stacked vs External `etcd`

**Stacked `etcd` (Common)**

```
┌────────────────────────┐
│     Master Node        │
│                        │
│  ┌──────────────────┐  │
│  │  API Server      │  │
│  │  Scheduler       │  │
│  │  Controller Mgr  │  │
│  └──────────────────┘  │
│  ┌──────────────────┐  │
│  │      etcd        │  │ ← Runs on same nodes
│  └──────────────────┘  │
└────────────────────────┘
```

**External `etcd` (Better HA)**

```
┌────────────────────┐      ┌────────────────────┐
│   Master Node      │      │   etcd Cluster     │
│                    │      │                    │
│  ┌──────────────┐  │      │  ┌──────────────┐  │
│  │ API Server   │  │─────▶│  │    etcd      │  │
│  │ Scheduler    │  │      │  │  (dedicated) │  │
│  │ Controllers  │  │      │  └──────────────┘  │
│  └──────────────┘  │      └────────────────────┘
└────────────────────┘

- Dedicated etcd cluster
- Better isolation and resilience
- More complex to manage
```

## How Components Work Together

### Example: Creating a Deployment

```
1. User submits deployment manifest
         │
         ▼
2. kubectl sends to API Server
         │
         ▼
3. API Server validates & stores in etcd
         │
         ▼
4. Deployment Controller notices new deployment
         │
         ▼
5. Creates ReplicaSet
         │
         ▼
6. ReplicaSet Controller creates Pods
         │
         ▼
7. Scheduler assigns Pods to Nodes
         │
         ▼
8. kubelet on each node starts containers
         │
         ▼
9. Status flows back up to API Server
         │
         ▼
10. etcd stores current state
```

## High Availability Considerations

### Control Plane HA

**Why?**

* Single point of failure elimination
* Continuous operations during maintenance
* Resilience to component failures

**How?**

* Run 3 or 5 control plane nodes (odd number for quorum)
* Load balancer in front of API servers
* etcd cluster with 3 or 5 members

**etcd Quorum:**

* 3 nodes: Can tolerate 1 failure
* 5 nodes: Can tolerate 2 failures
* Formula: (N/2) + 1 for quorum

### Worker Node HA

**Why?**

* Application availability
* Handling node failures
* Rolling updates without downtime

**How?**

* Multiple worker nodes across availability zones
* Replica count > 1 for applications
* Pod Disruption Budgets
* Node autoscaling

## Cluster Health Checks

### Checking Control Plane Health

```bash
# Check component status
kubectl get componentstatuses

# Detailed health check
kubectl get --raw='/readyz?verbose'

# Health endpoints
kubectl get --raw='/healthz'   # Overall health
kubectl get --raw='/livez'     # Liveness
kubectl get --raw='/readyz'    # Readiness
```

### Checking Node Health

```bash
# List all nodes and their status
kubectl get nodes

# Detailed node information
kubectl describe node <node-name>

# Check node conditions
kubectl get nodes -o wide
```

## Summary

A Kubernetes cluster is a distributed system with:

* **Control Plane**: Manages cluster state and makes decisions
* **Worker Nodes**: Execute workloads
* **Clear separation** between management and execution
* **API-driven** communication between all components
* **Declarative** model with continuous reconciliation

Understanding this architecture is crucial because:

* It explains how Kubernetes achieves self-healing
* It clarifies troubleshooting approaches
* It informs high availability design
* It helps optimize cluster performance

---

**Key Takeaways:**

* Control plane makes decisions; worker nodes run workloads
* All communication goes through API server
* etcd is the single source of truth
* Components watch for changes (push model, not pull)
* High availability requires redundancy at both layers
