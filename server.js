const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 4177);
const PUBLIC_DIR = path.join(__dirname, "public");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
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
    tag: "Leve"
  },
  {
    id: "demo-balaclava-azul",
    name: "Balaclava Meli Azul UAUVEXA",
    category: "Balaclavas",
    price: 59,
    stock: 12,
    image: "",
    url: "https://uauvexa.lojavirtualnuvem.com.br/produtos/",
    tag: "Dry"
  }
];

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function localized(field) {
  return field?.pt || field?.en || field?.es || "";
}

function normalizeProduct(product) {
  const name = localized(product.name) || "Produto UAUVEXA";
  const handle = localized(product.handle);
  const url = handle ? `https://uauvexa.lojavirtualnuvem.com.br/produtos/${handle}/` : "https://uauvexa.lojavirtualnuvem.com.br/produtos/";
  const category = Array.isArray(product.categories) && product.categories[0]?.name
    ? localized(product.categories[0].name) || "Produtos"
    : "Produtos";

  const images = Array.isArray(product.images) ? product.images : [];
  const imageById = new Map(images.map((image) => [image.id, image.src]));
  const fallbackImage = images[0]?.src || "";

  const variants = Array.isArray(product.variants) && product.variants.length ? product.variants : [null];

  return variants.map((variant) => {
    const variantValues = Array.isArray(variant?.values) ? variant.values.map(localized).filter(Boolean) : [];
    const variantLabel = variantValues.join(" / ");

    return {
      id: variant ? `${product.id}-${variant.id}` : String(product.id),
      name: variantLabel ? `${name} — ${variantLabel}` : name,
      baseName: name,
      color: variantValues[0] || "",
      category,
      price: Number(variant?.price || 0),
      stock: Number(variant?.stock || 0),
      image: (variant && imageById.get(variant.image_id)) || fallbackImage,
      url,
      tag: product.brand || "UAUVEXA"
    };
  });
}

async function fetchNuvemshopProducts() {
  const storeId = process.env.NUVEMSHOP_STORE_ID;
  const token = process.env.NUVEMSHOP_ACCESS_TOKEN;
  const userAgent = process.env.NUVEMSHOP_USER_AGENT || "UAUVEXA Headless Store (uauvexa@gmail.com)";

  if (!storeId || !token) {
    return { mode: "demo", products: demoProducts };
  }

  const url = `https://api.nuvemshop.com.br/v1/${storeId}/products?published=true&per_page=24`;
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "User-Agent": userAgent
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Nuvemshop API ${response.status}: ${body.slice(0, 240)}`);
  }

  const products = await response.json();
  return { mode: "nuvemshop", products: products.flatMap(normalizeProduct) };
}

async function handleApi(req, res) {
  if (req.url.startsWith("/api/products")) {
    try {
      const payload = await fetchNuvemshopProducts();
      sendJson(res, 200, payload);
    } catch (error) {
      sendJson(res, 200, {
        mode: "demo",
        warning: error.message,
        products: demoProducts
      });
    }
    return true;
  }
  return false;
}

function serveStatic(req, res) {
  const safeUrl = decodeURIComponent(req.url.split("?")[0]);
  const requested = safeUrl === "/" ? "/index.html" : safeUrl;
  const filePath = path.normalize(path.join(PUBLIC_DIR, requested));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      fs.readFile(path.join(PUBLIC_DIR, "index.html"), (fallbackError, fallback) => {
        if (fallbackError) {
          res.writeHead(404);
          res.end("Not found");
          return;
        }
        res.writeHead(200, { "content-type": mimeTypes[".html"] });
        res.end(fallback);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "content-type": mimeTypes[ext] || "application/octet-stream" });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  if (await handleApi(req, res)) return;
  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`UAUVEXA headless store running at http://localhost:${PORT}`);
});
