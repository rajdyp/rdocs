---
title: Cookbook & Decision Trees
linkTitle: Cookbook
type: docs
weight: 2
prev: /python/log-analysis/reference-guide
next: /python/log-analysis/quick-reference
---

A practical cookbook with decision trees to help you quickly choose the right approach for log analysis tasks.

## Decision Trees

### How Should I Parse This Log File?

```
START: What format is the log?
│
├─ JSON (one object per line)
│  └─ Use: json.loads() with .get() for safety
│     Example: Kubernetes events, structured app logs
│     → See Recipe: JSON-01
│
├─ Standard web server logs (Apache/Nginx)
│  ├─ Simple parsing needed?
│  │  └─ Use: String split() and find()
│  │     → See Recipe: PARSE-01
│  └─ Need validation or handle variations?
│     └─ Use: Regular expressions with named groups
│        → See Recipe: PARSE-02
│
├─ Delimited format (CSV, /etc/passwd, etc.)
│  └─ Use: split(":") or split(",")
│     → See Recipe: PARSE-03
│
└─ Unstructured text with patterns
   └─ Use: Regular expressions
      → See Recipe: PARSE-04
```

### How Should I Count Things?

```
START: What are you counting?
│
├─ Single counter (one thing)
│  └─ Use: dict with .get(key, 0) + 1
│     → See Recipe: COUNT-01
│
├─ Multiple related counters
│  └─ Use: defaultdict(int)
│     → See Recipe: COUNT-02
│
├─ Need top N most common items?
│  └─ Use: Counter with .most_common(N)
│     → See Recipe: COUNT-03
│
├─ Just tracking unique items (no counts)?
│  └─ Use: set
│     → See Recipe: COUNT-04
│
└─ Counting + arithmetic operations?
   └─ Use: Counter (supports +, -, &, |)
      → See Recipe: COUNT-05
```

### How Should I Filter & Group Data?

```
START: What's your goal?
│
├─ Simple filter (keep items matching condition)
│  ├─ One-liner possible?
│  │  └─ Use: List comprehension
│  │     → See Recipe: FILTER-01
│  └─ Complex multi-line logic?
│     └─ Use: for loop with if/continue
│        → See Recipe: FILTER-02
│
├─ Group items by category
│  └─ Use: defaultdict(list)
│     → See Recipe: GROUP-01
│
├─ Track first/last occurrence per entity
│  └─ Use: dict with membership check
│     → See Recipe: GROUP-02
│
└─ Complex nested grouping
   └─ Use: dict of dicts or defaultdict with custom factory
      → See Recipe: GROUP-03
```

### How Should I Calculate Statistics?

```
START: What statistic do you need?
│
├─ Average (mean)
│  ├─ Simple average of all values?
│  │  └─ Use: sum(values) / len(values)
│  │     → See Recipe: STATS-01
│  └─ Average of filtered subset?
│     └─ Use: Running total with counter
│        → See Recipe: STATS-02
│
├─ Percentiles (P50, P95, P99)
│  └─ Use: Collect in list → numpy.percentile()
│     → See Recipe: STATS-03
│
├─ Min/Max
│  ├─ Simple min/max of list?
│  │  └─ Use: min()/max() built-in
│  │     → See Recipe: STATS-04
│  └─ Find item with min/max attribute?
│     └─ Use: min()/max() with key=lambda
│        → See Recipe: STATS-05
│
└─ Success rate (percentage)
   └─ Use: Count successes and failures, calculate ratio
      → See Recipe: STATS-06
```

### Should I Process Line-by-Line or Load All?

```
START: Analyzing memory vs. requirements
│
├─ Need to sort by timestamp?
│  └─ Load all → sort → process
│     Trade-off: Uses memory, ensures correctness
│     → See Recipe: PROCESS-01
│
├─ Need to reference future/past entries?
│  └─ Load all into list/dict
│     → See Recipe: PROCESS-02
│
├─ Single-pass aggregation possible?
│  ├─ File is huge (GB+)?
│  │  └─ Process line-by-line
│  │     Trade-off: Memory efficient
│  │     → See Recipe: PROCESS-03
│  └─ File is reasonable (<100MB)?
│     └─ Either works, choose based on clarity
│
└─ Need two passes (analyze then fix)?
   └─ Load all or read file twice
      → See Recipe: PROCESS-04
```

## Parsing Recipes

### PARSE-01: Parse Web Logs with String Methods

