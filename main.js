const ORIGINAL = 'original';
const AMPLIFIED = 'amplified';
const WHISPERVOICE = 'whisper-voice';

let audioPlayers = {}
let type = "original";
let disabled = true;
let duration = 0;
let currentTime = 0;
let playInteval = 0;
let playing = false;

let playButtonElement;
let pauseButtonElement;

let originalButtonElement;
let amplifiedButtonElement;
let whisperVoiceButtonElement;

const spacePerTick = 5;
let amountOfTicks;
let audioBarElement;
let audioTickElements = [];
let pointerElement;

const readies = [];

const setupAudio = () => {
  const audioUrls = {
    [ORIGINAL]: "resources/whispp_nl.wav",
    [AMPLIFIED]: "resources/whispp_nl_converted_model_A.wav",
    [WHISPERVOICE]: "resources/whispp_nl_converted_model_B.wav",
  }

  for(let key of Object.keys(audioUrls)) {
    const audio = new Audio(audioUrls[key])
    audio.muted = true
    audio.addEventListener("play", () => setPlaying(true))
    audio.addEventListener("ended", () => (setPlaying(false), resetVisuals()))
    audio.addEventListener("pause", () => setPlaying(false))
    audio.addEventListener("loadeddata", () => {      
      readies.push(true)
      duration = audio.duration;
      disabled = !(readies.length === Object.keys(audioUrls).length)
    })
    audioPlayers[key] = audio
  }
  audioPlayers[type].muted = false
}

const playAudio = () => {
  if (playing) return
  for (let player of Object.values(audioPlayers)) {
    player.play()
  }
}

const switchType = (newType) => {
  getButtonByType(type).classList.remove('selected');
  getButtonByType(newType).classList.add('selected');
  audioPlayers[type].muted = true
  audioPlayers[newType].muted = false
  type = newType
}

const pause = () => {
  for (let player of Object.values(audioPlayers)) {
    player.pause()
    currentTime = audioPlayers[ORIGINAL].currentTime
  }
}

const reset = () => {
  for (let player of Object.values(audioPlayers)) {
    player.pause()
    player.currentTime = 0
    currentTime = 0;
    resetVisuals();
  }
}

const resetVisuals = () => {
  audioTickElements.forEach((e) => e.classList.remove('played'));
  pointerElement.style.left = "0%";
}

const getButtonByType = (type) => {
  switch (type) {
    case ORIGINAL: return originalButtonElement;
    case AMPLIFIED: return amplifiedButtonElement;
    case WHISPERVOICE: return whisperVoiceButtonElement;
  }
}

const setPlaying = (newPlaying) => {
  if (newPlaying == true) {
    pauseButtonElement.style.display = "block";
    playButtonElement.style.display = "none";
  } else {
    pauseButtonElement.style.display = "none";
    playButtonElement.style.display = "block";
  }
  playing = newPlaying
}

const setupAudioBar = () => {
  const availableWidth = audioBarElement.getBoundingClientRect().width;
  amountOfTicks = Math.floor(availableWidth / spacePerTick)
  for (let i = 0; i < amountOfTicks; i++) {
    const tick = document.createElement("span")
    const height = (Math.random() * 80 + 20) + "%";
    tick.classList.add('tick')
    tick.style.height = height;
    audioBarElement.appendChild(tick);
    audioTickElements.push(tick);
  }
}

const updateTime = () => {
  if (!playing) return;
  currentTime = audioPlayers[ORIGINAL].currentTime;
  const progress = currentTime / duration;
  visualizeProgress(progress);
}

const visualizeProgress = (progress) => {
  pointerElement.style.left = progress * 100 + "%";
  const amountOfPlayedTicks = Math.floor((audioTickElements.length-1) * progress)
  for (let i = 0; i < amountOfTicks; i++) {
    if (i < amountOfPlayedTicks) {
      audioTickElements[i].classList.add('played')
    } else {
      audioTickElements[i].classList.remove('played')
    }
  }
}

const jumpToTime = (e) => {
  const bounds = audioBarElement.getBoundingClientRect()
  const mousex = e.clientX
  const progress = (mousex - bounds.left) / bounds.width
  const newTime = duration * progress;
  for (let player of Object.values(audioPlayers)) {
    player.currentTime = newTime;
  }
  currentTime = newTime;
  visualizeProgress(progress);
  console.log(progress, mousex, bounds.left, bounds.width)
}

window.onload = () => {
  playButtonElement = document.querySelector("#multi-audio-player .playbutton");
  pauseButtonElement = document.querySelector("#multi-audio-player .pausebutton");

  originalButtonElement = document.querySelector("#multi-audio-player .originalButton");
  amplifiedButtonElement = document.querySelector("#multi-audio-player .amplifiedButton");
  whisperVoiceButtonElement = document.querySelector("#multi-audio-player .whisperVoiceButton");

  audioBarElement = document.querySelector("#multi-audio-player .audio-bar");
  pointerElement = document.querySelector("#multi-audio-player .pointer");
  setupAudioBar();

  pauseButtonElement.style.display = "none"
  switchType(ORIGINAL);
  playInteval = setInterval(updateTime, 100);
}

setupAudio()

