---
title: "Troubleshooting"
description: "Common issues and solutions"
weight: 5
---

Common issues and their solutions.

## Quiz Not Rendering

**Problem:** "template for shortcode 'quiz' not found"

**Solutions:**
1. Ensure shortcode exists in `layouts/shortcodes/quiz.html` OR `layouts/_shortcodes/quiz.html`
2. Clear Hugo cache:
   ```bash
   rm -rf resources/_gen .hugo_build.lock
   ```
3. Restart Hugo server
4. Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)

## JavaScript Not Working

**Problem:** Submit Answer, navigation, confidence buttons, review buttons, or hints don't respond

**Solutions:**
1. Verify JavaScript file exists: `static/js/quiz.js`
2. Check `layouts/partials/custom/head-end.html` includes the script tag:
   ```
   <script src="{{ "js/quiz.js" | relURL }}" defer></script>
   ```
3. Open browser DevTools Console (F12) and check for errors
4. Verify script is loading: Network tab should show `quiz.js` loaded
5. Hard refresh browser to clear cache

**Common JavaScript Errors:**

```
Uncaught ReferenceError: Quiz is not defined
```
→ JavaScript file not loaded. Check script tag in head-end.html

```
Cannot read property 'querySelector' of null
```
→ Quiz container not found. Check quiz ID is unique

```
Quiz runtime is not available.
```
→ Daily Review loaded before `quiz.js` or `window.RDocsQuiz` is unavailable. Check the script loader and hard refresh.

## Styling Issues

**Problem:** Quiz looks unstyled or broken

**Solutions:**
1. Verify CSS is in `assets/css/custom.css`
2. Check Hugo is loading custom CSS (view page source, search for "custom.css")
3. Clear browser cache
4. Check for CSS conflicts in browser DevTools (Elements tab)

**Dark Mode Not Working:**
- Ensure CSS uses `var(--variable-name)` syntax
- Check theme's dark mode class (usually `.dark`)
- Verify CSS variables are defined for both light and dark modes

## JSON Parse Errors

**Problem:** Quiz won't render or shows errors

