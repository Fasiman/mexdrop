import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  FaCoins,
  FaMagnifyingGlass,
  FaBoxesPacking,
  FaCartShopping,
  FaPlus,
  FaMinus,
  FaBasketShopping,
} from "react-icons/fa6";
import Container from "../../../components/Container/Container";

import "./Hero.css";

const REFRESH_INTERVAL_MS = 10 * 60 * 1000;
const CACHE_KEY = "cs2_catalog_real_only_v12";
const CACHE_TIME_KEY = "cs2_catalog_real_only_time_v12";
const CACHE_TTL = REFRESH_INTERVAL_MS;

const BYMYKEL_SKINS = "https://cdn.jsdelivr.net/gh/ByMykel/CSGO-API@main/public/api/en/skins.json";
const BYMYKEL_CRATES = "https://cdn.jsdelivr.net/gh/ByMykel/CSGO-API@main/public/api/en/crates.json";

const BACKEND_PRICES_API = "http://localhost:5000/api/prices";
const BACKEND_USERS_API = "http://localhost:5000/api/users";
const BACKEND_AUTH_USER_API = "http://localhost:5000/api/auth/user";
const BACKEND_UPGRADES_API = "http://localhost:5000/api/upgrades";

const WEAR_CONFIG = {
  "Factory New": {
    ru: "Прямо с завода",
    short: "FN",
    badgeBg: "rgba(34, 197, 94, 0.25)",
    badgeColor: "#4ade80",
    border: "rgba(34, 197, 94, 0.5)",
  },
  "Minimal Wear": {
    ru: "Немного поношенное",
    short: "MW",
    badgeBg: "rgba(59, 130, 246, 0.25)",
    badgeColor: "#60a5fa",
    border: "rgba(59, 130, 246, 0.5)",
  },
  "Field-Tested": {
    ru: "После полевых испытаний",
    short: "FT",
    badgeBg: "rgba(234, 179, 8, 0.25)",
    badgeColor: "#facc15",
    border: "rgba(234, 179, 8, 0.5)",
  },
  "Well-Worn": {
    ru: "Поношенное",
    short: "WW",
    badgeBg: "rgba(249, 115, 22, 0.25)",
    badgeColor: "#fb923c",
    border: "rgba(249, 115, 22, 0.5)",
  },
  "Battle-Scarred": {
    ru: "Закалённое в боях",
    short: "BS",
    badgeBg: "rgba(239, 68, 68, 0.25)",
    badgeColor: "#f87171",
    border: "rgba(239, 68, 68, 0.5)",
  },
};

const ALL_WEARS = [
  { name: "Factory New" },
  { name: "Minimal Wear" },
  { name: "Field-Tested" },
  { name: "Well-Worn" },
  { name: "Battle-Scarred" },
];

const CATEGORY_TRANSLATIONS = {
  Rifle: "Винтовка",
  Sniper: "Снайперская винтовка",
  "Sniper Rifle": "Снайперская винтовка",
  Pistol: "Пистолет",
  SMG: "Пистолет-пулемёт",
  Shotgun: "Дробовик",
  Machinegun: "Пулемёт",
  Knife: "Нож",
  Gloves: "Перчатки",
  Case: "Кейс",
  Capsule: "Капсула",
  "Souvenir Package": "Сувенирный набор",
};

