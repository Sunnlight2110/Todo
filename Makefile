.PHONY: help up down build logs logs-backend logs-frontend restart clean ps shell

help:
	@echo "FastAPI + React Docker Development Commands"
	@echo "============================================"
	@echo ""
	@echo "Usage: make [command]"
	@echo ""
	@echo "Commands:"
	@echo "  up              - Start all services in foreground"
	@echo "  up-bg           - Start all services in background"
	@echo "  down            - Stop all services"
	@echo "  build           - Build/rebuild Docker images"
	@echo "  logs            - View logs from all services"
	@echo "  logs-backend    - View backend logs"
	@echo "  logs-frontend   - View frontend logs"
	@echo "  restart         - Restart all services"
	@echo "  restart-backend - Restart backend only"
	@echo "  restart-frontend- Restart frontend only"
	@echo "  ps              - List running containers"
	@echo "  clean           - Remove containers, volumes, and images"
	@echo "  shell-backend   - Open shell in backend container"
	@echo "  shell-frontend  - Open shell in frontend container"
	@echo "  health          - Show health status of services"
	@echo ""

up:
	docker-compose up

up-bg:
	docker-compose up -d
	@echo "Services started in background"
	@echo "Frontend: http://localhost:5173"
	@echo "Backend: http://localhost:8000"

down:
	docker-compose down

build:
	docker-compose build

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

restart:
	docker-compose restart
	@echo "All services restarted"

restart-backend:
	docker-compose restart backend
	@echo "Backend restarted"

restart-frontend:
	docker-compose restart frontend
	@echo "Frontend restarted"

ps:
	docker-compose ps

clean:
	docker-compose down -v
	docker-compose rm -f
	@echo "Cleaned up all containers and volumes"

shell-backend:
	docker-compose exec backend bash

shell-frontend:
	docker-compose exec frontend sh

health:
	@echo "Checking service health..."
	@docker-compose exec backend curl -s http://localhost:8000/ > /dev/null && echo "✓ Backend is healthy" || echo "✗ Backend is down"
	@docker-compose exec frontend wget -q -O- http://localhost:5173/ > /dev/null && echo "✓ Frontend is healthy" || echo "✗ Frontend is down"
