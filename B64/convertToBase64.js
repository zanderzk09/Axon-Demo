#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script para convertir todas las imágenes y videos en archivos HTML a formato base64
 * Soporta GIF, WebP, PNG, JPG y otros formatos de imagen, además de MP4
 */

class ImageToBase64Converter {
    constructor() {
        this.htmlDir = __dirname; // Directorio actual (B64-2)
        this.assetsDir = path.join(__dirname, '..', 'assets'); // Directorio assets
        this.supportedExtensions = ['.gif', '.webp', '.png', '.jpg', '.jpeg', '.svg', '.bmp', '.mp4'];
        this.processedFiles = [];
        this.errors = [];
    }

    /**
     * Convierte una imagen o video a base64
     * @param {string} imagePath - Ruta de la imagen o video
     * @returns {string|null} - String base64 o null si hay error
     */
    imageToBase64(imagePath) {
        try {
            if (!fs.existsSync(imagePath)) {
                console.warn(`⚠️  Imagen no encontrada: ${imagePath}`);
                return null;
            }

            const imageBuffer = fs.readFileSync(imagePath);
            const ext = path.extname(imagePath).toLowerCase();
            
            // Determinar el MIME type basado en la extensión
            let mimeType;
            switch (ext) {
                case '.gif':
                    mimeType = 'image/gif';
                    break;
                case '.webp':
                    mimeType = 'image/webp';
                    break;
                case '.png':
                    mimeType = 'image/png';
                    break;
                case '.jpg':
                case '.jpeg':
                    mimeType = 'image/jpeg';
                    break;
                case '.svg':
                    mimeType = 'image/svg+xml';
                    break;
                case '.bmp':
                    mimeType = 'image/bmp';
                    break;
                case '.mp4':
                    mimeType = 'video/mp4';
                    break;
                default:
                    mimeType = 'image/png'; // Fallback
            }

            const base64String = imageBuffer.toString('base64');
            return `data:${mimeType};base64,${base64String}`;
        } catch (error) {
            console.error(`❌ Error al convertir imagen ${imagePath}:`, error.message);
            this.errors.push(`Error en ${imagePath}: ${error.message}`);
            return null;
        }
    }

    /**
     * Resuelve la ruta de la imagen o video basada en el src del HTML
     * @param {string} src - Atributo src de la imagen o video
     * @returns {string} - Ruta absoluta de la imagen o video
     */
    resolveImagePath(src) {
        // Limpiar el src de espacios y caracteres extraños
        src = src.trim();
        
        if (src.startsWith('./assets/')) {
            // Ruta relativa desde el directorio actual
            return path.join(this.assetsDir, src.replace('./assets/', ''));
        } else if (src.startsWith('../assets/')) {
            // Ruta relativa desde un nivel superior
            return path.join(this.assetsDir, src.replace('../assets/', ''));
        } else if (src.startsWith('assets/')) {
            // Ruta sin ./
            return path.join(this.assetsDir, src.replace('assets/', ''));
        } else {
            // Intentar buscar en assets de todas formas
            const filename = path.basename(src);
            return path.join(this.assetsDir, filename);
        }
    }

