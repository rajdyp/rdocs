---
title: "Error Handling Quiz"
linkTitle: Error Handling
type: docs
weight: 4
prev: /quiz/python/03-functions-deep-dive
next: /quiz/python/05-oop-fundamentals
---

{{< quiz id="python-error-handling-quiz" >}}
{
  "questions": [
    {
      "id": "python-error-handling-quiz-01",
      "type": "mcq",
      "question": "What happens when an exception occurs in a try block and is caught by an except block, followed by an else clause?",
      "options": [
        "The else block executes after the except block",
        "The else block does not execute",
        "The else block always executes regardless of exceptions, similar to finally",
        "The else block only executes when the exception propagates out of the try block"
      ],
      "answer": 1,
      "explanation": "The else clause only executes if **no exception** occurs in the try block. If an exception is caught by except, the else block is skipped. Option C describes `finally`, not `else`. Option D reverses the logic — unhandled (propagating) exceptions skip `else` too.",
      "hint": "Think about the purpose of the else clause - when does it run?"
    },
    {
      "id": "python-error-handling-quiz-02",
      "type": "true-false",
      "question": "The finally block executes only if an exception occurs in the try block.",
      "answer": false,
      "explanation": "The finally block **always** executes, whether an exception occurs or not. This makes it perfect for cleanup operations like closing files or releasing resources.",
      "hint": "Consider what 'finally' means in everyday language."
    },
    {
      "id": "python-error-handling-quiz-03",
      "type": "multiple-select",
      "question": "Which of the following are valid reasons to use a finally block?",
      "options": [
        "Closing file handles",
        "Releasing database connections",
        "Handling exceptions",
        "Logging completion messages",
        "Cleaning up temporary resources",
        "Preventing exceptions from propagating to the caller"
      ],
      "answers": [0, 1, 3, 4],
      "explanation": "The finally block is for cleanup and actions that must always run. Handling exceptions belongs in except blocks. Preventing exception propagation requires returning True from `__exit__` or using `contextlib.suppress` — finally does not suppress exceptions.",
      "hint": "Think about operations that must happen regardless of success or failure."
    },
    {
      "id": "python-error-handling-quiz-04",
      "type": "drag-drop",
      "question": "Arrange the exception handling blocks in their correct execution order:",
      "instruction": "Drag to arrange in the order Python executes them",
      "items": [
        "try block",
        "else block (if no exception)",
        "except block (if exception occurs)",
        "finally block"
      ],
      "correctOrder": [0, 2, 1, 3],
      "explanation": "Python executes: try → except (if exception) → else (if no exception) → finally (always). The finally block runs last, regardless of what happened before."
    },
    {
      "id": "python-error-handling-quiz-05",
      "type": "code-output",
      "question": "What gets printed when this code runs?",
      "code": "try:\n    x = 10 / 2\nexcept ZeroDivisionError:\n    print(\"Error\")\nelse:\n    print(\"Success\")\nfinally:\n    print(\"Done\")",
      "language": "python",
      "options": [
        "Error\nDone",
        "Success\nDone",
        "Done",
        "Success"
      ],
      "answer": 1,
      "explanation": "No exception occurs (10/2 is valid), so except is skipped, else executes printing 'Success', then finally always executes printing 'Done'.",
      "hint": "Trace through each block - does 10/2 raise an exception?"
    },
    {
      "id": "python-error-handling-quiz-06",
      "type": "mcq",
      "question": "In Python's exception hierarchy, what is the relationship between Exception and ZeroDivisionError?",
      "options": [
        "ZeroDivisionError inherits directly from Exception, with no intermediate class",
        "ZeroDivisionError inherits from ArithmeticError, which inherits from Exception",
        "Exception inherits from ZeroDivisionError",
        "Both inherit directly from BaseException"
      ],
      "answer": 1,
      "explanation": "ZeroDivisionError → ArithmeticError → Exception → BaseException. Option A is the almost-right trap — ZeroDivisionError *is* under Exception, but via ArithmeticError. Skipping intermediate classes matters when you want to catch all arithmetic errors at once.",
      "hint": "Look at the exception hierarchy diagram in the content."
    },
    {
      "id": "python-error-handling-quiz-07",
      "type": "fill-blank",
      "question": "To create a custom exception, you should inherit from the built-in _____ class.",
      "answer": "Exception",
      "caseSensitive": true,
      "explanation": "Custom exceptions should inherit from Exception (or its subclasses), not BaseException. This follows Python's exception hierarchy conventions.",
      "hint": "It's the most common base class for user-defined exceptions."
    },
    {
      "id": "python-error-handling-quiz-08",
      "type": "mcq",
      "question": "Why is it recommended to catch specific exceptions rather than using a broad `except Exception`?",
      "options": [
        "It makes code run faster",
        "Broad catches hide bugs, mask unexpected errors, and prevent proper recovery logic",
        "Specific catches cause Python to automatically log unhandled exceptions to stderr",
        "It uses less memory"
      ],
      "answer": 1,
      "explanation": "Catching specific exceptions lets you handle known errors appropriately while allowing unexpected errors to surface. Broad catches can silently swallow bugs, making them extremely hard to diagnose. Python does not auto-log exceptions based on specificity.",
      "hint": "Think about what happens when you catch errors you don't know how to handle."
    },
    {
      "id": "python-error-handling-quiz-09",
      "type": "code-completion",
      "question": "Complete the context manager pattern for automatic file cleanup:",
      "instruction": "Fill in the missing keyword",
      "codeTemplate": "_____ open('data.txt', 'r') as f:\n    content = f.read()\n# File automatically closed here",
      "answer": "with",
      "caseSensitive": false,
      "acceptedAnswers": ["with"],
      "explanation": "The `with` statement creates a context manager that handles setup (opening) and cleanup (closing) automatically, even if exceptions occur."
    },
    {
      "id": "python-error-handling-quiz-10",
      "type": "true-false",
      "question": "Context managers created with `@contextmanager` must contain a `yield` statement.",
      "answer": true,
      "explanation": "The `yield` statement in a `@contextmanager` function separates setup (before yield) from cleanup (after yield in finally). It's required for the decorator to work correctly.",
      "hint": "Consider what separates the setup and teardown phases."
    },
    {
      "id": "python-error-handling-quiz-11",
      "type": "mcq",
      "question": "When should you use `raise` without arguments in an except block?",
      "options": [
        "To raise a new exception",
        "To re-raise the same exception with its original traceback",
        "To suppress the exception and allow execution to continue normally",
        "To convert the exception to a different exception type"
      ],
      "answer": 1,
      "explanation": "Using `raise` alone re-raises the current exception with its original traceback intact. Option C is the key trap — bare `raise` does the opposite of suppression; it propagates the exception further up. To suppress, you'd use `pass` or `contextlib.suppress`.",
      "hint": "Think about preserving the original error information."
    },
    {
      "id": "python-error-handling-quiz-12",
      "type": "multiple-select",
      "question": "Which scenarios are appropriate for creating custom exceptions?",
      "options": [
        "Input validation errors specific to your domain",
        "Database connection failures in your app",
        "Reading a file that doesn't exist",
        "API-specific errors in your service",
        "Division by zero"
      ],
      "answers": [0, 1, 3],
      "explanation": "Create custom exceptions for domain-specific or application-specific errors. FileNotFoundError and ZeroDivisionError are already built-in exceptions.",
      "hint": "Think about errors specific to your application vs. general Python errors."
    },
    {
      "id": "python-error-handling-quiz-13",
      "type": "code-output",
      "question": "What is the output of this code?",
      "code": "try:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    print(\"A\")\nelse:\n    print(\"B\")\nfinally:\n    print(\"C\")",
      "language": "python",
      "options": [
        "A\nC",
        "B\nC",
        "A\nB\nC",
        "C"
      ],
      "answer": 0,
      "explanation": "ZeroDivisionError is caught, so except executes (prints 'A'). Since an exception occurred, else is skipped. Finally always executes (prints 'C').",
      "hint": "An exception occurred - which blocks run?"
    },
    {
      "id": "python-error-handling-quiz-14",
      "type": "mcq",
      "question": "What's the difference between `raise ConfigError('msg') from e` and `raise ConfigError('msg') from None`?",
      "options": [
        "They are identical",
        "`from e` preserves original exception for debugging; `from None` hides it",
        "`from None` preserves original exception; `from e` hides it",
        "`from e` re-raises the original exception directly instead of creating a chain"
      ],
      "answer": 1,
      "explanation": "Use `from e` to **chain** exceptions — the original error is attached and visible in tracebacks. Use `from None` to suppress the chain when the original error is an implementation detail. Option D is the key trap: `from e` does not re-raise `e`, it creates a new exception with `e` as the cause.",
      "hint": "Think about whether you want to show or hide the underlying error."
    },
    {
      "id": "python-error-handling-quiz-15",
      "type": "true-false",
      "question": "Assertions are suitable for validating user input or handling expected errors.",
      "answer": false,
      "explanation": "Assertions are for **internal checks** and programmer errors (bugs). Use exceptions for expected errors like invalid user input. Assertions can be disabled with `python -O`, making them unreliable for critical validation.",
      "hint": "Can assertions be disabled in production?"
    },
    {
      "id": "python-error-handling-quiz-16",
      "type": "fill-blank",
      "question": "When writing libraries or functions, you should _____ exceptions to signal problems. When calling that code, you should use try/except to _____ those exceptions.",
      "answer": "raise, catch",
      "caseSensitive": false,
      "acceptedAnswers": ["raise, catch", "raise catch"],
      "explanation": "Functions should **raise** exceptions when they detect invalid states (fail fast). Application code should **catch** those exceptions and decide how to handle them based on context.",
      "hint": "Think about the separation of concerns - detecting vs. handling errors."
    },
    {
      "id": "python-error-handling-quiz-17",
      "type": "flashcard",
      "question": "What is the mental model for when to create a custom context manager?",
      "answer": "**Decision trigger:** \"If I do X, must I always undo/cleanup Y — no matter what?\"\n\nIf yes, create a context manager.\n\n**Structure:** SETUP → USE → CLEANUP (guaranteed)\n\nThe core pattern is **pairing setup with teardown operations that must always run together** — even if an exception occurs.\n\n**Common scenarios:**\n- Temporary state changes (then restore)\n- Resource acquisition/release (files, connections, locks)\n- Transaction-like operations (commit/rollback)\n- Timing/monitoring (start/end)\n- Testing utilities (setup/cleanup)"
    },
    {
      "id": "python-error-handling-quiz-18",
      "type": "mcq",
      "question": "Which approach is better for handling file operations and why?",
      "options": [
        "Manual try/finally because it's more explicit",
        "Context manager (with statement) because it handles cleanup automatically",
        "No explicit cleanup needed — Python's garbage collector closes files automatically when exceptions occur",
        "Only use except blocks without finally"
      ],
      "answer": 1,
      "explanation": "Context managers (`with open(...)`) automatically handle cleanup even if exceptions occur. Option C is the key trap: Python's garbage collector may eventually close files, but it is non-deterministic and not guaranteed to run before the exception propagates — you cannot rely on it for resource safety.",
      "hint": "Think about automatic vs. manual resource management."
    },
    {
      "id": "python-error-handling-quiz-19",
      "type": "code-completion",
      "question": "Complete the custom exception class:",
      "instruction": "Fill in the missing class name",
      "codeTemplate": "class ValidationError(_____):\n    def __init__(self, field, message):\n        self.field = field\n        super().__init__(f\"{field}: {message}\")",
      "answer": "Exception",
      "caseSensitive": true,
      "acceptedAnswers": ["Exception"],
      "explanation": "Custom exceptions should inherit from `Exception` (or its subclasses). This follows Python's exception hierarchy and allows proper exception handling."
    },
    {
      "id": "python-error-handling-quiz-20",
      "type": "multiple-select",
      "question": "When should you re-raise an exception after catching it?",
      "options": [
        "You need to log the error but can't handle it",
        "You want to suppress the error completely",
        "You need cleanup logic but the error should still propagate",
        "You want to convert it to a different exception type",
        "You caught it to check the type but some cases should bubble up"
      ],
      "answers": [0, 2, 4],
      "explanation": "Re-raise when you need to log/cleanup but can't fully handle the error, or when you need to inspect but not handle certain error types. To suppress errors, use pass (carefully). To convert exceptions, use `raise NewException from e`.",
      "hint": "Re-raising means the error still propagates up the call stack."
    },
    {
      "id": "python-error-handling-quiz-21",
      "type": "mcq",
      "question": "What does the `__exit__` method return value control in a custom context manager?",
      "options": [
        "The value assigned to the `as` target variable in the with statement",
        "Whether exceptions are propagated or suppressed",
        "Whether the code inside the with block executes or is skipped",
        "Whether the context manager can be reused in a subsequent with statement"
      ],
      "answer": 1,
      "explanation": "`__exit__` returns False to propagate exceptions (default) or True to suppress them. Option A is the classic trap: the `as` variable gets the return value of `__enter__`, not `__exit__`. Option C is wrong — the with block body always runs before `__exit__` is called.",
      "hint": "Think about what happens to exceptions that occur inside the with block."
    },
    {
      "id": "python-error-handling-quiz-22",
      "type": "code-output",
      "question": "What happens when this code runs?",
      "code": "try:\n    value = int('abc')\nexcept ValueError:\n    print('Error')\nexcept TypeError:\n    print('Type Error')\nelse:\n    print('Success')",
      "language": "python",
      "options": [
        "Error",
        "Type Error",
        "Success",
        "Error\nSuccess"
      ],
      "answer": 0,
      "explanation": "`int('abc')` raises ValueError (invalid literal), which is caught by the first except block. Once an exception is caught, else is skipped and no other except blocks execute.",
      "hint": "What exception does int('abc') raise?"
    },
    {
      "id": "python-error-handling-quiz-23",
      "type": "true-false",
      "question": "You should use `except:` (bare except) instead of `except Exception:` for better error handling.",
      "answer": false,
      "explanation": "Bare `except:` catches everything including SystemExit and KeyboardInterrupt, which should usually propagate. Use `except Exception:` to avoid catching system exceptions, though catching specific exceptions is even better.",
      "hint": "What system-level exceptions should you avoid catching?"
    },
    {
      "id": "python-error-handling-quiz-24",
      "type": "flashcard",
      "question": "What is the guideline for deciding where to raise vs. where to catch exceptions?",
      "answer": "**Raise where errors occur, catch where you can handle them**\n\nFunctions/libraries should detect invalid states and raise exceptions — they shouldn't decide how to handle the error.\n\nApplication code that calls functions should catch and handle exceptions based on the context and business requirements."
    },
    {
      "id": "python-error-handling-quiz-25",
      "type": "mcq",
      "question": "Which context manager from contextlib would you use to safely delete a file that might not exist?",
      "options": [
        "`contextmanager`",
        "`suppress`",
        "`ExitStack`",
        "`closing`"
      ],
      "answer": 1,
      "explanation": "`suppress(FileNotFoundError)` allows you to ignore specific exceptions cleanly. Option C (`ExitStack`) is the likely trap — it manages multiple context managers dynamically, but does not suppress exceptions. Option D (`closing`) calls `.close()` on exit, useful for objects without native context manager support.",
      "hint": "You want to suppress a specific exception type."
    },
    {
      "id": "python-error-handling-quiz-26",
      "type": "multiple-select",
      "question": "Which statements about the exception hierarchy are correct?",
      "options": [
        "All user exceptions should inherit from BaseException",
        "ZeroDivisionError inherits from ArithmeticError",
        "KeyError and IndexError both inherit from LookupError",
        "FileNotFoundError is a type of OSError",
        "TypeError and ValueError are siblings in the hierarchy",
        "NameError and AttributeError both inherit from LookupError"
      ],
      "answers": [1, 2, 3, 4],
      "explanation": "User exceptions should inherit from Exception, not BaseException. NameError and AttributeError do **not** inherit from LookupError — LookupError only covers sequence/mapping lookups (IndexError, KeyError). NameError and AttributeError are direct subclasses of Exception.",
      "hint": "BaseException is for system exceptions. Check the hierarchy tree in the content."
    },
    {
      "id": "python-error-handling-quiz-27",
      "type": "fill-blank",
      "question": "To log an exception with its full traceback automatically, use `logging._____(message)` inside an except block.",
      "answer": "exception",
      "caseSensitive": false,
      "explanation": "`logging.exception()` logs at ERROR level and automatically appends the current exception's traceback — no extra formatting needed. `logging.error()` logs at the same level but does **not** include the traceback, so you lose the stack frames that show exactly where the error originated. Inside an except block, `logging.exception()` is almost always the right choice.",
      "hint": "The method name matches what you're handling."
    },
    {
      "id": "python-error-handling-quiz-28",
      "type": "mcq",
      "question": "When should you use `except (ValueError, TypeError):` (tuple syntax) instead of two separate except blocks?",
      "options": [
        "Always — the tuple syntax is more efficient than separate blocks",
        "When both exceptions require identical handling logic",
        "When you need to access both exceptions simultaneously via `as e`",
        "When one exception type inherits from the other"
      ],
      "answer": 1,
      "explanation": "Use tuple syntax when both exceptions warrant exactly the same response — it avoids duplicating the handler body. Use separate blocks when each error needs distinct recovery logic. Option C is the key trap: `as e` in tuple syntax captures whichever exception actually occurred — not both simultaneously. You can never access two exceptions at once in a single handler. Inheritance relationships don't determine which syntax to use.",
      "hint": "Think about what goes inside each handler body."
    },
    {
      "id": "python-error-handling-quiz-29",
      "type": "code-output",
      "question": "What does this code print?",
      "code": "try:\n    result = 10 / 0\nexcept ZeroDivisionError as e:\n    message = str(e)\n    print(message)",
      "language": "python",
      "options": [
        "division by zero",
        "ZeroDivisionError",
        "ZeroDivisionError: division by zero",
        "Error: division by zero"
      ],
      "answer": 0,
      "explanation": "`str(exception)` returns just the exception's message string — the human-readable description, not the class name. To get only the class name, use `type(e).__name__`. To get the full `ClassName: message` format you see in tracebacks, you'd need `f\"{type(e).__name__}: {e}\"`. Option C is the likely trap: that's the traceback format, not what `str()` returns.",
      "hint": "What does str() return for an exception object?"
    },
    {
      "id": "python-error-handling-quiz-30",
      "type": "true-false",
      "question": "Python requires nested `with` statements to manage multiple context managers simultaneously.",
      "answer": false,
      "explanation": "A single `with` statement can manage multiple context managers separated by commas: `with open('in.txt') as f, open('out.txt', 'w') as g:`. Context managers are entered left-to-right and exited right-to-left — exactly equivalent to nested `with` statements, but in one line. This pattern is especially useful for paired file operations.",
      "hint": "Think about how you would open two files at once."
    },
    {
      "id": "python-error-handling-quiz-31",
      "type": "mcq",
      "question": "In a class-based context manager, `__exit__` is called with `(None, None, None)` for its three parameters. What does this indicate?",
      "options": [
        "The with block raised an exception that a prior call already suppressed",
        "No exception occurred inside the with block",
        "The with block exited early via `return` or `break`",
        "`__enter__` returned None, so there is no value to clean up"
      ],
      "answer": 1,
      "explanation": "Python always calls `__exit__(exc_type, exc_val, exc_tb)`. When all three are `None`, the with block completed normally with no exception. This is the signal cleanup code uses to decide commit vs. rollback: `if exc_type is None: commit()`. Option C is the key trap — `return` or `break` inside a with block still triggers `__exit__` with `(None, None, None)`, not with special sentinel values. The parameters only carry non-None values when an exception propagated out of the block.",
      "hint": "What do the three parameters collectively represent?"
    },
    {
      "id": "python-error-handling-quiz-32",
      "type": "code-output",
      "question": "What does this code print?",
      "code": "class AppError(Exception):\n    pass\n\nclass DatabaseError(AppError):\n    pass\n\ntry:\n    raise DatabaseError(\"connection failed\")\nexcept AppError:\n    print(\"caught AppError\")\nexcept DatabaseError:\n    print(\"caught DatabaseError\")",
      "language": "python",
      "options": [
        "caught AppError",
        "caught DatabaseError",
        "caught AppError\ncaught DatabaseError",
        "Unhandled DatabaseError"
      ],
      "answer": 0,
      "explanation": "Python evaluates except clauses top-to-bottom and stops at the **first match**. Since `DatabaseError` inherits from `AppError`, the raised exception matches the first clause and the second is never reached — it is unreachable dead code. Python does not warn you about this. This is exactly why you should order except blocks from **most specific to most general**: if `except DatabaseError` appeared first, it would correctly catch `DatabaseError` while letting `except AppError` catch other subclasses.",
      "hint": "Which except clause does Python reach first, and does DatabaseError satisfy it?"
    },
    {
      "id": "python-error-handling-quiz-33",
      "type": "code-output",
      "question": "What does this code print?",
      "code": "def load_config(path):\n    try:\n        with open(path) as f:\n            return f.read()\n    except Exception:\n        pass\n\nconfig = load_config(\"missing.json\")\nprint(config is None)",
      "language": "python",
      "options": [
        "True",
        "False",
        "FileNotFoundError",
        "AttributeError"
      ],
      "answer": 0,
      "explanation": "When `open(\"missing.json\")` raises `FileNotFoundError`, the except block catches it — but `pass` does nothing, and the function exits without a `return` statement. Python implicitly returns `None`. The caller then unknowingly uses `None` as if it were a config string, likely causing an `AttributeError` or `TypeError` deep in unrelated code — making the original bug nearly impossible to trace. This is the **silent failure anti-pattern**: the error is swallowed, and debugging becomes a nightmare.",
      "hint": "What does a Python function return when execution reaches the end with no return statement?"
    },
    {
      "id": "python-error-handling-quiz-34",
      "type": "mcq",
      "question": "A function reads a 10GB file, runs a 30-second analysis, then writes results to an output path provided by the caller. If the output path is invalid, when should you detect this?",
      "options": [
        "After the analysis completes, just before the file write — to avoid unnecessary validation overhead",
        "At the start of the function, before reading or processing begins",
        "Inside a finally block, so validation always runs regardless of success or failure",
        "Only inside a try/except wrapping the file write operation"
      ],
      "answer": 1,
      "explanation": "The **fail-fast principle**: validate inputs early to surface errors before spending resources. Detecting the bad path after 30 seconds of processing wastes compute and the user's time — and they have to wait again after fixing it. Option D still catches the error but too late. Option C (finally) runs after the work is done, not before. Option A is exactly the anti-pattern this principle prevents: the \"overhead\" of early validation is microseconds vs. 30 seconds of wasted work.",
      "hint": "When should you surface an error relative to expensive work?"
    }
  ]
}
{{< /quiz >}}
