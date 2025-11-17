---
title: Autoscaling
linkTitle: Autoscaling
type: docs
weight: 14
prev: /kubernetes/13-security
next: /kubernetes/15-observability
---

## Overview

**Autoscaling** automatically adjusts the number of pods and nodes based on demand, ensuring optimal resource utilization and cost efficiency.

```
┌────────────────────────────────────────────────────────┐
│              Autoscaling Levels                        │
│                                                        │
│  HPA (Horizontal Pod Autoscaler)                       │
│  ├─ Scale pods based on metrics                        │
│  ├─ CPU, Memory, Custom metrics                        │
│  └─ More pods when demand increases                    │
│                                                        │
│  VPA (Vertical Pod Autoscaler)                         │
│  ├─ Adjust resource requests/limits                    │
│  ├─ Right-sizing pods                                  │
│  └─ Fewer wasted resources                             │
│                                                        │
│  CA (Cluster Autoscaler)                               │
│  ├─ Scale nodes up/down                                │
│  ├─ Based on pod scheduling                            │
│  └─ Match cluster capacity to demand                   │
│                                                        │
│  Karpenter (Modern Node Autoscaler)                    │
│  ├─ Direct node provisioning                           │
│  ├─ Faster scaling than CA                             │
│  └─ Optimal instance selection                         │
│                                                        │
│  KEDA (Kubernetes Event Autoscaling)                   │
│  ├─ Scale based on external events                     │
│  ├─ Queues, pubsub, webhooks                           │
│  └─ Event-driven autoscaling                           │
└────────────────────────────────────────────────────────┘
```

## Horizontal Pod Autoscaler (HPA)

### Purpose

**HPA** automatically scales the number of pod replicas based on CPU or memory utilization, as well as custom metrics.

### HPA Architecture

```
Container Runtime (containerd/docker)
  ├─ Runs containers
  └─ Exposes runtime stats
  ↓
cAdvisor (Container Advisor)
  ├─ Embedded in Kubelet
  ├─ Collects container-level metrics
  │  • CPU usage
  │  • Memory usage
  │  • Network I/O
  │  • Disk I/O
  └─ Exposes metrics via Kubelet API
  ↓
Kubelet
  ├─ Runs on every node
  ├─ Aggregates container metrics from cAdvisor
  ├─ Exposes metrics endpoint: /metrics/resource
  └─ Port 10250 (by default)
  ↓
Metrics Server
  ├─ Queries Kubelet on each node (every 60s default)
  ├─ Aggregates cluster-wide metrics
  ├─ Stores short-term in-memory (no historical data)
  └─ Exposes via Kubernetes Metrics API
  ↓
HPA Controller
  ├─ Queries Metrics API every 15 seconds (default)
  ├─ Calculates desired replica count
  │  desiredReplicas = ceil[currentReplicas * (currentMetric / targetMetric)]
  └─ Updates deployment/statefulset replicas
  ↓
Deployment Controller
  ├─ Receives updated replica count
  ├─ Creates/deletes pods
  └─ Reaches desired state

Key Points:
  • cAdvisor: Built into Kubelet, collects container-level metrics
  • Kubelet: Aggregates metrics from multiple sources:
    - Container metrics from cAdvisor (CPU, memory per container)
    - Node-level metrics from the OS via system calls (total node CPU, memory, etc.)
    - Pod metrics (sum of container metrics within a pod)
    - Volume metrics (persistent volume usage)
  • Metrics Server: Cluster-wide metrics aggregation
  • HPA: Consumes metrics and makes scaling decisions
  • kubectl top: Queries Metrics Server (via Kubernetes API)to display resource usage
    - kubectl top nodes → node resource usage
    - kubectl top pods → pod resource usage
```

### HPA Formula

```
desiredReplicas = ceil[currentReplicas * (currentMetricValue / targetMetricValue)]

Example:
  currentReplicas = 2
  currentCPU = 80%
  targetCPU = 50%

  desiredReplicas = ceil[2 * (80 / 50)]
                  = ceil[2 * 1.6]
                  = ceil[3.2]
                  = 4 pods
```

