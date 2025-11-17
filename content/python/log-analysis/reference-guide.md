---
title: Reference Guide
linkTitle: Reference Guide
type: docs
weight: 1
prev: /python/log-analysis
next: /python/log-analysis/cookbook
---

A comprehensive reference for log analysis patterns, techniques, and decision-making.

## Parsing Techniques

### 1. String Manipulation (split, find, slice)

**When to use**: Simple, predictable log formats with clear delimiters

**Example**: Parsing Apache/Nginx logs
```python
data = line.strip().split()
ip = data[0]
status = int(data[-3])
bytes_size = int(data[-2])
latency = float(data[-1])

# Extract bracketed content
start_ts = line.find('[')
end_ts = line.find(']')
timestamp = line[start_ts + 1:end_ts]

# Extract quoted content
req_start = line.find('"')
req_end = line.find('"', req_start + 1)
request = line[req_start + 1:req_end].split()
method = request[0]
endpoint = request[1]
```

**Pros**: Fast, no dependencies, easy to understand
**Cons**: Fragile with varying formats, manual index management

### 2. Regular Expressions

**When to use**: Complex patterns, need validation, multiple formats

**Example**: Robust log parsing with named groups
```python
import re

LOG_PATTERN = r'(?P<IP>\d+\.\d+\.\d+\.\d+)\s-\s-\s\[(?P<TIMESTAMP>.*?)\]\s"(?P<REQUEST>.*?)"\s(?P<STATUS>\d{3})\s(?P<BYTES>\d+)\s(?P<LATENCY>\d+\.\d+)'

with open('file.txt', 'r') as f:
    for line in f:
        match = re.fullmatch(LOG_PATTERN, line.strip())
        if match:
            log_data = match.groupdict()
            ip = log_data['IP']
            status = int(log_data['STATUS'])
            # ... process data
        else:
            print(f"Skipping unparseable line: {line.strip()}")
```

**Common patterns**:
- IP address: `\d+\.\d+\.\d+\.\d+`
- Timestamp in brackets: `\[(?P<TIMESTAMP>.*?)\]`
- Quoted content: `"(?P<REQUEST>.*?)"`
- Word boundaries: `\b\w+\b` (useful for word extraction)
- Log levels: `\[(INFO|WARN|ERROR|DEBUG)\]`

**Pros**: Validation built-in, handles variations, self-documenting with named groups
**Cons**: Slower than string methods, requires regex knowledge

### 3. JSON Parsing (Line-delimited JSON)

**When to use**: Structured logs (JSON lines format - one JSON object per line)

**Example**: Kubernetes events, structured application logs
```python
import json

with open("events.json", "r") as f:
    for line in f:
        event = json.loads(line)
        event_type = event.get("type", "Unknown")
        obj = event.get("involvedObject", {})
        kind = obj.get("kind")

        if kind == "Pod" and event_type == "Warning":
            # Process warning events
            pass
```

**Key techniques**:
- Use `.get()` with defaults to handle missing fields safely
- Navigate nested structures with chained `.get()` calls
  ```python
  # Example: Safely get nested value
  pod_name = event.get("involvedObject", {}).get("name", "unknown")
  ```
- Check for None: `if data.get("field") != None:`

**Pros**: Handles complex nested data, type-safe, widely supported
**Cons**: Requires valid JSON, memory overhead for large objects

### 4. Colon-Separated Values (CSV-like formats)

**When to use**: /etc/passwd, simple delimited configs

**Example**: Parse /etc/passwd
```python
# Format: username:password:UID:GID:GECOS:home_dir:login_shell

with open("passwd.txt", "r") as f:
    for line in f:
        # Skip empty lines and comments
        cleaned_line = line.strip()
        if not cleaned_line or cleaned_line.startswith("#"):
            continue

        data = line.split(":")
        username = data[0]
        uid = data[2]
        gid = data[3]
```

**Best practices**:
- Always strip whitespace before checking for empty lines
- Handle comments early
- Document field positions with comments

## Data Structures

### Decision Matrix: Which data structure to use?

| Need | Use | Example |
|------|-----|---------|
| Count occurrences | `dict` with `.get()` OR `defaultdict(int)` OR `Counter` | Word frequency, IP counts |
| Track unique items | `set` | Unique pod names, distinct users |
| Maintain order | `list` | Parsed logs, time-series data |
| Group by key | `dict` with `list` values OR `defaultdict(list)` | Events per pod, requests per IP |
| Top N items | `Counter.most_common(N)` OR manual sort | Most common errors, top endpoints |
| First occurrence only | `dict` (check `if key not in dict`) | Session start times |

