---
title: "Functions Deep Dive Quiz"
linkTitle: Functions Deep Dive
type: docs
weight: 3
prev: /quiz/python/02-building-blocks
next: /quiz/python/04-error-handling
---

{{< quiz id="python-functions-deep-dive-quiz" >}}
{
  "questions": [
    {
      "id": "python-functions-deep-dive-quiz-01",
      "type": "code-output",
      "question": "What are `name` and `'Alice'` called in this code?",
      "code": "def greet(name):     # Function definition\n    return f\"Hello {name}\"\n\ngreet('Alice')       # Function call",
      "language": "python",
      "options": [
        "`name` is a parameter, `'Alice'` is an argument",
        "`name` is an argument, `'Alice'` is a parameter",
        "Both are parameters",
        "Both are arguments"
      ],
      "answer": 0,
      "explanation": "**Parameters** are variables in the function definition (`name`). **Arguments** are the actual values passed when calling the function (`'Alice'`).",
      "hint": "Think about which one is in the definition and which one is passed when calling."
    },
    {
      "id": "python-functions-deep-dive-quiz-02",
      "type": "code-output",
      "question": "What is the output of the following code?",
      "code": "def get_user():\n    return 'Alice', 30, 'alice@example.com'\n\nprint(get_user())",
      "language": "python",
      "options": [
        "`('Alice', 30, 'alice@example.com')`",
        "`Alice 30 alice@example.com`",
        "`Alice`",
        "`Error`"
      ],
      "answer": 0,
      "explanation": "Functions can return multiple values as a tuple. The `get_user()` function returns three values packed into a tuple.",
      "hint": "Think about what happens when a function has multiple return values separated by commas."
    },
    {
      "id": "python-functions-deep-dive-quiz-03",
      "type": "code-output",
      "question": "What will this code print?",
      "code": "def greet(name, greeting=\"Hello\"):\n    return f\"{greeting} {name}\"\n\nprint(greet(\"Bob\", \"Hi\"))",
      "language": "python",
      "options": [
        "`Hello Bob`",
        "`Hi Bob`",
        "`Bob Hi`",
        "`Error`"
      ],
      "answer": 1,
      "explanation": "The function has a default parameter `greeting=\"Hello\"`, but when we pass `\"Hi\"` as the second positional argument, it overrides the default value.",
      "hint": "Default parameters can be overridden by passing explicit values."
    },
    {
      "id": "python-functions-deep-dive-quiz-04",
      "type": "multiple-select",
      "question": "Which of the following are valid ways to call this function: `def func(a, b, /, c, d)`?",
      "options": [
        "`func(1, 2, 3, 4)`",
        "`func(1, 2, c=3, d=4)`",
        "`func(a=1, b=2, c=3, d=4)`",
        "`func(1, b=2, c=3, d=4)`"
      ],
      "answers": [0, 1],
      "explanation": "Parameters before `/` must be positional-only. So `a` and `b` cannot be passed as keyword arguments. Options 1 and 2 correctly use positional arguments for `a` and `b`.",
      "hint": "The `/` separator forces parameters before it to be positional-only."
    },
    {
      "id": "python-functions-deep-dive-quiz-05",
      "type": "fill-blank",
      "question": "What keyword is used to modify a variable from an outer (enclosing) function's scope?",
      "answer": "nonlocal",
      "caseSensitive": false,
      "explanation": "The `nonlocal` keyword tells Python to use a variable from the enclosing function's scope, allowing you to modify it.",
      "hint": "It's not 'global', which is for module-level variables."
    },
    {
      "id": "python-functions-deep-dive-quiz-06",
      "type": "true-false",
      "question": "Type hints in Python are enforced at runtime and will raise errors if wrong types are passed.",
      "answer": false,
      "explanation": "Type hints are NOT enforced at runtime in Python. They are purely for documentation and static type checkers like mypy. The code `greet(123, \"thirty\")` will execute without errors even with type hints.",
      "hint": "Consider whether Python checks types automatically or if you need external tools."
    },
    {
      "id": "python-functions-deep-dive-quiz-07",
      "type": "code-output",
      "question": "What is the output of this code?",
      "code": "def sum_all(*args):\n    return sum(args)\n\nprint(type(sum_all(1, 2, 3)))",
      "language": "python",
      "options": [
        "`<class 'tuple'>`",
        "`<class 'int'>`",
        "`<class 'list'>`",
        "`6`"
      ],
      "answer": 1,
      "explanation": "While `*args` collects arguments into a tuple, the function returns `sum(args)`, which is an integer (6). The `type()` call is on the return value, not on `args` itself.",
      "hint": "What does the sum() function return?"
    },
    {
      "id": "python-functions-deep-dive-quiz-08",
      "type": "drag-drop",
      "question": "Arrange these parameter types in the correct order they must appear in a function definition:",
      "instruction": "Drag to arrange in the correct order",
      "items": [
        "Positional parameters",
        "**kwargs",
        "Keyword parameters with defaults",
        "*args"
      ],
      "correctOrder": [0, 3, 2, 1],
      "explanation": "Python requires this specific order: positional → *args → keyword → **kwargs. For example: `def func(a, b, *args, x=10, y=20, **kwargs)`"
    },
    {
      "id": "python-functions-deep-dive-quiz-09",
      "type": "mcq",
      "question": "According to the LEGB rule, which scope is searched FIRST when looking up a variable?",
      "options": [
        "Global",
        "Local",
        "Enclosing",
        "Built-in"
      ],
      "answer": 1,
      "explanation": "The LEGB rule searches in order: Local → Enclosing → Global → Built-in. Python always starts with the innermost (Local) scope first.",
      "hint": "Think about which scope is 'closest' to where the variable is being used."
    },
    {
      "id": "python-functions-deep-dive-quiz-10",
      "type": "code-output",
      "question": "What will this code print?",
      "code": "def make_multiplier(n):\n    def multiply(x):\n        return x * n\n    return multiply\n\ntimes2 = make_multiplier(2)\ntimes3 = make_multiplier(3)\nprint(times2(5) + times3(5))",
      "language": "python",
      "options": [
        "`10`",
        "`15`",
        "`25`",
        "`35`"
      ],
      "answer": 2,
      "explanation": "This is a closure. `times2` remembers `n=2`, so `times2(5) = 10`. `times3` remembers `n=3`, so `times3(5) = 15`. Total: 10 + 15 = 25.",
      "hint": "Each function returned by make_multiplier remembers its own value of n."
    },
    {
      "id": "python-functions-deep-dive-quiz-11",
      "type": "true-false",
      "question": "A closure is created automatically when an inner function references a variable from its outer function's scope.",
      "answer": true,
      "explanation": "Closures happen automatically in Python when an inner function uses variables from an outer function. You don't need to do anything special—just reference the outer variable.",
      "hint": "Think about what happens when multiply(x) uses 'n' from make_multiplier."
    },
    {
      "id": "python-functions-deep-dive-quiz-12",
      "type": "fill-blank",
      "question": "What keyword is used in a generator function to pause execution and return a value?",
      "answer": "yield",
      "caseSensitive": false,
      "explanation": "`yield` produces a value and pauses the generator; `next()` resumes execution and returns that value to the caller.",
      "hint": "It's a 5-letter word that sounds like 'giving up control temporarily'."
    },
    {
      "id": "python-functions-deep-dive-quiz-13",
      "type": "code-output",
      "question": "What is the output?",
      "code": "def yield_example():\n    yield 1\n    return 2\n    yield 3\n\ngen = yield_example()\nprint(next(gen))",
      "language": "python",
      "options": [
        "`1`",
        "`2`",
        "`3`",
        "`StopIteration`"
      ],
      "answer": 0,
      "explanation": "The generator yields 1 first. The `return 2` statement will stop the generator (raising StopIteration with value 2), and `yield 3` is never reached.",
      "hint": "What does the first yield statement produce?"
    },
    {
      "id": "python-functions-deep-dive-quiz-14",
      "type": "multiple-select",
      "question": "Which statements about generators are TRUE?",
      "options": [
        "Generators create values on demand (lazy evaluation)",
        "Generator expressions use parentheses `()` instead of brackets `[]`",
        "Generators are more memory-efficient than list comprehensions for large datasets",
        "Once a generator is exhausted, you can reset it by calling `next()` again"
      ],
      "answers": [0, 1, 2],
      "explanation": "Statements 1, 2, and 3 are true. However, once a generator is exhausted, it stays exhausted—you need to create a new generator to start over.",
      "hint": "Think about what happens after a generator has yielded all its values."
    },
    {
      "id": "python-functions-deep-dive-quiz-15",
      "type": "code-completion",
      "question": "Complete the code to make this a tail-recursive function:",
      "instruction": "Fill in the missing function name",
      "codeTemplate": "def factorial_tail(n, acc=1):\n    if n <= 1:\n        return acc\n    return _____(n - 1, n * acc)",
      "answer": "factorial_tail",
      "caseSensitive": false,
      "acceptedAnswers": ["factorial_tail"],
      "explanation": "Tail recursion occurs when the recursive call is the last operation. The function must call itself with updated parameters."
    },
    {
      "id": "python-functions-deep-dive-quiz-16",
      "type": "mcq",
      "question": "What is the main difference between `return` and `yield` in a function?",
      "options": [
        "`return` exits the function permanently; `yield` pauses and can resume",
        "`yield` is faster than `return`",
        "`return` can only return one value; `yield` can return multiple",
        "`yield` stores values in memory; `return` doesn't"
      ],
      "answer": 0,
      "explanation": "`return` exits the function completely and loses all local state. `yield` pauses the function, preserving its state, and can resume execution when called again.",
      "hint": "Think about whether you can continue execution after the statement."
    },
    {
      "id": "python-functions-deep-dive-quiz-17",
      "type": "true-false",
      "question": "Python automatically optimizes tail recursion to prevent stack overflow.",
      "answer": false,
      "explanation": "Python does NOT optimize tail recursion. Unlike some languages (like Scheme), Python doesn't convert tail-recursive calls into loops, so you still risk hitting the recursion limit.",
      "hint": "Review the 'Tail Recursion' section about Python's behavior."
    },
    {
      "id": "python-functions-deep-dive-quiz-18",
      "type": "code-output",
      "question": "What will this code print?",
      "code": "count = 0\n\ndef increment():\n    global count\n    count += 1\n\nincrement()\nincrement()\nprint(count)",
      "language": "python",
      "options": [
        "`0`",
        "`1`",
        "`2`",
        "`Error`"
      ],
      "answer": 2,
      "explanation": "The `global` keyword allows the function to modify the module-level `count` variable. Each call increments it, so after two calls: 0 → 1 → 2.",
      "hint": "What does the 'global' keyword allow you to do?"
    },
    {
      "id": "python-functions-deep-dive-quiz-19",
      "type": "mcq",
      "question": "Why should you avoid mutable default parameters like `def append_to(item, lst=[])`?",
      "options": [
        "It causes a syntax error",
        "The default list is created once and shared across all function calls",
        "Mutable defaults are slower than immutable defaults",
        "Python doesn't allow mutable types as defaults"
      ],
      "answer": 1,
      "explanation": "The default list `[]` is created once when the function is defined, not each time it's called. All calls share the same list object, leading to unexpected behavior.",
      "hint": "Think about when the default value is created."
    },
    {
      "id": "python-functions-deep-dive-quiz-20",
      "type": "flashcard",
      "question": "What is the LEGB rule?",
      "answer": "**L**ocal → **E**nclosing → **G**lobal → **B**uilt-in\n\nThe order in which Python searches for variables:\n1. **Local**: Inside current function\n2. **Enclosing**: Inside outer functions\n3. **Global**: Module level\n4. **Built-in**: Python built-ins"
    },
    {
      "id": "python-functions-deep-dive-quiz-21",
      "type": "flashcard",
      "question": "When should you use `global` vs `nonlocal`?",
      "answer": "**`global`**: Modify module-level variables from within a function\n\n**`nonlocal`**: Modify variables from an outer (enclosing) function's scope\n\nBoth should be used sparingly. Prefer passing parameters and returning values instead."
    },
    {
      "id": "python-functions-deep-dive-quiz-22",
      "type": "code-output",
      "question": "Predict the output:",
      "code": "def outer():\n    x = \"enclosing\"\n    def inner():\n        x = \"local\"\n        print(x)\n    inner()\n    print(x)\n\nouter()",
      "language": "python",
      "options": [
        "`local` then `local`",
        "`enclosing` then `enclosing`",
        "`local` then `enclosing`",
        "`Error`"
      ],
      "answer": 2,
      "explanation": "Inside `inner()`, the assignment `x = \"local\"` creates a new local variable, which is printed first. The `outer()` function's `x` remains unchanged at \"enclosing\".",
      "hint": "Each function has its own local scope. Assignment creates a new local variable."
    },
    {
      "id": "python-functions-deep-dive-quiz-23",
      "type": "multiple-select",
      "question": "Which are valid reasons to use recursion over iteration?",
      "options": [
        "The problem naturally breaks into similar subproblems (trees, graphs)",
        "Recursive solutions are always faster than iterative ones",
        "The code mirrors the problem structure, making it more readable",
        "You want to avoid deep recursion and stack overflow risks"
      ],
      "answers": [0, 2],
      "explanation": "Recursion is best when problems are naturally recursive (option 1) and when it improves code clarity (option 3). However, recursion is typically NOT faster (option 2) and CAN cause stack overflow (option 4).",
      "hint": "Think about the advantages mentioned in 'Why Use Recursion?'"
    },
    {
      "id": "python-functions-deep-dive-quiz-24",
      "type": "code-completion",
      "question": "Complete the code to unpack the dictionary as keyword arguments:",
      "instruction": "Fill in the operator needed",
      "codeTemplate": "def add(a, b, c):\n    return a + b + c\n\nvalues = {\"a\": 1, \"b\": 2, \"c\": 3}\nresult = add(___values)",
      "answer": "**",
      "caseSensitive": false,
      "acceptedAnswers": ["**"],
      "explanation": "Use `**` to unpack a dictionary as keyword arguments. This passes `a=1, b=2, c=3` to the function.\n\n**Remember:** `*` spreads values by position, `**` spreads values by name."
    },
    {
      "id": "python-functions-deep-dive-quiz-25",
      "type": "mcq",
      "question": "What is the default recursion depth limit in Python?",
      "options": [
        "100",
        "500",
        "1000",
        "Unlimited"
      ],
      "answer": 2,
      "explanation": "Python's default recursion limit is typically 1000. You can check it with `sys.getrecursionlimit()` and change it with `sys.setrecursionlimit()`.",
      "hint": "It's mentioned in the 'Recursion Limit' section."
    },
    {
      "id": "python-functions-deep-dive-quiz-26",
      "type": "code-output",
      "question": "What is the output?",
      "code": "def func(a, b, *args, x=10, **kwargs):\n    return len(args) + len(kwargs)\n\nprint(func(1, 2, 3, 4, x=100, y=200, z=300))",
      "language": "python",
      "options": [
        "`7`",
        "`3`",
        "`4`",
        "`5`"
      ],
      "answer": 2,
      "explanation": "`args` captures extra positional arguments (3, 4) → length 2. `kwargs` captures extra keyword arguments (y=200, z=300) → length 2. Total: 2 + 2 = 4.",
      "hint": "Count how many values go into args and kwargs separately."
    },
    {
      "id": "python-functions-deep-dive-quiz-27",
      "type": "true-false",
      "question": "Generator expressions use square brackets `[]` like list comprehensions.",
      "answer": false,
      "explanation": "Generator expressions use parentheses `()`, not square brackets. List comprehensions use `[]`. Example: `(x**2 for x in range(10))` is a generator.",
      "hint": "Think about the syntax difference between lazy and eager evaluation."
    },
    {
      "id": "python-functions-deep-dive-quiz-28",
      "type": "mcq",
      "question": "What decorator can be used to automatically cache recursive function results?",
      "options": [
        "`@staticmethod`",
        "`@lru_cache`",
        "`@property`",
        "`@memoize`"
      ],
      "answer": 1,
      "explanation": "The `@lru_cache` decorator from `functools` automatically caches function results, making recursive functions like Fibonacci much faster by avoiding redundant calculations.",
      "hint": "It's imported from the functools module."
    },
    {
      "id": "python-functions-deep-dive-quiz-29",
      "type": "code-output",
      "question": "What happens when you run this code?",
      "code": "def count_up_to(n):\n    count = 1\n    while count <= n:\n        yield count\n        count += 1\n\ngen = count_up_to(3)\nprint(next(gen))\nprint(next(gen))\nprint(list(gen))",
      "language": "python",
      "options": [
        "`1` then `2` then `[1, 2, 3]`",
        "`1` then `2` then `[3]`",
        "`1` then `2` then `[]`",
        "`Error`"
      ],
      "answer": 1,
      "explanation": "The first `next()` yields 1, the second yields 2. When we convert to list, the generator continues from where it left off, yielding only 3 (the remaining value).",
      "hint": "Generators remember their state. list() consumes what's left."
    },
    {
      "id": "python-functions-deep-dive-quiz-30",
      "type": "multiple-select",
      "question": "Which of the following demonstrate closures?",
      "options": [
        "An inner function that reads a variable from its outer function",
        "A function that modifies a global variable",
        "An inner function that modifies an outer variable using `nonlocal`",
        "A function that returns another function"
      ],
      "answers": [0, 2],
      "explanation": "Closures occur when inner functions access variables from enclosing scopes (options 1 and 3). Option 2 uses global scope (not a closure). Option 4 alone doesn't create a closure unless the returned function uses outer variables.",
      "hint": "Closures involve inner functions accessing outer function variables."
    },
    {
      "id": "python-functions-deep-dive-quiz-31",
      "type": "fill-blank",
      "question": "What method is used to get the next value from a generator?",
      "answer": "next",
      "caseSensitive": false,
      "explanation": "The `next()` built-in function is used to get the next value from a generator. It raises `StopIteration` when the generator is exhausted.",
      "hint": "It's a built-in function with 4 letters."
    },
    {
      "id": "python-functions-deep-dive-quiz-32",
      "type": "true-false",
      "question": "When you define a function with a docstring, you can access it using the `__doc__` attribute.",
      "answer": true,
      "explanation": "Docstrings (the triple-quoted strings at the start of functions) are stored in the `__doc__` attribute and can be accessed programmatically or with the `help()` function.",
      "hint": "Think about what happens to the triple-quoted string in a function."
    },
    {
      "id": "python-functions-deep-dive-quiz-33",
      "type": "mcq",
      "question": "In the function definition `def func(a, /, b, *, c)`, which parameter can be passed BOTH positionally and as a keyword?",
      "options": [
        "`a`",
        "`b`",
        "`c`",
        "None of them"
      ],
      "answer": 1,
      "explanation": "Parameter `a` is positional-only (before `/`), `c` is keyword-only (after `*`), but `b` is in the middle and can be passed either way.",
      "hint": "Look for the parameter that's neither before / nor after *."
    },
    {
      "id": "python-functions-deep-dive-quiz-34",
      "type": "code-output",
      "question": "What will this code print?",
      "code": "def make_counter():\n    count = 0\n    def increment():\n        nonlocal count\n        count += 1\n        return count\n    return increment\n\nc1 = make_counter()\nc2 = make_counter()\nprint(c1())\nprint(c1())\nprint(c2())",
      "language": "python",
      "options": [
        "`1` then `2` then `3`",
        "`1` then `2` then `1`",
        "`1` then `1` then `1`",
        "`Error`"
      ],
      "answer": 1,
      "explanation": "Each call to `make_counter()` creates a NEW closure with its own `count` variable. `c1` has its own counter (1→2), and `c2` has a separate counter starting at 1.",
      "hint": "Each counter function has its own independent count variable."
    },
    {
      "id": "python-functions-deep-dive-quiz-35",
      "type": "flashcard",
      "question": "What is memoization in the context of recursive functions?",
      "answer": "**Memoization** is an optimization technique that caches the results of expensive function calls.\n\nWhen a recursive function is called with the same arguments again, it returns the cached result instead of recalculating.\n\nThis dramatically improves performance for recursive algorithms like Fibonacci that have overlapping subproblems."
    },
    {
      "id": "python-functions-deep-dive-quiz-36",
      "type": "drag-drop",
      "question": "Arrange these steps for exception handling in the correct execution order:",
      "instruction": "Drag to arrange in the order Python executes them",
      "items": [
        "try block (attempt code)",
        "else block (runs if no exception)",
        "except block (handle errors if they occur)",
        "finally block (always runs)"
      ],
      "correctOrder": [0, 2, 1, 3],
      "explanation": "Python executes: try → except (if error) → else (if no error) → finally (always). The finally block always runs regardless of whether an exception occurred."
    },
    {
      "id": "python-functions-deep-dive-quiz-37",
      "type": "code-completion",
      "question": "Complete the generator function to read a file line by line:",
      "instruction": "Fill in the missing keyword",
      "codeTemplate": "def read_large_file(file_path):\n    with open(file_path, 'r') as f:\n        for line in f:\n            _____ line.strip()",
      "answer": "yield",
      "caseSensitive": false,
      "acceptedAnswers": ["yield"],
      "explanation": "Using `yield` makes this a generator that produces lines one at a time, which is memory-efficient for large files."
    },
    {
      "id": "python-functions-deep-dive-quiz-38",
      "type": "mcq",
      "question": "Which approach is generally MORE memory-efficient for processing large datasets?",
      "options": [
        "List comprehension: `[x**2 for x in range(1000000)]`",
        "Generator expression: `(x**2 for x in range(1000000))`",
        "Both use the same amount of memory",
        "It depends on the data type"
      ],
      "answer": 1,
      "explanation": "Generator expressions are lazy—they create values on demand. List comprehensions create the entire list in memory immediately. For large datasets, generators are much more memory-efficient.",
      "hint": "Think about when the values are created and stored."
    },
    {
      "id": "python-functions-deep-dive-quiz-39",
      "type": "true-false",
      "question": "A function can have multiple `yield` statements but only one `return` statement.",
      "answer": false,
      "explanation": "A function can have multiple `return` statements (though only one executes). Similarly, a generator can have multiple `yield` statements, and they will all execute in sequence as the generator is consumed.",
      "hint": "Think about early returns and multiple yield points in a generator."
    },
    {
      "id": "python-functions-deep-dive-quiz-40",
      "type": "code-output",
      "question": "Compare loop behavior vs function behavior. What's the output?",
      "code": "# With loop\ndata = \"hello\"\nfor i in range(2):\n    data = \"goodbye\"\nprint(data)\n\n# With function\ndata = \"hello\"\ndef modify():\n    data = \"goodbye\"\nmodify()\nprint(data)",
      "language": "python",
      "options": [
        "`goodbye` then `goodbye`",
        "`hello` then `hello`",
        "`goodbye` then `hello`",
        "`hello` then `goodbye`"
      ],
      "answer": 2,
      "explanation": "**Loop:** Assignment modifies the OUTER data → prints `goodbye`. **Function:** Assignment creates a NEW local variable → outer data unchanged → prints `hello`. Loops don't create scope; functions do.",
      "hint": "Which one creates a new scope for variables?"
    },
    {
      "id": "python-functions-deep-dive-quiz-41",
      "type": "code-output",
      "question": "What will this code print?",
      "code": "data = \"hello\"\n\nfor i in range(3):\n    data = data + \"!\"\n\nprint(data)",
      "language": "python",
      "options": [
        "`hello`",
        "`hello!`",
        "`hello!!!`",
        "`Error (data is not defined)`"
      ],
      "answer": 2,
      "explanation": "The loop modifies the OUTER `data` variable (doesn't create a new one). Each iteration: `hello` → `hello!` → `hello!!` → `hello!!!`. The modified value persists after the loop.",
      "hint": "Does the loop create a new 'data' variable or modify the existing one?"
    },
    {
      "id": "python-functions-deep-dive-quiz-42",
      "type": "mcq",
      "question": "Where does a variable belong in Python?",
      "options": [
        "In the scope where it's first assigned",
        "In the scope where it's first used/read",
        "In the innermost loop or function where it appears",
        "Always in the global scope unless marked local"
      ],
      "answer": 0,
      "explanation": "A variable belongs to the scope where it's first **assigned** (not where it's used). This is why `data = data.replace(...)` modifies an outer variable if `data` was assigned outside the loop.",
      "hint": "Think about when Python decides which scope a variable belongs to."
    }
  ]
}
{{< /quiz >}}

