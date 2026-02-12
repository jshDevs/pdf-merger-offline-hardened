/**
 * ============================================================================
 * FUNCIONES UTILITARIAS
 * ============================================================================
 * Archivo: utils.js
 * Descripción: Funciones de ayuda reutilizables
 * ============================================================================
 */

const Utils = {
    /**
     * Formatea el tamaño de un archivo en formato legible
     * @param {number} bytes - Tamaño en bytes
     * @returns {string} Tamaño formateado (ej: "1.5 MB")
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    },

    /**
     * Escapa caracteres HTML para prevenir XSS
     * @param {string} text - Texto a escapar
     * @returns {string} Texto escapado
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Genera un nombre de archivo único con timestamp
     * @param {string} prefix - Prefijo del archivo
     * @param {string} extension - Extensión del archivo
     * @returns {string} Nombre de archivo único
     */
    generateUniqueFilename(prefix = 'documento', extension = 'pdf') {
        const timestamp = Date.now();
        const date = new Date().toISOString().split('T')[0];
        return `${prefix}_${date}_${timestamp}.${extension}`;
    },

    /**
     * Valida si un archivo tiene una extensión permitida
     * @param {string} filename - Nombre del archivo
     * @param {Array} allowedExtensions - Extensiones permitidas
     * @returns {boolean} true si es válido
     */
    isValidFileType(filename, allowedExtensions = APP_CONFIG.processing.supportedFormats) {
        const extension = '.' + filename.split('.').pop().toLowerCase();
        return allowedExtensions.includes(extension);
    },

    /**
     * Obtiene la extensión de un archivo
     * @param {string} filename - Nombre del archivo
     * @returns {string} Extensión (con punto)
     */
    getFileExtension(filename) {
        return '.' + filename.split('.').pop().toLowerCase();
    },

    /**
     * Crea un elemento HTML a partir de una cadena
     * @param {string} htmlString - String HTML
     * @returns {HTMLElement} Elemento creado
     */
    createElementFromHTML(htmlString) {
        const div = document.createElement('div');
        div.innerHTML = htmlString.trim();
        return div.firstChild;
    },

    /**
     * Debounce: Limita la frecuencia de ejecución de una función
     * @param {Function} func - Función a ejecutar
     * @param {number} wait - Tiempo de espera en ms
     * @returns {Function} Función con debounce
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Descarga un blob como archivo
     * @param {Blob} blob - Blob a descargar
     * @param {string} filename - Nombre del archivo
     */
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    /**
     * Obtiene el icono emoji según el tipo de archivo
     * @param {string} filename - Nombre del archivo
     * @returns {string} Emoji del icono
     */
    getFileIcon(filename) {
        const extension = this.getFileExtension(filename);
        const icons = {
            '.pdf': '📄',
            '.docx': '📝',
            '.doc': '📝',
            '.txt': '📃'
        };
        return icons[extension] || '📄';
    },

    /**
     * Formatea un timestamp para mostrar
     * @param {number} timestamp - Timestamp en ms
     * @returns {string} Fecha formateada
     */
    formatTimestamp(timestamp) {
        return new Date(timestamp).toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    },

    /**
     * Espera un tiempo determinado (para async/await)
     * @param {number} ms - Milisegundos a esperar
     * @returns {Promise} Promise que se resuelve después del tiempo
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Exportar si se usan módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
