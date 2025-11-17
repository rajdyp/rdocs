---
title: Services and Service Discovery
linkTitle: Services and Service Discovery
type: docs
weight: 9
prev: /kubernetes/08-workload-controllers
next: /kubernetes/10-ingress
---

## Overview

A **Service** is a Kubernetes abstraction that defines a logical set of pods and provides a stable endpoint to access them. Services enable loose coupling between components by abstracting the dynamic nature of pods.

```
┌─────────────────────────────────────────────────────────┐
│                     Service Layer                       │
│                                                         │
│  Service (Stable Endpoint)                              │
│      ↓                                                  │
│  ┌───────────────────────────────────────┐              │
│  │  Load Balances across Pods            │              │
│  └───────────────────────────────────────┘              │
│      ↓           ↓           ↓                          │
│  ┌────────┐  ┌────────┐  ┌────────┐                     │
│  │  Pod1  │  │  Pod2  │  │  Pod3  │                     │
│  │        │  │        │  │        │                     │
│  │ app-0  │  │ app-1  │  │ app-2  │                     │
│  └────────┘  └────────┘  └────────┘                     │
│                                                         │
│  Service abstracts dynamic pod lifecycle                │
│  Pods come and go, Service remains stable               │
└─────────────────────────────────────────────────────────┘
```

## Why Services?

### The Problem

Pods are ephemeral:

* Pods are created and destroyed dynamically
* Each pod has a unique IP address
* When a pod is replaced, its IP changes
* Direct pod IP communication is unreliable

```
Without Service:
Client needs to know pod IPs
Pod1: 10.244.1.5
Pod2: 10.244.1.6
Pod3: 10.244.1.7

If Pod1 crashes and is recreated:
New Pod1: 10.244.1.9  ← IP changed, client breaks!
```

### The Solution: Service

A Service provides:

* **Stable IP address** that persists
* **DNS name** for discovery
* **Load balancing** across pod replicas
* **Abstraction** of pod lifecycle

```
With Service:
Client uses Service IP
Service: 10.96.0.10 (stable)
  ↓
 Pods: 10.244.1.5, 10.244.1.6, 10.244.1.7
 (can change, Service doesnt care)
```

## Service Architecture

```
┌──────────────────────────────────────────────────────┐
│                  Service Request Flow                │
│                                                      │
│  Client (10.244.2.1)                                 │
│      │                                               │
│      │ DNS lookup: app-service                       │
│      ▼                                               │
│  CoreDNS → Returns Service IP: 10.96.0.10            │
│      │                                               │
│      │ Connect to 10.96.0.10:80                      │
│      ▼                                               │
│  ┌─────────────────────────────┐                     │
│  │  Service (Virtual IP)       │                     │
│  │  10.96.0.10:80              │                     │
│  │  (no real process running)  │                     │
│  └──────────┬──────────────────┘                     │
│             │ iptables/IPVS rules                    │
│             │ (kube-proxy manages)                   │
│             ▼                                        │
│  ┌────────────────────────────────────┐              │
│  │  Endpoints (Pod IP:Port list)      │              │
│  │  10.244.1.5:80  ← Pod 1            │              │
│  │  10.244.1.6:80  ← Pod 2            │              │
│  │  10.244.1.7:80  ← Pod 3            │              │
│  └────────────────────────────────────┘              │
│             ↓                                        │
│  Connection established with one Pod                 │
└──────────────────────────────────────────────────────┘
```

### How Endpoints Work: Background vs Active Traffic

**Important:** Endpoints are NOT queried during active traffic routing. They work as a background synchronization mechanism.

```
Background Synchronization (Setup Phase):
────────────────────────────────────────────

1. Service created with selector
   apiVersion: v1
   kind: Service
   metadata:
     name: app-service
   spec:
     selector:
       app: myapp  ← Matches Pods with this label

2. Endpoints Controller watches Pods
   ├─ Finds Pods matching selector
   ├─ Extracts Pod IPs and ports
   └─ Creates/updates Endpoints object

3. Endpoints object created automatically
   kubectl get endpoints app-service
   NAME          ENDPOINTS
   app-service   10.244.1.5:80,10.244.1.6:80,10.244.1.7:80

4. kube-proxy watches Endpoints object
   ├─ Receives updates when Endpoints change
   ├─ Programs iptables/IPVS rules on node
   └─ Rules map Service IP → Pod IPs

5. Routing rules ready
   Service IP: 10.96.0.10:80
   iptables rules:
     → 33% traffic to 10.244.1.5:80
     → 33% traffic to 10.244.1.6:80
     → 33% traffic to 10.244.1.7:80
```

