---
title: Functions Deep Dive
linkTitle: Functions Deep Dive
type: docs
weight: 3
prev: /python/02-building-blocks
next: /python/04-error-handling
---

## Function Basics

### Defining Functions

```python
# Basic function
def greet():
    print("Hello!")

greet()  # Call the function

# Function with return value
def add(a, b):
    return a + b

result = add(3, 5)  # 8

# Multiple return values (returns tuple)
def get_user():
    return "Alice", 30, "alice@example.com"

name, age, email = get_user()

# Early return
def absolute_value(n):
    if n < 0:
        return -n   # Early return
    return n        # Normal return
```

### Function Documentation

```python
import math

def calculate_area(radius):
    """
    Calculate the area of a circle.

    Args:
        radius (float): The radius of the circle

    Returns:
        float: The area of the circle
    """
    return math.pi * radius ** 2

# Access docstring
print(calculate_area.__doc__)
help(calculate_area)
```

### Type Hints (Python 3.5+)

```python
def greet(name: str, age: int) -> str:
    return f"Hello {name}, age {age}"

# Type hints don't enforce types at runtime!
greet(123, "thirty")  # Works, but wrong types

# Use mypy for static type checking
# $ mypy script.py
```

## Parameters

**Terminology:**
- **Parameters** are the variables in the function definition
- **Arguments** are the actual values passed when calling the function

### Positional vs Default Parameters

```python
# Positional (required)
def greet(name):
    return f"Hello {name}"

greet("Alice")  # Required

# Default parameters (optional)
def greet(name, greeting="Hello"):
    return f"{greeting} {name}"

greet("Alice")           # "Hello Alice"
greet("Bob", "Hi")       # "Hi Bob"
```

### Positional and Keyword Arguments

```python
def describe_pet(animal, name, age=1):
    print(f"{animal} named {name}, age {age}")

# Positional (based on order)
describe_pet("dog", "Buddy")                # dog named Buddy, age 1

# Keyword (based on name)
describe_pet(name="Buddy", animal="dog")    # dog named Buddy, age 1

# Mixed (positional + keyword)
describe_pet("dog", name="Buddy", age=3)    # dog named Buddy, age 3

# ❌ SyntaxError
describe_pet(name="Buddy", "dog")           # Positional must come first
```

### *args - Variable Positional Parameters

```python
def sum_all(*args):
    """Accept any number of positional arguments"""
    return sum(args)

sum_all(1, 2, 3)            # 6
sum_all(1, 2, 3, 4, 5)      # 15

# args is a tuple
def print_args(*args):
    print(type(args))       # <class 'tuple'>
    for arg in args:
        print(arg)

print_args(1, 2, 3)
```

### **kwargs - Variable Keyword Parameters

```python
def print_info(**kwargs):
    """Accept any number of keyword arguments"""
    for key, value in kwargs.items():
        print(f"{key}: {value}")

print_info(name="Alice", age=30, city="NYC")
# name: Alice
# age: 30
# city: NYC

# kwargs is a dictionary
def print_kwargs(**kwargs):
    print(type(kwargs))     # <class 'dict'>
    return kwargs

print_kwargs(x=1, y=2)      # {'x': 1, 'y': 2}
```

### Combining All Parameter Types

**Order matters:** positional → *args → keyword → **kwargs

```python
def complex_function(a, b, *args, x=10, y=20, **kwargs):
    print(f"a={a}, b={b}")
    print(f"args={args}")
    print(f"x={x}, y={y}")
    print(f"kwargs={kwargs}")

complex_function(1, 2, 3, 4, x=100, y=200, z=300, w=400)
# a=1, b=2
# args=(3, 4)
# x=100, y=200
# kwargs={'z': 300, 'w': 400}
```

### Unpacking Arguments

```python
def add(a, b, c):
    return a + b + c

# Unpack list/tuple with *
numbers = [1, 2, 3]
add(*numbers)           # 6

# Unpack dictionary with **
values = {"a": 1, "b": 2, "c": 3}
add(**values)           # 6
```

### Positional-Only and Keyword-Only (Python 3.8+)

**Why use these?**
- `/` (positional-only): Lets you rename parameters later without breaking code; hides internal parameter names
- `*` (keyword-only): Forces explicit naming for clarity; prevents accidental mistakes with similar types
- These features are specialized tools, mainly used in library or API design

