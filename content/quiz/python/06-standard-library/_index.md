---
title: "Standard Library Quiz"
linkTitle: Standard Library
type: docs
weight: 6
prev: /quiz/python/05-oop-fundamentals
next: /quiz/python/07-advanced-functions
---

{{< quiz id="python-standard-library-quiz" >}}
{
  "questions": [
    {
      "type": "mcq",
      "question": "What is the correct way to iterate over lines in a file?",
      "options": [
        "`for line in f.read():`",
        "`for line in f.readline():`",
        "`for line in f:`",
        "`for line in f.readall():`"
      ],
      "answer": 2,
      "explanation": "Iterating directly over the file object `f` yields lines efficiently. Using `f.read()` or `f.readline()` would iterate over characters, not lines.",
      "hint": "The file object itself is iterable and yields lines."
    },
    {
      "type": "true-false",
      "question": "When using `with open()`, the file is automatically closed even if an exception occurs.",
      "answer": true,
      "explanation": "The `with` statement implements context management, ensuring the file is properly closed regardless of whether the code block exits normally or via an exception.",
      "hint": "Think about what context managers guarantee."
    },
    {
      "type": "code-output",
      "question": "What happens when you run this code?",
      "code": "with open(\"test.txt\", \"w\") as f:\n    f.write(\"Hello\\n\")\nwith open(\"test.txt\", \"a\") as f:\n    f.write(\"World\\n\")\n# File contains:",
      "language": "python",
      "options": [
        "Only \"World\\n\"",
        "\"Hello\\nWorld\\n\"",
        "Error: file is locked",
        "\"WorldHello\\n\""
      ],
      "answer": 1,
      "explanation": "Mode `w` writes \"Hello\" (truncating any existing content), then mode `a` appends \"World\" without truncating, resulting in both lines.",
      "hint": "Remember: 'w' truncates, 'a' appends."
    },
    {
      "type": "multiple-select",
      "question": "Which file modes will create a file if it doesn't exist?",
      "options": [
        "`r` (read)",
        "`w` (write)",
        "`a` (append)",
        "`r+` (read and write)",
        "`w+` (read and write)"
      ],
      "answers": [1, 2, 4],
      "explanation": "Modes `w`, `a`, and `w+` will create the file if it doesn't exist. Mode `r` and `r+` require the file to exist.",
      "hint": "Write and append modes are more forgiving about missing files."
    },
    {
      "type": "fill-blank",
      "question": "What method converts a JSON file to a Python dictionary?",
      "answer": "json.load",
      "caseSensitive": false,
      "explanation": "The `json.load()` method reads from a file object and converts JSON to a Python dict. Note: `json.loads()` works with strings.",
      "hint": "It's a method from the json module that works with file objects."
    },
    {
      "type": "flashcard",
      "question": "What is the key difference between `json.load()` and `json.loads()`?",
      "answer": "**`json.load()`** - Reads from a **file object**\n\n**`json.loads()`** - Reads from a **string**\n\nRemember: the 's' in `loads()` stands for 'string'!"
    },
    {
      "type": "code-completion",
      "question": "Complete the code to safely modify a config file atomically:",
      "instruction": "Fill in the missing module name",
      "codeTemplate": "import _____ \nimport os\n\nwith _____.NamedTemporaryFile('w', delete=False) as tf:\n    tf.write(modified_content)\n    temp_name = tf.name\n\nos.replace(temp_name, 'config.yaml')",
      "answer": "tempfile",
      "caseSensitive": false,
      "acceptedAnswers": ["tempfile"],
      "explanation": "The `tempfile` module provides `NamedTemporaryFile` for safe atomic file modifications."
    },
    {
      "type": "mcq",
      "question": "What does `os.path.join('folder', 'subfolder', 'file.txt')` ensure?",
      "options": [
        "The path exists on the filesystem",
        "The path uses OS-appropriate separators (/ or \\)",
        "The file is created if it doesn't exist",
        "The path is converted to absolute form"
      ],
      "answer": 1,
      "explanation": "`os.path.join()` combines path components using the correct separator for the current OS (e.g., `/` on Linux/Mac, `\\` on Windows). It doesn't check existence or create files.",
      "hint": "Think about cross-platform compatibility."
    },
    {
      "type": "multiple-select",
      "question": "Which of the following are valid ways to run external commands using subprocess?",
      "options": [
        "`subprocess.run(['ls', '-l'])`",
        "`subprocess.run('ls -l')`",
        "`subprocess.run('ls -l', shell=True)`",
        "`subprocess.run(['ls -l'])`"
      ],
      "answers": [0, 2],
      "explanation": "Commands should be lists of arguments `['ls', '-l']` for safety, or strings with `shell=True` for shell features. `['ls -l']` treats the entire string as one command name.",
      "hint": "Think about argument parsing and shell safety."
    },
    {
      "type": "true-false",
      "question": "Using `shell=True` in subprocess is generally safer than passing a list of arguments.",
      "answer": false,
      "explanation": "Using `shell=True` is generally LESS safe because it can be vulnerable to shell injection attacks. Passing a list like `['ls', '-l']` is the recommended, safer approach.",
      "hint": "Consider security implications of shell execution."
    },
    {
      "type": "code-output",
      "question": "What will be the output?",
      "code": "from collections import Counter\ncounts = Counter(['a', 'b', 'a', 'c', 'b', 'a'])\nprint(counts['a'], counts['missing'])",
      "language": "python",
      "options": [
        "3 KeyError",
        "3 0",
        "3 None",
        "Error: must initialize 'missing' first"
      ],
      "answer": 1,
      "explanation": "Counter is a dict subclass that returns 0 for missing keys instead of raising KeyError. Since 'a' appears 3 times and 'missing' isn't in the counter, it prints `3 0`.",
      "hint": "Counter has special behavior for missing keys."
    },
    {
      "type": "mcq",
      "question": "What is the main advantage of `defaultdict(list)` over a regular dict?",
      "options": [
        "It's faster for lookups",
        "It automatically creates an empty list for new keys",
        "It maintains insertion order",
        "It uses less memory"
      ],
      "answer": 1,
      "explanation": "The key benefit of `defaultdict(list)` is automatic initialization - accessing a new key creates an empty list, avoiding KeyError and eliminating manual initialization.",
      "hint": "Think about what happens when you access a key that doesn't exist."
    },
    {
      "type": "fill-blank",
      "question": "What factory function would you pass to defaultdict to auto-initialize counters to 0?",
      "answer": "int",
      "caseSensitive": false,
      "explanation": "Using `defaultdict(int)` initializes missing keys to 0, since `int()` returns 0. This is perfect for counting operations.",
      "hint": "What built-in type returns 0 when called with no arguments?"
    },
    {
      "type": "flashcard",
      "question": "Why use namedtuple instead of a regular tuple?",
      "answer": "**Readability and Self-Documentation**\n\n`user[0]` vs `user.name` - the second is much clearer!\n\nnamedtuple provides:\n- Named field access (`p.name` instead of `p[0]`)\n- Still works like a tuple (indexing, unpacking)\n- Immutable like tuples\n- More memory-efficient than classes or dicts"
    },
    {
      "type": "code-output",
      "question": "Predict the output:",
      "code": "from collections import namedtuple\nPerson = namedtuple('Person', ['name', 'age'])\np = Person('Alice', 30)\nprint(p[0], p.name)",
      "language": "python",
      "options": [
        "Alice Alice",
        "0 Alice",
        "Error: can't use both indexing and attribute access",
        "('Alice', 30) Alice"
      ],
      "answer": 0,
      "explanation": "namedtuple supports both tuple-style indexing (`p[0]`) and attribute access (`p.name`). Both refer to the same field, so both print 'Alice'.",
      "hint": "namedtuple combines features of both tuples and objects."
    },
    {
      "type": "mcq",
      "question": "Which collections type is best for implementing a circular buffer with fixed size?",
      "options": [
        "list",
        "Counter",
        "deque with maxlen",
        "defaultdict"
      ],
      "answer": 2,
      "explanation": "`deque(maxlen=n)` automatically removes the oldest item when the buffer is full and a new item is added, making it perfect for fixed-size circular buffers.",
      "hint": "Look for automatic removal of old items."
    },
    {
      "type": "drag-drop",
      "question": "Arrange these log levels from LEAST to MOST severe:",
      "instruction": "Drag to arrange in order of increasing severity",
      "items": [
        "DEBUG",
        "INFO",
        "WARNING",
        "ERROR",
        "CRITICAL"
      ],
      "correctOrder": [0, 1, 2, 3, 4],
      "explanation": "The correct severity order is: DEBUG < INFO < WARNING < ERROR < CRITICAL. DEBUG is for detailed diagnostics, while CRITICAL indicates system-level failures."
    },
    {
      "type": "multiple-select",
      "question": "When should you use `logging.exception()` instead of `logging.error()`?",
      "options": [
        "Inside an except block",
        "When you want to capture the full stack trace",
        "For all error messages",
        "Only for critical errors",
        "When handling exceptions"
      ],
      "answers": [0, 1, 4],
      "explanation": "`logging.exception()` should be used inside except blocks when you want to automatically capture and log the full stack trace. It's equivalent to `logging.error()` but includes traceback.",
      "hint": "Think about when traceback information is available and useful."
    },
    {
      "type": "true-false",
      "question": "In a multi-file Python application, you should call `logging.basicConfig()` in every module that uses logging.",
      "answer": false,
      "explanation": "You should call `basicConfig()` ONLY ONCE in your main entry point. In library modules, use `logger = logging.getLogger(__name__)` instead. `basicConfig()` only works the first time it's called.",
      "hint": "Think about configuration centralization."
    },
    {
      "type": "code-completion",
      "question": "Complete the logging configuration to write to both file and console:",
      "instruction": "Fill in the missing handler type",
      "codeTemplate": "import logging\n\nlogging.basicConfig(\n    level=logging.INFO,\n    handlers=[\n        logging.FileHandler('app.log'),\n        logging._____()\n    ]\n)",
      "answer": "StreamHandler",
      "caseSensitive": false,
      "acceptedAnswers": ["StreamHandler"],
      "explanation": "`StreamHandler()` writes logs to console (stderr by default). Combined with `FileHandler`, this sends logs to both file and console."
    },
    {
      "type": "mcq",
      "question": "What is the difference between `datetime.now()` and `datetime.now(timezone.utc)`?",
      "options": [
        "No difference, they return the same value",
        "The first returns local time, the second returns UTC with timezone info",
        "The first is faster",
        "The second includes milliseconds"
      ],
      "answer": 1,
      "explanation": "`datetime.now()` returns the current local time (naive datetime), while `datetime.now(timezone.utc)` returns UTC time with timezone information (aware datetime).",
      "hint": "Think about timezone awareness."
    },
    {
      "type": "code-output",
      "question": "What will this print?",
      "code": "from datetime import datetime, timedelta\ndt = datetime(2025, 1, 1)\nfuture = dt + timedelta(days=7)\nprint((future - dt).days)",
      "language": "python",
      "options": [
        "7",
        "604800",
        "timedelta(days=7)",
        "Error: can't subtract datetimes"
      ],
      "answer": 0,
      "explanation": "Subtracting two datetime objects returns a timedelta. The `.days` attribute gives the number of days, which is 7.",
      "hint": "What type is returned when you subtract datetimes?"
    },
    {
      "type": "flashcard",
      "question": "When should you use the `time` module vs the `datetime` module?",
      "answer": "**`time` module**: Low-level timestamps\n- Performance measurement\n- Delays (`time.sleep()`)\n- Unix timestamps (seconds since epoch)\n\n**`datetime` module**: High-level date/time\n- Business logic\n- User-facing dates\n- Calendar operations\n- Date arithmetic\n\n**Rule of thumb**: Use `datetime` for most application code, `time` for performance measurement."
    },
    {
      "type": "mcq",
      "question": "What does `re.search()` return if no match is found?",
      "options": [
        "An empty string",
        "`None`",
        "An empty Match object",
        "Raises ValueError"
      ],
      "answer": 1,
      "explanation": "`re.search()` returns `None` if no match is found. This is why you should always check `if match:` before calling `match.group()`.",
      "hint": "This is why you need to check before accessing groups."
    },
    {
      "type": "code-output",
      "question": "What will this match?",
      "code": "import re\ntext = 'Error on line 42: failed after 3 attempts'\nmatch = re.search(r'\\d+', text)\nif match:\n    print(match.group())",
      "language": "python",
      "options": [
        "42",
        "3",
        "423",
        "['42', '3']"
      ],
      "answer": 0,
      "explanation": "`re.search()` finds the FIRST match anywhere in the string. The first number encountered is 42, so that's what `match.group()` returns.",
      "hint": "search() finds the first match, not all matches."
    },
    {
      "type": "multiple-select",
      "question": "Which of the following correctly use raw strings for regex patterns?",
      "options": [
        "`r'\\d+'`",
        "`'\\\\d+'`",
        "`r'\\w+@\\w+\\.com'`",
        "`'\\d+'`"
      ],
      "answers": [0, 2],
      "explanation": "Raw strings `r'...'` are recommended for regex to avoid backslash escaping issues. `r'\\d+'` and `r'\\w+@\\w+\\.com'` correctly use raw strings. `'\\\\d+'` works but requires double backslashes.",
      "hint": "Look for the 'r' prefix before the string."
    },
    {
      "type": "fill-blank",
      "question": "What method finds ALL matches of a pattern in a string and returns them as a list?",
      "answer": "re.findall",
      "caseSensitive": false,
      "explanation": "`re.findall()` returns a list of all matches. For example, `re.findall(r'\\d+', 'a1b2c3')` returns `['1', '2', '3']`.",
      "hint": "Think about the method name that suggests 'all' matches."
    },
    {
      "type": "code-completion",
      "question": "Complete the code to extract year, month, and day using named groups:",
      "instruction": "Fill in the syntax for named groups",
      "codeTemplate": "import re\npattern = r'(?P<___>\\d{4})-(?P<___>\\d{2})-(?P<___>\\d{2})'\nmatch = re.search(pattern, '2025-01-26')\nprint(match.group('year'))",
      "answer": "year>\\d{4})-(?P<month>\\d{2})-(?P<day",
      "caseSensitive": false,
      "acceptedAnswers": ["year>\\d{4})-(?P<month>\\d{2})-(?P<day"],
      "explanation": "Named groups use the syntax `(?P<name>...)` where name is the identifier you'll use with `match.group('name')` or `match.groupdict()`."
    },
    {
      "type": "true-false",
      "question": "The regex pattern `r'^\\d+$'` will match '123abc'.",
      "answer": false,
      "explanation": "`^` anchors to the start and `$` anchors to the end, so `^\\d+$` requires the ENTIRE string to be digits. '123abc' has letters, so it won't match.",
      "hint": "What do the ^ and $ anchors require?"
    },
    {
      "type": "mcq",
      "question": "In argparse, what does `action='store_true'` do?",
      "options": [
        "Requires the user to provide 'true' as a value",
        "Sets the value to True if the flag is present, False otherwise",
        "Validates that the input is the string 'true'",
        "Stores the boolean value provided by the user"
      ],
      "answer": 1,
      "explanation": "`action='store_true'` creates a flag that doesn't require a value. If `--verbose` is present, `args.verbose` is True; if absent, it's False.",
      "hint": "Think about command-line flags that don't take arguments."
    },
    {
      "type": "multiple-select",
      "question": "Which argparse nargs values allow zero arguments?",
      "options": [
        "`nargs='+'`",
        "`nargs='*'`",
        "`nargs='?'`",
        "`nargs=3`"
      ],
      "answers": [1, 2],
      "explanation": "`nargs='*'` accepts zero or more arguments, and `nargs='?'` accepts zero or one. `nargs='+'` requires at least one, and `nargs=3` requires exactly 3.",
      "hint": "Think about which symbols traditionally mean 'optional' or 'zero or more'."
    },
    {
      "type": "code-output",
      "question": "What will this Path operation return?",
      "code": "from pathlib import Path\np = Path('/home/user/file.txt')\nprint(p.stem)",
      "language": "python",
      "options": [
        "file.txt",
        "file",
        "/home/user/file",
        ".txt"
      ],
      "answer": 1,
      "explanation": "The `.stem` attribute returns the filename without the extension. `.name` would return 'file.txt', `.suffix` would return '.txt'.",
      "hint": "Think about the part of the filename without the extension."
    },
    {
      "type": "flashcard",
      "question": "What problem does pathlib solve compared to os.path?",
      "answer": "**Readable, maintainable path operations**\n\n**os.path**: Verbose string manipulation\n```python\nos.path.join(os.path.expanduser('~'), '.config', 'myapp', 'settings.json')\n```\n\n**pathlib**: Clean, chainable, intuitive\n```python\nPath.home() / '.config' / 'myapp' / 'settings.json'\n```\n\nPaths become objects with methods, not strings with functions."
    },
    {
      "type": "mcq",
      "question": "What's the advantage of compiling a regex pattern with `re.compile()`?",
      "options": [
        "It makes the regex case-insensitive",
        "It validates the pattern syntax",
        "It improves performance when reusing the pattern",
        "It enables multiline mode"
      ],
      "answer": 2,
      "explanation": "Compiling a pattern with `re.compile()` improves performance when you use the same pattern multiple times, as the pattern is compiled once and reused.",
      "hint": "Think about efficiency when using a pattern in a loop."
    },
    {
      "type": "true-false",
      "question": "The regex pattern `r'<div>.*</div>'` with `.*` is greedy by default.",
      "answer": true,
      "explanation": "By default, `.*` is greedy and matches as much as possible. To make it non-greedy (match as little as possible), use `.*?`.",
      "hint": "Think about what 'greedy' means in regex context."
    },
    {
      "type": "code-completion",
      "question": "Complete the code to create a Path object for the home directory:",
      "instruction": "Fill in the missing method",
      "codeTemplate": "from pathlib import Path\nhome_dir = Path._____",
      "answer": "home()",
      "caseSensitive": false,
      "acceptedAnswers": ["home()"],
      "explanation": "`Path.home()` returns a Path object representing the user's home directory, similar to `os.path.expanduser('~')`."
    },
    {
      "type": "multiple-select",
      "question": "Which statements about Counter are true?",
      "options": [
        "Counter is a subclass of dict",
        "Accessing a missing key raises KeyError",
        "Counter returns 0 for missing keys",
        "`most_common(n)` returns the n most frequent items",
        "Counter can only count strings"
      ],
      "answers": [0, 2, 3],
      "explanation": "Counter is a dict subclass that returns 0 for missing keys (not KeyError), has a `most_common(n)` method, and can count any hashable objects.",
      "hint": "Counter has special behavior for missing keys and helpful methods."
    },
    {
      "type": "mcq",
      "question": "What's the difference between `datetime.strftime()` and `datetime.strptime()`?",
      "options": [
        "No difference, they're aliases",
        "strftime formats datetime to string, strptime parses string to datetime",
        "strftime is for files, strptime is for time zones",
        "strptime is deprecated"
      ],
      "answer": 1,
      "explanation": "`strftime()` converts datetime → string (format time), while `strptime()` converts string → datetime (parse time). Remember: 'f' for format out, 'p' for parse in.",
      "hint": "Think about 'f' for format and 'p' for parse."
    },
    {
      "type": "code-output",
      "question": "What will be printed?",
      "code": "from collections import deque\ndq = deque([1, 2, 3], maxlen=3)\ndq.append(4)\ndq.append(5)\nprint(list(dq))",
      "language": "python",
      "options": [
        "[1, 2, 3]",
        "[3, 4, 5]",
        "[4, 5]",
        "[1, 2, 3, 4, 5]"
      ],
      "answer": 1,
      "explanation": "With `maxlen=3`, the deque automatically removes the oldest items when full. Adding 4 removes 1, adding 5 removes 2, leaving [3, 4, 5].",
      "hint": "The deque has a maximum length of 3."
    },
    {
      "type": "fill-blank",
      "question": "What subprocess parameter should you set to True to automatically raise an exception if a command fails?",
      "answer": "check",
      "caseSensitive": false,
      "explanation": "Setting `check=True` in `subprocess.run()` raises `CalledProcessError` if the command returns a non-zero exit code.",
      "hint": "It's a boolean parameter that validates the command succeeded."
    },
    {
      "type": "true-false",
      "question": "Using `Path.mkdir(parents=True, exist_ok=True)` will raise an error if the directory already exists.",
      "answer": false,
      "explanation": "With `exist_ok=True`, no error is raised if the directory exists. `parents=True` creates parent directories as needed. This is a safe, idempotent operation.",
      "hint": "Think about what 'exist_ok' means."
    }
  ]
}
{{< /quiz >}}

