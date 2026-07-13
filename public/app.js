const state = {
  products: [],
  view: "top",
  activeTop: null,
  activeLine: null
};

const demoProducts = [
  {
    id: "demo-kac",
    name: "Macacao de Kart Kac - Tecido Triton UAUVEXA",
    category: "Macacoes",
    price: 950,
    stock: 5,
    image: "",
    url: "https://uauvexa.lojavirtualnuvem.com.br/produtos/macacao-de-kart-kac-tecido-triton-uauvexa/",
    tag: "Personalizado"
  },
  {
    id: "demo-chicago-kit",
    name: "Kit 2 Macacoes Chicago Personalizado",
    category: "Macacoes",
    price: 1698,
    stock: 5,
    image: "",
    url: "https://uauvexa.lojavirtualnuvem.com.br/produtos/kit-2-macacoes-chicago-personalizado-compre-2-e-pague-r849-cada/",
    tag: "Compre 2"
  },
  {
    id: "demo-balaclava-verde",
    name: "Balaclava Dry Quadradinho VEXA Preta e Verde",
    category: "Balaclavas",
    price: 59,
    stock: 14,
    image: "",
    url: "https://uauvexa.lojavirtualnuvem.com.br/produtos/",
    tag: "Dry"
  },
  {
    id: "demo-balaclava-azul",
    name: "Balaclava Meli Azul UAUVEXA",
    category: "Balaclavas",
    price: 59,
    stock: 12,
    image: "",
    url: "https://uauvexa.lojavirtualnuvem.com.br/produtos/",
    tag: "Leve"
  }
];

const LINE_META = {
  "macacao-triton": { label: "Tecido Triton", category: "Macacoes", tag: "RACE", topKey: "macacao" },
  "macacao-chicago": { label: "Tecido Chicago", category: "Macacoes", tag: "RACE", topKey: "macacao" },
  balaclava: { label: "Balaclava", category: "Balaclavas", tag: "DRY", topKey: "balaclava" },
  "kit-balaclava": { label: "Kit de Balaclava", category: "Balaclavas", tag: "DRY", topKey: "kit-balaclava" },
  "macacao-personalizado": { label: "Macacao Personalizado", category: "Personalizados", tag: "RACE", topKey: "macacao-personalizado" },
  outros: { label: "Outros Personalizados", category: "Personalizados", tag: "RACE", topKey: "outros" }
};

const TOP_META = {
  macacao: { label: "Macacao", category: "Macacoes", tag: "RACE", hasSub: true },
  balaclava: { label: "Balaclava", category: "Balaclavas", tag: "DRY", hasSub: false },
  "kit-balaclava": { label: "Kit de Balaclava", category: "Balaclavas", tag: "DRY", hasSub: false },
  "macacao-personalizado": { label: "Macacao Personalizado", category: "Personalizados", tag: "RACE", hasSub: false },
  outros: { label: "Outros Personalizados", category: "Personalizados", tag: "RACE", hasSub: false }
};

// "outros" hidden from the catalog for now: family has no product photo yet.
const TOP_ORDER = ["macacao", "balaclava", "macacao-personalizado", "kit-balaclava"];

const COLLAPSE_BY_COLOR = new Set(["macacao-triton", "macacao-chicago"]);

const productsEl = document.querySelector("[data-products]");

