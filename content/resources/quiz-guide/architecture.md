---
title: "Architecture"
description: "Technical details and file structure"
weight: 4
---

Technical documentation of the quiz system implementation.

## File Structure

### Templates & Partials

```
layouts/
├── shortcodes/
│   ├── quiz.html                      # Hugo shortcode entry point
│   ├── daily-review.html              # Mixed due-question review page
│   ├── revision-index.html            # Quiz progress dashboard
│   ├── quiz-tools-bar.html            # Quiz Center toolbar
│   └── quiz-data-panel.html           # Standalone import/export panel
├── _shortcodes/
│   └── quiz.html                      # Hextra theme shortcode
├── _partials/
│   └── shortcodes/
│       └── quiz.html                  # Quiz implementation partial
└── partials/
    ├── quiz/
    │   ├── mcq.html                   # Multiple choice questions
    │   ├── multiple-select.html       # Multiple correct answers
    │   ├── true-false.html            # Binary questions
    │   ├── fill-blank.html            # Text input questions
    │   ├── code-output.html           # Code output prediction
    │   ├── flashcard.html             # Flip cards
    │   ├── drag-drop.html             # Ordering/sequencing
    │   ├── code-completion.html       # Fill in missing code
    │   └── ordered-recall.html        # Typed sequential recall
    └── custom/
        └── head-end.html              # JavaScript loader
```

### Assets

```
assets/
└── css/
    └── custom.css                     # Quiz, review, and toolbar styling

static/
└── js/
    └── quiz.js                        # Quiz runtime and PerformanceStore
```

## How It Works

### 1. Shortcode Processing

When you write:
```markdown
{{</* quiz id="my-quiz" */>}}
{ "title": "...", "questions": [...] }
{{</* /quiz */>}}
```

Hugo:
1. Processes the `quiz` shortcode
2. Parses JSON using `transform.Unmarshal`
3. Passes data to `_partials/shortcodes/quiz.html`

### 2. HTML Generation

The partial template:
- Creates quiz container with unique ID
- Loops through questions
- Calls appropriate question type partial
- Embeds quiz data as JSON in `<script>` tag
- Adds progress, per-question submit, navigation, review, and results controls

Generated HTML structure:
```html
<div class="quiz-container" id="quiz-123" data-quiz-id="quiz-123">
  <div class="quiz-progress">
    <button class="quiz-review-past-btn">Review Past Incorrect</button>
  </div>
  <div class="quiz-question" data-question-id="quiz-123-0" data-question-type="mcq">
    <!-- Question content -->
    <button class="submit-answer-btn">Submit Answer</button>
  </div>
  <div class="quiz-navigation">
    <button class="quiz-prev-btn">Previous</button>
    <button class="quiz-next-btn">Next</button>
  </div>
  <div class="quiz-results">
    <!-- Score, accuracy, right, wrong, skipped -->
  </div>
</div>

<script type="application/json" class="quiz-data">
  { "title": "...", "questions": [...] }
</script>
```

### 3. CSS Styling

The CSS provides:
- Visual styling for all question types
- Feedback colors (green/red)
- Dark mode support using CSS variables
- Responsive design
- Animations (flashcards, drag-drop)

### 4. JavaScript Interactivity

The JavaScript (`static/js/quiz.js`) handles:

**Initialization:**
```javascript
class Quiz {
  constructor(container) {
    this.data = this.loadQuizData(); // Read JSON
    this.userAnswers = new Map();
    this.submittedQuestions = new Set();
    this.performanceStore = new PerformanceStore(); // Track performance
    this.resultsScope = 'all'; // For subset results
    this.init();
  }
}
```

