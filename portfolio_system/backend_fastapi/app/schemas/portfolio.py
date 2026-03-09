from pydantic import BaseModel, Field, HttpUrl


class PortfolioUpdateRequest(BaseModel):
    title: str = Field(default="", max_length=200)
    headline: str = Field(default="", max_length=240)
    bio: str = ""
    visibility: str = Field(default="public", pattern="^(public|unlisted|private)$")
    is_published: bool | None = None


class PresignUploadRequest(BaseModel):
    purpose: str = Field(pattern="^(profile_image|cover_image|project_image|certificate_image)$")
    file_name: str
    content_type: str
    size_bytes: int


class PresignUploadResponse(BaseModel):
    upload_url: str
    object_key: str
    public_cdn_url: str


class PublicProjectResponse(BaseModel):
    title: str
    short_description: str
    github_url: HttpUrl | None
    live_url: HttpUrl | None
    technologies: list[str]
    image_urls: list[str]


class PublicPortfolioResponse(BaseModel):
    username: str
    slug: str
    title: str
    headline: str
    bio: str
    profile_image_url: str | None
    cover_image_url: str | None
    skills: list[dict]
    projects: list[PublicProjectResponse]
    certificates: list[dict]
    social_links: list[dict]
    theme: dict
