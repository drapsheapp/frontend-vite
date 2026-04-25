import { useRef, useState, useEffect } from "react";

export const useVoiceGuide = () => {
  const lastSpokenRef = useRef("");
  const speakingRef = useRef(false);

  // ✅ DEFAULT ENGLISH
  const [language, setLanguage] = useState("en-IN");
  const [voices, setVoices] = useState([]);
  const [voiceReady, setVoiceReady] = useState(false);

  // 🔥 LOAD AVAILABLE VOICES
  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        setVoices(v);
        setVoiceReady(true);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // 🔥 LOAD SAVED LANGUAGE (LOCAL STORAGE)
  useEffect(() => {
    const savedLang = localStorage.getItem("voice_lang");
    if (savedLang) setLanguage(savedLang);
  }, []);

  // 🔥 CHANGE LANGUAGE
  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("voice_lang", lang);
  };

  // 🔥 GET BEST MATCH VOICE
  const getVoice = () => {
    if (!voices.length) return null;

    if (language === "hi-IN") {
      return (
        voices.find(v => v.lang.toLowerCase().includes("hi")) ||
        voices.find(v => v.lang.toLowerCase().includes("en")) ||
        voices[0]
      );
    }

    return (
      voices.find(v => v.lang.toLowerCase().includes("en")) ||
      voices[0]
    );
  };

  // 🔥 MAIN SPEAK FUNCTION
  const speak = (text) => {
    if (!("speechSynthesis" in window) || !voiceReady || !text) return;

    try {
      const utter = new SpeechSynthesisUtterance(text);

      utter.lang = language;
      utter.rate = 1;
      utter.pitch = 1;

      const selectedVoice = getVoice();
      if (selectedVoice) utter.voice = selectedVoice;

      speakingRef.current = true;

      utter.onend = () => {
        speakingRef.current = false;
      };

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);

    } catch (err) {
      console.error("Voice error:", err);
    }
  };

  // 🔥 SAFE SPEAK (NO REPEAT)
  const speakSafe = (text) => {
    if (!text) return;

    if (lastSpokenRef.current === text) return;

    lastSpokenRef.current = text;

    speak(text);
  };

  // 🔥 FORCE STOP (OPTIONAL)
  const stop = () => {
    window.speechSynthesis.cancel();
    speakingRef.current = false;
  };

  return {
    speakSafe,
    language,
    changeLanguage,
    stop
  };
};