import { NextRequest, NextResponse } from "next/server";
import { hashPassword, createToken, setAuthCookie } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, phone } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este email" },
        { status: 409 }
      );
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        name: name || null,
        phone: phone || null,
        passwordHash,
      },
    });

    // If the email was subscribed to newsletter, link it
    try {
      const nl = await db.newsletter.findUnique({ where: { email: email.toLowerCase() } });
      if (nl && !nl.userId) {
        await db.newsletter.update({
          where: { id: nl.id },
          data: { userId: user.id },
        });
      }
    } catch {
      // ignore newsletter linking errors
    }

    // Create token and set cookie
    const token = await createToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });
    await setAuthCookie(token);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Error al crear la cuenta" },
      { status: 500 }
    );
  }
}
