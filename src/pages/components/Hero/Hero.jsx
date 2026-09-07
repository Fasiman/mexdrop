import { useEffect, useRef, useState } from "react";
import { FaCoins } from "react-icons/fa6";
import Container from "../../../components/Container/Container";
import akbackground from "../../../images/ak-background.png";

import "./Hero.css";

const weapons = [
  { id: 1, image: akbackground, name: "AK-47", type: "Rifle", rarity: "Мифический", upgrade: 15, price: 125, glow: "rgba(255, 36, 36, 0.72)" },
  { id: 2, image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fsteamcommunity-a.akamaihd.net%2Feconomy%2Fimage%2F-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_Nfz5H_uO-jb-EgfLmI7rChVRV58p1huz--Nj02UeLpxo7Oy3tIY_HdQI_NwzS8wO8xL3mjZHutMmbnHNgunUl53fblkC_0xAaPOI80OveFwuBrMYnzA&f=1&nofb=1&ipt=e343559a9d44dfe6ba9958ba43447764c9bf12774ce4016f246a56d13af28afc", name: "M4A1-S", type: "Rifle", rarity: "Эпический", upgrade: 22, price: 260, glow: "rgba(183, 92, 255, 0.68)" },
  { id: 3, image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fgrizly.club%2Fuploads%2Fposts%2F2023-08%2Fthumbs%2F1692205504_grizly-club-p-kartinki-awp-bez-fona-14.png&f=1&nofb=1&ipt=72f09af2ea0b09d5ff43924323727be00920588a28fb99e5a3d2ef797b77ca01", name: "AWP", type: "Sniper", rarity: "Легендарный", upgrade: 35, price: 475, glow: "rgba(255, 190, 55, 0.68)" },
  { id: 4, image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fsteamcdn-a.akamaihd.net%2Fapps%2F730%2Ficons%2Fecon%2Fdefault_generated%2Fweapon_glock_cu_glock_moon_rabbit_light_large.9063b9745250446c657632eb13a6325f51d101f2.png&f=1&nofb=1&ipt=e0f60c86eec61fa11a792708cdc57f78345281dc1e69e788b7bbf02882c43394", name: "Glock-18", type: "Pistol", rarity: "Мифический", upgrade: 18, price: 180, glow: "rgba(255, 48, 48, 0.72)" },
  { id: 5, image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fsteamcommunity-a.akamaihd.net%2Feconomy%2Fimage%2F-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo6m1FBRp3_bGcjhQ09Siq5KOk8jxN7zUhVRd4cJ5nqfHodun3AKy-hc_a276JYfEIFM7aQzYqFS4yOm61MXpv8nKm3dl7CN0-z-DyAQKbHsO%2F512fx384f&f=1&nofb=1&ipt=79d20b2b5d47e5b9e1dcfa4f0868770ae2de90076f16c1478aabb5c9d050f71e", name: "USP-S", type: "Pistol", rarity: "Эпический", upgrade: 27, price: 310, glow: "rgba(166, 79, 255, 0.68)" },
  { id: 6, image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fsteamcommunity-a.akamaihd.net%2Feconomy%2Fimage%2F-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJl5W0nPbmMrbummRD7fp9g-7J4cKi2A3kqhY9Zm6hJ9eXI1RqaVqF-ljowb271564vMyaznA1viF2s3jegVXp1uIYPzxv&f=1&nofb=1&ipt=f8f26c4b8d3fa51016e1db3e659c3ff980e6528971dc97809ed90b2e8184a75c", name: "Karambit", type: "Knife", rarity: "Легендарный", upgrade: 42, price: 890, glow: "rgba(255, 202, 74, 0.68)" },
  { id: 7, image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fsteamcommunity-a.akamaihd.net%2Feconomy%2Fimage%2F-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJl5W0nPbmMrbummRD7fp9g-7J4cKi2A3kqhY9Zm6hJ9eXI1RqaVqF-ljowb271564vMyaznA1viF2s3jegVXp1uIYPzxv&f=1&nofb=1&ipt=f8f26c4b8d3fa51016e1db3e659c3ff980e6528971dc97809ed90b2e8184a75c", name: "M4A4", type: "Rifle", rarity: "Мифический", upgrade: 31, price: 360, glow: "rgba(255, 42, 42, 0.72)" },
];

const WeaponPicker = ({ selectedWeapon, onSelect, minimumPrice = 0, disabled = false }) => {
  const [sortOrder, setSortOrder] = useState("asc");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const minimumFilterPrice = Math.max(minimumPrice, Number(priceFrom) || 0);
  const maximumFilterPrice = priceTo === "" ? Infinity : Number(priceTo);
  const sortedWeapons = [...weapons]
    .filter((weapon) => weapon.price >= minimumFilterPrice && weapon.price <= maximumFilterPrice)
    .sort((firstWeapon, secondWeapon) => (
    sortOrder === "asc"
      ? firstWeapon.price - secondWeapon.price
      : secondWeapon.price - firstWeapon.price
    ));

  return (
    <div className="hero__weapon-picker">
      <div className="hero__weapon-picker-header">
        <span className="hero__weapon-picker-title">Выбрать скин</span>
        <label className="hero__weapon-sort">
          <span>Цена</span>
          <select
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            disabled={disabled}
            aria-label="Сортировка оружия по цене"
          >
            <option value="asc">Сначала дешевле</option>
            <option value="desc">Сначала дороже</option>
          </select>
        </label>
      </div>
      <div className="hero__weapon-price-range">
        <label>
          <span>От</span>
          <input
            type="number"
            min={minimumPrice}
            placeholder={minimumPrice || "0"}
            value={priceFrom}
            onChange={(event) => setPriceFrom(event.target.value)}
            disabled={disabled}
            aria-label="Минимальная цена"
          />
          <FaCoins />
        </label>
        <span className="hero__weapon-price-divider">до</span>
        <label>
          <span>До</span>
          <input
            type="number"
            min={minimumPrice}
            placeholder="∞"
            value={priceTo}
            onChange={(event) => setPriceTo(event.target.value)}
            disabled={disabled}
            aria-label="Максимальная цена"
          />
          <FaCoins />
        </label>
      </div>
      <div className="hero__weapon-list">
      {sortedWeapons.map((weapon) => (
        <button
          className={`hero__weapon-card${selectedWeapon?.id === weapon.id ? " hero__weapon-card--selected" : ""}${weapon.price < minimumPrice || disabled ? " hero__weapon-card--disabled" : ""}`}
          key={weapon.id}
          type="button"
          onClick={() => onSelect(weapon)}
          disabled={disabled || weapon.price < minimumPrice}
          style={{ "--weapon-glow": weapon.glow }}
          aria-label={`Выбрать ${weapon.name}`}
          aria-pressed={selectedWeapon?.id === weapon.id}
        >
          <img src={weapon.image} alt="" />
          <span>
            <strong>{weapon.name}</strong>
            <small>{weapon.type}</small>
            <em><FaCoins /> {weapon.price}</em>
          </span>
          <b>{weapon.upgrade}%</b>
        </button>
      ))}
      </div>
    </div>
  );
};

const Hero = ({ userBalance, setUserBalance }) => {
  const [selectedSourceWeapon, setSelectedSourceWeapon] = useState(null);
  const [selectedTargetWeapon, setSelectedTargetWeapon] = useState(null);
  const upgradeChance = selectedTargetWeapon?.upgrade ?? 50;
  const spinCost = selectedSourceWeapon?.price ?? 0;
  const canSpin = selectedSourceWeapon && selectedTargetWeapon && userBalance >= spinCost;
  const [displayedChance, setDisplayedChance] = useState(upgradeChance);
  const displayedChanceRef = useRef(upgradeChance);
  const [spinRotation, setSpinRotation] = useState(0);
  const spinRotationRef = useRef(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isPointerResetting, setIsPointerResetting] = useState(false);
  const [isPointerNormalizing, setIsPointerNormalizing] = useState(false);
  const [spinResult, setSpinResult] = useState("");
  const [winningWeapon, setWinningWeapon] = useState(null);
  const [isWinOverlayClosing, setIsWinOverlayClosing] = useState(false);
  const handleSourceWeaponSelect = (weapon) => {
    setSelectedSourceWeapon(weapon);
    setSelectedTargetWeapon((currentWeapon) => (
      currentWeapon && currentWeapon.price < weapon.price ? null : currentWeapon
    ));
  };

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

  const spinChance = () => {
    if (isSpinning || !canSpin) {
      return;
    }

    const sourceWeapon = selectedSourceWeapon;
    const targetWeapon = selectedTargetWeapon;
    setUserBalance((currentBalance) => currentBalance - sourceWeapon.price);

    const halfChance = upgradeChance / 2;
    const boundaryPadding = Math.min(2, Math.max(0.5, halfChance / 5));
    const shouldWin = Math.random() < upgradeChance / 100;
    const safeWinWidth = halfChance - boundaryPadding;
    const safeLoseStart = halfChance + boundaryPadding;
    const safeLoseEnd = 100 - halfChance - boundaryPadding;

    let landingPercent;
    if (shouldWin) {
      landingPercent = Math.random() < 0.5
        ? boundaryPadding + Math.random() * (safeWinWidth - boundaryPadding)
        : 100 - halfChance + boundaryPadding + Math.random() * (safeWinWidth - boundaryPadding);
    } else {
      landingPercent = safeLoseStart + Math.random() * (safeLoseEnd - safeLoseStart);
    }

    setSpinResult("");
    setWinningWeapon(null);
    setIsWinOverlayClosing(false);
    setIsSpinning(true);
    setIsPointerResetting(false);
    setIsPointerNormalizing(false);

    const landingRotation = (landingPercent / 100) * 360;
    const currentRot = spinRotationRef.current;
    const baseRounds = 5 * 360; // 5 полных оборотов рулетки
    const targetRotation = Math.ceil(currentRot / 360) * 360 + baseRounds + landingRotation;

    const pointerPercent = ((targetRotation % 360 + 360) % 360) / 360 * 100;
    const isWin = pointerPercent <= halfChance || pointerPercent >= 100 - halfChance;

    spinRotationRef.current = targetRotation;
    setSpinRotation(targetRotation);

    const SPIN_TIME = 30000;     // Время естественного вращения
    const RESULT_PAUSE = 2800;   // Пауза демонстрации результата
    const RESET_TIME = 800;      // Время возврата стрелки в ноль

    window.setTimeout(() => {
      if (isWin) {
        setUserBalance((currentBalance) => currentBalance + targetWeapon.price);
        setWinningWeapon(targetWeapon);
      }
      setSpinResult(isWin ? "Победа" : "Проигрыш");

      window.setTimeout(() => {
        setIsPointerResetting(true);

        const currentAngle = targetRotation % 360;
        const resetDelta = (360 - currentAngle) % 360;
        const resetRotation = targetRotation + resetDelta;
        spinRotationRef.current = resetRotation;
        setSpinRotation(resetRotation);

        window.setTimeout(() => {
          setIsPointerNormalizing(true);
          spinRotationRef.current = 0;
          setSpinRotation(0);

          requestAnimationFrame(() => {
            setSpinResult(""); // Возвращаем зеленый цвет шкале после проигрыша/победы
            setIsWinOverlayClosing(true);
            window.setTimeout(() => {
              setWinningWeapon(null);
              setIsWinOverlayClosing(false);
            }, 450);
            setIsPointerResetting(false);
            setIsPointerNormalizing(false);
            setIsSpinning(false);
          });
        }, RESET_TIME);
      }, RESULT_PAUSE);
    }, SPIN_TIME);
  };

  const nextLightboxIndex = useRef(6);
  const [marqueeLightboxes, setMarqueeLightboxes] = useState(() =>
    Array.from({ length: 14 }, (_, index) => ({
      ...weapons[index % weapons.length],
      instance: `initial-${index}`,
    }))
  );
  const [isTickerEntering, setIsTickerEntering] = useState(false);
  const [isTickerStepping, setIsTickerStepping] = useState(false);

  useEffect(() => {
    let tickerTimer;
    let tickerFrame;

    const addNextLightbox = () => {
      if (document.hidden) {
        return;
      }

      const nextLightbox = weapons[nextLightboxIndex.current % weapons.length];
      nextLightboxIndex.current += 1;

      setMarqueeLightboxes((currentLightboxes) => [
        { ...nextLightbox, instance: `ticker-${nextLightboxIndex.current}` },
        ...currentLightboxes,
      ]);
      setIsTickerEntering(true);
      setIsTickerStepping(false);
      tickerFrame = requestAnimationFrame(() => {
        setIsTickerEntering(false);
        setIsTickerStepping(true);
      });

      tickerTimer = window.setTimeout(addNextLightbox, 1000);
    };

    const handleVisibilityChange = () => {
      window.clearTimeout(tickerTimer);
      window.cancelAnimationFrame(tickerFrame);

      setMarqueeLightboxes((currentLightboxes) => currentLightboxes.slice(0, 14));
      setIsTickerEntering(false);
      setIsTickerStepping(false);

      if (!document.hidden) {
        tickerTimer = window.setTimeout(addNextLightbox, 1000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    tickerTimer = window.setTimeout(addNextLightbox, 1000);

    return () => {
      window.clearTimeout(tickerTimer);
      window.cancelAnimationFrame(tickerFrame);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleTickerTransitionEnd = (event) => {
    if (event.propertyName !== "transform" || !isTickerStepping) {
      return;
    }

    setMarqueeLightboxes((currentLightboxes) => currentLightboxes.slice(0, 14));
    setIsTickerStepping(false);
  };

  const fillClass = `hero__chance-fill ${
    spinResult === "Победа"
      ? "hero__chance-fill--win"
      : spinResult === "Проигрыш"
      ? "hero__chance-fill--lose"
      : "hero__chance-fill--default"
  }`;

  return (
    <section className="hero">
      {winningWeapon && (
        <div className={`hero__win-overlay${isWinOverlayClosing ? " hero__win-overlay--closing" : ""}`} role="status" aria-live="polite">
          <div className="hero__win-content" style={{ "--weapon-glow": winningWeapon.glow }}>
            <span className="hero__win-kicker">Апгрейд завершён</span>
            <img src={winningWeapon.image} alt={winningWeapon.name} />
            <strong>Выигрыш</strong>
            <span className="hero__win-name">{winningWeapon.name}</span>
            <span className="hero__win-price"><FaCoins /> {winningWeapon.price}</span>
          </div>
        </div>
      )}
      {/* Стили для смены цветов шкалы */}
      <style>{`
        .hero__chance-fill--win {
          stroke: #b8ff2c !important;
          filter: none !important;
        }
        .hero__chance-fill--lose {
          stroke: #ff3b30 !important;
          filter: drop-shadow(0 0 10px #ff3b30);
          transition: stroke 0.4s ease, filter 0.4s ease;
        }
        .hero__chance-fill--default {
          transition: stroke 0.5s ease, filter 0.5s ease;
        }
      `}</style>

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
          <div className="hero__selection-column">
            <div className="hero__upgrade-box">
              <h4 className="hero__upgrade-title" id="upgrade_small">
                Выберете по цене скин который хотите прокачать
              </h4>
              {selectedSourceWeapon ? (
                <div className="hero__selected-weapon" style={{ "--weapon-glow": selectedSourceWeapon.glow }}>
                  <img src={selectedSourceWeapon.image} alt={selectedSourceWeapon.name} />
                  <strong>{selectedSourceWeapon.name}</strong>
                  <span>{selectedSourceWeapon.type} · <FaCoins /> {selectedSourceWeapon.price}</span>
                </div>
              ) : (
                <span className="akbackground">M</span>
              )}
            </div>
            <WeaponPicker selectedWeapon={selectedSourceWeapon} onSelect={handleSourceWeaponSelect} disabled={isSpinning} />
          </div>
          <div
            className="hero__chance"
            aria-label={`Шанс на апгрейд: ${upgradeChance} процентов`}
          >
            <span className="hero__chance-label">Шанс</span>
            <div className="hero__chance-gauge" data-result={spinResult}>
              <svg className="hero__chance-scale" viewBox="0 0 220 220" aria-hidden="true">
                <circle className="hero__chance-outer-ring" cx="110" cy="110" r="103" />
                <path className="hero__chance-track" d="M 110 196 A 86 86 0 0 1 110 24" />
                <path className="hero__chance-track" d="M 110 196 A 86 86 0 0 0 110 24" />
                <path
                  className={fillClass}
                  d="M 110 196 A 86 86 0 0 1 110 24"
                  pathLength="50"
                  style={{ "--chance-offset": 50 - displayedChance / 2 }}
                />
                <path
                  className={fillClass}
                  d="M 110 196 A 86 86 0 0 0 110 24"
                  pathLength="50"
                  style={{ "--chance-offset": 50 - displayedChance / 2 }}
                />
                <circle className="hero__chance-inner-ring" cx="110" cy="110" r="68" />
                <g className="hero__chance-ticks">
                  {Array.from({ length: 24 }, (_, index) => {
                    const angle = ((index * 15 - 90) * Math.PI) / 180;
                    const innerRadius = index % 6 === 0 ? 94 : 98;
                    const outerRadius = 105;

                    return (
                      <line
                        key={index}
                        x1={110 + Math.cos(angle) * innerRadius}
                        y1={110 + Math.sin(angle) * innerRadius}
                        x2={110 + Math.cos(angle) * outerRadius}
                        y2={110 + Math.sin(angle) * outerRadius}
                      />
                    );
                  })}
                </g>
                <text className="hero__chance-center-label" x="110" y="139">
                  СРЕДНИЙ ШАНС
                </text>
                <g
                  className="hero__chance-pointer"
                  data-resetting={isPointerResetting}
                  data-normalizing={isPointerNormalizing}
                  data-spinning={isSpinning}
                  style={{
                    transform: `rotate(${spinRotation}deg)`,
                    "--pointer-target-rotation": `${spinRotation}deg`,
                    transition: isPointerNormalizing
                      ? "none"
                      : isPointerResetting
                      ? "transform 0.8s cubic-bezier(0.02, 0.98, 0.72, 1)"
                      : isSpinning
                      ? "transform 30s cubic-bezier(0.08, 0.82, 0.17, 1)"
                      : "none",
                  }}
                >
                  <path className="hero__chance-pointer-shape" d="M 110 198 L 104 215 L 110 209 L 116 215 Z" />
                  <circle cx="110" cy="196" r="5" />
                </g>
              </svg>
              <strong className="hero__chance-value">{displayedChance}%</strong>
              {spinResult && (
                <div className={`hero__chance-effects hero__chance-effects--${spinResult === "Победа" ? "win" : "lose"}`} aria-hidden="true">
                  {Array.from({ length: 18 }, (_, index) => {
                    const effectCount = 18;
                    const effectAngle = Math.PI / 2 + (index / effectCount) * Math.PI * 2;
                    const effectRadius = 176;

                    return (
                      <span
                        className="hero__chance-effect-mark"
                        key={index}
                        style={{
                          "--m-index": index,
                          "--m-start-x": `${Math.cos(effectAngle) * effectRadius}px`,
                          "--m-start-y": `${Math.sin(effectAngle) * effectRadius}px`,
                        }}
                      >
                        M
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
            <button
              className={`hero__chance-random${isSpinning ? " hero__chance-random--busy" : ""}`}
              type="button"
              onClick={spinChance}
              disabled={isSpinning || !canSpin}
            >
              {isSpinning
                ? "Крутится..."
                : !selectedSourceWeapon || !selectedTargetWeapon
                ? "Выберите оружие"
                : userBalance < spinCost
                ? "Недостаточно монет"
                : "Апгрейднуть"}
            </button>
            <span
              className={`hero__chance-result${spinResult ? " hero__chance-result--visible" : ""}${spinResult === "Проигрыш" ? " hero__chance-result--lose" : ""}`}
            >
              {spinResult}
            </span>
          </div>
          <div className="hero__selection-column">
            <div className="hero__upgrade-box">
              <h4 className="hero__upgrade-title">Выберете скин для прокачки</h4>
              {selectedTargetWeapon ? (
                <div className="hero__selected-weapon" style={{ "--weapon-glow": selectedTargetWeapon.glow }}>
                  <img src={selectedTargetWeapon.image} alt={selectedTargetWeapon.name} />
                  <strong>{selectedTargetWeapon.name}</strong>
                  <span>{selectedTargetWeapon.type} · <FaCoins /> {selectedTargetWeapon.price} · {selectedTargetWeapon.upgrade}%</span>
                </div>
              ) : (
                <span className="akbackground">M</span>
              )}
            </div>
            <WeaponPicker
              selectedWeapon={selectedTargetWeapon}
              onSelect={setSelectedTargetWeapon}
              minimumPrice={selectedSourceWeapon?.price ?? 0}
              disabled={isSpinning}
            />
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;