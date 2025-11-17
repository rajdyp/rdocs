---
title: Kubernetes Networking
linkTitle: Kubernetes Networking
type: docs
weight: 5
prev: /kubernetes/04-worker-nodes
next: /kubernetes/06-pods
---

## Overview

Kubernetes networking implements a **flat network** where every pod can communicate with every other pod without NAT.

## The Kubernetes Network Model

### Four Types of Communication

```
1. Container-to-Container (same pod)
   └─ Localhost (127.0.0.1) within shared network namespace

2. Pod-to-Pod
   └─ Direct IP communication via CNI

3. Pod-to-Service
   └─ Service abstraction with kube-proxy

4. External-to-Service
   └─ NodePort, LoadBalancer, Ingress
```

### Fundamental Requirements

Kubernetes imposes these network requirements:

* **All pods can communicate** with each other without NAT
* **All nodes can communicate** with all pods without NAT
* **Pod's IP is the same** from its own perspective and from others' perspective

```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Network                       │
│                                                             │
│  Node 1 (10.244.1.0/24)      Node 2 (10.244.2.0/24)         │
│  ┌─────────────────┐         ┌─────────────────┐            │
│  │ Pod A           │         │ Pod C           │            │
│  │ IP: 10.244.1.5  │────────▶│ IP: 10.244.2.8  │            │
│  └─────────────────┘         └─────────────────┘            │
│  ┌─────────────────┐         ┌─────────────────┐            │
│  │ Pod B           │         │ Pod D           │            │
│  │ IP: 10.244.1.6  │         │ IP: 10.244.2.9  │            │
│  └─────────────────┘         └─────────────────┘            │
│                                                             │
│  No NAT - Pod A sees Pod C as 10.244.2.8                    │
│  Direct IP connectivity across nodes                        │
└─────────────────────────────────────────────────────────────┘
```

## IP Address Management

### IP Address Assignment

```
Component          Assigned By                    Range
─────────────────────────────────────────────────────────────
Nodes              Infrastructure/Cloud           Infrastructure network
Pods               CNI plugin                     Pod CIDR (per node)
Services           kube-api-server                Service CIDR
Containers         N/A (share pod IP)             Same as pod
```

### Example IP Allocation

```
Cluster CIDR: 10.244.0.0/16
Service CIDR: 10.96.0.0/12 (default range, configurable via --service-cluster-ip-range)

Node 1: 192.168.1.10
  ├─ Pod CIDR: 10.244.1.0/24
  ├─ Pod 1: 10.244.1.5
  └─ Pod 2: 10.244.1.6

Node 2: 192.168.1.11
  ├─ Pod CIDR: 10.244.2.0/24
  ├─ Pod 3: 10.244.2.8
  └─ Pod 4: 10.244.2.9

Services:
  ├─ kubernetes: 10.96.0.1
  ├─ kube-dns: 10.96.0.10
  └─ my-service: 10.96.100.50
```

### Non-Overlapping Requirements

```
❌ BAD: Overlapping CIDRs
Pod CIDR:     10.0.0.0/16
Service CIDR: 10.96.0.0/12  ← Overlaps!
Node CIDR:    10.0.0.0/24   ← Overlaps!

✅ GOOD: Non-overlapping CIDRs
Pod CIDR:     10.244.0.0/16
Service CIDR: 10.96.0.0/12
Node CIDR:    192.168.0.0/24
```

## Container Network Interface (CNI)

### Purpose

CNI plugins handle:

* Pod IP assignment
* Network namespace creation
* Routing configuration
* Network policy enforcement (some plugins)

### How CNI Works

```
┌──────────────────────────────────────────────────────────┐
│              CNI Plugin Operation                        │
│                                                          │
│  1. Pod scheduled to node                                │
│          │                                               │
│          ▼                                               │
│  2. kubelet calls CNI plugin                             │
│          │                                               │
│          ▼                                               │
│  3. CNI creates network namespace for pod                │
│          │                                               │
│          ▼                                               │
│  4. CNI assigns IP from nodes pod CIDR                   │
│          │                                               │
│          ▼                                               │
│  5. CNI creates veth pair                                │
│     • One end in pod namespace (eth0)                    │
│     • One end in host namespace (vethXXX)                │
│          │                                               │
│          ▼                                               │
│  6. CNI configures routes                                │
│          │                                               │
│          ▼                                               │
│  7. CNI sets up DNS config in pod                        │
│          │                                               │
│          ▼                                               │
│  8. Returns pod IP to kubelet                            │
└──────────────────────────────────────────────────────────┘
```

### Popular CNI Plugins

| Plugin      | Features                          | Use Case                     |
|-------------|-----------------------------------|------------------------------|
| Calico      | L3 routing, Network policies, BGP | Production, security-focused |
| Flannel     | Simple overlay, VXLAN/host-gw     | Simple setups, learning      |
| Cilium      | eBPF-based, advanced features     | Modern, high-performance     |
| Weave Net   | Mesh network, encryption          | Multi-cloud                  |
| AWS VPC CNI | Native VPC IPs for pods           | AWS EKS                      |

### Pod Network Architecture