```
Active Traffic Routing (Request Phase):
────────────────────────────────────────

Client request → Service IP (10.96.0.10:80)
                      ↓
            Kernel networking stack
                      ↓
            iptables/IPVS rules (pre-programmed)
                      ↓
            Direct routing to Pod IP (10.244.1.5:80)

✓ No Endpoints lookup
✓ No API server query
✓ No control plane involved
✓ Pure kernel-level routing (fast!)
```

**Key Distinction:**

```
❌ WRONG (would be slow):
   Request → Service → Query Endpoints API → Find Pod IP → Route

✓ CORRECT (actual behavior):
   Request → Service → iptables/IPVS rules → Route to Pod

   Endpoints updated asynchronously in background:
   Pod changes → Endpoints Controller → Update Endpoints → kube-proxy watches → Update iptables/IPVS rules
```

**Why This Design?**

| Aspect      | Benefit                                            |
|-------------|----------------------------------------------------|
| Performance | Kernel-level routing (no API calls during traffic) |
| Scalability | No control plane bottleneck for every request      |
| Reliability | Traffic continues even if API server is slow       |
| Low Latency | Nanosecond routing decisions (not milliseconds)    |

**Endpoints Lifecycle:**

```yaml
# Pod Creation Flow
Pod Created
  ↓
Endpoints Controller detects new Pod
  ↓
Endpoints object updated (add Pod IP:Port)
  ↓
kube-proxy receives Endpoints update
  ↓
kube-proxy programs new iptables/IPVS rules
  ↓
Traffic now includes new Pod
  (happens in ~1-2 seconds)

# Pod Deletion Flow
Pod Deleted
  ↓
Endpoints Controller detects Pod termination
  ↓
Endpoints object updated (remove Pod IP:Port)
  ↓
kube-proxy receives Endpoints update
  ↓
kube-proxy removes iptables/IPVS rules for that Pod
  ↓
Traffic stops going to deleted Pod
```

## Service Types

### 1. ClusterIP (Default)

A **ClusterIP** service is only accessible within the cluster.

**Use Cases:**

* Internal service-to-service communication
* Microservices within the cluster
* Backend services not exposed externally

### ClusterIP Manifest

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-api
spec:
  type: ClusterIP
  selector:
    app: backend
  ports:
  - name: http
    port: 80
    targetPort: 8080
    protocol: TCP
```

### ClusterIP Access

```bash
Inside Cluster:
  kubectl run -it --rm debug --image=alpine -- sh
  $ curl http://backend-api     # DNS name
  $ curl http://backend-api.default     # FQDN
  $ curl 10.96.0.10     # Service IP

Outside Cluster:
  ✗ Not accessible directly
  Use kubectl port-forward instead:
  $ kubectl port-forward svc/backend-api 8080:80
  $ curl localhost:8080
```

### **Traffic Flow**

```
Client (inside cluster)
  ↓
CoreDNS (resolves Service name to ClusterIP, e.g., 10.96.0.10)
  ↓
Client sends packet to ClusterIP (10.96.0.10:80)
  ↓
iptables/ipvs rules (programmed by kube-proxy based on Service & EndpointSlice)
  ↓
DNAT: ClusterIP → Pod IP (e.g., 10.244.1.5:8080)
  ↓
Pod
```

**Note:** kube-proxy watches Service & EndpointSlice objects and programs iptables/ipvs rules. It does not process data plane traffic.

### 2. NodePort

A **NodePort** service exposes the service on each node's IP at a static port.

**Use Cases:**

* External access without a load balancer
* Development and testing
* Direct node access

**Production Considerations:**

* **Port Management:** NodePort requires manual tracking of port allocations (30000-32767), increasing risk of port collisions
* **Node Ephemerality:** Nodes can be replaced or scaled, making it difficult for external clients to track which Node IP to use
* **Better Alternatives:** Production clusters prefer **LoadBalancer (L4)** or **Ingress (L7)** over NodePort for external access

### **Traffic Flow**

```
Client (external)
  ↓
Node IP:NodePort (e.g., 1.1.1.1:30080)
  ↓
iptables/ipvs rules (programmed by kube-proxy)
  ↓
DNAT: NodeIP:NodePort → Pod IP (e.g., 10.244.1.5:8080)
  ↓