### 1. Dictionary Patterns

#### Basic Counting
```python
# Method 1: Manual with .get()
count = {}
for item in items:
    count[item] = count.get(item, 0) + 1

# Method 2: Check existence
count = {}
for item in items:
    if item in count:
        count[item] += 1
    else:
        count[item] = 1

# Method 3: setdefault (concise)
count = {}
for item in items:
    count.setdefault(item, 0)
    count[item] += 1
```

**When to use each**:
- `.get()`: Most Pythonic, recommended for simple cases
- Check existence: More explicit, easier for beginners
- `.setdefault()`: Useful when setting complex defaults

#### Tracking First Occurrence Only
```python
# Pattern: Session tracking, first event timestamp
active_sessions = {}

for event in events:
    user_id = event['user_id']
    action = event['action']

    # Only record first login
    if action == "login" and user_id not in active_sessions:
        active_sessions[user_id] = event['timestamp']

    # Process logout only if we have a login
    if action == "logout" and user_id in active_sessions:
        # Calculate duration
        duration = event['timestamp'] - active_sessions[user_id]
        del active_sessions[user_id]  # Clean up completed session
```

**Key insight**: Check `not in dict` before adding to ensure first-only behavior

### 2. defaultdict - Cleaner Counting & Grouping

**When to use**: Multiple counters, grouping data, avoid repetitive `.get()` calls

```python
from collections import defaultdict

# Counting (auto-initializes to 0)
ip_counts = defaultdict(int)
for log in logs:
    ip_counts[log['ip']] += 1  # No need for .get() or checking

# Grouping (auto-initializes to empty list)
events_by_pod = defaultdict(list)
for event in events:
    pod_name = event['pod']
    events_by_pod[pod_name].append(event)
```

**Comparison**:
```python
# Without defaultdict
groups = {}
for item in items:
    if key not in groups:
        groups[key] = []
    groups[key].append(item)

# With defaultdict
groups = defaultdict(list)
for item in items:
    groups[key].append(item)  # Much cleaner!
```

**Pros**: Cleaner code, no initialization boilerplate
**Cons**: Slightly less explicit, creates keys on access

### 3. Counter - Advanced Counting

**When to use**: Need `most_common()`, combining counts, or multiple count operations

```python
from collections import Counter

# Method 1: Direct initialization
word_counts = Counter(word_list)

# Method 2: Incremental updates
log_levels = Counter()
for line in logs:
    level = extract_level(line)
    log_levels[level] += 1

# Method 3: Update with iterable
reasons = []
for event in events:
    if event['type'] == "Warning":
        reasons.append(event['reason'])
reason_counts = Counter(reasons)

# Get top N
for reason, count in reason_counts.most_common(3):
    print(f"{reason}: {count}")
```

**Counter-specific features**:
```python
# Combining counters
count1 = Counter(['a', 'b', 'c'])
count2 = Counter(['b', 'c', 'd'])
combined = count1 + count2  # Counter({'b': 2, 'c': 2, 'a': 1, 'd': 1})

# Update (add to existing)
count1.update(count2)

# Most common without limit
all_sorted = word_counts.most_common()  # All items, sorted by count
```

**Pros**: Built-in `most_common()`, arithmetic operations, readable
**Cons**: Overkill for simple counting, slight memory overhead

### 4. Sets - Uniqueness Tracking

**When to use**: Deduplicate, membership testing, finding unique items

```python
unique_pods = set()

for event in events:
    pod_name = f"{event['namespace']}/{event['name']}"
    unique_pods.add(pod_name)

print(f"Total unique pods: {len(unique_pods)}")

# Conditional uniqueness
pods_with_warnings = set()
for event in events:
    if event['type'] == "Warning":
        pods_with_warnings.add(event['pod_name'])
```

**Set operations**:
```python
set1 = {1, 2, 3}
set2 = {2, 3, 4}

intersection = set1 & set2  # {2, 3}
union = set1 | set2         # {1, 2, 3, 4}
difference = set1 - set2     # {1}
```

**Key insight**: Sets automatically deduplicate, O(1) membership testing

## Analysis Patterns

### 1. Aggregation & Statistics

#### Counting by Category
```python
success_count = 0
failure_count = 0

for log in parsed_logs:
    status = log['status']
    if 200 <= status < 300:
        success_count += 1
    else:
        failure_count += 1

success_rate = round((success_count / (success_count + failure_count)) * 100, 2)
```

