import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // Check if payments are accepted (default to true if not set, or handle as string 'false')
  const acceptPayments = process.env.NEXT_PUBLIC_ACCEPT_PAYMENTS !== 'false';

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
    currentPath.startsWith("/api") ||
    currentPath.startsWith("/login") ||
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
    currentPath.startsWith("/data-policy") ||
    currentPath.startsWith("/dev");

  // Role-Specific Landing Pages (Where they go on mount/login)
  const roleDefaults: Record<string, string> = {
    applicant: "/app/applicant",       // Applicant goes to /app/applicant page
    employer: "/app/org/employer",     // Employer goes to /app/org/employer
    recruiter: "/app/org/recruiter",   // Recruiter goes to /app/org/recruiter
    org: "/app/org",                   // Generic org (pre-selection) goes to /app/org
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

  // 1. Fetch User Role AND Onboarding Status
  // Profile.role is the source of truth, user_metadata is only a fallback
  let userRole: string | undefined;
  let onboardingCompleted = false;

  // Always fetch profile to get current role and onboarding status
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, onboarding_completed")
    .eq("id", user.id)
    .single();

  if (profile) {
    // Profile role is the source of truth
    userRole = profile.role;
    onboardingCompleted = profile.onboarding_completed ?? false;
  } else {
    // Fallback to user_metadata only if profile doesn't exist
    userRole = user.user_metadata?.role;
  }

  // Fallback if role is completely missing (shouldn't happen with correct DB setup)
  if (!userRole) {
    // Force logout or send to an error page
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ---------------------------------------------------------
  // ONBOARDING CHECK: If onboarding is incomplete, redirect to setup
  // ---------------------------------------------------------

  // Define setup paths (these should be accessible during onboarding)
  const isSetupPath =
    currentPath.startsWith("/app/applicant/setup") ||
    currentPath.startsWith("/app/org/employer/setup") ||
    currentPath.startsWith("/app/org/recruiter/setup") ||
    currentPath === "/app/org"; // Org role selection page

  // If onboarding is NOT completed
  if (!onboardingCompleted) {
    // Allow access to setup paths
    if (isSetupPath) {
      return response;
    }

    // Redirect to appropriate setup page
    if (userRole === "applicant") {
      return NextResponse.redirect(new URL("/app/applicant/setup", request.url));
    } else if (userRole === "employer" || userRole === "recruiter" || userRole === "org") {
      // Org users go to /app/org to select/confirm their specific role
      return NextResponse.redirect(new URL("/app/org", request.url));
    }
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

  // Redirect /app base to role-specific dashboard (only if onboarding is complete)
  if (currentPath === "/app") {
    return NextResponse.redirect(new URL(roleDefaults[userRole] || "/app/org", request.url));
  }

  // Redirect /app/org to role-specific dashboard ONLY for employer/recruiter with completed onboarding
  // For "org" role, this is their setup page so don't redirect
  if (currentPath === "/app/org" && userRole !== "org") {
    return NextResponse.redirect(new URL(roleDefaults[userRole], request.url));
  }

  // Redirect /pricing if payments are not accepted
  if (!acceptPayments && currentPath.startsWith("/pricing")) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
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