import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/auth/callback", "/auth/sign-out", "/setup"];

export async function updateSession(request: NextRequest) {
  const url = request.nextUrl;

  // Hard-fail-Schutz: wenn Supabase-Env-Vars fehlen, zeigen wir die Setup-Seite
  // statt einen 500er aus dem Edge-Runtime zu werfen.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    if (url.pathname === "/setup") {
      return NextResponse.next({ request });
    }
    const setupUrl = url.clone();
    setupUrl.pathname = "/setup";
    return NextResponse.redirect(setupUrl);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({ request });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  // Forces refresh of expired access tokens.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = url;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!user && !isPublic) {
    const loginUrl = url.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // Single-User-Lock: nur ADMIN_EMAIL darf rein.
  if (user && process.env.ADMIN_EMAIL && user.email !== process.env.ADMIN_EMAIL) {
    await supabase.auth.signOut();
    const loginUrl = url.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("error", "not_authorized");
    return NextResponse.redirect(loginUrl);
  }

  if (user && pathname === "/login") {
    const homeUrl = url.clone();
    homeUrl.pathname = "/";
    return NextResponse.redirect(homeUrl);
  }

  // Falls Setup ausgefüllt ist und User eingeloggt, /setup → /
  if (pathname === "/setup") {
    const homeUrl = url.clone();
    homeUrl.pathname = "/";
    return NextResponse.redirect(homeUrl);
  }

  return response;
}
