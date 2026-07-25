import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { generateInitiateHash, getEasebuzzConfig } from "@/lib/easebuzz";
import { validateAndCalculateTotal } from "@/lib/pricing";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      email,
      firstName,
      lastName,
      address,
      city,
      state,
      pincode,
      phone,
      items,
      total,
      deliveryMethod,
      couponCode,
    } = data;

    // 1. Get User Session
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("customer_session")?.value;

    // 2. Validation
    if (
      !email ||
      !firstName ||
      !lastName ||
      !address ||
      !city ||
      !state ||
      !pincode ||
      !phone ||
      !items ||
      items.length === 0
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate prices and recalculate total on server
    let calculation;
    try {
      calculation = await validateAndCalculateTotal(items, couponCode);
    } catch (calcError: any) {
      return NextResponse.json({ error: calcError.message || "Price validation failed" }, { status: 400 });
    }

    // Allow small rounding discrepancies, but expect a close match
    const difference = Math.abs(calculation.total - total);
    if (difference > 1) {
      console.error(`Price discrepancy detected! Client: ${total}, Server computed: ${calculation.total}`);
      return NextResponse.json({ error: "Order total discrepancy detected. Please refresh your cart." }, { status: 400 });
    }

    // 3. Create Order with PENDING status in DB
    const order = await prisma.order.create({
      data: {
        customerName: `${firstName} ${lastName}`,
        customerEmail: email,
        customerPhone: phone,
        address: `${address}, ${city}, ${state}`,
        pincode: pincode,
        total: calculation.total,
        paymentMethod: "ONLINE",
        paymentStatus: "PENDING",
        status: "PENDING",
        deliveryMethod: deliveryMethod || "STANDARD",
        fulfillmentProvider: deliveryMethod === "EXPRESS" ? "SAHU_LOCAL" : "SHIPROCKET",
        userId: sessionId || null,
        items: {
          create: calculation.verifiedItems.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
            selectedColor: item.selectedColor || null,
            selectedVariant: item.selectedVariant || null,
          })),
        },
      },
    });

    // 4. Get Easebuzz Config
    const config = getEasebuzzConfig();
    if (!config.key || !config.salt) {
      console.error("Easebuzz keys are missing in environment variables.");
      return NextResponse.json(
        { error: "Payment gateway credentials are not configured" },
        { status: 500 }
      );
    }

    // 5. Construct Callback URLs dynamically
    const origin = request.headers.get("origin") || 
      `${request.headers.get("x-forwarded-proto") || "https"}://${request.headers.get("host")}`;
    const surl = `${origin}/api/checkout/easebuzz/callback`;
    const furl = `${origin}/api/checkout/easebuzz/callback`;

    // 6. Generate Easebuzz initiation hash
    const paymentData = {
      txnid: order.id,
      amount: order.total,
      productinfo: "Smartphones Purchase",
      firstname: firstName,
      email: email,
      phone: phone,
      surl,
      furl,
    };

    const hash = generateInitiateHash(paymentData);

    // 7. Initiate payment request with Easebuzz
    const formParams = new URLSearchParams();
    formParams.append("key", config.key.trim());
    formParams.append("txnid", order.id.trim());
    formParams.append("amount", parseFloat(order.total.toString()).toFixed(2));
    formParams.append("productinfo", "Smartphones Purchase");
    formParams.append("firstname", firstName.trim());
    formParams.append("email", email.trim());
    formParams.append("phone", phone.trim());
    formParams.append("surl", surl.trim());
    formParams.append("furl", furl.trim());
    formParams.append("hash", hash);
    formParams.append("udf1", "");
    formParams.append("udf2", "");
    formParams.append("udf3", "");
    formParams.append("udf4", "");
    formParams.append("udf5", "");
    formParams.append("udf6", "");
    formParams.append("udf7", "");

    const response = await fetch(`${config.baseUrl}/payment/initiateLink`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: formParams.toString(),
    });

    if (!response.ok) {
      throw new Error(`Easebuzz returned status ${response.status}`);
    }

    const resData = await response.json();

    if (resData.status !== 1) {
      console.error("Easebuzz initiation error:", resData.data);
      return NextResponse.json(
        { error: "Payment gateway error", details: resData.data },
        { status: 400 }
      );
    }

    // 8. Return access URL to frontend
    const checkoutUrl = `${config.baseUrl}/pay/${resData.data}`;
    return NextResponse.json({ url: checkoutUrl });

  } catch (error: any) {
    console.error("Easebuzz Checkout Error:", error);
    return NextResponse.json(
      { error: "Failed to initiate payment", details: error.message },
      { status: 500 }
    );
  }
}