### HPA Manifest (CPU-based)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app

  minReplicas: 2
  maxReplicas: 10

  metrics:
  # Scale on CPU utilization
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70  # Scale if CPU > 70%

  # Scale on Memory utilization
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80  # Scale if memory > 80%

  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300  # Wait 5 min before scaling down
      policies:
      - type: Percent
        value: 50  # Can remove max 50% of pods
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0    # Scale up immediately
      policies:
      - type: Percent
        value: 100  # Can add max 100% of pods (double)
        periodSeconds: 30
```

### HPA Requirements

```
For HPA to work:
  1. Metrics Server must be installed
     kubectl get deployment metrics-server -n kube-system

  2. Pods must have resource requests defined (for HPA to calculate utilization)
     containers:
     - name: app
       image: myapp:1.0
       resources:
         requests:
           cpu: 100m
           memory: 128Mi
         limits:
           cpu: 200m
           memory: 256Mi

  3. Deployment must have multiple replicas. If "replicas: 0" then nothing to scale. 
     replicas: 2  # At least 1, preferably 2+
```

### HPA with Custom Metrics

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api

  minReplicas: 3
  maxReplicas: 20

  metrics:
  # Built-in metrics
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70

  # Custom metrics (from Prometheus, CloudWatch, etc)
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: "1k"  # Scale if avg 1000 req/s per pod

  # External metrics
  - type: External
    external:
      metric:
        name: queue_length
      target:
        type: Value
        value: "100"  # Scale if queue length > 100
```

### HPA kubectl Commands

```bash
# Create HPA
kubectl apply -f hpa.yaml

# View HPAs
kubectl get hpa

# Detailed information
kubectl describe hpa web-app-hpa

# Watch HPA status
kubectl get hpa -w

# Manual scaling (temporarily disables HPA)
kubectl scale deployment web-app --replicas=5

# Get HPA YAML
kubectl get hpa web-app-hpa -o yaml

# Delete HPA
kubectl delete hpa web-app-hpa
```

## Vertical Pod Autoscaler (VPA)

### Purpose

**VPA** right-sizes pods by adjusting resource requests and limits based on actual usage.

### VPA Problem

```
Manual resource sizing:
  Pod A
  ├─ Request: CPU 1, Memory 512Mi
  ├─ Actual usage: CPU 0.1, Memory 256Mi
  └─ Wasted: 90% CPU, 50% Memory

  Pod B
  ├─ Request: CPU 0.5, Memory 256Mi
  ├─ Actual usage: CPU 1.2, Memory 512Mi
  └─ Limited: Cant use needed resources

Solution:
  VPA observes actual usage
  └─ Recommends optimal requests/limits
      → Reduces waste
      → Prevents resource starvation
```

### VPA Architecture

```
VPA Components:
  1. Recommender
     └─ Analyzes metrics, recommends values

  2. Updater
     └─ Restarts pods with new requests

  3. Admission Controller
     └─ Sets requests on new pods

Workflow:
  Pod running
    ↓
  Metrics collected (Metrics Server → Kubelet → cAdvisor)
    ↓
  Recommender analyzes historical usage
    ├─ Queries Metrics API
    ├─ Calculates optimal requests/limits
    └─ Updates VPA object with recommendations
    ↓
  Updater checks VPA recommendations
    ├─ Compares current vs recommended requests
    ├─ Decides if pod needs restart (based on updateMode)
    └─ Evicts pod if update needed
    ↓
  Pod deleted/restarted (by Updater)
    ↓
  Admission Controller intercepts pod creation
    ├─ Reads VPA recommendations
    ├─ Mutates pod spec with new requests/limits
    └─ Allows pod to be created
    ↓
  New pod with optimal requests started
```

