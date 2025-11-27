---
title: Working With Data
linkTitle: Working With Data
type: docs
weight: 8
prev: /python/07-advanced-functions
next: /python/99-reference
---

## CSV Files

CSV (Comma-Separated Values) files are everywhere - exports from spreadsheets, data dumps, etc. Python's `csv` module makes working with them straightforward.

### Reading CSV Files

The `csv.reader` gives you lists, while `csv.DictReader` gives you dictionaries (usually more convenient):

```python
import csv

# Basic reading - each row is a list
with open('sales.csv', 'r') as f:
    reader = csv.reader(f)
    next(reader)  # Skip header row if needed
    for row in reader:
        product, quantity, price = row
        print(f"{product}: {quantity} units at ${price}")

# DictReader - each row is a dictionary (easier to work with!)
with open('sales.csv', 'r') as f:
    reader = csv.DictReader(f)  # First row becomes dict keys for all rows
    for row in reader:
        print(f"{row['product']}: {row['quantity']} units at ${row['price']}")
        # No need to remember column positions!
```

**Handling different formats:**

```python
# Tab-separated files
with open('data.tsv', 'r') as f:
    reader = csv.reader(f, delimiter='\t')

# Semicolon-separated (common in Europe)
with open('data.csv', 'r') as f:
    reader = csv.reader(f, delimiter=';')

# Skip comments or blank lines
with open('data.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        if not row or row['product'].startswith('#'):
            continue
        # Process data
```

### Writing CSV Files

Writing follows the same pattern - use `writer` for lists or `DictWriter` for dictionaries:

```python
import csv

# Writing from lists
data = [
    ['name', 'age', 'city'],
    ['Alice', 30, 'NYC'],
    ['Bob', 25, 'LA']
]

with open('output.csv', 'w', newline='') as f:  # newline='' prevents blank rows
    writer = csv.writer(f)
    writer.writerows(data)  # Write all at once
    # Or: writer.writerow(row) for individual rows

# Writing from dictionaries (cleaner for structured data)
employees = [
    {'name': 'Alice', 'dept': 'Engineering', 'salary': 120000},
    {'name': 'Bob', 'dept': 'Sales', 'salary': 95000}
]

with open('employees.csv', 'w', newline='') as f:
    fieldnames = ['name', 'dept', 'salary']
    writer = csv.DictWriter(f, fieldnames=fieldnames)

    writer.writeheader()  # Write column names
    writer.writerows(employees)
```

**Processing and transforming:**

```python
# Read, filter, and write
with open('input.csv', 'r') as infile, open('output.csv', 'w', newline='') as outfile:
    reader = csv.DictReader(infile)
    fieldnames = reader.fieldnames
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)

    writer.writeheader()
    for row in reader:
        if int(row['age']) >= 18:  # Filter condition
            writer.writerow(row)
```

### CSV with pandas

For serious data work, pandas is much more powerful than the built-in `csv` module:

> **Note:** `pandas` is a third-party library. Install with: `pip install pandas`

```python
import pandas as pd

# Read CSV into DataFrame
df = pd.read_csv('data.csv')

# Common operations
print(df.head())                    # Preview first 5 rows
print(df.describe())                # Statistical summary
print(df['age'].mean())             # Column operations

# Filter and transform
adults = df[df['age'] >= 18]        # Filter rows
df['age_group'] = df['age'] // 10   # Add calculated column

# Write back to CSV
df.to_csv('output.csv', index=False)  # index=False omits row numbers
```

**When to use what:**
- **`csv` module**: Simple reading/writing, small files, no dependencies
- **`pandas`**: Complex analysis, large datasets, need filtering/grouping/aggregation

## JSON Deep Dive

JSON (JavaScript Object Notation) is the lingua franca of web APIs and config files. Python’s built-in `json` module makes parsing and generating JSON straightforward.

### Mental Model: "Decode → Work → Encode"

```
Raw JSON (string/file)
    ↓ json.loads() / json.load()
Python objects (dict, list, str, int, float, bool, None)
    ↓ manipulate with normal Python
JSON string again
    ↑ json.dumps() / json.dump()
```

**Key insight:** JSON is always a string format. You decode it to Python, work with native Python objects, then encode back to JSON when needed.

**Type mapping:**

Top-level can be any JSON type (though usually object or array)

| JSON | Python | Example |
|------|--------|---------|
| object | `dict` | `{"key": "value"}` → `{'key': 'value'}` |
| array | `list` | `[1, 2, 3]` → `[1, 2, 3]` |
| string | `str` | `"hello"` → `'hello'` |
| number | `int`/`float` | `42` → `42`, `3.14` → `3.14` |
| true/false | `bool` | `true` → `True`, `false` → `False` |
| null | `NoneType` | `null` → `None` |

### Reading JSON

There are two main functions - remember the "s" suffix:
- `json.load()` - Read from **file**
- `json.loads()` - Read from **string** (the "s" = string)

```python
import json

# From file (most common)
with open('config.json', 'r') as f:
    config = json.load(f)          # Returns Python dict/list
print(config['database']['host'])  # Access like normal dict

# From string (e.g., API responses, logs)
json_str = '{"status": "ok", "count": 42}'
data = json.loads(json_str)        # String → Python dict
print(data['status'])              # 'ok'

# From API response (requires 'requests': pip install requests)
import requests
response = requests.get('https://api.github.com/users/octocat')
user = response.json()             # Shortcut for json.loads(response.text)
print(user['name'], user['public_repos'])
```

**Handling errors:**

