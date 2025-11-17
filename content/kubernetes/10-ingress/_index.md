---
title: Ingress and External Access
linkTitle: Ingress and External Access
type: docs
weight: 10
prev: /kubernetes/09-services
next: /kubernetes/11-storage
---

## Overview

An **Ingress** is a Kubernetes API object that manages external HTTP/HTTPS access to services within a cluster (providing a single external access point for multiple Services). It handles routing, SSL termination, and virtual hosting capabilities.

```
┌─────────────────────────────────────────────────────┐
│                Internet/External                    │
│                                                     │
│   HTTP/HTTPS Requests                               │
│      ↓                                              │
│   Ingress Controller (e.g., nginx)                  │
│   ┌───────────────────────────────────┐             │
│   │ • TLS Termination                 │             │
│   │ • Routing (host-based, path-based)│             │
│   │ • Load Balancing                  │             │
│   └───────────────────────────────────┘             │
│      ↓              ↓              ↓                │
│   Service 1    Service 2      Service 3             │
│      ↓              ↓              ↓                │
│    Pods           Pods           Pods               │
└─────────────────────────────────────────────────────┘
```

## The Problem: External Access

### Without Ingress

```
Multiple services need external access:
  - api.example.com
  - web.example.com
  - admin.example.com
  - api.example.com/v1
  - api.example.com/v2

Solutions without Ingress:
  Option 1: Multiple LoadBalancer services
    Problem: Each needs a public IP (expensive!)

  Option 2: One LoadBalancer per hostname
    Problem: Complex management, wasted IPs

  Option 3: Manual proxy (nginx, HAProxy)
    Problem: Not integrated with Kubernetes
```

### With Ingress

```
Single Ingress Controller (LoadBalancer)
  Manages all routing rules
  ↓
Ingress Rules specify:
  api.example.com → api-service
  web.example.com → web-service
  admin.example.com → admin-service
  api.example.com/v1 → api-v1-service
  api.example.com/v2 → api-v2-service

Benefits:
  ✓ Single public IP/LoadBalancer
  ✓ Centralized configuration
  ✓ TLS termination
  ✓ Kubernetes-native
```

## Scope of Ingress

**Ingress handles north-south traffic** (external clients → cluster services):

```
External Clients (Internet)
         ↓
    [Ingress]  ← North-South traffic
         ↓
   Cluster Services
```

**Ingress does NOT handle east-west traffic** (service-to-service communication inside the cluster):

```
Service A ←→ Service B  ← East-West traffic
Service B ←→ Service C  (NOT handled by Ingress)
```

### Traffic Patterns Comparison

| Traffic Type         | Use Case                         | Solution                      |
|----------------------|----------------------------------|-------------------------------|
| North-South          | External → Internal              | Ingress (nginx, AWS ALB)      |
| East-West (basic)    | Service → Service                | Service discovery / ClusterIP |
| East-West (advanced) | Security, routing, observability | Service Mesh (Istio, Linkerd) |

### When to Use What

* **Ingress**: External access to your services (API gateway, web traffic)
* **ClusterIP Services**: Simple internal service-to-service communication
* **Service Mesh**: Advanced east-west features (mTLS, traffic splitting, observability)

## Ingress Resources vs Controllers

### Ingress Resource

An **Ingress Resource** is a Kubernetes object that defines routing rules.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
spec:
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api
            port:
              number: 80
```

### Ingress Controller

An **Ingress Controller** is a Kubernetes component that implements the Ingress specification. It:

* Reads Ingress resources
* Configures routing rules
* Manages the actual reverse proxy

```
Ingress Resource (Declaration)
         ↓
  Ingress Controller (Implementation)
  ├─ nginx Ingress Controller
  ├─ AWS ALB Ingress Controller
  ├─ GCP Load Balancer Controller
  ├─ Istio Ingress Gateway
  └─ ... (many options)
         ↓
  Reverse Proxy Configuration
  (iptables rules, load balancer settings)
         ↓
  External Traffic Routing
