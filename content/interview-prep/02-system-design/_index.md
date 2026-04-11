---
title: System Design
weight: 2
---

## RESHADED Framework

A step-by-step structure for system design interviews. Covers all the bases an interviewer expects you to address.

```
R — Requirements        Functional + non-functional. Ask before designing.
E — Estimation          Scale: QPS, storage, bandwidth. Justify your numbers.
S — Storage             Data model, DB choice (SQL vs NoSQL), schemas.
H — High-Level Design   Draw the main components and how they connect.
A — APIs                Define key endpoints or interfaces.
D — Deep Dive           Pick 2-3 critical components and go deep.
E — Evaluation          Discuss trade-offs, failure modes, and improvements.
D — Done?               Confirm you've addressed all requirements.
```

**When to use:** Any open-ended system design question ("Design Twitter", "Design a rate limiter").

**Interview tip:** Do not skip Requirements. Spending the first 5 minutes asking clarifying questions signals seniority and prevents designing the wrong system.

## CAP Theorem — Quick Reference

When designing distributed systems, you can only guarantee two of three properties during a network partition.

```
C — Consistency    Every read returns the most recent write (or an error).
A — Availability   Every request gets a response (may not be the latest data).
P — Partition Tol. System continues operating despite dropped network messages.

CP systems: Prioritise correctness. (e.g., ZooKeeper, HBase)
AP systems: Prioritise uptime.      (e.g., Cassandra, DynamoDB in default mode)
```

**When to use:** Justifying a database choice, discussing trade-offs in distributed design, replication strategies.

**Interview tip:** Frame it as a trade-off: "Given that network partitions are unavoidable, I'm choosing between consistency and availability. For this use case I'd prefer AP because..."

## Scaling Ladder

When asked "how would you scale this?", walk up the ladder one rung at a time rather than jumping straight to microservices.

```
1. Vertical scaling         Bigger machine. Easiest, hits a ceiling fast.
2. Caching                  Redis/Memcached. Eliminate redundant computation.
3. DB read replicas         Separate read and write load.
4. Load balancing           Distribute traffic across multiple app servers.
5. DB sharding / partitioning  Horizontal split of data.
6. Async processing         Message queues (Kafka, SQS) for bursty workloads.
7. Microservices            Split by domain for independent scaling.
8. CDN / edge caching       Push static or cacheable content closer to users.
```

**When to use:** "The system works — now how would you handle 10× the traffic?"

## Back-of-the-Envelope Estimation Cheat Sheet

Useful numbers to memorise for estimation questions.

```
Latency
  L1 cache reference       ~1 ns
  Main memory reference    ~100 ns
  SSD random read          ~100 µs
  HDD seek                 ~10 ms
  Network roundtrip (same DC)  ~500 µs
  Network roundtrip (cross-region)  ~150 ms

Throughput
  Single server HTTP       ~10K–50K RPS (varies widely)
  Kafka topic              ~100K–1M msgs/s

Storage
  1 char = 1 byte
  1 UUID = 16 bytes
  1 tweet (280 chars) ≈ 300 bytes
  1 hour HD video ≈ 1 GB (compressed)

Time
  1 day  = 86,400 s  ≈ 100K s
  1 month = ~2.6M s  ≈ 3M s
  1 year  = ~31.5M s ≈ 30M s
```

**When to use:** Sizing storage, estimating QPS from DAU, justifying the need for caching or sharding.

## Data Store Decision Tree

```
Need ACID transactions?
  Yes → Relational DB (PostgreSQL, MySQL)
  No  ↓

Need flexible / evolving schema?
  Yes → Document store (MongoDB, DynamoDB)
  No  ↓

Need ultra-low latency key-value access?
  Yes → In-memory store (Redis, Memcached)
  No  ↓

Need time-series / append-only data?
  Yes → Time-series DB (InfluxDB, Prometheus, TimescaleDB)
  No  ↓

Need full-text search?
  Yes → Search engine (Elasticsearch, OpenSearch)
  No  ↓

Need graph relationships?
  Yes → Graph DB (Neo4j, Amazon Neptune)
  No  → Probably still a relational DB
```

