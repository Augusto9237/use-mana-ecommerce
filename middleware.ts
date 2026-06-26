import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Rotas que requerem acesso de admin
  const adminRoutes = ["/admin"];

  if (adminRoutes.some((route) => request.nextUrl.pathname.startsWith(route))) {
    const cookie = request.cookies.get("better-auth.session_token")?.value;

    // Se não houver sessão, redireciona para login
    if (!cookie) {
      return NextResponse.redirect(new URL("/authentication", request.url));
    }

    // A verificação de role será feita nas páginas individuais
    // pois precisamos do contexto do servidor para acessar a sessão corretamente
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
