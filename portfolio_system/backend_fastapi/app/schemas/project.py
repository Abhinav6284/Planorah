from pydantic import BaseModel, Field


class ProjectInput(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    short_description: str = Field(default="", max_length=280)
    description: str = ""
    github_url: str | None = None
    live_url: str | None = None
    image_url: str | None = None
    sort_order: int = 0


class ProjectResponse(BaseModel):
    id: int
    title: str
    short_description: str
    description: str
    github_url: str | None
    live_url: str | None
    image_url: str | None
    sort_order: int


class PublicProjectResponse(BaseModel):
    title: str
    short_description: str
    github_url: str | None
    live_url: str | None
    image_url: str | None
