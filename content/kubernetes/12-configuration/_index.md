---
title: Configuration Management
linkTitle: Configuration Management
type: docs
weight: 12
prev: /kubernetes/11-storage
next: /kubernetes/13-security
---

## Overview

**Configuration Management** in Kubernetes refers to managing application configuration and sensitive data separately from container images (decouple configuration data from application code). This enables the same container image to be deployed across different environments (dev, staging, production) with different configurations.

```
┌────────────────────────────────────────────────────────┐
│           Configuration Management                     │
│                                                        │
│  ┌───────────────────┐      ┌──────────────────┐       │
│  │    ConfigMap      │      │     Secret       │       │
│  │                   │      │                  │       │
│  │ • Non-sensitive   │      │ • Sensitive data │       │
│  │   config          │      │   (encrypted)    │       │
│  │ • Settings        │      │ • Passwords      │       │
│  │ • Feature flags   │      │ • API keys       │       │
│  │                   │      │ • Certificates   │       │
│  └─────────┬─────────┘      └────────┬─────────┘       │
│            │                         │                 │
│            └─────────────┬───────────┘                 │
│                          │                             │
│                    Pod: volumeMount                    │
│                    or env variables                    │
│                          ↓                             │
│                    Application                         │
└────────────────────────────────────────────────────────┘
```

## Configuration Problem

### Hardcoded Configuration

```
Container Image: myapp:1.0
Hardcoded in application code:
  DATABASE_HOST = "db.prod.example.com"
  API_KEY = "secret123"
  LOG_LEVEL = "INFO"
  FEATURE_FLAG = true

Issues:
  ✗ Different config per environment
  ✗ Repackaging needed for env changes
  ✗ Secrets in code (security risk)
  ✗ Config changes require image rebuild
  ✗ Not following 12-factor app principles
```

### Solution: Externalized Configuration

```
Container Image: myapp:1.0 (same for all environments)
         ↓
Configuration injected at runtime:

Development:
  DATABASE_HOST = "db.dev.example.com"
  API_KEY = "dev_key_123"
  LOG_LEVEL = "DEBUG"

Staging:
  DATABASE_HOST = "db.staging.example.com"
  API_KEY = "staging_key_456"
  LOG_LEVEL = "INFO"

Production:
  DATABASE_HOST = "db.prod.example.com"
  API_KEY = "prod_key_789"
  LOG_LEVEL = "WARN"

Benefits:
  ✓ One image, multiple environments
  ✓ Secrets encrypted
  ✓ Configuration as code
  ✓ Easy updates without rebuild
```

## ConfigMaps

A **ConfigMap** is a Kubernetes object that stores non-sensitive configuration data as key-value pairs.

### ConfigMap Characteristics

* Non-sensitive data only
* Data stored as plain text
* Up to 1MB per ConfigMap
* Can be created from files, directories, literals
* Mounted as volumes or environment variables
* By default, Pods do not reload automatically when a ConfigMap is updated

### Creating ConfigMaps

#### Method 1: Imperative (Simple Data)

```bash
# Single key-value
kubectl create configmap app-config \
  --from-literal=database.host=db.example.com \
  --from-literal=database.port=5432

# Verify
kubectl get configmap app-config -o yaml
```

#### Method 2: From File

```bash
# Create local config file
cat > app.properties << EOF
database.host=db.example.com
database.port=5432
api.timeout=30
log.level=INFO
EOF

# Create ConfigMap from file
kubectl create configmap app-config \
  --from-file=app.properties

# Verify
kubectl get configmap app-config -o yaml
```

#### Method 3: From Directory

```bash
# Create config files
mkdir config
echo "db.example.com" > config/db-host
echo "5432" > config/db-port
echo "30" > config/timeout

# Create ConfigMap from directory
kubectl create configmap app-config \
  --from-file=config/

# Each file becomes a key
# db-host, db-port, timeout
```

