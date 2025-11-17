---
title: Worker Node Components
linkTitle: Worker Node Components
type: docs
weight: 4
prev: /kubernetes/03-control-plane
next: /kubernetes/05-networking
---

## Overview

Worker nodes are the compute machines that run application workloads (pods) in a Kubernetes cluster. While the control plane makes decisions, worker nodes execute those decisions.

```
┌────────────────────────────────────────────────────────────┐
│                      Worker Node                           │
│                                                            │
│  ┌────────────────────────────────────────────────────────┐│
│  │                     kubelet                            ││
│  │        (Node agent - manages pod lifecycle)            ││
│  └──────────────┬──────────────────┬──────────────────────┘│
│                 │                  │                       │
│        ┌────────▼────────┐  ┌──────▼──────────┐            │
│        │   kube-proxy    │  │ Container       │            │
│        │  (networking)   │  │ Runtime (CRI)   │            │
│        └─────────────────┘  └──────┬──────────┘            │
│                                    │                       │
│  ┌─────────────────────────────────▼──────────────────────┐│
│  │                        Pods                            ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              ││
│  │  │ Pod 1    │  │ Pod 2    │  │ Pod N    │              ││
│  │  │┌────────┐│  │┌────────┐│  │┌────────┐│              ││
│  │  ││Container│  ││Container│  ││Container│              ││
│  │  │└────────┘│  │└────────┘│  │└────────┘│              ││
│  │  └──────────┘  └──────────┘  └──────────┘              ││
│  └────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘
```

## Core Components

* **kubelet**
* **kube-proxy**
* **Container Runtime (CRI)**

## 1. kubelet

### Purpose

kubelet is the **node-level agent** that ensures containers are running and healthy in pods on its assigned node.

### Key Responsibilities

1. **Pod Lifecycle Management**
   - Receives pod specifications from API server
   - Ensures containers are running as specified
   - Reports pod and node status back to control plane

2. **Container Management via CRI**
   - Instructs container runtime to pull images
   - Creates and starts containers
   - Monitors container health
   - Restarts failed containers

3. **Networking via CNI**
   - Sets up pod networking
   - Configures network namespaces
   - Assigns IP addresses to pods

4. **Storage via CSI**
   - Mounts volumes for pods
   - Manages volume lifecycle
   - Handles storage plugins

5. **Health Monitoring**
   - Runs liveness probes (is container alive?)
   - Runs readiness probes (can container accept traffic?)
   - Runs startup probes (has container started?)

6. **Resource Management**
   - Enforces resource requests/limits via cgroups
   - Handles pod eviction under resource pressure
   - Monitors node capacity

### How kubelet Works

```
┌──────────────────────────────────────────────────────────────┐
│                   kubelet Workflow                           │
│                                                              │
│  ┌──────────────────────────┐                                │
│  │  1. Watch API Server     │                                │
│  │     for pods assigned    │                                │
│  │     to this node         │                                │
│  └────────────┬─────────────┘                                │
│               │                                              │
│               ▼                                              │
│  ┌──────────────────────────┐                                │
│  │  2. Receive Pod Spec     │                                │
│  └────────────┬─────────────┘                                │
│               │                                              │
│               ▼                                              │
│  ┌──────────────────────────┐                                │
│  │  3. Setup Networking     │ ← CNI plugin                   │
│  │     (create namespace,   │                                │
│  │      assign IP)          │                                │
│  └────────────┬─────────────┘                                │
│               │                                              │
│               ▼                                              │
│  ┌──────────────────────────┐                                │
│  │  4. Pull Images          │ ← Container runtime            │
│  └────────────┬─────────────┘                                │
│               │                                              │
│               ▼                                              │
│  ┌──────────────────────────┐                                │
│  │  5. Start Containers     │ ← Container runtime            │
│  └────────────┬─────────────┘                                │
│               │                                              │
│               ▼                                              │
│  ┌──────────────────────────┐                                │
│  │  6. Monitor Health       │ ← Probes                       │
│  └────────────┬─────────────┘                                │
│               │                                              │
│               ▼                                              │
│  ┌──────────────────────────┐                                │
│  │  7. Report Status        │ → API Server                   │
│  │     to API Server        │                                │
│  └────────────┬─────────────┘                                │
│               │                                              │
│               ▼                                              │
│  Continuous monitoring and reconciliation                    │
└──────────────────────────────────────────────────────────────┘
```

