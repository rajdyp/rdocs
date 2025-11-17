---
title: "Usage Guide"
description: "How to create and use quizzes"
weight: 1
---

Learn how to create interactive quizzes in your Hugo documentation.

## Basic Usage

Add a quiz to any markdown file using the `quiz` shortcode:

```markdown
{{</* quiz id="my-quiz" */>}}
{
  "title": "My Quiz Title",
  "description": "Optional description",
  "questions": [
    {
      "type": "mcq",
      "question": "What is 2 + 2?",
      "options": ["3", "4", "5"],
      "answer": 1,
      "explanation": "2 + 2 = 4"
    }
  ]
}
{{</* /quiz */>}}
```

## Quiz Structure

### Required Fields

```json
{
  "title": "Quiz Title",        // Quiz title (optional, defaults to "Quiz")
  "description": "...",          // Quiz description (optional)
  "questions": [                 // Array of question objects
    // Question objects here
  ]
}
```

### Question Object

Every question must have:
- `type` - Question type (mcq, multiple-select, true-false, etc.)
- `question` - The question text (supports markdown)

Optional fields:
- `explanation` - Shown after submission
- `hint` - Toggleable hint for the user

Type-specific fields vary (see [Question Types](question-types) reference).

## Features

### Hints

Add optional hints to any question:

```json
{
  "type": "mcq",
  "question": "What is Python?",
  "options": ["A snake", "A programming language", "A framework"],
  "answer": 1,
  "hint": "Think about programming languages"
}
```

Users can click the "Show Hint" button to reveal it.

### Explanations

Provide explanations shown after submission:

```json
{
  "type": "true-false",
  "question": "Python is case-sensitive.",
  "answer": true,
  "explanation": "Python is case-sensitive; 'Variable' and 'variable' are different identifiers."
}
```

Explanations support **markdown** formatting.

### Markdown Support

Question text and explanations support markdown:

```json
{
  "question": "What does `len()` return for `len('Hello')`?",
  "explanation": "The `len()` function returns the **number of characters** in a string."
}
```

## Best Practices

### 1. Question Design
- Keep questions clear and concise
- Provide meaningful explanations
- Use hints for learning, not just giving away answers

### 2. Answer Options
- Make distractors (wrong answers) plausible
- Avoid "all of the above" or "none of the above" when possible
- Keep option lengths similar

### 3. Quiz Length
- 5-10 questions per quiz is ideal
- For longer content, split into multiple quizzes
- Place quizzes after relevant content sections

### 4. Code Questions
- Use syntax highlighting with the `language` property
- Keep code snippets short and focused
- Test your code examples to ensure they're correct

### 5. Accessibility
- Write clear question text
- Provide explanations for all answers
- Use semantic question types (e.g., true/false for binary questions)

## Complete Example

Here's a well-structured quiz:

```markdown
{{</* quiz id="python-basics" */>}}
{
  "title": "Python Basics Quiz",
  "description": "Test your understanding of Python fundamentals",
  "questions": [
    {
      "type": "mcq",
      "question": "Which of these is NOT a Python data type?",
      "options": ["int", "float", "char", "str"],
      "answer": 2,
      "explanation": "Python doesn't have a 'char' type; use strings instead",
      "hint": "Think about single character types"
    },
    {
      "type": "true-false",
      "question": "Lists in Python are immutable.",
      "answer": false,
      "explanation": "Lists are mutable; you can modify them after creation"
    },
    {
      "type": "fill-blank",
      "question": "The keyword to create a loop in Python is ___",
      "answer": "for",
      "acceptedAnswers": ["for", "while"],
      "explanation": "Both 'for' and 'while' create loops in Python"
    }
  ]
}
{{</* /quiz */>}}
```

## Next Steps

- Review [Question Types](question-types) for all available question types
- See [Examples](examples) for a complete demo
- Check [Troubleshooting](troubleshooting) if you encounter issues