Pod
```

**Note:**

* CoreDNS is not involved since external clients use Node IP directly, not Service DNS names.
* kube-proxy programs rules that map NodePort → ClusterIP → Pod IP. The actual packet flow skips the ClusterIP and goes directly to the Pod via DNAT.

### NodePort Architecture

```
┌────────────┐  ┌────────────┐  ┌────────────┐
│ Worker-1   │  │ Worker-2   │  │ Worker-3   │
│ IP: 1.1.1.1│  │ IP: 1.1.1.2│  │ IP: 1.1.1.3│
│            │  │            │  │            │
│  Port 30080│  │  Port 30080│  │  Port 30080│
│  (NodePort)│  │  (NodePort)│  │  (NodePort)│
└──────┬─────┘  └──────┬─────┘  └──────┬─────┘
       │               │               │
       └───────────────┼───────────────┘
                       │
                    Service
               (Listens on 30080)
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
      Pod1           Pod2           Pod3
     (port 8080)    (port 8080)    (port 8080)

External Access:
  1.1.1.1:30080 → Pod1:8080
  1.1.1.2:30080 → Pod2:8080
  1.1.1.3:30080 → Pod3:8080
```

### NodePort Manifest

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-app
spec:
  type: NodePort
  selector:
    app: web-app
  ports:
  - port: 80
    targetPort: 8080
    nodePort: 30080  # Optional: specify, or auto-assigned 30000-32767
```

### NodePort Access

```bash
External Client:
  curl http://worker-1-ip:30080
  curl http://worker-2-ip:30080
  curl http://worker-3-ip:30080

All three endpoints work and load balance to pods
```

### 3. LoadBalancer

A **LoadBalancer** service creates an external load balancer (cloud-specific).

**Use Cases:**

* Production external access
* Distribute traffic across nodes
* Only on cloud providers (AWS, GCP, Azure)

**Multi-Service Routing**

For routing a single Load Balancer to multiple services, use:

* **Ingress Controller:** Layer 7 (HTTP/HTTPS) routing with path-based or host-based rules
* **Service Mesh / Gateway API:** Advanced traffic management (e.g., Istio, Linkerd, Kubernetes Gateway API)

### **Traffic Flow**

```
Client (external)
  ↓
Cloud Load Balancer (AWS ELB, GCP LB, Azure LB)
  ↓
Node IP:NodePort (LB distributes across nodes)
  ↓
iptables/ipvs rules (programmed by kube-proxy)
  ↓
DNAT: NodePort → Pod IP (e.g., 10.244.1.5:8080)
  ↓
Pod
```

**Note:**

* LoadBalancer type automatically creates a NodePort, which the cloud provider's LB uses as backend targets.
* kube-proxy programs iptables/ipvs rules based on Service and EndpointSlice objects. The ClusterIP is also created but the data plane traffic flows directly from NodePort to Pod via DNAT.

### LoadBalancer Architecture

```
┌─────────────────────────────────────┐
│   Cloud Provider Load Balancer      │
│   (AWS ELB, GCP LB, Azure LB)       │
│   IP: example.elb.amazonaws.com     │
│   (externally routable)             │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┬──────────┐
        ▼             ▼          ▼
    NodePort      NodePort    NodePort
    on Node1      on Node2    on Node3
        │             │          │
        └──────┬──────┴──────────┘
               │
            Service
               │
        ┌──────┴──────┬──────────┐
        ▼             ▼          ▼
      Pod1          Pod2       Pod3

External Access:
  example.elb.amazonaws.com:80 → Any node's port → Service → Pod
```

### LoadBalancer Manifest

```yaml
apiVersion: v1
kind: Service
metadata:
  name: external-api
spec:
  type: LoadBalancer
  selector:
    app: api
  ports:
  - port: 80
    targetPort: 8080
```

### Get LoadBalancer IP

```bash
# Wait for EXTERNAL-IP to be assigned
kubectl -n <namespace> get svc external-api -w

# Once assigned:
kubectl -n <namespace> get svc external-api
NAME           TYPE           CLUSTER-IP      EXTERNAL-IP      PORT(S)
external-api   LoadBalancer   10.96.0.20      203.0.113.1      80:30123/TCP

# Access via:
curl http://203.0.113.1:80
```

### 4. Headless Service

A **Headless Service** has no ClusterIP and returns pod IPs directly (useful for StatefulSets).

**Use Cases:**

* StatefulSets needing direct pod access
* Service discovery via DNS A records
* When you need pod-to-pod direct connectivity

**Key Points:**

