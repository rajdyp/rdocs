---
title: OOP Fundamentals
linkTitle: OOP Fundamentals
type: docs
weight: 5
prev: /python/04-error-handling
next: /python/06-standard-library
---

> **Mental Model:** Function = verb, Class = noun that does verbs

## Classes & Objects Basics

### Why Classes?

Functions are great for **doing actions**, but when you need to **group data + behavior together**, classes are the answer.

```python
# Without classes: juggling variables
user_name = "Alice"
user_age = 30
user_email = "alice@example.com"

# With classes: organized bundle
class User:
    def __init__(self, name, age, email):
        self.name = name
        self.age = age
        self.email = email

user = User("Alice", 30, "alice@example.com")
```

### Defining a Class

```python
class Person:
    """A simple Person class"""

    # Class attribute (shared by all instances)
    species = "Homo sapiens"

    # Constructor (__init__ runs when creating object)
    def __init__(self, name, age):
        # Instance attributes (unique to each object)
        self.name = name
        self.age = age

    # Instance method
    def greet(self):
        return f"Hello, I'm {self.name}"

    # Method with parameters
    def celebrate_birthday(self):
        self.age += 1
        return f"Happy birthday! Now {self.age}"
```

### Creating Objects (Instances)

```python
# Create instances
alice = Person("Alice", 30)
bob = Person("Bob", 25)

# Access attributes
print(alice.name)           # "Alice"
print(bob.age)              # 25

# Call methods
print(alice.greet())        # "Hello, I'm Alice"
alice.celebrate_birthday()  # age becomes 31

# Access class attribute
print(alice.species)        # "Homo sapiens"
print(Person.species)       # "Homo sapiens"
```

## __init__ & Constructors

### The __init__ Method

`__init__` is called automatically when creating an object. It initializes instance attributes.

```python
class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance
        self.transactions = []

    def deposit(self, amount):
        self.balance += amount
        self.transactions.append(f"Deposit: +{amount}")

    def withdraw(self, amount):
        if amount > self.balance:
            return "Insufficient funds"
        self.balance -= amount
        self.transactions.append(f"Withdrawal: -{amount}")
        return f"Withdrew {amount}"

# Create account
account = BankAccount("Alice", 1000)
account.deposit(500)
account.withdraw(200)
print(account.balance)      # 1300
```

### self Explained

`self` refers to the **current instance** of the class.

```python
class Counter:
    def __init__(self, start=0):
        self.count = start  # self.count belongs to this specific instance

    def increment(self):
        self.count += 1     # Modify this instance's count

c1 = Counter(0)
c2 = Counter(10)

c1.increment()
c1.increment()

print(c1.count)             # 2
print(c2.count)             # 10 (independent!)
```

## Instance vs Class vs Static Methods

### Instance Methods

Standard methods that operate on instance data. Take `self` as first parameter.

```python
class Calculator:
    def __init__(self, value=0):
        self.value = value

    def add(self, n):
        self.value += n
        return self.value

calc = Calculator(10)
calc.add(5)                 # 15
```

### Class Methods

Operate on class itself, not instances. Take `cls` as first parameter. Use `@classmethod` decorator.

```python
class Person:
    count = 0

    def __init__(self, name):
        self.name = name
        Person.count += 1

    @classmethod
    def get_count(cls):
        return cls.count

    @classmethod
    def from_birth_year(cls, name, birth_year):
        """Alternative constructor"""
        import datetime
        age = datetime.datetime.now().year - birth_year
        return cls(name, age)

# Use class method
print(Person.get_count())   # 0

p1 = Person("Alice")
p2 = Person("Bob")
print(Person.get_count())   # 2

# Alternative constructor
p3 = Person.from_birth_year("Charlie", 1990)
```

### Static Methods

Don't operate on instance or class. Use `@staticmethod` decorator. Just regular functions organized within class.

```python
class MathUtils:
    @staticmethod
    def add(a, b):
        return a + b

    @staticmethod
    def is_even(n):
        return n % 2 == 0

# Call without creating instance
print(MathUtils.add(5, 3))      # 8
print(MathUtils.is_even(4))     # True
```

### When to Use Each?

