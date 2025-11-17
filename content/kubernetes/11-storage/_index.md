---
title: Storage
linkTitle: Storage
type: docs
weight: 11
prev: /kubernetes/10-ingress
next: /kubernetes/12-configuration
---

## Overview

Kubernetes provides several abstractions for managing persistent data and temporary storage. Storage is critical for databases, file systems, and any application requiring data persistence beyond pod lifecycle.

```
┌──────────────────────────────────────────────────────┐
│                  Storage Abstraction                 │
│                                                      │
│  Application Pod                                     │
│      ↓                                               │
│  ┌────────────────────────────────┐                  │
│  │  volumeMount (Pod perspective) │                  │
│  └────────────────┬───────────────┘                  │
│                   │                                  │
│  Volume (K8s abstraction)                            │
│  ┌─────────┬──────────┬──────────┬──────────┐        │
│  │ emptyDir│ hostPath │ConfigMap │Persistent│        │
│  │(ephemral) (node)   │Secrets   │ Volume   │        │
│  └─────────┴──────────┴──────────┴─────┬────┘        │
│                                        │             │
│                                   Storage Backend    │
│                          (Local disk, NFS, EBS, etc) │
└──────────────────────────────────────────────────────┘
```

## Storage Problem

### Ephemeral Pod Storage

```
Pod with ephemeral storage:
┌─────────────┐
│   Pod       │
│  ┌─────┐    │
│  │ app │    │
│  └─────┘    │
│  Storage    │
│  (local)    │
└─────────────┘
    ↓ Pod deleted
  ✗ Data lost

Applications that need data:
  ✗ Databases
  ✗ File uploads
  ✗ Session state
  ✗ Caches (persistent)
```

### Solution: Persistent Storage

```
Pod with persistent storage:
┌─────────────┐          ┌──────────────┐
│   Pod       │          │ Persistent   │
│  ┌─────┐    │          │ Volume       │
│  │ app │    │          │              │
│  └─────┘    │          │ (external to │
│ volumeMount ────────►  │  pod)        │
└─────────────┘          │              │
    ↓ Pod deleted        │              │
  ✓ Data remains         └──────────────┘
```

## Volume Types

### 1. emptyDir

An **emptyDir** volume is created when a pod is created and deleted when the pod is deleted. Used for temporary storage.

**Characteristics:**

* Created empty at pod startup
* Deleted when pod terminates
* Shared between containers in a pod
* Survives container restarts (but not pod deletion)

### emptyDir Use Cases

```
┌─────────────────────────────────────┐
│  Pod with emptyDir                  │
│                                     │
│  ┌──────────┐     ┌──────────┐      │
│  │Container │     │Container │      │
│  │1         │────►│2         │      │
│  │(writer)  │     │(reader)  │      │
│  └──────────┘     └──────────┘      │
│        │                │           │
│        └─►┌──────────┐◄─┘           │
│           │ emptyDir │              │
│           │ /shared  │              │
│           └──────────┘              │
│                                     │
│ Use: Share data between containers  │
│      Temporary cache                │
│      Scratch space                  │
└─────────────────────────────────────┘
```

### emptyDir Manifest

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: cache-pod
spec:
  containers:
  - name: data-generator
    image: busybox
    command: ["/bin/sh"]
    args:
    - -c
    - |
      echo "Generating data..."
      echo "Hello from pod" > /data/message.txt
      sleep 3600
    volumeMounts:
    - name: shared-data
      mountPath: /data

  - name: data-consumer
    image: busybox
    command: ["/bin/sh"]
    args:
    - -c
    - |
      while true; do
        cat /data/message.txt
        sleep 10
      done
    volumeMounts:
    - name: shared-data
      mountPath: /data

  volumes:
  - name: shared-data
    emptyDir: {}
```

### emptyDir with Size Limit

```yaml
volumes:
- name: cache
  emptyDir:
    sizeLimit: 1Gi  # Maximum size
```

### 2. hostPath

A **hostPath** volume mounts a file or directory from the host node into the pod.

**Characteristics:**

* Accesses host node filesystem
* Survives pod deletion (data on host)
* Different on each node
* Security risk (direct host access)

### hostPath Use Cases

```
DaemonSet needs host access:
┌──────────────────────────────────────┐
│  Worker Node                         │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Pod (logging agent)            │  │
│  │                                │  │
│  │ volumeMount:                   │  │
│  │   /host/logs                   │  │
│  │   ↓                            │  │
│  │   /var/log (on host)           │  │
│  └────────────────────────────────┘  │
│                                      │
│  Actual node /var/log/               │
│  • containers/                       │
│  • pods/                             │
│  • syslog                            │
└──────────────────────────────────────┘
```

### hostPath Manifest

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: log-reader
spec:
  containers:
  - name: reader
    image: busybox
    command: ["/bin/sh"]
    args:
    - -c
    - tail -f /var/log/syslog
    volumeMounts:
    - name: host-logs
      mountPath: /var/log

  volumes:
  - name: host-logs
    hostPath:
      path: /var/log              # Host path
      type: Directory             # Type: Directory, File, Socket, etc.
```

