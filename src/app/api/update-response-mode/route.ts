import { NextResponse } from "next/server";
import connectToDatabase, { getTenantDatabase } from "@/libs/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { waId, responseMode, businessPhoneNumber } = body;

    if (!waId || !responseMode || !businessPhoneNumber) {
      return NextResponse.json(
        { success: false, error: "waId, responseMode, and businessPhoneNumber are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const db = getTenantDatabase(businessPhoneNumber);
    const chatsCollection = db.collection("chats");

    const chatExists = await chatsCollection.findOne({ wa_id: String(waId) });
    if (!chatExists) {
      return NextResponse.json(
        { success: false, error: "No chat found with the provided waId." },
        { status: 404 }
      );
    }

    await chatsCollection.updateOne({ wa_id: String(waId) }, { $set: { responseMode } });

    return NextResponse.json({
      success: true,
      message: `Response mode updated to ${responseMode} for user ${waId}.`,
    });
  } catch (error) {
    console.error("Error in POST /api/update-response-mode:", error);
    return NextResponse.json({ success: false, error: "Failed to update response mode." }, { status: 500 });
  }
}