### VPA Manifest

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: web-app-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app

  updatePolicy:
    updateMode: "Auto"  # Off, Initial, Recreate, Auto

  resourcePolicy:
    containerPolicies:
    - containerName: "*"  # Apply to all containers

      # Recommendations for this container
      minAllowed:
        cpu: 50m
        memory: 64Mi

      maxAllowed:
        cpu: 2
        memory: 2Gi

      # Control scaling factors
      controlledResources:
      - cpu
      - memory
```

### VPA Update Modes

| Mode     | Behavior                                             |
|----------|------------------------------------------------------|
| Off      | Only provide recommendations, no automatic updates   |
| Initial  | Set requests on pod creation, dont update existing   |
| Recreate | Update requests, restart pods when needed            |
| Auto     | Use Recreate for low availability, Initial otherwise |

### VPA Example

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: database-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: StatefulSet
    name: postgres

  updatePolicy:
    updateMode: "Off"  # Just recommendations for databases

  resourcePolicy:
    containerPolicies:
    - containerName: postgres
      minAllowed:
        cpu: 200m
        memory: 256Mi
      maxAllowed:
        cpu: 4
        memory: 8Gi
```

### VPA kubectl Commands

```bash
# Create VPA
kubectl apply -f vpa.yaml

# View VPAs
kubectl get vpa

# View recommendations
kubectl describe vpa web-app-vpa

# View VPA recommendations in detail
kubectl get vpa web-app-vpa -o yaml
# Look for: status.recommendation
```

## Cluster Autoscaler (CA)

### Purpose

**Cluster Autoscaler** automatically adds or removes worker nodes from the cluster based on pod scheduling needs.

### Cluster Autoscaler Problem

```
Without Cluster Autoscaler:
  Manual node management
  ├─ Predict capacity needs
  ├─ Add nodes manually
  ├─ Remove unused nodes manually
  └─ Difficult to optimize

  Pod pending:
    "Insufficient CPU"
    └─ Admin adds node manually (slow)

  Unused nodes:
    └─ Resources wasted
    └─ Cost accumulated
```

### Cluster Autoscaler Solution

```
With Cluster Autoscaler:
  Pod pending (no node capacity)
    ↓
  CA detects unschedulable pod
    ↓
  CA adds node from cloud
    ↓
  Pod scheduled on new node
    ↓ (later)
  Nodes underutilized
    ↓
  CA removes empty/underused nodes
    ↓
  Reduce cost
```

### How Cluster Autoscaler Works

```
Loop (every 10 seconds):

  1. Check for unscheduled pods
     (pods in Pending state)

  2. If pods unschedulable:
     ├─ Calculate required capacity
     └─ Add nodes from cloud provider

  3. Check for underutilized nodes
     ├─ Node utilization < threshold
     ├─ No critical pods
     └─ Pods can be moved elsewhere

  4. If node underutilized:
     ├─ Drain node (move pods)
     └─ Remove node from cloud
```

### Cluster Autoscaler Configuration

```yaml
# Typically configured on CA deployment
# (In kube-system namespace)

apiVersion: apps/v1
kind: Deployment
metadata:
  name: cluster-autoscaler
  namespace: kube-system
spec:
  replicas: 1
  template:
    spec:
      containers:
      - name: cluster-autoscaler
        image: k8s.gcr.io/autoscaling/cluster-autoscaler:v1.24.0
        args:
        - --cloud-provider=aws          # or gce, azure, etc
        - --aws-region=us-east-1
        - --nodes=1:10:my-asg           # Min:Max:ASG
        - --scale-down-enabled=true
        - --scale-down-delay-after-add=10m
        - --scale-down-unneeded-time=10m
        - --skip-nodes-with-local-storage=false
```

### Pod Annotations for CA

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: important-app
  annotations:
    # Prevent node autoscaling removal
    cluster-autoscaler.kubernetes.io/safe-to-evict: "false"
spec:
  containers:
  - name: app
    image: myapp:1.0
