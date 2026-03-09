from fastapi import Depends, Header, HTTPException, status

from app.core.security import decode_jwt_token


def get_current_user(authorization: str = Header(default="")) -> dict:
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
        )

    token = authorization.removeprefix("Bearer ").strip()
    payload = decode_jwt_token(token)
    return {
        "user_id": int(payload["sub"]),
        "username": payload.get("username", ""),
        "role": payload.get("role", "student"),
    }
