window.onload = () => {
  const audioUrls = {
    "original": "resources/whispp_nl.wav",
    "amplified": "resources/whispp_nl_converted_model_A.wav",
    "whisper-voice": "resources/whispp_nl_converted_model_B.wav",
  }
  const player = new AudioPlayer("classed-multi-audio", audioUrls);
}