---
title: Building Blocks
linkTitle: Building Blocks
type: docs
weight: 2
prev: /python/01-foundation
next: /python/03-functions-deep-dive
---

## Data Structure Comparison

| Data Structure | Ordered | Mutable | Allow Duplicate | Constructor |
|----------------|---------|---------|-----------------|-------------|
| **List** | Yes | Yes | Yes | `[]` or `list()` |
| **Tuple** | Yes | No | Yes | `()` or `tuple()` |
| **Dict** | Yes | Yes | No | `{}` or `dict()` |
| **Set** | No | Yes | No | `set()` |
| **Strings** | Yes | No | N/A | `""` or `str()` |

**Key takeaways:**
- **Ordered**: Maintains insertion order (Dict is ordered in Python 3.7+)
- **Mutable**: Can be modified after creation
- **Allow Duplicate**: Can contain duplicate values (Dict keys must be unique, but values can duplicate)

## Strings

### Core Concept
Strings are **immutable sequences of Unicode characters**. Once created, they cannot be modified in place.

### Creating Strings

```python
# Single and double quotes
s1 = 'Hello'
s2 = "World"

# Triple quotes for multiline
multiline = """This is
a multiline
string"""

# Raw strings (ignores escapes)
path = r"C:\new\folder"

# f-strings (formatted string literals)
name = "Alice"
age = 30
message = f"Hello {name}, you are {age} years old"
message = f"Result: {5 + 3}"                    # "Result: 8"
message = f"Pi: {3.14159:.2f}"                  # "Pi: 3.14"
```

### String Operations

```python
# Concatenation
"Hello" + " " + "World"     # "Hello World"

# Repetition
"Ha" * 3                    # "HaHaHa"

# Membership
"lo" in "Hello"             # True
"x" not in "Hello"          # True

# Length
len("Hello")                # 5

# Indexing (0-based)
s = "Python"
s[0]                        # 'P'
s[-1]                       # 'n' (last character)
s[-2]                       # 'o' (second from end)

# Slicing [start:stop:step]
s = "Python"
s[0:3]                      # "Pyt"
s[2:]                       # "thon"
s[:4]                       # "Pyth"
s[::2]                      # "Pto" (every 2nd char)
s[::-1]                     # "nohtyP" (reverse)
```

### String Methods

**Case conversion:**
```python
s = "Hello World"
s.upper()                   # "HELLO WORLD"
s.lower()                   # "hello world"
s.title()                   # "Hello World"
s.swapcase()                # "hELLO wORLD"
s.capitalize()              # "Hello world"
```

**Searching:**
```python
s = "Hello World"
s.find("World")             # 6 (index of first occurrence)
s.find("x")                 # -1 (not found)
s.index("World")            # 6 (raises ValueError if not found)
s.count("l")                # 3
s.startswith("Hello")       # True
s.endswith("World")         # True
```

**Trimming:**
```python
s = "  Hello  "
s.strip()                   # "Hello" (both ends)
s.lstrip()                  # "Hello  " (left)
s.rstrip()                  # "  Hello" (right)
s.strip("H")                # "ello" (specific chars)
```

**Splitting and Joining:**
```python
# split() - String to list
s = "apple,banana,cherry"
s.split(",")                # ['apple', 'banana', 'cherry']

text = "Hello World"
text.split()                # ['Hello', 'World'] (default: whitespace)

# join() - List to string
words = ["apple", "banana", "cherry"]
", ".join(words)            # "apple, banana, cherry"
"".join(words)              # "applebananacherry"
"-".join(words)             # "apple-banana-cherry"
```

**Replacing:**
```python
s = "Hello World"
s.replace("World", "Python")    # "Hello Python"
s.replace("l", "L", 1)          # "HeLlo World" (replace first occurrence)
```

**Checking:**
```python
"123".isdigit()             # True
"abc".isalpha()             # True
"abc123".isalnum()          # True
"hello".islower()           # True
"HELLO".isupper()           # True
"   ".isspace()             # True
```

### Common Patterns

**Extracting words:**
```python
import re
text = "Hello, world! How are you?"
words = re.findall(r'\b\w+\b', text)
# ['Hello', 'world', 'How', 'are', 'you']
```

**Reversing a string:**
```python
s = "Python"
reversed_s = s[::-1]        # "nohtyP"
```

