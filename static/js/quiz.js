// Quiz System JavaScript
(function() {
  'use strict';

  class PerformanceStore {
    constructor() {
      this.storageKey = 'rdocs.quiz.performance.v1';
      this.data = { questions: {} };
      this.available = this.checkAvailability();
      this.load();
    }

    checkAvailability() {
      try {
        const testKey = '__quiz_storage_test__';
        localStorage.setItem(testKey, '1');
        localStorage.removeItem(testKey);
        return true;
      } catch (err) {
        return false;
      }
    }

    load() {
      if (!this.available) return;
      try {
        const raw = localStorage.getItem(this.storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            this.data = parsed;
          }
        }
      } catch (err) {
        this.data = { questions: {} };
      }
    }

    save() {
      if (!this.available) return;
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      } catch (err) {
        // Ignore storage write failures.
      }
    }

    get(questionId) {
      return this.data.questions[questionId];
    }

    record(questionId, isCorrect) {
      const now = new Date().toISOString();
      const entry = this.data.questions[questionId] || {
        attempts: 0,
        correct: 0,
        incorrect: 0,
        streak: 0
      };

      entry.attempts += 1;
      if (isCorrect) {
        entry.correct += 1;
        entry.streak = entry.streak > 0 ? entry.streak + 1 : 1;
        entry.lastResult = 'correct';
      } else {
        entry.incorrect += 1;
        entry.streak = entry.streak < 0 ? entry.streak - 1 : -1;
        entry.lastResult = 'incorrect';
      }
      entry.lastAttemptAt = now;

      this.data.questions[questionId] = entry;
      this.save();
    }

    isWeak(questionId) {
      const entry = this.data.questions[questionId];
      if (!entry || entry.attempts < 2) return false;
      const accuracy = entry.correct / entry.attempts;
      return accuracy < 0.5 || entry.streak <= -2;
    }
  }

  class Quiz {
    constructor(container) {
      this.container = container;
      this.quizId = container.dataset.quizId;
      this.data = this.loadQuizData();
      this.userAnswers = new Map();
      this.submittedQuestions = new Set();
      this.currentQuestionIndex = 0;
      this.currentVisibleIndex = 0;
      this.visibleQuestionIndices = [];
      this.reviewMode = 'all';
      this.resultsScope = 'all';
      this.resultsIndices = [];
      this.totalQuestions = 0;
      this.lastIncorrectIndices = [];
      this.performanceStore = new PerformanceStore();
      this.results = {
        total: 0,
        correct: 0,
        incorrect: 0
      };

      this.init();
    }

    loadQuizData() {
      const dataElement = document.querySelector(`script.quiz-data[data-for="${this.quizId}"]`);
      if (dataElement) {
        return JSON.parse(dataElement.textContent);
      }
      return null;
    }

    init() {
      this.totalQuestions = this.container.querySelectorAll('.quiz-question').length;
      this.bindEvents();
      this.initQuestionHandlers();
      this.refreshWeakIndicators();
      this.updatePastReviewButton();
      this.applyReviewFilter('all', { skipAlert: true });
    }

    bindEvents() {
      const prevBtn = this.container.querySelector('.quiz-prev-btn');
      const nextBtn = this.container.querySelector('.quiz-next-btn');
      const resetBtn = this.container.querySelector('.quiz-reset-btn');
      const reviewIncorrectBtn = this.container.querySelector('.quiz-review-incorrect-btn');
      const reviewPastBtn = this.container.querySelector('.quiz-review-past-btn');

      if (prevBtn) {
        prevBtn.addEventListener('click', () => this.previousQuestion());
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          if (nextBtn.dataset.action === 'show-results') {
            this.showFinalResults();
          } else {
            this.nextQuestion();
          }
        });
      }

      if (resetBtn) {
        resetBtn.addEventListener('click', () => this.resetQuiz());
      }

      if (reviewIncorrectBtn) {
        reviewIncorrectBtn.addEventListener('click', () => {
          if (!this.lastIncorrectIndices.length) return;
          this.resetQuestionsForRetry(this.lastIncorrectIndices);
          this.hideResults();
          this.applyReviewFilter(this.lastIncorrectIndices, { skipAlert: true });
        });
      }

      if (reviewPastBtn) {
        reviewPastBtn.addEventListener('click', () => {
          if (this.reviewMode === 'past-incorrect') {
            this.reviewMode = 'all';
            this.applyReviewFilter('all', { skipAlert: true });
            this.updatePastReviewButton();
            return;
          }

          const indices = this.getPastIncorrectIndices();
          if (!indices.length) {
            this.updatePastReviewButton();
            return;
          }

          this.reviewMode = 'past-incorrect';
          this.resetQuestionsForRetry(indices);
          this.applyReviewFilter(indices, { skipAlert: true });
          this.updatePastReviewButton();
        });
      }

      // Submit answer buttons for each question
      this.container.querySelectorAll('.submit-answer-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => this.submitAnswer(index));
      });

      // Hint buttons
      this.container.querySelectorAll('.hint-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const hintContent = e.target.nextElementSibling;
          if (hintContent) {
            hintContent.style.display = hintContent.style.display === 'none' ? 'block' : 'none';
          }
        });
      });

      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (this.container.contains(document.activeElement)) {
          if (e.key === 'ArrowLeft' && !prevBtn.disabled) {
            this.previousQuestion();
          } else if (e.key === 'ArrowRight' && !nextBtn.disabled) {
            this.nextQuestion();
          }
        }
      });
    }

    initQuestionHandlers() {
      const questions = this.container.querySelectorAll('.quiz-question');

      questions.forEach((question, index) => {
        const type = question.dataset.questionType;

        switch(type) {
          case 'flashcard':
            this.initFlashcard(question, index);
            break;
          case 'drag-drop':
            this.initDragDrop(question, index);
            break;
        }
      });
    }

    initFlashcard(question, index) {
      const flashcard = question.querySelector('.flashcard');
      const flipBtns = question.querySelectorAll('.flashcard-flip-btn');
      const selfCheckBtns = question.querySelectorAll('.self-check-btn');

      flipBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          flashcard.classList.toggle('flipped');
        });
      });

      selfCheckBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const isCorrect = e.target.dataset.correct === 'true';
          this.userAnswers.set(index, isCorrect);

          // Visual feedback
          selfCheckBtns.forEach(b => b.style.opacity = '0.5');
          e.target.style.opacity = '1';
        });
      });
    }

    initDragDrop(question, index) {
      const dragList = question.querySelector('.drag-drop-list');
      const items = dragList.querySelectorAll('.drag-item');

      let draggedItem = null;
      let touchStartY = 0;
      let currentTouchY = 0;

      items.forEach(item => {
        // Desktop drag events
        item.addEventListener('dragstart', (e) => {
          draggedItem = item;
          item.classList.add('dragging');
        });

        item.addEventListener('dragend', () => {
          item.classList.remove('dragging');
          draggedItem = null;
        });

        item.addEventListener('dragover', (e) => {
          e.preventDefault();
          const afterElement = this.getDragAfterElement(dragList, e.clientY);
          if (afterElement == null) {
            dragList.appendChild(draggedItem);
          } else {
            dragList.insertBefore(draggedItem, afterElement);
          }
        });

        // Mobile touch events
        item.addEventListener('touchstart', (e) => {
          draggedItem = item;
          touchStartY = e.touches[0].clientY;
          item.classList.add('dragging');
          item.style.opacity = '0.5';
        }, { passive: true });

        item.addEventListener('touchmove', (e) => {
          if (!draggedItem) return;

          e.preventDefault();
          currentTouchY = e.touches[0].clientY;

          // Reorder based on touch position
          const afterElement = this.getDragAfterElement(dragList, currentTouchY);
          if (afterElement == null) {
            dragList.appendChild(draggedItem);
          } else {
            dragList.insertBefore(draggedItem, afterElement);
          }
        }, { passive: false });

        item.addEventListener('touchend', () => {
          if (draggedItem) {
            draggedItem.classList.remove('dragging');
            draggedItem.style.opacity = '1';
            draggedItem = null;
          }
        });
      });
    }

    getDragAfterElement(container, y) {
      const draggableElements = [...container.querySelectorAll('.drag-item:not(.dragging)')];

      return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    getQuestionElements() {
      return Array.from(this.container.querySelectorAll('.quiz-question'));
    }

    getAllQuestionIndices() {
      return this.getQuestionElements().map((_, index) => index);
    }

    getQuestionId(question, index) {
      return question.dataset.questionId || `${this.quizId}-${index}`;
    }

    refreshWeakIndicators() {
      const questions = this.getQuestionElements();
      questions.forEach((question, index) => {
        const questionId = this.getQuestionId(question, index);
        if (this.performanceStore.isWeak(questionId)) {
          question.classList.add('weak-question');
        } else {
          question.classList.remove('weak-question');
        }
      });
    }

    resetQuestionsForRetry(indices) {
      indices.forEach((index) => {
        const question = this.getQuestionElements()[index];
        if (!question) return;
        this.resetQuestionState(question, index);
      });
      this.updateProgress();
    }

    resetQuestionState(question, index) {
      question.classList.remove('answered-correct', 'answered-incorrect', 'locked');

      const feedback = question.querySelector('.question-feedback');
      if (feedback) {
        feedback.style.display = 'none';
        const correctFeedback = feedback.querySelector('.feedback-correct');
        const incorrectFeedback = feedback.querySelector('.feedback-incorrect');
        if (correctFeedback) correctFeedback.style.display = 'none';
        if (incorrectFeedback) incorrectFeedback.style.display = 'none';
      }

      question.querySelectorAll('.quiz-option').forEach(opt => {
        opt.classList.remove('correct', 'incorrect');
      });

      question.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
        input.checked = false;
        input.disabled = false;
      });

      question.querySelectorAll('.fill-blank-input, .code-completion-input').forEach(input => {
        input.value = '';
        input.classList.remove('correct', 'incorrect');
        input.disabled = false;
      });

      const flashcard = question.querySelector('.flashcard');
      if (flashcard) {
        flashcard.classList.remove('flipped');
      }

      question.querySelectorAll('.self-check-btn').forEach(btn => {
        btn.style.opacity = '1';
        btn.disabled = false;
      });

      question.querySelectorAll('.flashcard-flip-btn').forEach(btn => {
        btn.disabled = false;
      });

      question.querySelectorAll('.drag-item').forEach(item => {
        item.style.borderColor = '';
        item.draggable = true;
        item.style.cursor = 'move';
      });

      question.querySelectorAll('.hint-content').forEach(hint => {
        hint.style.display = 'none';
      });

      const submitBtn = question.querySelector('.submit-answer-btn');
      if (submitBtn) {
        submitBtn.textContent = 'Submit Answer';
        submitBtn.disabled = false;
        submitBtn.classList.remove('answered');
      }

      this.submittedQuestions.delete(index);
      this.userAnswers.delete(index);
    }

    getPastIncorrectIndices() {
      const questions = this.getQuestionElements();
      const incorrectIndices = [];
      questions.forEach((question, index) => {
        const questionId = this.getQuestionId(question, index);
        const entry = this.performanceStore.get(questionId);
        if (entry && entry.lastResult === 'incorrect') {
          incorrectIndices.push(index);
        }
      });
      return incorrectIndices;
    }

    updatePastReviewButton() {
      const reviewPastBtn = this.container.querySelector('.quiz-review-past-btn');
      if (!reviewPastBtn) return;
      const indices = this.getPastIncorrectIndices();
      const hasIncorrect = indices.length > 0;

      if (this.reviewMode === 'past-incorrect') {
        reviewPastBtn.textContent = 'Show All Questions';
        reviewPastBtn.disabled = false;
      } else {
        reviewPastBtn.textContent = hasIncorrect
          ? `Review Past Incorrect (${indices.length})`
          : 'Review Past Incorrect';
        reviewPastBtn.disabled = !hasIncorrect;
      }
    }

    applyReviewFilter(filter, options = {}) {
      const questions = this.getQuestionElements();
      let indices = [];

      if (filter === 'all') {
        indices = this.getAllQuestionIndices();
      } else if (Array.isArray(filter)) {
        indices = filter.slice();
        if (!indices.length) {
          if (!options.skipAlert) {
            window.alert('No questions available for review.');
          }
          return;
        }
      }

      this.visibleQuestionIndices = indices;
      this.currentVisibleIndex = 0;
      if (filter === 'all') {
        this.resultsScope = 'all';
        this.resultsIndices = [];
      } else {
        this.resultsScope = 'subset';
        this.resultsIndices = indices.slice();
      }

      questions.forEach(q => {
        q.style.display = 'none';
      });

      if (this.visibleQuestionIndices.length) {
        this.showQuestionByVisibleIndex(0);
      }
    }

    showQuestionByVisibleIndex(visibleIndex) {
      const questions = this.getQuestionElements();
      const baseIndex = this.visibleQuestionIndices[visibleIndex];
      if (baseIndex === undefined) return;

      questions.forEach((q, i) => {
        q.style.display = i === baseIndex ? 'block' : 'none';
      });

      this.currentQuestionIndex = baseIndex;
      this.currentVisibleIndex = visibleIndex;
      this.updateNavigation();
      this.updateProgress();
    }

    showQuestion(index) {
      const questions = this.getQuestionElements();
      questions.forEach((q, i) => {
        q.style.display = i === index ? 'block' : 'none';
      });
      this.currentQuestionIndex = index;
      this.currentVisibleIndex = this.visibleQuestionIndices.indexOf(index);
      this.updateNavigation();
      this.updateProgress();
    }

    nextQuestion() {
      if (this.currentVisibleIndex < this.visibleQuestionIndices.length - 1) {
        this.showQuestionByVisibleIndex(this.currentVisibleIndex + 1);
      }
    }

    previousQuestion() {
      if (this.currentVisibleIndex > 0) {
        this.showQuestionByVisibleIndex(this.currentVisibleIndex - 1);
      }
    }

    updateNavigation() {
      const prevBtn = this.container.querySelector('.quiz-prev-btn');
      const nextBtn = this.container.querySelector('.quiz-next-btn');
      const visibleTotal = this.visibleQuestionIndices.length;

      // Update Previous button
      if (prevBtn) {
        prevBtn.disabled = this.currentVisibleIndex === 0 || visibleTotal === 0;
      }

      // Update Next button
      if (nextBtn) {
        if (visibleTotal === 0) {
          nextBtn.textContent = 'Next →';
          nextBtn.dataset.action = 'next';
          nextBtn.disabled = true;
          return;
        }

        const isLastQuestion = this.currentVisibleIndex === visibleTotal - 1;

        if (isLastQuestion) {
          nextBtn.textContent = 'View Results';
          nextBtn.dataset.action = 'show-results';
          nextBtn.disabled = visibleTotal === 0;
        } else {
          nextBtn.textContent = 'Next →';
          nextBtn.dataset.action = 'next';
          nextBtn.disabled = visibleTotal === 0;
        }
      }
    }

    updateProgress() {
      const currentQuestionEl = this.container.querySelector('.current-question');
      const totalQuestionsEl = this.container.querySelector('.total-questions');
      const answeredNumberEl = this.container.querySelector('.answered-number');
      const visibleTotal = this.visibleQuestionIndices.length;

      if (currentQuestionEl) {
        currentQuestionEl.textContent = visibleTotal ? this.currentVisibleIndex + 1 : 0;
      }

      if (totalQuestionsEl) {
        totalQuestionsEl.textContent = visibleTotal || this.totalQuestions;
      }

      if (answeredNumberEl) {
        answeredNumberEl.textContent = this.submittedQuestions.size;
      }
    }

    submitAnswer(index) {
      const question = this.container.querySelectorAll('.quiz-question')[index];
      const type = question.dataset.questionType;
      let isCorrect = false;

      // Check if already submitted
      if (this.submittedQuestions.has(index)) {
        return;
      }

      switch(type) {
        case 'mcq':
          isCorrect = this.checkMCQ(question, index);
          break;
        case 'multiple-select':
          isCorrect = this.checkMultipleSelect(question, index);
          break;
        case 'true-false':
          isCorrect = this.checkTrueFalse(question, index);
          break;
        case 'fill-blank':
          isCorrect = this.checkFillBlank(question, index);
          break;
        case 'code-output':
          isCorrect = this.checkCodeOutput(question, index);
          break;
        case 'code-completion':
          isCorrect = this.checkCodeCompletion(question, index);
          break;
        case 'flashcard':
          isCorrect = this.checkFlashcard(question, index);
          break;
        case 'drag-drop':
          isCorrect = this.checkDragDrop(question, index);
          break;
      }

      const questionId = this.getQuestionId(question, index);
      this.performanceStore.record(questionId, isCorrect);
      this.refreshWeakIndicators();
      this.updatePastReviewButton();

      this.showFeedback(question, isCorrect);
      this.submittedQuestions.add(index);
      this.lockQuestion(question);

      // Update submit button to show it's answered
      const submitBtn = question.querySelector('.submit-answer-btn');
      if (submitBtn) {
        submitBtn.textContent = '✓ Answered';
        submitBtn.disabled = true;
        submitBtn.classList.add('answered');
      }

      this.updateProgress();
      this.updateNavigation();
    }

    lockQuestion(question) {
      // Disable all inputs in the question
      question.querySelectorAll('input, .flashcard-flip-btn, .self-check-btn, .drag-item').forEach(el => {
        el.disabled = true;
        if (el.classList.contains('drag-item')) {
          el.draggable = false;
          el.style.cursor = 'not-allowed';
        }
      });

      question.classList.add('locked');
    }

    submitQuiz() {
      const questions = this.container.querySelectorAll('.quiz-question');
      this.results = { total: questions.length, correct: 0, incorrect: 0 };

      questions.forEach((question, index) => {
        const type = question.dataset.questionType;
        let isCorrect = false;

        switch(type) {
          case 'mcq':
            isCorrect = this.checkMCQ(question, index);
            break;
          case 'multiple-select':
            isCorrect = this.checkMultipleSelect(question, index);
            break;
          case 'true-false':
            isCorrect = this.checkTrueFalse(question, index);
            break;
          case 'fill-blank':
            isCorrect = this.checkFillBlank(question, index);
            break;
          case 'code-output':
            isCorrect = this.checkCodeOutput(question, index);
            break;
          case 'code-completion':
            isCorrect = this.checkCodeCompletion(question, index);
            break;
          case 'flashcard':
            isCorrect = this.checkFlashcard(question, index);
            break;
          case 'drag-drop':
            isCorrect = this.checkDragDrop(question, index);
            break;
        }

        this.showFeedback(question, isCorrect);

        if (isCorrect) {
          this.results.correct++;
        } else {
          this.results.incorrect++;
        }
      });

      this.showResults();
    }

    checkMCQ(question, index) {
      const selected = question.querySelector('input[type="radio"]:checked');
      if (!selected) return false;

      const isCorrect = selected.dataset.correct === 'true';
      this.highlightOption(selected.parentElement, isCorrect);
      return isCorrect;
    }

    checkMultipleSelect(question, index) {
      const selected = question.querySelectorAll('input[type="checkbox"]:checked');
      const correctAnswersEl = question.querySelector('.correct-answers');
      const correctAnswers = correctAnswersEl ? correctAnswersEl.value.split(',').map(Number) : [];

      const selectedValues = Array.from(selected).map(cb => parseInt(cb.value));

      // Check if arrays are equal
      const isCorrect = correctAnswers.length === selectedValues.length &&
                       correctAnswers.every(val => selectedValues.includes(val));

      // Highlight all options
      question.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        const shouldBeChecked = correctAnswers.includes(parseInt(cb.value));
        const isChecked = cb.checked;
        const optionCorrect = shouldBeChecked === isChecked;
        this.highlightOption(cb.parentElement, optionCorrect);
      });

      return isCorrect;
    }

    checkTrueFalse(question, index) {
      const selected = question.querySelector('input[type="radio"]:checked');
      if (!selected) return false;

      const isCorrect = selected.dataset.correct === 'true';
      this.highlightOption(selected.parentElement, isCorrect);
      return isCorrect;
    }

    checkFillBlank(question, index) {
      const input = question.querySelector('.fill-blank-input');
      const correctAnswer = input.dataset.answer;
      const caseSensitive = input.dataset.caseSensitive === 'true';
      const acceptedAnswersEl = question.querySelector('.accepted-answers');
      const acceptedAnswers = acceptedAnswersEl ? acceptedAnswersEl.value.split('|') : [correctAnswer];

      let userAnswer = input.value.trim();
      let isCorrect = false;

      if (caseSensitive) {
        isCorrect = acceptedAnswers.some(ans => ans === userAnswer);
      } else {
        userAnswer = userAnswer.toLowerCase();
        isCorrect = acceptedAnswers.some(ans => ans.toLowerCase() === userAnswer);
      }

      input.classList.add(isCorrect ? 'correct' : 'incorrect');
      return isCorrect;
    }

    checkCodeOutput(question, index) {
      const selected = question.querySelector('input[type="radio"]:checked');
      if (!selected) return false;

      const isCorrect = selected.dataset.correct === 'true';
      this.highlightOption(selected.parentElement, isCorrect);
      return isCorrect;
    }

    checkCodeCompletion(question, index) {
      const input = question.querySelector('.code-completion-input');
      const correctAnswer = input.dataset.answer;
      const caseSensitive = input.dataset.caseSensitive === 'true';
      const acceptedAnswersEl = question.querySelector('.accepted-answers');
      const acceptedAnswers = acceptedAnswersEl ? acceptedAnswersEl.value.split('|') : [correctAnswer];

      let userAnswer = input.value.trim();
      let isCorrect = false;

      if (caseSensitive) {
        isCorrect = acceptedAnswers.some(ans => ans === userAnswer);
      } else {
        userAnswer = userAnswer.toLowerCase();
        isCorrect = acceptedAnswers.some(ans => ans.toLowerCase() === userAnswer);
      }

      input.classList.add(isCorrect ? 'correct' : 'incorrect');
      return isCorrect;
    }

    checkFlashcard(question, index) {
      // Flashcards use self-assessment
      const userAnswer = this.userAnswers.get(index);
      return userAnswer === true;
    }

    checkDragDrop(question, index) {
      const dragList = question.querySelector('.drag-drop-list');
      const correctOrder = dragList.dataset.correctOrder.split(',').map(Number);
      const items = dragList.querySelectorAll('.drag-item');

      const currentOrder = Array.from(items).map(item => parseInt(item.dataset.itemId));

      const isCorrect = JSON.stringify(correctOrder) === JSON.stringify(currentOrder);

      // Visual feedback
      items.forEach((item, idx) => {
        if (parseInt(item.dataset.itemId) === correctOrder[idx]) {
          item.style.borderColor = '#10b981';
        } else {
          item.style.borderColor = '#ef4444';
        }
      });

      return isCorrect;
    }

    highlightOption(option, isCorrect) {
      option.classList.add(isCorrect ? 'correct' : 'incorrect');
    }

    showFeedback(question, isCorrect) {
      const feedback = question.querySelector('.question-feedback');
      const correctFeedback = question.querySelector('.feedback-correct');
      const incorrectFeedback = question.querySelector('.feedback-incorrect');

      if (feedback) {
        feedback.style.display = 'block';

        if (isCorrect && correctFeedback) {
          correctFeedback.style.display = 'flex';
          question.classList.add('answered-correct');
        } else if (!isCorrect && incorrectFeedback) {
          incorrectFeedback.style.display = 'flex';
          question.classList.add('answered-incorrect');
        }
      }
    }

    showFinalResults() {
      const questions = this.container.querySelectorAll('.quiz-question');
      const indices = this.resultsScope === 'subset'
        ? this.resultsIndices
        : this.getAllQuestionIndices();
      let correct = 0;
      let incorrect = 0;
      let skipped = 0;
      const incorrectIndices = [];

      indices.forEach((index) => {
        const question = questions[index];
        if (question.classList.contains('answered-correct')) {
          correct++;
        } else if (question.classList.contains('answered-incorrect')) {
          incorrect++;
          incorrectIndices.push(index);
        } else {
          skipped++;
        }
      });

      this.results = { total: indices.length, correct, incorrect, skipped };
      this.lastIncorrectIndices = incorrectIndices;

      const resultsDiv = this.container.querySelector('.quiz-results');
      const scoreValue = this.container.querySelector('.score-value');
      const correctCount = this.container.querySelector('.correct-count');
      const wrongCount = this.container.querySelector('.wrong-count');
      const skippedCount = this.container.querySelector('.skipped-count');
      const rightCount = this.container.querySelector('.right-count');
      const totalCount = this.container.querySelector('.total-count');
      const resetBtn = this.container.querySelector('.quiz-reset-btn');
      const navDiv = this.container.querySelector('.quiz-navigation');
      const progressDiv = this.container.querySelector('.quiz-progress');
      const reviewIncorrectBtn = this.container.querySelector('.quiz-review-incorrect-btn');

      // Calculate accuracy based on answered questions only
      const answeredQuestions = correct + incorrect;
      const percentage = answeredQuestions > 0
        ? Math.round((correct / answeredQuestions) * 100)
        : 0;

      if (resultsDiv) {
        resultsDiv.style.display = 'block';
      }

      if (scoreValue) {
        scoreValue.textContent = percentage + '%';
      }

      if (correctCount) {
        correctCount.textContent = correct;
      }

      if (wrongCount) {
        wrongCount.textContent = incorrect;
      }

      if (skippedCount) {
        skippedCount.textContent = skipped;
      }

      if (rightCount) {
        rightCount.textContent = correct;
      }

      if (totalCount) {
        totalCount.textContent = this.results.total;
      }

      if (resetBtn) {
        resetBtn.style.display = 'inline-block';
      }

      if (reviewIncorrectBtn) {
        reviewIncorrectBtn.style.display = incorrectIndices.length ? 'inline-block' : 'none';
      }

      // Hide navigation and progress
      if (navDiv) {
        navDiv.style.display = 'none';
      }

      if (progressDiv) {
        progressDiv.style.display = 'none';
      }

      // Hide all questions
      questions.forEach(q => {
        q.style.display = 'none';
      });

      // Scroll to results
      resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    showResults() {
      // Legacy method - now redirects to showFinalResults
      this.showFinalResults();
    }

    resetQuiz() {
      // Reset results and state
      this.results = { total: 0, correct: 0, incorrect: 0 };
      this.userAnswers.clear();
      this.submittedQuestions.clear();
      this.currentQuestionIndex = 0;
      this.currentVisibleIndex = 0;
      this.reviewMode = 'all';

      // Hide results
      const resultsDiv = this.container.querySelector('.quiz-results');
      if (resultsDiv) {
        resultsDiv.style.display = 'none';
      }

      // Show navigation and progress
      const navDiv = this.container.querySelector('.quiz-navigation');
      const progressDiv = this.container.querySelector('.quiz-progress');

      if (navDiv) {
        navDiv.style.display = 'flex';
      }

      if (progressDiv) {
        progressDiv.style.display = 'flex';
      }

      const resetBtn = this.container.querySelector('.quiz-reset-btn');
      if (resetBtn) {
        resetBtn.style.display = 'none';
      }

      const reviewIncorrectBtn = this.container.querySelector('.quiz-review-incorrect-btn');
      if (reviewIncorrectBtn) {
        reviewIncorrectBtn.style.display = 'none';
      }

      // Reset all questions
      this.container.querySelectorAll('.quiz-question').forEach((question, index) => {
        question.classList.remove('answered-correct', 'answered-incorrect', 'locked');

        // Reset feedback
        const feedback = question.querySelector('.question-feedback');
        if (feedback) {
          feedback.style.display = 'none';
          const correctFeedback = feedback.querySelector('.feedback-correct');
          const incorrectFeedback = feedback.querySelector('.feedback-incorrect');
          if (correctFeedback) correctFeedback.style.display = 'none';
          if (incorrectFeedback) incorrectFeedback.style.display = 'none';
        }

        // Reset options
        question.querySelectorAll('.quiz-option').forEach(opt => {
          opt.classList.remove('correct', 'incorrect');
        });

        // Reset inputs
        question.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
          input.checked = false;
          input.disabled = false;
        });

        question.querySelectorAll('.fill-blank-input, .code-completion-input').forEach(input => {
          input.value = '';
          input.classList.remove('correct', 'incorrect');
          input.disabled = false;
        });

        // Reset flashcards
        const flashcard = question.querySelector('.flashcard');
        if (flashcard) {
          flashcard.classList.remove('flipped');
        }

        question.querySelectorAll('.self-check-btn').forEach(btn => {
          btn.style.opacity = '1';
          btn.disabled = false;
        });

        question.querySelectorAll('.flashcard-flip-btn').forEach(btn => {
          btn.disabled = false;
        });

        // Reset drag-drop items
        question.querySelectorAll('.drag-item').forEach(item => {
          item.style.borderColor = '';
          item.draggable = true;
          item.style.cursor = 'move';
        });

        // Reset hints
        question.querySelectorAll('.hint-content').forEach(hint => {
          hint.style.display = 'none';
        });

        // Reset submit button
        const submitBtn = question.querySelector('.submit-answer-btn');
        if (submitBtn) {
          submitBtn.textContent = 'Submit Answer';
          submitBtn.disabled = false;
          submitBtn.classList.remove('answered');
        }
      });

      this.refreshWeakIndicators();
      this.updatePastReviewButton();
      this.applyReviewFilter('all', { skipAlert: true });

      // Scroll to top of quiz
      this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    hideResults() {
      const resultsDiv = this.container.querySelector('.quiz-results');
      if (resultsDiv) {
        resultsDiv.style.display = 'none';
      }

      const navDiv = this.container.querySelector('.quiz-navigation');
      const progressDiv = this.container.querySelector('.quiz-progress');

      if (navDiv) {
        navDiv.style.display = 'flex';
      }

      if (progressDiv) {
        progressDiv.style.display = 'flex';
      }
    }
  }

  // Initialize all quizzes on page load
  function initQuizzes() {
    const quizContainers = document.querySelectorAll('.quiz-container');
    quizContainers.forEach(container => {
      new Quiz(container);
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuizzes);
  } else {
    initQuizzes();
  }
})();
