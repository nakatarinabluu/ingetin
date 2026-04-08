#!/bin/bash
set -e

# --- 🚀 INGETIN: SENIOR VPS PROVISIONING SCRIPT ---
# Optimized for: 2vCPUs, 2GB RAM, 40GB SSD
# --------------------------------------------------

echo "🔥 Initializing Production Environment for Ingetin..."

# 1. System Updates & Essential Tools
echo "📦 Updating OS and installing system tools..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw htop tree build-essential jq

# 2. Safety Net: 4GB Swap File (Crucial for 2GB RAM VPS)
if [ ! -f /swapfile ]; then
    echo "🧠 Creating 4GB Swap File to prevent Out-of-Memory crashes..."
    sudo fallocate -l 4G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✅ Swap configured."
else
    echo "ℹ️ Swap file already exists. Skipping."
fi

# 3. Docker & Docker Compose (Plugin)
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker Engine..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker installed."
fi

# 4. Firewall Setup (UFW)
echo "🛡️ Configuring Firewall (UFW)..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP (Nginx/Traefik)
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 4000/tcp    # API (Optional: better to keep private)
sudo ufw allow 8080/tcp    # Frontend (Optional)
echo "y" | sudo ufw enable
echo "✅ Firewall active."

# 5. Node.js 20 (LTS) & Global Tools for CI/CD
if ! command -v node &> /dev/null; then
    echo "🟢 Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

echo "🛠️ Installing Global CLI Tools (Turbo, Prisma)..."
sudo npm install -g npm@latest turbo prisma

# 6. Global Docker Network (Shared across Infrastructure & Apps)
echo "🌐 Creating 'ingetin-network'..."
docker network create ingetin-network 2>/dev/null || echo "ℹ️ Network already exists."

# 7. Create Persistence Directories (Ensures Docker has write permissions)
echo "📁 Preparing data directories..."
mkdir -p deploy/data/{postgres,redis}
sudo chown -R $USER:$USER deploy/data/

# 8. Performance Tuning: Increase File Limits (Important for WebSockets)
echo "⚡ Increasing file descriptor limits..."
echo "* soft nofile 65535" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65535" | sudo tee -a /etc/security/limits.conf

echo ""
echo "--------------------------------------------------------"
echo "✅ PROVISIONING COMPLETE!"
echo "--------------------------------------------------------"
echo "👉 ACTION REQUIRED: Run 'newgrp docker' or log out/in."
echo "👉 NEXT STEP: Deploy Infrastructure from 'orchestration/infrastructure/'"
echo "--------------------------------------------------------"