**Checking palindrome:**
```python
def is_palindrome(s):
    s = s.lower().replace(" ", "")
    return s == s[::-1]

is_palindrome("racecar")    # True
is_palindrome("A man a plan a canal Panama")  # True
```

### Time Complexity
| Operation | Complexity | Example |
|-----------|------------|---------|
| Indexing `s[i]` | O(1) | `s[0]` |
| Slicing `s[i:j]` | O(k) | k = slice length |
| Concatenation `s1 + s2` | O(n + m) | Creates new string |
| `in` membership | O(n) | `'x' in s` |
| `find()` | O(n) | Searches string |
| `count()` | O(n) | Counts occurrences |
| `replace()` | O(n) | Creates new string |

## Lists

### Core Concept
Lists are **mutable, ordered sequences** that can hold items of any type.

### Creating Lists

```python
# Empty list
items = []
items = list()

# With elements
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", 3.14, True]

# From other iterables
list("abc")                 # ['a', 'b', 'c']
list(range(5))              # [0, 1, 2, 3, 4]
```

### Accessing Elements

```python
numbers = [10, 20, 30, 40, 50]

# Indexing
numbers[0]                  # 10
numbers[-1]                 # 50 (last)
numbers[-2]                 # 40 (second from end)

# Slicing
numbers[1:4]                # [20, 30, 40]
numbers[:3]                 # [10, 20, 30]
numbers[2:]                 # [30, 40, 50]
numbers[::2]                # [10, 30, 50] (every 2nd)
numbers[::-1]               # [50, 40, 30, 20, 10] (reverse)
```

### Modifying Lists

**Adding elements:**
```python
# append() - Add to end (O(1))
numbers = [1, 2, 3]
numbers.append(4)           # [1, 2, 3, 4]

# insert() - Add at index (O(n))
numbers.insert(0, 0)        # [0, 1, 2, 3, 4]

# extend() - Add multiple items (O(k))
numbers.extend([5, 6])      # [0, 1, 2, 3, 4, 5, 6]

# Concatenation
numbers = [1, 2] + [3, 4]   # [1, 2, 3, 4]
```

**Removing elements:**
```python
numbers = [1, 2, 3, 4, 5]

# remove() - Remove first occurrence (O(n))
numbers.remove(3)           # [1, 2, 4, 5]

# pop() - Remove and return last item (O(1))
last = numbers.pop()        # Returns 5, list: [1, 2, 4]

# pop(i) - Remove and return at index (O(n))
numbers.pop(0)              # Returns 1, list: [2, 4]

# del - Delete by index or slice
del numbers[0]              # [4]

# clear() - Remove all
numbers.clear()             # []
```

**Modifying elements:**
```python
numbers = [1, 2, 3, 4, 5]
numbers[0] = 10             # [10, 2, 3, 4, 5]
numbers[1:3] = [20, 30]     # [10, 20, 30, 4, 5]
```

### List Methods

```python
numbers = [3, 1, 4, 1, 5, 9]

# Sorting
numbers.sort()                  # [1, 1, 3, 4, 5, 9] (in-place)
numbers.sort(reverse=True)      # [9, 5, 4, 3, 1, 1]
sorted_nums = sorted(numbers)   # Returns new sorted list

# Reversing
numbers.reverse()           # Reverses in-place

# Searching
numbers.index(4)            # 2 (first index of 4)
numbers.count(1)            # 2 (number of 1s)

# Copying
copy1 = numbers.copy()
copy2 = numbers[:]
copy3 = list(numbers)
```

### List Comprehension

Concise way to create lists:

```python
# Basic syntax: [expression for item in iterable if condition]

# Squares
squares = [x**2 for x in range(10)]
# [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

# Even numbers
evens = [x for x in range(20) if x % 2 == 0]
# [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]

# Uppercase words
words = ["hello", "world"]
upper = [word.upper() for word in words]
# ['HELLO', 'WORLD']

# Nested comprehension
matrix = [[j for j in range(3)] for i in range(3)]
# [[0, 1, 2], [0, 1, 2], [0, 1, 2]]

# Inner loop: [j for j in range(3)] -> Creates [0, 1, 2]
# Outer loop: for i in range(3) -> Repeats it 3 times
#   [0, 1, 2],   # i = 0
#   [0, 1, 2],   # i = 1
#   [0, 1, 2]    # i = 2
```

