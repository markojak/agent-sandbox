import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {
  deleteFoodEntry,
  InputError,
  updateFoodEntry,
  type UpdateFoodEntryInput,
} from "@/lib/food-entries/service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const input = {
      ...body,
      timeZone: body.timeZone ?? "UTC",
    } as UpdateFoodEntryInput;

    const entry = await updateFoodEntry(id, input);

    return NextResponse.json({ entry });
  } catch (error) {
    if (error instanceof InputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Entry not found." }, { status: 404 });
    }

    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await deleteFoodEntry(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Entry not found." }, { status: 404 });
    }

    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
