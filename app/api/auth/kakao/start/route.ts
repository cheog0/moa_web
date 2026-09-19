import { NextResponse } from "next/server";
import {
  authErrorUrl,
  createKakaoState,
  getKakaoCredentials,
  kakaoAuthorizeUrl,
  kakaoCookieOptions,
  kakaoRedirectUri,
  KAKAO_NATIVE_COOKIE,
  KAKAO_NATIVE_REDIRECT,
  KAKAO_STATE_COOKIE,
} from "@/lib/kakaoOidc";

export async function GET(request: Request) {
  const { clientId } = getKakaoCredentials();
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;
  const native = requestUrl.searchParams.get("native") === "1";

  if (!clientId) {
    if (native) {
      return NextResponse.redirect(`${KAKAO_NATIVE_REDIRECT}?error=1`);
    }
    return NextResponse.redirect(authErrorUrl(origin));
  }

  const state = createKakaoState();
  const response = NextResponse.redirect(
    kakaoAuthorizeUrl({
      clientId,
      redirectUri: kakaoRedirectUri(origin),
      state,
    }),
  );
  response.cookies.set(KAKAO_STATE_COOKIE, state, kakaoCookieOptions(600));
  if (native) {
    response.cookies.set(KAKAO_NATIVE_COOKIE, "1", kakaoCookieOptions(600));
  } else {
    response.cookies.delete(KAKAO_NATIVE_COOKIE);
  }
  return response;
}
