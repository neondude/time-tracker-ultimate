function pad(number, width = 2) {
    const str = number.toString();
    const padding = '0'.repeat(Math.max(0, width - str.length));
    return padding + str;
}

function formatTime(duration) {
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((duration % (1000 * 60)) / 1000);
    const milliseconds = Math.floor((duration % 1000));
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(milliseconds, 3)}`;
}

class LapComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const lap = {
            id: this.getAttribute('data-id'),
            duration: this.getAttribute('data-duration'),
            note: this.getAttribute('data-note')
        };

        this.shadowRoot.innerHTML = `
            <button class="round-button" onclick="stopwatch.deleteLap('${lap.id}')">X</button>
            Lap: ${formatTime(lap.duration)} 
            <input type="text" placeholder="Add a note" 
                   value="${lap.note}" 
                   oninput="stopwatch.updateLapNote('${lap.id}', this.value)">
        `;
    }

    
}

window.customElements.define('lap-component', LapComponent);

class Stopwatch {
    constructor() {
        this.startTime = 0;
        this.isRunning = false;
        this.interval = null;
        this.laps = [];

        this.loadState();
        this.setupEventListeners();
        this.updateButtonStates();

        if (this.isRunning) {
            if (!this.interval) {
                this.interval = setInterval(() => this.updateTimer(), 10);
            }
        }

        this.displayLaps();
    }

    start() {
        if (!this.startTime) {
            this.startTime = new Date().getTime();
        }
        this.isRunning = true;
        this.updateButtonStates();
        this.saveState();
        if(!this.interval) {
            this.interval = setInterval(() => this.updateTimer(), 10);
        }
    }

    stop() {
        clearInterval(this.interval);
        this.isRunning = false;
        this.updateButtonStates();
        this.saveState();
        this.interval = null;
    }

    lap() {
        const currentTime = new Date().getTime();
        // const previousLapTime = this.laps.length > 0 ? this.laps[this.laps.length - 1].endTime : this.startTime;
        const lapTime = currentTime - this.startTime;
        this.laps.push({ startTime: this.startTime, endTime: currentTime, duration: lapTime, id: this.generateLapId(), note: '' });

        this.startTime = currentTime;
        this.saveState();
        this.saveLaps();
        this.displayLaps();
    }

    reset() {
        this.stop();
        this.startTime = 0;
        this.laps = [];
        localStorage.removeItem('startTime');
        localStorage.removeItem('isRunning');
        localStorage.removeItem('laps');
        document.getElementById('time').textContent = '00:00:00';
        document.getElementById('laps').innerHTML = '';
    }

    updateTimer() {
        const currentTime = new Date().getTime();
        const elapsedTime = currentTime - this.startTime;
        document.getElementById('time').textContent = formatTime(elapsedTime);
    }

    deleteLap(lapId) {
        this.laps = this.laps.filter(lap => lap.id !== lapId);
        this.saveLaps();
        this.displayLaps();
    }
    
    updateLapNote(lapId, note) {
        const lapIndex = this.laps.findIndex(lap => lap.id === lapId);
        if (lapIndex !== -1) {
            this.laps[lapIndex].note = note;
            this.saveLaps();
        }
    }
    
    displayLaps() {
        const lapsContainer = document.getElementById('laps');
        lapsContainer.innerHTML = '';
        this.laps.forEach(lap => {
            const lapElement = document.createElement('lap-component');
            lapElement.setAttribute('data-id', lap.id);
            lapElement.setAttribute('data-duration', lap.duration);
            lapElement.setAttribute('data-note', lap.note);
            lapsContainer.appendChild(lapElement);
        });
    }
    
    generateLapId() {
        return new Date().getTime() + Math.random().toString(36).substr(2, 9);
    }
    
    saveState() {
        localStorage.setItem('startTime', this.startTime.toString());
        localStorage.setItem('isRunning', this.isRunning.toString());
    }
    
    saveLaps() {
        localStorage.setItem('laps', JSON.stringify(this.laps));
    }
    
    loadState() {
        this.startTime = parseInt(localStorage.getItem('startTime'), 10) || 0;
        if (!this.startTime) {
            document.getElementById('time').textContent = '00:00:00';
        }
        this.isRunning = localStorage.getItem('isRunning') === 'true';
        this.laps = JSON.parse(localStorage.getItem('laps')) || [];
    }
    
    updateButtonStates() {
        document.getElementById('lap').disabled = !this.isRunning;
        document.getElementById('start').disabled = this.isRunning;
        document.getElementById('stop').disabled = !this.isRunning;
    }
    
    setupEventListeners() {
        document.getElementById('start').addEventListener('click', () => this.start());
        document.getElementById('stop').addEventListener('click', () => this.stop());
        document.getElementById('lap').addEventListener('click', () => this.lap());
        document.getElementById('reset').addEventListener('click', () => this.reset());
        window.addEventListener('storage', (event) => this.handleStorageChange(event));
    }
    
    handleStorageChange(event) {
        if (event.key === 'isRunning' || event.key === 'startTime' || event.key === 'laps') {
            this.loadState();
            this.updateButtonStates();
            if (this.isRunning) {
                if (!this.interval) {
                    this.interval = setInterval(() => this.updateTimer(), 10);
                }
            } else {
                clearInterval(this.interval);
                this.interval = null;
            }
            this.displayLaps();
        }
    }
}

const stopwatch = new Stopwatch();