#### Method 4: Declarative YAML

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: default
data:
  database.host: "db.example.com"
  database.port: "5432"
  app.properties: |
    api.timeout=30
    log.level=INFO
  config.yaml: |
    database:
      host: db.example.com
      port: 5432
    features:
      cache: enabled
      metrics: enabled
```

### Using ConfigMaps

#### Method 1: Environment Variables

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
  - name: app
    image: myapp:1.0
    env:
    # Direct value
    - name: DATABASE_HOST
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: database.host
    - name: DATABASE_PORT
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: database.port

    # All keys as environment variables
    envFrom:
    - configMapRef:
        name: app-config
```

#### Method 2: Volume Mount (File)

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
  - name: app
    image: myapp:1.0
    volumeMounts:
    - name: config
      mountPath: /etc/config

  volumes:
  - name: config
    configMap:
      name: app-config
      defaultMode: 0644  # File permissions
```

### ConfigMap File Structure in Volume

```
ConfigMap: app-config
  data:
    database.host: "db.example.com"
    app.properties: |
      api.timeout=30
      log.level=INFO

Mounted at /etc/config:
/etc/config/
├── database.host (file containing "db.example.com")
└── app.properties (file containing multi-line content)
```

### ConfigMap Size Limits

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  # Maximum 1MB total per ConfigMap
  # For larger files, use external storage
  large-config: |
    ... up to 1MB ...
```

## Secrets

A **Secret** is a Kubernetes object that stores sensitive data in encrypted form.

### Secret Characteristics

* Sensitive data (passwords, tokens, certs)
* Data stored base64-encoded (not encrypted by default!)
* Up to 1MB per Secret
* Only passed to pods that need them
* Not logged in audit logs (by default)

### Secret Types

| Type                                | Purpose                       |
|-------------------------------------|-------------------------------|
| Opaque                              | Arbitrary user data (default) |
| kubernetes.io/service-account-token | Service account token         |
| kubernetes.io/dockercfg             | Docker config                 |
| kubernetes.io/dockerconfigjson      | Docker registry credentials   |
| kubernetes.io/basic-auth            | Basic authentication          |
| kubernetes.io/ssh-auth              | SSH authentication            |
| kubernetes.io/tls                   | TLS certificate and key       |
| bootstrap.kubernetes.io/token       | Bootstrap token               |

### Creating Secrets

#### Method 1: Imperative

```bash
# From literal values
kubectl create secret generic db-password \
  --from-literal=password=mysecretpassword

# From file
kubectl create secret generic db-password \
  --from-file=password.txt

# Docker registry credentials
kubectl create secret docker-registry dockerhub-creds \
  --docker-server=docker.io \
  --docker-username=username \
  --docker-password=password \
  --docker-email=email@example.com

# TLS certificate
kubectl create secret tls my-cert \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key
```

#### Method 2: Declarative YAML

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
stringData:  # Kubernetes automatically base64 encodes
  username: admin
  password: secretpassword

---
# TLS Secret
apiVersion: v1
kind: Secret
metadata:
  name: app-tls
type: kubernetes.io/tls
data:
  tls.crt: LS0tLS1CRUdJTi... (base64 encoded cert)
  tls.key: LS0tLS1CRUdJTi... (base64 encoded key)

---
# Docker Registry Secret
apiVersion: v1
kind: Secret
metadata:
  name: dockerhub
type: kubernetes.io/dockerconfigjson
data:
  .dockerconfigjson: eyJhdXRocyI6eyJkb2NrZXIuaW8iOnt... (base64)
```

### Using Secrets

#### Method 1: Environment Variables

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
  - name: app
    image: myapp:1.0
    env:
    # From Secret
    - name: DB_USERNAME
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: username
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: password
```

#### Method 2: Volume Mount

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
  - name: app
    image: myapp:1.0
    volumeMounts:
    - name: db-credentials
      mountPath: /etc/secrets
      readOnly: true

  volumes:
  - name: db-credentials
    secret:
      secretName: db-secret
      defaultMode: 0400  # Read-only, owner only
