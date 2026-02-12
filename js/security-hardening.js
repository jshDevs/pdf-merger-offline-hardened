/**
 * ============================================================================
 * CAPA DE SEGURIDAD Y HARDENING
 * ============================================================================
 * Archivo: security-hardening.js
 * Descripción: Implementación de medidas de seguridad offline
 * ============================================================================
 */

class SecurityHardening {
    /**
     * Inicializa todas las medidas de seguridad
     */
    static init() {
        this.disableStorage();
        this.blockFetch();
        this.blockXHR();
        this.blockWebSocket();
        this.monitorElementCreation();
        
        logger.log('security', 'Sistema de Seguridad', 'Todas las protecciones activadas');
    }

    /**
     * Deshabilita localStorage y sessionStorage
     */
    static disableStorage() {
        if (!APP_CONFIG.security.disableStorage) return;

        try {
            Object.defineProperty(window, 'localStorage', {
                get: function() { return null; },
                set: function() {},
                configurable: false
            });
            
            Object.defineProperty(window, 'sessionStorage', {
                get: function() { return null; },
                set: function() {},
                configurable: false
            });
            
            logger.log('security', 'Storage Bloqueado', 
                      'localStorage y sessionStorage deshabilitados');
        } catch(e) {
            logger.log('warning', 'Storage Warning', 
                      'No se pudo deshabilitar storage APIs completamente');
        }
    }

    /**
     * Bloquea fetch() para URLs externas
     */
    static blockFetch() {
        if (!APP_CONFIG.security.blockFetch) return;

        const originalFetch = window.fetch;
        
        window.fetch = function(...args) {
            const url = args[0];
            
            if (SecurityHardening._isExternalURL(url)) {
                const shortUrl = url.substring(0, 50) + '...';
                logger.log('security', 'Fetch Bloqueado', 
                          `Intento bloqueado: ${shortUrl}`);
                return Promise.reject(
                    new Error('Conexiones externas bloqueadas por política de seguridad')
                );
            }
            
            return originalFetch.apply(this, args);
        };
        
        logger.log('security', 'Fetch Protegido', 
                  'fetch() bloqueado para URLs externas');
    }

    /**
     * Bloquea XMLHttpRequest para URLs externas
     */
    static blockXHR() {
        if (!APP_CONFIG.security.blockXHR) return;

        const originalOpen = XMLHttpRequest.prototype.open;
        
        XMLHttpRequest.prototype.open = function(method, url, ...args) {
            if (SecurityHardening._isExternalURL(url)) {
                const shortUrl = url.substring(0, 50) + '...';
                logger.log('security', 'XHR Bloqueado', 
                          `XMLHttpRequest bloqueado: ${shortUrl}`);
                throw new Error('Conexiones externas bloqueadas por política de seguridad');
            }
            
            return originalOpen.apply(this, [method, url, ...args]);
        };
        
        logger.log('security', 'XHR Protegido', 
                  'XMLHttpRequest bloqueado para URLs externas');
    }

    /**
     * Bloquea WebSocket completamente
     */
    static blockWebSocket() {
        if (!APP_CONFIG.security.blockWebSocket) return;

        const OriginalWebSocket = window.WebSocket;
        
        window.WebSocket = function(url, ...args) {
            logger.log('security', 'WebSocket Bloqueado', 
                      `Intento de conexión bloqueado: ${url}`);
            throw new Error('WebSocket bloqueado por política de seguridad');
        };
        
        logger.log('security', 'WebSocket Protegido', 
                  'Conexiones WebSocket bloqueadas');
    }

    /**
     * Monitorea creación de elementos para bloquear scripts/iframes externos
     */
    static monitorElementCreation() {
        if (!APP_CONFIG.security.blockExternalScripts) return;

        const originalCreateElement = document.createElement;
        
        document.createElement = function(tagName, ...args) {
            const element = originalCreateElement.apply(document, [tagName, ...args]);
            
            // Interceptar scripts e iframes
            if (tagName.toLowerCase() === 'script' || tagName.toLowerCase() === 'iframe') {
                const originalSetAttribute = element.setAttribute;
                
                element.setAttribute = function(name, value) {
                    if (name === 'src' && SecurityHardening._isExternalURL(value)) {
                        logger.log('security', 'Elemento Bloqueado', 
                                  `${tagName} con src externa bloqueado`);
                        throw new Error('No se permiten recursos externos');
                    }
                    return originalSetAttribute.apply(this, [name, value]);
                };
            }
            
            return element;
        };
    }

    /**
     * Verifica si una URL es externa
     * @param {string} url - URL a verificar
     * @returns {boolean} true si es externa
     */
    static _isExternalURL(url) {
        if (typeof url !== 'string') return false;
        return url.startsWith('http://') || url.startsWith('https://');
    }

    /**
     * Configura el worker de PDF.js desde archivo local
     */
    static configurePDFWorker() {
        if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = APP_CONFIG.libraries.pdfWorker;
            logger.log('success', 'PDF.js Configurado', 
                      `Worker: ${APP_CONFIG.libraries.pdfWorker}`);
        }
    }

    /**
     * Verifica que todas las librerías estén cargadas
     * @returns {Object} Estado de cada librería
     */
    static verifyLibraries() {
        const status = {
            'pdf-lib': typeof PDFLib !== 'undefined',
            'pdf.js': typeof pdfjsLib !== 'undefined',
            'jspdf': typeof jspdf !== 'undefined',
            'mammoth': typeof mammoth !== 'undefined'
        };

        const allLoaded = Object.values(status).every(v => v);
        
        if (allLoaded) {
            logger.log('success', 'Librerías Verificadas', 
                      'Todas las librerías cargadas correctamente');
        } else {
            const missing = Object.entries(status)
                .filter(([_, loaded]) => !loaded)
                .map(([name, _]) => name)
                .join(', ');
            logger.log('error', 'Librerías Faltantes', 
                      `No cargadas: ${missing}`);
        }

        return status;
    }
}

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        SecurityHardening.init();
        SecurityHardening.configurePDFWorker();
        SecurityHardening.verifyLibraries();
    });
} else {
    SecurityHardening.init();
    SecurityHardening.configurePDFWorker();
    SecurityHardening.verifyLibraries();
}