    /**
     * Procesa un archivo HTML y convierte las imágenes y videos a base64
     * @param {string} htmlFilePath - Ruta del archivo HTML
     */
    processHtmlFile(htmlFilePath) {
        try {
            console.log(`🔄 Procesando: ${path.basename(htmlFilePath)}`);
            
            let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
            let modified = false;
            
            // Regex para encontrar tags img con src
            const imgRegex = /<img([^>]*)\ssrc=["']([^"']+)["']([^>]*)>/gi;
            
            htmlContent = htmlContent.replace(imgRegex, (match, beforeSrc, src, afterSrc) => {
                // Verificar si ya es base64
                if (src.startsWith('data:')) {
                    console.log(`  ℹ️  Ya es base64: ${src.substring(0, 50)}...`);
                    return match;
                }
                
                const imagePath = this.resolveImagePath(src);
                const ext = path.extname(imagePath).toLowerCase();
                
                // Verificar si es una extensión soportada
                if (!this.supportedExtensions.includes(ext)) {
                    console.log(`  ⏭️  Extensión no soportada: ${ext}`);
                    return match;
                }
                
                console.log(`  🖼️  Convirtiendo: ${path.basename(imagePath)}`);
                const base64Data = this.imageToBase64(imagePath);
                
                if (base64Data) {
                    modified = true;
                    return `<img${beforeSrc} src="${base64Data}"${afterSrc}>`;
                } else {
                    console.log(`  ❌ No se pudo convertir: ${src}`);
                    return match;
                }
            });
            
            // Regex para encontrar tags video con src
            const videoRegex = /<video([^>]*)\ssrc=["']([^"']+)["']([^>]*)>/gi;
            
            htmlContent = htmlContent.replace(videoRegex, (match, beforeSrc, src, afterSrc) => {
                // Verificar si ya es base64
                if (src.startsWith('data:')) {
                    console.log(`  ℹ️  Ya es base64: ${src.substring(0, 50)}...`);
                    return match;
                }
                
                const videoPath = this.resolveImagePath(src);
                const ext = path.extname(videoPath).toLowerCase();
                
                // Verificar si es una extensión soportada
                if (!this.supportedExtensions.includes(ext)) {
                    console.log(`  ⏭️  Extensión no soportada: ${ext}`);
                    return match;
                }
                
                console.log(`  🎬 Convirtiendo: ${path.basename(videoPath)}`);
                const base64Data = this.imageToBase64(videoPath);
                
                if (base64Data) {
                    modified = true;
                    return `<video${beforeSrc} src="${base64Data}"${afterSrc}>`;
                } else {
                    console.log(`  ❌ No se pudo convertir: ${src}`);
                    return match;
                }
            });
            
            // Regex para encontrar tags source dentro de video
            const sourceRegex = /<source([^>]*)\ssrc=["']([^"']+)["']([^>]*)>/gi;
            
            htmlContent = htmlContent.replace(sourceRegex, (match, beforeSrc, src, afterSrc) => {
                // Verificar si ya es base64
                if (src.startsWith('data:')) {
                    console.log(`  ℹ️  Ya es base64: ${src.substring(0, 50)}...`);
                    return match;
                }
                
                const videoPath = this.resolveImagePath(src);
                const ext = path.extname(videoPath).toLowerCase();
                
                // Verificar si es una extensión soportada
                if (!this.supportedExtensions.includes(ext)) {
                    console.log(`  ⏭️  Extensión no soportada: ${ext}`);
                    return match;
                }
                
                console.log(`  🎬 Convirtiendo: ${path.basename(videoPath)}`);
                const base64Data = this.imageToBase64(videoPath);
                
                if (base64Data) {
                    modified = true;
                    return `<source${beforeSrc} src="${base64Data}"${afterSrc}>`;
                } else {
                    console.log(`  ❌ No se pudo convertir: ${src}`);
                    return match;
                }
            });
            
            if (modified) {
                // Crear backup del archivo original
                const backupPath = htmlFilePath + '.backup';
                if (!fs.existsSync(backupPath)) {
                    fs.copyFileSync(htmlFilePath, backupPath);
                    console.log(`  💾 Backup creado: ${path.basename(backupPath)}`);
                }
                
                // Escribir el archivo modificado
                fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
                console.log(`  ✅ Archivo actualizado: ${path.basename(htmlFilePath)}`);
                this.processedFiles.push(htmlFilePath);
            } else {
                console.log(`  ℹ️  No se encontraron imágenes o videos para convertir`);
            }
            
        } catch (error) {
            console.error(`❌ Error al procesar ${htmlFilePath}:`, error.message);
            this.errors.push(`Error en ${htmlFilePath}: ${error.message}`);
        }
    }

    /**
     * Encuentra todos los archivos HTML en el directorio
     * @returns {string[]} - Array de rutas de archivos HTML
     */
    findHtmlFiles() {
        try {
            const files = fs.readdirSync(this.htmlDir);
            return files
                .filter(file => file.endsWith('.html'))
                .map(file => path.join(this.htmlDir, file))
                .filter(filePath => fs.statSync(filePath).isFile());
        } catch (error) {
            console.error('❌ Error al buscar archivos HTML:', error.message);
            return [];
        }
    }

    /**
     * Lista todas las imágenes y videos disponibles en el directorio assets
     */
    listAvailableImages() {
        try {
            console.log('\n📁 Imágenes y videos disponibles en assets:');
            const files = fs.readdirSync(this.assetsDir);
            const imageFiles = files.filter(file => {
                const ext = path.extname(file).toLowerCase();
                return this.supportedExtensions.includes(ext);
            });
            
            imageFiles.forEach(file => {
                const filePath = path.join(this.assetsDir, file);
                const stats = fs.statSync(filePath);
                const sizeKB = Math.round(stats.size / 1024);
                console.log(`  📷 ${file} (${sizeKB} KB)`);
            });
            
            return imageFiles;
        } catch (error) {
            console.error('❌ Error al listar imágenes:', error.message);
            return [];
        }
    }