* No ClusterIP is allocated (`clusterIP: None`)
* DNS returns individual Pod IPs instead of a single Cluster IP
* No load balancing through kube-proxy - clients connect directly to Pods
* Enables stable network identities for stateful applications

### **Traffic Flow**

```
Client (inside cluster)
  ↓
CoreDNS (resolves Service name to list of Pod IPs)
  ↓
Pod (direct connection, bypasses kube-proxy)
```

**Note:** Unlike regular services, headless services return multiple A records (one for each Pod) instead of a single ClusterIP. Clients can choose which Pod to connect to or implement their own load balancing.

### Headless Service Manifest

```yaml
apiVersion: v1
kind: Service
metadata:
  name: mysql
spec:
  clusterIP: None  # Makes it headless
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
  serviceName: mysql  # Links to headless service
  replicas: 3
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
```

### Headless Service DNS

```
Service: mysql (headless, clusterIP: None)

DNS Records:
  mysql.default.svc.cluster.local → Returns all pod IPs
  mysql-0.mysql.default.svc.cluster.local → 10.244.1.5
  mysql-1.mysql.default.svc.cluster.local → 10.244.1.6
  mysql-2.mysql.default.svc.cluster.local → 10.244.1.7

Clients can directly access specific pods:
  mysql-0.mysql → Connect to specific pod
  mysql.mysql → Load balance across all pods
```

### 5. ExternalName

An **ExternalName** service maps a Service to an external DNS name by returning a CNAME record instead of creating a ClusterIP or proxying traffic.

**Use Cases:**

* Accessing external databases or APIs from within the cluster
* Aliasing external services with cluster-internal names
* Simplifying migration from external to internal services

**Key Points:**

* No ClusterIP is allocated
* No proxying occurs - traffic goes directly to the external service
* DNS resolution only - kube-proxy is not involved
* Useful for abstracting external dependencies

**Traffic Flow:**

```
Client (inside cluster)
  ↓
CoreDNS (resolves ExternalName to CNAME record)
  ↓
External DNS Resolution (e.g., database.example.com)
  ↓
External Service (direct connection outside cluster)
```

**Note:** No Kubernetes networking components (kube-proxy, Service, EndpointSlice) are involved. The Service acts purely as a DNS alias.

### ExternalName Manifest

```yaml
apiVersion: v1
kind: Service
metadata:
  name: external-db
  namespace: default
spec:
  type: ExternalName
  externalName: database.example.com  # External DNS name
  ports:
  - port: 5432
    protocol: TCP
```

### ExternalName Usage

```bash
Inside Cluster:
  # Pods can access external service using internal name
  kubectl run -it --rm debug --image=postgres:15 -- sh
  $ psql -h external-db -p 5432 -U user

  # DNS Resolution:
  external-db.default.svc.cluster.local → CNAME database.example.com

  # No ClusterIP assigned:
  kubectl get svc external-db
  NAME          TYPE           CLUSTER-IP   EXTERNAL-IP              PORT(S)
  external-db   ExternalName   <none>       database.example.com     5432/TCP
```

### ExternalName Example Use Case

```yaml
# Development: Point to external managed database
apiVersion: v1
kind: Service
metadata:
  name: postgres
spec:
  type: ExternalName
  externalName: my-rds-instance.abc123.us-east-1.rds.amazonaws.com

---
# Later, migrate to internal database without changing app code
apiVersion: v1
kind: Service
metadata:
  name: postgres
spec:
  type: ClusterIP  # Changed from ExternalName
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
```

## Service Discovery

### DNS Service Discovery

**How it works:**

```
Pod needs to connect to a service:
  URL: http://my-service
  ↓
CoreDNS intercepts DNS query
  ↓
DNS lookup in cluster:
  my-service → 10.96.0.10 (Service IP)
  my-service.default → 10.96.0.10
  my-service.default.svc.cluster.local → 10.96.0.10
  ↓
Connection established to Service IP
```

### FQDN Format

```
<service-name>.<namespace>.svc.cluster.local

Examples:
  api.default.svc.cluster.local
    ├─ api = service name
    ├─ default = namespace
    ├─ svc.cluster.local = cluster domain (configurable)

Shortcuts (within same namespace):
  api                    ← Simplest
  api.default            ← With namespace
  api.default.svc        ← Without domain suffix
```

### Service Discovery Example

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: client
spec:
  containers:
  - name: client
    image: alpine:3.15
    command: ["/bin/sh"]
    args:
    - -c
    - |
      # All these work (assuming service "backend" in "default" namespace)
      nslookup backend
      nslookup backend.default
      nslookup backend.default.svc.cluster.local
      curl http://backend
      curl http://backend.default.svc.cluster.local
