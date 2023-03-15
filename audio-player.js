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
    console.log(this.rootElement, `#${htmlID}`);
    this.loadElements();
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

  loadElements() {
    this.playButtonElement = this.rootElement.querySelector(".playbutton");
    this.pauseButtonElement = this.rootElement.querySelector(".pausebutton");
    this.resetButtonElement = this.rootElement.querySelector(".resetbutton");

    this.playButtonElement.addEventListener("click", () => this.play());
    this.pauseButtonElement.addEventListener("click", () => this.pause());
    this.resetButtonElement.addEventListener("click", () => this.reset());

    this.audioTypesElement = this.rootElement.querySelector(".audio-types")
    this.audioBarElement = this.rootElement.querySelector(".audio-bar")
    this.pointerElement = this.rootElement.querySelector(".pointer")

    this.audioBarElement.addEventListener("click", (e) => this.jumpToTime(e));

    this.pauseButtonElement.style.display = "none";
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