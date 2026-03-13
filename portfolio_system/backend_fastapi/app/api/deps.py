from fastapi import Header, HTTPException, status

from app.core.security import decode_jwt_token


def get_current_user(authorization: str = Header(default="")) -> dict:
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
        )

    token = authorization.removeprefix("Bearer ").strip()
    payload = decode_jwt_token(token)

    raw_user_id = payload.get("sub", payload.get("user_id"))
    try:
        user_id = int(raw_user_id)
    except (TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        ) from exc

    return {
        "user_id": user_id,
        "username": payload.get("username") or payload.get("preferred_username") or "",
        "email": payload.get("email") or "",
        "role": payload.get("role", "student"),
    }
