import env from '../config/env';

export function resolveAvatarUrl(avatarValue) {
    const raw = String(avatarValue || '').trim();
    if (!raw) {
        return '';
    }

    // Browser-generated URLs should pass through untouched.
    if (raw.startsWith('data:') || raw.startsWith('blob:')) {
        return raw;
    }

    const apiOrigin = String(env.API_ORIGIN || '').replace(/\/+$/, '');
    const normalizeMediaPath = (path) => {
        const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
        if (withLeadingSlash.startsWith('/api/media/')) {
            return withLeadingSlash.slice(4);
        }
        return withLeadingSlash;
    };

    // Normalize absolute URLs that incorrectly point to the frontend host.
    if (/^https?:\/\//i.test(raw)) {
        try {
            const parsed = new URL(raw);
            const host = parsed.hostname.toLowerCase();
            const isFrontendHost = host === 'planorah.me' || host === 'www.planorah.me';

            if (isFrontendHost && apiOrigin) {
                const normalizedPath = normalizeMediaPath(parsed.pathname);
                if (normalizedPath.startsWith('/media/')) {
                    return `${apiOrigin}${normalizedPath}`;
                }
            }
        } catch {
            return raw;
        }

        return raw;
    }

    const normalizedPath = normalizeMediaPath(raw);

    if (!apiOrigin) {
        return normalizedPath;
    }

    return `${apiOrigin}${normalizedPath}`;
}

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
    if (explicitAvatar) return resolveAvatarUrl(explicitAvatar);

    const gender = user?.gender || user?.profile?.gender;
    const seed = user?.username || user?.email || user?.first_name || "planorah";
    return getDefaultAvatarForGender(gender, seed);
}
