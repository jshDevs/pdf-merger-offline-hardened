/**
 * ============================================================================
 * ROTADOR DE PÁGINAS PDF
 * ============================================================================
 * Archivo: pdf-rotator.js
 * Descripción: Rotación de páginas individuales o masiva
 * Fase: 1 - Quick Wins
 * ============================================================================
 */

class PDFRotator {
    constructor() {
        this.loadedPdf = null;
        this.loadedPdfBytes = null;
    }

    /**
     * Carga un archivo PDF para rotación
     * @param {File} file - Archivo PDF a cargar
     * @returns {Promise<void>}
     */
    async loadPDF(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            this.loadedPdf = await PDFLib.PDFDocument.load(arrayBuffer);
            
            logger.log('success', 'PDF Cargado', 
                      `${file.name} listo para rotación`);
        } catch (error) {
            logger.log('error', 'Error de Carga', error.message);
            throw error;
        }
    }

    /**
     * Rota páginas específicas
     * @param {Array<number>} pageNumbers - Números de página (1-indexed)
     * @param {number} degrees - Grados de rotación (90, 180, 270)
     * @returns {Promise<Uint8Array>} PDF modificado
     */
    async rotatePages(pageNumbers, degrees) {
        if (!this.loadedPdf) {
            throw new Error('No hay PDF cargado');
        }

        if (![90, 180, 270, -90].includes(degrees)) {
            throw new Error('Grados inválidos. Usar: 90, 180, 270 o -90');
        }

        try {
            const pages = this.loadedPdf.getPages();
            
            pageNumbers.forEach(pageNum => {
                if (pageNum < 1 || pageNum > pages.length) {
                    throw new Error(`Página ${pageNum} fuera de rango`);
                }
                
                const page = pages[pageNum - 1];
                const currentRotation = page.getRotation().angle;
                const newRotation = (currentRotation + degrees) % 360;
                page.setRotation(PDFLib.degrees(newRotation));
            });

            this.loadedPdfBytes = await this.loadedPdf.save();
            
            logger.log('success', 'Rotación Completada', 
                      `${pageNumbers.length} página(s) rotada(s) ${degrees}°`);

            return this.loadedPdfBytes;

        } catch (error) {
            logger.log('error', 'Error de Rotación', error.message);
            throw error;
        }
    }

    /**
     * Rota todas las páginas del documento
     * @param {number} degrees - Grados de rotación
     * @returns {Promise<Uint8Array>} PDF modificado
     */
    async rotateAllPages(degrees) {
        if (!this.loadedPdf) {
            throw new Error('No hay PDF cargado');
        }

        const pageCount = this.loadedPdf.getPageCount();
        const allPages = Array.from({length: pageCount}, (_, i) => i + 1);
        
        return await this.rotatePages(allPages, degrees);
    }

    /**
     * Descarga el PDF rotado
     * @param {string} filename - Nombre del archivo (opcional)
     */
    downloadRotatedPDF(filename = null) {
        if (!this.loadedPdfBytes) {
            logger.log('error', 'Sin PDF', 'No hay PDF rotado para descargar');
            return;
        }

        const blob = new Blob([this.loadedPdfBytes], { type: 'application/pdf' });
        const finalFilename = filename || Utils.generateUniqueFilename('rotated', 'pdf');
        
        Utils.downloadBlob(blob, finalFilename);
        
        logger.log('success', 'Descarga Iniciada', `Archivo: ${finalFilename}`);
    }

    /**
     * Obtiene información del PDF cargado
     * @returns {Object|null} Información del PDF
     */
    getInfo() {
        if (!this.loadedPdf) return null;

        return {
            pageCount: this.loadedPdf.getPageCount(),
            title: this.loadedPdf.getTitle() || 'Sin título',
            author: this.loadedPdf.getAuthor() || 'Desconocido'
        };
    }

    /**
     * Resetea el rotador
     */
    reset() {
        this.loadedPdf = null;
        this.loadedPdfBytes = null;
    }
}

// Crear instancia global
const pdfRotator = new PDFRotator();