**Converting loops to list comprehension - Mental process:**

1. **Identify what you're appending**: The expression being added to the list
2. **Pick the outer loop**: The first `for` statement
3. **Pick the inner loop** (if nested): The second `for` statement
4. **Arrange in order**: `[expression outer_loop inner_loop]`

```python
# Example: Converting nested loops
# Loop version
pairs = []
for i in range(3):
    for j in range(2):
        pairs.append((i, j))

# Mental process:
# 1. What are we appending? (i, j)
# 2. Outer loop: for i in range(3)
# 3. Inner loop: for j in range(2)
# 4. Put together in same order

# List comprehension version
pairs = [(i, j) for i in range(3) for j in range(2)]
# [(0, 0), (0, 1), (1, 0), (1, 1), (2, 0), (2, 1)]
```

### Common Patterns

**Finding min/max:**
```python
numbers = [45, 23, 67, 12, 89]
min(numbers)                # 12
max(numbers)                # 89
```

**Sum and average:**
```python
numbers = [1, 2, 3, 4, 5]
sum(numbers)                # 15
len(numbers)                # 5
average = sum(numbers) / len(numbers)  # 3.0
```

**Filtering:**
```python
numbers = [1, 2, 3, 4, 5, 6]
evens = [n for n in numbers if n % 2 == 0]  # [2, 4, 6]
```

### Common Gotchas

**1. Don't modify list while iterating**
```python
numbers = [1, 2, 3, 4, 5]

# Bad
for num in numbers:
    if num % 2 == 0:
        numbers.remove(num)  # Causes issues!

# Good: iterate over copy
for num in numbers[:]:
    if num % 2 == 0:
        numbers.remove(num)

# Better: use comprehension
numbers = [n for n in numbers if n % 2 != 0]
```

**2. .append() takes exactly one argument**
```python
# Bad: TypeError: list.append() takes exactly one argument (7 given)
my_list = []
my_list.append(1, 2, 3, 4, 5, 6, 7)  # Error!

# Good: append one item at a time
my_list = []
my_list.append(1)
my_list.append(2)
# [1, 2]

# Better: use .extend() to add multiple items
my_list = []
my_list.extend([1, 2, 3, 4, 5, 6, 7])
# [1, 2, 3, 4, 5, 6, 7]

# Best for structured data: append a single dictionary
my_list = []
my_list.append({'ip': '192.168.1.1', 'timestamp': '2024-01-01', 'method': 'GET'})
my_list.append({'ip': '192.168.1.2', 'timestamp': '2024-01-02', 'method': 'POST'})
# [{'ip': '192.168.1.1', ...}, {'ip': '192.168.1.2', ...}]
```

### Time Complexity
| Operation | Average | Worst | Example |
|-----------|---------|-------|---------|
| Index `list[i]` | O(1) | O(1) | Direct access |
| `append()` | O(1) | O(1) | Add to end |
| `pop()` | O(1) | O(1) | Remove last |
| `pop(i)` | O(n) | O(n) | Remove at i |
| `insert(i, x)` | O(n) | O(n) | Shift elements |
| `remove(x)` | O(n) | O(n) | Search + shift |
| `in` | O(n) | O(n) | Linear search |
| Slice `list[i:j]` | O(k) | O(k) | k = slice size |
| `sort()` | O(n log n) | O(n log n) | Timsort |

## Tuples

### Core Concept
Tuples are **immutable, ordered sequences**. Once created, cannot be modified.

### Creating Tuples

```python
# Empty tuple
empty = ()
empty = tuple()

# Single element (note the comma!)
single = (1,)
single = 1,             # Parentheses optional           

# Multiple elements
coords = (10, 20)
colors = ("red", "green", "blue")

# Tuple packing
point = 3, 4            # (3, 4)

# From other iterables
tuple([1, 2, 3])        # (1, 2, 3)
tuple("abc")            # ('a', 'b', 'c')
```

### Accessing Elements

```python
colors = ("red", "green", "blue")

# Indexing
colors[0]               # "red"
colors[-1]              # "blue"

# Slicing
colors[0:2]             # ("red", "green")

# Unpacking
x, y, z = colors
print(x)                # "red"

# Unpacking with *
first, *rest = (1, 2, 3, 4)
# first = 1, rest = [2, 3, 4]
```

