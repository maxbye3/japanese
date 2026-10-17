(() => {
  'use strict';

  let activeUtterance = null;

  function stop() {
    const wasPlaying = activeUtterance;
    activeUtterance = null;
    if (wasPlaying && 'speechSynthesis' in window) window.speechSynthesis.cancel();
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

  window.JapaneseAudio = { speak, stop };
})();
