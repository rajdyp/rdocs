---
title: Pods
linkTitle: Pods
type: docs
weight: 6
prev: /kubernetes/05-networking
next: /kubernetes/07-pod-lifecycle
---

## What is a Pod?

A **Pod** is the smallest and most basic deployable unit in Kubernetes. It represents a single instance of a running process in your cluster.

### Key Characteristics

* **Atomic unit**: Cannot split containers within a pod across nodes
* **Shared environment**: Containers in a pod share network, storage, and lifecycle
* **Ephemeral**: Pods are disposable and replaceable
* **Single IP**: One IP address per pod (shared by all containers)

```
┌─────────────────── Pod ──────────────────┐
│  IP: 10.244.1.5                          │
│  Hostname: my-pod                        │
│                                          │
│  ┌──────────────┐    ┌──────────────┐    │
│  │ Container 1  │    │ Container 2  │    │
│  │   (nginx)    │    │  (sidecar)   │    │
│  │ Port: 80     │    │ Port: 9090   │    │
│  └──────────────┘    └──────────────┘    │
│                                          │
│  Shared:                                 │
│  • Network namespace (localhost comm)    │
│  • IPC namespace                         │
│  • Volumes                               │
│  • Process namespace (optional)          │
└──────────────────────────────────────────┘
```

## Pod Shared Resources

### 1. Network Namespace

All containers in a pod share the same network namespace:

```
Pod (10.244.1.5)
┌───────────────────────────────────┐
│  Container A          Container B │
│  nginx:80             metrics:9090│
│      │                     │      │
│      │   localhost         │      │
│      └─────────────────────┘      │
│                                   │
│  Same IP: 10.244.1.5              │
│  Different ports                  │
└───────────────────────────────────┘

Container A → localhost:9090 → Container B
```

**Implications:**

* Containers use **localhost** to communicate
* Must use different **ports** (no port conflicts)
* One IP address for the entire pod

### 2. Storage (Volumes)

Containers can share volumes:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: shared-volume-pod
spec:
  containers:
  - name: writer
    image: busybox
    command: ["/bin/sh"]
    args: ["-c", "echo hello > /data/message.txt; sleep 3600"]
    volumeMounts:
    - name: shared-data
      mountPath: /data
  
  - name: reader
    image: busybox
    command: ["/bin/sh"]
    args: ["-c", "cat /data/message.txt; sleep 3600"]
    volumeMounts:
    - name: shared-data
      mountPath: /data
  
  volumes:
  - name: shared-data
    emptyDir: {}
```

## Single-Container vs Multi-Container Pods

### Single-Container Pod (Most Common)

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: simple-pod
spec:
  containers:
  - name: nginx
    image: nginx:1.21
    ports:
    - containerPort: 80
```

**Use when**: Running a single application

### Multi-Container Patterns

**The Sidecar Pattern** is the foundational multi-container design pattern where auxiliary containers run alongside the primary container to enhance its functionality. **Ambassador** and **Adapter** are specialized implementations of the Sidecar pattern, each serving distinct purposes.

#### Pattern Hierarchy

```
Sidecar Pattern (General)
├── Ambassador Pattern → Proxying connections (networking focus)
├── Adapter Pattern → Transforming outputs/interfaces (standardization focus)
└── General Sidecar → Log collection, monitoring, config reload, etc.
```

**All share the same characteristics:**
- Run in the same pod as the main application
- Share network namespace, volumes, and lifecycle
- Enhance or extend the primary container's capabilities

**They differ in their specific purpose:**
- **Sidecar (General)**: Any auxiliary functionality (logging, monitoring, config)
- **Ambassador**: Specifically for proxying/networking
- **Adapter**: Specifically for transforming/standardizing output

#### 1. Sidecar Pattern (General)

**Purpose**: Enhance primary container with auxiliary functionality.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-with-logging
spec:
  containers:
  # Main application
  - name: web-app
    image: nginx
    volumeMounts:
    - name: logs
      mountPath: /var/log/nginx
  
  # Sidecar: log collector
  - name: log-collector
    image: fluentd
    volumeMounts:
    - name: logs
      mountPath: /var/log/nginx
  
  volumes:
  - name: logs
    emptyDir: {}