```

### How Ingress Controller Gets External Access

The **Ingress Controller** itself must be reachable from outside the cluster so that it can receive and route incoming HTTP/HTTPS traffic.

```
┌─────────────────────────────────────────┐
│  External Traffic                       │
│         ↓                               │
│  LoadBalancer/NodePort Service          │
│  (exposes Ingress Controller)           │
│         ↓                               │
│  Ingress Controller Pod                 │
│  (nginx/traefik/etc.)                   │
│         ↓                               │
│  Routes to ClusterIP Services           │
│  (based on Ingress rules)               │
└─────────────────────────────────────────┘
```

**Important distinction:**

* Ingress Controller's Service: **LoadBalancer** or **NodePort** (external access)
* Application Services (backends): **ClusterIP** (internal only)

## Ingress Controller Implementations

| Controller  | Cloud | Features                 | Complexity |
|-------------|-------|--------------------------|------------|
| nginx       | Any   | Lightweight, flexible    | Low        |
| AWS ALB     | AWS   | Native, cost-effective   | Medium     |
| GCP LB      | GCP   | Native, auto-scaling     | Medium     |
| Azure AppGW | Azure | Native, WAF support      | Medium     |
| Istio       | Any   | Traffic management, mTLS | High       |
| Traefik     | Any   | Dynamic routing, modern  | Medium     |

Note: **Istio** itself is not an ingress controller, but it includes an **ingress gateway** component that acts like one.

## Ingress Manifest Structure

### Basic Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: simple-ingress
spec:
  # ingressClassName specifies controller
  ingressClassName: nginx

  # Routing rules
  rules:
  - host: example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web
            port:
              number: 80
```

### Path Types

**`Prefix`** - Matches path prefix

```
path: /api
pathType: Prefix
Matches: /api, /api/v1, /api/users, etc.
```

**`Exact`** - Exact path match

```
path: /api/health
pathType: Exact
Matches: /api/health only
```

**`ImplementationSpecific`** - Controller-dependent

```
pathType: ImplementationSpecific
(nginx supports regex patterns)
```

## Routing Patterns

### Host-Based Routing

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: virtual-hosts
spec:
  ingressClassName: nginx
  rules:
  # api.example.com → api service
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api
            port:
              number: 80

  # web.example.com → web service
  - host: web.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web
            port:
              number: 80

  # admin.example.com → admin service
  - host: admin.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: admin
            port:
              number: 80
```

### Path-Based Routing

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: path-based-routing
spec:
  ingressClassName: nginx
  rules:
  - host: example.com
    http:
      paths:
      # /api → api service
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api
            port:
              number: 80

      # /web → web service
      - path: /web
        pathType: Prefix
        backend:
          service:
            name: web
            port:
              number: 80

      # /admin → admin service
      - path: /admin
        pathType: Prefix
        backend:
          service:
            name: admin
            port:
              number: 80
```

### Hybrid Routing

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: hybrid-routing
spec:
  ingressClassName: nginx
  rules:
  # Production domain: host-based
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-prod
            port:
              number: 80

  # Development domain: path-based
  - host: dev.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-dev
            port:
              number: 80
      - path: /web
        pathType: Prefix
        backend:
          service:
            name: web-dev
            port:
              number: 80
```

## TLS/HTTPS Termination

### Basic TLS Configuration

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tls-ingress
spec:
  ingressClassName: nginx

  # TLS Configuration
  tls:
  - hosts:
    - example.com
    - api.example.com
    secretName: example-com-tls  # Secret containing cert+key

  rules:
  - host: example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web
            port:
              number: 80

  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api
            port:
              number: 80
```

### Creating TLS Secret

```bash
# Create a self-signed certificate (testing only)
openssl req -x509 -newkey rsa:4096 \
  -keyout tls.key \
  -out tls.crt \
  -days 365 \
  -nodes \
  -subj "/CN=example.com"

# Create Secret from certificate
kubectl create secret tls example-com-tls \
  --cert=tls.crt \
  --key=tls.key

# Verify Secret
kubectl get secret example-com-tls -o yaml
```

```yaml
# Manual Secret creation (YAML)
apiVersion: v1
kind: Secret
metadata:
  name: example-com-tls
type: kubernetes.io/tls
data:
  tls.crt: <base64-encoded-cert>
  tls.key: <base64-encoded-key>
```

### TLS Workflow