**When to use**: Simple, consistent Apache/Nginx logs, performance matters

**Pros**: Fast, no dependencies
**Cons**: Fragile with variations

```python
with open('access.log', 'r') as f:
    for line in f:
        data = line.strip().split()
        ip = data[0]
        status = int(data[-3])
        bytes_size = int(data[-2])
        latency = float(data[-1])

        # Extract bracketed timestamp
        start = line.find('[')
        end = line.find(']')
        timestamp = line[start + 1:end]

        # Extract quoted request
        req_start = line.find('"')
        req_end = line.find('"', req_start + 1)
        request = line[req_start + 1:req_end].split()
        method = request[0]
        endpoint = request[1]
```

### PARSE-02: Parse Web Logs with Regex (Robust)

**When to use**: Need validation, logs have variations, want self-documenting code

**Pros**: Validates format, handles variations, named groups are clear
**Cons**: Slower than string methods

```python
import re

LOG_PATTERN = r'(?P<IP>\d+\.\d+\.\d+\.\d+)\s-\s-\s\[(?P<TIMESTAMP>.*?)\]\s"(?P<REQUEST>.*?)"\s(?P<STATUS>\d{3})\s(?P<BYTES>\d+)\s(?P<LATENCY>\d+\.\d+)'

with open('access.log', 'r') as f:
    for line in f:
        match = re.fullmatch(LOG_PATTERN, line.strip())
        if match:
            log_data = match.groupdict()
            ip = log_data['IP']
            status = int(log_data['STATUS'])
            # ... process
        else:
            print(f"Skipping invalid line: {line.strip()}")
```

**Decision**: Use PARSE-01 if logs are guaranteed consistent, PARSE-02 if they might vary

### PARSE-03: Parse Delimited Files

**When to use**: /etc/passwd, CSV-like configs, colon/comma separated values

**Pros**: Simple, fast
**Cons**: No validation

```python
# Format: username:password:UID:GID:GECOS:home_dir:shell

with open("passwd.txt", "r") as f:
    for line in f:
        # Always clean and skip empty/comments
        cleaned = line.strip()
        if not cleaned or cleaned.startswith("#"):
            continue

        fields = cleaned.split(":")
        username = fields[0]
        uid = fields[2]
        gid = fields[3]
```

**Key pattern**: Always strip → check empty → check comments → parse

### PARSE-04: Extract Log Levels with Regex

**When to use**: Logs with [LEVEL] Message format

**Approach A**: Using index (with error handling)
```python
valid_levels = {'[INFO]', '[WARN]', '[ERROR]', '[DEBUG]'}

with open("app.log", "r") as f:
    for line in f:
        try:
            start = line.index('[')
            end = line.index(']')
            level = line[start:end+1]

            if level in valid_levels:
                # Process this log level
                pass
        except ValueError:
            # No brackets found, skip
            continue
```

**Approach B**: Using regex (more flexible)
```python
import re
from collections import Counter

pattern = re.compile(r'\[(\w+)\]')
level_counts = Counter()

with open("app.log", "r") as f:
    for line in f:
        matches = re.findall(pattern, line)
        for match in matches:
            level = match.upper()
            level_counts[level] += 1
```

**Decision**: Use A for simple extraction, B for multiple levels per line or complex patterns

### PARSE-05: Parse JSON Events (Line-delimited)

**When to use**: Kubernetes events, structured application logs, each line is valid JSON

**Pros**: Handles nested data, type-safe
**Cons**: Requires valid JSON

```python
import json

with open("events.json", "r") as f:
    for line in f:
        event = json.loads(line)

        # Safe nested access with .get()
        event_type = event.get("type", "Unknown")
        obj = event.get("involvedObject", {})
        kind = obj.get("kind")
        name = obj.get("name")

        if kind == "Pod" and event_type == "Warning":
            # Process pod warnings
            pass
```

**Key pattern**: Use `.get()` with defaults at every level to avoid KeyError

## Counting Recipes

### COUNT-01: Count with dict.get()

**When to use**: Single counter, learning basics, code clarity

**Pros**: Explicit, Pythonic
**Cons**: Repetitive for multiple counters

```python
ip_counts = {}

for log in logs:
    ip = log['ip']
    ip_counts[ip] = ip_counts.get(ip, 0) + 1

# Print results
for ip, count in ip_counts.items():
    print(f"{ip}: {count}")
```

### COUNT-02: Count with defaultdict(int)

**When to use**: Multiple related counters, cleaner code

