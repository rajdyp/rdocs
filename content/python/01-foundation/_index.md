---
title: Foundation
linkTitle: Foundation
type: docs
weight: 1
prev: /python
next: /python/02-building-blocks
---

## Variables & Types

### Core Concept
Variables in Python are **labels that reference objects in memory**. Python uses dynamic typing—you don't declare types explicitly.

### Variable Assignment
```python
# Simple assignment
name = "Alice"
age = 30
pi = 3.14159

# Multiple assignment
x, y, z = 1, 2, 3

# Swapping
x, y = y, x
```

### Built-in Data Types

**Numeric Types:**
```python
count = 100                 # int
price = 19.99               # float
z = 3 + 4j                  # complex
```

**Text Type:**
```python
message = "Hello"           # str
multiline = """Multi
line text"""
raw_string = r"C:\path"     # Raw string
```

**Boolean:**
```python
is_valid = True             # bool
has_error = False           # bool
```

**None Type:**
```python
result = None               # NoneType
```

### Type Checking & Conversion

```python
# Checking
type(42)                        # <class 'int'>
isinstance(42, int)             # True
isinstance(3.14, (int, float))  # True (matches either type in tuple)

# Converting
int("42")                   # 42
float("3.14")               # 3.14
str(42)                     # "42"
bool(0)                     # False
```

### Variable Naming Rules

**Valid:**
```python
user_name = "Alice"         # snake_case (preferred)
user1 = "Bob"
_private = "hidden"
__dunder__ = "special"
```

**Constants (convention):**
```python
PI = 3.14159
MAX_CONNECTIONS = 100
```

### Variables are References

```python
a = [1, 2, 3]
b = a               # b references same list
b.append(4)
print(a)            # [1, 2, 3, 4] - modified!

# Create independent copy
b = a.copy()
```

### Identity vs Equality

```python
a = [1, 2, 3]
b = [1, 2, 3]

a == b              # True (same value)
a is b              # False (different objects)
a is None           # Use 'is' (not ==) for None checks
```

## Operators & Expressions

### Arithmetic Operators

```python
5 + 3               # 8 (addition)
10 - 4              # 6 (subtraction)
7 * 6               # 42 (multiplication)
15 / 4              # 3.75 (division - always float)
15 // 4             # 3 (floor division)
15 % 4              # 3 (modulo - remainder)
2 ** 3              # 8 (exponentiation)
```

**Precedence:** Parentheses → Exponents → Multiply/Divide → Add/Subtract

```python
2 + 3 * 4           # 14 (not 20)
(2 + 3) * 4         # 20
```

### Comparison Operators

```python
5 == 5              # True (equal)
5 != 6              # True (not equal)
10 > 5              # True (greater than)
3 < 7               # True (less than)
5 >= 5              # True (greater or equal)
4 <= 4              # True (less or equal)

# Chained comparisons (Pythonic!)
1 < x < 10          # Equivalent to: 1 < x and x < 10
```

### Logical Operators

```python
True and True       # True
True and False      # False
True or False       # True
not True            # False

# Precedence: 'and' before 'or'
True or False and False     # True (evaluated as: True or (False and False))
```

**Short-circuit evaluation:** Python stops evaluating an expression as soon as the final result is known, without looking at the rest.

```python
False and expensive_function()  # expensive_function() never called
True or expensive_function()    # expensive_function() never called
```

### Assignment Operators

```python
x = 10
x += 5              # x = x + 5
x -= 3              # x = x - 3
x *= 2              # x = x * 2
x /= 4              # x = x / 4
x //= 2             # x = x // 2
x %= 2              # x = x % 2
x **= 3             # x = x ** 3

# Walrus operator (Python 3.8+): Assign a value AND use that value in the same expression
if (n := len(data)) > 10:
    print(f"List has {n} elements")

# 1. len(data) is evaluated
# 2. Result is assigned to n
# 3. That same result is returned and compared with > 10
```

### Identity & Membership Operators

```python
# Identity
a is b              # Same object?
a is not b
a is None           # Preferred for None checks

# Membership
'a' in 'abc'                # True
5 in [1, 2, 3]              # False
'key' in {'key': 'value'}   # True
```

