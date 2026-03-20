---
title: Problem Solving
weight: 1
---

## Troubleshooting Framework

Use when something is broken and you need to diagnose it systematically without jumping to conclusions.

```
1.  Confirm    — Reproduce the issue. Verify it is actually happening.
2.  Scope      — Determine blast radius. Who/what is affected? Since when?
3.  Locate     — Narrow the fault domain. Which layer or component owns this?
4.  Mitigate   — Stop the bleeding. Rollback, redirect, or disable as needed.
5.  Root Cause — Dig until you find the real cause, not just the symptom.
```

**When to use:** Incidents, production bugs, mysterious failures, on-call escalations.

**Interview tip:** Narrate each step out loud. Interviewers want to see your reasoning process, not just the answer.

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
