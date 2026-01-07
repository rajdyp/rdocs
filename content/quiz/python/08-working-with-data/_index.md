---
title: "Working With Data Quiz"
linkTitle: Working With Data
type: docs
weight: 8
prev: /quiz/python/07-advanced-functions
next: /quiz/python/log-analysis
---

{{< quiz id="python-working-with-data-quiz" >}}
{
  "questions": [
    {
      "id": "python-working-with-data-quiz-01",
      "type": "mcq",
      "question": "When reading CSV files, what is the primary advantage of using `csv.DictReader` over `csv.reader`?",
      "options": [
        "It reads files faster",
        "It uses less memory",
        "It allows access to columns by name instead of position",
        "It automatically handles malformed CSV files"
      ],
      "answer": 2,
      "explanation": "`csv.DictReader` treats the first row as column headers and returns each row as a dictionary, allowing you to access values by column name (e.g., `row['product']`) rather than by numeric index (e.g., `row[0]`). This makes code more readable and maintainable.",
      "hint": "Think about what 'Dict' in DictReader represents."
    },
    {
      "id": "python-working-with-data-quiz-02",
      "type": "code-output",
      "question": "What will be the output of this code?",
      "code": "import json\n\ndata = {\"status\": \"ok\", \"count\": 42}\njson_str = json.dumps(data)\nprint(type(json_str))",
      "language": "python",
      "options": [
        "`<class 'dict'>`",
        "`<class 'str'>`",
        "`<class 'json'>`",
        "`<class 'bytes'>`"
      ],
      "answer": 1,
      "explanation": "`json.dumps()` (with an 's' for string) converts a Python dictionary to a JSON-formatted **string**. The 's' suffix is the key reminder: dumps = dump to string, dump = dump to file.",
      "hint": "Remember: the 's' in dumps means 'string'."
    },
    {
      "id": "python-working-with-data-quiz-03",
      "type": "multiple-select",
      "question": "Which of the following are valid ways to handle missing or nested JSON fields safely?",
      "options": [
        "Using `.get()` method with default values",
        "Using direct key access like `data['key']`",
        "Creating a helper function with multiple `.get()` calls",
        "Using try/except blocks around each key access",
        "Checking `isinstance()` before accessing nested levels"
      ],
      "answers": [0, 2, 4],
      "explanation": "Safe JSON navigation uses `.get()` with defaults, helper functions that chain `.get()` calls, and `isinstance()` checks before accessing nested data. Direct key access (`data['key']`) raises `KeyError` if the key is missing. While try/except works, it's verbose and less elegant than `.get()`.",
      "hint": "Think about methods that don't raise exceptions when keys are missing."
    },
    {
      "id": "python-working-with-data-quiz-04",
      "type": "true-false",
      "question": "In Python's `json` module, `json.load()` reads from a file while `json.loads()` reads from a string.",
      "answer": true,
      "explanation": "Correct! The 's' suffix is the mnemonic: `load()` reads from a file object, `loads()` (load string) reads from a string. Similarly, `dump()` writes to a file, `dumps()` returns a string.",
      "hint": "The 's' stands for 'string'."
    },
    {
      "id": "python-working-with-data-quiz-05",
      "type": "fill-blank",
      "question": "What parameter should you ALWAYS pass to the `open()` function when writing CSV files to prevent blank rows on Windows?",
      "answer": "newline=''",
      "caseSensitive": false,
      "explanation": "The `newline=''` parameter prevents the csv module from writing blank lines between rows on Windows systems. This is a cross-platform best practice when using Python's csv module.",
      "hint": "It's related to line endings and takes an empty string as its value."
    },
    {
      "id": "python-working-with-data-quiz-06",
      "type": "mcq",
      "question": "When making HTTP requests with the `requests` library, what is the purpose of `response.raise_for_status()`?",
      "options": [
        "It prints the HTTP status code to the console",
        "It raises an HTTPError exception if the status code indicates an error (4xx or 5xx)",
        "It converts the response to JSON format",
        "It validates the response headers"
      ],
      "answer": 1,
      "explanation": "`response.raise_for_status()` checks if the HTTP status code indicates an error (4xx client errors or 5xx server errors) and raises an `HTTPError` exception if so. This allows you to use try/except for error handling instead of manually checking `status_code`.",
      "hint": "Think about what 'raise' typically means in Python error handling."
    },
    {
      "id": "python-working-with-data-quiz-07",
      "type": "code-completion",
      "question": "Complete the code to make a safe, parameterized SQLite query:",
      "instruction": "Fill in the missing placeholder syntax",
      "codeTemplate": "cursor.execute(\n    \"SELECT * FROM users WHERE username = ___ AND age > ___\",\n    (username, min_age)\n)",
      "answer": "?, ?",
      "caseSensitive": false,
      "acceptedAnswers": ["?, ?", "? ?"],
      "explanation": "SQLite uses `?` as a placeholder for parameterized queries. This prevents SQL injection by automatically escaping values. Never use f-strings or string concatenation for SQL queries as they create security vulnerabilities.",
      "hint": "It's a single character that acts as a placeholder."
    },
    {
      "id": "python-working-with-data-quiz-08",
      "type": "multiple-select",
      "question": "Which of the following are benefits of using `requests.Session()` instead of individual `requests.get()` calls?",
      "options": [
        "Reuses TCP connections for better performance",
        "Automatically converts all responses to JSON",
        "Persists headers across multiple requests",
        "Maintains cookies automatically",
        "Eliminates the need for error handling"
      ],
      "answers": [0, 2, 3],
      "explanation": "Sessions provide connection pooling (TCP reuse), header persistence, and automatic cookie handling. They don't automatically convert responses to JSON (you still call `.json()`), and error handling is still necessary.",
      "hint": "Focus on what gets 'reused' or 'persisted' across requests."
    },
    {
      "id": "python-working-with-data-quiz-09",
      "type": "drag-drop",
      "question": "Arrange these steps in the correct order for making a production-ready HTTP request:",
      "instruction": "Drag to arrange from first to last",
      "items": [
        "Create session with retry strategy",
        "Set authentication headers on session",
        "Make HTTP request with timeout",
        "Call raise_for_status() to check for errors",
        "Parse JSON response"
      ],
      "correctOrder": [0, 1, 2, 3, 4],
      "explanation": "The correct flow is: 1) Set up infrastructure (session with retries), 2) Configure authentication, 3) Make the request (with timeout), 4) Check for HTTP errors, 5) Parse the response. This ensures robustness and proper error handling."
    },
    {
      "id": "python-working-with-data-quiz-10",
      "type": "code-output",
      "question": "What does this CSV writing code produce?",
      "code": "import csv\n\ndata = [{'name': 'Alice', 'age': 30}]\nwith open('out.csv', 'w', newline='') as f:\n    writer = csv.DictWriter(f, fieldnames=['name', 'age'])\n    writer.writeheader()\n    writer.writerows(data)\n\n# How many lines are in out.csv?",
      "language": "python",
      "options": [
        "1 line (just the data row)",
        "2 lines (header + data row)",
        "3 lines (blank line between header and data)",
        "Error - writerows doesn't work with dictionaries"
      ],
      "answer": 1,
      "explanation": "`writeheader()` writes the column names as the first line, then `writerows()` writes each dictionary as a data row. This produces 2 lines total. The `newline=''` parameter prevents blank lines between rows.",
      "hint": "Count what writeheader() and writerows() each contribute."
    },
    {
      "id": "python-working-with-data-quiz-11",
      "type": "true-false",
      "question": "JSONL (JSON Lines) format allows you to append new records to a file without rewriting the entire file.",
      "answer": true,
      "explanation": "True! JSONL stores one JSON object per line, making it append-friendly. You can open the file in append mode ('a') and write new JSON objects, which is impossible with standard JSON arrays/objects without parsing and rewriting the entire file.",
      "hint": "Think about how standard JSON arrays require complete rewrites versus line-by-line formats."
    },
    {
      "id": "python-working-with-data-quiz-12",
      "type": "mcq",
      "question": "In SQLite, what happens if you execute INSERT/UPDATE/DELETE operations but forget to call `conn.commit()`?",
      "options": [
        "The changes are saved automatically",
        "The changes are lost when the connection closes",
        "An error is raised immediately",
        "The changes are queued until the next SELECT query"
      ],
      "answer": 1,
      "explanation": "SQLite uses transactions. Changes made with INSERT/UPDATE/DELETE are held in a transaction and **not persisted to disk** until you call `conn.commit()`. If you close the connection without committing, all changes are rolled back and lost.",
      "hint": "Think about the transactional nature of databases."
    },
    {
      "id": "python-working-with-data-quiz-13",
      "type": "fill-blank",
      "question": "In the `requests` library, what parameter prevents a request from hanging forever if the server doesn't respond?",
      "answer": "timeout",
      "caseSensitive": false,
      "explanation": "The `timeout` parameter (e.g., `requests.get(url, timeout=5)`) specifies how many seconds to wait before giving up. Without it, requests can hang indefinitely, especially on slow or unresponsive servers.",
      "hint": "It's a parameter that specifies how long to wait in seconds."
    },
    {
      "id": "python-working-with-data-quiz-14",
      "type": "mcq",
      "question": "Why should you use `?` placeholders instead of f-strings when building SQL queries?",
      "options": [
        "F-strings are slower than placeholders",
        "Placeholders automatically escape values, preventing SQL injection attacks",
        "F-strings don't work with SQLite",
        "Placeholders make queries easier to read"
      ],
      "answer": 1,
      "explanation": "Parameterized queries with `?` placeholders automatically escape special characters, preventing SQL injection vulnerabilities. Using f-strings or string concatenation allows malicious input like `\"'; DROP TABLE users; --\"` to execute arbitrary SQL commands.",
      "hint": "Think about security and what happens with malicious user input."
    },
    {
      "id": "python-working-with-data-quiz-15",
      "type": "multiple-select",
      "question": "When working with BeautifulSoup for HTML parsing, which methods can you use to find elements?",
      "options": [
        "`.find()` - finds the first matching element",
        "`.find_all()` - finds all matching elements",
        "`.select()` - uses CSS selectors",
        "`.xpath()` - uses XPath expressions",
        "`.search()` - searches with regex patterns"
      ],
      "answers": [0, 1, 2],
      "explanation": "BeautifulSoup provides `.find()` (first match), `.find_all()` (all matches), and `.select()` (CSS selectors). It does **not** have `.xpath()` (that's lxml) or `.search()` methods. CSS selectors via `.select()` are often the most flexible approach.",
      "hint": "BeautifulSoup focuses on 'find' methods and CSS selectors."
    },
    {
      "id": "python-working-with-data-quiz-16",
      "type": "code-output",
      "question": "What will this code print?",
      "code": "import sqlite3\n\nconn = sqlite3.connect(':memory:')\ncursor = conn.cursor()\n\ncursor.execute(\"CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)\")\ncursor.execute(\"INSERT INTO test (name) VALUES ('Alice')\")\nprint(cursor.lastrowid)",
      "language": "python",
      "options": [
        "0",
        "1",
        "None",
        "Error - lastrowid doesn't exist"
      ],
      "answer": 1,
      "explanation": "`cursor.lastrowid` returns the auto-generated ID of the last inserted row. Since this is the first insert with an auto-incrementing PRIMARY KEY, it returns 1. This is useful for immediately getting the ID of newly created records.",
      "hint": "Think about what auto-increment primary keys start from."
    },
    {
      "id": "python-working-with-data-quiz-17",
      "type": "flashcard",
      "question": "What is the mental model for working with JSON in Python?",
      "answer": "**Decode → Work → Encode**\n\n1. **Decode**: JSON string/file → Python objects (`json.load()` / `json.loads()`)\n2. **Work**: Manipulate using native Python (dicts, lists, etc.)\n3. **Encode**: Python objects → JSON string/file (`json.dump()` / `json.dumps()`)\n\nKey insight: JSON is always a string format. You decode it to Python, work with native objects, then encode back to JSON when needed."
    },
    {
      "id": "python-working-with-data-quiz-18",
      "type": "true-false",
      "question": "When using `requests.Session()` with retry logic via `HTTPAdapter`, you should retry POST and DELETE requests to ensure reliability.",
      "answer": false,
      "explanation": "False! You should **only retry safe (idempotent) methods** like GET, HEAD, and OPTIONS. Retrying POST/PUT/DELETE can cause duplicate actions (creating multiple records, deleting twice, etc.) because these operations have side effects. The `allowed_methods` parameter in `Retry()` should exclude non-idempotent methods.",
      "hint": "Think about what happens if a POST request succeeds on the server but the response gets lost—should you retry?"
    },
    {
      "id": "python-working-with-data-quiz-19",
      "type": "mcq",
      "question": "What is the primary difference between ElementTree and BeautifulSoup for parsing?",
      "options": [
        "ElementTree is for XML, BeautifulSoup is for HTML",
        "ElementTree is faster, BeautifulSoup is more flexible",
        "ElementTree is built-in, BeautifulSoup requires installation",
        "ElementTree uses XPath, BeautifulSoup uses CSS selectors"
      ],
      "answer": 0,
      "explanation": "While there's some overlap, ElementTree is Python's built-in **XML parser** (best for well-formed XML like RSS feeds, config files), while BeautifulSoup is a third-party library specialized for **HTML parsing** that can handle messy, malformed HTML commonly found on websites.",
      "hint": "Think about the primary use case for each library."
    },
    {
      "id": "python-working-with-data-quiz-20",
      "type": "fill-blank",
      "question": "What SQLite setting should you configure immediately after connecting to enable dictionary-like access to query results by column name?",
      "answer": "conn.row_factory = sqlite3.Row",
      "caseSensitive": false,
      "explanation": "Setting `conn.row_factory = sqlite3.Row` enables accessing columns by name (e.g., `row['username']`) instead of by index (e.g., `row[0]`). This makes code much more readable and maintainable.",
      "hint": "It's about configuring how rows are returned from queries."
    },
    {
      "id": "python-working-with-data-quiz-21",
      "type": "mcq",
      "question": "In the requests library, what is the difference between the `json` parameter and the `data` parameter in POST requests?",
      "options": [
        "They are identical—just different names for the same thing",
        "`json` automatically serializes to JSON and sets Content-Type header; `data` sends form-encoded data",
        "`json` is faster than `data`",
        "`data` is deprecated in favor of `json`"
      ],
      "answer": 1,
      "explanation": "The `json` parameter automatically: 1) serializes your Python dict to JSON string, and 2) sets `Content-Type: application/json`. The `data` parameter sends form-encoded data (`application/x-www-form-urlencoded`) and requires manual JSON serialization if you want JSON.",
      "hint": "Think about what each parameter does to the Content-Type header."
    },
    {
      "id": "python-working-with-data-quiz-22",
      "type": "code-completion",
      "question": "Complete the code to safely navigate nested JSON and provide a default value:",
      "instruction": "Fill in the safe navigation method",
      "codeTemplate": "# Safely get city from: data['user']['profile']['location']['city']\ncity = data.___('user', {}).___('profile', {}).___('location', {}).___('city', 'Unknown')",
      "answer": "get",
      "caseSensitive": false,
      "acceptedAnswers": ["get"],
      "explanation": "Using chained `.get()` methods with empty dict defaults `{}` safely navigates nested JSON without raising `KeyError`. If any key is missing, it returns the default value instead of crashing. The final `.get('city', 'Unknown')` provides a fallback if city is missing.",
      "hint": "It's a dictionary method that returns a default value if the key doesn't exist."
    },
    {
      "id": "python-working-with-data-quiz-23",
      "type": "drag-drop",
      "question": "Arrange these SQLite operations in the correct execution order:",
      "instruction": "Drag to arrange in the correct order",
      "items": [
        "Connect to database",
        "Create cursor object",
        "Execute SQL query",
        "Commit transaction (for writes)",
        "Close connection"
      ],
      "correctOrder": [0, 1, 2, 3, 4],
      "explanation": "The correct workflow is: 1) Connect to database, 2) Get cursor, 3) Execute SQL, 4) Commit changes (for INSERT/UPDATE/DELETE), 5) Close connection. Committing before closing ensures changes are persisted."
    },
    {
      "id": "python-working-with-data-quiz-24",
      "type": "multiple-select",
      "question": "Which HTTP status codes should you typically configure for automatic retries in a retry strategy?",
      "options": [
        "404 Not Found",
        "429 Too Many Requests (rate limit)",
        "500 Internal Server Error",
        "401 Unauthorized",
        "503 Service Unavailable"
      ],
      "answers": [1, 2, 4],
      "explanation": "Retry on **transient errors**: 429 (rate limit—wait and retry), 500/502/503/504 (temporary server issues). Don't retry 404 (resource doesn't exist—won't change) or 401 (auth failed—need different credentials, not retry).",
      "hint": "Think about which errors are temporary versus permanent."
    },
    {
      "id": "python-working-with-data-quiz-25",
      "type": "flashcard",
      "question": "What is the workflow for making production-ready HTTP requests with the requests library?",
      "answer": "**Progressive HTTP Request Workflow:**\n\n1. **Choose approach**: Single request (`requests.get()`) vs. Session (multiple requests)\n2. **Build request**: Method + URL + optional params (headers, params, json, data, timeout)\n3. **Handle response**: `response.json()` / `.text` / `.content` + `response.status_code` / `.ok`\n4. **Error handling**: Catch `requests.RequestException` hierarchy (ConnectionError, Timeout, HTTPError)\n5. **Advanced**: Add retry logic (`HTTPAdapter` + `Retry`) and rate limiting (`@limits` decorator)\n\nKey: Always set `timeout`, use Sessions for multiple requests, retry only safe methods, handle three error layers (network, HTTP, JSON)."
    },
    {
      "id": "python-working-with-data-quiz-26",
      "type": "true-false",
      "question": "When using pandas to read CSV files, you must manually handle data type conversions for numeric columns.",
      "answer": false,
      "explanation": "False! Pandas automatically infers data types when reading CSV files with `pd.read_csv()`. Numeric columns are converted to int/float, dates can be auto-parsed, etc. This is one of pandas' key advantages over the built-in `csv` module.",
      "hint": "Think about pandas' automatic type inference capabilities."
    },
    {
      "id": "python-working-with-data-quiz-27",
      "type": "mcq",
      "question": "What is the purpose of the `backoff_factor` parameter in the `Retry` strategy?",
      "options": [
        "It sets the maximum number of retries",
        "It determines which HTTP methods to retry",
        "It controls exponential wait time between retries (e.g., 1s, 2s, 4s, 8s)",
        "It specifies which status codes trigger retries"
      ],
      "answer": 2,
      "explanation": "`backoff_factor` controls the exponential delay between retry attempts. With `backoff_factor=1`, waits are 1s, 2s, 4s, 8s, etc. This prevents overwhelming the server and gives it time to recover. Formula: `{backoff_factor} * (2 ** retry_number)`.",
      "hint": "Think about the time delay pattern between retry attempts."
    },
    {
      "id": "python-working-with-data-quiz-28",
      "type": "code-output",
      "question": "What will this code print?",
      "code": "import json\n\ndata = {'a': 1, 'b': 2}\njson_str = json.dumps(data, separators=(',', ':'))\nprint(len(json_str))",
      "language": "python",
      "options": [
        "9",
        "11",
        "13",
        "15"
      ],
      "answer": 0,
      "explanation": "`separators=(',', ':')` creates compact JSON with no spaces: `{\"a\":1,\"b\":2}` (9 characters). The default separators `(', ', ': ')` include spaces, producing `{\"a\": 1, \"b\": 2}` (13 characters). Compact format is useful for minimizing file/network size.",
      "hint": "Count the characters in compact JSON: {\"a\":1,\"b\":2}"
    },
    {
      "id": "python-working-with-data-quiz-29",
      "type": "multiple-select",
      "question": "Which of the following are best practices when working with SQLite in Python?",
      "options": [
        "Always use parameterized queries with `?` placeholders",
        "Use `executemany()` for batch inserts instead of individual inserts",
        "Set `conn.row_factory = sqlite3.Row` for readable column access",
        "Call `commit()` after every single SQL statement",
        "Use `:memory:` databases for testing"
      ],
      "answers": [0, 1, 2, 4],
      "explanation": "Best practices: parameterized queries (prevent SQL injection), batch operations (`executemany`), Row factory (readable code), and in-memory DBs for tests. You should **not** commit after every statement—batch commits into transactions for better performance.",
      "hint": "Think about security, performance, readability, and testing."
    },
    {
      "id": "python-working-with-data-quiz-30",
      "type": "mcq",
      "question": "When scraping HTML with BeautifulSoup, what's the most flexible way to select elements?",
      "options": [
        "`.find()` with tag name",
        "`.find_all()` with class name",
        "`.select()` with CSS selectors",
        "Direct attribute access"
      ],
      "answer": 2,
      "explanation": "`.select()` with CSS selectors is the most flexible because it supports complex queries like `'div.content p'` (all `<p>` inside `div.content`), pseudo-selectors, attribute matching, etc. It's the same selector syntax used in CSS and jQuery.",
      "hint": "Think about which method supports the most complex selection patterns."
    },
    {
      "id": "python-working-with-data-quiz-31",
      "type": "fill-blank",
      "question": "In SQLite, what SQL keyword makes a table creation idempotent (safe to run multiple times)?",
      "answer": "IF NOT EXISTS",
      "caseSensitive": false,
      "explanation": "`CREATE TABLE IF NOT EXISTS` only creates the table if it doesn't already exist, making the operation idempotent. Without this, running the CREATE TABLE statement twice raises an error.",
      "hint": "It's a clause that checks for existence before creating."
    },
    {
      "id": "python-working-with-data-quiz-32",
      "type": "true-false",
      "question": "In the requests library, calling `response.json()` is equivalent to calling `json.loads(response.text)`.",
      "answer": true,
      "explanation": "True! `response.json()` is a convenience method that internally calls `json.loads(response.text)`. It parses the JSON string from the response body into a Python dictionary. If the response isn't valid JSON, both will raise `json.JSONDecodeError`.",
      "hint": "Think about what response.json() does under the hood."
    }
  ]
}
{{< /quiz >}}

