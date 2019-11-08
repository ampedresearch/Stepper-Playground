// Playground.js
// Willie Payne
// Uses a JSON file created from: http://tonejs.github.io/MidiConvert/
// That data is stored in routine.js which is loaded before this file

// This file will play back a dance routine allowing the user to customize
// certain aspects of its playback.

// Ideas
// Since we are essentially using multiple samplers, we could even have the
// girls record their own audio files for this...
// We could plot all of the onset times relative to the beat
// Scrollable canvas would be crazy cool!

// Known Bugs

// Open question - should tempo affect visualization speed
// Particles and columns will need to be instantiated with a rate then

// TODO
// Grey out button on
// Onhover with sliders to indicate reset must be pressed

// ----------------------General Music Variables----------------------
let routineTempo = routine.header.bpm; // Tempo of MIDI file
let parts = []; // Stores the score for each dancer
let stompMIDIVal = 'B1';
let clapMIDIVal = 'D#2';

// Starting values and ranges for what the user can control
let tempoRange = {min:55, max:100, default:70};
let steppersRange = {min:1, max:6, default:1};
let onsetsRange = {min:0.01, max:0.2, default:0.01};

// Where the audio is panned based on the number of steppers selected
let panValues = {
    1: [0],
    2: [-0.5, 0.5],
    3: [-0.75, 0, 0.75],
    4: [-0.75, -0.25, 0.25, 0.75],
    5: [-0.8, -0.4, 0, 0.4, 0.8],
    6: [-1, -0.6, -0.20, 0.20, 0.60, 1]
};

// ----------------------Musical Parameters to control----------------------
let tempo = tempoRange.default;
let numberOfSteppers = steppersRange.default;
let onsetSD = onsetsRange.default;

// ----------------------General Visual Variables----------------------
let p5Canvas;
let particles = new Particles();
let launchers = new Launchers();
let columns = new Columns();

let bgColors = {
    current: {r:250, g:250, b:250},
    standard: {r:250, g:250, b:250},
    reset: {r:26, g:188, b:156}
}

// ----------------------Tone Initialization----------------------
let reverb = new Tone.Freeverb();
let steppers = loadAllSteppers('audio/claps/', 'audio/stomps/',
                               10, steppersRange.max);
wireUpSteppers(steppers, reverb);

// ----------------------DOM Elements----------------------
let controls = document.getElementById('controls');
let description = document.getElementById('description');

let playButton = createButton('Start');
let resetButton = createButton('Reset');

let [tempoSlider, tempoSliderVal] = createSlider(tempoRange.min, tempoRange.max, tempoRange.default, 1);
let [stepperSlider, stepperSliderVal] = createSlider(steppersRange.min, steppersRange.max, steppersRange.default, 1);
let [onsetsSDSlider, onsetsSDSliderVal] = createSlider(onsetsRange.min, onsetsRange.max, onsetsRange.default, .01);

// Add callback functions
playButton.addEventListener('click', playButtonCallback);
resetButton.addEventListener('click', resetButtonCallback);

tempoSlider.addEventListener('mouseup', tempoSliderCallback);
tempoSlider.addEventListener('input', tempoSliderInputCallback);
stepperSlider.addEventListener('mouseup', stepperSliderCallback);
stepperSlider.addEventListener('input', stepperSliderInputCallback);
onsetsSDSlider.addEventListener('mouseup', onsetsSDSliderCallback);
onsetsSDSlider.addEventListener('input', onsetsSDSliderInputCallback);

// Add to DOM
appendSlider(tempoSlider, tempoSliderVal, 'Tempo', controls);
appendSlider(stepperSlider, stepperSliderVal, 'Dancers', controls);
appendSlider(onsetsSDSlider, onsetsSDSliderVal, 'Onset Range', controls);

description.appendChild(playButton);
description.appendChild(resetButton);

rangeSlider(); // Display values for range sliders

// ----------------------Visual p5.js Elements----------------------
function setup() {
    p5Canvas = createCanvas(windowWidth - 60, windowHeight/4);
    p5Canvas.parent('p5_canvas');

    // Set up the launcher images to match the default settings
    launchers.updatePositions(steppersRange.default);
    launchers.stretch(tempoRange.default, tempoRange);
    launchers.setColor(onsetsRange.default, onsetsRange);
    launchers.pushOffscreen();

    background(bgColors.current.r, bgColors.current.g, bgColors.current.b);
}

function draw() {
    updateBackground()
    background(bgColors.current.r, bgColors.current.g, bgColors.current.b);

    columns.update(Tone.Transport.state != 'paused');
    columns.show();

    particles.update(Tone.Transport.state != 'paused');
    particles.show();

    launchers.update();
    launchers.show();
}

function windowResized() {
    resizeCanvas(windowWidth - 60, windowHeight/4);
    launchers.resize();
    launchers.setColor(onsetsSDSlider.value, onsetsRange);
    launchers.stretch(tempoSlider.value, tempoRange);

    particles.resize(launchers.getPositions());
    columns.resize();
}