### hostPath Types

| Type              | Behavior                         |
|-------------------|----------------------------------|
| Directory         | Host path must be a directory    |
| File              | Host path must be a file         |
| FileOrCreate      | Create file if doesnt exist      |
| DirectoryOrCreate | Create directory if doesnt exist |
| Socket            | UNIX socket                      |

### 3. ConfigMap and Secret Volumes

ConfigMaps and Secrets can be mounted as volumes.

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  config.yaml: |
    database:
      host: db.default.svc
      port: 5432
---
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
stringData:
  db-password: "secret123"
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
      mountPath: /etc/config
    - name: secret
      mountPath: /etc/secret
      readOnly: true

  volumes:
  - name: config
    configMap:
      name: app-config
      defaultMode: 0644
  - name: secret
    secret:
      secretName: app-secret
      defaultMode: 0600
```

## PersistentVolumes and PersistentVolumeClaims

### The Problem with Simple Volumes

```
Deployment with hostPath:
  Pod1 on Node1 → /data on Node1
  Pod2 on Node2 → /data on Node2
  Pod3 on Node3 → /data on Node3

Issues:
  ✗ Data not shared between pods
  ✗ Data lost if node is deleted
  ✗ Manual volume management
  ✗ Not portable across nodes
```

### Solution: PV and PVC

```
┌──────────────────────────────────────────────────┐
│         Persistent Volume Layer                  │
│                                                  │
│  Application (asks for storage)                  │
│           ↓                                      │
│  ┌──────────────────────────────┐                │
│  │ PersistentVolumeClaim (PVC)  │                │
│  │ "I need 10Gi storage"        │                │
│  └────────┬─────────────────────┘                │
│           │ Kubernetes binds                     │
│           ▼                                      │
│  ┌──────────────────────────────┐                │
│  │ PersistentVolume (PV)        │                │
│  │ 10Gi available               │                │
│  └────────┬─────────────────────┘                │
│           │ References                           │
│           ▼                                      │
│  ┌──────────────────────────────┐                │
│  │ Storage Backend              │                │
│  │ (NFS, EBS, Local disk, etc)  │                │
│  └──────────────────────────────┘                │
└──────────────────────────────────────────────────┘
```

### PersistentVolume (PV)

A **PersistentVolume** is a storage resource in the cluster that is provisioned andmanaged by administrators.

### PersistentVolume Manifest

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-nfs
spec:
  capacity:
    storage: 10Gi
  accessModes:
  - ReadWriteOnce          # Single node read-write
  # - ReadOnlyMany         # Multiple nodes read-only
  # - ReadWriteMany        # Multiple nodes read-write
  persistentVolumeReclaimPolicy: Retain  # Retain, Delete, Recycle
  storageClassName: standard
  nfs:
    server: 192.168.1.10
    path: "/shared"
```

### PersistentVolumeClaim (PVC)

A **PersistentVolumeClaim** is a request for storage by a pod.

### PersistentVolumeClaim Manifest

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-pvc
spec:
  accessModes:
  - ReadWriteOnce
  storageClassName: standard
  resources:
    requests:
      storage: 5Gi
```

### PV-PVC Binding Flow

```
1. Admin creates PV
   PersistentVolume (pv-nfs)
   ├─ Capacity: 10Gi
   ├─ Status: Available

2. User creates PVC
   PersistentVolumeClaim (my-pvc)
   ├─ Request: 5Gi
   ├─ Status: Pending

3. Kubernetes binds PVC to PV
   PVC → matched with PV
   PV.Available → PV.Bound
   PVC.Pending → PVC.Bound

4. Pod references PVC
   volumeMount uses PVC name
   → Uses PVs backend storage

5. Pod deleted
   PVC remains
   PV remains
   Data persists
```

### PVC Usage in Pods

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
    - name: data
      mountPath: /data

  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: my-pvc  # Reference to PVC
```

## Access Modes

| Mode          | Single Node | Multiple Nodes | Read | Write |
|---------------|-------------|----------------|------|-------|
| ReadWriteOnce | ✓           | ✗              | ✓    | ✓     |
| ReadOnlyMany  | ✓           | ✓              | ✓    | ✗     |
| ReadWriteMany | ✓           | ✓              | ✓    | ✓     |