```

## Karpenter (Modern Node Autoscaler)

### Purpose

**Karpenter** is a modern, Kubernetes-native node autoscaler that provisions nodes directly through cloud provider APIs, offering faster scaling and better bin-packing than Cluster Autoscaler.

* JIT nodes (right nodes at the right time)

### Karpenter vs Cluster Autoscaler

```
Cluster Autoscaler (CA):
  ├─ Works with node groups/ASGs
  ├─ Pre-defined instance types in each ASG
  ├─ Slower provisioning (group-based)
  ├─ Limited flexibility (must define min/max/desired per ASG)
  └─ Scales up/down node groups

Karpenter:
  ├─ Provisions nodes directly
  ├─ Dynamic instance selection
  ├─ Faster provisioning (pod-aware)
  ├─ Optimal instance matching
  └─ Consolidates underutilized nodes

Key Differences:
  Speed:
    CA: 2-5 minutes (scale node group)
    Karpenter: 30-90 seconds (direct provisioning)

  Flexibility:
    CA: Limited to predefined instance types in ASGs
    Karpenter: Chooses best instance from full catalog

  Bin-packing:
    CA: Basic (uses existing node groups)
    Karpenter: Advanced (optimizes instance selection)

  Consolidation:
    CA: Simple scale-down
    Karpenter: Active consolidation & spot replacement
```

### Karpenter Architecture

Karpenter uses two key custom resources to provision nodes:

```
┌────────────────────────────────────────────────────────┐
│          Karpenter Component Flow                      │
│                                                        │
│  ┌──────────────┐                                      │
│  │   Workload   │ (Pending Pod)                        │
│  │ (Deployment) │                                      │
│  └──────┬───────┘                                      │
│         │                                              │
│         │ References                                   │
│         v                                              │
│  ┌──────────────────┐                                  │
│  │    NodePool      │                                  │
│  ├──────────────────┤                                  │
│  │ - Requirements   │ (What type of nodes to create)   │
│  │ - Limits         │  - Capacity type (spot/on-demand)│
│  │ - Disruption     │  - Instance families             │
│  │ - NodeClassRef ──┼──┐  - Architecture               │
│  └──────────────────┘  │  - Resource limits            │
│                        │                               │
│                        │ References                    │
│                        v                               │
│              ┌──────────────────┐                      │
│              │   NodeClass      │                      │
│              │ (EC2NodeClass)   │                      │
│              ├──────────────────┤                      │
│              │ - AMI            │ (How to create nodes)│
│              │ - IAM Role       │  - Subnet selection  │
│              │ - Security Groups│  - Instance profile  │
│              │ - User Data      │  - Block devices     │
│              │ - Tags           │  - Network config    │
│              └────────┬─────────┘                      │
│                       │                                │
│                       │ Provisions via                 │
│                       v                                │
│              ┌──────────────────┐                      │
│              │ Cloud Provider   │                      │
│              │  (AWS EC2 API)   │                      │
│              └──────────────────┘                      │
│                       │                                │
│                       v                                │
│              Node joins cluster                        │
└────────────────────────────────────────────────────────┘

Simplified Flow:
  Pending Pod → Karpenter sees resource needs
                    ↓
             Checks NodePool for requirements
                    ↓
             Checks NodeClass for configuration
                    ↓
             Calls Cloud Provider API (e.g., EC2)
                    ↓
             Node provisioned (~60 seconds)
                    ↓
             Pod scheduled on new node
```

**Key Concepts:**

* **NodePool** - Defines WHAT nodes to create

* Instance requirements (CPU, memory, arch)
* Capacity type (spot vs on-demand)
* Resource limits
* Disruption policies

* **NodeClass** (e.g., EC2NodeClass) - Defines HOW to create nodes

* Cloud-specific configuration
* AMI selection
* Networking (subnets, security groups)
* IAM roles and instance profiles

### How Karpenter Works

```
Pod Created
  ↓
Scheduler: Pod is Pending (no capacity)
  ↓