### Ternary Operator

```python
status = "adult" if age >= 18 else "minor"

# Equivalent to:
if age >= 18:
    status = "adult"
else:
    status = "minor"
```

## Control Flow

### if Statements

```python
# Basic if
if age >= 18:
    print("Adult")

# if-else
if temperature > 30:
    print("Hot")
else:
    print("Comfortable")

# if-elif-else
if score >= 90:
    grade = 'A'
elif score >= 80:
    grade = 'B'
elif score >= 70:
    grade = 'C'
else:
    grade = 'F'
```

### match-case Statements

**Python 3.10+** introduced `match-case` for pattern matching—a cleaner alternative to long if-elif-else chains.

**Basic syntax:**
```python
# match-case
command = "start"

match command:
    case "start":
        print("Starting...")
    case "stop":
        print("Stopping...")
    case "pause":
        print("Pausing...")
    case _:                         # Wildcard (like 'else')
        print("Unknown command")

# Equivalent if-elif-else version
if command == "start":
    print("Starting...")
elif command == "stop":
    print("Stopping...")
elif command == "pause":
    print("Pausing...")
else:
    print("Unknown command")
```

**Multiple patterns with |:**
```python
match status_code:
    case 200 | 201 | 204:
        print("Success")
    case 400 | 401 | 403:
        print("Client error")
    case 500 | 502 | 503:
        print("Server error")
    case _:
        print("Unknown status")
```

**Guard clauses (conditions):**
```python
match score:
    case x if x >= 90:
        grade = 'A'
    case x if x >= 80:
        grade = 'B'
    case x if x >= 70:
        grade = 'C'
    case _:
        grade = 'F'
```

**When to use match-case:**
- ✅ Multiple specific value checks (like status codes, commands, menu options)
- ✅ When you have many elif branches checking the same variable
- ❌ Simple 2-3 conditions (if-else is clearer)
- ❌ Range checks like `x >= 90` (if-elif is more readable)
- ❌ Python versions below 3.10 (not available)

### for Loops

**Iterating sequences:**
```python
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)

# String iteration
for char in "Python":
    print(char)
```

**Using range():**
```python
for i in range(5):          # 0, 1, 2, 3, 4
    print(i)

for i in range(2, 7):       # 2, 3, 4, 5, 6
    print(i)

for i in range(0, 10, 2):   # 0, 2, 4, 6, 8
    print(i)
```

**enumerate()** - Get index and value while looping
```python
fruits = ["apple", "banana", "cherry"]
for index, fruit in enumerate(fruits):
    print(f"{index}: {fruit}")

# Start at 1
for index, fruit in enumerate(fruits, start=1):
    print(f"{index}. {fruit}")
```

**Dictionary iteration:**
```python
student = {"name": "Alice", "age": 20}

for key in student:                     # Keys
    print(key)

for value in student.values():          # Values
    print(value)

for key, value in student.items():      # Key-value pairs
    print(f"{key}: {value}")
```

**Nested loops:**

> **Mental Model** - Nested loops are like a clock with multiple hands:
> - Outer loop is like the hour hand
> - Inner loop is like the minute hand
> - For every tick of the hour hand, the minute hand runs through a full circle

```python
for i in range(3):          # Outer loop
    for j in range(3):      # Inner loop
        print(f"{i}, {j}")

# Step 1: Outer loop starts
i = 0

# Step 2: Inner loop runs fully
For i = 0, inner loop runs: j = 0, 1, 2

# Step 3: Outer loop ticks forward
i = 1

# Step 4: Inner loop runs fully again
For i = 1, inner loop runs: j = 0, 1, 2

# Output
0 0
0 1
0 2
1 0
1 1
1 2
```

### while Loops

```python
count = 0
while count < 5:
    print(count)
    count += 1

# Infinite loop with break
while True:
    command = input("Enter command (or 'quit'): ")
    if command == "quit":
        break
```

### Loop Control

**break** - Exit loop
```python
for num in numbers:
    if num % 2 == 0:
        print(f"First even: {num}")
        break
```

