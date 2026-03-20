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