```
Client Request:
  https://example.com
  ↓
Ingress Controller (TLS Termination):
  1. Client connects via TLS
  2. Present certificate from Secret
  3. Terminate TLS (decrypt)
  4. Extract HTTP request
  ↓
Forward HTTP to backend service
  (internal communication)
  ↓
Service routes to Pod
  Pod receives plain HTTP
  (TLS terminated at ingress)
```

## Ingress Classes

An **IngressClass** is a Kubernetes resource that identifies which Ingress Controller should handle an Ingress resource.

**Relationship:**

```
Ingress Resource (routing rules)
         |
         | references (via ingressClassName field)
         ↓
IngressClass (metadata)
         |
         | identifies (via controller field)
         ↓
Ingress Controller (nginx pod)
         |
         | watches Ingress Resources with matching class
         | and implements their routing rules
         ↓
Configures proxy to route traffic
```

This allows multiple Ingress Controllers to coexist in the same cluster, with each Ingress resource specifying which controller should handle it.

### Create IngressClass

```yaml
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: nginx
spec:
  controller: k8s.io/ingress-nginx

---
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: aws-alb
spec:
  controller: ingress.k8s.aws/alb
```

### Setting a Default IngressClass

```yaml
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: nginx
  annotations:
    ingressclass.kubernetes.io/is-default-class: "true"
spec:
  controller: k8s.io/ingress-nginx
```

When an IngressClass is marked as default, any Ingress without `ingressClassName` will use it automatically.

### Reference IngressClass

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
spec:
  ingressClassName: nginx  # Which controller handles this
  rules:
  - host: example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web
            port:
              number: 80
```

### View IngressClasses

```bash
# List available IngressClasses
kubectl get ingressclasses

# View details
kubectl describe ingressclass nginx
```

## Ingress Annotations

**Annotations** provide controller-specific configuration.

### nginx Ingress Annotations

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nginx-annotations
  annotations:
    # Redirect HTTP to HTTPS
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"

    # Enable CORS
    nginx.ingress.kubernetes.io/enable-cors: "true"
    nginx.ingress.kubernetes.io/cors-allow-origin: "*"

    # Rate limiting
    nginx.ingress.kubernetes.io/limit-rps: "10"

    # Authentication
    nginx.ingress.kubernetes.io/auth-type: "basic"
    nginx.ingress.kubernetes.io/auth-secret: "basic-auth"

    # Rewrite path
    nginx.ingress.kubernetes.io/rewrite-target: /

    # Custom proxy settings
    nginx.ingress.kubernetes.io/proxy-connection-timeout: "30"
spec:
  ingressClassName: nginx
  rules:
  - host: example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api
            port:
              number: 80
```

## Advanced Ingress Features

### Weighted Routing (Canary)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: canary-ingress
  annotations:
    # nginx-specific canary
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-weight: "10"  # 10% to canary
spec:
  ingressClassName: nginx
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-v1
            port:
              number: 80

---
# Canary version (10% of traffic)
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: canary-ingress-v2
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-weight: "10"
spec:
  ingressClassName: nginx
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-v2
            port:
              number: 80
```

### Default Backend

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: default-backend
spec:
  ingressClassName: nginx

  # Default backend (404 handling)
  defaultBackend:
    service:
      name: default-404
      port:
        number: 80

  rules:
  - host: example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api
            port:
              number: 80
```

## Complete Ingress Example

```yaml
---
# Services
apiVersion: v1
kind: Service
metadata:
  name: api
spec:
  type: ClusterIP
  selector:
    app: api
  ports:
  - port: 80
    targetPort: 8080

---
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  type: ClusterIP
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 3000

---
# TLS Secret
apiVersion: v1
kind: Secret
metadata:
  name: example-tls
type: kubernetes.io/tls
data:
  tls.crt: LS0tLS1CRUdJTi...  # base64 encoded cert
  tls.key: LS0tLS1CRUdJTi...  # base64 encoded key

---
# Ingress Resource
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: production-ingress
  namespace: production
  annotations:
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    nginx.ingress.kubernetes.io/enable-cors: "true"
spec:
  ingressClassName: nginx

  tls:
  - hosts:
    - api.example.com
    - web.example.com
    secretName: example-tls

  rules:
  - host: api.example.com
    http:
      paths:
      - path: /v1
        pathType: Prefix
        backend:
          service:
            name: api
            port:
              number: 80

  - host: web.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web
            port:
              number: 80
```

