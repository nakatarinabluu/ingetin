.PHONY: help install dev build test lint db-generate docker-up docker-down clean setup infra-up infra-down env-init

# --- CONFIGURATION ---
DOCKER_COMPOSE=./docker-compose.yml

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install all dependencies
	npm install

dev: ## Start development environment via Turbo
	npm run dev

build: ## Build all packages and apps
	npm run build

test: ## Run all tests across the monorepo
	npx turbo run test

lint: ## Run linting and static analysis
	npx turbo run lint

db-generate: ## Generate Prisma client for all apps
	npx turbo run generate

docker-up: ## Spin up all infrastructure and applications (Consolidated)
	docker compose -f $(DOCKER_COMPOSE) up -d --build

docker-down: ## Shut down all containers
	docker compose -f $(DOCKER_COMPOSE) down

infra-up: ## Spin up only infrastructure (Postgres, Redis)
	docker compose -f $(DOCKER_COMPOSE) up -d postgres redis pgbouncer

infra-down: ## Shut down only infrastructure
	docker compose -f $(DOCKER_COMPOSE) stop postgres redis pgbouncer

clean: ## Clean up node_modules and build artifacts (CAUTION: Re-install needed after)
	find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
	find . -name "dist" -type d -prune -exec rm -rf '{}' +
	find . -name ".turbo" -type d -prune -exec rm -rf '{}' +

env-init: ## Initialize environment from example
	@if [ ! -f .env ]; then cp .env.example .env && echo ".env created from .env.example. Please update secrets."; else echo ".env already exists."; fi

setup: install db-generate env-init ## Full project setup
	@echo "Project setup complete. Run 'make dev' to start."
