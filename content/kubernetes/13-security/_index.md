---
title: Security
linkTitle: Security
type: docs
weight: 13
prev: /kubernetes/12-configuration
next: /kubernetes/14-autoscaling
---

## Overview

Kubernetes security operates at multiple layers: cluster access control, workload isolation, network policies, and admission control. A comprehensive security strategy addresses authentication, authorization, and enforcement.

```
┌──────────────────────────────────────────────────────────┐
│                  Security Layers                         │
│                                                          │
│  Layer 1: Authentication                                 │
│  ├─ Who are you? (Certificates, tokens, OAuth)           │
│                                                          │
│  Layer 2: Authorization (RBAC)                           │
│  ├─ What can you do? (Roles, RoleBindings)               │
│                                                          │
│  Layer 3: Admission Control                              │
│  ├─ Should we allow this? (Webhooks, policies)           │
│                                                          │
│  Layer 4: Pod Security                                   │
│  ├─ How secure is the pod? (Policies, contexts)          │
│                                                          │
│  Layer 5: Network Policies                               │
│  ├─ What traffic is allowed? (Ingress/Egress rules)      │
│                                                          │
│  Layer 6: Encryption                                     │
│  ├─ Is data encrypted? (TLS, secrets at rest)            │
└──────────────────────────────────────────────────────────┘
```

## Authentication and Authorization

### Authentication Flow

```
User (kubectl)
      ↓
API Server receives request
      ↓
Authentication Module
├─ x509 certificate
├─ Bearer token
├─ Basic auth
├─ OAuth/OIDC
      ↓ (verified)
User identity established
      ↓
Authorization (RBAC)
      ├─ Check roles
      ├─ Check permissions
      ↓ (allowed)
Request processed
```

### Authentication Methods

| Method                 | Use Case              | Setup             |
|------------------------|-----------------------|-------------------|
| x509 Certificates      | Users, kubelets       | kubeconfig        |
| Service Account Tokens | Pods, CI/CD           | Automatic         |
| Bearer Tokens          | External integrations | Passed in header  |
| Basic Auth             | Simple testing        | Username:password |
| OIDC                   | Enterprise SSO        | OAuth provide     |

## Role-Based Access Control (RBAC)

### RBAC Mental Model: WHO can do WHAT on WHICH resources WHERE

RBAC controls access through four key questions:

```
┌─────────────────────────────────────────────────────┐
│  WHO     │ Subjects: User, Group, ServiceAccount    │
│  WHAT    │ Verbs: get, list, create, delete, etc.   │
│  WHICH   │ Resources: pods, services, deployments   │
│  WHERE   │ Scope: namespace or cluster-wide         │
└─────────────────────────────────────────────────────┘
```

### RBAC Components

```
Role/ClusterRole
  ├─ Rules (apiGroups, resources, verbs)
  ├─ Namespace-scoped or cluster-scoped
  └─ Example: "can create pods in namespace x"
       ↓
  RoleBinding/ClusterRoleBinding
  ├─ Links Role to User/Group/ServiceAccount
  └─ Example: "User A has this role"
       ↓
  Permission Check
  ├─ User A asks: "Can I create a pod?"
  ├─ Check: User A has Role X
  ├─ Check: Role X allows "create pods"
  └─ Result: Yes/No
```

### RBAC Resources

**Verbs (Actions):**

* get, list, watch (read)
* create, update, patch (write)
* delete, deletecollection (delete)

**Admin-Level Verbs (Security Critical):**

* **impersonate**: Act as another user/group/serviceaccount
* **bind**: Assign roles to users (privilege escalation risk)
* **escalate**: Modify roles with more permissions than you have

**Resources:**

* pods, services, deployments, etc.
* Can use wildcards: pods/\*
* Sub-resources: pods/log, pods/exec, pods/portforward
* Non-resource URLs: /api/\*, /healthz, /metrics, /logs

**API Groups:**

