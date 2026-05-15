import * as cheerio from "cheerio";

async function testFetch() {
  const url = "https://www.flipkart.com/samsung-galaxy-s26-ultra-5g-white-512-gb/p/itmf4799d3841c43";
  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    console.log("Fetching via proxy:", proxyUrl);
    const response = await fetch(proxyUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    console.log("Status:", response.status);
    const text = await response.text();
    console.log("HTML length:", text.length);
    console.log("Title tag:", cheerio.load(text)("title").text());
  } catch (e: any) {
    console.error("Fetch failed:", e.message);
  }
}
testFetch();