**When to use:** Justifying any storage technology choice in system design.

## API Design Decision Guide

```
Start: What are your primary constraints?
        ↓
Need simple, broad client compatibility (browsers, third-party)?
  Yes → REST
        - Use when: public APIs, CRUD resources, diverse clients
        - Trade-offs: verbose payloads, multiple round-trips for complex data

Need high-performance internal service communication?
  Yes → gRPC
        - Use when: microservice-to-microservice, low latency critical, streaming
        - Trade-offs: harder to debug (binary protocol), poor browser support

Need flexible queries, multiple clients with different data needs?
  Yes → GraphQL
        - Use when: mobile + web with different payload needs, rapid UI iteration
        - Trade-offs: complex caching, N+1 query risk, schema overhead

Need real-time push from server to client?
  Yes → WebSocket (or SSE for one-way)
        - Use when: live feeds, notifications, collaborative editing
        - Trade-offs: stateful connections, harder to scale horizontally
```

**Quick reference:**

```
Use case                          → Best choice
─────────────────────────────────────────────────
Public API (external developers)  → REST
Mobile + web with different needs → GraphQL
Internal microservices            → gRPC
Real-time notifications           → WebSocket / SSE
Simple event streaming            → SSE (Server-Sent Events)
```

**When to use:** The "A — APIs" step of RESHADED, any "how would you design the API layer?" question.

**Interview tip:** Lead with REST as your default, then justify deviating. "I'd start with REST for broad compatibility. If internal latency becomes a bottleneck between services, I'd switch those calls to gRPC."

## Observability & Alerting Design Framework

A structured approach for answering "how would you monitor and alert on this system?" — common in system design interviews and oncall readiness discussions.

**Quick reference:**
```
1. User Experience   Anchor everything to what users actually feel.
2. SLIs              Pick 2–4 measurable indicators of user experience.
3. SLOs              Set reliability targets and define error budgets.
4. Signals           Golden Signals + dimensions (region, endpoint, path).
5. Instrumentation   Metrics (aggregate), logs (debug), traces (latency).
6. Alerting          SLO-based burn-rate alerts — page only on user impact.
7. Failure Modes     Identify likely failure patterns and verify detectability.
8. Scaling & Cost    Control cardinality, sample traces, tier storage.
```

**When to use:** Any "design the observability strategy" question, the "D — Deep Dive" or "E — Evaluation" steps of RESHADED, or oncall system design discussions.

**Interview tip:** Lead with user experience, not infrastructure metrics. "I'd start by defining what good looks like for the user, pick a small set of SLIs, attach SLOs, and build alerting around burn-rate violations — not raw thresholds."

---

### Step 1 — User Experience

**Goal:** Anchor everything to what users actually feel, not what is easy to measure.

- Define what "good" looks like for this system
- Identify the critical user journeys (e.g., checkout, search, feed load)

**Key questions:**
- What does success look like to the user?
- What matters most: latency, availability, or data freshness?
- Are there different user tiers with different expectations (cached vs real-time)?

---

### Step 2 — SLIs (Service Level Indicators)

**Goal:** Choose measurable indicators for user experience.

- Pick 2–4 SLIs maximum — keep it tight and user-facing
- Avoid infra metrics (CPU, disk) as primary SLIs

**Key questions:**
- What metric reflects user happiness?
- How do we distinguish success from failure?
- Do we need per-region or per-endpoint SLIs?

**Common SLIs:**
```
Availability  → % of requests returning a successful response
Latency       → p95 or p99 response time
Freshness     → % of responses containing data within an acceptable age
Error rate    → % of requests resulting in an error
Durability    → data loss rate (for stateful systems)
```

---

### Step 3 — SLOs (Service Level Objectives)

**Goal:** Set reliability targets and define acceptable failure budgets.

- Assign a numeric target to each SLI
- Define the error budget: how much failure is tolerable in the window

**Key questions:**
- What is acceptable failure for this system?
- What is the business tolerance for downtime or degradation?
- Do critical endpoints need tighter SLOs than others?

