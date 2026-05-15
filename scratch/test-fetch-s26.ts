async function test() {
  const url = "https://www.flipkart.com/samsung-galaxy-s26-ultra-5g-white-512-gb/p/itmf4799d3841c43";
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
    console.log("First 100 chars:", html.substring(0, 100));
  } catch (e: any) {
    console.error("Error message:", e.message);
  }
}
test();
