/**
 * ============================================================================
 * PROCESADOR DE PDFs
 * ============================================================================
 * Archivo: pdf-processor.js
 * Descripción: Lógica de fusión y procesamiento de documentos PDF/DOCX
 * ============================================================================
 */

class PDFProcessor {
    constructor() {
        this.mergedPdf = null;
        this.mergedPdfBytes = null;
    }

    /**
     * Fusiona múltiples archivos PDF/DOCX
     * @param {Array<File>} files - Archivos a fusionar
     * @param {boolean} removeBlankPages - Eliminar páginas en blanco
     * @param {Function} progressCallback - Callback para progreso
     * @returns {Promise<Uint8Array>} Bytes del PDF fusionado
     */
    async mergeFiles(files, removeBlankPages = true, progressCallback = null) {
        try {
            logger.log('info', 'Proceso Iniciado', 
                      `Fusionando ${files.length} archivo(s)...`);

            this.mergedPdf = await PDFLib.PDFDocument.create();

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const progress = ((i + 1) / files.length) * 100;
                
                if (progressCallback) {
                    progressCallback(progress, file.name, i + 1, files.length);
                }

                try {
                    const extension = Utils.getFileExtension(file.name);
                    
                    if (extension === '.pdf') {
                        await this._processPDF(file, removeBlankPages);
                        logger.log('success', 'PDF Procesado', 
                                  `${file.name} fusionado correctamente`);
                    } else if (extension === '.docx') {
                        await this._processDOCX(file);
                        logger.log('success', 'DOCX Procesado', 
                                  `${file.name} convertido y fusionado`);
                    }
                } catch (error) {
                    logger.log('error', 'Error de Procesamiento', 
                              `${file.name}: ${error.message}`);
                    throw error;
                }
            }

            // Guardar PDF fusionado
            this.mergedPdfBytes = await this.mergedPdf.save();
            
            logger.log('success', 'Fusión Completada', 
                      `${files.length} archivo(s) procesado(s) exitosamente`);

            return this.mergedPdfBytes;

        } catch (error) {
            logger.log('error', 'Error Fatal', error.message);
            throw error;
        }
    }

    /**
     * Procesa un archivo PDF individual
     * @param {File} file - Archivo PDF
     * @param {boolean} removeBlank - Eliminar páginas en blanco
     */
    async _processPDF(file, removeBlank) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        
        const pageIndices = pdf.getPageIndices();
        let blankPagesSkipped = 0;
        
        for (const pageIndex of pageIndices) {
            // Verificar si la página está en blanco
            if (removeBlank && await this._isPageBlank(file, pageIndex)) {
                blankPagesSkipped++;
                continue;
            }
            
            // Copiar página al documento fusionado
            const [copiedPage] = await this.mergedPdf.copyPages(pdf, [pageIndex]);
            this.mergedPdf.addPage(copiedPage);
        }

        if (blankPagesSkipped > 0) {
            logger.log('info', 'Páginas Omitidas', 
                      `${blankPagesSkipped} página(s) en blanco omitida(s) en ${file.name}`);
        }
    }

    /**
     * Procesa un archivo DOCX
     * @param {File} file - Archivo DOCX
     */
    async _processDOCX(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer });
            
            const { jsPDF } = window.jspdf;
            const tempPdf = new jsPDF();
            
            await new Promise((resolve, reject) => {
                tempPdf.html(result.value, {
                    callback: async (doc) => {
                        try {
                            const pdfBytes = doc.output('arraybuffer');
                            const loadedPdf = await PDFLib.PDFDocument.load(pdfBytes);
                            
                            const pages = await this.mergedPdf.copyPages(
                                loadedPdf, 
                                loadedPdf.getPageIndices()
                            );
                            
                            pages.forEach(page => this.mergedPdf.addPage(page));
                            resolve();
                        } catch (err) {
                            reject(err);
                        }
                    },
                    x: 10,
                    y: 10,
                    width: 180,
                    windowWidth: 800
                });
            });
            
        } catch (error) {
            throw new Error(
                APP_CONFIG.messages.errors.docxError + ': ' + error.message
            );
        }
    }

    /**
     * Verifica si una página está en blanco
     * @param {File} file - Archivo PDF
     * @param {number} pageIndex - Índice de la página
     * @returns {Promise<boolean>} true si está en blanco
     */
    async _isPageBlank(file, pageIndex) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            const page = await pdf.getPage(pageIndex + 1);
            const textContent = await page.getTextContent();
            
            const text = textContent.items.map(item => item.str).join('');
            const threshold = APP_CONFIG.processing.blankPageThreshold;
            
            return text.trim().length < threshold;
        } catch (error) {
            // En caso de error, no considerar la página como blanca
            return false;
        }
    }

    /**
     * Descarga el PDF fusionado
     * @param {string} filename - Nombre del archivo (opcional)
     */
    downloadMergedPDF(filename = null) {
        if (!this.mergedPdfBytes) {
            logger.log('error', 'Sin PDF', APP_CONFIG.messages.errors.noPdfToDownload);
            return;
        }

        const blob = new Blob([this.mergedPdfBytes], { type: 'application/pdf' });
        const finalFilename = filename || Utils.generateUniqueFilename('documento_fusionado', 'pdf');
        
        Utils.downloadBlob(blob, finalFilename);
        
        logger.log('success', 'Descarga Iniciada', `Archivo: ${finalFilename}`);
    }

    /**
     * Resetea el procesador
     */
    reset() {
        this.mergedPdf = null;
        this.mergedPdfBytes = null;
    }

    /**
     * Obtiene información sobre el PDF fusionado
     * @returns {Object|null} Información del PDF
     */
    getInfo() {
        if (!this.mergedPdf) return null;

        return {
            pageCount: this.mergedPdf.getPageCount(),
            sizeBytes: this.mergedPdfBytes ? this.mergedPdfBytes.length : 0,
            sizeFormatted: this.mergedPdfBytes ? 
                          Utils.formatFileSize(this.mergedPdfBytes.length) : '0 Bytes'
        };
    }
}

// Crear instancia global
const pdfProcessor = new PDFProcessor();
