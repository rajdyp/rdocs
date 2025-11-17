---
title: Observability
linkTitle: Observability
type: docs
weight: 15
prev: /kubernetes/14-autoscaling
next: /kubernetes/16-advanced-topics
---

## Overview

**Observability** is the ability to understand the internal state of your system based on external outputs. In Kubernetes, observability involves health probes, logging, metrics collection, and monitoring.

```
┌──────────────────────────────────────────────────────────┐
│              Observability Stack                         │
│                                                          │
│  Application (Container)                                 │
│    ↓                                                     │
│  ├─ Liveness Probes (is container alive?)                │
│  ├─ Readiness Probes (is container ready for traffic?)   │
│  ├─ Startup Probes (has container started?)              │
│    ↓                                                     │
│  ├─ Logs (stdout, stderr)                                │
│  ├─ Metrics (CPU, memory, custom)                        │
│  └─ Traces (request flow)                                │
│    ↓                                                     │
│  ├─ Log Aggregation (ELK, Splunk, etc)                   │
│  ├─ Metrics Collection (Prometheus)                      │
│  ├─ Monitoring (Alerting)                                │
│  └─ Visualization (Grafana, dashboards)                  │
└──────────────────────────────────────────────────────────┘
```

## Health Probes

### Liveness Probe

**Liveness Probe** checks if a **container** is alive and healthy. If it fails, Kubernetes kills and recreates the **container** (not the entire pod).

**Use cases:**

* Detect deadlocked application
* Detect hung process
* Restart unhealthy containers

**Behavior:**

```
Container liveness probe fails
      ↓
Container is killed (SIGKILL)
      ↓
New container started (according to restartPolicy)
      ↓
Other containers in the pod continue running
```

### Readiness Probe

