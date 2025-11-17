---
title: Quick Reference
linkTitle: Quick Reference
type: docs
weight: 3
prev: /python/log-analysis/cookbook
next: /python/log-analysis/revision-guide
---

One-page cheat sheet for common log analysis tasks.

## 📋 Common Imports

```python
import json                                    # JSON parsing
import re                                      # Regular expressions
import numpy as np                             # Percentiles
from datetime import datetime, timedelta       # Time handling
from collections import defaultdict, Counter   # Advanced dicts
import string                                  # string.punctuation
```

## 🔍 Parsing Quick Reference

| Task | Code |
|------|------|
| **Parse web log (simple)** | `data = line.strip().split()`<br>`ip, status = data[0], int(data[-3])` |
| **Parse web log (regex)** | `pattern = r'(?P<IP>\d+\.\d+\.\d+\.\d+).*'`<br>`match.groupdict()` |
| **Parse JSON line** | `event = json.loads(line)`<br>`value = event.get("key", default)` |
| **Parse delimited** | `fields = line.strip().split(":")`<br>`username, uid = fields[0], fields[2]` |
| **Extract bracketed** | `start = line.find('[')`<br>`timestamp = line[start+1:line.find(']')]` |
| **Safe nested JSON** | `pod = event.get("obj", {}).get("name", "unknown")` |

## 🔢 Counting Quick Reference

| Task | Best Approach | Code |
|------|---------------|------|
| **Count occurrences** | `dict.get()` | `counts[key] = counts.get(key, 0) + 1` |
| **Multiple counters** | `defaultdict(int)` | `counts = defaultdict(int)`<br>`counts[key] += 1` |
| **Top N items** | `Counter` | `Counter(items).most_common(N)` |
| **Unique items only** | `set` | `unique = set()`<br>`unique.add(item)` |
| **Combine counts** | `Counter` | `total = count1 + count2` |

### Counting Decision Tree
```
Need counts? → Yes → Need top N? → Yes → Use Counter
                   ↓                 ↓
                   No ← Multiple?    No → Use sorted(dict.items(), key=lambda x: x[1])
                   ↓
                   Yes → defaultdict(int)
                   ↓
                   No → dict.get()
```

## 🎯 Filtering & Grouping Quick Reference

| Task | Best Approach | Code |
|------|---------------|------|
| **Simple filter** | List comprehension | `errors = [log for log in logs if log['status'] >= 400]` |
| **Complex filter** | Loop with continue | `if not (cond1 and cond2): continue` |
| **Group by key** | `defaultdict(list)` | `groups[key].append(item)` |
| **First occurrence** | Dict membership | `if key not in dict: dict[key] = value` |
| **Unique with filter** | Set comprehension | `{item for item in items if condition}` |

## 📊 Statistics Quick Reference

| Task | Code |
|------|------|
| **Simple average** | `avg = sum(values) / len(values) if values else 0` |
| **Filtered average** | `total = sum(x for x in values if condition)`<br>`count = sum(1 for x in values if condition)`<br>`avg = total / count if count > 0 else 0` |
| **Percentiles** | `import numpy as np`<br>`p95 = np.percentile(values, 95)` |
| **Min/Max value** | `min(values)`, `max(values)` |
| **Find max item** | `max(items, key=lambda x: x['field'])` |
| **Success rate %** | `rate = (success / total) * 100 if total > 0 else 0` |

## ⏱️ Time & Date Quick Reference

| Task | Code |
|------|------|
| **Parse ISO timestamp** | `dt = datetime.fromisoformat(timestamp_str)` |
| **Parse custom format** | `dt = datetime.strptime(ts, "%d/%b/%Y:%H:%M:%S")` |
| **Duration between** | `duration = end_time - start_time  # timedelta` |
| **Average duration** | `total = timedelta(0)`<br>`total += duration`<br>`avg = total / count` |
| **Sort by timestamp** | `sorted(logs, key=lambda x: datetime.fromisoformat(x['ts']))` |
| **Get seconds from timedelta** | `duration.total_seconds()` |

## 📝 Common Task Recipes

### Task: Count requests per IP
```python
from collections import defaultdict
ip_counts = defaultdict(int)
for log in logs:
    ip_counts[log['ip']] += 1
```

### Task: Get top 3 most requested endpoints
```python
from collections import Counter
endpoints = [log['endpoint'] for log in logs]
for endpoint, count in Counter(endpoints).most_common(3):
    print(f"{endpoint}: {count}")
```

