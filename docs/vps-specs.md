# 🖥️ VPS Specifications (Ingetin Deployment)

This document tracks the hardware specifications for the target VPS to ensure infrastructure configurations (Docker limits, DB buffers) are tuned correctly.

## 📊 System Information
- **Processor**: Intel(R) Xeon(R) Gold 6133 CPU @ 2.50GHz
- **CPU Cores**: 2 Cores @ 2494.140 MHz
- **RAM**: 2 GiB (Critical Limit)
- **Swap**: 2 GiB
- **Disk Space**: 40 GiB
- **Operating System**: Ubuntu 24.04.4 LTS
- **Kernel**: 6.8.0-107-generic
- **VM Type**: KVM
- **Network**: IPv4 Online / IPv6 Offline

---

## 🛠️ Recommended Infrastructure Tuning
Given the **1.7 GiB RAM** limit, the following Docker resource limits are applied to prevent OOM (Out Of Memory) crashes:

| Service | CPU Limit | Memory Limit | Notes |
| :--- | :--- | :--- | :--- |
| **Postgres** | 0.50 | 256MB | Shared buffers tuned to 128MB. |
| **Redis** | 0.25 | 128MB | Sufficient for OTP and simple queues. |
| **API Node** | 0.50 | 512MB | Production Node.js memory overhead. |
| **Nginx** | 0.10 | 64MB | Lightweight static serving. |
| **CF Tunnel** | 0.10 | 64MB | Cloudflared overhead. |
| **TOTAL** | **~1.45** | **~1.15GB** | Leaves ~500MB free for Ubuntu OS. |

> [!CAUTION]
> **Strict Memory Limits**: 1.7 GiB is relatively tight for a full stack. Ensure `SWAP` is active (1.9GB is already configured) to handle peak usage without killing the containers.
