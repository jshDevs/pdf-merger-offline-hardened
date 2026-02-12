/**
 * ============================================================================
 * NUMERADOR DE PÁGINAS PDF
 * ============================================================================
 * Archivo: pdf-numbering.js
 * Descripción: Agrega numeración automática a páginas PDF
 * Fase: 2 - Features Profesionales
 * ============================================================================
 */

class PDFNumbering {
    constructor() {
        this.loadedPdf = null;
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
            
            logger.log('success', 'PDF Cargado', 
                      `${file.name} listo para numeración`);
        } catch (error) {
            logger.log('error', 'Error de Carga', error.message);
            throw error;
        }
    }

    /**
     * Agrega números de página
     * @param {Object} options - Opciones de numeración
     * @param {string} options.position - 'top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'
     * @param {string} options.format - 'simple' (1, 2, 3), 'of' (1 of 10), 'page' (Page 1)
     * @param {number} options.startNumber - Número inicial
     * @param {number} options.fontSize - Tamaño de fuente
     * @param {number} options.margin - Margen desde el borde
     * @param {Array<number>} options.skipPages - Páginas a omitir (1-indexed)
     * @returns {Promise<Uint8Array>} PDF numerado
     */
    async addPageNumbers(options = {}) {
        if (!this.loadedPdf) {
            throw new Error('No hay PDF cargado');
        }

        const defaultOptions = {
            position: 'bottom-center',
            format: 'simple',
            startNumber: 1,
            fontSize: 12,
            margin: 20,
            skipPages: []
        };

        const opts = { ...defaultOptions, ...options };

        try {
            const pages = this.loadedPdf.getPages();
            const totalPages = pages.length;
            let currentNumber = opts.startNumber;

            for (let i = 0; i < pages.length; i++) {
                const pageNum = i + 1;
                
                // Saltar páginas especificadas
                if (opts.skipPages.includes(pageNum)) {
                    continue;
                }

                const page = pages[i];
                const { width, height } = page.getSize();

                // Generar texto según formato
                let text = this._formatPageNumber(currentNumber, totalPages, opts.format);

                // Calcular posición
                const { x, y } = this._calculatePosition(
                    opts.position, 
                    width, 
                    height, 
                    opts.fontSize, 
                    opts.margin,
                    text
                );

                // Dibujar número
                page.drawText(text, {
                    x: x,
                    y: y,
                    size: opts.fontSize,
                    color: PDFLib.rgb(0, 0, 0)
                });

                currentNumber++;
            }

            const pdfBytes = await this.loadedPdf.save();
            
            logger.log('success', 'Numeración Completada', 
                      `${totalPages} página(s) numerada(s)`);

            return pdfBytes;

        } catch (error) {
            logger.log('error', 'Error de Numeración', error.message);
            throw error;
        }
    }

    /**
     * Formatea el número de página según el formato especificado
     * @param {number} current - Número actual
     * @param {number} total - Total de páginas
     * @param {string} format - Formato
     * @returns {string} Texto formateado
     * @private
     */
    _formatPageNumber(current, total, format) {
        switch (format) {
            case 'simple':
                return `${current}`;
            case 'of':
                return `${current} of ${total}`;
            case 'page':
                return `Page ${current}`;
            case 'pageof':
                return `Page ${current} of ${total}`;
            case 'roman':
                return this._toRoman(current);
            default:
                return `${current}`;
        }
    }

    /**
     * Convierte número a romano
     * @param {number} num - Número a convertir
     * @returns {string} Número romano
     * @private
     */
    _toRoman(num) {
        const romanNumerals = [
            ['M', 1000], ['CM', 900], ['D', 500], ['CD', 400],
            ['C', 100], ['XC', 90], ['L', 50], ['XL', 40],
            ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]
        ];
        
        let result = '';
        
        for (const [roman, value] of romanNumerals) {
            while (num >= value) {
                result += roman;
                num -= value;
            }
        }
        
        return result.toLowerCase();
    }

    /**
     * Calcula la posición del número en la página
     * @param {string} position - Posición deseada
     * @param {number} pageWidth - Ancho de página
     * @param {number} pageHeight - Alto de página
     * @param {number} fontSize - Tamaño de fuente
     * @param {number} margin - Margen
     * @param {string} text - Texto a dibujar
     * @returns {Object} Coordenadas {x, y}
     * @private
     */
    _calculatePosition(position, pageWidth, pageHeight, fontSize, margin, text) {
        // Estimar ancho de texto (aproximado)
        const textWidth = text.length * fontSize * 0.6;

        let x, y;

        // Determinar Y (vertical)
        if (position.startsWith('top')) {
            y = pageHeight - margin - fontSize;
        } else {
            y = margin;
        }

        // Determinar X (horizontal)
        if (position.endsWith('left')) {
            x = margin;
        } else if (position.endsWith('right')) {
            x = pageWidth - margin - textWidth;
        } else { // center
            x = (pageWidth - textWidth) / 2;
        }

        return { x, y };
    }

    /**
     * Descarga el PDF numerado
     * @param {Uint8Array} pdfBytes - Bytes del PDF
     * @param {string} filename - Nombre del archivo
     */
    downloadPDF(pdfBytes, filename = null) {
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const finalFilename = filename || Utils.generateUniqueFilename('numbered', 'pdf');
        
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
            pageCount: this.loadedPdf.getPageCount()
        };
    }

    /**
     * Resetea el numerador
     */
    reset() {
        this.loadedPdf = null;
    }
}

// Crear instancia global
const pdfNumbering = new PDFNumbering();
