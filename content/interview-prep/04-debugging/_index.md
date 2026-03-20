---
title: Debugging
weight: 4
---

## Systematic Debugging Framework

Avoid the most common debugging mistake: changing things randomly and hoping something works.

```
1.  Reproduce     Get a reliable, minimal reproduction. Can you trigger it on demand?
2.  Observe       Gather data — logs, metrics, stack traces. Do not guess yet.
3.  Hypothesise   Form one specific hypothesis about the cause.
4.  Test          Design an experiment to confirm or deny it. Change one variable.
5.  Fix           Apply the fix only after the hypothesis is confirmed.
6.  Verify        Confirm the fix works and did not introduce regressions.
7.  Document      Record what happened and why, for future reference.
```

**When to use:** Any bug that is not immediately obvious — especially intermittent or production issues.

**Interview tip:** If asked to debug a scenario, narrate this loop out loud. Even if you do not reach the answer, demonstrating a disciplined process is what interviewers evaluate.

## Rubber Duck Debugging

Explain the problem, step by step, out loud — to a rubber duck, a colleague, or yourself.

```
1. State what the code is supposed to do.
2. Walk through what it actually does, line by line.
3. The mismatch between 1 and 2 is almost always where the bug is.
```

**Why it works:** Explaining forces you to slow down and make implicit assumptions explicit. The act of articulating the problem often reveals the answer.

**When to use:** When you have been staring at the same bug for 20+ minutes. Also useful before asking a colleague for help — you may solve it in the process.

## Layer-by-Layer Debugging (OSI Mindset)

For network or distributed system issues, walk up the stack from the lowest layer to the highest.

```
Layer 7 — Application    Is the app logic correct? Are request payloads valid?
Layer 6 — Presentation   Encoding issues? Serialisation mismatches (JSON, protobuf)?
Layer 5 — Session        Auth tokens valid? TLS handshake completing?
Layer 4 — Transport      TCP connection established? Port open? Firewall rule?
Layer 3 — Network        Can the host route to the target? DNS resolving correctly?
Layer 2 — Data Link      (Rarely relevant unless debugging bare metal / VPC)
Layer 1 — Physical       (Rarely relevant unless on-prem hardware issue)
```

**When to use:** "Service A cannot reach Service B", latency spikes, connection timeouts, TLS errors.

**Practical shortcuts:**
```bash
# DNS
nslookup <hostname>
dig <hostname>

# Connectivity
ping <host>
curl -v <url>
telnet <host> <port>

# Firewall / routing
traceroute <host>
nc -zv <host> <port>
```

## Debugging Checklist for Distributed Systems

```
□  Is the issue isolated to one instance or all instances?
□  Did anything deploy recently? (Check deployment timestamps vs. incident start)
□  Is the issue correlated with a time-of-day traffic pattern?
□  Are there error spikes in logs? What is the first error in the chain?
□  Are downstream dependencies healthy? (Check their status / dashboards)
□  Is the database connection pool exhausted?
□  Are there resource limits being hit? (CPU, memory, file descriptors, disk)
□  Are there clock skew issues between services? (affects JWT expiry, Kafka offsets)
□  Is the issue in a specific region, AZ, or node?
□  Is a third-party API or external dependency degraded?
```

## The "Change What Changed" Heuristic

When a system that was working suddenly breaks:

```
1. Find the exact time the problem started.
2. List everything that changed around that time:
   - Deployments, config changes, feature flags
   - Infrastructure changes (scaling events, node replacements)
   - External dependency updates
   - Traffic pattern changes (marketing campaign, cron job)
   - Certificate / secret rotation
3. For each change, ask: "Could this cause the observed symptom?"
4. Roll back or test the most likely candidate first.
```

**When to use:** Regression bugs, "it was working yesterday" incidents.

**Interview tip:** This heuristic alone has solved the majority of production incidents. It is worth stating explicitly in a troubleshooting discussion.
