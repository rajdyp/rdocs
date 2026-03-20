---
title: Prioritization
weight: 5
---

## RICE Framework

A scoring model for ranking features, tasks, or projects by expected impact relative to effort.

```
R — Reach       How many users/systems are affected per period?
I — Impact      How much does it move the needle? (0.25 / 0.5 / 1 / 2 / 3)
C — Confidence  How certain are you of R and I estimates? (expressed as %)
E — Effort      How many person-months of work?

Score = (Reach × Impact × Confidence) / Effort
```

**Example:**
```
Feature A: Reach=1000, Impact=2, Confidence=80%, Effort=2
  Score = (1000 × 2 × 0.8) / 2 = 800

Feature B: Reach=5000, Impact=0.5, Confidence=50%, Effort=1
  Score = (5000 × 0.5 × 0.5) / 1 = 1250  ← Prioritise this
```

**When to use:** Sprint planning, roadmap trade-offs, deciding which bug to fix first, answering "how do you decide what to work on?"

## Eisenhower Matrix (Urgent vs. Important)

```
                  URGENT              NOT URGENT
              ┌────────────────────┬───────────────────┐
  IMPORTANT   │   DO NOW           │   SCHEDULE        │
              │  (Crisis, dead-    │  (Strategy, plan- │
              │   lines, incidents)│  ning, prevention)│
              ├────────────────────┼───────────────────┤
NOT IMPORTANT │   DELEGATE         │   ELIMINATE       │
              │  (Interruptions,   │  (Busy work,      │
              │   some meetings)   │   low-value tasks)│
              └────────────────────┴───────────────────┘
```

**When to use:** When overwhelmed with tasks, deciding what to drop or delegate, time management questions in behavioural interviews.

**Interview tip:** The key insight is that most people over-invest in the top-left (urgent + important) while neglecting the top-right (not urgent but important) — which is where prevention, learning, and architecture live.

## MoSCoW Method

Classifies requirements or tasks into four tiers for scoping and trade-off discussions.

```
M — Must Have     Non-negotiable. System fails without this.
S — Should Have   High value, but system still works without it.
C — Could Have    Nice to have. Include only if time/budget allows.
W — Won't Have    Explicitly out of scope for this iteration.
```

**When to use:** Scoping an MVP, negotiating scope under deadline, system design requirements phase.

**Interview tip:** Explicitly naming what is "Won't Have" is a sign of engineering maturity — it shows you understand constraints and make deliberate trade-offs.

## Impact vs. Effort Matrix

A fast, visual prioritisation tool when you do not have time for RICE scoring.

```
              LOW EFFORT          HIGH EFFORT
          ┌───────────────────┬───────────────────┐
  HIGH    │   QUICK WINS      │   MAJOR PROJECTS  │
  IMPACT  │   Do these first  │   Plan carefully  │
          ├───────────────────┼───────────────────┤
  LOW     │   FILL-INS        │   AVOID / DEFER   │
  IMPACT  │   Do if idle      │   Deprioritise    │
          └───────────────────┴───────────────────┘
```

**When to use:** Team retrospectives, incident post-mortem action items, rapid backlog grooming.

## Trade-off Framework

When asked "how would you choose between X and Y?", use this structure to give a complete answer.

```
1. State the criteria that matter.
   "For this decision, the key factors are latency, operational complexity,
    and team familiarity."

2. Evaluate each option against the criteria.
   "Option A is better on latency but adds operational overhead.
    Option B is simpler to operate but has higher tail latency."

3. State your recommendation and the condition under which you would change it.
   "I would choose B because operational simplicity outweighs the latency
    difference at our current scale. If we grow to 10× the traffic, revisit A."
```

**When to use:** Any "SQL vs NoSQL", "REST vs gRPC", "monolith vs microservices" type question.

**Interview tip:** Interviewers rarely care which option you choose. They want to see that you can articulate trade-offs clearly and make a reasoned recommendation.

## On-Call Triage Priority Model

When multiple alerts fire simultaneously, use this ordering to decide where to look first.

```
P0  User-facing impact at scale          → Drop everything. Page team.
P1  User-facing impact, limited scope    → Investigate immediately.
P2  Internal / non-user-facing degraded  → Fix within hours.
P3  Performance regression, no impact    → Fix in next sprint.
P4  Cosmetic / minor                     → Backlog.
```

**Assessment questions:**
```
□  Is data being lost or corrupted?         → Escalate severity.
□  Is revenue / SLA at risk?                → Escalate severity.
□  Can the system self-heal?                → Monitor before acting.
□  Is a rollback available and safe?        → Consider before patching forward.
```
