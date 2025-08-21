# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Primary Development Commands
- **Backend development**: `npm run dev` (with hot reload using Node.js watch mode)
- **Frontend development**: `cd frontend && npm run dev` (Vite dev server)
- **Production build**: 
  - Backend: `npm start`
  - Frontend: `cd frontend && npm run build`
- **Linting**: 
  - Backend: `npx eslint .`
  - Frontend: `cd frontend && npm run lint`

### Docker Development
- **Start all services**: `docker-compose up -d`
- **View logs**: `docker-compose logs -f` (specific service: `docker-compose logs -f backend`)
- **Rebuild and restart**: `docker-compose up --build -d`
- **Stop services**: `docker-compose down`
- **Service health check**: `docker-compose ps`

### AI Model Management
- **Install AI model**: `docker exec -it ollama_service ollama pull gemma3:1b`
- **List installed models**: `docker exec -it ollama_service ollama list`
- **Alternative models**: `docker exec -it ollama_service ollama pull llama3:8b`

### Testing and Quality
- **Run single test**: Not implemented (no test framework configured)
- **Python image service tests**: `docker-compose exec python python -c "import torch; print('OK')"`

## Architecture Overview

This is a multi-service AI-powered product generator application that creates commercial content for products: descriptions, images, and customer comments.

### Core Architecture Pattern
The backend follows **Clean Architecture** principles with clear separation:
- **Adapters Layer**: Controllers (`src/adapters/controllers/`) and Routers (`src/adapters/routers/`)
- **Use Cases Layer**: Business logic (`src/usecases/`)
- **Infrastructure Layer**: External services (`src/infrastructure/services/`)
- **Utils Layer**: Shared utilities (`src/utils/`)

### Service Architecture
- **Backend API** (Node.js/Express): Main orchestrator handling REST API endpoints
- **Ollama Service**: Local AI model server for text generation (LLM inference)
- **Python Image Service**: Stable Diffusion service for image generation
- **Frontend**: React SPA with Vite build system
- **Nginx**: Reverse proxy serving frontend and routing API calls

### Key Components

#### Backend (Node.js)
- **Express.js** with ES Modules (type: "module")
- **Zod** for request validation
- **OpenAI-compatible client** for Ollama communication
- **CORS** enabled for cross-origin requests
- Routes organized by feature: `/api/chat`, `/api/images`, `/api/comments`

#### Python Image Generator
- **Stable Diffusion** pipeline with GPU/CPU auto-detection
- **Model flexibility**: SDXL and SD 1.5/2.x support
- **Memory optimization**: Attention slicing, CPU offloading for large models
- **Metadata tracking**: JSON files with generation parameters and results

#### Frontend (React)
- **React Router** for SPA navigation
- **Axios** for API communication
- **React Hot Toast** for notifications
- **Lucide React** for icons
- **SCSS** for styling

### Data Flow Architecture
1. **Text Generation**: Frontend → Node.js API → Ollama → AI Model → Response
2. **Image Generation**: Frontend → Node.js API → Python Service → Stable Diffusion → Image Files + Metadata
3. **File Serving**: Secure file serving through Express with path validation and caching headers

## Development Patterns

### Error Handling Pattern
- Use `CustomError` class for consistent error responses
- Controllers return structured JSON responses: `{ success: boolean, error?: string, message?: string, data?: any }`
- Validation errors return arrays of error messages

### File Organization Pattern
- Controllers handle HTTP concerns only
- Use cases contain business logic
- Services handle external integrations
- Utils provide shared functionality

### API Response Pattern
All API responses follow consistent structure:
```json
{
  "success": true|false,
  "message": "Human readable message",
  "data": {...} | "error": "ErrorCode"
}
```

### Configuration Pattern
- Environment variables with defaults in config files
- Service URLs configurable via environment (OLLAMA_URL, PYTHON_SERVICE_URL)
- Model selection via MODEL_NAME environment variable

## Key Technical Details

### AI Model Integration
- **Ollama** provides OpenAI-compatible API for local LLM inference
- Default model: `gemma3:1b` (lightweight, fast)
- Models auto-pulled on container startup via dedicated service
- Responses parsed as JSON using custom `parseJSONByIA` utility

### Image Generation Pipeline
- **Multi-model support**: Automatic fallback from SDXL to SD 1.5 if needed
- **GPU optimization**: Float16, attention slicing, CPU offloading
- **Style system**: 12 predefined promotional styles for marketing images
- **Session tracking**: 8-character session IDs for metadata correlation

### Security Considerations
- **Path traversal protection**: Resolved paths validated against allowed directories
- **File access validation**: `fs.access()` checks before serving files
- **CORS policy**: Currently allows all origins (consider restricting in production)

### Performance Optimizations
- **Image caching**: 1-hour cache headers for served images
- **Memory management**: Explicit garbage collection in Python service
- **GPU memory**: Optimizations for 8GB VRAM constraint
- **Health checks**: All services have health monitoring

## Environment Variables

Essential environment variables for development:
- `NODE_ENV`: Set to "development" for detailed logging
- `API_PORT`: Backend port (default: 3000)
- `OLLAMA_URL`: Ollama service URL (default: http://ollama:11434)
- `MODEL_NAME`: AI model to use (default: gemma3:1b)
- `PYTHON_SERVICE_URL`: Image generation service URL (default: http://python:8000)
- `VITE_API_URL`: Frontend API base URL (default: http://localhost:3000/api)

## Common Development Tasks

### Adding New API Endpoints
1. Create controller in `src/adapters/controllers/`
2. Add route in `src/adapters/routers/`
3. Implement use case in `src/usecases/`
4. Add validation schema if needed
5. Update API documentation in frontend

### Modifying AI Prompts
- System and user prompts are in use case files
- Follow existing pattern: structured system prompts with clear instructions
- Use temperature 0.7 for creative tasks, lower for factual content

### Adding New Image Styles
- Update `estilos_promocionales` dictionary in `python_image_generator/image_generator.py`
- Style names should be lowercase and descriptive
- Include specific photography terms for better AI understanding

### Database Integration
- Currently no database - metadata stored as JSON files
- For persistence, consider adding service to architecture pattern
- Image files stored in `python_image_generator/imagenes_consumibles/`
- Metadata stored in `python_image_generator/metadata/`

When working with this codebase, respect the clean architecture patterns and maintain the separation of concerns between the different layers and services.
