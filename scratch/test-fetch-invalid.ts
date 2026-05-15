async function test() {
  try {
    await fetch("www.flipkart.com/apple-iphone");
  } catch (e: any) {
    console.error("Error message:", e.message);
  }
}
test();
