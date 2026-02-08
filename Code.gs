// MOD-001: ENCABEZADO [INICIO]
/*
******************************************
PROYECTO: CodeHubber
ARCHIVO: Code.gs
VERSIÓN: 01.00
FECHA: 08/02/2026 11:40 (UTC-5)
******************************************
*/
// MOD-001: FIN

// MOD-002: CONSTANTES GLOBALES [INICIO]
const SPREADSHEET_ID = '1PqTYY7dOVicyhTt84y3FTMV7giJjvTy7aNqzGItZK54';
const HOJA_PROYECTOS = 'Proyectos';
const DRIVE_FOLDER_ID = '1uE8_iO_kXWWYRRwQepXJMp5TD4xZIXdu';
// MOD-002: FIN

// MOD-003: ROUTER PRINCIPAL [INICIO]
// ENRUTADOR PRINCIPAL
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Home')
    .setTitle('CodeHubber - SolidCode Generator')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
// MOD-003: FIN

// MOD-004: FUNCIONES AUXILIARES [INICIO]
// ============================================
// FUNCIONES AUXILIARES
// ============================================

function getSheet() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(HOJA_PROYECTOS);
    
    if (!sheet) {
      throw new Error(`No se encontró la hoja "${HOJA_PROYECTOS}"`);
    }
    
    return sheet;
  } catch (error) {
    throw new Error('Error al acceder a la hoja: ' + error.message);
  }
}
// MOD-004: FIN

// MOD-005: FETCH CON REINTENTOS - CONFIGURACIÓN Y LÓGICA PRINCIPAL [INICIO]
// ============================================
// FUNCIÓN AUXILIAR: FETCH CON REINTENTOS
// ============================================

function fetchConReintentos(url, intentosMaximos) {
  intentosMaximos = intentosMaximos || 3;
  let ultimoError = null;
  
  for (let intento = 1; intento <= intentosMaximos; intento++) {
    try {
      Logger.log(`Intento ${intento}/${intentosMaximos} para: ${url}`);
      
      const opciones = {
        method: 'get',
        muteHttpExceptions: true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (CodeHubber/2.5)',
          'Accept': '*/*',
          'Cache-Control': 'no-cache'
        },
        validateHttpsCertificates: true,
        followRedirects: true
      };
      
      const response = UrlFetchApp.fetch(url, opciones);
      const responseCode = response.getResponseCode();
      
      // Si es exitoso, retornar
      if (responseCode === 200) {
        Logger.log(`  ✅ Exitoso en intento ${intento}`);
        return response;
      }
// MOD-005: FIN

// MOD-006: FETCH CON REINTENTOS - MANEJO DE ERRORES Y REINTENTOS [INICIO]
      // Si es 404 o similar, no reintentar (es un error permanente)
      if (responseCode >= 400 && responseCode < 500 && responseCode !== 429) {
        throw new Error(`HTTP ${responseCode} - Archivo no encontrado o sin acceso`);
      }
      
      // Si es error de servidor (500+) o rate limit (429), reintentar
      if (responseCode >= 500 || responseCode === 429) {
        ultimoError = new Error(`HTTP ${responseCode} - Error del servidor`);
        Logger.log(`  ⚠️ Error ${responseCode}, reintentando...`);
        Utilities.sleep(1000 * intento); // Espera incremental
        continue;
      }
      
      // Otro código de respuesta
      throw new Error(`HTTP ${responseCode} - Respuesta inesperada`);
      
    } catch (error) {
      ultimoError = error;
      Logger.log(`  ❌ Error en intento ${intento}: ${error.message}`);
      
      // Si es el último intento, lanzar el error
      if (intento === intentosMaximos) {
        throw error;
      }
      
      // Esperar antes de reintentar
      Utilities.sleep(1000 * intento);
    }
  }
  
  // Si llegamos aquí, todos los intentos fallaron
  throw ultimoError || new Error('Todos los intentos fallaron sin error específico');
}
// MOD-006: FIN

// MOD-007: CRUD - OBTENER PROYECTOS [INICIO]
// ============================================
// CRUD PROYECTOS
// ============================================