**Readiness Probe** checks if a **container** is ready to accept traffic. If it fails, Kubernetes removes the **pod** from service endpoints (but doesn't restart the container).

**Key distinction:** The probe checks the **container**, but the action (removing from endpoints) affects the entire **pod**.

**Use cases:**

* App still starting up
* App temporarily unavailable
* Dependencies not ready
* Cache warming in progress

**Behavior:**

```
Container readiness probe fails
      ↓
Pod marked as NOT ready
      ↓
Pod removed from Service endpoints (no traffic)
      ↓
Container continues running (not restarted)

When probe succeeds:
      ↓
Pod marked as ready
      ↓
Pod added back to Service endpoints (receives traffic)
```

**Multi-container consideration:**

```
Pod with 2 containers:
  Container A: readiness probe passes ✅
  Container B: readiness probe fails ❌

Result: ENTIRE pod marked NOT ready
        → Pod removed from Service endpoints
        → NO traffic to ANY container in the pod
```

### Startup Probe

**Startup Probe** checks if a **container** has successfully started. It gives slow-starting **containers** extra time to become healthy. Once passed, liveness/readiness probes take over.

**Use cases:**

* Slow application startup
* Database migrations needed
* Large initial data loads

**Behavior:**

```
Container starts
      ↓
Startup probe runs (other probes disabled)
      ↓
Startup probe succeeds
      ↓
Liveness and readiness probes enabled

If startup probe fails (exceeds failureThreshold):
      ↓
Container is killed (same as liveness failure)
```

### Probe Types

```
Three ways to check health:

1. HTTP GET
   └─ HTTP request to /healthz endpoint

2. TCP Socket
   └─ Open TCP connection to port

3. Exec
   └─ Run command inside container
```

### Liveness Probe Examples

```yaml
# HTTP Liveness Probe
apiVersion: v1
kind: Pod
metadata:
  name: app-with-http-probe
spec:
  containers:
  - name: app
    image: myapp:1.0
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 30    # Wait 30s before first check
      periodSeconds: 10          # Check every 10s
      timeoutSeconds: 5          # Timeout after 5s
      failureThreshold: 3        # Fail after 3 failures
      successThreshold: 1        # Pass after 1 success

---
# TCP Liveness Probe
apiVersion: v1
kind: Pod
metadata:
  name: db-with-tcp-probe
spec:
  containers:
  - name: postgres
    image: postgres:14
    livenessProbe:
      tcpSocket:
        port: 5432
      initialDelaySeconds: 10
      periodSeconds: 10

---
# Exec Liveness Probe
apiVersion: v1
kind: Pod
metadata:
  name: app-with-exec-probe
spec:
  containers:
  - name: app
    image: myapp:1.0
    livenessProbe:
      exec:
        command:
        - /bin/sh
        - -c
        - "ps aux | grep myapp"
      initialDelaySeconds: 5
      periodSeconds: 10
```

### Readiness Probe Examples

```yaml
# HTTP Readiness Probe
apiVersion: v1
kind: Pod
metadata:
  name: api-with-ready-probe
spec:
  containers:
  - name: api
    image: api:1.0
    readinessProbe:
      httpGet:
        path: /ready
        port: 8080
      initialDelaySeconds: 5     # Check earlier than liveness
      periodSeconds: 5
      timeoutSeconds: 3
      failureThreshold: 2
      successThreshold: 1

---
# Readiness with gRPC
apiVersion: v1
kind: Pod
metadata:
  name: grpc-app
spec:
  containers:
  - name: app
    image: grpc-app:1.0
    readinessProbe:
      grpc:
        port: 50051
        service: "" # Optional service name
      initialDelaySeconds: 10
      periodSeconds: 5
```

### Startup Probe Examples

```yaml
# Startup Probe for slow-starting app
apiVersion: v1
kind: Pod
metadata:
  name: slow-app
spec:
  containers:
  - name: app
    image: slow-app:1.0
    startupProbe:
      httpGet:
        path: /startup
        port: 8080
      failureThreshold: 30       # Allow 30 * 10 = 300 seconds
      periodSeconds: 10          # Check every 10 seconds

    # Liveness only checks after startup passes
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
      periodSeconds: 10

    # Readiness only checks after startup passes
    readinessProbe:
      httpGet:
        path: /ready
        port: 8080
      periodSeconds: 5
```

### Probe Timing Diagram

```
Container starts
      ↓
Startup Probe
├─ Runs every 10s
├─ Fails for 3 minutes
├─ Liveness & readiness DISABLED during startup
└─ Finally succeeds
       ↓ (once startup succeeds)
Liveness Probe and Readiness Probe
├─ Both run in parallel
├─ Liveness: If fails → Restart container
├─ Readiness: If fails → Remove pod from service
└─ Continue periodically

Timeline:
0s:    Container starts
0s:    Startup probe begins (liveness/readiness disabled)
30s:   Startup probe succeeds
30s:   Liveness & readiness probes begin
40s:   Readiness fails → Pod removed from endpoints
45s:   Readiness succeeds → Pod added to endpoints
55s:   Liveness fails → Container restarted
55s:   Container restarts → startup probe begins again
```

### Complete Pod with All Probes

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: healthy-pod
spec:
  containers:
  - name: app
    image: myapp:1.0
    ports:
    - name: http
      containerPort: 8080

    # Give app time to start
    startupProbe:
      httpGet:
        path: /startup
        port: http
      failureThreshold: 30
      periodSeconds: 10

    # Keep app running
    livenessProbe:
      httpGet:
        path: /healthz
        port: http
      initialDelaySeconds: 30
      periodSeconds: 10
      timeoutSeconds: 5
      failureThreshold: 3

    # Accept traffic only when ready
    readinessProbe:
      httpGet:
        path: /ready
        port: http
      initialDelaySeconds: 10
      periodSeconds: 5
      timeoutSeconds: 3
      failureThreshold: 2
```

## Logging

### Container Logs

```bash
# View pod logs
kubectl logs pod-name

# View logs from specific container
kubectl logs pod-name -c container-name

# Follow logs (tail -f)
kubectl logs pod-name -f

# View logs from all pods in deployment
kubectl logs -l app=myapp

# View last 100 lines
kubectl logs pod-name --tail=100

# View logs from 10 minutes ago
kubectl logs pod-name --since=10m

# View logs from previous container (if pod restarted)
kubectl logs pod-name --previous
```

### Logging Best Practices

```
✓ Log to stdout/stderr (12-factor app)
  └─ Kubernetes captures automatically

✓ Use structured logging
  └─ JSON format for easy parsing
  └─ Consistent key names

✓ Log appropriate levels
  ├─ DEBUG: Development info
  ├─ INFO: General information
  ├─ WARN: Warning conditions
  ├─ ERROR: Error conditions
  └─ FATAL: Fatal errors

✓ Include context
  ├─ Trace IDs
  ├─ User IDs
  ├─ Request IDs

✗ Don't log secrets
  └─ Never log passwords, tokens, API keys

✗ Don't log too much
  └─ Excessive logs = harder to find signal
```

### Application Logging Example

```python
# Python application with structured logging
import logging
import json
import sys

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_obj = {
            "timestamp": record.created,
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
        }
        return json.dumps(log_obj)

handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(JSONFormatter())
logger = logging.getLogger()
logger.addHandler(handler)
logger.setLevel(logging.INFO)

# Usage
logger.info("User logged in", extra={"user_id": "123", "trace_id": "abc"})
logger.error("Database connection failed")
```

### Log Aggregation

```
Log collection architecture:

┌─────────────┐
│ Pod         │
│ stdout/stderr
└──────┬──────┘
       │
       ▼
┌──────────────┐
│ kubelet      │
│ (collects)   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────┐
│ Log aggregation agent        │
│ (Fluentd, Logstash, etc)     │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Centralized log storage      │
│ (Elasticsearch, Splunk,      │
│  CloudWatch, etc)            │
└──────────────────────────────┘
```

## Metrics

### Metrics Types

```
Kubernetes metrics:
  ├─ Container: CPU, memory, I/O
  ├─ Pod: Aggregate of containers
  ├─ Node: Aggregate of pods
  └─ Custom: Application-specific

Application metrics:
  ├─ HTTP requests per second
  ├─ Database queries
  ├─ Cache hit rate
  ├─ Queue length
  └─ Business metrics
```

### Prometheus Metrics

**Prometheus** is a popular metrics collection system.

```yaml
# ServiceMonitor for Prometheus
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: app-metrics
spec:
  selector:
    matchLabels:
      app: myapp
  endpoints:
  - port: metrics
    interval: 30s
    path: /metrics

---
# Pod exposing Prometheus metrics
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
  - name: app
    image: myapp:1.0
    ports:
    - name: http
      containerPort: 8080
    - name: metrics
      containerPort: 8081

    # App exposes metrics at /metrics
    # Prometheus scrapes and stores them
```

### Prometheus Query Examples

```
# Instant queries
up{job="prometheus"}  # Is job up? (1=yes, 0=no)

# Range queries
rate(http_requests_total[5m])  # Requests per second over 5 min

# Common operations
sum(container_memory_usage_bytes) by (pod)
avg(container_cpu_usage_seconds_total)
histogram_quantile(0.95, http_request_duration_seconds)
```

## Monitoring and Alerting

### Monitoring Stack

```
Metrics Collection
  (Prometheus)
       ↓
Time-series Database
  (Prometheus TSDB)
       ↓
Visualization
  (Grafana dashboards)
       ↓
Alerting Rules
  (Alert conditions)
       ↓
Alert Notification
  (Slack, PagerDuty, email)
```

### PrometheusRule for Alerting

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: app-alerts
spec:
  groups:
  - name: application
    interval: 30s
    rules:
    # High error rate alert
    - alert: HighErrorRate
      expr: |
        rate(http_requests_total{status=~"5.."}[5m]) > 0.05
      for: 5m
      annotations:
        summary: "High error rate detected"
        description: "Error rate is {{ $value }}"

    # Pod restart alert
    - alert: PodRestarts
      expr: |
        rate(container_last_seen{pod!=""}[15m]) > 0
      for: 5m
      annotations:
        summary: "Pod {{ $labels.pod }} restarting"

    # Memory usage alert
    - alert: HighMemoryUsage
      expr: |
        container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.9
      for: 5m
      annotations:
        summary: "Pod {{ $labels.pod }} memory > 90%"
```

## Metrics Server

**Metrics Server** is a Kubernetes add-on that provides resource metrics for HPA and kubectl top commands.

```bash
# Check if Metrics Server is installed
kubectl get deployment metrics-server -n kube-system

# View node metrics
kubectl top nodes

# View pod metrics
kubectl top pods

# View pod metrics with resource requests
kubectl top pods --containers
```

## Practical Observability Example

```yaml
---
# Deployment with complete observability
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-server
  template:
    metadata:
      labels:
        app: api-server
    spec:
      containers:
      - name: api
        image: api:1.0
        ports:
        - name: http
          containerPort: 8080
        - name: metrics
          containerPort: 8081

        # Health checks
        startupProbe:
          httpGet:
            path: /startup
            port: http
          failureThreshold: 30
          periodSeconds: 10

        livenessProbe:
          httpGet:
            path: /healthz
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10

        readinessProbe:
          httpGet:
            path: /ready
            port: http
          initialDelaySeconds: 5
          periodSeconds: 5

        # Logging
        env:
        - name: LOG_LEVEL
          value: "INFO"
        - name: POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: POD_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace

        # Resource requests for autoscaling
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi

        # Metrics exposure for Prometheus
        volumeMounts:
        - name: metrics-config
          mountPath: /etc/metrics

      volumes:
      - name: metrics-config
        configMap:
          name: metrics-config

---
# Service for API
apiVersion: v1
kind: Service
metadata:
  name: api-server
spec:
  selector:
    app: api-server
  ports:
  - name: http
    port: 80
    targetPort: http
  - name: metrics
    port: 8081
    targetPort: metrics

---
# ServiceMonitor for Prometheus
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: api-server
spec:
  selector:
    matchLabels:
      app: api-server
  endpoints:
  - port: metrics
    interval: 30s

---
# PrometheusRule for alerts
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: api-server-alerts
spec:
  groups:
  - name: api
    rules:
    - alert: APIServerDown
      expr: up{job="api-server"} == 0
      for: 2m
      annotations:
        summary: "API server is down"

    - alert: HighLatency
      expr: |
        histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
      for: 5m
      annotations:
        summary: "API server latency is high"
```

## Observability Checklist

```
Health Probes
  ✓ Liveness probe (detect deadlock)
  ✓ Readiness probe (accept traffic)
  ✓ Startup probe (for slow apps)
  ✓ Appropriate timeouts/thresholds

Logging
  ✓ Structured logging (JSON)
  ✓ Proper log levels
  ✓ Include context (trace IDs)
  ✓ No sensitive data in logs
  ✓ Centralized log aggregation

Metrics
  ✓ Expose application metrics
  ✓ Resource metrics for autoscaling
  ✓ Custom business metrics
  ✓ Prometheus or compatible system

Monitoring
  ✓ Visualize key metrics (Grafana)
  ✓ Alert on critical conditions
  ✓ Appropriate alert thresholds
  ✓ Notification channels configured

Documentation
  ✓ Document health check endpoints
  ✓ Document metrics meaning
  ✓ Document alert runbooks
  ✓ Troubleshooting guide
```

## Summary

Observability in Kubernetes involves:

* **Health Probes** - Keep pods healthy (liveness, readiness, startup)
* **Logging** - Understand what's happening (structured logs, aggregation)
* **Metrics** - Track performance (Prometheus, custom metrics)
* **Monitoring** - Detect and alert on problems (Grafana, alerting)
* **Tracing** - Understand request flow (distributed tracing)

---

**Key Takeaways:**

* Implement all three health probes for robust systems
* Use structured logging for better debugging
* Expose metrics for monitoring and autoscaling
* Set up alerts for critical conditions
* Combine probes, logs, and metrics for complete visibility

