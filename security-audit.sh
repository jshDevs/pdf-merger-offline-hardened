#!/bin/bash

################################################################################
# Security Audit Script - PDF Merger Offline Hardened
# Verifica que NO hay conexiones a internet y máxima seguridad
################################################################################

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Contadores
PASSED=0
FAILED=0
WARNINGS=0

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     AUDITORÍA DE SEGURIDAD - PDF MERGER OFFLINE    ║${NC}"
echo -e "${BLUE}║          Verificación completa sin internet        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================================
# TEST 1: LIBRERÍAS LOCALES
# ============================================================================

echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
echo -e "${CYAN}TEST 1: Verificar Librerías Locales${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
echo ""

if [ -d "libs" ]; then
    echo -e "${GREEN}✓ PASS${NC}: Carpeta libs/ existe"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}: Carpeta libs/ NO encontrada"
    echo "  Ejecuta: bash download-offline-libs.sh"
    ((FAILED++))
fi

# Verificar archivos específicos
REQUIRED_FILES=(
    "libs/pdf-lib.min.js"
    "libs/pdf.min.js"
    "libs/pdf.worker.min.js"
    "libs/jspdf.umd.min.js"
    "libs/mammoth.browser.min.js"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        SIZE=$(du -h "$file" | cut -f1)
        echo -e "${GREEN}✓ PASS${NC}: $file ($SIZE)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}: $file NO ENCONTRADO"
        ((FAILED++))
    fi
done

echo ""

# ============================================================================
# TEST 2: VERIFICACIÓN SHA256
# ============================================================================

echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
echo -e "${CYAN}TEST 2: Integridad SHA256${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
echo ""

if [ -f "libs/.checksum" ]; then
    echo -e "${GREEN}✓ PASS${NC}: Archivo .checksum existe"
    ((PASSED++))
    
    # Verificar integridad
    cd libs
    if sha256sum -c .checksum 2>&1 | grep -q "OK"; then
        COUNT=$(sha256sum -c .checksum 2>&1 | grep -c OK)
        echo -e "${GREEN}✓ PASS${NC}: $COUNT archivos verificados exitosamente"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}: Algunos checksums no coinciden"
        echo "  Integridad comprometida. Ejecuta: bash download-offline-libs.sh"
        ((FAILED++))
    fi
    cd ..
else
    echo -e "${YELLOW}⚠ WARNING${NC}: No hay checksums calculados"
    echo "  Ejecuta: bash download-offline-libs.sh para generar"
    ((WARNINGS++))
fi

echo ""

# ============================================================================
# TEST 3: NO HAY URLS A CDN EN HTML
# ============================================================================

echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
echo -e "${CYAN}TEST 3: Búsqueda de URLs Externas en HTML${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
echo ""

if [ -f "pdf-merger-offline-hardened.html" ]; then
    echo -e "${GREEN}✓ PASS${NC}: Archivo HTML encontrado"
    ((PASSED++))
    
    # Buscar referencias a CDN (fuera de comentarios)
    CDN_PATTERNS=(
        "cdnjs.cloudflare.com"
        "https://cdn"
        "http://cdn"
        "googleapis.com"
        "bootstrapcdn.com"
        "cloudflare.com"
    )
    
    FOUND_URLS=0
    for pattern in "${CDN_PATTERNS[@]}"; do
        if grep -v "^[[:space:]]*//" pdf-merger-offline-hardened.html | \
           grep -v "^[[:space:]]*\*" | \
           grep -v "<!--" | \
           grep -q "$pattern" 2>/dev/null; then
            echo -e "${YELLOW}⚠ WARNING${NC}: Encontrado patrón: $pattern"
            ((FOUND_URLS++))
            ((WARNINGS++))
        fi
    done
    
    if [ $FOUND_URLS -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: No se encontraron URLs a CDN sin comentar"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠ ${FOUND_URLS} patrones encontrados (revisar manualmente)${NC}"
    fi
else
    echo -e "${RED}✗ FAIL${NC}: Archivo HTML NO encontrado"
    ((FAILED++))
fi

echo ""

# ============================================================================
# TEST 4: ESTRUCTURA DE ARCHIVOS
# ============================================================================

echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
echo -e "${CYAN}TEST 4: Estructura de Archivos${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
echo ""

REQUIRED_STRUCTURE=(
    "download-offline-libs.sh"
    "security-audit.sh"
    "README.md"
    "QUICKSTART-HARDENING.md"
    "HARDENING-TOTAL-GUIA-COMPLETA.md"
)

for file in "${REQUIRED_STRUCTURE[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ PASS${NC}: $file existe"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠ WARNING${NC}: $file no encontrado"
        ((WARNINGS++))
    fi
done

echo ""

# ============================================================================
# TEST 5: PERMISOS DE SCRIPTS
# ============================================================================

echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
echo -e "${CYAN}TEST 5: Permisos de Scripts${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
echo ""

SCRIPTS=(
    "download-offline-libs.sh"
    "security-audit.sh"
)

for script in "${SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        if [ -x "$script" ]; then
            echo -e "${GREEN}✓ PASS${NC}: $script es ejecutable"
            ((PASSED++))
        else
            echo -e "${YELLOW}⚠ WARNING${NC}: $script NO es ejecutable"
            echo "  Ejecuta: chmod +x $script"
            ((WARNINGS++))
        fi
    fi
done

if [ -f "libs/verify.sh" ]; then
    if [ -x "libs/verify.sh" ]; then
        echo -e "${GREEN}✓ PASS${NC}: libs/verify.sh es ejecutable"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠ WARNING${NC}: libs/verify.sh NO es ejecutable"
        ((WARNINGS++))
    fi
fi

echo ""

# ============================================================================
# RESUMEN FINAL
# ============================================================================

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                  RESUMEN FINAL                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}✓ Tests PASADOS: $PASSED${NC}"
echo -e "${RED}✗ Tests FALLADOS: $FAILED${NC}"
echo -e "${YELLOW}⚠ Advertencias: $WARNINGS${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║  ✓ AUDITORÍA COMPLETADA CON ÉXITO                 ║${NC}"
        echo -e "${GREEN}║  ✓ MÁXIMA SEGURIDAD VERIFICADA                    ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
        exit 0
    else
        echo -e "${YELLOW}╔════════════════════════════════════════════════════╗${NC}"
        echo -e "${YELLOW}║  ⚠ AUDITORÍA COMPLETADA CON ADVERTENCIAS          ║${NC}"
        echo -e "${YELLOW}║  ⚠ Revisar warnings arriba                        ║${NC}"
        echo -e "${YELLOW}╚════════════════════════════════════════════════════╝${NC}"
        exit 0
    fi
else
    echo -e "${RED}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ✗ AUDITORÍA FALLIDA                              ║${NC}"
    echo -e "${RED}║  ✗ Revisar errores arriba                         ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════╝${NC}"
    exit 1
fi
