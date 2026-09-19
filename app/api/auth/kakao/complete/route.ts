import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { KAKAO_TOKENS_COOKIE } from "@/lib/kakaoOidc";

export async function POST() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(KAKAO_TOKENS_COOKIE)?.value;

  const fail = (error: string) => {
    const response = NextResponse.json({ error }, { status: 400 });
    response.cookies.delete(KAKAO_TOKENS_COOKIE);
    return response;
  };

  if (!raw) {
    return fail("missing_tokens");
  }

  try {
    const tokens = JSON.parse(raw) as {
      id_token?: string;
      access_token?: string;
      email?: string;
      nickname?: string;
    };
    if (!tokens.id_token) {
      return fail("missing_id_token");
    }

    const response = NextResponse.json({
      id_token: tokens.id_token,
      access_token: tokens.access_token || undefined,
      email: tokens.email || undefined,
      nickname: tokens.nickname || undefined,
    });
    response.cookies.delete(KAKAO_TOKENS_COOKIE);
    return response;
  } catch {
    return fail("invalid_tokens");
  }
}
