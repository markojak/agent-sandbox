import { NextResponse } from "next/server";
import {
  createFoodEntry,
  getFoodEntriesByDate,
  InputError,
  type CreateFoodEntryInput,
} from "@/lib/food-entries/service";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get("date");
    const timeZone = url.searchParams.get("timeZone") ?? "UTC";

    if (!date) {
      return NextResponse.json({ error: "date is required." }, { status: 400 });
    }

    const entries = await getFoodEntriesByDate(date, timeZone);

    return NextResponse.json({ entries });
  } catch (error) {
    if (error instanceof InputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const idempotencyKey = request.headers.get("idempotency-key") ?? undefined;
    const body = await request.json();

    const payload = {
      ...body,
      idempotencyKey: idempotencyKey ?? body.idempotencyKey,
      timeZone: body.timeZone ?? "UTC",
    } as CreateFoodEntryInput;

    const entry = await createFoodEntry(payload);

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    if (error instanceof InputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