const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <rect width="160" height="160" rx="16" fill="#15181d"/>
      <path d="M48 48l64 64M112 48l-64 64" stroke="#5b6470" stroke-width="10" stroke-linecap="round"/>
      <rect x="7" y="7" width="146" height="146" rx="14" fill="none" stroke="#2a3038" stroke-width="4"/>
    </svg>
  `);

const FALLBACK_COLORS = {
  consumer: "#b0c3d9",
  industrial: "#5e98d9",
  "mil-spec": "#4b69ff",
  restricted: "#8847ff",
  classified: "#d32ce6",
  covert: "#eb4b4b",
  extraordinary: "#ffd700",
  contraband: "#e4ae39",
  default: "#8b8b8b",
};

const getRarityColor = (item) => {
  if (item?.rarity?.color) return item.rarity.color;
  const nameStr = String(item?.name || "").toLowerCase();
  const catStr = String(item?.category?.name || item?.type || "").toLowerCase();

  if (nameStr.includes("howl")) return FALLBACK_COLORS.contraband;
  if (nameStr.includes("★") || catStr.includes("knife") || catStr.includes("glove")) {
    return FALLBACK_COLORS.extraordinary;
  }
  return FALLBACK_COLORS.default;
};

const cleanSteamImageUrl = (url) => {
  if (!url) return FALLBACK_IMAGE;
  let src = String(url);
  if (src.startsWith("//")) src = "https:" + src;
  return src;
};

/* ==========================================================================
   КОМПОНЕНТ ВЫБОРА ОРУЖИЯ (С ВКЛАДКАМИ И МАГАЗИНОМ)
   ========================================================================== */
const WeaponPicker = ({
  title,
  items = [],
  inventoryItems = [],
  selectedWeapon,
  onSelect,
  onBuyAndStake,
  minimumPrice = 0,
  userBalance = Infinity,
  disabled = false,
  emptyMessage = "Нет предметов",
  loading = false,
  itemsPerPage = 9,
  enableTabs = false,
}) => {
  const [activeTab, setActiveTab] = useState("inventory");
  const [sortOrder, setSortOrder] = useState("asc");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [wearFilter, setWearFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, sortOrder, priceFrom, priceTo, searchQuery, wearFilter, items.length, inventoryItems.length]);

  const minFilter = Math.max(minimumPrice, Number(priceFrom) || 0);
  const maxFilter = priceTo === "" ? Infinity : Number(priceTo);

  const activeSourceList = useMemo(() => {
    if (!enableTabs) return items;
    return activeTab === "inventory" ? inventoryItems : items;
  }, [enableTabs, activeTab, inventoryItems, items]);

  const filteredWeapons = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return activeSourceList
      .filter((weapon) => {
        if (!weapon.price || weapon.price <= 0) return false;
        if (weapon.price < minFilter || weapon.price > maxFilter) return false;

        if (wearFilter !== "ALL" && weapon.wearShort !== wearFilter) {
          return false;
        }

        if (q) {
          const name = weapon.name.toLowerCase();
          const type = weapon.type.toLowerCase();
          const wearRu = (weapon.wearName || "").toLowerCase();
          const tag = (weapon.wearShort || "").toLowerCase();

          return name.includes(q) || type.includes(q) || wearRu.includes(q) || tag === q;
        }
        return true;
      })
      .sort((a, b) => (sortOrder === "asc" ? a.price - b.price : b.price - a.price));
  }, [activeSourceList, minFilter, maxFilter, searchQuery, wearFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredWeapons.length / itemsPerPage));
  const paginatedWeapons = filteredWeapons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleQuantityChange = (weaponId, delta) => {
    setQuantities((prev) => {
      const current = prev[weaponId] || 1;
      const next = Math.max(1, Math.min(10, current + delta));
      return { ...prev, [weaponId]: next };
    });
  };

  return (
    <div className="hero__weapon-picker">
      <div className="hero__weapon-picker-header">
        {enableTabs ? (
          <div className="hero__picker-tabs">
            <button
              type="button"
              className={`hero__tab-btn ${activeTab === "inventory" ? "hero__tab-btn--active" : ""}`}
              onClick={() => setActiveTab("inventory")}
            >
              <FaBoxesPacking />
              <span>Инвентарь</span>
              <small>({inventoryItems.length})</small>
            </button>
            <button
              type="button"
              className={`hero__tab-btn ${activeTab === "shop" ? "hero__tab-btn--active" : ""}`}
              onClick={() => setActiveTab("shop")}
            >
              <FaCartShopping />
              <span>Магазин</span>
            </button>
          </div>
        ) : (
          <span className="hero__weapon-picker-title">
            {title}
            <small style={{ marginLeft: "8px", color: "#8b949e", fontSize: "0.75rem" }}>
              ({filteredWeapons.length} в продаже)
            </small>
          </span>
        )}

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

      <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            type="text"
            placeholder="Поиск оружия..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={disabled}
            className="hero__picker-search-input"
          />
          <FaMagnifyingGlass className="hero__picker-search-icon" />
        </div>

        <select
          value={wearFilter}
          onChange={(e) => setWearFilter(e.target.value)}
          disabled={disabled}
          className="hero__picker-wear-select"
        >
          <option value="ALL">Все качества</option>
          <option value="FN">FN · Завод</option>
          <option value="MW">MW · Поношенное</option>
          <option value="FT">FT · Полевые</option>
          <option value="WW">WW · Поношенное</option>
          <option value="BS">BS · Закалённое</option>
        </select>
      </div>

      <div className="hero__weapon-price-range">
        <label>
          <span>От</span>
          <input
            type="number"
            min={minimumPrice}
            placeholder={minimumPrice ? String(minimumPrice) : "0"}
            value={priceFrom}
            onChange={(e) => setPriceFrom(e.target.value)}
            disabled={disabled}
          />
          <FaCoins className="hero__coin-icon" />
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
          <FaCoins className="hero__coin-icon" />
        </label>
      </div>

      <div className="hero__weapon-list">
        {loading ? (
          <div className="hero__weapon-empty">
            <p>Загрузка каталога с ценами...</p>
          </div>
        ) : activeSourceList.length === 0 ? (
          <div className="hero__weapon-empty">
            <p>
              {enableTabs && activeTab === "inventory"
                ? "Ваш инвентарь пуст. Купите скин в Магазине!"
                : emptyMessage}
            </p>
          </div>
        ) : filteredWeapons.length === 0 ? (
          <div className="hero__weapon-empty">
            <p>Нет предметов по выбранному фильтру</p>
          </div>
        ) : (
          paginatedWeapons.map((weapon) => {
            const isSelected = weapon.instanceId
              ? selectedWeapon?.instanceId === weapon.instanceId
              : selectedWeapon?.id === weapon.id;

            const isShopMode = enableTabs && activeTab === "shop";
            const qty = quantities[weapon.id] || 1;
            const totalPrice = weapon.price * qty;
            const isAffordable = totalPrice <= userBalance;
            
            // Инвентарь не проверяет баланс пользователя для выставления скина на кон
            const isDisabled =
              disabled || !weapon.price || weapon.price < minimumPrice || (isShopMode && !isAffordable);

            return (
              <div
                key={weapon.instanceId || weapon.id}
                className={`hero__weapon-card${isSelected ? " hero__weapon-card--selected" : ""}${
                  isDisabled ? " hero__weapon-card--disabled" : ""
                }`}
                style={{
                  "--weapon-glow": weapon.glow,
                  opacity: !isAffordable && isShopMode ? 0.45 : undefined,
                }}
              >
                <div className="hero__weapon-card-image" style={{ position: "relative" }}>
                  {weapon.wearShort && (
                    <span
                      className="hero__weapon-badge"
                      style={{
                        backgroundColor: weapon.badgeBg,
                        color: weapon.badgeColor,
                        border: `1px solid ${weapon.border}`,
                      }}
                    >
                      {weapon.wearShort}
                    </span>
                  )}

                  <img
                    src={weapon.image}
                    alt={weapon.name}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (img.dataset.fallbackApplied === "1") return;
                      img.dataset.fallbackApplied = "1";
                      img.onerror = null;
                      img.src = FALLBACK_IMAGE;
                    }}
                  />
                </div>

                <span>
                  <strong>{weapon.name}</strong>
                  <small>{weapon.type}</small>
                  <em style={{ color: !isAffordable && isShopMode ? "#f87171" : undefined }}>
                    <FaCoins className="hero__coin-icon" />
                    {weapon.price ? `${weapon.price.toFixed(2)} ₽` : "Нет цены"}
                  </em>
                </span>

                {isShopMode ? (
                  <div className="hero__shop-controls">
                    <div className="hero__qty-picker">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(weapon.id, -1)}
                        disabled={qty <= 1}
                      >
                        <FaMinus />
                      </button>
                      <span>{qty}</span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(weapon.id, 1)}
                        disabled={qty >= 10}
                      >
                        <FaPlus />
                      </button>
                    </div>

                    <button
                      type="button"
                      className="hero__buy-btn"
                      disabled={disabled || !isAffordable}
                      onClick={() => onBuyAndStake && onBuyAndStake(weapon, qty)}
                      title={!isAffordable ? "Недостаточно средств" : "Купить и поставить на кон"}
                    >
                      <FaBasketShopping />
                      <span>{totalPrice.toFixed(0)} ₽</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="hero__select-overlay-btn"
                    onClick={() => onSelect(weapon)}
                    disabled={isDisabled}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="hero__weapon-pagination">
          <button
            type="button"
            className="hero__pagination-btn"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={disabled || currentPage === 1}
            aria-label="Предыдущая страница"
          >
            ‹
          </button>

          <span className="hero__pagination-info">
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            className="hero__pagination-btn"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={disabled || currentPage === totalPages}
            aria-label="Следующая страница"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   ОСНОВНОЙ КОМПОНЕНТ HERO
   ========================================================================== */
const Hero = ({
  inventory: externalInventory,
  setInventory: setExternalInventory,
  userBalance: externalUserBalance,
  setUserBalance: setExternalUserBalance,
}) => {
  const [skins, setSkins] = useState([]);
  const [loadingSkins, setLoadingSkins] = useState(true);
  const [skinsError, setSkinsError] = useState("");
  const [statusText, setStatusText] = useState("Загрузка...");

  const [steamId, setSteamId] = useState(null);
  const steamIdRef = useRef(null);

  const [internalBalance, setInternalBalance] = useState(5000);
  const [internalInventory, setInternalInventory] = useState([]);

  const [recentUpgrades, setRecentUpgrades] = useState([]);
  const [tickerAnimation, setTickerAnimation] = useState(false);
  const previousTickerIdsRef = useRef([]);

  const userBalance = externalUserBalance !== undefined ? externalUserBalance : internalBalance;
  const setUserBalance = setExternalUserBalance || setInternalBalance;

  const inventory = externalInventory || internalInventory;
  const setInventory = setExternalInventory || setInternalInventory;

  useEffect(() => {
    steamIdRef.current = steamId;
  }, [steamId]);

  const fetchUpgrades = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_UPGRADES_API}?limit=30`, { credentials: "include" });
      if (!res.ok) return;

      const data = await res.json();
      if (!Array.isArray(data)) return;

      const winsOnly = data.filter((upg) =>
        upg?.won === true || upg?.won === "true" || upg?.won === 1
      );

      const ids = winsOnly.map((upg) => String(upg.id || `${upg.createdAt}-${upg.outputItem?.name || upg.name}`));
      const previousIds = previousTickerIdsRef.current;

      if (previousIds.length > 0 && ids.length > 0 && ids[0] !== previousIds[0]) {
        setTickerAnimation(false);
        requestAnimationFrame(() => {
          setTickerAnimation(true);
          window.setTimeout(() => setTickerAnimation(false), 380);
        });
      }

      previousTickerIdsRef.current = ids;
      setRecentUpgrades(winsOnly);
    } catch (e) {
      console.error("Ошибка загрузки апгрейдов с бэкенда:", e);
    }
  }, []);

  useEffect(() => {
    fetchUpgrades();
    const intervalId = setInterval(fetchUpgrades, 5000);
    return () => clearInterval(intervalId);
  }, [fetchUpgrades]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const authRes = await fetch(BACKEND_AUTH_USER_API, { credentials: "include" });
        if (authRes.ok) {
          const authData = await authRes.json();
          if (authData.authenticated && authData.user?.steamid) {
            setSteamId(authData.user.steamid);
            if (typeof authData.user.balance === "number") setUserBalance(authData.user.balance);
            if (Array.isArray(authData.user.inventory)) setInventory(authData.user.inventory);
            return;
          }
        }

        const usersRes = await fetch(BACKEND_USERS_API, { credentials: "include" });
        if (usersRes.ok) {
          const users = await usersRes.json();
          if (Array.isArray(users) && users.length > 0) {
            const user = users[0];
            setSteamId(user.steamid);
            if (typeof user.balance === "number") setUserBalance(user.balance);
            if (Array.isArray(user.inventory)) setInventory(user.inventory);
          } else {
            const demoSteamId = "76561198000000000";
            const createRes = await fetch(BACKEND_USERS_API, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                steamid: demoSteamId,
                username: "Demo User",
                balance: 5000,
                inventory: [],
              }),
            });

            if (createRes.ok) {
              const createdData = await createRes.json();
              setSteamId(demoSteamId);
              if (createdData.user) {
                if (typeof createdData.user.balance === "number") setUserBalance(createdData.user.balance);
                if (Array.isArray(createdData.user.inventory)) setInventory(createdData.user.inventory);
              }
            }
          }
        }
      } catch (e) {
        console.warn("БД недоступна по адресу http://localhost:5000/api/users", e);
      }
    };

    fetchUserData();
  }, [setInventory, setUserBalance]);

  const syncUserToBackend = async (newBalance, newInventory) => {
    const currentSteamId = steamIdRef.current;
    if (!currentSteamId) return;

    try {
      await fetch(`${BACKEND_USERS_API}/${currentSteamId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          balance: newBalance,
          inventory: newInventory,
        }),
      });
    } catch (e) {
      console.error("Ошибка синхронизации с сервером:", e);
    }
  };

  const loadSkins = useCallback(async (isBackground = false) => {
    if (!isBackground) {
      setLoadingSkins(true);
      setSkinsError("");
      setStatusText("Запрос актуальных цен с биржи...");
    }

    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
      const now = Date.now();

      if (!isBackground && cachedData && cachedTime && now - Number(cachedTime) < CACHE_TTL) {
        try {
          const parsed = JSON.parse(cachedData);
          if (Array.isArray(parsed) && parsed.length >= 500) {
            setSkins(parsed);
            setLoadingSkins(false);
            return;
          }
        } catch {}
      }

      const skinsPromise = fetch(BYMYKEL_SKINS).then((r) => (r.ok ? r.json() : [])).catch(() => []);
      const cratesPromise = fetch(BYMYKEL_CRATES).then((r) => (r.ok ? r.json() : [])).catch(() => []);
      const pricesPromise = fetch(BACKEND_PRICES_API, { credentials: "include" })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);

      const [rawSkins, rawCrates, rawPricing] = await Promise.all([
        skinsPromise,
        cratesPromise,
        pricesPromise,
      ]);

      const priceMap = rawPricing && typeof rawPricing === "object" ? rawPricing : null;

      if (!priceMap || Object.keys(priceMap).length === 0) {
        setSkins([]);
        setSkinsError("Запустите сервер цен server.js на порту 5000");
        setLoadingSkins(false);
        return;
      }

      const fullCatalog = [];

      if (Array.isArray(rawSkins)) {
        rawSkins.forEach((skin, sIndex) => {
          if (!skin?.name || !skin?.image) return;

          const glow = getRarityColor(skin);
          const rawType = skin?.weapon?.name || skin?.category?.name || "Оружие";
          const typeName = CATEGORY_TRANSLATIONS[rawType] || rawType;
          const cleanImage = cleanSteamImageUrl(skin.image);

          ALL_WEARS.forEach((wearObj) => {
            const wearKey = wearObj.name;
            const wearData = WEAR_CONFIG[wearKey];
            const marketHashName = `${skin.name} (${wearKey})`;

            const realPrice = priceMap[marketHashName] || null;

            if (realPrice && typeof realPrice === "number" && realPrice > 0) {
              fullCatalog.push({
                id: `${skin.id}-${wearData.short}`,
                instanceId: `skin-${sIndex}-${wearData.short}`,
                name: skin.name,
                type: typeName,
                rarity: skin?.rarity?.name || "Стандартное",
                image: cleanImage,
                glow,
                price: realPrice,
                wearKey: wearKey,
                wearName: wearData.ru,
                wearShort: wearData.short,
                badgeBg: wearData.badgeBg,
                badgeColor: wearData.badgeColor,
                border: wearData.border,
              });
            }
          });
        });
      }

      if (Array.isArray(rawCrates)) {
        rawCrates.forEach((crate, cIndex) => {
          if (!crate?.name || !crate?.image) return;

          const realPrice = priceMap[crate.name] || null;
          if (realPrice && typeof realPrice === "number" && realPrice > 0) {
            const glow = getRarityColor(crate);
            const rawType = crate?.category?.name || crate?.type || "Кейс";
            const typeName = CATEGORY_TRANSLATIONS[rawType] || rawType;
            const cleanImage = cleanSteamImageUrl(crate.image);

            fullCatalog.push({
              id: String(crate.id || `crate-${cIndex}`),
              instanceId: `crate-${cIndex}`,
              name: crate.name,
              type: typeName,
              rarity: crate?.rarity?.name || "Контейнер",
              image: cleanImage,
              glow,
              price: realPrice,
              wearKey: "",
              wearName: "",
              wearShort: "",
            });
          }
        });
      }

      if (fullCatalog.length > 0) {
        setSkins(fullCatalog);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(fullCatalog));
          localStorage.setItem(CACHE_TIME_KEY, String(now));
        } catch {}
      } else if (!isBackground) {
        setSkinsError("Нет предметов в базе.");
      }
    } catch {
      if (!isBackground) setSkinsError("Ошибка подключения к серверу.");
    } finally {
      if (!isBackground) setLoadingSkins(false);
    }
  }, []);

  useEffect(() => {
    loadSkins(false);
    const intervalId = setInterval(() => loadSkins(true), REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [loadSkins]);

  const [selectedSourceWeapon, setSelectedSourceWeapon] = useState(null);
  const [selectedTargetWeapon, setSelectedTargetWeapon] = useState(null);

  const handleSelectSourceFromInventory = (weapon) => {
    setSelectedSourceWeapon(weapon);
    setSelectedTargetWeapon((current) => {
      if (!current) return null;
      return current.price < weapon.price ? null : current;
    });
  };

  const handleBuyAndStakeFromShop = (weapon, quantity = 1) => {
    const totalPrice = weapon.price * quantity;
    if (userBalance < totalPrice) return;

    const nextBalance = userBalance - totalPrice;
    setUserBalance(nextBalance);

    const purchasedItems = Array.from({ length: quantity }, (_, i) => ({
      ...weapon,
      instanceId: `inv-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 9)}_${performance.now()}`,
    }));

    const nextInventory = [...inventory, ...purchasedItems];
    setInventory(nextInventory);

    setSelectedSourceWeapon(purchasedItems[0]);

    setSelectedTargetWeapon((current) => {
      if (!current) return null;
      return current.price < purchasedItems[0].price ? null : current;
    });

    syncUserToBackend(nextBalance, nextInventory);
  };

  const upgradeChance = useMemo(() => {
    if (!selectedSourceWeapon || !selectedTargetWeapon) return 50;
    const sPrice = selectedSourceWeapon.price;
    const tPrice = selectedTargetWeapon.price || 1;
    const rawChance = (sPrice / tPrice) * 100;
    return Number(Math.min(90, Math.max(1, rawChance)).toFixed(2));
  }, [selectedSourceWeapon, selectedTargetWeapon]);

  const canSpin = Boolean(selectedSourceWeapon && selectedTargetWeapon);

  const [displayedChance, setDisplayedChance] = useState(upgradeChance);
  const displayedChanceRef = useRef(upgradeChance);

  const [spinRotation, setSpinRotation] = useState(0);
  const spinRotationRef = useRef(0);

  const [isSpinning, setIsSpinning] = useState(false);
  const [isPointerResetting, setIsPointerResetting] = useState(false);
  const [isSnapNormalizing, setIsSnapNormalizing] = useState(false);
  const [spinResult, setSpinResult] = useState("");

  useEffect(() => {
    const startChance = displayedChanceRef.current;
    const startedAt = performance.now();
    const duration = 450;
    let animationFrame;

    const animateChance = (timestamp) => {
      const progress = Math.min((timestamp - startedAt) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const nextChance = Number(
        (startChance + (upgradeChance - startChance) * easedProgress).toFixed(2)
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

  const spinChance = async () => {
    if (isSpinning || isPointerResetting || !canSpin) return;

    const sourceWeapon = selectedSourceWeapon;
    const targetWeapon = selectedTargetWeapon;

    const updatedInventory = inventory.filter(
      (item) => item.instanceId !== sourceWeapon.instanceId
    );
    setInventory(updatedInventory);

    const chance = Math.min(
      90,
      Math.max(1, (sourceWeapon.price / (targetWeapon.price || 1)) * 100)
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
    const pointerPercent = ((((targetRotation % 360) + 360) % 360) / 360) * 100;
    const isWin = pointerPercent <= halfChance || pointerPercent >= 100 - halfChance;

    spinRotationRef.current = targetRotation;
    setSpinRotation(targetRotation);

    const SPIN_TIME = 7500;
    const RESULT_PAUSE = 1600;
    const RESET_TIME = 1100;

    window.setTimeout(async () => {
      let finalInventory = updatedInventory;
      if (isWin) {
        const wonItem = { ...targetWeapon, instanceId: `won-${Date.now()}` };
        finalInventory = [...updatedInventory, wonItem];
        setInventory(finalInventory);
        setSpinResult("УСПЕШНЫЙ АПГРЕЙД!");
      } else {
        setSpinResult("АПГРЕЙД СГОРЕЛ");
      }

      syncUserToBackend(userBalance, finalInventory);
      setSelectedSourceWeapon(null);

      if (isWin) {
        try {
          const safeSourcePrice = Number(sourceWeapon.price) || 0;
          const safeTargetPrice = Number(targetWeapon.price) || 0;
          const safeChance = Number(chance.toFixed(2));
          const safeMultiplier = safeSourcePrice > 0
            ? Number((safeTargetPrice / safeSourcePrice).toFixed(4))
            : 0;

          const upgradeRes = await fetch(BACKEND_UPGRADES_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              steamid: steamIdRef.current || "76561198000000000",
              inputItem: { ...sourceWeapon, price: safeSourcePrice },
              outputItem: { ...targetWeapon, price: safeTargetPrice },
              chance: safeChance,
              multiplier: safeMultiplier,
              won: true,
              profit: Number((safeTargetPrice - safeSourcePrice).toFixed(2)),
            }),
          });

          if (!upgradeRes.ok) {
            console.error("Сервер не сохранил апгрейд:", upgradeRes.status);
          } else {
            await fetchUpgrades();
          }
        } catch (err) {
          console.error("Не удалось отправить апгрейд на сервер:", err);
        }
      }

      window.setTimeout(() => {
        let normalized = ((targetRotation % 360) + 360) % 360;
        if (normalized > 180) normalized -= 360;

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

  const tickerItems = useMemo(() => {
    const uniqueMap = new Map();

    recentUpgrades.forEach((upg, index) => {
      const item = upg.outputItem || upg;
      const key = String(upg.id || `${upg.createdAt}-${item.name}-${item.wearShort}-${item.price}`);

      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, {
          id: key,
          name: item.name || "Скин",
          image: item.image || FALLBACK_IMAGE,
          price: Number(item.price) || 0,
          wearShort: item.wearShort || "",
          badgeBg: item.badgeBg || "rgba(59, 130, 246, 0.25)",
          badgeColor: item.badgeColor || "#60a5fa",
          glow: item.glow || "#4ade80",
        });
      }
    });

    return Array.from(uniqueMap.values()).slice(0, 7);
  }, [recentUpgrades]);

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
      {loadingSkins && (
        <div className="hero__loading-overlay">
          <div className="hero__loading-spinner" />
          <h2>СИНХРОНИЗАЦИЯ ЦЕН И ДАННЫХ</h2>
          <p>{statusText}</p>
        </div>
      )}

      <style>{`
        .hero__top {
          overflow: hidden !important;
        }
        .hero__top-track {
          display: flex !important;
          flex-direction: column !important;
          gap: 10px !important;
          overflow: hidden !important;
          height: 100% !important;
        }
        .hero__top-track.hero__top-track--drop {
          animation: heroUpgradeDrop 380ms cubic-bezier(0.18, 0.88, 0.24, 1) both;
        }
        @keyframes heroUpgradeDrop {
          from { transform: translate3d(0, -78px, 0); }
          72% { transform: translate3d(0, 5px, 0); }
          to { transform: translate3d(0, 0, 0); }
        }
        .hero__lightbox {
          flex: 0 0 auto !important;
        }
      `}</style>
      <div className="hero__top">
        <div className={`hero__top-track${tickerAnimation ? " hero__top-track--drop" : ""}`}>
          {tickerItems.map((lightbox, idx) => (
            <div
              className="hero__lightbox"
              key={`ticker-${lightbox.id}-${idx}`}
              style={{ "--weapon-glow": lightbox.glow }}
            >
              {lightbox.wearShort && (
                <span
                  className="hero__lightbox-wear-tag"
                  style={{
                    backgroundColor: lightbox.badgeBg,
                    color: lightbox.badgeColor,
                  }}
                >
                  {lightbox.wearShort}
                </span>
              )}

              <img
                className="hero__lightbox-image"
                src={lightbox.image}
                alt={lightbox.name}
                referrerPolicy="no-referrer"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
              />

              <div className="hero__lightbox-info">
                <strong>{lightbox.name}</strong>
                <span>
                  <FaCoins className="hero__coin-icon" />
                  {lightbox.price?.toFixed(0)} ₽
                </span>
              </div>
            </div>
          ))}
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
                  key={selectedSourceWeapon.instanceId}
                  style={{ "--weapon-glow": selectedSourceWeapon.glow }}
                >
                  <div style={{ position: "relative", display: "inline-block" }}>
                    {selectedSourceWeapon.wearShort && (
                      <span
                        className="hero__weapon-badge"
                        style={{
                          backgroundColor: selectedSourceWeapon.badgeBg,
                          color: selectedSourceWeapon.badgeColor,
                          border: `1px solid ${selectedSourceWeapon.border}`,
                        }}
                      >
                        {selectedSourceWeapon.wearShort}
                      </span>
                    )}
                    <img
                      src={selectedSourceWeapon.image}
                      alt={selectedSourceWeapon.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />
                  </div>

                  <strong>{selectedSourceWeapon.name}</strong>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <small>{selectedSourceWeapon.type}</small>
                    {selectedSourceWeapon.wearName && (
                      <span style={{ color: selectedSourceWeapon.badgeColor, fontSize: "0.75rem" }}>
                        · {selectedSourceWeapon.wearName}
                      </span>
                    )}
                  </div>
                  <span>
                    <FaCoins className="hero__coin-icon" /> {selectedSourceWeapon.price.toFixed(2)} ₽
                  </span>
                </div>
              ) : (
                <div className="hero__upgrade-placeholder">
                  Выберите скин из инвентаря или купите в магазине
                </div>
              )}
            </div>

            <WeaponPicker
              title="Выбор оружия"
              items={skins}
              inventoryItems={inventory}
              selectedWeapon={selectedSourceWeapon}
              onSelect={handleSelectSourceFromInventory}
              onBuyAndStake={handleBuyAndStakeFromShop}
              userBalance={userBalance}
              disabled={isSpinning || isPointerResetting}
              loading={loadingSkins}
              emptyMessage={skinsError || "Нет доступных предметов"}
              itemsPerPage={9}
              enableTabs={true}
            />
          </div>

          <div className="hero__chance" aria-label={`Шанс апгрейда: ${Number(displayedChance).toFixed(2)}%`}>
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

              <strong className="hero__chance-value">{Number(displayedChance).toFixed(2)}%</strong>
            </div>

            <button
              className={`hero__chance-random${
                isSpinning || isPointerResetting ? " hero__chance-random--busy" : ""
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
              }${spinResult.includes("СГОРЕЛ") ? " hero__chance-result--lose" : ""}`}
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
                  key={selectedTargetWeapon.instanceId}
                  style={{ "--weapon-glow": selectedTargetWeapon.glow }}
                >
                  <div style={{ position: "relative", display: "inline-block" }}>
                    {selectedTargetWeapon.wearShort && (
                      <span
                        className="hero__weapon-badge"
                        style={{
                          backgroundColor: selectedTargetWeapon.badgeBg,
                          color: selectedTargetWeapon.badgeColor,
                          border: `1px solid ${selectedTargetWeapon.border}`,
                        }}
                      >
                        {selectedTargetWeapon.wearShort}
                      </span>
                    )}
                    <img
                      src={selectedTargetWeapon.image}
                      alt={selectedTargetWeapon.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />
                  </div>

                  <strong>{selectedTargetWeapon.name}</strong>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <small>{selectedTargetWeapon.type}</small>
                    {selectedTargetWeapon.wearName && (
                      <span style={{ color: selectedTargetWeapon.badgeColor, fontSize: "0.75rem" }}>
                        · {selectedTargetWeapon.wearName}
                      </span>
                    )}
                  </div>
                  <span>
                    <FaCoins className="hero__coin-icon" /> {selectedTargetWeapon.price.toFixed(2)} ₽
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
              minimumPrice={selectedSourceWeapon ? selectedSourceWeapon.price : 0}
              disabled={isSpinning || isPointerResetting}
              loading={loadingSkins}
              emptyMessage={skinsError || "Нет доступных предметов"}
              itemsPerPage={9}
              enableTabs={false}
            />
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;