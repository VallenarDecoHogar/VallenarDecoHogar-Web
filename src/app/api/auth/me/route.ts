import { NextResponse } from "next/server";
import { getCurrentUser, db } from "@/lib/auth";

export async function GET() {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return NextResponse.json({ user: null });
    }

    // Get fresh user data from DB
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, phone: true },
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    // Also return cart and wishlist counts
    const [cartCount, wishlistCount] = await Promise.all([
      db.cartItem.aggregate({
        where: { userId: user.id },
        _sum: { quantity: true },
      }),
      db.wishlistItem.count({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({
      user,
      cartCount: cartCount._sum.quantity || 0,
      wishlistCount,
    });
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json({ user: null });
  }
}