```python
# Positional-only (before /)
def func(a, b, /, c, d):
    pass

func(1, 2, 3, 4)        # OK
func(1, 2, c=3, d=4)    # OK
# func(a=1, b=2, c=3, d=4)  # Error: a, b must be positional

# Keyword-only (after *)
def func(a, b, *, c, d):
    pass

func(1, 2, c=3, d=4)    # OK
# func(1, 2, 3, 4)      # Error: c, d must be keyword

# Combine both
def func(a, /, b, *, c):
    pass
# a: positional-only
# b: either
# c: keyword-only
```

**Practical example:**
```python
# Good use case: prevent boolean confusion
def create_user(name, age, /, *, is_admin, is_active, send_email):
    """name/age can be renamed freely; booleans must be explicit"""
    pass

# Clear and readable
create_user("Alice", 30, is_admin=True, is_active=False, send_email=True)

# Built-in example: len()
len([1, 2, 3])          # OK
# len(obj=[1, 2, 3])    # Error: positional-only prevents this
```

## Variable Scope & Closures

### LEGB Rule

Python searches for variables in this order:
1. **L**ocal - Inside current function
2. **E**nclosing - Inside outer functions
3. **G**lobal - Module level
4. **B**uilt-in - Python built-ins

```python
x = "global"

def outer():
    x = "enclosing"

    def inner():
        x = "local"
        print(x)        # "local"

    inner()
    print(x)            # "enclosing"

outer()
print(x)                # "global"
```

### global and nonlocal

**When to use:**
- `global`: Modify module-level variables (use sparingly, prefer function parameters/returns)
- `nonlocal`: Modify outer function's variables (needed for closures that maintain state)

```python
# global - modify module-level variable
count = 0

def increment():
    global count        # Tell Python to use the module-level count
    count += 1

increment()
print(count)            # 1 - module-level count was modified

# nonlocal - modify outer function's variable
def make_counter():
    count = 0

    def increment():
        nonlocal count  # Tell Python to use the outer function's count
        count += 1
        return count

    return increment

counter = make_counter()    # Creates a counter, count starts at 0
print(counter())            # Calls increment(), count becomes 1, prints 1
print(counter())            # 2 - same count variable, remembered between calls
```

### Closures

- **What it is:** When an inner function uses a variable from its outer function, it becomes a closure (happens automatically)
- **When to use:** Pre-configure functions or maintain state without classes
- **Prime example:** Decorators (functions that wrap other functions)

```python
# Reading outer variable - no nonlocal needed
def make_multiplier(n):
    def multiply(x):
        return x * n    # Uses 'n' from outer scope → closure
    return multiply

times2 = make_multiplier(2)  # multiply remembers n=2
times3 = make_multiplier(3)  # multiply remembers n=3
print(times2(5))             # 10
print(times3(5))             # 15

# Modifying outer variable - requires nonlocal
def make_counter():
    count = 0

    def increment():
        nonlocal count  # Needed to modify count (not just read it)
        count += 1
        return count

    return increment

c1 = make_counter()
c2 = make_counter()
print(c1())             # 1
print(c1())             # 2
print(c2())             # 1 (independent counter)
```

## Generators & yield

### What are Generators?

Generators are functions that **yield values one at a time** instead of returning all at once. They create memory-efficient iterators.
- An iterator is an object that produces values on demand—you ask for the next value, and it gives you one at a time.

### Basic Generator

```python
def count_up_to(n):
    count = 1
    while count <= n:
        yield count     # Pauses and returns value
        count += 1

counter = count_up_to(5)
print(next(counter))    # 1
print(next(counter))    # 2

# Use in loop
for num in count_up_to(5):
    print(num)          # 1, 2, 3, 4, 5
```

### yield vs return

```python
# return - exits function and returns value
def return_example():
    return 1
    return 2            # Never executed
    return 3            # Never executed

# yield - pauses and resumes
def yield_example():
    yield 1             # Pause, return 1
    yield 2             # Resume, pause, return 2
    yield 3             # Resume, pause, return 3

for val in yield_example():
    print(val)          # 1, 2, 3
```

### Generator Expressions

- Similar to list comprehensions, but lazy (on-demand)

```python
# List comprehension (creates entire list in memory)
squares_list = [x**2 for x in range(1000000)]

# Generator expression (creates values on demand)
squares_gen = (x**2 for x in range(1000000))

# Consuming generator values one at a time
print(next(squares_gen))    # 0
print(next(squares_gen))    # 1
```

- Getting multiple values from a generator

