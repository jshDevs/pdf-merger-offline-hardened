/**
 * ============================================================================
 * ROTADOR DE PÁGINAS PDF
 * ============================================================================
 * Archivo: pdf-rotator.js
 * Descripción: Rotación de páginas individuales o masivas en PDFs
 * ============================================================================
 */

class PDFRotator {
    constructor() {
        this.rotations = new Map(); // pageIndex -> degrees
    }

    /**
     * Establece la rotación para una página específica
     * @param {number} pageIndex - Índice de la página (0-based)
     * @param {number} degrees - Grados de rotación (90, 180, 270)
     */
    setPageRotation(pageIndex, degrees) {
        const validDegrees = [0, 90, 180, 270];
        if (!validDegrees.includes(degrees)) {
            logger.log('error', 'Rotación Inválida', 
                      `Los grados deben ser: ${validDegrees.join(', ')}`);
            return;
        }

        this.rotations.set(pageIndex, degrees);
        logger.log('info', 'Rotación Configurada', 
                  `Página ${pageIndex + 1}: ${degrees}°`);
    }

    /**
     * Rota todas las páginas con el mismo ángulo
     * @param {number} degrees - Grados de rotación
     */
    rotateAll(degrees) {
        this.rotations.clear();
        logger.log('info', 'Rotación Global', `Todas las páginas: ${degrees}°`);
        return degrees;
    }

    /**
     * Aplica las rotaciones configuradas a un PDF
     * @param {PDFDocument} pdfDoc - Documento PDF de pdf-lib
     * @returns {PDFDocument} PDF con rotaciones aplicadas
     */
    async applyRotations(pdfDoc) {
        const pages = pdfDoc.getPages();
        let rotatedCount = 0;

        for (const [pageIndex, degrees] of this.rotations.entries()) {
            if (pageIndex < pages.length) {
                const page = pages[pageIndex];
                page.setRotation(PDFLib.degrees(degrees));
                rotatedCount++;
            }
        }

        logger.log('success', 'Rotaciones Aplicadas', 
                  `${rotatedCount} página(s) rotada(s)`);

        return pdfDoc;
    }

    /**
     * Rota páginas específicas de un archivo PDF
     * @param {File} file - Archivo PDF
     * @param {Object} rotationMap - Mapa de rotaciones {pageIndex: degrees}
     * @returns {Promise<Uint8Array>} PDF rotado
     */
    async rotatePDF(file, rotationMap = {}) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            
            // Aplicar rotaciones
            for (const [pageIndex, degrees] of Object.entries(rotationMap)) {
                this.setPageRotation(parseInt(pageIndex), degrees);
            }
            
            await this.applyRotations(pdfDoc);
            
            const pdfBytes = await pdfDoc.save();
            logger.log('success', 'PDF Rotado', `${file.name} procesado`);
            
            return pdfBytes;
        } catch (error) {
            logger.log('error', 'Error de Rotación', error.message);
            throw error;
        }
    }

    /**
     * Incrementa la rotación de una página en 90°
     * @param {number} pageIndex - Índice de la página
     */
    rotatePageClockwise(pageIndex) {
        const currentRotation = this.rotations.get(pageIndex) || 0;
        const newRotation = (currentRotation + 90) % 360;
        this.setPageRotation(pageIndex, newRotation);
        return newRotation;
    }

    /**
     * Decrementa la rotación de una página en 90°
     * @param {number} pageIndex - Índice de la página
     */
    rotatePageCounterClockwise(pageIndex) {
        const currentRotation = this.rotations.get(pageIndex) || 0;
        const newRotation = (currentRotation - 90 + 360) % 360;
        this.setPageRotation(pageIndex, newRotation);
        return newRotation;
    }

    /**
     * Limpia todas las rotaciones configuradas
     */
    clearRotations() {
        this.rotations.clear();
        logger.log('info', 'Rotaciones Limpiadas', 'Todas las configuraciones borradas');
    }

    /**
     * Obtiene la rotación actual de una página
     * @param {number} pageIndex - Índice de la página
     * @returns {number} Grados de rotación
     */
    getPageRotation(pageIndex) {
        return this.rotations.get(pageIndex) || 0;
    }

    /**
     * Obtiene información de todas las rotaciones
     * @returns {Object} Información de rotaciones
     */
    getRotationsInfo() {
        return {
            totalRotations: this.rotations.size,
            rotations: Object.fromEntries(this.rotations)
        };
    }
}

// Crear instancia global
const pdfRotator = new PDFRotator();
