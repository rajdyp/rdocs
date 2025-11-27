---
title: Error Handling
linkTitle: Error Handling
type: docs
weight: 4
prev: /python/03-functions-deep-dive
next: /python/05-oop-fundamentals
---

## Try/Except/Finally

### Basic Exception Handling

```python
# Without error handling - program crashes
result = 10 / 0         # ZeroDivisionError

# With error handling - program continues
try:
    result = 10 / 0
except ZeroDivisionError:
    print("Cannot divide by zero")
    result = None
```

### Catching Multiple Exceptions

```python
# Catch specific exceptions
try:
    value = int(input("Enter number: "))
    result = 10 / value
except ValueError:
    print("Invalid number")
except ZeroDivisionError:
    print("Cannot divide by zero")

# Catch multiple exceptions together
try:
    value = int(input("Enter number: "))
    result = 10 / value
except (ValueError, ZeroDivisionError) as e:
    print(f"Error: {e}")
```

### else Clause

Executes only if no exception occurs

```python
try:
    value = int(input("Enter number: "))
    result = 10 / value
except ValueError:
    print("Invalid input")
except ZeroDivisionError:
    print("Cannot divide by zero")
else:
    print(f"Result: {result}")  # Runs if no exception
```

### finally Clause

Always executes, whether exception occurs or not

```python
f = None
try:
    f = open("file.txt", "r")
    data = f.read()
except FileNotFoundError:
    print("File not found")
finally:
    if f is not None:
        f.close()  # Always close file if it was opened
    print("Cleanup done")
```

**Note:** In practice, use `with open(...)` context manager which handles cleanup automatically and avoids this issue entirely.

### Complete Pattern

```python
try:
    # Code that might raise exception
    risky_operation()
except SpecificError as e:
    # Handle specific error
    handle_error(e)
except AnotherError as e:
    # Handle another error
    handle_another_error(e)
else:
    # Runs if no exception
    success_action()
finally:
    # Always runs (cleanup)
    cleanup()
```

## Exception Hierarchy

### Common Built-in Exceptions

```
BaseException
├── SystemExit
├── KeyboardInterrupt
├── Exception
    ├── ArithmeticError
    │   ├── ZeroDivisionError
    │   ├── OverflowError
    │   └── FloatingPointError
    ├── LookupError
    │   ├── IndexError
    │   └── KeyError
    ├── TypeError
    ├── ValueError
    ├── NameError
    ├── AttributeError
    ├── IOError / OSError
    │   ├── FileNotFoundError
    │   └── PermissionError
    └── ImportError
        └── ModuleNotFoundError
```

### Common Exceptions

```python
# ZeroDivisionError
result = 10 / 0

# ValueError
int("abc")

# TypeError
"hello" + 5

# IndexError
lst = [1, 2, 3]
lst[10]

# KeyError
d = {"a": 1}
d["b"]

# AttributeError
x = 5
x.append(10)

# FileNotFoundError
open("nonexistent.txt")

# NameError
print(undefined_variable)

# ImportError
import nonexistent_module
```

### Catching Base Exceptions

**Rule:** Catch specific exceptions you can handle, not all exceptions you might encounter. Broad catches hide bugs, mask unexpected errors, and prevent proper recovery logic.

```python
# Catch any exception (not recommended)
try:
    risky_code()
except Exception as e:
    print(f"An error occurred: {e}")

# Better: catch specific exceptions
try:
    risky_code()
except (ValueError, TypeError) as e:
    print(f"Input error: {e}")
except IOError as e:
    print(f"File error: {e}")
```

## Custom Exceptions

### Creating Custom Exceptions

```python
# Basic custom exception
class CustomError(Exception):
    pass

# Custom exception with message
class ValidationError(Exception):
    def __init__(self, field, message):
        self.field = field
        self.message = message
        super().__init__(f"{field}: {message}")

# Usage
def validate_age(age):
    if age < 0:
        raise ValidationError("age", "Cannot be negative")
    if age > 150:
        raise ValidationError("age", "Unrealistic value")

try:
    validate_age(-5)
except ValidationError as e:
    print(e)                    # "age: Cannot be negative"
    print(e.field)              # "age"
    print(e.message)            # "Cannot be negative"
```

### Exception Hierarchy for Applications

```python
class AppError(Exception):
    """Base exception for application"""
    pass

class DatabaseError(AppError):
    """Database-related errors"""
    pass

class APIError(AppError):
    """API-related errors"""
    pass

class ValidationError(AppError):
    """Input validation errors"""
    pass

# Usage
try:
    risky_operation()
except ValidationError:
    # Handle validation errors
    pass
except DatabaseError:
    # Handle database errors
    pass
except AppError:
    # Catch all other app errors
    pass
```

## Context Managers (with statement)

### What are Context Managers?

Context managers handle resource setup and cleanup automatically using the `with` statement.

### Built-in Context Managers