```
┌───────────────────────── Node ──────────────────────────────┐
│                                                             │
│ ┌────────────────── Pod Namespace ───────────────────────┐  │
│ │                                                        │  │
│ │  ┌────────────┐                                        │  │
│ │  │    eth0    │ ← Pods network interface               │  │
│ │  │ 10.244.1.5 │                                        │  │
│ │  └─────┬──────┘                                        │  │
│ │        │                                               │  │
│ └────────┼───────────────────────────────────────────────┘  │
│          │ veth pair (virtual ethernet cable)               │
│ ┌────────┼───────── Host Namespace ───────────────────────┐ │
│ │        │                                                │ │
│ │  ┌─────▼───────┐     ┌──────────┐     ┌─────────────┐   │ │
│ │  │vethXXXX     │────▶│ cni0     │────▶│ eth0 (host) │   │ │
│ │  │(veth peer)  │     │ (bridge) │     │192.168.1.10 │   │ │
│ │  └─────────────┘     └──────────┘     └──────┬──────┘   │ │
│ │                                              │          │ │
│ └──────────────────────────────────────────────┼──────────┘ │
│                                                │            │
└────────────────────────────────────────────────┼────────────┘
                                                 │
                                    External Network / Other Nodes
```

## CoreDNS - Service Discovery

### Purpose

CoreDNS provides DNS-based service discovery within the cluster.

### How CoreDNS Works

```
┌──────────────────────────────────────────────────────────┐
│            CoreDNS Service Discovery Flow                │
│                                                          │
│  1. Service Created                                      │
│     (e.g., my-service in namespace default)              │
│          │                                               │
│          ▼                                               │
│  2. CoreDNS watches API server                           │
│     (detects new service)                                │
│          │                                               │
│          ▼                                               │
│  3. CoreDNS automatically creates DNS record             │
│     my-service.default.svc.cluster.local → 10.96.100.50  │
│          │                                               │
│          ▼                                               │
│  4. Pod makes DNS query                                  │
│     "Connect to my-service"                              │
│          │                                               │
│          ▼                                               │
│  5. Pods /etc/resolv.conf points to CoreDNS              │
│     nameserver 10.96.0.10                                │
│     search default.svc.cluster.local                     │
│          │                                               │
│          ▼                                               │
│  6. CoreDNS resolves my-service → 10.96.100.50           │
│          │                                               │
│          ▼                                               │
│  7. Pod connects to Service ClusterIP                    │
│          │                                               │
│          ▼                                               │
│  8. kube-proxy routes to backend pod                     │
└──────────────────────────────────────────────────────────┘
```

### DNS Records

**Service DNS Format:**

```
<service-name>.<namespace>.svc.<cluster-domain>

Examples:
my-service.default.svc.cluster.local
database.production.svc.cluster.local
```

**Short Forms (within same namespace):**

```
my-service                            # Same namespace
my-service.default                    # Specify namespace
my-service.default.svc                # Full service path
my-service.default.svc.cluster.local  # FQDN
```

### Pod DNS Configuration

Every pod gets DNS config automatically:

```bash
# Inside pod: cat /etc/resolv.conf
nameserver 10.96.0.10                    # CoreDNS ClusterIP
search default.svc.cluster.local         # Same namespace
search svc.cluster.local                 # Any namespace
search cluster.local                     # Cluster-wide
options ndots:5
```

### Complete DNS Resolution Flow

```
Pod A wants to call "database-service"
         │
         ▼
1. Check /etc/resolv.conf
   nameserver: 10.96.0.10 (CoreDNS)
         │
         ▼
2. DNS query: database-service.default.svc.cluster.local
         │
         ▼
3. CoreDNS returns: 10.96.200.15 (Service ClusterIP)
         │
         ▼
4. Pod A connects to 10.96.200.15
         │
         ▼
5. kube-proxy iptables intercepts traffic
         │
         ▼
6. kube-proxy forwards to backend pod (e.g., 10.244.2.100)
         │
         ▼
7. CNI routes packet: 10.244.1.10 → 10.244.2.100
         │
         ▼
8. Backend pod receives request
```

## Traffic Flows

### 1. Container-to-Container (Same Pod)

```
Pod (10.244.1.5)
┌─────────────────────────────┐
│ Container A    Container B  │
│     │              ▲        │
│     │ localhost    │        │
│     │ 127.0.0.1    │        │
│     └──────────────┘        │
│                             │
│ Shared network namespace    │
└─────────────────────────────┘
```

* Containers share network namespace
* Use **localhost** for communication
* Share same IP address
* Different ports per container

### 2. Pod-to-Pod (Same Node)

```
Node 1
┌──────────────────────────────────────────┐
│                                          │
│  Pod A (10.244.1.5)                      │
│     │                                    │
│     │ 1. Send to 10.244.1.6              │
│     ▼                                    │
│  cni0 bridge                             │
│     │                                    │
│     │ 2. Forward via bridge              │
│     ▼                                    │
│  Pod B (10.244.1.6)                      │
│                                          │
└──────────────────────────────────────────┘
```

### 3. Pod-to-Pod (Different Nodes)