### Tuple Methods

```python
numbers = (1, 2, 3, 2, 4)

# count() - Count occurrences
numbers.count(2)        # 2

# index() - Find first index
numbers.index(3)        # 2
```

### Common Use Cases

**Returning multiple values:**
```python
def get_user():
    # Implicitly returns a tuple: ("Alice", 30, "alice@example.com")
    return "Alice", 30, "alice@example.com"

# Tuple unpacking
name, age, email = get_user()
```

**Dictionary keys (composite keys):**
```python
# Tuples are hashable and immutable, so they can be dict keys
# Useful for coordinates, multi-part keys, etc.
locations = {
    (0, 0): "Origin",
    (1, 2): "Point A",
    (3, 4): "Point B"
}

# Access using tuple key
locations[(0, 0)]  # "Origin"

# Lists CANNOT be used as keys (they're mutable)
# bad_dict = {[0, 0]: "Origin"}  # TypeError!
```

**Immutable records:**
```python
# Named tuple (more readable)
from collections import namedtuple

Person = namedtuple("Person", ["name", "age", "city"])
p = Person("Alice", 30, "NYC")
print(p.name)           # "Alice"
print(p[0])             # "Alice"
```

### Time Complexity
| Operation | Complexity |
|-----------|------------|
| Index `tuple[i]` | O(1) |
| Slice `tuple[i:j]` | O(k) |
| `in` membership | O(n) |
| `count()` | O(n) |
| `index()` | O(n) |

## Dictionaries

### Core Concept
Dictionaries are **mutable, unordered collections of key-value pairs**. Keys must be hashable (immutable).

### Creating Dictionaries

```python
# Empty dict
d = {}
d = dict()

# With items
user = {"name": "Alice", "age": 30, "city": "NYC"}

# From tuples
dict([("a", 1), ("b", 2)])          # {'a': 1, 'b': 2}

# Using dict()
dict(name="Alice", age=30)          # {'name': 'Alice', 'age': 30}

# Dictionary comprehension: {key_expr: value_expr for item in iterable if condition}
squares = {x: x**2 for x in range(5)}
# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}
```

### Accessing and Modifying

```python
user = {"name": "Alice", "age": 30}

# Access by key
user["name"]                        # "Alice"
user["age"]                         # 30

# get() - Safe access with default
user.get("name")                    # "Alice" (key exists → return value)
user.get("email", "N/A")            # "N/A" (key missing → return default)
user.get("email")                   # None (key missing, no default → return None)

# Add/modify
user["email"] = "alice@example.com"  # user = {"name": "Alice", "age": 30, "email": "alice@example.com"}
user["age"] = 31                     # user = {"name": "Alice", "age": 31, "email": "alice@example.com"}

# Delete
del user["age"]                      # user = {"name": "Alice", "email": "alice@example.com"}
removed = user.pop("email")          # removes + returns = "alice@example.com", user = {"name": "Alice"}
user.clear()                         # user = {}
```

### Dictionary Methods

```python
user = {"name": "Alice", "age": 30, "city": "NYC"}

# Keys, values, items
user.keys()                         # dict_keys(['name', 'age', 'city'])
user.values()                       # dict_values(['Alice', 30, 'NYC'])
user.items()                        # dict_items([('name', 'Alice'), ...])

# Iteration
for key in user:
    print(key)

for value in user.values():
    print(value)

for key, value in user.items():
    print(f"{key}: {value}")

# Checking membership
"name" in user                      # True (checks keys)
"Alice" in user.values()            # True (checks values)

# setdefault() - If the key is missing, insert the key with a default value and return the value
counts = {}
counts.setdefault("apple", 0)        # counts = {"apple": 0}, returns 0
counts["apple"] += 1                 # counts = {"apple": 1}
# Useful for counting: avoids KeyError on first access

# update() - Merge dictionaries (adds new keys, overwrites existing)
user.update({"age": 31, "country": "USA"})  # user = {"name": "Alice", "age": 31, "country": "USA"}
```

### Dictionary Comprehension

