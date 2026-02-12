/**
 * ============================================================================
 * SISTEMA DE LOGGING
 * ============================================================================
 * Archivo: logger.js
 * Descripción: Manejo centralizado de logs y notificaciones visuales
 * ============================================================================
 */

class SecurityLogger {
    /**
     * Constructor del logger
     * @param {number} maxLogs - Número máximo de logs visibles
     */
    constructor(maxLogs = 5) {
        this.maxLogs = maxLogs;
        this.logs = [];
        this.container = document.getElementById('logContainer');
        
        if (!this.container) {
            console.error('Log container not found');
        }
    }

    /**
     * Registra un nuevo log
     * @param {string} type - Tipo de log (success, error, warning, info, security)
     * @param {string} title - Título del log
     * @param {string} message - Mensaje detallado
     */
    log(type, title, message) {
        const timestamp = new Date().toLocaleTimeString('es-ES');
        const log = { 
            type, 
            title, 
            message, 
            timestamp, 
            id: Date.now() + Math.random() // ID único
        };
        
        // Agregar al inicio del array
        this.logs.unshift(log);
        
        // Mantener solo las últimas N logs
        if (this.logs.length > this.maxLogs) {
            const removedLog = this.logs.pop();
            this.removeLogFromDOM(removedLog.id);
        }
        
        // Renderizar en DOM
        this.renderLog(log);
        
        // También loguear en consola
        this._logToConsole(type, title, message);
    }

    /**
     * Renderiza un log en el DOM
     * @param {Object} log - Objeto log a renderizar
     */
    renderLog(log) {
        const logElement = document.createElement('div');
        logElement.className = `log-item log-${log.type}`;
        logElement.id = `log-${log.id}`;
        
        const icon = this._getIcon(log.type);
        
        logElement.innerHTML = `
            <div class="log-icon">${icon}</div>
            <div class="log-content">
                <div class="log-title">${this._escapeHtml(log.title)}</div>
                <div class="log-message">${this._escapeHtml(log.message)}</div>
                <div class="log-time">${log.timestamp}</div>
            </div>
            <div class="log-close" onclick="logger.removeLog(${log.id})">×</div>
        `;
        
        this.container.insertBefore(logElement, this.container.firstChild);
        
        // Auto-remover después de N segundos (excepto errores)
        if (log.type !== 'error') {
            setTimeout(() => this.removeLog(log.id), APP_CONFIG.logger.autoRemoveDelay);
        }
    }

    /**
     * Remueve un log por ID
     * @param {number} id - ID del log a remover
     */
    removeLog(id) {
        const index = this.logs.findIndex(log => log.id === id);
        if (index !== -1) {
            this.logs.splice(index, 1);
        }
        this.removeLogFromDOM(id);
    }

    /**
     * Remueve un log del DOM con animación
     * @param {number} id - ID del log a remover
     */
    removeLogFromDOM(id) {
        const element = document.getElementById(`log-${id}`);
        if (element) {
            element.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => element.remove(), 300);
        }
    }

    /**
     * Obtiene el icono según el tipo de log
     * @param {string} type - Tipo de log
     * @returns {string} Emoji del icono
     */
    _getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            security: '🔒'
        };
        return icons[type] || '📝';
    }

    /**
     * Escapa HTML para prevenir XSS
     * @param {string} text - Texto a escapar
     * @returns {string} Texto escapado
     */
    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Loguea en consola del navegador
     * @param {string} type - Tipo de log
     * @param {string} title - Título
     * @param {string} message - Mensaje
     */
    _logToConsole(type, title, message) {
        const consoleMethod = type === 'error' ? 'error' : 
                             type === 'warning' ? 'warn' : 
                             type === 'security' ? 'warn' : 'log';
        console[consoleMethod](`[${type.toUpperCase()}] ${title}: ${message}`);
    }

    /**
     * Limpia todos los logs
     */
    clear() {
        this.logs = [];
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Crear instancia global del logger
let logger;

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        logger = new SecurityLogger(APP_CONFIG.logger.maxLogs);
    });
} else {
    logger = new SecurityLogger(APP_CONFIG.logger.maxLogs);
}
