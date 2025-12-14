// ============================================
// CODEHUBBER v2.3 - CODE.GS
// Última actualización: 14/12/2024 - 22:00
// Nuevo: Generador de LinkList desde GitHub Tree API
// ============================================

const SPREADSHEET_ID = '1PqTYY7dOVicyhTt84y3FTMV7giJjvTy7aNqzGItZK54';
const HOJA_PROYECTOS = 'Proyectos';
const DRIVE_FOLDER_ID = '1uE8_iO_kXWWYRRwQepXJMp5TD4xZIXdu';

// ENRUTADOR PRINCIPAL
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Home')
    .setTitle('CodeHubber - SolidCode Generator')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

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
      .map((row, index) => ({
        rowIndex: index + 2,
        orden: row[0] || 0,
        nombre: row[1] || '',
        linkList: row[2] || '',
        solidCode: row[3] || '',
        solidLink: row[4] || '',
        appWebLink: row[5] || '',
        info: row[6] || ''
      }))
      .filter(p => p.nombre && p.nombre.toString().trim() !== '')
      .sort((a, b) => a.orden - b.orden);
    
    return proyectos;
  } catch (error) {
    throw new Error('Error al cargar proyectos: ' + error.message);
  }
}

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
      throw new Error(`rowIndex fuera de rango: ${rowIndex} (válido: 2-${lastRow})`);
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
      ? Math.max(...proyectos.map(p => p.orden)) 
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
      throw new Error(`rowIndex fuera de rango: ${rowIndex} (válido: 2-${lastRow})`);
    }
    
    sheet.getRange(rowIndex, columnas[campo]).setValue(valor || '');
    
    return obtenerProyecto(rowIndex);
    
  } catch (error) {
    throw new Error('Error al guardar: ' + error.message);
  }
}

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
      throw new Error(`rowIndex fuera de rango: ${rowIndex} (válido: 2-${lastRow})`);
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
      throw new Error(`rowIndex fuera de rango: ${rowIndex} (válido: 2-${lastRow})`);
    }
    
    // Encontrar el proyecto que se está moviendo
    const proyectoMovido = proyectos.find(p => p.rowIndex === rowIndex);
    if (!proyectoMovido) {
      throw new Error('Proyecto no encontrado');
    }
    
    const ordenActual = proyectoMovido.orden;
    
    // Convertir decimal a entero
    if (nuevoOrden % 1 !== 0) {
      nuevoOrden = Math.ceil(nuevoOrden);
    }
    
    // Manejar casos especiales
    const maxOrden = Math.max(...proyectos.map(p => p.orden));
    
    if (nuevoOrden > maxOrden) {
      nuevoOrden = maxOrden;
    } else if (nuevoOrden <= 0) {
      nuevoOrden = 1;
    }
    
    // Remover proyecto de su posición actual
    proyectos = proyectos.filter(p => p.rowIndex !== rowIndex);
    
    // Ajustar órdenes antes de insertar
    if (nuevoOrden < ordenActual) {
      proyectos.forEach(p => {
        if (p.orden >= nuevoOrden && p.orden < ordenActual) {
          p.orden++;
        }
      });
    } else if (nuevoOrden > ordenActual) {
      proyectos.forEach(p => {
        if (p.orden > ordenActual && p.orden <= nuevoOrden) {
          p.orden--;
        }
      });
    }
    
    // Insertar proyecto en nueva posición
    proyectoMovido.orden = nuevoOrden;
    proyectos.push(proyectoMovido);
    
    // Ordenar y renumerar secuencialmente
    proyectos.sort((a, b) => a.orden - b.orden);
    proyectos.forEach((p, index) => {
      p.orden = index + 1;
    });
    
    // Guardar todos los cambios
    proyectos.forEach(p => {
      sheet.getRange(p.rowIndex, 1).setValue(p.orden);
    });
    
    return obtenerProyectos();
    
  } catch (error) {
    throw new Error('Error al reordenar: ' + error.message);
  }
}

// RENUMERAR TODOS LOS PROYECTOS
function renumerarProyectos() {
  try {
    const sheet = getSheet();
    const proyectos = obtenerProyectos();
    
    proyectos.forEach((p, index) => {
      const nuevoOrden = index + 1;
      sheet.getRange(p.rowIndex, 1).setValue(nuevoOrden);
    });
    
    return obtenerProyectos();
    
  } catch (error) {
    throw new Error('Error al renumerar: ' + error.message);
  }
}

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
      doc = DocumentApp.create(`SC_${nombre}`);
      
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