## Ingress Controller Comparison

### nginx Ingress

**Pros:**

* Lightweight, fast
* Flexible routing (regex support)
* Large community
* Works anywhere

**Cons:**

* Not cloud-native (no load balancer integration)
* Manual management

### AWS ALB Ingress

**Pros:**

* Native AWS integration
* Cost-effective
* Auto-scaling with ALB
* Security group integration

**Cons:**

* AWS-specific
* Requires IAM setup

### Istio Ingress Gateway

**Pros:**

* Advanced traffic management
* mTLS support
* Circuit breaking, retries
* Unified service mesh

**Cons:**

* Complex setup
* Higher resource overhead

## kubectl Commands for Ingress

```bash
# Create Ingress
kubectl apply -f ingress.yaml

# View Ingress
kubectl get ingress

# Detailed information
kubectl describe ing production-ingress

# View Ingress IP (when controller is LoadBalancer)
kubectl get ing production-ingress
# Watch for EXTERNAL-IP assignment
kubectl get ing production-ingress -w

# Get Ingress in YAML
kubectl get ing production-ingress -o yaml

# Edit Ingress
kubectl edit ing production-ingress

# Delete Ingress
kubectl delete ing production-ingress

# Port forward to Ingress Controller
kubectl port-forward -n ingress-nginx \
  svc/ingress-nginx-controller 8080:80
```

## Troubleshooting Ingress

### Check Ingress Status

```bash
# View Ingress
kubectl describe ing my-ingress

# Look for Address (EXTERNAL-IP)
Name:             my-ingress
Namespace:        default
Address:          203.0.113.1
Ingress Class:    nginx
TLS:              example-tls
Rules:
  Host                    Path  Backends
  ----                    ----  --------
  api.example.com         /     api:80 (10.244.1.5:8080)
  web.example.com         /     web:80 (10.244.1.6:3000)
```

### Test Routing

```bash
# Test host-based routing
curl -H "Host: api.example.com" http://ingress-ip

# Test path-based routing
curl http://ingress-ip/api

# Test TLS
curl https://api.example.com

# Debug DNS
nslookup api.example.com
```

### Check Backend Services

```bash
# Verify service exists
kubectl get svc api

# Verify service has endpoints
kubectl get endpoints api

# Check pod is running
kubectl get pods -l app=api
```

## Practical Scenarios

### Scenario 1: Simple Web Application

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 8080

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
spec:
  ingressClassName: nginx
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web
            port:
              number: 80
```

### Scenario 2: Microservices with Path Routing

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: microservices-ingress
spec:
  ingressClassName: nginx
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /users
        pathType: Prefix
        backend:
          service:
            name: users-service
            port:
              number: 80
      - path: /products
        pathType: Prefix
        backend:
          service:
            name: products-service
            port:
              number: 80
      - path: /orders
        pathType: Prefix
        backend:
          service:
            name: orders-service
            port:
              number: 80
```

### Scenario 3: HTTPS with Multiple Certificates

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: multi-tls-ingress
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - api.example.com
    secretName: api-tls
  - hosts:
    - web.example.com
    secretName: web-tls

  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api
            port:
              number: 80

  - host: web.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web
            port:
              number: 80
```

## Summary

Ingress provides HTTP/HTTPS routing and TLS termination for Kubernetes services:

* **Ingress Resource** - Defines routing rules
* **Ingress Controller** - Implements the rules (nginx, AWS ALB, etc.)
* **Host-based routing** - Route by domain name
* **Path-based routing** - Route by URL path
* **TLS termination** - HTTPS/SSL support
* **Load balancing** - Distribute traffic across pods

---

**Key Takeaways:**

* Ingress is for HTTP/HTTPS external access
* More efficient than multiple LoadBalancer services
* Multiple routing strategies available (host, path, hybrid)
* TLS termination at ingress layer
* Controller-specific features via annotations
* Pair with IngressClass to specify controller