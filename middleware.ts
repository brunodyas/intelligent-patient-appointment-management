import { NextRequest, NextResponse } from "next/server";
import { routes } from "./src/constants/routes";
import { cookies } from "next/headers";
import { JWT } from "./src/constants/enums/enums";
import { ENVS, GUARDS } from "@/constants/pageGuards";

export const middleware = async (req: NextRequest) => {
  //get cookie
  const JWTCookie = cookies().get(JWT);

  if (
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.startsWith("/logo") ||
    req.nextUrl.pathname.startsWith("/icons") ||
    req.nextUrl.pathname.startsWith("/image") ||
    req.nextUrl.pathname === "/expense-calculator" || // Allow access to expense-calculator
    req.nextUrl.pathname === "/privacy-policy" ||
    // Below routes for PWA (Service workers)
    req.nextUrl.pathname.includes("sw") ||
    req.nextUrl.pathname.includes("worker") ||
    req.nextUrl.pathname.includes("work") ||
    req.nextUrl.pathname.includes("manifest")
  ) {
    return NextResponse.next();
  }
  const token = req.cookies.get("user-token")?.value;
  if (
    (req.nextUrl.pathname.includes(routes.forgotPassword) ||
      req.nextUrl.pathname.includes(routes.callback) ||
      req.nextUrl.pathname.includes(routes.resetPassword)) ||
      req.nextUrl.pathname.includes(routes.addJob) &&
    !JWTCookie
  ) {
    return NextResponse.next();
  }
  //already on sign in and not authorized yet
  if (req.nextUrl.pathname.startsWith(routes.signIn) && !JWTCookie) {
    return;
  }

  //tries to go to sign in or forgot password but already authorized
  if (
    (req.nextUrl.pathname.includes(routes.signIn) ||
      req.nextUrl.pathname.includes(routes.forgotPassword) ||
      req.nextUrl.pathname.includes(routes.callback) ||
      req.nextUrl.pathname.includes(routes.resetPassword) ||
      req.nextUrl.pathname === "/") &&
    JWTCookie
  ) {
    return NextResponse.redirect(new URL(routes.feed, req.url));
  }
  // not authorized
  if (!JWTCookie) {
    return NextResponse.redirect(new URL(routes.signIn, req.url));
  }

  if (process.env.NODE_ENV === ENVS.production && GUARDS.includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL(routes.notFound, req.url))
  }

  return NextResponse.next();
};

export const config = {
  matcher: Object.values(routes),
};