function updateBackground() {
    let lerper = 0.1;
    bgColors.current.r = lerp(bgColors.current.r, bgColors.standard.r, lerper)
    bgColors.current.g = lerp(bgColors.current.g, bgColors.standard.g, lerper)
    bgColors.current.b = lerp(bgColors.current.b, bgColors.standard.b, lerper)
}

function triggerResetColor() {
    bgColors.current.r = bgColors.reset.r;
    bgColors.current.g = bgColors.reset.g;
    bgColors.current.b = bgColors.reset.b;
}

// ----------------------Main Functions----------------------
// Starts music, sets tempo, disables some interface tools
function startMusic() {
    // Do not create new tracks if the Transport is only paused
    if (Tone.Transport.state == 'stopped') {
        parts = createPart(steppers, numberOfSteppers);
        Tone.Transport.bpm.value = tempo;
        changePan(steppers, numberOfSteppers, panValues);
    }
    Tone.Transport.start();
}

function pauseMusic() {
    Tone.Transport.pause();
}

// Starts music, sets tempo, enables some interface tools
function stopMusic() {
    Tone.Transport.stop();
    particles.clear();
    columns.clear();
    for (p in parts) {
        parts[p].removeAll();
        parts[p].dispose();
    }
    parts = [];
}

// Uses the MIDI score we converted to JSON to actually schedule the music
// that gets played.
function createPart(steppers, numberOfSteppers) {
    // First set the tempo to match the MIDI file
    // This will ensure all of the durations are created correctly
    Tone.Transport.bpm.value = routineTempo;
    let newRoutines = [];
    let newParts = [];

    for (let i = 0; i < numberOfSteppers; i++) {
        let newRoutine = randomizeRoutine(routine.tracks[1].notes);
        newRoutines.push(newRoutine);
    }

    // Ensure that the earliest note happens at 0
    newRoutines = shiftScoreRight(newRoutines);

    for (let i = 0; i < numberOfSteppers; i++) {
        let newPart = new Tone.Part(function(time, note) {
            scheduleNote(steppers[i], i, time, note);
        }, newRoutines[i]).start();
        newParts.push(newPart);
    }

    // The final part resets the app state once the music is finished
    let lastTime = determineLastTime(newRoutines);
    let finalEvent = new Tone.Part(function(time){
        playButtonCallback();
        playButton.disabled = true;
    }, [[lastTime]]).start();

    newParts.push(finalEvent);

    return newParts;
}

// Playback and visual function for every audio event
//  Plays a selected stomp or clap with random loaded audio file
//  Triggers launchers to animate and creates new particle
function scheduleNote(stepper, stepperNum, time, note) {
    let randNote = randomIntRange(1, 10); // Don't hardcode in this 10
    let audioType, audioLetter;

    if (note.name == stompMIDIVal) {
        audioType = stepper.stomps;
        audioLetter = 's';
    }
    else if (note.name == clapMIDIVal) {
        audioType = stepper.claps;
        audioLetter = 'c';
    }
    else { return false; }

    if (audioType.loaded) {
        let audioName = createFileName(audioLetter, randNote);
        audioType.get(audioName).start(time);
        particles.addParticle(launchers.getPosition(stepperNum), audioLetter, stepperNum);
        launchers.bump(stepperNum);
    }
}

// Generates a new midiRoutine with random offsets added to the event times
function randomizeRoutine(midiRoutine) {
    let newRoutine = [];
    for (r in midiRoutine) {
        let randomOffset = randomNormal(0, onsetSD);
        let newMIDIEvent = {
            name: midiRoutine[r].name,
            midi: midiRoutine[r].midi,
            time: midiRoutine[r].time + randomOffset,
            velocity: midiRoutine[r].velocity,
            duration: midiRoutine[r].duration
        };
        newRoutine.push(newMIDIEvent);
    }
    return newRoutine;
}

// Ensure that the earliest musical event is at 0
function shiftScoreRight(routines) {
    let firstTimes = routines.map(events => events[0].time);
    let minTime = Math.min(...firstTimes);
    if (minTime < 0) {
        for (let routine of routines) {
            for (let event of routine) {
                event.time -= minTime;
            }
        }
    }
    return routines;
}

// Figure out the timing of the final event
function determineLastTime(routines) {
    let lastTimes = routines.map(events => events.slice(-1)[0].time);
    let lastTime = Math.max(...lastTimes);

    return lastTime;
}

function loadAllSteppers(clapsFolder, stompsFolder, numAudioFiles, maxSteppers) {
    let newSteppersArray = [];

    let clapsURLs = createFileNames(clapsFolder, 'c', numAudioFiles);
    let stompsURLs = createFileNames(stompsFolder, 's', numAudioFiles);

    // This is a lot of loading. Might there be a better way?
    // I am not sure how to do a deep clone of a players object
    // Do I even want to use multiple players objects?
    for (let i = 0; i < maxSteppers; i++) {
        let claps = new Tone.Players(clapsURLs); // TODO - add Fadeout
        let stomps = new Tone.Players(stompsURLs);
        let stepper = {claps:claps, stomps:stomps};
        newSteppersArray.push(stepper);
    }

    return newSteppersArray;
}

