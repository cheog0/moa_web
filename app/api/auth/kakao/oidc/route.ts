import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  authErrorUrl,
  fetchKakaoProfile,
  getKakaoCredentials,
  isNativeKakaoState,
  kakaoCookieOptions,
  kakaoRedirectUri,
  KAKAO_NATIVE_COOKIE,
  KAKAO_NATIVE_REDIRECT,
  KAKAO_STATE_COOKIE,
  KAKAO_TOKENS_COOKIE,
} from "@/lib/kakaoOidc";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;
  const cookieStore = await cookies();
  const oauthState = requestUrl.searchParams.get("state") ?? "";
  const native =
    isNativeKakaoState(oauthState) ||
    cookieStore.get(KAKAO_NATIVE_COOKIE)?.value === "1";

  const fail = () => {
    const response = native
      ? NextResponse.redirect(`${KAKAO_NATIVE_REDIRECT}?error=1`)
      : NextResponse.redirect(authErrorUrl(origin));
    response.cookies.delete(KAKAO_STATE_COOKIE);
    response.cookies.delete(KAKAO_NATIVE_COOKIE);
    return response;
  };

  if (requestUrl.searchParams.get("error")) {
    return fail();
  }

  const code = requestUrl.searchParams.get("code");
  const savedState = cookieStore.get(KAKAO_STATE_COOKIE)?.value;

  if (!code || !oauthState || (savedState && oauthState !== savedState)) {
    return fail();
  }
  if (!native && (!savedState || oauthState !== savedState)) {
    return fail();
  }

  const { clientId, clientSecret } = getKakaoCredentials();
  if (!clientId || !clientSecret) {
    return fail();
  }

  const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: kakaoRedirectUri(origin),
      code,
    }),
  });

  if (!tokenRes.ok) {
    return fail();
  }

  const tokens = (await tokenRes.json()) as {
    id_token?: string;
    access_token?: string;
  };

  if (!tokens.id_token) {
    return fail();
  }

  const profile = tokens.access_token
    ? await fetchKakaoProfile(tokens.access_token)
    : { email: "", nickname: "" };

  if (native) {
    const payload = new URLSearchParams();
    payload.set("id_token", tokens.id_token);
    if (tokens.access_token) payload.set("access_token", tokens.access_token);
    if (profile.email) payload.set("email", profile.email);
    if (profile.nickname) payload.set("nickname", profile.nickname);
    const response = NextResponse.redirect(
      `${KAKAO_NATIVE_REDIRECT}?${payload.toString()}`,
    );
    response.cookies.delete(KAKAO_STATE_COOKIE);
    response.cookies.delete(KAKAO_NATIVE_COOKIE);
    return response;
  }

  const response = NextResponse.redirect(new URL("/auth/kakao", origin));
  response.cookies.delete(KAKAO_STATE_COOKIE);
  response.cookies.delete(KAKAO_NATIVE_COOKIE);
  response.cookies.set(
    KAKAO_TOKENS_COOKIE,
    JSON.stringify({
      id_token: tokens.id_token,
      access_token: tokens.access_token ?? "",
      email: profile.email,
      nickname: profile.nickname,
    }),
    kakaoCookieOptions(120),
  );
  return response;
}
