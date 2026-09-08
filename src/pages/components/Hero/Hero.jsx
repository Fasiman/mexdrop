import { useEffect, useRef, useState } from "react";
import { FaCoins, FaRotateLeft } from "react-icons/fa6";
import Container from "../../../components/Container/Container";

import "./Hero.css";

const API_URL = "https://cs2-api-espb.onrender.com/api/skins";

/**
 * Вспомогательная функция для безопасного получения и парсинга цены скина
 */
const getPrice = (weapon) => {
  const possiblePrice =
    weapon?.price ??
    weapon?.min_price ??
    weapon?.minPrice ??
    weapon?.cost ??
    weapon?.value ??
    weapon?.lowest_price ??
    0;

  if (typeof possiblePrice === "number") {
    return Number.isFinite(possiblePrice) ? possiblePrice : 0;
  }

  if (typeof possiblePrice === "string") {
    const normalized = possiblePrice.replace(",", ".").replace(/[^\d.]/g, "");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const getImage = (weapon) => {
  return (
    weapon?.image ??
    weapon?.image_url ??
    weapon?.imageUrl ??
    weapon?.icon ??
    weapon?.icon_url ??
    weapon?.iconUrl ??
    weapon?.img ??
    weapon?.img_url ??
    weapon?.thumbnail ??
    weapon?.picture ??
    weapon?.asset_image ??
    ""
  );
};

const getName = (weapon) => {
  return (
    weapon?.name ??
    weapon?.market_hash_name ??
    weapon?.marketHashName ??
    weapon?.market_name ??
    weapon?.marketName ??
    weapon?.skin_name ??
    weapon?.skinName ??
    weapon?.weapon_name ??
    weapon?.weaponName ??
    weapon?.title ??
    "Неизвестный скин"
  );
};

const getType = (weapon) => {
  return (
    weapon?.type ??
    weapon?.weapon ??
    weapon?.weapon_type ??
    weapon?.weaponType ??
    weapon?.category ??
    "Skin"
  );
};

const getRarity = (weapon) => {
  return (
    weapon?.rarity ??
    weapon?.rarity_name ??
    weapon?.rarityName ??
    weapon?.quality ??
    "Обычный"
  );
};

const getId = (weapon, index) => {
  return (
    weapon?.id ??
    weapon?.weapon_id ??
    weapon?.weaponId ??
    weapon?.asset_id ??
    weapon?.assetId ??
    weapon?.classid ??
    weapon?.classId ??
    `skin-${index}`
  );
};

const getGlow = (rarity) => {
  const value = String(rarity || "").toLowerCase();

  if (
    value.includes("legendary") ||
    value.includes("легендар") ||
    value.includes("gold") ||
    value.includes("золот")
  ) {
    return "rgba(255, 190, 55, 0.68)";
  }

  if (
    value.includes("mythic") ||
    value.includes("мифич") ||
    value.includes("red") ||
    value.includes("красн")
  ) {
    return "rgba(255, 36, 36, 0.72)";
  }

  if (
    value.includes("epic") ||
    value.includes("эпич") ||
    value.includes("pink") ||
    value.includes("розов")
  ) {
    return "rgba(183, 92, 255, 0.68)";
  }

  if (
    value.includes("rare") ||
    value.includes("редк") ||
    value.includes("blue") ||
    value.includes("син")
  ) {
    return "rgba(70, 150, 255, 0.62)";
  }

  return "rgba(120, 120, 120, 0.45)";
};

const normalizeWeapon = (weapon, index) => {
  const rarity = getRarity(weapon);

  return {
    ...weapon,
    id: getId(weapon, index),
    image: getImage(weapon),
    name: getName(weapon),
    type: getType(weapon),
    rarity,
    price: getPrice(weapon),
    glow: weapon?.glow || getGlow(rarity),
  };
};

const extractSkins = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  const possibleArrays = [
    response.skins,
    response.data,
    response.items,
    response.results,
    response.weapons,
    response.products,
    response.inventory,
  ];

  for (const value of possibleArrays) {
    if (Array.isArray(value)) {
      return value;
    }

    if (value && typeof value === "object") {
      if (Array.isArray(value.items)) {
        return value.items;
      }

      if (Array.isArray(value.skins)) {
        return value.skins;
      }

      if (Array.isArray(value.results)) {
        return value.results;
      }
    }
  }

  return [];
};

const WeaponPicker = ({
  title,
  items = [],
  selectedWeapon,
  onSelect,
  minimumPrice = 0,
  disabled = false,
  emptyMessage = "Нет предметов",
  onResetInventory,
  loading = false,
  itemsPerPage = 100,
}) => {
  const [sortOrder, setSortOrder] = useState("asc");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortOrder, priceFrom, priceTo, items.length]);

  const minFilter = Math.max(minimumPrice, Number(priceFrom) || 0);
  const maxFilter = priceTo === "" ? Infinity : Number(priceTo);

  const sortedWeapons = [...items]
    .filter((weapon) => {
      const price = getPrice(weapon);
      return price >= minFilter && price <= maxFilter;
    })
    .sort((a, b) => {
      const priceA = getPrice(a);
      const priceB = getPrice(b);
      return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
    });

  const totalPages = Math.ceil(sortedWeapons.length / itemsPerPage);
  const paginatedWeapons = sortedWeapons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
        {loading ? (
          <div className="hero__weapon-empty">
            <p>Загрузка скинов...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="hero__weapon-empty">
            <p>{emptyMessage}</p>

            {onResetInventory && (
              <button
                type="button"
                className="hero__reset-btn"
                onClick={onResetInventory}
                disabled={disabled}
              >
                <FaRotateLeft />
                Взять AK-47
              </button>
            )}
          </div>
        ) : sortedWeapons.length === 0 ? (
          <div className="hero__weapon-empty">
            <p>Нет подходящих скинов по фильтру</p>
          </div>
        ) : (
          <>
            {paginatedWeapons.map((weapon, index) => {
              const price = getPrice(weapon);

              const isSelected =
                selectedWeapon?.id === weapon.id &&
                (!weapon.instanceId ||
                  selectedWeapon?.instanceId === weapon.instanceId);

              const isDisabled = disabled || price < minimumPrice;

              return (
                <button
                  className={`hero__weapon-card${
                    isSelected ? " hero__weapon-card--selected" : ""
                  }${isDisabled ? " hero__weapon-card--disabled" : ""}`}
                  key={weapon.instanceId || `${weapon.id}-${index}`}
                  type="button"
                  onClick={() => onSelect(weapon)}
                  disabled={isDisabled}
                  style={{
                    "--weapon-glow": weapon.glow,
                  }}
                >
                  <div className="hero__weapon-card-image">
                    {weapon.image ? (
                      <img
                        src={weapon.image}
                        alt={weapon.name}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : null}
                  </div>

                  <span>
                    <strong>{weapon.name}</strong>
                    <small>{weapon.type}</small>
                    <em>
                      <FaCoins />
                      {price}
                    </em>
                  </span>
                </button>
              );
            })}

            {totalPages > 1 && (
              <div
                className="hero__weapon-pagination"
                style={{
                  width: "100%",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  justifyContent: "center",
                  marginTop: "12px",
                  padding: "8px 0",
                }}
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`hero__pagination-btn${
                      currentPage === page ? " hero__pagination-btn--active" : ""
                    }`}
                    onClick={() => setCurrentPage(page)}
                    disabled={disabled}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      background:
                        currentPage === page
                          ? "rgba(255, 255, 255, 0.25)"
                          : "rgba(0, 0, 0, 0.2)",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "13px",
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const Hero = ({
  inventory: externalInventory,
  setInventory: setExternalInventory,
}) => {
  const [skins, setSkins] = useState([]);
  const [loadingSkins, setLoadingSkins] = useState(true);
  const [skinsError, setSkinsError] = useState("");

  /*
   * Загрузка скинов из API без обращения к SkinCash.
   */
  useEffect(() => {
    let cancelled = false;

    const loadSkins = async () => {
      try {
        setLoadingSkins(true);
        setSkinsError("");

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const rawSkins = extractSkins(data);

        const normalized = rawSkins
          .map(normalizeWeapon)
          .filter((skin) => skin.name && skin.image);

        if (!cancelled) {
          setSkins(normalized);
        }
      } catch (error) {
        console.error("Ошибка загрузки скинов:", error);

        if (!cancelled) {
          setSkins([]);
          setSkinsError("Не удалось загрузить скины");
        }
      } finally {
        if (!cancelled) {
          setLoadingSkins(false);
        }
      }
    };

    loadSkins();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Инвентарь.
   */
  const [localInventory, setLocalInventory] = useState([]);
  const inventory = externalInventory ?? localInventory;
  const setInventory = setExternalInventory ?? setLocalInventory;

  /*
   * После загрузки добавляем стартовый скин в инвентарь, если пуст.
   */
  useEffect(() => {
    if (loadingSkins || skins.length === 0 || inventory.length > 0) {
      return;
    }

    const starterSkin = {
      ...skins[0],
      instanceId: `starter-${Date.now()}`,
    };

    setInventory([starterSkin]);
  }, [loadingSkins, skins, inventory.length, setInventory]);

  const [selectedSourceWeapon, setSelectedSourceWeapon] = useState(null);
  const [selectedTargetWeapon, setSelectedTargetWeapon] = useState(null);

  /*
   * Шанс апгрейда.
   */
  const upgradeChance =
    selectedSourceWeapon && selectedTargetWeapon
      ? Math.min(
          90,
          Math.max(
            1,
            Math.round(
              (getPrice(selectedSourceWeapon) /
                getPrice(selectedTargetWeapon)) *
                100,
            ),
          ),
        )
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

    setSelectedTargetWeapon((current) => {
      if (!current) {
        return null;
      }
      return getPrice(current) < getPrice(weapon) ? null : current;
    });
  };

  const handleResetStarterSkin = () => {
    if (skins.length === 0) {
      return;
    }

    const starterSkin = {
      ...skins[0],
      instanceId: `starter-${Date.now()}`,
    };

    setInventory([starterSkin]);
  };

  /*
   * Анимация процента.
   */
  useEffect(() => {
    const startChance = displayedChanceRef.current;
    const startedAt = performance.now();
    const duration = 500;
    let animationFrame;

    const animateChance = (timestamp) => {
      const progress = Math.min((timestamp - startedAt) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const nextChance = Math.round(
        startChance + (upgradeChance - startChance) * easedProgress,
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

  /*
   * Рулетка / Апгрейд.
   */
  const spinChance = () => {
    if (isSpinning || isPointerResetting || !canSpin) {
      return;
    }

    const sourceWeapon = selectedSourceWeapon;
    const targetWeapon = selectedTargetWeapon;

    setInventory((prev) => {
      const index = prev.findIndex((item) =>
        item.instanceId
          ? item.instanceId === sourceWeapon.instanceId
          : item.id === sourceWeapon.id,
      );

      if (index === -1) {
        return prev;
      }

      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });

    const sourcePrice = getPrice(sourceWeapon);
    const targetPrice = getPrice(targetWeapon);

    const chance = Math.min(
      90,
      Math.max(1, Math.round((sourcePrice / targetPrice) * 100)),
    );

    const halfChance = chance / 2;
    const boundaryPadding = Math.min(2, Math.max(0.5, halfChance / 5));

    const shouldWin = Math.random() < chance / 100;
    const safeWinWidth = halfChance - boundaryPadding;
    const safeLoseStart = halfChance + boundaryPadding;
    const safeLoseEnd = 100 - halfChance - boundaryPadding;

    let landingPercent;

    if (shouldWin) {
      landingPercent =
        Math.random() < 0.5
          ? boundaryPadding + Math.random() * (safeWinWidth - boundaryPadding)
          : 100 -
            halfChance +
            boundaryPadding +
            Math.random() * (safeWinWidth - boundaryPadding);
    } else {
      landingPercent =
        safeLoseStart + Math.random() * (safeLoseEnd - safeLoseStart);
    }

    setSpinResult("");
    setIsSpinning(true);
    setIsPointerResetting(false);
    setIsSnapNormalizing(false);

    const landingRotation = (landingPercent / 100) * 360;
    const currentRot = spinRotationRef.current;
    const baseRounds = 5 * 360;

    const targetRotation =
      Math.ceil(currentRot / 360) * 360 + baseRounds + landingRotation;

    const pointerPercent = ((((targetRotation % 360) + 360) % 360) / 360) * 100;

    const isWin =
      pointerPercent <= halfChance || pointerPercent >= 100 - halfChance;

    spinRotationRef.current = targetRotation;
    setSpinRotation(targetRotation);

    const SPIN_TIME = 7500;
    const RESULT_PAUSE = 1600;
    const RESET_TIME = 1100;

    window.setTimeout(() => {
      if (isWin) {
        const wonItem = {
          ...targetWeapon,
          instanceId: `won-${Date.now()}`,
        };

        setInventory((prev) => [...prev, wonItem]);
        setSpinResult("УСПЕШНЫЙ АПГРЕЙД!");
      } else {
        setSpinResult("АПГРЕЙД СГОРЕЛ");
      }

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

  /*
   * ДВИЖУЩАЯСЯ ЛЕНТА СКИНОВ
   */
  const nextLightboxIndex = useRef(14);
  const [marqueeLightboxes, setMarqueeLightboxes] = useState([]);
  const [isTickerEntering, setIsTickerEntering] = useState(false);
  const [isTickerStepping, setIsTickerStepping] = useState(false);

  useEffect(() => {
    if (skins.length === 0) {
      return;
    }

    const initialItems = Array.from({ length: 14 }, (_, index) => {
      const weapon = skins[index % skins.length];
      return {
        ...weapon,
        instance: `initial-${index}-${weapon.id}`,
      };
    });

    setMarqueeLightboxes(initialItems);
    nextLightboxIndex.current = 14;
  }, [skins]);

  useEffect(() => {
    if (skins.length === 0) {
      return;
    }

    let tickerTimer;
    let tickerFrame;

    const addNextLightbox = () => {
      if (document.hidden) {
        return;
      }

      const weapon = skins[nextLightboxIndex.current % skins.length];
      nextLightboxIndex.current += 1;

      setMarqueeLightboxes((current) => [
        {
          ...weapon,
          instance: `ticker-${nextLightboxIndex.current}-${weapon.id}`,
        },
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

    const handleVisibilityChange = () => {
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
  }, [skins]);

  const handleTickerTransitionEnd = (e) => {
    if (e.propertyName !== "transform" || !isTickerStepping) {
      return;
    }

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
          className={`hero__top-track${
            isTickerEntering ? " hero__top-track--entering" : ""
          }${isTickerStepping ? " hero__top-track--stepping" : ""}`}
          onTransitionEnd={handleTickerTransitionEnd}
        >
          {loadingSkins && marqueeLightboxes.length === 0 ? (
            <div className="hero__weapon-empty">
              <p>Загрузка скинов...</p>
            </div>
          ) : (
            marqueeLightboxes.map((lightbox) => (
              <div
                className="hero__lightbox"
                key={lightbox.instance}
                style={{
                  "--weapon-glow": lightbox.glow,
                }}
              >
                <img
                  className="hero__lightbox-image"
                  src={lightbox.image}
                  alt={lightbox.name}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />

                <div className="hero__lightbox-info">
                  <strong>{lightbox.name}</strong>
                  <span>{lightbox.type}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Container>
        <div className="hero__upgrade">
          <div className="hero__selection-column">
            <div
              className={`hero__upgrade-box${
                selectedSourceWeapon ? " hero__upgrade-box--selected" : ""
              }`}
            >
              <h4 className="hero__upgrade-title">Скин на кону</h4>

              <span className="akbackground" aria-hidden="true">
                M
              </span>

              {selectedSourceWeapon ? (
                <div
                  className="hero__selected-weapon"
                  key={
                    selectedSourceWeapon.instanceId || selectedSourceWeapon.id
                  }
                  style={{
                    "--weapon-glow": selectedSourceWeapon.glow,
                  }}
                >
                  <img
                    src={selectedSourceWeapon.image}
                    alt={selectedSourceWeapon.name}
                  />

                  <strong>{selectedSourceWeapon.name}</strong>

                  <span>
                    {selectedSourceWeapon.type} · <FaCoins />{" "}
                    {getPrice(selectedSourceWeapon)}
                  </span>
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
              emptyMessage={"Ваш инвентарь пуст."}
              onResetInventory={handleResetStarterSkin}
            />
          </div>

          <div
            className="hero__chance"
            aria-label={`Шанс апгрейда: ${displayedChance}%`}
          >
            <span className="hero__chance-label">ВЕРОЯТНОСТЬ</span>

            <div className="hero__chance-gauge" data-result={spinResult}>
              <svg
                className="hero__chance-scale"
                viewBox="0 0 220 220"
                aria-hidden="true"
              >
                <circle
                  className="hero__chance-outer-ring"
                  cx="110"
                  cy="110"
                  r="103"
                />

                <path
                  className={fillClass}
                  d="M 110 196 A 86 86 0 0 1 110 24"
                  pathLength="50"
                  style={{
                    "--chance-offset": 50 - displayedChance / 2,
                  }}
                />

                <path
                  className={fillClass}
                  d="M 110 196 A 86 86 0 0 0 110 24"
                  pathLength="50"
                  style={{
                    "--chance-offset": 50 - displayedChance / 2,
                  }}
                />

                <circle
                  className="hero__chance-inner-ring"
                  cx="110"
                  cy="110"
                  r="68"
                />

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
                  <path
                    className="hero__chance-pointer-shape"
                    d="M 110 194 L 101 216 L 119 216 Z"
                  />
                </g>
              </svg>

              <strong className="hero__chance-value">{displayedChance}%</strong>
            </div>

            <button
              className={`hero__chance-random${
                isSpinning || isPointerResetting
                  ? " hero__chance-random--busy"
                  : ""
              }`}
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
              className={`hero__chance-result${
                spinResult ? " hero__chance-result--visible" : ""
              }${
                spinResult.includes("СГОРЕЛ")
                  ? " hero__chance-result--lose"
                  : ""
              }`}
            >
              {spinResult}
            </span>
          </div>

          <div className="hero__selection-column">
            <div
              className={`hero__upgrade-box${
                selectedTargetWeapon ? " hero__upgrade-box--selected" : ""
              }`}
            >
              <h4 className="hero__upgrade-title">Желаемый скин</h4>

              <span className="akbackground" aria-hidden="true">
                M
              </span>

              {selectedTargetWeapon ? (
                <div
                  className="hero__selected-weapon"
                  key={selectedTargetWeapon.id}
                  style={{
                    "--weapon-glow": selectedTargetWeapon.glow,
                  }}
                >
                  <img
                    src={selectedTargetWeapon.image}
                    alt={selectedTargetWeapon.name}
                  />

                  <strong>{selectedTargetWeapon.name}</strong>

                  <span>
                    {selectedTargetWeapon.type} · <FaCoins />{" "}
                    {getPrice(selectedTargetWeapon)}
                  </span>
                </div>
              ) : (
                <div className="hero__upgrade-placeholder">
                  Выберите скин, который хотите получить
                </div>
              )}
            </div>

            <WeaponPicker
              title="Каталог скинов"
              items={skins}
              selectedWeapon={selectedTargetWeapon}
              onSelect={setSelectedTargetWeapon}
              minimumPrice={
                selectedSourceWeapon ? getPrice(selectedSourceWeapon) : 0
              }
              disabled={isSpinning || isPointerResetting}
              loading={loadingSkins}
              emptyMessage={skinsError || "Нет скинов"}
              itemsPerPage={100}
            />
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;