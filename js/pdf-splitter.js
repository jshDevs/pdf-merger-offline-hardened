/**
 * ============================================================================
 * DIVISOR Y EXTRACTOR DE PÁGINAS PDF
 * ============================================================================
 * Archivo: pdf-splitter.js
 * Descripción: División de PDFs y extracción de páginas específicas
 * Fase: 1 - Quick Wins
 * ============================================================================
 */

class PDFSplitter {
    constructor() {
        this.loadedPdf = null;
        this.originalFile = null;
    }

    /**
     * Carga un archivo PDF para división
     * @param {File} file - Archivo PDF
     * @returns {Promise<void>}
     */
    async loadPDF(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            this.loadedPdf = await PDFLib.PDFDocument.load(arrayBuffer);
            this.originalFile = file;
            
            logger.log('success', 'PDF Cargado', 
                      `${file.name} - ${this.loadedPdf.getPageCount()} páginas`);
        } catch (error) {
            logger.log('error', 'Error de Carga', error.message);
            throw error;
        }
    }

    /**
     * Extrae páginas específicas
     * @param {Array<number>} pageNumbers - Números de página (1-indexed)
     * @param {string} outputName - Nombre del archivo de salida
     * @returns {Promise<Uint8Array>} PDF extraído
     */
    async extractPages(pageNumbers, outputName = null) {
        if (!this.loadedPdf) {
            throw new Error('No hay PDF cargado');
        }

        try {
            const newPdf = await PDFLib.PDFDocument.create();
            const totalPages = this.loadedPdf.getPageCount();

            // Validar números de página
            pageNumbers.forEach(pageNum => {
                if (pageNum < 1 || pageNum > totalPages) {
                    throw new Error(`Página ${pageNum} fuera de rango (1-${totalPages})`);
                }
            });

            // Copiar páginas seleccionadas
            const pageIndices = pageNumbers.map(n => n - 1);
            const copiedPages = await newPdf.copyPages(this.loadedPdf, pageIndices);
            
            copiedPages.forEach(page => newPdf.addPage(page));

            const pdfBytes = await newPdf.save();
            
            logger.log('success', 'Extracción Completada', 
                      `${pageNumbers.length} página(s) extraída(s)`);

            return pdfBytes;

        } catch (error) {
            logger.log('error', 'Error de Extracción', error.message);
            throw error;
        }
    }

    /**
     * Divide el PDF en rangos
     * @param {Array<Array<number>>} ranges - Rangos [[inicio, fin], ...]
     * @returns {Promise<Array<{bytes: Uint8Array, range: string}>>} PDFs divididos
     */
    async splitByRanges(ranges) {
        if (!this.loadedPdf) {
            throw new Error('No hay PDF cargado');
        }

        try {
            const results = [];

            for (const [start, end] of ranges) {
                const pageNumbers = [];
                for (let i = start; i <= end; i++) {
                    pageNumbers.push(i);
                }

                const pdfBytes = await this.extractPages(pageNumbers);
                results.push({
                    bytes: pdfBytes,
                    range: `${start}-${end}`,
                    pageCount: pageNumbers.length
                });
            }

            logger.log('success', 'División Completada', 
                      `${ranges.length} archivo(s) generado(s)`);

            return results;

        } catch (error) {
            logger.log('error', 'Error de División', error.message);
            throw error;
        }
    }

    /**
     * Divide el PDF cada N páginas
     * @param {number} pagesPerFile - Páginas por archivo
     * @returns {Promise<Array<{bytes: Uint8Array, range: string}>>} PDFs divididos
     */
    async splitEvery(pagesPerFile) {
        if (!this.loadedPdf) {
            throw new Error('No hay PDF cargado');
        }

        const totalPages = this.loadedPdf.getPageCount();
        const ranges = [];

        for (let i = 1; i <= totalPages; i += pagesPerFile) {
            const end = Math.min(i + pagesPerFile - 1, totalPages);
            ranges.push([i, end]);
        }

        return await this.splitByRanges(ranges);
    }

    /**
     * Extrae páginas pares o impares
     * @param {string} type - 'odd' o 'even'
     * @returns {Promise<Uint8Array>} PDF con páginas filtradas
     */
    async extractOddOrEven(type) {
        if (!this.loadedPdf) {
            throw new Error('No hay PDF cargado');
        }

        const totalPages = this.loadedPdf.getPageCount();
        const pageNumbers = [];

        for (let i = 1; i <= totalPages; i++) {
            if (type === 'odd' && i % 2 !== 0) {
                pageNumbers.push(i);
            } else if (type === 'even' && i % 2 === 0) {
                pageNumbers.push(i);
            }
        }

        return await this.extractPages(pageNumbers);
    }

    /**
     * Descarga un PDF extraído
     * @param {Uint8Array} pdfBytes - Bytes del PDF
     * @param {string} filename - Nombre del archivo
     */
    downloadPDF(pdfBytes, filename = null) {
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const finalFilename = filename || Utils.generateUniqueFilename('extracted', 'pdf');
        
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
            filename: this.originalFile ? this.originalFile.name : 'Desconocido'
        };
    }

    /**
     * Resetea el divisor
     */
    reset() {
        this.loadedPdf = null;
        this.originalFile = null;
    }
}

// Crear instancia global
const pdfSplitter = new PDFSplitter();