```

**Common uses**:

* Log aggregation (Fluentd, Filebeat)
* Configuration reloaders
* Monitoring agents

#### 2. Ambassador Pattern (Sidecar Sub-type)

**Purpose**: Proxy connections to/from main container

**Relationship to Sidecar**: Ambassador is a specialized sidecar focused on networking - it proxies, routes, or manages connections between the main container and external services.

```
┌─────────────── Pod ──────────────┐
│                                  │
│  ┌──────────┐    ┌────────────┐  │
│  │   App    │───▶│ Ambassador │──┼──▶ External DB
│  │          │    │  (proxy)   │  │    (complex routing)
│  └──────────┘    └────────────┘  │
│       │                          │
│       └─ Connects to localhost   │
└──────────────────────────────────┘
```

**Common Use Cases:**

* **Database Connection Pooling & Proxy**

```yaml
# App connects to localhost:5432
# Ambassador (pgbouncer) manages connection pool to real DB
containers:
- name: app
 image: myapp
 env:
 - name: DB_HOST
   value: "localhost"  # Connects to ambassador

- name: pgbouncer
 image: pgbouncer
 # Manages connections to actual DB cluster
```

**Why?** Simplifies app code, handles connection pooling, failover

* **Service Mesh Proxy (Envoy/Istio)**

```
App → Envoy Sidecar → External Service

Envoy provides:
 • Automatic retries
 • Circuit breaking
 • Load balancing
 • TLS termination
 • Metrics collection
```

* **Cloud Service Proxy**

```yaml
# App connects to localhost:4000
# Ambassador proxies to cloud-specific services
containers:
- name: app
image: myapp

- name: cloud-sql-proxy
image: gcr.io/cloudsql-docker/gce-proxy
# Proxies to Google Cloud SQL with IAM auth
```

**Why?** App doesn't need cloud SDK, credentials handled by proxy

#### 3. Adapter Pattern (Sidecar Sub-type)

**Purpose**: Standardize output/interface

**Relationship to Sidecar**: Adapter is a specialized sidecar focused on transformation - it converts the main container's output or interface into a format expected by downstream systems.

```
┌─────────────── Pod ──────────────┐
│                                  │
│  ┌──────────┐    ┌────────────┐  │
│  │   App    │───▶│  Adapter   │──┼──▶ Metrics format
│  │(custom   │    │(normalizes)│  │    (Prometheus)
│  │ metrics) │    └────────────┘  │
│  └──────────┘                    │
└──────────────────────────────────┘
```

**Common Use Cases:**

* **Metrics Format Conversion**

```yaml
# Legacy app outputs custom metrics format
# Adapter converts to Prometheus format
containers:
- name: legacy-app
  image: old-monitoring-app
  # Outputs metrics in proprietary format

- name: prometheus-adapter
  image: metrics-converter
  # Reads custom format, exposes Prometheus /metrics endpoint
```

**Why?** App doesn't need changes, monitoring systems get standard format

* **Log Standardization**

```yaml
# App writes logs in custom format
# Adapter normalizes to JSON for centralized logging
containers:
- name: app
  image: custom-app
  # Writes logs: "[TIMESTAMP] LEVEL: message"

- name: log-adapter
  image: log-normalizer
  # Converts to: {"time": "...", "level": "...", "msg": "..."}
```

**Why?** Centralized logging systems (ELK, Splunk) expect standard formats

## Init Containers

**Init containers** are specialized containers that run before application containers and must complete successfully.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: init-demo
spec:
  initContainers:
  # Runs first
  - name: init-db-check
    image: busybox
    command: ['sh', '-c', 'until nslookup db-service; do sleep 2; done']
  
  # Runs second
  - name: init-permissions
    image: busybox
    command: ['sh', '-c', 'mkdir -p /data && chmod 777 /data']
    volumeMounts:
    - name: data
      mountPath: /data
  
  # Only runs after init containers succeed
  containers:
  - name: app
    image: myapp
    volumeMounts:
    - name: data
      mountPath: /data
  
  volumes:
  - name: data
    emptyDir: {}
```

**Flow:**

```
Init Container 1 → Init Container 2 → ... → App Containers
     (serial execution)                   (parallel execution)
```

**Use cases:**

* Wait for dependencies
* Pre-populate data
* Set up configuration
* Register with external services

## Sidecar Containers (Native Support in 1.28+)

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: sidecar-example
spec:
  initContainers:
  - name: setup
    image: busybox
    command: ['sh', '-c', 'echo Setup complete']
  
  - name: log-aggregator
    image: fluentd
    restartPolicy: Always  # ← Makes it a sidecar
  
  containers:
  - name: app
    image: nginx
```

**Sidecar Container:**

* Sidecars are secondary containers that run **alongside** app containers
* Sidecars have `restartPolicy: Always`
* Starts before app containers, continues running

## Pod Manifest Structure

```yaml
apiVersion: v1          # API version
kind: Pod               # Resource type
metadata:               # Resource metadata
  name: my-pod          # Required
  namespace: default
  labels:
    app: web
    tier: frontend
  annotations:
    description: "Web server pod"

