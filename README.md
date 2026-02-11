# 🔒 PDF Merger Offline Hardened

**Herramienta de fusión de PDFs 100% offline con máximo hardening de seguridad**

Aplicación web completamente local para fusionar, manipular y procesar documentos PDF sin conexión a internet. Diseñada con máxima seguridad, privacidad y auditoría completa.

---

## ✨ Características

### Seguridad Máxima
- **100% Offline**: Sin CDN, sin conexión a internet
- **Content Security Policy (CSP)**: Bloqueo de recursos externos
- **Fetch/XHR Blocking**: Conexiones externas completamente bloqueadas
- **Storage Disabled**: Sin localStorage, sessionStorage ni cookies
- **SHA256 Checksums**: Verificación de integridad de librerías
- **Sin Tracking**: Cero analytics, sin telemetría

### Funcionalidades
- Fusión de múltiples PDFs en un solo documento
- Eliminación automática de páginas en blanco (opcional)
- Soporte para archivos DOCX (conversión a PDF)
- Procesamiento completamente local en el navegador
- Sin límites de tamaño o cantidad de archivos

---

## 🚀 Inicio Rápido (5 minutos)

### 1. Clonar el repositorio

```bash
git clone https://github.com/jshDevs/pdf-merger-offline-hardened.git
cd pdf-merger-offline-hardened
```

### 2. Descargar librerías locales

```bash
bash download-offline-libs.sh
```

Esto descargará 5 librerías JavaScript desde CDNJS y las almacenará localmente en la carpeta `libs/`.

### 3. Verificar integridad

```bash
cd libs
./verify.sh
```

Debe mostrar que todos los archivos son `OK`.

### 4. Auditoría de seguridad (opcional)

```bash
cd ..
bash security-audit.sh
```

### 5. Usar la aplicación

```bash
# Opción A: Abrir directamente
open pdf-merger-offline-hardened.html

# Opción B: Servidor local
python3 -m http.server 8000
# Luego abrir: http://localhost:8000/pdf-merger-offline-hardened.html
```

---

## 📁 Estructura del Proyecto

```
pdf-merger-offline-hardened/
├── README.md                           ← Este archivo
├── QUICKSTART-HARDENING.md             ← Guía rápida (5 min)
├── HARDENING-TOTAL-GUIA-COMPLETA.md    ← Documentación completa
├── pdf-merger-offline-hardened.html    ← Aplicación principal
├── download-offline-libs.sh            ← Script de descarga
├── security-audit.sh                   ← Script de auditoría
└── libs/                               ← Librerías locales (después de ejecutar script)
    ├── pdf-lib.min.js
    ├── pdf.min.js
    ├── pdf.worker.min.js
    ├── jspdf.umd.min.js
    ├── mammoth.browser.min.js
    ├── .checksum
    ├── README.txt
    └── verify.sh
```

---

## 🔐 Garantías de Seguridad

| Característica | Estado | Verificación |
|----------------|--------|---------------|
| **Librerías Locales** | ✅ | `ls libs/` |
| **Sin CDN** | ✅ | Network Tab (F12) |
| **Sin Internet** | ✅ | `fetch()` bloqueado |
| **CSP Activo** | ✅ | DevTools Console |
| **Storage Deshabilitado** | ✅ | `localStorage === null` |
| **Sin Tracking** | ✅ | Network Monitor |
| **Integridad SHA256** | ✅ | `./verify.sh` |
| **Código Auditable** | ✅ | Código fuente |

---

## 📚 Documentación

- **[QUICKSTART-HARDENING.md](QUICKSTART-HARDENING.md)**: Guía de inicio rápido en 5 minutos
- **[HARDENING-TOTAL-GUIA-COMPLETA.md](HARDENING-TOTAL-GUIA-COMPLETA.md)**: Documentación técnica completa sobre arquitectura de seguridad, auditorías y protección contra amenazas

---

## 🛡️ Niveles de Protección

### Nivel 1: Content Security Policy (CSP)
- Bloqueo de carga de recursos externos
- Whitelist solo para archivos locales
- Respaldado por el navegador

### Nivel 2: JavaScript Hardening
- `fetch()` bloqueado para URLs externas
- `XMLHttpRequest` bloqueado para URLs externas
- `localStorage`/`sessionStorage` deshabilitados
- Logging exhaustivo de intentos

### Nivel 3: Validaciones
- Validación de tipos de archivo
- Validación de tamaños
- Escapado de HTML
- Verificación de integridad

