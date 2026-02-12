/**
 * ============================================================================
 * MANEJADOR DE ARCHIVOS
 * ============================================================================
 * Archivo: file-handler.js
 * Descripción: Gestión de selección y validación de archivos
 * ============================================================================
 */

class FileHandler {
    constructor() {
        this.selectedFiles = [];
        this.fileListElement = document.getElementById('fileList');
    }

    /**
     * Agrega archivos a la lista
     * @param {FileList} files - Archivos a agregar
     * @returns {number} Cantidad de archivos válidos agregados
     */
    addFiles(files) {
        const validFiles = this._validateFiles(files);

        if (validFiles.length === 0) {
            logger.log('error', 'Archivos Inválidos', 
                      APP_CONFIG.messages.errors.invalidFile);
            return 0;
        }

        this.selectedFiles = [...this.selectedFiles, ...validFiles];
        
        logger.log('success', 'Archivos Cargados', 
                  `${validFiles.length} ${APP_CONFIG.messages.success.filesLoaded}`);
        
        this.render();
        return validFiles.length;
    }

    /**
     * Valida archivos según formato permitido
     * @param {FileList} files - Archivos a validar
     * @returns {Array<File>} Archivos válidos
     */
    _validateFiles(files) {
        return Array.from(files).filter(file => {
            return Utils.isValidFileType(
                file.name, 
                APP_CONFIG.processing.supportedFormats
            );
        });
    }

    /**
     * Remueve un archivo por índice
     * @param {number} index - Índice del archivo
     */
    removeFile(index) {
        if (index >= 0 && index < this.selectedFiles.length) {
            const removedFile = this.selectedFiles[index];
            this.selectedFiles.splice(index, 1);
            
            logger.log('info', 'Archivo Eliminado', 
                      `${removedFile.name} removido de la lista`);
            
            this.render();
        }
    }

    /**
     * Renderiza la lista de archivos en el DOM
     */
    render() {
        if (!this.fileListElement) return;

        this.fileListElement.innerHTML = '';
        
        if (this.selectedFiles.length === 0) {
            return;
        }

        this.selectedFiles.forEach((file, index) => {
            const fileItem = this._createFileItemElement(file, index);
            this.fileListElement.appendChild(fileItem);
        });
    }

    /**
     * Crea el elemento DOM para un archivo
     * @param {File} file - Archivo
     * @param {number} index - Índice
     * @returns {HTMLElement} Elemento creado
     */
    _createFileItemElement(file, index) {
        const fileIcon = Utils.getFileIcon(file.name);
        const fileSize = Utils.formatFileSize(file.size);
        
        const html = `
            <div class="file-item">
                <div class="file-info">
                    <div class="file-icon">${fileIcon}</div>
                    <div class="file-details">
                        <div class="file-name">${Utils.escapeHtml(file.name)}</div>
                        <div class="file-size">${fileSize}</div>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="btn btn-danger" data-index="${index}">
                        🗑️ Eliminar
                    </button>
                </div>
            </div>
        `;
        
        const element = Utils.createElementFromHTML(html);
        
        // Agregar event listener al botón de eliminar
        const deleteBtn = element.querySelector('.btn-danger');
        deleteBtn.addEventListener('click', () => this.removeFile(index));
        
        return element;
    }

    /**
     * Obtiene todos los archivos seleccionados
     * @returns {Array<File>} Archivos seleccionados
     */
    getFiles() {
        return [...this.selectedFiles];
    }

    /**
     * Limpia todos los archivos
     */
    clear() {
        this.selectedFiles = [];
        this.render();
    }

    /**
     * Obtiene la cantidad de archivos
     * @returns {number} Cantidad de archivos
     */
    getCount() {
        return this.selectedFiles.length;
    }

    /**
     * Obtiene información resumida de los archivos
     * @returns {Object} Información de archivos
     */
    getInfo() {
        const totalSize = this.selectedFiles.reduce(
            (sum, file) => sum + file.size, 
            0
        );

        const filesByType = this.selectedFiles.reduce((acc, file) => {
            const ext = Utils.getFileExtension(file.name);
            acc[ext] = (acc[ext] || 0) + 1;
            return acc;
        }, {});

        return {
            count: this.selectedFiles.length,
            totalSize: totalSize,
            totalSizeFormatted: Utils.formatFileSize(totalSize),
            byType: filesByType
        };
    }
}

// Crear instancia global
const fileHandler = new FileHandler();
