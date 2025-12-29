---
title: Standard Library
linkTitle: Standard Library
type: docs
weight: 6
prev: /python/05-oop-fundamentals
next: /python/07-advanced-functions
---

## File Handling

### Mental Model

1. Import required modules (json, yaml, tempfile)
2. Open file using `with open(...)` (automatic cleanup)
3. Choose file mode (`r`, `w`, `a`, `r+`)
4. Perform read/write/append operations
5. Handle errors gracefully

### Basic File Operations

```python
# Reading
with open("file.txt", "r") as f:
    content = f.read()          # Read entire file
    # OR
    lines = f.readlines()       # List of lines
    # OR
    line = f.readline()         # One line at a time
    # OR
    for line in f:              # Iterate line by line (memory efficient)
        process(line)

# Writing
with open("file.txt", "w") as f:
    f.write("Hello\n")
    f.write("World\n")

# Appending
with open("file.txt", "a") as f:
    f.write("New line\n")

# Reading and writing
with open("file.txt", "r+") as f:
    data = f.read()
    f.write("appended text")
```

### File Modes

| Mode | Description | Creates file? | Truncates? |
|------|-------------|---------------|------------|
| `r` | Read only | No | No |
| `w` | Write only | Yes | Yes |
| `a` | Append only | Yes | No |
| `r+` | Read and write | No | No |
| `w+` | Read and write | Yes | Yes |
| `a+` | Read and append | Yes | No |
| `rb`, `wb`, etc. | Binary mode | Varies | Varies |

### Important: Iterating Over File Content

**Never loop over `f.read()` or `f.readline()` — you'll iterate over characters, not lines!**

```python
# ❌ WRONG - iterates over characters
with open("file.txt", "r") as f:
    content = f.read()
    for char in content:        # This loops through each character!
        print(char)

# ❌ WRONG - readline() returns a single line string
with open("file.txt", "r") as f:
    line = f.readline()
    for char in line:           # This loops through characters in one line!
        print(char)

# ✅ CORRECT - iterate over the file object itself
with open("file.txt", "r") as f:
    for line in f:              # This loops through lines
        print(line)

# ✅ CORRECT - or use readlines() for a list of lines
with open("file.txt", "r") as f:
    for line in f.readlines():  # This loops through lines
        print(line)

# ✅ CORRECT - if you want all text as a single string
with open("file.txt", "r") as f:
    text = f.read()             # Gets entire file as one string
    # Now process the entire text (don't loop over it!)
    word_count = len(text.split())
```

### Skip Empty/Comment Lines

```python
with open("config.txt", "r") as f:
    for line in f:
        cleaned = line.strip()
        if not cleaned or cleaned.startswith("#"):
            continue
        process(cleaned)
```

### Error Handling

```python
# Handle missing file
try:
    with open("data.txt", "r") as f:
        content = f.read()
except FileNotFoundError:
    print("File not found")
    # Create default file or exit gracefully

# Handle permission errors
try:
    with open("/etc/protected.conf", "r") as f:
        data = f.read()
except PermissionError:
    print("Access denied")

# Handle all file errors
try:
    with open("file.txt", "r") as f:
        process(f.read())
except FileNotFoundError:
    print("File doesn't exist")
except PermissionError:
    print("No permission to read")
except IOError as e:
    print(f"IO error: {e}")
```

### Modify File In-Place

**Helpful when:**
- We want to toggle flags in a config (e.g., DEBUG=true → DEBUG=false)
- We need to comment out lines
- We are updating port numbers, API keys, log levels, etc.

```python
# Read all lines
with open("file.conf", "r") as f:
    lines = f.readlines()

# Write modified content
with open("file.conf", "w") as f:
    for line in lines:
        if "DEBUG=true" in line:
            f.write("DEBUG=false\n")
        else:
            f.write(line)
```

### Safe File Modification (Atomic)

```python
import tempfile
import os
import shutil

# Backup original
shutil.copy("config.yaml", "config.yaml.bak")

# Write to temp file
with tempfile.NamedTemporaryFile("w", delete=False) as tf:
    tf.write(modified_content)
    temp_name = tf.name

# Atomically replace original
os.replace(temp_name, "config.yaml")
```

### Working with JSON

**Mental Model:** "Decode → Work → Encode"

```python
import json

# Read JSON
with open("data.json", "r") as f:
    data = json.load(f)                 # JSON → Python dict

# Write JSON
with open("data.json", "w") as f:
    json.dump(data, f, indent=2)        # Python dict → JSON

# Parse JSON string
json_str = '{"name": "Alice", "age": 30}'
data = json.loads(json_str)             # String → dict

# Create JSON string
data = {"name": "Alice", "age": 30}
json_str = json.dumps(data, indent=2)   # Dict → string

# Pretty print
print(json.dumps(data, indent=4))
```

### Working with YAML