Karpenter Controller
  ├─ Analyzes pending pod requirements
  │  (CPU, memory, topology, affinity)
  ├─ Selects optimal instance type
  ├─ Provisions node via cloud API
  └─ Node joins cluster in ~60 seconds
  ↓
Pod Scheduled
  ↓ (continuously)
Karpenter monitors node utilization
  ├─ Consolidates underutilized nodes
  ├─ Replaces nodes for optimization
  └─ Handles spot interruptions
```

### Karpenter NodePool Configuration

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: default
spec:
  # Template for nodes
  template:
    spec:
      # Node requirements
      requirements:
      - key: karpenter.sh/capacity-type
        operator: In
        values: ["on-demand", "spot"]  # Mix of on-demand and spot

      - key: kubernetes.io/arch
        operator: In
        values: ["amd64"]

      - key: karpenter.k8s.aws/instance-category
        operator: In
        values: ["c", "m", "r"]  # Compute, general, memory optimized

      - key: karpenter.k8s.aws/instance-generation
        operator: Gt
        values: ["5"]  # Gen 5 or newer

      # Node taints
      taints:
      - key: workload
        value: batch
        effect: NoSchedule

      # Node labels
      nodeClassRef:
        name: default

  # Limits
  limits:
    cpu: 1000
    memory: 1000Gi

  # Disruption budget
  disruption:
    consolidationPolicy: WhenUnderutilized
    expireAfter: 720h  # 30 days

---
apiVersion: karpenter.k8s.aws/v1beta1
kind: EC2NodeClass
metadata:
  name: default
spec:
  amiFamily: AL2  # Amazon Linux 2
  role: "KarpenterNodeRole"

  subnetSelectorTerms:
  - tags:
      karpenter.sh/discovery: "my-cluster"

  securityGroupSelectorTerms:
  - tags:
      karpenter.sh/discovery: "my-cluster"

  # User data for node initialization
  userData: |
    #!/bin/bash
    echo "Node bootstrapped by Karpenter"
```

### Simple Karpenter Example

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: general-purpose
spec:
  template:
    spec:
      requirements:
      # Accept spot or on-demand
      - key: karpenter.sh/capacity-type
        operator: In
        values: ["spot", "on-demand"]

      # Instance families
      - key: karpenter.k8s.aws/instance-family
        operator: In
        values: ["m5", "m6i", "m7i"]

      nodeClassRef:
        name: default

  # Max capacity
  limits:
    cpu: 100
    memory: 200Gi

  # Consolidation enabled
  disruption:
    consolidationPolicy: WhenUnderutilized
```

### Karpenter Consolidation

```
Karpenter continuously optimizes:

1. Delete empty nodes
   └─ Node has no pods → immediate removal

2. Consolidate underutilized nodes
   ├─ Node A: 10% utilized
   ├─ Node B: 15% utilized
   └─ Combine pods → 1 node, delete other

3. Replace with cheaper instances
   ├─ Running on m5.2xlarge
   ├─ Workload fits on m5.xlarge
   └─ Replace node with smaller instance

4. Handle spot interruptions
   ├─ Spot instance interrupted (2 min warning)
   ├─ Provision replacement node
   └─ Gracefully migrate pods
```

### Karpenter Pod Configuration

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: batch-processor
spec:
  replicas: 10
  template:
    spec:
      # Node selector for Karpenter provisioning
      nodeSelector:
        karpenter.sh/capacity-type: spot  # Prefer spot instances

      # Tolerations for Karpenter-managed nodes
      tolerations:
      - key: karpenter.sh/capacity-type
        operator: Equal
        value: spot
        effect: NoSchedule

      containers:
      - name: processor
        image: batch-processor:1.0
        resources:
          requests:
            cpu: 1
            memory: 2Gi
```

### Benefits of Karpenter

