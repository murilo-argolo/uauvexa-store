const state = {
  products: [],
  filter: "Todos"
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

const productsEl = document.querySelector("[data-products]");

function money(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function filteredProducts() {
  if (state.filter === "Todos") return state.products;
  return state.products.filter((product) => product.category === state.filter);
}

function renderProducts() {
  const products = filteredProducts();

  productsEl.innerHTML = products.map((product) => `
    <article class="product-card">
      <a class="product-media" href="${product.url}" target="_blank" rel="noreferrer">
        <span class="product-tag">${product.tag || "UAUVEXA"}</span>
        ${product.image ? `<img src="${product.image}" alt="${product.name}">` : `<span class="product-silhouette">${product.category === "Balaclavas" ? "DRY" : "RACE"}</span>`}
      </a>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3>${product.name}</h3>
        <div class="product-bottom">
          <strong class="price">${money(product.price)}</strong>
          <a class="add-button" href="${product.url}" target="_blank" rel="noreferrer">Comprar</a>
        </div>
      </div>
    </article>
  `).join("");
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
  const filterButton = event.target.closest("[data-filter]");
  if (filterButton) {
    state.filter = filterButton.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((button) => {
      button.classList.toggle("active", button === filterButton);
    });
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