```yaml
# ReadWriteOnce: Best for databases
accessModes:
- ReadWriteOnce

# ReadOnlyMany: Shared read-only files
accessModes:
- ReadOnlyMany

# ReadWriteMany: Shared read-write (NFS, etc)
accessModes:
- ReadWriteMany
```

## Storage Classes

A **StorageClass** enables dynamic provisioning of PersistentVolumes.

### Problem: Manual PV Creation

```
Without StorageClass:
  Admin creates PVs manually
  ├─ pv-1 (10Gi, available)
  ├─ pv-2 (20Gi, available)
  ├─ pv-3 (5Gi, available)

  User requests 50Gi
  → No PV large enough
  → Request stuck (Pending)
  → Admin must create new PV

  Manual, inefficient, slow
```

### Solution: StorageClass with Dynamic Provisioning

```
With StorageClass:
  PVC references StorageClass
  ↓
  Provisioner (e.g., AWS EBS provisioner)
  ↓
  Create PV automatically
  ↓
  Bind PVC to new PV
  ↓
  Pod can use storage immediately
```

### StorageClass Manifest

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: kubernetes.io/aws-ebs
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
parameters:
  type: gp3              # EBS volume type
  iops: "3000"
  throughput: "125"
  encrypted: "true"

---
# AWS EBS provisioner
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: aws-ebs
provisioner: ebs.csi.aws.com
allowVolumeExpansion: true
reclaimPolicy: Delete
parameters:
  type: gp3
  iops: "3000"
  throughput: "125"
  encrypted: "true"
  kmsKeyId: arn:aws:kms:region:account:key/id

---
# NFS provisioner
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: nfs-provisioner
provisioner: nfs.io/nfs
parameters:
  server: 192.168.1.10
  path: "/exported"
  fsType: nfs
  nfsVersion: "4"
```

### Common Provisioners

| Provisioner           | Storage Backend        | Use Case           |
|-----------------------|------------------------|--------------------|
| kubernetes.io/aws-ebs | AWS EBS                | Cloud: AWS         |
| pd.csi.storage.gke.io | Google Persistent Disk | Cloud: GC          |
| disk.csi.azure.com    | Azure Managed Disk     | Cloud: Azure       |
| nfs.io/nfs            | NFS Server             | On-premise, hybrid |
| local                 | Local node disk        | High-performance   |

### Using StorageClass

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-pvc
spec:
  storageClassName: fast-ssd  # Reference StorageClass
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi

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
    - name: data
      mountPath: /data

  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: my-pvc
```

### Volume Provisioning Flow with StorageClass

```
1. User creates PVC
   PVC (my-pvc)
   └─ storageClassName: fast-ssd

2. Kubernetes sees unbound PVC

3. Provisioner for fast-ssd is triggered
   (AWS EBS provisioner)

4. Provisioner creates volume
   AWS EBS: gp3, 20Gi, encrypted

5. Provisioner creates PV
   PersistentVolume created automatically

6. Kubernetes binds PVC to PV

7. Pod can use volume immediately

Result: No manual PV creation!
```

## Reclaim Policies

The **Reclaim Policy** determines what happens to PV when PVC is deleted.

| Policy  | Behavior                                        |
|---------|-------------------------------------------------|
| Delete  | PV deleted automatically (default for dynamic)  |
| Retain  | PV retained, can be manually reclaimed          |
| Recycle | Deprecated: volume scrubbed then made available |

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-important-data
spec:
  persistentVolumeReclaimPolicy: Retain  # Keep data after PVC deletion
  capacity:
    storage: 100Gi
  # ... other config
```

## StatefulSet with Persistent Storage

**StatefulSets** typically use Persistent Storage with volume claim templates.

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
spec:
  serviceName: mysql
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
        volumeMounts:
        - name: data
          mountPath: /var/lib/mysql

  # Automatically create PVC for each replica
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: fast-ssd
      resources:
        requests:
          storage: 20Gi
```

### PVC Created by StatefulSet

```
StatefulSet: mysql (3 replicas)
  ↓
Automatically creates PVCs:
  ├─ data-mysql-0 (20Gi)
  ├─ data-mysql-1 (20Gi)
  └─ data-mysql-2 (20Gi)

Each pod gets its own persistent volume:
  mysql-0 → data-mysql-0
  mysql-1 → data-mysql-1
  mysql-2 → data-mysql-2
```

## Container Storage Interface (CSI)

**CSI** is a standard interface for storage providers to integrate with Kubernetes.

### CSI Benefits