### kubelet Interactions

**With API Server:**

```
kubelet                          API Server
   │                                │
   │ ◄─────────────────────────────┤│ WATCH: Pods for this node
   │                                │
   │ Status updates (heartbeats)    │
   ├───────────────────────────────▶│
   │                                │
   │ Pod status (Running/Failed)    │
   ├───────────────────────────────▶│
```

**With Container Runtime:**

```
kubelet                     Container Runtime
   │                              │
   │ Pull image nginx:latest      │
   ├─────────────────────────────▶│
   │                              │
   │ Create container             │
   ├─────────────────────────────▶│
   │                              │
   │ Start container              │
   ├─────────────────────────────▶│
   │                              │
   │ Get container status         │
   ├─────────────────────────────▶│
```

**With CNI Plugin:**

```
kubelet                     CNI Plugin
   │                            │
   │ Setup network for pod      │
   ├───────────────────────────▶│
   │                            │
   │ ← Pod IP: 10.244.1.5       │
   │    Routes configured       │
```

### Resource Enforcement

kubelet uses **cgroups** (control groups) to enforce resource limits:

```yaml
resources:
  requests:      # Minimum guaranteed
    cpu: 100m
    memory: 128Mi
  limits:        # Maximum allowed
    cpu: 500m
    memory: 512Mi
```

**How it works:**

* **Requests**: Used for scheduling decisions
* **Limits**: Enforced by kubelet via cgroups
* **CPU**: Throttled when limit reached
* **Memory**: Container killed (OOMKilled) when limit exceeded

### Pod Eviction

When node resources are low, kubelet evicts pods:

```
Node Resource Pressure Detected
           │
           ▼
┌────────────────────────┐
│  Eviction Signals      │
│  • memory.available    │
│  • nodefs.available    │
│  • imagefs.available   │
│  • pid.available       │
└──────────┬─────────────┘
           │
           ▼
┌─────────────────────────┐
│  Eviction Priority      │
│  1. BestEffort pods     │
│  2. Burstable pods      │
│  3. Guaranteed pods     │
└──────────┬──────────────┘
           │
           ▼
   Evict pods until
   resources recovered
```

### Health Probes

kubelet executes three types of probes:

```yaml
livenessProbe:          # Is container alive?
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:         # Can accept traffic?
  httpGet:
    path: /ready
    port: 8080
  periodSeconds: 5

startupProbe:           # Has finished starting?
  httpGet:
    path: /startup
    port: 8080
  failureThreshold: 30
  periodSeconds: 10
```

**Actions:**

* **Liveness fails**: Restart container
* **Readiness fails**: Remove pod from service endpoints
* **Startup fails**: Restart container (after threshold)

## 2. kube-proxy

### Purpose

kube-proxy is a **network proxy** that maintains network rules on nodes, enabling communication between Services and Pods.

### Key Responsibilities

1. **Service Routing Implementation**
   - Watches API server for Service and Endpoint changes
   - Translates Service config into actual network rules
   - Routes traffic from Service IPs to Pod IPs
   - **Important**: Services themselves don't route traffic—kube-proxy does!

2. **Load Balancing**
   - Distributes traffic across backend pods (via iptables/IPVS rules)
        - Services are just configuration objects - they don't actually route or load balance anything
   - Supports session affinity
   - Health-aware routing (based on Endpoints)
   - **Note**: Load balancing is done by kernel rules, not by a proxy process

3. **Network Rules Management**
   - Creates and updates iptables/IPVS rules on the node
   - Handles NodePort, ClusterIP, LoadBalancer services
   - Manages external traffic routing
   - Each node has its own kube-proxy maintaining local rules

### How kube-proxy Works

