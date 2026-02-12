/**
 * ============================================================================
 * CONFIGURACIÓN GLOBAL
 * ============================================================================
 * Archivo: config.js
 * Descripción: Configuración centralizada de la aplicación
 * ============================================================================
 */

const APP_CONFIG = {
    // Información de la aplicación
    app: {
        name: 'PDF Merger - Offline Hardened',
        version: '2.0.0',
        author: 'Jsh',
        description: 'Fusiona múltiples PDFs de forma local y segura'
    },

    // Configuración del logger
    logger: {
        maxLogs: 5,                    // Máximo de logs visibles
        autoRemoveDelay: 10000,        // Tiempo antes de auto-remover (ms)
        persistErrors: true            // Los errores no se auto-remueven
    },

    // Configuración de procesamiento
    processing: {
        removeBlankPages: true,        // Eliminar páginas en blanco por defecto
        blankPageThreshold: 10,        // Caracteres mínimos para considerar no-vacía
        supportedFormats: ['.pdf', '.docx']
    },

    // Rutas de librerías locales
    libraries: {
        pdfLib: 'libs/pdf-lib.min.js',
        pdfJs: 'libs/pdf.min.js',
        pdfWorker: 'libs/pdf.worker.min.js',
        jsPdf: 'libs/jspdf.umd.min.js',
        mammoth: 'libs/mammoth.browser.min.js'
    },

    // Configuración de seguridad
    security: {
        blockFetch: true,
        blockXHR: true,
        blockWebSocket: true,
        blockExternalScripts: true,
        disableStorage: true
    },

    // Mensajes de la aplicación
    messages: {
        errors: {
            invalidFile: 'Por favor selecciona archivos PDF o DOCX válidos',
            noPdfToDownload: 'No hay PDF fusionado para descargar',
            processingError: 'Error procesando archivo',
            docxError: 'No se pudo procesar el archivo DOCX'
        },
        success: {
            filesLoaded: 'archivo(s) agregado(s)',
            pdfProcessed: 'fusionado correctamente',
            docxProcessed: 'convertido y fusionado',
            mergeComplete: '¡Fusión completada!',
            downloadStarted: 'Descarga iniciada'
        },
        info: {
            processing: 'Procesando',
            generating: 'Generando PDF final...',
            blankPagesSkipped: 'página(s) en blanco omitida(s)'
        }
    }
};

// Exportar configuración (si se usa módulos ES6)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APP_CONFIG;
}
