# Docker Pre-built Images Setup

Use GitHub Actions to build Docker images and run them locally without building on your root partition.

## The Problem

When running `docker compose up`, Docker builds images in the root partition (`/var/lib/docker`), which may have limited space. However, your containers run on the home partition which has plenty of space.

## The Solution

Use GitHub Actions to build the Docker images and push them to GitHub Container Registry (GHCR). Then, pull and run the pre-built images locally from a separate directory.

## Setup Steps

### 1. Push the GitHub Actions workflow

The workflow file `.github/workflows/docker-build.yml` has been created. Commit and push it to your fork:

```bash
git add .github/workflows/docker-build.yml server/docker-compose.prebuilt.yml server/DOCKER_PREBUILT.md
git commit -m "Add Docker image build workflow and pre-built compose config"
git push origin main
```

### 2. Enable GitHub Container Registry

1. Go to your fork on GitHub
2. Navigate to **Settings** → **Packages and features** → **Package settings**
3. Set package visibility to **Public** (or keep private if you prefer)
4. Ensure workflows have permission to write packages

### 3. Wait for the first build

Once pushed, the workflow will automatically build and push the Docker image. Monitor it at:
- **Actions** tab → **Build and Push Docker Image**

### 4. Set up your local directory

In your home directory where you keep compose files:

```bash
# Create your compose directory (if not exists)
mkdir -p ~/docker-compose-apps
cd ~/docker-compose-apps

# Shallow clone the repo
git clone --depth 1 https://github.com/YOUR_USERNAME/eigent.git
cd eigent/server
```

### 5. Configure and run

```bash
# Set your GitHub username (required)
export IMAGE_REGISTRY=your-github-username

# Optional: use specific tag instead of latest
# export IMAGE_TAG=sha-abc1234

# Pull and start services
docker compose -f docker-compose.prebuilt.yml pull
docker compose -f docker-compose.prebuilt.yml up -d
```

### 6. Verify it's working

```bash
# Check running containers
docker ps

# View logs
docker compose -f docker-compose.prebuilt.yml logs -f api

# Test health endpoint
curl http://localhost:3001/health
```

## Image Tags Available

The workflow creates multiple tags:
- `latest` - Latest build on main/master branch
- `main` or `master` - Branch name
- `sha-abc1234` - Specific commit SHA

To use a specific version:
```bash
export IMAGE_REGISTRY=your-github-username
export IMAGE_TAG=sha-abc1234  # Replace with actual SHA
docker compose -f docker-compose.prebuilt.yml pull
docker compose -f docker-compose.prebuilt.yml up -d
```

## Daily Usage Commands

```bash
cd ~/docker-compose-apps/eigent/server

# Start services
docker compose -f docker-compose.prebuilt.yml up -d

# View logs
docker compose -f docker-compose.prebuilt.yml logs -f

# Stop services
docker compose -f docker-compose.prebuilt.yml down

# Update to latest image
docker compose -f docker-compose.prebuilt.yml pull
docker compose -f docker-compose.prebuilt.yml up -d

# Restart specific service
docker compose -f docker-compose.prebuilt.yml restart api
```

## Updating the Image

When code changes are pushed:

1. GitHub Actions automatically rebuilds the image
2. On your local machine:
   ```bash
   cd ~/docker-compose-apps/eigent/server
   docker compose -f docker-compose.prebuilt.yml pull
   docker compose -f docker-compose.prebuilt.yml up -d
   ```

## Troubleshooting

### Permission denied when pulling
```bash
# Login to GHCR (required for private repos)
docker login ghcr.io -u YOUR_GITHUB_USERNAME
# Use GitHub Personal Access Token as password
```

### Image not found
Ensure:
1. Workflow completed successfully (check Actions tab)
2. Package visibility is set correctly in repository settings
3. `IMAGE_REGISTRY` environment variable is set correctly

### Wrong image name
The image name format is: `ghcr.io/OWNER/eigent/eigent-server:TAG`

Make sure `IMAGE_REGISTRY` matches your GitHub username exactly.

## Benefits

- **No local builds**: Saves space on root partition
- **Consistent images**: Same image everywhere
- **Multi-arch support**: Works on both AMD64 and ARM64
- **Cached builds**: GitHub Actions uses layer caching
- **Versioned images**: Each commit gets its own tag

## Comparison: Build vs Pre-built

| Aspect | docker-compose.yml (build) | docker-compose.prebuilt.yml (pull) |
|--------|---------------------------|-----------------------------------|
| Disk usage during setup | High (builds on root) | Low (just downloads) |
| Initial setup time | Slow (compiles) | Fast (downloads) |
| Update process | Rebuild locally | Pull new image |
| Storage location | Root partition | Home partition |

## Need to modify the image?

If you need to make code changes:

1. Edit the code in your fork
2. Push changes (triggers rebuild)
3. Wait for Actions to complete
4. Run `docker compose -f docker-compose.prebuilt.yml pull` locally

Or temporarily use local builds for development:
```bash
docker compose -f docker-compose.yml up --build
```
