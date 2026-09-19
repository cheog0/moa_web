type AuthUserLike = {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
  identities?: Array<{
    identity_data?: Record<string, unknown> | null;
  }> | null;
} | null | undefined;

function pickName(source?: Record<string, unknown> | null): string {
  if (!source) return "";
  for (const key of ["name", "full_name", "nickname", "preferred_username"]) {
    const value = String(source[key] ?? "").trim();
    if (value) return value;
  }
  const claims = source.custom_claims;
  if (claims && typeof claims === "object") {
    const kakaoAccount = (claims as Record<string, unknown>).kakao_account;
    if (kakaoAccount && typeof kakaoAccount === "object") {
      const profile = (kakaoAccount as Record<string, unknown>).profile;
      if (profile && typeof profile === "object") {
        const nickname = String(
          (profile as Record<string, unknown>).nickname ?? "",
        ).trim();
        if (nickname) return nickname;
      }
    }
  }
  return "";
}

function pickEmail(user: AuthUserLike): string {
  const fromUser = user?.email?.trim();
  if (fromUser) return fromUser;
  const fromMeta = String(user?.user_metadata?.email ?? "").trim();
  if (fromMeta) return fromMeta;
  for (const identity of user?.identities ?? []) {
    const fromIdentity = String(identity.identity_data?.email ?? "").trim();
    if (fromIdentity) return fromIdentity;
  }
  return "";
}

export function userDisplayLabel(user: AuthUserLike): string {
  const fromMeta = pickName(user?.user_metadata);
  if (fromMeta) return fromMeta;
  for (const identity of user?.identities ?? []) {
    const fromIdentity = pickName(identity.identity_data);
    if (fromIdentity) return fromIdentity;
  }
  const email = pickEmail(user);
  if (email) return email;
  return "랩플 사용자";
}

export function userDisplayEmail(user: AuthUserLike): string {
  return pickEmail(user);
}

export function userAvatarInitial(user: AuthUserLike): string {
  const label = userDisplayLabel(user);
  if (!label || label === "랩플 사용자") return "R";
  return Array.from(label)[0]?.toUpperCase() ?? "R";
}
