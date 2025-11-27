---
title: Reference
linkTitle: Reference
type: docs
weight: 9
prev: /python/08-working-with-data
---

## Common Patterns & Idioms

### Swap Variables

```python
# Pythonic
a, b = b, a

# Without temp variable (math trick)
a = a + b
b = a - b
a = a - b
```

### Conditional Assignment (Ternary)

```python
status = "adult" if age >= 18 else "minor"

# Chain ternary (use sparingly)
category = "low" if value < 3 else "medium" if value < 7 else "high"
```

### Default Values with `or`

```python
name = user_input or "Anonymous"
count = get_count() or 0

# Caution: Fails if 0 or "" are valid values
value = 0
result = value or 10  # Returns 10, not 0!
```

### Safe Dictionary Access

```python
# Use get() with default
value = d.get('key', 'default')

# Nested access
value = d.get('level1', {}).get('level2', 'default')

# setdefault for grouping
groups = {}
for item in items:
    groups.setdefault(item.category, []).append(item)
```

### List/Dict Unpacking

```python
# Unpack list
first, *rest = [1, 2, 3, 4]  # first=1, rest=[2,3,4]
first, *middle, last = [1, 2, 3, 4, 5]

# Unpack dict
d = {'a': 1, 'b': 2}
**d in function call passes as keyword arguments
```

### Enumerate with Start

```python
for i, item in enumerate(items, start=1):
    print(f"{i}. {item}")
```

### Zip for Parallel Iteration

```python
names = ['Alice', 'Bob']
ages = [30, 25]

for name, age in zip(names, ages):
    print(f"{name}: {age}")

# Create dict from two lists
d = dict(zip(names, ages))
```

### Flatten List

```python
# Simple nested list
nested = [[1, 2], [3, 4], [5]]
flat = [item for sublist in nested for item in sublist]

# Using itertools
import itertools
flat = list(itertools.chain.from_iterable(nested))
```

### Remove Duplicates (Preserve Order)

```python
# Using dict (Python 3.7+)
items = [1, 2, 2, 3, 1, 4]
unique = list(dict.fromkeys(items))

# Using seen set
def remove_duplicates(items):
    seen = set()
    result = []
    for item in items:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result
```

### Check if All/Any Elements Match

```python
# All elements satisfy condition
all(x > 0 for x in numbers)

# Any element satisfies condition
any(x < 0 for x in numbers)

# String contains digit
any(c.isdigit() for c in string)
```

### Find Index of Element

```python
items = ['a', 'b', 'c']

# Index of first occurrence
idx = items.index('b')  # 1

# With error handling
try:
    idx = items.index('x')
except ValueError:
    idx = -1

# All indices of element
indices = [i for i, x in enumerate(items) if x == 'b']
```

### Sort with Custom Key

```python
# Sort by length
words = ['apple', 'pie', 'banana']
sorted(words, key=len)

# Sort dict by value
d = {'a': 3, 'b': 1, 'c': 2}
sorted_items = sorted(d.items(), key=lambda x: x[1])
sorted_dict = dict(sorted_items)

# Multiple sort criteria
students = [('Alice', 85), ('Bob', 85), ('Charlie', 90)]
sorted(students, key=lambda x: (-x[1], x[0]))  # Score desc, name asc
```

## Gotchas & Pitfalls

### Mutable Default Arguments

```python
# Bad
def append_to(item, lst=[]):
    lst.append(item)
    return lst

append_to(1)  # [1]
append_to(2)  # [1, 2] - Unexpected!

# Good
def append_to(item, lst=None):
    if lst is None:
        lst = []
    lst.append(item)
    return lst
```

### Late Binding in Closures

```python
# Bad
functions = []
for i in range(3):
    functions.append(lambda: i)

for f in functions:
    print(f())  # 2, 2, 2 (all reference same i)

# Good: use default argument
functions = []
for i in range(3):
    functions.append(lambda i=i: i)

for f in functions:
    print(f())  # 0, 1, 2
```

### Modifying List While Iterating

```python
# Bad
numbers = [1, 2, 3, 4, 5]
for num in numbers:
    if num % 2 == 0:
        numbers.remove(num)  # Causes issues!

# Good: iterate over copy
for num in numbers[:]:
    if num % 2 == 0:
        numbers.remove(num)

# Better: use list comprehension
numbers = [n for n in numbers if n % 2 != 0]
```

### Integer Division

```python
# Python 3
10 / 3      # 3.3333... (true division)
10 // 3     # 3 (floor division)
-10 // 3    # -4 (rounds toward negative infinity)
```

### Truthy/Falsy Confusion

