---
title: "Building Blocks Quiz"
linkTitle: Building Blocks
type: docs
weight: 2
prev: /quiz/python/01-foundation
next: /quiz/python/03-functions-deep-dive
---

{{< quiz id="python-building-blocks-quiz" >}}
{
  "questions": [
    {
      "type": "mcq",
      "question": "Which data structure allows duplicate values but has immutable keys?",
      "options": [
        "List",
        "Set",
        "Dictionary",
        "Tuple"
      ],
      "answer": 2,
      "explanation": "Dictionaries allow duplicate **values** but require **unique, immutable (hashable) keys**. Lists and tuples allow duplicates but don't have keys. Sets don't allow duplicates at all.",
      "hint": "Think about key-value pairs and which part must be unique."
    },
    {
      "type": "code-output",
      "question": "Predict the output:",
      "code": "s = \"Python\"\nprint(s[::2])",
      "language": "python",
      "options": [
        "\"Pto\"",
        "\"Pth\"",
        "\"yhn\"",
        "\"Pto\" with quotes"
      ],
      "answer": 0,
      "explanation": "The slice `[::2]` starts at index 0, goes to the end, with step 2 (every 2nd character). This gives: P(0), t(2), o(4) = \"Pto\".",
      "hint": "The syntax is [start:stop:step]. What does step=2 mean?"
    },
    {
      "type": "multiple-select",
      "question": "Which of the following operations have O(1) average time complexity?",
      "options": [
        "Accessing a list element by index: `list[i]`",
        "Checking membership in a list: `x in list`",
        "Appending to a list: `list.append(x)`",
        "Dictionary key lookup: `dict[key]`",
        "Set membership test: `x in set`"
      ],
      "answers": [0, 2, 3, 4],
      "explanation": "O(1) operations: list indexing, list.append(), dict access, and set membership. List membership (`x in list`) is O(n) because it requires linear search.",
      "hint": "Which operations require searching through all elements?"
    },
    {
      "type": "fill-blank",
      "question": "What string method converts 'hello world' to 'Hello World' (capitalizing each word)?",
      "answer": "title",
      "caseSensitive": false,
      "explanation": "The `.title()` method capitalizes the first letter of each word. `.capitalize()` only capitalizes the first letter of the entire string.",
      "hint": "It's a method that treats each word like a book title."
    },
    {
      "type": "code-completion",
      "question": "Complete the code to join a list of words with commas:",
      "instruction": "Fill in the missing method",
      "codeTemplate": "words = ['apple', 'banana', 'cherry']\nresult = ', '._____(words)",
      "answer": "join",
      "caseSensitive": false,
      "acceptedAnswers": ["join"],
      "explanation": "The `join()` method is called on the separator string and takes an iterable as argument: `separator.join(iterable)`. This produces 'apple, banana, cherry'."
    },
    {
      "type": "true-false",
      "question": "Strings in Python are mutable, meaning you can change individual characters after creation.",
      "answer": false,
      "explanation": "Strings are **immutable** in Python. Once created, you cannot modify them in place. Operations like `.replace()` or `.upper()` return new strings.",
      "hint": "Try running: s = 'hello'; s[0] = 'H'"
    },
    {
      "type": "mcq",
      "question": "What is the result of `\"Ha\" * 3`?",
      "options": [
        "\"HaHaHa\"",
        "\"Ha3\"",
        "9",
        "TypeError"
      ],
      "answer": 0,
      "explanation": "The `*` operator with strings performs repetition, concatenating the string with itself n times. \"Ha\" * 3 = \"HaHaHa\".",
      "hint": "String repetition is a built-in operation in Python."
    },
    {
      "type": "code-output",
      "question": "What does this code print?",
      "code": "numbers = [1, 2, 3]\nnumbers.append(4)\nnumbers.extend([5, 6])\nprint(len(numbers))",
      "language": "python",
      "options": [
        "3",
        "4",
        "5",
        "6"
      ],
      "answer": 3,
      "explanation": "Start with [1, 2, 3] (length 3). `append(4)` adds one element → [1, 2, 3, 4] (length 4). `extend([5, 6])` adds two elements → [1, 2, 3, 4, 5, 6] (length 6).",
      "hint": "append() adds one item, extend() adds multiple items."
    },
    {
      "type": "flashcard",
      "question": "What is the key difference between `.remove()` and `.pop()` for lists?",
      "answer": "**`.remove(value)`** removes the first occurrence of a **value** and raises ValueError if not found.\n\n**`.pop(index)`** removes and **returns** the element at an **index** (default: last item) and raises IndexError if index is out of range.\n\nKey differences:\n- `remove()` searches by value, `pop()` removes by position\n- `pop()` returns the removed item, `remove()` returns None\n- Different error types when operation fails"
    },
    {
      "type": "multiple-select",
      "question": "Which statements about list comprehensions are true?",
      "options": [
        "List comprehensions are generally faster than equivalent for loops",
        "You can include an `if` condition to filter elements",
        "You can nest multiple comprehensions",
        "List comprehensions can only iterate over lists",
        "List comprehensions always create new lists in memory"
      ],
      "answers": [0, 1, 2, 4],
      "explanation": "Options 0, 1, 2, and 4 are true. The false statement is option 3: list comprehensions work with **any iterable** (not just lists). They are faster than loops, support filtering with `if`, can be nested, and always create new lists in memory.",
      "hint": "Think about what 'comprehension' means and what iterables are."
    },
    {
      "type": "code-output",
      "question": "What is the output?",
      "code": "matrix = [[j for j in range(2)] for i in range(2)]\nprint(matrix[1][0])",
      "language": "python",
      "options": [
        "0",
        "1",
        "2",
        "[0, 1]"
      ],
      "answer": 0,
      "explanation": "The comprehension creates [[0, 1], [0, 1]]. `matrix[1]` accesses the second sublist [0, 1], then `[0]` gets the first element = 0.",
      "hint": "Build the matrix step by step, then access [row][column]."
    },
    {
      "type": "true-false",
      "question": "The `.sort()` method returns a new sorted list without modifying the original.",
      "answer": false,
      "explanation": "`.sort()` sorts the list **in-place** and returns `None`. To get a new sorted list without modifying the original, use the `sorted()` function instead.",
      "hint": "What does 'in-place' mean?"
    },
    {
      "type": "mcq",
      "question": "Why must you use `(1,)` instead of `(1)` to create a single-element tuple?",
      "options": [
        "Python syntax requires it for all tuples",
        "Without the comma, `(1)` is just the integer 1 in parentheses",
        "The comma makes it immutable",
        "To distinguish it from a list"
      ],
      "answer": 1,
      "explanation": "Parentheses alone don't create tuples—the comma does. `(1)` is just integer 1 with parentheses (grouping). `(1,)` uses the comma to signal a tuple. This is necessary because parentheses are used for grouping in Python.",
      "hint": "What makes a tuple a tuple—the parentheses or the comma?"
    },
    {
      "type": "fill-blank",
      "question": "What method would you use to find the first index of value 3 in a tuple `t = (1, 2, 3, 2, 4)`?",
      "answer": "index",
      "caseSensitive": false,
      "explanation": "The `.index(value)` method returns the index of the first occurrence of a value. For `t = (1, 2, 3, 2, 4)`, `t.index(3)` returns 2.",
      "hint": "This method exists for both tuples and lists."
    },
    {
      "type": "flashcard",
      "question": "Why can tuples be used as dictionary keys but lists cannot?",
      "answer": "**Dictionary keys must be hashable (immutable)**.\n\n**Tuples are immutable** → can be hashed → valid as keys\n**Lists are mutable** → cannot be hashed → TypeError if used as keys\n\nExample:\n```python\n# Valid\nlocations = {(0, 0): \"Origin\", (1, 2): \"Point A\"}\n\n# Invalid - TypeError\n# bad_dict = {[0, 0]: \"Origin\"}\n```\n\nHashability ensures the key's hash value never changes, which is critical for dictionary lookup performance."
    },
    {
      "type": "code-completion",
      "question": "Complete the tuple unpacking to extract the first element and the rest:",
      "instruction": "Fill in the unpacking syntax",
      "codeTemplate": "numbers = (1, 2, 3, 4)\nfirst, _____ = numbers\n# first = 1, rest = [2, 3, 4]",
      "answer": "*rest",
      "caseSensitive": false,
      "acceptedAnswers": ["*rest"],
      "explanation": "The `*` operator in unpacking captures remaining elements into a list. `first, *rest = (1, 2, 3, 4)` assigns 1 to first and [2, 3, 4] to rest."
    },
    {
      "type": "mcq",
      "question": "What does `user.get('email', 'N/A')` return if the key 'email' doesn't exist?",
      "options": [
        "None",
        "KeyError",
        "\"N/A\"",
        "Empty string"
      ],
      "answer": 2,
      "explanation": "The `.get(key, default)` method returns the default value ('N/A') if the key doesn't exist. Without a default, it returns None. It never raises KeyError.",
      "hint": "The second argument to .get() is the default value."
    },
    {
      "type": "code-output",
      "question": "What is printed?",
      "code": "counts = {}\ncounts.setdefault('apple', 0)\ncounts['apple'] += 1\nprint(counts['apple'])",
      "language": "python",
      "options": [
        "0",
        "1",
        "KeyError",
        "None"
      ],
      "answer": 1,
      "explanation": "`setdefault('apple', 0)` sets counts['apple'] = 0 (key doesn't exist yet). Then `counts['apple'] += 1` increments it to 1.",
      "hint": "setdefault() inserts the key with default value if missing, then returns the value."
    },
    {
      "type": "multiple-select",
      "question": "Which operations modify a dictionary in place?",
      "options": [
        "`dict[key] = value`",
        "`dict.get(key, default)`",
        "`del dict[key]`",
        "`dict.keys()`",
        "`dict.update(other_dict)`"
      ],
      "answers": [0, 2, 4],
      "explanation": "In-place modifications: assigning `dict[key] = value`, deleting with `del`, and merging with `.update()`. `.get()` and `.keys()` only read data without modification.",
      "hint": "Which operations change the dictionary vs just reading from it?"
    },
    {
      "type": "drag-drop",
      "question": "Arrange the dictionary methods in order from 'safest' (won't raise errors) to 'most likely to raise errors':",
      "instruction": "Drag to arrange from safest to most error-prone",
      "items": [
        "dict.get(key, default)",
        "dict.get(key)",
        "dict[key]",
        "dict.pop(key)"
      ],
      "correctOrder": [0, 1, 2, 3],
      "explanation": "`.get(key, default)` never raises errors (returns default). `.get(key)` returns None if missing (no error). `dict[key]` raises KeyError if missing. `.pop(key)` raises KeyError if missing and no default provided."
    },
    {
      "type": "code-completion",
      "question": "Complete the dictionary comprehension to create {1: 'a', 2: 'b'}:",
      "instruction": "Fill in the comprehension",
      "codeTemplate": "original = {'a': 1, 'b': 2}\nreversed_dict = {_____ for k, v in original.items()}",
      "answer": "v: k",
      "caseSensitive": false,
      "acceptedAnswers": ["v: k", "v:k"],
      "explanation": "Dictionary comprehension syntax is `{key_expr: value_expr for ...}`. To reverse keys and values, use `{v: k for k, v in original.items()}`."
    },
    {
      "type": "flashcard",
      "question": "What's the difference between `dict.keys()`, `dict.values()`, and `dict.items()`?",
      "answer": "**`.keys()`** → Returns view of all keys\n- Example: `dict_keys(['name', 'age'])`\n\n**`.values()`** → Returns view of all values  \n- Example: `dict_values(['Alice', 30])`\n\n**`.items()`** → Returns view of (key, value) pairs as tuples\n- Example: `dict_items([('name', 'Alice'), ('age', 30)])`\n\nAll return **dictionary views** (not lists) that reflect changes to the original dictionary. Use `list()` to convert if needed."
    },
    {
      "type": "true-false",
      "question": "In Python 3.7+, dictionaries maintain insertion order.",
      "answer": true,
      "explanation": "Since Python 3.7, dictionaries are ordered and maintain the order in which keys were inserted. This is now part of the language specification.",
      "hint": "Check the data structure comparison table in the notes."
    },
    {
      "type": "mcq",
      "question": "What happens when you try to add a duplicate element to a set?",
      "options": [
        "It raises a ValueError",
        "It creates a list with duplicates",
        "Nothing—the set ignores duplicates silently",
        "It overwrites the existing element"
      ],
      "answer": 2,
      "explanation": "Sets automatically enforce uniqueness. Adding a duplicate element is simply ignored—no error, no change. The set remains unchanged.",
      "hint": "Sets are defined as collections of unique elements."
    },
    {
      "type": "code-output",
      "question": "What is the result?",
      "code": "a = {1, 2, 3, 4}\nb = {3, 4, 5, 6}\nprint(a - b)",
      "language": "python",
      "options": [
        "{1, 2}",
        "{5, 6}",
        "{1, 2, 5, 6}",
        "{3, 4}"
      ],
      "answer": 0,
      "explanation": "The `-` operator (or `.difference()`) returns elements in `a` that are NOT in `b`. Elements 1 and 2 are only in `a`, so the result is {1, 2}.",
      "hint": "Difference means 'in a but not in b'."
    },
    {
      "type": "multiple-select",
      "question": "Which set operations return a new set (rather than modifying in place)?",
      "options": [
        "`a | b` (union)",
        "`a.add(x)`",
        "`a & b` (intersection)",
        "`a.remove(x)`",
        "`a ^ b` (symmetric difference)"
      ],
      "answers": [0, 2, 4],
      "explanation": "Operators `|`, `&`, and `^` return new sets. Methods `.add()` and `.remove()` modify the set in place and return None.",
      "hint": "Operators typically return new objects; methods often modify in place."
    },
    {
      "type": "fill-blank",
      "question": "What set method removes an element without raising an error if it doesn't exist?",
      "answer": "discard",
      "caseSensitive": false,
      "explanation": "`.discard(x)` removes element x if present, but does nothing (no error) if x doesn't exist. `.remove(x)` raises KeyError if x is not in the set.",
      "hint": "Think about 'safe removal' that won't crash your program."
    },
    {
      "type": "flashcard",
      "question": "What's the difference between `a | b` and `a & b` for sets?",
      "answer": "**`a | b` (Union)** → All unique elements from both sets\n- Example: `{1, 2} | {2, 3}` = `{1, 2, 3}`\n- Can also use `a.union(b)`\n\n**`a & b` (Intersection)** → Only elements present in BOTH sets\n- Example: `{1, 2} & {2, 3}` = `{2}`\n- Can also use `a.intersection(b)`\n\nThink: **Union = everything**, **Intersection = common elements**"
    },
    {
      "type": "code-output",
      "question": "What does this print?",
      "code": "items = [1, 2, 2, 3, 3, 3, 4]\nprint(len(set(items)))",
      "language": "python",
      "options": [
        "7",
        "4",
        "3",
        "1"
      ],
      "answer": 1,
      "explanation": "Converting to a set removes duplicates: `set([1, 2, 2, 3, 3, 3, 4])` = `{1, 2, 3, 4}`. The length is 4 unique elements.",
      "hint": "Sets automatically remove duplicates."
    },
    {
      "type": "true-false",
      "question": "Sets maintain the order of elements as they were inserted.",
      "answer": false,
      "explanation": "Sets are **unordered** collections. They don't maintain insertion order. If you need ordered unique elements, use `dict.fromkeys()` or Python 3.7+ dict keys.",
      "hint": "Check the data structure comparison table."
    },
    {
      "type": "mcq",
      "question": "What does `map()` return in Python 3?",
      "options": [
        "A list",
        "A tuple",
        "An iterator (map object)",
        "A generator function"
      ],
      "answer": 2,
      "explanation": "`map()` returns an iterator (lazy evaluation), not a list. You need to convert it with `list()` or consume it in a loop to get the actual values.",
      "hint": "Think about lazy evaluation and memory efficiency."
    },
    {
      "type": "code-output",
      "question": "What is printed?",
      "code": "names = ['alice', 'bob']\nresult = list(map(str.upper, names))\nprint(result[1])",
      "language": "python",
      "options": [
        "'alice'",
        "'ALICE'",
        "'bob'",
        "'BOB'"
      ],
      "answer": 3,
      "explanation": "`map(str.upper, names)` applies `.upper()` to each name, creating ['ALICE', 'BOB']. `result[1]` accesses the second element = 'BOB'.",
      "hint": "map() applies the function to each element. Index 1 is the second element."
    },
    {
      "type": "flashcard",
      "question": "Why do we need to wrap `map()` with `list()` in Python 3?",
      "answer": "**`map()` returns an iterator (lazy evaluation), not a list.**\n\n**Without `list()`:**\n```python\nresult = map(str.upper, names)\nprint(result)  # <map object at 0x...>\n```\n\n**With `list()`:**\n```python\nresult = list(map(str.upper, names))\nprint(result)  # ['ALICE', 'BOB']\n```\n\n**Benefits of lazy evaluation:**\n- Memory efficient (processes one item at a time)\n- Only computes when needed\n- Can work with infinite sequences\n\n**When to use `list()`:** When you need the complete result immediately or need to use it multiple times."
    },
    {
      "type": "code-completion",
      "question": "Complete the code to filter even numbers:",
      "instruction": "Fill in the lambda function",
      "codeTemplate": "numbers = [1, 2, 3, 4, 5, 6]\nevens = list(filter(lambda x: _____, numbers))",
      "answer": "x % 2 == 0",
      "caseSensitive": false,
      "acceptedAnswers": ["x % 2 == 0", "x%2==0"],
      "explanation": "`filter()` keeps elements where the function returns True. `lambda x: x % 2 == 0` returns True for even numbers (divisible by 2)."
    },
    {
      "type": "mcq",
      "question": "What happens when `zip()` receives iterables of different lengths?",
      "options": [
        "It raises a ValueError",
        "It pads the shorter ones with None",
        "It stops at the shortest iterable",
        "It repeats the shorter iterables"
      ],
      "answer": 2,
      "explanation": "`zip()` stops when the shortest iterable is exhausted. Example: `zip([1, 2, 3], ['a', 'b'])` produces `[(1, 'a'), (2, 'b')]`. The 3 is ignored.",
      "hint": "Think about parallel iteration—what happens when one sequence runs out?"
    },
    {
      "type": "code-output",
      "question": "What does this print?",
      "code": "pairs = [('a', 1), ('b', 2), ('c', 3)]\nletters, numbers = zip(*pairs)\nprint(numbers)",
      "language": "python",
      "options": [
        "[1, 2, 3]",
        "(1, 2, 3)",
        "['a', 'b', 'c']",
        "('a', 'b', 'c')"
      ],
      "answer": 1,
      "explanation": "`zip(*pairs)` unpacks the list and 'unzips' it into separate tuples. `letters = ('a', 'b', 'c')` and `numbers = (1, 2, 3)`. Note: zip returns tuples, not lists.",
      "hint": "The * operator unpacks the list. What does zip return?"
    },
    {
      "type": "multiple-select",
      "question": "Which statements about `enumerate()` are true?",
      "options": [
        "It returns tuples of (index, value)",
        "The default starting index is 0",
        "You can specify a custom starting index with the `start` parameter",
        "It modifies the original iterable",
        "It works with any iterable, not just lists"
      ],
      "answers": [0, 1, 2, 4],
      "explanation": "`enumerate()` returns (index, value) tuples, starts at 0 by default, supports custom start index, and works with any iterable. It does NOT modify the original—it returns a new iterator.",
      "hint": "enumerate() is a non-destructive iterator function."
    },
    {
      "type": "fill-blank",
      "question": "What function returns a new sorted list without modifying the original?",
      "answer": "sorted",
      "caseSensitive": false,
      "explanation": "The `sorted()` function returns a new sorted list. The `.sort()` method sorts in-place and returns None.",
      "hint": "Is it a function or a method?"
    },
    {
      "type": "code-output",
      "question": "What is the output?",
      "code": "words = ['apple', 'pie', 'banana']\nresult = max(words, key=len)\nprint(result)",
      "language": "python",
      "options": [
        "\"apple\"",
        "\"banana\"",
        "\"pie\"",
        "6"
      ],
      "answer": 1,
      "explanation": "`max(words, key=len)` finds the word with maximum length. 'banana' has 6 characters (longest), so it returns 'banana', not the length.",
      "hint": "max() with key=len returns the element itself, not the length."
    },
    {
      "type": "true-false",
      "question": "`any([False, False, False])` returns True.",
      "answer": false,
      "explanation": "`any()` returns True if **at least one** element is True. Since all elements are False, it returns False. `any([False, False, True])` would return True.",
      "hint": "any() means 'at least one True'."
    },
    {
      "type": "flashcard",
      "question": "What's the difference between `any()` and `all()`?",
      "answer": "**`any(iterable)`** → True if **at least one** element is True\n- `any([False, False, True])` = `True`\n- `any([False, False, False])` = `False`\n- Short-circuits: stops at first True\n\n**`all(iterable)`** → True if **all** elements are True\n- `all([True, True, True])` = `True`\n- `all([True, False, True])` = `False`\n- Short-circuits: stops at first False\n\n**Common patterns:**\n```python\n# Check if string has any digits\nany(c.isdigit() for c in \"abc3x\")  # True\n\n# Check if all numbers are positive\nall(n > 0 for n in [1, 2, 3])  # True\n```"
    },
    {
      "type": "code-completion",
      "question": "Complete the lambda function to sort points by their second element:",
      "instruction": "Fill in the lambda",
      "codeTemplate": "points = [(1, 5), (3, 2), (2, 8)]\nsorted_points = sorted(points, key=lambda x: _____)",
      "answer": "x[1]",
      "caseSensitive": false,
      "acceptedAnswers": ["x[1]"],
      "explanation": "To sort by the second element of each tuple, the lambda should return `x[1]`. This gives [(3, 2), (1, 5), (2, 8)] sorted by second values: 2, 5, 8."
    },
    {
      "type": "mcq",
      "question": "When should you prefer a list comprehension over `map()`?",
      "options": [
        "When you need lazy evaluation",
        "When you want more readable code with filtering",
        "When working with infinite sequences",
        "Never—map() is always better"
      ],
      "answer": 1,
      "explanation": "List comprehensions are more Pythonic and readable, especially when combining mapping and filtering. `map()` is better for lazy evaluation or when you already have a named function. Example: `[x**2 for x in nums if x > 0]` is clearer than `list(map(lambda x: x**2, filter(lambda x: x > 0, nums)))`.",
      "hint": "Consider readability and the Zen of Python."
    },
    {
      "type": "code-output",
      "question": "What does this code produce?",
      "code": "numbers = [1, 2, 3, 4]\nresult = all(n > 0 for n in numbers)\nprint(result)",
      "language": "python",
      "options": [
        "True",
        "False",
        "[True, True, True, True]",
        "4"
      ],
      "answer": 0,
      "explanation": "`all()` checks if all elements satisfy the condition. Since all numbers (1, 2, 3, 4) are greater than 0, it returns True.",
      "hint": "all() returns a single boolean, not a list."
    },
    {
      "type": "drag-drop",
      "question": "Arrange these operations from fastest to slowest time complexity for large lists:",
      "instruction": "Drag to order by speed (fastest to slowest)",
      "items": [
        "list.append(x)",
        "list[i] = x",
        "list.insert(0, x)",
        "x in list"
      ],
      "correctOrder": [0, 1, 2, 3],
      "explanation": "O(1): append() and index assignment. O(n): insert(0) shifts all elements, membership test searches linearly. Order: append ≈ indexing (both O(1)), then insert(0), then membership (both O(n)).",
      "hint": "Check the time complexity tables in the notes."
    },
    {
      "type": "true-false",
      "question": "The expression `[1, 2, 3] + [4, 5]` creates a new list without modifying the original lists.",
      "answer": true,
      "explanation": "The `+` operator for lists creates a **new** list containing all elements. The original lists remain unchanged. To modify in place, use `.extend()`.",
      "hint": "Concatenation with + always creates new objects."
    },
    {
      "type": "mcq",
      "question": "Why should you avoid modifying a list while iterating over it?",
      "options": [
        "It's against Python syntax rules",
        "It can cause the iterator to skip elements or raise errors",
        "It makes the code run slower",
        "Lists become immutable during iteration"
      ],
      "answer": 1,
      "explanation": "Modifying a list during iteration can cause unpredictable behavior—skipping elements, processing the same element twice, or index errors. Instead, iterate over a copy (`for item in list[:]`) or use comprehension.",
      "hint": "Think about what happens when you remove an element that the iterator is pointing to."
    },
    {
      "type": "code-completion",
      "question": "Fix this code to safely remove even numbers while iterating:",
      "instruction": "Replace the problematic line",
      "codeTemplate": "numbers = [1, 2, 3, 4, 5]\n# Bad approach (causes issues):\n# for num in numbers:\n#     if num % 2 == 0:\n#         numbers.remove(num)\n\n# Good approach:\nnumbers = [_____ for n in numbers if _____]",
      "answer": "n, n % 2 != 0",
      "caseSensitive": false,
      "acceptedAnswers": ["n, n % 2 != 0", "n,n%2!=0"],
      "explanation": "Use list comprehension to create a new list with only odd numbers: `numbers = [n for n in numbers if n % 2 != 0]`. This avoids modifying the list during iteration."
    },
    {
      "type": "flashcard",
      "question": "What's the gotcha with `.append()` when adding multiple items to a list?",
      "answer": "**`.append()` takes exactly ONE argument!**\n\n**Wrong:**\n```python\nmy_list = []\nmy_list.append(1, 2, 3)  # TypeError!\n```\n\n**Correct options:**\n\n1. **One at a time:**\n```python\nmy_list.append(1)\nmy_list.append(2)\n```\n\n2. **Use `.extend()` for multiple items:**\n```python\nmy_list.extend([1, 2, 3])  # [1, 2, 3]\n```\n\n3. **Append a single structured item (e.g., dict):**\n```python\nlog = []\nlog.append({'ip': '192.168.1.1', 'method': 'GET'})\n```\n\n**Key: append = one item, extend = multiple items**"
    }
  ]
}
{{< /quiz >}}

