---
title: Basics
type: docs
weight: 1
prev: /python
---

# Python Basics

Essential Python fundamentals and syntax.

## Data Types

```python
# Numbers
integer = 42
floating = 3.14
complex_num = 2 + 3j

# Strings
text = "Hello, World!"
multiline = """
This is a
multiline string
"""

# Boolean
is_active = True
is_deleted = False

# Lists (mutable)
fruits = ["apple", "banana", "orange"]

# Tuples (immutable)
coordinates = (10, 20)

# Dictionaries
person = {
    "name": "John",
    "age": 30,
    "city": "New York"
}

# Sets
unique_numbers = {1, 2, 3, 4, 5}
```

## Control Flow

### If-Elif-Else

```python
age = 18

if age < 18:
    print("Minor")
elif age == 18:
    print("Just became adult")
else:
    print("Adult")
```

### Loops

```python
# For loop
for i in range(5):
    print(i)

for fruit in fruits:
    print(fruit)

# While loop
count = 0
while count < 5:
    print(count)
    count += 1

# List comprehension
squares = [x**2 for x in range(10)]
```

## Functions

```python
# Basic function
def greet(name):
    return f"Hello, {name}!"

# Default parameters
def power(base, exponent=2):
    return base ** exponent

# Multiple return values
def get_coordinates():
    return 10, 20

x, y = get_coordinates()

# Lambda functions
square = lambda x: x**2
```

## Common String Operations

```python
text = "Hello, World!"

# Length
len(text)  # 13

# Case conversion
text.upper()  # "HELLO, WORLD!"
text.lower()  # "hello, world!"

# Split and join
words = text.split(", ")  # ["Hello", "World!"]
joined = "-".join(words)  # "Hello-World!"

# Format strings
name = "Alice"
age = 25
message = f"{name} is {age} years old"
```
