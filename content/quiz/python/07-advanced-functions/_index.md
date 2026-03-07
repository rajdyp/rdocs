---
title: "Advanced Functions Quiz"
linkTitle: Advanced Functions
type: docs
weight: 7
prev: /quiz/python/06-standard-library
next: /quiz/python/08-working-with-data
---

{{< quiz id="python-advanced-functions-quiz" >}}
{
  "questions": [
    {
      "id": "python-advanced-functions-01",
      "type": "mcq",
      "question": "What is the primary purpose of a decorator in Python?",
      "options": [
        "To replace a function with a completely new implementation",
        "To wrap a function and extend or modify its behavior without changing the original code",
        "To add type annotations to function parameters",
        "To automatically cache function results"
      ],
      "answer": 1,
      "explanation": "Decorators wrap other functions to extend or modify their behavior without changing the original function's code — like a protective phone case that adds features without altering the phone itself.",
      "hint": "Think about the phone case analogy: same phone, extra features."
    },
    {
      "id": "python-advanced-functions-02",
      "type": "true-false",
      "question": "Given `@decorator1` `@decorator2` `def f(): pass`, this is equivalent to `f = decorator1(decorator2(f))`.",
      "answer": true,
      "explanation": "Decorators are applied bottom-up. `@decorator2` is applied first (innermost), then `@decorator1` wraps the result — equivalent to `f = decorator1(decorator2(f))`.",
      "hint": "Read the decorator stack from bottom to top to determine the order of application."
    },
    {
      "id": "python-advanced-functions-03",
      "type": "code-output",
      "question": "Predict the output:",
      "code": "class CountCalls:\n    def __init__(self, func):\n        self.func = func\n        self.count = 0\n\n    def __call__(self, *args, **kwargs):\n        self.count += 1\n        print(f\"Call {self.count} of {self.func.__name__}\")\n        return self.func(*args, **kwargs)\n\n@CountCalls\ndef say_hello():\n    print(\"Hello!\")\n\nsay_hello()\nsay_hello()",
      "language": "python",
      "options": [
        "Call 1 of say_hello\nCall 2 of say_hello",
        "Hello!\nHello!",
        "Call 1 of say_hello\nHello!\nCall 2 of say_hello\nHello!",
        "Call 2 of say_hello\nHello!"
      ],
      "answer": 2,
      "explanation": "Each call to `say_hello()` triggers `__call__`, which increments `count`, prints the call number, then calls the original function which prints 'Hello!'. Two calls produce four lines of output total.",
      "hint": "The `__call__` method runs first, then delegates to the original function."
    },
    {
      "id": "python-advanced-functions-04",
      "type": "mcq",
      "question": "What does `@wraps(func)` from `functools` preserve when used inside a decorator?",
      "options": [
        "The function's return value",
        "The function's execution speed",
        "The original function's metadata such as `__name__` and `__doc__`",
        "The function's argument defaults"
      ],
      "answer": 2,
      "explanation": "`@wraps(func)` copies metadata from the original function to the wrapper, preserving attributes like `__name__`, `__doc__`, and `__qualname__`. Without it, the decorated function would appear as the inner `wrapper` function when inspected.",
      "hint": "What information about a function would be lost if you inspected it after decorating?"
    },
    {
      "id": "python-advanced-functions-05",
      "type": "fill-blank",
      "question": "What method do you call on an `lru_cache`-decorated function to remove all its cached results? (e.g., `fibonacci._____()`)",
      "answer": "cache_clear",
      "caseSensitive": true,
      "explanation": "`fibonacci.cache_clear()` removes all cached results. The companion method `fibonacci.cache_info()` returns statistics like hits, misses, and current cache size.",
      "hint": "The method name describes its action using two words joined by an underscore."
    },
    {
      "id": "python-advanced-functions-06",
      "type": "code-output",
      "question": "Predict the output:",
      "code": "from functools import partial\n\ndef power(base, exponent):\n    return base ** exponent\n\nsquare = partial(power, exponent=2)\ncube = partial(power, exponent=3)\n\nprint(square(5))\nprint(cube(3))",
      "language": "python",
      "options": [
        "10\n9",
        "25\n27",
        "7\n6",
        "25\n9"
      ],
      "answer": 1,
      "explanation": "`partial` creates specialized functions with pre-filled arguments. `square(5)` calls `power(5, exponent=2)` = 5² = 25, and `cube(3)` calls `power(3, exponent=3)` = 3³ = 27.",
      "hint": "Each specialized function fixes one argument — what does 5 squared and 3 cubed equal?"
    },
    {
      "id": "python-advanced-functions-07",
      "type": "code-output",
      "question": "Predict the output:",
      "code": "from functools import reduce\n\nnumbers = [1, 2, 3, 4, 5]\ntotal = reduce(lambda x, y: x + y, numbers)\nprint(total)",
      "language": "python",
      "options": [
        "10",
        "15",
        "120",
        "5"
      ],
      "answer": 1,
      "explanation": "`reduce` applies the function cumulatively from left to right: ((((1+2)+3)+4)+5) = 15. It folds the entire list into a single value using repeated application of the binary function.",
      "hint": "Think of reduce as collapsing step by step: 1+2=3, 3+3=6, 6+4=10, 10+5=?"
    },
    {
      "id": "python-advanced-functions-08",
      "type": "code-output",
      "question": "Predict the output:",
      "code": "import itertools\n\nresult = list(itertools.dropwhile(lambda x: x < 5, [1, 3, 6, 2, 1]))\nprint(result)",
      "language": "python",
      "options": [
        "[6]",
        "[1, 3]",
        "[6, 2, 1]",
        "[2, 1]"
      ],
      "answer": 2,
      "explanation": "`dropwhile` drops elements while the predicate is True, then yields ALL remaining elements — even if some would have matched the predicate again. It drops 1 and 3 (both < 5), then yields 6, 2, 1 without re-checking the predicate for 2 and 1.",
      "hint": "Once dropwhile sees the first element that fails the predicate, it stops checking and passes everything through."
    },
    {
      "id": "python-advanced-functions-09",
      "type": "true-false",
      "question": "`itertools.groupby` groups ALL elements with the same key together, regardless of their position in the iterable.",
      "answer": false,
      "explanation": "`groupby` only groups CONSECUTIVE elements with the same key. If identical keys appear non-consecutively, they form separate groups. To group all matching elements regardless of position, sort the iterable by key first.",
      "hint": "Consider what would happen with the input `['a', 'b', 'a']` — how many groups would form?"
    },
    {
      "id": "python-advanced-functions-10",
      "type": "multiple-select",
      "question": "Which `itertools` functions produce **infinite** sequences?",
      "options": [
        "`count()`",
        "`cycle()`",
        "`repeat()`",
        "`chain()`",
        "`combinations()`"
      ],
      "answers": [0, 1, 2],
      "explanation": "`count()` counts indefinitely from a start value, `cycle()` repeats an iterable forever, and `repeat()` repeats an element infinitely when no `times` argument is given. `chain()` and `combinations()` are finite — they terminate when their input is exhausted.",
      "hint": "Which ones would loop forever without a break condition or an explicit stop argument?"
    },
    {
      "id": "python-advanced-functions-11",
      "type": "code-output",
      "question": "Predict the output:",
      "code": "import itertools\n\nresult = list(itertools.chain([1, 2], [3, 4], [5]))\nprint(result)",
      "language": "python",
      "options": [
        "[[1, 2], [3, 4], [5]]",
        "[1, 2, 3, 4, 5]",
        "(1, 2, 3, 4, 5)",
        "[1, 2, 3, 4]"
      ],
      "answer": 1,
      "explanation": "`itertools.chain` concatenates multiple iterables into a single flat sequence, yielding elements from the first iterable, then the second, and so on — without creating nested lists.",
      "hint": "chain 'chains' iterables end-to-end, flattening one level."
    },
    {
      "id": "python-advanced-functions-12",
      "type": "true-false",
      "question": "A class-based decorator must implement the `__call__` method to make its instances callable like a function.",
      "answer": true,
      "explanation": "When a class is used as a decorator (e.g., `@CountCalls`), the class instance replaces the function. For the instance to be called like a function, it must implement `__call__`. Without it, calling the decorated function would raise a `TypeError`.",
      "hint": "What special method makes a Python object callable?"
    },
    {
      "id": "python-advanced-functions-13",
      "type": "flashcard",
      "question": "What is a **decorator factory** and when would you use one?",
      "answer": "**A decorator factory is a function that returns a decorator.**\n\nUse one when your decorator needs to accept arguments:\n- `@repeat(times=3)` — the factory takes `times`, returns a decorator\n- `@retry(max_attempts=3, delay=2)` — factory takes retry config\n\n**Structure:**\n```\nouter(args) → decorator(func) → wrapper(*args, **kwargs)\n```\nThree levels of nesting: factory → decorator → wrapper."
    },
    {
      "id": "python-advanced-functions-14",
      "type": "drag-drop",
      "question": "Arrange the lifecycle stages of a `@contextmanager`-decorated generator in the correct execution order:",
      "instruction": "Drag to arrange in the correct execution order",
      "items": [
        "yield — control passes to the `with` block",
        "Setup code before `yield` (equivalent to `__enter__`)",
        "Teardown code after `yield` in `finally` (equivalent to `__exit__`)"
      ],
      "correctOrder": [1, 0, 2],
      "explanation": "A `@contextmanager` generator runs setup code first (acquiring resources), then `yield` hands control to the `with` block body. After the `with` block finishes (or raises an exception), execution resumes after `yield` — typically in a `finally` block for guaranteed cleanup."
    },
    {
      "id": "python-advanced-functions-15",
      "type": "code-completion",
      "question": "Complete the `@contextmanager` timer so it correctly passes control to the `with` block:",
      "instruction": "Fill in the missing keyword",
      "codeTemplate": "from contextlib import contextmanager\nimport time\n\n@contextmanager\ndef timer(label):\n    start = time.time()\n    try:\n        _____\n    finally:\n        end = time.time()\n        print(f\"{label}: {end - start:.4f}s\")\n\nwith timer(\"query\"):\n    pass",
      "answer": "yield",
      "caseSensitive": true,
      "acceptedAnswers": ["yield"],
      "explanation": "`yield` is the keyword that splits setup from teardown in a `@contextmanager` generator. Code before `yield` runs on entry; code after `yield` (in `finally`) runs on exit. Without `yield`, the function is not a valid context manager.",
      "hint": "What keyword suspends a generator and passes control back to the caller?"
    },
    {
      "id": "python-advanced-functions-16",
      "type": "mcq",
      "question": "What does `contextlib.suppress(FileNotFoundError)` do when used as a context manager?",
      "options": [
        "Logs `FileNotFoundError` exceptions without stopping execution",
        "Re-raises `FileNotFoundError` with a more descriptive message",
        "Silently swallows `FileNotFoundError` exceptions so they don't propagate",
        "Converts `FileNotFoundError` into a warning"
      ],
      "answer": 2,
      "explanation": "`contextlib.suppress` is a clean alternative to `try/except: pass`. It silently swallows the specified exception types, allowing execution to continue. Useful when an operation might fail and you explicitly want to ignore that failure.",
      "hint": "The name 'suppress' describes exactly what it does to the exception."
    },
    {
      "id": "python-advanced-functions-17",
      "type": "mcq",
      "question": "What does `@singledispatch` from `functools` enable?",
      "options": [
        "Running a function simultaneously on multiple CPU cores",
        "Function overloading based on the type of the first argument",
        "Automatically dispatching function calls across multiple modules",
        "Creating a function that accepts only a single argument"
      ],
      "answer": 1,
      "explanation": "`@singledispatch` enables type-based function overloading. You define a base implementation and register type-specific variants with `@func.register(type)`. Python selects the correct variant based on the runtime type of the first argument.",
      "hint": "Think of it as Python's way to achieve method overloading found in statically-typed languages."
    },
    {
      "id": "python-advanced-functions-18",
      "type": "multiple-select",
      "question": "Which of the following are provided by the `functools` module?",
      "options": [
        "`wraps`",
        "`lru_cache`",
        "`partial`",
        "`chain`",
        "`singledispatch`",
        "`compress`",
        "`reduce`"
      ],
      "answers": [0, 1, 2, 4, 6],
      "explanation": "`wraps`, `lru_cache`, `partial`, `singledispatch`, and `reduce` are all from `functools`. `chain` and `compress` are from `itertools`. A useful heuristic: `functools` is about higher-order functions and function manipulation; `itertools` is about efficient iteration.",
      "hint": "functools = function tools; itertools = iterator tools. Which module does each name logically belong to?"
    },
    {
      "id": "python-advanced-functions-19",
      "type": "code-output",
      "question": "Predict the output:",
      "code": "import itertools\n\nresult = list(itertools.combinations([1, 2, 3], 2))\nprint(result)",
      "language": "python",
      "options": [
        "[(1, 2), (1, 3), (2, 3)]",
        "[(1, 2), (2, 1), (1, 3), (3, 1), (2, 3), (3, 2)]",
        "[(1, 1), (1, 2), (2, 2), (1, 3), (2, 3), (3, 3)]",
        "[(1, 2, 3)]"
      ],
      "answer": 0,
      "explanation": "`combinations([1, 2, 3], 2)` generates all 2-element subsets where order does not matter. It produces 3 pairs: (1,2), (1,3), (2,3). `permutations` would produce 6 tuples since (1,2) and (2,1) are treated as distinct arrangements.",
      "hint": "In combinations, order doesn't matter — (1,2) and (2,1) count as the same pair."
    },
    {
      "id": "python-advanced-functions-20",
      "type": "flashcard",
      "question": "What is the key difference between `itertools.combinations` and `itertools.permutations`?",
      "answer": "**Combinations** — order does NOT matter:\n- `(1, 2)` and `(2, 1)` are the same\n- `combinations([1,2,3], 2)` → 3 results: `(1,2), (1,3), (2,3)`\n- Formula: C(n,r) = n! / (r!(n-r)!)\n\n**Permutations** — order DOES matter:\n- `(1, 2)` and `(2, 1)` are different\n- `permutations([1,2,3], 2)` → 6 results: `(1,2), (1,3), (2,1), (2,3), (3,1), (3,2)`\n- Formula: P(n,r) = n! / (n-r)!\n\n**Memory trick:** Combinations = Choose (order irrelevant); Permutations = Position (order matters)."
    },
    {
      "id": "python-advanced-functions-21",
      "type": "code-output",
      "question": "Predict the output:",
      "code": "import itertools\n\nresult = list(itertools.takewhile(lambda x: x < 5, [1, 3, 6, 2, 1]))\nprint(result)",
      "language": "python",
      "options": [
        "[1, 3]",
        "[1, 3, 2, 1]",
        "[6, 2, 1]",
        "[1, 3, 6]"
      ],
      "answer": 0,
      "explanation": "`takewhile` yields elements while the predicate is True, then STOPS immediately — even if later elements would have passed. It takes 1 and 3 (both < 5), then stops at 6. Unlike `filter`, it does not continue checking the rest of the sequence.",
      "hint": "Compare with `dropwhile`: one stops taking, the other stops dropping — both at the first failure."
    },
    {
      "id": "python-advanced-functions-22",
      "type": "code-output",
      "question": "Predict the output:",
      "code": "import itertools\n\nresult = list(itertools.islice(range(10), 2, 8, 2))\nprint(result)",
      "language": "python",
      "options": [
        "[2, 4, 6]",
        "[2, 4, 6, 8]",
        "[0, 2, 4, 6]",
        "[2, 3, 4, 5, 6, 7]"
      ],
      "answer": 0,
      "explanation": "`islice(iterable, start, stop, step)` works like Python's slice notation. Start=2, stop=8 (exclusive), step=2 → elements at positions 2, 4, 6: values 2, 4, 6. Position 8 is excluded, so 8 is not included.",
      "hint": "Think of it as `range(10)[2:8:2]` but for any iterator."
    },
    {
      "id": "python-advanced-functions-23",
      "type": "code-output",
      "question": "Predict the output:",
      "code": "import itertools\n\nresult = list(itertools.zip_longest([1, 2], ['a', 'b', 'c'], fillvalue='?'))\nprint(result)",
      "language": "python",
      "options": [
        "[(1, 'a'), (2, 'b')]",
        "[(1, 'a'), (2, 'b'), ('?', 'c')]",
        "[(1, 'a'), (2, 'b'), (None, 'c')]",
        "Error"
      ],
      "answer": 1,
      "explanation": "`zip_longest` pads shorter iterables with `fillvalue` instead of truncating. The built-in `zip` would stop at the shortest iterable (2 pairs); `zip_longest` continues to the longest (3 pairs), using `'?'` for the missing first element.",
      "hint": "What happens to the shorter iterable once it runs out of elements?"
    },
    {
      "id": "python-advanced-functions-24",
      "type": "code-output",
      "question": "Predict the output:",
      "code": "import itertools\n\nresult = list(itertools.product([1, 2], ['a', 'b']))\nprint(result)",
      "language": "python",
      "options": [
        "[(1, 'a'), (2, 'b')]",
        "[(1, 'a'), (1, 'b'), (2, 'a'), (2, 'b')]",
        "[(1, 2), ('a', 'b')]",
        "[(1, 'b'), (2, 'a')]"
      ],
      "answer": 1,
      "explanation": "`itertools.product` computes the Cartesian product — every combination of one element from each iterable. It's equivalent to nested for loops: `for x in [1,2]: for y in ['a','b']`. 2×2 = 4 tuples total.",
      "hint": "Think of a multiplication table — every row value paired with every column value."
    },
    {
      "id": "python-advanced-functions-25",
      "type": "code-output",
      "question": "Predict the output:",
      "code": "import itertools\n\nresult = list(itertools.compress('ABCDEF', [1, 0, 1, 0, 1, 1]))\nprint(result)",
      "language": "python",
      "options": [
        "['A', 'C', 'E', 'F']",
        "['B', 'D']",
        "['A', 'B', 'C', 'D', 'E', 'F']",
        "['A', 'C', 'E']"
      ],
      "answer": 0,
      "explanation": "`compress` applies a boolean mask: it keeps elements from the data where the corresponding selector is truthy (1) and drops those where it is falsy (0). Positions 0,2,4,5 are 1 → A, C, E, F are kept.",
      "hint": "Map each letter to its selector: A→1 (keep), B→0 (drop), C→1 (keep), D→0 (drop), E→1 (keep), F→1 (keep)."
    },
    {
      "id": "python-advanced-functions-26",
      "type": "code-completion",
      "question": "Complete the code to flatten a nested list using `itertools`:",
      "instruction": "Fill in the missing method name",
      "codeTemplate": "import itertools\n\nnested = [[1, 2], [3, 4], [5]]\nflat = list(itertools.chain._____(nested))\nprint(flat)  # [1, 2, 3, 4, 5]",
      "answer": "from_iterable",
      "caseSensitive": true,
      "acceptedAnswers": ["from_iterable"],
      "explanation": "`chain.from_iterable(nested)` takes a single iterable of iterables and chains them together — equivalent to `chain(*nested)` but more memory-efficient since it doesn't unpack everything at once. Ideal for flattening one level of nesting.",
      "hint": "The method name describes where the chain's elements come from."
    },
    {
      "id": "python-advanced-functions-27",
      "type": "code-output",
      "question": "Predict the output:",
      "code": "from functools import reduce\n\nnumbers = [1, 2, 3, 4, 5]\nproduct = reduce(lambda x, y: x * y, numbers, 1)\nprint(product)",
      "language": "python",
      "options": [
        "15",
        "1",
        "120",
        "5"
      ],
      "answer": 2,
      "explanation": "The third argument to `reduce` is an initial value. It starts with 1, then applies multiplication cumulatively: 1×1=1, 1×2=2, 2×3=6, 6×4=24, 24×5=120. The initial value is useful when the iterable might be empty (prevents `TypeError`).",
      "hint": "5! = 5 × 4 × 3 × 2 × 1"
    },
    {
      "id": "python-advanced-functions-28",
      "type": "mcq",
      "question": "What does `fibonacci.cache_info()` return after calling an `@lru_cache`-decorated function several times?",
      "options": [
        "The total number of times the function has been called",
        "A named tuple with `hits`, `misses`, `maxsize`, and `currsize`",
        "A dictionary mapping argument tuples to their cached return values",
        "The time taken for each unique function call"
      ],
      "answer": 1,
      "explanation": "`cache_info()` returns a `CacheInfo` named tuple with four fields: `hits` (cache was used), `misses` (function actually ran), `maxsize` (configured limit), and `currsize` (current entries cached). Useful for tuning cache size.",
      "hint": "Think about what statistics would help you evaluate whether the cache is effective."
    },
    {
      "id": "python-advanced-functions-29",
      "type": "true-false",
      "question": "`@lru_cache` can cache results for functions that accept mutable arguments like lists or dictionaries.",
      "answer": false,
      "explanation": "`lru_cache` caches results by hashing the arguments to create a cache key. Mutable types like lists and dicts are not hashable in Python, so passing them raises a `TypeError`. All arguments must be hashable (e.g., ints, strings, tuples).",
      "hint": "What does a cache key need to be — and what makes a type hashable?"
    },
    {
      "id": "python-advanced-functions-30",
      "type": "mcq",
      "question": "In the `@retry` decorator below, when does it re-raise the exception instead of retrying?\n\n```python\nfor attempt in range(1, max_attempts + 1):\n    try:\n        return func(*args, **kwargs)\n    except Exception as e:\n        if attempt == max_attempts:\n            raise\n        time.sleep(delay)\n```",
      "options": [
        "When the exception type is `RuntimeError`",
        "When all retry attempts have been exhausted (`attempt == max_attempts`)",
        "When the delay is set to 0",
        "When the function returns `None`"
      ],
      "answer": 1,
      "explanation": "The decorator re-raises only when `attempt == max_attempts` — meaning all retries are exhausted. Before that, it sleeps and loops again. This ensures the caller always sees the exception if the function never succeeds, rather than silently swallowing it.",
      "hint": "The decorator must eventually give up — what condition signals that all attempts are spent?"
    },
    {
      "id": "python-advanced-functions-31",
      "type": "mcq",
      "question": "In the database transaction context manager below, what happens when an exception is raised inside the `with` block?\n\n```python\n@contextmanager\ndef transaction(connection):\n    try:\n        yield connection\n        connection.commit()\n    except Exception:\n        connection.rollback()\n        raise\n```",
      "options": [
        "The exception is suppressed and the transaction commits successfully",
        "`commit()` is called first, then `rollback()` cancels it",
        "`rollback()` is called and the exception is re-raised to the caller",
        "The connection is automatically closed"
      ],
      "answer": 2,
      "explanation": "When an exception propagates out of the `with` block, execution jumps to the `except` clause — skipping `commit()`. `rollback()` undoes any partial changes, and `raise` re-raises the exception so the caller knows something went wrong. This is the standard safe transaction pattern.",
      "hint": "Trace the execution path when an exception occurs: does `commit()` run before or after the exception?"
    },
    {
      "id": "python-advanced-functions-32",
      "type": "mcq",
      "question": "What does `contextlib.redirect_stdout(f)` do when used as a context manager?",
      "options": [
        "Reads content from file `f` and prints it to the console",
        "Duplicates all stdout output to both the console and `f`",
        "Redirects `print()` and other stdout output to the file-like object `f`",
        "Permanently changes the stdout target for the entire program"
      ],
      "answer": 2,
      "explanation": "`redirect_stdout` temporarily redirects `sys.stdout` to the given file-like object for the duration of the `with` block. Any `print()` calls inside write to `f` instead of the console. After the block, stdout is restored to its original target.",
      "hint": "The effect is temporary and scoped to the `with` block — what happens to stdout inside vs outside?"
    },
    {
      "id": "python-advanced-functions-33",
      "type": "multiple-select",
      "question": "Which of the following are appropriate use cases for **context managers**?",
      "options": [
        "Managing resources that need explicit cleanup (files, DB connections, locks)",
        "Caching results of expensive pure functions",
        "Temporarily changing program state (e.g., working directory, settings)",
        "Overloading a function's behavior based on argument types",
        "Guaranteeing setup and teardown around a block of code"
      ],
      "answers": [0, 2, 4],
      "explanation": "Context managers excel at resource management, temporary state changes, and guaranteed setup/teardown — all patterns where you need something to happen before AND after a block of code, even if an exception occurs. Caching belongs to `functools.lru_cache`; type-based dispatch belongs to `singledispatch`.",
      "hint": "Context managers are about the `with` pattern: enter, do something, exit — reliably."
    },
    {
      "id": "python-advanced-functions-34",
      "type": "code-output",
      "question": "Predict the output:",
      "code": "import itertools\n\nresult = list(itertools.combinations_with_replacement([1, 2], 2))\nprint(result)",
      "language": "python",
      "options": [
        "[(1, 2)]",
        "[(1, 1), (1, 2), (2, 2)]",
        "[(1, 1), (1, 2), (2, 1), (2, 2)]",
        "[(1, 2), (2, 1)]"
      ],
      "answer": 1,
      "explanation": "`combinations_with_replacement` allows an element to appear more than once in a combination. With [1, 2] choosing 2: (1,1), (1,2), (2,2). Compare to `combinations([1,2], 2)` which only gives (1,2) — no repeats allowed.",
      "hint": "The 'with_replacement' part means the same element can be chosen more than once."
    },
    {
      "id": "python-advanced-functions-35",
      "type": "code-output",
      "question": "Predict the output:",
      "code": "import itertools\n\nresult = list(itertools.permutations([1, 2, 3], 2))\nprint(len(result))",
      "language": "python",
      "options": [
        "3",
        "6",
        "9",
        "4"
      ],
      "answer": 1,
      "explanation": "`permutations([1,2,3], 2)` produces all ordered 2-element arrangements: (1,2),(1,3),(2,1),(2,3),(3,1),(3,2) — 6 total. Unlike `combinations`, order matters: (1,2) and (2,1) are distinct. Formula: P(3,2) = 3!/(3-2)! = 6.",
      "hint": "With 3 choices for the first position and 2 remaining for the second, how many pairs are there?"
    }
  ]
}
{{< /quiz >}}
