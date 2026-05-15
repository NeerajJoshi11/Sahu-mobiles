import * as cheerio from "cheerio";

async function testFetch() {
  const url = "https://www.amazon.in/Apple-iPhone-15-128-GB/dp/B0CHX1W1XY";
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,hi;q=0.8"
      }
    });

    console.log("Status:", response.status);
    const html = await response.text();
    console.log("HTML length:", html.length);
    const $ = cheerio.load(html);
    console.log("Title:", $("title").text());
    console.log("Product Title:", $("#productTitle").text().trim());
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}
testFetch();