function money(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function optionsLabel(count) {
  return count === 1 ? "1 opcao" : `${count} opcoes`;
}

function familyOf(product) {
  const n = (product.name || "").toLowerCase();
  if (n.includes("kit") && n.includes("balaclava")) return "kit-balaclava";
  if (n.includes("balaclava")) return "balaclava";
  if (n.includes("triton") && !n.includes("personalizado")) return "macacao-triton";
  if (n.includes("chicago") && !n.includes("personalizado") && !n.includes("kit")) return "macacao-chicago";
  if (n.includes("macac") && (n.includes("personalizado") || n.includes("kit"))) return "macacao-personalizado";
  return "outros";
}

function pickCover(items) {
  const stockByImage = new Map();
  items.forEach((product) => {
    if (!product.image) return;
    stockByImage.set(product.image, (stockByImage.get(product.image) || 0) + product.stock);
  });

  let bestImage = "";
  let bestStock = -1;
  stockByImage.forEach((stock, image) => {
    if (stock > bestStock) {
      bestStock = stock;
      bestImage = image;
    }
  });

  if (bestImage) return bestImage;
  const withImage = items.find((product) => product.image);
  return withImage ? withImage.image : "";
}

function collapseByColor(items) {
  const groups = new Map();
  items.forEach((item) => {
    const key = item.color || item.name;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  });

  return Array.from(groups.values()).map((variants) => {
    const cheapest = variants.slice().sort((a, b) => a.price - b.price)[0];
    const withImage = variants.find((variant) => variant.image) || cheapest;
    const totalStock = variants.reduce((sum, variant) => sum + variant.stock, 0);
    const color = variants[0].color;

    return {
      id: `${cheapest.id}-color`,
      name: color ? `${cheapest.baseName || cheapest.name} — ${color}` : cheapest.name,
      category: cheapest.category,
      price: cheapest.price,
      stock: totalStock,
      image: withImage.image,
      url: cheapest.url,
      tag: cheapest.tag
    };
  });
}

function optionCountFor(line, items) {
  return COLLAPSE_BY_COLOR.has(line) ? collapseByColor(items).length : items.length;
}

function computeCatalog(products) {
  const lineGroups = new Map();
  products.forEach((product) => {
    const line = familyOf(product);
    if (!lineGroups.has(line)) lineGroups.set(line, []);
    lineGroups.get(line).push(product);
  });

  const topFamilies = TOP_ORDER
    .map((topKey) => {
      const topMeta = TOP_META[topKey];
      const lineKeys = Object.keys(LINE_META).filter((line) => LINE_META[line].topKey === topKey && lineGroups.has(line));
      if (!lineKeys.length) return null;

      const allItems = lineKeys.flatMap((line) => lineGroups.get(line));
      const showSub = topMeta.hasSub && lineKeys.length > 1;

      return {
        key: topKey,
        label: topMeta.label,
        category: topMeta.category,
        tag: topMeta.tag,
        items: allItems,
        lineKeys,
        minPrice: Math.min(...allItems.map((product) => product.price)),
        cover: pickCover(allItems),
        subcategories: showSub
          ? lineKeys.map((line) => {
              const items = lineGroups.get(line);
              return {
                key: line,
                label: LINE_META[line].label,
                category: LINE_META[line].category,
                tag: LINE_META[line].tag,
                items,
                optionCount: optionCountFor(line, items),
                minPrice: Math.min(...items.map((product) => product.price)),
                cover: pickCover(items)
              };
            })
          : null
      };
    })
    .filter(Boolean);

  topFamilies.forEach((family) => {
    family.optionCount = family.subcategories
      ? family.subcategories.reduce((sum, sub) => sum + sub.optionCount, 0)
      : optionCountFor(family.lineKeys[0], family.items);
  });

  return { topFamilies, lineGroups };
}

function familyCardHtml(family, dataAttr) {
  return `
    <button type="button" class="product-card family-card" data-${dataAttr}="${family.key}">
      <span class="product-media">
        <span class="product-tag">${optionsLabel(family.optionCount)}</span>
        ${family.cover ? `<img src="${family.cover}" alt="${family.label}">` : `<span class="product-silhouette">${family.tag}</span>`}
      </span>
      <span class="product-info">
        <span class="product-category">${family.category}</span>
        <span class="family-title">${family.label}</span>
        <span class="product-bottom">
          <strong class="price">A partir de ${money(family.minPrice)}</strong>
          <span class="add-button">Ver opcoes</span>
        </span>
      </span>
    </button>
  `;
}

function renderTop() {
  const { topFamilies } = computeCatalog(state.products);
  productsEl.className = "product-grid";
  productsEl.innerHTML = topFamilies.map((family) => familyCardHtml(family, "top")).join("");
}

function renderSub(topKey) {
  const { topFamilies } = computeCatalog(state.products);
  const family = topFamilies.find((item) => item.key === topKey);

  if (!family || !family.subcategories) {
    state.view = "top";
    state.activeTop = null;
    renderTop();
    return;
  }

  productsEl.className = "product-list";
  productsEl.innerHTML = `
    <div class="family-detail-head">
      <button class="family-back" type="button" data-back-top>&larr; Voltar pra vitrine</button>
      <span class="product-category">${family.category}</span>
      <h3>${family.label}</h3>
      <p>Escolha o tecido.</p>
    </div>
    <div class="product-grid subcategory-grid">
      ${family.subcategories.map((sub) => familyCardHtml(sub, "line")).join("")}
    </div>
  `;
}

function renderList(lineKey) {
  const { lineGroups } = computeCatalog(state.products);
  const meta = LINE_META[lineKey];
  const rawItems = lineGroups.get(lineKey);

  if (!meta || !rawItems || !rawItems.length) {
    state.view = "top";
    state.activeTop = null;
    state.activeLine = null;
    renderTop();
    return;
  }

  const items = (COLLAPSE_BY_COLOR.has(lineKey) ? collapseByColor(rawItems) : rawItems)
    .slice()
    .sort((a, b) => a.price - b.price);

  const cameFromSub = TOP_META[meta.topKey]?.hasSub;

  productsEl.className = "product-list";
  productsEl.innerHTML = `
    <div class="family-detail-head">
      <button class="family-back" type="button" ${cameFromSub ? "data-back-sub" : "data-back-top"}>&larr; Voltar</button>
      <span class="product-category">${meta.category}</span>
      <h3>${meta.label}</h3>
      <p>${optionsLabel(items.length)} ${items.length === 1 ? "disponivel" : "disponiveis"} — escolha a que combina com voce.</p>
    </div>
    ${items.map((product) => `
      <article class="product-row">
        <a class="product-row-media" href="${product.url}" target="_blank" rel="noreferrer">
          ${product.image ? `<img src="${product.image}" alt="${product.name}">` : `<span class="product-silhouette">${meta.tag}</span>`}
        </a>
        <div class="product-row-info">
          <h3>${product.name}</h3>
          <span class="product-category">${product.category}</span>
        </div>
        <div class="product-row-bottom">
          <strong class="price">${money(product.price)}</strong>
          <a class="add-button" href="${product.url}" target="_blank" rel="noreferrer">Comprar</a>
        </div>
      </article>
    `).join("")}
  `;
}

function renderProducts() {
  if (state.view === "sub" && state.activeTop) {
    renderSub(state.activeTop);
  } else if (state.view === "list" && state.activeLine) {
    renderList(state.activeLine);
  } else {
    state.view = "top";
    renderTop();
  }
}

async function loadProducts() {
  try {
    const response = await fetch("api/products");
    const payload = await response.json();
    state.products = payload.products;

    if (payload.warning) {
      console.info("Usando catalogo demo. Integracao pendente:", payload.warning);
    }
  } catch (error) {
    state.products = demoProducts;
  }
  renderProducts();
}

document.addEventListener("click", (event) => {
  const topCard = event.target.closest("[data-top]");
  if (topCard) {
    const topKey = topCard.dataset.top;
    const { topFamilies } = computeCatalog(state.products);
    const family = topFamilies.find((item) => item.key === topKey);

    if (family) {
      state.activeTop = topKey;
      if (family.subcategories) {
        state.view = "sub";
        state.activeLine = null;
      } else {
        state.view = "list";
        state.activeLine = family.lineKeys[0];
      }
      renderProducts();
    }
  }

  const lineCard = event.target.closest("[data-line]");
  if (lineCard) {
    state.view = "list";
    state.activeLine = lineCard.dataset.line;
    renderProducts();
  }

  const backTop = event.target.closest("[data-back-top]");
  if (backTop) {
    state.view = "top";
    state.activeTop = null;
    state.activeLine = null;
    renderProducts();
  }

  const backSub = event.target.closest("[data-back-sub]");
  if (backSub) {
    state.view = "sub";
    state.activeLine = null;
    renderProducts();
  }

  const navToggle = event.target.closest("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  if (navToggle && nav) {
    const isOpen = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  } else if (nav && nav.classList.contains("open") && event.target.closest("[data-nav] a")) {
    nav.classList.remove("open");
    navToggle?.setAttribute("aria-expanded", "false");
  }
});

loadProducts();
