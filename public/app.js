const state = {
  products: [],
  view: "families",
  activeFamily: null
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

const FAMILY_META = {
  "macacao-triton": { label: "Macacao Triton", category: "Macacoes", tag: "RACE" },
  "macacao-chicago": { label: "Macacao Chicago", category: "Macacoes", tag: "RACE" },
  "balaclava": { label: "Balaclava", category: "Balaclavas", tag: "DRY" },
  "macacao-personalizado": { label: "Macacao Personalizado", category: "Personalizados", tag: "RACE" },
  "kit-balaclava": { label: "Kit de Balaclava", category: "Balaclavas", tag: "DRY" },
  "outros": { label: "Outros Personalizados", category: "Personalizados", tag: "RACE" }
};

const FAMILY_ORDER = [
  "macacao-triton",
  "macacao-chicago",
  "balaclava",
  "macacao-personalizado",
  "kit-balaclava",
  "outros"
];

const productsEl = document.querySelector("[data-products]");

function money(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
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

function computeFamilies(products) {
  const groups = new Map();
  products.forEach((product) => {
    const key = familyOf(product);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(product);
  });

  return FAMILY_ORDER
    .filter((key) => groups.has(key))
    .map((key) => {
      const items = groups.get(key).slice().sort((a, b) => a.price - b.price);
      const meta = FAMILY_META[key];
      return {
        key,
        label: meta.label,
        category: meta.category,
        tag: meta.tag,
        items,
        minPrice: Math.min(...items.map((product) => product.price)),
        cover: pickCover(items)
      };
    });
}

function optionsLabel(count) {
  return count === 1 ? "1 opcao" : `${count} opcoes`;
}

function renderFamilies() {
  const families = computeFamilies(state.products);

  productsEl.className = "product-grid";
  productsEl.innerHTML = families.map((family) => `
    <button type="button" class="product-card family-card" data-family="${family.key}">
      <span class="product-media">
        <span class="product-tag">${optionsLabel(family.items.length)}</span>
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
  `).join("");
}

function renderFamilyDetail(familyKey) {
  const families = computeFamilies(state.products);
  const family = families.find((item) => item.key === familyKey);

  if (!family) {
    state.view = "families";
    state.activeFamily = null;
    renderFamilies();
    return;
  }

  productsEl.className = "product-list";
  productsEl.innerHTML = `
    <div class="family-detail-head">
      <button class="family-back" type="button" data-back>&larr; Voltar pra vitrine</button>
      <span class="product-category">${family.category}</span>
      <h3>${family.label}</h3>
      <p>${optionsLabel(family.items.length)} ${family.items.length === 1 ? "disponivel" : "disponiveis"} — escolha a que combina com voce.</p>
    </div>
    ${family.items.map((product) => `
      <article class="product-row">
        <a class="product-row-media" href="${product.url}" target="_blank" rel="noreferrer">
          ${product.image ? `<img src="${product.image}" alt="${product.name}">` : `<span class="product-silhouette">${family.tag}</span>`}
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
  if (state.view === "family" && state.activeFamily) {
    renderFamilyDetail(state.activeFamily);
  } else {
    renderFamilies();
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
  const familyCard = event.target.closest("[data-family]");
  if (familyCard) {
    state.view = "family";
    state.activeFamily = familyCard.dataset.family;
    renderProducts();
  }

  const backButton = event.target.closest("[data-back]");
  if (backButton) {
    state.view = "families";
    state.activeFamily = null;
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
