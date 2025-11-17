---
title: Flagger
linkTitle: Flagger
type: docs
weight: 2
prev: /gitops/fluxcd
---

## What is Flagger?

**Flagger** is a progressive delivery tool that automates the release process for applications running on Kubernetes. It reduces the risk of introducing new software versions in production by gradually shifting traffic to the new version while measuring metrics and running conformance tests.

### Key Features

* **Automated Canary Deployments**: Gradually shifts traffic while monitoring application health
* **A/B Testing**: Routes traffic based on HTTP headers or cookies for testing different versions
* **Blue/Green Deployments**: Instant traffic switching with full rollback capability
* **Metrics-Driven Analysis**: Integrates with Prometheus, Datadog, New Relic, and other monitoring systems
* **Automated Rollback**: Reverts to stable version when metrics indicate problems
* **Multi-Mesh Support**: Works with Istio, Linkerd, App Mesh, Open Service Mesh, and more
* **GitOps Integration**: Seamlessly integrates with FluxCD for declarative deployments

### Why Flagger?

Traditional Kubernetes deployments use rolling updates, which can cause production issues:

* No automated rollback on application-level errors
* Limited traffic control during rollout
* No built-in testing or validation phases
* All-or-nothing approach increases blast radius

Flagger addresses these challenges by providing fine-grained control over the deployment process.

## What is Progressive Delivery?

Progressive Delivery is an evolution of Continuous Delivery that provides fine-grained control over the blast radius of changes. It extends CI/CD by adding stages between deployment and full release.

### Progressive Delivery vs Continuous Deployment

```
Continuous Deployment:  
┌──────────┐    ┌───────┐    ┌────────────┐  
│   Code   │───▶│ Build │───▶│ Production │  
│  Commit  │    │  Test │    │  (100%)    │  
└──────────┘    └───────┘    └────────────┘  
  
Progressive Delivery:  
┌──────────┐    ┌───────┐    ┌──────────┐    ┌──────────┐    ┌────────────┐  
│   Code   │───▶│ Build │───▶│ Deploy   │───▶│ Validate │───▶│ Production │  
│  Commit  │    │  Test │    │  Canary  │    │ Metrics  │    │   (100%)   │  
└──────────┘    └───────┘    │  (5-50%) │    │  Tests   │    └────────────┘  
                             └──────────┘    └─────┬────┘  
                                                   │  
                                              ┌────▼────┐  
                                              │Rollback │  
                                              │on Fail  │  
                                              └─────────┘
```

### Benefits

* **Reduced Risk**: Gradual rollout limits the impact of bugs
* **Faster Recovery**: Automated rollback reduces MTTR (Mean Time To Recovery)
* **Continuous Validation**: Real production traffic validates changes
* **Confidence**: Data-driven decisions based on real metrics
* **Compliance**: Automated gates ensure quality standards

## Core Concepts

### 1. Canary Deployment

A canary deployment gradually shifts traffic from an old version (primary) to a new version (canary) while monitoring metrics. If metrics degrade, the deployment is automatically rolled back.

**Canary Deployment Flow:**

```
Time: T0 (Initial State)  
┌─────────────────────────────────────┐  
│         Production Traffic          │  
└──────────────┬──────────────────────┘  
               │ 100%  
        ┌──────▼──────┐  
        │   Primary   │  
        │  Version 1  │  
        └─────────────┘  
  
Time: T1 (Canary Initialization)  
┌─────────────────────────────────────┐  
│         Production Traffic          │  
└──────────┬──────────────┬───────────┘  
           │ 95%          │ 5%  
    ┌──────▼──────┐  ┌───▼────────┐  
    │   Primary   │  │   Canary   │  
    │  Version 1  │  │ Version 2  │  
    └─────────────┘  └────────────┘  
                          │  
                     ┌────▼─────┐  
                     │ Metrics  │  
                     │ Analysis │  
                     └──────────┘  
  
Time: T2 (Progressive Increase)  
┌─────────────────────────────────────┐  
│         Production Traffic          │  
└──────────┬──────────────┬───────────┘  
           │ 50%          │ 50%  
    ┌──────▼──────┐  ┌───▼────────┐  
    │   Primary   │  │   Canary   │  
    │  Version 1  │  │ Version 2  │  
    └─────────────┘  └────────────┘  
  
Time: T3 (Promotion)  
┌─────────────────────────────────────┐  
│         Production Traffic          │  
└──────────────┬──────────────────────┘  
               │ 100%  
        ┌──────▼──────┐  
        │   Primary   │  ◀── Promoted  
        │  Version 2  │  
        └─────────────┘
```

### 2. A/B Testing

A/B testing routes users to different versions based on HTTP headers, cookies, or other request attributes. This enables testing user experience variations.

**A/B Testing Flow:**

```
┌─────────────────────────────────────┐  
│         Incoming Traffic            │  
└──────────────┬──────────────────────┘  
               │  
        ┌──────▼──────┐  
        │   Ingress/  │  
        │Service Mesh │  
        └──────┬──────┘  
               │  
        ┌──────▼──────────────────────┐  
        │  Header/Cookie Inspection   │  
        └──────┬──────────────────────┘  
               │  
    ┌──────────┴──────────┐  
    │                     │  
    │ Cookie: version=A   │ Cookie: version=B  
    │                     │  
┌───▼──────┐         ┌───▼──────┐  
│Version A │         │Version B │  
│ (50%)    │         │ (50%)    │  
└──────────┘         └──────────┘  
    │                     │  
    └──────────┬──────────┘  
               │  
        ┌──────▼──────┐  
        │  Metrics    │  
        │ Comparison  │  
        └─────────────┘
```

### 3. Blue/Green Deployment

Blue/Green deployment maintains two identical production environments. Traffic is instantly switched from the old version (blue) to the new version (green) after validation.

**Blue/Green Flow:**

```
Phase 1: Blue Active  
┌─────────────────────────────────────┐  
│         Production Traffic          │  
└──────────────┬──────────────────────┘  
               │ 100%  
        ┌──────▼──────┐      ┌─────────────┐  
        │    Blue     │      │   Green     │  
        │  Version 1  │      │  Version 2  │  
        │   (Active)  │      │  (Standby)  │  
        └─────────────┘      └─────────────┘  
  
Phase 2: Testing Green  
┌─────────────────────────────────────┐  
│         Production Traffic          │  
└──────────────┬──────────────────────┘  
               │ 100%  
        ┌──────▼──────┐      ┌─────────────┐  
        │    Blue     │      │   Green     │  
        │  Version 1  │      │  Version 2  │◀── Smoke Tests  
        │   (Active)  │      │  (Testing)  │  
        └─────────────┘      └─────────────┘  
  
Phase 3: Instant Switch  
┌─────────────────────────────────────┐  
│         Production Traffic          │  
└──────────────┬──────────────────────┘  
               │ 100%  
        ┌─────────────┐      ┌──────▼──────┐  
        │    Blue     │      │   Green     │  
        │  Version 1  │      │  Version 2  │  
        │  (Standby)  │      │   (Active)  │  
        └─────────────┘      └─────────────┘
```

### 4. Traffic Mirroring (Shadow Deployment)

Traffic mirroring sends copies of live traffic to the canary version without affecting the response to users. This validates the new version under real load.

**Traffic Mirroring Flow:**

```
┌─────────────────────────────────────┐  
│         Production Traffic          │  
└──────────────┬──────────────────────┘  
               │  
        ┌──────▼──────┐  
        │Service Mesh │  
        │   Router    │  
        └──────┬──────┘  
               │  
    ┌──────────┴──────────────┐  
    │                         │  
    │ Real Response           │ Mirrored (Response Discarded)  
    │                         │  
┌───▼──────┐            ┌────▼──────┐  
│ Primary  │            │  Canary   │  
│Version 1 │            │ Version 2 │  
└──────────┘            └─────┬─────┘  
    │                         │  
    │                    ┌────▼─────┐  
    │                    │  Logs &  │  
    └───────────────────▶│ Metrics  │  
                         │ Analysis │  
                         └──────────┘
```

## Architecture and Components

### Flagger Architecture

```
┌─────────────────────────────────────────────────────────────┐  
│                    Kubernetes Cluster                       │  
│                                                             │  
│  ┌─────────────────────────────────────────────────────┐    │  
│  │              Flagger Controller                     │    │  
│  │  ┌────────────────────────────────────────────┐     │    │  
│  │  │  Canary Controller (Reconciliation Loop)   │     │    │  
│  │  └────────────────────────────────────────────┘     │    │  
│  │  ┌────────────────────────────────────────────┐     │    │  
│  │  │    Metrics Analysis & Decision Engine      │     │    │  
│  │  └────────────────────────────────────────────┘     │    │  
│  │  ┌────────────────────────────────────────────┐     │    │  
│  │  │      Traffic Routing Controller            │     │    │  
│  │  └────────────────────────────────────────────┘     │    │  
│  └─────────────────────────────────────────────────────┘    │   
│                        │                                    │  
│         ┌──────────────┼──────────────┐                     │  
│         │              │              │                     │  
│    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐                │  
│    │ Canary  │    │ Service │    │ Virtual │                │  
│    │   CRD   │    │  Mesh   │    │ Service │                │  
│    └─────────┘    │(Istio/  │    │  /Route │                │  
│                   │Linkerd) │    └─────────┘                │  
│                   └────┬────┘                               │  
│                        │                                    │  
│         ┌──────────────┼──────────────┐                     │  
│         │              │              │                     │  
│    ┌────▼────┐    ┌────▼────┐   ┌─────▼───┐                 │  
│    │ Primary │    │ Canary  │   │ Metrics │                 │  
│    │  Pods   │    │  Pods   │   │Provider │                 │  
│    └─────────┘    └─────────┘   │(Prom/   │                 │  
│                                 │Datadog) │                 │  
│                                 └─────────┘                 │  
└─────────────────────────────────────────────────────────────┘
```

### Key Components

#### 1. **Flagger Controller**

The main component that:

