/**
 * ============================================================================
 * CONVERSOR DE IMÁGENES A PDF
 * ============================================================================
 * Archivo: image-converter.js
 * Descripción: Convierte imágenes (JPG, PNG, WebP) a PDF
 * Fase: 1 - Quick Wins
 * ============================================================================
 */

class ImageConverter {
    constructor() {
        this.images = [];
        this.pdfBytes = null;
    }

    /**
     * Agrega imágenes a la cola de conversión
     * @param {FileList|Array<File>} files - Archivos de imagen
     * @returns {number} Cantidad de imágenes válidas agregadas
     */
    addImages(files) {
        const validFormats = ['.jpg', '.jpeg', '.png', '.webp'];
        const validImages = Array.from(files).filter(file => {
            return Utils.isValidFileType(file.name, validFormats);
        });

        if (validImages.length === 0) {
            logger.log('error', 'Formato Inválido', 
                      'Solo se aceptan JPG, PNG, WebP');
            return 0;
        }

        this.images.push(...validImages);
        
        logger.log('success', 'Imágenes Agregadas', 
                  `${validImages.length} imagen(es) lista(s) para conversión`);

        return validImages.length;
    }

    /**
     * Convierte imágenes a PDF
     * @param {Object} options - Opciones de conversión
     * @param {string} options.pageSize - 'A4', 'Letter', 'auto'
     * @param {string} options.orientation - 'portrait', 'landscape'
     * @param {number} options.margin - Margen en puntos
     * @param {Function} progressCallback - Callback de progreso
     * @returns {Promise<Uint8Array>} Bytes del PDF generado
     */
    async convertToPDF(options = {}, progressCallback = null) {
        if (this.images.length === 0) {
            throw new Error('No hay imágenes para convertir');
        }

        const defaultOptions = {
            pageSize: 'A4',
            orientation: 'portrait',
            margin: 20,
            fitToPage: true
        };

        const opts = { ...defaultOptions, ...options };

        try {
            logger.log('info', 'Conversión Iniciada', 
                      `Convirtiendo ${this.images.length} imagen(es)...`);

            const pdfDoc = await PDFLib.PDFDocument.create();

            for (let i = 0; i < this.images.length; i++) {
                const image = this.images[i];
                
                if (progressCallback) {
                    const progress = ((i + 1) / this.images.length) * 100;
                    progressCallback(progress, image.name, i + 1, this.images.length);
                }

                await this._addImageToDocument(pdfDoc, image, opts);

                logger.log('success', 'Imagen Procesada', 
                          `${image.name} agregada al PDF`);
            }

            this.pdfBytes = await pdfDoc.save();

            logger.log('success', 'Conversión Completada', 
                      `${this.images.length} imagen(es) convertida(s) a PDF`);

            return this.pdfBytes;

        } catch (error) {
            logger.log('error', 'Error de Conversión', error.message);
            throw error;
        }
    }

    /**
     * Agrega una imagen al documento PDF
     * @param {PDFDocument} pdfDoc - Documento PDF
     * @param {File} imageFile - Archivo de imagen
     * @param {Object} options - Opciones
     * @private
     */
    async _addImageToDocument(pdfDoc, imageFile, options) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const imageBytes = new Uint8Array(arrayBuffer);

        let image;
        const extension = Utils.getFileExtension(imageFile.name).toLowerCase();

        // Cargar imagen según formato
        if (extension === '.jpg' || extension === '.jpeg') {
            image = await pdfDoc.embedJpg(imageBytes);
        } else if (extension === '.png') {
            image = await pdfDoc.embedPng(imageBytes);
        } else {
            throw new Error(`Formato no soportado: ${extension}`);
        }

        // Determinar dimensiones de página
        const { width: imgWidth, height: imgHeight } = image.scale(1);
        
        let pageWidth, pageHeight;

        if (options.pageSize === 'auto') {
            // Usar dimensiones de la imagen
            pageWidth = imgWidth;
            pageHeight = imgHeight;
        } else {
            // Usar tamaño estándar
            const sizes = {
                'A4': { width: 595, height: 842 },
                'Letter': { width: 612, height: 792 }
            };
            
            const size = sizes[options.pageSize] || sizes['A4'];
            
            if (options.orientation === 'landscape') {
                pageWidth = size.height;
                pageHeight = size.width;
            } else {
                pageWidth = size.width;
                pageHeight = size.height;
            }
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Calcular dimensiones de imagen con márgenes
        const availableWidth = pageWidth - (options.margin * 2);
        const availableHeight = pageHeight - (options.margin * 2);

        let drawWidth = imgWidth;
        let drawHeight = imgHeight;

        if (options.fitToPage && (drawWidth > availableWidth || drawHeight > availableHeight)) {
            const widthRatio = availableWidth / imgWidth;
            const heightRatio = availableHeight / imgHeight;
            const ratio = Math.min(widthRatio, heightRatio);

            drawWidth = imgWidth * ratio;
            drawHeight = imgHeight * ratio;
        }

        // Centrar imagen
        const x = (pageWidth - drawWidth) / 2;
        const y = (pageHeight - drawHeight) / 2;

        page.drawImage(image, {
            x: x,
            y: y,
            width: drawWidth,
            height: drawHeight
        });
    }

    /**
     * Descarga el PDF generado
     * @param {string} filename - Nombre del archivo
     */
    downloadPDF(filename = null) {
        if (!this.pdfBytes) {
            logger.log('error', 'Sin PDF', 'No hay PDF generado para descargar');
            return;
        }

        const blob = new Blob([this.pdfBytes], { type: 'application/pdf' });
        const finalFilename = filename || Utils.generateUniqueFilename('images_to_pdf', 'pdf');
        
        Utils.downloadBlob(blob, finalFilename);
        
        logger.log('success', 'Descarga Iniciada', `Archivo: ${finalFilename}`);
    }

    /**
     * Obtiene información de las imágenes cargadas
     * @returns {Object} Información
     */
    getInfo() {
        const totalSize = this.images.reduce((sum, img) => sum + img.size, 0);

        return {
            count: this.images.length,
            totalSize: totalSize,
            totalSizeFormatted: Utils.formatFileSize(totalSize),
            images: this.images.map(img => ({
                name: img.name,
                size: Utils.formatFileSize(img.size)
            }))
        };
    }

    /**
     * Limpia la cola de imágenes
     */
    clear() {
        this.images = [];
        this.pdfBytes = null;
    }

    /**
     * Resetea el conversor
     */
    reset() {
        this.clear();
    }
}

// Crear instancia global
const imageConverter = new ImageConverter();
