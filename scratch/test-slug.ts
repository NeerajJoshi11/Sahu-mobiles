function extractSlugName(url: string) {
  try {
    const parsed = new URL(url);
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
      // Clean up slug: replace hyphens with spaces, capitalize words
      return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    return null;
  } catch (e) {
    return null;
  }
}

console.log(extractSlugName("https://www.flipkart.com/samsung-galaxy-s26-ultra-5g-white-512-gb/p/itmf4799d3841c43"));
console.log(extractSlugName("https://www.amazon.in/Apple-iPhone-15-128-GB/dp/B0CHX1W1XY"));
