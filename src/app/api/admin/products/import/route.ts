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

    let { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    const extractSlugName = (u: string) => {
      try {
        const parsed = new URL(u);
        const path = parsed.pathname;
        let slug = "";
        if (parsed.hostname.includes("flipkart.com")) {
          const match = path.match(/^\/([^/]+)\/p\//);
          if (match) slug = match[1];
        } else if (parsed.hostname.includes("amazon")) {
          const match = path.match(/^\/([^/]+)\/dp\//);
          if (match) slug = match[1];
        }
        if (slug) {
          return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }
      } catch (e) {}
      return "";
    };

    let fetchFailed = false;
    let response;
    try {
      response = await fetch(url, {
        cache: "no-store",
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
          "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"macOS\"",
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "none",
          "sec-fetch-user": "?1",
          "upgrade-insecure-requests": "1"
        }
      });
      if (!response.ok) fetchFailed = true;
    } catch (err: any) {
      console.error("Network fetch failed:", err);
      fetchFailed = true;
    }

    if (fetchFailed || !response) {
      const fallbackName = extractSlugName(url) || "Unknown Product";
      return NextResponse.json({
        product: {
          name: fallbackName,
          description: "",
          price: 0,
          image: "",
          category: "Smartphone"
        }
      });
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
        name = name || $(".VU-Tz5").text().trim() || $(".B_NuCI").text().trim();
        price = price === "0" ? ($(".Nx9bqj.CxhGGd").text().trim() || $("div.Nx9bqj").first().text().trim() || $("._30jeq3._16Jk6d").text().trim() || $("._30jeq3").first().text().trim()) : price;
        image = image || ($("img.v2sH7K").attr("src") || $("img.DByuf4").attr("src") || $("._396cs4._2amPTt._3q99q2").attr("src") || $(".q6DClP").attr("src") || "");
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