```

#### Method 3: Docker Image Pull

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  imagePullSecrets:
  - name: dockerhub  # Reference Docker registry secret

  containers:
  - name: app
    image: private-registry.example.com/myapp:1.0
```

### Secret Security

```
Base64 Encoding vs Encryption:

base64 encoding:
  echo "mysecret" | base64
  → bXlzZWNyZXQ=

  Decoding is trivial:
  echo "bXlzZWNyZXQ=" | base64 -d
  → mysecret

Kubernetes etcd:
  By default, secrets stored as base64 in etcd
  ✗ Not secure at rest
  ✓ Secure in transit (etcd needs authentication)

Best Practices:
  ✓ Enable encryption at rest in etcd
  ✓ Restrict RBAC access to secrets
  ✓ Use a secrets management system (Vault, external)
  ✓ Use strong credentials
  ✓ Rotate secrets regularly
```

## ConfigMap vs Secret

| Aspect         | ConfigMap               | Secret                            |
|----------------|-------------------------|-----------------------------------|
| Data Type      | Non-sensitive config    | Sensitive data                    |
| Size Limit     | 1MB                     | 1MB                               |
| Encoding       | Plain text              | base64 (not encrypted by default) |
| Use Case       | Settings, feature flags | Passwords, tokens, certs          |
| Audit Logging  | Full logging            | Limited logging                   |
| Access Control | RBAC                    | RBAC + encryption                 |

## Configuration Best Practices

### 1. Separate Concerns

```yaml
# ✓ Good: Separate ConfigMap and Secret
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  log.level: INFO
  api.timeout: 30

---
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
stringData:
  db.password: mypassword
  api.key: secret-key

# ✗ Bad: Secrets in ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  db.password: mypassword  # ✗ Security risk!
  api.key: secret-key      # ✗ Not encrypted
```

### 2. Use Volume Mounts for Large Files

```yaml
# ✓ Good: Volume mount for config files
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
  - name: app
    image: myapp:1.0
    volumeMounts:
    - name: config
      mountPath: /etc/app/config

  volumes:
  - name: config
    configMap:
      name: app-config

# ✗ Problematic: Many env vars
env:
- name: VAR1
  valueFrom: configMapKeyRef...
- name: VAR2
  valueFrom: configMapKeyRef...
# ... 50 more variables ...
```

### 3. Use Subpaths for Selective Files

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
  - name: app
    image: myapp:1.0
    volumeMounts:
    # Mount only specific file
    - name: main-config
      mountPath: /etc/app/config.yaml
      subPath: config.yaml

  volumes:
  - name: main-config
    configMap:
      name: app-config
```

### 4. Use External Secrets Management

```
Kubernetes Secrets: Base64 (not encrypted)
         ↓
Use external system:
  ├─ HashiCorp Vault
  ├─ AWS Secrets Manager
  ├─ Google Secret Manager
  ├─ Azure Key Vault
  └─ External Secrets Operator

┌──────────────────────────────────────┐
│  External Secret (Kubernetes)        │
│  Syncs with Vault                    │
│         ↓                            │
│  Secret (Kubernetes) - encrypted     │
│         ↓                            │
│  Pod (accesses secret)               │
└──────────────────────────────────────┘
```

### 5. Immutable ConfigMaps/Secrets

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: immutable-config
immutable: true  # Cannot be changed after creation
data:
  setting: "value"

# To change: Delete and recreate

# Benefits:
# ✓ Prevents accidental modifications
# ✓ Improved performance (kubelet doesn't watch)
# ✓ Clear intent
```

## Configuration Patterns

### Pattern 1: Environment-Specific Config

```bash
# Create ConfigMaps for each environment
kubectl create configmap app-config-dev \
  --from-literal=log.level=DEBUG \
  --from-literal=db.host=db.dev.example.com

kubectl create configmap app-config-prod \
  --from-literal=log.level=WARN \
  --from-literal=db.host=db.prod.example.com
```