#### Running Totals (for averages)
```python
total_bytes = 0
total_latency = 0
request_count = 0

for log in logs:
    total_bytes += log['bytes']
    if 200 <= log['status'] < 300:
        total_latency += log['latency']
        request_count += 1

avg_bytes = round(total_bytes / len(logs), 2)
avg_latency = round(total_latency / request_count, 2) if request_count > 0 else 0
```

**Best practice**: Always check for division by zero

#### Collecting for Percentiles
```python
import numpy as np

checkout_latencies = []

for log in logs:
    if log['endpoint'] == "/api/checkout":
        checkout_latencies.append(log['latency'])

if len(checkout_latencies) > 0:
    p95 = round(np.percentile(checkout_latencies, 95), 2)
    p99 = round(np.percentile(checkout_latencies, 99), 2)
    print(f"P95: {p95}, P99: {p99}")
else:
    print("No data for percentile calculation")
```

**Why collect first**: Percentiles require sorted data, easier to collect then calculate

### 2. Sorting & Ranking

#### Top N Pattern
```python
# Method 1: Sort items by count
endpoint_counts = defaultdict(int)
for log in logs:
    endpoint_counts[log['endpoint']] += 1

# Sort by value (count), descending
sorted_endpoints = sorted(endpoint_counts.items(), key=lambda x: x[1], reverse=True)

# Get top 3
for endpoint, count in sorted_endpoints[:3]:
    print(f"{endpoint}: {count}")
```

```python
# Method 2: Using Counter
from collections import Counter

endpoints = [log['endpoint'] for log in logs]
endpoint_counts = Counter(endpoints)

for endpoint, count in endpoint_counts.most_common(3):
    print(f"{endpoint}: {count}")
```

**Key insight**: `sorted()` with `key=lambda` is versatile for any sorting need

#### Finding Extremes
```python
# Find maximum by attribute
slowest_request = max(parsed_logs, key=lambda x: x['latency'])
print(f"Slowest: {slowest_request}")

# Find minimum
fastest_request = min(parsed_logs, key=lambda x: x['latency'])

# Multiple criteria (e.g., slowest error)
slowest_error = max(
    [log for log in logs if log['status'] >= 400],
    key=lambda x: x['latency'],
    default=None
)
```

**Best practice**: Use `default=None` with `max()`/`min()` on filtered lists to avoid errors

### 3. Filtering & Grouping

#### Multi-condition Filtering
```python
# Find pods with warnings in default namespace
pods_with_warnings = set()

for event in events:
    obj = event.get("involvedObject", {})
    kind = obj.get("kind")
    namespace = obj.get("namespace")
    event_type = event.get("type")

    if kind == "Pod" and event_type == "Warning" and namespace == "default":
        pod_name = f"{namespace}/{obj.get('name')}"
        pods_with_warnings.add(pod_name)
```

**Pattern**: Chain conditions with `and`, use early `continue` for readability

#### Grouping by Key
```python
# Group events by pod
pod_events = defaultdict(list)

for event in events:
    pod_name = f"{event['namespace']}/{event['name']}"
    pod_events[pod_name].append(event)

# Process grouped data
for pod_name, events in pod_events.items():
    if len(events) > 10:
        print(f"{pod_name} has many events: {len(events)}")
```

#### Nested Grouping (Dictionary of Dictionaries)
```python
# Track first "Scheduled" and "Killing" per pod
pod_timestamps = {}

for event in events:
    pod_name = event['pod']

    # Initialize pod entry if not exists
    if pod_name not in pod_timestamps:
        pod_timestamps[pod_name] = {"Scheduled": None, "Killing": None}

    # Record first occurrence only
    reason = event['reason']
    if reason == "Scheduled" and pod_timestamps[pod_name]["Scheduled"] is None:
        pod_timestamps[pod_name]["Scheduled"] = event['timestamp']
    if reason == "Killing" and pod_timestamps[pod_name]["Killing"] is None:
        pod_timestamps[pod_name]["Killing"] = event['timestamp']
```

**Alternative with setdefault**:
```python
pod_events = {}
for event in events:
    pod_name = event['pod']
    pod_events.setdefault(pod_name, {"Scheduled": None, "Killing": None})

    if event['reason'] == "Scheduled" and pod_events[pod_name]["Scheduled"] is None:
        pod_events[pod_name]["Scheduled"] = event['timestamp']
```

### 4. Two-Pass Processing Pattern

**When to use**: Need to process data, then fix/correct it