**Pros**: No .get() needed, auto-initializes
**Cons**: Slightly less explicit

```python
from collections import defaultdict

ip_counts = defaultdict(int)
endpoint_counts = defaultdict(int)

for log in logs:
    ip_counts[log['ip']] += 1
    endpoint_counts[log['endpoint']] += 1
```

**Side-by-side comparison**:
```python
# dict.get()                    # defaultdict(int)
counts = {}                     counts = defaultdict(int)
counts[key] = counts.get(key, 0) + 1    counts[key] += 1
```

**Decision**: Use COUNT-01 for single counter, COUNT-02 for multiple counters

### COUNT-03: Count and Get Top N with Counter

**When to use**: Need top N, combining counts, or multiple count operations

**Pros**: Built-in .most_common(), supports arithmetic
**Cons**: Overkill for simple counting

```python
from collections import Counter

# Method 1: Direct initialization
endpoints = [log['endpoint'] for log in logs]
endpoint_counts = Counter(endpoints)

# Method 2: Incremental
endpoint_counts = Counter()
for log in logs:
    endpoint_counts[log['endpoint']] += 1

# Get top 3
for endpoint, count in endpoint_counts.most_common(3):
    print(f"{endpoint}: {count}")
```

**Comparison: Getting Top N**
```python
# Using dict + sorted                   # Using Counter
counts = defaultdict(int)               counts = Counter()
for item in items:                      for item in items:
    counts[item] += 1                       counts[item] += 1
sorted_items = sorted(counts.items(),
                      key=lambda x: x[1],
                      reverse=True)
top_3 = sorted_items[:3]                top_3 = counts.most_common(3)
```

**Decision**: Use Counter when you need .most_common() or arithmetic operations

### COUNT-04: Track Unique Items with set

**When to use**: Only need uniqueness, no counts

**Pros**: Automatic deduplication, O(1) lookup
**Cons**: No count information

```python
unique_ips = set()
pods_with_warnings = set()

for log in logs:
    unique_ips.add(log['ip'])

    if log['type'] == "Warning":
        pods_with_warnings.add(log['pod_name'])

print(f"Total unique IPs: {len(unique_ips)}")
print(f"Pods with warnings: {len(pods_with_warnings)}")
```

**When NOT to use**: If you need counts later (use Counter instead)

### COUNT-05: Combine Counts with Counter Arithmetic

**When to use**: Merging counts from multiple sources, set-like operations on counts

**Pros**: Clean syntax for combining
**Cons**: Specific to Counter

```python
from collections import Counter

# Count events from two log files
file1_counts = Counter()
file2_counts = Counter()

with open("log1.txt") as f:
    for line in f:
        file1_counts[parse_level(line)] += 1

with open("log2.txt") as f:
    for line in f:
        file2_counts[parse_level(line)] += 1

# Combine
total_counts = file1_counts + file2_counts

# Find common elements
common = file1_counts & file2_counts

# Difference
unique_to_file1 = file1_counts - file2_counts
```

## Filtering & Grouping Recipes

### FILTER-01: Filter with List Comprehension

**When to use**: Simple one-line condition, creating new list

**Pros**: Concise, Pythonic, fast
**Cons**: Loads all into memory, not suitable for complex logic

```python
# Filter logs with status >= 400
error_logs = [log for log in logs if log['status'] >= 400]

# Filter and transform
error_ips = [log['ip'] for log in logs if log['status'] >= 400]

# Multiple conditions
critical_errors = [
    log for log in logs
    if log['status'] >= 500 and log['endpoint'] == '/api/checkout'
]
```

### FILTER-02: Filter with Complex Conditions

**When to use**: Multi-line logic, side effects needed, streaming

**Pros**: Handles complex logic, can process without loading all
**Cons**: More verbose

```python
pods_with_warnings = set()

for event in events:
    obj = event.get("involvedObject", {})
    kind = obj.get("kind")
    namespace = obj.get("namespace")
    event_type = event.get("type")

    # Complex multi-condition check
    if kind == "Pod" and event_type == "Warning" and namespace == "default":
        pod_name = f"{namespace}/{obj.get('name')}"
        pods_with_warnings.add(pod_name)
```

**Decision**: Use FILTER-01 for simple conditions, FILTER-02 for complex logic

### GROUP-01: Group by Key with defaultdict(list)

**When to use**: Collect all items belonging to each category

**Pros**: Clean, auto-initializes empty lists
**Cons**: None