> **Note:** `yaml` comes from the third-party PyYAML package, not the Python standard library. Install with: `pip install pyyaml`

```python
import yaml

# Read YAML
with open("config.yaml", "r") as f:
    config = yaml.safe_load(f)

# Write YAML
with open("config.yaml", "w") as f:
    yaml.safe_dump(config, f)
```

## os (Operating System Interface)

**"Interface with the operating system"** - File system operations, environment variables, process management, and system-level interactions.

### Common workflow

1. **Check environment** - Read environment variables (`getenv`, `environ`)
2. **Locate yourself** - Get current directory (`getcwd`)
3. **Navigate** - Change directories if needed (`chdir`)
4. **Inspect** - List contents, check existence (`listdir`, `exists`, `isfile`, `isdir`)
5. **Modify** - Create/remove files and directories (`mkdir`, `remove`, `rmdir`)
6. **Build paths** - Join paths safely across platforms (`os.path.join`)
7. **Process control** - Execute commands, manage processes (use `subprocess` module instead)

> **Modern Alternative:** For file/path operations, prefer `pathlib.Path` - it's more intuitive and object-oriented.

### Environment Variables

```python
# Get environment variable
api_key = os.getenv("API_KEY")
api_key = os.environ.get("API_KEY", "default")

# Set environment variable
os.environ["MY_VAR"] = "value"

# Check if variable exists
if "PATH" in os.environ:
    print(os.environ["PATH"])
```

### Directory Navigation

```python
import os

# Get current directory
cwd = os.getcwd()
print(cwd)                  # /home/user

# Set/change current working directory
os.chdir("/tmp")
print(os.getcwd())          # /tmp

# List directory contents
items = os.listdir(".")     # Returns list of names
```

### File/Directory Checks

```python
# Check existence
os.path.exists("file.txt")      # True if exists

# Check type
os.path.isfile("file.txt")      # True if file
os.path.isdir("folder")         # True if directory

# Get file size
size = os.path.getsize("file.txt")
```

### Create/Remove

```python
# Create directory
os.mkdir("newdir")                  # Single directory
os.makedirs("path/to/dir")          # Nested directories

# Rename/Move
os.replace("old.txt", "new.txt")    # Rename a file

# Remove
os.remove("file.txt")               # Remove file
os.rmdir("emptydir")                # Remove empty directory
os.removedirs("path/to/dir")        # Remove empty nested dirs

# Use shutil for non-empty directories
import shutil
shutil.rmtree("dir_with_contents")
```

### Path Operations

```python
# Join paths (OS-independent)
path = os.path.join("folder", "subfolder", "file.txt")

# Split path
dirname, filename = os.path.split("/path/to/file.txt")
# dirname: /path/to, filename: file.txt

# Get components
os.path.basename("/path/to/file.txt")   # "file.txt"
os.path.dirname("/path/to/file.txt")    # "/path/to"

# Get absolute path
os.path.abspath("file.txt")             # /full/path/to/file.txt
```

## subprocess

**"Run external programs from Python"** - Execute shell commands, system utilities, and external scripts while capturing output and handling errors.

### Mental Model

1. Import `subprocess`
2. Define commands as lists: `["ls", "-l"]` (safe)
3. Use `subprocess.run(...)` to execute
4. Capture output with `capture_output=True` or `stdout=PIPE`
5. Check `returncode`, `stdout`, `stderr`
6. Use `check=True` to auto-raise on errors
7. Catch `CalledProcessError` (command failed)
8. Use `shell=True` only when needed (pipelines, globbing)

### Basic Usage

```python
import subprocess

# Run command and capture output
result = subprocess.run(
    ["ls", "-l"],
    capture_output=True,    # Capture stdout/stderr
    text=True               # Return as string (not bytes)
)

print("Return code:", result.returncode)
print("Output:", result.stdout)
print("Errors:", result.stderr)
```

### With Error Handling

```python
result = subprocess.run(
    ["ls", "/fake/path"],
    capture_output=True,
    text=True,
    check=True              # Raises CalledProcessError if fails
)
```

### Error Handling Pattern

```python
try:
    result = subprocess.run(
        ["ls", "/path"],
        capture_output=True,
        text=True,
        check=True
    )
    print(result.stdout)
except subprocess.CalledProcessError as e:
    print(f"Command failed: {e.cmd}")
    print(f"Return code: {e.returncode}")
    print(f"Error output: {e.stderr}")
except FileNotFoundError:
    print("Command not found")
```

### Shell Commands (Use Carefully!)

```python
# With shell=True
result = subprocess.run(
    "ls -l /etc",
    shell=True,
    capture_output=True,
    text=True
)
```

### Complete Example

