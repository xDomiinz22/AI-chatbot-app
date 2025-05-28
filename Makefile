# Detectar sistema operativo
ifeq ($(OS),Windows_NT)
  PYTHON_SYS=python
  PIP=.venv\Scripts\pip.exe
  PYTHON=.venv\Scripts\python.exe
  UVICORN=.venv\Scripts\uvicorn.exe
  ACTIVATE_BACKEND=.\.venv\Scripts\Activate.ps1
  NPM=npm.cmd
else
  PYTHON_SYS=python3
  PIP=.venv/bin/pip
  PYTHON=python3
  UVICORN=.venv/bin/uvicorn
  ACTIVATE_BACKEND=source .venv/bin/activate
  NPM=npm
endif

# Venv

venv:
	$(PYTHON) -m venv .venv
	@echo "Entorno virtual '.venv' creado."
	@echo "Para activarlo en Windows (PowerShell):"
	@echo "    .\\.venv\\Scripts\\Activate.ps1"
	@echo "Para activarlo en Linux/macOS (bash):"
	@echo "    source .venv/bin/activate"

# Backend

install-backend: venv
	$(PIP) install --upgrade pip
	$(PIP) install -r backend/requirements.txt

run-backend:
	$(UVICORN) backend.backend:app --reload

# Frontend

install-frontend:
	cd frontend && $(NPM) install && $(NPM) install concurrently --save-dev

run-frontend:
	cd frontend && $(NPM) start

# Para correr backend y frontend simultáneamente
# Necesitas tener instalado 'concurrently' en frontend con:
# cd frontend && npm install concurrently --save-dev

run: install-backend install-frontend
	cd frontend && $(NPM) run dev

# Limpieza (opcional)

# clean:
# 	rm -rf .venv
# 	cd frontend && rm -rf node_modules

.PHONY: venv install-backend run-backend install-frontend run-frontend run-dev clean
