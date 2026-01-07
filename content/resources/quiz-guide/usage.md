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

## Performance Tracking

The quiz system automatically tracks your performance on each question across sessions using browser localStorage.

### What's Tracked

For each question, the system records:
- **Attempts**: Total number of times you've answered the question
- **Correct/Incorrect**: Count of right and wrong answers
- **Streak**: Current correct/incorrect streak
- **Last Result**: Whether your last attempt was correct or incorrect
- **Last Attempt**: Timestamp of your most recent attempt

### Weak Question Detection

Questions are automatically highlighted with an amber left border if:
- You've attempted them at least 2 times, AND
- Your accuracy is below 50%, OR
- You have a negative streak of 2+ (missed it twice in a row)

This helps you identify topics that need more practice.

### Review Modes

#### Review Incorrect Questions
After viewing quiz results, click **"Review Incorrect Questions"** to practice only the questions you missed in the current attempt. This is perfect for immediate reinforcement.

#### Review Past Incorrect
Click **"Review Past Incorrect"** in the progress bar to practice questions you've struggled with historically across all sessions. The button shows the count of historically incorrect questions and is disabled if none exist.

When in review mode, click **"Show All Questions"** to return to the full quiz.

### Question IDs for Stable Tracking

For consistent performance tracking across quiz updates, assign explicit IDs to questions:

```json
{
  "id": "python-basics-01",
  "type": "mcq",
  "question": "What is Python?",
  "options": ["A snake", "A language", "A framework"],
  "correct": 1
}
```

Without explicit IDs, the system uses `quizId-index` as a fallback, which can shift if you reorder questions.

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

### 1. Use Explicit Question IDs
- **Always** assign explicit IDs to questions for stable performance tracking
- Use descriptive IDs: `"python-basics-01"`, not generic ones
- Never change IDs after publishing (or tracking data will be lost)

### 2. Question Design
- Keep questions clear and concise
- Provide meaningful explanations
- Use hints for learning, not just giving away answers

### 3. Answer Options
- Make distractors (wrong answers) plausible
- Avoid "all of the above" or "none of the above" when possible
- Keep option lengths similar

### 4. Quiz Length
- 5-10 questions per quiz is ideal
- For longer content, split into multiple quizzes
- Place quizzes after relevant content sections

### 5. Code Questions
- Use syntax highlighting with the `language` property
- Keep code snippets short and focused
- Test your code examples to ensure they're correct

### 6. Accessibility
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
      "id": "python-basics-01",
      "type": "mcq",
      "question": "Which of these is NOT a Python data type?",
      "options": ["int", "float", "char", "str"],
      "answer": 2,
      "explanation": "Python doesn't have a 'char' type; use strings instead",
      "hint": "Think about single character types"
    },
    {
      "id": "python-basics-02",
      "type": "true-false",
      "question": "Lists in Python are immutable.",
      "answer": false,
      "explanation": "Lists are mutable; you can modify them after creation"
    },
    {
      "id": "python-basics-03",
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