* Watches for Canary resources
* Orchestrates the deployment process
* Manages traffic routing
* Analyzes metrics
* Makes rollback decisions

#### 2. **Canary Custom Resource Definition (CRD)**

Defines the deployment strategy, metrics, thresholds, and webhooks:

```yaml
apiVersion: flagger.app/v1beta1  
kind: Canary  
metadata:  
  name: myapp  
  namespace: production  
spec:  
  targetRef:  
    apiVersion: apps/v1  
    kind: Deployment  
    name: myapp  
  service:  
    port: 9898  
  analysis:  
    interval: 1m  
    threshold: 5  
    maxWeight: 50  
    stepWeight: 10
```

#### 3. **Service Mesh / Ingress Controller**

Flagger integrates with various routing providers:

* **Istio**: Full feature support
* **Linkerd**: Service profiles for traffic shaping
* **App Mesh**: AWS native service mesh
* **NGINX**: Ingress-based canary
* **Contour**: Envoy-based ingress
* **Gloo**: API gateway and ingress
* **Traefik**: Cloud-native edge router
* **OSM**: Open Service Mesh

#### 4. **Metrics Provider**

Monitors application health:

* **Prometheus**: Most common, built-in support
* **Datadog**: Full APM integration
* **New Relic**: Application monitoring
* **CloudWatch**: AWS native metrics
* **Graphite**: Time-series database
* **InfluxDB**: Time-series database

#### 5. **Alert Provider**

Sends notifications on deployment events:

* Slack
* Microsoft Teams
* Discord
* Rocket
* Custom webhooks

## Deployment Strategies

### Strategy Comparison

| Strategy        | Use Case | Traffic Shift | Rollback Speed | Resource Usage |  
|-----------------|----------|---------------|----------------|----------------|  
| **Canary**      | General purpose, risk mitigation | Gradual | Fast | Low (1 extra replica) |  
| **A/B Testing** | Feature validation, UX testing | Based on headers | Fast | Low |  
| **Blue/Green**  | Zero-downtime, instant switch | Instant | Instant | High (2x resources) |  
| **Mirroring**   | Load testing, performance validation | None (mirrored) | N/A | Medium |

### 1. Canary Deployment Strategy

#### Configuration Example

```yaml
apiVersion: flagger.app/v1beta1  
kind: Canary  
metadata:  
  name: podinfo  
  namespace: test  
spec:  
  # Target Deployment  
  targetRef:  
    apiVersion: apps/v1  
    kind: Deployment  
    name: podinfo  
  
  # Service Configuration  
  service:  
    port: 9898  
    targetPort: 9898  
    portDiscovery: true  
  
  # Progressive Traffic Shifting  
  analysis:  
    # Analysis Interval  
    interval: 1m  
  
    # Max number of failed checks before rollback  
    threshold: 10  
  
    # Max traffic percentage routed to canary  
    maxWeight: 50  
  
    # Traffic increment per interval  
    stepWeight: 5  
  
    # Metrics to evaluate  
    metrics:  
    - name: request-success-rate  
      thresholdRange:  
        min: 99  
      interval: 1m  
  
    - name: request-duration  
      thresholdRange:  
        max: 500  
      interval: 1m  
  
    # Webhooks for pre/post deployment  
    webhooks:  
    - name: load-test  
      url: http://flagger-loadtester.test/  
      timeout: 5s  
      metadata:  
        type: cmd  
        cmd: "hey -z 1m -q 10 -c 2 http://podinfo-canary.test:9898/"
```

#### Canary Progression Timeline

```
Deployment Analysis Phases:  
  
Phase 1: Initialization (0-1 min)  
├─ Detect configuration change  
├─ Scale up canary deployment  
├─ Wait for readiness probes  
└─ Route 0% traffic to canary  
  
Phase 2: Progressive Traffic Shift (1-11 min)  
├─ Interval 1 (1-2 min):   5% traffic  → Analyze metrics  
├─ Interval 2 (2-3 min):  10% traffic  → Analyze metrics  
├─ Interval 3 (3-4 min):  15% traffic  → Analyze metrics  
├─ Interval 4 (4-5 min):  20% traffic  → Analyze metrics  
├─ Interval 5 (5-6 min):  25% traffic  → Analyze metrics  
├─ Interval 6 (6-7 min):  30% traffic  → Analyze metrics  
├─ Interval 7 (7-8 min):  35% traffic  → Analyze metrics  
├─ Interval 8 (8-9 min):  40% traffic  → Analyze metrics  
├─ Interval 9 (9-10 min): 45% traffic  → Analyze metrics  
└─ Interval 10 (10-11 min): 50% traffic  → Analyze metrics  
  
Phase 3: Promotion (11-12 min)  
├─ All metrics pass thresholds  
├─ Copy canary spec to primary  
├─ Scale up new primary  
├─ Route 100% traffic to primary  
└─ Scale down old canary  
  
Total Time: ~12 minutes (with stepWeight=5, maxWeight=50, interval=1m)  
  
Alternative Outcome: Rollback  
├─ Metric threshold exceeded  
├─ Route 0% traffic to canary  
├─ Scale down canary  
└─ Alert sent via webhook
```

### 2. A/B Testing Strategy

#### Configuration Example

```yaml
apiVersion: flagger.app/v1beta1  
kind: Canary  
metadata:  
  name: abtest  
spec:  
  targetRef:  
    apiVersion: apps/v1  
    kind: Deployment  
    name: myapp  
  
  service:  
    port: 9898  
  
  # A/B Testing Configuration  
  analysis:  
    interval: 1m  
    threshold: 10  
    iterations: 10  
  
    # Match conditions for routing  
    match:  
    - headers:  
        user-agent:  
          regex: ".*Chrome.*"  
    - headers:  
        cookie:  
          regex: "^(.*?;)?(version=beta)(;.*)?$"  
  
    metrics:  
    - name: request-success-rate  
      thresholdRange:  
        min: 99  
      interval: 1m  
  
    # Session affinity  
    sessionAffinity:  
      cookieName: flagger-cookie  
      maxAge: 86400
```

#### A/B Testing Request Flow

```
Request Processing:  
  
1. User Request Arrives  
   ┌─────────────────────────────┐  
   │ GET /api/feature            │  
   │ User-Agent: Chrome/120.0    │  
   │ Cookie: version=beta        │  
   └──────────────┬──────────────┘  
                  │  
2. Ingress/Service Mesh Inspection  
   ┌──────────────▼──────────────┐  
   │   Header Matching Engine    │  
   │   ┌─────────────────────┐   │  
   │   │ Regex: .*Chrome.*   │   │ ✓ Match  
   │   └─────────────────────┘   │  
   │   ┌─────────────────────┐   │  
   │   │Cookie: version=beta │   │ ✓ Match  
   │   └─────────────────────┘   │  
   └──────────────┬──────────────┘  
                  │  
3. Route to Version B  
   ┌──────────────▼──────────────┐  
   │      Version B (Canary)     │  
   │    New Feature Enabled      │  
   └──────────────┬──────────────┘  
                  │  
4. Response with Session Cookie  
   ┌──────────────▼──────────────┐  
   │ HTTP 200 OK                 │  
   │ Set-Cookie: flagger-cookie  │  
   │   =version-b; MaxAge=86400  │  
   └─────────────────────────────┘  
  
Subsequent Requests:  
   All requests with the flagger-cookie  
   continue to route to Version B  
   (Session Affinity)
```

### 3. Blue/Green Deployment Strategy

#### Configuration Example

```yaml
apiVersion: flagger.app/v1beta1  
kind: Canary  
metadata:  
  name: bluegreen  
spec:  
  targetRef:  
    apiVersion: apps/v1  
    kind: Deployment  
    name: myapp  
  
  service:  
    port: 9898  
  
  # Blue/Green Configuration  
  analysis:  
    interval: 1m  
    threshold: 10  
  
    # Iterations before promotion  
    iterations: 10  
  
    # Blue/Green specific settings  
    # No stepWeight or maxWeight = instant switch  
  
    metrics:  
    - name: request-success-rate  
      thresholdRange:  
        min: 99  
      interval: 1m  
  
    webhooks:  
    - name: smoke-tests  
      url: http://flagger-loadtester/  
      timeout: 30s  
      metadata:  
        type: bash  
        cmd: |  
          curl -sd 'test' http://myapp-canary:9898/token | grep token
```

#### Blue/Green Timeline

```
Phase 1: Green Deployment (T=0)  
┌──────────────────────────────────┐  
│ Deploy new version (Green)       │  
│ Keep traffic on Blue (100%)      │  
└──────────────────────────────────┘  
  
Phase 2: Validation (T=1-10 min)  
┌──────────────────────────────────┐  
│ Run smoke tests on Green         │  
│ Monitor metrics                  │  
│ Blue still serves 100% traffic   │  
└──────────────────────────────────┘  
  
Phase 3: Instant Switch (T=11 min)  
┌──────────────────────────────────┐  
│ If all validations pass:         │  
│   - Switch 100% traffic to Green │  
│   - Blue becomes standby         │  
│                                  │  
│ If validation fails:             │  
│   - Keep traffic on Blue         │  
│   - Scale down Green             │  
└──────────────────────────────────┘
```

### 4. Traffic Mirroring Strategy

#### Configuration Example

```yaml
apiVersion: flagger.app/v1beta1  
kind: Canary  
metadata:  
  name: mirror  
spec:  
  targetRef:  
    apiVersion: apps/v1  
    kind: Deployment  
    name: myapp  
  
  service:  
    port: 9898  
  
  # Traffic Mirroring Configuration  
  analysis:  
    interval: 1m  
    threshold: 10  
    iterations: 10  
  
    # Mirror configuration  
    mirror: true  
    mirrorWeight: 100  
  
    metrics:  
    # Only analyze canary metrics, no impact on users  
    - name: request-duration  
      thresholdRange:  
        max: 500  
      interval: 1m  
  
    - name: error-rate  
      thresholdRange:  
        max: 1  
      interval: 1m
```