```
┌──────────────────────────────────────────────────────────────┐
│               kube-proxy Operation                           │
│                                                              │
│  ┌─────────────────────────────┐                             │
│  │  1. Watch API Server        │                             │
│  │     • Services              │                             │
│  │     • Endpoints/            │                             │
│  │       EndpointSlices        │                             │
│  └──────────────┬──────────────┘                             │
│                 │                                            │
│                 ▼                                            │
│  ┌─────────────────────────────┐                             │
│  │  2. Detect Changes          │                             │
│  │     • New service created   │                             │
│  │     • Pod added/removed     │                             │
│  │     • Service updated       │                             │
│  └──────────────┬──────────────┘                             │
│                 │                                            │
│                 ▼                                            │
│  ┌─────────────────────────────┐                             │
│  │  3. Update Network Rules    │                             │
│  │     • iptables rules        │                             │
│  │     • or IPVS rules         │                             │
│  └──────────────┬──────────────┘                             │
│                 │                                            │
│                 ▼                                            │
│  ┌─────────────────────────────┐                             │
│  │  4. Traffic Routing         │                             │
│  │     Service IP → Pod IP     │                             │
│  └─────────────────────────────┘                             │
└──────────────────────────────────────────────────────────────┘
```

### Traffic Flow with kube-proxy

**Important: The Service object is NOT in this flow—it's just config!**

```
Client Pod (10.244.1.10)
   │
   │ 1. Calls: my-service (DNS query)
   ▼
CoreDNS
   │
   │ 2. Returns: 10.96.100.50 (Service ClusterIP)
   ▼
Client sends packet to 10.96.100.50
   │
   │ 3. Packet destination: 10.96.100.50
   ▼
Node Network Stack
   │
   │ 4. Kernel netfilter intercepts packet
   ▼
┌────────────────────────────────────────────────────────┐
│  iptables/IPVS rules (created by kube-proxy)           │
│  (These rules ARE the load balancer!)                  │
│                                                        │
│  Rule matches: 10.96.100.50:80                         │
│                                                        │
│  Available backends (from Endpoints):                  │
│    10.244.1.100:8080 (Pod 1)                           │
│    10.244.2.200:8080 (Pod 2)                           │
│    10.244.3.150:8080 (Pod 3)                           │
│                                                        │
│  Action: DNAT (Destination NAT)                        │
│  Pick random: 10.244.1.100:8080                        │
│                                                        │
│  Packet destination rewritten:                         │
│  FROM: 10.96.100.50:80                                 │
│  TO:   10.244.1.100:8080                               │
└────────────────────────────────────────────────────────┘
   │
   │ 5. Packet now destined for real pod IP
   ▼
CNI Routes packet to Pod
   │
   │ 6. Packet routed to correct node/pod
   ▼
Backend Pod (10.244.1.100:8080)
   │
   │ 7. Application receives request
   └─ Note: Service object never touched the packet!
```

**Key Point:**

```
The Service ClusterIP (10.96.100.50) is a VIRTUAL IP
  ↓
It doesnt exist on any network interface
  ↓
kube-proxy created iptables rules that say:
"When you see 10.96.100.50, rewrite to a pod IP"
  ↓
Linux kernel applies these rules
  ↓
Traffic flows directly to pods
```

### kube-proxy Modes

**1. iptables Mode (Default)**

```
Pros:
• Mature and stable
• Works everywhere
• Simple to debug

Cons:
• Performance degrades with many services
• O(n) rule processing
• No real load balancing algorithms
```

**2. IPVS Mode**

```
Pros:
• Better performance at scale
• Advanced load balancing (rr, lc, sh, etc.)
• O(1) lookup time

Cons:
• Requires kernel modules
• More complex setup
```

**3. userspace Mode (Legacy)**

```
Not recommended - only for very old kernels
```

### Important Concepts

**Services DON'T route traffic (common misconception):**

```
❌ WRONG Understanding (oversimplification):
   "Service receives traffic and forwards to pods"

✅ CORRECT Understanding:
   "Service is config; kube-proxy creates rules that route traffic"
```

**The Reality:**

```
1. Services → Configuration objects in etcd
   ├─ Just YAML stored in etcd
   ├─ Defines selector, ClusterIP, ports
   ├─ Does NOT process packets
   ├─ Does NOT load balance
   └─ Does NOT route anything!

2. kube-proxy (on each node) → Reads Service config and creates rules
   ├─ Watches Service objects
   ├─ Watches Endpoints objects
   ├─ Creates iptables/IPVS rules
   └─ These rules do the actual routing

3. Linux Kernel (on each node)
   ├─ Applies iptables/IPVS rules
   ├─ THIS is where traffic routing happens
   └─ THIS is where load balancing happens
```

