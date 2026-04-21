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
      "id": "python-building-blocks-quiz-01",
      "type": "true-false",
      "question": "Dictionary keys can hold any Python object, including lists and other dictionaries.",
      "answer": false,
      "explanation": "Dictionary keys must be **hashable** (immutable). Lists and dicts are mutable and therefore unhashable — using one as a key raises `TypeError`. Values, on the other hand, can be any Python object, including lists and nested dicts.",
      "hint": "Can you use a list as a dictionary key? Try it."
    },
    {
      "id": "python-building-blocks-quiz-02",
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
      "id": "python-building-blocks-quiz-03",
      "type": "multiple-select",
      "question": "Which of the following operations have O(1) average time complexity?",
      "options": [
        "Accessing a list element by index: `list[i]`",
        "Checking membership in a list: `x in list`",
        "Appending to a list: `list.append(x)`",
        "Dictionary key lookup: `dict[key]`",
        "Set membership test: `x in set`",
        "Removing the first element: `list.pop(0)`"
      ],
      "answers": [0, 2, 3, 4],
      "explanation": "O(1) operations: list indexing, list.append(), dict access, and set membership. List membership (`x in list`) is O(n) because it requires linear search. `list.pop(0)` is also O(n) — removing from the front shifts every remaining element.",
      "hint": "Which operations require searching through or shifting all elements?"
    },
    {
      "id": "python-building-blocks-quiz-04",
      "type": "fill-blank",
      "question": "What string method converts 'hello world' to 'Hello World' (capitalizing each word)?",
      "answer": "title",
      "caseSensitive": false,
      "explanation": "The `.title()` method capitalizes the first letter of each word. `.capitalize()` only capitalizes the first letter of the entire string.",
      "hint": "It's a method that treats each word like a book title."
    },
    {
      "id": "python-building-blocks-quiz-05",
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
      "id": "python-building-blocks-quiz-06",
      "type": "true-false",
      "question": "Strings in Python are mutable, meaning you can change individual characters after creation.",
      "answer": false,
      "explanation": "Strings are **immutable** in Python. Once created, you cannot modify them in place. Operations like `.replace()` or `.upper()` return new strings.",
      "hint": "Try running: s = 'hello'; s[0] = 'H'"
    },
    {
      "id": "python-building-blocks-quiz-07",
      "type": "mcq",
      "question": "What is the result of `\"Ha\" * 3`?",
      "options": [
        "\"HaHaHa\"",
        "\"Ha3\"",
        "\"Ha Ha Ha\"",
        "TypeError"
      ],
      "answer": 0,
      "explanation": "The `*` operator with strings performs repetition, concatenating the string with itself n times. \"Ha\" * 3 = \"HaHaHa\". No spaces are inserted between copies.",
      "hint": "String repetition is a built-in operation in Python."
    },
    {
      "id": "python-building-blocks-quiz-08",
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
      "id": "python-building-blocks-quiz-09",
      "type": "flashcard",
      "question": "What is the key difference between `.remove()` and `.pop()` for lists?",
      "answer": "**`.remove(value)`** removes the first occurrence of a **value** and raises ValueError if not found.\n\n**`.pop(index)`** removes and **returns** the element at an **index** (default: last item) and raises IndexError if index is out of range.\n\nKey differences:\n- `remove()` searches by value, `pop()` removes by position\n- `pop()` returns the removed item, `remove()` returns None\n- Different error types when operation fails"
    },
    {
      "id": "python-building-blocks-quiz-10",
      "type": "multiple-select",
      "question": "Which statements about list comprehensions are true?",
      "options": [
        "List comprehensions are generally faster than equivalent for loops",
        "You can include an `if` condition to filter elements",
        "You can nest multiple comprehensions",
        "List comprehensions can only iterate over lists",
        "List comprehensions always create new lists in memory",
        "List comprehensions evaluate lazily and don't create a list until needed"
      ],
      "answers": [0, 1, 2, 4],
      "explanation": "Options 1, 2, 3, and 5 are true. Option 4 is false: list comprehensions work with **any iterable**. Option 6 is also false: list comprehensions eagerly create a new list immediately — if you want lazy evaluation, use a **generator expression** `(x for x in ...)` instead.",
      "hint": "Think about what 'comprehension' means and what iterables are."
    },
    {
      "id": "python-building-blocks-quiz-11",
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
      "id": "python-building-blocks-quiz-12",
      "type": "true-false",
      "question": "The `.sort()` method returns a new sorted list without modifying the original.",
      "answer": false,
      "explanation": "`.sort()` sorts the list **in-place** and returns `None`. To get a new sorted list without modifying the original, use the `sorted()` function instead.",
      "hint": "What does 'in-place' mean?"
    },
    {
      "id": "python-building-blocks-quiz-13",
      "type": "mcq",
      "question": "Why must you use `(1,)` instead of `(1)` to create a single-element tuple?",
      "options": [
        "Python syntax requires it for all tuples",
        "Without the comma, `(1)` is just the integer 1 in parentheses",
        "The comma makes it immutable",
        "To distinguish it from a list"
      ],
      "answer": 1,
      "explanation": "Parentheses don't create tuples — the comma does. Parentheses are just grouping syntax, not tuple syntax. `(1)` is just integer 1 with parentheses (grouping). `(1,)` uses the comma to signal a tuple. This is necessary because parentheses are used for grouping in Python.",
      "hint": "What makes a tuple a tuple—the parentheses or the comma?"
    },
    {
      "id": "python-building-blocks-quiz-14",
      "type": "fill-blank",
      "question": "What method would you use to find the first index of value 3 in a tuple `t = (1, 2, 3, 2, 4)`?",
      "answer": "index",
      "caseSensitive": false,
      "explanation": "The `.index(value)` method returns the index of the first occurrence of a value. For `t = (1, 2, 3, 2, 4)`, `t.index(3)` returns 2.",
      "hint": "This method exists for both tuples and lists."
    },
    {
      "id": "python-building-blocks-quiz-15",
      "type": "flashcard",
      "question": "Why can tuples be used as dictionary keys but lists cannot?",
      "answer": "**Dictionary keys must be hashable (immutable)**.\n\n**Tuples are immutable** → can be hashed → valid as keys\n\n**Lists are mutable** → cannot be hashed → TypeError if used as keys\n\nExample:\n```python\n# Valid\nlocations = {(0, 0): \"Origin\", (1, 2): \"Point A\"}\n\n# Invalid - TypeError\n# bad_dict = {[0, 0]: \"Origin\"}\n```\n\nHashability ensures the key's hash value never changes, which is critical for dictionary lookup performance."
    },
    {
      "id": "python-building-blocks-quiz-16",
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
      "id": "python-building-blocks-quiz-17",
      "type": "mcq",
      "question": "What does `user.get('email', 'N/A')` return if the key 'email' doesn't exist?",
      "options": [
        "None",
        "KeyError",
        "\"N/A\"",
        "The key 'email' is inserted into the dict with value 'N/A'"
      ],
      "answer": 2,
      "explanation": "The `.get(key, default)` method returns the default value ('N/A') if the key doesn't exist — and **does not modify the dictionary**. Without a default, it returns None. It never raises KeyError. To also insert the default, use `.setdefault()` instead.",
      "hint": "The second argument to .get() is the default value."
    },
    {
      "id": "python-building-blocks-quiz-18",
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
      "id": "python-building-blocks-quiz-19",
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
      "id": "python-building-blocks-quiz-20",
      "type": "drag-drop",
      "question": "Arrange the dictionary methods in order from 'safest' (won't raise errors) to 'most likely to raise errors':",
      "instruction": "Drag to arrange from safest to most error-prone",
      "items": [
        "dict[key]",
        "dict.get(key)",
        "dict.get(key, default)"
      ],
      "correctOrder": [2, 1, 0],
      "explanation": "`.get(key, default)` never raises errors (returns default). `.get(key)` returns None if missing (no error). `dict[key]` raises KeyError if missing."
    },
    {
      "id": "python-building-blocks-quiz-21",
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
      "id": "python-building-blocks-quiz-22",
      "type": "flashcard",
      "question": "What's the difference between `dict.keys()`, `dict.values()`, and `dict.items()`?",
      "answer": "**`.keys()`** → Returns view of all keys\n- Example: `dict_keys(['name', 'age'])`\n\n**`.values()`** → Returns view of all values  \n- Example: `dict_values(['Alice', 30])`\n\n**`.items()`** → Returns view of (key, value) pairs as tuples\n- Example: `dict_items([('name', 'Alice'), ('age', 30)])`\n\nAll return **dictionary views** (not lists) that reflect changes to the original dictionary. Use `list()` to convert if needed."
    },
    {
      "id": "python-building-blocks-quiz-23",
      "type": "true-false",
      "question": "In Python 3.7+, dictionaries maintain insertion order.",
      "answer": true,
      "explanation": "Since Python 3.7, dictionaries are ordered and maintain the order in which keys were inserted. This is now part of the language specification.",
      "hint": "Check the data structure comparison table in the notes."
    },
    {
      "id": "python-building-blocks-quiz-24",
      "type": "mcq",
      "question": "What happens when you try to add a duplicate element to a set?",
      "options": [
        "It raises a ValueError",
        "It raises a TypeError because sets only accept hashable elements",
        "Nothing—the set ignores duplicates silently",
        "It overwrites the existing element"
      ],
      "answer": 2,
      "explanation": "Sets automatically enforce uniqueness. Adding a duplicate element is simply ignored—no error, no change. The set remains unchanged. (TypeError is what you get for adding an *unhashable* element like a list, not a duplicate.)",
      "hint": "Sets are defined as collections of unique elements."
    },
    {
      "id": "python-building-blocks-quiz-25",
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
      "id": "python-building-blocks-quiz-26",
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
      "id": "python-building-blocks-quiz-27",
      "type": "fill-blank",
      "question": "What set method removes an element without raising an error if it doesn't exist?",
      "answer": "discard",
      "caseSensitive": false,
      "explanation": "`.discard(x)` removes element x if present, but does nothing (no error) if x doesn't exist. `.remove(x)` raises KeyError if x is not in the set.",
      "hint": "Think about 'safe removal' that won't crash your program."
    },
    {
      "id": "python-building-blocks-quiz-28",
      "type": "flashcard",
      "question": "What's the difference between `a | b` and `a & b` for sets?",
      "answer": "**`a | b` (Union)** → All unique elements from both sets\n- Example: `{1, 2} | {2, 3}` = `{1, 2, 3}`\n- Can also use `a.union(b)`\n\n**`a & b` (Intersection)** → Only elements present in BOTH sets\n- Example: `{1, 2} & {2, 3}` = `{2}`\n- Can also use `a.intersection(b)`\n\nThink: **Union = everything**, **Intersection = common elements**"
    },
    {
      "id": "python-building-blocks-quiz-29",
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
      "id": "python-building-blocks-quiz-30",
      "type": "true-false",
      "question": "Sets maintain the order of elements as they were inserted.",
      "answer": false,
      "explanation": "Sets are **unordered** collections. They don't maintain insertion order. If you need ordered unique elements, use `dict.fromkeys()` or Python 3.7+ dict keys.",
      "hint": "Check the data structure comparison table."
    },
    {
      "id": "python-building-blocks-quiz-31",
      "type": "mcq",
      "question": "What does `map()` return in Python 3?",
      "options": [
        "A list",
        "A generator object",
        "An iterator (map object)",
        "A generator function"
      ],
      "answer": 2,
      "explanation": "`map()` returns an **iterator** (a map object), not a list. This is similar to a generator in that it uses lazy evaluation, but it is its own distinct type. You need to convert it with `list()` or consume it in a loop to get the actual values.",
      "hint": "Think about lazy evaluation and memory efficiency."
    },
    {
      "id": "python-building-blocks-quiz-32",
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
      "id": "python-building-blocks-quiz-33",
      "type": "flashcard",
      "question": "Why do we need to wrap `map()` with `list()` in Python 3?",
      "answer": "**`map()` returns an iterator (lazy evaluation), not a list.**\n\n**Without `list()`:**\n```python\nresult = map(str.upper, names)\nprint(result)  # <map object at 0x...>\n```\n\n**With `list()`:**\n```python\nresult = list(map(str.upper, names))\nprint(result)  # ['ALICE', 'BOB']\n```\n\n**Benefits of lazy evaluation:**\n- Memory efficient (processes one item at a time)\n- Only computes when needed\n- Can work with infinite sequences\n\n**When to use `list()`:** When you need the complete result immediately or need to use it multiple times."
    },
    {
      "id": "python-building-blocks-quiz-34",
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
      "id": "python-building-blocks-quiz-35",
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
      "id": "python-building-blocks-quiz-36",
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
      "id": "python-building-blocks-quiz-37",
      "type": "multiple-select",
      "question": "Which statements about `enumerate()` are true?",
      "options": [
        "It returns tuples of (index, value)",
        "The default starting index is 0",
        "You can specify a custom starting index with the `start` parameter",
        "It modifies the original iterable",
        "It works with any iterable, not just lists",
        "enumerate() requires the iterable to support integer indexing"
      ],
      "answers": [0, 1, 2, 4],
      "explanation": "`enumerate()` returns (index, value) tuples, starts at 0 by default, supports custom start index, and works with any iterable — including strings, generators, and files. It does NOT modify the original, and does NOT require the iterable to support indexing.",
      "hint": "enumerate() is a non-destructive iterator function."
    },
    {
      "id": "python-building-blocks-quiz-38",
      "type": "fill-blank",
      "question": "What function returns a new sorted list without modifying the original?",
      "answer": "sorted",
      "caseSensitive": false,
      "explanation": "The `sorted()` function returns a new sorted list. The `.sort()` method sorts in-place and returns None.",
      "hint": "Is it a function or a method?"
    },
    {
      "id": "python-building-blocks-quiz-39",
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
      "id": "python-building-blocks-quiz-40",
      "type": "true-false",
      "question": "`any([False, False, False])` returns True.",
      "answer": false,
      "explanation": "`any()` returns True if **at least one** element is True. Since all elements are False, it returns False. `any([False, False, True])` would return True.",
      "hint": "any() means 'at least one True'."
    },
    {
      "id": "python-building-blocks-quiz-41",
      "type": "flashcard",
      "question": "What's the difference between `any()` and `all()`?",
      "answer": "**`any(iterable)`** → True if **at least one** element is True\n- `any([False, False, True])` = `True`\n- `any([False, False, False])` = `False`\n- Short-circuits: stops at first True\n\n**`all(iterable)`** → True if **all** elements are True\n- `all([True, True, True])` = `True`\n- `all([True, False, True])` = `False`\n- Short-circuits: stops at first False\n\n**Common patterns:**\n```python\n# Check if string has any digits\nany(c.isdigit() for c in \"abc3x\")  # True\n\n# Check if all numbers are positive\nall(n > 0 for n in [1, 2, 3])  # True\n```"
    },
    {
      "id": "python-building-blocks-quiz-42",
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
      "id": "python-building-blocks-quiz-43",
      "type": "mcq",
      "question": "When should you prefer a list comprehension over `map()`?",
      "options": [
        "When you need lazy evaluation",
        "When you want more readable code with filtering",
        "When working with infinite sequences",
        "When you already have a named function to apply (e.g., `str.upper`)"
      ],
      "answer": 1,
      "explanation": "List comprehensions are more Pythonic and readable, especially when combining mapping and filtering. `map()` is often cleaner when you already have a named function — `map(str.upper, names)` vs `[str.upper(n) for n in names]`. For lazy evaluation or infinite sequences, `map()` (or a generator expression) is the right choice.",
      "hint": "Consider readability and the Zen of Python."
    },
    {
      "id": "python-building-blocks-quiz-44",
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
      "id": "python-building-blocks-quiz-45",
      "type": "multiple-select",
      "question": "Which of these list operations run in O(1) time for large lists?",
      "options": [
        "list.append(x)",
        "list[i] = x",
        "list.insert(0, x)",
        "x in list"
      ],
      "answers": [0, 1],
      "explanation": "list.append(x) — O(1) amortized: adds to the end with no shifting. list[i] = x — O(1): direct index access, no traversal. list.insert(0, x) — O(n): every existing element must shift right by one. x in list — O(n): Python scans from the first element until it finds a match or exhausts the list.",
      "hint": "Check the time complexity tables in the notes."
    },
    {
      "id": "python-building-blocks-quiz-46",
      "type": "true-false",
      "question": "The expression `[1, 2, 3] + [4, 5]` creates a new list without modifying the original lists.",
      "answer": true,
      "explanation": "The `+` operator for lists creates a **new** list containing all elements. The original lists remain unchanged. To modify in place, use `.extend()`.",
      "hint": "Concatenation with + always creates new objects."
    },
    {
      "id": "python-building-blocks-quiz-47",
      "type": "mcq",
      "question": "Why should you avoid modifying a list while iterating over it?",
      "options": [
        "It raises a RuntimeError: 'list changed size during iteration'",
        "It can cause the iterator to skip elements or raise errors",
        "It makes the code run slower",
        "Lists become immutable during iteration"
      ],
      "answer": 1,
      "explanation": "Python does NOT automatically detect or block list modification during iteration. The iterator simply tracks an internal index; when elements are removed, that index jumps over items silently. The result is skipped elements or wrong output — no RuntimeError is raised. (Note: dicts and sets *do* raise RuntimeError for this; lists do not.)",
      "hint": "Think about what happens when you remove an element that the iterator is pointing to."
    },
    {
      "id": "python-building-blocks-quiz-48",
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
      "id": "python-building-blocks-quiz-49",
      "type": "flashcard",
      "question": "What's the gotcha with `.append()` when adding multiple items to a list?",
      "answer": "**`.append()` takes exactly ONE argument!**\n\n**Wrong:**\n```python\nmy_list = []\nmy_list.append(1, 2, 3)  # TypeError!\n```\n\n**Correct options:**\n\n1. **One at a time:**\n```python\nmy_list.append(1)\nmy_list.append(2)\n```\n\n2. **Use `.extend()` for multiple items:**\n```python\nmy_list.extend([1, 2, 3])  # [1, 2, 3]\n```\n\n3. **Append a single structured item (e.g., dict):**\n```python\nlog = []\nlog.append({'ip': '192.168.1.1', 'method': 'GET'})\n```\n\n**Key: append = one item, extend = multiple items**"
    },
    {
      "id": "python-building-blocks-quiz-50",
      "type": "mcq",
      "question": "You need to modify list elements in-place based on their current values. What's the safest approach?",
      "options": [
        "for item in my_list: my_list[i] = transform(item)",
        "for i, item in enumerate(my_list): my_list[i] = transform(item)",
        "for i, item in enumerate(my_list[:]): my_list[i] = transform(item)",
        "my_list = [transform(item) for item in my_list]"
      ],
      "answer": 2,
      "explanation": "Option 3 is correct: `enumerate(my_list[:])` iterates over a COPY while modifying the original by index. Option 2 might work for simple cases but can fail with insertions/deletions. Option 4 creates a new list (not in-place). Option 1 has a bug (undefined `i`).",
      "hint": "When modifying in-place, what should you iterate over?"
    },
    {
      "id": "python-building-blocks-quiz-51",
      "type": "mcq",
      "question": "Given:\n```python\nstudents = {\n    \"student1\": {\"name\": \"Alice\", \"age\": 16, \"classes\": [\"Math\", \"Physics\"]},\n    \"student2\": {\"name\": \"Bob\",   \"age\": 17, \"classes\": [\"Chemistry\", \"Biology\"]}\n}\n```\nWhich expression accesses `\"Math\"`?",
      "options": [
        "`students[\"student1\"][\"classes\"][1]`",
        "`students[\"student1\"][\"classes\"][\"Math\"]`",
        "`students[\"student1\"][\"classes\"][0]`",
        "`students[\"classes\"][\"student1\"][0]`"
      ],
      "answer": 2,
      "explanation": "Nested access works left to right: `students[\"student1\"]` → Alice's dict → `[\"classes\"]` → the list `[\"Math\", \"Physics\"]` → `[0]` → first element `\"Math\"`. Option 1 gets `\"Physics\"` (index 1). Option 2 tries to index a list with a string key, raising TypeError. Option 4 uses the wrong key order.",
      "hint": "Follow the chain: dict → nested dict → list → index."
    },
    {
      "id": "python-building-blocks-quiz-52",
      "type": "true-false",
      "question": "Given:\n```python\nstudents = {\n    \"student1\": {\"name\": \"Alice\", \"age\": 16, \"classes\": [\"Math\", \"Physics\"]},\n    \"student2\": {\"name\": \"Bob\",   \"age\": 17, \"classes\": [\"Chemistry\", \"Biology\"]}\n}\n```\n`\"grade\" in students[\"student1\"]` returns `True` because `students[\"student1\"]` is a non-empty dictionary.",
      "answer": false,
      "explanation": "The `in` operator checks **key existence**, not whether the dict is non-empty. `students[\"student1\"]` has keys `\"name\"`, `\"age\"`, `\"classes\"` — but no `\"grade\"` key. Result is `False`. Compare: `\"classes\" in students[\"student2\"]` → `True`.",
      "hint": "What exactly does `in` check on a dictionary?"
    },
    {
      "id": "python-building-blocks-quiz-53",
      "type": "code-output",
      "question": "What does this raise?\n```python\nscores = {}\nscores[\"alice\"][\"math\"] = 95\n```",
      "options": [
        "No error — creates `{\"alice\": {\"math\": 95}}`",
        "KeyError: 'alice'",
        "TypeError: 'dict' object does not support item assignment",
        "ValueError: missing nested key"
      ],
      "answer": 1,
      "explanation": "`scores[\"alice\"]` raises `KeyError` immediately — the key doesn't exist yet, so there's no nested dict to assign into. Fix: initialize first with `scores[\"alice\"] = {}` then `scores[\"alice\"][\"math\"] = 95`, or in one step: `scores[\"alice\"] = {\"math\": 95}`.",
      "hint": "What does `scores[\"alice\"]` return when `\"alice\"` isn't in the dict yet?"
    },
    {
      "id": "python-building-blocks-quiz-54",
      "type": "mcq",
      "question": "You're processing a log file where multiple lines can belong to the same pod. You want to track the first `Scheduled` and `Killing` timestamps per pod. Which initialization pattern is correct?",
      "options": [
        "`pod_events[pod] = {'s_time': None, 'k_time': None}` (before the loop)",
        "`if pod not in pod_events: pod_events[pod] = {'s_time': None, 'k_time': None}` (inside the loop)",
        "`pod_events[pod] = {'s_time': None, 'k_time': None}` (inside the loop, unconditionally)",
        "`pod_events.get(pod, {})['s_time'] = None`"
      ],
      "answer": 1,
      "explanation": "Option 2 is correct: initialize the entry **only on first encounter** inside the loop. Option 1 fails because `pod` isn't known before the loop. Option 3 resets the dict on every log line, wiping previously recorded timestamps for that pod. Option 4 calls `.get()` which returns a temporary `{}` that gets discarded — the assignment never reaches `pod_events`.",
      "hint": "The init should happen once per pod, not once per log line."
    },
    {
      "id": "python-building-blocks-quiz-55",
      "type": "code-output",
      "question": "What does this print?",
      "code": "s = \"Python\"\nprint(s[::-1])",
      "language": "python",
      "options": [
        "\"nohtyP\"",
        "\"Python\"",
        "\"Pto\"",
        "\"nhtoy\""
      ],
      "answer": 0,
      "explanation": "The slice `[::-1]` uses step -1, which traverses the string from end to start. \"Python\" reversed is \"nohtyP\". This is the idiomatic Python way to reverse any sequence — works on lists and tuples too.",
      "hint": "A negative step means you move backwards through the sequence."
    },
    {
      "id": "python-building-blocks-quiz-56",
      "type": "code-output",
      "question": "What does this print?",
      "code": "name = \"Alice\"\nscore = 95.5\nprint(f\"{name} scored {score:.2f}\")",
      "language": "python",
      "options": [
        "\"Alice scored 95.5\"",
        "\"Alice scored 95.50\"",
        "\"{name} scored {score:.2f}\"",
        "\"Alice scored 95.55\""
      ],
      "answer": 1,
      "explanation": "f-strings evaluate expressions inside `{}` at runtime. `{score:.2f}` formats the float with exactly 2 decimal places, so 95.5 becomes `\"95.50\"` — the trailing zero is always included. Without a format spec, `{score}` would produce `\"95.5\"`.",
      "hint": "The `.2f` format spec means 'fixed-point notation, 2 decimal places'."
    },
    {
      "id": "python-building-blocks-quiz-57",
      "type": "true-false",
      "question": "`\"hello\".find(\"x\")` returns `None` when the substring is not found.",
      "answer": false,
      "explanation": "`.find()` returns **-1** (not None) when the substring isn't found. This allows safe checks like `if s.find('x') != -1`. In contrast, `.index()` raises `ValueError` for a missing substring. Neither method returns None — that's a common mix-up with `.get()` on dicts.",
      "hint": "What integer sentinel value signals 'not found' in many C-style functions?"
    },
    {
      "id": "python-building-blocks-quiz-58",
      "type": "code-output",
      "question": "What does this print?",
      "code": "s = \"  hello   world  \"\nprint(len(s.split()))",
      "language": "python",
      "options": [
        "1",
        "2",
        "3",
        "18"
      ],
      "answer": 1,
      "explanation": "Called with no argument, `.split()` splits on **any whitespace** and automatically discards the empty strings that leading, trailing, and consecutive spaces would produce. `\"  hello   world  \".split()` → `['hello', 'world']` — length 2. By contrast, `.split(' ')` with an explicit space would give `['', '', 'hello', '', '', 'world', '', '']` — length 8.",
      "hint": "The no-argument form of .split() collapses all whitespace runs into a single split."
    },
    {
      "id": "python-building-blocks-quiz-59",
      "type": "fill-blank",
      "question": "What set method returns elements in either set A or B, but **not** in both (equivalent to the `^` operator)?",
      "answer": "symmetric_difference",
      "caseSensitive": false,
      "explanation": "`.symmetric_difference(other)` returns elements that belong to exactly one of the two sets. Example: `{1, 2, 3}.symmetric_difference({2, 3, 4})` = `{1, 4}`. The operator shorthand is `^`. Contrast with difference (`-`), which is directional: `a - b` gives elements in `a` not in `b`, while symmetric difference goes both ways.",
      "hint": "Think of it as the set equivalent of XOR — elements exclusive to one side."
    },
    {
      "id": "python-building-blocks-quiz-60",
      "type": "true-false",
      "question": "A lambda function can contain multiple statements separated by semicolons.",
      "answer": false,
      "explanation": "Lambda functions are restricted to a **single expression** — no statements, no assignments, no loops, no `return` keyword. The expression's value is automatically returned. `lambda x: x**2` is valid; `lambda x: y = x**2; y` is a SyntaxError. If you need multiple steps, use a regular `def` function.",
      "hint": "Lambda is designed to be an expression, not a function body."
    },
    {
      "id": "python-building-blocks-quiz-61",
      "type": "true-false",
      "question": "`s = {}` creates an empty set.",
      "answer": false,
      "explanation": "`{}` creates an **empty dictionary**, not a set. The `{}` syntax was used for dicts before sets got their own literal form. To create an empty set, you must use `set()`. Non-empty set literals work fine — `{1, 2, 3}` is a set — but `{}` is **always** a dict. This is a common silent bug when you expect set uniqueness behavior.",
      "hint": "What does `type({})` return? Try it."
    },
    {
      "id": "python-building-blocks-quiz-62",
      "type": "code-output",
      "question": "What does this print?",
      "code": "a = [1, 2, 3]\nb = a\nb.append(4)\nprint(len(a))",
      "language": "python",
      "options": [
        "3",
        "4",
        "Error",
        "None"
      ],
      "answer": 1,
      "explanation": "`b = a` creates a **reference** to the same list object — not a copy. Both `a` and `b` point to the same memory. Appending to `b` modifies the shared list, so `a` has 4 elements too. To create an independent copy, use `a[:]`, `a.copy()`, or `list(a)`. This is the same gotcha as the mutable default argument — Python never implicitly copies objects.",
      "hint": "Is b a new list, or just another name for the same list?"
    },
    {
      "id": "python-building-blocks-quiz-63",
      "type": "true-false",
      "question": "`max([])` raises a `ValueError`.",
      "answer": true,
      "explanation": "Calling `max()` or `min()` on an **empty iterable** raises `ValueError: max() arg is an empty sequence`. This surprises many developers because `sum([])` returns 0 and `len([])` returns 0 without errors. To guard against empty input, pass a default: `max([], default=0)` returns 0 instead of raising.",
      "hint": "What can max() report when there are no elements to compare?"
    },
    {
      "id": "python-building-blocks-quiz-64",
      "type": "code-output",
      "question": "What does this print?",
      "code": "items = [\"a\", \"b\", \"a\", \"c\", \"a\"]\ncounts = {}\nfor item in items:\n    counts[item] = counts.get(item, 0) + 1\nprint(counts[\"a\"])",
      "language": "python",
      "options": [
        "1",
        "2",
        "3",
        "KeyError"
      ],
      "answer": 2,
      "explanation": "Tracing 'a' encounters: first — `counts.get('a', 0)` returns 0 (missing), sets `counts['a'] = 1`; second — returns 1, sets 2; third — returns 2, sets 3. The pattern `counts.get(key, 0) + 1` is the idiomatic one-liner for frequency counting: it handles the 'first occurrence' case without a pre-check or `setdefault`.",
      "hint": "Trace counts['a'] after each iteration where item == 'a'."
    },
    {
      "id": "python-building-blocks-quiz-65",
      "type": "mcq",
      "question": "Which expression safely retrieves `config[\"db\"][\"timeout\"]` and returns `30` if either `\"db\"` or `\"timeout\"` is missing?",
      "options": [
        "`config[\"db\"][\"timeout\"] or 30`",
        "`config.get(\"db\").get(\"timeout\", 30)`",
        "`config.get(\"db\", {}).get(\"timeout\", 30)`",
        "`config.get(\"db\", {\"timeout\": 30}).get(\"timeout\")`"
      ],
      "answer": 2,
      "explanation": "Option C is correct. `config.get(\"db\", {})` returns an empty dict if `\"db\"` is missing, giving the chained `.get(\"timeout\", 30)` a safe target. Option B fails with `AttributeError` when `\"db\"` is absent — `None` has no `.get()`. Option A raises `KeyError` if `\"db\"` doesn't exist at all. Option D works but is misleading — burying the default inside the first `.get()` obscures intent and is easy to mis-read.",
      "hint": "If .get('db') returns None, what happens when you call .get('timeout') on None?"
    },
    {
      "id": "python-building-blocks-quiz-66",
      "type": "code-output",
      "question": "What does this print?",
      "code": "scores = {\"Alice\": 85, \"Bob\": 92, \"Charlie\": 78}\ntop = sorted(scores.items(), key=lambda x: x[1], reverse=True)[0]\nprint(top[0])",
      "language": "python",
      "options": [
        "\"Alice\"",
        "\"Bob\"",
        "\"Charlie\"",
        "92"
      ],
      "answer": 1,
      "explanation": "`scores.items()` yields `[('Alice', 85), ('Bob', 92), ('Charlie', 78)]`. Sorting by `x[1]` (the score) descending gives `[('Bob', 92), ('Alice', 85), ('Charlie', 78)]`. `[0]` selects the first tuple `('Bob', 92)`, then `[0]` on that tuple yields the **key** `'Bob'` — not the score 92. This is the idiomatic pattern for 'find the key with the highest value'.",
      "hint": "After sorting, [0] is the top entry. What is top[0] vs top[1] on a (key, value) tuple?"
    }
  ]
}
{{< /quiz >}}
