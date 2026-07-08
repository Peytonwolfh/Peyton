import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image (build assets)
     * - the PWA files (manifest, service worker, icons, offline page)
     * - image/font files
     */
    "/((?!_next/static|_next/image|favicon.ico|favicon.png|manifest.json|sw.js|offline.html|icon-.*\\.png|apple-touch-icon.png|.*\\.(?:png|jpg|jpeg|gif|svg|ico|woff2?)$).*)",
  ],
};
