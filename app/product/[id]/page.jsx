import Link from "next/link";
import Image from "next/image";
import { getProductById } from "@/data/products";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";

export async function generateMetadata({ params }) {
  const { id } = params;
  const product = getProductById(id);
  if (!product) {
    return { title: "Товар — LOSSO" };
  }

  return {
    title: `${product.name} — купити | ${product.price} ₴`,
    description: `${product.name}. Ціна: ${product.price} ₴. Оригінальна продукція ${
      product.brand || "LOSSO"
    }. Доставка по всій Україні.`,
    openGraph: {
      title: product.name,
      description: `Купити ${product.name} за ${product.price} ₴`,
      images: product.image
        ? [{ url: product.image, width: 400, height: 400 }]
        : [],
    },
  };
}

export default async function ProductPage({ params }) {
  const { id } = params;
  const product = getProductById(id);
  if (!product) notFound();

  const productUrl = `https://losso-lemon.vercel.app/product/${product.id}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.image ? [product.image] : [],
    description: product.description || product.name,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand || "LOSSO" },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "UAH",
      price: product.price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <nav className="text-sm text-losso-muted mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-losso-sage">
            Головна
          </Link>
          <span>/</span>
          <Link href="/catalog" className="hover:text-losso-sage">
            Каталог
          </Link>
          <span>/</span>
          <span className="text-losso-stone font-medium truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square rounded-2xl overflow-hidden bg-losso-sand/50 flex items-center justify-center">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            ) : (
              <span className="text-losso-muted">Фото товару</span>
            )}
          </div>
          <div>
            {product.badge && (
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mb-3 ${
                  product.badge === "Хіт"
                    ? "bg-losso-sage text-white"
                    : product.badge === "Новинка"
                    ? "bg-amber-500 text-white"
                    : "bg-red-600 text-white"
                }`}
              >
                {product.badge}
              </span>
            )}
            <h1 className="text-2xl font-bold text-losso-stone mb-2">
              {product.name}
            </h1>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-semibold text-losso-stone">
                {product.price} ₴
              </span>
              {product.oldPrice != null && (
                <span className="text-losso-muted line-through">
                  {product.oldPrice} ₴
                </span>
              )}
            </div>
            {product.inStock ? (
              <p className="text-losso-sage font-medium mb-4">В наявності</p>
            ) : (
              <p className="text-losso-muted mb-4">Немає в наявності</p>
            )}
            <p className="text-losso-muted mb-6">
              Оригінальна продукція {product.brand || "LOSSO"}. Доставка по
              всій Україні.
            </p>
            <div className="flex flex-wrap gap-3">
              {product.inStock && (
                <AddToCartButton
                  productId={product.id}
                  productName={product.name}
                  price={product.price}
                  prom_id={product.prom_id}
                  sku={product.sku}
                  className="rounded-xl bg-losso-sage text-white px-6 py-3 font-semibold hover:bg-losso-sage-dark min-h-[48px]"
                />
              )}
              {product.prom_url && (
                <a
                  href={product.prom_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-losso-sand px-6 py-3 font-medium text-losso-stone hover:bg-losso-sand min-h-[48px]"
                >
                  Купити на losso.com.ua
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

