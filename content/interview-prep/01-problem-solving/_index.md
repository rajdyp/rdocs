---
title: Problem Solving
weight: 1
---

## Incident Response Framework

Use when something is broken and you need to diagnose it systematically without jumping to conclusions.

**Quick reference:**
```
1. Confirm    — Verify the issue is real, current, and user-impacting.
2. Scope      — Determine blast radius: who, what, where, since when.
3. Correlate  — Identify recent changes that could explain the issue.
4. Stabilize  — Pause risky changes and stop the incident from expanding.
5. Locate     — Narrow the fault domain using golden signals and dependency tracing.
6. Mitigate   — Take the fastest safe action to reduce user impact.
7. Root Cause — Identify both the trigger and the missing safeguard.
8. Recover    — Confirm the system is truly healthy, not just quieter.
9. Prevent    — Add fixes, guardrails, and learnings to avoid recurrence.
```

**When to use:** Incidents, production bugs, mysterious failures, on-call escalations.

**Interview tip:** Narrate each step out loud. Interviewers want to see your reasoning process, not just the answer.

---

### Step 1 — Confirm

**Goal:** Ensure the issue is real, current, and user-impacting.

- Validate via dashboards (latency, errors, traffic, saturation), alerts, synthetic checks, or user reports
- Determine if the issue is ongoing, intermittent, or already self-resolved
- Separate signal from noise — filter out false positives before escalating

**Key questions:**
- Is this still happening right now?
- What exactly is degraded: latency, errors, availability, or correctness?
- Is this real user impact or a noisy signal?

> This is a quick golden signal check to confirm the issue exists. Step 5 uses the same signals analytically to locate the fault domain.

---

### Step 2 — Scope

**Goal:** Understand blast radius and urgency.

- Identify who is affected: one user, one tenant, one region, one AZ, all customers
- Establish a timeline of when it started
- Compare healthy vs unhealthy slices to find the boundary

**Scope dimensions:**
- Region / AZ
- Service / endpoint
- Version / deploy group
- Customer segment
- Dependency path

**Key questions:**
- Is this global or isolated?
- Who is impacted and how severely?
- When did this begin?

---

### Step 3 — Correlate

**Goal:** Identify recent changes that could explain the issue.

- Check recent deploys (app, infra, config)
- Check feature flag changes, traffic pattern shifts, dependency updates
- Check certificate rotations, DNS updates, quota changes
- Build a timeline: incident start vs change events — look for overlap

**Key questions:**
- What changed around the time this started?
- Did this begin right after a deploy or config update?
- Is the change localized to the affected scope (e.g., only one region)?

> Changes often tell you *why* before you even start locating *where*.

---

### Step 4 — Stabilize

**Goal:** Prevent further impact while investigation continues.

- Pause or roll back recent deploys
- Freeze config and feature flag changes
- Isolate affected region or service if needed
- Page relevant owners and protect system capacity

**Key questions:**
- Do I need to stop an ongoing rollout?
- Is the incident still expanding?
- Can I reduce risk while investigating?

> This step shows interview maturity: in real incidents you do not always wait until root cause before taking action.

---

### Step 5 — Locate

**Goal:** Narrow the fault domain using signals and system behavior.

**Step 1 — Check golden signals:**
- Latency, Errors, Traffic, Saturation

**Step 2 — Interpret signals:**
```
High latency + low CPU  → dependency or network issue
High CPU                → compute bottleneck
High error rate         → failing service or downstream
Traffic drop            → upstream routing or client-side issue
```

**Step 3 — Isolate by layer (let signals guide you, not the other way around):**
```
Edge          — DNS, CDN, GSLB
Entry         — LB, ingress, API gateway
Platform      — nodes, kube-proxy, service mesh, networking
Service       — pods, app instances, queues
Dependency    — DB, cache, downstream API
Control plane — deploys, feature flags, certs, config changes
```

**Step 4 — Use observability:**
- Metrics → detect the anomaly
- Logs → find errors and timeouts
- Traces → identify the slow span

**Key questions:**
- Where is the time being spent?
- Where do healthy and unhealthy paths diverge?
- Is this infra, application, or dependency?

> Signals tell you *where*; the Correlate step tells you *why*.

---

### Step 6 — Mitigate

**Goal:** Reduce user impact with the fastest safe action.

- Roll back or disable the problematic change
- Shift traffic to healthy regions
- Scale out the hot component
- Fail over dependencies
- Increase cache TTL or disable expensive non-critical features
- Drain bad nodes

**Key questions:**
- What is the fastest safe action?
- Can I reduce impact before I have full root cause?
- Is this action reversible?

> Target the smallest safe action that buys time. Stabilize is "hold the line"; Mitigate is "repair the damage."

---

### Step 7 — Root Cause

**Goal:** Identify the actual trigger and why the system allowed it.

**Two parts:**
- **Trigger** — What changed or failed first?
- **System gap** — Why did this become user impact? Why did safeguards not catch it?

**Key questions:**
- What was the first bad event?
- Why did detection or protection mechanisms fail?
- Was it capacity, config, dependency, rollout, or design weakness?