// Build the signal chain
function wireUpSteppers(steppers, reverb) {
    steppers.forEach(function(s) {
        let pan = new Tone.PanVol(0, 0);
        s.pan = pan;
        s.claps.chain(pan, reverb, Tone.Master);
        s.stomps.chain(pan, reverb, Tone.Master);
    });

    return steppers;
}

// Space the dancers an optimal distance apart to increase audio quality
function changePan(steppers, numberOfSteppers, panValues) {
    for (let i = 0; i < numberOfSteppers; i++) {
        steppers[i].pan.pan.value = panValues[numberOfSteppers][i];
    }
    return steppers;
}

// Schedule an event at every quarter note for visualization (or metronome)
Tone.Transport.scheduleRepeat(function(time){
	columns.addColumn();
}, "4n");

// ----------------------DOM Callback Functions----------------------
function playButtonCallback() {
    if (this.value == 'Start') {
        if (Tone.context.state !== 'running') {
            Tone.context.resume();
        }
        startMusic();
        this.value = 'Pause';
        this.textContent = 'Pause';
        disableSliders(true);
        resetButton.disabled = true;
    }
    else {
        pauseMusic();
        this.value = 'Start';
        this.textContent = 'Start';
        resetButton.disabled = false;
    }
}

function resetButtonCallback() {
    stopMusic();
    playButton.value = 'Start';
    playButton.textContent = 'Start';
    disableSliders(false);
    playButton.disabled = false;
    triggerResetColor();
    launchers.pushOffscreen();
}

function tempoSliderCallback() {
    tempo = this.value;
}

function tempoSliderInputCallback() {
    launchers.stretch(this.value, tempoRange);
}

function stepperSliderCallback() {
    numberOfSteppers = this.value;
}

function stepperSliderInputCallback() {
    launchers.updatePositions(this.value);
    launchers.stretch(tempoSlider.value, tempoRange);
    launchers.setColor(onsetsSDSlider.value, onsetsRange);
}

function onsetsSDSliderCallback() {
    onsetSD = this.value;
}

function onsetsSDSliderInputCallback() {
    launchers.setColor(this.value, onsetsRange);
}

function disableSliders(yesOrNo) {
    tempoSlider.disabled = yesOrNo;
    stepperSlider.disabled = yesOrNo;
    onsetsSDSlider.disabled = yesOrNo;
}

// ----------------------Helper Functions----------------------

// Approximation of a normal distribution
// https://stackoverflow.com/questions/20160827/when-generating-normally-distributed-random-values-what-is-the-most-efficient-w
function randomNormal(mean, sd) {
    let randVal = ((Math.random() + Math.random() + Math.random()
    + Math.random() + Math.random() + Math.random()) - 3) / 3;

    return ((randVal * sd) + mean);
}

function randomIntRange(min, max) {
    return (Math.floor(Math.random() * (max - min)) + min);
}

function createFileNames(directory, letter, numAudioFiles) {
    let numbers = [...Array(numAudioFiles).keys()].map(x => ++x);
    let newFileNames = {};

    numbers.forEach(function(i) {
        let fileName = createFileName(letter, i);
        newFileNames[fileName] = directory + fileName + '.wav';
    });

    return newFileNames;
}

function createFileName(letter, number) {
    return letter + number.toString().padStart(2, '0');
}

function createButton(value) {
    let newButton = document.createElement('BUTTON');
    newButton.value = value;
    newButton.appendChild(document.createTextNode(value));

    return newButton;
}

function createSlider(minVal, maxVal, defaultVal, step) {
    let newSlider = document.createElement('INPUT');
    newSlider.setAttribute("type", "range");
    newSlider.setAttribute("class", "range-slider__range");
    newSlider.min = minVal;
    newSlider.max = maxVal;
    newSlider.step = step;
    newSlider.value = defaultVal;

    let newSliderVal = document.createElement('SPAN');
    newSliderVal.setAttribute("class", "range-slider__value");
    newSliderVal.innerHTML = defaultVal;

    return [newSlider, newSliderVal];
}

function appendSlider(slider, sliderVal, name, whereTo) {
    let newDiv = document.createElement('DIV');
    newDiv.setAttribute("class", "range-slider");

    let newSliderName = document.createElement('SPAN');
    newSliderName.setAttribute("class", "range-slider__name");
    newSliderName.innerHTML = name;

    newDiv.appendChild(newSliderName);
    newDiv.appendChild(slider);
    newDiv.appendChild(sliderVal);
    whereTo.appendChild(newDiv);
}