## Metrics Analysis and Validation

### Built-in Metrics

Flagger supports various built-in metrics depending on the service mesh or ingress controller:

#### 1. Request Success Rate

```yaml
metrics:  
- name: request-success-rate  
  # Threshold: minimum 99% success rate  
  thresholdRange:  
    min: 99  
  interval: 1m
```

**Query (Prometheus):**

```
sum(  
  rate(  
    istio_requests_total{  
      reporter="destination",  
      destination_workload_namespace="test",  
      destination_workload="myapp",  
      response_code!~"5.*"  
    }[1m]  
  )  
)  
/  
sum(  
  rate(  
    istio_requests_total{  
      reporter="destination",  
      destination_workload_namespace="test",  
      destination_workload="myapp"  
    }[1m]  
  )  
) * 100
```

#### 2. Request Duration

```yaml
metrics:  
- name: request-duration  
  # Threshold: P99 latency under 500ms  
  thresholdRange:  
    max: 500  
  interval: 1m
```

**Query (Prometheus):**

```
histogram_quantile(0.99,  
  sum(  
    rate(  
      istio_request_duration_milliseconds_bucket{  
        reporter="destination",  
        destination_workload_namespace="test",  
        destination_workload="myapp"  
      }[1m]  
    )  
  ) by (le)  
)
```

### Custom Metrics

You can define custom metrics using Prometheus queries:

```
metrics:  
- name: custom-error-rate  
  thresholdRange:  
    max: 5  
  interval: 1m  
  query: |  
    100 - sum(  
      rate(  
        http_requests_total{  
          status!~"5.*",  
          namespace="{{ namespace }}",  
          deployment="{{ target }}"  
        }[{{ interval }}]  
      )  
    )  
    /  
    sum(  
      rate(  
        http_requests_total{  
          namespace="{{ namespace }}",  
          deployment="{{ target }}"  
        }[{{ interval }}]  
      )  
    ) * 100
```

### Metrics Analysis Flow

```
Metrics Collection & Analysis:  
  
Every Interval (e.g., 1 minute):  
┌────────────────────────────────────────────┐  
│         Flagger Controller Loop            │  
└────────────┬───────────────────────────────┘  
             │  
    ┌────────▼────────┐  
    │ Query Metrics   │  
    │   Provider      │  
    │  (Prometheus)   │  
    └────────┬────────┘  
             │  
    ┌────────▼──────────────────────────────┐  
    │  For Each Configured Metric:          │  
    │  ┌─────────────────────────────────┐  │  
    │  │ 1. Execute metric query         │  │  
    │  │ 2. Extract value                │  │  
    │  │ 3. Compare with threshold       │  │  
    │  └──────────────┬──────────────────┘  │  
    └─────────────────┼─────────────────────┘  
                      │  
         ┌────────────┴────────────┐  
         │                         │  
    ┌────▼────┐              ┌─────▼───┐  
    │  PASS   │              │  FAIL   │  
    └────┬────┘              └─────┬───┘  
         │                         │  
         │                         │  
    ┌────▼────────────┐    ┌───────▼───────┐  
    │ Increment Pass  │    │ Increment Fail│  
    │    Counter      │    │   Counter     │  
    └────┬────────────┘    └──────┬────────┘  
         │                        │  
         └────────────┬───────────┘  
                      │  
              ┌───────▼────────┐  
              │ Check Threshold│  
              └───────┬────────┘  
                      │  
         ┌────────────┴────────────┐  
         │                         │  
    ┌────▼────────┐         ┌──────▼───────┐  
    │ Pass Count  │         │ Fail Count   │  
    │   >= N      │         │    >= N      │  
    │             │         │              │  
    │ CONTINUE    │         │  ROLLBACK    │  
    │ CANARY      │         │              │  
    └─────────────┘         └──────────────┘
```

### Metric Templates

Flagger provides metric templates for common metrics:

```yaml
apiVersion: flagger.app/v1beta1  
kind: MetricTemplate  
metadata:  
  name: error-rate  
  namespace: flagger-system  
spec:  
  provider:  
    type: prometheus  
    address: http://prometheus:9090  
  query: |  
    100 - sum(  
      rate(  
        http_requests_total{  
          status!~"5.*",  
          namespace="{{ namespace }}",  
          deployment="{{ target }}"  
        }[{{ interval }}]  
      )  
    )  
    /  
    sum(  
      rate(  
        http_requests_total{  
          namespace="{{ namespace }}",  
          deployment="{{ target }}"  
        }[{{ interval }}]  
      )  
    ) * 100
```

**Usage in Canary:**

```yaml
analysis:  
  metrics:  
  - name: "error-rate"  
    templateRef:  
      name: error-rate  
      namespace: flagger-system  
    thresholdRange:  
      max: 1  
    interval: 1m
```

## Alerting and Rollback Mechanisms

### Alerting Architecture

```
Alert Flow:  
  
┌──────────────────────────────────────┐  
│      Deployment Event Occurs         │  
│  (Started, Progressing, Failed,      │  
│   Succeeded, etc.)                   │  
└──────────────┬───────────────────────┘  
               │  
        ┌──────▼──────┐  
        │   Flagger   │  
        │  Controller │  
        └──────┬──────┘  
               │  
        ┌──────▼───────────────────────┐  
        │   Alert Provider Configured  │  
        │   in Canary Spec             │  
        └──────┬───────────────────────┘  
               │  
    ┌──────────┴──────────┐  
    │                     │  
┌───▼────┐          ┌─────▼────┐  
│ Slack  │          │  Teams   │  
└───┬────┘          └────┬─────┘  
    │                    │  
┌───▼────────────────────▼──────────────┐  
│  Notification Message:                │  
│  ┌────────────────────────────────┐   │  
│  │ Environment: Production        │   │  
│  │ Canary: myapp.namespace        │   │  
│  │ Status: Failed                 │   │  
│  │ Reason: Metric check failed    │   │  
│  │   - request-success-rate: 95%  │   │  
│  │   - threshold: 99%             │   │  
│  │ Action: Rolled back            │   │  
│  └────────────────────────────────┘   │  
└───────────────────────────────────────┘
```

### Alert Configuration

```yaml
apiVersion: flagger.app/v1beta1  
kind: Canary  
metadata:  
  name: myapp  
spec:  
  # ... other configuration ...  
  
  analysis:  
    # Alert providers  
    alerts:  
    # Slack  
    - name: "slack"  
      severity: info  
      providerRef:  
        name: slack  
        namespace: flagger-system  
  
    # Microsoft Teams  
    - name: "teams"  
      severity: warn  
      providerRef:  
        name: msteams  
        namespace: flagger-system  
  
    # Custom webhook  
    - name: "custom"  
      severity: error  
      providerRef:  
        name: custom-webhook
```

#### Slack Provider

```yaml
apiVersion: flagger.app/v1beta1  
kind: AlertProvider  
metadata:  
  name: slack  
  namespace: flagger-system  
spec:  
  type: slack  
  channel: deployments  
  username: flagger  
  # Slack webhook URL stored in secret  
  secretRef:  
    name: slack-url
```

#### Microsoft Teams Provider

```yaml
apiVersion: flagger.app/v1beta1  
kind: AlertProvider  
metadata:  
  name: msteams  
  namespace: flagger-system  
spec:  
  type: msteams  
  # Teams webhook URL  
  address: https://outlook.office.com/webhook/...
```

### Rollback Mechanisms

#### Automatic Rollback Triggers

```
Rollback Decision Tree:  
  
┌─────────────────────────────────┐  
│   Metrics Analysis Interval     │  
└──────────────┬──────────────────┘  
               │  
        ┌──────▼──────┐  
        │ Check All   │  
        │   Metrics   │  
        └──────┬──────┘  
               │  
    ┌──────────┴──────────┐  
    │                     │  
┌───▼─────┐         ┌─────▼───┐  
│All Pass │         │Any Fail │  
└───┬─────┘         └─────┬───┘  
    │                     │  
    │              ┌──────▼─────┐  
    │              │ Increment  │  
    │              │Fail Counter│  
    │              └──────┬─────┘  
    │                     │  
    │              ┌──────▼─────────────┐  
    │              │ Fail Counter       │  
    │              │ >= Threshold?      │  
    │              └─────┬──────────────┘  
    │                    │  
    │         ┌──────────┴─────────┐  
    │         │                    │  
    │     ┌───▼───┐            ┌───▼────┐  
    │     │  YES  │            │   NO   │  
    │     └───┬───┘            └───┬────┘  
    │         │                    │  
    │    ┌────▼─────────┐          │  
    │    │   ROLLBACK   │          │  
    │    │              │          │  
    │    │ 1. Route 0%  │          │  
    │    │    traffic   │          │  
    │    │ 2. Scale down│          │  
    │    │    canary    │          │  
    │    │ 3. Send      │          │  
    │    │    alerts    │          │  
    │    │ 4. Reset     │          │  
    │    └──────────────┘          │  
    │                              │  
    └──────────────┬───────────────┘  
                   │  
            ┌──────▼──────┐  
            │  Continue   │  
            │  Analysis   │  
            └─────────────┘
```

#### Rollback Configuration

```yaml
analysis:  
  # Number of failed checks before rollback  
  threshold: 5  
  
  # Time between checks  
  interval: 1m  
  
  # Maximum iterations before auto-promotion  
  iterations: 10  
  
  metrics:  
  - name: request-success-rate  
    thresholdRange:  
      min: 99  
    interval: 1m  
  
  - name: request-duration  
    thresholdRange:  
      max: 500  
    interval: 1m
```

#### Rollback Scenarios

**Scenario 1: Metric Threshold Exceeded**