```python
from collections import defaultdict

# Group logs by IP
logs_by_ip = defaultdict(list)
for log in logs:
    logs_by_ip[log['ip']].append(log)

# Group events by pod
events_by_pod = defaultdict(list)
for event in events:
    pod_name = f"{event['namespace']}/{event['name']}"
    events_by_pod[pod_name].append(event)

# Process groups
for pod_name, pod_events in events_by_pod.items():
    if len(pod_events) > 10:
        print(f"{pod_name} has {len(pod_events)} events")
```

**Without defaultdict (for comparison)**:
```python
logs_by_ip = {}
for log in logs:
    ip = log['ip']
    if ip not in logs_by_ip:
        logs_by_ip[ip] = []
    logs_by_ip[ip].append(log)
```

### GROUP-02: Track First Occurrence Only

**When to use**: Session tracking, first event timestamp, ignore duplicates

**Pros**: Simple membership check
**Cons**: Can't track multiple occurrences

```python
# Track first login per user
active_sessions = {}

for event in events:
    user_id = event['user_id']
    action = event['action']

    # Record first login only
    if action == "login" and user_id not in active_sessions:
        active_sessions[user_id] = event['timestamp']

    # Process logout
    if action == "logout" and user_id in active_sessions:
        login_time = active_sessions[user_id]
        duration = event['timestamp'] - login_time
        # Process duration...
        del active_sessions[user_id]  # Clean up
```

**Key pattern**: `if key not in dict` ensures first-only behavior

### GROUP-03: Nested Grouping (dict of dicts)

**When to use**: Track multiple attributes per entity (e.g., first "Scheduled" and "Killing" per pod)

**Pros**: Flexible structure
**Cons**: More complex initialization

```python
# Track first Scheduled and Killing timestamp per pod
pod_timestamps = {}

for event in events:
    pod_name = event['pod']
    reason = event['reason']

    # Initialize pod entry if needed
    if pod_name not in pod_timestamps:
        pod_timestamps[pod_name] = {"Scheduled": None, "Killing": None}

    # Record first occurrence only
    if reason == "Scheduled" and pod_timestamps[pod_name]["Scheduled"] is None:
        pod_timestamps[pod_name]["Scheduled"] = event['timestamp']
    if reason == "Killing" and pod_timestamps[pod_name]["Killing"] is None:
        pod_timestamps[pod_name]["Killing"] = event['timestamp']

# Process results
for pod_name, timestamps in pod_timestamps.items():
    if timestamps["Scheduled"] and timestamps["Killing"]:
        # Both events exist, calculate lifecycle
        pass
```

**Alternative with setdefault**:
```python
pod_timestamps.setdefault(pod_name, {"Scheduled": None, "Killing": None})
```

## Aggregation Recipes

### STATS-01: Calculate Simple Average

**When to use**: Average all values in a list

**Pros**: Simple
**Cons**: Requires all data in memory

```python
latencies = [log['latency'] for log in logs]
avg_latency = sum(latencies) / len(latencies) if latencies else 0
```

### STATS-02: Average of Filtered Subset

**When to use**: Average of items matching a condition (e.g., average latency of successful requests)

**Pros**: Single-pass, memory efficient
**Cons**: Need to track count separately

```python
total_latency = 0
success_count = 0

for log in logs:
    if 200 <= log['status'] < 300:
        total_latency += log['latency']
        success_count += 1

avg_latency = round(total_latency / success_count, 2) if success_count > 0 else 0
```

**Always check for division by zero!**

### STATS-03: Calculate Percentiles

**When to use**: P50, P95, P99 latency for SRE metrics

**Pros**: Accurate percentiles
**Cons**: Requires numpy, must collect all values

```python
import numpy as np

checkout_latencies = []

for log in logs:
    if log['endpoint'] == "/api/checkout":
        checkout_latencies.append(log['latency'])

if checkout_latencies:
    p50 = round(np.percentile(checkout_latencies, 50), 2)
    p95 = round(np.percentile(checkout_latencies, 95), 2)
    p99 = round(np.percentile(checkout_latencies, 99), 2)
    print(f"P50: {p50}, P95: {p95}, P99: {p99}")
else:
    print("No data for percentiles")
```

**Pattern**: Collect values in list → calculate percentiles

### STATS-04: Find Min/Max Values

**When to use**: Simple min/max of a list

**Pros**: Built-in, simple
**Cons**: None

```python
latencies = [log['latency'] for log in logs]

fastest = min(latencies)
slowest = max(latencies)
```

