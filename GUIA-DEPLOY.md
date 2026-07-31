# 🚀 Guía para subir Vallenar DecoHogar a internet (GRATIS)

Sigue estos pasos en orden. Tarda unos 15 minutos.

---

## PASO 1: Crear cuenta en GitHub (2 min)

1. Ve a **https://github.com/signup**
2. Regístrate con tu email
3. Verifica tu email
4. Listo, ya tienes GitHub

---

## PASO 2: Crear un repositorio nuevo (1 min)

1. En GitHub, haz clic en el botón verde **"New"** (o + arriba a la derecha → New repository)
2. **Repository name:** `vallenar-decohogar`
3. **Description:** `Tienda online de aromaterapia, esoterismo y decoración`
4. Selecciona **Public** (para que Vercel pueda acceder gratis)
5. **NO** marques "Add a README file" (ya viene uno incluido)
6. Haz clic en **"Create repository"**
7. GitHub te mostrará una página con comandos. **NO hagas nada ahí todavía.**

---

## PASO 3: Subir los archivos (5 min)

### Opción A: Subir por la web (más fácil)

1. Descomprime el ZIP `vallenar-decohogar-github.zip` en tu computador
2. En GitHub, en tu repositorio recién creado, haz clic en **"uploading an existing file"**
3. Arrastra **TODOS los archivos y carpetas** del ZIP descomprimido a la zona de carga
   - Importante: arrastra las carpetas `src`, `prisma`, `public`, `scripts` completas
   - Y los archivos sueltos: `package.json`, `next.config.ts`, `tsconfig.json`, etc.
4. Cuando termine de cargar, ve abajo y haz clic en **"Commit changes"**

### Opción B: Usar Git (si sabes usar terminal)

```bash
# Descomprime el ZIP
unzip vallenar-decohogar-github.zip
cd vallenar-decohogar

# Inicializa git
git init
git add .
git commit -m "Vallenar DecoHogar - tienda completa con 202 productos"

# Conecta con GitHub (cambia TU-USUARIO por tu nombre de usuario)
git remote add origin https://github.com/TU-USUARIO/vallenar-decohogar.git
git branch -M main
git push -u origin main
```

---

## PASO 4: Crear cuenta en Vercel (1 min)

1. Ve a **https://vercel.com/signup**
2. Haz clic en **"Continue with GitHub"** (usar tu cuenta de GitHub)
3. Autoriza a Vercel a acceder a tu GitHub
4. Listo

---

## PASO 5: Importar el proyecto en Vercel (2 min)

1. En Vercel, haz clic en **"Add New..."** → **"Project"**
2. Verás tu repositorio `vallenar-decohogar` → Haz clic en **"Import"**
3. Vercel detectará automáticamente que es Next.js ✅
4. **NO hagas clic en Deploy todavía** — primero necesitamos configurar la base de datos

---

## PASO 6: Crear base de datos gratis (3 min)

1. En la misma página de import de Vercel, busca la sección **"Storage"**
2. Haz clic en **"Create Database"**
3. Selecciona **"Postgres"** (Vercel Postgres, plan gratuito)
4. Nombre: `vallenar-db`
5. Región: la más cercana a Chile (ej: `sfo1` o `iad1`)
6. Haz clic en **"Create"**
7. Vercel creará la base de datos y **automáticamente agregará la variable `DATABASE_URL`** a tu proyecto ✅

---

## PASO 7: Agregar variables de entorno (1 min)

En la página de configuración del proyecto en Vercel, ve a **Settings → Environment Variables** y agrega:

| Nombre | Valor |
|--------|-------|
| `JWT_SECRET` | (genera uno en https://generate-secret.vercel.app/ y pégalo aquí) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `56912345678` (cambia por tu número real) |

**Nota:** `DATABASE_URL` ya la agregó Vercel automáticamente en el paso 6.

---

## PASO 8: ¡Desplegar! (2 min)

1. Vuelve a **"Deployments"** en Vercel
2. Si no se desplegó solo, haz clic en **"Redeploy"**
3. Espera 2-3 minutos a que termine el build
4. Cuando termine, verás un mensaje verde: **"Ready"** ✅
5. Vercel te dará un link como: `https://vallenar-decohogar.vercel.app`
6. ¡Ese es tu link público! Compártelo con quien quieras

---

## PASO 9: Crear las tablas en la base de datos (1 min)

Después del primer deploy, necesitas crear las tablas de usuarios:

1. En Vercel, ve a tu proyecto → **Storage** → tu base de datos `vallenar-db`
2. Haz clic en **"Query"** (o "Console")
3. Pega este código SQL y ejecútalo:

```sql
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantIndex" INTEGER NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CartItem_userId_productId_variantIndex_key" ON "CartItem"("userId", "productId", "variantIndex");

CREATE TABLE "WishlistItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "WishlistItem_userId_productId_key" ON "WishlistItem"("userId", "productId");

CREATE TABLE "Newsletter" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Newsletter_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Newsletter_email_key" ON "Newsletter"("email");
CREATE UNIQUE INDEX "Newsletter_userId_key" ON "Newsletter"("userId");

ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Newsletter" ADD CONSTRAINT "Newsletter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
```

4. ¡Listo! La base de datos está configurada.

---

## ✅ ¡Tu tienda está online!

Tu link público será algo como:
```
https://vallenar-decohogar.vercel.app
```

### Lo que funciona:
- ✅ 202 productos con imágenes
- ✅ Catálogo con 4 categorías
- ✅ Carrito de compras
- ✅ Registro y login de usuarios
- ✅ Carrito persistente por usuario
- ✅ Modo día/noche
- ✅ Buscador con historial
- ✅ Botón de WhatsApp
- ✅ Panel de administración
- ✅ HTTPS automático

### Si quieres un dominio propio (vallenardecohogar.cl):
1. Compra el dominio en NIC.cl (~$15.000/año)
2. En Vercel: Settings → Domains → Add → escribe `vallenardecohogar.cl`
3. Vercel te dará instrucciones para apuntar el DNS
4. ¡Listo!

---

## ¿Problemas?

### El build falla en Vercel
- Revisa los logs en Vercel → Deployments → clic en el deploy fallido → "Build Logs"
- Lo más común: falta una variable de entorno

### La base de datos no funciona
- Verifica que `DATABASE_URL` esté en Vercel → Settings → Environment Variables
- Verifica que ejecutaste el SQL del Paso 9

### Las imágenes no cargan
- Ya están configuradas en `next.config.ts` los dominios de Jumpseller
- Si agregas imágenes de otro sitio, agrega el dominio ahí

### Cambios futuros
- Cada vez que hagas un cambio en GitHub (push), Vercel actualiza la web automáticamente
- Para hacer cambios: edita archivos en GitHub directamente, o clona el repo en tu PC