```

## Endpoints and EndpointSlices

### Endpoints

An **Endpoints** object stores the actual pod IPs and ports that a Service should route to.

**Created automatically by Service Controller:**

```
Service (selector-based)
  ↓
Service Controller watches for pod changes
  ↓
Creates/Updates Endpoints object
  ↓
Endpoints contains list of pod IPs
  ↓
kube-proxy uses Endpoints to configure iptables/IPVS
```

### Viewing Endpoints

```bash
# Create service
kubectl apply -f my-service.yaml

# View endpoints
kubectl get endpoints

# Detailed view
kubectl describe ep my-service

# Output example:
Name:         my-service
Namespace:    default
Labels:       <none>
Annotations:  <none>
Subsets:
  Addresses:          10.244.1.5,10.244.1.6,10.244.1.7
  NotReadyAddresses:  10.244.2.3
  Ports:
    Name  Port  Protocol
    ----  ----  --------
    http  8080  TCP
```

### Manual Endpoints (No Selector)

```yaml
# Service without selector
apiVersion: v1
kind: Service
metadata:
  name: external-database
spec:
  ports:
  - port: 3306
---
# Manually define endpoints
apiVersion: v1
kind: Endpoints
metadata:
  name: external-database
subsets:
- addresses:
  - ip: 192.168.1.10
  ports:
  - port: 3306
```

### EndpointSlices

**EndpointSlices** improve scalability and performance for services with many endpoints.

**Why needed:**

* Endpoints object can become large (1000s of pods)
* Broadcasting large updates is inefficient
* EndpointSlices split endpoints into chunks

```
Old Approach:
  Service → Endpoints (1000 pod IPs) → Large watch updates

New Approach:
  Service → EndpointSlice1 (100 pod IPs)
          → EndpointSlice2 (100 pod IPs)
          → EndpointSlice3 (100 pod IPs)
          ...
          → Smaller, more efficient updates
```

### EndpointSlices Example

```bash
# View EndpointSlices
kubectl get endpointslices

# Detailed information
kubectl describe endpointslice my-service-abc123

# Output example:
Name:         my-service-abc123
Namespace:    default
Labels:       kubernetes.io/service-name=my-service
AddressType:  IPv4
Ports:
  Name   Port Protocol
  ----   ---- --------
  http   8080 TCP
Endpoints:
  Ready Addresses          Hostname    Topology
  ----- -----------------  ----------  --------
  true  10.244.1.5,10.244.1.6,10.244.1.7   default
```

## Session Affinity

**Session Affinity** ensures requests from the same client go to the same pod (control session stickiness).

**Use Cases:**

* Stateful connections (WebSocket, gRPC streams)
* Session state stored in-memory
* Caching data in-process

### Session Affinity Options

```yaml
apiVersion: v1
kind: Service
metadata:
  name: stateful-app
spec:
  type: ClusterIP
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 10800  # 3 hours default
  selector:
    app: stateful-app
  ports:
  - port: 80
    targetPort: 8080
```

### Session Affinity Modes

| Mode           | Behavior                               | Hash | Session Stickiness |
|----------------|----------------------------------------|------|--------------------|
| None (default) | Random (iptables) or round-robin (IPVS)| No   | No                 |
| ClientIP       | Same client IP → same pod              | Yes  | Yes                |

**Note**: With `sessionAffinity: None`, traffic distribution depends on kube-proxy mode:

* **iptables mode** (default): Random selection among healthy pods
* **IPVS mode**: Round-robin by default (supports other algorithms)

### ClientIP Example

```
Request 1: Client 10.244.2.1 → Service → Pod1 (selected)
Request 2: Client 10.244.2.1 → Service → Pod1 (same pod)
Request 3: Client 10.244.2.1 → Service → Pod1 (same pod)

Request 1: Client 10.244.2.2 → Service → Pod2 (selected)
Request 2: Client 10.244.2.2 → Service → Pod2 (same pod)
```

## External Traffic Policy

**External Traffic Policy** controls how external traffic is routed to Pods in a NodePort or LoadBalancer Service.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-app
spec:
  type: LoadBalancer
  externalTrafficPolicy: Local  # or Cluster
  selector:
    app: web-app
  ports:
  - port: 80
    targetPort: 8080
```

### Traffic Policy Modes

