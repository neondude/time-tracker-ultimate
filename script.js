let startTime = localStorage.getItem('startTime');
let interval;
let laps = JSON.parse(localStorage.getItem('laps')) || [];
let isRunning = false;

function startTimer() {
    if (!startTime) {
        startTime = new Date().getTime();
        localStorage.setItem('startTime', startTime);
    }
    isRunning = true;
    updateButtonStates();
    interval = setInterval(updateTimer, 1000);
}

function stopTimer() {
    clearInterval(interval);
    isRunning = false;
    updateButtonStates();
    interval = null;
}

function lapTimer() {
    const currentTime = new Date().getTime();
    const previousLapTime = laps.length > 0 ? laps[laps.length - 1].endTime : startTime;
    const lapTime = currentTime - previousLapTime;
    laps.push({ startTime: previousLapTime, endTime: currentTime, duration: lapTime, id: generateLapId(), note: '' });
    localStorage.setItem('laps', JSON.stringify(laps));
    displayLaps();
}
function updateLapNote(lapId, note) {
    const lapIndex = laps.findIndex(lap => lap.id === lapId);
    if (lapIndex !== -1) {
        laps[lapIndex].note = note;
        localStorage.setItem('laps', JSON.stringify(laps));
    }
}

function deleteLap(lapId) {
    laps = laps.filter(lap => lap.id !== lapId);
    localStorage.setItem('laps', JSON.stringify(laps));
    displayLaps();
}

function generateLapId() {
    return new Date().getTime() + Math.random().toString(36).substr(2, 9);
}

function resetTimer() {
    stopTimer();
    localStorage.removeItem('startTime');
    localStorage.removeItem('laps');
    startTime = null;
    laps = [];
    document.getElementById('time').textContent = '00:00:00';
    document.getElementById('laps').innerHTML = '';
}

function updateTimer() {
    const currentTime = new Date().getTime();
    const elapsedTime = currentTime - startTime;
    displayTime(elapsedTime, 'time');
}

function displayTime(duration, elementId) {
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((duration % (1000 * 60)) / 1000);
    document.getElementById(elementId).textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function formatLapTime(duration) {
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((duration % (1000 * 60)) / 1000);
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function displayLaps() {
    const lapsContainer = document.getElementById('laps');
    lapsContainer.innerHTML = '';
    laps.forEach(lap => {
        const lapElement = document.createElement('div');
        lapElement.innerHTML = `Lap Duration: ${formatLapTime(lap.duration)} 
                                <button onclick="deleteLap('${lap.id}')">Delete</button>
                                <input type="text" placeholder="Add a note" 
                                       value="${lap.note}" 
                                       oninput="updateLapNote('${lap.id}', this.value)">
                                `;
        lapsContainer.appendChild(lapElement);
    });
}

function pad(number) {
    return number < 10 ? '0' + number : number;
}

function updateButtonStates() {
    document.getElementById('lap').disabled = !isRunning;
}

document.getElementById('start').addEventListener('click', startTimer);
document.getElementById('stop').addEventListener('click', stopTimer);
document.getElementById('lap').addEventListener('click', lapTimer);
document.getElementById('reset').addEventListener('click', resetTimer);

if (startTime && !interval) {
    isRunning = true;
    startTimer();
} else {
    isRunning = false;
}

updateButtonStates();


function checkRefresh() {
    if (!localStorage.getItem('startTime')) {
        resetTimer();
    } else {
        isRunning = true;
        updateButtonStates();
        displayLaps();
    }
}
window.onload = checkRefresh;