**Solutions:**
1. Validate JSON syntax using a [JSON validator](https://jsonlint.com)
2. Ensure all strings use double quotes (not single quotes)
   ```
   "question": "Valid"      ✓
   'question': 'Invalid'    ✗
   ```
3. Check for trailing commas (not allowed in JSON)
   ```
   {
     "answer": 1,  ✗ Remove this comma
   }
   ```
4. Verify array indices are numbers, not strings
   ```
   "answer": 1     ✓
   "answer": "1"   ✗
   ```

**Common JSON Errors:**

```
Error: failed to extract shortcode: template for shortcode "quiz" not found
```
→ JSON syntax error or shortcode not found

```
unexpected character ',' after object key:value pair
```
→ Trailing comma in JSON

## Answer Validation Issues

**Problem:** Correct answers marked as incorrect

**Solutions:**

**MCQ/True-False:**
- Check answer index is correct (0-based)
- Verify `answer` field matches option index

**Multiple Select:**
- Ensure `answers` is an array: `"answers": [0, 2, 4]`
- Check all correct option indices are included

**Fill in the Blank:**
- Check case sensitivity: `"caseSensitive": false`
- Use `acceptedAnswers` for alternatives:
  ```
  "answer": "for",
  "acceptedAnswers": ["for", "while"]
  ```

**Code Completion:**
- Verify expected answer matches exactly
- Consider whitespace and formatting
- Use `acceptedAnswers` for variations

**Drag & Drop:**
- Check `correctOrder` array matches `items` indices
- Ensure indices are in correct sequence

**Ordered Recall:**
- Ensure each step has an `answer`
- Use `acceptedAnswers` for alternate spelling, punctuation, or casing
- Remember the full question is correct only when every step is correct

## Review and Progress Issues

**Problem:** Review Past Incorrect is disabled

**Solutions:**
1. Complete a full quiz attempt with at least one incorrect answer
2. Verify questions have stable `id` values
3. Check localStorage for the `rdocs.quiz.performance.v1` key
4. Use Performance Data export to inspect whether `quizSessions` contains `unresolvedQuestionIds`

**Problem:** Daily Review is empty but you expected questions

**Solutions:**
1. Confirm the question is either unresolved, weak, or due for maintenance
2. Confirm correct answers have `nextReviewAt` less than or equal to today's date
3. Open the Revision Index and check the review summary counts
4. Verify quiz pages are reachable from the browser; Daily Review fetches quiz pages client-side
5. Hard refresh after changing quiz IDs or moving quiz pages

**Problem:** A missed question does not leave the daily review queue

**Expected behavior:** Incorrect review answers remain unresolved. The question leaves the unresolved pool only after it is answered correctly in a review session or after a full quiz attempt no longer misses it.

**Problem:** Revision Index does not show an attempt

**Expected behavior:** Only full quiz attempts update quiz-level session attempts. Current-incorrect review, past-incorrect review, and Daily Review update question history and unresolved pools but do not increment full quiz attempts.

**Problem:** Confidence buttons disappeared

**Expected behavior:** Confidence controls appear only after a correct submission. After the user selects Hard, Good, or Easy, the buttons are disabled for that submitted question. Resetting the quiz or retrying the question creates a fresh control after another correct submission.

## Performance Data Import/Export

**Problem:** Import fails with "Unrecognized file format"

**Solutions:**
1. Import only files exported by the Performance Data panel
2. Verify the JSON has `version: 1`
3. Verify the payload contains `data.questions`
4. If editing by hand, keep `quizSessions` as an object, not an array

**Problem:** Imported data does not match expected quizzes

**Solutions:**
1. Check that question IDs are unchanged between the exported data and current quiz files
2. Confirm quiz paths still match if pages were moved
3. Export current data before importing so you can compare the merged payload

## Hextra Theme Specific

For the Hextra theme, the quiz system requires:

1. **Dual Shortcode Locations**
   - `layouts/shortcodes/quiz.html` - Standard Hugo location
   - `layouts/_shortcodes/quiz.html` - Hextra convention

2. **Correct JavaScript Loader**
   - Must be in `layouts/partials/custom/head-end.html`
   - NOT `layouts/partials/head-custom.html`

3. **Partial Implementation**
   - Must be in `layouts/_partials/shortcodes/quiz.html`

4. **Quiz Center Tools**
   - `layouts/shortcodes/quiz-tools-bar.html` provides the Revision Index link and Performance Data import/export
   - `layouts/shortcodes/revision-index.html` powers `/quiz/revision-index/`
   - `layouts/shortcodes/daily-review.html` powers `/quiz/review/`

## Performance Issues

**Problem:** Quiz loads slowly

**Solutions:**
1. Reduce number of questions per quiz (keep under 15)
2. Optimize images in quiz content
3. Check for large JSON data embedded in questions
4. Split large quizzes into multiple smaller ones

## Mobile Issues

**Problem:** Quiz doesn't work on mobile

**Solutions:**
1. Test responsive CSS in DevTools mobile view
2. Check touch events work for drag-drop
3. Verify button sizes are touch-friendly (min 44x44px)
4. Test on actual mobile devices, not just emulators
5. For drag-drop, verify touch reordering works after the page is fully loaded

## Debugging Tips

### 1. Browser DevTools Console
Open with F12, check for:
- JavaScript errors
- Failed network requests
- CSS warnings

### 2. Network Tab
Verify these files load:
- `quiz.js` (JavaScript)
- `custom.css` (CSS with quiz styles)
- Quiz pages fetched by Daily Review

### 3. Elements Tab
Inspect quiz HTML:
- Check quiz container has correct ID
- Verify question elements have correct data attributes
- Ensure JSON script tag is present
- Confirm submitted questions receive `answered-correct`, `answered-incorrect`, and `locked` classes

### 4. localStorage
Inspect Application -> Local Storage and check `rdocs.quiz.performance.v1`:
- `questions` should contain per-question stats
- `quizSessions` should contain per-quiz attempts and unresolved pools
- Due maintenance questions should have `nextReviewAt`

### 5. Hugo Build Logs
Run with verbose logging:
```bash
hugo --logLevel debug
```

Look for:
- Template errors
- Shortcode processing errors
- JSON unmarshal errors

## Still Having Issues?

1. Check the [Usage Guide](usage) for correct syntax
2. Review [Examples](examples) for working quiz
3. Compare your quiz JSON with example
4. Validate JSON at [jsonlint.com](https://jsonlint.com)
5. Test with minimal quiz (1 simple question)
6. Check browser compatibility

## Quick Diagnostic Checklist

- [ ] Shortcode file exists in correct location
- [ ] JSON is valid (no syntax errors)
- [ ] JavaScript file exists and loads
- [ ] CSS file includes quiz styles
- [ ] Browser console shows no errors
- [ ] Network tab shows all resources load
- [ ] localStorage is available in the browser
- [ ] Question IDs are stable and unique
- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Hugo server restarted
- [ ] Cache cleared (Hugo and browser)
