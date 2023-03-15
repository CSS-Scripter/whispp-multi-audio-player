const spacePerTick = 5;
// Tick sizes in % of available height;
const maxTickHeight = 100;
const minTickHeight = 20;

class AudioPlayer {
  players = {};

  // State Data
  currentAudioType = "original";
  disabled = false;
  playing = false;

  // Audio Data
  duration = 0;
  currentTime = 0;
  playInterval = 0;

  // HTML Elements
  rootElement;
  playButtonElement;
  pauseButtonElement;
  resetButtonElement;
  audioBarElement;
  audioTickElements = [];
  pointerElement;
  audioTypesElement;
  audioTypeButtonElements = {};
  
  amountOfTicks;

  constructor(htmlID, urls) {
    this.rootElement = document.querySelector(`#${htmlID}`);
    this.setupElements();
    this.setupPlayers(urls);
    this.setupAudioBar();
    this.switchType(Object.keys(urls)[0]);
    this.playInterval = setInterval(() => this.updateTime(), 100);
  }

  setupPlayers(urls) {
    this.currentAudioType = Object.keys(urls)[0];
    for(let key of Object.keys(urls)) {
      this.players[key] = this.createAudio(urls[key])

      const buttonElement = document.createElement("button")
      buttonElement.innerText = key;
      buttonElement.addEventListener("click", () => this.switchType(key));
      this.audioTypesElement.appendChild(buttonElement);
      this.audioTypeButtonElements[key] = buttonElement;
    }
    this.players[this.currentAudioType].muted = false
  }

  setupElements() {
    this.setupLeftSideActionsElements();
    this.setupAudioBarElements();
    this.setupAudioTypesElement();
  }

  setupLeftSideActionsElements() {
    const leftSideActions = document.createElement('div');
    leftSideActions.classList.add('leftside-actions');

    const playPauseActions = document.createElement('div');
    playPauseActions.classList.add('play-pause');

    this.playButtonElement = this.createButton('playbutton', () => this.play(), 'resources/play.svg', 'play');
    this.pauseButtonElement = this.createButton('pausebutton', () => this.pause(), 'resources/pause.svg', 'pause');
    this.resetButtonElement = this.createButton('resetbutton', () => this.reset(), 'resources/skip-back.svg', 'reset');

    this.pauseButtonElement.style.display = "none";

    playPauseActions.appendChild(this.playButtonElement);
    playPauseActions.appendChild(this.pauseButtonElement);
    leftSideActions.appendChild(playPauseActions);
    leftSideActions.appendChild(this.resetButtonElement);

    this.rootElement.append(leftSideActions);
  }

  setupAudioBarElements() {
    this.audioBarElement = document.createElement('div');
    this.audioBarElement.classList.add('audio-bar');
    this.audioBarElement.addEventListener("click", (e) => this.jumpToTime(e));
    
    this.pointerElement = document.createElement('span');
    this.pointerElement.classList.add('pointer');

    this.audioBarElement.appendChild(this.pointerElement);
    this.rootElement.appendChild(this.audioBarElement);
  }

  setupAudioTypesElement() {
    this.audioTypesElement = document.createElement('div');
    this.audioTypesElement.classList.add('audio-types');
    this.rootElement.appendChild(this.audioTypesElement);
  }

  createButton(classname, onclick, src, alt) {
    const button = document.createElement('button');
    button.classList.add(classname);
    button.addEventListener('click', onclick);

    const image = document.createElement('img');
    image.src = src;
    image.alt = alt;
    button.appendChild(image);

    return button;
  }

  createAudio(url) {
    const audio = new Audio(url);
    audio.muted = true;
    audio.addEventListener("play", () => this.setPlaying(true));
    audio.addEventListener("ended", () => (this.setPlaying(false), this.resetVisuals()));
    audio.addEventListener("pause", () => this.setPlaying(false));
    audio.addEventListener("loadeddata", () => (this.duration = audio.duration));
    return audio;
  }

  setupAudioBar() {
    // Calculate amount of ticks
    const availableWidth = this.audioBarElement.getBoundingClientRect().width;
    this.amountOfTicks = Math.floor(availableWidth / spacePerTick);
    
    // Create the tick elements
    for (let i = 0; i < this.amountOfTicks; i++) {
      const tick = document.createElement("span");
      const height = (Math.random() * (maxTickHeight - minTickHeight) + minTickHeight) + "%";
      tick.classList.add('tick');
      tick.style.height = height;
      this.audioBarElement.appendChild(tick);
      this.audioTickElements.push(tick);
    }
  }

  switchType(newType) {
    this.audioTypeButtonElements[this.currentAudioType].classList.remove('selected');
    this.audioTypeButtonElements[newType].classList.add('selected');
    this.players[this.currentAudioType].muted = true;
    this.players[newType].muted = false;
    this.currentAudioType = newType;
  }

  play() {
    if (this.playing) return;
    for (let player of Object.values(this.players)) {
      player.play();
    }
    this.playing = true;
  }

  pause() {
    if (!this.playing) return;
    for (let player of Object.values(this.players)) {
      player.pause();
    }
    this.currentTime = Object.values(this.players)[0].currentTime;
    this.playing = false;
  }

  reset() {
    for (let player of Object.values(this.players)) {
      player.pause();
      player.currentTime = 0;
    }
    this.resetVisuals();
    this.currentTime = 0;
  }

  resetVisuals() {
    this.audioTickElements.forEach((e) => e.classList.remove('played'));
    this.pointerElement.style.left = "0%";
  }

  setPlaying(newPlaying) {
    if (newPlaying == true) {
      this.pauseButtonElement.style.display = "block";
      this.playButtonElement.style.display = "none";
    } else {
      this.pauseButtonElement.style.display = "none";
      this.playButtonElement.style.display = "block";
    }
    this.playing = newPlaying
  }

  updateTime() {
    if (!this.playing) return;
    this.currentTime = Object.values(this.players)[0].currentTime;
    const progress = this.currentTime / this.duration;
    this.visualizeProgress(progress);
  }

  visualizeProgress(progress) {
    this.pointerElement.style.left = progress * 100 + "%";
    const amountOfPlayedTicks = Math.floor((this.audioTickElements.length-1) * progress);
    for (let i = 0; i < this.audioTickElements.length; i++) {
      if (i < amountOfPlayedTicks) {
        this.audioTickElements[i].classList.add('played')
      } else {
        this.audioTickElements[i].classList.remove('played')
      }
    }
  }

  jumpToTime(e) {
    const bounds = this.audioBarElement.getBoundingClientRect();
    const mousex = e.clientX;
    const progress = (mousex - bounds.left) / bounds.width;
    const newTime = this.duration * progress;
    for (let player of Object.values(this.players)) {
      player.currentTime = newTime;
    }
    this.currentTime = newTime;
    this.visualizeProgress(progress);
  }
}