Time  | Success Rate | Duration | Pass Count | Fail Count | Action  
------|--------------|----------|------------|------------|--------  
T1    | 99.5%        | 450ms    | 1          | 0          | Continue  
T2    | 98.0%        | 480ms    | 1          | 1          | Continue (fail < threshold)  
T3    | 97.5%        | 490ms    | 1          | 2          | Continue  
T4    | 96.0%        | 510ms    | 1          | 3          | Continue  
T5    | 95.0%        | 530ms    | 1          | 4          | Continue  
T6    | 94.0%        | 550ms    | 1          | 5          | ROLLBACK (fail >= threshold)


**Scenario 2: Intermittent Failures**


Time  | Success Rate | Duration | Pass Count | Fail Count | Action  
------|--------------|----------|------------|------------|--------  
T1    | 99.5%       | 450ms    | 1          | 0          | Continue  
T2    | 98.0%       | 480ms    | 1          | 1          | Continue  
T3    | 99.2%       | 460ms    | 2          | 1          | Continue  
T4    | 99.8%       | 440ms    | 3          | 1          | Continue  
...   | ...         | ...      | ...        | ...        | ...  
T10   | 99.5%       | 450ms    | 9          | 1          | PROMOTE


### Manual Rollback

You can manually trigger a rollback by resetting the Canary resource:

```bash
# Rollback by reverting to previous version  
kubectl set image deployment/myapp \  
  myapp=myapp:stable  
  
# Or annotate the Canary to skip analysis  
kubectl annotate canary/myapp \  
  flagger.app/skip-analysis="true"
```

## Integration with FluxCD

Flagger was designed to work seamlessly with FluxCD for GitOps-based progressive delivery.

### GitOps Workflow with Flux and Flagger

```
GitOps Progressive Delivery Flow:  
  
┌──────────────────────────────────────────────────────────────┐  
│                       Git Repository                         │  
│  ┌────────────────────────────────────────────────────────┐  │  
│  │  manifests/                                            │  │  
│  │  ├── deployment.yaml (image: myapp:v2)                 │  │  
│  │  ├── canary.yaml (Flagger config)                      │  │  
│  │  └── kustomization.yaml                                │  │  
│  └────────────────────────────────────────────────────────┘  │  
└──────────────────┬───────────────────────────────────────────┘  
                   │ git commit & push  
                   │  
        ┌──────────▼──────────┐  
        │     Flux Source     │  
        │    Controller       │  
        │  (GitRepository)    │  
        └──────────┬──────────┘  
                   │ poll/webhook  
                   │  
        ┌──────────▼──────────┐  
        │  Flux Kustomize     │  
        │   Controller        │  
        └──────────┬──────────┘  
                   │ reconcile  
                   │  
        ┌──────────▼──────────┐  
        │  Apply Deployment   │  
        │  with new image     │  
        └──────────┬──────────┘  
                   │  
        ┌──────────▼──────────┐  
        │ Flagger Detects     │  
        │ Configuration Change│  
        └──────────┬──────────┘  
                   │  
        ┌──────────▼──────────┐  
        │ Flagger Executes    │  
        │ Progressive Delivery│  
        │   (Canary/A/B/etc)  │  
        └──────────┬──────────┘  
                   │  
    ┌──────────────┴─────────────┐  
    │                            │  
┌───▼────┐                  ┌────▼─────┐  
│Success │                  │  Failure │  
│        │                  │          │  
│Promote │                  │ Rollback │  
└───┬────┘                  └────┬─────┘  
    │                            │  
    │                            │  
    └────────────┬───────────────┘  
                 │  
          ┌──────▼──────┐  
          │   Alert &   │  
          │  Update Git │  
          │   (optional)│  
          └─────────────┘
```

### Setup Flux and Flagger

#### 1. Install Flux

```bash
# Install Flux CLI  
curl -s https://fluxcd.io/install.sh | sudo bash  
  
# Bootstrap Flux on cluster  
flux bootstrap github \  
  --owner=myorg \  
  --repository=fleet-infra \  
  --branch=main \  
  --path=clusters/production \  
  --personal
```

#### 2. Install Flagger

Create a Flux Kustomization for Flagger:

```yaml
# flagger-system/kustomization.yaml  
apiVersion: kustomize.toolkit.fluxcd.io/v1  
kind: Kustomization  
metadata:  
  name: flagger  
  namespace: flux-system  
spec:  
  interval: 10m  
  sourceRef:  
    kind: GitRepository  
    name: flux-system  
  path: ./flagger-system  
  prune: true  
  wait: true  
  timeout: 5m
```

```yaml
# flagger-system/helmrelease.yaml  
apiVersion: helm.toolkit.fluxcd.io/v2beta1  
kind: HelmRelease  
metadata:  
  name: flagger  
  namespace: flagger-system  
spec:  
  interval: 30m  
  chart:  
    spec:  
      chart: flagger  
      version: "1.36.x"  
      sourceRef:  
        kind: HelmRepository  
        name: flagger  
        namespace: flux-system  
  values:  
    meshProvider: istio  
    metricsServer: http://prometheus:9090
```

```yaml
# flagger-system/helmrepository.yaml  
apiVersion: source.toolkit.fluxcd.io/v1beta2  
kind: HelmRepository  
metadata:  
  name: flagger  
  namespace: flux-system  
spec:  
  interval: 1h  
  url: https://flagger.app
```

#### 3. Configure Application with Canary

```yaml
# apps/myapp/deployment.yaml  
apiVersion: apps/v1  
kind: Deployment  
metadata:  
  name: myapp  
  namespace: production  
spec:  
  replicas: 2  
  selector:  
    matchLabels:  
      app: myapp  
  template:  
    metadata:  
      labels:  
        app: myapp  
    spec:  
      containers:  
      - name: myapp  
        image: myapp:1.0.0  # Flux will update this  
        ports:  
        - containerPort: 9898
```

```yaml
# apps/myapp/canary.yaml  
apiVersion: flagger.app/v1beta1  
kind: Canary  
metadata:  
  name: myapp  
  namespace: production  
spec:  
  targetRef:  
    apiVersion: apps/v1  
    kind: Deployment  
    name: myapp  
  service:  
    port: 9898  
  analysis:  
    interval: 1m  
    threshold: 5  
    maxWeight: 50  
    stepWeight: 10  
    metrics:  
    - name: request-success-rate  
      thresholdRange:  
        min: 99  
      interval: 1m  
    - name: request-duration  
      thresholdRange:  
        max: 500  
      interval: 1m
```

```yaml
# apps/myapp/kustomization.yaml  
apiVersion: kustomize.toolkit.fluxcd.io/v1  
kind: Kustomization  
metadata:  
  name: myapp  
  namespace: flux-system  
spec:  
  interval: 10m  
  sourceRef:  
    kind: GitRepository  
    name: flux-system  
  path: ./apps/myapp  
  prune: true  
  wait: true
```

### Automated Image Updates with Flux

Flux can automatically update images and trigger Flagger canaries:

```yaml
# apps/myapp/imagerepository.yaml  
apiVersion: image.toolkit.fluxcd.io/v1beta2  
kind: ImageRepository  
metadata:  
  name: myapp  
  namespace: flux-system  
spec:  
  image: myregistry.azurecr.io/myapp  
  interval: 1m
```

```yaml
# apps/myapp/imagepolicy.yaml  
apiVersion: image.toolkit.fluxcd.io/v1beta2  
kind: ImagePolicy  
metadata:  
  name: myapp  
  namespace: flux-system  
spec:  
  imageRepositoryRef:  
    name: myapp  
  policy:  
    semver:  
      range: 1.x.x
```

```yaml
# apps/myapp/imageupdateautomation.yaml  
apiVersion: image.toolkit.fluxcd.io/v1beta1  
kind: ImageUpdateAutomation  
metadata:  
  name: myapp  
  namespace: flux-system  
spec:  
  interval: 1m  
  sourceRef:  
    kind: GitRepository  
    name: flux-system  
  git:  
    checkout:  
      ref:  
        branch: main  
    commit:  
      author:  
        email: fluxcdbot@users.noreply.github.com  
        name: fluxcdbot  
      messageTemplate: |  
        Update myapp to {{range .Updated.Images}}{{println .}}{{end}}  
    push:  
      branch: main  
  update:  
    path: ./apps/myapp  
    strategy: Setters
```

Update deployment with image policy marker:

```yaml
# apps/myapp/deployment.yaml  
apiVersion: apps/v1  
kind: Deployment  
metadata:  
  name: myapp  
  namespace: production  
spec:  
  replicas: 2  
  selector:  
    matchLabels:  
      app: myapp  
  template:  
    metadata:  
      labels:  
        app: myapp  
    spec:  
      containers:  
      - name: myapp  
        image: myregistry.azurecr.io/myapp:1.0.0 # {"$imagepolicy": "flux-system:myapp"}  
        ports:  
        - containerPort: 9898
```

### Complete GitOps Flow

```
Automated Deployment Pipeline:  
  
1. Developer pushes new image  
   ┌──────────────────────┐  
   │ docker push myapp:2.0│  
   └──────────┬───────────┘  
              │  
2. Flux detects new image  
   ┌──────────▼───────────┐  
   │ ImageRepository      │  
   │  polls registry      │  
   └──────────┬───────────┘  
              │  
3. Flux updates Git  
   ┌──────────▼───────────┐  
   │ ImageUpdateAutomation│  
   │  commits to Git      │  
   │  image: myapp:2.0    │  
   └──────────┬───────────┘  
              │  
4. Flux applies to cluster  
   ┌──────────▼───────────┐  
   │ Kustomize Controller │  
   │  applies Deployment  │  
   └──────────┬───────────┘  
              │  
5. Flagger starts canary  
   ┌──────────▼───────────┐  
   │  Flagger Controller  │  
   │  progressive delivery│  
   └──────────┬───────────┘  
              │  
6. Monitoring and decision  
   ┌──────────▼───────────┐  
   │  Metrics Analysis    │  
   │  Success/Rollback    │  
   └──────────────────────┘
```

## Real-World Examples

### Example 1: E-Commerce API Canary Deployment

**Scenario**: Deploy a new version of a payment API with strict SLOs:

* 99.95% success rate
* P99 latency < 200ms
* Zero data corruption