### Task: Calculate success rate (2xx vs errors)
```python
success = sum(1 for log in logs if 200 <= log['status'] < 300)
total = len(logs)
success_rate = round((success / total) * 100, 2) if total > 0 else 0
print(f"Success rate: {success_rate}%")
```

### Task: Average response size
```python
total_bytes = sum(log['bytes'] for log in logs)
avg_bytes = round(total_bytes / len(logs), 2) if logs else 0
```

### Task: Average latency for successful requests only
```python
successes = [log for log in logs if 200 <= log['status'] < 300]
avg_latency = sum(s['latency'] for s in successes) / len(successes) if successes else 0
```

### Task: P95 and P99 latency for specific endpoint
```python
import numpy as np
latencies = [log['latency'] for log in logs if log['endpoint'] == '/api/checkout']
if latencies:
    p95 = round(np.percentile(latencies, 95), 2)
    p99 = round(np.percentile(latencies, 99), 2)
    print(f"P95: {p95}, P99: {p99}")
```

### Task: Find slowest request
```python
slowest = max(logs, key=lambda x: x['latency'])
print(f"Slowest: {slowest}")
```

### Task: Count unique IPs
```python
unique_ips = {log['ip'] for log in logs}
print(f"Unique IPs: {len(unique_ips)}")
```

### Task: Group logs by status code
```python
from collections import defaultdict
by_status = defaultdict(list)
for log in logs:
    by_status[log['status']].append(log)
```

### Task: Track unique pods with warnings
```python
pods_with_warnings = set()
for event in events:
    if event.get('type') == 'Warning' and event.get('kind') == 'Pod':
        pods_with_warnings.add(event['pod_name'])
```

### Task: Parse log levels and count them
```python
from collections import Counter
import re

pattern = re.compile(r'\[(\w+)\]')
levels = Counter()

with open('app.log') as f:
    for line in f:
        matches = re.findall(pattern, line)
        for match in matches:
            levels[match.upper()] += 1
```

### Task: Average session duration (login to logout)
```python
from datetime import datetime, timedelta

# Assuming sorted logs
active_sessions = {}
total_duration = timedelta(0)
session_count = 0

for log in sorted_logs:
    user = log['user_id']
    action = log['action']

    if action == 'login' and user not in active_sessions:
        active_sessions[user] = datetime.fromisoformat(log['timestamp'])

    elif action == 'logout' and user in active_sessions:
        start = active_sessions[user]
        end = datetime.fromisoformat(log['timestamp'])
        total_duration += (end - start)
        session_count += 1
        del active_sessions[user]

avg_duration = total_duration / session_count if session_count > 0 else timedelta(0)
```

### Task: Find duplicate UIDs
```python
from collections import defaultdict

uid_users = defaultdict(list)
with open('passwd.txt') as f:
    for line in f:
        if not line.strip() or line.startswith('#'):
            continue
        fields = line.split(':')
        uid_users[fields[2]].append(fields[0])

# Print duplicates
for uid, users in uid_users.items():
    if len(users) > 1:
        print(f"Duplicate UID {uid}: {users}")
```

### Task: Count normal vs warning events
```python
import json
from collections import Counter

event_types = Counter()
with open('events.json') as f:
    for line in f:
        event = json.loads(line)
        event_types[event.get('type', 'Unknown')] += 1

print(event_types)  # Counter({'Normal': 150, 'Warning': 45, ...})
```

### Task: Word frequency (top 10)
```python
import re
from collections import Counter

with open('text.txt') as f:
    text = f.read().lower()
    words = re.findall(r'\b\w+\b', text)
    word_counts = Counter(words)

for word, count in word_counts.most_common(10):
    print(f"{word}: {count}")
```

## 🚨 Common Pitfalls & Solutions

| Problem | Bad | Good |
|---------|-----|------|
| **Division by zero** | `avg = total / count` | `avg = total / count if count > 0 else 0` |
| **Empty lines** | `data = line.split()` | `cleaned = line.strip()`<br>`if not cleaned: continue` |
| **Missing JSON key** | `event["key"]` | `event.get("key", default)` |
| **Nested JSON** | `event["obj"]["name"]` | `event.get("obj", {}).get("name")` |
| **find() returns -1** | `timestamp = line[start:end]` | `try:`<br>`  start = line.index('[')`<br>`except ValueError: continue` |
| **Case sensitivity** | `if word == "ERROR"` | `if word.upper() == "ERROR"` |
| **Default on max()** | `max(filtered_list)` | `max(filtered_list, default=None)` |

## 💡 Performance Tips

