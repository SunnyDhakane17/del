import connectToDatabase, { ensureCollections, getTenantDatabase } from "@/libs/mongodb";
import { NextResponse } from "next/server";


export async function GET(
  request: Request,
  { params }: { params: { businessPhoneNumber: string } }
) {
  // Await params to access the properties
  const { businessPhoneNumber } = await params;

  if (!businessPhoneNumber) {
    return NextResponse.json(
      { success: false, error: "Business phone number is required." },
      { status: 400 }
    );
  }

  try {
    // Connect to the database
    await connectToDatabase();

    // Ensure tenant collections are created
    await ensureCollections(businessPhoneNumber);

    // Fetch tenant-specific database
    const db = getTenantDatabase(businessPhoneNumber);
    const chatsCollection = db.collection("chats");

    // Fetch existing chats (previous functionality)
    const chats = await chatsCollection.find({}).toArray();

    console.log("Current chats:", chats);

    // Set up change stream to monitor the 'chats' collection for changes
    const changeStream = chatsCollection.watch();

    console.log(`Listening for changes in the 'chats' collection...`);

    changeStream.on("change", (change) => {
      console.log("Change detected:", change);
      // Optionally handle specific change types
      if (change.operationType === "insert") {
        console.log("New document inserted:", change.fullDocument);
      } else if (change.operationType === "update") {
        console.log("Document updated:", change.updateDescription);
      } else if (change.operationType === "delete") {
        console.log("Document deleted:", change.documentKey);
      }
    });

    // Return both the fetched data and a message about change detection
    return NextResponse.json({
      success: true,
      data: chats,
      message: "Change stream initialized and current data fetched.",
    });
  } catch (error) {
    console.error(`Error in GET /api/data/${businessPhoneNumber}:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch data or set up change detection." },
      { status: 500 }
    );
  }
}
