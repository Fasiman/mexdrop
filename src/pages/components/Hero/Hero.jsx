import { useEffect, useRef, useState } from "react";
import Container from "../../../components/Container/Container";
import akbackground from "../../../images/ak-background.png"

import "./Hero.css"

const lightboxes = [
  { id: 1, image: akbackground, name: "AK-47", type: "Rifle", rarity: "Мифический", upgrade: 15, glow: "rgba(255, 36, 36, 0.72)" },
  { id: 2, image: akbackground, name: "M4A1-S", type: "Rifle", rarity: "Эпический", upgrade: 22, glow: "rgba(183, 92, 255, 0.68)" },
  { id: 3, image: akbackground, name: "AWP", type: "Sniper", rarity: "Легендарный", upgrade: 35, glow: "rgba(255, 190, 55, 0.68)" },
  { id: 4, image: akbackground, name: "Glock-18", type: "Pistol", rarity: "Мифический", upgrade: 18, glow: "rgba(255, 48, 48, 0.72)" },
  { id: 5, image: akbackground, name: "USP-S", type: "Pistol", rarity: "Эпический", upgrade: 27, glow: "rgba(166, 79, 255, 0.68)" },
  { id: 6, image: akbackground, name: "Karambit", type: "Knife", rarity: "Легендарный", upgrade: 42, glow: "rgba(255, 202, 74, 0.68)" },
  { id: 7, image: akbackground, name: "M4A4", type: "Rifle", rarity: "Мифический", upgrade: 31, glow: "rgba(255, 42, 42, 0.72)" },
];

const Hero = () => {
  const upgradeChance = 54;
  const [displayedChance, setDisplayedChance] = useState(upgradeChance);
  const displayedChanceRef = useRef(upgradeChance);

  useEffect(() => {
    const startChance = displayedChanceRef.current;
    const startedAt = performance.now();
    const duration = 700;
    let animationFrame;

    const animateChance = (timestamp) => {
      const progress = Math.min((timestamp - startedAt) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const nextChance = Math.round(
        startChance + (upgradeChance - startChance) * easedProgress
      );

      displayedChanceRef.current = nextChance;
      setDisplayedChance(nextChance);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animateChance);
      }
    };

    animationFrame = requestAnimationFrame(animateChance);

    return () => cancelAnimationFrame(animationFrame);
  }, [upgradeChance]);

  const nextLightboxIndex = useRef(6);
  const [marqueeLightboxes, setMarqueeLightboxes] = useState(() =>
    Array.from({ length: 14 }, (_, index) => ({
      ...lightboxes[index % lightboxes.length],
      instance: `initial-${index}`,
    }))
  );
  const [isTickerEntering, setIsTickerEntering] = useState(false);
  const [isTickerStepping, setIsTickerStepping] = useState(false);

  useEffect(() => {
    const ticker = setInterval(() => {
      const nextLightbox = lightboxes[nextLightboxIndex.current % lightboxes.length];
      nextLightboxIndex.current += 1;

      setMarqueeLightboxes((currentLightboxes) => [
        { ...nextLightbox, instance: `ticker-${nextLightboxIndex.current}` },
        ...currentLightboxes,
      ]);
      setIsTickerEntering(true);
      requestAnimationFrame(() => {
        setIsTickerEntering(false);
        setIsTickerStepping(true);
      });
    }, 1000);

    return () => clearInterval(ticker);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setMarqueeLightboxes((currentLightboxes) => currentLightboxes.slice(0, 14));
        setIsTickerEntering(false);
        setIsTickerStepping(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const handleTickerTransitionEnd = (event) => {
    if (event.propertyName !== "transform" || !isTickerStepping) {
      return;
    }

    setMarqueeLightboxes((currentLightboxes) => currentLightboxes.slice(0, 14));
    setIsTickerStepping(false);
  };

  return (
    <section className="hero">
      <div className="hero__top">
        <div
          className={`hero__top-track${isTickerEntering ? " hero__top-track--entering" : ""}${isTickerStepping ? " hero__top-track--stepping" : ""}`}
          onTransitionEnd={handleTickerTransitionEnd}
        >
          {marqueeLightboxes.map((lightbox) => (
            <div
              className="hero__lightbox"
              key={lightbox.instance}
              style={{ "--weapon-glow": lightbox.glow }}
            >
              <img
                className="hero__lightbox-image"
                src={lightbox.image}
                alt={lightbox.name}
              />
              <span className="hero__lightbox-upgrade">{lightbox.upgrade}%</span>
              <div className="hero__lightbox-info">
                <strong>{lightbox.name}</strong>
                <span>{lightbox.type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Container>
        <div className="hero__upgrade">
          <div className="hero__upgrade-box">
            <h4 className="hero__upgrade-title" id="upgrade_small">
              Выберете по цене скин который хотите прокачать
            </h4>
            {/* <img className="akbackground" src={akbackground} alt="" />
             */}
             <span className="akbackground">M</span>
          </div>
          <div
            className="hero__chance"
            aria-label={`Шанс на апгрейд: ${upgradeChance} процентов`}
          >
            <span className="hero__chance-label">Шанс</span>
            <strong className="hero__chance-value">{displayedChance}%</strong>
            <svg className="hero__chance-scale" viewBox="0 0 200 110" aria-hidden="true">
              <path className="hero__chance-track" d="M 10 100 A 90 90 0 0 1 190 100" />
              <path
                className="hero__chance-fill"
                d="M 10 100 A 90 90 0 0 1 190 100"
                pathLength="100"
                style={{ "--chance-offset": 100 - displayedChance }}
              />
            </svg>
            <div className="hero__chance-limits" aria-hidden="true">
              <span>0</span>
              <span>100</span>
            </div>
          </div>
          <div className="hero__upgrade-box">
            <h4 className="hero__upgrade-title">Выберете скин для прокачки</h4>
             {/* <img className="akbackground" src={akbackground} alt="" />
              */}             <span className="akbackground">M</span>

          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
