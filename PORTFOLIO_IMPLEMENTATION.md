# Portfolio & GitHub Integration - Implementation Guide

## Overview

This document outlines the complete implementation of the Portfolio and GitHub Integration system for the Planorah platform. The system enables students to:

1. Upload and manage custom projects
2. Automatically publish projects to GitHub
3. Display projects on a public portfolio
4. Track GitHub repository statistics

## Architecture

### Backend Structure

```
backend/
├── roadmap_ai/
│   ├── models.py (StudentProject model)
│   ├── serializers.py (StudentProject serializers)
│   ├── views.py (StudentProjectViewSet)
│   └── urls.py (student-projects endpoint)
├── portfolio/
│   ├── models.py (Portfolio, PortfolioProject)
│   ├── serializers.py (Portfolio serializers)
│   └── views.py (Portfolio CRUD + project management)
└── github_integration/
    ├── models.py (GitHubCredential, GitHubRepository)
    ├── serializers.py (GitHub serializers)
    └── views.py (OAuth, publish, sync_stats)
```

### Frontend Structure

```
frontend/src/
├── api/
│   ├── projectService.js (Student projects API)
│   ├── portfolioService.js (Portfolio API)
│   └── githubService.js (GitHub API)
└── components/
    └── Portfolio/
        ├── ProjectManager.jsx (Project CRUD UI)
        └── PortfolioEditor.jsx (Portfolio settings + projects display)
```

## Database Models

### StudentProject

Stores custom student-uploaded projects:

```python
class StudentProject(models.Model):
    user = ForeignKey(User)
    title = CharField(max_length=255)
    description = TextField()
    tech_stack = JSONField(default=list)
    source_type = CharField(choices=['upload', 'git_url', 'manual'])
    git_url = URLField(blank=True, null=True)
    github_url = URLField(blank=True, null=True)  # After GitHub push
    live_demo_url = URLField(blank=True, null=True)
    visibility = CharField(choices=['public', 'private'])
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

### PortfolioProject (Updated)

Links projects to portfolios, supports both roadmap and student projects:

```python
class PortfolioProject(models.Model):
    portfolio = ForeignKey(Portfolio)
    project_type = CharField(choices=['roadmap', 'student'])
    project = ForeignKey(Project, null=True, blank=True)
    student_project = ForeignKey(StudentProject, null=True, blank=True)
    order = IntegerField(default=0)
    is_featured = BooleanField(default=False)
    is_visible = BooleanField(default=True)
    custom_title = CharField(max_length=255, blank=True)
    custom_description = TextField(blank=True)
```

### GitHubRepository (Updated)

Tracks GitHub repositories with stats:

```python
class GitHubRepository(models.Model):
    user = ForeignKey(User)
    project_type = CharField(choices=['roadmap', 'student'])
    project = OneToOneField(Project, null=True, blank=True)
    student_project = OneToOneField(StudentProject, null=True, blank=True)
    repo_name = CharField(max_length=100)
    repo_full_name = CharField(max_length=200)
    repo_url = URLField()
    is_private = BooleanField(default=False)
    stars_count = IntegerField(default=0)
    forks_count = IntegerField(default=0)
    watchers_count = IntegerField(default=0)
    last_commit_date = DateTimeField(null=True, blank=True)
    last_commit_message = TextField(blank=True)
    last_synced_at = DateTimeField(null=True, blank=True)
```

## API Endpoints

### Student Projects

```
GET    /api/roadmap/student-projects/          # List all projects
POST   /api/roadmap/student-projects/          # Create project
GET    /api/roadmap/student-projects/{id}/     # Get project
PATCH  /api/roadmap/student-projects/{id}/     # Update project
DELETE /api/roadmap/student-projects/{id}/     # Delete project
GET    /api/roadmap/student-projects/stats/    # Get statistics
```

### Portfolio

```
GET    /api/portfolio/my_portfolio/                    # Get user portfolio
PATCH  /api/portfolio/update_settings/                 # Update portfolio
POST   /api/portfolio/add_project/                     # Add project to portfolio
       Body: { project_id, project_type: 'roadmap'|'student' }
POST   /api/portfolio/remove_project/                  # Remove from portfolio
       Body: { project_id, project_type: 'roadmap'|'student' }
GET    /api/portfolio/public/{slug}/                   # Public portfolio view
```

### GitHub Integration

```
GET    /api/github/status/                     # Check connection status
POST   /api/github/connect/                    # Connect GitHub account
       Body: { code, redirect_uri? }
