/**
 * ============================================================================
 * DIVISOR DE PDFs
 * ============================================================================
 * Archivo: pdf-splitter.js
 * Descripción: División y extracción de páginas de documentos PDF
 * ============================================================================
 */

class PDFSplitter {
    constructor() {
        this.currentPDF = null;
        this.pageCount = 0;
    }

    /**
     * Carga un PDF para división
     * @param {File} file - Archivo PDF
     * @returns {Promise<PDFDocument>} Documento cargado
     */
    async loadPDF(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            this.currentPDF = await PDFLib.PDFDocument.load(arrayBuffer);
            this.pageCount = this.currentPDF.getPageCount();
            
            logger.log('success', 'PDF Cargado', 
                      `${file.name} - ${this.pageCount} página(s)`);
            
            return this.currentPDF;
        } catch (error) {
            logger.log('error', 'Error al Cargar PDF', error.message);
            throw error;
        }
    }

    /**
     * Extrae páginas específicas
     * @param {Array<number>} pageNumbers - Números de página (1-based)
     * @returns {Promise<Uint8Array>} PDF con páginas extraídas
     */
    async extractPages(pageNumbers) {
        if (!this.currentPDF) {
            throw new Error('No hay PDF cargado');
        }

        try {
            const newPDF = await PDFLib.PDFDocument.create();
            
            // Convertir a 0-based y validar
            const pageIndices = pageNumbers
                .map(n => n - 1)
                .filter(i => i >= 0 && i < this.pageCount);

            if (pageIndices.length === 0) {
                throw new Error('Números de página inválidos');
            }

            // Copiar páginas
            const copiedPages = await newPDF.copyPages(this.currentPDF, pageIndices);
            copiedPages.forEach(page => newPDF.addPage(page));

            const pdfBytes = await newPDF.save();
            
            logger.log('success', 'Páginas Extraídas', 
                      `${pageIndices.length} página(s) extraída(s)`);
            
            return pdfBytes;
        } catch (error) {
            logger.log('error', 'Error al Extraer', error.message);
            throw error;
        }
    }

    /**
     * Divide por rango de páginas
     * @param {number} start - Página inicial (1-based)
     * @param {number} end - Página final (1-based)
     * @returns {Promise<Uint8Array>} PDF con rango de páginas
     */
    async extractRange(start, end) {
        const pageNumbers = [];
        for (let i = start; i <= end; i++) {
            pageNumbers.push(i);
        }
        return await this.extractPages(pageNumbers);
    }

    /**
     * Divide el PDF cada N páginas
     * @param {number} pagesPerFile - Páginas por archivo
     * @returns {Promise<Array<Uint8Array>>} Array de PDFs divididos
     */
    async splitEvery(pagesPerFile) {
        if (!this.currentPDF) {
            throw new Error('No hay PDF cargado');
        }

        const chunks = [];
        const totalChunks = Math.ceil(this.pageCount / pagesPerFile);

        for (let i = 0; i < totalChunks; i++) {
            const start = i * pagesPerFile + 1;
            const end = Math.min((i + 1) * pagesPerFile, this.pageCount);
            
            const chunk = await this.extractRange(start, end);
            chunks.push(chunk);
        }

        logger.log('success', 'PDF Dividido', 
                  `${chunks.length} archivo(s) generado(s)`);

        return chunks;
    }

    /**
     * Extrae páginas impares
     * @returns {Promise<Uint8Array>} PDF con páginas impares
     */
    async extractOddPages() {
        const oddPages = [];
        for (let i = 1; i <= this.pageCount; i += 2) {
            oddPages.push(i);
        }
        return await this.extractPages(oddPages);
    }

    /**
     * Extrae páginas pares
     * @returns {Promise<Uint8Array>} PDF con páginas pares
     */
    async extractEvenPages() {
        const evenPages = [];
        for (let i = 2; i <= this.pageCount; i += 2) {
            evenPages.push(i);
        }
        return await this.extractPages(evenPages);
    }

    /**
     * Elimina páginas específicas (retorna PDF sin esas páginas)
     * @param {Array<number>} pageNumbers - Números de página a eliminar (1-based)
     * @returns {Promise<Uint8Array>} PDF sin las páginas especificadas
     */
    async deletePages(pageNumbers) {
        if (!this.currentPDF) {
            throw new Error('No hay PDF cargado');
        }

        const pagesToKeep = [];
        for (let i = 1; i <= this.pageCount; i++) {
            if (!pageNumbers.includes(i)) {
                pagesToKeep.push(i);
            }
        }

        return await this.extractPages(pagesToKeep);
    }

    /**
     * Obtiene información del PDF cargado
     * @returns {Object} Información del PDF
     */
    getInfo() {
        return {
            loaded: this.currentPDF !== null,
            pageCount: this.pageCount
        };
    }

    /**
     * Descarga un PDF procesado
     * @param {Uint8Array} pdfBytes - Bytes del PDF
     * @param {string} filename - Nombre del archivo
     */
    downloadPDF(pdfBytes, filename) {
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        Utils.downloadBlob(blob, filename);
        logger.log('success', 'Descarga Iniciada', filename);
    }
}

// Crear instancia global
const pdfSplitter = new PDFSplitter();
