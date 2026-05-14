import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pincode = searchParams.get("pincode");

  if (!pincode || pincode.length !== 6) {
    return NextResponse.json(
      { error: "Please provide a valid 6-digit Indian pincode." },
      { status: 400 }
    );
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Mock Shiprocket Response Logic
  // In production, this would make a POST to Shiprocket API:
  // https://apiv2.shiprocket.in/v1/external/courier/serviceability/
  
  // For now, let's mock responses based on the first digit
  const firstDigit = pincode.charAt(0);

  if (firstDigit === "0" || firstDigit === "9") {
    // Unserviceable
    return NextResponse.json({
      status: 200,
      data: {
        available_courier_companies: [],
        recommended_courier_company_id: null,
      },
    });
  }

  // Serviceable mock data
  return NextResponse.json({
    status: 200,
    data: {
      available_courier_companies: [
        {
          courier_name: "Delhivery",
          freight_charge: 50,
          estimated_delivery_days: 3,
        },
        {
          courier_name: "XpressBees",
          freight_charge: 45,
          estimated_delivery_days: 4,
        },
      ],
      recommended_courier_company_id: 1,
    },
  });
}
