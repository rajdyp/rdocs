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
      "id": "my-quiz-01",
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

### Top-Level Fields

```json
{
  "title": "Quiz Title",
  "description": "Optional description",
  "questions": [
    {
      "id": "example-01",
      "type": "mcq",
      "question": "Question text",
      "options": ["A", "B"],
      "answer": 0
    }
  ]
}
```

Only `questions` is required at the top level. `title` defaults to `Quiz`, and `description` is optional.

### Question Object

Every question must have:
- `id` - Stable question identifier for performance tracking and review queues
- `type` - Question type (mcq, multiple-select, true-false, etc.)
- `question` - The question text (supports markdown)

Optional fields:
- `explanation` - Shown after submission
- `hint` - Toggleable hint for the user

Type-specific fields vary (see [Question Types](question-types) reference).

## User Flow

Quizzes are answered one question at a time.

1. The user answers the visible question and clicks **Submit Answer**.
2. The question locks, feedback appears, and the result is stored.
3. Correct answers show a confidence selector: **Hard**, **Good**, or **Easy**.
4. The user moves with **Previous** and **Next**. On the last visible question, **Next** changes to **View Results**.
5. Results show score, accuracy, right, wrong, and skipped counts.

Skipped questions are not counted in the accuracy percentage. Accuracy is calculated from answered questions only.

## Performance Tracking

The quiz system automatically tracks your performance on each question across sessions using browser localStorage.

### What's Tracked

For each question, the system records:
- **Attempts**: Total number of times you've answered the question
- **Correct/Incorrect**: Count of right and wrong answers
- **Streak**: Current correct/incorrect streak
- **Last Result**: Whether your last attempt was correct or incorrect
- **Last Attempt**: Timestamp of your most recent attempt
- **Quiz Metadata**: Quiz path, title, topic, and question index
- **Review Scheduling**: `intervalDays`, `nextReviewAt`, and review lane
- **Confidence Rating**: `hard`, `good`, or `easy` for correct answers

### Weak Question Detection

Questions are automatically highlighted with an amber left border if:
- You've attempted them at least 2 times, AND
- Your accuracy is below 50%, OR
- You have a negative streak of 2+ (missed it twice in a row)

This helps you identify topics that need more practice.

### Review Modes

#### Review Incorrect Questions
After viewing quiz results, click **Review Incorrect Questions** to practice only the questions you missed in the current attempt. This is immediate reinforcement for the current run.

#### Review Past Incorrect
Click **Review Past Incorrect** in the progress bar to practice unresolved questions from previous full attempts. The button shows the count and is disabled if there is no unresolved error pool.

When in review mode, click **Show All Questions** to return to the full quiz.

#### Daily Review
The Daily Review page at `/quiz/review/` builds a mixed review from:

- Overdue errors: unresolved questions from prior full attempts
- Weak questions: questions with low accuracy or repeated misses
- Maintenance: previously correct questions whose `nextReviewAt` date is due

Daily Review fetches quiz pages from the quiz registry, clones due question markup, labels the source quiz, and reuses the normal quiz runtime. Correct answers remove questions from the unresolved pool; incorrect answers keep them there.

#### Revision Index
The Revision Index at `/quiz/revision-index/` summarizes full-quiz history by topic and quiz. It shows the last score, attempt count, error pool, Leitner-style box/status, frequency, next review date, and a summary of today's due review queue.

Only full quiz attempts increment the quiz-level attempt count. Error-only and daily review sessions update unresolved questions individually.

### Confidence Ratings

Correct answers show a confidence selector:

- **Hard**: review tomorrow
- **Good**: normal maintenance schedule
- **Easy**: longer maintenance schedule

If the user does not choose a rating, the default is **Good**. Rating a correct answer updates `nextReviewAt` immediately and disables the rating buttons for that question.

Maintenance intervals are based on the current correct streak:

| Rating | Streak 1 | Streak 2 | Streak 3 | Streak 4+ |
|--------|----------|----------|----------|-----------|
| Hard | 1 day | 1 day | 1 day | 1 day |
| Good | 3 days | 7 days | 14 days | 30 days |
| Easy | 7 days | 14 days | 30 days | 60 days |

Incorrect answers are immediately due again and enter the overdue error lane.

### Performance Data Import/Export

The Quiz Center includes a Performance Data panel. **Export** downloads a JSON file containing question stats and quiz sessions. **Import** merges a compatible export into localStorage, updating matching question IDs and merging quiz session data.

### Question IDs for Stable Tracking

For consistent performance tracking across quiz updates, assign explicit IDs to questions:

```json
{
  "id": "python-basics-01",
  "type": "mcq",
  "question": "What is Python?",
  "options": ["A snake", "A language", "A framework"],
  "answer": 1
}
```

Without explicit IDs, the system uses `quizId-index` as a fallback, which can shift if you reorder questions.

## Results and Error Lists

Results include:

- Score fraction: correct / visible questions
- Accuracy: correct / answered questions
- Right, wrong, and skipped counts
- A copyable wrong-count button that copies a list such as `Q2, Q5`

The copied wrong list uses question numbers from the original quiz order, which is useful when quickly fixing or reviewing missed items.

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
