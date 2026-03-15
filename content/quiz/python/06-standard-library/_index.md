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
      "id": "python-standard-library-quiz-01",
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
      "id": "python-standard-library-quiz-02",
      "type": "true-false",
      "question": "When using `with open()`, the file is automatically closed even if an exception occurs.",
      "answer": true,
      "explanation": "The `with` statement implements context management, ensuring the file is properly closed regardless of whether the code block exits normally or via an exception.",
      "hint": "Think about what context managers guarantee."
    },
    {
      "id": "python-standard-library-quiz-03",
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
      "id": "python-standard-library-quiz-04",
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
      "id": "python-standard-library-quiz-05",
      "type": "fill-blank",
      "question": "What method converts a JSON file to a Python dictionary?",
      "answer": "json.load",
      "caseSensitive": false,
      "explanation": "The `json.load()` method reads from a file object and converts JSON to a Python dict. Note: `json.loads()` works with strings.",
      "hint": "It's a method from the json module that works with file objects."
    },
    {
      "id": "python-standard-library-quiz-06",
      "type": "flashcard",
      "question": "What is the key difference between `json.load()` and `json.loads()`?",
      "answer": "**`json.load()`** - Reads from a **file object**\n\n**`json.loads()`** - Reads from a **string**\n\nRemember: the 's' in `loads()` stands for 'string'!\n\n**Note:** Both functions convert JSON into Python objects (not just dicts) — JSON objects→`dict`, arrays→`list`, strings→`str`, numbers→`int`/`float`, `true`/`false`→`True`/`False`, `null`→`None`"
    },
    {
      "id": "python-standard-library-quiz-07",
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
      "id": "python-standard-library-quiz-08",
      "type": "mcq",
      "question": "What does `os.path.join('folder', 'subfolder', 'file.txt')` ensure?",
      "options": [
        "The path exists on the filesystem",
        "The path uses OS-appropriate separators (/ or \\\\)",
        "The file is created if it doesn't exist",
        "The path is converted to absolute form"
      ],
      "answer": 1,
      "explanation": "`os.path.join()` combines path components using the correct separator for the current OS (e.g., `/` on Linux/Mac, `\\` on Windows). It doesn't check existence or create files.",
      "hint": "Think about cross-platform compatibility."
    },
    {
      "id": "python-standard-library-quiz-09",
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
      "id": "python-standard-library-quiz-10",
      "type": "true-false",
      "question": "Using `shell=True` in subprocess is generally safer than passing a list of arguments.",
      "answer": false,
      "explanation": "Using `shell=True` is generally LESS safe because it can be vulnerable to shell injection attacks. Passing a list like `['ls', '-l']` is the recommended, safer approach.",
      "hint": "Consider security implications of shell execution."
    },
    {
      "id": "python-standard-library-quiz-11",
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
      "id": "python-standard-library-quiz-12",
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
      "id": "python-standard-library-quiz-13",
      "type": "fill-blank",
      "question": "What factory function would you pass to defaultdict to auto-initialize counters to 0?",
      "answer": "int",
      "acceptedAnswers": ["int", "defaultdict(int)"],
      "caseSensitive": false,
      "explanation": "Using `defaultdict(int)` initializes missing keys to 0, since `int()` returns 0. This is perfect for counting operations.",
      "hint": "What built-in type returns 0 when called with no arguments?"
    },
    {
      "id": "python-standard-library-quiz-14",
      "type": "flashcard",
      "question": "Why use namedtuple instead of a regular tuple?",
      "answer": "**Readability and Self-Documentation**\n\n`user[0]` vs `user.name` - the second is much clearer!\n\nnamedtuple provides:\n- Named field access (`p.name` instead of `p[0]`)\n- Still works like a tuple (indexing, unpacking)\n- Immutable like tuples\n- More memory-efficient than classes or dicts"
    },
    {
      "id": "python-standard-library-quiz-15",
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
      "id": "python-standard-library-quiz-16",
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
      "id": "python-standard-library-quiz-17",
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
      "id": "python-standard-library-quiz-18",
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
      "id": "python-standard-library-quiz-19",
      "type": "true-false",
      "question": "In a multi-file Python application, you should call `logging.basicConfig()` in every module that uses logging.",
      "answer": false,
      "explanation": "You should call `basicConfig()` ONLY ONCE in your main entry point. In libraries and modules, use `logger = logging.getLogger(__name__)` instead. `basicConfig()` only works the first time it's called.",
      "hint": "Think about configuration centralization."
    },
    {
      "id": "python-standard-library-quiz-20",
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
      "id": "python-standard-library-quiz-21",
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
      "id": "python-standard-library-quiz-22",
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
      "id": "python-standard-library-quiz-23",
      "type": "flashcard",
      "question": "When should you use the `time` module vs the `datetime` module?",
      "answer": "**`time` module**: Low-level time operations\n- Performance measurement (`time.perf_counter()`)\n- Delays and waiting (`time.sleep()`)\n- Unix timestamps (seconds since epoch)\n- System clock access\n\n**`datetime` module**: High-level date/time handling\n- Business logic\n- User-facing timestamps\n- Calendar operations\n- Date/time arithmetic (`timedelta`)\n- Parsing and formatting dates\n\n**Rule of thumb**: Use `datetime` for most application code; use `time` for performance measurement and delays."
    },
    {
      "id": "python-standard-library-quiz-24",
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
      "id": "python-standard-library-quiz-25",
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
      "id": "python-standard-library-quiz-26",
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
      "id": "python-standard-library-quiz-27",
      "type": "fill-blank",
      "question": "What method finds ALL matches of a pattern in a string and returns them as a list?",
      "answer": "re.findall",
      "acceptedAnswers": ["re.findall", "re.findall()"],
      "caseSensitive": false,
      "explanation": "`re.findall()` returns a list of all matches. For example, `re.findall(r'\\d+', 'a1b2c3')` returns `['1', '2', '3']`.",
      "hint": "Think about the method name that suggests 'all' matches."
    },
    {
      "id": "python-standard-library-quiz-28",
      "type": "code-completion",
      "question": "Complete the code to extract year, month, and day using named groups:",
      "instruction": "Fill in the pattern using named group syntax",
      "codeTemplate": "import re\npattern = ___\nmatch = re.search(pattern, '2025-01-26')\nprint(match.group('year'), match.group('month'), match.group('day'))",
      "answer": "r'(?P<year>\\d{4})-(?P<month>\\d{2})-(?P<day>\\d{2})'",
      "caseSensitive": false,
      "explanation": "Named groups use the syntax `(?P<name>...)` where name is the identifier you'll use with `match.group('name')` or `match.groupdict()`.\n**Answer:** `r'(?P<year>\\d{4})-(?P<month>\\d{2})-(?P<day>\\d{2})'`"
    },
    {
      "id": "python-standard-library-quiz-29",
      "type": "true-false",
      "question": "The regex pattern `r'^\\d+$'` will match '123abc'.",
      "answer": false,
      "explanation": "`^` anchors to the start and `$` anchors to the end, so `^\\d+$` requires the ENTIRE string to be digits. '123abc' has letters, so it won't match.",
      "hint": "What do the ^ and $ anchors require?"
    },
    {
      "id": "python-standard-library-quiz-30",
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
      "id": "python-standard-library-quiz-31",
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
      "id": "python-standard-library-quiz-32",
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
      "explanation": "The `.stem` attribute returns the filename without the extension. `.name` would return 'file.txt', `.suffix` would return '.txt', `.parent` would return '/home/user'.",
      "hint": "Think about the part of the filename without the extension."
    },
    {
      "id": "python-standard-library-quiz-33",
      "type": "flashcard",
      "question": "What problem does pathlib solve compared to os.path?",
      "answer": "**Readable, maintainable path operations**\n\n**os.path**: Verbose string manipulation (paths are strings)\n```python\nos.path.join(os.path.expanduser('~'), '.config', 'myapp', 'settings.json')\n```\n\n**pathlib**: Clean, chainable, intuitive (paths are objects)\n```python\nPath.home() / '.config' / 'myapp' / 'settings.json'\n```\n\nPaths become objects with methods, not strings with functions."
    },
    {
      "id": "python-standard-library-quiz-34",
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
      "id": "python-standard-library-quiz-35",
      "type": "true-false",
      "question": "The regex pattern `r'<div>.*</div>'` with `.*` is greedy by default.",
      "answer": true,
      "explanation": "By default, `.*` is greedy and matches as much as possible. To make it non-greedy (match as little as possible), use `.*?`.",
      "hint": "Think about what 'greedy' means in regex context."
    },
    {
      "id": "python-standard-library-quiz-36",
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
      "id": "python-standard-library-quiz-37",
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
      "id": "python-standard-library-quiz-38",
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
      "id": "python-standard-library-quiz-39",
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
      "id": "python-standard-library-quiz-40",
      "type": "fill-blank",
      "question": "What subprocess parameter should you set to True to automatically raise an exception if a command fails?",
      "answer": "check",
      "acceptedAnswers": ["check", "check=True"],
      "caseSensitive": false,
      "explanation": "Setting `check=True` in `subprocess.run()` raises `CalledProcessError` if the command returns a non-zero exit code.",
      "hint": "It's a boolean parameter that validates the command succeeded."
    },
    {
      "id": "python-standard-library-quiz-41",
      "type": "true-false",
      "question": "Using `Path.mkdir(parents=True, exist_ok=True)` will raise an error if the directory already exists.",
      "answer": false,
      "explanation": "With `exist_ok=True`, no error is raised if the directory exists. `parents=True` creates parent directories as needed. This is a safe, idempotent operation.",
      "hint": "Think about what 'exist_ok' means."
    },
    {
      "id": "python-standard-library-quiz-42",
      "type": "drag-drop",
      "question": "Arrange the high-level steps for running an external command with subprocess:",
      "instruction": "Drag to arrange in the correct order",
      "items": [
        "Run: `subprocess.run(cmd, capture_output=True, text=True)`",
        "Define command as a list: `[\"ls\", \"-l\"]`",
        "Import `subprocess`",
        "Access `result.stdout`, `result.stderr`, `result.returncode`",
        "Handle `subprocess.CalledProcessError` in a try/except"
      ],
      "correctOrder": [2, 1, 0, 3, 4],
      "explanation": "The workflow: import → define command as a list (safer than a string) → run with capture_output=True and text=True → access result attributes → handle errors. Using `check=True` means a non-zero returncode automatically raises CalledProcessError."
    },
    {
      "id": "python-standard-library-quiz-43",
      "type": "mcq",
      "question": "What does `subprocess.run()` return?",
      "options": [
        "A string containing the command output",
        "A `CompletedProcess` object with `returncode`, `stdout`, and `stderr`",
        "An integer exit code",
        "A tuple of `(stdout, stderr)`"
      ],
      "answer": 1,
      "explanation": "`subprocess.run()` returns a `CompletedProcess` object. You access output via `result.stdout`, errors via `result.stderr`, and the exit code via `result.returncode`. Output is only available if you pass `capture_output=True`.",
      "hint": "It's an object, not a raw string or integer."
    },
    {
      "id": "python-standard-library-quiz-44",
      "type": "multiple-select",
      "question": "Which two `subprocess.run()` parameters do you need to capture command output as Python strings (not bytes)?",
      "options": [
        "`capture_output=True`",
        "`text=True`",
        "`shell=True`",
        "`check=True`"
      ],
      "answers": [0, 1],
      "explanation": "`capture_output=True` redirects stdout and stderr so they're stored in the result (otherwise they go directly to the terminal). `text=True` decodes the captured bytes into strings. Without `text=True`, `result.stdout` would be `b'hello\\n'` instead of `'hello\\n'`.",
      "hint": "One captures the output, the other converts bytes to strings."
    },
    {
      "id": "python-standard-library-quiz-45",
      "type": "code-output",
      "question": "What will `result.returncode` print for a successful command?",
      "code": "import subprocess\nresult = subprocess.run([\"echo\", \"hello\"], capture_output=True, text=True)\nprint(result.returncode)",
      "language": "python",
      "options": [
        "0",
        "1",
        "None",
        "True"
      ],
      "answer": 0,
      "explanation": "A return code of `0` means success in Unix convention. Non-zero values indicate failure — this is the convention that `check=True` relies on to decide whether to raise `CalledProcessError`.",
      "hint": "Unix convention: 0 = success, non-zero = failure."
    },
    {
      "id": "python-standard-library-quiz-46",
      "type": "code-completion",
      "question": "Complete the robust subprocess pattern with proper error handling:",
      "instruction": "Fill in the missing exception type",
      "codeTemplate": "import subprocess\ntry:\n    result = subprocess.run(\n        [\"ls\", \"/fake/path\"],\n        capture_output=True,\n        text=True,\n        check=True\n    )\n    print(result.stdout)\nexcept subprocess._____:\n    print(\"Command failed!\")",
      "answer": "CalledProcessError",
      "caseSensitive": false,
      "acceptedAnswers": ["CalledProcessError", "subprocess.CalledProcessError"],
      "explanation": "`subprocess.CalledProcessError` is raised when `check=True` and the command returns a non-zero exit code. The exception object has `.returncode`, `.cmd`, `.stdout`, and `.stderr` attributes for debugging."
    },
    {
      "id": "python-standard-library-quiz-47",
      "type": "drag-drop",
      "question": "Arrange the high-level steps for building a CLI tool with argparse:",
      "instruction": "Drag to arrange in the correct order",
      "items": [
        "Create parser: `ArgumentParser(description='...')`",
        "Use the values: `args.filename`, `args.verbose`",
        "Import `argparse`",
        "Add arguments: positional (`'filename'`) and optional (`'--verbose'`)",
        "Parse: `args = parser.parse_args()`"
      ],
      "correctOrder": [2, 0, 3, 4, 1],
      "explanation": "The workflow: import → create parser → add arguments (positional args have no '--' prefix, optional args use '--') → parse_args() reads sys.argv and validates inputs → access values via args.*."
    },
    {
      "id": "python-standard-library-quiz-48",
      "type": "mcq",
      "question": "In argparse, what distinguishes a positional argument from an optional argument?",
      "options": [
        "Positional arguments use a single dash (`-`), optional use double dash (`--`)",
        "Positional arguments have no `--` prefix and are required by default; optional arguments use `--` and are optional by default",
        "Positional arguments are defined first; optional arguments are defined last",
        "There is no difference — only `required=True` matters"
      ],
      "answer": 1,
      "explanation": "Positional arguments (`parser.add_argument('filename')`) are matched by position and required by default. Optional arguments (`parser.add_argument('--output')`) use the `--` prefix and are optional by default. This naming convention is the core design of argparse.",
      "hint": "Look at whether the argument name starts with `--`."
    },
    {
      "id": "python-standard-library-quiz-49",
      "type": "code-completion",
      "question": "Complete the final step to make parsed arguments available:",
      "instruction": "Fill in the missing method call",
      "codeTemplate": "import argparse\n\nparser = argparse.ArgumentParser(description='Process files')\nparser.add_argument('filename', help='Input file')\nparser.add_argument('--verbose', action='store_true')\n\nargs = parser._____\nprint(args.filename)",
      "answer": "parse_args()",
      "caseSensitive": false,
      "acceptedAnswers": ["parse_args()", "parse_args"],
      "explanation": "`parser.parse_args()` reads `sys.argv`, validates inputs against defined arguments, and returns a `Namespace` object. Accessing `args.filename` and `args.verbose` is only possible after this call."
    },
    {
      "id": "python-standard-library-quiz-50",
      "type": "mcq",
      "question": "In a multi-file application, why should library modules use `logger = logging.getLogger(__name__)` instead of calling `logging.info()` directly?",
      "options": [
        "It creates a separate log file per module",
        "It's faster than using the root logger",
        "It identifies which module a log came from and doesn't interfere with the app's centralized configuration",
        "It allows each module to override the global log level"
      ],
      "answer": 2,
      "explanation": "`logging.getLogger(__name__)` creates a logger named after the module (e.g., `myapp.database`), which identifies the source in log output. Crucially, modules should never call `basicConfig()` — only the entry point does. Module loggers inherit configuration from the root logger set up by `basicConfig()`.",
      "hint": "Think about where configuration should live and how you'd trace a log back to its source."
    },
    {
      "id": "python-standard-library-quiz-51",
      "type": "mcq",
      "question": "Which exception should you specifically catch when a file you're trying to open may not exist?",
      "options": [
        "`IOError`",
        "`FileNotFoundError`",
        "`OSError`",
        "`ValueError`"
      ],
      "answer": 1,
      "explanation": "`FileNotFoundError` is the specific exception raised when a file doesn't exist. While `OSError` (and its alias `IOError`) would also catch it as a parent class, catching `FileNotFoundError` specifically makes your intent clear and avoids masking unrelated OS errors.",
      "hint": "Python 3 has specific exception types for common file errors — prefer the most specific one."
    },
    {
      "id": "python-standard-library-quiz-52",
      "type": "drag-drop",
      "question": "Arrange the high-level steps for working with files in Python:",
      "instruction": "Drag to arrange in the correct order",
      "items": [
        "Choose file mode (`r`, `w`, `a`, `r+`)",
        "Handle errors (`FileNotFoundError`, `PermissionError`)",
        "Open file: `with open(filename, mode) as f`",
        "Import required modules (`json`, `tempfile`, etc.)",
        "Perform read/write operations on the file object"
      ],
      "correctOrder": [3, 2, 0, 4, 1],
      "explanation": "The workflow: import modules → open with `with open()` (ensures cleanup) → pick mode appropriate for your operation → read/write → wrap in try/except for error handling. The `with` statement guarantees the file is closed even if an exception occurs."
    },
    {
      "id": "python-standard-library-quiz-53",
      "type": "drag-drop",
      "question": "Arrange the high-level steps for setting up logging in a Python application:",
      "instruction": "Drag to arrange in the correct order",
      "items": [
        "Call `logging.basicConfig()` once at the entry point (set level, format, handlers)",
        "In library modules, get a module logger: `logger = logging.getLogger(__name__)`",
        "Import `logging`",
        "Log messages using the appropriate level (`debug`, `info`, `warning`, `error`, `critical`)",
        "Use `logging.exception()` inside `except` blocks to capture stack traces"
      ],
      "correctOrder": [2, 0, 1, 3, 4],
      "explanation": "The workflow: import → configure once in main (not in modules) → modules get their own named logger → log at the right level for each message → use exception() (not error()) inside except blocks to automatically include the traceback."
    },
    {
      "id": "python-standard-library-quiz-54",
      "type": "drag-drop",
      "question": "Arrange the high-level steps for working with the `os` module:",
      "instruction": "Drag to arrange in the correct order",
      "items": [
        "Inspect contents and check existence (`os.listdir`, `os.path.exists`, `os.path.isfile`)",
        "Check environment variables (`os.getenv`, `os.environ`)",
        "Import `os`",
        "Build paths safely across platforms (`os.path.join`)",
        "Find or change current location (`os.getcwd`, `os.chdir`)",
        "Create, rename, or remove files and directories (`mkdir`, `remove`, `replace`)"
      ],
      "correctOrder": [2, 1, 4, 0, 3, 5],
      "explanation": "The workflow: import → check environment (API keys, config) → locate yourself (cwd) → inspect the filesystem → build paths with os.path.join (cross-platform safe) → modify the filesystem. For path operations, prefer pathlib.Path which is more readable and object-oriented."
    },
    {
      "id": "python-standard-library-quiz-55",
      "type": "drag-drop",
      "question": "Arrange the high-level steps for working with regex in Python:",
      "instruction": "Drag to arrange in the correct order",
      "items": [
        "Check `if match:` before calling `.group()` to avoid `AttributeError`",
        "Import `re`",
        "Choose the right function: `search()`, `match()`, `findall()`, or `sub()`",
        "Write pattern using raw strings `r'...'` to avoid backslash issues",
        "Compile with `re.compile()` when reusing the pattern multiple times"
      ],
      "correctOrder": [1, 3, 2, 0, 4],
      "explanation": "The workflow: import → write pattern as raw string (r'...' prevents Python from interpreting backslashes) → choose the right function for your goal → always check if match exists before accessing groups → compile for performance when reusing in loops."
    },
    {
      "id": "python-standard-library-quiz-56",
      "type": "drag-drop",
      "question": "Arrange the high-level steps for working with dates and times using `datetime`:",
      "instruction": "Drag to arrange in the correct order",
      "items": [
        "Perform arithmetic using `timedelta` (add or subtract durations)",
        "Import `datetime`, `timedelta`, and `timezone` as needed",
        "Format for display with `strftime()` or parse a string with `strptime()`",
        "Obtain or create a datetime object (`datetime.now()`, `fromisoformat()`, `strptime()`)",
        "Use `timezone.utc` when timezone-awareness is required"
      ],
      "correctOrder": [1, 3, 0, 4, 2],
      "explanation": "The workflow: import → get/create a datetime object → apply timedelta arithmetic → add timezone info if needed → format for output or storage. Remember: strftime = format datetime TO string, strptime = PARSE string to datetime."
    }
  ]
}
{{< /quiz >}}

