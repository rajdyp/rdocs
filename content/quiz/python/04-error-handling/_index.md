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
        "The else block executes before the except block",
        "A syntax error occurs"
      ],
      "answer": 1,
      "explanation": "The else clause only executes if **no exception** occurs in the try block. If an exception is caught by except, the else block is skipped.",
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
        "Cleaning up temporary resources"
      ],
      "answers": [0, 1, 3, 4],
      "explanation": "The finally block is for cleanup and actions that must always run. Handling exceptions is done in except blocks, not finally. All other options represent valid cleanup scenarios.",
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
        "They are unrelated",
        "ZeroDivisionError inherits from ArithmeticError, which inherits from Exception",
        "Exception inherits from ZeroDivisionError",
        "Both inherit directly from BaseException"
      ],
      "answer": 1,
      "explanation": "ZeroDivisionError → ArithmeticError → Exception → BaseException. This hierarchy allows catching specific or general exceptions.",
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
        "Python doesn't allow catching Exception",
        "It uses less memory"
      ],
      "answer": 1,
      "explanation": "Catching specific exceptions lets you handle known errors appropriately while allowing unexpected errors to surface. Broad catches can hide bugs and make debugging difficult.",
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
        "To suppress the exception",
        "To convert the exception to a warning"
      ],
      "answer": 1,
      "explanation": "Using `raise` alone re-raises the current exception with its original traceback intact, preserving debugging information. This is useful after logging or cleanup.",
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
        "`from e` causes a syntax error"
      ],
      "answer": 1,
      "explanation": "Use `from e` to chain exceptions and preserve the original error for debugging. Use `from None` when the original exception is irrelevant or would confuse users.",
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
      "answer": "**\"If I do X, must I always undo/cleanup Y — no matter what?\"**\n\nIf yes, create a context manager. The core pattern is **pairing setup with teardown operations that must always run together** — even if an exception occurs.\n\n**Common scenarios:**\n- Temporary state changes (then restore)\n- Resource acquisition/release (files, connections, locks)\n- Transaction-like operations (commit/rollback)\n- Timing/monitoring (start/end)\n- Testing utilities (setup/cleanup)"
    },
    {
      "id": "python-error-handling-quiz-18",
      "type": "mcq",
      "question": "Which approach is better for handling file operations and why?",
      "options": [
        "Manual try/finally because it's more explicit",
        "Context manager (with statement) because it handles cleanup automatically",
        "No error handling needed for file operations",
        "Only use except blocks without finally"
      ],
      "answer": 1,
      "explanation": "Context managers (`with open(...)`) automatically handle cleanup even if exceptions occur, making code cleaner and less error-prone than manual try/finally blocks.",
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
        "The value returned by the with statement",
        "Whether exceptions are propagated or suppressed",
        "Whether __enter__ is called",
        "The cleanup order"
      ],
      "answer": 1,
      "explanation": "`__exit__` returns False to propagate exceptions (default) or True to suppress them. This gives you control over exception handling in context managers.",
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
        "`redirect_stdout`",
        "`closing`"
      ],
      "answer": 1,
      "explanation": "`suppress(FileNotFoundError)` allows you to ignore specific exceptions cleanly. It's equivalent to try/except/pass but more explicit and readable.",
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
        "TypeError and ValueError are siblings in the hierarchy"
      ],
      "answers": [1, 2, 3, 4],
      "explanation": "User exceptions should inherit from Exception, not BaseException. All other statements are correct according to Python's exception hierarchy.",
      "hint": "BaseException is for system exceptions. Check the hierarchy tree in the content."
    }
  ]
}
{{< /quiz >}}

