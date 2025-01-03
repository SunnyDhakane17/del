import { NextResponse } from "next/server";
import connectToDatabase, { getTenantDatabase } from "@/libs/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { waId, businessPhoneNumber } = body;

    if (!waId || !businessPhoneNumber) {
      return NextResponse.json(
        { success: false, error: "waId and businessPhoneNumber are required." },
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

    await chatsCollection.updateOne({ wa_id: String(waId) }, { $set: { alert: false } });

    return NextResponse.json({
      success: true,
      message: `Alert turned off for user ${waId}.`,
    });
  } catch (error) {
    console.error("Error in POST /api/update-alert:", error);
    return NextResponse.json({ success: false, error: "Failed to update alert status." }, { status: 500 });
  }
}
