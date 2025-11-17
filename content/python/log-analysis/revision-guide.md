---
title: Revision Guide
linkTitle: Revision Guide
type: docs
weight: 4
prev: /python/log-analysis/quick-reference
---

## 📚 Quick Quiz Section

### Parsing Questions

**Q1**: What's the key difference between `.find()` and `.index()` when searching for a substring?

<details>
<summary>Show Answer</summary>

- `.find()` returns `-1` if not found (safe but need to check)
- `.index()` raises `ValueError` if not found (use with try/except)

**Corner case**: Using `.find()` result in slice without checking:
```python
# BAD - if '[' not found, find() returns -1, slice becomes weird
start = line.find('[')
timestamp = line[start+1:end]  # Could slice from end!

# GOOD
try:
    start = line.index('[')
except ValueError:
    continue
```
</details>

---

**Q2**: What does `.get()` return if the key doesn't exist and you don't provide a default?

<details>
<summary>Show Answer</summary>

Returns `None`

**Corner case**: This can cause issues when you expect a specific type:
```python
count = event.get("count")
count += 1  # TypeError if count is None!

# Better:
count = event.get("count", 0)
count += 1
```
</details>

---

**Q3**: How do you safely access nested JSON like `event["involvedObject"]["name"]`?

<details>
<summary>Show Answer</summary>

Chain `.get()` calls with empty dict as default:
```python
obj = event.get("involvedObject", {})
name = obj.get("name", "unknown")

# Or one-liner:
name = event.get("involvedObject", {}).get("name", "unknown")
```

**Why `{}` as default**: If key missing, you get empty dict which also has `.get()` method, so chain doesn't break.
</details>

---

**Q4**: When parsing `/etc/passwd`, what should you check BEFORE splitting the line?

<details>
<summary>Show Answer</summary>

Three things:
1. Strip whitespace first: `cleaned = line.strip()`
2. Check if empty: `if not cleaned:`
3. Check if comment: `if cleaned.startswith("#"):`

**Corner case**: Whitespace-only lines will pass `if line:` but fail when split.

```python
# CORRECT ORDER:
cleaned = line.strip()
if not cleaned or cleaned.startswith("#"):
    continue
fields = cleaned.split(":")
```
</details>

---

### Counting Questions

**Q5**: Fill in the blank - count occurrences using plain dict:
```python
counts = {}
for item in items:
    counts[item] = counts._____(item, ___) + 1
```

<details>
<summary>Show Answer</summary>

```python
counts[item] = counts.get(item, 0) + 1
```
</details>

---

**Q6**: What's the danger of using `Counter` when you just need simple counting?

<details>
<summary>Show Answer</summary>

**No real danger, just:**
- Slight memory overhead
- Overkill for simple cases
- Import dependency

**However**: If you might need `.most_common()` later, using Counter from start is fine.