| Tip | Why |
|-----|-----|
| Use `set` for membership | O(1) vs O(n) for list |
| Compile regex outside loop | `pattern = re.compile(r'...')` |
| List comprehension > append loop | Faster and cleaner |
| Process line-by-line for huge files | Memory efficient |
| Cache `.get()` results | `obj = event.get("involvedObject", {})` |
| Use `defaultdict` for grouping | Avoids repeated initialization |

## 🎨 Code Patterns Comparison

### Counting Pattern
```python
# Basic dict                          # defaultdict                    # Counter
counts = {}                           from collections import          from collections import Counter
for item in items:                    defaultdict                      counts = Counter(items)
    counts[item] = counts.get(item,   counts = defaultdict(int)        # Get top 3:
                    0) + 1            for item in items:               counts.most_common(3)
                                          counts[item] += 1
```

### Filtering Pattern
```python
# List comprehension (simple)         # Loop (complex)
results = [x for x in items           results = []
           if x > 10]                 for x in items:
                                          if complex_condition(x):
                                              results.append(x)
```

### Grouping Pattern
```python
# Manual dict                         # defaultdict(list)
groups = {}                           from collections import defaultdict
for item in items:                    groups = defaultdict(list)
    key = item['category']            for item in items:
    if key not in groups:                 groups[item['category']].append(item)
        groups[key] = []
    groups[key].append(item)
```

## 🔧 Essential One-Liners

```python
# Skip empty lines and comments
if not line.strip() or line.startswith('#'): continue

# Safe nested JSON access
pod_name = event.get("involvedObject", {}).get("name", "unknown")

# Check if status is 2xx
if 200 <= status < 300:

# Convert list to Counter and get top 3
Counter(items).most_common(3)

# Filter and transform in one line
error_ips = [log['ip'] for log in logs if log['status'] >= 400]

# Count items matching condition
count = sum(1 for log in logs if condition)

# Group by key using dict comprehension (if keys known)
groups = {key: [x for x in items if x['key'] == key] for key in unique_keys}

# Sort dict by value descending
sorted(my_dict.items(), key=lambda x: x[1], reverse=True)

# Get unique values from nested structure
unique = {event.get('obj', {}).get('name') for event in events}

# Remove punctuation from text
text = ''.join(c if c not in string.punctuation else ' ' for c in text)

# Better: using regex
words = re.findall(r'\b\w+\b', text.lower())
```

## 📖 Decision: Which Approach?

### "Should I use dict, defaultdict, or Counter?"

```
Counting one thing?
    → dict with .get(key, 0) + 1

Multiple counters?
    → defaultdict(int)

Need top N?
    → Counter with .most_common(N)

Need arithmetic (+, -, &, |)?
    → Counter
```

### "Should I use list comprehension or loop?"

```
Simple one-line condition?
    → List comprehension

Complex multi-line logic?
    → Loop with if/continue

Creating new list?
    → List comprehension

Modifying in place or side effects?
    → Loop
```

### "Should I load all or process line-by-line?"

```
Need to sort by timestamp?
    → Load all → sort → process

File is huge (GB+)?
    → Process line-by-line

Need to reference other lines?
    → Load all

Single-pass aggregation?
    → Process line-by-line
```

## 🎯 Quick Syntax Lookup

```python
# Dictionary operations
d.get(key, default)              # Safe access with default
d.setdefault(key, default)       # Get or set default
d.items()                        # Key-value pairs
d.keys()                         # All keys
d.values()                       # All values

# String operations
s.strip()                        # Remove whitespace
s.split(delimiter)               # Split on delimiter
s.find(substring)                # Index of substring (-1 if not found)
s.index(substring)               # Index or ValueError
s.startswith(prefix)             # Boolean check
s.upper() / s.lower()            # Case conversion

# List operations
len(lst)                         # Length
lst.append(item)                 # Add to end
lst.extend(items)                # Add multiple
sorted(lst, key=func)            # Sort by function
sorted(lst, reverse=True)        # Sort descending
max(lst, key=func)               # Max by function
min(lst, key=func)               # Min by function
sum(lst)                         # Sum all values

# Set operations
s.add(item)                      # Add item
len(s)                           # Count unique
item in s                        # Membership (O(1))
s1 & s2                          # Intersection
s1 | s2                          # Union
s1 - s2                          # Difference

# Counter operations
Counter(items)                   # Count from iterable
c.most_common(N)                 # Top N items
c1 + c2                          # Combine counts
c.update(items)                  # Add more items

# defaultdict operations
defaultdict(int)                 # Auto-init to 0
defaultdict(list)                # Auto-init to []
defaultdict(set)                 # Auto-init to set()
```
