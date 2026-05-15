import * as cheerio from "cheerio";

async function testFetch() {
  const url = "https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4";
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html"
    }
  });
  const text = await response.text();
  const $ = cheerio.load(text);
  
  $('script[type="application/ld+json"]').each((_, el) => {
     console.log("JSON-LD:", $(el).html());
  });
}
testFetch();
