type AuthUserLike = {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
} | null | undefined;

export function userDisplayLabel(user: AuthUserLike): string {
  const meta = user?.user_metadata ?? {};
  for (const key of ["name", "full_name", "nickname", "preferred_username"]) {
    const value = String(meta[key] ?? "").trim();
    if (value) return value;
  }
  const email = user?.email?.trim();
  if (email) return email;
  return "랩플 사용자";
}

export function userAvatarInitial(user: AuthUserLike): string {
  const label = userDisplayLabel(user);
  if (!label || label === "랩플 사용자") return "R";
  return Array.from(label)[0]?.toUpperCase() ?? "R";
}
