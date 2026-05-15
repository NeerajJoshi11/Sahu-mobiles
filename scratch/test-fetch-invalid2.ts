async function test() {
  try {
    await fetch("https://www.flipkart-invalid-domain.com/apple-iphone");
  } catch (e: any) {
    console.error("Error message:", e.message);
  }
}
test();