```python
import json

try:
    data = json.loads(malformed_json)
except json.JSONDecodeError as e:
    print(f"Invalid JSON at line {e.lineno}, column {e.colno}: {e.msg}")
```

### Writing JSON

Same pattern - "s" suffix means string:
- `json.dump()` - Write to **file**
- `json.dumps()` - Write to **string**

```python
import json

config = {
    "database": {"host": "localhost", "port": 5432},
    "features": ["auth", "logging"],
    "debug": True
}

# To file (saves configuration, results, etc.)
with open('config.json', 'w') as f:
    json.dump(config, f, indent=2)                   # indent=2 makes it readable

# To string (for APIs, logging)
json_str = json.dumps(config, indent=2)
print(json_str)                                      # Formatted JSON string

# Compact format (no whitespace - smaller size)
compact = json.dumps(config, separators=(',', ':'))  # No spaces

# Pretty print with sorted keys (good for diffs)
print(json.dumps(config, indent=4, sort_keys=True))
```

**Common options:**
```python
json.dumps(data,
    indent=2,           # Pretty print with 2-space indent
    sort_keys=True,     # Sort dict keys alphabetically
    ensure_ascii=False, # Allow Unicode characters (不 instead of \u4e0d)
    default=str         # Fallback for non-serializable objects
)
```

### Working with JSON Lines (JSONL)

JSONL (one JSON object per line) is great for logs, streaming data, or datasets too big for memory:

```python
import json

# Reading JSONL (process one record at a time)
with open('events.jsonl', 'r') as f:
    for line in f:
        event = json.loads(line)  # Each line is separate JSON
        if event['type'] == 'error':
            print(event['message'])

# Writing JSONL (append-friendly!)
events = [
    {'type': 'login', 'user': 'alice', 'timestamp': 1234567890},
    {'type': 'logout', 'user': 'alice', 'timestamp': 1234567999}
]

with open('events.jsonl', 'w') as f:
    for event in events:
        f.write(json.dumps(event) + '\n')  # One JSON per line

# Appending to JSONL (unlike regular JSON, you can append!)
with open('events.jsonl', 'a') as f:
    new_event = {'type': 'error', 'code': 500}
    f.write(json.dumps(new_event) + '\n')
```