```python
# Option 1: Using list comprehension with next()
squares_gen = (x**2 for x in range(1000000))
first_10 = [next(squares_gen) for _ in range(10)]
print(first_10)  # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

# Option 2: Using itertools.islice (more idiomatic)
import itertools
squares_gen = (x**2 for x in range(1000000))
first_10 = list(itertools.islice(squares_gen, 10))
print(first_10)  # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
```

### Practical Examples

**Read large file efficiently:**
```python
def read_large_file(file_path):
    with open(file_path, 'r') as f:
        for line in f:
            yield line.strip()

# Memory efficient - processes one line at a time
for line in read_large_file("huge.log"):
    if "ERROR" in line:
        print(line)
```

**Infinite sequence:**
```python
def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

# Generate first 10 Fibonacci numbers
fib = fibonacci()
for _ in range(10):
    print(next(fib))
```

**Pipeline pattern:**
```python
def numbers():
    for i in range(10):
        yield i

def squares(nums):
    for n in nums:
        yield n ** 2

def evens(nums):
    for n in nums:
        if n % 2 == 0:
            yield n

# Chain generators
result = evens(squares(numbers()))
print(list(result))     # [0, 4, 16, 36, 64]
```

### Generator Control Methods

Generators can be **controlled from the outside** while they're running using three methods: `.send()` (send values in), `.throw()` (inject exceptions), and `.close()` (clean shutdown). This makes them useful for building interactive processors, error-tolerant pipelines, and resource managers.

```python
def counter():
    count = 0
    while True:
        val = yield count
        if val is not None:
            count = val
        else:
            count += 1

c = counter()
print(next(c))          # 0
print(next(c))          # 1
print(c.send(10))       # Set count to 10, returns 10
print(next(c))          # 11
c.close()               # Stop generator
```

## Recursion

### What is Recursion?

A function that **calls itself** to solve a problem by breaking it into smaller subproblems.

### Why Use Recursion?

- **Natural problem representation**: Many problems (trees, graphs, divide-and-conquer) are inherently recursive, making recursive solutions more intuitive than iterative ones.
- **Code simplicity**: Recursive code mirrors the problem structure, often resulting in cleaner, more maintainable solutions.
- **When to use**: Choose recursion when the problem naturally breaks into similar subproblems. Avoid for deep recursion (stack overflow risk) or when simple iteration works equally well.

### How to Break Down Recursive Problems

Follow these steps to solve any recursive problem:

**1. Identify the simplest case (Base Case)**
   - What input needs no further recursion?
   - What should you return immediately?
   - Examples:
     - Sum of list: empty list `[]` → return `0`
     - Factorial: `n=0` or `n=1` → return `1`
     - Fibonacci: `n=0` → return `0`, `n=1` → return `1`

**2. Define the recursive pattern (Recursive Case)**
   - How can you make the problem smaller?
   - What operation connects the current step to the smaller problem?
   - Formula: `current_value + recursive_call(smaller_input)`

**3. Trust the recursion**
   - Assume your function works correctly for smaller inputs
   - Don't try to trace every level - focus on one level at a time

**4. Verify it works**
   - Test with the base case
   - Test with one step above the base case
   - Draw a small recursion tree if needed

**Example: Calculate factorial (n!)**

```python
# Step 1: Base case - simplest input
# What's the simplest factorial? 0! = 1 and 1! = 1

# Step 2: Recursive pattern - how to break it down
# 5! = 5 × 4!
# 4! = 4 × 3!
# n! = n × (n-1)!
# Pattern: multiply current number by factorial of (n-1)

# Step 3 & 4: Implement and trust
def factorial(n):
    # Base case - stop recursion
    if n <= 1:
        return 1

    # Recursive case - trust that factorial(n-1) works
    # Just focus on: current number × factorial of smaller number
    return n * factorial(n - 1)

factorial(5)  # 120 (5 × 4 × 3 × 2 × 1)
```

**Recursion tree showing call stack and return values:**
```
factorial(5)                          → 5 * factorial(4) = 5 * 24 = 120
└── factorial(4)                      → 4 * factorial(3) = 4 * 6 = 24
    └── factorial(3)                  → 3 * factorial(2) = 3 * 2 = 6
        └── factorial(2)              → 2 * factorial(1) = 2 * 1 = 2
            └── factorial(1)          → base case, returns 1

Flow: Calls go down, values return up
```

**Quick checklist:**
- ✓ Does it have a base case? (prevents infinite recursion)
- ✓ Does the recursive call use a smaller input? (ensures progress toward base case)
- ✓ Does it combine results correctly? (produces the right answer)

### Basic Structure

