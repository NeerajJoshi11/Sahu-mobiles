import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch the URL");
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const domain = new URL(url).hostname;

    let name = "";
    let description = "";
    let image = "";
    let price = "0";

    // 1. Try JSON-LD (Schema.org) - Most accurate for e-commerce
    try {
      $('script[type="application/ld+json"]').each((_, el) => {
        const json = JSON.parse($(el).html() || "{}");
        const data = Array.isArray(json) ? json.find(i => i['@type'] === 'Product' || i['@type']?.includes('Product')) : json;
        
        if (data && (data['@type'] === 'Product' || data['@type']?.includes('Product'))) {
          name = name || data.name;
          description = description || data.description;
          image = image || (Array.isArray(data.image) ? data.image[0] : data.image?.url || data.image);
          
          const offers = Array.isArray(data.offers) ? data.offers[0] : data.offers;
          if (offers) {
            price = price === "0" ? (offers.price || offers.lowPrice || "0").toString() : price;
          }
        }
      });
    } catch (e) {
      console.warn("JSON-LD parse failed, falling back...");
    }

    // 2. Site-Specific Selectors (Fallbacks)
    if (!name || price === "0") {
      if (domain.includes("amazon")) {
        name = name || $("#productTitle").text().trim();
        price = price === "0" ? ($(".a-price-whole").first().text().trim() || $(".a-offscreen").first().text().trim()) : price;
        image = image || ($("#landingImage").attr("src") || $("#imgTagWrapperId img").attr("src") || "");
        description = description || $("#feature-bullets").text().trim();
      } else if (domain.includes("flipkart")) {
        name = name || $(".B_NuCI").text().trim();
        price = price === "0" ? ($("._30jeq3._16Jk6d").text().trim() || $("._30jeq3").first().text().trim()) : price;
        image = image || ($("._396cs4._2amPTt._3q99q2").attr("src") || $(".q6DClP").attr("src") || "");
        description = description || ($("._1mXcCf").text().trim() || $(".RmoJUa").text().trim());
      }
    }

    // 3. Meta Tags (Final Fallback)
    if (!name) name = $('meta[property="og:title"]').attr('content') || $('title').text() || "Unknown Product";
    if (!description) description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || "";
    if (!image) image = $('meta[property="og:image"]').attr('content') || "";
    if (price === "0") {
      price = $('meta[property="product:price:amount"]').attr('content') || 
              $('meta[name="twitter:data1"]').attr('content') || 
              "0";
    }

    // Clean up price (remove currency symbols, commas)
    price = price.replace(/[₹$,]/g, "").replace(/\..*/, "").trim();
    const numericPrice = parseFloat(price) || 0;

    return NextResponse.json({
      product: {
        name: name.split("|")[0].split("-")[0].trim(), // Clean up site suffix
        description: description.substring(0, 500).trim(),
        price: numericPrice,
        image: image,
        category: "Smartphone"
      }
    });

  } catch (error: any) {
    console.error("Import Error:", error);
    return NextResponse.json({ error: "Failed to parse product link: " + error.message }, { status: 500 });
  }
}