```
1. Faster Scaling
   └─ Direct provisioning vs ASG scaling

2. Better Instance Selection
   ├─ Chooses optimal instance from entire catalog
   └─ Not limited to predefined groups

3. Cost Optimization
   ├─ Automatic consolidation
   ├─ Spot instance support
   └─ Right-sized instances

4. Simplified Management
   ├─ No ASG/node group management
   └─ Kubernetes-native configuration

5. Advanced Features
   ├─ Automatic spot replacement
   ├─ Drift detection
   └─ Topology-aware provisioning
```

### When to Use Karpenter vs CA

```
Use Cluster Autoscaler when:
  ├─ Existing ASG-based infrastructure
  ├─ Strict compliance requiring predefined node groups
  ├─ Limited cloud provider support
  └─ Simple scaling requirements

Use Karpenter when:
  ├─ Need faster scaling
  ├─ Want optimal instance selection
  ├─ Running on AWS, Azure, or supported clouds
  ├─ Cost optimization is priority
  ├─ Dynamic workloads with varying requirements
  └─ Using spot instances heavily
```

### Karpenter kubectl Commands

```bash
# View NodePools
kubectl get nodepools

# Describe NodePool
kubectl describe nodepool default

# View EC2NodeClass (AWS)
kubectl get ec2nodeclasses

# View Karpenter logs
kubectl logs -n karpenter -l app.kubernetes.io/name=karpenter

# Force consolidation check
kubectl annotate nodepool default karpenter.sh/do-not-consolidate-

# View Karpenter-provisioned nodes
kubectl get nodes -l karpenter.sh/nodepool
```

## KEDA (Kubernetes Event Autoscaler)

### Purpose

**KEDA** enables event-driven autoscaling by scaling pods based on external event sources — such as Prometheus, Redis, Kafka, AWS CloudWatch, etc. — through its built-in scalers.

* A **scaler** acts as a bridge between Kubernetes and external event sources.
* KEDA extends HPA’s capabilities (work hand-in-hand with HPA)

### KEDA vs HPA

```
HPA (Kubernetes native):
  ├─ CPU, Memory metrics
  └─ Resource-based scaling

KEDA (External events):
  ├─ Queue length (SQS, RabbitMQ)
  ├─ Pubsub messages (Kafka, GCP PubSub)
  ├─ Database load
  ├─ HTTP requests
  └─ Custom HTTP webhooks
```

### KEDA Architecture

```
External Event Source
  (SQS queue, Kafka topic, etc)
         ↓
KEDA Scaler
  ├─ Query queue length
  ├─ Calculate desired replicas
  └─ Update HPA
         ↓
HPA (created by KEDA)
  └─ Manages pod replicas
         ↓
Deployment
  └─ Actual pods
```

### KEDA ScaledObject

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: worker-scaler
spec:
  scaleTargetRef:
    name: worker-deployment

  minReplicaCount: 1
  maxReplicaCount: 100

  triggers:
  # Scale based on SQS queue length
  - type: aws-sqs-queue
    metadata:
      queueURL: https://sqs.us-east-1.amazonaws.com/123456/my-queue
      queueLength: "5"          # 1 pod per 5 messages
      awsRegion: "us-east-1"
    authenticationRef:
      name: aws-credentials

  # Scale based on Kafka topic lag
  - type: kafka
    metadata:
      bootstrapServers: kafka:9092
      consumerGroup: my-consumer
      topic: events
      lagThreshold: "100"       # 1 pod per 100 lag messages
      offsetResetPolicy: "latest"

  # Custom HTTP scaler
  - type: external
    metadata:
      scalerAddress: "http://custom-scaler:8080"
```

### KEDA Examples

#### Example 1: SQS Queue Based Scaling

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: queue-processor
spec:
  scaleTargetRef:
    name: queue-processor-deployment

  minReplicaCount: 2
  maxReplicaCount: 50

  triggers:
  - type: aws-sqs-queue
    metadata:
      queueURL: https://sqs.us-east-1.amazonaws.com/123456/tasks
      queueLength: "10"  # 1 worker per 10 messages
      awsRegion: "us-east-1"

---
apiVersion: v1
kind: Secret
metadata:
  name: aws-credentials
type: Opaque
stringData:
  AWS_ACCESS_KEY_ID: "xxx"
  AWS_SECRET_ACCESS_KEY: "yyy"
```