```python
# {key_expr: value_expr for item in iterable if condition}

# Squares
squares = {x: x**2 for x in range(5)}

# Reverse dictionary
original = {"a": 1, "b": 2}
reversed_dict = {v: k for k, v in original.items()}
# {1: 'a', 2: 'b'}

# Filter
scores = {"Alice": 85, "Bob": 92, "Charlie": 78}
high_scores = {k: v for k, v in scores.items() if v >= 80}
# {'Alice': 85, 'Bob': 92}
```

### Common Patterns

**Counting occurrences:**
```python
# Using get()
items = ["apple", "banana", "apple", "cherry", "banana", "apple"]
counts = {}
for item in items:
    counts[item] = counts.get(item, 0) + 1
# {'apple': 3, 'banana': 2, 'cherry': 1}

# Using setdefault()
counts = {}
for item in items:
    counts.setdefault(item, 0)
    counts[item] += 1

# Using Counter
from collections import Counter
counts = Counter(items)
```

**Grouping items:**
```python
from collections import defaultdict

people = [
    ("Alice", "Engineering"),
    ("Bob", "HR"),
    ("Charlie", "Engineering")
]

# Group by department
groups = defaultdict(list)
for name, dept in people:
    groups[dept].append(name)

# {'Engineering': ['Alice', 'Charlie'], 'HR': ['Bob']}
```

**Sorting dictionary:**
```python
scores = {"Alice": 85, "Bob": 92, "Charlie": 78}

# Sort by value
sorted_items = sorted(scores.items(), key=lambda x: x[1], reverse=True)
# [('Bob', 92), ('Alice', 85), ('Charlie', 78)]

# Create sorted dict
sorted_dict = dict(sorted_items)
```

### Nested Dictionaries

```python
students = {
    "student1": {
        "name": "Alice",
        "age": 16,
        "classes": ["Math", "Physics"]
    },
    "student2": {
        "name": "Bob",
        "age": 17,
        "classes": ["Chemistry", "Biology"]
    }
}

# Access nested values
students["student1"]["name"]                     # "Alice"
students["student1"]["classes"][0]               # "Math"

# Modify nested values
students["student2"]["age"] = 18                  # Update age
students["student1"]["classes"].append("History") # Add to nested list
students["student1"]["classes"][0] = "Calculus"   # Modify list item

# Add new nested dictionary
students["student3"] = {
    "name": "Charlie",
    "age": 15,
    "classes": ["Art", "Drama"]
}

# Check key existence in nested dict
"classes" in students["student2"]               # True
"grade" in students["student1"]                 # False

# Safe nested access with chained get()
students.get("student3", {}).get("name", "N/A")  # "Charlie"
students.get("student4", {}).get("name", "N/A")  # "N/A" (student4 doesn't exist)
```

### Time Complexity
| Operation | Average | Worst | Example |
|-----------|---------|-------|---------|
| `dict[key]` | O(1) | O(n) | Access by key |
| `dict[key] = value` | O(1) | O(n) | Insert/update |
| `del dict[key]` | O(1) | O(n) | Delete |
| `in` | O(1) | O(n) | Key membership |
| `dict.get(key)` | O(1) | O(n) | Safe access |

## Sets

### Core Concept
Sets are **mutable, unordered collections of unique, hashable elements**.

### Creating Sets

```python
# Empty set (must use set(), not {})
s = set()

# With elements
numbers = {1, 2, 3, 4, 5}
mixed = {1, "hello", 3.14}

# From iterable
set([1, 2, 2, 3])                   # {1, 2, 3} (duplicates removed)
set("hello")                        # {'h', 'e', 'l', 'o'}

# Set comprehension: {expression for item in iterable if condition}
squares = {x**2 for x in range(5)}
# {0, 1, 4, 9, 16}

words = ["hello", "hi", "world", "hey"]
lengths = {len(word) for word in words}
# {2, 3, 5} (order may vary)
```

### Set Operations

**Adding/removing:**
```python
numbers = {1, 2, 3}

# add() - Add element
numbers.add(4)                      # {1, 2, 3, 4}

# remove() - Remove (raises KeyError if not found)
numbers.remove(2)                   # {1, 3, 4}

# discard() - Remove (no error if not found)
numbers.discard(10)                 # No error

# pop() - Remove and return arbitrary (any) element
numbers.pop()

# clear() - Remove all
numbers.clear()
```

