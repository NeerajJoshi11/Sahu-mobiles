import * as cheerio from "cheerio";

async function testFetch() {
  const url = "https://www.flipkart.com/samsung-galaxy-s26-ultra-5g-white-512-gb/p/itmf4799d3841c43";
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "WhatsApp/2.22.36.71 A",
        "Accept": "text/html"
      }
    });
    console.log("Status:", response.status);
    const text = await response.text();
    console.log("HTML length:", text.length);
    const $ = cheerio.load(text);
    console.log("og:title:", $('meta[property="og:title"]').attr("content"));
    console.log("og:image:", $('meta[property="og:image"]').attr("content"));
  } catch (e: any) {
    console.error("Fetch failed:", e.message);
  }
}
testFetch();