```python
import subprocess

def run_command(cmd):
    """Execute command with check=True (raises on error)."""
    print(f"\nRunning: {' '.join(cmd)}")
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print("✓ Success (rc:", result.returncode, ")")
        if result.stdout:
            print("STDOUT:", result.stdout.strip())
        if result.stderr:
            print("STDERR:", result.stderr.strip())
        return result
    except subprocess.CalledProcessError as e:
        print(f"✗ Command failed: {' '.join(e.cmd)}")
        print(f"  Return code: {e.returncode}")
        print(f"  Error: {e.stderr.strip()}")
    except FileNotFoundError:
        print(f"✗ Command not found: {cmd[0]}")

def run_command_no_check(cmd):
    """Execute command without check (manual error handling)."""
    print(f"\nRunning: {' '.join(cmd)}")
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print("✓ Success")
            print("STDOUT:", result.stdout.strip())
        else:
            print(f"✗ Failed with return code: {result.returncode}")
            print("STDERR:", result.stderr.strip())
        return result
    except FileNotFoundError:
        print(f"✗ Command not found: {cmd[0]}")

def run_shell_pipeline():
    """Example of when shell=True is actually useful."""
    print("\nRunning shell pipeline:")
    result = subprocess.run(
        "ps aux | grep python | head -5",
        shell=True,
        capture_output=True,
        text=True
    )
    print(result.stdout)

def main():
    # Success cases
    run_command(['echo', 'Hello, World!'])
    run_command(['ls', '-lh', '/tmp'])

    # Error cases
    run_command(['ls', '/fake/path'])       # CalledProcessError
    run_command(['fakecmd'])                # FileNotFoundError

    # Manual error handling (without check=True)
    run_command_no_check(['ls', '/another/fake'])

    # Shell pipeline example
    run_shell_pipeline()

if __name__ == "__main__":
    main()
```

## collections

### Counter

Count items efficiently.

```python
from collections import Counter

# Count from iterable
items = ['apple', 'banana', 'apple', 'cherry', 'banana', 'apple']
counts = Counter(items)
print(counts)
# Counter({'apple': 3, 'banana': 2, 'cherry': 1})

# Access counts
counts['apple']             # 3
counts['missing']           # 0 (no KeyError)

# Most common
counts.most_common(2)       # [('apple', 3), ('banana', 2)]

# Incremental counting
counts = Counter()
for item in items:
    counts[item] += 1

# Update with more items (increments existing counts)
counts.update(['apple', 'date'])  # apple: 4, date: 1

# Arithmetic operations
c1 = Counter(['a', 'b', 'c'])
c2 = Counter(['b', 'c', 'd'])
c1 + c2                     # Combine counts
c1 - c2                     # Subtract counts

# Note: Counter is a dict subclass - supports keys(), values(), items(), etc.
```

### defaultdict

Dictionary with default values (no KeyError).

```python
from collections import defaultdict

# THE KEY DIFFERENCE: Automatic initialization
# Regular dict:
regular = {}
# regular['new_key'].append('x')  # ❌ KeyError: 'new_key'

# defaultdict:
dd = defaultdict(list)
dd['new_key'].append('x')  # ✅ Auto-creates 'new_key' = [] first!
# Result: {'new_key': ['x']}

# Example 1: Grouping by key
people = [
    ("Alice", "Engineering"),
    ("Bob", "HR"),
    ("Charlie", "Engineering")
]

groups = defaultdict(list)  # Factory: list → default value is []
for name, dept in people:
    # First time 'Engineering': auto-creates groups['Engineering'] = []
    # Then appends name to that list
    groups[dept].append(name)

# {'Engineering': ['Alice', 'Charlie'], 'HR': ['Bob']}

# Example 2: Counting
counts = defaultdict(int)   # Factory: int → default value is 0
for item in ['a', 'b', 'a', 'c', 'b', 'a']:
    # First time 'a': auto-creates counts['a'] = 0
    # Then increments: counts['a'] += 1
    counts[item] += 1
# {'a': 3, 'b': 2, 'c': 1}

# Example 3: Nested defaultdict
tree = lambda: defaultdict(tree)
data = tree()
data['level1']['level2']['level3'] = "value"  # Auto-creates all levels!
```

### namedtuple

**Tuple with named fields** — combines memory efficiency of tuples with readability of dictionaries.

#### Problem with Regular Tuples

```python
# Regular tuple - hard to understand
def get_user():
    return ("Alice", 30, "alice@example.com")

user = get_user()
print(user[0])  # What is index 0? Name? ID? Email?
print(user[1])  # What is index 1?

# Someone reading your code has to:
# 1. Look up the function definition
# 2. Count positions to understand what each index means
```

#### Solution: namedtuple

```python
from collections import namedtuple

# Define once
User = namedtuple("User", ["name", "age", "email"])

def get_user():
    return User("Alice", 30, "alice@example.com")

user = get_user()
print(user.name)   # Self-documenting! Clearly a name
print(user.age)    # Clearly an age
print(user.email)  # Clearly an email
```