**Configuration:**

```yaml
apiVersion: flagger.app/v1beta1  
kind: Canary  
metadata:  
  name: payment-api  
  namespace: production  
spec:  
  targetRef:  
    apiVersion: apps/v1  
    kind: Deployment  
    name: payment-api  
  
  service:  
    port: 8080  
    targetPort: 8080  
    gateways:  
    - public-gateway.istio-system.svc.cluster.local  
    hosts:  
    - api.example.com  
  
  analysis:  
    # Conservative rollout: 30 minutes total  
    interval: 2m  
    threshold: 3  # Rollback after 3 consecutive failures  
    maxWeight: 50  
    stepWeight: 5  
  
    metrics:  
    # Success rate must be >= 99.95%  
    - name: request-success-rate  
      templateRef:  
        name: request-success-rate  
        namespace: flagger-system  
      thresholdRange:  
        min: 99.95  
      interval: 1m  
  
    # P99 latency must be < 200ms  
    - name: latency-p99  
      templateRef:  
        name: latency-p99  
      thresholdRange:  
        max: 200  
      interval: 1m  
  
    # Custom metric: payment processing errors  
    - name: payment-error-rate  
      query: |  
        sum(rate(payment_errors_total{namespace="production"}[1m]))  
        /  
        sum(rate(payment_requests_total{namespace="production"}[1m]))  
        * 100  
      thresholdRange:  
        max: 0.01  # Max 0.01% payment errors  
      interval: 1m  
  
    webhooks:  
    # Load test during canary  
    - name: load-test  
      url: http://loadtester.test/  
      timeout: 60s  
      metadata:  
        type: cmd  
        cmd: "hey -z 2m -q 50 -c 10 -H 'Authorization: Bearer test' https://api.example.com/v1/payments"  
  
    # Acceptance test  
    - name: acceptance-test  
      url: http://loadtester.test/  
      timeout: 30s  
      metadata:  
        type: bash  
        cmd: |  
          ./tests/payment-smoke-test.sh https://payment-api-canary:8080  
  
    # Promote gate  
    - name: confirm-promotion  
      type: confirm-promotion  
      url: http://flagger-loadtester/gate/approve  
  
    alerts:  
    - name: pagerduty  
      severity: error  
      providerRef:  
        name: pagerduty  
  
    - name: slack-payments  
      severity: info  
      providerRef:  
        name: slack-payments
```

**Timeline:**

```
T=0:    Canary initialized, 0% traffic  
T=2m:   5% traffic to canary  → Load test + metrics check  
T=4m:   10% traffic           → Continue monitoring  
T=6m:   15% traffic  
...  
T=20m:  50% traffic           → Final validation  
T=22m:  Manual approval gate  → Wait for confirmation  
T=24m:  Promotion to 100%     → Canary becomes primary
```

### Example 2: Mobile App Backend A/B Test

**Scenario**: Test a new recommendation algorithm for a mobile app. Route users based on app version.

**Configuration:**

```yaml
apiVersion: flagger.app/v1beta1  
kind: Canary  
metadata:  
  name: recommendation-api  
  namespace: mobile-backend  
spec:  
  targetRef:  
    apiVersion: apps/v1  
    kind: Deployment  
    name: recommendation-api  
  
  service:  
    port: 8080  
    gateways:  
    - mobile-gateway  
    hosts:  
    - api.mobile.example.com  
    trafficPolicy:  
      tls:  
        mode: ISTIO_MUTUAL  
  
  analysis:  
    # Run A/B test for 7 days  
    interval: 1h  
    iterations: 168  # 7 days * 24 hours  
  
    # A/B testing match rules  
    match:  
    - headers:  
        x-app-version:  
          regex: "^2\\..*"  # App version 2.x  
    - headers:  
        x-mobile-beta:  
          exact: "true"      # Beta users  
  
    # Session affinity to keep users on same version  
    sessionAffinity:  
      cookieName: recommendation-version  
      maxAge: 604800  # 7 days  
  
    metrics:  
    # Technical metrics  
    - name: request-success-rate  
      thresholdRange:  
        min: 99.5  
      interval: 5m  
  
    # Business metrics  
    - name: click-through-rate  
      query: |  
        sum(rate(recommendation_clicks_total{version="canary"}[1h]))  
        /  
        sum(rate(recommendation_views_total{version="canary"}[1h]))  
        * 100  
      thresholdRange:  
        min: 5  # Baseline: 5% CTR  
      interval: 1h  
  
    - name: conversion-rate  
      query: |  
        sum(rate(purchases_total{source="recommendation",version="canary"}[1h]))  
        /  
        sum(rate(recommendation_clicks_total{version="canary"}[1h]))  
        * 100  
      thresholdRange:  
        min: 2  # Baseline: 2% conversion  
      interval: 1h  
  
    webhooks:  
    - name: daily-report  
      url: http://analytics-service/webhooks/ab-test-report  
      type: event  
      metadata:  
        eventType: "analysis-complete"  
  
    alerts:  
    - name: slack-mobile-team  
      severity: info  
      providerRef:  
        name: slack-mobile
```

**A/B Test Analysis:**

```
Comparison Metrics (After 7 days):  
  
Version A (Primary - Old Algorithm):  
├─ Users: 50,000  
├─ Click-through rate: 5.2%  
├─ Conversion rate: 2.1%  
└─ Revenue per user: $3.50  
  
Version B (Canary - New Algorithm):  
├─ Users: 50,000  
├─ Click-through rate: 6.8%  (+30.8%)  
├─ Conversion rate: 2.9%     (+38.1%)  
└─ Revenue per user: $4.75   (+35.7%)  
  
Decision: Promote Version B
```

### Example 3: Blue/Green with Database Migration

**Scenario**: Deploy application with database schema changes requiring coordination.

**Configuration:**

```yaml
apiVersion: flagger.app/v1beta1  
kind: Canary  
metadata:  
  name: user-service  
  namespace: production  
spec:  
  targetRef:  
    apiVersion: apps/v1  
    kind: Deployment  
    name: user-service  
  
  service:  
    port: 8080  
  
  analysis:  
    interval: 1m  
    iterations: 10  
  
    # Blue/Green: no gradual traffic shift  
    # Traffic stays on primary until promotion  
  
    webhooks:  
    # Pre-rollout: Run database migration  
    - name: db-migration  
      type: pre-rollout  
      url: http://migration-runner/  
      timeout: 300s  
      metadata:  
        type: bash  
        cmd: |  
          kubectl exec -n production user-service-canary-xxx -- \  
            /app/migrate up  
  
    # Smoke tests on canary with 0% production traffic  
    - name: smoke-tests  
      url: http://loadtester/  
      timeout: 60s  
      metadata:  
        type: bash  
        cmd: |  
          # Test canary endpoint directly  
          ./tests/smoke-test.sh http://user-service-canary:8080  
  
          # Test database schema compatibility  
          ./tests/db-schema-test.sh  
  
    # Integration tests  
    - name: integration-tests  
      url: http://loadtester/  
      timeout: 120s  
      metadata:  
        type: bash  
        cmd: |  
          kubectl apply -f tests/integration-test-job.yaml  
          kubectl wait --for=condition=complete job/integration-test --timeout=120s  
  
    # Post-rollout: cleanup old schema  
    - name: db-cleanup  
      type: post-rollout  
      url: http://migration-runner/  
      timeout: 60s  
      metadata:  
        type: bash  
        cmd: |  
          kubectl exec -n production user-service-primary-xxx -- \  
            /app/cleanup-old-schema.sh  
  
    # Rollback webhook: revert database  
    - name: db-rollback  
      type: rollback  
      url: http://migration-runner/  
      timeout: 300s  
      metadata:  
        type: bash  
        cmd: |  
          kubectl exec -n production user-service-primary-xxx -- \  
            /app/migrate down  
  
    metrics:  
    - name: request-success-rate  
      thresholdRange:  
        min: 99.9  
      interval: 1m  
  
    - name: database-errors  
      query: |  
        sum(rate(db_errors_total{namespace="production"}[1m]))  
      thresholdRange:  
        max: 0  
      interval: 1m  
  
    alerts:  
    - name: slack-platform-team  
      severity: warn  
      providerRef:  
        name: slack
```

**Deployment Timeline:**

```
Phase 1: Pre-Rollout (T=0-5min)  
├─ Deploy canary pods with new code  
├─ Run database migration (forward-compatible)  
└─ Primary continues serving 100% traffic  
  
Phase 2: Testing (T=5-15min)  
├─ Run smoke tests against canary pods  
├─ Run integration tests  
├─ Validate database schema  
└─ Primary still serves 100% traffic  
  
Phase 3: Switch (T=15-16min)  
├─ If all tests pass: instant switch to canary  
├─ Canary becomes primary  
├─ Old primary becomes standby  
└─ Canary now serves 100% traffic  
  
Phase 4: Post-Rollout (T=16-20min)  
├─ Monitor new primary  
├─ Run database cleanup (optional)  
└─ Scale down old version  
  
Rollback Scenario:  
If any step fails → Revert database → Keep traffic on old primary
```

### Example 4: Multi-Region Canary with Traffic Mirroring

**Scenario**: Deploy to multiple regions with traffic mirroring for validation.

**Configuration:**

