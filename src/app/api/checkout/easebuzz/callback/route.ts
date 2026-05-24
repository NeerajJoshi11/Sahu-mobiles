import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCallbackHash } from "@/lib/easebuzz";

export async function POST(request: Request) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  const proto = request.headers.get("x-forwarded-proto") || "https";
  const origin = `${proto}://${host}`;

  try {
    // 1. Parse the POST request body from Easebuzz (x-www-form-urlencoded)
    const formData = await request.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    console.log("Easebuzz Callback Received parameters for transaction:", params.txnid);

    // 2. Verify signature/hash authenticity
    const isValidHash = verifyCallbackHash(params);
    if (!isValidHash) {
      console.error("Easebuzz Callback Error: Hash verification failed!");
      
      // Update order to FAILED in database
      if (params.txnid) {
        await prisma.order.update({
          where: { id: params.txnid },
          data: {
            status: "FAILED",
            paymentStatus: "FAILED",
          },
        }).catch((err: any) => console.error("Failed to update order to FAILED:", err));
      }

      return NextResponse.redirect(`${origin}/checkout?error=Payment+verification+failed`, 303);
    }

    // 3. Check transaction status
    if (params.status === "success") {
      console.log(`Payment successful for order ID: ${params.txnid}`);

      // Update Order in database
      await prisma.order.update({
        where: { id: params.txnid },
        data: {
          status: "COMPLETED",
          paymentStatus: "COMPLETED",
        },
      });

      // Redirect to success page
      return NextResponse.redirect(`${origin}/success?orderId=${params.txnid}`, 303);
    } else {
      console.warn(`Payment failed or was cancelled for order ID: ${params.txnid}. Status: ${params.status}`);

      // Update Order in database to FAILED
      await prisma.order.update({
        where: { id: params.txnid },
        data: {
          status: "FAILED",
          paymentStatus: "FAILED",
        },
      });

      // Redirect back to checkout with error
      return NextResponse.redirect(`${origin}/checkout?error=Payment+failed+or+cancelled`, 303);
    }

  } catch (error: any) {
    console.error("Easebuzz Callback Exception:", error);
    return NextResponse.redirect(`${origin}/checkout?error=Internal+server+error+during+payment+processing`, 303);
  }
}
