#!/bin/bash
echo "🧹 Running Conservative Docker Cleanup for Ingetin..."

# 1. Remove all STOPPED containers 
# (Safe: This only removes containers that are not currently running)
docker container prune -f

# 2. Remove ONLY dangling images
# This keeps your pulled and built images safe even if they aren't currently attached to a container.
docker image prune -f

# 3. Remove all UNUSED volumes
# (Safe: This only removes volumes not connected to any container)
docker volume prune -f

# 4. Remove dangling build cache
docker builder prune -f

echo "✨ Cleanup complete. Tagged images, networks, and active containers were preserved."