* "" (core): pod, service, configmap, secret
* "apps": deployment, statefulset, daemonset
* "batch": job, cronjob
* "networking.k8s.io": networkpolicy
* "rbac.authorization.k8s.io": roles, rolebindings

**Scope:**

* **Namespace-scoped**: Role + RoleBinding (confined to one namespace)
* **Cluster-scoped**: ClusterRole + ClusterRoleBinding (entire cluster)
* **Hybrid**: ClusterRole + RoleBinding (reuse cluster role in specific namespace)

### Role Definition

```yaml
# Namespace-scoped role
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
  namespace: default
rules:
# Rule 1: Read pods
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]

# Rule 2: Read logs
- apiGroups: [""]
  resources: ["pods/log"]
  verbs: ["get"]

# Rule 3: Create resources with restrictions
- apiGroups: [""]
  resources: ["configmaps"]
  verbs: ["create", "update"]
  resourceNames: ["my-config"]  # Only specific resource

---
# Cluster-wide role
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: cluster-reader
rules:
- apiGroups: [""]
  resources: ["nodes", "namespaces"]
  verbs: ["get", "list", "watch"]
```

### RoleBinding

```yaml
# Bind Role to user in namespace
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: default
subjects:
# User
- kind: User
  name: alice@example.com
  apiGroup: rbac.authorization.k8s.io

# Group
- kind: Group
  name: developers
  apiGroup: rbac.authorization.k8s.io

# Service Account
- kind: ServiceAccount
  name: app-sa
  namespace: default

roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io

---
# Bind ClusterRole to user cluster-wide
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-users
subjects:
- kind: Group
  name: admins
  apiGroup: rbac.authorization.k8s.io

roleRef:
  kind: ClusterRole
  name: cluster-admin
  apiGroup: rbac.authorization.k8s.io
```

### RBAC Examples

#### Example 1: Developer Role

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: developer
  namespace: development
rules:
# Manage pods
- apiGroups: [""]
  resources: ["pods", "pods/log", "pods/exec"]
  verbs: ["get", "list", "watch", "create", "delete"]

# Manage deployments
- apiGroups: ["apps"]
  resources: ["deployments", "replicasets"]
  verbs: ["get", "list", "watch", "create", "update", "patch"]

# Manage services
- apiGroups: [""]
  resources: ["services"]
  verbs: ["get", "list"]

