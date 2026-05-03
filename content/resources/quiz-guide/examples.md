---
title: "Examples"
description: "Complete quiz example with all 9 question types"
weight: 3
---

{{< quiz id="python-complete-quiz" >}}
{
  "title": "Python Complete Quiz",
  "description": "A compact example that exercises every supported question type.",
  "questions": [
    {
      "id": "python-complete-01",
      "type": "mcq",
      "question": "What is the output of `print(type([]))`?",
      "options": [
        "`<class 'list'>`",
        "`<class 'dict'>`",
        "`<class 'tuple'>`",
        "`<class 'set'>`"
      ],
      "answer": 0,
      "explanation": "The `[]` syntax creates a list in Python, so `type([])` returns `<class 'list'>`.",
      "hint": "Think about what the square brackets represent in Python."
    },
    {
      "id": "python-complete-02",
      "type": "multiple-select",
      "question": "Which of the following are mutable data types in Python?",
      "options": [
        "List",
        "Tuple",
        "Dictionary",
        "String",
        "Set"
      ],
      "answers": [0, 2, 4],
      "explanation": "Lists, dictionaries, and sets are mutable in Python. Tuples and strings are immutable.",
      "hint": "Mutable means you can change the value after creation."
    },
    {
      "id": "python-complete-03",
      "type": "true-false",
      "question": "Python uses zero-based indexing for sequences.",
      "answer": true,
      "explanation": "Python uses zero-based indexing, meaning the first element is at index 0.",
      "hint": "What index do you use to access the first element?"
    },
    {
      "id": "python-complete-04",
      "type": "fill-blank",
      "question": "What keyword is used to create a function in Python?",
      "answer": "def",
      "caseSensitive": false,
      "explanation": "The `def` keyword is used to define functions in Python.",
      "hint": "It's a three-letter keyword."
    },
    {
      "id": "python-complete-05",
      "type": "code-output",
      "question": "Predict the output:",
      "code": "x = [1, 2, 3]\ny = x\ny.append(4)\nprint(len(x))",
      "language": "python",
      "options": [
        "3",
        "4",
        "Error",
        "None"
      ],
      "answer": 1,
      "explanation": "Since `y = x` creates a reference (not a copy), both `x` and `y` point to the same list. When we append 4 to `y`, it also affects `x`.",
      "hint": "Think about whether y is a copy or a reference to x."
    },
    {
      "id": "python-complete-06",
      "type": "flashcard",
      "question": "What does DRY stand for?",
      "answer": "**Don't Repeat Yourself**\n\nA principle that encourages code reusability and avoiding duplication."
    },
    {
      "id": "python-complete-07",
      "type": "drag-drop",
      "question": "Arrange these steps in the correct order for exception handling:",
      "instruction": "Drag to arrange in the correct order",
      "items": [
        "try block",
        "except block",
        "else block",
        "finally block"
      ],
      "correctOrder": [0, 1, 2, 3],
      "explanation": "The correct order is: try, except, else, finally."
    },
    {
      "id": "python-complete-08",
      "type": "code-completion",
      "question": "Complete the code to open a file:",
      "instruction": "Fill in the missing keyword",
      "codeTemplate": "_____ open('file.txt', 'r') as f:\n    content = f.read()",
      "answer": "with",
      "caseSensitive": false,
      "acceptedAnswers": ["with"],
      "explanation": "The `with` statement is used for context management, ensuring the file is properly closed."
    },
    {
      "id": "python-complete-09",
      "type": "ordered-recall",
      "question": "List Python's LEGB scope resolution order (4 scopes, outermost last)",
      "steps": [
        {"answer": "Local", "acceptedAnswers": ["Local", "local"]},
        {"answer": "Enclosing", "acceptedAnswers": ["Enclosing", "enclosing"]},
        {"answer": "Global", "acceptedAnswers": ["Global", "global"]},
        {"answer": "Built-in", "acceptedAnswers": ["Built-in", "built-in"]}
      ],
      "caseSensitive": false,
      "explanation": "Python resolves variable names using LEGB: **Local** (inside the current function) → **Enclosing** (enclosing function scopes, for closures) → **Global** (module level) → **Built-in** (Python's built-in names like `len`, `print`).",
      "hint": "Think of the acronym: L-E-G-B"
    }
  ]
}
{{< /quiz >}}

## How This Works

This quiz demonstrates:

1. **MCQ** - Single correct answer from multiple options
2. **Multiple Select** - Multiple correct answers
3. **True/False** - Binary questions
4. **Fill in the Blank** - Text input questions
5. **Code Output** - Predict what code will output
6. **Flashcards** - Self-assessment Q&A cards
7. **Drag & Drop** - Arrange items in correct order
8. **Code Completion** - Fill in missing code
9. **Ordered Recall** - Type each step from memory in sequence

After each question, click **Submit Answer** to lock the response and show feedback. Correct answers show the **Hard / Good / Easy** confidence selector, which controls when the question appears in Daily Review.

The final results panel shows score, accuracy, right, wrong, and skipped counts. The wrong count can be clicked to copy the missed question numbers.

You can create quizzes like this in any markdown file using the `quiz` shortcode!