// ============================================
// GENERADOR DE SOLID CODE
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
      throw new Error(`rowIndex fuera de rango: ${rowIndex} (válido: 2-${lastRow})`);
    }
    
    const proyecto = obtenerProyecto(rowIndex);
    
    // Fetch del contenido del LinkList
    let linkListContent;
    try {
      const response = UrlFetchApp.fetch(rawLinkListUrl.trim());
      linkListContent = response.getContentText();
    } catch (error) {
      throw new Error('No se pudo obtener el LinkList. Verifica que sea una URL raw válida de GitHub.');
    }
    
    // Guardar el LinkList en el Sheet
    sheet.getRange(rowIndex, 3).setValue(rawLinkListUrl);
    
    // Parsear links
    const links = linkListContent.split('\n')
      .map(link => link.trim())
      .filter(link => link !== '' && link.startsWith('http'));
    
    if (links.length === 0) {
      throw new Error('No se encontraron links válidos en el LinkList.');
    }
    
    // Generar código consolidado
    let solidCode = `// ============================================\n`;
    solidCode += `// SOLID CODE - ${proyecto.nombre.toUpperCase()}\n`;
    solidCode += `// Generado: ${new Date().toLocaleString('es-PE', {timeZone: 'America/Lima'})}\n`;
    solidCode += `// Total de archivos: ${links.length}\n`;
    solidCode += `// ============================================\n\n`;
    
    // Fetch cada archivo
    for (let i = 0; i < links.length; i++) {
      const url = links[i];
      
      try {
        const fileName = url.split('/').pop();
        
        solidCode += `\n\n// ============================================\n`;
        solidCode += `// ARCHIVO ${i + 1}/${links.length}: ${fileName}\n`;
        solidCode += `// URL: ${url}\n`;
        solidCode += `// ============================================\n\n`;
        
        const response = UrlFetchApp.fetch(url);
        const content = response.getContentText();
        
        solidCode += content;
        
      } catch (error) {
        solidCode += `\n// ERROR: No se pudo obtener el archivo\n`;
        solidCode += `// ${error.message}\n`;
      }
    }
    
    solidCode += `\n\n// ============================================\n`;
    solidCode += `// FIN DEL SOLID CODE\n`;
    solidCode += `// Tamaño total: ${solidCode.length.toLocaleString()} caracteres\n`;
    solidCode += `// ============================================\n`;
    
    // Guardar en Google Doc
    const docInfo = guardarSolidCodeEnDoc(proyecto.solidCode, proyecto.nombre, solidCode);
    
    // Actualizar Sheet con el Doc ID
    sheet.getRange(rowIndex, 4).setValue(docInfo.docId);
    
    return {
      success: true,
      message: `SolidCode generado con ${links.length} archivo(s) (${solidCode.length.toLocaleString()} caracteres)`,
      solidCode: solidCode,
      docId: docInfo.docId,
      docUrl: docInfo.docUrl
    };
    
  } catch (error) {
    throw new Error(error.message || 'Error al generar SolidCode');
  }
}

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
      throw new Error(`rowIndex fuera de rango: ${rowIndex} (válido: 2-${lastRow})`);
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
      message: `SolidCode cargado (${contenido.length.toLocaleString()} caracteres)`
    };
    
  } catch (error) {
    throw new Error('Error al cargar SolidCode: ' + error.message);
  }
}