**Set operations:**
```python
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

# Union (all unique elements)
a | b                               # {1, 2, 3, 4, 5, 6}
a.union(b)

# Intersection (common elements)
a & b                               # {3, 4}
a.intersection(b)

# Difference (in a but not in b)
a - b                               # {1, 2}
a.difference(b)

# Symmetric difference (in a or b, but not both)
a ^ b                               # {1, 2, 5, 6}
a.symmetric_difference(b)

# Subset/superset
{1, 2}.issubset({1, 2, 3})          # True
{1, 2, 3}.issuperset({1, 2})        # True
```

### Common Use Cases

**Remove duplicates:**
```python
items = [1, 2, 2, 3, 3, 3, 4]
unique = list(set(items))           # [1, 2, 3, 4] (order may vary)
```

**Membership testing:**
```python
# Fast O(1) lookup
valid_users = {"alice", "bob", "charlie"}

if username in valid_users:
    print("Valid user")
```

**Finding unique skills:**
```python
dev1_skills = {"Python", "Git", "SQL"}
dev2_skills = {"Java", "Git", "SQL"}

# All skills
all_skills = dev1_skills | dev2_skills

# Common skills
common = dev1_skills & dev2_skills

# Skills unique to dev1
unique_to_dev1 = dev1_skills - dev2_skills
```

### Time Complexity
| Operation | Average | Worst | Example |
|-----------|---------|-------|---------|
| `x in s` | O(1) | O(n) | Membership |
| `add(x)` | O(1) | O(n) | Add element |
| `remove(x)` | O(1) | O(n) | Remove |
| `s1 \| s2` | O(len(s1) + len(s2)) | O(len(s1) * len(s2)) | Union |
| `s1 & s2` | O(min(len(s1), len(s2))) | O(len(s1) * len(s2)) | Intersection |

## Built-in Functions

### map()

Apply function to every item in iterable.

```python
# map(function, iterable)

# Square numbers
numbers = [1, 2, 3, 4, 5]
squares = list(map(lambda x: x**2, numbers))
# [1, 4, 9, 16, 25]

# Convert to uppercase
names = ["alice", "bob", "charlie"]
upper = list(map(str.upper, names))
# ['ALICE', 'BOB', 'CHARLIE']

# Multiple iterables
a = [1, 2, 3]
b = [4, 5, 6]
result = list(map(lambda x, y: x + y, a, b))
# [5, 7, 9]
```

**Why wrap in `list()` or use with a for loop?**

`map()` returns an **iterator** (lazy evaluation), not a list. The **function** isn't applied until you consume the iterator.

```python
# map() returns an iterator object
result = map(str.upper, names)
print(result)              # <map object at 0x...>

# Need to consume it to get results
print(list(result))        # ['ALICE', 'BOB', 'CHARLIE']
print(list(result))        # [] (iterator exhausted!)

# Alternative: use with a for loop
result = map(str.upper, names)
for item in result:
    print(item)            # Prints each uppercase name

# To use the data multiple times, convert to a list
result = list(map(str.upper, names))
print(result)              # ['ALICE', 'BOB', 'CHARLIE']
print(result)              # ['ALICE', 'BOB', 'CHARLIE'] (works!)
```

**Benefits of lazy evaluation:**
- Memory efficient for large datasets (processes one item at a time)
- Only computes values when needed
- Can work with infinite sequences

### filter()

Filter items based on condition.

```python
# filter(function, iterable)

numbers = [1, 2, 3, 4, 5, 6]
evens = list(filter(lambda x: x % 2 == 0, numbers))
# [2, 4, 6]

# Filter non-empty strings
words = ["hello", "", "world", "", "python"]
non_empty = list(filter(None, words))  # Filter falsy values
# ['hello', 'world', 'python']
```

### zip()

Combine elements from multiple iterables.

```python
# zip(iterable1, iterable2, ...)

names = ["Alice", "Bob", "Charlie"]
scores = [85, 92, 78]

# Direct zipping
zipped = zip(names, scores)
print(list(zipped))
# [('Alice', 85), ('Bob', 92), ('Charlie', 78)]

# Parallel iteration
for name, score in zip(names, scores):
    print(f"{name}: {score}")

# Create dictionary
result = dict(zip(names, scores))
# {'Alice': 85, 'Bob': 92, 'Charlie': 78}

# Unzipping
pairs = [('a', 1), ('b', 2), ('c', 3)]
letters, numbers = zip(*pairs)
# letters = ('a', 'b', 'c'), numbers = (1, 2, 3)
```