#### Example 2: Kafka Consumer Lag Scaling

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: kafka-consumer
spec:
  scaleTargetRef:
    name: kafka-consumer-deployment

  minReplicaCount: 3
  maxReplicaCount: 100

  triggers:
  - type: kafka
    metadata:
      bootstrapServers: kafka-cluster:9092
      consumerGroup: events-consumer
      topic: events
      lagThreshold: "50"  # 1 pod per 50 messages lag
      offsetResetPolicy: "latest"
      authModes: "sasl_ssl"
    authenticationRef:
      name: kafka-auth

---
apiVersion: v1
kind: Secret
metadata:
  name: kafka-auth
type: Opaque
stringData:
  sasl: "plain"
  username: "consumer"
  password: "secret"
```

## Autoscaling Best Practices

### 1. Define Resource Requests

```yaml
# ✓ Good: All pods have resource requests
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: app
        image: myapp:1.0
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi

# ✗ Bad: No resource requests (HPA can't function properly)
resources: {}
```

### 2. Use Multiple Metrics

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: app

  minReplicas: 2
  maxReplicas: 20

  metrics:
  # CPU
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70

  # Memory
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80

  # Custom metric
  - type: Pods
    pods:
      metric:
        name: requests_per_second
      target:
        type: AverageValue
        averageValue: "1000"
```

### 3. Configure Scale-Down Carefully

```yaml
behavior:
  scaleDown:
    # Wait before scaling down (avoid flapping)
    stabilizationWindowSeconds: 300

    # Don't scale down too aggressively
    policies:
    - type: Percent
      value: 50      # Max 50% pods removed at once
      periodSeconds: 60

  scaleUp:
    # Scale up quickly
    stabilizationWindowSeconds: 0

    policies:
    - type: Percent
      value: 100     # Can double the pod count
      periodSeconds: 30
```

### 4. Monitor Autoscaling

```bash
# View HPA status
kubectl get hpa web-app-hpa -w

# Watch metrics
kubectl top pods -l app=web-app

# View HPA events
kubectl describe hpa web-app-hpa

# Check metrics server
kubectl get deployment metrics-server -n kube-system
```

### 5. Combine Multiple Scalers

```
Use together:
  HPA: Scale pods based on CPU/memory
  CA/Karpenter: Add nodes when pods unschedulable
  KEDA: Handle event-based load

Example workflow:
  1. Queue message arrives
  2. KEDA scales pods up
  3. Pod scheduled, needs node
  4. Karpenter provisions optimal node (~60s)
  5. Pod runs on new node
  6. Queue empties
  7. KEDA scales pods down
  8. Karpenter consolidates/removes underused nodes

Note: Use Karpenter instead of CA for:
  - Faster node provisioning
  - Better instance selection
  - Automatic consolidation
```

## Summary

Kubernetes autoscaling operates at multiple levels:

* **HPA** - Scale pods based on metrics (CPU, memory, custom)
* **VPA** - Right-size pods (adjust requests/limits)
* **CA** - Scale nodes based on pod scheduling needs (ASG-based)
* **Karpenter** - Modern node autoscaler with direct provisioning
* **KEDA** - Scale based on external events (queues, pubsub)

**Key principles:**

* Always define resource requests for HPA to work
* Combine multiple scalers for comprehensive autoscaling
* Monitor autoscaling behavior and metrics
* Use stabilization windows to prevent flapping
* Test autoscaling under load
* Consider Karpenter for faster scaling and cost optimization

---

**Key Takeaways:**

* HPA scales pods horizontally
* VPA right-sizes pod resources
* CA manages node capacity (ASG-based)
* Karpenter provides faster, smarter node scaling
* KEDA enables event-driven scaling
* Metrics Server required for HPA
* Resource requests essential for autoscaling
* Combine scalers for optimal results
