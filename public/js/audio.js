const audio = document.getElementById("myAudio");
const playPauseButton = document.getElementById("playPause");
const progressBar = document.getElementById("progressBar");
const currentTimeDisplay = document.getElementById("currentTime");

// Toggle play/pause
playPauseButton.addEventListener("click", () => {
  if (audio.paused) {
    audio.play().catch((error) => console.error("Error playing audio:", error));
    playPauseButton.textContent = "pause"; // Change icon to pause
  } else {
    audio.pause();
    playPauseButton.textContent = "play_arrow"; // Change icon to play
  }
});

// Update progress bar and current time
audio.addEventListener("timeupdate", () => {
  const currentTime = audio.currentTime;
  const duration = audio.duration;

  const progress = (currentTime / duration) * 100;
  progressBar.value = progress;

  const minutes = Math.floor(currentTime / 60);
  const seconds = Math.floor(currentTime % 60)
    .toString()
    .padStart(2, "0");
  currentTimeDisplay.textContent = `${minutes}:${seconds}`;
});
