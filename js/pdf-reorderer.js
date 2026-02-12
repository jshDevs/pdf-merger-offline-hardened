/**
 * ============================================================================
 * REORDENADOR DE PÁGINAS PDF
 * ============================================================================
 * Archivo: pdf-reorderer.js
 * Descripción: Reordenamiento de páginas con soporte para drag & drop
 * Fase: 2 - Features Profesionales
 * ============================================================================
 */

class PDFReorderer {
    constructor() {
        this.loadedPdf = null;
        this.pageOrder = [];
        this.originalFile = null;
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
            this.originalFile = file;
            
            // Inicializar orden original
            const pageCount = this.loadedPdf.getPageCount();
            this.pageOrder = Array.from({length: pageCount}, (_, i) => i);
            
            logger.log('success', 'PDF Cargado', 
                      `${file.name} - ${pageCount} páginas`);
        } catch (error) {
            logger.log('error', 'Error de Carga', error.message);
            throw error;
        }
    }

    /**
     * Reordena páginas según nuevo orden
     * @param {Array<number>} newOrder - Nuevo orden (0-indexed)
     * @returns {Promise<Uint8Array>} PDF reordenado
     */
    async reorderPages(newOrder) {
        if (!this.loadedPdf) {
            throw new Error('No hay PDF cargado');
        }

        if (newOrder.length !== this.loadedPdf.getPageCount()) {
            throw new Error('El nuevo orden debe incluir todas las páginas');
        }

        try {
            const newPdf = await PDFLib.PDFDocument.create();
            
            // Copiar páginas en el nuevo orden
            const copiedPages = await newPdf.copyPages(this.loadedPdf, newOrder);
            copiedPages.forEach(page => newPdf.addPage(page));

            const pdfBytes = await newPdf.save();
            
            logger.log('success', 'Reordenamiento Completado', 
                      `${newOrder.length} páginas reordenadas`);

            return pdfBytes;

        } catch (error) {
            logger.log('error', 'Error de Reordenamiento', error.message);
            throw error;
        }
    }

    /**
     * Mueve una página a una nueva posición
     * @param {number} fromIndex - Índice origen (0-indexed)
     * @param {number} toIndex - Índice destino (0-indexed)
     */
    movePage(fromIndex, toIndex) {
        if (fromIndex < 0 || fromIndex >= this.pageOrder.length ||
            toIndex < 0 || toIndex >= this.pageOrder.length) {
            throw new Error('Índices fuera de rango');
        }

        const [movedPage] = this.pageOrder.splice(fromIndex, 1);
        this.pageOrder.splice(toIndex, 0, movedPage);

        logger.log('info', 'Página Movida', 
                  `Página ${fromIndex + 1} → Posición ${toIndex + 1}`);
    }

    /**
     * Invierte el orden de las páginas
     */
    reverseOrder() {
        this.pageOrder.reverse();
        
        logger.log('info', 'Orden Invertido', 
                  'El orden de las páginas ha sido invertido');
    }

    /**
     * Duplica una página específica
     * @param {number} pageIndex - Índice de la página (0-indexed)
     * @param {number} insertAfter - Insertar después de este índice
     */
    duplicatePage(pageIndex, insertAfter = null) {
        if (pageIndex < 0 || pageIndex >= this.pageOrder.length) {
            throw new Error('Índice de página fuera de rango');
        }

        const pageToDuplicate = this.pageOrder[pageIndex];
        const insertIndex = insertAfter !== null ? insertAfter + 1 : pageIndex + 1;
        
        this.pageOrder.splice(insertIndex, 0, pageToDuplicate);

        logger.log('info', 'Página Duplicada', 
                  `Página ${pageIndex + 1} duplicada`);
    }

    /**
     * Elimina una página del orden
     * @param {number} pageIndex - Índice de la página (0-indexed)
     */
    removePage(pageIndex) {
        if (pageIndex < 0 || pageIndex >= this.pageOrder.length) {
            throw new Error('Índice de página fuera de rango');
        }

        if (this.pageOrder.length === 1) {
            throw new Error('No se puede eliminar la única página');
        }

        this.pageOrder.splice(pageIndex, 1);

        logger.log('info', 'Página Eliminada', 
                  `Página ${pageIndex + 1} removida del orden`);
    }

    /**
     * Genera el PDF con el orden actual
     * @returns {Promise<Uint8Array>} PDF reordenado
     */
    async generateReorderedPDF() {
        return await this.reorderPages(this.pageOrder);
    }

    /**
     * Descarga el PDF reordenado
     * @param {Uint8Array} pdfBytes - Bytes del PDF
     * @param {string} filename - Nombre del archivo
     */
    downloadPDF(pdfBytes, filename = null) {
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const finalFilename = filename || Utils.generateUniqueFilename('reordered', 'pdf');
        
        Utils.downloadBlob(blob, finalFilename);
        
        logger.log('success', 'Descarga Iniciada', `Archivo: ${finalFilename}`);
    }

    /**
     * Obtiene el orden actual de páginas
     * @returns {Array<number>} Orden actual
     */
    getCurrentOrder() {
        return [...this.pageOrder];
    }

    /**
     * Restaura el orden original
     */
    resetOrder() {
        if (this.loadedPdf) {
            const pageCount = this.loadedPdf.getPageCount();
            this.pageOrder = Array.from({length: pageCount}, (_, i) => i);
            
            logger.log('info', 'Orden Restaurado', 
                      'Orden original de páginas restaurado');
        }
    }

    /**
     * Obtiene información del PDF
     * @returns {Object|null} Información
     */
    getInfo() {
        if (!this.loadedPdf) return null;

        return {
            originalPageCount: this.loadedPdf.getPageCount(),
            currentPageCount: this.pageOrder.length,
            filename: this.originalFile ? this.originalFile.name : 'Desconocido',
            hasChanges: JSON.stringify(this.pageOrder) !== 
                       JSON.stringify(Array.from({length: this.pageOrder.length}, (_, i) => i))
        };
    }

    /**
     * Resetea el reordenador
     */
    reset() {
        this.loadedPdf = null;
        this.pageOrder = [];
        this.originalFile = null;
    }
}

// Crear instancia global
const pdfReorderer = new PDFReorderer();