**Concrete Example:**

```
Service YAML (just config):
  name: my-service
  clusterIP: 10.96.100.50
  selector: app=web
         │
         │ Stored in etcd
         ▼
kube-proxy sees this and creates:
         │
         ▼
iptables rules (actual routing):
  "If destination = 10.96.100.50:80
   THEN randomly pick one:
     → 10.244.1.100:80 (pod-1) [33% chance]
     → 10.244.2.200:80 (pod-2) [33% chance]
     → 10.244.3.150:80 (pod-3) [34% chance]"
```

**Traffic Flow:**

```
Pod sends request to 10.96.100.50
         ↓
Packet goes to node network stack
         ↓
Kernel applies iptables rules (created by kube-proxy)
         ↓
Destination rewritten to pod IP (e.g., 10.244.1.100)
         ↓
CNI routes to destination pod
```

**Who Does What:**

| Component     | Role                 | Does Traffic Routing?   |
|---------------|----------------------|-------------------------|
| Service       | Configuration object | ❌ No                   |
| kube-proxy    | Rule creator         | ❌ No (creates rules)   |
| iptables/IPVS | Kernel rule          | ✅ Yes (actual routing) |

**Endpoints tell kube-proxy where to route:**

```
Service: my-service (ClusterIP: 10.96.100.50)
   │
   │ Selector: app=web
   ▼
Endpoints Controller creates:
   │
   ▼
Endpoints: my-service
   │
   ├─ 10.244.1.100:80 (pod-1)
   ├─ 10.244.2.200:80 (pod-2)
   └─ 10.244.3.150:80 (pod-3)
         │
         │ kube-proxy watches these
         ▼
   Updates iptables rules with pod IPs
```

## 3. Container Runtime (CRI)

### Purpose

The container runtime is responsible for **pulling images and managing the execution and lifecycle of containers**.

### Container Runtime Interface (CRI)

CRI is a **standardized API** that allows Kubernetes to work with different container runtimes.

```
┌──────────────┐
│   kubelet    │
└──────┬───────┘
       │ CRI API (gRPC)
       │
┌──────▼────────────────────────────────────────┐
│     Container Runtime Interface (CRI)         │
│     (Standardized API)                        │
└──────┬────────────────────────────────────────┘
       │
       ├──────────┬──────────┬──────────┐
       │          │          │          │
┌──────▼───┐ ┌────▼────┐ ┌───▼─────┐ ┌──▼──────┐
│containerd│ │ CRI-O   │ │ Docker* │ │ Others  │
└──────────┘ └─────────┘ └─────────┘ └─────────┘

* Docker support via dockershim deprecated in 1.20, removed in 1.24
```

### Popular Container Runtimes

**1. containerd**

* Industry standard
* Used by Docker under the hood
* Default in many Kubernetes distributions
* Lightweight and efficient

**2. CRI-O**

* Built specifically for Kubernetes
* OCI-compliant
* Minimal and focused

**3. Docker (via cri-dockerd)**

* Requires additional shim layer
* Deprecated in newer Kubernetes versions

### Runtime Responsibilities

```
┌────────────────────────────────────────────────┐
│        Container Runtime Tasks                 │
│                                                │
│  1. Image Management                           │
│     • Pull images from registries              │
│     • Store images locally                     │
│     • Verify image signatures                  │
│                                                │
│  2. Container Lifecycle                        │
│     • Create containers                        │
│     • Start/stop containers                    │
│     • Delete containers                        │
│                                                │
│  3. Container Execution                        │
│     • Run container processes                  │
│     • Manage namespaces (PID, network, mount)  │
│     • Set up cgroups                           │
│                                                │
│  4. Status Reporting                           │
│     • Report container status to kubelet       │
│     • Provide logs                             │
│     • Stream exec/attach sessions              │
└────────────────────────────────────────────────┘
```

## How Components Work Together

### Complete Pod Startup Flow