```yaml
apiVersion: flagger.app/v1beta1  
kind: Canary  
metadata:  
  name: api-gateway  
  namespace: production  
spec:  
  targetRef:  
    apiVersion: apps/v1  
    kind: Deployment  
    name: api-gateway  
  
  service:  
    port: 8080  
    gateways:  
    - istio-system/public-gateway  
    hosts:  
    - api.example.com  
  
  analysis:  
    # Phase 1: Traffic mirroring (shadow mode)  
    interval: 1m  
    iterations: 10  
    mirror: true  
    mirrorWeight: 100  
  
    metrics:  
    # Monitor canary errors without affecting users  
    - name: error-rate  
      query: |  
        sum(rate(http_requests_total{  
          code=~"5.*",  
          deployment="api-gateway-canary"  
        }[1m]))  
        /  
        sum(rate(http_requests_total{  
          deployment="api-gateway-canary"  
        }[1m]))  
        * 100  
      thresholdRange:  
        max: 1  
      interval: 1m  
  
    - name: memory-usage  
      query: |  
        sum(container_memory_usage_bytes{  
          pod=~"api-gateway-canary.*"  
        }) / 1024 / 1024  
      thresholdRange:  
        max: 2048  # 2GB  
      interval: 1m  
  
    - name: cpu-usage  
      query: |  
        sum(rate(container_cpu_usage_seconds_total{  
          pod=~"api-gateway-canary.*"  
        }[1m]))  
      thresholdRange:  
        max: 2  # 2 cores  
      interval: 1m  
  
    webhooks:  
    - name: mirror-analysis  
      url: http://analyzer-service/mirror-results  
      timeout: 30s  
      metadata:  
        cmd: |  
          # Compare response times between primary and canary  
          python3 /scripts/compare-mirror-metrics.py \  
            --primary api-gateway-primary \  
            --canary api-gateway-canary \  
            --threshold 1.2  # Canary can be max 20% slower
```

**Multi-Region Deployment:**

```yaml
# Region: us-east-1  
apiVersion: flagger.app/v1beta1  
kind: Canary  
metadata:  
  name: api-gateway-us-east  
  namespace: production-us-east  
spec:  
  # ... same config as above ...  
  analysis:  
    interval: 1m  
    iterations: 10  
    # Stagger deployments: us-east goes first  
    canaryReadyThreshold: 0  
  
---  
# Region: eu-west-1  
apiVersion: flagger.app/v1beta1  
kind: Canary  
metadata:  
  name: api-gateway-eu-west  
  namespace: production-eu-west  
spec:  
  # ... same config as above ...  
  analysis:  
    interval: 1m  
    iterations: 10  
    # Wait for us-east to complete  
    webhooks:  
    - name: check-us-east-status  
      type: pre-rollout  
      url: http://region-coordinator/check-status  
      timeout: 600s  # Wait up to 10 minutes  
      metadata:  
        region: us-east-1  
        canary: api-gateway-us-east
```

**Multi-Region Flow:**

```
Progressive Multi-Region Deployment:  
  
T=0: us-east-1 starts (25% of global traffic)  
├─ Mirror traffic (10min)  
├─ Gradual rollout (20min)  
└─ Validation (5min)  
  
T=35: us-east-1 complete → Trigger eu-west-1  
├─ eu-west-1 starts (30% of global traffic)  
├─ Mirror traffic (10min)  
├─ Gradual rollout (20min)  
└─ Validation (5min)  
  
T=70: eu-west-1 complete → Trigger ap-south-1  
├─ ap-south-1 starts (25% of global traffic)  
└─ ... same process  
  
T=105: ap-south-1 complete → Trigger us-west-2  
├─ us-west-2 starts (20% of global traffic)  
└─ ... same process  
  
T=140: All regions deployed successfully  
  
Rollback Strategy:  
├─ If us-east-1 fails → Abort entire deployment  
├─ If later region fails → Keep successful regions  
└─ Automated rollback per region
```

## Advanced Topics

### 1. Custom Metrics with Multiple Providers

Flagger supports combining metrics from different providers:

```yaml
apiVersion: flagger.app/v1beta1  
kind: Canary  
metadata:  
  name: multi-provider-app  
spec:  
  # ... target config ...  
  analysis:  
    metrics:  
    # Prometheus for technical metrics  
    - name: request-success-rate  
      templateRef:  
        name: success-rate  
        namespace: flagger-system  
      thresholdRange:  
        min: 99  
      interval: 1m  
  
    # Datadog for APM metrics  
    - name: apm-error-rate  
      templateRef:  
        name: datadog-error-rate  
        namespace: flagger-system  
      thresholdRange:  
        max: 1  
      interval: 1m  
  
    # Custom webhook for business metrics  
    - name: business-kpi  
      templateRef:  
        name: business-metrics  
      thresholdRange:  
        min: 100  
      interval: 5m
```

**Datadog Metric Template:**

```yaml
apiVersion: flagger.app/v1beta1  
kind: MetricTemplate  
metadata:  
  name: datadog-error-rate  
  namespace: flagger-system  
spec:  
  provider:  
    type: datadog  
    address: https://api.datadoghq.com  
    secretRef:  
      name: datadog-api-key  
  query: |  
    avg:trace.http.request.errors{service:{{ target }}}  
    /  
    avg:trace.http.request.hits{service:{{ target }}}  
    * 100
```

### 2. Progressive Traffic Shadowing

Gradually increase mirroring percentage:

```yaml
analysis:  
  # Start with 10% mirroring  
  mirror: true  
  mirrorWeight: 10  
  
  # Increase mirroring every iteration  
  canaryAnalysis:  
    stepWeightPromotion: 10  # Increase mirror by 10% each step  
    maxMirrorWeight: 100  
  
  iterations: 10  # Reach 100% mirroring after 10 iterations  
  
  metrics:  
  - name: canary-errors  
    thresholdRange:  
      max: 1  
    interval: 1m
```

### 3. Conformance Testing with Test Runners

Integration with test frameworks:

```yaml
webhooks:  
- name: artillery-load-test  
  url: http://flagger-loadtester/  
  timeout: 60s  
  metadata:  
    type: bash  
    cmd: |  
      artillery run \  
        --target http://myapp-canary:8080 \  
        --output report.json \  
        /tests/load-test.yml  
  
      # Check results  
      ERRORS=$(jq '.aggregate.counters["errors.total"]' report.json)  
      if [ "$ERRORS" -gt 0 ]; then  
        exit 1  
      fi  
  
- name: k6-performance-test  
  url: http://flagger-loadtester/  
  timeout: 120s  
  metadata:  
    type: bash  
    cmd: |  
      k6 run \  
        --vus 100 \  
        --duration 2m \  
        --env ENDPOINT=http://myapp-canary:8080 \  
        /tests/performance.js  
  
- name: postman-integration-test  
  url: http://flagger-loadtester/  
  timeout: 30s  
  metadata:  
    type: bash  
    cmd: |  
      newman run \  
        --environment canary-env.json \  
        --reporters cli,json \  
        /tests/api-integration.postman_collection.json
```

### 4. Multi-Cluster Canary Deployments

Flagger can coordinate deployments across multiple clusters:

```yaml
# Cluster 1: primary-cluster  
apiVersion: flagger.app/v1beta1  
kind: Canary  
metadata:  
  name: myapp-primary-cluster  
spec:  
  # ... standard config ...  
  analysis:  
    webhooks:  
    - name: notify-secondary-cluster  
      type: post-rollout  
      url: https://secondary-cluster-api/trigger-deployment  
      timeout: 30s  
      metadata:  
        cluster: secondary-cluster  
        action: start-canary  
  
---  
# Cluster 2: secondary-cluster  
apiVersion: flagger.app/v1beta1  
kind: Canary  
metadata:  
  name: myapp-secondary-cluster  
spec:  
  # ... standard config ...  
  analysis:  
    webhooks:  
    - name: wait-for-primary  
      type: pre-rollout  
      url: http://cluster-coordinator/check-primary-status  
      timeout: 600s  
      metadata:  
        primary-cluster: primary-cluster  
        canary: myapp-primary-cluster
```

### 5. Canary with Feature Flags

Combine Flagger with feature flag systems:

```yaml
analysis:  
  webhooks:  
  # Enable feature flag for canary traffic  
  - name: enable-feature-flag  
    type: pre-rollout  
    url: http://feature-flag-service/api/flags  
    timeout: 10s  
    metadata:  
      method: POST  
      body: |  
        {  
          "flag": "new-algorithm",  
          "environment": "production",  
          "target": "canary",  
          "enabled": true  
        }  
  
  # Validate feature flag behavior  
  - name: test-feature-flag  
    url: http://loadtester/  
    timeout: 60s  
    metadata:  
      cmd: |  
        # Test with feature flag enabled  
        curl -H "X-Feature-Flag: new-algorithm" \  
          http://myapp-canary:8080/api/test  
  
  # Disable feature flag on rollback  
  - name: disable-feature-flag  
    type: rollback  
    url: http://feature-flag-service/api/flags  
    timeout: 10s  
    metadata:  
      method: POST  
      body: |  
        {  
          "flag": "new-algorithm",  
          "environment": "production",  
          "target": "canary",  
          "enabled": false  
        }
```

### 6. Cost-Optimized Canary with Spot Instances

Deploy canary to cost-effective infrastructure:

```yaml
apiVersion: apps/v1  
kind: Deployment  
metadata:  
  name: myapp  
spec:  
  template:  
    spec:  
      # Primary runs on on-demand instances  
      nodeSelector:  
        node-type: on-demand  
      tolerations:  
      - key: node-type  
        value: on-demand  
        effect: NoSchedule  
  
---  
apiVersion: flagger.app/v1beta1  
kind: Canary  
metadata:  
  name: myapp  
spec:  
  targetRef:  
    apiVersion: apps/v1  
    kind: Deployment  
    name: myapp  
  
  # Override canary pod spec to use spot instances  
  analysis:  
    # ... standard config ...  
    canaryAnalysis:  
      templateVariables:  
        nodeSelector:  
          node-type: spot  
        tolerations:  
        - key: node-type  
          value: spot  
          effect: NoSchedule  
        - key: spot-instance  
          operator: Exists  
          effect: NoSchedule
```

### 7. Chaos Engineering Integration

Integrate chaos testing during canary:

