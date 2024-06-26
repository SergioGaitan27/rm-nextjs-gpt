import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decode } from 'jsonwebtoken';

interface TokenPayload {
  id: string;
  role: string;
  location: string;
  businessId: string;
  exp: number; // Añadimos la propiedad exp para la expiración del token
}

export function middleware(req: NextRequest) {
  const token = req.cookies.get('next-auth.session-token') || req.cookies.get('__Secure-next-auth.session-token');

  // Rutas que requieren autenticación
  const protectedPaths = [
    '/products',
    '/point-of-sale',
    '/transfers',
    '/protected',
    '/another-protected-route',
    '/admin',
  ];

  const url = req.nextUrl.clone();
  url.pathname = '/login';

  if (protectedPaths.some(path => req.nextUrl.pathname.startsWith(path))) {
    if (!token) {
      return NextResponse.redirect(url);
    }

    try {
      const decodedToken = decode(token.value) as TokenPayload;

      // Verificar si el token ha expirado
      if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
        return NextResponse.redirect(url);
      }

      // Verificar rol de Super Administrador para la página de gestión de usuarios
      if (req.nextUrl.pathname.startsWith('/admin/manage-users') && decodedToken.role !== 'Super Administrador') {
        url.pathname = '/unauthorized';
        return NextResponse.redirect(url);
      }

    } catch (error) {
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/products/:path*',
    '/point-of-sale/:path*',
    '/transfers/:path*',
    '/protected/:path*',
    '/another-protected-route/:path*',
    '/admin/:path*',
    '/dashboard/:path*',
  ],
};
