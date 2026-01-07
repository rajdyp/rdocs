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
│   └── quiz.html                      # Hugo shortcode entry point
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
    │   └── code-completion.html       # Fill in missing code
    └── custom/
        └── head-end.html              # JavaScript loader
```

### Assets

```
assets/
└── css/
    └── custom.css                     # Quiz styling (~670 lines)

static/
└── js/
    └── quiz.js                        # Quiz logic (~300 lines)
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

Generated HTML structure:
```html
<div class="quiz-container" id="quiz-123">
  <div class="quiz-question" data-question-type="mcq">
    <!-- Question content -->
  </div>
  <button class="quiz-submit-btn">Submit Quiz</button>
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
    this.performanceStore = new PerformanceStore(); // Track performance
    this.resultsScope = 'all'; // For subset results
    this.init();
  }
}
```

**Performance Tracking:**
```javascript
class PerformanceStore {
  record(questionId, isCorrect) {
    const entry = this.data.questions[questionId] || {
      attempts: 0, correct: 0, incorrect: 0, streak: 0
    };
    entry.attempts++;
    entry[isCorrect ? 'correct' : 'incorrect']++;
    entry.streak = isCorrect ? Math.max(1, entry.streak + 1)
                             : Math.min(-1, entry.streak - 1);
    entry.lastResult = isCorrect ? 'correct' : 'incorrect';
    this.save(); // Persist to localStorage
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

**Review Features:**
- Filter questions by review mode (all, incorrect, past-incorrect)
- Reset questions for retry without affecting historical stats
- Toggle between full quiz and targeted review
- Update weak indicators dynamically

**Interactive Features:**
- Hint toggling
- Flashcard flipping (CSS 3D transforms)
- Drag-drop reordering (HTML5 Drag API)
- Reset functionality
- Review mode switching

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
Event Handlers
        ↓
Answer Validation
        ↓
Performance Tracking (localStorage update)
        ↓
Visual Feedback & Scoring
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
      "lastAttemptAt": "2024-01-15T10:30:00.000Z"
    },
    "quiz-id-question-02": {
      "attempts": 3,
      "correct": 3,
      "incorrect": 0,
      "streak": 3,
      "lastResult": "correct",
      "lastAttemptAt": "2024-01-15T10:31:00.000Z"
    }
  }
}
```

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
- Lightweight (~15KB CSS, ~13KB JS)
- No API calls
- Client-side scoring
- Minimal DOM manipulation
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

4. **Add CSS Styling**
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