```python
def recursive_function(n):
    # Base case (stopping condition)
    if n <= 0:
        return

    # Recursive case
    print(n)
    recursive_function(n - 1)

recursive_function(5)   # 5, 4, 3, 2, 1
```

### Classic Examples

**Factorial:**
```python
def factorial(n):
    # Base case
    if n == 0 or n == 1:
        return 1

    # Recursive case
    return n * factorial(n - 1)

factorial(5)            # 120 (5 * 4 * 3 * 2 * 1)
```

**Fibonacci:**
```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

fibonacci(6)            # 8 (0, 1, 1, 2, 3, 5, 8)

# Warning: Exponential time O(2^n) - very slow!
```

**Sum of list:**
```python
def sum_list(nums):
    if not nums:
        return 0
    return nums[0] + sum_list(nums[1:])

sum_list([1, 2, 3, 4])  # 10
```

### Recursion vs Iteration

```python
# Recursive
def factorial_recursive(n):
    if n <= 1:
        return 1
    return n * factorial_recursive(n - 1)

# Iterative (usually more efficient)
def factorial_iterative(n):
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result
```

### Tail Recursion

Tail recursion is a form of recursion where the recursive call is the final step.

```python
# NOT tail recursive - multiplication happens AFTER the recursive call returns
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)  # Must wait for factorial(n-1), then multiply

# Tail recursive - recursive call is the LAST thing (no operation after)
def factorial_tail(n, acc=1):
    if n <= 1:
        return acc
    return factorial_tail(n - 1, n * acc)  # Direct return, no waiting

factorial_tail(5)  # 120
```

**How it works - Regular vs Tail Recursion:**

```
REGULAR RECURSION - Operations happen AFTER recursive call returns
factorial(5)
├─ return 5 * factorial(4)                       → WAITS for result
   └─ return 4 * factorial(3)                    → WAITS for result
      └─ return 3 * factorial(2)                 → WAITS for result
         └─ return 2 * factorial(1)              → WAITS for result
            └─ return 1                          → Finally returns 1
         ← multiply 2 * 1 = 2
      ← multiply 3 * 2 = 6
   ← multiply 4 * 6 = 24
← multiply 5 * 24 = 120

Call stack grows, then unwinds with multiplication at each level


TAIL RECURSION - All work done BEFORE recursive call (using accumulator)
factorial_tail(5, acc=1)
├─ return factorial_tail(4, acc=5)               → acc already has 5*1=5
   └─ return factorial_tail(3, acc=20)           → acc already has 4*5=20
      └─ return factorial_tail(2, acc=60)        → acc already has 3*20=60
         └─ return factorial_tail(1, acc=120)    → acc already has 2*60=120
            └─ return 120                        → base case, return acc

No unwinding needed! Result is already computed in 'acc' parameter
Each call just passes the result forward to the next call
```

**Key differences:**
- **Regular**: Work happens on the way back up (after recursive calls return)
- **Tail**: Work happens on the way down (before making recursive call)
- **Regular**: Needs to remember all pending operations (stack grows)
- **Tail**: No pending operations (accumulator carries the result)

**Key insight:** Some languages optimize tail recursion; Python does not. So it offers no performance benefit. It's mainly useful for understanding recursion patterns used in other languages.

### Recursion Limit

Python has a default recursion depth limit:

```python
import sys
print(sys.getrecursionlimit())  # Usually 1000

# Increase limit (use carefully!)
sys.setrecursionlimit(2000)
```

### Memoization (Optimize Recursion)

Cache results to avoid redundant calculations.

**The Problem: Redundant Calculations**

Naive recursive functions often recalculate the same values many times. For Fibonacci, `fib(5)` calculates `fib(3)` twice, `fib(2)` three times, and `fib(1)` five times:

```
fib(5)
├── fib(4)
│   ├── fib(3)
│   │   ├── fib(2)
│   │   │   ├── fib(1) ← Calculated
│   │   │   └── fib(0)
│   │   └── fib(1) ← RECALCULATED
│   └── fib(2) ← RECALCULATED (already did this above!)
│       ├── fib(1) ← RECALCULATED
│       └── fib(0)
└── fib(3) ← ENTIRE SUBTREE RECALCULATED
    ├── fib(2)
    │   ├── fib(1) ← RECALCULATED
    │   └── fib(0)
    └── fib(1) ← RECALCULATED
```

This grows exponentially! `fib(40)` makes **331+ million** function calls. This is why it's so slow.

**The Solution: Memoization (Caching)**

Memoization stores results in a dictionary the first time they're calculated, then reuses them instead of recalculating:

