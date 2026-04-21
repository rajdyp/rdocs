---
title: "Foundation Quiz"
linkTitle: Foundation
type: docs
weight: 1
prev: /quiz/python
next: /quiz/python/02-building-blocks
---

{{< quiz id="python-foundation-quiz" >}}
{
  "questions": [
    {
      "id": "python-foundation-01",
      "type": "mcq",
      "question": "What happens when you execute `a = [1, 2, 3]` followed by `b = a` and then `b.append(4)`?",
      "options": [
        "Only `b` contains `[1, 2, 3, 4]`, `a` remains `[1, 2, 3]`",
        "Both `a` and `b` contain `[1, 2, 3, 4]`",
        "Both `a` and `b` contain `[1, 2, 3, 4]`, but they become separate objects after `append` triggers a copy-on-write",
        "Only `a` contains `[1, 2, 3, 4]`, `b` remains `[1, 2, 3]`"
      ],
      "answer": 1,
      "explanation": "In Python, `b = a` creates a reference to the same list object, not a copy. When you modify `b`, you're modifying the same object that `a` references. To create an independent copy, use `b = a.copy()`.",
      "hint": "Think about whether variables hold values or references to objects."
    },
    {
      "id": "python-foundation-02",
      "type": "multiple-select",
      "question": "Which of the following evaluate to `False` in a boolean context?",
      "options": [
        "`0`",
        "`[0]`",
        "`\"\"`",
        "`None`",
        "`False`",
        "`{}`",
        "`\"0\"`"
      ],
      "answers": [0, 2, 3, 4, 5],
      "explanation": "Falsy values in Python include: numeric zero (`0`, `0.0`, `0j`), empty sequences (`\"\"`, `[]`, `()`, `{}`), `None`, and `False`. Note that `[0]` is a non-empty list containing one element, so it's truthy. Similarly, `\"0\"` (the string containing the character zero) is truthy because it is a non-empty string — only the empty string `\"\"` is falsy.",
      "hint": "Empty containers are falsy, but containers with items (even if those items are falsy) are truthy."
    },
    {
      "id": "python-foundation-03",
      "type": "true-false",
      "question": "The expression `1 < x < 10` is equivalent to `1 < x and x < 10` in Python.",
      "answer": true,
      "explanation": "Python supports chained comparisons, which is a Pythonic feature. `1 < x < 10` is syntactic sugar for `1 < x and x < 10`, making code more readable.",
      "hint": "This is one of Python's unique features that makes comparisons more natural."
    },
    {
      "id": "python-foundation-04",
      "type": "code-output",
      "question": "Predict the output:",
      "code": "x = 5\nx += 3\nx *= 2\nprint(x)",
      "language": "python",
      "options": [
        "10",
        "16",
        "13",
        "11"
      ],
      "answer": 1,
      "explanation": "Step by step: `x = 5`, then `x += 3` makes `x = 8`, then `x *= 2` makes `x = 16`. Assignment operators modify the variable in place.",
      "hint": "Follow each operation step by step: addition first, then multiplication."
    },
    {
      "id": "python-foundation-05",
      "type": "fill-blank",
      "question": "What operator is used in Python 3.8+ to assign a value AND use it in the same expression?",
      "answer": ":=",
      "caseSensitive": false,
      "explanation": "The walrus operator (`:=`) allows you to assign a value to a variable and use that value in the same expression, e.g., `if (n := len(data)) > 10:`",
      "hint": "It's nicknamed after an animal because of how it looks."
    },
    {
      "id": "python-foundation-06",
      "type": "code-output",
      "question": "What is the output of this code?",
      "code": "for i in range(3):\n    count = 0\n    count += i\n    print(count, end=' ')",
      "language": "python",
      "options": [
        "`0 1 2`",
        "`0 1 3`",
        "`1 2 3`",
        "`0 0 0`"
      ],
      "answer": 0,
      "explanation": "The variable `count` is declared **inside** the loop, so it resets to `0` on every iteration. Then it adds `i` (0, 1, 2) and prints. If `count` were declared outside the loop, it would accumulate values.",
      "hint": "Pay attention to where `count` is initialized—inside or outside the loop?"
    },
    {
      "id": "python-foundation-07",
      "type": "mcq",
      "question": "Which comparison should you use to check if a variable is `None`?",
      "options": [
        "`x == None`",
        "`x is None`",
        "`bool(x) == False`",
        "`not x`"
      ],
      "answer": 1,
      "explanation": "Always use `is` (not `==`) for `None` checks. `is` checks object identity, while `==` checks value equality. Since `None` is a singleton (there is exactly one None object in memory), `is None` is the correct and idiomatic approach.",
      "hint": "Think about identity versus equality."
    },
    {
      "id": "python-foundation-08",
      "type": "true-false",
      "question": "The expression `False and expensive_function()` will execute `expensive_function()`.",
      "answer": false,
      "explanation": "Python uses short-circuit evaluation. Since the left side of `and` is `False`, the result is already known to be `False`, so Python never evaluates the right side. This is an optimization that can prevent unnecessary computations.",
      "hint": "Consider what 'short-circuit evaluation' means."
    },
    {
      "id": "python-foundation-09",
      "type": "drag-drop",
      "question": "Arrange these Big O complexities from fastest to slowest:",
      "instruction": "Drag to arrange in order of increasing runtime (fastest to slowest)",
      "items": [
        "O(1)",
        "O(n)",
        "O(log n)",
        "O(n log n)",
        "O(n²)",
        "O(2ⁿ)"
      ],
      "correctOrder": [0, 2, 1, 3, 4, 5],
      "explanation": "The order from fastest to slowest is: O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ). Constant time is fastest, exponential is slowest."
    },
    {
      "id": "python-foundation-10",
      "type": "mcq",
      "question": "What is the time complexity of this code?\n\n```python\nfor i in range(n):\n    for j in range(n):\n        print(i, j)\n```",
      "options": [
        "O(log n)",
        "O(n)",
        "O(n log n)",
        "O(n²)"
      ],
      "answer": 3,
      "explanation": "This is a nested loop where both loops run `n` times. The outer loop runs `n` times, and for each iteration of the outer loop, the inner loop also runs `n` times. Total operations: n × n = n². This is quadratic time complexity.",
      "hint": "Count how many times the innermost operation executes relative to the input size."
    },
    {
      "id": "python-foundation-11",
      "type": "code-completion",
      "question": "Complete the code to iterate over both indices and values:",
      "instruction": "Fill in the missing function name",
      "codeTemplate": "fruits = ['apple', 'banana', 'cherry']\nfor index, fruit in _____(fruits):\n    print(f\"{index}: {fruit}\")",
      "answer": "enumerate",
      "caseSensitive": false,
      "acceptedAnswers": ["enumerate"],
      "explanation": "The `enumerate()` function returns both the index and value while iterating over a sequence. It's more Pythonic than using `range(len(fruits))` and manually indexing."
    },
    {
      "id": "python-foundation-12",
      "type": "flashcard",
      "question": "What is the Walrus Operator and when was it introduced?",
      "answer": "**The Walrus Operator (`:=`)**\n\nIntroduced in Python 3.8+, it allows you to assign a value to a variable AND use that value in the same expression.\n\n**General Form:**\n```python\nvariable := expression\n```\n\n**Example:**\n```python\nif (n := len(data)) > 10:\n    print(f\"List has {n} elements\")\n```\n\nThis evaluates `len(data)`, assigns it to `n`, and uses it in the comparison—all in one line."
    },
    {
      "id": "python-foundation-13",
      "type": "multiple-select",
      "question": "Which of the following are valid uses of the `else` clause with loops in Python?",
      "options": [
        "The `else` block executes when the loop completes normally (no `break`)",
        "The `else` block executes only if `break` is called",
        "Both `for` and `while` loops support the `else` clause",
        "The `else` block executes when a `continue` is encountered"
      ],
      "answers": [0, 2],
      "explanation": "In Python, both `for` and `while` loops can have an `else` clause that executes only when the loop completes normally without encountering a `break`. This is useful for search operations where you want to know if the search completed without finding the target.",
      "hint": "Think about what 'normally' means for loop completion."
    },
    {
      "id": "python-foundation-14",
      "type": "code-output",
      "question": "What does this code print?",
      "code": "result = 0 or 5 or 10\nprint(result)",
      "language": "python",
      "options": [
        "`0`",
        "`5`",
        "`10`",
        "`15`"
      ],
      "answer": 1,
      "explanation": "The `or` operator returns the first truthy value. Since `0` is falsy, it skips to `5`, which is truthy, and returns it immediately (short-circuit evaluation). The value `10` is never evaluated.",
      "hint": "Remember that `or` returns the first truthy value, not `True`/`False`."
    },
    {
      "id": "python-foundation-15",
      "type": "mcq",
      "question": "What is the problem with using `timeout = seconds or 30` when `seconds` can legitimately be `0`?",
      "options": [
        "The problem only occurs when `seconds` is `None`, not when it is `0`",
        "It will set `timeout` to `30` when `seconds` is `0`, even though `0` is a valid value",
        "It will always return `seconds` unchanged because `or` only applies the default when `seconds` is `None`",
        "There is no problem with this code"
      ],
      "answer": 1,
      "explanation": "Since `0` is falsy in Python, `0 or 30` evaluates to `30`. If `0` is a valid timeout value (e.g., no timeout), this breaks the logic. The fix is: `timeout = 30 if seconds is None else seconds`, which explicitly checks for `None` only.",
      "hint": "Consider that numeric zero is falsy but might be a meaningful value."
    },
    {
      "id": "python-foundation-16",
      "type": "true-false",
      "question": "In Big O notation, O(2n) and O(n) are considered equivalent.",
      "answer": true,
      "explanation": "Big O notation drops constants because it focuses on how runtime scales with input size, not exact operation counts. Both O(2n) and O(n) scale linearly, so they're both O(n). The constant factor (2×) becomes negligible for large inputs.",
      "hint": "Big O cares about growth rate, not exact counts."
    },
    {
      "id": "python-foundation-17",
      "type": "fill-blank",
      "question": "What is the time complexity of binary search? (Use Big O notation)",
      "answer": "O(log n)",
      "caseSensitive": false,
      "explanation": "Binary search has O(log n) complexity because it halves the search space with each iteration. For an array of 1000 elements, it takes at most ~10 steps (log₂ 1000 ≈ 10).",
      "hint": "Think about how many times you can divide n by 2 until you reach 1."
    },
    {
      "id": "python-foundation-18",
      "type": "code-output",
      "question": "Predict the output:",
      "code": "x, y = 10, 20\nx, y = y, x\nprint(x, y)",
      "language": "python",
      "options": [
        "`10 20`",
        "`20 10`",
        "`20 20`",
        "`10 10`"
      ],
      "answer": 1,
      "explanation": "Python supports simultaneous assignment, making swapping trivial. The right side `(y, x)` is evaluated first as a tuple `(20, 10)`, then unpacked to `x, y`. No temporary variable needed!",
      "hint": "Python evaluates the entire right side before assigning to the left side."
    },
    {
      "id": "python-foundation-19",
      "type": "flashcard",
      "question": "What is Short-Circuit Evaluation?",
      "answer": "**Short-Circuit Evaluation**\n\nPython stops evaluating a logical expression as soon as the final result is determined.\n\n**With `and`:**\n- If left side is `False`, result must be `False`—don't evaluate right side\n- `False and expensive_function()` → Never calls function\n\n**With `or`:**\n- If left side is `True`, result must be `True`—don't evaluate right side  \n- `True or expensive_function()` → Never calls function\n\nThis is both an optimization and a useful programming pattern for avoiding errors (e.g., `x and x.method()` won't fail if `x` is `None`)."
    },
    {
      "id": "python-foundation-20",
      "type": "mcq",
      "question": "What is the time complexity of looking up a value in a Python dictionary?",
      "options": [
        "O(1) - Constant",
        "O(log n) - Logarithmic",
        "O(n) - Linear",
        "O(n log n) - Linearithmic"
      ],
      "answer": 0,
      "explanation": "Dictionary lookup in Python uses hash tables, providing O(1) average-case lookup time. This makes dictionaries much faster than lists for membership testing when you have many elements. O(log n) would apply to sorted-tree data structures (like a balanced BST), not hash tables.",
      "hint": "Dictionaries use hashing for direct access."
    },
    {
      "id": "python-foundation-21",
      "type": "code-completion",
      "question": "Complete the code to create an independent copy of a list:",
      "instruction": "Fill in the method name",
      "codeTemplate": "original = [1, 2, 3]\nindependent = original._____()\nindependent.append(4)",
      "answer": "copy",
      "caseSensitive": false,
      "acceptedAnswers": ["copy"],
      "explanation": "The `.copy()` method creates a shallow copy of a list, making it independent from the original. Modifying the copy won't affect the original. Alternatively, you could use `independent = original[:]` or `independent = list(original)`."
    },
    {
      "id": "python-foundation-22",
      "type": "multiple-select",
      "question": "Which statements about the `range()` function are correct?",
      "options": [
        "`range(5)` produces values from 0 to 4",
        "`range(5)` produces values from 1 to 5",
        "`range(2, 7)` produces values from 2 to 7 inclusive",
        "`range(0, 10, 2)` produces even numbers from 0 to 8",
        "`range()` returns a list"
      ],
      "answers": [0, 3],
      "explanation": "`range()` uses zero-based indexing and excludes the stop value. `range(5)` gives 0-4, `range(2, 7)` gives 2-6 (not 7). The third parameter is step size: `range(0, 10, 2)` gives 0, 2, 4, 6, 8. Modern Python returns a range object (not a list) for memory efficiency.",
      "hint": "Remember: start is inclusive, stop is exclusive."
    },
    {
      "id": "python-foundation-23",
      "type": "code-output",
      "question": "What is printed?",
      "code": "for num in [1, 2, 3, 4, 5]:\n    if num % 2 == 0:\n        continue\n    print(num, end=' ')",
      "language": "python",
      "options": [
        "`1 3 5`",
        "`2 4`",
        "`1 2 3 4 5`",
        "Nothing is printed"
      ],
      "answer": 0,
      "explanation": "The `continue` statement skips the rest of the current iteration and moves to the next one. When `num` is even (2, 4), it skips the print statement. Only odd numbers (1, 3, 5) are printed.",
      "hint": "`continue` skips to the next iteration."
    },
    {
      "id": "python-foundation-24",
      "type": "true-false",
      "question": "The expression `isinstance(3.14, (int, float))` returns `True`.",
      "answer": true,
      "explanation": "`isinstance()` can check against a tuple of types, returning `True` if the value matches any type in the tuple. Since `3.14` is a float, and float is in the tuple `(int, float)`, it returns `True`.",
      "hint": "isinstance() accepts either a single type or a tuple of types."
    },
    {
      "id": "python-foundation-25",
      "type": "flashcard",
      "question": "What is the Accumulator Pattern?",
      "answer": "**The Accumulator Pattern**\n\nA fundamental programming pattern that builds up a result through iteration:\n\n1. **Initialize** a variable before the loop (e.g., `total = 0`)\n2. **Update** it inside the loop (e.g., `total += num`)\n3. **Use** the final result after the loop\n\n**Examples:**\n```python\n# Sum accumulator\ntotal = 0\nfor num in numbers:\n    total += num\n\n# List accumulator\nsquares = []\nfor i in range(1, 6):\n    squares.append(i ** 2)\n```\n\nThe key is that the variable is declared **outside** the loop so it persists across iterations."
    },
    {
      "id": "python-foundation-26",
      "type": "mcq",
      "question": "In the nested loops below, how many times does the inner `print` statement execute?\n\n```python\nfor i in range(3):\n    for j in range(4):\n        print(i, j)\n```",
      "options": [
        "3 times",
        "4 times",
        "7 times",
        "12 times"
      ],
      "answer": 3,
      "explanation": "The outer loop runs 3 times, and for each iteration of the outer loop, the inner loop runs 4 times. Total executions: 3 × 4 = 12. This is why nested loops often have O(n²) complexity when both loops depend on the same size.",
      "hint": "Multiply the number of outer iterations by the number of inner iterations."
    },
    {
      "id": "python-foundation-27",
      "type": "code-output",
      "question": "What does this code output?",
      "code": "numbers = [1, 2, 3, 4, 5]\nfor num in numbers:\n    if num == 3:\n        print(\"Found\")\n        break\nelse:\n    print(\"Not found\")",
      "language": "python",
      "options": [
        "Found",
        "Not found",
        "Found\\nNot found",
        "Nothing"
      ],
      "answer": 0,
      "explanation": "The loop finds 3 and executes `break`, which exits the loop. Since `break` was called, the `else` clause is skipped. Only 'Found' is printed. The `else` clause only runs when the loop completes normally without `break`.",
      "hint": "The `else` clause is skipped when `break` is executed."
    },
    {
      "id": "python-foundation-28",
      "type": "fill-blank",
      "question": "What keyword is used to skip the current iteration of a loop and move to the next one?",
      "answer": "continue",
      "caseSensitive": false,
      "explanation": "The `continue` keyword skips the remaining code in the current loop iteration and jumps to the next iteration. It's different from `break`, which exits the loop entirely.",
      "hint": "It's not `break` or `pass`."
    },
    {
      "id": "python-foundation-29",
      "type": "mcq",
      "question": "Which operation has O(n²) time complexity?",
      "options": [
        "Searching for a value in a sorted array using binary search",
        "Finding the maximum value in an unsorted list",
        "Comparing every element with every other element in a list",
        "Sorting a list with merge sort"
      ],
      "answer": 2,
      "explanation": "Comparing every element with every other element requires nested loops, resulting in O(n²) complexity. Binary search is O(log n), finding max is O(n), and merge sort is O(n log n).",
      "hint": "Think about which operation requires nested loops over the same data."
    },
    {
      "id": "python-foundation-30",
      "type": "code-completion",
      "question": "Complete the code to iterate over both parallel lists simultaneously:",
      "instruction": "Fill in the missing function",
      "codeTemplate": "names = ['Alice', 'Bob', 'Charlie']\nscores = [85, 92, 78]\nfor name, score in _____(names, scores):\n    print(f\"{name}: {score}\")",
      "answer": "zip",
      "caseSensitive": false,
      "acceptedAnswers": ["zip"],
      "explanation": "The `zip()` function takes multiple iterables and returns an iterator of tuples, pairing up elements from each iterable. It's perfect for parallel iteration over multiple sequences."
    },
    {
      "id": "python-foundation-31",
      "type": "true-false",
      "question": "An algorithm with O(n + n²) time complexity simplifies to O(n) in Big O notation.",
      "answer": false,
      "explanation": "When combining complexities, we keep the dominant (largest) term. Since n² grows much faster than n, O(n + n²) simplifies to O(n²), not O(n). For example, with n=1000: n=1,000 but n²=1,000,000—the n² term dominates.",
      "hint": "Which term grows faster as n increases?"
    },
    {
      "id": "python-foundation-32",
      "type": "flashcard",
      "question": "What is the difference between `==` and `is` in Python?",
      "answer": "**`==` vs `is`**\n\n**`==` (Equality Operator):**\n- Compares **values**\n- Checks if two objects have the same content\n- Example: `[1, 2, 3] == [1, 2, 3]` → `True`\n\n**`is` (Identity Operator):**\n- Compares **object identity** (memory address)\n- Checks if two variables reference the exact same object\n- Example: `a = [1, 2, 3]; b = [1, 2, 3]; a is b` → `False`\n\n**Best Practice:**\n- Use `is` for singleton objects like `None`: `x is None`\n- Use `==` for value comparisons"
    },
    {
      "id": "python-foundation-33",
      "type": "mcq",
      "question": "You want code to run only when **both** of these are true:\n- `reason == 'Scheduled'`\n- Either `s_time is None` **or** `ts < s_time`\n\nWhich condition is correct?",
      "options": [
        "`reason == 'Scheduled' and s_time is None or ts < s_time`",
        "`reason == 'Scheduled' and (s_time is None or ts < s_time)`",
        "`(reason == 'Scheduled' and s_time is None) or ts < s_time`",
        "Options A and C are equivalent to B"
      ],
      "answer": 1,
      "explanation": "Only option B matches the intent. Options A and C are identical after Python applies precedence: since `and` binds tighter than `or`, `reason == 'Scheduled' and s_time is None or ts < s_time` is parsed as `(reason == 'Scheduled' and s_time is None) or ts < s_time`. This causes the condition to fire whenever `ts < s_time`, regardless of `reason`. Explicit parentheses around the `or` subexpression are required.",
      "hint": "`and` has higher precedence than `or`—it groups first, just like `*` before `+`."
    },
    {
      "id": "python-foundation-34",
      "type": "code-output",
      "question": "Predict the output:",
      "code": "print(15 / 4)\nprint(15 // 4)",
      "language": "python",
      "options": [
        "`3.75` then `3`",
        "`3` then `3`",
        "`3.75` then `3.75`",
        "`4` then `3`"
      ],
      "answer": 0,
      "explanation": "In Python 3, `/` (true division) **always returns a float**, even when dividing two integers: `15 / 4 = 3.75`. The `//` operator is floor division — it rounds down to the nearest integer: `15 // 4 = 3`. This differs from Python 2, where `15 / 4` returned `3`. A common bug: expecting an integer from `/` and getting unexpected decimal results in downstream calculations.",
      "hint": "Python 3 changed how `/` works compared to Python 2 — it no longer truncates."
    },
    {
      "id": "python-foundation-35",
      "type": "mcq",
      "question": "Which of the following is the correct Python ternary (conditional) expression syntax?",
      "options": [
        "`status = \"adult\" if age >= 18 else \"minor\"`",
        "`status = age >= 18 ? \"adult\" : \"minor\"`",
        "`status = if age >= 18: \"adult\" else: \"minor\"`",
        "`status = \"adult\" when age >= 18 else \"minor\"`"
      ],
      "answer": 0,
      "explanation": "Python's ternary expression uses `value_if_true if condition else value_if_false`. Option B is C/JavaScript ternary syntax (`?:`), which Python does not support. Option C uses statement syntax (with colons) inside an expression context, which is a `SyntaxError`. Option D uses `when`, which is not a Python keyword. Only option A is valid Python.",
      "hint": "Python reads like English — the condition comes after the value it guards."
    },
    {
      "id": "python-foundation-36",
      "type": "true-false",
      "question": "The expression `name = user_input or 'Anonymous'` will set `name` to `'Anonymous'` when `user_input` is an empty string `\"\"`, even if an empty string was intentional.",
      "answer": true,
      "explanation": "Empty string `\"\"` is falsy in Python, so `\"\" or 'Anonymous'` evaluates to `'Anonymous'` — the exact same mechanism as `0 or 30` returning `30`. Both `0` and `\"\"` are falsy, so the `or` default pattern silently replaces them. The fix is an explicit `None` check: `name = 'Anonymous' if user_input is None else user_input`, which substitutes only when the value is truly absent.",
      "hint": "Empty string and numeric zero share the same falsy behavior with `or` defaults."
    },
    {
      "id": "python-foundation-37",
      "type": "code-output",
      "question": "Predict the output:",
      "code": "count = 0\nfor i in range(5):\n    if i == 2:\n        pass\n    count += 1\nprint(count)",
      "language": "python",
      "options": [
        "`4`",
        "`5`",
        "`3`",
        "`2`"
      ],
      "answer": 1,
      "explanation": "`pass` is a true no-op — it does absolutely nothing, and execution falls through to the next statement. When `i == 2`, `pass` executes (doing nothing), then `count += 1` still runs. All 5 iterations increment `count`, giving `5`. If `continue` were used instead, it would **skip** `count += 1` for `i == 2`, giving `4`. The critical distinction: `pass` fills syntactic space; `continue` redirects control flow.",
      "hint": "`pass` does nothing at all — it's a placeholder, not a loop control statement."
    },
    {
      "id": "python-foundation-38",
      "type": "multiple-select",
      "question": "Which of the following are valid ways to iterate over `d = {'name': 'Alice', 'age': 30}`?",
      "options": [
        "`for key in d:` — iterates over keys",
        "`for value in d.values():` — iterates over values",
        "`for key, value in d.items():` — iterates over key-value pairs",
        "`for key, value in d:` — unpacks each entry directly from the dict",
        "`for value in d.keys():` — iterates over values using the keys method"
      ],
      "answers": [0, 1, 2],
      "explanation": "Iterating a dict directly (`for x in d`) yields its **keys** only, not key-value pairs — so `for key, value in d` fails with `ValueError: too many values to unpack`. `d.keys()` returns keys, not values, making option E semantically wrong (it yields keys while the variable is named `value`). The three correct patterns: `for key in d:` (keys), `for value in d.values():` (values), `for key, value in d.items():` (both).",
      "hint": "Iterating a dict directly yields only keys — you need `.items()` for key-value pairs."
    },
    {
      "id": "python-foundation-39",
      "type": "true-false",
      "question": "In Python's `match-case` statement, execution automatically falls through from a matched `case` to the next one, similar to `switch` in C or Java.",
      "answer": false,
      "explanation": "Unlike C/Java `switch`, Python's `match-case` does **not** fall through. Only the first matching `case` executes, then control exits the match block entirely. In C, you need explicit `break` to prevent fall-through; in Python, there is no fall-through at all — each case is fully isolated. This makes Python's structural pattern matching safer by default.",
      "hint": "Python's match-case was designed to avoid the fall-through footgun present in C-style switch statements."
    },
    {
      "id": "python-foundation-40",
      "type": "mcq",
      "question": "What does `'age' in {'name': 'Alice', 'age': 30}` return?",
      "options": [
        "`True` — `in` checks dictionary keys by default",
        "`False` — `in` checks dictionary values, and `'age'` is not a value",
        "`30` — `in` returns the value associated with the matched key",
        "`True` — but this only works because the key happens to be a string"
      ],
      "answer": 0,
      "explanation": "The `in` operator on a dictionary tests **keys**, not values. `'age' in d` is equivalent to `'age' in d.keys()`. To check values, use `30 in d.values()`. To check a key-value pair, use `('age', 30) in d.items()`. This is intentional: key lookup is O(1) via hashing; scanning values would require an O(n) sweep.",
      "hint": "Think about what `for x in d` iterates over — that's what `in` also checks."
    },
    {
      "id": "python-foundation-41",
      "type": "mcq",
      "question": "In a `match-case` statement, what does `case _:` do?",
      "options": [
        "Matches any value that didn't match a previous case — acts as a catch-all default",
        "Matches only the Python singleton `None` — it's the null wildcard",
        "Raises a `SyntaxError` if the variable `_` was not defined before the `match` block",
        "Matches all falsy values: `None`, `0`, `\"\"`, `[]`, `False`, `{}`"
      ],
      "answer": 0,
      "explanation": "`case _:` is the **wildcard pattern** — it matches anything and is equivalent to the `else` in an `if-elif-else` chain. Unlike `case x:` (which captures the matched value into variable `x`), `_` discards the matched value and doesn't bind it. The wildcard doesn't require `_` to be defined beforehand — it's pattern syntax, not a variable lookup. It must be the last case, or Python raises `SyntaxError` for unreachable patterns after it.",
      "hint": "The `_` convention means 'anything I don't care about' — same as in tuple unpacking like `a, _ = (1, 2)`."
    },
    {
      "id": "python-foundation-42",
      "type": "code-output",
      "question": "What does this code print?",
      "code": "count = 3\nwhile count > 0:\n    print(count, end=' ')\n    count -= 1",
      "language": "python",
      "options": [
        "`3 2 1`",
        "`3 2 1 0`",
        "`2 1 0`",
        "`0 1 2 3`"
      ],
      "answer": 0,
      "explanation": "The loop runs while `count > 0`. Starting at 3: prints `3`, decrements to 2 → prints `2`, decrements to 1 → prints `1`, decrements to 0 → condition `0 > 0` is `False`, loop exits. The value `0` is **never printed** because the condition is evaluated before each iteration, not after. Option B is a common off-by-one mistake from thinking the check happens after the body.",
      "hint": "The `while` condition is evaluated before the loop body — if it's false, the body doesn't run at all."
    },
    {
      "id": "python-foundation-43",
      "type": "mcq",
      "question": "Which of these two functions has O(n) space complexity?\n\n```python\n# Function A\ndef sum_list(arr):\n    total = 0\n    for num in arr:\n        total += num\n    return total\n\n# Function B\ndef double_list(arr):\n    result = []\n    for num in arr:\n        result.append(num * 2)\n    return result\n```",
      "options": [
        "Function A — it iterates over all n elements, so it uses O(n) memory",
        "Function B — it creates a new list that grows proportionally with the input size",
        "Both A and B — any function that processes an n-element list uses O(n) space",
        "Neither — both use the same memory since they share the input list"
      ],
      "answer": 1,
      "explanation": "Space complexity measures **extra memory allocated inside the function**, not the input itself. Function A allocates only one variable (`total`) regardless of input size — that's O(1) extra space. Function B builds a new `result` list that grows to n elements — that's O(n) extra space. The input array doesn't count toward either function's space complexity; it was already in memory before the function ran.",
      "hint": "Count only the memory the function itself creates, not what it receives as a parameter."
    },
    {
      "id": "python-foundation-44",
      "type": "true-false",
      "question": "Quick Sort's worst-case time complexity is O(n²) and can be triggered by an already-sorted input when the first element is always chosen as the pivot.",
      "answer": true,
      "explanation": "Quick Sort picks a pivot and partitions around it. When the input is already sorted and you always pick the first element as pivot, every partition is maximally unbalanced: one side gets 0 elements, the other gets n−1. This forces n levels of recursion instead of log n, giving O(n²) total work. This is why Python's built-in `sorted()` uses Timsort (O(n log n) worst case) rather than naive Quick Sort, and why knowing your data's shape matters when choosing a sort algorithm.",
      "hint": "Think about what happens when the pivot is always the smallest element in the remaining array."
    },
    {
      "id": "python-foundation-45",
      "type": "mcq",
      "question": "You have a `blocklist` (a list) with 100,000 items. For each of 50,000 `urls`, you check `if url in blocklist`. What is the total time complexity of all 50,000 checks, and what is the simplest fix?",
      "options": [
        "O(n²) total — each `in` on a list is O(n); converting `blocklist` to a `set` reduces all 50,000 checks to O(n) total",
        "O(n) total — Python's `in` operator is internally optimized to O(1) for any sequence",
        "O(n log n) total — Python sorts the list internally before searching",
        "O(n²) total — the only fix is to implement binary search, reducing it to O(n log n)"
      ],
      "answer": 0,
      "explanation": "Membership testing (`in`) on a **list** is O(n) — Python scans each element sequentially. Doing 50,000 O(n) checks gives O(n × n) = O(n²) total. Converting to a **set** uses a hash table, making each `in` check O(1) average case. The one-time conversion cost is O(n), so all 50,000 checks together cost O(n) total — a dramatic improvement. Binary search (option D) would give O(n log n) but requires keeping the list sorted; using a set is both simpler and faster.",
      "hint": "What data structure provides O(1) membership testing, similar to dict key lookup?"
    }
  ]
}
{{< /quiz >}}

