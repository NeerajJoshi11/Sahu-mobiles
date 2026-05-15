import * as cheerio from "cheerio";

async function testFetch() {
  const url = "https://www.flipkart.com/samsung-galaxy-s26-ultra-5g-white-512-gb/p/itmf4799d3841c43";
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    console.log("Fetching via proxy:", proxyUrl);
    const response = await fetch(proxyUrl);
    const data = await response.json();
    
    if (data.contents) {
      console.log("HTML length:", data.contents.length);
      const $ = cheerio.load(data.contents);
      console.log("Title tag:", $("title").text());
      console.log("Title class:", $(".VU-Tz5").text());
    } else {
      console.log("No contents returned");
    }
  } catch (e: any) {
    console.error("Fetch failed:", e.message);
  }
}
testFetch();