// OBTENER TODOS LOS PROYECTOS ORDENADOS
function obtenerProyectos() {
  try {
    const sheet = getSheet();
    const lastRow = sheet.getLastRow();
    
    // Si solo hay el header o está vacío
    if (lastRow <= 1) {
      return [];
    }
    
    const data = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
    
    // Filtrar filas vacías y mapear a objetos
    const proyectos = data
      .map(function(row, index) {
        return {
          rowIndex: index + 2,
          orden: row[0] || 0,
          nombre: row[1] || '',
          linkList: row[2] || '',
          solidCode: row[3] || '',
          solidLink: row[4] || '',
          appWebLink: row[5] || '',
          info: row[6] || ''
        };
      })
      .filter(function(p) {
        return p.nombre && p.nombre.toString().trim() !== '';
      })
      .sort(function(a, b) {
        return a.orden - b.orden;
      });
    
    return proyectos;
  } catch (error) {
    throw new Error('Error al cargar proyectos: ' + error.message);
  }
}
// MOD-007: FIN

// MOD-008: CRUD - OBTENER PROYECTO INDIVIDUAL [INICIO]
// OBTENER UN PROYECTO POR ROWINDEX
function obtenerProyecto(rowIndex) {
  try {
    // Validación de entrada
    if (rowIndex === null || rowIndex === undefined) {
      throw new Error('rowIndex no puede ser null o undefined');
    }
    
    const sheet = getSheet();
    const lastRow = sheet.getLastRow();
    
    // Convertir a número
    rowIndex = Number(rowIndex);
    
    // Validar que sea un número válido
    if (isNaN(rowIndex)) {
      throw new Error('rowIndex debe ser un número');
    }
    
    // Validar rango
    if (rowIndex < 2 || rowIndex > lastRow) {
      throw new Error('rowIndex fuera de rango: ' + rowIndex + ' (válido: 2-' + lastRow + ')');
    }
    
    const row = sheet.getRange(rowIndex, 1, 1, 7).getValues()[0];
    
    return {
      rowIndex: rowIndex,
      orden: row[0] || 0,
      nombre: row[1] || '',
      linkList: row[2] || '',
      solidCode: row[3] || '',
      solidLink: row[4] || '',
      appWebLink: row[5] || '',
      info: row[6] || ''
    };
    
  } catch (error) {
    throw new Error('Error al obtener proyecto: ' + error.message);
  }
}
// MOD-008: FIN

// MOD-009: CRUD - CREAR PROYECTO [INICIO]
// CREAR NUEVO PROYECTO
function crearProyecto(nombre) {
  try {
    // Validación de entrada
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      throw new Error('El nombre del proyecto no puede estar vacío');
    }
    
    const sheet = getSheet();
    const proyectos = obtenerProyectos();
    
    // Calcular siguiente orden
    const maxOrden = proyectos.length > 0 
      ? Math.max.apply(Math, proyectos.map(function(p) { return p.orden; })) 
      : 0;
    const nuevoOrden = maxOrden + 1;
    
    // Agregar nueva fila
    const newRow = sheet.getLastRow() + 1;
    sheet.getRange(newRow, 1, 1, 7).setValues([[
      nuevoOrden,
      nombre.trim(),
      '',
      '',
      '',
      '',
      ''
    ]]);
    
    return obtenerProyectos();
    
  } catch (error) {
    throw new Error('Error al crear proyecto: ' + error.message);
  }
}
// MOD-009: FIN

// MOD-010: CRUD - ACTUALIZAR CAMPO [INICIO]
// ACTUALIZAR CAMPO DE PROYECTO
function actualizarCampo(rowIndex, campo, valor) {
  try {
    // Validación de entrada
    if (rowIndex === null || rowIndex === undefined) {
      throw new Error('rowIndex no puede ser null o undefined');
    }
    
    if (!campo || typeof campo !== 'string') {
      throw new Error('campo debe ser un string válido');
    }
    
    const sheet = getSheet();
    const lastRow = sheet.getLastRow();
    
    // Convertir a número
    rowIndex = Number(rowIndex);
    
    // Validar que sea un número válido
    if (isNaN(rowIndex)) {
      throw new Error('rowIndex debe ser un número');
    }
    
    const columnas = {
      'nombre': 2,
      'linkList': 3,
      'solidCode': 4,
      'solidLink': 5,
      'appWebLink': 6,
      'info': 7
    };
    
    if (!columnas[campo]) {
      throw new Error('Campo no válido: ' + campo);
    }
    
    // Validar rango
    if (rowIndex < 2 || rowIndex > lastRow) {
      throw new Error('rowIndex fuera de rango: ' + rowIndex + ' (válido: 2-' + lastRow + ')');
    }
    
    sheet.getRange(rowIndex, columnas[campo]).setValue(valor || '');
    
    return obtenerProyecto(rowIndex);
    
  } catch (error) {
    throw new Error('Error al guardar: ' + error.message);
  }
}
// MOD-010: FIN