**Examples:**
```
99.9% availability (allows ~44 min downtime/month)
99% of requests < 300ms at p95
95% of responses contain data < 60 seconds old
```

---

### Step 4 — Signals (Golden Signals + Dimensions)

**Goal:** SLIs and SLOs are high-level constructs — they tell you *that* something is breaking, not *why*. Collect detailed signals broken down by dimensions so you can isolate problems quickly when an SLO is violated.

**Golden Signals:**
```
Latency     — How long requests take (split p50 / p95 / p99)
Errors      — Rate of failed requests
Traffic     — Request volume (RPS or events/sec)
Saturation  — Resource pressure (CPU, memory, queue depth)
```

**Break signals down by dimensions — this is the critical step:**
```
Region / AZ         — Is degradation localized?
Endpoint / path     — Is one API route affected?
Dependency          — Is it the DB, cache, or downstream service?
Customer segment    — Is one tenant affected?
Cache vs DB path    — Did a miss spike cause the issue?
```

> Metrics without dimensions are nearly useless at scale. When an SLO fires, a single error rate number tells you nothing about where to look — but error rate by endpoint × dependency narrows it immediately.

---

### Step 5 — Instrumentation

**Goal:** Instrumentation makes signals actionable — metrics tell you that something is wrong, traces show where it's happening in the request path, and logs provide the detailed context for why.

```
Metrics  → Aggregation and alerting. Track SLIs, golden signals, saturation.
Logs     → Debugging. Capture error context, request details, stack traces.
Traces   → Latency breakdown. Show which service or span is the bottleneck.
```

**Key questions:**
- Where is latency introduced along the request path?
- Can I correlate a metric anomaly to a specific trace or log line?
- Do I have request-level visibility across service boundaries?

---

### Step 6 — Alerting Strategy

**Goal:** Page only when real users are impacted — avoid alert fatigue.

**Use SLO-based burn-rate alerting:**
- Alert when the error budget is being consumed faster than it can recover
- Fast burn (1-hour window): urgent — something is actively degrading the SLO
- Slow burn (6-hour window): warning — gradual erosion that needs attention soon

**Separate alert tiers:**
```
Page (on-call wake)    → SLO burn rate exceeded, confirmed user impact
Ticket (non-urgent)    → Elevated error rate below burn threshold, capacity warning
Log only               → Transient anomalies, auto-remediated events
```

**Key questions:**
- Does this alert reflect actual user pain?
- Can this be auto-remediated before it requires human intervention?
- Will this alert fire during normal traffic spikes?

> Alert on SLO violations, not on symptoms. A slow DB query is a symptom — a burn rate alert on latency SLO is user impact.

---

### Step 7 — Failure Modes

**Goal:** Verify your observability can detect the most likely real-world failures.

**Common failure patterns to cover:**
```
DB slowdown         → Latency SLI degrades; trace shows slow DB span
Cache miss spike    → Latency increases; hit ratio metric drops
Single region down  → Availability SLI drops; sliced by region dimension
Dependency timeout  → Error rate rises; trace shows timeout on external call
Traffic surge       → Saturation metric rises; queue depth or CPU climbs
```

**Key questions:**
- What happens to my SLIs if the DB slows down?
- Can I tell the difference between a cache miss spike and a downstream timeout?
- Does a regional failure show up as a global alert, or a localized one?

---

### Step 8 — Scaling & Cost Controls

**Goal:** Keep telemetry cost and cardinality manageable as the system grows.

**Key levers:**
```
Metric cardinality   — Avoid high-cardinality label combinations (e.g., user_id as a label)
Trace sampling       — Head-based sampling for high volume; tail-based for errors
Log tiering          — DEBUG logs to cheap storage; ERROR logs to hot storage
Retention policy     — Short window for raw data; long window for aggregated rollups
```

**Key questions:**
- Will adding this label to a metric cause a cardinality explosion?
- Can I sample 1% of healthy traces and keep 100% of error traces?
- What is the per-GB cost at 10× current traffic?

---

### Condensed Interview Answer

When asked "how would you design observability for this system?":

