// Quiz System JavaScript
(function() {
  'use strict';

  class Quiz {
    constructor(container) {
      this.container = container;
      this.quizId = container.dataset.quizId;
      this.data = this.loadQuizData();
      this.userAnswers = new Map();
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
      const submitBtn = this.container.querySelector('.quiz-submit-btn');
      const resetBtn = this.container.querySelector('.quiz-reset-btn');

      if (submitBtn) {
        submitBtn.addEventListener('click', () => this.submitQuiz());
      }

      if (resetBtn) {
        resetBtn.addEventListener('click', () => this.resetQuiz());
      }

      // Hint buttons
      this.container.querySelectorAll('.hint-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const hintContent = e.target.nextElementSibling;
          if (hintContent) {
            hintContent.style.display = hintContent.style.display === 'none' ? 'block' : 'none';
          }
        });
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

    showResults() {
      const resultsDiv = this.container.querySelector('.quiz-results');
      const scoreValue = this.container.querySelector('.score-value');
      const correctCount = this.container.querySelector('.correct-count');
      const totalCount = this.container.querySelector('.total-count');
      const submitBtn = this.container.querySelector('.quiz-submit-btn');
      const resetBtn = this.container.querySelector('.quiz-reset-btn');

      const percentage = Math.round((this.results.correct / this.results.total) * 100);

      if (resultsDiv) {
        resultsDiv.style.display = 'block';
      }

      if (scoreValue) {
        scoreValue.textContent = percentage + '%';
      }

      if (correctCount) {
        correctCount.textContent = this.results.correct;
      }

      if (totalCount) {
        totalCount.textContent = this.results.total;
      }

      if (submitBtn) {
        submitBtn.style.display = 'none';
      }

      if (resetBtn) {
        resetBtn.style.display = 'inline-block';
      }

      // Disable all inputs
      this.container.querySelectorAll('input, button.flashcard-flip-btn, button.self-check-btn').forEach(el => {
        if (!el.classList.contains('quiz-reset-btn')) {
          el.disabled = true;
        }
      });

      // Scroll to results
      resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    resetQuiz() {
      // Reset results
      this.results = { total: 0, correct: 0, incorrect: 0 };
      this.userAnswers.clear();

      // Hide results
      const resultsDiv = this.container.querySelector('.quiz-results');
      if (resultsDiv) {
        resultsDiv.style.display = 'none';
      }

      // Reset all questions
      this.container.querySelectorAll('.quiz-question').forEach(question => {
        question.classList.remove('answered-correct', 'answered-incorrect');

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
        });

        // Reset hints
        question.querySelectorAll('.hint-content').forEach(hint => {
          hint.style.display = 'none';
        });
      });

      // Show submit button, hide reset button
      const submitBtn = this.container.querySelector('.quiz-submit-btn');
      const resetBtn = this.container.querySelector('.quiz-reset-btn');

      if (submitBtn) {
        submitBtn.style.display = 'inline-block';
      }

      if (resetBtn) {
        resetBtn.style.display = 'none';
      }

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