```python
class Pizza:
    def __init__(self, ingredients):
        self.ingredients = ingredients

    # Instance method - operates on specific pizza
    def bake(self):
        return f"Baking pizza with {', '.join(self.ingredients)}"

    # Class method - operates on class, alternative constructor
    @classmethod
    def margherita(cls):
        return cls(["mozzarella", "tomatoes", "basil"])

    # Static method - utility, doesn't need instance or class
    @staticmethod
    def is_valid_topping(topping):
        invalid = ["pineapple"]  # Controversial!
        return topping not in invalid

# Instance method
pizza = Pizza(["cheese", "pepperoni"])
pizza.bake()

# Class method
margherita = Pizza.margherita()

# Static method
Pizza.is_valid_topping("mushroom")  # True
```

## Inheritance & Polymorphism

### Basic Inheritance

```python
# Parent class (base class)
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return "Some sound"

    def info(self):
        return f"I am {self.name}"

# Child class (derived class)
class Dog(Animal):
    def speak(self):
        return "Woof!"

class Cat(Animal):
    def speak(self):
        return "Meow!"

# Usage
dog = Dog("Buddy")
cat = Cat("Whiskers")

print(dog.info())       # "I am Buddy" (inherited method)
print(dog.speak())      # "Woof!" (overridden method)
print(cat.speak())      # "Meow!"
```

### Extending Parent Methods

```python
class Employee:
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    def give_raise(self, amount):
        self.salary += amount

class Manager(Employee):
    def __init__(self, name, salary, department):
        super().__init__(name, salary)  # Call parent __init__
        self.department = department

    def give_raise(self, amount):
        super().give_raise(amount)      # Call parent method
        print(f"{self.name} got a raise!")

mgr = Manager("Alice", 100000, "Engineering")
mgr.give_raise(10000)
print(mgr.salary)       # 110000
```

### Multiple Inheritance

```python
class Flyer:
    def fly(self):
        return "Flying"

class Swimmer:
    def swim(self):
        return "Swimming"

class Duck(Flyer, Swimmer):
    def quack(self):
        return "Quack!"

duck = Duck()
print(duck.fly())       # "Flying"
print(duck.swim())      # "Swimming"
print(duck.quack())     # "Quack!"
```

### Method Resolution Order (MRO)

```python
class A:
    def method(self):
        return "A"

class B(A):
    def method(self):
        return "B"

class C(A):
    def method(self):
        return "C"

class D(B, C):
    pass

d = D()
print(d.method())       # "B"
print(D.mro())          # Shows method resolution order
# [D, B, C, A, object]
```

### Polymorphism

Same interface, different implementations:

```python
class Shape:
    def area(self):
        raise NotImplementedError("Subclass must implement")

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius

    def area(self):
        import math
        return math.pi * self.radius ** 2

# Polymorphism in action
shapes = [Rectangle(3, 4), Circle(5), Rectangle(2, 6)]

for shape in shapes:
    print(f"Area: {shape.area()}")  # Calls appropriate method
```

## Magic/Dunder Methods

Methods with double underscores that provide "magic" behavior.

### __str__ and __repr__

```python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def __str__(self):
        """User-friendly string (for print)"""
        return f"{self.name}, age {self.age}"

    def __repr__(self):
        """Developer-friendly string (for debugging)"""
        return f"Person('{self.name}', {self.age})"

p = Person("Alice", 30)
print(str(p))           # "Alice, age 30"
print(repr(p))          # "Person('Alice', 30)"
print(p)                # Uses __str__ if available
```

### Comparison Methods

```python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def __eq__(self, other):
        """Equal =="""
        return self.age == other.age

    def __lt__(self, other):
        """Less than <"""
        return self.age < other.age

    def __le__(self, other):
        """Less than or equal <="""
        return self.age <= other.age

p1 = Person("Alice", 30)
p2 = Person("Bob", 25)
p3 = Person("Charlie", 30)

print(p1 == p3)         # True (same age)
print(p2 < p1)          # True (Bob younger)

# Now can sort
people = [p1, p2, p3]
people.sort()           # Sorts by age
```

### Arithmetic Methods

```python
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        """Addition +"""
        return Vector(self.x + other.x, self.y + other.y)

    def __mul__(self, scalar):
        """Multiplication *"""
        return Vector(self.x * scalar, self.y * scalar)

    def __str__(self):
        return f"Vector({self.x}, {self.y})"

v1 = Vector(1, 2)
v2 = Vector(3, 4)
v3 = v1 + v2            # Uses __add__
v4 = v1 * 3             # Uses __mul__

print(v3)               # Vector(4, 6)
print(v4)               # Vector(3, 6)
```

### Container Methods

