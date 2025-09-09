class AlphabetGame {
    constructor() {
        this.alphabetMapping = {
            'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9, 'J': 10,
            'K': 11, 'L': 12, 'M': 13, 'N': 14, 'O': 15, 'P': 16, 'Q': 17, 'R': 18, 'S': 19, 'T': 20,
            'U': 21, 'V': 22, 'W': 23, 'X': 24, 'Y': 25, 'Z': 26
        };
        
        this.numberToLetterMapping = {};
        Object.keys(this.alphabetMapping).forEach(letter => {
            this.numberToLetterMapping[this.alphabetMapping[letter]] = letter;
        });

        this.currentMode = null;
        this.currentQuestion = null;
        this.currentAnswer = null;
        this.score = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.gameActive = false;

        this.initializeElements();
        this.attachEventListeners();
        this.showScreen('main-menu');
    }

    initializeElements() {
        // Screens
        this.mainMenuScreen = document.getElementById('main-menu');
        this.gameScreen = document.getElementById('game-screen');
        this.gameOverScreen = document.getElementById('game-over');

        // Game elements
        this.questionPrompt = document.getElementById('question-prompt');
        this.questionDisplay = document.getElementById('question-display');
        this.multipleChoice = document.getElementById('multiple-choice');
        this.typeAnswer = document.getElementById('type-answer');
        this.answerInput = document.getElementById('answer-input');
        this.choiceButtons = document.querySelectorAll('.choice-btn');

        // UI elements
        this.currentScore = document.getElementById('current-score');
        this.currentTime = document.getElementById('current-time');
        this.finalScore = document.getElementById('final-score');
        this.finalTime = document.getElementById('final-time');

        // Buttons
        this.modeButtons = document.querySelectorAll('.mode-btn');
        this.quitGameBtn = document.getElementById('quit-game');
        this.playAgainBtn = document.getElementById('play-again');
        this.changeModeBtn = document.getElementById('change-mode');
    }

    attachEventListeners() {
        // Mode selection
        this.modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = parseInt(e.currentTarget.dataset.mode);
                this.startGame(mode);
            });
        });

        // Multiple choice buttons
        this.choiceButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (this.gameActive) {
                    this.handleMultipleChoiceAnswer(e.currentTarget.dataset.answer);
                }
            });
        });

        // Type answer input
        this.answerInput.addEventListener('input', (e) => {
            if (this.gameActive) {
                this.handleTypedAnswer(e.target.value);
            }
        });

        // Control buttons
        this.quitGameBtn.addEventListener('click', () => this.endGame());
        this.playAgainBtn.addEventListener('click', () => this.startGame(this.currentMode));
        this.changeModeBtn.addEventListener('click', () => this.showScreen('main-menu'));
    }

    startGame(mode) {
        // Reset game state completely
        this.stopTimer();
        this.currentMode = mode;
        this.score = 0;
        this.startTime = Date.now();
        this.gameActive = true;

        // Reset UI immediately
        this.updateScore();
        this.resetTimer();
        this.startTimer();
        this.setupGameMode();
        this.generateQuestion();
        this.showScreen('game-screen');
    }

    setupGameMode() {
        // Hide both answer sections first
        this.multipleChoice.classList.add('hidden');
        this.typeAnswer.classList.add('hidden');

        // Clear any previous input
        this.answerInput.value = '';

        // Reset button states
        this.choiceButtons.forEach(btn => {
            btn.classList.remove('correct', 'incorrect');
        });

        // Setup based on mode
        switch (this.currentMode) {
            case 1: // Letter to Number (Multiple Choice)
                this.questionPrompt.textContent = 'What is the position of:';
                this.multipleChoice.classList.remove('hidden');
                break;
            case 2: // Number to Letter (Multiple Choice)
                this.questionPrompt.textContent = 'Which letter is at position:';
                this.multipleChoice.classList.remove('hidden');
                break;
            case 3: // Letter to Number (Type)
                this.questionPrompt.textContent = 'Type the position of:';
                this.typeAnswer.classList.remove('hidden');
                setTimeout(() => this.answerInput.focus(), 100);
                break;
            case 4: // Number to Letter (Type)
                this.questionPrompt.textContent = 'Type the letter at position:';
                this.typeAnswer.classList.remove('hidden');
                setTimeout(() => this.answerInput.focus(), 100);
                break;
        }
    }

    generateQuestion() {
        const letters = Object.keys(this.alphabetMapping);
        const randomLetter = letters[Math.floor(Math.random() * letters.length)];
        const randomNumber = Math.floor(Math.random() * 26) + 1;

        // Reset visual feedback classes
        this.questionDisplay.classList.remove('correct-feedback', 'incorrect-feedback');

        switch (this.currentMode) {
            case 1: // Letter to Number
                this.currentQuestion = randomLetter;
                this.currentAnswer = this.alphabetMapping[randomLetter];
                this.questionDisplay.textContent = randomLetter;
                this.generateMultipleChoiceNumbers(this.currentAnswer);
                break;
            case 2: // Number to Letter
                this.currentQuestion = randomNumber;
                this.currentAnswer = this.numberToLetterMapping[randomNumber];
                this.questionDisplay.textContent = randomNumber;
                this.generateMultipleChoiceLetters(this.currentAnswer);
                break;
            case 3: // Letter to Number (Type)
                this.currentQuestion = randomLetter;
                this.currentAnswer = this.alphabetMapping[randomLetter];
                this.questionDisplay.textContent = randomLetter;
                break;
            case 4: // Number to Letter (Type)
                this.currentQuestion = randomNumber;
                this.currentAnswer = this.numberToLetterMapping[randomNumber];
                this.questionDisplay.textContent = randomNumber;
                break;
        }
    }
    shuffle(array) {
        let a = array.slice(); // copy, so you don't ruin the original
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
          return a;
    }
    generateMultipleChoiceNumbers(correctAnswer) {
        const options = new Set();
        options.add(correctAnswer);

        // Generate continuous range around correct answer
        let attempts = 0;
        while (options.size < 5 && attempts < 20) {
            const offset = Math.floor(Math.random() * 5) - 2; // -2 to +2
            const candidate = correctAnswer + offset;
            if (candidate >= 1 && candidate <= 26) {
                options.add(candidate);
            }
            attempts++;
        }

        // If we still don't have 5 options, fill randomly
        while (options.size < 5) {
            const random = Math.floor(Math.random() * 26) + 1;
            options.add(random);
        }

        // const optionsArray = Array.from(options).sort((a, b) => a - b);
        

        const optionsArray = Array.from(options);
        const randomized = shuffle(optionsArray);
        this.setChoiceButtonsContent(randomized);
    }

    generateMultipleChoiceLetters(correctAnswer) {
        const correctPosition = this.alphabetMapping[correctAnswer];
        const options = new Set();
        options.add(correctAnswer);

        // Generate continuous range around correct letter
        let attempts = 0;
        while (options.size < 5 && attempts < 20) {
            const offset = Math.floor(Math.random() * 5) - 2; // -2 to +2
            const candidatePosition = correctPosition + offset;
            if (candidatePosition >= 1 && candidatePosition <= 26) {
                options.add(this.numberToLetterMapping[candidatePosition]);
            }
            attempts++;
        }

        // If we still don't have 5 options, fill randomly
        while (options.size < 5) {
            const randomPosition = Math.floor(Math.random() * 26) + 1;
            options.add(this.numberToLetterMapping[randomPosition]);
        }

        // const optionsArray = Array.from(options).sort();
        cconst optionsArray = Array.from(options);
        const randomized = shuffle(optionsArray);
        this.setChoiceButtonsContent(randomized);
    }

    setChoiceButtonsContent(options) {
        this.choiceButtons.forEach((btn, index) => {
            if (index < options.length) {
                btn.textContent = options[index];
                btn.dataset.answer = options[index];
                btn.classList.remove('correct', 'incorrect');
            }
        });
    }

    handleMultipleChoiceAnswer(selectedAnswer) {
        if (!this.gameActive) return;

        const isCorrect = selectedAnswer == this.currentAnswer;
        
        // Visual feedback
        this.choiceButtons.forEach(btn => {
            if (btn.dataset.answer == this.currentAnswer) {
                btn.classList.add('correct');
            } else if (btn.dataset.answer == selectedAnswer && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });

        if (isCorrect) {
            this.score++;
            this.updateScore();
            this.questionDisplay.classList.add('correct-feedback');
            
            setTimeout(() => {
                this.questionDisplay.classList.remove('correct-feedback');
                this.generateQuestion();
            }, 800);
        } else {
            this.questionDisplay.classList.add('incorrect-feedback');
            setTimeout(() => {
                this.endGame();
            }, 1200);
        }
    }

    handleTypedAnswer(value) {
        if (!this.gameActive || value.length === 0) return;

        let userAnswer;
        let isCorrect = false;

        if (this.currentMode === 3) { // Letter to Number
            userAnswer = parseInt(value);
            if (userAnswer >= 1 && userAnswer <= 26) {
                isCorrect = userAnswer === this.currentAnswer;
            }
        } else if (this.currentMode === 4) { // Number to Letter
            userAnswer = value.toUpperCase();
            if (userAnswer.length === 1 && /^[A-Z]$/.test(userAnswer)) {
                isCorrect = userAnswer === this.currentAnswer;
            }
        }

        // Auto-submit when valid answer is entered
        if ((this.currentMode === 3 && userAnswer >= 1 && userAnswer <= 26) ||
            (this.currentMode === 4 && /^[A-Z]$/.test(userAnswer))) {
            
            if (isCorrect) {
                this.score++;
                this.updateScore();
                this.questionDisplay.classList.add('correct-feedback');
                this.answerInput.value = '';
                
                setTimeout(() => {
                    this.questionDisplay.classList.remove('correct-feedback');
                    this.generateQuestion();
                    this.answerInput.focus();
                }, 800);
            } else {
                this.questionDisplay.classList.add('incorrect-feedback');
                setTimeout(() => {
                    this.endGame();
                }, 1200);
            }
        }
    }

    updateScore() {
        this.currentScore.textContent = this.score;
    }

    resetTimer() {
        this.currentTime.textContent = '00:00';
    }

    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            this.currentTime.textContent = this.formatTime(elapsed);
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    endGame() {
        this.gameActive = false;
        this.stopTimer();
        
        const totalTime = Math.floor((Date.now() - this.startTime) / 1000);
        this.finalScore.textContent = this.score;
        this.finalTime.textContent = this.formatTime(totalTime);
        
        setTimeout(() => {
            this.showScreen('game-over');
        }, 500);
    }

    showScreen(screenName) {
        // Hide all screens
        this.mainMenuScreen.classList.remove('active');
        this.mainMenuScreen.classList.add('hidden');
        this.gameScreen.classList.remove('active');
        this.gameScreen.classList.add('hidden');
        this.gameOverScreen.classList.remove('active');
        this.gameOverScreen.classList.add('hidden');

        // Show selected screen
        let targetScreen;
        switch (screenName) {
            case 'main-menu':
                targetScreen = this.mainMenuScreen;
                break;
            case 'game-screen':
                targetScreen = this.gameScreen;
                break;
            case 'game-over':
                targetScreen = this.gameOverScreen;
                break;
        }
        
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            targetScreen.classList.add('active');
        }

        // Focus input if on game screen with typing mode
        if (screenName === 'game-screen' && (this.currentMode === 3 || this.currentMode === 4)) {
            setTimeout(() => this.answerInput.focus(), 200);
        }
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AlphabetGame();
});
