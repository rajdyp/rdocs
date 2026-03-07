---
title: "OOP Fundamentals Quiz"
linkTitle: OOP Fundamentals
type: docs
weight: 5
prev: /quiz/python/04-error-handling
next: /quiz/python/06-standard-library
---

{{< quiz id="python-oop-fundamentals-quiz" >}}
{
  "questions": [
    {
      "id": "python-oop-fundamentals-quiz-01",
      "type": "mcq",
      "question": "What is the primary purpose of the `__init__` method in a Python class?",
      "options": [
        "To create a new instance of the class in memory",
        "To initialize instance attributes when an object is created",
        "To define the string representation of the class",
        "To allocate memory for the class definition"
      ],
      "answer": 1,
      "explanation": "`__init__` is the initializer that runs automatically when an object is created. Its job is to set up the initial state by assigning instance attributes via `self`. Memory allocation is handled by `__new__`, which runs before `__init__`.",
      "hint": "Think about what happens immediately after `Person(\"Alice\", 30)` is called."
    },
    {
      "id": "python-oop-fundamentals-quiz-02",
      "type": "true-false",
      "question": "A class attribute defined outside `__init__` is shared across all instances, while an instance attribute set via `self.attr = value` inside `__init__` is unique to each object.",
      "answer": true,
      "explanation": "Class attributes live on the class itself and are shared by all instances. Instance attributes are stored on each individual object. This distinction becomes critical with mutable class attributes (like lists), where one instance mutating the shared object affects all others.",
      "hint": "Consider where `species = 'Homo sapiens'` vs. `self.name = name` each live."
    },
    {
      "id": "python-oop-fundamentals-quiz-03",
      "type": "fill-blank",
      "question": "A method decorated with `@classmethod` receives `_____` as its first parameter instead of `self`, giving it access to the class rather than an instance.",
      "answer": "cls",
      "caseSensitive": true,
      "explanation": "Class methods use `cls` as the first parameter to refer to the class itself. This allows them to access class attributes and create instances via `cls(...)`, making them ideal for alternative constructors.",
      "hint": "It's a common abbreviation for 'class'."
    },
    {
      "id": "python-oop-fundamentals-quiz-04",
      "type": "code-output",
      "question": "Predict the output:",
      "code": "class Dog:\n    tricks = []\n\n    def add_trick(self, trick):\n        self.tricks.append(trick)\n\nd1 = Dog()\nd2 = Dog()\nd1.add_trick(\"roll over\")\nprint(len(d2.tricks))",
      "language": "python",
      "options": [
        "0",
        "1",
        "AttributeError",
        "2"
      ],
      "answer": 1,
      "explanation": "`tricks` is a class attribute — a single list shared by all instances. When `d1.add_trick()` calls `self.tricks.append()`, it mutates the shared class-level list (it does not reassign `self.tricks`). So `d2.tricks` reflects the same mutation, and its length is 1. The fix is to move `self.tricks = []` inside `__init__`.",
      "hint": "Does `self.tricks.append()` create a new list or mutate an existing one?"
    },
    {
      "id": "python-oop-fundamentals-quiz-05",
      "type": "mcq",
      "question": "Which is the most appropriate use case for `@classmethod`?",
      "options": [
        "To implement utility functions that don't need instance or class state",
        "To create alternative constructors that return a new instance of the class",
        "To override a parent class method in a subclass",
        "To validate input data before passing it to `__init__`"
      ],
      "answer": 1,
      "explanation": "`@classmethod` receives the class as `cls`, making it ideal for alternative constructors like `Person.from_birth_year('Alice', 1990)`. Utility functions that need neither instance nor class state are better served by `@staticmethod`. Method overriding doesn't require any decorator.",
      "hint": "Look at how `from_birth_year` is used in the notes."
    },
    {
      "id": "python-oop-fundamentals-quiz-06",
      "type": "multiple-select",
      "question": "Which of the following statements about `@staticmethod` are true? (Select all that apply)",
      "options": [
        "Static methods do not receive `self` or `cls` as a first parameter",
        "Static methods can directly access instance attributes",
        "Static methods can be called on both the class and an instance",
        "Static methods are useful for utility functions logically grouped with a class",
        "Static methods automatically have access to class attributes"
      ],
      "answers": [0, 2, 3],
      "explanation": "Static methods have no implicit first parameter, so they cannot access instance or class attributes directly. They can be called via `ClassName.method()` or `instance.method()`. They are perfect for utility/helper functions that belong conceptually to a class but don't need its state.",
      "hint": "Think about what `@staticmethod` removes compared to a regular or class method."
    },
    {
      "id": "python-oop-fundamentals-quiz-07",
      "type": "true-false",
      "question": "In Python, `super()` always refers exclusively to the direct parent class.",
      "answer": false,
      "explanation": "`super()` follows the **Method Resolution Order (MRO)**, not just the immediate parent. In multiple inheritance, `super()` calls the next class in the MRO chain (computed via C3 linearization), which may not be the direct parent. This cooperative design is essential for diamond inheritance to work correctly.",
      "hint": "Consider what happens in a diamond inheritance pattern: `class D(B, C)` where both `B` and `C` inherit from `A`."
    },
    {
      "id": "python-oop-fundamentals-quiz-08",
      "type": "code-output",
      "question": "Predict the output:",
      "code": "class A:\n    def method(self):\n        return \"A\"\n\nclass B(A):\n    def method(self):\n        return \"B\"\n\nclass C(A):\n    def method(self):\n        return \"C\"\n\nclass D(B, C):\n    pass\n\nd = D()\nprint(d.method())",
      "language": "python",
      "options": [
        "\"A\"",
        "\"B\"",
        "\"C\"",
        "\"D\""
      ],
      "answer": 1,
      "explanation": "Python's MRO for `D` is `[D, B, C, A, object]` (C3 linearization). When `d.method()` is called, Python searches left to right: `D` has no `method`, `B` has one — it returns `\"B\"`. `C` and `A` are never reached. You can verify with `print(D.mro())`.",
      "hint": "Python checks classes left to right following the MRO. What is the MRO for `D(B, C)`?"
    },
    {
      "id": "python-oop-fundamentals-quiz-09",
      "type": "multiple-select",
      "question": "Which dunder methods does `@dataclass` generate **by default** (without extra arguments)? (Select all that apply)",
      "options": [
        "`__init__`",
        "`__str__`",
        "`__repr__`",
        "`__eq__`",
        "`__lt__`"
      ],
      "answers": [0, 2, 3],
      "explanation": "`@dataclass` generates `__init__`, `__repr__`, and `__eq__` by default. `__str__` is NOT generated — Python falls back to `__repr__` when printing. Comparison ordering methods like `__lt__` require `@dataclass(order=True)`.",
      "hint": "The default gives you construction, representation, and equality. Ordering is opt-in."
    },
    {
      "id": "python-oop-fundamentals-quiz-10",
      "type": "code-completion",
      "question": "Complete the decorator to define a property setter:",
      "instruction": "Fill in the property name used in the setter decorator",
      "codeTemplate": "class Temperature:\n    @property\n    def celsius(self):\n        return self._celsius\n\n    @_____.setter\n    def celsius(self, value):\n        if value < -273.15:\n            raise ValueError(\"Below absolute zero!\")\n        self._celsius = value",
      "answer": "celsius",
      "caseSensitive": true,
      "acceptedAnswers": ["celsius"],
      "explanation": "The setter decorator must reference the property by name: `@celsius.setter`. This links the setter to the `celsius` property defined above it. The method name must also match. Using a different name creates an unlinked setter that Python won't connect to the property."
    },
    {
      "id": "python-oop-fundamentals-quiz-11",
      "type": "mcq",
      "question": "What happens when you try to assign a value to a `@property` that has **no setter** defined?",
      "options": [
        "The value is silently ignored",
        "Python creates a new regular instance attribute with the same name, shadowing the property",
        "An `AttributeError` is raised",
        "A `TypeError` is raised"
      ],
      "answer": 2,
      "explanation": "Attempting to set a read-only property (one with no setter) raises `AttributeError: can't set attribute`. This is the intended behavior — it enforces read-only access. To make it writable, you must explicitly define a `@property_name.setter`.",
      "hint": "Read-only means writing should be blocked with an error, not silently accepted."
    },
    {
      "id": "python-oop-fundamentals-quiz-12",
      "type": "true-false",
      "question": "A double-underscore attribute like `self.__secret` in class `MyClass` is truly private and cannot be accessed from outside the class.",
      "answer": false,
      "explanation": "Python applies **name mangling** — `self.__secret` in `MyClass` is stored as `_MyClass__secret`. This prevents accidental collisions in subclasses but does NOT enforce true privacy. You can still access it from outside as `obj._MyClass__secret`. Python's philosophy is 'consenting adults': naming conventions communicate intent, but there are no hard access restrictions.",
      "hint": "Python doesn't have true access modifiers like Java's `private`. What mechanism does it use instead?"
    },
    {
      "id": "python-oop-fundamentals-quiz-13",
      "type": "fill-blank",
      "question": "To make a dataclass immutable so that attribute modification after creation raises a `FrozenInstanceError`, pass `_____=True` to the `@dataclass` decorator.",
      "answer": "frozen",
      "caseSensitive": true,
      "explanation": "`@dataclass(frozen=True)` prevents any attribute assignment after the object is created, making the instance behave like a named tuple. Frozen dataclasses are also hashable by default, allowing them to be used as dictionary keys or set members.",
      "hint": "Think of what word describes an immutable/locked state."
    },
    {
      "id": "python-oop-fundamentals-quiz-14",
      "type": "mcq",
      "question": "What is the **minimum** dunder method you need to implement to make instances of a class sortable with the built-in `sorted()`?",
      "options": [
        "`__eq__`",
        "`__lt__`",
        "`__gt__`",
        "`__hash__`"
      ],
      "answer": 1,
      "explanation": "`sorted()` uses `__lt__` (less than) as the default comparison operator. While `__eq__` is useful for equality checks, it's not required for sorting. `__hash__` is for set/dict membership. You can also use `functools.total_ordering` to fill in all comparison methods from just `__eq__` and one other.",
      "hint": "Sorting fundamentally relies on determining which item comes 'before' another."
    },
    {
      "id": "python-oop-fundamentals-quiz-15",
      "type": "mcq",
      "question": "What is the key distinction between `__str__` and `__repr__`?",
      "options": [
        "`__str__` is for large objects; `__repr__` is for small, simple ones",
        "`__str__` provides a human-readable string (used by `print()`); `__repr__` provides an unambiguous developer-oriented representation for debugging",
        "`__repr__` is called when an object is garbage collected",
        "`__str__` is faster than `__repr__` because it skips type information"
      ],
      "answer": 1,
      "explanation": "`__str__` is the 'pretty' representation for end users — called by `print()` and `str()`. `__repr__` is for developers and debugging — called in the REPL, by `repr()`, and as a fallback when `__str__` is absent. A good `__repr__` ideally returns a string that could recreate the object: `Person('Alice', 30)`.",
      "hint": "One is for users, one is for developers."
    },
    {
      "id": "python-oop-fundamentals-quiz-16",
      "type": "code-output",
      "question": "Predict the output:",
      "code": "class Counter:\n    count = 0\n\n    def __init__(self):\n        Counter.count += 1\n\n    @classmethod\n    def get_count(cls):\n        return cls.count\n\na = Counter()\nb = Counter()\nc = Counter()\nprint(Counter.get_count())",
      "language": "python",
      "options": [
        "0",
        "1",
        "3",
        "Error"
      ],
      "answer": 2,
      "explanation": "Each `Counter()` call triggers `__init__`, which increments the class attribute `Counter.count`. After three instantiations, `count` is 3. `get_count()` returns `cls.count`, which is 3. Note: using `Counter.count += 1` (not `self.count += 1`) correctly modifies the class attribute rather than creating a shadowing instance attribute.",
      "hint": "How many times is `Counter()` called, and where does `count` live?"
    },
    {
      "id": "python-oop-fundamentals-quiz-17",
      "type": "drag-drop",
      "question": "Given `class D(B, C)` where `class B(A)` and `class C(A)`, arrange the Method Resolution Order (MRO) for class `D` from **first searched to last searched**:",
      "instruction": "Drag to arrange from first to last in Python's MRO",
      "items": [
        "A",
        "object",
        "C",
        "D",
        "B"
      ],
      "correctOrder": [3, 4, 2, 0, 1],
      "explanation": "Python's C3 linearization produces the MRO: `[D, B, C, A, object]`. Python searches left to right, checking each class for the requested attribute. `D` itself is checked first, then its leftmost parent `B`, then `C`, then their shared ancestor `A`, and finally the base `object`. This prevents `A`'s methods from being found before `C`'s in a diamond pattern."
    },
    {
      "id": "python-oop-fundamentals-quiz-18",
      "type": "flashcard",
      "question": "What is **polymorphism** in OOP, and how does Python implement it?",
      "answer": "**The ability for different objects to respond to the same interface (method call) in their own type-specific way.**\n\nPython uses **duck typing**: if an object has the right method, it works — regardless of its type. Example: `shape.area()` works on both `Rectangle` and `Circle` because each defines its own `area()` implementation. You don't need explicit interfaces or type checks."
    },
    {
      "id": "python-oop-fundamentals-quiz-19",
      "type": "flashcard",
      "question": "What is **name mangling** in Python, and what problem does it solve?",
      "answer": "**Name mangling transforms `__attr` (double underscore prefix) into `_ClassName__attr` at compile time.**\n\nProblem it solves: prevents accidental attribute name collisions in subclasses. If `Parent` uses `self.__data` and `Child` also defines `self.__data`, they don't clash — they become `_Parent__data` and `_Child__data` respectively.\n\nImportant: this is NOT true privacy. The attribute is still accessible as `obj._ClassName__attr` from outside."
    },
    {
      "id": "python-oop-fundamentals-quiz-20",
      "type": "true-false",
      "question": "In a dataclass, `__post_init__` is called after all fields have been initialized by the generated `__init__`, allowing you to perform validation or compute derived attributes.",
      "answer": true,
      "explanation": "The generated `__init__` assigns all declared fields first, then automatically calls `__post_init__` if it's defined. This is the correct place for cross-field validation or initializing fields that depend on other fields (like setting `count = len(self.items)` in an `Inventory` dataclass).",
      "hint": "The name itself is a clue — it runs *post* (after) `__init__`."
    },
    {
      "id": "python-oop-fundamentals-quiz-21",
      "type": "code-output",
      "question": "Predict the output:",
      "code": "class Employee:\n    def __init__(self, name, salary):\n        self.name = name\n        self.salary = salary\n\nclass Manager(Employee):\n    def __init__(self, name, salary, department):\n        super().__init__(name, salary)\n        self.department = department\n\nmgr = Manager(\"Alice\", 100000, \"Engineering\")\nprint(hasattr(mgr, \"salary\"))",
      "language": "python",
      "options": [
        "True",
        "False",
        "AttributeError",
        "None"
      ],
      "answer": 0,
      "explanation": "`super().__init__(name, salary)` calls `Employee.__init__`, which sets `self.salary = salary` on the `mgr` instance. So `mgr.salary` exists. `hasattr(mgr, 'salary')` returns `True`. This demonstrates why calling `super().__init__()` is essential — skipping it means the parent's attributes are never set.",
      "hint": "Does `super().__init__()` actually run `Employee.__init__` on the `mgr` instance?"
    },
    {
      "id": "python-oop-fundamentals-quiz-22",
      "type": "mcq",
      "question": "In a dataclass, why must you use `field(default_factory=list)` instead of `items: list = []` for list fields?",
      "options": [
        "Because dataclasses don't support list type annotations directly",
        "To avoid sharing the same list object across all instances (the mutable default argument problem)",
        "Because `field()` is significantly faster at runtime than a plain default",
        "To enable the `frozen=True` feature for the field"
      ],
      "answer": 1,
      "explanation": "Using `items: list = []` would make all instances share the **same** list object — a classic Python gotcha. `field(default_factory=list)` calls `list()` fresh for each new instance, giving every object its own independent list. This same issue applies to any mutable default (dicts, sets, custom objects).",
      "hint": "This is the same reason you should never use mutable defaults in function signatures."
    },
    {
      "id": "python-oop-fundamentals-quiz-23",
      "type": "code-output",
      "question": "Predict the output:",
      "code": "class Vector:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n    def __add__(self, other):\n        return Vector(self.x + other.x, self.y + other.y)\n\n    def __str__(self):\n        return f\"Vector({self.x}, {self.y})\"\n\nv1 = Vector(1, 2)\nv2 = Vector(3, 4)\nprint(v1 + v2)",
      "language": "python",
      "options": [
        "Vector(1, 2)",
        "Vector(3, 4)",
        "Vector(4, 6)",
        "TypeError: unsupported operand type(s) for +"
      ],
      "answer": 2,
      "explanation": "`v1 + v2` is syntactic sugar for `v1.__add__(v2)`. Python translates arithmetic operators to dunder method calls. `__add__` receives `other = v2` and returns a new `Vector(1+3, 2+4)` = `Vector(4, 6)`. Without `__add__`, the `+` operator would raise a `TypeError`.",
      "hint": "Python translates `a + b` into a method call. Which method?"
    },
    {
      "id": "python-oop-fundamentals-quiz-24",
      "type": "multiple-select",
      "question": "A `Playlist` class needs to support `len(playlist)`, `playlist[0]`, and `\"Song\" in playlist`. Which dunder methods must it implement? (Select all that apply)",
      "options": [
        "`__len__`",
        "`__iter__`",
        "`__getitem__`",
        "`__contains__`",
        "`__setitem__`"
      ],
      "answers": [0, 2, 3],
      "explanation": "`len()` calls `__len__`. Index access `obj[i]` calls `__getitem__`. The `in` operator calls `__contains__`. `__iter__` enables `for item in obj` iteration (not needed here). `__setitem__` handles assignment `obj[i] = value` (also not needed here). Each built-in operation maps to a specific dunder method.",
      "hint": "Map each operation to its corresponding dunder: `len()`, `[]`, and `in`."
    },
    {
      "id": "python-oop-fundamentals-quiz-25",
      "type": "mcq",
      "question": "What does a **single** leading underscore (e.g., `self._balance`) conventionally signal in Python?",
      "options": [
        "The attribute is private and Python will block external access",
        "The attribute is intended for internal use only — a convention, not enforcement",
        "Python applies name mangling, renaming it to `_ClassName_balance`",
        "The attribute is excluded from `__repr__` and `__str__` output"
      ],
      "answer": 1,
      "explanation": "A single underscore is a **convention** — it signals \"internal use, proceed with caution\" to other developers. Python does not enforce it; `obj._balance` is perfectly accessible from outside. Name mangling (renaming) only applies to **double** underscores (`__`). This reflects Python's philosophy: trust developers to respect conventions rather than enforce hard access restrictions.",
      "hint": "Compare: one underscore = convention, two underscores = name mangling."
    },
    {
      "id": "python-oop-fundamentals-quiz-26",
      "type": "code-output",
      "question": "Predict the output:",
      "code": "class ManagedResource:\n    def __enter__(self):\n        print(\"Acquired\")\n        return self\n\n    def __exit__(self, exc_type, exc_val, exc_tb):\n        print(\"Released\")\n        return False\n\nwith ManagedResource() as r:\n    print(\"Using\")",
      "language": "python",
      "options": [
        "Acquired\nUsing\nReleased",
        "Using\nAcquired\nReleased",
        "Acquired\nReleased\nUsing",
        "Using\nReleased"
      ],
      "answer": 0,
      "explanation": "`with` executes `__enter__` first (prints \"Acquired\"), then runs the block body (prints \"Using\"), then always calls `__exit__` on exit (prints \"Released\") — whether the block succeeded or raised an exception. This guaranteed cleanup is the entire point of the context manager protocol.",
      "hint": "Think about the sequence: set up → use → tear down."
    },
    {
      "id": "python-oop-fundamentals-quiz-27",
      "type": "true-false",
      "question": "If `__exit__` returns `True`, any exception that occurred inside the `with` block is suppressed and execution continues normally after the `with` statement.",
      "answer": true,
      "explanation": "The return value of `__exit__` controls exception propagation. `True` = suppress the exception (swallow it). `False` or `None` = re-raise it. This is why most context managers `return False` — they want to clean up resources but not silently hide errors. Returning `True` is intentional only when the class is designed to handle specific exceptions.",
      "hint": "What would make a context manager dangerous if it always returned `True`?"
    }
  ]
}
{{< /quiz >}}