#### Key Features

```python
Person = namedtuple("Person", ["name", "age", "city"])
p = Person("Alice", 30, "NYC")

# Access by name (readable)
print(p.name)               # "Alice"
print(p.city)               # "NYC"

# Still works like a tuple
print(p[0])                 # "Alice"

# Unpacking works
name, age, city = p
print(name)                 # "Alice"
print(age)                  # 30
print(city)                 # "NYC"

# Useful conversions
p._asdict()                 # {'name': 'Alice', 'age': 30, 'city': 'NYC'}
p._replace(age=31)          # Person(name='Alice', age=31, city='NYC')

# Immutable (like regular tuples)
# p.age = 31  # ❌ AttributeError
```

#### Real-World Example

```python
from collections import namedtuple

# Processing CSV data
Employee = namedtuple("Employee", ["id", "name", "department", "salary"])

employees = [
    Employee(1, "Alice", "Engineering", 90000),
    Employee(2, "Bob", "Sales", 70000),
    Employee(3, "Charlie", "Engineering", 95000),
]

# Clear, readable code
for emp in employees:
    if emp.department == "Engineering" and emp.salary > 80000:
        print(f"{emp.name}: ${emp.salary}")

# vs regular tuple version:
# if emp[2] == "Engineering" and emp[3] > 80000:  # What do these mean??
#     print(f"{emp[1]}: ${emp[3]}")
```

**Why not just use a dict or class?**
- **vs dict**: namedtuple is immutable, uses less memory, faster
- **vs class**: Less boilerplate, lighter weight for simple data structures

### deque

Double-ended queue (efficiently add/remove from both ends of a list).

```python
from collections import deque

# Create
dq = deque([1, 2, 3])

# Add to ends
dq.append(4)                # Right: [1, 2, 3, 4]
dq.appendleft(0)            # Left: [0, 1, 2, 3, 4]

# Remove from ends
dq.pop()                    # Remove right: 4
dq.popleft()                # Remove left: 0

# Fixed-size buffer (auto-removes oldest)
buffer = deque(maxlen=3)
buffer.extend([1, 2, 3])    # [1, 2, 3]
buffer.append(4)            # [2, 3, 4] (1 removed)

# Rotate
dq = deque([1, 2, 3, 4, 5])
dq.rotate(2)                # [4, 5, 1, 2, 3]
dq.rotate(-1)               # [5, 1, 2, 3, 4]
```

## datetime & time

### When to Use Which?

Python has two modules for working with time - understanding when to use each is crucial.

#### `time` module - Low-level timestamps

Works with Unix timestamps (seconds since epoch: January 1, 1970, 00:00:00 UTC)

- **Use for**: Performance measurement, delays, system-level operations
- **Format**: Float representing seconds (e.g., `1737734445.123456`)

```python
import time

# Measuring performance
start = time.time()
# ... some code ...
elapsed = time.time() - start
print(f"Took {elapsed:.3f} seconds")

# Delays
time.sleep(2)  # Pause for 2 seconds
```

#### `datetime` module - High-level date/time objects

Works with structured date and time objects

- **Use for**: Business logic, user-facing dates, calendar operations
- **Format**: Objects with year, month, day, etc. (e.g., `2025-01-24 15:30:45`)

```python
from datetime import datetime, timedelta

# Working with dates
meeting = datetime(2025, 1, 24, 15, 30)
print(meeting.strftime("%B %d, %Y at %I:%M %p"))
# "January 24, 2025 at 03:30 PM"

# Date arithmetic
tomorrow = datetime.now() + timedelta(days=1)
```

**Rule of thumb**: Use `datetime` for most application code. Use `time` for performance measurement and low-level operations.

### datetime Basics

```python
from datetime import datetime, timedelta

# Get current date and time
now = datetime.now()
print(now)                                      # 2025-01-24 15:30:45.123456

# Manually define datetime
dt = datetime(2025, 1, 24, 15, 30, 45)          # 2025-01-24 15:30:45

# ISO string → datetime
# Use case: Reading from APIs, JSON data
dt = datetime.fromisoformat("2025-01-24T15:30:45")

# Unix timestamp → datetime
# Use case: Reading from DB, system logs
dt = datetime.fromtimestamp(1727694000.0)

# datetime → string
# Use case: Display to users, write to files
formatted = dt.strftime("%Y-%m-%d %H:%M:%S")    # "2025-01-24 15:30:45"

# Custom string → datetime
# Use case: Reading user input, parsing log files
dt = datetime.strptime("2025-01-24", "%Y-%m-%d")
```

### timedelta (Duration)

