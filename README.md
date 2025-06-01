# Proyecto Chatbot React + Backend

Este proyecto incluye un backend en Python y un frontend en React.  
Aquí encontrarás instrucciones claras para configurar y ejecutar el proyecto en Windows y Linux/macOS.

---

## 1. Crear el entorno virtual (venv)

Para aislar las dependencias del proyecto, crea un entorno virtual con Python 3.12.

Ejecuta este comando en la raíz del proyecto:

```bash
python3.12 -m venv .venv
```

> ⚠️ **Nota:** Asegúrate de tener Python 3.12 instalado y disponible como `python312` en tu PATH.

---

## 2. Activar el entorno virtual

Debes activar el entorno virtual para que las instalaciones y ejecuciones usen el Python y pip de `.venv`.

### En Windows (PowerShell)

```powershell
.\.venv\Scripts\Activate.ps1
```

### En Linux/macOS (bash o zsh)

```bash
source .venv/bin/activate
```

---

## 3. Instalar las dependencias del backend

Con el entorno virtual activado, instala las librerías necesarias:

```bash
pip install -r requirements.txt
```

Este archivo contiene las dependencias del backend.

---

## 4. Configurar la API Key de Gemini (Google AI)

Para que el backend pueda usar la API de Gemini, necesitas obtener una clave de API gratuita desde Google AI Studio.

Pasos:

1. Ve a Google AI Studio.

2. Inicia sesión con tu cuenta de Google (puedes usar una cuenta personal).

3. En la barra lateral izquierda, haz clic en "Get API Key" o visita directamente console.cloud.google.com.

4. Crea un proyecto nuevo (o usa uno existente).

5. Activa la API de Gemini API desde la consola.

6. En el menú de navegación, ve a APIs y servicios > Credenciales.

7. Haz clic en Crear credenciales > Clave de API.

8. Copia tu clave generada.

El archivo `default-env` debe tener una línea así:

```env
GEMINI_API_KEY=tu_clave_aqui
```

Reemplaza `tu_clave_aqui` con tu api_key real.

---

## 5. Ejecutar el backend

Abre una terminal nueva, activa el entorno virtual (paso 2), y ejecuta:

### En Windows

```powershell
.venv\Scripts\uvicorn.exe backend.api.app:app --reload --host "127.0.0.1" --port 8000
```

### En Linux/macOS

```bash
.venv/bin/uvicorn backend.api.app:app --reload --host "127.0.0.1" --port 8000
```

Esto arrancará el servidor backend con recarga automática para desarrollo.

---

## 6. Ejecutar el frontend

Abre otra terminal y navega a la carpeta `frontend`:

```bash
cd frontend
```

Luego instala las dependencias (si no lo hiciste antes):

```bash
npm install
```

Finalmente, ejecuta el frontend con:

```bash
npm start
```

Esto abrirá la app en tu navegador automáticamente o te mostrará la dirección (normalmente `http://localhost:3000`) para que accedas manualmente.

---

¡Listo! Ahora tienes el backend y frontend corriendo simultáneamente y conectados.

---

Si encuentras algún problema o tienes dudas, no dudes en preguntar.

---

## Extra. Formateo de código

Se utiliza black formatter y flake8 para el código.

Se recomienda ejecutar el siguiente comando desde la raíz del proyecto:

```bash
black . --preview --line-length 120
```

Para corregir errores de formato, utilizar el atajo de teclado `Ctrl + Shift + I`.