**Note:** Stops at shortest iterable.

### enumerate()

Add counter to iterable.

```python
# enumerate(iterable, start=0)

fruits = ['apple', 'banana', 'cherry']

for index, fruit in enumerate(fruits):
    print(f"{index}: {fruit}")

# 0: apple
# 1: banana
# 2: cherry

# Start at 1
for index, fruit in enumerate(fruits, start=1):
    print(f"{index}. {fruit}")
```

### sorted() and reversed()

```python
numbers = [3, 1, 4, 1, 5, 9]

# sorted() - Returns new sorted list
sorted_nums = sorted(numbers)               # [1, 1, 3, 4, 5, 9]
sorted_desc = sorted(numbers, reverse=True) # [9, 5, 4, 3, 1, 1]

# Sort by key
words = ['apple', 'pie', 'banana']
sorted(words, key=len)                      # ['pie', 'apple', 'banana']

# reversed() - Returns iterator of items in reverse order (not sorted)
for num in reversed(numbers):
    print(num)  # Prints: 9, 5, 1, 4, 1, 3 (original order backwards)
```

### max() and min()

```python
# max() - Returns the largest item in an iterable
# min() - Returns the smallest item in an iterable
numbers = [3, 1, 4, 1, 5, 9]

max(numbers)                    # 9 (largest number)
min(numbers)                    # 1 (smallest number)

# With key function to determine comparison criteria
words = ['apple', 'pie', 'banana']
max(words, key=len)             # 'banana' (longest word by character count)

# With default (avoid error on empty iterable)
max([], default=0)              # 0 (returns default instead of raising ValueError)
```

### any() and all()

```python
# any() - True if any element is True
any([False, False, True])       # True
any([False, False, False])      # False

# Check if string contains digits
s = "abc3x"
any(c.isdigit() for c in s)     # True

# all() - True if all elements are True
all([True, True, True])         # True
all([True, False, True])        # False

# Check if all numbers are positive
numbers = [1, 2, 3, 4]
all(n > 0 for n in numbers)     # True
```

## Lambda Functions

Temporary or throwaway function.

### Syntax

```python
# lambda arguments: expression

# Single argument
square = lambda x: x**2
square(5)                   # 25

# Multiple arguments
add = lambda x, y: x + y
add(3, 5)                   # 8

# No arguments
get_pi = lambda: 3.14159
get_pi()                    # 3.14159
```

### Common Usage

**With map():**
```python
numbers = [1, 2, 3, 4, 5]
squares = list(map(lambda x: x**2, numbers))
```

**With filter():**
```python
numbers = [1, 2, 3, 4, 5, 6]
evens = list(filter(lambda x: x % 2 == 0, numbers))
```

**With sorted():**
```python
points = [(1, 5), (3, 2), (2, 8)]
sorted_points = sorted(points, key=lambda x: x[1])
# [(3, 2), (1, 5), (2, 8)] (sorted by second element)
```

**With max():**
```python
data = [{"name": "Alice", "age": 30}, {"name": "Bob", "age": 25}]
oldest = max(data, key=lambda x: x["age"])
# {'name': 'Alice', 'age': 30}
```

## Practice Exercises

### Strings
1. Reverse a string without using slicing
2. Check if a string is a palindrome
3. Count vowels in a string
4. Extract all words from a paragraph using regex

### Lists
1. Find the second largest number
2. Remove duplicates while preserving order
3. Rotate list by k positions
4. Merge two sorted lists

### Tuples
1. Find min and max in tuple without using built-in functions
2. Convert list of lists to list of tuples
3. Create a named tuple for a student record

### Dictionaries
1. Merge two dictionaries
2. Invert a dictionary (swap keys and values)
3. Count frequency of each word in a text
4. Group people by age from a list of records

### Sets
1. Find unique elements in two lists
2. Check if two strings are anagrams using sets
3. Find common elements in multiple lists

### Built-in Functions & Comprehensions
1. Use map() to convert list of strings to integers
2. Filter prime numbers from a list
3. Use zip() to create dictionary from two lists
4. Create list of squares using comprehension
5. Flatten 2D list using comprehension