```python
from datetime import datetime, timedelta

# Create a duration (7 days, 3 hours, 30 minutes from now)
duration = timedelta(days=7, hours=3, minutes=30)
future_time = datetime.now() + duration

# Arithmetic
now = datetime.now()                # e.g., 2025-01-26 10:30:00
future = now + timedelta(days=7)    # 2025-02-02 10:30:00 (7 days later)
past = now - timedelta(hours=2)     # 2025-01-26 08:30:00 (2 hours earlier)

# Difference between datetimes
dt1 = datetime(2025, 1, 1)
dt2 = datetime(2025, 1, 24)
diff = dt2 - dt1                # timedelta(days=23)
print(diff.days)                # 23
print(diff.total_seconds())     # 1987200.0
```

### time Module Basics

```python
import time

# Get current time as Unix timestamp
timestamp = time.time()
print(timestamp)                # 1737734445.123456

# Sleep/delay execution
time.sleep(2)                   # Pause for 2 seconds

# Measure elapsed time
start = time.time()
# ... code to measure ...
elapsed = time.time() - start
print(f"Took {elapsed:.3f} seconds")
```

### Working with UTC

**Get UTC vs local time:**
```python
from datetime import datetime, timezone

utc_now = datetime.now(timezone.utc)     # 2025-01-26 15:30:45+00:00
local_now = datetime.now()               # 2025-01-26 10:30:45 (example: EST)
```

**Configure logging to use UTC:**
```python
import time
import logging

logging.Formatter.converter = time.gmtime
```

**Convert between datetime and Unix timestamp:**
```python
from datetime import datetime

dt = datetime.now()
timestamp = dt.timestamp()                      # datetime → timestamp (1737734445.123)
dt_from_ts = datetime.fromtimestamp(timestamp)  # timestamp → datetime
```

## regex (re module)

### Mental Model

1. Import `re` module
2. Choose the right function:
    - `search()` - Find first match, return match object
    - `match()` - Match only at start, return match object
    - `findall()` - Find all matches, return data
    - `sub()` - Replace all matches, return new string
3. Use raw strings `r'...'` for patterns (avoids backslash escaping issues)
4. Check `if match` exists before accessing groups to avoid `AttributeError`
5. Compile patterns with `re.compile()` if reusing multiple times
6. Use named groups `(?P<name>...)` for readable extraction

### Core Functions Comparison

```python
import re

text = "Error on line 42: failed after 3 attempts"

# search() - Find FIRST match anywhere in string
match = re.search(r'\d+', text)
if match:
    print(match.group())            # "42" (first number found)

# match() - Match ONLY at string START
match = re.match(r'\d+', '123abc')
if match:
    print(match.group())            # "123"

match = re.match(r'\d+', 'abc123')  # None (doesn't start with digit)

# findall() - Get ALL matches as list
numbers = re.findall(r'\d+', text)
print(numbers)                      # ['42', '3']

# finditer() - Get ALL matches as iterator (for large data)
for match in re.finditer(r'\d+', text):
    print(match.group(), match.start())  # "42" 14, "3" 34

# sub() - Replace matches
result = re.sub(r'\d+', '#', text)
print(result)                       # "Error on line #: failed after # attempts"

# fullmatch() - Entire string must match pattern
re.fullmatch(r'\d+', '123')         # ✅ Match (entire string is digits)
re.fullmatch(r'\d+', '123abc')      # ❌ None (extra characters 'abc')
```

### Common Regex Symbols

| Pattern | Meaning | Example |
|---------|---------|---------|
| **Character Classes** | | |
| `\d` | Any digit [0-9] | `r'\d+'` matches "123" |
| `\D` | Any non-digit | `r'\D+'` matches "abc" |
| `\w` | Word character [a-zA-Z0-9_] | `r'\w+'` matches "hello_123" |
| `\W` | Non-word character | `r'\W+'` matches "!@#" |
| `\s` | Whitespace (space, tab, newline) | `r'\s+'` matches whitespace |
| `\S` | Non-whitespace | `r'\S+'` matches "text" |
| `.` | Any character except newline | `r'a.c'` matches "abc", "a9c", "a c" |
| **Anchors** | | |
| `^` | Start of string | `r'^\d+'` matches "123abc" but not "abc123" |
| `$` | End of string | `r'\d+$'` matches "abc123" but not "123abc" |
| `\b` | Word boundary | `r'\bword\b'` matches "word" but not "sword" |
| **Quantifiers** | | |
| `*` | 0 or more | `r'ab*c'` matches "ac", "abc", "abbc" |
| `+` | 1 or more | `r'ab+c'` matches "abc", "abbc" but not "ac" |
| `?` | 0 or 1 (optional) | `r'colou?r'` matches "color" or "colour" |
| `{n}` | Exactly n times | `r'\d{3}'` matches "123", "999" (exactly 3 digits) |
| `{n,}` | n or more times | `r'\d{2,}'` matches "12", "123", "1234" (2 or more digits) |
| `{n,m}` | Between n and m times | `r'\d{2,4}'` matches "12", "123", "1234" (between 2 and 4 digits) |