**Example**: Find duplicate UIDs and reassign
```python
# Pass 1: Identify duplicates and collect all UIDs
dup_uids = {}
uid_list = set()

with open("passwd.txt", "r") as f:
    for line in f:
        if not line.strip() or line.startswith("#"):
            continue
        data = line.strip().split(":")
        user = data[0]
        uid = data[2]

        if uid in dup_uids:
            dup_uids[uid].append(user)
        else:
            dup_uids[uid] = [user]

        uid_list.add(int(uid))

# Identify which users need reassignment (all but first)
movers_list = []
for uid, users in dup_uids.items():
    if len(users) > 1:
        print(f"Duplicate UID: {uid} | {users}")
        movers_list.extend(users[1:])  # Keep first, move rest

# Find available UIDs
new_uid = 1001
new_available_uids = []
while len(new_available_uids) < len(movers_list):
    if new_uid not in uid_list:
        new_available_uids.append(new_uid)
    new_uid += 1

# Create reassignment mapping
assignments = {user: uid for user, uid in zip(movers_list, new_available_uids)}

# Pass 2: Rewrite file with corrections
corrected_lines = []
with open("passwd.txt", "r") as f:
    for line in f:
        if not line.strip() or line.startswith("#"):
            corrected_lines.append(line)
            continue

        data = line.strip().split(":")
        user = data[0]

        if user in assignments:
            data[2] = str(assignments[user])

        corrected_lines.append(":".join(data) + "\n")

# Write back
with open("passwd.txt", "w") as f:
    f.writelines(corrected_lines)
```

**Key pattern**:
1. First pass: Analyze and identify what needs fixing
2. Build data structures for corrections
3. Second pass: Apply corrections

## Time & Date Handling

### 1. Parsing ISO Format Timestamps

```python
from datetime import datetime, timedelta

# Parse ISO format (most common in logs)
timestamp_str = "2025-01-15T10:23:45+00:00"
dt_object = datetime.fromisoformat(timestamp_str)
```

**Common timestamp formats**:
- ISO 8601: `2025-01-15T10:23:45+00:00` → `datetime.fromisoformat()`
- Custom format: `15/Jan/2025:10:23:45 +0000` → `datetime.strptime(ts, "%d/%b/%Y:%H:%M:%S %z")`

### 2. Calculating Durations

```python
# Duration between two timestamps
start_time = datetime.fromisoformat(event1['timestamp'])
end_time = datetime.fromisoformat(event2['timestamp'])

duration = end_time - start_time  # Returns timedelta object
print(duration)  # e.g., "0:05:23.451234"
```

### 3. Averaging Time Durations

```python
from datetime import timedelta

total_lifecycle = timedelta(0)
pod_count = 0

for pod_name, events in pod_events.items():
    if "Scheduled" in events and "Killing" in events:
        scheduled_time = datetime.fromisoformat(events["Scheduled"])
        killing_time = datetime.fromisoformat(events["Killing"])

        lifecycle = killing_time - scheduled_time
        total_lifecycle += lifecycle
        pod_count += 1

if pod_count > 0:
    average_lifecycle = total_lifecycle / pod_count
    print(f"Average pod lifecycle: {average_lifecycle}")
```

**Key insight**:
- `timedelta` objects can be added together
- Division by integer gives average `timedelta`

### 4. Sorting by Timestamp (Pre-processing)

**When to use**: Logs are out of order, need chronological processing

```python
# Read all logs into memory first
session_logs = []
with open("session.json", "r") as f:
    for line in f:
        if line.strip():
            log = json.loads(line)
            session_logs.append(log)

# Sort by timestamp
sorted_sessions = sorted(
    session_logs,
    key=lambda x: datetime.fromisoformat(x["timestamp"])
)

# Now process in chronological order
for session in sorted_sessions:
    # Process sessions sequentially
    pass
```

**Trade-off**: Requires loading all data into memory, but ensures correctness

## Common Pitfalls & Solutions

### 1. Division by Zero

**Problem**: Calculating averages when no data exists
```python
# BAD
average = total / count  # Crashes if count == 0

# GOOD
if count > 0:
    average = total / count
else:
    print("No data available")
    average = 0
```

### 2. Skipping Empty Lines & Comments

**Problem**: Parsing errors on blank lines or commented lines

```python
# GOOD pattern
with open("file.txt", "r") as f:
    for line in f:
        # Always strip and check
        cleaned_line = line.strip()
        if not cleaned_line or cleaned_line.startswith("#"):
            continue

        # Now safe to parse
        data = cleaned_line.split(":")
```

