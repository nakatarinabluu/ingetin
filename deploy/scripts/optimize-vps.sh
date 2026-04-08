#!/bin/bash
set -e

echo "🚀 Starting VPS Optimization for 2GB RAM environment..."

# 1. Create SWAP file (2GB)
if [ -f /swapfile ]; then
    echo "✅ Swap file already exists."
else
    echo "Creating 2GB Swap file..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✅ Swap file created and enabled."
fi

# 2. Adjust Swappiness (Make it use RAM first, then Swap)
echo "Setting swappiness to 10..."
sudo sysctl vm.swappiness=10
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf

# 3. Clean up Docker images and caches
echo "Cleaning up Docker..."
docker system prune -f
docker builder prune -a -f

echo "✨ VPS Optimization Complete!"
echo "Summary:"
echo "- 2GB Swap enabled (Total virtual memory: 4GB)"
echo "- Swappiness optimized for performance"
echo "- Docker caches cleaned"
