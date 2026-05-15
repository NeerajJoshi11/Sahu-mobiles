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
  console.log("Title tag:", $("title").text());
  
  // Find open graph
  console.log("og:title", $('meta[property="og:title"]').attr("content"));
  console.log("og:image", $('meta[property="og:image"]').attr("content"));
  
  // Find script with application/ld+json
  console.log("JSON-LD elements:", $('script[type="application/ld+json"]').length);
  $('script[type="application/ld+json"]').each((_, el) => {
     console.log("JSON:", $(el).html()?.substring(0, 100));
  });
}
testFetch();