```
Node 1 (10.244.1.0/24)           Node 2 (10.244.2.0/24)
┌───────────────────┐            ┌───────────────────┐
│ Pod A             │            │ Pod C             │
│ 10.244.1.5        │            │ 10.244.2.8        │
│       │           │            │       ▲           │
│       │ 1. To     │            │       │ 4. Recv   │
│       │ 10.244.2.8│            │       │           │
│       ▼           │            │       │           │
│    cni0 bridge    │            │    cni0 bridge    │
│       │           │            │       ▲           │
│       ▼           │            │       │           │
│    eth0           │            │    eth0           │
│ 192.168.1.10      │            │ 192.168.1.11      │
└───────┬───────────┘            └───────▲───────────┘
        │                                │
        │ 2. Route via CNI               │
        │ (VXLAN/BGP/etc.)               │
        └────────────────────────────────┘
               3. Cross-node routing
```

### 4. Pod-to-Service

```
Pod → Service → Pods

1. Pod resolves service name via CoreDNS
         │
         ▼
2. DNS returns Service ClusterIP
         │
         ▼
3. Pod sends packet to ClusterIP
         │
         ▼
4. kube-proxy iptables/IPVS rules intercept
         │
         ▼
5. Destination NAT (DNAT) to backend pod IP
         │
         ▼
6. CNI routes to destination pod
         │
         ▼
7. Backend pod receives request
```

### 5. External-to-Service

```
External Client
      │
      │ 1. Hits LoadBalancer IP
      ▼
Cloud LoadBalancer
      │
      │ 2. Routes to NodePort
      ▼
Node (any node in cluster)
      │
      │ 3. NodePort → kube-proxy rules
      ▼
kube-proxy
      │
      │ 4. DNAT to ClusterIP
      ▼
Service ClusterIP
      │
      │ 5. DNAT to pod IP
      ▼
Backend Pod
```

## Network Traffic Flow Example

Complete request flow from external client to pod:

```
┌─────────────────────────────────────────────────────────────┐
│     Complete Traffic Flow: External → Pod                   │
│                                                             │
│  1. Client                                                  │
│     └─ DNS lookup: myapp.example.com → 54.123.45.67         │
│                                                             │
│  2. Cloud LoadBalancer (54.123.45.67)                       │
│     └─ Routes to NodePort on any cluster node               │
│                                                             │
│  3. Node (192.168.1.10:30080)                               │
│     └─ kube-proxy intercepts NodePort traffic               │
│                                                             │
│  4. kube-proxy                                              │
│     └─ DNAT: NodePort → Service ClusterIP (10.96.100.50)    │
│                                                             │
│  5. kube-proxy (second DNAT)                                │
│     └─ DNAT: ClusterIP → Pod IP (10.244.2.100:8080)         │
│                                                             │
│  6. CNI routing                                             │
│     └─ Routes packet to destination node/pod                │
│                                                             │
│  7. Pod (10.244.2.100:8080)                                 │
│     └─ Application receives request                         │
│                                                             │
│  Return path follows reverse (with SNAT)                    │
└─────────────────────────────────────────────────────────────┘
```

## ClusterIP Routing

### How ClusterIPs Work

```
Important: ClusterIPs are virtual - they dont exist on any interface!

┌──────────────────────────────────────────────────────┐
│  ClusterIP Lifecycle                                 │
│                                                      │
│  1. Service created with ClusterIP                   │
│     (e.g., 10.96.100.50)                             │
│          │                                           │
│          ▼                                           │
│  2. kube-proxy creates iptables/IPVS rules           │
│     on EVERY node                                    │
│          │                                           │
│          ▼                                           │
│  3. Pod sends packet to ClusterIP                    │
│          │                                           │
│          ▼                                           │
│  4. Packet goes to default gateway (node)            │
│          │                                           │
│          ▼                                           │
│  5. Kernel netfilter intercepts packet               │
│     (iptables/IPVS rules match)                      │
│          │                                           │
│          ▼                                           │
│  6. DNAT rewrites destination to real pod IP         │
│          │                                           │
│          ▼                                           │
│  7. Normal routing to pod                            │
└──────────────────────────────────────────────────────┘
```

## Network Policies

Network policies provide firewall rules for pods:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 8080
```

**Requires CNI plugin support** (Calico, Cilium, Weave)

## Summary

Kubernetes networking achieves:

* **Flat Network**: Every pod has unique IP, direct communication
* **CNI Abstraction**: Pluggable network implementations
* **Service Discovery**: DNS-based via CoreDNS
* **Routing**: kube-proxy implements Service networking
* **Flexibility**: Multiple CNI options for different needs

**Key Components:**

* **CNI**: Pod networking and IP management
* **CoreDNS**: Service discovery via DNS
* **kube-proxy**: Service-to-pod routing
* **Network Policies**: Pod-level firewall rules

---

**Key Takeaways:**

* Kubernetes requires flat pod network (no NAT between pods)
* CNI plugins handle pod networking implementation
* CoreDNS provides automatic service discovery
* kube-proxy creates rules, doesn't route traffic itself
* ClusterIPs are virtual, implemented via iptables/IPVS