> I'd start by defining the user experience and picking a small set of SLIs like availability and latency, then attach SLOs to establish an error budget.
>
> Since SLIs only tell us that something is broken, I'd design detailed signals — latency, errors, traffic, and saturation — broken down by dimensions like region, endpoint, and dependency to isolate issues quickly.
>
> Instrumentation would use metrics for detection, traces to localize issues in the request path, and logs to provide debugging context, all with consistent tagging for correlation.
>
> Alerting would be SLO-based using burn-rate alerts, so we only page on sustained user impact, while lower-severity issues go to tickets.
>
> Finally, I'd validate against common failure modes and control cardinality and sampling to ensure the system scales cost-effectively.

## SRE System Design Framework

A reliability-first structure for designing highly available backends. Use this when the question is about building something that must stay up — not just something that works. Complements RESHADED by going deeper on failure modes, cascading-failure controls, and operational safety.

**Quick reference:**
```
1. User Experience     What matters most to users?
2. SLIs / SLOs         How do we measure success?
3. Request Path        How does traffic flow end to end?
4. Core Components     What does each layer do and why?
5. HA Design           How do we survive instance, AZ, and region failures?
6. Failure Modes       What breaks, what is the blast radius, how do we contain it?
7. Cascading Failures  Timeouts, retries, circuit breakers, backpressure.
8. Scaling             How does the system grow safely?
9. Observability       Metrics, logs, traces, alerting.
10. Operations         Deploy, rollback, runbooks, game days.
```

**When to use:** "Design a highly available X" questions, any question where reliability is the core constraint, the "D — Deep Dive" or "E — Evaluation" steps of RESHADED for HA systems.

**Interview tip:** Lead with user experience and SLOs before touching infrastructure. Interviewers want to see that you design for reliability outcomes, not just for components.

---

### Step 1 — User Experience

**Goal:** Anchor the design on what the user actually needs, not on infrastructure first.

- Clarify what the system does
- Identify whether it is read-heavy, write-heavy, latency-sensitive, availability-sensitive, or freshness-sensitive
- Define what "good" looks like for the user

**Key questions:**
- Who are the users?
- What is the critical path?
- Is the system mostly reads, writes, or both?
- What matters most: latency, availability, correctness, freshness, throughput?

> SRE design should start from user-visible reliability, because SLOs and alerting should reflect what customers experience.

---

### Step 2 — SLIs / SLOs

**Goal:** Make reliability measurable before designing the internals.

- Pick 2–4 user-facing SLIs, then define realistic SLOs

**Common SLIs:**
```
Availability  → % of requests returning a successful response
Latency       → p95 or p99 response time
Freshness     → % of responses containing data within an acceptable age
Error rate    → % of requests resulting in an error
Durability    → if stateful: data loss rate
```

**Key questions:**
- What do we measure to know users are happy?
- What would page the on-call?
- What can degrade without paging?

> If you cannot define the SLI/SLO, you do not yet know what the system is optimising for.

---

### Step 3 — Request Path

**Goal:** Show the end-to-end flow before diving into components.

- Draw the happy path from user to backend and back
- Show both cache-hit and cache-miss paths

**Typical flow:**
```
User → DNS / GSLB → CDN / LB → API gateway / ingress → service → cache / DB / dependencies
```

**Key questions:**
- How does traffic enter?
- Where is traffic routed globally?
- Where is TLS terminated?
- What happens on a cache hit vs cache miss?
- Where does state live?

> The request path gives the interviewer a map of the system before failure analysis begins.

---

### Step 4 — Core Components

**Goal:** Explain each component by purpose, not by name-dropping.

For each major part, say: why it exists, what problem it solves, and what happens if it fails.

**Key questions:**
- Why CDN?
- Why cache?
- Why service mesh / ingress?
- Why this datastore?
- Why multi-region?

```
Don't say:  "Redis, Istio, NLB."
Do say:     "Regional cache to absorb read traffic and serve stale data
             during dependency degradation."
```

**Common components and their purpose:**