**continue** - Skip iteration
```python
for i in range(10):
    if i % 2 == 0:
        continue        # Skip even numbers
    print(i)
```

**pass** - Placeholder
```python
for i in range(10):
    if i % 2 == 0:
        pass            # TODO: implement logic
    else:
        print(i)
```

### for-else and while-else

The `else` executes only if loop completes normally (no `break`).

```python
for num in numbers:
    if num % 2 == 0:
        print("Found even")
        break
else:
    print("No even numbers")    # Runs if break never happens
```

### Variable Scope in Loops

> **Key Concept** - Inside vs Outside Loop Declarations
> - **Declared inside loop** → Resets on every iteration
> - **Declared outside loop** → Defined once, persists across iterations

```python
# Variable declared OUTSIDE loop - persists
total = 0
for i in range(5):
    total += i          # total accumulates across iterations
print(total)            # Output: 10

# Variable declared INSIDE loop - resets
for i in range(5):
    count = 0           # Resets to 0 every iteration
    count += i
    print(count)        # Output: 0, 1, 2, 3, 4

# Works the same with while loops
result = 0              # Outside: persists
i = 0
while i < 3:
    result += i         # Accumulates: 0, 1, 3
    i += 1
print(result)           # Output: 3
```

### Common Patterns

**Input validation** - Because user input is unreliable
```python
while True:
    try:
        age = int(input("Enter age: "))
        if 0 <= age <= 150:
            break
        print("Invalid age")
    except ValueError:
        print("Please enter a number")

# 1. Loop forever (while True)
# 2. Try to convert input to an integer (int(...))
# 3. If conversion fails → catch the error (ValueError)
# 4. If conversion succeeds → check if the value is acceptable
# 5. Break out of the loop only when the input is valid
```

**zip()** - Parallel iteration
```python
names = ["Alice", "Bob", "Charlie"]
scores = [85, 92, 78]

for name, score in zip(names, scores):
    print(f"{name}: {score}")
```

**Accumulator pattern:** - Start with an initial value, update it in each loop, end with a final result.
```python
# Sum
total = 0
for num in numbers:
    total += num

# Build list
squares = []
for i in range(1, 6):
    squares.append(i ** 2)
```

## Truthiness & Falsiness

### Falsy Values

Values that evaluate to `False` in boolean context:

```python
# Numbers
bool(0)             # False
bool(0.0)           # False
bool(0j)            # False

# Empty sequences
bool("")            # False (empty string)
bool([])            # False (empty list)
bool(())            # False (empty tuple)
bool({})            # False (empty dict)
bool(set())         # False (empty set)

# None
bool(None)          # False
```

### Truthy Values

Everything else evaluates to `True`:

```python
bool(1)             # True
bool(-1)            # True
bool(3.14)          # True
bool("text")        # True
bool([1])           # True
bool([0])           # True (non-empty list)
bool({"key": "value"})  # True
```

### Practical Usage

```python
# Check if list has items
items = []
if items:           # False (empty list)
    print("Has items")

# Check if string is non-empty
text = ""
if text:            # False (empty string)
    print("Has text")

# Default values with 'or'
name = user_input or "Anonymous"
count = get_count() or 0

# Skip empty/commented lines
for line in lines:
    if not line.strip() or line.startswith("#"):
        continue
```

### Gotchas

**Problem: Zero is falsy**

Using `or` for default values can backfire when `0` is a valid value:

```python
# PROBLEM: 0 gets replaced with default
def set_timeout(seconds):
    timeout = seconds or 30  # If seconds=0, timeout becomes 30!
    return timeout

set_timeout(0)       # Returns 30 (Wrong! 0 was intentional)
set_timeout(5)       # Returns 5 (Correct)
set_timeout(None)    # Returns 30 (Correct)

# SOLUTION: Explicitly check for None
def set_timeout(seconds):
    timeout = 30 if seconds is None else seconds
    return timeout

set_timeout(0)       # Returns 0 (Correct!)
set_timeout(None)    # Returns 30 (Correct)
```

**Problem: Empty string is falsy**

Similar issue with empty strings when they're valid values:

```python
# PROBLEM: Empty string gets replaced
user_input = ""
name = user_input or "Anonymous"    # "Anonymous" (but "" might be intentional)

# SOLUTION: Check specifically for None or missing input
name = "Anonymous" if user_input is None else user_input
# OR
if user_input is not None:
    name = user_input
```

**Problem: Confusing empty checks**

```python
items = []

# AMBIGUOUS: What are we really checking?
if not items:           # Empty? Or None? Or False?
    print("No items")

# CLEAR: Explicit intent
if len(items) == 0:     # Checking if empty
    print("No items")

if items is None:       # Checking if None
    print("Items not initialized")

if items == []:         # Checking if empty list specifically
    print("Empty list")
```

**When to use truthiness vs explicit checks:**

```python
# GOOD: Use truthiness for actual boolean logic
if items:                       # Natural: "if there are items"
    process(items)

if not text.strip():            # Natural: "if text is blank"
    print("Empty line")

# GOOD: Use explicit checks when values matter
if value is not None:           # Clear: distinguishing None from 0/False
    process(value)

if count == 0:                  # Clear: specifically checking for zero
    print("Nothing to process")

if status is False:             # Clear: checking boolean False (not just falsy)
    print("Explicitly disabled")
```

## Big O Complexity

### What is Big O?

Big O describes **how runtime scales as input size (n) grows**. It ignores constants and focuses on the dominant term.

### Common Complexities

| Big O | Name | Example | When n = 1,000 | If n doubles? |
|-------|------|---------|----------------|---------------|
| O(1) | Constant | Array index access, hash lookup | 1 operation | No change |
| O(log n) | Logarithmic | Binary search | ~10 operations | +1 step |
| O(n) | Linear | Loop through n items | 1,000 operations | Doubles |
| O(n log n) | Linearithmic | Merge sort, Quick sort | ~10,000 operations | Slightly more than doubles |
| O(n²) | Quadratic | Nested loops | 1,000,000 operations | Quadruples |
| O(2ⁿ) | Exponential | Recursive Fibonacci | 2^1000 (impossible) | Squares |
| O(n!) | Factorial | Brute-force permutations | 1000! (impossible) | Explodes |

### Understanding log n

**log₂ n** (base 2) = Number of times we can halve n to get to 1

```
8 → 4 → 2 → 1  (3 steps, log₂ 8 = 3)
```

### Understanding n log n

**n log n** = n multiplied by the number of times we can halve n to get to 1

```
For n = 8: 8 × log₂ 8 = 8 × 3 = 24 operations
```

### Code Examples

**O(1) - Constant:**
```python
# Always same number of operations
arr[5]              # Direct access
dict["key"]         # Hash lookup
```

**O(log n) - Logarithmic:**
```python
# Binary search (halves search space each time)
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

**O(n) - Linear:**
```python
# Loop through all items once
for item in items:
    print(item)

# Find max
max_val = items[0]
for item in items:
    if item > max_val:
        max_val = item
```

**O(n log n) - Linearithmic:**
```python
# Merge sort, Quick sort (average case)
sorted_list = sorted(items)     # Python's Timsort is O(n log n)
items.sort()                    # In-place sort
```

**O(n²) - Quadratic:**
```python
# Nested loops
for i in range(n):
    for j in range(n):
        print(i, j)

# Bubble sort
for i in range(len(arr)):
    for j in range(len(arr) - 1):
        if arr[j] > arr[j + 1]:
            arr[j], arr[j + 1] = arr[j + 1], arr[j]
```

**O(2ⁿ) - Exponential:**
```python
# Naive recursive Fibonacci
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)
```

### Space Complexity

Big O also applies to **memory usage**:

```python
# O(1) space - constant extra memory
def sum_list(arr):
    total = 0           # One variable
    for num in arr:
        total += num
    return total

# O(n) space - memory grows with input
def double_list(arr):
    result = []         # New list of size n
    for num in arr:
        result.append(num * 2)
    return result
```

### Key Insights

**1. Drop constants** - Big O cares about growth rate, not exact operations

```python
# Algorithm A: Loop twice
for item in items:      # n operations
    process(item)