// MOD-011: CRUD - ELIMINAR PROYECTO [INICIO]
// ELIMINAR PROYECTO
function eliminarProyecto(rowIndex) {
  try {
    // Validación de entrada
    if (rowIndex === null || rowIndex === undefined) {
      throw new Error('rowIndex no puede ser null o undefined');
    }
    
    const sheet = getSheet();
    const lastRow = sheet.getLastRow();
    
    // Convertir a número
    rowIndex = Number(rowIndex);
    
    // Validar que sea un número válido
    if (isNaN(rowIndex)) {
      throw new Error('rowIndex debe ser un número');
    }
    
    // Validar rango
    if (rowIndex < 2 || rowIndex > lastRow) {
      throw new Error('rowIndex fuera de rango: ' + rowIndex + ' (válido: 2-' + lastRow + ')');
    }
    
    const proyecto = obtenerProyecto(rowIndex);
    
    // Eliminar el Google Doc asociado si existe
    if (proyecto.solidCode && proyecto.solidCode.trim() !== '') {
      try {
        DriveApp.getFileById(proyecto.solidCode).setTrashed(true);
      } catch (error) {
        // Si no se puede eliminar el doc, continuar
        console.log('No se pudo eliminar el documento: ' + error.message);
      }
    }
    
    sheet.deleteRow(rowIndex);
    
    return renumerarProyectos();
    
  } catch (error) {
    throw new Error('Error al eliminar proyecto: ' + error.message);
  }
}
// MOD-011: FIN

// MOD-012: REORDENAMIENTO - VALIDACIONES Y PREPARACIÓN [INICIO]
// ============================================
// REORDENAMIENTO INTELIGENTE
// ============================================

function reordenarProyecto(rowIndex, nuevoOrden) {
  try {
    // Validación de entrada
    if (rowIndex === null || rowIndex === undefined) {
      throw new Error('rowIndex no puede ser null o undefined');
    }
    
    if (nuevoOrden === null || nuevoOrden === undefined) {
      throw new Error('nuevoOrden no puede ser null o undefined');
    }
    
    const sheet = getSheet();
    const lastRow = sheet.getLastRow();
    
    // Convertir a número
    rowIndex = Number(rowIndex);
    nuevoOrden = Number(nuevoOrden);
    
    // Validar que sean números válidos
    if (isNaN(rowIndex) || isNaN(nuevoOrden)) {
      throw new Error('rowIndex y nuevoOrden deben ser números');
    }
    
    let proyectos = obtenerProyectos();
    
    // Validar rango
    if (rowIndex < 2 || rowIndex > lastRow) {
      throw new Error('rowIndex fuera de rango: ' + rowIndex + ' (válido: 2-' + lastRow + ')');
    }
    
    // Encontrar el proyecto que se está moviendo
    const proyectoMovido = proyectos.filter(function(p) {
      return p.rowIndex === rowIndex;
    })[0];
    
    if (!proyectoMovido) {
      throw new Error('Proyecto no encontrado');
    }
    
    const ordenActual = proyectoMovido.orden;
    
    // Convertir decimal a entero
    if (nuevoOrden % 1 !== 0) {
      nuevoOrden = Math.ceil(nuevoOrden);
    }
    
    // Manejar casos especiales
    const maxOrden = Math.max.apply(Math, proyectos.map(function(p) { return p.orden; }));
    
    if (nuevoOrden > maxOrden) {
      nuevoOrden = maxOrden;
    } else if (nuevoOrden <= 0) {
      nuevoOrden = 1;
    }
// MOD-012: FIN

// MOD-013: REORDENAMIENTO - LÓGICA DE REORDENAMIENTO [INICIO]
    // Remover proyecto de su posición actual
    proyectos = proyectos.filter(function(p) {
      return p.rowIndex !== rowIndex;
    });
    
    // Ajustar órdenes antes de insertar
    if (nuevoOrden < ordenActual) {
      proyectos.forEach(function(p) {
        if (p.orden >= nuevoOrden && p.orden < ordenActual) {
          p.orden++;
        }
      });
    } else if (nuevoOrden > ordenActual) {
      proyectos.forEach(function(p) {
        if (p.orden > ordenActual && p.orden <= nuevoOrden) {
          p.orden--;
        }
      });
    }
    
    // Insertar proyecto en nueva posición
    proyectoMovido.orden = nuevoOrden;
    proyectos.push(proyectoMovido);
    
    // Ordenar y renumerar secuencialmente
    proyectos.sort(function(a, b) {
      return a.orden - b.orden;
    });
    
    proyectos.forEach(function(p, index) {
      p.orden = index + 1;
    });
    
    // Guardar todos los cambios
    proyectos.forEach(function(p) {
      sheet.getRange(p.rowIndex, 1).setValue(p.orden);
    });
    
    return obtenerProyectos();
    
  } catch (error) {
    throw new Error('Error al reordenar: ' + error.message);
  }
}
// MOD-013: FIN

