---
title: Advanced Functions
linkTitle: Advanced Functions
type: docs
weight: 7
prev: /python/06-standard-library
next: /python/08-working-with-data
---

## Decorators Deep Dive

### What are Decorators?

Decorators are functions that **wrap other functions** to extend or modify their behavior without changing their code.

> **Analogy:** Like putting a protective case on your phone — same phone, but with extra functionality.

### Basic Decorator Pattern

```python
def my_decorator(func):
    def wrapper(*args, **kwargs):
        # Before function
        print(f"Calling {func.__name__}")

        # Call original function
        result = func(*args, **kwargs)

        # After function
        print(f"Finished {func.__name__}")
        return result

    return wrapper

# Apply decorator
@my_decorator
def greet(name):
    return f"Hello {name}"

greet("Alice")
# Calling greet
# Hello Alice
# Finished greet
```

### Decorators with Arguments

```python
def repeat(times):
    """Decorator factory that takes arguments"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(times=3)
def say_hello():
    print("Hello!")

say_hello()
# Hello!
# Hello!
# Hello!
```

### Practical Decorators

**Timer decorator:**
```python
import time
from functools import wraps

def timer(func):
    @wraps(func)  # Preserves original function metadata
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end - start:.4f}s")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(1)
    return "Done"

slow_function()
# slow_function took 1.0012s
```

**Retry decorator:**
```python
import time
from functools import wraps

def retry(max_attempts=3, delay=1):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts:
                        raise
                    print(f"Attempt {attempt} failed: {e}. Retrying in {delay}s...")
                    time.sleep(delay)
        return wrapper
    return decorator

@retry(max_attempts=3, delay=2)
def flaky_api_call():
    import random
    if random.random() < 0.7:
        raise ConnectionError("API unavailable")
    return "Success"
```

**Cache decorator:**
```python
def cache(func):
    cached = {}

    @wraps(func)
    def wrapper(*args):
        if args not in cached:
            cached[args] = func(*args)
        return cached[args]
    return wrapper

@cache
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

fibonacci(100)  # Fast with caching!
```

**Authorization decorator:**
```python
def requires_auth(func):
    @wraps(func)
    def wrapper(user, *args, **kwargs):
        if not user.is_authenticated:
            raise PermissionError("User not authenticated")
        return func(user, *args, **kwargs)
    return wrapper

@requires_auth
def view_profile(user):
    return f"Profile for {user.name}"
```

### Class-based Decorators

```python
class CountCalls:
    def __init__(self, func):
        self.func = func
        self.count = 0

    def __call__(self, *args, **kwargs):
        self.count += 1
        print(f"Call {self.count} of {self.func.__name__}")
        return self.func(*args, **kwargs)

@CountCalls
def say_hello():
    print("Hello!")

say_hello()  # Call 1
say_hello()  # Call 2
```

### Stacking Decorators

```python
@decorator1
@decorator2
@decorator3
def function():
    pass

# Equivalent to:
# function = decorator1(decorator2(decorator3(function)))
```

## functools

### wraps

Preserve function metadata when decorating:

```python
from functools import wraps

def my_decorator(func):
    @wraps(func)  # Preserves __name__, __doc__, etc.
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper
```

### lru_cache

LRU (Least Recently Used) cache for function results:

```python
from functools import lru_cache

@lru_cache(maxsize=128)  # Cache up to 128 results
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

fibonacci(100)      # Fast!

# Check cache stats
print(fibonacci.cache_info())
# CacheInfo(hits=98, misses=101, maxsize=128, currsize=101)

# Clear cache
fibonacci.cache_clear()
```

### partial

Create functions with pre-filled arguments:

```python
from functools import partial

def power(base, exponent):
    return base ** exponent

# Create specialized functions
square = partial(power, exponent=2)
cube = partial(power, exponent=3)

square(5)           # 25
cube(5)             # 125

# Practical example
from operator import mul
double = partial(mul, 2)
triple = partial(mul, 3)

double(10)          # 20
triple(10)          # 30
```

### reduce