```
1. Scheduler assigns Pod to Worker Node
   (Updates pod with nodeName)
         │
         ▼
2. kubelet (on worker node) detects new pod assignment
   (via watch on API server)
         │
         ▼
3. kubelet calls CNI plugin
   → CNI creates network namespace
   → CNI assigns Pod IP (e.g., 10.244.1.5)
   → CNI configures routes
         │
         ▼
4. kubelet calls Container Runtime (via CRI)
   → Runtime pulls image from registry
   → Runtime creates container
   → Runtime starts container with network namespace
         │
         ▼
5. kubelet starts health probes
   → Liveness probe
   → Readiness probe
   → Startup probe
         │
         ▼
6. kubelet reports status to API Server
   → Pod IP: 10.244.1.5
   → Status: Running
   → Container status: Ready
         │
         ▼
7. API Server updates Endpoints
   → Adds pod IP to service endpoints
         │
         ▼
8. kube-proxy detects endpoint update
   → Updates iptables/IPVS rules
   → Pod now receives traffic from Service
         │
         ▼
9. Continuous monitoring
   → kubelet monitors pod health
   → kube-proxy maintains network rules
   → Runtime reports container status
```

### Component Dependencies

```
┌─────────────────────────────────────────────────┐
│           Worker Node Dependencies              │
│                                                 │
│              kubelet (core agent)               │
│                 │                               │
│        ┌────────┼────────┐                      │
│        │        │        │                      │
│        ▼        ▼        ▼                      │
│      CNI    Container   CSI                     │
│    Plugin   Runtime   Plugin                    │
│        │        │        │                      │
│        │        │        │                      │
│        ▼        ▼        ▼                      │
│    Network  Containers Storage                  │
│                                                 │
│              kube-proxy                         │
│                 │                               │
│                 ▼                               │
│         iptables/IPVS rules                     │
└─────────────────────────────────────────────────┘
```

## Node Lifecycle

### Node Registration

```
1. kubelet starts on new node
         │
         ▼
2. kubelet registers with API server
   (creates Node object)
         │
         ▼
3. API server accepts registration
         │
         ▼
4. Node appears in cluster
   (kubectl get nodes shows it)
         │
         ▼
5. Scheduler can now assign pods to this node
```

### Node Heartbeats

```
kubelet                        API Server
   │                                │
   │ Heartbeat (every 10s default)  │
   ├───────────────────────────────▶│
   │                                │
   │ Node status update             │
   ├───────────────────────────────▶│
   │                                │
```

**If heartbeats stop:**

* Node marked NotReady after ~40 seconds
* Pods evicted after ~5 minutes
* Controllers recreate pods on healthy nodes

### Node Failure Scenario

```
1. Worker node fails (hardware/network issue)
         │
         ▼
2. kubelet stops sending heartbeats
         │
         ▼
3. Node Controller detects missing heartbeats
   (after ~40 seconds)
         │
         ▼
4. Node marked as NotReady
         │
         ▼
5. After grace period (~5 minutes):
   Node Controller adds NoExecute taint
         │
         ▼
6. Pods on failed node enter Terminating state
         │
         ▼
7. Controllers (ReplicaSet, Deployment) detect pod loss
         │
         ▼
8. Scheduler assigns new pods to healthy nodes
         │
         ▼
9. Application recovers on healthy nodes
```

## Summary

Worker node components form the execution layer of Kubernetes:

| Component         | Primary Function      | Failure Impact                   |
|-------------------|-----------------------|----------------------------------|
| kubelet           | Pod lifecycle manager | Pods on node not managed         |
| kube-proxy        | Network routing       | Service traffic broken on node   |
| Container Runtime | Container execution   | Cannot start containers          |
| CNI Plugin        | Pod networking        | Cannot assign IPs, route traffic |

**Key Interactions:**

* kubelet ↔ API Server: Pod assignments and status
* kubelet ↔ Container Runtime: Container lifecycle
* kubelet ↔ CNI: Pod networking
* kube-proxy ↔ API Server: Service/Endpoint updates
* kube-proxy ↔ Network Stack: Traffic routing rules

**Critical Understanding:**

* kubelet is the primary agent—it drives all node operations
* kube-proxy doesn't route traffic—it configures rules that route traffic
* Container runtime is pluggable via CRI
* All components work autonomously but report to control plane

---

**Key Takeaways:**

* Worker nodes execute control plane decisions
* kubelet is the node brain, managing all local operations
* kube-proxy enables Service networking through iptables/IPVS
* Container runtime is abstracted via CRI for flexibility
* Node health monitored via heartbeats
