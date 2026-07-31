import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, db } from "@/lib/auth";

// GET — fetch user's wishlist (product IDs)
export async function GET() {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return NextResponse.json({ items: [] });
    }

    const items = await db.wishlistItem.findMany({
      where: { userId: payload.userId },
      select: { productId: true },
    });

    return NextResponse.json({ items: items.map((i) => i.productId) });
  } catch (error) {
    console.error("Wishlist GET error:", error);
    return NextResponse.json({ items: [] });
  }
}

// POST — add or remove product from wishlist (toggle)
export async function POST(req: NextRequest) {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return NextResponse.json({ ok: false, error: "No autenticado" }, { status: 401 });
    }

    const { productId, action } = await req.json();
    if (!productId || !action) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    if (action === "add") {
      await db.wishlistItem.upsert({
        where: {
          userId_productId: { userId: payload.userId, productId },
        },
        update: {},
        create: { userId: payload.userId, productId },
      });
    } else if (action === "remove") {
      await db.wishlistItem.deleteMany({
        where: { userId: payload.userId, productId },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Wishlist POST error:", error);
    return NextResponse.json({ error: "Error al actualizar favoritos" }, { status: 500 });
  }
}