**Avoid shallow answers:**
```
Shallow:  "DB was slow."
Deep:     "DB was slow because one region had connection pool exhaustion
           after a cache miss spike caused by config drift."
```

---

### Step 8 — Recover Fully

**Goal:** Ensure the system is completely healthy, not just quieter.

- Verify all golden signals return to normal baseline
- Check backlogs, queue depth, retry storms, cache warm-up
- Confirm replica health across all regions
- Verify no partial degradation remains hidden

**Key questions:**
- Are we truly healthy or just temporarily quiet?
- Is there hidden backlog or delayed impact?
- Are all regions and replicas healthy?

> Most candidates stop at Mitigate. Explicitly calling out recovery signals operational maturity.

---

### Step 9 — Prevent Recurrence

**Goal:** Reduce the likelihood and impact of similar incidents.

**Short-term (this sprint):**
- Tune alerting to catch this class of failure earlier (SLO-based preferred)
- Update runbooks and dashboards
- Add or improve canary / rollout safety checks

**Long-term (this quarter):**
- Add circuit breakers, rate limiting, or retry guardrails
- Strengthen regional isolation and capacity planning
- Increase observability coverage for the affected path

**Key questions:**
- What would have detected this earlier?
- What would have reduced blast radius?
- What should be automated or enforced by policy?

## UPER Problem-Solving Framework

A structured approach to algorithm and coding problems — especially useful when you are stuck.

```
U — Understand   Restate the problem. Ask clarifying questions. Check edge cases.
P — Plan         Sketch an approach before writing code. Think aloud.
E — Execute      Write clean code following the plan.
R — Review       Test with examples. Check edge cases. Analyze complexity.
```

**When to use:** LeetCode-style problems, open-ended coding challenges, any time you feel the urge to start typing immediately.

**Interview tip:** Spending 5 minutes on Understand + Plan almost always beats diving straight into code.

## Divide and Conquer (Binary Search Mindset)

When facing a complex system or a large search space, split it in half repeatedly to locate the fault or solution faster.

```
1. Identify the full search space (e.g., the entire call chain).
2. Pick a midpoint and observe behaviour there.
3. Eliminate the half that is clean.
4. Repeat until isolated.
```

**When to use:** Debugging a multi-step pipeline, narrowing down a regression, tracing where data gets corrupted.

**Example:** "The data is wrong by the time it reaches the UI — is it wrong at the API response, at the service layer, or at the DB query? Let me check the API response first."

## 5 Whys

Repeatedly ask "why?" to peel away symptoms and reach the underlying root cause.

```
Problem:  The deployment failed.
Why 1?    The health check timed out.
Why 2?    The app took too long to start.
Why 3?    It was waiting on a slow database connection.
Why 4?    The connection pool was exhausted.
Why 5?    A recent change removed the connection limit config.
Root cause: Missing connection pool configuration in the new environment.
```

**When to use:** Post-mortems, root cause analysis, any time a fix feels shallow ("we just need to restart it").

**Interview tip:** Five iterations is a guideline, not a rule. Stop when you reach something actionable and preventable.

## Edge Case Checklist

Before finalising any solution, run through this checklist mentally.

```
□  Empty / null / zero inputs
□  Single element / minimum valid input
□  Maximum input (scale / size limits)
□  Duplicate values
□  Negative numbers or invalid types
□  Already-sorted or reverse-sorted data
□  Off-by-one boundaries
□  Concurrent access / race conditions (for systems)
```

**When to use:** After writing any function or designing any API — before saying "I'm done."

## Algorithm Pattern Recognition

When you see a problem, use these signals to identify the right technique before writing any code.

```
Problem Signal                          → Technique
─────────────────────────────────────────────────────────────
Contiguous subarray / substring         → Sliding window
Pair / triplet sum, sorted array        → Two pointers
Shortest path, level-order traversal    → BFS
All paths, connected components, DFS    → DFS / recursion
Search in sorted array / rotated array  → Binary search
Search answer space ("minimum max...")  → Binary search on answer
Optimal substructure, overlapping sub   → Dynamic programming
All combinations / permutations         → Backtracking
Top K elements, streaming median        → Heap (min/max)
Intervals (merge, insert, overlap)      → Sort + sweep
Parentheses, undo/redo, monotonic       → Stack
Prefix sums, range queries              → Prefix sum / Fenwick tree
String matching, repeated substrings    → Sliding window or KMP
Graph with weights, shortest path       → Dijkstra / Bellman-Ford
```

**Decision flow:**
```
Is the input sorted (or can you sort it)?  → Two pointers / binary search
Does it ask for all possibilities?         → Backtracking / DFS
Does it ask for the shortest/fewest?       → BFS (unweighted) or Dijkstra (weighted)
Does it ask for max/min of a subarray?     → Sliding window / DP
Does it ask for "number of ways"?          → DP
Does it involve a fixed-size window?       → Sliding window
Does it involve nested intervals?          → Stack or sorting
```

**When to use:** Technical screens, LeetCode-style problems — apply before writing a single line of code.

**Interview tip:** Say the pattern out loud: "This looks like a sliding window problem because we need a contiguous subarray and want to avoid recomputation." Naming the pattern signals experience even before solving.