### Capture Groups

- **Basic groups** - Access by index (need to count position)
- **Named groups** - Access by name (self-documenting, more readable!)

```python
# Basic groups - Access by index
pattern = r'(\d+)-(\d+)-(\d+)'
match = re.search(pattern, '2025-01-26')
if match:
    print(match.group(0))    # "2025-01-26" (entire match)
    print(match.group(1))    # "2025" (first group)
    print(match.group(2))    # "01" (second group)
    print(match.group(3))    # "26" (third group)
    print(match.groups())    # ('2025', '01', '26')

# Named groups - Access by name (more readable!)
pattern = r'(?P<year>\d+)-(?P<month>\d+)-(?P<day>\d+)'
match = re.search(pattern, '2025-01-26')
if match:
    print(match.group(0))            # "2025-01-26" (entire match)
    print(match.group('year'))       # "2025"
    print(match.group('month'))      # "01"
    print(match.group('day'))        # "26"
    print(match.groupdict())         # {'year': '2025', 'month': '01', 'day': '26'}

# Using named groups in substitution
text = "2025-01-26"
result = re.sub(
    r'(?P<year>\d+)-(?P<month>\d+)-(?P<day>\d+)',
    r'\g<month>/\g<day>/\g<year>',  # Reorder to MM/DD/YYYY
    text
)
print(result)  # "01/26/2025"
```

### Real-World Examples

```python
# Extract all email addresses
text = "Contact: alice@example.com or bob@test.org"
emails = re.findall(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
# ['alice@example.com', 'bob@test.org']

# Parse log entries
log = "2025-01-26 14:35:22 ERROR: Database connection failed"
pattern = r'(?P<date>\S+) (?P<time>\S+) (?P<level>\w+): (?P<message>.*)'
match = re.search(pattern, log)
if match:
    print(match.groupdict())
# {'date': '2025-01-26', 'time': '14:35:22', 'level': 'ERROR',
#  'message': 'Database connection failed'}

# Validate phone numbers
phone = "(555) 123-4567"
if re.fullmatch(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', phone):
    print("Valid phone number")

# Extract URLs
text = "Visit https://example.com or http://test.org for more info"
urls = re.findall(r'https?://[^\s]+', text)
# ['https://example.com', 'http://test.org']

# Clean whitespace
text = "  too    many     spaces  "
cleaned = re.sub(r'\s+', ' ', text).strip()
# "too many spaces"

# Extract hashtags
tweet = "Learning #Python and #regex is fun! #coding"
hashtags = re.findall(r'#\w+', tweet)
# ['#Python', '#regex', '#coding']
```

### Flags for Special Matching

```python
# Case-insensitive
re.search(r'python', 'I love Python', re.IGNORECASE)  # Match!

# Multiline mode (^ and $ match line boundaries)
text = "line1\nline2\nline3"
re.findall(r'^line', text, re.MULTILINE)  # ['line', 'line', 'line']

# Dot matches newline
re.search(r'start.*end', 'start\nmiddle\nend', re.DOTALL)  # Match!

# Verbose mode (allow comments in regex)
pattern = re.compile(r'''
    \d{3}       # Area code
    [-.\s]?     # Optional separator
    \d{3}       # First 3 digits
    [-.\s]?     # Optional separator
    \d{4}       # Last 4 digits
''', re.VERBOSE)
```

### Compile for Performance

When reusing patterns, compile once for efficiency:

```python
# ❌ Slow - recompiles pattern every iteration
for line in large_file:
    if re.search(r'\d{3}-\d{3}-\d{4}', line):
        process(line)

# ✅ Fast - compile once, reuse many times
phone_pattern = re.compile(r'\d{3}-\d{3}-\d{4}')
for line in large_file:
    if phone_pattern.search(line):
        process(line)

# Multiple operations with compiled pattern
pattern = re.compile(r'\d+')
pattern.search('abc123')        # Matches "123"
pattern.findall('1a 2b 3c')     # Returns ["1", "2", "3"]
pattern.sub('#', 'abc123def')   # Result: "abc#def"
```

### Common Pitfalls

```python
# ❌ Forgetting to check if match exists
match = re.search(r'\d+', 'no numbers')
print(match.group())  # AttributeError: 'NoneType' has no attribute 'group'

# ✅ Always check first
match = re.search(r'\d+', 'no numbers')
if match:
    print(match.group())

# ❌ Using regular string instead of raw string
pattern = '\d+'    # Python interprets \d as backslash-d
# ✅ Use raw strings
pattern = r'\d+'   # Regex engine gets \d correctly

# ❌ Greedy matching when you want non-greedy
text = "<div>content</div><div>more</div>"
re.findall(r'<div>.*</div>', text)  # ['<div>content</div><div>more</div>']
# ✅ Use non-greedy ?
re.findall(r'<div>.*?</div>', text)  # ['<div>content</div>', '<div>more</div>']
```