// MOD-014: REORDENAMIENTO - RENUMERAR PROYECTOS [INICIO]
// RENUMERAR TODOS LOS PROYECTOS
function renumerarProyectos() {
  try {
    const sheet = getSheet();
    const proyectos = obtenerProyectos();
    
    proyectos.forEach(function(p, index) {
      const nuevoOrden = index + 1;
      sheet.getRange(p.rowIndex, 1).setValue(nuevoOrden);
    });
    
    return obtenerProyectos();
    
  } catch (error) {
    throw new Error('Error al renumerar: ' + error.message);
  }
}
// MOD-014: FIN

// MOD-015: GOOGLE DOCS - GUARDAR SOLIDCODE [INICIO]
// ============================================
// FUNCIONES DE GOOGLE DOCS
// ============================================

function guardarSolidCodeEnDoc(docId, nombre, contenido) {
  try {
    let doc;
    
    if (docId && docId.trim() !== '') {
      try {
        doc = DocumentApp.openById(docId);
        doc.getBody().clear();
      } catch (error) {
        doc = null;
      }
    }
    
    if (!doc) {
      doc = DocumentApp.create('SC_' + nombre);
      
      const file = DriveApp.getFileById(doc.getId());
      const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
      folder.addFile(file);
      DriveApp.getRootFolder().removeFile(file);
    }
    
    const body = doc.getBody();
    body.appendParagraph(contenido);
    
    const text = body.editAsText();
    text.setFontFamily('Courier New');
    text.setFontSize(10);
    
    return {
      docId: doc.getId(),
      docUrl: doc.getUrl()
    };
    
  } catch (error) {
    throw new Error('Error al guardar en Google Doc: ' + error.message);
  }
}
// MOD-015: FIN

// MOD-016: GOOGLE DOCS - OBTENER SOLIDCODE [INICIO]
function obtenerSolidCodeDeDoc(docId) {
  try {
    if (!docId || docId.trim() === '') {
      return '';
    }
    
    const doc = DocumentApp.openById(docId);
    return doc.getBody().getText();
    
  } catch (error) {
    throw new Error('Error al leer Google Doc: ' + error.message);
  }
}
// MOD-016: FIN

// MOD-017: GENERADOR SOLIDCODE - VALIDACIÓN E INICIALIZACIÓN [INICIO]
// ============================================
// GENERADOR DE SOLID CODE - VERSIÓN MEJORADA v2.5
// ============================================

