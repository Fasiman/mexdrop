import { useEffect, useRef, useState } from "react";
import { FaCoins, FaRotateLeft } from "react-icons/fa6";
import Container from "../../../components/Container/Container";
import akbackground from "../../../images/ak-background.png";

import "./Hero.css";

const ALL_WEAPONS = [
  { id: 1, image: akbackground, name: "AK-47", type: "Rifle", rarity: "Мифический", price: 125, glow: "rgba(255, 36, 36, 0.72)" },
  { id: 2, image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fsteamcommunity-a.akamaihd.net%2Feconomy%2Fimage%2F-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_Nfz5H_uO-jb-EgfLmI7rChVRV58p1huz--Nj02UeLpxo7Oy3tIY_HdQI_NwzS8wO8xL3mjZHutMmbnHNgunUl53fblkC_0xAaPOI80OveFwuBrMYnzA&f=1&nofb=1&ipt=e343559a9d44dfe6ba9958ba43447764c9bf12774ce4016f246a56d13af28afc", name: "M4A1-S", type: "Rifle", rarity: "Эпический", price: 260, glow: "rgba(183, 92, 255, 0.68)" },
  { id: 3, image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fgrizly.club%2Fuploads%2Fposts%2F2023-08%2Fthumbs%2F1692205504_grizly-club-p-kartinki-awp-bez-fona-14.png&f=1&nofb=1&ipt=72f09af2ea0b09d5ff43924323727be00920588a28fb99e5a3d2ef797b77ca01", name: "AWP", type: "Sniper", rarity: "Легендарный", price: 475, glow: "rgba(255, 190, 55, 0.68)" },
  { id: 4, image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fsteamcdn-a.akamaihd.net%2Fapps%2F730%2Ficons%2Fecon%2Fdefault_generated%2Fweapon_glock_cu_glock_moon_rabbit_light_large.9063b9745250446c657632eb13a6325f51d101f2.png&f=1&nofb=1&ipt=e0f60c86eec61fa11a792708cdc57f78345281dc1e69e788b7bbf02882c43394", name: "Glock-18", type: "Pistol", rarity: "Мифический", price: 180, glow: "rgba(255, 48, 48, 0.72)" },
  { id: 5, image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fsteamcommunity-a.akamaihd.net%2Feconomy%2Fimage%2F-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo6m1FBRp3_bGcjhQ09Siq5KOk8jxN7zUhVRd4cJ5nqfHodun3AKy-hc_a276JYfEIFM7aQzYqFS4yOm61MXpv8nKm3dl7CN0-z-DyAQKbHsO%2F512fx384f&f=1&nofb=1&ipt=79d20b2b5d47e5b9e1dcfa4f0868770ae2de90076f16c1478aabb5c9d050f71e", name: "USP-S", type: "Pistol", rarity: "Эпический", price: 310, glow: "rgba(166, 79, 255, 0.68)" },
  { id: 6, image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fsteamcommunity-a.akamaihd.net%2Feconomy%2Fimage%2F-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJl5W0nPbmMrbummRD7fp9g-7J4cKi2A3kqhY9Zm6hJ9eXI1RqaVqF-ljowb271564vMyaznA1viF2s3jegVXp1uIYPzxv&f=1&nofb=1&ipt=f8f26c4b8d3fa51016e1db3e659c3ff980e6528971dc97809ed90b2e8184a75c", name: "Karambit", type: "Knife", rarity: "Легендарный", price: 890, glow: "rgba(255, 202, 74, 0.68)" },
  { id: 7, image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fsteamcommunity-a.akamaihd.net%2Feconomy%2Fimage%2F-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJl5W0nPbmMrbummRD7fp9g-7J4cKi2A3kqhY9Zm6hJ9eXI1RqaVqF-ljowb271564vMyaznA1viF2s3jegVXp1uIYPzxv&f=1&nofb=1&ipt=f8f26c4b8d3fa51016e1db3e659c3ff980e6528971dc97809ed90b2e8184a75c", name: "M4A4", type: "Rifle", rarity: "Мифический", price: 360, glow: "rgba(255, 42, 42, 0.72)" },
];

const WeaponPicker = ({
  title,
  items = [],
  selectedWeapon,
  onSelect,
  minimumPrice = 0,
  disabled = false,
  emptyMessage = "Нет предметов",
  onResetInventory,
}) => {
  const [sortOrder, setSortOrder] = useState("asc");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");

  const minFilter = Math.max(minimumPrice, Number(priceFrom) || 0);
  const maxFilter = priceTo === "" ? Infinity : Number(priceTo);

  const sortedWeapons = [...items]
    .filter((weapon) => weapon.price >= minFilter && weapon.price <= maxFilter)
    .sort((a, b) => (sortOrder === "asc" ? a.price - b.price : b.price - a.price));

  return (
    <div className="hero__weapon-picker">
      <div className="hero__weapon-picker-header">
        <span className="hero__weapon-picker-title">{title}</span>
        <label className="hero__weapon-sort">
          <span>Цена</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            disabled={disabled}
            aria-label="Сортировка"
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
            onChange={(e) => setPriceFrom(e.target.value)}
            disabled={disabled}
          />
          <FaCoins />
        </label>
        <span className="hero__weapon-price-divider">до</span>
        <label>
          <span>До</span>
          <input
            type="number"
            min={minimumPrice}
            placeholder="MAX"
            value={priceTo}
            onChange={(e) => setPriceTo(e.target.value)}
            disabled={disabled}
          />
          <FaCoins />
        </label>
      </div>

      <div className="hero__weapon-list">
        {items.length === 0 ? (
          <div className="hero__weapon-empty">
            <p>{emptyMessage}</p>
            {onResetInventory && (
              <button
                type="button"
                className="hero__reset-btn"
                onClick={onResetInventory}
                disabled={disabled}
              >
                <FaRotateLeft /> Взять AK-47
              </button>
            )}
          </div>
        ) : sortedWeapons.length === 0 ? (
          <div className="hero__weapon-empty">
            <p>Нет подходящих скинов по фильтру</p>
          </div>
        ) : (
          sortedWeapons.map((weapon, index) => {
            const isSelected = selectedWeapon?.id === weapon.id && selectedWeapon?.instanceId === weapon.instanceId;
            const isDisabled = disabled || weapon.price < minimumPrice;

            return (
              <button
                className={`hero__weapon-card${isSelected ? " hero__weapon-card--selected" : ""}${isDisabled ? " hero__weapon-card--disabled" : ""}`}
                key={weapon.instanceId || `${weapon.id}-${index}`}
                type="button"
                onClick={() => onSelect(weapon)}
                disabled={isDisabled}
                style={{ "--weapon-glow": weapon.glow }}
              >
                <img src={weapon.image} alt={weapon.name} />
                <span>
                  <strong>{weapon.name}</strong>
                  <small>{weapon.type}</small>
                  <em><FaCoins /> {weapon.price}</em>
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

const Hero = ({
  inventory: externalInventory,
  setInventory: setExternalInventory,
}) => {
  // Локальное состояние для инвентаря, если родитель не передал свой state
  const [localInventory, setLocalInventory] = useState(() => [
    { ...ALL_WEAPONS[0], instanceId: "initial-ak47" }
  ]);

  const inventory = externalInventory || localInventory;
  const setInventory = setExternalInventory || setLocalInventory;

  const [selectedSourceWeapon, setSelectedSourceWeapon] = useState(null);
  const [selectedTargetWeapon, setSelectedTargetWeapon] = useState(null);

  // Динамический расчет шанса апгрейда на основе цен предметов
  const upgradeChance = (selectedSourceWeapon && selectedTargetWeapon)
    ? Math.min(90, Math.max(1, Math.round((selectedSourceWeapon.price / selectedTargetWeapon.price) * 100)))
    : 50;

  const canSpin = Boolean(selectedSourceWeapon && selectedTargetWeapon);

  const [displayedChance, setDisplayedChance] = useState(upgradeChance);
  const displayedChanceRef = useRef(upgradeChance);
  const [spinRotation, setSpinRotation] = useState(0);
  const spinRotationRef = useRef(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isPointerResetting, setIsPointerResetting] = useState(false);
  const [isSnapNormalizing, setIsSnapNormalizing] = useState(false);
  const [spinResult, setSpinResult] = useState("");

  const handleSourceWeaponSelect = (weapon) => {
    setSelectedSourceWeapon(weapon);
    setSelectedTargetWeapon((current) => (
      current && current.price < weapon.price ? null : current
    ));
  };

  const handleResetStarterSkin = () => {
    const starterAK = { ...ALL_WEAPONS[0], instanceId: `ak47-${Date.now()}` };
    setInventory([starterAK]);
  };

  useEffect(() => {
    const startChance = displayedChanceRef.current;
    const startedAt = performance.now();
    const duration = 500;
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
    if (isSpinning || isPointerResetting || !canSpin) {
      return;
    }

    const sourceWeapon = selectedSourceWeapon;
    const targetWeapon = selectedTargetWeapon;

    // Сразу изымаем предмет с кона из инвентаря
    setInventory((prev) => {
      const idx = prev.findIndex((item) =>
        item.instanceId ? item.instanceId === sourceWeapon.instanceId : item.id === sourceWeapon.id
      );
      if (idx !== -1) {
        const copy = [...prev];
        copy.splice(idx, 1);
        return copy;
      }
      return prev;
    });

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
    setIsSpinning(true);
    setIsPointerResetting(false);
    setIsSnapNormalizing(false);

    const landingRotation = (landingPercent / 100) * 360;
    const currentRot = spinRotationRef.current;
    const baseRounds = 5 * 360;
    const targetRotation = Math.ceil(currentRot / 360) * 360 + baseRounds + landingRotation;

    const pointerPercent = ((targetRotation % 360 + 360) % 360) / 360 * 100;
    const isWin = pointerPercent <= halfChance || pointerPercent >= 100 - halfChance;

    spinRotationRef.current = targetRotation;
    setSpinRotation(targetRotation);

    const SPIN_TIME = 7500;
    const RESULT_PAUSE = 1600;
    const RESET_TIME = 1100;

    window.setTimeout(() => {
      if (isWin) {
        // Добавляем только выигранный предмет в инвентарь (деньги не прибавляем)
        const wonItem = { ...targetWeapon, instanceId: `won-${Date.now()}` };
        setInventory((prev) => [...prev, wonItem]);
        setSpinResult("УСПЕШНЫЙ АПГРЕЙД!");
      } else {
        setSpinResult("АПГРЕЙД СГОРЕЛ");
      }

      // Сбрасываем выбранное с кона оружие
      setSelectedSourceWeapon(null);

      window.setTimeout(() => {
        let normalized = ((targetRotation % 360) + 360) % 360;
        if (normalized > 180) {
          normalized -= 360;
        }

        setIsSnapNormalizing(true);
        spinRotationRef.current = normalized;
        setSpinRotation(normalized);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsSnapNormalizing(false);
            setIsPointerResetting(true);
            spinRotationRef.current = 0;
            setSpinRotation(0);

            window.setTimeout(() => {
              setSpinResult("");
              setIsPointerResetting(false);
              setIsSpinning(false);
            }, RESET_TIME);
          });
        });
      }, RESULT_PAUSE);
    }, SPIN_TIME);
  };

  // Бегущая лента на фоне слева
  const nextLightboxIndex = useRef(6);
  const [marqueeLightboxes, setMarqueeLightboxes] = useState(() =>
    Array.from({ length: 14 }, (_, index) => ({
      ...ALL_WEAPONS[index % ALL_WEAPONS.length],
      instance: `initial-${index}`,
    }))
  );
  const [isTickerEntering, setIsTickerEntering] = useState(false);
  const [isTickerStepping, setIsTickerStepping] = useState(false);

  useEffect(() => {
    let tickerTimer;
    let tickerFrame;

    const addNextLightbox = () => {
      if (document.hidden) return;

      const nextLightbox = ALL_WEAPONS[nextLightboxIndex.current % ALL_WEAPONS.length];
      nextLightboxIndex.current += 1;

      setMarqueeLightboxes((current) => [
        { ...nextLightbox, instance: `ticker-${nextLightboxIndex.current}` },
        ...current,
      ]);
      setIsTickerEntering(true);
      setIsTickerStepping(false);

      tickerFrame = requestAnimationFrame(() => {
        setIsTickerEntering(false);
        setIsTickerStepping(true);
      });

      tickerTimer = window.setTimeout(addNextLightbox, 1000);
    };

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) tickerTimer = window.setTimeout(addNextLightbox, 1000);
    });

    tickerTimer = window.setTimeout(addNextLightbox, 1000);

    return () => {
      window.clearTimeout(tickerTimer);
      window.cancelAnimationFrame(tickerFrame);
    };
  }, []);

  const handleTickerTransitionEnd = (e) => {
    if (e.propertyName !== "transform" || !isTickerStepping) return;
    setMarqueeLightboxes((current) => current.slice(0, 14));
    setIsTickerStepping(false);
  };

  const fillClass = `hero__chance-fill ${
    spinResult.includes("УСПЕШНЫЙ")
      ? "hero__chance-fill--win"
      : spinResult.includes("СГОРЕЛ")
      ? "hero__chance-fill--lose"
      : "hero__chance-fill--default"
  }`;

  const pointerTransition = isSnapNormalizing
    ? "none"
    : isPointerResetting
    ? "transform 1.1s cubic-bezier(0.16, 1, 0.3, 1)"
    : isSpinning
    ? "transform 7.5s cubic-bezier(0.35, 0.0, 0.1, 1)"
    : "none";

  return (
    <section
      className={`hero${
        spinResult.includes("УСПЕШНЫЙ")
          ? " hero--win"
          : spinResult.includes("СГОРЕЛ")
          ? " hero--lose"
          : ""
      }`}
    >
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
          {/* Левая колонка - выбор из ИНВЕНТАРЯ */}
          <div className="hero__selection-column">
            <div className={`hero__upgrade-box${selectedSourceWeapon ? " hero__upgrade-box--selected" : ""}`}>
              <h4 className="hero__upgrade-title">Скин на кону</h4>
              <span className="akbackground" aria-hidden="true">M</span>
              {selectedSourceWeapon ? (
                <div className="hero__selected-weapon" key={selectedSourceWeapon.instanceId || selectedSourceWeapon.id} style={{ "--weapon-glow": selectedSourceWeapon.glow }}>
                  <img src={selectedSourceWeapon.image} alt={selectedSourceWeapon.name} />
                  <strong>{selectedSourceWeapon.name}</strong>
                  <span>{selectedSourceWeapon.type} · <FaCoins /> {selectedSourceWeapon.price}</span>
                </div>
              ) : (
                <div className="hero__upgrade-placeholder">
                  Выберите скин из вашего инвентаря
                </div>
              )}
            </div>

            <WeaponPicker
              title="Ваш инвентарь"
              items={inventory}
              selectedWeapon={selectedSourceWeapon}
              onSelect={handleSourceWeaponSelect}
              disabled={isSpinning || isPointerResetting}
              emptyMessage="Ваш инвентарь пуст."
              onResetInventory={handleResetStarterSkin}
            />
          </div>

          {/* Центр - Рулетка апгрейда */}
          <div className="hero__chance" aria-label={`Шанс апгрейда: ${displayedChance}%`}>
            <span className="hero__chance-label">ВЕРОЯТНОСТЬ</span>
            
            <div className="hero__chance-gauge" data-result={spinResult}>
              <svg className="hero__chance-scale" viewBox="0 0 220 220" aria-hidden="true">
                <circle className="hero__chance-outer-ring" cx="110" cy="110" r="103" />
            
                
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
                  ШАНС УСПЕХА
                </text>

                <g
                  className="hero__chance-pointer"
                  style={{
                    transform: `rotate(${spinRotation}deg)`,
                    transition: pointerTransition,
                  }}
                >
                  <path className="hero__chance-pointer-shape" d="M 110 194 L 101 216 L 119 216 Z" />
                </g>
              </svg>

              <strong className="hero__chance-value">{displayedChance}%</strong>
            </div>

            <button
              className={`hero__chance-random${isSpinning || isPointerResetting ? " hero__chance-random--busy" : ""}`}
              type="button"
              onClick={spinChance}
              disabled={isSpinning || isPointerResetting || !canSpin}
            >
              {isSpinning || isPointerResetting
                ? "АПГРЕЙД..."
                : !selectedSourceWeapon
                ? "ВЫБЕРИТЕ СКИН"
                : !selectedTargetWeapon
                ? "ВЫБЕРИТЕ ЦЕЛЬ"
                : "УЛУЧШИТЬ"}
            </button>

            <span
              className={`hero__chance-result${spinResult ? " hero__chance-result--visible" : ""}${spinResult.includes("СГОРЕЛ") ? " hero__chance-result--lose" : ""}`}
            >
              {spinResult}
            </span>
          </div>

          {/* Правая колонка - выбор из КАТАЛОГА */}
          <div className="hero__selection-column">
            <div className={`hero__upgrade-box${selectedTargetWeapon ? " hero__upgrade-box--selected" : ""}`}>
              <h4 className="hero__upgrade-title">Желаемый скин</h4>
              <span className="akbackground" aria-hidden="true">M</span>
              {selectedTargetWeapon ? (
                <div className="hero__selected-weapon" key={selectedTargetWeapon.id} style={{ "--weapon-glow": selectedTargetWeapon.glow }}>
                  <img src={selectedTargetWeapon.image} alt={selectedTargetWeapon.name} />
                  <strong>{selectedTargetWeapon.name}</strong>
                  <span>{selectedTargetWeapon.type} · <FaCoins /> {selectedTargetWeapon.price}</span>
                </div>
              ) : (
                <div className="hero__upgrade-placeholder">
                  Выберите скин, который хотите получить
                </div>
              )}
            </div>

            <WeaponPicker
              title="Каталог скинов"
              items={ALL_WEAPONS}
              selectedWeapon={selectedTargetWeapon}
              onSelect={setSelectedTargetWeapon}
              minimumPrice={selectedSourceWeapon?.price ?? 0}
              disabled={isSpinning || isPointerResetting}
              emptyMessage="Нет скинов дороже вашего"
            />
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;