```
Before CSI:
  Storage providers implement Kubernetes-specific code
  ├─ AWS implements EBS driver
  ├─ Google implements PD driver
  ├─ Azure implements Disk driver
  Each is tightly coupled to Kubernetes

After CSI:
  Storage providers implement CSI standard
  ├─ Kubernetes CSI driver installed
  ├─ Any CSI-compliant driver works
  ├─ Storage provider updates independently
  Decoupled, standardized interface
```

### CSI Components

```
┌──────────────────────────────────────┐
│      CSI Driver (e.g., AWS EBS)      │
│                                      │
│  Controller Plugin                   │
│  ├─ CreateVolume                     │
│  ├─ DeleteVolume                     │
│  └─ PublishVolume                    │
│                                      │
│  Node Plugin                         │
│  ├─ NodeStageVolume                  │
│  ├─ NodePublishVolume                │
│  └─ NodeUnpublishVolume              │
│                                      │
└──────────────────────────────────────┘
         ↑
    Kubernetes
  provisioner: ebs.csi.aws.com
```

### Using CSI Drivers

```yaml
# StorageClass using CSI driver
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: ebs-csi
provisioner: ebs.csi.aws.com
allowVolumeExpansion: true
reclaimPolicy: Delete
parameters:
  type: gp3
  iops: "3000"
  throughput: "125"

---
# PVC using CSI StorageClass
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ebs-claim
spec:
  storageClassName: ebs-csi
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 50Gi
```

## kubectl Commands for Storage

```bash
# Create storage resources
kubectl -n <namespace> apply -f storage.yaml

# View PersistentVolumes
kubectl -n <namespace> get pv

# Detailed PV information
kubectl -n <namespace> describe pv pv-name

# View PersistentVolumeClaims
kubectl -n <namespace> get pvc

# Detailed PVC information
kubectl -n <namespace> describe pvc claim-name

# View StorageClasses
kubectl -n <namespace> get storageclass

# View available provisioners
kubectl -n <namespace> get sc -o yaml

# Expand PVC (if storage class allows)
kubectl -n <namespace> patch pvc claim-name -p '{"spec":{"resources":{"requests":{"storage":"100Gi"}}}}'

# Delete PVC (may delete volume depending on reclaim policy)
kubectl -n <namespace> delete pvc claim-name

# Inspect PVC status
kubectl -n <namespace> describe pvc claim-name

# Get PV-PVC binding
kubectl -n <namespace> get pv,pvc
```

## Practical Scenarios

### Scenario 1: Stateless App with Temporary Storage

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: api:1.0
        volumeMounts:
        - name: cache
          mountPath: /tmp/cache

      volumes:
      - name: cache
        emptyDir:
          sizeLimit: 1Gi
```

### Scenario 2: Database with Persistent Storage

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: database
provisioner: ebs.csi.aws.com
parameters:
  type: gp3
  iops: "5000"
  throughput: "250"
  encrypted: "true"

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-data
spec:
  storageClassName: database
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 100Gi

---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:14
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        volumeMounts:
        - name: data
          mountPath: /var/lib/postgresql/data
          subPath: postgres

  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      storageClassName: database
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 100Gi
```

### Scenario 3: Shared File System with NFS

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: nfs-shared
provisioner: nfs.io/nfs
parameters:
  server: 192.168.1.10
  path: "/exports"

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: shared-documents
spec:
  storageClassName: nfs-shared
  accessModes:
  - ReadWriteMany
  resources:
    requests:
      storage: 500Gi

---
# Multiple deployments can share this volume
apiVersion: apps/v1
kind: Deployment
metadata:
  name: reader
spec:
  replicas: 2
  selector:
    matchLabels:
      app: reader
  template:
    metadata:
      labels:
        app: reader
    spec:
      containers:
      - name: reader
        image: file-processor:1.0
        volumeMounts:
        - name: documents
          mountPath: /shared

      volumes:
      - name: documents
        persistentVolumeClaim:
          claimName: shared-documents
```

## Summary

Kubernetes storage provides multiple layers of abstraction:

* **Volumes** (Pod-level) - emptyDir, hostPath, configMap, secret
* **PersistentVolumes** (Cluster-level) - Managed by administrators
* **PersistentVolumeClaims** (App-level) - Requested by applications
* **StorageClasses** - Dynamic provisioning templates
* **CSI** - Standard interface for storage providers

**Key concepts:**

* emptyDir for temporary sharing between containers
* PV/PVC for persistent data across pod restarts
* StorageClass for dynamic, automated provisioning
* StatefulSets for databases needing persistent, stable storage
* CSI for standardized storage driver integration

---

**Key Takeaways:**

* Design storage needs before deployment
* Use StorageClasses for automatic provisioning
* Understand access modes and reclaim policies
* Use StatefulSets for stateful applications
* CSI drivers handle backend storage details
* Always backup critical persistent data