Apply function cumulatively to items:

```python
from functools import reduce

# Sum all numbers
numbers = [1, 2, 3, 4, 5]
total = reduce(lambda x, y: x + y, numbers)
# ((((1 + 2) + 3) + 4) + 5) = 15

# Product
product = reduce(lambda x, y: x * y, numbers, 1)
# 120

# Find maximum
maximum = reduce(lambda x, y: x if x > y else y, numbers)
# 5
```

### singledispatch

Function overloading based on type:

```python
from functools import singledispatch

@singledispatch
def process(data):
    print(f"Processing generic data: {data}")

@process.register(int)
def _(data):
    print(f"Processing integer: {data * 2}")

@process.register(str)
def _(data):
    print(f"Processing string: {data.upper()}")

@process.register(list)
def _(data):
    print(f"Processing list of {len(data)} items")

process(42)         # Processing integer: 84
process("hello")    # Processing string: HELLO
process([1, 2, 3])  # Processing list of 3 items
```

## itertools

### Infinite Iterators

```python
import itertools

# count(start, step) - infinite counter
for i in itertools.count(10, 2):
    if i > 20:
        break
    print(i)  # 10, 12, 14, 16, 18, 20

# cycle(iterable) - repeat infinitely
colors = itertools.cycle(['red', 'green', 'blue'])
for _ in range(5):
    print(next(colors))
# red, green, blue, red, green

# repeat(elem, times) - repeat element
for x in itertools.repeat(5, 3):
    print(x)  # 5, 5, 5
```

### Combinatoric Iterators

```python
# combinations(iterable, r) - all r-length combinations
list(itertools.combinations([1, 2, 3], 2))
# [(1, 2), (1, 3), (2, 3)]

# combinations_with_replacement
list(itertools.combinations_with_replacement([1, 2], 2))
# [(1, 1), (1, 2), (2, 2)]

# permutations(iterable, r) - all r-length permutations
list(itertools.permutations([1, 2, 3], 2))
# [(1, 2), (1, 3), (2, 1), (2, 3), (3, 1), (3, 2)]

# product(*iterables) - Cartesian product
list(itertools.product([1, 2], ['a', 'b']))
# [(1, 'a'), (1, 'b'), (2, 'a'), (2, 'b')]

# Nested loops equivalent
list(itertools.product(range(2), repeat=3))
# [(0,0,0), (0,0,1), (0,1,0), ..., (1,1,1)]
```

### Terminating Iterators

```python
# chain(*iterables) - concatenate iterables
list(itertools.chain([1, 2], [3, 4], [5]))
# [1, 2, 3, 4, 5]

# compress(data, selectors) - filter by boolean mask
list(itertools.compress('ABCDEF', [1, 0, 1, 0, 1, 1]))
# ['A', 'C', 'E', 'F']

# dropwhile(predicate, iterable) - drop while true
list(itertools.dropwhile(lambda x: x < 5, [1, 3, 6, 2, 1]))
# [6, 2, 1]

# takewhile(predicate, iterable) - take while true
list(itertools.takewhile(lambda x: x < 5, [1, 3, 6, 2, 1]))
# [1, 3]

# groupby(iterable, key) - group consecutive items
data = [('a', 1), ('a', 2), ('b', 3), ('b', 4)]
for key, group in itertools.groupby(data, lambda x: x[0]):
    print(key, list(group))
# a [('a', 1), ('a', 2)]
# b [('b', 3), ('b', 4)]

# islice(iterable, start, stop, step) - slice iterator
list(itertools.islice(range(10), 2, 8, 2))
# [2, 4, 6]

# zip_longest(*iterables, fillvalue) - zip with padding
list(itertools.zip_longest([1, 2], ['a', 'b', 'c'], fillvalue='?'))
# [(1, 'a'), (2, 'b'), ('?', 'c')]
```

### Practical Examples