**Why JSONL?**
- Can process huge files line-by-line (won't run out of memory)
- Can append new records without rewriting entire file
- Easy to grep/filter with command-line tools

### Handling Nested JSON

Real-world JSON is often deeply nested. Here's how to handle it safely:

```python
# Typical API response
response = {
    "data": {
        "user": {
            "profile": {
                "name": "Alice",
                "location": {"city": "NYC", "country": "US"}
            },
            "stats": {"posts": 42, "followers": 1337}
        }
    }
}

# Direct access (risky - KeyError if structure changes)
city = response["data"]["user"]["profile"]["location"]["city"]

# Safe access with get() - returns None if missing
city = response.get("data", {}).get("user", {}).get("profile", {}).get("location", {}).get("city")
# Verbose but safe!

# Better: Helper function
def safe_get(data, *keys, default=None):
    """Safely navigate nested dict: safe_get(data, 'a', 'b', 'c')"""
    for key in keys:
        if isinstance(data, dict):
            data = data.get(key)
        else:
            return default
        if data is None:
            return default
    return data

city = safe_get(response, "data", "user", "profile", "location", "city")
followers = safe_get(response, "data", "user", "stats", "followers", default=0)
```

**Flattening nested JSON** (for CSV export or analysis):

```python
def flatten(data, parent_key='', sep='_'):
    """
    Flatten nested dict:
    {'a': {'b': 1, 'c': 2}} → {'a_b': 1, 'a_c': 2}
    """
    items = []
    for k, v in data.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)

nested = {
    "user": {
        "name": "Alice",
        "address": {"city": "NYC", "zip": "10001"}
    }
}

flat = flatten(nested)
# {'user_name': 'Alice', 'user_address_city': 'NYC', 'user_address_zip': '10001'}

# Now you can easily convert to CSV or DataFrame
import csv
with open('output.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=flat.keys())
    writer.writeheader()
    writer.writerow(flat)
```

**Extracting specific fields from complex JSON:**

```python
# GitHub API response has tons of fields - extract just what you need
import requests

response = requests.get('https://api.github.com/repos/python/cpython')
repo = response.json()

# Extract only what matters
summary = {
    'name': repo['name'],
    'stars': repo['stargazers_count'],
    'language': repo['language'],
    'url': repo['html_url']
}

print(json.dumps(summary, indent=2))
```

## XML/HTML Parsing

### Using ElementTree

ElementTree is Python's built-in XML parser - lightweight and fast, perfect for RSS feeds, config files, or simple XML documents.

```python
import xml.etree.ElementTree as ET

# Parse XML file
tree = ET.parse('data.xml')
root = tree.getroot()

# Iterate elements
for child in root:
    print(child.tag, child.attrib, child.text)

# Find elements
for item in root.findall('.//item'):
    title = item.find('title').text
    link = item.find('link').text
    print(title, link)

# XPath-like queries
books = root.findall(".//book[@category='fiction']")
```

**Practical example - parsing RSS feed:**

```python
import xml.etree.ElementTree as ET
import requests

# Fetch RSS feed
response = requests.get('https://example.com/rss')
root = ET.fromstring(response.content)  # Parse from string

# Extract articles
for item in root.findall('.//item'):
    title = item.find('title').text
    link = item.find('link').text
    pub_date = item.find('pubDate').text
    print(f"{title}\n  {link}\n  Published: {pub_date}\n")
```

### Using BeautifulSoup (HTML)

BeautifulSoup is the go-to library for parsing HTML - great for web scraping, extracting data from saved HTML files, or processing messy/malformed HTML.

> **Note:** `BeautifulSoup` (from `bs4` package) is a third-party HTML/XML parsing library. Install with: `pip install beautifulsoup4`

```python
from bs4 import BeautifulSoup

html = """
<html>
  <body>
    <div class="content">
      <h1>Title</h1>
      <p>Paragraph 1</p>
      <p>Paragraph 2</p>
    </div>
  </body>
</html>
"""

soup = BeautifulSoup(html, 'html.parser')

# Find first match by tag
title = soup.find('h1').text               # 'Title'

# Find all matches
paragraphs = soup.find_all('p')
for p in paragraphs:
    print(p.text)

# Find by class
content = soup.find('div', class_='content')

# CSS selectors (most flexible!)
paragraphs = soup.select('div.content p')  # All <p> inside div.content
```

**Practical example - scraping a webpage:**

```python
import requests
from bs4 import BeautifulSoup

# Fetch webpage
response = requests.get('https://news.ycombinator.com/')
soup = BeautifulSoup(response.text, 'html.parser')

# Extract article titles and links
for article in soup.select('.titleline > a'):
    title = article.text
    url = article['href']  # Access attributes like dict
    print(f"{title}\n  {url}\n")

# Extract with filters
links = soup.find_all('a', href=True)  # Only links with href attribute
external_links = [a['href'] for a in soup.find_all('a') if a['href'].startswith('http')]
```

**Common patterns:**

```python
from bs4 import BeautifulSoup

# Parse from file
with open('page.html', 'r') as f:
    soup = BeautifulSoup(f, 'html.parser')

# Navigate the tree
div = soup.find('div', class_='content')
parent = div.parent                     # Go up
first_child = div.contents[0]           # Go down
next_sibling = div.next_sibling         # Go sideways

# Extract text without tags
text = soup.get_text()                  # All text
clean_text = soup.get_text(strip=True)  # Without extra whitespace

# Handle missing elements safely
title_tag = soup.find('h1')
title = title_tag.text if title_tag else 'No title'

# Or use .get() for attributes
link = soup.find('a')
href = link.get('href', '#')            # Default to '#' if no href
```

## APIs & HTTP (requests)

Making HTTP requests is fundamental to modern programming - whether you're calling a weather API, posting to Slack, or scraping data. Python's `requests` library makes this dead simple.

> **Note:** `requests` is a third-party library. Install with: `pip install requests`

### Mental Model

**The Flow:**
```
Your code
    ↓ requests.get/post/put/delete()
HTTP Request (method + URL + headers + data)
    ↓ travels over network
API Server
    ↓ processes and responds
HTTP Response (status + headers + body)
    ↓ response.json() / response.text
Your code gets data
```

**Step-by-Step Workflow:**

**1. Import the library**
```python
import requests
```

**2. Choose your approach**
- **Single request** → Use `requests.get()` directly
  - Always set `timeout` to avoid hanging forever
  - Good for one-off API calls
- **Session** → Use `requests.Session()`
  - Reuses TCP connections (faster for multiple requests)
  - Persists headers, cookies, and retry logic across requests
  - Essential for authenticated APIs

**3. Build the request** (Method + URL + Optional parameters)
- **Method**: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- **URL**: API endpoint
- **Optional parameters**:
  - `headers`: Authentication, content type, user agent
  - `params`: Query string for GET requests (e.g., `?search=python&limit=10`)
  - `json`: JSON body for POST/PUT (auto-serializes dict)
  - `data`: Form data for POST (key-value pairs)
  - `timeout`: How long to wait before giving up

**4. Handle the response** (Data + Metadata)
- **Main data**:
  - `response.json()` → Parses JSON string to Python dict (calls `json.loads(response.text)` internally)
  - `response.text` → Raw response as string
  - `response.content` → Raw bytes (for images, PDFs, etc.)
- **Metadata**:
  - `response.status_code` → 200 (success), 404 (not found), 500 (server error), etc.
  - `response.headers` → Response headers (content type, rate limits, etc.)
  - `response.ok` → True if status code < 400

**5. Error handling** (Network + HTTP + JSON layers)

Always handle three types of errors:

```python
try:
    response = requests.get(url, timeout=5)
    response.raise_for_status()         # Raises HTTPError for 4xx/5xx
    data = response.json()
except requests.RequestException as e:  # base class
    # Network/HTTP errors
    pass
except json.JSONDecodeError:
    # Invalid JSON in response
    pass
```

**RequestException hierarchy:**
```
requests.RequestException (base class - catches all)
    ├── ConnectionError       # Network problem (DNS, refused connection)
    ├── HTTPError             # Bad status code (4xx, 5xx)
    ├── Timeout               # Request took too long
    ├── TooManyRedirects      # Redirect loop
    └── URLRequired           # No URL provided
```

**6. Retry logic** (for unreliable APIs)

```python
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Create session
session = requests.Session()

# Define retry strategy
retry_strategy = Retry(
    total=3,                                    # Max retry attempts
    backoff_factor=1,                           # Wait 1s, 2s, 4s (exponential)
    status_forcelist=[429, 500, 502, 503, 504], # Retry these status codes
    allowed_methods=["HEAD", "GET", "OPTIONS"]  # Only safe (idempotent) methods
)

# Mount adapter to session
adapter = HTTPAdapter(max_retries=retry_strategy)
session.mount("http://", adapter)   # Apply to HTTP
session.mount("https://", adapter)  # Apply to HTTPS

# Use session instead of requests
response = session.get(url)  # Auto-retries on failure
```

**Key retry concepts:**
- **HTTPAdapter**: Adds retry + connection pooling to a Session
- **Retry**: Defines retry behavior (how many times, which errors, backoff timing)
- **backoff_factor**: Exponential wait between retries (1s → 2s → 4s → 8s...)
- **status_forcelist**: Only retry specific server errors (don't retry 404!)
- **allowed_methods**: Only retry safe operations (GET, not POST/DELETE)

**7. Rate limiting** (client-side throttling)

For APIs with rate limits, throttle requests client-side:

```python
from ratelimit import limits, sleep_and_retry

# Limit to 10 calls per minute
@sleep_and_retry
@limits(calls=10, period=60)
def call_api(url):
    response = requests.get(url)
    return response.json()

# Automatically waits if limit exceeded
for i in range(20):
    data = call_api(api_url)  # Throttles to 10/min
```

**Note**: `ratelimit` library is best for scripts. For production apps, use Redis-based rate limiting or API-provided rate limit headers.

### Basic GET Request

GET is for retrieving data (reading, not modifying).

```python
import requests

# Simple GET
response = requests.get('https://api.github.com/users/octocat')

# Access response data
print(response.status_code)         # 200, 404, 500, etc.
print(response.json())              # Parse JSON body → dict
print(response.text)                # Raw response as string
print(response.headers)             # Response headers
```

**Two ways to handle errors:**

```python
# Method 1: Manual status code checking
response = requests.get('https://api.github.com/users/octocat')
if response.status_code == 200:
    user = response.json()
    print(user['name'])
else:
    print(f"Error: {response.status_code}")
```

```python
# Method 2: Better - use raise_for_status() with try/except
try:
    response = requests.get('https://api.github.com/users/octocat')
    response.raise_for_status()  # Raises HTTPError if 4xx/5xx
    user = response.json()       # Safe to parse now
    print(user['name'])
except requests.HTTPError as e:
    print(f"HTTP error: {e}")
```

### Query Parameters

APIs often use query params for filtering, pagination and search.

```python
# Method 1: Build URL string manually (error-prone!)
url = 'https://api.example.com/search?q=python&limit=10&sort=stars'
response = requests.get(url)

# Method 2: Use params dict (better - handles encoding!)
params = {
    'q': 'python',
    'limit': 10,
    'sort': 'stars'
}
response = requests.get('https://api.example.com/search', params=params)
# requests automatically builds: /search?q=python&limit=10&sort=stars

# Handles special characters automatically
params = {'q': 'machine learning & AI'}  # Space and & encoded
response = requests.get(url, params=params)  # q=machine%20learning%20%26%20AI
```

**Real example - GitHub API:**

```python
# Get most-starred Python repos created this year
params = {
    'q': 'language:python created:>2025-01-01',
    'sort': 'stars',
    'per_page': 10
}
response = requests.get('https://api.github.com/search/repositories', params=params)
repos = response.json()['items']
for repo in repos:
    print(f"{repo['name']}: {repo['stargazers_count']} stars")
```

### Headers

Headers carry metadata - authentication, content type and user agent.

```python
# Common headers
headers = {
    'Authorization': 'Bearer YOUR_API_TOKEN',  # Authentication
    'User-Agent': 'MyApp/1.0',                 # Identify your app
    'Accept': 'application/json',              # Expected response format
    'Content-Type': 'application/json'         # Request body format
}

response = requests.get('https://api.example.com/protected', headers=headers)

# Real example - GitHub API with auth
token = 'ghp_your_token_here'
headers = {'Authorization': f'token {token}'}
response = requests.get('https://api.github.com/user/repos', headers=headers)
```

### POST Requests

POST is for creating/sending data.

```python
import requests

# Form data (like HTML form submission)
data = {'username': 'alice', 'password': 'secret123'}
response = requests.post('https://example.com/login', data=data)
# Sends as: username=alice&password=secret123
# Content-Type: application/x-www-form-urlencoded

# JSON data (most common for modern APIs)
payload = {
    'title': 'New Post',
    'body': 'Content here',
    'userId': 1
}
response = requests.post('https://jsonplaceholder.typicode.com/posts', json=payload)
# Automatically:
# - Sets Content-Type: application/json
# - Serializes dict to JSON string
print(response.json())                      # Returns created object with ID

# File upload
files = {'file': open('report.pdf', 'rb')}  # 'rb' = read binary
response = requests.post('https://example.com/upload', files=files)

# Multiple files
files = {
    'document': open('contract.pdf', 'rb'),
    'signature': open('sig.png', 'rb')
}
response = requests.post(url, files=files)
```

**Other HTTP methods:**

```python
# PUT - Update existing resource
requests.put('https://api.example.com/users/123', json={'name': 'New Name'})

# PATCH - Partial update
requests.patch('https://api.example.com/users/123', json={'email': 'new@email.com'})

# DELETE - Remove resource
requests.delete('https://api.example.com/users/123')
```

### Sessions - Reusing Connections

For multiple requests to the same API, use a Session (faster, cleaner).

```python
# Without session - creates new connection each time (slow)
response1 = requests.get('https://api.example.com/endpoint1')
response2 = requests.get('https://api.example.com/endpoint2')
response3 = requests.get('https://api.example.com/endpoint3')

# With session - reuses TCP connection (fast!)
session = requests.Session()
session.headers.update({'Authorization': f'Bearer {token}'})  # Set once

response1 = session.get('https://api.example.com/endpoint1')
response2 = session.get('https://api.example.com/endpoint2')
response3 = session.get('https://api.example.com/endpoint3')

session.close()  # Must remember to close!

# Better: Context manager (automatically closes when done)
with requests.Session() as session:
    session.headers.update({'Authorization': f'Bearer {token}'})

    response1 = session.get('https://api.example.com/endpoint1')
    response2 = session.get('https://api.example.com/endpoint2')
    response3 = session.get('https://api.example.com/endpoint3')
    # No session.close() needed!
```

**Why use sessions?**
- Reuses TCP connections (faster for multiple requests)
- Persists headers across requests (DRY)
- Maintains cookies automatically
- Essential for authenticated APIs

### Error Handling

Network requests fail - handle it gracefully:

```python
import requests
import json

try:
    response = requests.get('https://api.example.com/data', timeout=5)
    response.raise_for_status()  # Raise exception for 4xx/5xx
    data = response.json()

except requests.ConnectionError:
    print("Network problem - check your connection")

except requests.Timeout:
    print("Request timed out after 5 seconds")

except requests.HTTPError as e:
    print(f"HTTP error: {e}")
    print(f"Status code: {response.status_code}")
    print(f"Response body: {response.text}")

except json.JSONDecodeError:
    print("Response wasn't valid JSON")
    print(f"Got: {response.text}")

except requests.RequestException as e:
    # Catch-all for any requests error
    print(f"Request failed: {e}")
```

**Always set timeouts!**

```python
# Bad - waits forever if server hangs
response = requests.get(url)

# Good - fails after 5 seconds
response = requests.get(url, timeout=5)

# Separate connect and read timeouts
response = requests.get(url, timeout=(3, 10))  # 3s connect, 10s read
```

### Retry Logic (Advanced)

Sessions and retries are separate concepts that work great together:
- Session **without** retry: Fast connections, but fails on first error
- Retry **with** Session: Fast connections + automatic retries (best!)

For unreliable APIs, add retry logic to your session:

```python
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import requests

# Create session (for connection reuse)
session = requests.Session()

# Configure retry strategy
retry_strategy = Retry(
    total=3,                                    # Max retry attempts
    backoff_factor=1,                           # Wait 1s, 2s, 4s between retries
    status_forcelist=[429, 500, 502, 503, 504], # Retry these status codes
    allowed_methods=["HEAD", "GET", "OPTIONS"]  # Only retry safe methods
)

# Attach retry logic to the session
adapter = HTTPAdapter(max_retries=retry_strategy)
session.mount("http://", adapter)   # Apply to HTTP URLs
session.mount("https://", adapter)  # Apply to HTTPS URLs

# Now the session has BOTH connection reuse AND automatic retries
session.headers.update({'Authorization': 'Bearer token'})  # Still persists headers
response = session.get('https://unreliable-api.com/data')  # Retries automatically on failure
```

**What happens:**
1. Request fails with 503 (server error)
2. Session waits 1 second, retries automatically
3. Still fails? Waits 2 seconds, retries again
4. Still fails? Waits 4 seconds, final retry
5. After 3 attempts, raises exception

**When to use retries:**
- API rate limits (429 Too Many Requests)
- Temporary server errors (500, 502, 503)
- Flaky network conditions
- **Don't retry:** POST/PUT/DELETE (might execute twice!)

### Progressive Example: Building a Production-Ready API Client

Let's build a GitHub API client step-by-step, from basic to production-ready.

| Level | Features | Use Case |
|-------|----------|----------|
| 1. Basic | Simple GET request | Quick scripts, learning |
| 2. Error Handling | Timeout, try/except | More robust scripts |
| 3. Session | Connection reuse, persistent headers | Multiple API calls |
| 4. Retry Logic | Automatic retries on failures | Unreliable APIs |
| 5. Rate Limiting | Client-side throttling | Production apps, avoid bans |

**Level 1: Basic GET request**

```python
import requests

# Simplest possible - no error handling, no optimization
response = requests.get('https://api.github.com/users/octocat')
user = response.json()
print(f"{user['name']} has {user['public_repos']} public repos")
```

**Problems:**
- No error handling (fails on network issues, 404, etc.)
- No timeout (hangs forever if server doesn't respond)
- Creates new connection for each request (slow for multiple calls)

---

**Level 2: Add error handling and timeout**

```python
import requests

def get_github_user(username):
    """Fetch GitHub user with basic error handling"""
    try:
        response = requests.get(
            f'https://api.github.com/users/{username}',
            timeout=5  # Don't wait forever
        )
        response.raise_for_status()  # Raise exception for 4xx/5xx
        return response.json()

    except requests.Timeout:
        print(f"Request timed out after 5 seconds")
    except requests.HTTPError as e:
        if e.response.status_code == 404:
            print(f"User '{username}' not found")
        else:
            print(f"HTTP error: {e.response.status_code}")
    except requests.RequestException as e:
        print(f"Request failed: {e}")

    return None

# Usage
user = get_github_user('octocat')
if user:
    print(f"{user['name']} has {user['public_repos']} repos")
```

**Better!** But still inefficient for multiple requests.

---

**Level 3: Use Session for multiple requests**

```python
import requests

class GitHubClient:
    """GitHub API client using Session for efficiency"""

    def __init__(self, token=None):
        self.session = requests.Session()
        self.base_url = 'https://api.github.com'

        # Set default headers (persists across all requests)
        if token:
            self.session.headers.update({'Authorization': f'token {token}'})

    def get_user(self, username):
        """Get user info"""
        try:
            response = self.session.get(
                f'{self.base_url}/users/{username}',
                timeout=5
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Failed to get user: {e}")
            return None

    def get_user_repos(self, username):
        """Get user's repositories"""
        try:
            response = self.session.get(
                f'{self.base_url}/users/{username}/repos',
                timeout=5
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Failed to get repos: {e}")
            return None

    def close(self):
        self.session.close()

# Usage - session reuses connection across all requests (faster!)
client = GitHubClient(token='your_token_here')
user = client.get_user('octocat')
repos = client.get_user_repos('octocat')
client.close()

if user and repos:
    print(f"{user['name']} has {len(repos)} repos")
```

**Better!** Connection reuse makes it faster. But what if the API is flaky?

---

**Level 4: Add retry logic for resilience**

```python
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

class GitHubClient:
    """GitHub API client with automatic retries"""

    def __init__(self, token=None):
        self.session = requests.Session()
        self.base_url = 'https://api.github.com'

        # Configure retry strategy
        retry_strategy = Retry(
            total=3,                                    # Retry up to 3 times
            backoff_factor=1,                           # Wait 1s, 2s, 4s
            status_forcelist=[429, 500, 502, 503, 504], # Retry on these errors
            allowed_methods=["HEAD", "GET", "OPTIONS"]  # Only safe methods
        )

        # Attach retry logic to session
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)

        # Set default headers
        if token:
            self.session.headers.update({'Authorization': f'token {token}'})

    def get_user(self, username):
        """Get user info with automatic retries"""
        try:
            response = self.session.get(
                f'{self.base_url}/users/{username}',
                timeout=5
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Failed to get user after retries: {e}")
            return None

    def get_user_repos(self, username):
        """Get user's repositories with automatic retries"""
        try:
            response = self.session.get(
                f'{self.base_url}/users/{username}/repos',
                timeout=5
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Failed to get repos after retries: {e}")
            return None

    def close(self):
        self.session.close()

# Usage - now automatically retries on 500 errors or rate limits!
client = GitHubClient(token='your_token_here')
user = client.get_user('octocat')
repos = client.get_user_repos('octocat')
client.close()
```

**Even better!** Automatically retries on transient failures.

---

**Level 5: Add rate limiting (production-ready)**

```python
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from ratelimit import limits, sleep_and_retry
import time

class GitHubClient:
    """Production-ready GitHub API client"""

    # GitHub allows 60 requests/hour without auth, 5000/hour with auth
    CALLS_PER_HOUR = 5000

    def __init__(self, token=None):
        self.session = requests.Session()
        self.base_url = 'https://api.github.com'

        # Configure retry strategy
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["HEAD", "GET", "OPTIONS"]
        )

        # Attach retry logic
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)

        # Set headers
        if token:
            self.session.headers.update({'Authorization': f'token {token}'})

    @sleep_and_retry
    @limits(calls=CALLS_PER_HOUR, period=3600)
    def _rate_limited_request(self, method, url, **kwargs):
        """Make rate-limited request"""
        kwargs.setdefault('timeout', 10)
        response = self.session.request(method, url, **kwargs)
        response.raise_for_status()
        return response.json()

    def get_user(self, username):
        """Get user info (rate-limited)"""
        try:
            return self._rate_limited_request(
                'GET',
                f'{self.base_url}/users/{username}'
            )
        except requests.RequestException as e:
            print(f"Failed to get user: {e}")
            return None

    def get_user_repos(self, username):
        """Get user's repositories (rate-limited)"""
        try:
            return self._rate_limited_request(
                'GET',
                f'{self.base_url}/users/{username}/repos'
            )
        except requests.RequestException as e:
            print(f"Failed to get repos: {e}")
            return None

    def search_repos(self, query, limit=10):
        """Search repositories (rate-limited)"""
        try:
            data = self._rate_limited_request(
                'GET',
                f'{self.base_url}/search/repositories',
                params={'q': query, 'per_page': limit}
            )
            return data['items']
        except requests.RequestException as e:
            print(f"Failed to search repos: {e}")
            return []

    def __enter__(self):
        """Context manager support"""
        return self

    def __exit__(self, *args):
        """Auto-close session"""
        self.session.close()

# Usage - production-ready with all best practices!
with GitHubClient(token='your_token_here') as client:
    # Get user info
    user = client.get_user('octocat')
    if user:
        print(f"{user['name']} ({user['login']})")
        print(f"Public repos: {user['public_repos']}")

    # Get repositories
    repos = client.get_user_repos('octocat')
    if repos:
        print(f"\nTop 5 repos:")
        for repo in repos[:5]:
            print(f"  - {repo['name']}: {repo['description']}")

    # Search for popular Python repos
    python_repos = client.search_repos('language:python stars:>10000')
    print(f"\nPopular Python repos:")
    for repo in python_repos[:5]:
        print(f"  - {repo['name']}: {repo['stargazers_count']} stars")
```

## Database Basics (sqlite3)

SQLite is Python's built-in database - no server, no config, just a file. Perfect for local storage, prototypes, small-to-medium apps, or anywhere you need SQL without the overhead of PostgreSQL/MySQL.

> **Note:** SQLite is included in Python's standard library - no installation needed!

### Mental Model: Connection → Cursor → Execute → Commit

```
import sqlite3
    ↓
Connection (to database file)
    ↓
Cursor (executes SQL commands)
    ↓
Execute SQL (SELECT, INSERT, UPDATE, DELETE)
    ↓
Commit (save changes) or Rollback (undo)
    ↓
Close connection
```

**Key concepts:**
- **Connection**: The database file (or `:memory:` for temporary DB)
- **Cursor**: Your "pointer" for executing SQL
- **Transactions**: Changes aren't saved until you `commit()`
- **Parameterization**: Use `?` placeholders to prevent SQL injection

### Getting Started

```python
import sqlite3

# Connect to database file (creates if doesn't exist)
conn = sqlite3.connect('myapp.db')
cursor = conn.cursor()

# In-memory database (great for testing - disappears when program exits)
conn = sqlite3.connect(':memory:')

# Always close when done
conn.close()

# Better: Use context manager (auto-commits/rollbacks)
with sqlite3.connect('myapp.db') as conn:
    cursor = conn.cursor()
    # Do work...
    # Auto-commits on success, rollback on exception
# Still need to close connection manually
conn.close()
```

### Creating Tables

```python
import sqlite3

conn = sqlite3.connect('myapp.db')
cursor = conn.cursor()

# Create table with constraints
cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,  -- Auto-incrementing ID
        username TEXT NOT NULL UNIQUE,         -- Required, unique
        email TEXT NOT NULL,
        age INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
''')

# Multiple tables with relationships
cursor.execute('''
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
''')

conn.commit()  # Save changes
conn.close()
```

**Common data types:**
- `INTEGER` - Whole numbers (can be 1, 2, 4, 6, or 8 bytes)
- `TEXT` - Strings
- `REAL` - Floating-point numbers
- `BLOB` - Binary data
- `NULL` - Missing value

### Inserting Data

```python
import sqlite3

conn = sqlite3.connect('myapp.db')
cursor = conn.cursor()

# Single insert with parameterized query (ALWAYS use ? placeholders!)
cursor.execute(
    "INSERT INTO users (username, email, age) VALUES (?, ?, ?)",
    ("alice", "alice@example.com", 30)
)
conn.commit()

# Get the ID of the last inserted row
user_id = cursor.lastrowid
print(f"Created user with ID: {user_id}")

# Multiple inserts (much faster than individual executes)
users = [
    ("bob", "bob@example.com", 25),
    ("charlie", "charlie@example.com", 35),
    ("diana", "diana@example.com", 28)
]
cursor.executemany(
    "INSERT INTO users (username, email, age) VALUES (?, ?, ?)",
    users
)
conn.commit()

print(f"Inserted {cursor.rowcount} users")

conn.close()
```

**Why use `?` placeholders?**

```python
# BAD - SQL injection vulnerability!
username = "alice'; DROP TABLE users; --"
cursor.execute(f"SELECT * FROM users WHERE username = '{username}'")
# This could delete your entire table!

# GOOD - Parameters are escaped automatically
cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
# Treated as literal string, safe from injection
```

### Querying Data

```python
import sqlite3

conn = sqlite3.connect('myapp.db')
cursor = conn.cursor()

# Fetch all rows
cursor.execute("SELECT * FROM users")
rows = cursor.fetchall()
for row in rows:
    print(row)  # Tuple: (1, 'alice', 'alice@example.com', 30, '2025-01-15...')

# Fetch one row
cursor.execute("SELECT * FROM users WHERE id = ?", (1,))
user = cursor.fetchone()
print(user)  # (1, 'alice', 'alice@example.com', 30, ...)

# Fetch specific number of rows
cursor.execute("SELECT * FROM users")
first_five = cursor.fetchmany(5)

# Iterate without loading all into memory (good for large results)
cursor.execute("SELECT * FROM users")
for row in cursor:
    print(row)

# Parameterized queries (multiple parameters)
cursor.execute(
    "SELECT * FROM users WHERE age > ? AND email LIKE ?",
    (25, "%@example.com")
)

conn.close()
```

### Dictionary-like Access (Row Factory)

By default, rows are tuples. Use `Row` factory for dict-like access:

```python
import sqlite3

conn = sqlite3.connect('myapp.db')
conn.row_factory = sqlite3.Row  # Enable dict-like access
cursor = conn.cursor()

cursor.execute("SELECT * FROM users WHERE id = ?", (1,))
user = cursor.fetchone()

# Access by column name (much clearer!)
print(user['username'])     # 'alice'
print(user['email'])        # 'alice@example.com'
print(user['age'])          # 30

# Also works as tuple
print(user[0])              # 1 (id)

# Get column names
print(user.keys())          # ['id', 'username', 'email', 'age', 'created_at']

# Convert to dict
user_dict = dict(user)
print(user_dict)

conn.close()
```

### Updating and Deleting

```python
import sqlite3

conn = sqlite3.connect('myapp.db')
cursor = conn.cursor()

# Update single record
cursor.execute(
    "UPDATE users SET age = ? WHERE username = ?",
    (31, "alice")
)
conn.commit()
print(f"Updated {cursor.rowcount} rows")

# Update multiple records
cursor.execute(
    "UPDATE users SET email = 'noemail@example.com' WHERE age < ?",
    (18,)
)
conn.commit()

# Delete records
cursor.execute("DELETE FROM users WHERE age < ?", (18,))
conn.commit()
print(f"Deleted {cursor.rowcount} users")

# Delete all (be careful!)
cursor.execute("DELETE FROM users")
conn.commit()

conn.close()
```

### Transactions and Error Handling

```python
import sqlite3

conn = sqlite3.connect('myapp.db')
cursor = conn.cursor()

try:
    # Start transaction (implicit)
    cursor.execute("INSERT INTO users (username, email, age) VALUES (?, ?, ?)",
                   ("eve", "eve@example.com", 27))
    cursor.execute("INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)",
                   (cursor.lastrowid, "First Post", "Hello world!"))

    conn.commit()  # Save both inserts
    print("Transaction successful")

except sqlite3.IntegrityError as e:
    # Unique constraint violation, foreign key error, etc.
    print(f"Database constraint violated: {e}")
    conn.rollback()  # Undo all changes in transaction

except sqlite3.Error as e:
    # Other database errors
    print(f"Database error: {e}")
    conn.rollback()

finally:
    conn.close()
```

### Advanced Queries

```python
import sqlite3

conn = sqlite3.connect('myapp.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# Joins
cursor.execute('''
    SELECT users.username, posts.title, posts.created_at
    FROM posts
    JOIN users ON posts.user_id = users.id
    WHERE users.age > ?
    ORDER BY posts.created_at DESC
''', (25,))

for row in cursor:
    print(f"{row['username']}: {row['title']}")

# Aggregation
cursor.execute('''
    SELECT users.username, COUNT(posts.id) as post_count
    FROM users
    LEFT JOIN posts ON users.id = posts.user_id
    GROUP BY users.id
    HAVING post_count > 0
''')

for row in cursor:
    print(f"{row['username']} has {row['post_count']} posts")

# Subqueries
cursor.execute('''
    SELECT username, age
    FROM users
    WHERE age > (SELECT AVG(age) FROM users)
''')

conn.close()
```

### Practical Example: Task Manager

```python
import sqlite3
from datetime import datetime

class TaskManager:
    """Simple task manager using SQLite"""

    def __init__(self, db_file='tasks.db'):
        self.conn = sqlite3.connect(db_file)
        self.conn.row_factory = sqlite3.Row
        self.cursor = self.conn.cursor()
        self._create_tables()

    def _create_tables(self):
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'pending',
                priority INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP
            )
        ''')
        self.conn.commit()

    def add_task(self, title, description=None, priority=0):
        """Add a new task"""
        self.cursor.execute(
            "INSERT INTO tasks (title, description, priority) VALUES (?, ?, ?)",
            (title, description, priority)
        )
        self.conn.commit()
        return self.cursor.lastrowid

    def get_tasks(self, status=None):
        """Get all tasks, optionally filtered by status"""
        if status:
            self.cursor.execute(
                "SELECT * FROM tasks WHERE status = ? ORDER BY priority DESC, created_at",
                (status,)
            )
        else:
            self.cursor.execute("SELECT * FROM tasks ORDER BY priority DESC, created_at")
        return self.cursor.fetchall()

    def complete_task(self, task_id):
        """Mark a task as completed"""
        now = datetime.now().isoformat()
        self.cursor.execute(
            "UPDATE tasks SET status = 'completed', completed_at = ? WHERE id = ?",
            (now, task_id)
        )
        self.conn.commit()
        return self.cursor.rowcount > 0

    def delete_task(self, task_id):
        """Delete a task"""
        self.cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        self.conn.commit()
        return self.cursor.rowcount > 0

    def get_stats(self):
        """Get task statistics"""
        self.cursor.execute('''
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
            FROM tasks
        ''')
        return dict(self.cursor.fetchone())

    def close(self):
        self.conn.close()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()

# Usage
with TaskManager() as tm:
    # Add tasks
    tm.add_task("Write documentation", "Complete Python guide", priority=2)
    tm.add_task("Fix bug #123", priority=3)
    tm.add_task("Review PRs", priority=1)

    # Get pending tasks
    print("Pending tasks:")
    for task in tm.get_tasks('pending'):
        print(f"  [{task['priority']}] {task['title']}")

    # Complete a task
    tm.complete_task(1)

    # Get stats
    stats = tm.get_stats()
    print(f"\nStats: {stats['completed']}/{stats['total']} completed")
```

### Tips and Best Practices

**1. Always use parameterized queries**
```python
# NEVER do this (SQL injection risk):
cursor.execute(f"SELECT * FROM users WHERE name = '{user_input}'")

# ALWAYS do this:
cursor.execute("SELECT * FROM users WHERE name = ?", (user_input,))
```

**2. Use context managers for transactions**
```python
with sqlite3.connect('db.db') as conn:
    cursor = conn.cursor()
    cursor.execute("INSERT INTO ...")
    # Auto-commits on success, rollback on exception
conn.close()  # Still need to close manually
```

**3. Use `Row` factory for readable code**
```python
conn.row_factory = sqlite3.Row  # Do this once after connecting
# Now you can use row['column_name'] instead of row[0]
```

**4. Batch inserts with executemany()**
```python
# Slow - 1000 individual transactions
for item in items:
    cursor.execute("INSERT INTO ...", (item,))
    conn.commit()

# Fast - 1 transaction for all inserts
cursor.executemany("INSERT INTO ...", items)
conn.commit()
```

**5. Use `:memory:` for testing**
```python
# Tests run in memory - fast and clean
def test_my_function():
    conn = sqlite3.connect(':memory:')
    # Setup tables, run tests, no file cleanup needed
```

## Practice Exercises

### CSV
1. Read CSV, filter rows, write filtered data to new CSV
2. Merge multiple CSV files
3. Convert CSV to JSON

### JSON
1. Parse nested JSON API response
2. Extract specific fields from large JSON file
3. Transform JSON structure (e.g., list to dict)

### XML/HTML
1. Parse RSS feed and extract article titles
2. Scrape webpage and extract all links
3. Convert XML to JSON

### APIs
1. Call weather API and display current temperature
2. Implement pagination for API with multiple pages
3. Build retry logic for unreliable API

### Database
1. Create task manager with SQLite (CRUD operations)
2. Import CSV data into database
3. Generate reports by querying database
