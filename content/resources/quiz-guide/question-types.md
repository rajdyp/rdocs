---
title: "Question Types"
description: "All 8 quiz question types with examples and properties"
weight: 2
---

Complete reference for all 8 quiz question types.

### 1. Multiple Choice (MCQ)

Single correct answer from multiple options.

```json
{
  "type": "mcq",
  "question": "What is 2 + 2?",
  "options": ["3", "4", "5", "6"],
  "answer": 1,
  "explanation": "2 + 2 equals 4",
  "hint": "Think about basic addition"
}
```

**Properties:**
- `options` (array): List of answer choices
- `answer` (number): Index of correct answer (0-based)
- `explanation` (string, optional): Shown after submission
- `hint` (string, optional): Hint button users can click

---

### 2. Multiple Select

Multiple correct answers (checkboxes).

```json
{
  "type": "multiple-select",
  "question": "Which are prime numbers?",
  "options": ["1", "2", "3", "4", "5"],
  "answers": [1, 2, 4],
  "explanation": "2, 3, and 5 are prime numbers",
  "hint": "Prime numbers are only divisible by 1 and themselves"
}
```

**Properties:**
- `options` (array): List of answer choices
- `answers` (array): Indices of all correct answers
- `explanation` (string, optional): Shown after submission
- `hint` (string, optional): Hint button users can click

---

### 3. True/False

Binary true or false question.

```json
{
  "type": "true-false",
  "question": "Python is case-sensitive.",
  "answer": true,
  "explanation": "Python is case-sensitive; 'Variable' and 'variable' are different",
  "hint": "Try creating two variables with different cases"
}
```

**Properties:**
- `answer` (boolean): `true` or `false`
- `explanation` (string, optional): Shown after submission
- `hint` (string, optional): Hint button users can click

---

### 4. Fill in the Blank

Text input question.

```json
{
  "type": "fill-blank",
  "question": "The keyword to define a function in Python is ___",
  "answer": "def",
  "caseSensitive": false,
  "acceptedAnswers": ["def"],
  "explanation": "The 'def' keyword defines functions in Python",
  "hint": "It's a three-letter keyword"
}
```

**Properties:**
- `answer` (string): The correct answer
- `caseSensitive` (boolean, optional): Default is `false`
- `acceptedAnswers` (array, optional): Alternative accepted answers
- `explanation` (string, optional): Shown after submission
- `hint` (string, optional): Hint button users can click

---

### 5. Code Output

Show code and ask what it outputs.

```json
{
  "type": "code-output",
  "question": "What will this code print?",
  "code": "x = [1, 2, 3]\nprint(x[1])",
  "language": "python",
  "options": ["1", "2", "3", "Error"],
  "answer": 1,
  "explanation": "Lists use zero-based indexing, so x[1] is 2",
  "hint": "Remember Python uses zero-based indexing"
}
```

**Properties:**
- `code` (string): The code to display
- `language` (string): Language for syntax highlighting (default: "python")
- `options` (array): Possible output choices
- `answer` (number): Index of correct output
- `explanation` (string, optional): Shown after submission
- `hint` (string, optional): Hint button users can click

---

### 6. Flashcard

Flip card with question on front, answer on back. Self-assessed.

```json
{
  "type": "flashcard",
  "question": "What does API stand for?",
  "answer": "**Application Programming Interface**\n\nA set of protocols for building software applications."
}
```

**Properties:**
- `question` (string): Front of the card (supports markdown)
- `answer` (string): Back of the card (supports markdown)

**Note:** Flashcards use self-assessment. Users click "Yes" or "No" to indicate if they got it right.

---

### 7. Drag and Drop

Arrange items in the correct order.

```json
{
  "type": "drag-drop",
  "question": "Order these steps in the software development lifecycle:",
  "instruction": "Drag items to arrange them in the correct order",
  "items": [
    "Planning",
    "Design",
    "Implementation",
    "Testing",
    "Deployment"
  ],
  "correctOrder": [0, 1, 2, 3, 4],
  "explanation": "The typical SDLC follows: Planning → Design → Implementation → Testing → Deployment"
}
```

**Properties:**
- `instruction` (string, optional): Instructions for the user
- `items` (array): List of items to arrange
- `correctOrder` (array): Indices representing correct order
- `explanation` (string, optional): Shown after submission

---

### 8. Code Completion

Fill in missing code.

```json
{
  "type": "code-completion",
  "question": "Complete the code:",
  "instruction": "Fill in the missing keyword to handle exceptions",
  "codeTemplate": "try:\n    risky_operation()\n_____ Exception as e:\n    print(e)",
  "answer": "except",
  "caseSensitive": false,
  "acceptedAnswers": ["except"],
  "explanation": "The 'except' keyword catches exceptions in Python",
  "hint": "Think about exception handling keywords"
}
```

**Properties:**
- `instruction` (string, optional): Instructions for the user
- `codeTemplate` (string): Code with blank (use `___` for the blank)
- `answer` (string): The correct answer
- `caseSensitive` (boolean, optional): Default is `false`
- `acceptedAnswers` (array, optional): Alternative accepted answers
- `explanation` (string, optional): Shown after submission
- `hint` (string, optional): Hint button users can click

---

## Complete Example

Here's a complete quiz with multiple question types:

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
    },
    {
      "type": "flashcard",
      "question": "What is a list comprehension?",
      "answer": "A concise way to create lists using a single line of code.\n\nExample: `[x*2 for x in range(5)]`"
    }
  ]
}
{{</* /quiz */>}}
```

## Features

### Automatic Scoring
The quiz automatically calculates and displays:
- Percentage score
- Number of correct answers
- Total questions

### Visual Feedback
- Correct answers highlighted in green
- Incorrect answers highlighted in red
- Explanations shown after submission

### Hints
Add optional hints to any question:

```json
{
  "hint": "Remember that Python uses duck typing"
}
```

Users can click a hint button to reveal the hint.

### Reset Functionality
Users can reset the quiz and try again using the "Reset Quiz" button.

### Dark Mode Support
All quiz components automatically adapt to light/dark themes.

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

### 4. Accessibility
- Write clear question text
- Provide explanations for all answers
- Use semantic question types (e.g., true/false for binary questions)

### 5. Code Questions
- Use syntax highlighting with the `language` property
- Keep code snippets short and focused
- Test your code examples to ensure they're correct

## Styling Customization

The quiz system uses CSS custom properties for easy theming. Override these in your custom CSS:

```css
.quiz-container {
  --bg-color: #ffffff;
  --border-color: #e5e7eb;
  --text-primary: #111827;
}
```

## Troubleshooting

### Quiz Not Showing
1. Check JSON syntax (use a validator)
2. Ensure the quiz shortcode is properly closed
3. Verify the quiz ID is unique

### Scoring Issues
1. Check that answer indices match your options (0-based)
2. For multiple-select, ensure `answers` is an array
3. For drag-drop, verify `correctOrder` indices match `items`

### Styling Issues
1. Clear your browser cache
2. Check that `custom.css` is loaded
3. Verify JavaScript is enabled

## Examples

See the [Complete Quiz Example](/python/log-analysis/quiz-example) for a working demonstration of all question types.