| Policy            | Behavior                                                               | Use Case                                  |
|-------------------|------------------------------------------------------------------------|-------------------------------------------|
| Cluster (default) | Traffic sent to any node → routed to any pod (cross-node hops allowed) | Even distribution across all pods         |
| Local             | Traffic sent only to nodes with local pods → routed to local pods only | Preserve source IP, avoid cross-node hops |

**Note**: With `Local` mode on LoadBalancer services, health checks ensure traffic is only sent to nodes with matching pods. With NodePort services, client must know which nodes have pods (or try multiple nodes).

### Comparison

```
externalTrafficPolicy: Cluster (default)
─────────────────────────────────────────

External Client
      │
      ▼
LoadBalancer/NodePort (can be any node)
      │
      ├─────────────────────┐
      ▼                     ▼
  ┌─────────┐          ┌─────────┐
  │ Node 1  │          │ Node 2  │
  │         │          │         │
  │ Pod A ◄─┼──────────┤         │  ← Traffic can cross nodes
  │         │          │ Pod B ◄─┤
  └─────────┘          └─────────┘

✓ Even distribution across all pods
✗ Source IP is lost (SNAT)
✗ Extra network hop possible


externalTrafficPolicy: Local
────────────────────────────────

External Client
      │
      ├─────────────────────┐
      ▼                     ▼
  Node 1 (has Pod)      Node 2 (has Pod)
  Health: ✓             Health: ✓
      │                     │
      ▼                     ▼
  ┌─────────┐          ┌─────────┐
  │ Node 1  │          │ Node 2  │
  │         │          │         │
  │ Pod A ◄─┤          │ Pod B ◄─┤  ← Traffic stays local
  │         │          │         │
  └─────────┘          └─────────┘

Note: Node 3 (no pods) would be marked unhealthy
      and receive no traffic

✓ Source IP preserved
✓ No extra network hops
✗ Uneven distribution if pods spread unevenly
```

## Service Manifest Reference

### Complete Service Example

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-app
  namespace: production
  labels:
    app: web-app
    tier: frontend
spec:
  # Service Type
  type: LoadBalancer

  # Pod Selection
  selector:
    app: web-app
    tier: frontend

  # Port Configuration
  ports:
  - name: http
    port: 80           # Service port
    targetPort: 8080   # Pod port
    nodePort: 30080    # (for NodePort/LoadBalancer)
    protocol: TCP
  - name: https
    port: 443
    targetPort: 8443
    protocol: TCP

  # Session Affinity
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 10800

  # Traffic Policy (external)
  externalTrafficPolicy: Cluster

  # Load Balancer (cloud-specific)
  loadBalancerIP: 203.0.113.1        # Request specific IP
  loadBalancerSourceRanges:          # Restrict access
  - 10.0.0.0/8
  - 192.168.0.0/16

  # Cluster IP (explicit, usually auto-assigned)
  clusterIP: 10.96.0.10
  clusterIPs:
  - 10.96.0.10

  # IPv6 (if dual-stack enabled)
  ipFamilies:
  - IPv4
  - IPv6

  # Session Timeout
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 10800
```

## kubectl Commands for Services

```bash
# Create Service
kubectl apply -f service.yaml

# View Services
kubectl get services

# Detailed information
kubectl describe svc web-app

# Get Service details in JSON/YAML
kubectl get svc web-app -o yaml

# Port forward to Service
kubectl port-forward svc/web-app 8080:80

# View Endpoints
kubectl get endpoints

# View EndpointSlices
kubectl get endpointslices

# Access Service from pod
kubectl run -it --rm debug --image=alpine -- sh
# Inside pod:
$ curl http://web-app
$ curl http://web-app.default.svc.cluster.local

# Test DNS resolution
kubectl run -it --rm debug --image=alpine -- nslookup web-app
```

## Summary

Services are fundamental to Kubernetes networking:

* **ClusterIP** - Internal cluster communication (default)
* **NodePort** - External access via node ports
* **LoadBalancer** - Cloud load balancer integration
* **Headless Service** - Direct pod IP access (StatefulSets)

Services provide:

* **Stable endpoint** for dynamic pods
* **Load balancing** across pod replicas
* **Service discovery** via DNS
* **Network abstraction** layer

---

**Key Takeaways:**

* Services abstract pod IPs and provide stable endpoints
* ClusterIP is default for internal communication
* NodePort for external access without load balancer
* LoadBalancer for production external access
* Headless Services for direct pod access
* DNS service discovery is automatic
* Session affinity controls routing behavior