### STATS-05: Find Item with Extreme Attribute

**When to use**: Find the log entry with highest/lowest value

**Pros**: Returns full object, not just value
**Cons**: Raises error on empty list (use default)

```python
# Find slowest request
slowest_request = max(logs, key=lambda x: x['latency'])
print(f"Slowest: {slowest_request}")

# Find fastest request
fastest_request = min(logs, key=lambda x: x['latency'])

# With filtering (find slowest error)
error_logs = [log for log in logs if log['status'] >= 400]
slowest_error = max(error_logs, key=lambda x: x['latency'], default=None)

if slowest_error:
    print(f"Slowest error: {slowest_error}")
```

**Important**: Use `default=None` when working with filtered lists to avoid ValueError

### STATS-06: Calculate Success Rate

**When to use**: Calculate percentage (e.g., 2xx vs 4xx/5xx)

**Pros**: Simple ratio calculation
**Cons**: Watch for division by zero

```python
success_count = 0
failure_count = 0

for log in logs:
    if 200 <= log['status'] < 300:
        success_count += 1
    else:
        failure_count += 1

total = success_count + failure_count
success_rate = round((success_count / total) * 100, 2) if total > 0 else 0

print(f"Success rate: {success_rate}%")
```

## Time Analysis Recipes

### TIME-01: Parse ISO Timestamps

**When to use**: ISO 8601 format (most modern logs)

**Pros**: Built-in Python support
**Cons**: None

```python
from datetime import datetime

# Parse ISO format
timestamp_str = "2025-01-15T10:23:45+00:00"
dt_object = datetime.fromisoformat(timestamp_str)
```

**For custom formats**:
```python
# Apache/Nginx format: 15/Jan/2025:10:23:45 +0000
timestamp_str = "15/Jan/2025:10:23:45 +0000"
dt_object = datetime.strptime(timestamp_str, "%d/%b/%Y:%H:%M:%S %z")
```

### TIME-02: Calculate Duration Between Events

**When to use**: Time between two timestamps

**Pros**: Returns timedelta (supports arithmetic)
**Cons**: None

```python
from datetime import datetime

start = datetime.fromisoformat(event1['timestamp'])
end = datetime.fromisoformat(event2['timestamp'])

duration = end - start  # timedelta object
print(f"Duration: {duration}")  # e.g., "0:05:23.451234"

# Get seconds
seconds = duration.total_seconds()
```

### TIME-03: Average Session/Lifecycle Duration

**When to use**: Average time between login/logout, pod lifecycle, etc.

**Pros**: Accurate average of time periods
**Cons**: Must track paired events

```python
from datetime import datetime, timedelta

total_duration = timedelta(0)
session_count = 0

for pod_name, events in pod_events.items():
    if "Scheduled" in events and "Killing" in events:
        scheduled = datetime.fromisoformat(events["Scheduled"])
        killing = datetime.fromisoformat(events["Killing"])

        duration = killing - scheduled
        total_duration += duration
        session_count += 1

if session_count > 0:
    avg_duration = total_duration / session_count
    print(f"Average lifecycle: {avg_duration}")
```

**Key insight**: timedelta objects can be added and divided

### TIME-04: Sort Logs by Timestamp

**When to use**: Logs are out of order, need chronological processing

**Pros**: Ensures correct order
**Cons**: Requires loading all into memory

```python
from datetime import datetime

# Read all logs
session_logs = []
with open("sessions.json", "r") as f:
    for line in f:
        if line.strip():
            log = json.loads(line)
            session_logs.append(log)

# Sort by timestamp
sorted_logs = sorted(
    session_logs,
    key=lambda x: datetime.fromisoformat(x["timestamp"])
)

# Process in chronological order
for log in sorted_logs:
    # Process...
    pass
```

## Processing Recipes

### PROCESS-01: Sort Then Process (Out-of-Order Logs)

**When to use**: Session tracking, time-based analysis, logs not chronological

**Trade-off**: Uses memory but ensures correctness

```python
import json
from datetime import datetime

# Load all
logs = []
with open("events.json") as f:
    for line in f:
        logs.append(json.loads(line))

# Sort
logs.sort(key=lambda x: datetime.fromisoformat(x["timestamp"]))

# Process in order
active_sessions = {}
for log in logs:
    # Now guaranteed chronological
    pass
```

### PROCESS-02: Load All for Random Access

**When to use**: Need to reference entries by index, build lookup tables