## argparse

### Mental Model

1. Import `argparse`
2. Create parser with description
3. Add arguments
    - **Positional arguments** → specified by name alone, required by default
    - **Optional arguments** → specified with `--` or `-`, optional by default
4. Parse arguments: `args = parser.parse_args()`
5. Use arguments: `args.name`, `args.verbose`

### Basic Usage

```python
import argparse

parser = argparse.ArgumentParser(description="Analyze log files")

# Positional argument (required)
parser.add_argument("logfile", help="Path to log file")

# Optional arguments
parser.add_argument("-v", "--verbose", action="store_true", help="Show detailed output")
parser.add_argument("-n", "--lines", type=int, default=10, help="Number of lines to show")

# Parse
args = parser.parse_args()

# Use
print(f"Analyzing: {args.logfile}")
if args.verbose:
    print("Verbose mode enabled")
print(f"Showing {args.lines} lines")
```

### Advanced Features

```python
parser = argparse.ArgumentParser()

# Required optional argument
parser.add_argument("--config", required=True)

# Choices
parser.add_argument("--mode", choices=["dev", "prod"])

# Multiple values
parser.add_argument("--files", nargs="+")    # One or more
parser.add_argument("--exclude", nargs="*")  # Zero or more

# Action types (flags that don't need values)
parser.add_argument("--verbose", action="store_true")  # Use flag only: --verbose → True, no flag → False
parser.add_argument("--debug", action="store_const", const=True)

args = parser.parse_args()
```

**nargs options:**
- `nargs="+"` → If you use `--files`, you MUST provide at least one value
- `nargs="*"` → You can use `--exclude` alone without any values, or with multiple values

## logging

### Mental Model

1. Import `logging`

2. Configure logging using `basicConfig()` once at start (set level, format, handlers)
   - Choose log level: `level=logging.INFO`
     - Options: `DEBUG` < `INFO` < `WARNING` < `ERROR` < `CRITICAL`
   - Choose format: `format="%(asctime)s %(levelname)s: %(message)s"`
     - Includes: timestamp, level, message
   - Choose handlers (where logs go):
     - Console only: `handlers=[logging.StreamHandler()]` (default if omitted)
     - File only: `handlers=[logging.FileHandler("app.log")]`
     - Both: `handlers=[logging.FileHandler("app.log"), logging.StreamHandler()]`

