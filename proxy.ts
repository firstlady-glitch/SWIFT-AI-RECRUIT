import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // 1. Create an initial response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Initialize Supabase Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 3. Get the current User
  // We use getUser() instead of getSession() for security/freshness
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ---------------------------------------------------------
  // CONFIGURATION: Define Paths & Defaults
  // ---------------------------------------------------------

  const currentPath = request.nextUrl.pathname;

  // Public paths that don't require auth
  const isPublicPath =
    currentPath === "/" ||
    currentPath.startsWith("/auth") ||
    currentPath.startsWith("/about") ||
    currentPath.startsWith("/features") ||
    currentPath.startsWith("/pricing") ||
    currentPath.startsWith("/blog") ||
    currentPath.startsWith("/resources") ||
    currentPath.startsWith("/contact") ||
    currentPath.startsWith("/faq") ||
    currentPath.startsWith("/jobs") ||
    currentPath.startsWith("/terms") ||
    currentPath.startsWith("/privacy") ||
    currentPath.startsWith("/cookies") ||
    currentPath.startsWith("/data-policy");

  // Role-Specific Landing Pages (Where they go on mount/login)
  const roleDefaults: Record<string, string> = {
    applicant: "/app/applicant",       // Applicant goes to /app/applicant page
    employer: "/app/org/employer",     // Employer goes to /app/org/employer
    recruiter: "/app/org/recruiter",   // Recruiter goes to /app/org/recruiter
    admin: "/admin/dashboard",
  };

  // ---------------------------------------------------------
  // SCENARIO A: User is NOT Logged In
  // ---------------------------------------------------------
  if (!user) {
    // If trying to access a protected route, redirect to Login
    if (!isPublicPath) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      // Optional: Save where they were trying to go
      loginUrl.searchParams.set("next", currentPath);
      return NextResponse.redirect(loginUrl);
    }
    // Allow public access
    return response;
  }

  // ---------------------------------------------------------
  // SCENARIO B: User IS Logged In
  // ---------------------------------------------------------

  // 1. Fetch User Role
  // We check 'user_metadata' first for performance. 
  // If not found there, we fetch from the 'profiles' table.
  let userRole = user.user_metadata?.role;

  if (!userRole) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    userRole = profile?.role;
  }

  // Fallback if role is completely missing (shouldn't happen with correct DB setup)
  if (!userRole) {
    // Force logout or send to an error page
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Handle Root/Auth Redirects (e.g. user goes to "/" or "/login" while authenticated)
  if (isPublicPath) {
    const targetUrl = roleDefaults[userRole] || "/dashboard";
    return NextResponse.redirect(new URL(targetUrl, request.url));
  }

  // 3. Role-Based Access Control (RBAC) Protection
  // Ensure "applicant" cannot view "/employer/*" pages, etc.

  if (currentPath.startsWith("/app/org/employer") && userRole !== "employer") {
    // Redirect unauthorized user back to THEIR own dashboard
    return NextResponse.redirect(new URL(roleDefaults[userRole], request.url));
  }

  if (currentPath.startsWith("/app/org/recruiter") && userRole !== "recruiter") {
    return NextResponse.redirect(new URL(roleDefaults[userRole], request.url));
  }

  if (currentPath.startsWith("/app/applicant") && userRole !== "applicant") {
    return NextResponse.redirect(new URL(roleDefaults[userRole], request.url));
  }

  // Allow /app base and /app/org base for redirection
  if (currentPath === "/app" || currentPath === "/app/org") {
    return NextResponse.redirect(new URL(roleDefaults[userRole], request.url));
  }

  // If all checks pass, allow the request to proceed
  return response;
}

// ---------------------------------------------------------
// Matcher: Exclude static files, images, and API routes
// ---------------------------------------------------------
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (auth callback routes)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};