# Read config
- apiGroups: [""]
  resources: ["configmaps", "secrets"]
  verbs: ["get", "list"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: dev-team
  namespace: development
subjects:
- kind: Group
  name: dev-team@example.com
  apiGroup: rbac.authorization.k8s.io

roleRef:
  kind: Role
  name: developer
  apiGroup: rbac.authorization.k8s.io
```

#### Example 2: Read-Only Role

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: viewer
rules:
- apiGroups: [""]
  resources: ["pods", "services", "configmaps"]
  verbs: ["get", "list", "watch"]

- apiGroups: ["apps"]
  resources: ["deployments", "daemonsets", "statefulsets"]
  verbs: ["get", "list", "watch"]

- apiGroups: ["batch"]
  resources: ["jobs", "cronjobs"]
  verbs: ["get", "list", "watch"]
```

### RBAC kubectl Commands

```bash
# Verify RBAC API is enabled
kubectl api-versions | grep rbac
# Output: rbac.authorization.k8s.io/v1

# View roles
kubectl get roles --all-namespaces
kubectl get clusterroles

# Detailed role information
kubectl describe role developer -n development
kubectl describe clusterrole cluster-admin

# View role bindings
kubectl get rolebindings --all-namespaces
kubectl get clusterrolebindings

# Create role/binding imperatively
kubectl create role pod-reader \
  --verb=get --verb=list \
  --resource=pods

kubectl create rolebinding read-pods \
  --role=pod-reader \
  --user=alice@example.com

# Check permissions (simulation only)
kubectl auth can-i create pods
kubectl auth can-i delete deployments -n production
kubectl auth can-i create pods --as=user@example.com
kubectl auth can-i create pods --as=system:serviceaccount:default:my-sa
kubectl auth can-i '*' '*'  # Check if you're cluster admin

# List all permissions for current user
kubectl auth can-i --list

# Impersonate user for testing (actual action)
kubectl get pods --as=alice@example.com
kubectl get pods --as=system:serviceaccount:default:my-sa
```

### RBAC Security Best Practices

**Common Security Risks:**

```
⚠️ Overly Permissive Roles
├─ wildcards in resources: resources: ["*"]
├─ wildcards in verbs: verbs: ["*"]
├─ cluster-admin binding to many users
└─ Risk: Privilege escalation, unauthorized access

⚠️ Dangerous Verb Combinations
├─ create + rolebindings = can grant self more permissions
├─ escalate + bind = can assign roles with higher privileges
├─ impersonate = can act as any user/serviceaccount
└─ Risk: Complete cluster compromise

⚠️ Service Account Token Exposure
├─ Service account tokens auto-mounted in pods
├─ Token accessible to any process in pod
├─ Token persists even after pod needs it
└─ Risk: Credential theft, lateral movement
```

**Mitigation Strategies:**

```yaml
# Disable auto-mounting service account tokens
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-sa
automountServiceAccountToken: false

---
# Or disable per-pod
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  automountServiceAccountToken: false
  containers:
  - name: app
    image: myapp:1.0

---
# Restrict resource names
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: limited-access
rules:
- apiGroups: [""]
  resources: ["configmaps"]
  verbs: ["get", "update"]
  resourceNames: ["allowed-config"]  # Only this specific configmap
```

**RBAC Audit Checklist:**

```
✓ No wildcards (*) in production roles
✓ Minimize cluster-admin bindings
✓ Review verbs: bind, escalate, impersonate
✓ Disable unused service accounts
✓ Rotate service account tokens regularly
✓ Audit RBAC changes (use audit logs)
✓ Implement RBAC policy enforcement (OPA, Kyverno)
✓ Regular access reviews (who has what?)
```

## Pod Security Standards

### Pod Security Problem

```
Without security policies:
├─ Pod runs as root (privileged)
├─ Mounts host filesystem
├─ Uses host network
├─ No resource limits
└─ Access to system calls

Risks:
✗ Container escape
✗ Host compromise
✗ Resource exhaustion
✗ Privilege escalation
```

### Pod Security Standards (PSS)

Pod Security Standards define security policies at three levels:

```
Restricted (Most secure)
├─ Run as non-root
├─ No privileged containers
├─ No host access
├─ Limited capabilities
├─ Read-only root filesystem
└─ Resource limits required
       ↓
Baseline (Minimal restrictions)
├─ Allow some privileges
├─ Basic security
       ↓
Privileged (Least secure)
└─ No restrictions
```

### Pod Security Policies (Deprecated)

```yaml
# Old approach: PodSecurityPolicy (deprecated in 1.25+)
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: restricted
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
  - ALL
  volumes:
  - 'configMap'
  - 'emptyDir'
  - 'projected'
  - 'secret'
  - 'downwardAPI'
  - 'persistentVolumeClaim'
  hostNetwork: false
  hostIPC: false
  hostPID: false
  runAsUser:
    rule: 'MustRunAsNonRoot'
  readOnlyRootFilesystem: false
```

### Pod Security Admission (PSA)

**Pod Security Admission** is a built-in admission controller (enabled by default in Kubernetes 1.25+) that enforces Pod Security Standards.

**How it works:**

```
Pod creation request
       ↓
API Server
       ↓
Pod Security Admission Controller
├─ Check namespace labels
├─ Determine security level (restricted/baseline/privileged)
├─ Validate pod spec against standard
├─ Mode: enforce (reject) | audit (log) | warn (warn user)
       ↓
Accept or Reject pod
```

**Namespace-level enforcement:**

```yaml
# Label namespace to enforce pod security standards
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    # Enforce: Reject non-compliant pods
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/enforce-version: latest

    # Audit: Log violations (doesn't block)
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/audit-version: latest

    # Warn: Show warning to user (doesn't block)
    pod-security.kubernetes.io/warn: restricted
    pod-security.kubernetes.io/warn-version: latest
```

### Pod Security Contexts

A **SecurityContext** defines privilege and access control settings for pods and containers.

**Two levels:**

```
Pod-level securityContext
  ├─ Applies to all containers in pod
  └─ Example: runAsUser, fsGroup, seccompProfile

Container-level securityContext
  ├─ Applies to specific container
  ├─ Overrides pod-level settings
  └─ Example: capabilities, readOnlyRootFilesystem
```

### Linux Security Mechanisms

Kubernetes leverages several Linux kernel security features:

**1. Seccomp (Secure Computing Mode)**

```
What: Restricts system calls a container can make
Why: Prevents container from exploiting kernel vulnerabilities
How: Syscall filtering using BPF (Berkeley Packet Filter)

Example blocked syscalls:
├─ reboot, mount, umount
├─ ptrace (debugging)
├─ clock_settime (time manipulation)
└─ keyctl (kernel key management)
```

**2. Linux Capabilities**

```
What: Fine-grained permissions (instead of all-or-nothing root)
Why: Allows specific privileges without full root access

Common capabilities:
├─ CAP_NET_BIND_SERVICE: Bind to ports < 1024
├─ CAP_SYS_TIME: Set system clock
├─ CAP_NET_ADMIN: Network configuration
├─ CAP_SYS_ADMIN: Broad admin privileges (dangerous!)
└─ CAP_CHOWN: Change file ownership
```

### Secure Pod Example

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
spec:
  # Pod-level security context
  securityContext:
    runAsUser: 1000              # Run as non-root user
    runAsGroup: 3000             # Primary group
    runAsNonRoot: true           # Enforce non-root
    fsGroup: 2000                # File system group for volumes
    fsGroupChangePolicy: "OnRootMismatch"  # Only chown if needed

    # Seccomp: Restrict system calls
    seccompProfile:
      type: RuntimeDefault       # Use container runtime's default profile
      # Alternative: type: Localhost, localhostProfile: profiles/custom.json

  containers:
  - name: app
    image: myapp:1.0

    # Container-level security context (overrides pod-level)
    securityContext:
      allowPrivilegeEscalation: false    # Prevent gaining more privileges
      privileged: false                   # Not a privileged container
      readOnlyRootFilesystem: true       # Immutable root filesystem
      runAsNonRoot: true                 # Double-check non-root
      runAsUser: 1000                    # Specific UID

      # Capabilities: Drop all, add only what's needed
      capabilities:
        drop:
        - ALL                    # Drop all capabilities
        add:
        - NET_BIND_SERVICE       # Only add required capability (port < 1024)

    resources:
      requests:
        memory: "64Mi"
        cpu: "100m"
      limits:
        memory: "128Mi"
        cpu: "200m"

    # Read-only root filesystem requires writable paths
    volumeMounts:
    - name: tmp
      mountPath: /tmp            # Writable temp directory
    - name: cache
      mountPath: /app/cache      # Writable cache directory

  volumes:
  - name: tmp
    emptyDir: {}
  - name: cache
    emptyDir: {}
```

### Security Context Fields Explained

| Field                    | Level         | Purpose              | Example           |
|--------------------------|---------------|----------------------|-------------------|
| runAsUser                | Pod/Container | UID to run process   | `1000` (non-root) |
| runAsGroup               | Pod/Container | Primary GID          | `3000`            |
| runAsNonRoot             | Pod/Container | Enforce non-root     | `true`            |
| fsGroup                  | Pod           | Group ID for volumes | `2000`            |
| seccompProfile           | Pod/Container | Syscall filtering    | `RuntimeDefault`  |
| capabilities             | Container     | Linux capabilities   | `drop: [ALL]`     |
| privileged               | Container     | Run as privileged    | `false`           |
| allowPrivilegeEscalation | Container     | Gain more privileges | `false`           |
| readOnlyRootFilesystem   | Container     | Immutable root       | `true`            |

### Seccomp Profiles

**Seccomp profile types:**

```yaml
# 1. RuntimeDefault - Use container runtime's default profile (recommended)
seccompProfile:
  type: RuntimeDefault

# 2. Unconfined - No restrictions (insecure, for debugging only)
seccompProfile:
  type: Unconfined

# 3. Localhost - Custom profile on node
seccompProfile:
  type: Localhost
  localhostProfile: profiles/audit.json  # Path: /var/lib/kubelet/seccomp/
```

**Custom Seccomp profile example:**

```
{
  "defaultAction": "SCMP_ACT_ERRNO",
  "architectures": ["SCMP_ARCH_X86_64"],
  "syscalls": [
    {
      "names": [
        "accept4", "access", "arch_prctl", "bind", "brk",
        "close", "connect", "dup", "epoll_create1", "epoll_ctl",
        "exit_group", "fcntl", "fstat", "futex", "getcwd",
        "getpid", "getsockname", "getsockopt", "listen", "mmap",
        "open", "openat", "read", "readv", "rt_sigaction",
        "rt_sigprocmask", "setsockopt", "socket", "write", "writev"
      ],
      "action": "SCMP_ACT_ALLOW"
    }
  ]
}
```

### Checking Security Settings

```bash
# Check pod security context
kubectl get pod secure-pod -o jsonpath='{.spec.securityContext}' | jq

# Check container security context
kubectl get pod secure-pod -o jsonpath='{.spec.containers[0].securityContext}' | jq

# Check which user process runs as (exec into pod)
kubectl exec secure-pod -- id
# Output: uid=1000 gid=3000 groups=2000,3000

# Check seccomp profile
kubectl get pod secure-pod -o jsonpath='{.spec.securityContext.seccompProfile}'

# Check namespace pod security labels
kubectl get namespace production -o yaml | grep pod-security

# Validate pod against security standards
kubectl label namespace default pod-security.kubernetes.io/enforce=restricted
kubectl run test --image=nginx  # Will fail if not compliant
```

## Network Policies

A **NetworkPolicy** controls traffic flow between pods and from external sources.

### Network Policy Problem

```
Without NetworkPolicy:
  All pods can communicate with all other pods
  ├─ Pod A ←→ Pod B
  ├─ Pod A ←→ Pod C
  ├─ Pod B ←→ Pod C
  └─ External ←→ Any Pod

Risk:
  ✗ Compromised pod can attack others
  ✗ No microsegmentation
  ✗ Lateral movement possible
```

### Network Policy Solution

```
With NetworkPolicy:
  ├─ Ingress: Define who can communicate TO this pod
  ├─ Egress: Define who this pod can communicate TO
  └─ Behavior: Once a NetworkPolicys podSelector matches a pod, that pod becomes
               isolated and ONLY explicitly allowed traffic is permitted

Important: Kubernetes default = ALLOW ALL (no isolation)
           NetworkPolicy must be created to enable isolation

Example:
  frontend pod
    ├─ Ingress: Allow from internet
    ├─ Egress: Allow to backend only

  backend pod
    ├─ Ingress: Allow from frontend only
    ├─ Egress: Allow to database only

  database pod
    ├─ Ingress: Allow from backend only
    └─ Egress: None (or minimal)
```

### NetworkPolicy Examples

#### Example 1: Default Deny All

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
spec:
  podSelector: {}  # Applies to all pods in namespace
  policyTypes:
  - Ingress
  - Egress

---
# Result:
# • All pods: No ingress traffic allowed
# • All pods: No egress traffic allowed
# • Must explicitly allow necessary traffic
```

#### Example 2: Allow Frontend to Speak to Backend

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend-to-backend
spec:
  podSelector:
    matchLabels:
      tier: backend
  policyTypes:
  - Ingress

  ingress:
  - from:
    - podSelector:
        matchLabels:
          tier: frontend
    ports:
    - protocol: TCP
      port: 8080
```

#### Example 3: Complete Microservices Network

```yaml
# Deny all by default
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress

---
# Frontend: Accept from internet, talk to backend
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend
spec:
  podSelector:
    matchLabels:
      tier: frontend
  policyTypes:
  - Ingress
  - Egress

  ingress:
  - from:
    - namespaceSelector: {}  # From any namespace (internet)
    ports:
    - protocol: TCP
      port: 80

  egress:
  # Allow DNS
  - to:
    - podSelector:
        matchLabels:
          k8s-app: kube-dns
    ports:
    - protocol: UDP
      port: 53

  # Allow to backend
  - to:
    - podSelector:
        matchLabels:
          tier: backend
    ports:
    - protocol: TCP
      port: 8080

---
# Backend: Accept from frontend, talk to database
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-backend
spec:
  podSelector:
    matchLabels:
      tier: backend
  policyTypes:
  - Ingress
  - Egress

  ingress:
  - from:
    - podSelector:
        matchLabels:
          tier: frontend
    ports:
    - protocol: TCP
      port: 8080

  egress:
  # Allow DNS
  - to:
    - podSelector:
        matchLabels:
          k8s-app: kube-dns
    ports:
    - protocol: UDP
      port: 53

  # Allow to database
  - to:
    - podSelector:
        matchLabels:
          tier: database
    ports:
    - protocol: TCP
      port: 5432

---
# Database: Accept from backend only
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-database
spec:
  podSelector:
    matchLabels:
      tier: database
  policyTypes:
  - Ingress

  ingress:
  - from:
    - podSelector:
        matchLabels:
          tier: backend
    ports:
    - protocol: TCP
      port: 5432
```

### Network Policy Commands

```bash
# View network policies
kubectl get networkpolicies
kubectl get netpol

# Detailed information
kubectl describe netpol allow-frontend

# Delete network policy
kubectl delete netpol allow-frontend
```

## Admission Controllers

**Admission Controllers** are plugins that intercept API requests after authentication and authorization, but before persisting to etcd, they can modify or reject them.

### Admission Controllers vs Admission Webhooks

**Key Distinction:**

```
Admission Controllers (Umbrella Term)
├─ Built-in Admission Controllers
│   ├─ Compiled into API server binary
│   ├─ Cannot be modified without recompiling
│   ├─ Examples: ResourceQuota, LimitRanger, PodSecurityAdmission
│   └─ Enabled via API server flags
│
└─ Admission Webhooks (Dynamic/External)
    ├─ Custom logic in external HTTP service
    ├─ You write and deploy the webhook service
    ├─ API server makes HTTP calls to your service
    └─ Types: ValidatingAdmissionWebhook, MutatingAdmissionWebhook
```

**Relationship:**

```
Request → API Server → Authentication → Authorization
                           ↓
                   Admission Phase
                   ┌─────────────────────────────────┐
                   │  1. Mutating Admission          │
                   │     ├─ Built-in AC (mutating)   │
                   │     └─ MutatingWebhooks         │
                   │           ↓                     │
                   │  2. Object Schema Validation    │
                   │           ↓                     │
                   │  3. Validating Admission        │
                   │     ├─ Built-in AC (validating) │
                   │     └─ ValidatingWebhooks       │
                   └─────────────────────────────────┘
                           ↓
                   Persist to etcd
```

**Note:** All admission controllers (built-in and webhooks) must pass - if any fails, the entire request is rejected.

### Common Built-in Admission Controllers

**Built-in (compiled into API server):**

| Controller           | Type       | Purpose                                       |
|----------------------|------------|-----------------------------------------------|
| ServiceAccount       | Mutating   | Auto-inject service account token             |
| DefaultStorageClass  | Mutating   | Set default storage class if not specified    |
| LimitRanger          | Validating | Enforce min/max resource limits per namespace |
| ResourceQuota        | Validating | Enforce resource quotas per namespace         |
| PodSecurityAdmission | Validating | Enforce pod security standards (1.25+)        |
| NamespaceLifecycle   | Validating | Prevent operations in terminating namespaces  |
| PodSecurityPolicy    | Both       | Enforce pod security (deprecated in 1.25)     |

**Webhook-based (external services):**

| Controller                 | Type       | Purpose                                     |
|----------------------------|------------|---------------------------------------------|
| ValidatingAdmissionWebhook | Validating | Call external service for custom validation |
| MutatingAdmissionWebhook   | Mutating   | Call external service for custom mutations  |

**Popular Webhook Implementations:**

* **OPA Gatekeeper**: Policy enforcement using Open Policy Agent
* **Kyverno**: Kubernetes-native policy management
* **Istio**: Service mesh admission webhook
* **Cert-manager**: Certificate management webhook

### Enable Admission Controllers

```bash
# Check enabled admission controllers
kubectl -n kube-system get pod kube-apiserver-master \
  -o jsonpath='{.spec.containers[0].command}' | grep enable-admission-plugins
```

### Validating Webhook Example

```yaml
apiVersion: admissionregistration.k8s.io/v1
kind: ValidatingWebhookConfiguration
metadata:
  name: image-policy-webhook
webhooks:
- name: image-policy.example.com
  clientConfig:
    service:
      name: image-policy
      namespace: default
      path: "/validate"
    caBundle: LS0tLS1CRUdJTi... (base64 cert)
  rules:
  - operations: ["CREATE", "UPDATE"]
    apiGroups: [""]
    apiVersions: ["v1"]
    resources: ["pods"]
  admissionReviewVersions: ["v1"]
  sideEffects: None

---
# Example webhook service that only allows images from registry
apiVersion: v1
kind: Service
metadata:
  name: image-policy
spec:
  ports:
  - port: 443
    targetPort: 8443
  selector:
    app: image-policy
```

## Service Accounts

A **ServiceAccount** is an identity for processes running in pods.

**Note:** Every namespace automatically gets a `default` ServiceAccount created by Kubernetes (via the ServiceAccount admission controller). Pods use this by default unless a different ServiceAccount is specified.

### Service Account Benefits

```
Pod using ServiceAccount:
  ├─ Unique identity
  ├─ Token for API authentication
  ├─ RBAC permissions
  └─ Secrets access (if authorized)

Example:
  Pod A: service account "app-sa"
  Pod B: service account "monitoring-sa"

  Pod A can:
  ├─ Query pods (if role allows)
  └─ Cannot delete deployments

  Pod B can:
  ├─ Read metrics
  └─ Cannot modify pods
```

### Creating Service Accounts

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-sa
  namespace: default

---
# Create role for service account
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: app-role
  namespace: default
rules:
- apiGroups: [""]
  resources: ["configmaps"]
  verbs: ["get", "list"]

---
# Bind role to service account
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: app-role-binding
subjects:
- kind: ServiceAccount
  name: app-sa
  namespace: default
roleRef:
  kind: Role
  name: app-role
  apiGroup: rbac.authorization.k8s.io

---
# Pod uses service account
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  serviceAccountName: app-sa
  containers:
  - name: app
    image: myapp:1.0

    # Token is automatically mounted at:
    # /var/run/secrets/kubernetes.io/serviceaccount/token
    # ca.crt and namespace also mounted
```

### Service Account Token

```bash
# Automatically mounted in pod:
/var/run/secrets/kubernetes.io/serviceaccount/

# Inside pod:
cat /var/run/secrets/kubernetes.io/serviceaccount/token

# Use token to authenticate:
curl -H "Authorization: Bearer $(cat token)" \
  https://kubernetes.default.svc/api/v1/pods
```

## IRSA (IAM Roles for Service Accounts) - AWS EKS

**IRSA** allows Kubernetes ServiceAccounts to assume AWS IAM roles.

```
Without IRSA:
  Pod needs to access AWS S3
  ├─ Hardcoded AWS credentials (insecure)
  ├─ Shared credentials for all pods
  └─ Difficult to rotate

With IRSA:
  Pod:
    └─ Kubernetes ServiceAccount
            ↓
           IRSA
            ↓
         AWS IAM Role
            ↓
         AWS Permissions (S3, etc)

  Benefits:
  ✓ Separate IAM role per service account
  ✓ Fine-grained permissions
  ✓ Automatic credential rotation
  ✓ No hardcoded secrets
```

### IRSA Setup

```bash
# 1. Create IAM role with trust policy
Trust: ServiceAccount "myapp" in EKS cluster

# 2. Create Kubernetes ServiceAccount
kubectl create serviceaccount myapp

# 3. Annotate ServiceAccount with IAM role ARN
kubectl annotate serviceaccount myapp \
  eks.amazonaws.com/role-arn=arn:aws:iam::ACCOUNT:role/myapp-role

# 4. Pod uses ServiceAccount
# → IRSA webhook mutates pod
# → Adds AWS_ROLE_ARN and AWS_WEB_IDENTITY_TOKEN_FILE env vars
# → Pod assumes IAM role
# → Temporary credentials obtained
```

### IRSA Example

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: myapp
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789:role/myapp-role

---
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  serviceAccountName: myapp
  containers:
  - name: app
    image: myapp:1.0
    # Pod can access S3 via assumed role
    command:
    - /bin/sh
    - -c
    - aws s3 ls  # Uses credentials from assumed role
```

## Security Checklist

```
Authentication
  ✓ Use kubeconfig with certificates
  ✓ Rotate certificates regularly
  ✓ Use OIDC for user authentication
  ✓ Disable basic auth
  ✓ Use strong service account tokens

Authorization (RBAC)
  ✓ Implement principle of least privilege
  ✓ Use ClusterRoles for common permissions
  ✓ Regular audit of permissions
  ✓ Remove unused roles/bindings
  ✓ Use namespace-scoped roles when possible

Pod Security
  ✓ Run containers as non-root
  ✓ Use read-only root filesystem
  ✓ Drop unnecessary capabilities
  ✓ Use security context
  ✓ Set resource requests/limits
  ✓ Use pod security policies/standards

Network Security
  ✓ Implement network policies (isolation is opt-in)
  ✓ Start with deny-all NetworkPolicy per namespace
  ✓ Explicitly allow only necessary traffic
  ✓ Encrypt network traffic (TLS)
  ✓ Use service mesh for mTLS

Data Security
  ✓ Encrypt secrets at rest
  ✓ Use external secrets management
  ✓ Rotate secrets regularly
  ✓ Audit secret access
  ✓ Never log sensitive data

Admission Control
  ✓ Enable Pod Security Standards
  ✓ Use image registries with scanning
  ✓ Validate resource compliance
  ✓ Enforce security policies
```

## Summary

Kubernetes security operates in layers:

* **Authentication** - Verify identity (certificates, tokens, OIDC)
* **Authorization (RBAC)** - Control what users/services can do
* **Admission Control** - Enforce policies at request time
* **Pod Security** - Restrict pod capabilities and privileges
* **Network Policies** - Control traffic between pods
* **Encryption** - Protect data at rest and in transit

---

**Key Takeaways:**

* Use RBAC to implement least privilege
* Implement network policies for microsegmentation
* Use Pod Security Standards to harden pods
* Enable encryption at rest for secrets
* Audit access regularly
* Consider external secrets management
* Use IRSA on AWS for pod AWS access
