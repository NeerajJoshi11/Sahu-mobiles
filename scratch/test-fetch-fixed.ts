async function test() {
  let url = "www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4";
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }
  try {
    const response = await fetch(url);
    console.log("Success! Status:", response.status);
  } catch (e: any) {
    console.error("Error message:", e.message);
  }
}
test();