```python
class Playlist:
    def __init__(self):
        self.songs = []

    def __len__(self):
        """len()"""
        return len(self.songs)

    def __getitem__(self, index):
        """playlist[index]"""
        return self.songs[index]

    def __setitem__(self, index, value):
        """playlist[index] = value"""
        self.songs[index] = value

    def __contains__(self, item):
        """item in playlist"""
        return item in self.songs

    def add(self, song):
        self.songs.append(song)

playlist = Playlist()
playlist.add("Song 1")
playlist.add("Song 2")

print(len(playlist))    # 2
print(playlist[0])      # "Song 1"
print("Song 1" in playlist)  # True
```

### Context Manager Methods

```python
class FileManager:
    def __init__(self, filename, mode):
        self.filename = filename
        self.mode = mode
        self.file = None

    def __enter__(self):
        """Called when entering 'with' block"""
        self.file = open(self.filename, self.mode)
        return self.file

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Called when exiting 'with' block"""
        if self.file:
            self.file.close()
        return False

# Usage
with FileManager("test.txt", "w") as f:
    f.write("Hello")
# File automatically closed
```

## Properties & Descriptors

### Properties (@property)

Control attribute access with getter/setter logic:

```python
class Temperature:
    def __init__(self, celsius):
        self._celsius = celsius

    @property
    def celsius(self):
        """Getter"""
        return self._celsius

    @celsius.setter
    def celsius(self, value):
        """Setter"""
        if value < -273.15:
            raise ValueError("Below absolute zero!")
        self._celsius = value

    @property
    def fahrenheit(self):
        """Computed property"""
        return self._celsius * 9/5 + 32

temp = Temperature(25)
print(temp.celsius)     # 25
print(temp.fahrenheit)  # 77.0

temp.celsius = 30       # Uses setter
# temp.celsius = -300   # Raises ValueError
```

### Read-only Properties

```python
class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):
        return self._radius

    @property
    def area(self):
        """Read-only computed property"""
        import math
        return math.pi * self._radius ** 2

    @property
    def circumference(self):
        """Read-only computed property"""
        import math
        return 2 * math.pi * self._radius

circle = Circle(5)
print(circle.area)          # 78.54
# circle.area = 100         # AttributeError (read-only)
```

## Dataclasses

Simplified class creation for data storage (Python 3.7+):

```python
from dataclasses import dataclass, field

@dataclass
class Person:
    name: str
    age: int
    email: str = "unknown@example.com"  # Default value

    def greet(self):
        return f"Hello, I'm {self.name}"

# Automatically creates __init__, __repr__, __eq__
p = Person("Alice", 30)
print(p)                # Person(name='Alice', age=30, email='unknown@example.com')

# Comparison
p2 = Person("Alice", 30)
print(p == p2)          # True
```

### Advanced Dataclass Features

```python
from dataclasses import dataclass, field
from typing import List

@dataclass(frozen=True)  # Immutable
class Point:
    x: float
    y: float

@dataclass
class Inventory:
    items: List[str] = field(default_factory=list)  # Mutable default
    count: int = field(default=0, init=False)       # Not in __init__

    def __post_init__(self):
        """Called after __init__"""
        self.count = len(self.items)

inv = Inventory(["apple", "banana"])
print(inv.count)        # 2
```

## Encapsulation & Access Control

Python doesn't have true private attributes, but uses naming conventions:

```python
class BankAccount:
    def __init__(self, balance):
        self.public = "Anyone can access"
        self._protected = "Convention: internal use"
        self.__private = "Name mangled"

    def get_balance(self):
        return self.__private

account = BankAccount(1000)

print(account.public)               # OK
print(account._protected)           # Works, but discouraged
# print(account.__private)          # AttributeError

# Name mangling allows access (if really needed)
print(account._BankAccount__private)  # 1000
```

## Practice Exercises

### Basics
1. Create a `Book` class with title, author, and pages
2. Add a method to check if book is a novel (pages > 200)
3. Implement `__str__` for readable output

### Inheritance
1. Create `Vehicle` base class and `Car`, `Bike` subclasses
2. Implement method overriding for `start_engine()`
3. Add a `describe()` method that uses both parent and child attributes

### Properties
1. Create `Rectangle` with width/height properties and computed `area`
2. Add validation: width and height must be positive
3. Implement read-only `perimeter` property

### Dataclasses
1. Create `Student` dataclass with name, grades list
2. Add method to calculate average grade
3. Implement comparison based on average

### Magic Methods
1. Create `Money` class supporting +, -, *, /
2. Implement comparison methods
3. Make it work with `sorted()`
