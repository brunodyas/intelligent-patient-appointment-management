import { Inter } from "next/font/google";
import dynamic from 'next/dynamic';
import { cookies as nextCookies } from 'next/headers';

import "../globals.css";
import { JWT } from "@/constants/enums/enums";
import { redirect } from "next/navigation";
import serverAxiosInstance from "@/lib/serverAxios";

const NavShell = dynamic(() => import("@/components/NavShell"));
const AuthProvider = dynamic(() => import("@/context/auth").then(mod => mod.AuthProvider));
const CallProvider = dynamic(() => import("@/context/callContext").then(mod => mod.CallProvider));
const TechLocationProvider = dynamic(() => import("@/context/techLocationContext").then(mod => mod.TechLocationProvider));

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userInfo = await fetchUserDetails();

  return (
    <AuthProvider userInfo={userInfo} key={`${userInfo?.id}-auth-provider`}>
      <TechLocationProvider key={`${userInfo?.id}-tech-location-provider`}>
        <CallProvider key={`${userInfo?.id}-call-provider`}>
          <NavShell key={`${userInfo?.id}-nav-shell`}>
            {children}
          </NavShell>
        </CallProvider>
      </TechLocationProvider>
    </AuthProvider>
  );
}

async function fetchUserDetails() {
  const cookieStore = nextCookies();
  const cookies = cookieStore.get(JWT);
  const token = cookies?.value ? JSON.parse(cookies.value).token : null;

  // if (!token) {
  //   console.log("🚀 ~ fetchUserDetails ~ token:=====================================")
  //   console.error("JWT token is missing.");
  //   redirect('/sign-in');
  // }

  try {
    const res = await serverAxiosInstance.get("api/user/user-details/")

    if (!res) {
      console.error(`Failed to fetch user details`);
      return null;
    }
    console.log("User details fetched successfully:");
    return res.data || '';
  } catch (error) {
    console.error("Error fetching user details:", error);
    return null;
  }
}