**Sliding window:**
```python
def sliding_window(iterable, n):
    """Sliding window of size n"""
    iterators = itertools.tee(iterable, n)
    for i, it in enumerate(iterators):
        for _ in range(i):
            next(it, None)
    return zip(*iterators)

list(sliding_window([1, 2, 3, 4, 5], 3))
# [(1, 2, 3), (2, 3, 4), (3, 4, 5)]
```

**Flatten nested lists:**
```python
nested = [[1, 2], [3, 4], [5]]
flat = list(itertools.chain.from_iterable(nested))
# [1, 2, 3, 4, 5]
```

**Pagination:**
```python
def paginate(iterable, page_size):
    """Split iterable into pages"""
    iterator = iter(iterable)
    while True:
        page = list(itertools.islice(iterator, page_size))
        if not page:
            break
        yield page

for page in paginate(range(10), 3):
    print(page)
# [0, 1, 2]
# [3, 4, 5]
# [6, 7, 8]
# [9]
```

## Context Managers (Creating Custom Ones)

### Using contextlib.contextmanager

```python
from contextlib import contextmanager

@contextmanager
def temporary_file(filename):
    """Create file, yield it, then delete"""
    try:
        f = open(filename, 'w')
        yield f
    finally:
        f.close()
        import os
        os.remove(filename)

with temporary_file('temp.txt') as f:
    f.write('temporary data')
# File automatically deleted
```

### Practical Context Managers

**Change directory temporarily:**
```python
import os
from contextlib import contextmanager

@contextmanager
def cd(path):
    old_path = os.getcwd()
    os.chdir(path)
    try:
        yield
    finally:
        os.chdir(old_path)

with cd('/tmp'):
    # Do work in /tmp
    pass
# Back to original directory
```

**Timer context manager:**
```python
import time
from contextlib import contextmanager

@contextmanager
def timer(label):
    start = time.time()
    try:
        yield
    finally:
        end = time.time()
        print(f"{label}: {end - start:.4f}s")

with timer("Database query"):
    # Expensive operation
    time.sleep(0.5)
# Database query: 0.5001s
```

**Suppress exceptions:**
```python
from contextlib import suppress

# Without suppress
try:
    os.remove('nonexistent.txt')
except FileNotFoundError:
    pass

# With suppress
with suppress(FileNotFoundError):
    os.remove('nonexistent.txt')
```

**Redirect stdout:**
```python
from contextlib import redirect_stdout
import io

f = io.StringIO()
with redirect_stdout(f):
    print("This goes to StringIO")

captured = f.getvalue()
```

**Database transaction:**
```python
@contextmanager
def transaction(connection):
    """Commit on success, rollback on error"""
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise

with transaction(db_connection) as conn:
    conn.execute("INSERT INTO ...")
    conn.execute("UPDATE ...")
# Auto-commits on success, rolls back on error
```

**Lock for thread safety:**
```python
from threading import Lock
from contextlib import contextmanager

lock = Lock()

@contextmanager
def synchronized():
    lock.acquire()
    try:
        yield
    finally:
        lock.release()

with synchronized():
    # Thread-safe code
    pass
```

## Performance Tips

### When to Use What

**Decorators:**
- Cross-cutting concerns (logging, timing, auth)
- Modify function behavior consistently
- Add metadata or validation

**functools:**
- `lru_cache` for expensive, pure functions
- `partial` to create specialized functions
- `reduce` for cumulative operations

**itertools:**
- Memory-efficient iteration over large datasets
- Combinatorial problems
- Data transformation pipelines

**Context Managers:**
- Resource management (files, locks, connections)
- Setup/teardown patterns
- Temporary state changes

## Practice Exercises

### Decorators
1. Create a `@validate` decorator that checks function arguments
2. Build a `@memoize` decorator from scratch
3. Implement a `@rate_limit` decorator

### functools
1. Use `lru_cache` to optimize recursive function
2. Create specialized sorting functions with `partial`
3. Implement `map`-like function using `reduce`

### itertools
1. Generate all possible passwords of length n
2. Implement batching for API calls
3. Find longest consecutive sequence in data

### Context Managers
1. Create context manager for database transactions
2. Build a profiler context manager
3. Implement temporary environment variable setter