**Trade-off**: Memory usage vs. flexibility

```python
# Load all logs
all_logs = []
with open("access.log") as f:
    for line in f:
        all_logs.append(parse_log(line))

# Now can do random access
first_log = all_logs[0]
last_log = all_logs[-1]

# Or build index
logs_by_id = {log['id']: log for log in all_logs}
```

### PROCESS-03: Stream Process (Memory Efficient)

**When to use**: Huge files, single-pass aggregation possible

**Trade-off**: Memory efficient but can't reference other lines

```python
# Process line by line (never loads full file)
ip_counts = defaultdict(int)
total_bytes = 0

with open("huge_access.log") as f:
    for line in f:
        log = parse_log(line)
        ip_counts[log['ip']] += 1
        total_bytes += log['bytes']
        # Log is discarded after this iteration

print(f"Average bytes: {total_bytes / sum(ip_counts.values())}")
```

### PROCESS-04: Two-Pass Processing (Analyze & Fix)

**When to use**: Need to analyze data, then modify based on analysis

**Trade-off**: Reads file twice but clearer logic

```python
# Pass 1: Analyze
dup_uids = {}
all_uids = set()

with open("passwd.txt") as f:
    for line in f:
        if not line.strip() or line.startswith("#"):
            continue
        fields = line.split(":")
        uid = fields[2]

        dup_uids.setdefault(uid, []).append(fields[0])
        all_uids.add(int(uid))

# Determine fixes
movers = []
for uid, users in dup_uids.items():
    if len(users) > 1:
        movers.extend(users[1:])  # All but first

# Find available UIDs
new_uid = 1001
available = []
while len(available) < len(movers):
    if new_uid not in all_uids:
        available.append(new_uid)
    new_uid += 1

assignments = dict(zip(movers, available))

# Pass 2: Apply fixes
corrected = []
with open("passwd.txt") as f:
    for line in f:
        if not line.strip() or line.startswith("#"):
            corrected.append(line)
            continue

        fields = line.strip().split(":")
        if fields[0] in assignments:
            fields[2] = str(assignments[fields[0]])
        corrected.append(":".join(fields) + "\n")

# Write back
with open("passwd.txt", "w") as f:
    f.writelines(corrected)
```

## Common Tasks Quick Reference

### Task: Count requests per IP

**Best approach**: defaultdict(int)
```python
from collections import defaultdict
ip_counts = defaultdict(int)
for log in logs:
    ip_counts[log['ip']] += 1
```

### Task: Get top 3 most requested endpoints

**Best approach**: Counter.most_common()
```python
from collections import Counter
endpoints = [log['endpoint'] for log in logs]
for endpoint, count in Counter(endpoints).most_common(3):
    print(f"{endpoint}: {count}")
```

### Task: Calculate success rate

**Best approach**: Count successes and failures
```python
success = sum(1 for log in logs if 200 <= log['status'] < 300)
total = len(logs)
rate = round((success / total) * 100, 2) if total > 0 else 0
```

### Task: Find slowest request

**Best approach**: max() with key
```python
slowest = max(logs, key=lambda x: x['latency'])
```

### Task: Calculate P95 latency for specific endpoint

**Best approach**: Collect + numpy.percentile()
```python
import numpy as np
latencies = [log['latency'] for log in logs if log['endpoint'] == '/api/checkout']
p95 = np.percentile(latencies, 95) if latencies else 0
```

### Task: Track unique pod names

**Best approach**: set
```python
unique_pods = {f"{e['namespace']}/{e['name']}" for e in events if e.get('kind') == 'Pod'}
```

### Task: Group events by pod

**Best approach**: defaultdict(list)
```python
from collections import defaultdict
events_by_pod = defaultdict(list)
for event in events:
    events_by_pod[event['pod']].append(event)
```

### Task: Calculate average session duration

**Best approach**: Sort → Track pairs → Average timedeltas
```python
from datetime import datetime, timedelta

sessions = sorted(sessions, key=lambda x: datetime.fromisoformat(x['timestamp']))
active = {}
total = timedelta(0)
count = 0

for s in sessions:
    if s['action'] == 'login':
        active[s['user']] = datetime.fromisoformat(s['timestamp'])
    elif s['action'] == 'logout' and s['user'] in active:
        duration = datetime.fromisoformat(s['timestamp']) - active[s['user']]
        total += duration
        count += 1
        del active[s['user']]

avg = total / count if count > 0 else timedelta(0)
```