**Key insight**: Strip BEFORE checking emptiness (whitespace-only lines)

### 3. Handling Missing JSON Fields

**Problem**: KeyError when accessing nested JSON

```python
# BAD
kind = event["involvedObject"]["kind"]  # Crashes if key missing

# GOOD
obj = event.get("involvedObject", {})
kind = obj.get("kind")

# Check for None explicitly if needed
if kind is not None:
    # Process
    pass
```

### 4. String Index Errors

**Problem**: `find()` returns -1 if not found, causing slice errors

```python
# BAD
start = line.find('[')
end = line.find(']')
timestamp = line[start+1:end]  # Crashes if '[' or ']' not found

# GOOD
try:
    start = line.index('[')
    end = line.index(']')
    timestamp = line[start+1:end]
except ValueError:
    # Handle lines without brackets
    continue
```

**Difference**:
- `find()` returns -1 if not found (still usable but be careful)
- `index()` raises `ValueError` if not found (clearer error handling)

### 5. Modifying Lists While Iterating

**Problem**: Changing a list while looping over it

```python
# BAD
for item in my_list:
    if condition:
        my_list.remove(item)  # Can skip items or crash

# GOOD - Create new list
filtered_list = [item for item in my_list if not condition]

# GOOD - Iterate over copy
for item in my_list[:]:
    if condition:
        my_list.remove(item)
```

### 6. Case Sensitivity in Matching

**Problem**: Missing matches due to case differences

```python
# For case-insensitive matching
word = word.lower()
text = text.lower()

# When parsing log levels
level = match.upper()  # Normalize to uppercase
```

### 7. Punctuation in Text Analysis

**Problem**: Words with punctuation counted separately ("hello," vs "hello")

```python
# Method 1: Using string.punctuation
import string

punctuation = string.punctuation
for punc in punctuation:
    text = text.replace(punc, " ")
words = text.lower().split()

# Method 2: Using regex
import re
words = re.findall(r'\b\w+\b', text.lower())
```

## Quick Decision Guide

### "Which parsing method should I use?"

```
Is the format simple and consistent with clear delimiters?
└─ YES → String manipulation (split, find, slice)
└─ NO → Does it need validation or handle variations?
    └─ YES → Regular expressions
    └─ NO → Is it JSON?
        └─ YES → json.loads()
        └─ NO → Is it colon/comma separated?
            └─ YES → split(":")
```

### "Which counting method should I use?"

```
Just counting one thing?
└─ YES → dict with .get(key, 0) + 1
└─ NO → Multiple counters needed?
    └─ YES → defaultdict(int)
    └─ NO → Need most_common() or arithmetic?
        └─ YES → Counter
```

### "How do I get top N items?"

```
Already using Counter?
└─ YES → Use .most_common(N)
└─ NO → Use sorted(dict.items(), key=lambda x: x[1], reverse=True)[:N]
```

### "Should I process line-by-line or load all into memory?"

```
Do I need to sort by timestamp or reference later entries?
└─ YES → Load all into memory (list), then sort/process
└─ NO → Can I calculate on single pass?
    └─ YES → Process line-by-line (memory efficient)
    └─ NO → Need two passes?
        └─ YES → Load into memory or read file twice
```

### "When should I use sets?"

```
Do I need to:
- Track unique items only? → YES → Use set
- Check if item already seen? → YES → Use set (O(1) lookup)
- Count occurrences? → NO → Use dict/Counter instead
```

## Performance Tips

1. **Line-by-line processing** is more memory-efficient than loading entire file
2. **Compile regex patterns** outside loops: `pattern = re.compile(r'...')`
3. **Use sets for membership testing** instead of lists (O(1) vs O(n))
4. **Avoid repeated .get() on same dict** - cache result: `obj = event.get("involvedObject", {})`
5. **List comprehensions** are faster than for-loops with append
6. **defaultdict/Counter** are faster than manual dict initialization

## Common Imports Cheatsheet

```python
import json                          # JSON parsing
import re                            # Regular expressions
import numpy as np                   # Percentile calculations
from datetime import datetime, timedelta  # Time handling
from collections import defaultdict, Counter  # Advanced dicts
import string                        # string.punctuation
import pprint                        # Pretty printing (debugging)
```

## Debugging Tips

```python
# Pretty print nested structures
import pprint
pprint.pprint(data)

# Print formatted JSON
print(json.dumps(event, indent=4))

# Check what regex matched
match = re.match(pattern, line)
if match:
    print(match.groupdict())
```