// ============================================
// GENERADOR DE LINKLIST DESDE GITHUB TREE (NUEVO)
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
    
    // Hacer request a la API
    const response = UrlFetchApp.fetch(apiUrl);
    const data = JSON.parse(response.getContentText());
    
    // Verificar que haya datos
    if (!data.tree || data.tree.length === 0) {
      throw new Error('No se encontraron archivos en el repositorio');
    }
    
    // Filtrar solo archivos (type: "blob") y excluir carpetas especiales
    const archivos = data.tree.filter(item => {
      // Solo archivos (blob), no carpetas (tree)
      if (item.type !== 'blob') return false;
      
      // Excluir carpetas/archivos especiales
      if (item.path.startsWith('.git/')) return false;
      if (item.path.includes('node_modules/')) return false;
      if (item.path.startsWith('.')) return false; // Archivos ocultos como .gitignore
      
      return true;
    });
    
    // Generar raw links
    const rawLinks = archivos.map(item => {
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

// ============================================
// BATERÍA DE PRUEBAS COMPLETA
// ============================================

function testCompleto() {
  Logger.log('╔════════════════════════════════════════════════════════════╗');
  Logger.log('║     CODEHUBBER v2.3 - BATERÍA DE PRUEBAS COMPLETA         ║');
  Logger.log('╚════════════════════════════════════════════════════════════╝');
  Logger.log('');
  
  let testsPasados = 0;
  let testsFallados = 0;
  
  // ============================================
  // TEST 1: OBTENER PROYECTOS
  // ============================================
  Logger.log('📋 TEST 1: obtenerProyectos()');
  try {
    const proyectos = obtenerProyectos();
    Logger.log('  ✅ PASÓ - Proyectos obtenidos: ' + proyectos.length);
    if (proyectos.length > 0) {
      Logger.log('  📊 Primer proyecto: ' + proyectos[0].nombre);
    }
    testsPasados++;
  } catch (error) {
    Logger.log('  ❌ FALLÓ - ' + error.message);
    testsFallados++;
  }
  Logger.log('');
  
  // ============================================
  // TEST 2: OBTENER PROYECTO ESPECÍFICO
  // ============================================
  Logger.log('🔍 TEST 2: obtenerProyecto(rowIndex)');
  try {
    const proyectos = obtenerProyectos();
    if (proyectos.length > 0) {
      const proyecto = obtenerProyecto(proyectos[0].rowIndex);
      Logger.log('  ✅ PASÓ - Proyecto: ' + proyecto.nombre);
      Logger.log('  📊 RowIndex: ' + proyecto.rowIndex);
      testsPasados++;
    } else {
      Logger.log('  ⚠️ SALTADO - No hay proyectos para probar');
    }
  } catch (error) {
    Logger.log('  ❌ FALLÓ - ' + error.message);
    testsFallados++;
  }
  Logger.log('');
  
  // ============================================
  // TEST 3: CREAR PROYECTO TEMPORAL
  // ============================================
  Logger.log('➕ TEST 3: crearProyecto(nombre)');
  let proyectoTestRowIndex = null;
  try {
    const proyectosAntes = obtenerProyectos().length;
    const resultado = crearProyecto('TEST_TEMPORAL_' + new Date().getTime());
    const proyectosDespues = obtenerProyectos().length;
    
    if (proyectosDespues === proyectosAntes + 1) {
      Logger.log('  ✅ PASÓ - Proyecto creado correctamente');
      proyectoTestRowIndex = resultado[resultado.length - 1].rowIndex;
      Logger.log('  📊 RowIndex del proyecto test: ' + proyectoTestRowIndex);
      testsPasados++;
    } else {
      throw new Error('El número de proyectos no aumentó');
    }
  } catch (error) {
    Logger.log('  ❌ FALLÓ - ' + error.message);
    testsFallados++;
  }
  Logger.log('');
  
  // ============================================
  // TEST 4: ACTUALIZAR CAMPO
  // ============================================
  Logger.log('✏️ TEST 4: actualizarCampo(rowIndex, campo, valor)');
  try {
    if (proyectoTestRowIndex) {
      const valorTest = 'Info de prueba - ' + new Date().toLocaleString();
      const resultado = actualizarCampo(proyectoTestRowIndex, 'info', valorTest);
      
      if (resultado.info === valorTest) {
        Logger.log('  ✅ PASÓ - Campo actualizado correctamente');
        Logger.log('  📊 Valor guardado: ' + resultado.info.substring(0, 30) + '...');
        testsPasados++;
      } else {
        throw new Error('El valor no se guardó correctamente');
      }
    } else {
      Logger.log('  ⚠️ SALTADO - No hay proyecto de prueba');
    }
  } catch (error) {
    Logger.log('  ❌ FALLÓ - ' + error.message);
    testsFallados++;
  }
  Logger.log('');
  
  // ============================================
  // TEST 5: REORDENAR PROYECTO
  // ============================================
  Logger.log('🔄 TEST 5: reordenarProyecto(rowIndex, nuevoOrden)');
  try {
    if (proyectoTestRowIndex) {
      const ordenAntes = obtenerProyecto(proyectoTestRowIndex).orden;
      reordenarProyecto(proyectoTestRowIndex, 1);
      const ordenDespues = obtenerProyecto(proyectoTestRowIndex).orden;
      
      if (ordenDespues === 1) {
        Logger.log('  ✅ PASÓ - Proyecto reordenado correctamente');
        Logger.log('  📊 Orden antes: ' + ordenAntes + ', después: ' + ordenDespues);
        testsPasados++;
      } else {
        throw new Error('El orden no cambió como se esperaba');
      }
    } else {
      Logger.log('  ⚠️ SALTADO - No hay proyecto de prueba');
    }
  } catch (error) {
    Logger.log('  ❌ FALLÓ - ' + error.message);
    testsFallados++;
  }
  Logger.log('');
  
  // ============================================
  // TEST 6: API DE GITHUB - EXTRAER INFO URL
  // ============================================
  Logger.log('🔗 TEST 6: extraerInfoGitHub(url)');
  try {
    const testUrl = 'https://github.com/koki81pe/CodeHubber/tree/main';
    const info = extraerInfoGitHub(testUrl);
    
    if (info.user === 'koki81pe' && info.repo === 'CodeHubber' && info.branch === 'main') {
      Logger.log('  ✅ PASÓ - Información extraída correctamente');
      Logger.log('  📊 User: ' + info.user + ', Repo: ' + info.repo + ', Branch: ' + info.branch);
      testsPasados++;
    } else {
      throw new Error('La información extraída no es correcta');
    }
  } catch (error) {
    Logger.log('  ❌ FALLÓ - ' + error.message);
    testsFallados++;
  }
  Logger.log('');
  
  // ============================================
  // TEST 7: API DE GITHUB - GENERAR LINKLIST
  // ============================================
  Logger.log('🌐 TEST 7: generarLinkListDesdeTree(treeUrl)');
  try {
    const testUrl = 'https://github.com/koki81pe/CodeHubber/tree/main';
    const resultado = generarLinkListDesdeTree(testUrl);
    
    if (resultado.success && resultado.totalArchivos > 0) {
      Logger.log('  ✅ PASÓ - LinkList generado correctamente');
      Logger.log('  📊 Total archivos: ' + resultado.totalArchivos);
      Logger.log('  📊 Primeros 200 chars del LinkList:');
      Logger.log('  ' + resultado.linkList.substring(0, 200) + '...');
      testsPasados++;
    } else {
      throw new Error('No se generó el LinkList correctamente');
    }
  } catch (error) {
    Logger.log('  ❌ FALLÓ - ' + error.message);
    testsFallados++;
  }
  Logger.log('');
  
  // ============================================
  // TEST 8: ELIMINAR PROYECTO TEMPORAL
  // ============================================
  Logger.log('🗑️ TEST 8: eliminarProyecto(rowIndex)');
  try {
    if (proyectoTestRowIndex) {
      const proyectosAntes = obtenerProyectos().length;
      eliminarProyecto(proyectoTestRowIndex);
      const proyectosDespues = obtenerProyectos().length;
      
      if (proyectosDespues === proyectosAntes - 1) {
        Logger.log('  ✅ PASÓ - Proyecto eliminado correctamente');
        Logger.log('  📊 Proyectos antes: ' + proyectosAntes + ', después: ' + proyectosDespues);
        testsPasados++;
      } else {
        throw new Error('El proyecto no se eliminó correctamente');
      }
    } else {
      Logger.log('  ⚠️ SALTADO - No hay proyecto de prueba para eliminar');
    }
  } catch (error) {
    Logger.log('  ❌ FALLÓ - ' + error.message);
    testsFallados++;
  }
  Logger.log('');
  
  // ============================================
  // RESUMEN
  // ============================================
  Logger.log('');
  Logger.log('╔════════════════════════════════════════════════════════════╗');
  Logger.log('║                    RESUMEN DE PRUEBAS                      ║');
  Logger.log('╚════════════════════════════════════════════════════════════╝');
  Logger.log('');
  Logger.log('✅ Tests pasados: ' + testsPasados);
  Logger.log('❌ Tests fallados: ' + testsFallados);
  Logger.log('📊 Total de tests: ' + (testsPasados + testsFallados));
  Logger.log('');
  
  if (testsFallados === 0) {
    Logger.log('🎉🎉🎉 ¡TODOS LOS TESTS PASARON! 🎉🎉🎉');
  } else {
    Logger.log('⚠️ Algunos tests fallaron. Revisa los errores arriba.');
  }
  
  Logger.log('');
  Logger.log('════════════════════════════════════════════════════════════');
}
