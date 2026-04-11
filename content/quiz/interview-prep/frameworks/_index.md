---
title: Frameworks Quiz
linkTitle: Frameworks
type: docs
weight: 1
prev: /quiz/interview-prep
---

{{< quiz id="interview-prep-frameworks-quiz" >}}
{
  "questions": [
    {
      "id": "interview-prep-frameworks-quiz-01",
      "type": "ordered-recall",
      "question": "List the 6 stages of the Request Path typical flow in order:",
      "steps": [
        {"answer": "User", "acceptedAnswers": ["User", "user", "Client", "client"]},
        {"answer": "DNS / GSLB", "acceptedAnswers": ["DNS / GSLB", "dns / gslb", "DNS/GSLB", "dns/gslb", "DNS", "dns", "GSLB", "gslb"]},
        {"answer": "CDN / LB", "acceptedAnswers": ["CDN / LB", "cdn / lb", "CDN/LB", "cdn/lb", "CDN", "cdn", "LB", "lb", "Load Balancer", "load balancer"]},
        {"answer": "API gateway / ingress", "acceptedAnswers": ["API gateway / ingress", "api gateway / ingress", "API gateway/ingress", "api gateway/ingress", "API gateway", "api gateway", "ingress", "Ingress"]},
        {"answer": "Service", "acceptedAnswers": ["Service", "service", "App server", "app server"]},
        {"answer": "Cache / DB / dependencies", "acceptedAnswers": ["Cache / DB / dependencies", "cache / db / dependencies", "Cache/DB/dependencies", "cache/db/dependencies", "Cache", "cache", "DB", "db", "Database", "database", "dependencies", "Dependencies"]}
      ],
      "caseSensitive": false,
      "explanation": "**Request Path — Typical Flow:**\n\n1. **User** — Request originates from the client.\n2. **DNS / GSLB** — DNS resolves the hostname; GSLB routes traffic to the nearest healthy region.\n3. **CDN / LB** — CDN serves cached content at the edge; load balancer distributes traffic across backend instances.\n4. **API gateway / ingress** — TLS is typically terminated here; handles auth, rate limiting, and routing to services.\n5. **Service** — Application logic processes the request.\n6. **Cache / DB / dependencies** — Service reads from cache (hit) or falls through to the database or downstream dependencies (miss).",
      "hint": "Think: request enters at the edge (DNS → CDN) → passes through the gateway → hits the service → resolves data from cache or DB."
    },
    {
      "id": "interview-prep-frameworks-quiz-02",
      "type": "flashcard",
      "question": "What deploy safety controls are covered in the Operational Model step of the SRE System Design Framework?",
      "answer": "| Control | Purpose |\n|---|---|\n| **Canary rollout** | 1% → 10% → 100% traffic shift with error rate checks at each step |\n| **Automated rollback** | Roll back automatically on error rate spike during canary |\n| **Feature flags** | Decouple deploy from release; disable at runtime without redeploy |\n| **Config validation** | Validate config schema at deploy time, not at runtime |"
    },
    {
      "id": "interview-prep-frameworks-quiz-03",
      "type": "multiple-select",
      "question": "Which of the following are common user-facing SLIs? (Select all that apply)",
      "options": [
        "Availability — % of requests returning a successful response",
        "Latency — p95 or p99 response time",
        "CPU utilisation — average CPU % across all pods",
        "Freshness — % of responses containing data within an acceptable age",
        "Error rate — % of requests resulting in an error",
        "Disk I/O — read/write throughput per node",
        "Durability — data loss rate (for stateful systems)"
      ],
      "answers": [0, 1, 3, 4, 6],
      "explanation": "**Common user-facing SLIs:**\n\n- **Availability** — % of requests returning a successful response\n- **Latency** — p95 or p99 response time\n- **Freshness** — % of responses containing data within an acceptable age\n- **Error rate** — % of requests resulting in an error\n- **Durability** — data loss rate (stateful systems only)\n\nCPU utilisation and Disk I/O are infrastructure metrics — they are useful for debugging and capacity planning but should not be primary SLIs because they don't directly reflect what users experience.",
      "hint": "SLIs should reflect what users actually feel — not what is easy to measure at the infrastructure layer."
    },
    {
      "id": "interview-prep-frameworks-quiz-04",
      "type": "flashcard",
      "question": "List the common failure modes and their mitigations covered in the SRE System Design Framework.",
      "answer": "| Failure Mode | Mitigation |\n|---|---|\n| **Regional outage** | GSLB reroutes; serves from remaining regions |\n| **Dependency latency spike** | Timeout triggers fallback; stale cache served |\n| **Cache miss storm** | DB absorbs load; autoscaling kicks in |\n| **Retry storm** | Circuit breaker opens; upstream protected |\n| **Node exhaustion** | Autoscaler adds capacity; requests queue briefly |\n| **Bad rollout** | Canary SLO alert fires; automated rollback triggered |\n| **Network partition** | Partition-tolerant path serves cached data |"
    },
    {
      "id": "interview-prep-frameworks-quiz-05",
      "type": "ordered-recall",
      "question": "List the 9 steps of the Incident Response Framework in order:",
      "steps": [
        {"answer": "Confirm", "acceptedAnswers": ["Confirm", "confirm"]},
        {"answer": "Scope", "acceptedAnswers": ["Scope", "scope"]},
        {"answer": "Correlate", "acceptedAnswers": ["Correlate", "correlate"]},
        {"answer": "Stabilize", "acceptedAnswers": ["Stabilize", "stabilize"]},
        {"answer": "Locate", "acceptedAnswers": ["Locate", "locate"]},
        {"answer": "Mitigate", "acceptedAnswers": ["Mitigate", "mitigate"]},
        {"answer": "Root Cause", "acceptedAnswers": ["Root Cause", "root cause", "Root cause"]},
        {"answer": "Recover", "acceptedAnswers": ["Recover", "recover", "Recover Fully", "recover fully"]},
        {"answer": "Prevent", "acceptedAnswers": ["Prevent", "prevent"]}
      ],
      "caseSensitive": false,
      "explanation": "**Incident Response Framework:**\n\n1. **Confirm** — Verify the issue is real, current, and user-impacting.\n2. **Scope** — Determine blast radius: who, what, where, since when.\n3. **Correlate** — Identify recent changes that could explain the issue.\n4. **Stabilize** — Pause risky changes and stop the incident from expanding.\n5. **Locate** — Narrow the fault domain using golden signals and dependency tracing.\n6. **Mitigate** — Take the fastest safe action to reduce user impact.\n7. **Root Cause** — Identify both the trigger and the missing safeguard.\n8. **Recover** — Confirm the system is truly healthy, not just quieter.\n9. **Prevent** — Add fixes, guardrails, and learnings to avoid recurrence.",
      "hint": "Think: Confirm the problem → understand its Scope → Correlate with changes → Stabilize → Locate the fault → Mitigate → find Root Cause → Recover → Prevent."
    },
    {
      "id": "interview-prep-frameworks-quiz-06",
      "type": "flashcard",
      "question": "What are the traffic and data scaling strategies covered in the Scaling Strategy step of the SRE System Design Framework.",
      "answer": "**Traffic scaling:**\n\n| Strategy | Purpose |\n|---|---|\n| **HPA / KEDA** | Scale service replicas on RPS, latency, or queue depth |\n| **Cluster autoscaler** | Add nodes as pod demand grows |\n| **CDN + cache** | Absorb read traffic before it hits the service layer |\n\n**Data scaling:**\n\n| Strategy | Purpose |\n|---|---|\n| **Read replicas** | Spread read load across multiple DB instances |\n| **Sharding / partitioning** | Horizontal data split for write-heavy workloads |\n| **Cache tiering** | Local in-process cache → regional cache → DB |"
    },
    {
      "id": "interview-prep-frameworks-quiz-07",
      "type": "ordered-recall",
      "question": "List the 4 Golden Signals in order (LETS):",
      "steps": [
        {"answer": "Latency", "acceptedAnswers": ["Latency", "latency"]},
        {"answer": "Errors", "acceptedAnswers": ["Errors", "errors", "Error rate", "error rate"]},
        {"answer": "Traffic", "acceptedAnswers": ["Traffic", "traffic"]},
        {"answer": "Saturation", "acceptedAnswers": ["Saturation", "saturation"]}
      ],
      "caseSensitive": false,
      "explanation": "**4 Golden Signals (LETS):**\n\n1. **Latency** — How long requests take (split p50 / p95 / p99)\n2. **Errors** — Rate of failed requests\n3. **Traffic** — Request volume (RPS or events/sec)\n4. **Saturation** — Resource pressure (CPU, memory, queue depth)\n\nBreak each signal down by dimensions — region, endpoint, dependency, customer segment — so that when an SLO fires, you can isolate *where* the problem is, not just *that* something is wrong.",
      "hint": "Acronym: L-E-T-S"
    },
    {
      "id": "interview-prep-frameworks-quiz-08",
      "type": "ordered-recall",
      "question": "List the 10 steps of the SRE System Design Framework in order:",
      "steps": [
        {"answer": "User Experience", "acceptedAnswers": ["User Experience", "user experience"]},
        {"answer": "SLIs / SLOs", "acceptedAnswers": ["SLIs / SLOs", "slis / slos", "SLIs/SLOs", "slis/slos", "SLIs SLOs", "slis slos", "SLO", "SLOs", "SLI", "SLIs"]},
        {"answer": "Request Path", "acceptedAnswers": ["Request Path", "request path"]},
        {"answer": "Core Components", "acceptedAnswers": ["Core Components", "core components"]},
        {"answer": "HA Design", "acceptedAnswers": ["HA Design", "ha design", "High Availability Design", "high availability design", "High Availability", "high availability"]},
        {"answer": "Failure Modes", "acceptedAnswers": ["Failure Modes", "failure modes", "Failure Mode", "failure mode"]},
        {"answer": "Cascading Failures", "acceptedAnswers": ["Cascading Failures", "cascading failures", "Cascading Failure", "cascading failure", "Cascading-Failure Controls", "cascading-failure controls"]},
        {"answer": "Scaling", "acceptedAnswers": ["Scaling", "scaling", "Scaling Strategy", "scaling strategy"]},
        {"answer": "Observability", "acceptedAnswers": ["Observability", "observability"]},
        {"answer": "Operations", "acceptedAnswers": ["Operations", "operations", "Operational Model", "operational model"]}
      ],
      "caseSensitive": false,
      "explanation": "**SRE System Design Framework:**\n\n1. **User Experience** — What matters most to users?\n2. **SLIs / SLOs** — How do we measure success?\n3. **Request Path** — How does traffic flow end to end?\n4. **Core Components** — What does each layer do and why?\n5. **HA Design** — How do we survive instance, AZ, and region failures?\n6. **Failure Modes** — What breaks, what is the blast radius, how do we contain it?\n7. **Cascading Failures** — Timeouts, retries, circuit breakers, backpressure.\n8. **Scaling** — How does the system grow safely?\n9. **Observability** — Metrics, logs, traces, alerting.\n10. **Operations** — Deploy, rollback, runbooks, game days.",
      "hint": "Think: user-first (UX → SLIs/SLOs) → map the system (Request Path → Components → HA) → failure analysis (Failure Modes → Cascading) → growth (Scaling → Observability → Operations)."
    },
    {
      "id": "interview-prep-frameworks-quiz-09",
      "type": "flashcard",
      "question": "List the failure layers to address in the HA Design step of the SRE System Design Framework.",
      "answer": "| Failure Layer | HA Controls |\n|---|---|\n| **Instance / pod failure** | Health checks, restarts, redundant replicas |\n| **Node failure** | Multi-node scheduling, PodDisruptionBudgets |\n| **AZ failure** | Multi-AZ replicas, cross-AZ load balancing |\n| **Region failure** | Multi-region active-active or active-passive failover |\n| **Dependency failure** | Degraded mode, stale serving, fallback paths |"
    },
    {
      "id": "interview-prep-frameworks-quiz-10",
      "type": "flashcard",
      "question": "List the 5 failure modes covered in the Observability & Alerting Design Framework.",
      "answer": "| Failure | Signal |\n|---|---|\n| **DB slowdown** | Latency SLI degrades; trace shows slow DB span |\n| **Cache miss spike** | Latency increases; hit ratio metric drops |\n| **Single region down** | Availability SLI drops; sliced by region dimension |\n| **Dependency timeout** | Error rate rises; trace shows timeout on external call |\n| **Traffic surge** | Saturation metric rises; queue depth or CPU climbs |"
    },
    {
      "id": "interview-prep-frameworks-quiz-11",
      "type": "ordered-recall",
      "question": "List the 8 steps of the Observability & Alerting Design Framework in order:",
      "steps": [
        {"answer": "User Experience", "acceptedAnswers": ["User Experience", "user experience"]},
        {"answer": "SLIs", "acceptedAnswers": ["SLIs", "slis", "SLI", "sli"]},
        {"answer": "SLOs", "acceptedAnswers": ["SLOs", "slos", "SLO", "slo"]},
        {"answer": "Signals", "acceptedAnswers": ["Signals", "signals"]},
        {"answer": "Instrumentation", "acceptedAnswers": ["Instrumentation", "instrumentation"]},
        {"answer": "Alerting", "acceptedAnswers": ["Alerting", "alerting", "Alerting Strategy", "alerting strategy"]},
        {"answer": "Failure Modes", "acceptedAnswers": ["Failure Modes", "failure modes", "Failure Mode", "failure mode"]},
        {"answer": "Scaling & Cost", "acceptedAnswers": ["Scaling & Cost", "scaling & cost", "Scaling and Cost", "scaling and cost", "Scaling", "scaling"]}
      ],
      "caseSensitive": false,
      "explanation": "**Observability & Alerting Design Framework:**\n\n1. **User Experience** — Anchor everything to what users actually feel.\n2. **SLIs** — Pick 2–4 measurable indicators of user experience.\n3. **SLOs** — Set reliability targets and define error budgets.\n4. **Signals** — Golden Signals + dimensions (region, endpoint, path).\n5. **Instrumentation** — Metrics (aggregate), logs (debug), traces (latency).\n6. **Alerting** — SLO-based burn-rate alerts — page only on user impact.\n7. **Failure Modes** — Identify likely failure patterns and verify detectability.\n8. **Scaling & Cost** — Control cardinality, sample traces, tier storage.",
      "hint": "Think: user experience first → define SLIs → attach SLOs → collect Signals → instrument → Alert on burn-rate → validate Failure Modes → control Scaling & Cost."
    },
    {
      "id": "interview-prep-frameworks-quiz-12",
      "type": "flashcard",
      "question": "List the key reliability controls covered in the Cascading-Failure Controls step of the SRE System Design Framework.",
      "answer": "| Control | Purpose |\n|---|---|\n| **Timeouts** | Every outbound call has a deadline; fail fast, do not hang |\n| **Retries** | Bounded retries with exponential backoff and jitter |\n| **Circuit breakers** | Open after N failures; stop hammering a degraded dependency |\n| **Rate limiting** | Protect the service and its dependencies from overload |\n| **Backpressure** | Signal upstream when the service is at capacity |\n| **Stale serving** | Return cached or degraded responses rather than errors |"
    }
  ]
}
{{< /quiz >}}
