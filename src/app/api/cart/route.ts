import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, db } from "@/lib/auth";

// GET — fetch user's saved cart
export async function GET() {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return NextResponse.json({ items: [] });
    }

    const items = await db.cartItem.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      items: items.map((i) => ({
        productId: i.productId,
        variantIndex: i.variantIndex,
        quantity: i.quantity,
      })),
    });
  } catch (error) {
    console.error("Cart GET error:", error);
    return NextResponse.json({ items: [] });
  }
}

// POST — save/replace entire cart
export async function POST(req: NextRequest) {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return NextResponse.json({ ok: false, error: "No autenticado" }, { status: 401 });
    }

    const { items } = await req.json();
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
    }

    // Delete existing cart items and insert new ones (transaction)
    await db.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({ where: { userId: payload.userId } });
      if (items.length > 0) {
        await tx.cartItem.createMany({
          data: items.map((i: { productId: string; variantIndex: number; quantity: number }) => ({
            userId: payload.userId,
            productId: i.productId,
            variantIndex: i.variantIndex || 0,
            quantity: Math.max(1, i.quantity || 1),
          })),
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Cart POST error:", error);
    return NextResponse.json({ error: "Error al guardar el carrito" }, { status: 500 });
  }
}

// DELETE — clear cart
export async function DELETE() {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    await db.cartItem.deleteMany({ where: { userId: payload.userId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Cart DELETE error:", error);
    return NextResponse.json({ error: "Error al vaciar el carrito" }, { status: 500 });
  }
}