**File operations:**
```python
# Without context manager (manual cleanup)
f = open("file.txt", "r")
try:
    data = f.read()
finally:
    f.close()  # Must remember to close

# With context manager (automatic cleanup)
with open("file.txt", "r") as f:
    data = f.read()
# File automatically closed
```

**Multiple resources:**
```python
with open("input.txt", "r") as infile, open("output.txt", "w") as outfile:
    for line in infile:
        outfile.write(line.upper())
```

### Creating Custom Context Managers

**Using __enter__ and __exit__:**
```python
class DatabaseConnection:
    def __init__(self, db_name):
        self.db_name = db_name
        self.connection = None

    def __enter__(self):
        print(f"Connecting to {self.db_name}")
        self.connection = f"Connection to {self.db_name}"
        return self.connection

    def __exit__(self, exc_type, exc_val, exc_tb):
        print(f"Closing connection to {self.db_name}")
        self.connection = None
        # Return False to propagate exceptions
        # Return True to suppress exceptions
        return False

# Usage
with DatabaseConnection("mydb") as conn:
    print(f"Using {conn}")
# Connection automatically closed
```

**Using contextlib.contextmanager:**
```python
from contextlib import contextmanager

@contextmanager
def timer():
    import time
    start = time.time()
    try:
        yield
    finally:
        end = time.time()
        print(f"Elapsed: {end - start:.2f}s")

# Usage
with timer():
    # Code to time
    sum(range(1000000))
# Prints: Elapsed: 0.05s
```

### When to Create Custom Context Managers

**Mental Model:** Create a context manager when you have **paired setup and teardown operations** that must always run together — even if an exception occurs.

**The Key Question:** “If I do X, must I always undo/cleanup Y — no matter what?” If yes → use a context manager.

**Common Scenarios:**

1. **Temporary State Changes**
   - Change something, then restore it
   - Examples: current directory, environment variables, config settings, logging levels