POST   /api/github/disconnect/                 # Disconnect GitHub
POST   /api/github/publish/                    # Publish project to GitHub
       Body: {
         project_id,
         project_type: 'roadmap'|'student',
         repo_name?,
         is_private: false,
         commit_message?
       }
GET    /api/github/repositories/               # List published repos
POST   /api/github/sync_stats/                 # Sync GitHub stats
       Body: { repo_id? }
```

## Features Implemented

### 1. Student Project Management

✅ **CRUD Operations**
- Create, read, update, delete student projects
- Support for manual entry, Git URL, and file uploads
- Tech stack tagging
- Public/private visibility settings

✅ **Project Types**
- Manual entry (just metadata)
- Git URL reference
- File upload (prepared for future implementation)

### 2. GitHub Auto-Push

✅ **Core Functionality**
- OAuth authentication (not password-based)
- Repository creation via GitHub API
- Auto-generated README.md with project details
- Support for public/private repositories
- Works with both roadmap and student projects

✅ **README Generation**
- Includes project title and description
- Lists tech stack
- Adds Planorah attribution
- Placeholder sections for setup and license

✅ **Error Handling**
- Prevents duplicate publications
- Validates GitHub connection
- Provides detailed error messages

### 3. Portfolio Integration

✅ **Project Sources**
- Roadmap projects (from AI-generated roadmaps)
- Student-uploaded projects
- GitHub-linked projects

✅ **Display Features**
- Project title and description
- Tech stack badges
- GitHub links
- Featured/visible flags
- Custom overrides for title/description

✅ **Management**
- Add/remove projects from portfolio
- Reorder projects (via order field)
- Mark projects as featured
- Toggle visibility

### 4. GitHub Stats Syncing

✅ **Stats Tracked**
- Stars count
- Forks count
- Watchers count
- Last commit date
- Last commit message

✅ **Sync Endpoint**
- Manual sync trigger
- Fetches data from GitHub API
- Updates repository model
- Tracks sync errors

### 5. Frontend UI

✅ **Project Manager** (`/projects`)
- Grid view of all projects
- Create/edit project modal
- Delete with confirmation
- GitHub publish dialog
- Add to portfolio button
- GitHub connection status

✅ **Portfolio Editor** (`/portfolio/edit`)
- Display all portfolio projects
- Show tech stack and GitHub links
- Link to project manager
- Empty state with call-to-action

## User Workflows

### Workflow 1: Create and Publish a Project

1. **Navigate to Projects**
   - User goes to `/projects`
   - Sees list of existing projects or empty state

2. **Create New Project**
   - Clicks "New Project"
   - Fills in form:
     - Title (required)
     - Description (required)
     - Tech stack (comma-separated)
     - Live demo URL (optional)
     - Visibility (public/private)
   - Clicks "Create Project"

3. **Publish to GitHub**
   - Clicks "Push to GitHub" on project card
   - If not connected, prompted to connect GitHub
   - Enters repository name (auto-generated from title)
   - Chooses public/private
   - Clicks "Publish to GitHub"
   - System:
     - Creates repository on GitHub
     - Generates and pushes README.md
     - Updates project with GitHub URL
     - Shows success message

4. **Add to Portfolio**
   - Clicks "Add to Portfolio"
   - Project appears on portfolio editor
   - Portfolio automatically updates

### Workflow 2: View Portfolio

1. **Public Access**
   - Anyone visits `planorah.me/p/{slug}`
   - Sees portfolio with all visible projects
   - Projects show:
     - Title and description
     - Tech stack
     - GitHub link (if published)
     - Demo link (if provided)

2. **Portfolio States**
   - Active: Full access, all features
   - Grace: Full access during grace period
   - Read-only: Limited info, no resume downloads
   - Archived: Not publicly accessible

## Security Considerations

### Implemented

✅ **GitHub OAuth**
- Uses OAuth flow, not passwords
- Tokens stored securely in backend
- Never exposed to frontend

✅ **User Verification**
- Projects owned by user check
- Portfolio access control
- Subscription-based permissions

✅ **Input Validation**
- Project data validation
- URL validation
- Tech stack sanitization

### Recommended Future Enhancements

⚠️ **Rate Limiting**
- Add rate limits to GitHub API calls
- Throttle project creation
- Limit sync_stats frequency

⚠️ **File Upload Security**
- Virus scanning for uploads
- File type validation
- Size limits
- Sandboxed execution

## Testing

### Manual Testing Checklist

#### Student Projects
- [ ] Create a project with all fields
- [ ] Create a project with minimal fields
- [ ] Edit a project
- [ ] Delete a project
- [ ] View project list

#### GitHub Integration
- [ ] Connect GitHub account
- [ ] Publish roadmap project
- [ ] Publish student project
- [ ] Check repository was created
- [ ] Verify README.md content
- [ ] Try to publish same project twice (should fail)
- [ ] Disconnect GitHub account
- [ ] Sync GitHub stats

#### Portfolio
- [ ] Add roadmap project to portfolio
- [ ] Add student project to portfolio
- [ ] Remove project from portfolio
- [ ] View public portfolio
- [ ] Check GitHub links work
- [ ] Verify tech stack displays

## Known Limitations

1. **File Uploads**
   - Backend models support file uploads
   - File upload UI not yet implemented
   - Need to add file handling and storage

2. **.gitignore Generation**
   - Not yet implemented
   - README mentions it but doesn't generate

3. **Code Push**
   - Currently only pushes README.md
   - Doesn't push actual project files
   - Future: Need to implement full code push workflow

4. **GitHub Stats Auto-Refresh**
   - Manual sync only
   - No automatic background sync
   - Could add periodic job

## Future Enhancements

### High Priority

1. **File Upload Support**
   - ZIP file upload
   - Folder upload via browser API
   - Extract and store files

2. **Full Code Push**
   - Push actual project files to GitHub
   - Generate .gitignore based on tech stack
   - Handle binary files properly

3. **Portfolio Themes**
   - Multiple portfolio templates
   - Custom CSS support
   - Preview before publish

### Medium Priority

4. **GitHub Webhooks**
   - Auto-sync on push events
   - Update stats in real-time
   - Show build status

5. **Project Templates**
   - Starter templates for common stacks
   - Quick-start projects
   - Boilerplate code

6. **Collaboration**
   - Share projects with other users
   - Team portfolios
   - Project forks

### Low Priority

7. **GitHub Pages Deployment**
   - Auto-deploy to GitHub Pages
   - Custom domain support
   - SSL certificates

8. **Advanced Analytics**
   - Track portfolio views
   - Project click tracking
   - Referrer data

## Troubleshooting

### Common Issues

**Issue: "GitHub not connected"**
- Solution: Go to Settings → GitHub and connect account
- Check: Valid OAuth credentials in backend settings

**Issue: "Project already published to GitHub"**
- Solution: Each project can only be published once
- Workaround: Create a new repository manually or delete the GitHubRepository record

**Issue: "Failed to create repository"**
- Check: Repository name is valid (alphanumeric + hyphens)
- Check: Repository name doesn't already exist
- Check: GitHub token has repo creation scope

**Issue: "Portfolio not showing projects"**
- Check: Projects are marked as visible
- Check: Portfolio status is not 'archived'
- Check: Projects are added to portfolio (not just created)

## Deployment Notes

### Environment Variables Required

```bash
# Backend
SECRET_KEY=your-django-secret-key
GITHUB_OAUTH_CLIENT_ID=your-github-client-id
GITHUB_OAUTH_CLIENT_SECRET=your-github-client-secret
GITHUB_OAUTH_REDIRECT_URI=https://yourapp.com/github/callback
```

### Database Migrations

```bash
# Run these migrations in order
python manage.py migrate roadmap_ai 0010_studentproject
python manage.py migrate portfolio 0002_remove_portfolioproject_unique_portfolio_project_and_more
python manage.py migrate github_integration 0002_githubrepository_forks_count_and_more
```

### GitHub OAuth Setup

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL to your redirect URI
4. Note Client ID and Client Secret
5. Add to environment variables

## API Documentation Updates

The following endpoints have been added/updated:

### New Endpoints
- `/api/roadmap/student-projects/` - Student project CRUD
- `/api/github/sync_stats/` - Sync GitHub repository stats

### Updated Endpoints
- `/api/portfolio/add_project/` - Now accepts `project_type` parameter
- `/api/portfolio/remove_project/` - Now accepts `project_type` parameter
- `/api/github/publish/` - Now accepts `project_type` parameter

### Response Format Changes
- `PortfolioProject` serializer now includes `project_type` and both project references
- `GitHubRepository` serializer now includes stats fields
- Portfolio serializer includes `portfolio_projects` with expanded data

## Conclusion

This implementation provides a solid foundation for student project management and GitHub integration. The core functionality is complete and ready for use:

✅ Students can create and manage projects
✅ Projects can be published to GitHub automatically
✅ Portfolios display all project types
✅ GitHub stats are tracked and synced

The system is designed to be extensible, with clear pathways for adding file uploads, advanced GitHub features, and portfolio customization in the future.
