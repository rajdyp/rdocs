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
      "type": "mcq",
      "question": "What happens when you execute `a = [1, 2, 3]` followed by `b = a` and then `b.append(4)`?",
      "options": [
        "Only `b` contains `[1, 2, 3, 4]`, `a` remains `[1, 2, 3]`",
        "Both `a` and `b` contain `[1, 2, 3, 4]`",
        "Python raises a `ReferenceError`",
        "Only `a` contains `[1, 2, 3, 4]`, `b` remains `[1, 2, 3]`"
      ],
      "answer": 1,
      "explanation": "In Python, `b = a` creates a reference to the same list object, not a copy. When you modify `b`, you're modifying the same object that `a` references. To create an independent copy, use `b = a.copy()`.",
      "hint": "Think about whether variables hold values or references to objects."
    },
    {
      "type": "multiple-select",
      "question": "Which of the following evaluate to `False` in a boolean context?",
      "options": [
        "`0`",
        "`[0]`",
        "`\"\"`",
        "`None`",
        "`False`",
        "`{}`"
      ],
      "answers": [0, 2, 3, 4, 5],
      "explanation": "Falsy values in Python include: numeric zero (`0`, `0.0`, `0j`), empty sequences (`\"\"`, `[]`, `()`, `{}`), `None`, and `False`. Note that `[0]` is a non-empty list containing one element, so it's truthy.",
      "hint": "Empty containers are falsy, but containers with items (even if those items are falsy) are truthy."
    },
    {
      "type": "true-false",
      "question": "The expression `1 < x < 10` is equivalent to `1 < x and x < 10` in Python.",
      "answer": true,
      "explanation": "Python supports chained comparisons, which is a Pythonic feature. `1 < x < 10` is syntactic sugar for `1 < x and x < 10`, making code more readable.",
      "hint": "This is one of Python's unique features that makes comparisons more natural."
    },
    {
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
      "type": "fill-blank",
      "question": "What operator is used in Python 3.8+ to assign a value AND use it in the same expression?",
      "answer": ":=",
      "caseSensitive": false,
      "explanation": "The walrus operator (`:=`) allows you to assign a value to a variable and use that value in the same expression, e.g., `if (n := len(data)) > 10:`",
      "hint": "It's nicknamed after an animal because of how it looks."
    },
    {
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
      "type": "mcq",
      "question": "Which comparison should you use to check if a variable is `None`?",
      "options": [
        "`x == None`",
        "`x is None`",
        "`bool(x) == False`",
        "`not x`"
      ],
      "answer": 1,
      "explanation": "Always use `is` (not `==`) for `None` checks. `is` checks for object identity, while `==` checks for value equality. Since `None` is a singleton, `is None` is the correct and idiomatic approach.",
      "hint": "Think about identity versus equality."
    },
    {
      "type": "true-false",
      "question": "The expression `False and expensive_function()` will execute `expensive_function()`.",
      "answer": false,
      "explanation": "Python uses short-circuit evaluation. Since the left side of `and` is `False`, the result is already known to be `False`, so Python never evaluates the right side. This is an optimization that can prevent unnecessary computations.",
      "hint": "Consider what 'short-circuit evaluation' means."
    },
    {
      "type": "drag-drop",
      "question": "Arrange these Big O complexities from fastest to slowest:",
      "instruction": "Drag to arrange in order of increasing runtime (fastest to slowest)",
      "items": [
        "O(1)",
        "O(log n)",
        "O(n)",
        "O(n log n)",
        "O(n²)",
        "O(2ⁿ)"
      ],
      "correctOrder": [0, 1, 2, 3, 4, 5],
      "explanation": "The order from fastest to slowest is: O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ). Constant time is fastest, exponential is slowest."
    },
    {
      "type": "mcq",
      "question": "What is the time complexity of this code?",
      "options": [
        "O(1)",
        "O(n)",
        "O(n log n)",
        "O(n²)"
      ],
      "answer": 3,
      "explanation": "This is a nested loop where both loops run `n` times. The outer loop runs `n` times, and for each iteration of the outer loop, the inner loop also runs `n` times. Total operations: n × n = n². This is quadratic time complexity.",
      "hint": "Count how many times the innermost operation executes relative to the input size."
    },
    {
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
      "type": "flashcard",
      "question": "What is the Walrus Operator and when was it introduced?",
      "answer": "**The Walrus Operator (`:=`)**\n\nIntroduced in Python 3.8+, it allows you to assign a value to a variable AND use that value in the same expression.\n\n**Example:**\n```python\nif (n := len(data)) > 10:\n    print(f\"List has {n} elements\")\n```\n\nThis evaluates `len(data)`, assigns it to `n`, and uses it in the comparison—all in one line."
    },
    {
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
      "type": "mcq",
      "question": "What is the problem with using `timeout = seconds or 30` when `seconds` can legitimately be `0`?",
      "options": [
        "It will cause a `TypeError`",
        "It will set `timeout` to `30` when `seconds` is `0`, even though `0` is a valid value",
        "It will set `timeout` to `None`",
        "There is no problem with this code"
      ],
      "answer": 1,
      "explanation": "Since `0` is falsy in Python, `0 or 30` evaluates to `30`. If `0` is a valid timeout value (e.g., no timeout), this breaks the logic. The fix is: `timeout = 30 if seconds is None else seconds`, which explicitly checks for `None` only.",
      "hint": "Consider that numeric zero is falsy but might be a meaningful value."
    },
    {
      "type": "true-false",
      "question": "In Big O notation, O(2n) and O(n) are considered equivalent.",
      "answer": true,
      "explanation": "Big O notation drops constants because it focuses on how runtime scales with input size, not exact operation counts. Both O(2n) and O(n) scale linearly, so they're both O(n). The constant factor (2×) becomes negligible for large inputs.",
      "hint": "Big O cares about growth rate, not exact counts."
    },
    {
      "type": "fill-blank",
      "question": "What is the time complexity of binary search? (Use Big O notation)",
      "answer": "O(log n)",
      "caseSensitive": false,
      "explanation": "Binary search has O(log n) complexity because it halves the search space with each iteration. For an array of 1000 elements, it takes at most ~10 steps (log₂ 1000 ≈ 10).",
      "hint": "Think about how many times you can divide n by 2 until you reach 1."
    },
    {
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
      "type": "flashcard",
      "question": "What is Short-Circuit Evaluation?",
      "answer": "**Short-Circuit Evaluation**\n\nPython stops evaluating a logical expression as soon as the final result is determined.\n\n**With `and`:**\n- If left side is `False`, result must be `False`—don't evaluate right side\n- `False and expensive_function()` → Never calls function\n\n**With `or`:**\n- If left side is `True`, result must be `True`—don't evaluate right side  \n- `True or expensive_function()` → Never calls function\n\nThis is both an optimization and a useful programming pattern for avoiding errors (e.g., `x and x.method()` won't fail if `x` is `None`)."
    },
    {
      "type": "mcq",
      "question": "What is the time complexity of looking up a value in a Python dictionary?",
      "options": [
        "O(1) - Constant",
        "O(log n) - Logarithmic",
        "O(n) - Linear",
        "O(n²) - Quadratic"
      ],
      "answer": 0,
      "explanation": "Dictionary lookup in Python uses hash tables, providing O(1) average-case lookup time. This makes dictionaries much faster than lists for membership testing when you have many elements.",
      "hint": "Dictionaries use hashing for direct access."
    },
    {
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
      "type": "true-false",
      "question": "The expression `isinstance(3.14, (int, float))` returns `True`.",
      "answer": true,
      "explanation": "`isinstance()` can check against a tuple of types, returning `True` if the value matches any type in the tuple. Since `3.14` is a float, and float is in the tuple `(int, float)`, it returns `True`.",
      "hint": "isinstance() accepts either a single type or a tuple of types."
    },
    {
      "type": "flashcard",
      "question": "What is the Accumulator Pattern?",
      "answer": "**The Accumulator Pattern**\n\nA fundamental programming pattern that builds up a result through iteration:\n\n1. **Initialize** a variable before the loop (e.g., `total = 0`)\n2. **Update** it inside the loop (e.g., `total += num`)\n3. **Use** the final result after the loop\n\n**Examples:**\n```python\n# Sum accumulator\ntotal = 0\nfor num in numbers:\n    total += num\n\n# List accumulator\nsquares = []\nfor i in range(1, 6):\n    squares.append(i ** 2)\n```\n\nThe key is that the variable is declared **outside** the loop so it persists across iterations."
    },
    {
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
      "type": "fill-blank",
      "question": "What keyword is used to skip the current iteration of a loop and move to the next one?",
      "answer": "continue",
      "caseSensitive": false,
      "explanation": "The `continue` keyword skips the remaining code in the current loop iteration and jumps to the next iteration. It's different from `break`, which exits the loop entirely.",
      "hint": "It's not `break` or `pass`."
    },
    {
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
      "type": "true-false",
      "question": "An algorithm with O(n + n²) time complexity simplifies to O(n) in Big O notation.",
      "answer": false,
      "explanation": "When combining complexities, we keep the dominant (largest) term. Since n² grows much faster than n, O(n + n²) simplifies to O(n²), not O(n). For example, with n=1000: n=1,000 but n²=1,000,000—the n² term dominates.",
      "hint": "Which term grows faster as n increases?"
    },
    {
      "type": "flashcard",
      "question": "What is the difference between `==` and `is` in Python?",
      "answer": "**`==` vs `is`**\n\n**`==` (Equality Operator):**\n- Compares **values**\n- Checks if two objects have the same content\n- Example: `[1, 2, 3] == [1, 2, 3]` → `True`\n\n**`is` (Identity Operator):**\n- Compares **object identity** (memory address)\n- Checks if two variables reference the exact same object\n- Example: `a = [1, 2, 3]; b = [1, 2, 3]; a is b` → `False`\n\n**Best Practice:**\n- Use `is` for singleton objects like `None`: `x is None`\n- Use `==` for value comparisons"
    }
  ]
}
{{< /quiz >}}

