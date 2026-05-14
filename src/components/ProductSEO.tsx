"use client";

interface ProductSEOProps {
  product: {
    id: string;
    name: string;
    price: number;
    mrp?: number | null;
    description: string;
    image: string;
    stock: number;
  };
}

export function ProductSEO({ product }: ProductSEOProps) {
  const baseUrl = "https://sahumobilewala.com";
  const productUrl = `${baseUrl}/product/${product.id}`;
  
  // Calculate savings for SEO
  const discountAmount = product.mrp ? product.mrp - product.price : 0;
  
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.image.startsWith("http") ? product.image : `${baseUrl}${product.image}`,
    "description": product.description,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": "Sahu Mobiles"
    },
    "offers": {
      "@type": "Offer",
      "url": productUrl,
      "priceCurrency": "INR",
      "price": product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Sahu Mobiles"
      },
      "priceValidUntil": "2026-12-31"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
