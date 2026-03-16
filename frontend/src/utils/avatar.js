export function getDefaultAvatarForGender(gender, seed = "planorah") {
    const normalized = String(gender || "").toLowerCase();
    const safeSeed = encodeURIComponent(seed || "planorah");

    if (normalized === "female") {
        return `https://api.dicebear.com/7.x/lorelei/svg?seed=${safeSeed}`;
    }
    if (normalized === "male") {
        return `https://api.dicebear.com/7.x/adventurer/svg?seed=${safeSeed}`;
    }

    return `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${safeSeed}`;
}

export function getUserAvatar(user) {
    const explicitAvatar = user?.avatar || user?.profile?.avatar;
    if (explicitAvatar) return explicitAvatar;

    const gender = user?.gender || user?.profile?.gender;
    const seed = user?.username || user?.email || user?.first_name || "planorah";
    return getDefaultAvatarForGender(gender, seed);
}