**Performance Tracking:**
```javascript
class PerformanceStore {
  record(questionId, isCorrect, metadata = {}) {
    const entry = this.data.questions[questionId] || {
      attempts: 0, correct: 0, incorrect: 0, streak: 0
    };
    entry.attempts++;
    entry[isCorrect ? 'correct' : 'incorrect']++;
    entry.streak = isCorrect ? Math.max(1, entry.streak + 1)
                             : Math.min(-1, entry.streak - 1);
    entry.lastResult = isCorrect ? 'correct' : 'incorrect';
    entry.quizPath = metadata.quizPath;
    entry.quizTitle = metadata.quizTitle;
    entry.intervalDays = this.getMaintenanceInterval(entry, isCorrect);
    entry.nextReviewAt = this.addDays(entry.intervalDays);
    entry.reviewLane = isCorrect ? 'maintenance' : 'overdue-error';
    this.save(); // Persist to localStorage
  }

  rateCorrectQuestion(questionId, confidenceRating) {
    // Updates intervalDays and nextReviewAt for hard/good/easy.
  }

  isWeak(questionId) {
    const entry = this.get(questionId);
    if (!entry || entry.attempts < 2) return false;
    const accuracy = entry.correct / entry.attempts;
    return accuracy < 0.5 || entry.streak <= -2;
  }
}
```

**Answer Validation:**
- Each question type has a validator
- Compares user answers with correct answers
- Shows visual feedback
- Records performance data per question
- Locks submitted questions so each visible question is scored once per attempt
- Correct submissions show a confidence rating control

**Scoring with Scope:**
```javascript
showFinalResults() {
  const indices = this.resultsScope === 'subset'
    ? this.resultsIndices  // Review mode: only selected questions
    : this.getAllQuestionIndices();  // Normal mode: all questions

  indices.forEach((index) => {
    let isCorrect = this.checkQuestionType(questions[index], index);
    if (isCorrect) this.results.correct++;
  });
  this.showResults();
}
```

Scores include skipped questions in the displayed total, but accuracy uses answered questions only.

**Review Features:**
- Filter questions by review mode (all, current incorrect, past incorrect)
- Reset questions for retry without affecting historical stats
- Toggle between full quiz and targeted review
- Update weak indicators dynamically
- Store unresolved question IDs per quiz session
- Resolve or keep unresolved questions while reviewing

**Interactive Features:**
- Hint toggling
- Flashcard flipping (CSS 3D transforms)
- Drag-drop reordering (HTML5 Drag API)
- Keyboard navigation with left/right arrows while the quiz has focus
- Copy incorrect question numbers from the results panel
- Confidence rating for correct answers
- Reset functionality
- Review mode switching

## Daily Review and Revision Index

### Daily Review

`layouts/shortcodes/daily-review.html` builds a registry of quiz section pages, fetches each quiz page in the browser, and selects due questions from localStorage. It creates one mixed quiz from cloned question elements and calls `window.RDocsQuiz.initContainer()` so the normal runtime handles validation and scoring.

Daily Review lanes:

- `overdue-error`: unresolved questions from full attempts or legacy last-incorrect data
- `weak`: questions where `PerformanceStore.isWeak()` is true
- `hard-maintenance`: correct questions due today with `confidenceRating: "hard"`
- `maintenance`: other correct questions with `nextReviewAt` due

### Revision Index

`layouts/shortcodes/revision-index.html` reads the same localStorage key and renders a topic-grouped table of quiz sessions. It uses full-quiz scores to assign Leitner-style status:

| Score / State | Status | Interval |
|---------------|--------|----------|
| Not started | Not Started | None |
| < 60% | B1 (R) | 3 days |
| 60-84% | B2 (V) | 7 days |
| 85-89% | B3 (M) | 14 days |
| 90%+ first mastery | B3 (1st 90%) | 14 days |
| 90%+ twice in a row | B4 (M) | 28 days |

## Data Flow

```
Markdown with JSON
        ↓
Hugo Shortcode Processing
        ↓
JSON Parsing (transform.Unmarshal)
        ↓
HTML Template Rendering (with data-question-id)
        ↓
Browser Receives HTML + CSS + JS
        ↓
JavaScript Reads Embedded JSON + localStorage
        ↓
User Interaction
        ↓
Per-question Submit / Event Handlers
        ↓
Answer Validation
        ↓
Performance Tracking + Unresolved Pool Updates
        ↓
Visual Feedback, Confidence Rating & Scoring
```

## Data Persistence

### localStorage Schema

Performance data is stored in `localStorage` with key `rdocs.quiz.performance.v1`:

```json
{
  "questions": {
    "quiz-id-question-01": {
      "attempts": 5,
      "correct": 3,
      "incorrect": 2,
      "streak": -1,
      "lastResult": "incorrect",
      "lastAttemptAt": "2024-01-15T10:30:00.000Z",
      "quizPath": "/rdocs/quiz/python/01-foundation/",
      "quizTitle": "Python Foundation",
      "topic": "python",
      "questionIndex": 0,
      "intervalDays": 0,
      "nextReviewAt": "2024-01-15",
      "reviewLane": "overdue-error"
    },
    "quiz-id-question-02": {
      "attempts": 3,
      "correct": 3,
      "incorrect": 0,
      "streak": 3,
      "lastResult": "correct",
      "lastAttemptAt": "2024-01-15T10:31:00.000Z",
      "confidenceRating": "easy",
      "confidenceRatedAt": "2024-01-15T10:32:00.000Z",
      "intervalDays": 30,
      "nextReviewAt": "2024-02-14",
      "reviewLane": "maintenance"
    }
  },
  "quizSessions": {
    "/rdocs/quiz/python/01-foundation/": {
      "title": "Python Foundation",
      "attempts": 2,
      "lastScore": 86,
      "lastFullAttemptAt": "2024-01-15T10:35:00.000Z",
      "lastReviewAt": "2024-01-16T09:10:00.000Z",
      "errorPool": 1,
      "unresolvedQuestionIds": ["quiz-id-question-01"],
      "masteredCount": 0
    }
  }
}
```

### Storage Behavior

- `questions` stores per-question history and maintenance scheduling.
- `quizSessions` stores full-quiz attempt history, Leitner inputs, and unresolved error pools.
- Full quiz results call `recordQuizSession()` and replace the unresolved pool with currently incorrect question IDs.
- Review sessions call `resolveQuestion()` or `keepQuestionUnresolved()` as each question is submitted.
- Import/export uses a versioned JSON wrapper: `{ "version": 1, "exportedAt": "...", "data": ... }`.

### Question ID Strategy

Questions use stable IDs in this priority:
1. **Explicit ID**: `"id": "my-question-01"` (recommended)
2. **Fallback**: `${quizId}-${questionIndex}` (auto-generated)

Explicit IDs ensure tracking persists even if questions are reordered.

## Technical Details

### Dependencies
- Hugo 0.112.0+ (extended version)
- No external JavaScript libraries
- Pure CSS (no preprocessors)

### Performance
- Client-side runtime with no backend dependency
- Daily Review fetches same-origin quiz pages in the browser
- Client-side scoring
- DOM cloning for mixed daily review quizzes
- localStorage for persistence (graceful fallback if unavailable)

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires JavaScript enabled

### Accessibility
- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly
- ARIA labels where appropriate

## Theme Integration (Hextra)

The quiz system integrates with Hextra theme through:

1. **Dual Shortcode Locations**
   - `layouts/shortcodes/quiz.html` - Standard Hugo
   - `layouts/_shortcodes/quiz.html` - Hextra convention

2. **Custom Head Hook**
   - `layouts/partials/custom/head-end.html` - JavaScript loader
   - Called by Hextra's `head.html` template

3. **Custom CSS**
   - Uses CSS variables for theming
   - Inherits dark mode from theme
   - Respects theme's color scheme

## Extending the System

### Adding New Question Types

1. **Create Partial Template**
   ```
   layouts/partials/quiz/my-type.html
   ```

2. **Add to Main Quiz Partial**
   ```html
   {{- if eq $question.type "my-type" -}}
     {{- partial "quiz/my-type.html" $question -}}
   {{- end -}}
   ```

3. **Add JavaScript Handler**
   ```javascript
   checkMyType(question, index) {
     // Validation logic
     return isCorrect;
   }
   ```

4. **Register the Handler in submitAnswer**
   ```javascript
   case 'my-type':
     isCorrect = this.checkMyType(question, index);
     break;
   ```

5. **Add CSS Styling**
   ```css
   .my-type-container {
     /* Styles */
   }
   ```

### Customizing Styles

Override CSS variables:
```css
.quiz-container {
  --bg-color: #your-color;
  --border-color: #your-color;
  --text-primary: #your-color;
}
```

### Modifying Behavior

Edit `static/js/quiz.js`:
- Change scoring algorithm
- Add custom validation
- Modify feedback display
- Add analytics tracking