function generarSolidCodeDesdeRaw(rowIndex, rawLinkListUrl) {
  try {
    // Validación de entrada
    if (rowIndex === null || rowIndex === undefined) {
      throw new Error('rowIndex no puede ser null o undefined');
    }
    
    if (!rawLinkListUrl || typeof rawLinkListUrl !== 'string' || rawLinkListUrl.trim() === '') {
      throw new Error('Debes proporcionar el Raw LinkList URL');
    }
    
    const sheet = getSheet();
    const lastRow = sheet.getLastRow();
    
    // Convertir a número
    rowIndex = Number(rowIndex);
    
    // Validar que sea un número válido
    if (isNaN(rowIndex)) {
      throw new Error('rowIndex debe ser un número');
    }
    
    // Validar rango
    if (rowIndex < 2 || rowIndex > lastRow) {
      throw new Error('rowIndex fuera de rango: ' + rowIndex + ' (válido: 2-' + lastRow + ')');
    }
    
    const proyecto = obtenerProyecto(rowIndex);
    
    // Fetch del contenido del LinkList con reintentos
    let linkListContent;
    try {
      const response = fetchConReintentos(rawLinkListUrl.trim(), 3);
      linkListContent = response.getContentText();
    } catch (error) {
      throw new Error('No se pudo obtener el LinkList. Verifica que sea una URL raw válida de GitHub. Error: ' + error.message);
    }
    
    // Guardar el LinkList en el Sheet
    sheet.getRange(rowIndex, 3).setValue(rawLinkListUrl);
    
    // Parsear links
    const links = linkListContent.split('\n')
      .map(function(link) { return link.trim(); })
      .filter(function(link) { return link !== '' && link.startsWith('http'); });
    
    if (links.length === 0) {
      throw new Error('No se encontraron links válidos en el LinkList.');
    }
    
    // Array para almacenar errores
    const errores = [];
    let archivosExitosos = 0;
// MOD-017: FIN

// MOD-018: GENERADOR SOLIDCODE - PROCESAMIENTO DE ARCHIVOS [INICIO]
    // Generar código consolidado
    let solidCode = '// ============================================\n';
    solidCode += '// SOLID CODE - ' + proyecto.nombre.toUpperCase() + '\n';
    solidCode += '// Generado: ' + new Date().toLocaleString('es-PE', {timeZone: 'America/Lima'}) + '\n';
    solidCode += '// Total de archivos: ' + links.length + '\n';
    solidCode += '// ============================================\n\n';
    
    // Fetch cada archivo con manejo de errores individual
    for (let i = 0; i < links.length; i++) {
      const url = links[i];
      const fileName = url.split('/').pop();
      
      solidCode += '\n\n// ============================================\n';
      solidCode += '// ARCHIVO ' + (i + 1) + '/' + links.length + ': ' + fileName + '\n';
      solidCode += '// URL: ' + url + '\n';
      solidCode += '// ============================================\n\n';
      
      try {
        // Intentar obtener el archivo con reintentos
        const response = fetchConReintentos(url, 3);
        const responseCode = response.getResponseCode();
        
        if (responseCode === 200) {
          const content = response.getContentText();
          solidCode += content;
          archivosExitosos++;
          Logger.log('✅ Archivo ' + (i + 1) + '/' + links.length + ': ' + fileName + ' - OK');
        } else {
          // Error HTTP
          const mensajeError = 'HTTP ' + responseCode + ': ' + fileName;
          errores.push(mensajeError);
          solidCode += '// ERROR: No se pudo obtener el archivo\n';
          solidCode += '// Código HTTP: ' + responseCode + '\n';
          solidCode += '// URL: ' + url + '\n\n';
          Logger.log('❌ Archivo ' + (i + 1) + '/' + links.length + ': ' + mensajeError);
        }
        
      } catch (error) {
        // Error de conexión o timeout
        const mensajeError = fileName + ': ' + error.message;
        errores.push(mensajeError);
        solidCode += '// ERROR: No se pudo obtener el archivo\n';
        solidCode += '// ' + error.message + '\n';
        solidCode += '// URL: ' + url + '\n\n';
        Logger.log('❌ Archivo ' + (i + 1) + '/' + links.length + ': ' + mensajeError);
      }
    }
// MOD-018: FIN

// MOD-019: GENERADOR SOLIDCODE - FINALIZACIÓN Y GUARDADO [INICIO]
    solidCode += '\n\n// ============================================\n';
    solidCode += '// FIN DEL SOLID CODE\n';
    solidCode += '// Tamaño total: ' + solidCode.length.toLocaleString() + ' caracteres\n';
    solidCode += '// Archivos exitosos: ' + archivosExitosos + '/' + links.length + '\n';
    if (errores.length > 0) {
      solidCode += '// Archivos con errores: ' + errores.length + '\n';
    }
    solidCode += '// ============================================\n';
    
    // Guardar en Google Doc
    const docInfo = guardarSolidCodeEnDoc(proyecto.solidCode, proyecto.nombre, solidCode);
    
    // Actualizar Sheet con el Doc ID
    sheet.getRange(rowIndex, 4).setValue(docInfo.docId);
    
    // Preparar mensaje de resultado
    const mensaje = errores.length === 0
      ? '✅ SolidCode generado exitosamente con ' + links.length + ' archivo(s)'
      : '⚠️ SolidCode generado con ' + archivosExitosos + '/' + links.length + ' archivo(s). ' + errores.length + ' error(es) detectado(s)';
    
    // Retornar resultado con información completa
    return {
      success: true,
      message: mensaje,
      solidCode: solidCode,
      docId: docInfo.docId,
      docUrl: docInfo.docUrl,
      errores: errores,
      estadisticas: {
        total: links.length,
        exitosos: archivosExitosos,
        fallidos: errores.length
      }
    };
    
  } catch (error) {
    Logger.log('❌ ERROR CRÍTICO: ' + error.message);
    return {
      success: false,
      message: 'Error al generar SolidCode: ' + error.message,
      errores: [error.message],
      estadisticas: {
        total: 0,
        exitosos: 0,
        fallidos: 1
      }
    };
  }
}
// MOD-019: FIN