### Nivel 4: Privacidad
- Sin almacenamiento persistente
- Sin cookies
- Sin analytics ni tracking
- Datos solo en memoria
- Limpieza al cerrar navegador

---

## 🔍 Verificación de Seguridad

### En DevTools Console (F12)

```javascript
// 1. Verificar que localStorage está deshabilitado
window.localStorage === null  // Debe ser: true

// 2. Verificar bloqueo de conexiones externas
fetch('https://google.com').catch(e => console.log(e.message))
// Debe mostrar: "Conexiones externas bloqueadas"

// 3. Verificar librerías cargadas
typeof PDFLib !== 'undefined' && 
typeof pdfjsLib !== 'undefined' && 
typeof jspdf !== 'undefined'
// Debe ser: true
```

### En Network Tab (F12)

- **Cero conexiones** a CDN o dominios externos
- Solo carga de recursos locales: `file://` o `localhost`

---

## 🎯 Casos de Uso

- **Fusión de documentos confidenciales** sin exponerlos a internet
- **Entornos corporativos** con restricciones de red
- **Máxima privacidad** para datos sensibles
- **Auditorías de seguridad** y compliance
- **Ambientes air-gapped** (sin conexión)
- **Educación** sobre seguridad web

---

## 🧪 Testing y Auditoría

### Script de Auditoría Automática

```bash
bash security-audit.sh
```

Verifica:
- ✅ Existencia de librerías locales
- ✅ Integridad SHA256 de archivos
- ✅ Ausencia de URLs externas en HTML
- ✅ Configuración CSP
- ✅ Permisos de archivos
- ✅ Estructura del proyecto

### Modo Paranoia Máxima

Para garantizar 0% de posibilidad de conexión:

```bash
# 1. Desconectar WiFi
# 2. Desconectar Ethernet
# 3. Desactivar Bluetooth
# 4. Abrir aplicación
# 5. ¡Imposible conectarse a internet!
```

---

## 🌍 Tecnologías Utilizadas

- **[pdf-lib](https://pdf-lib.js.org/)** (v1.17.1) - Manipulación de PDFs
- **[PDF.js](https://mozilla.github.io/pdf.js/)** (v3.11.174) - Lectura de PDFs
- **[jsPDF](https://github.com/parallax/jsPDF)** (v2.5.1) - Generación de PDFs
- **[Mammoth.js](https://github.com/mwilliamson/mammoth.js)** (v1.6.0) - Conversión DOCX
- **Vanilla JavaScript** - Sin frameworks externos

---

## 📋 Requisitos

- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Bash shell (para scripts de instalación)
- `curl` (para descarga de librerías)
- `sha256sum` (para verificación de integridad)

---

## 🚨 Advertencias

- **NO** modificar archivos en `libs/` manualmente
- **SIEMPRE** ejecutar `verify.sh` después de descargar
- **NUNCA** cargar librerías de fuentes no confiables
- **VERIFICAR** checksums antes de usar en producción

---

## 🤝 Contribuciones

Contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

### Guías de Contribución

- Mantener el principio de **cero conexiones externas**
- Documentar cambios de seguridad exhaustivamente
- Incluir tests y verificaciones
- Actualizar checksums si se modifican librerías

---

## 📝 Licencia

MIT License - Ver archivo [LICENSE](LICENSE) para detalles

---

## 🙏 Agradecimientos

- Proyecto inspirado en la necesidad de máxima privacidad y seguridad
- Comunidad de desarrollo de herramientas de seguridad
- Desarrolladores de las librerías open-source utilizadas

---

## 📞 Contacto

**Autor**: Jsh  
**GitHub**: [@jshDevs](https://github.com/jshDevs)  
**Ubicación**: El Salvador

---

## 🔗 Links Útiles

- [Documentación Completa](HARDENING-TOTAL-GUIA-COMPLETA.md)
- [Inicio Rápido](QUICKSTART-HARDENING.md)
- [Repositorio GitHub](https://github.com/jshDevs/pdf-merger-offline-hardened)
- [Reporte de Issues](https://github.com/jshDevs/pdf-merger-offline-hardened/issues)

---

<div align="center">

## ⭐ Si te resulta útil, ¡dale una estrella!

### 🔒 **100% Offline • Máxima Seguridad • Cero Tracking**

**Version**: 1.0.0  
**Status**: ✅ PRODUCTION READY

</div>