| Component | Purpose | Fails into |
|---|---|---|
| CDN | Serve static assets / cached responses from edge nodes close to users; absorb read traffic before it hits origin | Origin absorbs full load; latency spikes for distant users |
| API Gateway | Single entry point for auth, rate limiting, routing, and protocol translation | All services exposed directly; no centralized policy enforcement |
| Load Balancer | Distribute traffic across replicas; health-check and drain unhealthy instances | Single replica absorbs all traffic; one crash takes down the service |
| Cache (Redis / Memcached) | Absorb read-heavy traffic; serve stale data during dependency degradation; reduce DB load | DB absorbs full read load; risk of cache stampede on cold start |
| Message Queue (Kafka / SQS) | Decouple producers from consumers; buffer spikes; enable async processing and replay | Synchronous coupling; producer blocked when consumer is slow or down |
| Relational DB (Postgres / MySQL) | Structured data with ACID guarantees; strong consistency; complex joins | Write bottleneck at scale; horizontal sharding adds complexity |
| NoSQL (DynamoDB / Cassandra) | High-throughput key/value or wide-column access; horizontal scale; tunable consistency | No joins; eventual consistency requires application-level conflict handling |
| Object Storage (S3 / GCS) | Durable, cheap storage for blobs, backups, and large files | Not suited for low-latency random reads; no in-place updates |
| Search Index (Elasticsearch) | Full-text and faceted search; offloads complex query patterns from primary DB | Index lag; separate consistency model from source of truth |
| Service Mesh (Istio / Linkerd) | mTLS, observability, traffic shifting, and retry policies across services without code changes | Loss of cross-service visibility; manual retry/timeout logic in each service |
| DNS / GSLB | Route users to the nearest healthy region; global failover trigger | Stale DNS TTL delays failover; single-region outage affects all users |
| Rate Limiter | Protect services from traffic bursts, abuse, and quota overruns | Upstream spikes cascade into latency and errors for all tenants |

---

### Step 5 — High Availability Design

**Goal:** Show how the system survives common failures at every layer.

**Failure layers to address:**
```
Instance / pod failure   → Health checks, restarts, redundant replicas
Node failure             → Multi-node scheduling, PodDisruptionBudgets
AZ failure               → Multi-AZ replicas, cross-AZ load balancing
Region failure           → Multi-region active-active or active-passive failover
Dependency failure       → Degraded mode, stale serving, fallback paths
```

**Typical HA controls:**
- Multi-AZ / multi-region replicas
- Load balancing with health checks
- Regional failover via GSLB
- Read replicas and replicated caches
- Rolling deploys with readiness gates

---

### Step 6 — Failure Modes

**Goal:** Show how the system behaves when things go wrong — this is the most important SRE step.

For each likely failure, explain: detection, impact, mitigation, and user experience.

**High-signal failure modes:**
```
Regional outage          → GSLB reroutes; serves from remaining regions
Dependency latency spike → Timeout triggers fallback; stale cache served
Cache miss storm         → DB absorbs load; autoscaling kicks in
Retry storm              → Circuit breaker opens; upstream protected
Node exhaustion          → Autoscaler adds capacity; requests queue briefly
Bad rollout              → Canary SLO alert fires; automated rollback triggered
Network partition        → Partition-tolerant path serves cached data
```

**Key questions:**
- What if one region dies?
- What if a dependency becomes slow?
- What if cache is unavailable?
- What if traffic spikes suddenly?
- What if a deploy introduces a bad config?

> SRE interviews care more about graceful degradation and blast-radius control than the happy path. Large outages typically come from retry amplification, dependency stress, and cascading failures — not a single component simply going down.

---

### Step 7 — Cascading-Failure Controls

**Goal:** Prevent one degraded dependency from taking down the whole service.

**Key reliability controls:**
```
Timeouts          → Every outbound call has a deadline; fail fast, do not hang
Retries           → Bounded retries with exponential backoff and jitter
Circuit breakers  → Open after N failures; stop hammering a degraded dependency
Rate limiting     → Protect the service and its dependencies from overload
Backpressure      → Signal upstream when the service is at capacity
Stale serving     → Return cached or degraded responses rather than errors
```

**Key questions:**
- What prevents retry storms?
- What happens when upstream is slow?
- How do we protect the core path?
- Can we serve partial or stale results?