// MOD-020: GENERADOR - CARGAR SOLIDCODE DE DOC [INICIO]
function cargarSolidCodeDeDoc(rowIndex) {
  try {
    // Validación de entrada
    if (rowIndex === null || rowIndex === undefined) {
      throw new Error('rowIndex no puede ser null o undefined');
    }
    
    const sheet = getSheet();
    const lastRow = sheet.getLastRow();
    
    // Convertir a número
    rowIndex = Number(rowIndex);
    
    // Validar que sea un número válido
    if (isNaN(rowIndex)) {
      throw new Error('rowIndex debe ser un número');
    }
    
    // Validar rango
    if (rowIndex < 2 || rowIndex > lastRow) {
      throw new Error('rowIndex fuera de rango: ' + rowIndex + ' (válido: 2-' + lastRow + ')');
    }
    
    const proyecto = obtenerProyecto(rowIndex);
    
    if (!proyecto.solidCode || proyecto.solidCode.trim() === '') {
      return {
        success: false,
        message: 'No hay SolidCode guardado para este proyecto'
      };
    }
    
    const contenido = obtenerSolidCodeDeDoc(proyecto.solidCode);
    
    return {
      success: true,
      solidCode: contenido,
      message: 'SolidCode cargado (' + contenido.length.toLocaleString() + ' caracteres)'
    };
    
  } catch (error) {
    throw new Error('Error al cargar SolidCode: ' + error.message);
  }
}
// MOD-020: FIN

// MOD-021: GENERADOR - LINKLIST DESDE GITHUB TREE [INICIO]
// ============================================
// GENERADOR DE LINKLIST DESDE GITHUB TREE
// ============================================

function generarLinkListDesdeTree(treeUrl) {
  try {
    // Validar que sea una URL de GitHub válida
    if (!treeUrl || !treeUrl.includes('github.com')) {
      throw new Error('Debes proporcionar una URL válida de GitHub');
    }
    
    // Extraer usuario, repositorio y branch del URL
    const parts = extraerInfoGitHub(treeUrl);
    
    if (!parts.user || !parts.repo || !parts.branch) {
      throw new Error('URL de GitHub inválida. Formato: https://github.com/usuario/repo/tree/branch');
    }
    
    // Construir URL de la API de GitHub
    const apiUrl = 'https://api.github.com/repos/' + parts.user + '/' + parts.repo + '/git/trees/' + parts.branch + '?recursive=1';
    
    Logger.log('Consultando API de GitHub: ' + apiUrl);
    
    // Hacer request a la API con reintentos
    const response = fetchConReintentos(apiUrl, 3);
    const data = JSON.parse(response.getContentText());
    
    // Verificar que haya datos
    if (!data.tree || data.tree.length === 0) {
      throw new Error('No se encontraron archivos en el repositorio');
    }
    
    // Filtrar solo archivos (type: "blob") y excluir carpetas especiales
    const archivos = data.tree.filter(function(item) {
      // Solo archivos (blob), no carpetas (tree)
      if (item.type !== 'blob') return false;
      
      // Excluir carpetas/archivos especiales
      if (item.path.startsWith('.git/')) return false;
      if (item.path.includes('node_modules/')) return false;
      if (item.path.startsWith('.')) return false; // Archivos ocultos como .gitignore
      
      return true;
    });
    
    // Generar raw links
    const rawLinks = archivos.map(function(item) {
      return 'https://raw.githubusercontent.com/' + parts.user + '/' + parts.repo + '/refs/heads/' + parts.branch + '/' + item.path;
    });
    
    Logger.log('Total de archivos encontrados: ' + rawLinks.length);
    
    // Retornar como objeto
    return {
      success: true,
      linkList: rawLinks.join('\n'),
      totalArchivos: rawLinks.length,
      user: parts.user,
      repo: parts.repo,
      branch: parts.branch
    };
    
  } catch (error) {
    Logger.log('Error en generarLinkListDesdeTree: ' + error.message);
    throw new Error('Error al generar LinkList: ' + error.message);
  }
}
// MOD-021: FIN

