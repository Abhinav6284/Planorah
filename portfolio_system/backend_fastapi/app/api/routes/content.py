from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import Certificate, Portfolio, PortfolioSkill, Project, Skill, SocialLink

router = APIRouter(prefix="/portfolios/me", tags=["portfolio-content"])


@router.get("/projects")
def list_projects(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == current_user["user_id"]).first()
    if not portfolio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")
    return [{"id": p.id, "title": p.title, "short_description": p.short_description} for p in portfolio.projects]


@router.post("/projects")
def create_project(
    title: str,
    short_description: str = "",
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == current_user["user_id"]).first()
    if not portfolio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")

    project = Project(portfolio_id=portfolio.id, title=title, short_description=short_description)
    db.add(project)
    db.commit()
    db.refresh(project)
    return {"id": project.id, "title": project.title}


@router.delete("/projects/{project_id}")
def delete_project(project_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == current_user["user_id"]).first()
    project = db.query(Project).filter(Project.id == project_id, Project.portfolio_id == portfolio.id).first() if portfolio else None
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    db.delete(project)
    db.commit()
    return {"ok": True}


@router.get("/skills")
def list_skills(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == current_user["user_id"]).first()
    if not portfolio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")
    result = []
    for row in portfolio.skills:
        if row.skill:
            result.append({"id": row.id, "name": row.skill.name, "category": row.skill.category, "level": row.level})
    return result


@router.post("/skills")
def add_skill(
    name: str,
    category: str = "general",
    level: str = "intermediate",
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == current_user["user_id"]).first()
    if not portfolio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")
    skill = db.query(Skill).filter(Skill.name == name).first()
    if not skill:
        skill = Skill(name=name, category=category)
        db.add(skill)
        db.flush()
    link = PortfolioSkill(portfolio_id=portfolio.id, skill_id=skill.id, level=level)
    db.add(link)
    db.commit()
    return {"ok": True}


@router.get("/certificates")
def list_certificates(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == current_user["user_id"]).first()
    if not portfolio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")
    return [{"id": c.id, "title": c.title, "issuer": c.issuer} for c in portfolio.certificates]


@router.post("/certificates")
def add_certificate(
    title: str,
    issuer: str = "",
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == current_user["user_id"]).first()
    if not portfolio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")
    certificate = Certificate(portfolio_id=portfolio.id, title=title, issuer=issuer)
    db.add(certificate)
    db.commit()
    return {"ok": True}


@router.get("/social-links")
def list_social_links(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == current_user["user_id"]).first()
    if not portfolio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")
    return [{"id": s.id, "platform": s.platform, "url": s.url} for s in portfolio.social_links]


@router.post("/social-links")
def add_social_link(
    platform: str,
    url: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == current_user["user_id"]).first()
    if not portfolio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")
    social = SocialLink(portfolio_id=portfolio.id, platform=platform, url=url)
    db.add(social)
    db.commit()
    return {"ok": True}
