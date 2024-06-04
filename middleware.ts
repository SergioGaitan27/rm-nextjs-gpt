import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '@/models/User';
import { connectDB } from '@/app/libs/mongodb';

const secretKey = process.env.JWT_SECRET;

if (!secretKey) {
  throw new Error('La clave secreta JWT no está definida en las variables de entorno');
}

function verifyToken(token: string): JwtPayload & { id: string; role: string } {
  return jwt.verify(token, secretKey as string) as JwtPayload & { id: string; role: string };
}

export async function middleware(request: NextRequest) {
  const tokenCookie = request.cookies.get('token');

  if (!tokenCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const token = tokenCookie.value;

  try {
    // Verifica el token usando la función auxiliar
    const decoded = verifyToken(token);

    // Conéctate a la base de datos
    await connectDB();

    // Busca el usuario en la base de datos
    const user = await User.findById(decoded.id);

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Definir las rutas que necesitan ciertos roles
    const roleProtectedRoutes = [
      { path: '/admin', roles: ['Super Administrador', 'Administrador'] },
      { path: '/sistemas', roles: ['Sistemas'] },
      { path: '/vendedor', roles: ['Vendedor'] },
      { path: '/comprador', roles: ['Comprador'] },
    ];

    for (const route of roleProtectedRoutes) {
      if (request.nextUrl.pathname.startsWith(route.path)) {
        if (!route.roles.includes(user.role)) {
          return NextResponse.redirect(new URL('/not-authorized', request.url));
        }
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/sistemas/:path*', '/vendedor/:path*', '/comprador/:path*'],
};