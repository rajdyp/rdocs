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

**Problem:** Submit button or hints don't respond

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

### 3. Elements Tab
Inspect quiz HTML:
- Check quiz container has correct ID
- Verify question elements have correct data attributes
- Ensure JSON script tag is present

### 4. Hugo Build Logs
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
- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Hugo server restarted
- [ ] Cache cleared (Hugo and browser)