**Corner case**: Counter returns 0 for missing keys (doesn't raise KeyError), which might hide bugs:
```python
c = Counter({'a': 5})
print(c['b'])  # Returns 0, not KeyError
```
</details>

---

**Q7**: When should you use a `set` instead of counting?

<details>
<summary>Show Answer</summary>

When you only care about **uniqueness**, not frequency:
- Unique IPs, pod names, user IDs
- Checking "have I seen this before?" (O(1) lookup)
- Deduplication

**Don't use set when**: You need to know "how many times?" - use Counter/dict instead.
</details>

---

**Q8**: What's wrong with this code?
```python
endpoint_counts = defaultdict(int)
for log in logs:
    endpoint_counts[log['endpoint']] + 1
```

<details>
<summary>Show Answer</summary>

Missing `=` assignment! Should be:
```python
endpoint_counts[log['endpoint']] += 1
```

**This is a silent bug** - the code runs but doesn't count anything. Python evaluates `x + 1` but doesn't store it.
</details>

---

### Statistics Questions

**Q9**: What's the critical check you MUST do before calculating an average?

<details>
<summary>Show Answer</summary>

**Check for division by zero:**
```python
# BAD
avg = total / count

# GOOD
avg = total / count if count > 0 else 0

# Or explicit:
if count > 0:
    avg = total / count
else:
    avg = 0  # or None, or raise error
```

**Corner case**: Even if you "know" there's data, defensive programming prevents crashes.
</details>

---

**Q10**: Why can't you calculate percentiles in a single pass like you can with average?

<details>
<summary>Show Answer</summary>

Percentiles require **sorted data** or knowing the distribution.

- Average: Just need sum and count (single pass)
- Percentile: Need to know position in sorted order

**Pattern**: Collect all values → sort (or use numpy) → calculate percentile

```python
# Must collect first:
latencies = []
for log in logs:
    latencies.append(log['latency'])

p95 = np.percentile(latencies, 95)  # Requires all data
```
</details>

---

**Q11**: What's wrong with this max() call on a filtered list?
```python
errors = [log for log in logs if log['status'] >= 400]
slowest_error = max(errors, key=lambda x: x['latency'])
```

<details>
<summary>Show Answer</summary>

**It crashes if `errors` is empty!**

```python
# Better:
slowest_error = max(errors, key=lambda x: x['latency'], default=None)

# Then check:
if slowest_error:
    print(f"Slowest error: {slowest_error}")
```

**Corner case**: Always use `default` parameter with `max()`/`min()` on filtered data.
</details>

---

### Time & Date Questions

**Q12**: What type does subtracting two datetime objects return?

<details>
<summary>Show Answer</summary>

`timedelta` object

```python
start = datetime.fromisoformat("2025-01-15T10:00:00")
end = datetime.fromisoformat("2025-01-15T10:05:23")
duration = end - start  # timedelta object

print(duration)  # "0:05:23"
seconds = duration.total_seconds()  # 323.0
```

**Key**: timedelta can be added together and divided by integers (for averages).
</details>

---

**Q13**: How do you calculate average duration across multiple sessions?

<details>
<summary>Show Answer</summary>

```python
from datetime import timedelta

total_duration = timedelta(0)  # Initialize to zero timedelta
count = 0

for session in sessions:
    duration = session['end'] - session['start']
    total_duration += duration  # Add timedeltas
    count += 1

avg_duration = total_duration / count  # Divide by int
```

**Corner case**: Initialize with `timedelta(0)`, NOT `0` (won't work with += timedelta).
</details>

---

**Q14**: When should you sort logs by timestamp before processing?

<details>
<summary>Show Answer</summary>

When the **order matters** for correctness:
- Session tracking (need login before logout in order)
- Calculating durations between sequential events
- Time-series analysis
- Any time you reference "previous" or "next" events

**Trade-off**: Must load all into memory, but ensures correctness.

```python
logs = sorted(logs, key=lambda x: datetime.fromisoformat(x['timestamp']))
```
</details>

---

### Filtering & Grouping Questions

**Q15**: What's the difference between these two?
```python
# A
results = [x for x in items if condition]

# B
results = []
for x in items:
    if condition:
        results.append(x)
```

<details>
<summary>Show Answer</summary>

**Functionally identical**, but:

**A (list comprehension)**:
- More Pythonic
- Slightly faster
- Best for simple conditions
- One-liner

**B (loop)**:
- More readable for complex logic
- Can have multiple statements
- Can use continue/break
- Better for debugging (can add prints)

**When to use B**: Complex multi-line conditions, need to track state, debugging.
</details>

---

**Q16**: Complete the pattern - track first occurrence only:
```python
active_sessions = {}
for event in events:
    user = event['user_id']
    if event['action'] == 'login' and user ___ active_sessions:
        active_sessions[user] = event['timestamp']
```

<details>
<summary>Show Answer</summary>

```python
if event['action'] == 'login' and user not in active_sessions:
    active_sessions[user] = event['timestamp']
```

**Key pattern**: `not in` ensures first occurrence only.

**Alternative**: Check if value is None:
```python
if event['action'] == 'login' and active_sessions.get(user) is None:
```
</details>

---

**Q17**: Why use `defaultdict(list)` for grouping instead of regular dict?

<details>
<summary>Show Answer</summary>

Avoids initialization boilerplate:

```python
# Without defaultdict:
groups = {}
for item in items:
    if key not in groups:
        groups[key] = []  # Must initialize!
    groups[key].append(item)

# With defaultdict:
groups = defaultdict(list)
for item in items:
    groups[key].append(item)  # Auto-creates empty list
```

**Cleaner and less error-prone.**

**Corner case**: Creates key on first access, even if you don't append. Usually fine, but be aware.
</details>

## 🔥 Corner Case Drills

### Drill 1: Empty Data
**Scenario**: Your log file is empty or has no matching records.

What breaks in this code?
```python
latencies = [log['latency'] for log in logs if log['endpoint'] == '/checkout']
avg = sum(latencies) / len(latencies)
p95 = np.percentile(latencies, 95)
```

<details>
<summary>Show Answer</summary>

**Two things break:**

1. `avg` calculation: Division by zero if `latencies` is empty
2. `np.percentile()`: Raises error on empty array

**Fixed:**
```python
if latencies:
    avg = sum(latencies) / len(latencies)
    p95 = np.percentile(latencies, 95)
else:
    print("No data available")
    avg = 0
    p95 = 0
```
</details>

---

### Drill 2: Missing Keys
**Scenario**: JSON event is missing expected fields.

What's wrong?
```python
for event in events:
    pod_name = event["involvedObject"]["name"]
    if event["type"] == "Warning":
        print(pod_name)
```

<details>
<summary>Show Answer</summary>

**KeyError** if any key missing!

**Fixed:**
```python
for event in events:
    obj = event.get("involvedObject", {})
    pod_name = obj.get("name")
    event_type = event.get("type")

    if event_type == "Warning" and pod_name:
        print(pod_name)
```

**Always use `.get()` with nested JSON from external sources.**
</details>

---

### Drill 3: Whitespace Lines
**Scenario**: File has empty lines, whitespace-only lines, and comments.

What's wrong?
```python
with open("passwd.txt") as f:
    for line in f:
        if line.startswith("#"):
            continue
        fields = line.split(":")
        uid = fields[2]
```

<details>
<summary>Show Answer</summary>

**Multiple issues:**

1. Whitespace-only lines will pass through
2. Empty lines cause index error on `fields[2]`
3. Not stripping means comment check might fail if indented

**Fixed:**
```python
with open("passwd.txt") as f:
    for line in f:
        cleaned = line.strip()
        if not cleaned or cleaned.startswith("#"):
            continue
        fields = cleaned.split(":")
        if len(fields) < 3:  # Extra safety
            continue
        uid = fields[2]
```

**Golden rule: Strip → check empty → check comments → parse**
</details>

---

### Drill 4: Out of Order Logs
**Scenario**: Session logs are not in chronological order.

What breaks?
```python
active_sessions = {}
for log in logs:
    if log['action'] == 'login':
        active_sessions[log['user']] = log['timestamp']
    elif log['action'] == 'logout':
        duration = log['timestamp'] - active_sessions[log['user']]
```

<details>
<summary>Show Answer</summary>

**If logout comes before login in file**: KeyError on `active_sessions[log['user']]`

**Also**: Duration could be negative if timestamps are out of order

**Fixed:**
```python
# Sort first
logs = sorted(logs, key=lambda x: datetime.fromisoformat(x['timestamp']))

active_sessions = {}
for log in logs:
    if log['action'] == 'login':
        active_sessions[log['user']] = datetime.fromisoformat(log['timestamp'])
    elif log['action'] == 'logout' and log['user'] in active_sessions:
        start = active_sessions[log['user']]
        end = datetime.fromisoformat(log['timestamp'])
        duration = end - start
        # Now guaranteed positive duration
        del active_sessions[log['user']]
```
</details>

---

### Drill 5: Case Sensitivity
**Scenario**: Log levels appear as "ERROR", "error", "Error".

What's wrong?
```python
valid_levels = {'ERROR', 'WARN', 'INFO', 'DEBUG'}

for line in logs:
    level = extract_level(line)
    if level in valid_levels:
        counts[level] += 1
```

<details>
<summary>Show Answer</summary>

**Case variations won't match**, undercounting!

**Fixed:**
```python
valid_levels = {'ERROR', 'WARN', 'INFO', 'DEBUG'}

for line in logs:
    level = extract_level(line).upper()  # Normalize
    if level in valid_levels:
        counts[level] += 1
```

**Always normalize case** when matching log levels, error messages, etc.
</details>

---

### Drill 6: Modifying While Iterating
**What's wrong?**
```python
for item in my_list:
    if item['status'] == 'expired':
        my_list.remove(item)
```

<details>
<summary>Show Answer</summary>

**Skips items!** Removing during iteration changes indices.

**Fixed options:**

```python
# Option 1: Create new list (cleanest)
my_list = [item for item in my_list if item['status'] != 'expired']

# Option 2: Iterate over copy
for item in my_list[:]:  # [:] creates shallow copy
    if item['status'] == 'expired':
        my_list.remove(item)

# Option 3: Iterate backwards
for i in range(len(my_list) - 1, -1, -1):
    if my_list[i]['status'] == 'expired':
        del my_list[i]
```

**Best practice: Create new list with comprehension**
</details>

## 🎯 Pattern Recognition Drill

**For each scenario, identify the best approach:**

### Scenario 1
"Count how many requests each IP made"

<details>
<summary>Show Answer</summary>

**defaultdict(int)** or **dict.get()**

```python
from collections import defaultdict
ip_counts = defaultdict(int)
for log in logs:
    ip_counts[log['ip']] += 1
```

**Why not Counter?** Could work, but overkill if you don't need most_common().
</details>

---

### Scenario 2
"Find the top 5 most common error messages"

<details>
<summary>Show Answer</summary>

**Counter with most_common()**

```python
from collections import Counter
errors = [log['message'] for log in logs if log['level'] == 'ERROR']
Counter(errors).most_common(5)
```

**Why?** Built-in sorting by frequency, clean API.
</details>

---

### Scenario 3
"Track which pods have had at least one warning event"

<details>
<summary>Show Answer</summary>

**set**

```python
pods_with_warnings = set()
for event in events:
    if event['type'] == 'Warning':
        pods_with_warnings.add(event['pod_name'])
```

**Why?** Only care about uniqueness, not frequency.
</details>

---

### Scenario 4
"Group all events by pod name"

<details>
<summary>Show Answer</summary>

**defaultdict(list)**

```python
from collections import defaultdict
events_by_pod = defaultdict(list)
for event in events:
    events_by_pod[event['pod_name']].append(event)
```

**Why?** Auto-initializes empty lists, clean grouping pattern.
</details>

---

### Scenario 5
"Calculate P95 latency for /api/checkout endpoint"

<details>
<summary>Show Answer</summary>

**Collect in list → numpy.percentile()**

```python
import numpy as np
latencies = [log['latency'] for log in logs if log['endpoint'] == '/api/checkout']
if latencies:
    p95 = np.percentile(latencies, 95)
```

**Why?** Percentiles need sorted/distributed data, can't do single-pass.
</details>

---

### Scenario 6
"Calculate average session duration (login to logout)"

<details>
<summary>Show Answer</summary>

**Sort by timestamp → Track active sessions → Sum timedeltas**

```python
from datetime import datetime, timedelta

logs = sorted(logs, key=lambda x: datetime.fromisoformat(x['timestamp']))
active = {}
total = timedelta(0)
count = 0

for log in logs:
    user = log['user']
    if log['action'] == 'login':
        active[user] = datetime.fromisoformat(log['timestamp'])
    elif log['action'] == 'logout' and user in active:
        duration = datetime.fromisoformat(log['timestamp']) - active[user]
        total += duration
        count += 1
        del active[user]

avg = total / count if count > 0 else timedelta(0)
```

**Why sort?** Need chronological order for paired events.
</details>

## 🧠 Memory Tricks

### "Strip Before Check"
**When parsing files, always:**
```
1. Strip whitespace: cleaned = line.strip()
2. Check empty: if not cleaned: continue
3. Check comments: if cleaned.startswith("#"): continue
4. Parse: fields = cleaned.split(":")
```

### "Get with Default"
**For nested JSON:**
```
Level 1: obj = event.get("key", {})
Level 2: value = obj.get("subkey", default)

One-liner: value = event.get("key", {}).get("subkey", default)
```

### "Check Before Divide"
**Always:**
```python
result = numerator / denominator if denominator > 0 else 0
```

### "Default on Max"
**When filtering:**
```python
result = max(filtered_list, key=lambda x: x['field'], default=None)
if result:
    # use result
```

### "Not In for First Only"
**Track first occurrence:**
```python
if key not in dict:
    dict[key] = value
```

### "Sort for Sessions"
**When events must be in order:**
```python
logs = sorted(logs, key=lambda x: datetime.fromisoformat(x['timestamp']))
```

---

## ✅ Revision Checklist

Use this for quick 5-minute reviews:

**Parsing:**
- [ ] Do I strip before checking empty lines?
- [ ] Do I use .get() for JSON fields?
- [ ] Do I handle comments in config files?

**Counting:**
- [ ] Did I choose the right structure (dict/defaultdict/Counter/set)?
- [ ] Am I using += with counters, not just +?

**Statistics:**
- [ ] Did I check for division by zero?
- [ ] Did I use default with max()/min() on filtered data?
- [ ] Did I collect all values before calculating percentiles?

**Time:**
- [ ] Did I sort by timestamp if order matters?
- [ ] Did I initialize timedelta(0) not 0?
- [ ] Did I check for paired events before calculating duration?

**General:**
- [ ] Did I handle empty input data?
- [ ] Did I normalize case for comparisons?
- [ ] Did I avoid modifying list while iterating?
