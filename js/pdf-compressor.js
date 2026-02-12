/**
 * ============================================================================
 * COMPRESOR DE PDFs
 * ============================================================================
 * Archivo: pdf-compressor.js
 * Descripción: Compresión y optimización de archivos PDF
 * Fase: 2 - Features Profesionales
 * ============================================================================
 */

class PDFCompressor {
    constructor() {
        this.loadedPdf = null;
        this.originalSize = 0;
    }

    /**
     * Carga un archivo PDF
     * @param {File} file - Archivo PDF
     * @returns {Promise<void>}
     */
    async loadPDF(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            this.loadedPdf = await PDFLib.PDFDocument.load(arrayBuffer);
            this.originalSize = file.size;
            
            logger.log('success', 'PDF Cargado', 
                      `${file.name} - ${Utils.formatFileSize(file.size)}`);
        } catch (error) {
            logger.log('error', 'Error de Carga', error.message);
            throw error;
        }
    }

    /**
     * Comprime el PDF
     * @param {Object} options - Opciones de compresión
     * @param {boolean} options.removeMetadata - Eliminar metadatos
     * @param {boolean} options.optimizeFonts - Optimizar fuentes
     * @param {boolean} options.compressStreams - Comprimir streams
     * @returns {Promise<{bytes: Uint8Array, stats: Object}>} PDF comprimido y estadísticas
     */
    async compress(options = {}) {
        if (!this.loadedPdf) {
            throw new Error('No hay PDF cargado');
        }

        const defaultOptions = {
            removeMetadata: true,
            optimizeFonts: true,
            compressStreams: true
        };

        const opts = { ...defaultOptions, ...options };

        try {
            logger.log('info', 'Compresión Iniciada', 
                      'Optimizando PDF...');

            // Eliminar metadatos si se solicita
            if (opts.removeMetadata) {
                this._removeMetadata();
            }

            // Guardar con optimizaciones
            const pdfBytes = await this.loadedPdf.save({
                useObjectStreams: opts.compressStreams,
                addDefaultPage: false
            });

            const compressedSize = pdfBytes.length;
            const savings = this.originalSize - compressedSize;
            const savingsPercent = ((savings / this.originalSize) * 100).toFixed(2);

            const stats = {
                originalSize: this.originalSize,
                compressedSize: compressedSize,
                savings: savings,
                savingsPercent: savingsPercent,
                originalSizeFormatted: Utils.formatFileSize(this.originalSize),
                compressedSizeFormatted: Utils.formatFileSize(compressedSize),
                savingsFormatted: Utils.formatFileSize(savings)
            };

            logger.log('success', 'Compresión Completada', 
                      `Reducción: ${savingsPercent}% (${stats.savingsFormatted} ahorrados)`);

            return { bytes: pdfBytes, stats };

        } catch (error) {
            logger.log('error', 'Error de Compresión', error.message);
            throw error;
        }
    }

    /**
     * Elimina metadatos del PDF
     * @private
     */
    _removeMetadata() {
        try {
            this.loadedPdf.setTitle('');
            this.loadedPdf.setAuthor('');
            this.loadedPdf.setSubject('');
            this.loadedPdf.setKeywords([]);
            this.loadedPdf.setProducer('');
            this.loadedPdf.setCreator('');
            
            logger.log('info', 'Metadatos Eliminados', 
                      'Metadatos del PDF removidos');
        } catch (error) {
            logger.log('warning', 'Advertencia Metadatos', 
                      'No se pudieron eliminar todos los metadatos');
        }
    }

    /**
     * Obtiene metadatos del PDF
     * @returns {Object} Metadatos
     */
    getMetadata() {
        if (!this.loadedPdf) return null;

        return {
            title: this.loadedPdf.getTitle() || 'Sin título',
            author: this.loadedPdf.getAuthor() || 'Desconocido',
            subject: this.loadedPdf.getSubject() || 'N/A',
            keywords: this.loadedPdf.getKeywords() || [],
            producer: this.loadedPdf.getProducer() || 'N/A',
            creator: this.loadedPdf.getCreator() || 'N/A',
            creationDate: this.loadedPdf.getCreationDate() || null,
            modificationDate: this.loadedPdf.getModificationDate() || null
        };
    }

    /**
     * Estima el potencial de compresión
     * @returns {Object} Estimación
     */
    estimateCompression() {
        if (!this.loadedPdf) return null;

        const pageCount = this.loadedPdf.getPageCount();
        const avgPageSize = this.originalSize / pageCount;

        // Estimación simple basada en tamaño
        let estimatedReduction = 10; // Por defecto 10%

        if (avgPageSize > 500000) { // PDFs con páginas >500KB probablemente tienen imágenes
            estimatedReduction = 30;
        } else if (avgPageSize > 100000) {
            estimatedReduction = 20;
        }

        const estimatedSize = this.originalSize * (1 - estimatedReduction / 100);
        const estimatedSavings = this.originalSize - estimatedSize;

        return {
            estimatedReduction: `${estimatedReduction}%`,
            estimatedSize: Utils.formatFileSize(estimatedSize),
            estimatedSavings: Utils.formatFileSize(estimatedSavings)
        };
    }

    /**
     * Descarga el PDF comprimido
     * @param {Uint8Array} pdfBytes - Bytes del PDF
     * @param {string} filename - Nombre del archivo
     */
    downloadPDF(pdfBytes, filename = null) {
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const finalFilename = filename || Utils.generateUniqueFilename('compressed', 'pdf');
        
        Utils.downloadBlob(blob, finalFilename);
        
        logger.log('success', 'Descarga Iniciada', `Archivo: ${finalFilename}`);
    }

    /**
     * Obtiene información del PDF
     * @returns {Object|null} Información
     */
    getInfo() {
        if (!this.loadedPdf) return null;

        return {
            pageCount: this.loadedPdf.getPageCount(),
            originalSize: this.originalSize,
            originalSizeFormatted: Utils.formatFileSize(this.originalSize)
        };
    }

    /**
     * Resetea el compresor
     */
    reset() {
        this.loadedPdf = null;
        this.originalSize = 0;
    }
}

// Crear instancia global
const pdfCompressor = new PDFCompressor();