for item in items:      # n operations
    validate(item)
# Total: 2n operations → O(n)

# Algorithm B: Loop once
for item in items:      # n operations
    process(item)
    validate(item)
# Total: n operations → O(n)

# Both are O(n) because when n = 1 million:
# A: 2,000,000 operations
# B: 1,000,000 operations
# The difference (2x) is constant, both scale linearly
```

**2. Keep dominant term** - Larger terms matter more as n grows

```python
# Algorithm with multiple parts
def process_data(items):
    # Part 1: Single loop
    for item in items:              # O(n)
        quick_process(item)

    # Part 2: Nested loop
    for i in items:                 # O(n²)
        for j in items:
            compare(i, j)

    # Total: O(n) + O(n²) = O(n²)
    # We drop O(n) because n² dominates

# Why? Look at the numbers:
# n = 100
# O(n) part: 100 operations
# O(n²) part: 10,000 operations
# The n² part overwhelms the n part

# n = 1,000
# O(n) part: 1,000 operations (tiny)
# O(n²) part: 1,000,000 operations (huge!)
# Adding 1,000 to 1,000,000 barely changes it
```

**3. Best/Average/Worst case scenarios matter**

The same algorithm can perform very differently depending on the input:

```python
# Quick Sort example
def quick_sort(arr):
    # Pick pivot, partition, recursively sort
    pass

# BEST CASE: O(n log n)
# Input: [5, 3, 7, 1, 9, 2, 8]
# Pivot always splits array evenly
# Tree depth: log n, work at each level: n
arr_best = [5, 3, 7, 1, 9, 2, 8]

# AVERAGE CASE: O(n log n)
# Input: Random data
# Pivot usually splits reasonably well
arr_avg = [random.randint(1, 100) for _ in range(100)]

# WORST CASE: O(n²)
# Input: [1, 2, 3, 4, 5, 6, 7, 8, 9]
# Already sorted! Pivot creates unbalanced splits
# Tree depth: n, work at each level: n
arr_worst = [1, 2, 3, 4, 5, 6, 7, 8, 9]

# For n = 1,000:
# Best/Average: ~10,000 operations
# Worst: 1,000,000 operations (100x slower!)
```

**4. Linear search in sorted array**

```python
def find_value(arr, target):
    for i, val in enumerate(arr):
        if val == target:
            return i
    return -1

# BEST CASE: O(1)
# Target is first element
find_value([5, 10, 15, 20], 5)      # Found immediately!

# AVERAGE CASE: O(n/2) → O(n)
# Target is somewhere in the middle
find_value([5, 10, 15, 20], 15)     # Check ~half the array

# WORST CASE: O(n)
# Target is last element or not present
find_value([5, 10, 15, 20], 20)     # Must check entire array
find_value([5, 10, 15, 20], 99)     # Check all, then fail
```

**Why this matters:**

- **Drop constants**: Focus on choosing the right algorithm (O(n) vs O(n²)), not micro-optimizations
- **Dominant term**: In complex code, identify the slowest part and optimize that first
- **Best/Avg/Worst**: Know your data! Sorted data might make Quick Sort terrible but Binary Search great

### Optimization Tips

```python
# Bad: O(n²) - searching in list
for item in large_list:
    if item in another_large_list:  # O(n) lookup
        process(item)

# Good: O(n) - use set for O(1) lookup
lookup_set = set(another_large_list)
for item in large_list:
    if item in lookup_set:          # O(1) lookup
        process(item)
```

## Practice Exercises

### Variables & Types
1. Create variables for student: name, age, grade, enrolled status
2. Swap two variables without temp variable
3. Check variable type using isinstance()

### Operators
1. Calculate compound interest
2. Check if year is leap year
3. Implement FizzBuzz logic (divisible by 3, 5, or both)

### Control Flow
1. Print multiplication table (1-10)
2. Find factorial using loop
3. Check if number is prime
4. Generate Fibonacci sequence
5. Count vowels in a string

### Big O
1. Identify time complexity of given code snippets
2. Optimize nested loop by using dictionary/set
3. Compare performance: list vs set membership testing