```yaml
webhooks:  
- name: chaos-test-network-latency  
  url: http://chaos-runner/  
  timeout: 300s  
  metadata:  
    type: bash  
    cmd: |  
      # Apply network latency to canary  
      kubectl apply -f - <<EOF  
      apiVersion: chaos-mesh.org/v1alpha1  
      kind: NetworkChaos  
      metadata:  
        name: network-delay-canary  
      spec:  
        action: delay  
        mode: all  
        selector:  
          namespaces:  
          - production  
          labelSelectors:  
            app: myapp  
            version: canary  
        delay:  
          latency: "100ms"  
          correlation: "100"  
        duration: "5m"  
      EOF  
  
      # Wait for chaos to complete  
      sleep 300  
  
      # Delete chaos experiment  
      kubectl delete networkchaos network-delay-canary  
  
- name: chaos-test-pod-failure  
  url: http://chaos-runner/  
  timeout: 180s  
  metadata:  
    type: bash  
    cmd: |  
      # Kill random canary pod  
      kubectl delete pod \  
        -l app=myapp,version=canary \  
        --field-selector=status.phase=Running \  
        -n production \  
        $(kubectl get pods -l app=myapp,version=canary \  
          -n production -o name | shuf -n 1)  
  
      # Wait for pod to recover  
      sleep 60  
  
      # Verify all pods are healthy  
      kubectl wait --for=condition=ready pod \  
        -l app=myapp,version=canary \  
        -n production \  
        --timeout=120s
```

## Best Practices

### 1. Metric Selection

**DO:**

* Use multiple metrics (success rate + latency + custom)
* Include business metrics when relevant
* Set realistic thresholds based on historical data
* Use percentiles (P95, P99) rather than averages

**DON'T:**

* Rely on a single metric
* Set thresholds too tight (causes false rollbacks)
* Ignore cold start effects
* Use metrics that don't reflect user experience

**Example Good Metric Set:**

```yaml
metrics:  
# Availability  
- name: request-success-rate  
  thresholdRange:  
    min: 99.5  # Based on SLO  
  
# Performance  
- name: request-duration-p99  
  thresholdRange:  
    max: 500  # Based on SLO  
  
# Saturation  
- name: cpu-usage  
  thresholdRange:  
    max: 80  # Leave headroom  
  
# Business  
- name: conversion-rate  
  thresholdRange:  
    min: 2.0  # Based on historical average
```

### 2. Rollout Speed

**Conservative (High-Risk Services):**

```yaml
analysis:  
  interval: 5m      # Slow progression  
  threshold: 3      # Quick rollback  
  maxWeight: 50     # Limited exposure  
  stepWeight: 5     # Small increments  
  iterations: 20    # Long validation  
  
# Total time: 100 minutes  
# Max exposure: 50%
```

**Aggressive (Low-Risk Services):**

```yaml
analysis:  
  interval: 1m      # Fast progression  
  threshold: 10     # Tolerate transients  
  maxWeight: 80     # High exposure  
  stepWeight: 20    # Large increments  
  iterations: 5     # Quick validation  
  
# Total time: 5 minutes  
# Max exposure: 80%
```

### 3. Webhook Best Practices

**Load Testing:**

```yaml
webhooks:  
- name: load-test  
  url: http://loadtester/  
  timeout: 60s  
  metadata:  
    type: cmd  
    # Gradually ramp up load  
    cmd: |  
      hey -z 60s \  
        -q 10 -c 2 \  # Start with low concurrency  
        -H "X-Test: true" \  
        http://myapp-canary:8080/health  
  
# Run more intensive load test at higher weights  
- name: load-test-50percent  
  url: http://loadtester/  
  timeout: 120s  
  metadata:  
    type: cmd  
    # Only run when canary has 50% traffic  
    cmd: |  
      if [ "{{ canaryWeight }}" -eq 50 ]; then  
        hey -z 120s \  
          -q 100 -c 20 \  
          http://myapp-canary:8080/api  
      fi
```

**Integration Testing:**

```yaml
webhooks:  
- name: integration-test  
  type: pre-rollout  # Run before any traffic  
  url: http://loadtester/  
  timeout: 180s  
  metadata:  
    type: bash  
    cmd: |  
      set -e  # Exit on any error  
  
      # Wait for canary to be ready  
      kubectl wait --for=condition=ready pod \  
        -l app=myapp,version=canary \  
        --timeout=60s  
  
      # Run test suite  
      pytest /tests/integration \  
        --base-url=http://myapp-canary:8080 \  
        --verbose \  
        --junit-xml=results.xml  
  
      # Upload results  
      curl -X POST http://test-results/api/upload \  
        -F "file=@results.xml"
```

### 4. Alert Configuration

**Alert Levels:**

```yaml
alerts:  
# Info: All deployments  
- name: slack-deployments  
  severity: info  
  providerRef:  
    name: slack-deployments  
  
# Warning: Slow rollouts or degraded metrics  
- name: slack-warnings  
  severity: warn  
  providerRef:  
    name: slack-oncall  
  
# Error: Rollbacks and failures  
- name: pagerduty  
  severity: error  
  providerRef:  
    name: pagerduty-production
```

**Alert Content:**

Configure alert providers with useful context:

```yaml
apiVersion: flagger.app/v1beta1  
kind: AlertProvider  
metadata:  
  name: slack-oncall  
spec:  
  type: slack  
  channel: oncall-alerts  
  username: flagger  
  secretRef:  
    name: slack-webhook  
  # Message template  
  messageTemplate: |  
    {{ if eq .Status "succeeded" }}:white_check_mark:{{ else }}:warning:{{ end }}  
    *Canary Deployment {{ .Status }}*  
  
    *Environment:* {{ .Metadata.environment }}  
    *Service:* {{ .Name }}.{{ .Namespace }}  
    *Version:* {{ .Metadata.version }}  
  
    {{ if eq .Status "failed" }}  
    *Failure Reason:*  
    {{ range .CanaryAnalysis.Iterations }}  
    {{ if .Failed }}  
    - {{ .Metric }}: {{ .Value }} (threshold: {{ .Threshold }})  
    {{ end }}  
    {{ end }}  
    {{ end }}
```

### 5. Resource Management

**Canary Resources:**

```yaml
apiVersion: apps/v1  
kind: Deployment  
metadata:  
  name: myapp  
spec:  
  replicas: 3  # Primary replicas  
  template:  
    spec:  
      containers:  
      - name: myapp  
        resources:  
          requests:  
            cpu: 100m  
            memory: 128Mi  
          limits:  
            cpu: 500m  
            memory: 512Mi  
  
# Flagger will create canary with:  
# - 1 replica during initialization  
# - Scale to match primary during promotion  
# - Scale to 0 after successful deployment
```

**HPA Integration:**

```yaml
apiVersion: autoscaling/v2  
kind: HorizontalPodAutoscaler  
metadata:  
  name: myapp  
spec:  
  scaleTargetRef:  
    apiVersion: apps/v1  
    kind: Deployment  
    name: myapp  # Target primary, not canary  
  minReplicas: 3  
  maxReplicas: 10  
  metrics:  
  - type: Resource  
    resource:  
      name: cpu  
      target:  
        type: Utilization  
        averageUtilization: 80  
  
# Flagger handles scaling:  
# - Primary: Scaled by HPA  
# - Canary: Scaled to match primary during rollout
```

### 6. Security Considerations

**Network Policies:**

```yaml
apiVersion: networking.k8s.io/v1  
kind: NetworkPolicy  
metadata:  
  name: allow-canary-traffic  
spec:  
  podSelector:  
    matchLabels:  
      app: myapp  
  policyTypes:  
  - Ingress  
  - Egress  
  ingress:  
  # Allow from service mesh  
  - from:  
    - podSelector:  
        matchLabels:  
          app: istio-ingressgateway  
    ports:  
    - protocol: TCP  
      port: 8080  
  
  # Allow from Flagger loadtester  
  - from:  
    - namespaceSelector:  
        matchLabels:  
          name: flagger-system  
      podSelector:  
        matchLabels:  
          app: loadtester  
  
  egress:  
  # Allow to database  
  - to:  
    - podSelector:  
        matchLabels:  
          app: postgresql  
    ports:  
    - protocol: TCP  
      port: 5432
```

**Secret Management:**

```yaml
# Use separate secrets for canary testing  
apiVersion: v1  
kind: Secret  
metadata:  
  name: myapp-canary-secrets  
type: Opaque  
data:  
  api-key: <test-api-key>  
  db-password: <test-db-password>  
  
---  
# Canary uses test secrets  
apiVersion: flagger.app/v1beta1  
kind: Canary  
metadata:  
  name: myapp  
spec:  
  analysis:  
    webhooks:  
    - name: acceptance-test  
      url: http://loadtester/  
      metadata:  
        cmd: |  
          # Use canary-specific test credentials  
          export API_KEY=$(kubectl get secret myapp-canary-secrets \  
            -o jsonpath='{.data.api-key}' | base64 -d)  
  
          ./run-tests.sh http://myapp-canary:8080
```

### 7. Monitoring Flagger Itself

Monitor Flagger controller health:

```yaml
# ServiceMonitor for Prometheus Operator  
apiVersion: monitoring.coreos.com/v1  
kind: ServiceMonitor  
metadata:  
  name: flagger  
  namespace: flagger-system  
spec:  
  selector:  
    matchLabels:  
      app.kubernetes.io/name: flagger  
  endpoints:  
  - port: http-metrics  
    interval: 15s
```

**Key Flagger Metrics:**

* `flagger_canary_total`: Total number of canary objects
* `flagger_canary_status`: Status of each canary (0=failed, 1=succeeded)
* `flagger_canary_duration_seconds`: Canary analysis duration
* `flagger_canary_weight`: Current canary weight

**Alert Rules:**

```yaml
groups:  
- name: flagger  
  rules:  
  - alert: FlaggerCanaryStuck  
    expr: |  
      flagger_canary_duration_seconds > 3600  
    for: 5m  
    labels:  
      severity: warning  
    annotations:  
      summary: "Canary {{ $labels.name }} stuck in {{ $labels.namespace }}"  
  
  - alert: FlaggerCanaryFailed  
    expr: |  
      flagger_canary_status == 0  
    for: 1m  
    labels:  
      severity: error  
    annotations:  
      summary: "Canary {{ $labels.name }} failed in {{ $labels.namespace }}"
```

