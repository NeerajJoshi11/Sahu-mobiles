import * as cheerio from "cheerio";

async function testFetch() {
  const url = "https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4";
  try {
    console.log("Fetching:", url);
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,hi;q=0.8"
      }
    });
    console.log("Status:", response.status);
    const text = await response.text();
    console.log("Response starts with:", text.substring(0, 200));
    
    if (response.status === 200) {
      const $ = cheerio.load(text);
      console.log("Title (VU-Tz5):", $(".VU-Tz5").text());
      console.log("Price (Nx9bqj):", $(".Nx9bqj").first().text());
    }
  } catch (e: any) {
    console.error("Fetch failed:", e.message);
  }
}
testFetch();