> A good design does not just handle failure — it contains failure.

---

### Step 8 — Scaling Strategy

**Goal:** Explain how the system grows safely under both gradual growth and sudden spikes.

**Traffic scaling:**
```
HPA / KEDA            → Scale service replicas on RPS, latency, or queue depth
Cluster autoscaler    → Add nodes as pod demand grows
CDN + cache           → Absorb read traffic before it hits the service layer
```

**Data scaling:**
```
Read replicas           → Spread read load across multiple DB instances
Sharding / partitioning → Horizontal data split for write-heavy workloads
Cache tiering           → Local in-process cache → regional cache → DB
```

**Key questions:**
- What scales horizontally?
- What are the bottlenecks?
- What does autoscaling key off?
- What happens during sudden spikes?

---

### Step 9 — Observability

**Goal:** Make the system debuggable and operable from day one.

**Cover all four layers:**
```
Metrics  → Golden Signals (latency, errors, traffic, saturation) by region and endpoint
Logs     → Error context, request details, dependency call outcomes
Traces   → End-to-end latency attribution across service boundaries
Alerts   → SLO burn-rate alerts; page on user impact, not raw thresholds
```

**Key questions:**
- What are the user-facing golden signals?
- What dimensions matter: region, endpoint, dependency, status class?
- What should page vs ticket?
- How do we avoid alert fatigue?

> SLO-based burn-rate alerting is stronger than threshold alerting because it reflects customer impact and error-budget consumption. See the Observability & Alerting Design Framework for full detail.

---

### Step 10 — Operational Model

**Goal:** Show that the system can be safely run, not just built.

**Deploy safety:**
```
Canary rollout     → 1% → 10% → 100% traffic shift with error rate checks at each step
Automated rollback → Roll back automatically on error rate spike during canary
Feature flags      → Decouple deploy from release; disable at runtime without redeploy
Config validation  → Validate config schema at deploy time, not at runtime
```

**Runbooks:**
- One runbook per high-signal alert, linked directly from the alert
- Each runbook covers: detection, blast radius, mitigation steps, escalation path
- Keep runbooks short and action-oriented — they are read under pressure

**Operational hygiene:**
```
Game days        → Quarterly failure drills (region failover, dependency kill, traffic spike)
Chaos testing    → Controlled fault injection in staging or production canary
Postmortems      → Blameless, focused on system gaps not individuals
On-call rotation → Team-owned with clear escalation to platform for infra failures
```

**If pressed for time, say:**

> "I'd use a canary deploy strategy with automated rollback triggered by SLO burn-rate violations. Every alert would link to a runbook covering detection, mitigation, and escalation. We'd run quarterly game days to validate regional failover and dependency-degradation scenarios. On-call rotation is team-owned, with a clear escalation path to the platform team for infrastructure failures."

---

### Condensed Interview Answer

When asked "design a highly available backend for X":

> Before jumping into components, I’d start by defining the user journey or system workflow to understand the critical path, and outline key SLIs/SLOs to anchor what reliability means for this system. That ensures design decisions — like scaling, caching, or failover — are driven by clear goals, rather than a component-first approach.
>
> Then I'd sketch the end-to-end request path — starting from entry points like DNS, GSLB, CDN, API gateway, service, cache, and storage — and explain each component in terms of its purpose and failure impact.
>
> I'd cover HA explicitly — redundancy across instances and nodes, multi-AZ deployment for zonal failures, and regional failover via GSLB, along with replicated caches and databases to avoid single points of failure.
>
> The most important part is failure mode analysis — how the system behaves under dependency failures, regional outages, or traffic spikes, and how we degrade gracefully instead of failing hard. I’d include controls like timeouts, retries with backoff, circuit breakers, and stale serving to prevent cascading failures.
>
> From there, I'd cover scaling — HPA for services, sharding for data, CDN to absorb reads — and observability using golden signals broken down by region and endpoint, with SLO-based burn-rate alerting.
>
> Finally, I'd touch on the operational model — safe deployments with canaries and automated rollback, runbooks linked from alerts, and game days to ensure the system is operable in practice.
