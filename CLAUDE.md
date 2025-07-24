# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an OnlyOffice integration project that demonstrates how to embed and interact with OnlyOffice Document Server for document editing capabilities. The project focuses on programmatically inserting content into documents through various APIs.

## Development Environment Setup

### OnlyOffice Document Server Deployment
The project requires OnlyOffice Document Server to be running locally:

```bash
# Deploy using Docker
docker run -i -t -d -p 80:80 --restart=always \
  -v /app/onlyoffice/DocumentServer/logs:/var/log/onlyoffice \
  -v /app/onlyoffice/DocumentServer/data:/var/www/onlyoffice/Data \
  onlyoffice/documentserver
```

### Local Development
- OnlyOffice Document Server should be accessible at `http://localhost`
- The API script is loaded from `http://localhost/web-apps/apps/api/documents/api.js`
- Document callback URL is typically `http://localhost/callback`

## Architecture

### Core Components

1. **HTML Integration Layer**: Basic HTML pages that embed the OnlyOffice editor using the DocsAPI
2. **Document Builder API**: Server-side API for programmatic document manipulation
3. **Editor Events System**: Client-side event handling for real-time document operations
4. **Backend API Integration**: Node.js/Express endpoints for content insertion operations
5. **WebSocket Support**: Real-time content synchronization capabilities

### Key Integration Patterns

- **DocsAPI.DocEditor**: Main entry point for embedding the editor
- **Document Builder Scripts**: JavaScript code executed within the document context for content manipulation
- **Event-driven Architecture**: Uses editor events like `onDocumentReady` and `onRequestInsertImage`
- **API Methods**: `executeMethod()` for running Document Builder scripts
- **Real-time Updates**: WebSocket integration for live content insertion

## Common Development Tasks

### Testing Document Integration
Since this is a documentation/integration project, testing involves:
- Verifying OnlyOffice Document Server is running
- Testing HTML pages load the editor correctly
- Confirming API methods execute Document Builder scripts successfully

### Content Insertion Methods
The project supports multiple approaches:
- Direct Document Builder API calls
- Event-driven content insertion
- Server-side API endpoints
- Real-time WebSocket-based updates

## Key Files and Structure

- `README.md`: Comprehensive Chinese documentation with code examples
- HTML files: Basic editor integration examples
- JavaScript files: Document Builder API implementations and editor event handlers
- Backend files: Node.js/Express API endpoints for document operations

## Important Notes

- Document keys must be unique for each document session
- Content insertion requires proper Document Builder API syntax
- Real-time features depend on WebSocket connections
- Image insertion requires accessible URLs for the OnlyOffice server
- All API operations are asynchronous and should handle callbacks appropriately

## Mathematical Formula Rendering Guidelines

- **NEVER use Unicode mathematical symbols** for formula conversion
- **Text content**: Use normal `Api.CreateRun().AddText()` method for regular text
- **Mathematical formulas**: Use `AddMathEquation()` method exclusively for LaTeX expressions
- Keep mathematical formulas in their original LaTeX format when using `AddMathEquation()`
- Maintain inline rendering to prevent line breaks between text and formulas
- Do not convert LaTeX to Unicode symbols - use the native OnlyOffice math rendering instead