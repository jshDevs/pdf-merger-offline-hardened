# 📄 PDF Merger - Offline Hardened v2.0

> **Fusionador de PDFs 100% offline con arquitectura modular profesional y seguridad reforzada**

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/jshDevs/pdf-merger-offline-hardened)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Security](https://img.shields.io/badge/security-hardened-red.svg)]()
[![Offline](https://img.shields.io/badge/offline-100%25-orange.svg)]()

## ✨ Características Principales

✅ **100% Offline** - Procesamiento completamente local sin conexión a internet  
✅ **Arquitectura Modular** - Código organizado en módulos reutilizables  
✅ **Seguridad Reforzada** - Bloqueo de fetch, XHR, WebSocket y storage APIs  
✅ **Sistema de Logging Visual** - Notificaciones en tiempo real  
✅ **Soporte Multi-formato** - PDF y DOCX  
✅ **Eliminación de Páginas en Blanco** - Detección automática  
✅ **Drag & Drop** - Interfaz intuitiva de arrastrar y soltar  
✅ **Comentado Profesionalmente** - JSDoc completo en todas las funciones  

---

## 📋 Tabla de Contenidos

- [Arquitectura Modular](#-arquitectura-modular)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Módulos JavaScript](#-módulos-javascript)
- [Seguridad](#-seguridad)
- [Desarrollo](#-desarrollo)
- [Librerías Utilizadas](#-librerías-utilizadas)
- [Licencia](#-licencia)

---

## 🏛️ Arquitectura Modular

### Estructura del Proyecto

```
pdf-merger-offline-hardened/
├── index.html                    # HTML principal
├── css/
│   ├── main.css                  # Estilos base y layout
│   ├── components.css            # Componentes UI (dropzone, botones)
│   └── logging.css               # Sistema de notificaciones visuales
├── js/
│   ├── config.js                 # Configuración centralizada
│   ├── utils.js                  # Funciones utilitarias
│   ├── logger.js                 # Sistema de logging
│   ├── security-hardening.js     # Capa de seguridad
│   ├── file-handler.js           # Gestión de archivos
│   ├── pdf-processor.js          # Procesamiento de PDFs
│   └── ui-controller.js          # Controlador de interfaz
├── libs/                         # Librerías offline
│   ├── pdf-lib.min.js
│   ├── pdf.min.js
│   ├── pdf.worker.min.js
│   ├── jspdf.umd.min.js
│   └── mammoth.browser.min.js
└── scripts/                      # Scripts de utilidad
    ├── download-offline-libs.sh
    └── security-audit.sh
```

### Ventajas de la Arquitectura Modular

✅ **Separación de Responsabilidades** - Cada módulo tiene una función específica  
✅ **Mantenibilidad** - Fácil de encontrar y modificar código  
✅ **Testeable** - Módulos independientes probables por separado  
✅ **Escalable** - Agregar features sin modificar código existente  
✅ **Cacheo Optimizado** - Navegadores cachean módulos individualmente  
✅ **Debugging Simplificado** - Errores apuntan a archivos específicos  

---

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/jshDevs/pdf-merger-offline-hardened.git
cd pdf-merger-offline-hardened
```

### 2. Descargar Librerías Offline (si no están incluidas)

```bash
chmod +x scripts/download-offline-libs.sh
./scripts/download-offline-libs.sh
```

### 3. Abrir la Aplicación
```bash
# Opción 1: Abrir directamente en el navegador
open index.html  # macOS
xdg-open index.html  # Linux
start index.html  # Windows

# Opción 2: Usar servidor local (recomendado)
python3 -m http.server 8000
# Abrir http://localhost:8000 en el navegador
```

---

## 💻 Uso

### Pasos Básicos

1. **Seleccionar Archivos**
   - Arrastra archivos PDF/DOCX a la zona de arrastre
   - O haz clic para seleccionar archivos

2. **Configurar Opciones**
   - Marca/desmarca "Eliminar páginas en blanco"

3. **Fusionar**
   - Haz clic en "Unificar Documentos"
   - Observa el progreso en tiempo real

4. **Descargar**
   - Haz clic en "Descargar PDF"
   - El archivo fusionado se descargará automáticamente

### Interfaz Visual

- **Zona de Arrastre**: Área azul donde puedes soltar archivos
- **Lista de Archivos**: Muestra archivos seleccionados con tamaño
- **Barra de Progreso**: Indica el avance del procesamiento
- **Logs Visuales**: Notificaciones en la esquina inferior derecha

---

## 📦 Módulos JavaScript

### 1. `config.js` - Configuración Global

**Descripción**: Configuración centralizada de la aplicación.

**Contenido**:
- Información de la app (nombre, versión, autor)
- Configuración del logger
- Parámetros de procesamiento
- Rutas de librerías
- Opciones de seguridad
- Mensajes de la aplicación

**Ejemplo**:
```javascript
const APP_CONFIG = {
    app: {
        name: 'PDF Merger - Offline Hardened',
        version: '2.0.0'
    },
    processing: {
        removeBlankPages: true,
        blankPageThreshold: 10
    }
};
```

### 2. `utils.js` - Funciones Utilitarias

**Descripción**: Funciones de ayuda reutilizables.

**Funciones Principales**:
- `formatFileSize(bytes)` - Formatea tamaños de archivo
- `escapeHtml(text)` - Previene XSS
- `generateUniqueFilename()` - Genera nombres únicos
- `isValidFileType(filename)` - Valida extensiones
- `downloadBlob(blob, filename)` - Descarga archivos
- `debounce(func, wait)` - Limita frecuencia de ejecución

### 3. `logger.js` - Sistema de Logging

**Descripción**: Sistema de notificaciones visuales en tiempo real.

**Clase**: `SecurityLogger`

**Métodos**:
- `log(type, title, message)` - Registra un log
- `removeLog(id)` - Elimina un log específico
- `clear()` - Limpia todos los logs

**Tipos de Log**:
- `success` ✅ - Operaciones exitosas
- `error` ❌ - Errores
- `warning` ⚠️ - Advertencias
- `info` ℹ️ - Información
- `security` 🔒 - Eventos de seguridad

### 4. `security-hardening.js` - Capa de Seguridad

**Descripción**: Implementación de medidas de seguridad offline.

**Clase**: `SecurityHardening`

**Métodos Estáticos**:
- `init()` - Inicializa todas las protecciones
- `disableStorage()` - Bloquea localStorage/sessionStorage
- `blockFetch()` - Bloquea fetch() para URLs externas
- `blockXHR()` - Bloquea XMLHttpRequest externas
- `blockWebSocket()` - Bloquea WebSocket completamente
- `monitorElementCreation()` - Monitorea creación de elementos
- `verifyLibraries()` - Verifica que las librerías estén cargadas

### 5. `file-handler.js` - Manejador de Archivos

**Descripción**: Gestión de selección y validación de archivos.

**Clase**: `FileHandler`

**Métodos**:
- `addFiles(files)` - Agrega archivos a la lista
- `removeFile(index)` - Elimina un archivo
- `getFiles()` - Obtiene todos los archivos
- `clear()` - Limpia la lista
- `getInfo()` - Obtiene información resumida
- `render()` - Renderiza lista en el DOM

### 6. `pdf-processor.js` - Procesador de PDFs

**Descripción**: Lógica de fusión y procesamiento de documentos.

**Clase**: `PDFProcessor`

**Métodos**:
- `mergeFiles(files, removeBlank, callback)` - Fusiona archivos
- `_processPDF(file, removeBlank)` - Procesa un PDF
- `_processDOCX(file)` - Procesa un DOCX
- `_isPageBlank(file, pageIndex)` - Detecta páginas en blanco
- `downloadMergedPDF(filename)` - Descarga el resultado
- `getInfo()` - Obtiene info del PDF fusionado

### 7. `ui-controller.js` - Controlador de Interfaz

**Descripción**: Gestión de eventos y actualización de UI.

**Clase**: `UIController`

**Métodos**:
- `init()` - Inicializa eventos
- `handleFiles(files)` - Maneja selección de archivos
- `handleMerge()` - Inicia proceso de fusión
- `handleDownload()` - Descarga el PDF
- `showProgress(percentage)` - Actualiza barra de progreso
- `showStatus(message, type)` - Muestra mensajes de estado

---

## 🔒 Seguridad

### Medidas Implementadas

#### 1. **Content Security Policy (CSP)**
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; ...">
```

#### 2. **Bloqueo de Conexiones Externas**
- `fetch()` bloqueado para URLs http/https
- `XMLHttpRequest` bloqueado para URLs externas
- `WebSocket` completamente bloqueado

#### 3. **Deshabilitación de Storage**
- `localStorage` deshabilitado
- `sessionStorage` deshabilitado

#### 4. **Headers de Seguridad**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: no-referrer`

#### 5. **Monitoreo de Creación de Elementos**
- Scripts e iframes con src externa bloqueados
- Validación de atributos `src`

### Auditoria de Seguridad

```bash
chmod +x scripts/security-audit.sh
./scripts/security-audit.sh
```

---

## 👨‍💻 Desarrollo

### Requisitos

- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Servidor web local (opcional pero recomendado)

### Estructura de Desarrollo

```javascript
// 1. Modificar configuración en config.js
APP_CONFIG.processing.blankPageThreshold = 20;

// 2. Añadir funciones utilitarias en utils.js
Utils.newFunction = function() { ... };

// 3. Extender clases existentes
class PDFProcessor {
    newMethod() { ... }
}

// 4. Crear nuevos módulos siguiendo el patrón
```

### Convenciones de Código

✅ **JSDoc** en todas las funciones públicas  
✅ **CamelCase** para clases  
✅ **camelCase** para funciones y variables  
✅ **UPPER_CASE** para constantes  
✅ **Comentarios** descriptivos en secciones complejas  
✅ **Separadores visuales** en archivos largos  

### Testing

```bash
# Pruebas manuales recomendadas:
1. Fusionar 2-3 PDFs pequeños
2. Fusionar PDFs con páginas en blanco
3. Fusionar DOCX
4. Probar drag & drop
5. Verificar logs visuales
6. Revisar mensajes de error
```

---

## 📚 Librerías Utilizadas

| Librería | Versión | Propósito |
|----------|---------|----------|
| **pdf-lib** | Latest | Manipulación de PDFs |
| **pdf.js** | Latest | Lectura de PDFs (detección de páginas en blanco) |
| **jsPDF** | Latest | Generación de PDFs desde HTML |
| **mammoth.js** | Latest | Conversión de DOCX a HTML |

### Descarga de Librerías

Todas las librerías están incluidas localmente en `libs/` para funcionamiento 100% offline.

---

## 📝 Changelog

### v2.0.0 (2026-02-12)
- ✨ Refactorización completa en arquitectura modular
- ✨ Sistema de logging visual en tiempo real
- ✨ JSDoc completo en todos los módulos
- ✨ Configuración centralizada en config.js
- ✨ Separación de CSS en 3 archivos modulares
- ✨ Mejoras de seguridad y hardening
- ✨ Código profesionalmente comentado

### v1.0.0
- 🚀 Versión inicial monolítica
- ✅ Fusión básica de PDFs
- ✅ Seguridad offline

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📌 Roadmap

- [ ] Añadir soporte para más formatos (images, TXT)
- [ ] Implementar previsualización de PDFs
- [ ] Añadir marcas de agua
- [ ] Compresión de PDFs
- [ ] División de PDFs
- [ ] Encriptación de PDFs
- [ ] Tests unitarios automatizados
- [ ] PWA (Progressive Web App)

---

## 💬 Soporte

Si encuentras algún bug o tienes sugerencias:

- Abre un [Issue](https://github.com/jshDevs/pdf-merger-offline-hardened/issues)
- Envía un Pull Request

---

## 📜 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## ✨ Autor

**Jsh** - [jshDevs](https://github.com/jshDevs)

---

## 🚀 Estado del Proyecto

![Status](https://img.shields.io/badge/status-active-success.svg)
![Maintenance](https://img.shields.io/badge/maintained-yes-green.svg)
![Code Quality](https://img.shields.io/badge/code%20quality-A+-brightgreen.svg)

---

<div align="center">
  <p>👍 Si te gusta este proyecto, ¡dale una estrella! ⭐</p>
  <p>Hecho con ❤️ y JavaScript</p>
</div>
