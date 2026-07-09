const demoProducts = [
  {
    id: "demo-kac",
    name: "Macacao de Kart Kac - Tecido Triton UAUVEXA",
    category: "Macacoes",
    price: 950,
    stock: 5,
    image: "",
    url: "https://uauvexa.com.br/produtos/macacao-de-kart-kac-tecido-triton-uauvexa/",
    tag: "Personalizado"
  },
  {
    id: "demo-chicago-kit",
    name: "Kit 2 Macacoes Chicago Personalizado",
    category: "Macacoes",
    price: 1698,
    stock: 5,
    image: "",
    url: "https://uauvexa.com.br/produtos/kit-2-macacoes-chicago-personalizado-compre-2-e-pague-r849-cada/",
    tag: "Compre 2"
  },
  {
    id: "demo-balaclava-verde",
    name: "Balaclava Dry Quadradinho VEXA Preta e Verde",
    category: "Balaclavas",
    price: 59,
    stock: 14,
    image: "",
    url: "https://uauvexa.com.br/produtos/",
    tag: "Leve"
  },
  {
    id: "demo-balaclava-azul",
    name: "Balaclava Meli Azul UAUVEXA",
    category: "Balaclavas",
    price: 59,
    stock: 12,
    image: "",
    url: "https://uauvexa.com.br/produtos/",
    tag: "Dry"
  }
];

function normalizeProduct(product) {
  const name = product.name?.pt || product.name?.en || product.name?.es || "Produto UAUVEXA";
  const variant = Array.isArray(product.variants) ? product.variants[0] : null;
  const image = Array.isArray(product.images) && product.images[0] ? product.images[0].src : "";
  const handle = product.handle?.pt || product.handle?.en || product.handle?.es || "";
  const category = Array.isArray(product.categories) && product.categories[0]?.name
    ? product.categories[0].name.pt || product.categories[0].name.en || product.categories[0].name.es || "Produtos"
    : "Produtos";

  return {
    id: String(product.id),
    name,
    category,
    price: Number(variant?.price || 0),
    stock: Number(variant?.stock || 0),
    image,
    url: handle ? `https://uauvexa.com.br/produtos/${handle}/` : "https://uauvexa.com.br/produtos/",
    tag: product.brand || "UAUVEXA"
  };
}

module.exports = async function handler(req, res) {
  const storeId = process.env.NUVEMSHOP_STORE_ID;
  const token = process.env.NUVEMSHOP_ACCESS_TOKEN;
  const userAgent = process.env.NUVEMSHOP_USER_AGENT || "UAUVEXA Headless Store (uauvexa@gmail.com)";

  res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=600");

  if (!storeId || !token) {
    res.status(200).json({ mode: "demo", products: demoProducts });
    return;
  }

  try {
    const response = await fetch(`https://api.nuvemshop.com.br/v1/${storeId}/products?published=true&per_page=24`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": userAgent
      }
    });

    if (!response.ok) {
      throw new Error(`Nuvemshop API ${response.status}`);
    }

    const products = await response.json();
    res.status(200).json({ mode: "nuvemshop", products: products.map(normalizeProduct) });
  } catch (error) {
    res.status(200).json({ mode: "demo", warning: error.message, products: demoProducts });
  }
};
