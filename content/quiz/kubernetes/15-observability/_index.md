---
title: Observability Quiz
linkTitle: Observability
type: docs
weight: 15
prev: /quiz/kubernetes/14-autoscaling
next: /quiz/kubernetes/16-advanced-topics
---

{{< quiz id="kubernetes-observability-quiz" >}}
{
  "questions": [
    {
      "type": "mcq",
      "question": "What happens when a **liveness probe** fails in Kubernetes?",
      "options": [
        "The pod is removed from service endpoints",
        "The container is killed and recreated",
        "The entire pod is deleted and rescheduled",
        "Nothing, it just logs a warning"
      ],
      "answer": 1,
      "explanation": "When a liveness probe fails, Kubernetes kills and recreates the **container** (not the entire pod). Other containers in the pod continue running.",
      "hint": "Think about what 'liveness' means - is the container alive?"
    },
    {
      "type": "mcq",
      "question": "What happens when a **readiness probe** fails?",
      "options": [
        "The container is restarted",
        "The pod is deleted",
        "The pod is removed from service endpoints but keeps running",
        "The node is marked as unhealthy"
      ],
      "answer": 2,
      "explanation": "When a readiness probe fails, the pod is removed from service endpoints (no traffic) but the container continues running and is NOT restarted.",
      "hint": "Readiness determines if the pod should receive traffic."
    },
    {
      "type": "true-false",
      "question": "If one container's readiness probe fails in a multi-container pod, only that specific container stops receiving traffic while others continue normally.",
      "answer": false,
      "explanation": "When ANY container's readiness probe fails in a pod, the ENTIRE pod is marked as NOT ready and removed from service endpoints. No traffic goes to ANY container in the pod.",
      "hint": "Think about how Services route traffic to pods, not individual containers."
    },
    {
      "type": "multiple-select",
      "question": "Which are valid probe types in Kubernetes?",
      "options": [
        "HTTP GET",
        "TCP Socket",
        "Exec (run command)",
        "UDP Socket",
        "gRPC"
      ],
      "answers": [0, 1, 2, 4],
      "explanation": "Kubernetes supports HTTP GET, TCP Socket, Exec (command), and gRPC probes. UDP Socket is not a supported probe type.",
      "hint": "There are four supported probe methods."
    },
    {
      "type": "code-output",
      "question": "A pod has this startup probe configuration. How long does the container have to successfully start before being killed?",
      "code": "startupProbe:\n  httpGet:\n    path: /startup\n    port: 8080\n  failureThreshold: 30\n  periodSeconds: 10",
      "language": "yaml",
      "options": [
        "30 seconds",
        "10 seconds",
        "300 seconds (5 minutes)",
        "40 seconds"
      ],
      "answer": 2,
      "explanation": "Total time = failureThreshold × periodSeconds = 30 × 10 = 300 seconds (5 minutes). The probe runs every 10 seconds and allows up to 30 failures.",
      "hint": "Multiply the two values to get total allowed time."
    },
    {
      "type": "drag-drop",
      "question": "Arrange the probe execution order when a container starts:",
      "instruction": "Drag to arrange in the correct order",
      "items": [
        "Startup probe runs",
        "Container starts",
        "Liveness and readiness probes begin",
        "Startup probe succeeds"
      ],
      "correctOrder": [1, 0, 3, 2],
      "explanation": "Container starts → Startup probe runs (liveness/readiness disabled) → Startup probe succeeds → Liveness and readiness probes begin."
    },
    {
      "type": "fill-blank",
      "question": "What kubectl command is used to view the last 100 lines of logs from a pod named 'api-server'?",
      "answer": "kubectl logs api-server --tail=100",
      "caseSensitive": false,
      "explanation": "The `kubectl logs` command with `--tail=N` flag limits output to the last N lines.",
      "hint": "Use the --tail flag with kubectl logs."
    },
    {
      "type": "mcq",
      "question": "What is the purpose of a **startup probe**?",
      "options": [
        "To check if the container is accepting traffic",
        "To detect if the application is deadlocked",
        "To give slow-starting containers extra time to become healthy",
        "To collect metrics during container startup"
      ],
      "answer": 2,
      "explanation": "Startup probes give slow-starting containers extra time to initialize. While the startup probe runs, liveness and readiness probes are disabled. Once it passes, the other probes take over.",
      "hint": "Think about applications that need time for database migrations or large data loads."
    },
    {
      "type": "true-false",
      "question": "According to logging best practices, applications should write logs to files inside the container for Kubernetes to collect them.",
      "answer": false,
      "explanation": "Best practice (12-factor app) is to log to stdout/stderr, which Kubernetes captures automatically. Writing to files requires additional configuration for log collection.",
      "hint": "Think about the 12-factor app principles."
    },
    {
      "type": "code-completion",
      "question": "Complete the kubectl command to follow logs in real-time:",
      "instruction": "Fill in the missing flag",
      "codeTemplate": "kubectl logs pod-name _____",
      "answer": "-f",
      "caseSensitive": true,
      "acceptedAnswers": ["-f", "--follow"],
      "explanation": "The `-f` or `--follow` flag streams logs in real-time, similar to `tail -f`."
    },
    {
      "type": "multiple-select",
      "question": "Which are appropriate use cases for a liveness probe?",
      "options": [
        "Detect deadlocked application",
        "Detect hung process",
        "Wait for database connection",
        "Restart unhealthy containers",
        "Warm up cache before receiving traffic"
      ],
      "answers": [0, 1, 3],
      "explanation": "Liveness probes detect deadlocks, hung processes, and trigger container restarts. Waiting for dependencies and cache warming are readiness probe use cases.",
      "hint": "Liveness is about 'is the container alive and working?' not 'is it ready for traffic?'"
    },
    {
      "type": "flashcard",
      "question": "What is the difference between liveness and readiness probes?",
      "answer": "**Liveness Probe**: Checks if container is alive. Failure = container killed and restarted.\n\n**Readiness Probe**: Checks if container is ready for traffic. Failure = pod removed from service endpoints but container keeps running."
    },
    {
      "type": "mcq",
      "question": "Which probe parameter specifies how long to wait after container startup before the first probe check?",
      "options": [
        "periodSeconds",
        "timeoutSeconds",
        "initialDelaySeconds",
        "failureThreshold"
      ],
      "answer": 2,
      "explanation": "`initialDelaySeconds` specifies the delay before the first probe check runs after the container starts.",
      "hint": "The parameter name describes what it does - an initial delay."
    },
    {
      "type": "code-output",
      "question": "What does this Prometheus query return?",
      "code": "rate(http_requests_total[5m])",
      "language": "promql",
      "options": [
        "Total HTTP requests ever",
        "HTTP requests in the last 5 minutes",
        "HTTP requests per second averaged over 5 minutes",
        "Maximum requests in any 5-minute window"
      ],
      "answer": 2,
      "explanation": "The `rate()` function calculates the per-second average rate of increase over the specified time window (5 minutes).",
      "hint": "The rate() function calculates per-second averages."
    },
    {
      "type": "true-false",
      "question": "When a startup probe is configured, liveness and readiness probes run in parallel with it from container start.",
      "answer": false,
      "explanation": "When a startup probe is configured, liveness and readiness probes are DISABLED until the startup probe succeeds. Only then do the other probes begin.",
      "hint": "The startup probe gives the container time to start before other health checks begin."
    },
    {
      "type": "fill-blank",
      "question": "What Kubernetes add-on provides resource metrics for HPA and `kubectl top` commands?",
      "answer": "Metrics Server",
      "caseSensitive": false,
      "explanation": "Metrics Server is a Kubernetes add-on that collects resource metrics (CPU, memory) and exposes them for HPA and kubectl top.",
      "hint": "It's a server that provides metrics."
    },
    {
      "type": "multiple-select",
      "question": "Which information should be included in structured logs according to best practices?",
      "options": [
        "Trace IDs",
        "Passwords and API keys",
        "User IDs",
        "Request IDs",
        "Log levels"
      ],
      "answers": [0, 2, 3, 4],
      "explanation": "Structured logs should include trace IDs, user IDs, request IDs, and log levels for context. NEVER log sensitive data like passwords or API keys.",
      "hint": "Think about what helps with debugging and what poses security risks."
    },
    {
      "type": "flashcard",
      "question": "What are the four pillars of observability in Kubernetes?",
      "answer": "**1. Health Probes** - Liveness, readiness, startup probes\n\n**2. Logging** - Structured logs, centralized aggregation\n\n**3. Metrics** - Prometheus, resource and custom metrics\n\n**4. Tracing** - Distributed request flow tracking"
    },
    {
      "type": "drag-drop",
      "question": "Arrange the monitoring stack components in the correct data flow order:",
      "instruction": "Drag to arrange from source to destination",
      "items": [
        "Alert Notification (Slack, PagerDuty)",
        "Metrics Collection (Prometheus)",
        "Visualization (Grafana)",
        "Alerting Rules"
      ],
      "correctOrder": [1, 2, 3, 0],
      "explanation": "Flow: Metrics Collection → Visualization → Alerting Rules → Alert Notification"
    },
    {
      "type": "mcq",
      "question": "In a pod with multiple containers, if Container A's readiness probe passes but Container B's fails, what is the result?",
      "options": [
        "Only Container B stops receiving traffic",
        "Only Container A receives traffic",
        "The entire pod is removed from service endpoints",
        "Container B is restarted"
      ],
      "answer": 2,
      "explanation": "If ANY container's readiness probe fails, the ENTIRE pod is marked NOT ready and removed from service endpoints. No traffic goes to any container.",
      "hint": "Services route to pods, not individual containers."
    },
    {
      "type": "code-completion",
      "question": "Complete the kubectl command to view logs from a previous crashed container:",
      "instruction": "Fill in the missing flag",
      "codeTemplate": "kubectl logs pod-name _____",
      "answer": "--previous",
      "caseSensitive": true,
      "acceptedAnswers": ["--previous", "-p"],
      "explanation": "The `--previous` or `-p` flag shows logs from the previous container instance, useful when a pod has restarted."
    },
    {
      "type": "true-false",
      "question": "The `successThreshold` parameter in probes determines how many consecutive successes are needed before the probe is considered successful.",
      "answer": true,
      "explanation": "successThreshold specifies the minimum consecutive successes for the probe to be considered successful after having failed. Default is 1.",
      "hint": "The parameter name describes exactly what it does."
    },
    {
      "type": "mcq",
      "question": "What command checks if Metrics Server is installed in your cluster?",
      "options": [
        "`kubectl get pods -n kube-system | grep metrics`",
        "`kubectl get deployment metrics-server -n kube-system`",
        "`kubectl describe node | grep metrics`",
        "`kubectl top metrics-server`"
      ],
      "answer": 1,
      "explanation": "The command `kubectl get deployment metrics-server -n kube-system` directly checks for the Metrics Server deployment.",
      "hint": "Metrics Server runs as a deployment in the kube-system namespace."
    },
    {
      "type": "flashcard",
      "question": "What is the recommended logging format for Kubernetes applications and why?",
      "answer": "**Structured JSON logging** is recommended because:\n\n- Easy to parse programmatically\n- Consistent key names enable filtering\n- Integrates well with log aggregation systems (ELK, Splunk)\n- Supports adding context (trace IDs, user IDs)\n- Machine-readable for alerting and analysis"
    }
  ]
}
{{< /quiz >}}