### 8. Testing Your Canary Configuration

**Test in Staging First:**

```yaml
# staging/myapp-canary.yaml  
apiVersion: flagger.app/v1beta1  
kind: Canary  
metadata:  
  name: myapp  
  namespace: staging  
spec:  
  # Aggressive settings for fast feedback  
  analysis:  
    interval: 30s  
    threshold: 3  
    maxWeight: 100  
    stepWeight: 20  
    iterations: 5
```

**Dry-Run Mode:**

Test Flagger behavior without affecting production:

```bash
# Install Flagger in dry-run mode  
helm upgrade -i flagger flagger/flagger \  
  --namespace flagger-system \  
  --set dryRun=true  
  
# Flagger will:  
# - Analyze metrics  
# - Make decisions  
# - Log what it WOULD do  
# - NOT actually modify traffic routing
```

**Simulate Failures:**

```bash
# Trigger rollback by injecting errors  
kubectl exec -it loadtester -n flagger-system -- \  
  hey -z 5m -q 10 -c 2 \  
    -m POST \  
    -H "X-Inject-Failure: 500" \  
    http://myapp-canary:8080/api
```

## Troubleshooting

### Common Issues

#### 1. Canary Stuck in "Progressing" State

**Symptoms:**

```bash
$ kubectl get canary myapp  
NAME    STATUS        WEIGHT   LASTTRANSITIONTIME  
myapp   Progressing   10       10m
```

**Possible Causes:**

**A. Metrics Not Available:**

```bash
# Check Flagger logs  
kubectl logs -n flagger-system deploy/flagger -f  
  
# Error: "no values found for metric request-success-rate"
```

**Solution:**

```bash
# Verify Prometheus is accessible  
kubectl exec -n flagger-system deploy/flagger -- \  
  wget -O- http://prometheus:9090/api/v1/query?query=up  
  
# Check if app is generating metrics  
kubectl exec -n production deploy/myapp-primary -- \  
  wget -O- http://localhost:8080/metrics
```

**B. Service Mesh Not Configured:**

```bash
# Check if Istio sidecar is injected  
kubectl get pod -n production myapp-xxx -o jsonpath='{.spec.containers[*].name}'  
# Should show: myapp, istio-proxy
```

**Solution:**

```bash
# Enable Istio injection  
kubectl label namespace production istio-injection=enabled  
  
# Restart deployment  
kubectl rollout restart deployment/myapp -n production
```

#### 2. Immediate Rollback

**Symptoms:**

```bash
$ kubectl get canary myapp  
NAME    STATUS   WEIGHT   LASTTRANSITIONTIME  
myapp   Failed   0        30s
```

**Diagnosis:**

```bash
# Check canary events  
kubectl describe canary myapp -n production  
  
# Events:  
#  Warning  Synced  30s  flagger  Halt advancement myapp.production  
#           request-success-rate check failed: 95.00 < 99.00
```

**Solutions:**

**A. Threshold Too Strict:**

```bash
# Adjust threshold based on historical data  
metrics:  
- name: request-success-rate  
  thresholdRange:  
    min: 95  # Reduced from 99  
  interval: 1m
```

**B. Cold Start Issues:**

```bash
# Add startup delay  
analysis:  
  # Wait for pods to warm up  
  delay: 30s  
  
  metrics:  
  - name: request-success-rate  
    # Start checking after canary receives traffic  
    interval: 2m  # Longer interval
```

**C. Load Test Overwhelming Canary:**

```yaml
webhooks:  
- name: load-test  
  url: http://loadtester/  
  metadata:  
    cmd: |  
      # Start with gentle load  
      hey -z 60s -q 5 -c 2 http://myapp-canary:8080/  
      # Instead of: hey -z 60s -q 100 -c 50 ...
```

#### 3. Canary Not Initializing

**Symptoms:**

```bash
$ kubectl get canary myapp  
NAME    STATUS          WEIGHT   LASTTRANSITIONTIME  
myapp   Initializing    0        5m
```

**Diagnosis:**

```bash
# Check Flagger logs  
kubectl logs -n flagger-system deploy/flagger | grep myapp  
  
# Common errors:  
# - "deployment myapp.production not found"  
# - "service myapp.production not found"  
# - "virtualservice myapp.production not found"
```

**Solutions:**

**A. Missing Target Deployment:**

```bash
# Verify deployment exists  
kubectl get deployment myapp -n production  
  
# If missing, create it  
kubectl apply -f myapp-deployment.yaml
```

**B. Service Port Mismatch:**

```yaml
# Canary config  
spec:  
  service:  
    port: 8080  # ← Must match service port  
  
---  
# Service config  
apiVersion: v1  
kind: Service  
metadata:  
  name: myapp  
spec:  
  ports:  
  - port: 8080  # ← Must match  
    targetPort: 8080
```

**C. Istio Resources Not Ready:**

```bash
# Check if VirtualService was created  
kubectl get virtualservice -n production  
  
# Check if DestinationRule was created  
kubectl get destinationrule -n production  
  
# Flagger should create these automatically  
# If missing, check RBAC permissions  
kubectl auth can-i create virtualservices \  
  --as=system:serviceaccount:flagger-system:flagger \  
  -n production
```

#### 4. Traffic Not Shifting

**Symptoms:**

* Canary shows "Progressing" with increasing weight
* But all traffic still goes to primary

**Diagnosis:**

```bash
# Check actual traffic distribution  
kubectl exec -n production deploy/myapp-loadtester -- \  
  watch -n 1 'curl -s http://myapp:8080/version | sort | uniq -c'  
  
# Should show traffic split, e.g.:  
#  70 primary  
#  30 canary
```

**Solutions:**

**A. Service Mesh Configuration:**

For Istio:

```bash
# Check VirtualService routing rules  
kubectl get virtualservice myapp -n production -o yaml  
  
# Should see weight distribution:  
# route:  
# - destination:  
#     host: myapp-primary  
#   weight: 70  
# - destination:  
#     host: myapp-canary  
#   weight: 30
```

**B. Multiple Services Pointing to Same Deployment:**

```yaml
# BAD: Multiple services bypassing Flagger  
apiVersion: v1  
kind: Service  
metadata:  
  name: myapp-direct  # ← Don't do this  
spec:  
  selector:  
    app: myapp  # Selects all pods directly  
  
# GOOD: Use Flagger-managed service  
# Let Flagger create: myapp, myapp-primary, myapp-canary
```

#### 5. Metrics Not Collected

**Symptoms:**

```bash
# Flagger logs show:  
"no values found for metric request-success-rate"
```

**Diagnosis:**

```bash
# Test Prometheus query manually  
kubectl port-forward -n monitoring svc/prometheus 9090:9090  
  
# Open browser: http://localhost:9090  
# Run query:  
sum(rate(istio_requests_total{  
  destination_workload="myapp-canary"  
}[1m]))
```

**Solutions:**

**A. Label Mismatch:**

```yaml
# Ensure metric query matches pod labels  
metrics:  
- name: request-success-rate  
  query: |  
    sum(rate(istio_requests_total{  
      destination_workload="{{ target }}", # ← Must match deployment name  
      destination_workload_namespace="{{ namespace }}"  
    }[{{ interval }}]))
```

**B. Insufficient Traffic:**

```yaml
# Add load test to generate metrics  
webhooks:  
- name: generate-traffic  
  url: http://loadtester/  
  metadata:  
    cmd: "hey -z 1m -q 10 -c 2 http://myapp-canary:8080/"
```

**C. Prometheus Scraping Issues:**

```bash
# Check if pods are being scraped  
kubectl get pods -n production -o yaml | grep prometheus.io  
  
# Should show annotations:  
# prometheus.io/scrape: "true"  
# prometheus.io/port: "8080"  
# prometheus.io/path: "/metrics"
```

### Debugging Commands

```bash
# View Flagger controller logs  
kubectl logs -n flagger-system deploy/flagger -f  
  
# Describe canary status  
kubectl describe canary myapp -n production  
  
# Watch canary status  
watch kubectl get canary -n production  
  
# Get detailed canary spec  
kubectl get canary myapp -n production -o yaml  
  
# Check Flagger-created resources  
kubectl get all -n production -l app.kubernetes.io/managed-by=flagger  
  
# View metric analysis results  
kubectl get canary myapp -n production -o jsonpath='{.status.canaryAnalysis}'  
  
# Force canary promotion (skip analysis)  
kubectl annotate canary myapp -n production \  
  flagger.app/skip-analysis="true"  
  
# Reset canary (trigger new rollout)  
kubectl annotate canary myapp -n production \  
  flagger.app/reset="true"
```

## Conclusion

Flagger provides a powerful and flexible framework for implementing progressive delivery strategies in Kubernetes. By automating canary deployments, A/B testing, and blue/green deployments, it significantly reduces the risk associated with releasing new software versions.

### Key Takeaways

* **Progressive Delivery is Essential**: Gradual rollouts with automated validation reduce blast radius and MTTR
* **Metrics-Driven Decisions**: Leverage multiple data sources (technical + business metrics) for informed rollout decisions
* **GitOps Integration**: Flagger + FluxCD enables fully automated, declarative progressive delivery
* **Flexibility**: Support for multiple service meshes, ingress controllers, and metrics providers
* **Safety First**: Automated rollbacks protect production from problematic deployments
* **Start Simple**: Begin with basic canary deployments, then adopt advanced strategies as needed

### Next Steps

* **Install Flagger**: Start with a test cluster and simple canary deployment
* **Define Metrics**: Identify key metrics that indicate application health
* **Configure Alerts**: Set up notifications for deployment events
* **Integrate with CI/CD**: Connect Flagger to your existing pipelines
* **Refine Over Time**: Adjust thresholds and strategies based on experience

### Resources

* **Official Documentation**: <https://docs.flagger.app>
* **GitHub Repository**: <https://github.com/fluxcd/flagger>
* **Examples Repository**: <https://github.com/fluxcd/flagger/tree/main/kustomize>