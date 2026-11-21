(() => {
  'use strict';

  let activeUtterance = null;
  let activeAudio = null;

  function stop() {
    if (activeAudio) {
      const audio = activeAudio;
      activeAudio = null;
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    const wasPlaying = activeUtterance;
    activeUtterance = null;
    if (wasPlaying && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  function playListening(phrase, setStatus = () => {}) {
    stop();
    const audio = new window.Audio(`assets/listening/${encodeURIComponent(phrase.id)}.mp3?v=nanami-1`);
    activeAudio = audio;
    audio.onplaying = () => {
      if (activeAudio === audio) setStatus('Playing Japanese audio…');
    };
    audio.onended = () => {
      if (activeAudio !== audio) return;
      activeAudio = null;
      setStatus('Tap play to listen again.');
    };
    const failed = () => {
      if (activeAudio !== audio) return;
      stop();
      setStatus('Audio could not load. Check your connection and tap play to retry.');
    };
    audio.onerror = failed;
    setStatus('Preparing Japanese audio…');
    try {
      const playback = audio.play();
      if (playback) playback.catch(failed);
    } catch {
      failed();
    }
  }

  function speak(text, setStatus = () => {}) {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      setStatus('Japanese audio is not supported in this browser.');
      return;
    }
    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    const japaneseVoice = voices.find((voice) => /^ja(?:$|[-_])/i.test(voice.lang));
    if (voices.length && !japaneseVoice) {
      setStatus('No Japanese voice is installed on this device.');
      return;
    }
    stop();
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;
    if (japaneseVoice) utterance.voice = japaneseVoice;
    activeUtterance = utterance;
    utterance.onstart = () => {
      if (activeUtterance === utterance) setStatus('Playing Japanese audio…');
    };
    utterance.onend = () => {
      if (activeUtterance === utterance) {
        activeUtterance = null;
        setStatus('Tap play to listen again.');
      }
    };
    utterance.onerror = () => {
      if (activeUtterance === utterance) {
        activeUtterance = null;
        setStatus('Audio could not play. Check that your device has a Japanese voice.');
      }
    };
    setStatus('Preparing Japanese audio…');
    try {
      synth.speak(utterance);
    } catch {
      utterance.onerror();
    }
  }

  window.JapaneseAudio = { speak, stop, playListening };
})();
