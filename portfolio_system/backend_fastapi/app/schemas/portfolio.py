from datetime import date

from pydantic import BaseModel, Field

from app.schemas.project import ProjectInput, ProjectResponse, PublicProjectResponse


class SkillInput(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    category: str = Field(default="general", max_length=80)
    level: str = Field(default="intermediate", max_length=30)
    sort_order: int = 0


class SkillResponse(BaseModel):
    id: int
    name: str
    category: str
    level: str
    sort_order: int


class CertificateInput(BaseModel):
    title: str = Field(min_length=1, max_length=180)
    issuer: str = Field(default="", max_length=140)
    issue_date: date | None = None
    image_url: str | None = None
    certificate_url: str | None = None


class CertificateResponse(BaseModel):
    id: int
    title: str
    issuer: str
    issue_date: date | None
    image_url: str | None
    certificate_url: str | None


class SocialLinkInput(BaseModel):
    platform: str = Field(min_length=1, max_length=40)
    url: str = Field(min_length=1, max_length=500)


class SocialLinkResponse(BaseModel):
    id: int
    platform: str
    url: str


class PortfolioCreateRequest(BaseModel):
    slug: str = Field(min_length=3, max_length=120, pattern=r"^[a-z0-9-]+$")
    title: str = Field(default="", max_length=200)
    headline: str = Field(default="", max_length=240)
    bio: str = ""
    avatar_url: str | None = None
    cover_url: str | None = None
    visibility: str = Field(default="public", pattern=r"^(public|unlisted|private)$")
    is_published: bool = False
    projects: list[ProjectInput] = Field(default_factory=list)
    skills: list[SkillInput] = Field(default_factory=list)
    certificates: list[CertificateInput] = Field(default_factory=list)
    social_links: list[SocialLinkInput] = Field(default_factory=list)


class PortfolioUpdateRequest(BaseModel):
    slug: str | None = Field(default=None, min_length=3, max_length=120, pattern=r"^[a-z0-9-]+$")
    title: str | None = Field(default=None, max_length=200)
    headline: str | None = Field(default=None, max_length=240)
    bio: str | None = None
    avatar_url: str | None = None
    cover_url: str | None = None
    visibility: str | None = Field(default=None, pattern=r"^(public|unlisted|private)$")
    is_published: bool | None = None
    projects: list[ProjectInput] | None = None
    skills: list[SkillInput] | None = None
    certificates: list[CertificateInput] | None = None
    social_links: list[SocialLinkInput] | None = None


class PortfolioResponse(BaseModel):
    id: int
    user_id: int
    username: str
    slug: str
    title: str
    headline: str
    bio: str
    avatar_url: str | None
    cover_url: str | None
    visibility: str
    is_published: bool
    projects: list[ProjectResponse]
    skills: list[SkillResponse]
    certificates: list[CertificateResponse]
    social_links: list[SocialLinkResponse]


class PublicPortfolioResponse(BaseModel):
    username: str
    slug: str
    title: str
    headline: str
    bio: str
    avatar_url: str | None
    cover_url: str | None
    projects: list[PublicProjectResponse]
    skills: list[SkillResponse]
    certificates: list[CertificateResponse]
    social_links: list[SocialLinkResponse]


class UploadImageResponse(BaseModel):
    category: str
    file_name: str
    file_path: str
    public_url: str
