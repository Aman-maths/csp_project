const startButton = document.getElementById('start-btn');
const nextButton = document.getElementById('next-btn');
const restartButton = document.getElementById('restart-btn');
const questionContainerElement = document.getElementById('question-container');
const userInputElement = document.getElementById('user-input');
const quizSectionElement = document.getElementById('quiz-section');
const finalScoreElement = document.getElementById('final-score');
const finalScoreText = document.getElementById('final-score-text');
const questionElement = document.getElementById('question');
const answerButtonsElement = document.getElementById('answer-buttons');
const scoreElement = document.getElementById('score');
const userGreetingElement = document.getElementById('user-greeting');
const nameInput = document.getElementById('name');
const numQuestionsInput = document.getElementById('num-questions');
const categorySelect = document.getElementById('category');

let shuffledQuestions, currentQuestionIndex, score;
let totalQuestions;

let a = 1;

// Load categories when page loads
window.onload = loadCategories;

async function loadCategories() {
    const response = await fetch('https://opentdb.com/api_category.php');
    const data = await response.json();
    categorySelect.innerHTML = '<option value="">Random</option>';
    data.trivia_categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.innerText = category.name;
        categorySelect.appendChild(option);
    });
}

startButton.addEventListener('click', startQuiz);
nextButton.addEventListener('click', () => {
    currentQuestionIndex++;
    setNextQuestion();
});
restartButton.addEventListener('click', restartQuiz);

async function startQuiz() {
    const userName = nameInput.value.trim();
    totalQuestions = parseInt(numQuestionsInput.value);
    const categoryId = categorySelect.value;

    if (!userName) {
        alert("Please enter your name.");
        return;
    }

    startButton.classList.add('hide');
    userInputElement.classList.add('hide');
    quizSectionElement.classList.remove('hide');
    finalScoreElement.classList.add('hide');
    
    userGreetingElement.innerText = `Hello, ${userName}! Good luck!`;
    score = 0;
    updateScore(0);

    shuffledQuestions = await fetchQuestions(totalQuestions, categoryId);
    currentQuestionIndex = 0;
    setNextQuestion();
}

async function fetchQuestions(amount, category) {
    let url = `https://opentdb.com/api.php?amount=${amount}&type=multiple`;
    if (category) url += `&category=${category}`;

    const response = await fetch(url);
    const data = await response.json();
    return data.results.map(question => {
        const formattedQuestion = {
            question: question.question,
            answers: [...question.incorrect_answers, question.correct_answer].sort(() => Math.random() - 0.5),
            correctAnswer: question.correct_answer
        };
        return formattedQuestion;
    });
}

function setNextQuestion() {
    resetState();
    if (currentQuestionIndex < shuffledQuestions.length) {
        showQuestion(shuffledQuestions[currentQuestionIndex]);
    } else {
        endQuiz();
    }
}

function showQuestion(question) {
    questionElement.innerHTML = question.question;
    question.answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerText = answer;
        button.classList.add('btn');
        if (answer === question.correctAnswer) {
            button.dataset.correct = true;
        }
        button.addEventListener('click', selectAnswer);
        answerButtonsElement.appendChild(button);
    });
}

function resetState() {
    nextButton.classList.add('hide');
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
}

function selectAnswer(e) {
    const selectedButton = e.target;
    const correct = selectedButton.dataset.correct;
    setStatusClass(selectedButton, correct);
    Array.from(answerButtonsElement.children).forEach(button => {
        setStatusClass(button, button.dataset.correct);
    });

    if (correct) {
        updateScore(1);
    }

    if (shuffledQuestions.length > currentQuestionIndex + 1) {
        nextButton.classList.remove('hide');
    } else {
        endQuiz();
    }
}

function setStatusClass(element, correct) {
    clearStatusClass(element);
    if (correct) {
        element.classList.add('correct');
    } else {
        element.classList.add('wrong');
    }
}

function clearStatusClass(element) {
    element.classList.remove('correct');
    element.classList.remove('wrong');
}

function updateScore(points) {
    score += points;
    scoreElement.innerText = `Score: ${score}`;
}

function endQuiz() {
    quizSectionElement.classList.add('hide');
    finalScoreElement.classList.remove('hide');
    finalScoreText.innerText = `Your final score is: ${score} out of ${totalQuestions}`;
}

function restartQuiz() {
    startButton.innerText = 'Start Quiz';
    startButton.classList.remove('hide');
    userInputElement.classList.remove('hide');
    finalScoreElement.classList.add('hide');
    scoreElement.innerText = "Score: 0";
    score = 0;
}
