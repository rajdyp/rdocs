// Quiz System JavaScript
(function() {
  'use strict';

  class Quiz {
    constructor(container) {
      this.container = container;
      this.quizId = container.dataset.quizId;
      this.data = this.loadQuizData();
      this.userAnswers = new Map();
      this.submittedQuestions = new Set();
      this.currentQuestionIndex = 0;
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
      this.bindEvents();
      this.initQuestionHandlers();
    }

    bindEvents() {
      const prevBtn = this.container.querySelector('.quiz-prev-btn');
      const nextBtn = this.container.querySelector('.quiz-next-btn');
      const resetBtn = this.container.querySelector('.quiz-reset-btn');

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

      items.forEach(item => {
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

    showQuestion(index) {
      const questions = this.container.querySelectorAll('.quiz-question');
      questions.forEach((q, i) => {
        q.style.display = i === index ? 'block' : 'none';
      });
      this.currentQuestionIndex = index;
      this.updateNavigation();
      this.updateProgress();
    }

    nextQuestion() {
      const questions = this.container.querySelectorAll('.quiz-question');
      if (this.currentQuestionIndex < questions.length - 1) {
        this.showQuestion(this.currentQuestionIndex + 1);
      }
    }

    previousQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.showQuestion(this.currentQuestionIndex - 1);
      }
    }

    updateNavigation() {
      const prevBtn = this.container.querySelector('.quiz-prev-btn');
      const nextBtn = this.container.querySelector('.quiz-next-btn');
      const questions = this.container.querySelectorAll('.quiz-question');

      // Update Previous button
      if (prevBtn) {
        prevBtn.disabled = this.currentQuestionIndex === 0;
      }

      // Update Next button
      if (nextBtn) {
        const isLastQuestion = this.currentQuestionIndex === questions.length - 1;

        if (isLastQuestion) {
          nextBtn.textContent = 'View Results';
          nextBtn.dataset.action = 'show-results';
          nextBtn.disabled = false;
        } else {
          nextBtn.textContent = 'Next →';
          nextBtn.dataset.action = 'next';
          nextBtn.disabled = false;
        }
      }
    }

    updateProgress() {
      const currentQuestionEl = this.container.querySelector('.current-question');
      const answeredNumberEl = this.container.querySelector('.answered-number');

      if (currentQuestionEl) {
        currentQuestionEl.textContent = this.currentQuestionIndex + 1;
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
      let correct = 0;
      let incorrect = 0;
      let skipped = 0;

      questions.forEach((question, index) => {
        if (question.classList.contains('answered-correct')) {
          correct++;
        } else if (question.classList.contains('answered-incorrect')) {
          incorrect++;
        } else {
          skipped++;
        }
      });

      this.results = { total: questions.length, correct, incorrect, skipped };

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
        progressDiv.style.display = 'block';
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

      // Hide reset button
      const resetBtn = this.container.querySelector('.quiz-reset-btn');
      if (resetBtn) {
        resetBtn.style.display = 'none';
      }

      // Show first question
      this.showQuestion(0);

      // Scroll to top of quiz
      this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