// MOD-022: AUXILIAR - EXTRAER INFO GITHUB [INICIO]
// FUNCIÓN AUXILIAR: Extraer información del URL de GitHub
function extraerInfoGitHub(url) {
  try {
    // Limpiar URL
    url = url.trim();
    
    // Patrón: https://github.com/{user}/{repo}/tree/{branch}
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/tree\/(.+)/);
    
    if (!match) {
      return { user: null, repo: null, branch: null };
    }
    
    return {
      user: match[1],
      repo: match[2],
      branch: match[3].replace(/\/$/, '') // Remover slash final si existe
    };
    
  } catch (error) {
    Logger.log('Error al extraer info de GitHub URL: ' + error.message);
    return { user: null, repo: null, branch: null };
  }
}
// MOD-022: FIN

// MOD-023: CÓDIGO DE CIERRE [INICIO]
// ============================================
// CÓDIGO DE CIERRE
// ============================================
// MOD-023: FIN

// MOD-099: NOTAS [INICIO]
/*
============================================
CODEHUBBER - CODE.GS v2.5
============================================

DESCRIPCIÓN:
Sistema de gestión de proyectos SolidCode con generación automática
desde repositorios GitHub y almacenamiento en Google Docs.

FUNCIONALIDADES PRINCIPALES:
- CRUD completo de proyectos
- Generación de SolidCode desde Raw LinkList
- Generación de LinkList desde GitHub Tree
- Sistema de reintentos para requests HTTP
- Almacenamiento en Google Docs
- Reordenamiento inteligente de proyectos

MÓDULOS:
MOD-001: Encabezado
MOD-002: Constantes Globales
MOD-003: Router Principal
MOD-004: Funciones Auxiliares
MOD-005: Fetch con Reintentos - Configuración
MOD-006: Fetch con Reintentos - Manejo de Errores
MOD-007: CRUD - Obtener Proyectos
MOD-008: CRUD - Obtener Proyecto Individual
MOD-009: CRUD - Crear Proyecto
MOD-010: CRUD - Actualizar Campo
MOD-011: CRUD - Eliminar Proyecto
MOD-012: Reordenamiento - Validaciones
MOD-013: Reordenamiento - Lógica
MOD-014: Reordenamiento - Renumerar
MOD-015: Google Docs - Guardar SolidCode
MOD-016: Google Docs - Obtener SolidCode
MOD-017: Generador SolidCode - Validación
MOD-018: Generador SolidCode - Procesamiento
MOD-019: Generador SolidCode - Finalización
MOD-020: Generador - Cargar SolidCode de Doc
MOD-021: Generador - LinkList desde GitHub Tree
MOD-022: Auxiliar - Extraer Info GitHub
MOD-023: Código de Cierre
MOD-099: Notas

DEPENDENCIAS:
- Google Apps Script
- Google Spreadsheet API
- Google Drive API
- Google Docs API
- GitHub API (sin autenticación)

ADVERTENCIAS CRÍTICAS:
⚠️ MOD-005/006: Sistema de reintentos con delays incrementales
⚠️ MOD-017/018/019: Manejo robusto de errores por archivo
⚠️ MOD-021: Filtrado de archivos especiales (.git, node_modules, ocultos)

HISTORIAL DE CAMBIOS:
v2.5 (24/12/2024):
- Sistema de reintentos mejorado
- Alertas persistentes detalladas
- Estadísticas de errores por archivo

v1.0 (08/02/2026):
- Remodulación según Standard CodeWorkShop v5.0
- Código original intacto
- Solo delimitadores agregados como comentarios
*/
// MOD-099: FIN
