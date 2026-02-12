/**
 * ============================================================================
 * CONTROLADOR DE INTERFAZ DE USUARIO
 * ============================================================================
 * Archivo: ui-controller.js
 * Descripción: Gestión de eventos y actualización de la interfaz
 * ============================================================================
 */

class UIController {
    constructor() {
        this.elements = {
            dropZone: document.getElementById('dropZone'),
            fileInput: document.getElementById('fileInput'),
            mergeBtn: document.getElementById('mergeBtn'),
            downloadBtn: document.getElementById('downloadBtn'),
            progressContainer: document.getElementById('progressContainer'),
            progressBar: document.getElementById('progressBar'),
            statusMessage: document.getElementById('statusMessage'),
            removeBlankPagesCheckbox: document.getElementById('removeBlankPages')
        };

        this.init();
    }

    /**
     * Inicializa eventos de la interfaz
     */
    init() {
        this._setupDropZoneEvents();
        this._setupButtonEvents();
        this.updateMergeButton();
        
        logger.log('info', 'Interfaz Iniciada', 'Todos los controles listos');
    }

    /**
     * Configura eventos de la zona de arrastre
     */
    _setupDropZoneEvents() {
        const { dropZone, fileInput } = this.elements;

        // Click en zona de arrastre
        dropZone.addEventListener('click', () => fileInput.click());

        // Drag over
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        // Drag leave
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        // Drop
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
    }

    /**
     * Configura eventos de botones
     */
    _setupButtonEvents() {
        const { mergeBtn, downloadBtn } = this.elements;

        mergeBtn.addEventListener('click', () => this.handleMerge());
        downloadBtn.addEventListener('click', () => this.handleDownload());
    }

    /**
     * Maneja la selección de archivos
     * @param {FileList} files - Archivos seleccionados
     */
    handleFiles(files) {
        const added = fileHandler.addFiles(files);
        
        if (added > 0) {
            this.updateMergeButton();
            this.showStatus(
                `${added} archivo(s) agregado(s)`, 
                'success'
            );
        } else {
            this.showStatus(
                APP_CONFIG.messages.errors.invalidFile, 
                'error'
            );
        }
    }

    /**
     * Maneja el proceso de fusión
     */
    async handleMerge() {
        const files = fileHandler.getFiles();
        
        if (files.length === 0) {
            this.showStatus('No hay archivos para fusionar', 'error');
            return;
        }

        const removeBlank = this.elements.removeBlankPagesCheckbox.checked;
        
        this.elements.mergeBtn.disabled = true;
        this.elements.downloadBtn.style.display = 'none';
        this.showProgress(0);
        this.showStatus('Iniciando proceso de fusión...', 'info');

        try {
            await pdfProcessor.mergeFiles(
                files, 
                removeBlank,
                (progress, filename, current, total) => {
                    this.showProgress(progress);
                    this.showStatus(
                        `${APP_CONFIG.messages.info.processing}: ${filename} (${current}/${total})`, 
                        'info'
                    );
                }
            );

            this.showProgress(100);
            this.showStatus(
                `✅ ${APP_CONFIG.messages.success.mergeComplete} ${files.length} archivo(s) procesado(s)`, 
                'success'
            );
            
            this.elements.downloadBtn.style.display = 'inline-block';
            
        } catch (error) {
            this.showStatus(`❌ Error: ${error.message}`, 'error');
            this.elements.mergeBtn.disabled = false;
        }
    }

    /**
     * Maneja la descarga del PDF
     */
    handleDownload() {
        pdfProcessor.downloadMergedPDF();
        this.showStatus(APP_CONFIG.messages.success.downloadStarted, 'success');
    }

    /**
     * Actualiza el estado del botón de fusión
     */
    updateMergeButton() {
        const hasFiles = fileHandler.getCount() > 0;
        this.elements.mergeBtn.disabled = !hasFiles;
    }

    /**
     * Muestra la barra de progreso
     * @param {number} percentage - Porcentaje (0-100)
     */
    showProgress(percentage) {
        const { progressContainer, progressBar } = this.elements;
        
        progressContainer.style.display = 'block';
        progressBar.style.width = percentage + '%';
        progressBar.textContent = Math.round(percentage) + '%';
        
        if (percentage === 100) {
            setTimeout(() => {
                progressContainer.style.display = 'none';
            }, 2000);
        }
    }

    /**
     * Muestra un mensaje de estado
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo (success, error, info, warning)
     */
    showStatus(message, type) {
        const { statusMessage } = this.elements;
        
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        statusMessage.style.display = 'block';
        
        if (type !== 'info') {
            setTimeout(() => {
                statusMessage.style.display = 'none';
            }, 5000);
        }
    }

    /**
     * Limpia la interfaz
     */
    reset() {
        fileHandler.clear();
        pdfProcessor.reset();
        this.updateMergeButton();
        this.elements.downloadBtn.style.display = 'none';
        this.elements.progressContainer.style.display = 'none';
        this.elements.statusMessage.style.display = 'none';
    }
}

// Inicializar cuando el DOM esté listo
let uiController;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        uiController = new UIController();
    });
} else {
    uiController = new UIController();
}