```yaml
# Deployment references env-specific ConfigMap
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  replicas: 3
  template:
    metadata:
      labels:
        app: app
    spec:
      containers:
      - name: app
        image: myapp:1.0
        envFrom:
        - configMapRef:
            name: app-config-${ENVIRONMENT}
            # dev → app-config-dev
            # prod → app-config-prod
```

### Pattern 2: Feature Flags in ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: feature-flags
data:
  features.json: |
    {
      "cache": true,
      "newUI": false,
      "betaFeatures": true,
      "analytics": true
    }

---
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
  - name: app
    image: myapp:1.0
    volumeMounts:
    - name: features
      mountPath: /etc/config/features

  volumes:
  - name: features
    configMap:
      name: feature-flags
```

### Pattern 3: Multi-File Configuration

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  # Configuration files
  app.properties: |
    server.port=8080
    server.ssl.enabled=true

  logging.yaml: |
    version: 1
    loggers:
      root:
        level: INFO

  database.conf: |
    [postgresql]
    host=db.example.com
    port=5432

---
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
  - name: app
    image: myapp:1.0
    volumeMounts:
    - name: config
      mountPath: /etc/app/config

  volumes:
  - name: config
    configMap:
      name: app-config
      defaultMode: 0644
      # Files will be:
      # /etc/app/config/app.properties
      # /etc/app/config/logging.yaml
      # /etc/app/config/database.conf
```

## kubectl Commands

```bash
# Create ConfigMap
kubectl create configmap app-config \
  --from-literal=key=value \
  --from-file=config.yaml

# View ConfigMaps
kubectl get configmaps

# Detailed information
kubectl describe cm app-config

# Get ConfigMap as YAML
kubectl get cm app-config -o yaml

# Edit ConfigMap
kubectl edit cm app-config

# Delete ConfigMap
kubectl delete cm app-config

# Create Secret
kubectl create secret generic db-secret \
  --from-literal=password=secret

# View Secrets
kubectl get secrets

# View secret (base64 encoded)
kubectl get secret db-secret -o yaml

# Decode secret value
kubectl get secret db-secret -o jsonpath='{.data.password}' | base64 -d

# Delete Secret
kubectl delete secret db-secret
```

## Practical Example: Complete Configuration Setup

```yaml
---
# ConfigMap: Non-sensitive configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  LOG_LEVEL: INFO
  API_TIMEOUT: "30"
  CACHE_ENABLED: "true"
  app.properties: |
    server.port=8080
    server.ssl.enabled=true

---
# Secret: Sensitive configuration
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
stringData:
  DB_PASSWORD: secretpassword
  API_KEY: secret-api-key-123
  JWT_SECRET: jwt-signing-secret

---
# Deployment: Uses both ConfigMap and Secret
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: app
  template:
    metadata:
      labels:
        app: app
    spec:
      containers:
      - name: app
        image: myapp:1.0

        # Environment variables from ConfigMap
        envFrom:
        - configMapRef:
            name: app-config

        # Environment variables from Secret
        - secretRef:
            name: app-secret

        # Volume mount for configuration file
        volumeMounts:
        - name: config-files
          mountPath: /etc/app/config

      # Volumes
      volumes:
      - name: config-files
        configMap:
          name: app-config
          defaultMode: 0644
```

## Summary

Configuration Management separates configuration from container images:

* **ConfigMaps** - Non-sensitive configuration data
* **Secrets** - Sensitive data (passwords, tokens, certificates)
* **Environment variables** - For simple, dynamic values
* **Volume mounts** - For configuration files

**Key principles:**

* Keep secrets out of container images
* Use ConfigMaps for non-sensitive settings
* Use Secrets for sensitive data
* Implement proper RBAC and encryption
* Consider external secrets management for production
* Make ConfigMaps/Secrets immutable when appropriate

---

**Key Takeaways:**

* ConfigMaps for non-sensitive, Secrets for sensitive data
* Volume mounts for file-based configuration
* Environment variables for simple values
* Always encrypt secrets at rest in production
* Use external secrets management for better security
* Separate configuration by environment