3. Use the right log level for your message
   - `logging.debug()` → Detailed diagnostic info (variables, flow control)
   - `logging.info()` → Confirmation things are working (user logged in, request processed)
   - `logging.warning()` → Something unexpected but app still works (deprecated API, slow response)
   - `logging.error()` → Serious problem, feature failed (couldn't save file, API call failed)
   - `logging.critical()` → System-level failure (database down, out of memory)

4. Log exceptions with traceback → Use `logging.exception()` inside `except` blocks
   - Automatically captures and logs the full stack trace
   - Equivalent to `logging.error()` but with traceback

5. Use `print()` only for quick debugging — use logging for production code

**Multi-file projects:** Use a module-specific logger: `logger = logging.getLogger(__name__)` instead of `logging` directly. This shows which module the log came from and still uses the global configuration from basicConfig()

### Basic Setup

```python
import logging

# Configure logging ONCE at start (before any logging calls)
# ⚠️ Note: basicConfig() only works the first time it's called
logging.basicConfig(
    level=logging.INFO,  # Minimum level to log: DEBUG < INFO < WARNING < ERROR < CRITICAL

    # Format string - common placeholders:
    # %(asctime)s     → timestamp (2024-01-15 14:30:45,123)
    # %(levelname)s   → log level (INFO, ERROR, etc.)
    # %(name)s        → logger name (useful with getLogger(__name__))
    # %(message)s     → the actual log message
    # %(filename)s    → source file name
    # %(lineno)d      → line number
    format="%(asctime)s [%(levelname)s] %(message)s",

    # Date format (optional) - makes timestamps more readable
    datefmt="%Y-%m-%d %H:%M:%S",

    # Handlers determine where logs go (file, console, network, etc.)
    handlers=[
        logging.FileHandler("app.log"),       # Write to file (append mode by default)
        logging.StreamHandler()               # Write to console (stderr by default)
    ]
)

# Example log messages at different severity levels
logging.debug("Detailed info for debugging - won't show (level set to INFO)")
logging.info("App started successfully")                     # General informational messages
logging.warning("Low disk space - 90% used")                 # Something unexpected but recoverable
logging.error("Failed to save file: permission denied")      # Serious problem, feature failed
logging.critical("Database connection lost - shutting down") # System-level failure

# Exception logging with automatic traceback
try:
    result = 10 / 0
except ZeroDivisionError:
    # logging.exception() automatically includes the full stack trace
    # Equivalent to logging.error(msg, exc_info=True)
    logging.exception("Math error occurred")
```

### Script vs App: Where to Configure Logging

**Scripts (single-file programs):** Use `basicConfig()` at the top of your script
```python
# myscript.py
import logging

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

def process_data():
    logging.info("Processing started")
    # ... do work ...

if __name__ == "__main__":
    process_data()
```

**Applications (multi-file projects):** Configure logging ONLY in your main entry point
```python
# main.py (or app.py, __main__.py, etc.)
import logging
from myapp import database, api

# Configure logging ONCE here - affects entire application
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.FileHandler("app.log"), logging.StreamHandler()]
)

def main():
    logging.info("Application starting")
    database.connect()  # Uses logger from database module
    api.start_server()  # Uses logger from api module

if __name__ == "__main__":
    main()
```

```python
# database.py (library module)
import logging

# Get module-specific logger - DON'T call basicConfig() here
logger = logging.getLogger(__name__)

def connect():
    logger.info("Connecting to database")  # Uses config from main.py
    # ... connection logic ...
```

**Key differences:**
- **Scripts:** `basicConfig()` at top + use `logging.<level>()` directly
- **Apps:** `basicConfig()` only in entry point + use `logger = logging.getLogger(__name__)` in modules
- **Why the distinction:** In apps, `basicConfig()` only works the first time it's called, so if modules tried to configure logging, it would have no effect (or create conflicts). Scripts are simpler because there's only one configuration point.

### Putting It Together

**Before logging:**
```python
import requests

def fetch_user(user_id):
    response = requests.get(f"https://api.example.com/users/{user_id}")
    if response.status_code == 200:
        return response.json()
    return None

user = fetch_user(123)
print(user)
```

**After logging:**
```python
import logging
import requests

# Configure once at the start
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

def fetch_user(user_id):
    # INFO: Track normal operations - function started
    logging.info(f"Fetching user {user_id}")

    try:
        response = requests.get(f"https://api.example.com/users/{user_id}")

        if response.status_code == 200:
            # INFO: Confirm success - operation completed as expected
            logging.info(f"Successfully retrieved user {user_id}")
            return response.json()
        elif response.status_code == 404:
            # WARNING: Expected issue but function still works (returns None)
            logging.warning(f"User {user_id} not found")
        else:
            # ERROR: Unexpected API problem - feature failed
            logging.error(f"API error: {response.status_code}")

        return None

    except requests.RequestException:
        # EXCEPTION: Captures full traceback for unexpected errors
        logging.exception(f"Network error fetching user {user_id}")
        return None

user = fetch_user(123)
```

**What changed:**
- `info` → track normal operations (API calls, success)
- `warning` → expected issues that don't break the function (404)
- `error` → API problems (wrong status codes)
- `exception` → unexpected failures with full traceback (network errors)

## pathlib

Modern object-oriented path handling introduced in Python 3.4. Unlike `os.path`, which uses functions and string manipulation to work with file paths, `pathlib` treats paths as objects.

### Why pathlib over os.path?

The main problem it solves: **readable, maintainable path operations**. 

Compare building a nested path:

```python
# os.path - verbose, error-prone string manipulation
import os
config = os.path.join(os.path.expanduser('~'), '.config', 'myapp', 'settings.json')

# pathlib - clean, chainable, intuitive
from pathlib import Path
config = Path.home() / '.config' / 'myapp' / 'settings.json'
```

### Key features

```python
from pathlib import Path

# Create path
p = Path("/home/user/file.txt")

# Current directory
cwd = Path.cwd()

# Home directory
home = Path.home()

# Join paths
path = Path("/home") / "user" / "file.txt"

# Check existence
p.exists()
p.is_file()
p.is_dir()

# Get parts
p.name          # "file.txt"
p.stem          # "file"
p.suffix        # ".txt"
p.parent        # Path("/home/user")

# Create directory
Path("newdir").mkdir(parents=True, exist_ok=True)

# Read/write
Path("file.txt").write_text("content")
content = Path("file.txt").read_text()

# Glob
for file in Path(".").glob("*.py"):
    print(file)
```

## Practice Exercises

### File Handling
1. Read CSV file and process each row
2. Merge multiple JSON files into one
3. Implement log file rotation

### os & subprocess
1. Create directory structure for a project
2. Find all Python files in directory tree
3. Run system command and parse output

### collections
1. Count word frequency in text file
2. Group data by multiple keys using defaultdict
3. Implement LRU cache using deque

### datetime
1. Calculate age from birth date
2. Parse log timestamps and filter by date range
3. Find working days between two dates

### regex
1. Extract all email addresses from text
2. Parse log file using regex groups
3. Validate and extract phone numbers

### argparse & logging
1. Create CLI tool with multiple commands
2. Add logging to existing script
3. Build script with configurable verbosity levels