spec:                   # Desired state
  containers:           # Required
  - name: nginx         # Container name
    image: nginx:1.21   # Image to run
    ports:
    - containerPort: 80
    env:
    - name: ENV_VAR
      value: "value"
    resources:
      requests:
        memory: "64Mi"
        cpu: "250m"
      limits:
        memory: "128Mi"
        cpu: "500m"
    volumeMounts:
    - name: data
      mountPath: /data
  
  volumes:
  - name: data
    emptyDir: {}
  
  restartPolicy: Always  # Always, OnFailure, Never
  nodeSelector:
    disktype: ssd
```

## Real-World Example: Production Web Service with Service Mesh

**Consider a pod running:**

* Nginx (web server)
* Fluentd (logging agent)
* Istio Sidecar (proxies all traffic to/from the pod)

**Shared Resources:**

* All three containers share the same IP address and can communicate via localhost
* Each container must use a different port (e.g., Nginx:80, Fluentd:24224, Istio:15001)
* Nginx logs are written to a shared volume (emptyDir) so Fluentd can process them
* Istio Sidecar observes and controls all network traffic through the shared network namespace

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: production-web-service
  labels:
    app: web
    version: v1
spec:
  containers:
  # Main application
  - name: nginx
    image: nginx:latest
    ports:
    - containerPort: 80
      name: http
    volumeMounts:
    - name: logs
      mountPath: /var/log/nginx

  # Sidecar: Log collection
  - name: fluentd
    image: fluent/fluentd:latest
    ports:
    - containerPort: 24224
      name: fluentd
    volumeMounts:
    - name: logs
      mountPath: /var/log/nginx
      readOnly: true

  # Sidecar: Service mesh proxy
  - name: istio-proxy
    image: istio/proxyv2:latest
    ports:
    - containerPort: 15001
      name: envoy-admin
    env:
    - name: POD_NAME
      valueFrom:
        fieldRef:
          fieldPath: metadata.name
    - name: POD_NAMESPACE
      valueFrom:
        fieldRef:
          fieldPath: metadata.namespace

  volumes:
  - name: logs
    emptyDir: {}
```

**How they work together:**

* External traffic → Istio Proxy (intercepts) → Nginx (processes) → Istio Proxy (egress)
* Nginx writes logs → Shared volume → Fluentd reads and ships logs
* All containers communicate via localhost
* Istio provides traffic management, security, and observability without changing Nginx code

## Pod Networking

Pod networking is implemented by CNI plugins.

```
Pod A (10.244.1.5)                Pod B (10.244.2.8)
┌──────────────────┐              ┌──────────────────┐
│ Container 1      │              │ Container 1      │
│ localhost:80     │              │ localhost:80     │
│        │         │              │        │         │
│        ▼         │              │        ▼         │
│  eth0            │──────────────│  eth0            │
│  10.244.1.5      │  Direct IP   │  10.244.2.8      │
└──────────────────┘  No NAT      └──────────────────┘
```

CNI plugin creates a unified Pod network across different nodes, even when those nodes are in different underlying networks (Underlay A and Underlay B).

## Commands

```bash
# Create pod
kubectl apply -f pod.yaml
kubectl run nginx --image=nginx

# Get pods
kubectl get pods
kubectl get pods -o wide  # Show IPs and nodes
kubectl get pods --watch  # Watch for changes

# Describe pod
kubectl describe pod my-pod

# Logs
kubectl logs my-pod
kubectl logs my-pod -c container-name  # Multi-container
kubectl logs -f my-pod  # Follow logs

# Execute commands
kubectl exec my-pod -- ls /
kubectl exec -it my-pod -- /bin/bash
kubectl exec my-pod -c container-name -- command  # Multi-container

# Delete
kubectl delete pod my-pod
kubectl delete -f pod.yaml
```

## Summary

**Pods are:**

* The smallest deployable unit in Kubernetes
* A wrapper around one or more containers
* Ephemeral and disposable
* Share network, storage, and lifecycle

**Use single-container pods** for simple applications

**Use multi-container pods** when containers must:

* Share data
* Communicate frequently
* Scale together
* Be co-located

**Key patterns:**

* **Sidecar** (foundational pattern): Enhance main container with auxiliary functionality
  * **Ambassador** (sub-type): Proxy connections and manage networking
  * **Adapter** (sub-type): Normalize/transform interfaces and outputs
* **Init containers**: Pre-flight tasks (run before app containers)

---

**Key Takeaways:**

* Pods are ephemeral—treat them as disposable
* Containers in a pod share network namespace (use localhost)
* One IP per pod, shared by all containers
* Multi-container pods for tightly coupled components only
* Init containers run before app containers