    /**
     * Ejecuta el proceso completo de conversión
     */
    run() {
        console.log('🚀 Iniciando conversión de imágenes y videos a Base64...\n');
        
        // Verificar que existe el directorio assets
        if (!fs.existsSync(this.assetsDir)) {
            console.error(`❌ Directorio assets no encontrado: ${this.assetsDir}`);
            return;
        }
        
        // Listar imágenes disponibles
        const availableImages = this.listAvailableImages();
        if (availableImages.length === 0) {
            console.log('⚠️  No se encontraron imágenes o videos en el directorio assets');
            return;
        }
        
        // Encontrar archivos HTML
        const htmlFiles = this.findHtmlFiles();
        if (htmlFiles.length === 0) {
            console.log('⚠️  No se encontraron archivos HTML en el directorio');
            return;
        }
        
        console.log(`\n🔍 Encontrados ${htmlFiles.length} archivos HTML:`);
        htmlFiles.forEach(file => console.log(`  📄 ${path.basename(file)}`));
        
        console.log('\n🔄 Iniciando procesamiento...\n');
        
        // Procesar cada archivo HTML
        htmlFiles.forEach(htmlFile => {
            this.processHtmlFile(htmlFile);
            console.log(''); // Línea en blanco para separar
        });
        
        // Mostrar resumen
        this.showSummary();
    }

    /**
     * Muestra un resumen del procesamiento
     */
    showSummary() {
        console.log('📊 RESUMEN DEL PROCESAMIENTO');
        console.log('================================');
        console.log(`✅ Archivos procesados exitosamente: ${this.processedFiles.length}`);
        
        if (this.processedFiles.length > 0) {
            console.log('\n📝 Archivos modificados:');
            this.processedFiles.forEach(file => {
                console.log(`  • ${path.basename(file)}`);
            });
        }
        
        if (this.errors.length > 0) {
            console.log(`\n❌ Errores encontrados: ${this.errors.length}`);
            this.errors.forEach(error => {
                console.log(`  • ${error}`);
            });
        }
        
        console.log('\n💡 NOTAS:');
        console.log('  • Se crearon backups (.backup) de los archivos originales');
        console.log('  • Solo se procesaron imágenes y videos con extensiones soportadas');
        console.log('  • Los archivos ya en formato base64 se mantuvieron sin cambios');
        
        if (this.processedFiles.length > 0) {
            console.log('\n🎉 ¡Conversión completada exitosamente!');
        } else {
            console.log('\n⚠️  No se realizaron cambios en los archivos');
        }
    }

    /**
     * Restaura los archivos desde los backups
     */
    restore() {
        console.log('🔄 Restaurando archivos desde backups...\n');
        
        const htmlFiles = this.findHtmlFiles();
        let restoredCount = 0;
        
        htmlFiles.forEach(htmlFile => {
            const backupPath = htmlFile + '.backup';
            if (fs.existsSync(backupPath)) {
                try {
                    fs.copyFileSync(backupPath, htmlFile);
                    console.log(`✅ Restaurado: ${path.basename(htmlFile)}`);
                    restoredCount++;
                } catch (error) {
                    console.error(`❌ Error al restaurar ${path.basename(htmlFile)}:`, error.message);
                }
            }
        });
        
        console.log(`\n📊 Archivos restaurados: ${restoredCount}`);
        
        if (restoredCount > 0) {
            console.log('🎉 ¡Restauración completada!');
        } else {
            console.log('⚠️  No se encontraron backups para restaurar');
        }
    }
}

// Ejecutar el script
if (require.main === module) {
    const converter = new ImageToBase64Converter();
    
    // Verificar argumentos de línea de comandos
    const args = process.argv.slice(2);
        
    if (args.includes('--restore') || args.includes('-r')) {
        converter.restore();
    } else if (args.includes('--help') || args.includes('-h')) {
        console.log('🤖 CONVERTIDOR DE IMÁGENES Y VIDEOS A BASE64');
        console.log('===================================');
        console.log('');
        console.log('Uso:');
        console.log('  node convertToBase64.js          # Convertir imágenes y videos a base64');
        console.log('  node convertToBase64.js --restore # Restaurar desde backups');
        console.log('  node convertToBase64.js --help    # Mostrar esta ayuda');
        console.log('');
        console.log('Formatos soportados: GIF, WebP, PNG, JPG, JPEG, SVG, BMP, MP4');
        console.log('');
        console.log('El script:');
        console.log('• Busca archivos HTML en el directorio actual');
        console.log('• Convierte imágenes y videos referenciados desde ./assets/ o ../assets/');
        console.log('• Crea backups automáticamente antes de modificar');
        console.log('• Mantiene el formato original de los archivos');
        console.log('• Soporta tags <img>, <video> y <source>');
    } else {
        converter.run();
    }
}

module.exports = ImageToBase64Converter;