```python
value = 0
if value:  # False (0 is falsy)
    ...

# Explicit check when 0 is valid
if value is not None:
    ...
```

### String Concatenation in Loop

```python
# Slow (creates new string each time)
result = ""
for s in strings:
    result += s

# Fast (join is optimized)
result = "".join(strings)
```

### Exception Handling in Loop

```python
# Bad: Exception escapes loop
for item in items:
    process(item)  # Stops on first error

# Good: Handle per item
for item in items:
    try:
        process(item)
    except Exception as e:
        logging.error(f"Failed to process {item}: {e}")
        continue
```

## Cheat Sheets

### Time Complexity Quick Reference

| Operation | List | Set | Dict |
|-----------|------|-----|------|
| Access by index/key | O(1) | N/A | O(1)* |
| Search | O(n) | O(1)* | O(1)* |
| Insert (end/any) | O(1) | O(1)* | O(1)* |
| Insert (middle) | O(n) | N/A | N/A |
| Delete | O(n) | O(1)* | O(1)* |
| Iterate | O(n) | O(n) | O(n) |

*Average case; worst case O(n)

### String Methods

```python
s.upper(), s.lower(), s.title(), s.capitalize()
s.strip(), s.lstrip(), s.rstrip()
s.split(sep), s.join(iterable)
s.replace(old, new)
s.startswith(prefix), s.endswith(suffix)
s.find(sub), s.index(sub)
s.count(sub)
s.isdigit(), s.isalpha(), s.isalnum()
```

### List Methods

```python
lst.append(x)       # Add to end
lst.insert(i, x)    # Insert at index
lst.extend(iterable)  # Add multiple
lst.remove(x)       # Remove first occurrence
lst.pop()           # Remove last
lst.pop(i)          # Remove at index
lst.clear()         # Remove all
lst.index(x)        # Find index
lst.count(x)        # Count occurrences
lst.sort()          # Sort in-place
lst.reverse()       # Reverse in-place
```

### Dictionary Methods

```python
d.get(key, default)
d.setdefault(key, default)
d.keys(), d.values(), d.items()
d.pop(key), d.popitem()
d.clear()
d.update(other_dict)
d1 | d2             # Merge (Python 3.9+)
```

## Interview Prep

### Common Algorithm Patterns

**Two Pointers:**
```python
def two_sum_sorted(arr, target):
    left, right = 0, len(arr) - 1
    while left < right:
        current = arr[left] + arr[right]
        if current == target:
            return [left, right]
        elif current < target:
            left += 1
        else:
            right -= 1
    return None
```

**Sliding Window:**
```python
def max_sum_subarray(arr, k):
    window_sum = sum(arr[:k])
    max_sum = window_sum

    for i in range(k, len(arr)):
        window_sum += arr[i] - arr[i - k]
        max_sum = max(max_sum, window_sum)

    return max_sum
```

**Fast & Slow Pointers (Cycle Detection):**
```python
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False
```

**Binary Search:**
```python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1

    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1
```

**BFS (Level-order traversal):**
```python
from collections import deque

def bfs(root):
    if not root:
        return []

    queue = deque([root])
    result = []

    while queue:
        node = queue.popleft()
        result.append(node.val)

        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)

    return result
```

**DFS (Recursive):**
```python
def dfs(node, visited=None):
    if visited is None:
        visited = set()

    if node in visited:
        return

    visited.add(node)
    process(node)

    for neighbor in node.neighbors:
        dfs(neighbor, visited)
```

### Common Interview Questions

1. **Reverse a string**
2. **Check if palindrome**
3. **Find two numbers that sum to target (Two Sum)**
4. **Merge two sorted arrays**
5. **Find missing number in array**
6. **Detect cycle in linked list**
7. **Validate balanced parentheses**
8. **Find longest substring without repeating characters**
9. **Binary tree level-order traversal**
10. **Implement LRU cache**

### Tips

- **Clarify requirements** before coding
- **Think out loud** - explain your approach
- **Start with brute force**, then optimize
- **Test with edge cases**: empty input, single element, duplicates
- **Analyze time/space complexity**
- **Write clean, readable code**
- **Ask about trade-offs**: time vs space, readability vs performance

## Python Gotchas Summary

1. Mutable default arguments
2. Late binding in closures
3. Modifying list while iterating
4. Integer division behavior
5. Truthy/falsy values (0, "", [], etc.)
6. Dictionary key order (guaranteed in Python 3.7+)
7. Shallow vs deep copy
8. Global vs local scope
9. Iterator exhaustion (map, zip, generators)
10. String immutability