```python
# Without memoization - slow (exponential time)
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

fib(35)  # Takes several seconds (59+ million calls)
# fib(100) would take centuries!

# With memoization - fast (linear time)
def fib_memo(n, memo=None):
    if memo is None:
        memo = {}                # Create cache dictionary

    if n in memo:                # Check if already calculated
        return memo[n]           # Return cached result (instant!)

    if n <= 1:
        return n

    # Calculate once and store in cache
    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]

fib_memo(100)  # Returns instantly (only 100 calculations vs billions)

# Using functools.lru_cache (built-in memoization)
from functools import lru_cache

@lru_cache(maxsize=None)
def fib_cached(n):
    if n <= 1:
        return n
    return fib_cached(n - 1) + fib_cached(n - 2)

fib_cached(100)  # Fast! Cache managed automatically
fib_cached(500)  # Also fast! (naive version would never finish)
```

**How It Works:**

1. **First call** to `fib_memo(5)`:
   - Not in cache → calculate and store: `memo[5] = 5`

2. **Any future call** to `fib_memo(5)`:
   - Already in cache → return `memo[5]` immediately (no recursion!)

3. **Performance impact**:
   - Without memoization: O(2^n) - exponential growth
   - With memoization: O(n) - each value calculated once

**When to Use Memoization:**
- Recursive functions that recalculate the same inputs
- Dynamic programming problems
- Expensive computations with repeated inputs

### Practical Recursion Examples

**Tree traversal:**
```python
def print_tree(node, level=0):
    if node is None:
        return
    print("  " * level + str(node.value))
    for child in node.children:
        print_tree(child, level + 1)
```

**Directory traversal:**
```python
import os

def list_files(path):
    for item in os.listdir(path):
        full_path = os.path.join(path, item)
        if os.path.isdir(full_path):
            list_files(full_path)   # Recurse into subdirectory
        else:
            print(full_path)
```

**Flatten nested list:**
```python
def flatten(lst):
    result = []
    for item in lst:
        if isinstance(item, list):
            result.extend(flatten(item))  # Recursive
        else:
            result.append(item)
    return result

nested = [1, [2, 3], [4, [5, 6]], 7]
flatten(nested)         # [1, 2, 3, 4, 5, 6, 7]
```

## Function Best Practices

### 1. Single Responsibility

```python
# Bad: function does too much
def process_user(data):
    # Validate
    # Save to DB
    # Send email
    # Log
    pass

# Good: split responsibilities
def validate_user(data):
    pass

def save_user(user):
    pass

def send_welcome_email(user):
    pass
```

### 2. Use Descriptive Names

```python
# Bad
def calc(a, b):
    return a * b

# Good
def calculate_rectangle_area(width, height):
    return width * height
```

### 3. Avoid Mutable Default Arguments

```python
# Bad: default list is shared across calls
def append_to(item, lst=[]):
    lst.append(item)
    return lst

print(append_to(1))     # [1]
print(append_to(2))     # [1, 2] - Unexpected!

# Good: use None and create new list
def append_to(item, lst=None):
    if lst is None:
        lst = []
    lst.append(item)
    return lst
```

### 4. Return Early

```python
# Bad: nested ifs
def check_age(age):
    if age >= 0:
        if age < 18:
            return "minor"
        else:
            return "adult"
    else:
        return "invalid"

# Good: early returns
def check_age(age):
    if age < 0:
        return "invalid"
    if age < 18:
        return "minor"
    return "adult"
```

### 5. Pure Functions (When Possible)

```python
# Impure: modifies external state
total = 0
def add_to_total(n):
    global total
    total += n

# Pure: no side effects
def add(a, b):
    return a + b
```

## Practice Exercises

### Function Basics
1. Write a function to check if a number is prime
2. Create a function that returns the nth Fibonacci number
3. Write a function to reverse a string

### Parameters
1. Create a function that accepts any number of numbers and returns their average
2. Write a function with both *args and **kwargs that prints all arguments
3. Create a calculator function that accepts operation as keyword argument

### Closures
1. Create a function factory that generates custom greeting functions
2. Build a private counter using closures
3. Create a function that remembers all values it's been called with

### Generators
1. Write a generator that yields prime numbers
2. Create a generator for reading a file in chunks
3. Build a generator pipeline to filter and transform data

### Recursion
1. Implement binary search recursively
2. Calculate power (x^n) using recursion
3. Solve Tower of Hanoi problem
4. Find all permutations of a string recursively
5. Implement quick sort recursively
