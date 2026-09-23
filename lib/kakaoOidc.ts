import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

export const KAKAO_STATE_COOKIE = "raple_kakao_state";
export const KAKAO_TOKENS_COOKIE = "raple_kakao_tokens";
export const KAKAO_NATIVE_COOKIE = "raple_kakao_native";
export const KAKAO_NATIVE_REDIRECT = "com.cheogo.rapleapp://kakao-oidc";

export function kakaoCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export function kakaoRedirectUri(origin: string) {
  return `${origin}/api/auth/kakao/oidc`;
}

export function kakaoAuthorizeUrl(params: {
  clientId: string;
  redirectUri: string;
  state: string;
}) {
  const url = new URL("https://kauth.kakao.com/oauth/authorize");
  url.searchParams.set("client_id", params.clientId);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", params.state);
  url.searchParams.set("scope", "openid");
  return url.toString();
}

export function createKakaoState(native = false) {
  return `${native ? "n" : "w"}.${randomBytes(24).toString("hex")}`;
}

export function isNativeKakaoState(state: string | null | undefined) {
  return (state ?? "").startsWith("n.");
}

export function getKakaoCredentials() {
  const clientId = process.env.KAKAO_CLIENT_ID?.trim() ?? "";
  const clientSecret = process.env.KAKAO_CLIENT_SECRET?.trim() ?? "";
  return { clientId, clientSecret };
}

export function authErrorUrl(origin: string) {
  return new URL("/login?authError=1", origin);
}

export async function fetchKakaoProfile(accessToken: string) {
  const res = await fetch("https://kapi.kakao.com/v2/user/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    },
  });
  if (!res.ok) {
    return { email: "", nickname: "" };
  }

  const data = (await res.json()) as {
    kakao_account?: {
      email?: string;
      profile?: { nickname?: string };
    };
  };
  return {
    email: String(data.kakao_account?.email ?? "").trim(),
    nickname: String(data.kakao_account?.profile?.nickname ?? "").trim(),
  };
}

export function nativeAppResponse(query: string) {
  const target = `${KAKAO_NATIVE_REDIRECT}?${query}`;
  const response = new NextResponse(null, { status: 302 });
  response.headers.set("Location", target);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