2. **Resource Acquisition/Release**
   - Get a resource, then release it (when stdlib doesn't provide one)
   - Examples: locks, network connections, hardware interfaces, API sessions

3. **Transaction-like Operations**
   - Start something, then commit or rollback
   - Examples: database transactions, atomic file writes, batch operations

4. **Timing/Monitoring**
   - Mark start, then record end
   - Examples: performance timing, profiling, progress tracking

5. **Testing Utilities**
   - Set up test condition, then clean up
   - Examples: mock patches, temporary directories, test fixtures

**Recognition Pattern:**
```python
# If you write this pattern repeatedly...
setup()
try:
    do_work()
finally:
    cleanup()

# ...consider creating a context manager instead:
with managed_operation():
    do_work()
```

**Remember:** Most databases, files, and locks already provide context managers. Only create custom ones when you have a **new** setup/cleanup pattern that's not already handled.

### Common Context Manager Examples

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

# Usage
print(os.getcwd())      # /home/user
with cd("/tmp"):
    print(os.getcwd())  # /tmp
print(os.getcwd())      # /home/user (restored)
```

**Suppress specific exceptions:**
```python
from contextlib import suppress

# Without suppress
try:
    os.remove("file.txt")
except FileNotFoundError:
    pass

# With suppress
with suppress(FileNotFoundError):
    os.remove("file.txt")
```

**Redirect stdout:**
```python
from contextlib import redirect_stdout
import io

f = io.StringIO()
with redirect_stdout(f):
    print("This goes to StringIO")
    print("Not to console")

output = f.getvalue()
print(output)  # Prints captured output
```

## Exception Handling Strategy

### When to Raise vs When to Catch

**Raise when writing libraries/functions:**

Functions and libraries should detect invalid states and raise exceptions to signal problems. They shouldn't decide how to handle the error.

```python
def divide(a, b):
    if b == 0:
        raise ValueError("Divisor cannot be zero")
    return a / b

def validate_user(user_data):
    if not user_data.get("email"):
        raise ValueError("Email is required")
    if "@" not in user_data["email"]:
        raise ValueError("Invalid email format")
    return True
```

**Use try/except when calling code:**

Application code that calls functions should catch and handle exceptions based on the context.

```python
# In application/API layer - decide how to respond
try:
    result = divide(10, user_input)
except ValueError as e:
    print(f"Error: {e}")
    result = None

# In web application - convert to HTTP response
try:
    validate_user(request_data)
except ValueError as e:
    return {"error": str(e), "status": 400}
```

**Guideline:** Detect errors where they occur (raise), handle them where you know what to do (try/except).

### Re-raising Exceptions

**When to re-raise:**
- You need to log/monitor the error but can't handle it
- You want to add cleanup logic but still propagate the error
- You catch to check the error type, but some cases should bubble up

```python
# Log and re-raise
try:
    critical_operation()
except DatabaseError as e:
    logging.error(f"Database failed: {e}")
    cleanup_resources()
    raise  # Re-raise same exception with original traceback

# Partial recovery then re-raise
try:
    process_batch(items)
except ValidationError as e:
    save_failed_items(items)  # Save what we can
    raise  # Let caller know batch failed
```

### Exception Chaining

**When to use `raise ... from e`:**
- Converting low-level exceptions to higher-level ones
- Adding business context to technical errors
- You want to preserve the original error for debugging

**When to use `raise ... from None`:**
- The original exception is irrelevant/confusing to users
- Migrating from old error types to new ones
- The underlying implementation detail shouldn't leak

```python
# Chain exceptions - preserve both errors
try:
    data = json.loads(text)
except json.JSONDecodeError as e:
    # User sees: "Failed to parse config"
    # Developer sees: "Invalid control character at position 15"
    raise ConfigurationError("Failed to parse config") from e

# Suppress original exception - hide implementation
try:
    old_method()  # Deprecated API
except OldAPIError:
    # User only sees new error, not confusing old one
    raise NewAPIError("Use new_method() instead") from None
```

**Rule of thumb:** Use `from e` when debugging matters, `from None` when the original error adds no value.

## Best Practices

### 1. Catch Specific Exceptions

```python
# Bad: catches everything
try:
    risky_code()
except:
    print("Something went wrong")

# Bad: too broad
try:
    risky_code()
except Exception:
    print("Error occurred")

# Good: specific exceptions
try:
    value = int(user_input)
    result = 10 / value
except ValueError:
    print("Invalid number format")
except ZeroDivisionError:
    print("Cannot divide by zero")
```

### 2. Don't Silently Ignore Errors

```python
# Bad: silent failure
try:
    critical_operation()
except Exception:
    pass  # Error lost!

# Good: log or handle
import logging

try:
    critical_operation()
except Exception as e:
    logging.error(f"Operation failed: {e}")
    raise  # Re-raise if critical
```

### 3. Use finally for Cleanup

```python
# Good: ensure cleanup
resource = acquire_resource()
try:
    use_resource(resource)
except Exception as e:
    handle_error(e)
finally:
    release_resource(resource)  # Always runs
```

### 4. Fail Fast

```python
# Good: validate early
def process_data(data):
    if not data:
        raise ValueError("Data cannot be empty")
    if not isinstance(data, list):
        raise TypeError("Data must be a list")

    # Process data
    return result
```

### 5. Provide Useful Error Messages

```python
# Bad: vague message
raise ValueError("Invalid input")

# Good: specific message
raise ValueError(f"Expected positive integer, got {value}")
```

## Logging Errors

### Basic Logging

```python
import logging

logging.basicConfig(level=logging.ERROR)

try:
    result = risky_operation()
except Exception as e:
    logging.error(f"Operation failed: {e}")
```

### Logging with Traceback

```python
import logging

try:
    result = 10 / 0
except ZeroDivisionError:
    logging.exception("Division by zero occurred")
# Logs error with full traceback
```

### Structured Error Handling

```python
import logging

logger = logging.getLogger(__name__)

def process_file(filename):
    try:
        with open(filename) as f:
            data = f.read()
            return parse_data(data)
    except FileNotFoundError:
        logger.error(f"File not found: {filename}")
        return None
    except PermissionError:
        logger.error(f"Permission denied: {filename}")
        return None
    except Exception as e:
        logger.exception(f"Unexpected error processing {filename}")
        raise
```

## Assertions

### When to Use Assertions

Assertions are for **internal checks** that should never fail in correct code.

```python
def calculate_average(numbers):
    assert len(numbers) > 0, "List cannot be empty"
    return sum(numbers) / len(numbers)

# Assertion fails if condition is false
calculate_average([])  # AssertionError: List cannot be empty
```

### Assertions vs Exceptions

```python
# Use exceptions for expected errors (user input, external data)
def divide(a, b):
    if b == 0:
        raise ValueError("Divisor cannot be zero")
    return a / b

# Use assertions for programmer errors (bugs)
def process_results(results):
    assert isinstance(results, list), "Results must be a list"
    assert len(results) > 0, "Results cannot be empty"
    # Process results
```

**Important:** Assertions can be disabled with `python -O`, so never use them for critical checks!

## Practice Exercises

### Try/Except/Finally
1. Write a function that safely converts string to int with error handling
2. Create a file reader that handles missing files gracefully
3. Implement a calculator with comprehensive error handling

### Custom Exceptions
1. Create a custom exception hierarchy for a banking application
2. Build a validation framework with custom exceptions
3. Implement a retry mechanism with custom timeout exception

### Context Managers
1. Create a context manager for timing code execution
2. Build a context manager for database transactions (simulate rollback on error)
3. Implement a context manager that temporarily modifies environment variables

### Best Practices
1. Refactor error-prone code to use proper exception handling
2. Add logging to an existing function
3. Create a robust data processing pipeline with error recovery
