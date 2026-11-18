const fs = require('fs');
const path = require("path");
const os = require('os');
const {
  exec
} = require("child_process");
const {
  promisify
} = require("util");
const execAsync = promisify(exec);
const {
  downloadMediaMessage
} = require("@whiskeysockets/baileys");
const TEMP_DIR = path.join(os.tmpdir(), "june-x-docconv");
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, {
    'recursive': true
  });
}
async function getLibreOfficeBin() {
  const v1 = ['soffice', "libreoffice", "/usr/bin/soffice", "/usr/lib/libreoffice/program/soffice"];
  for (const v2 of v1) {
    try {
      await execAsync(v2 + " --version");
      return v2;
    } catch {}
  }
  return null;
}
async function libreOfficeConvert(v3, v4, v5) {
  const v6 = await getLibreOfficeBin();
  if (!v6) {
    return false;
  }
  try {
    await execAsync(v6 + " --headless --convert-to " + v5 + " --outdir \"" + v4 + "\" \"" + v3 + "\"", {
      'timeout': 0xea60
    });
    return true;
  } catch (v7) {
    console.error("LibreOffice convert error:", v7.message);
    return false;
  }
}
function writeTmp(v8, v9) {
  const v10 = path.join(TEMP_DIR, "input_" + Date.now() + '_' + Math.random().toString(36).slice(2) + '.' + v9);
  fs.writeFileSync(v10, v8);
  return v10;
}
function cleanup(...v11) {
  for (const v12 of v11) {
    try {
      if (v12 && fs.existsSync(v12)) {
        fs.unlinkSync(v12);
      }
    } catch {}
  }
}
async function downloadDocument(v13, v14) {
  const v15 = v14.message?.['extendedTextMessage']?.["contextInfo"];
  if (!v15?.["quotedMessage"]) {
    return null;
  }
  const v16 = v15.quotedMessage.documentMessage || v15.quotedMessage.documentWithCaptionMessage?.["message"]?.["documentMessage"];
  if (!v16) {
    return null;
  }
  const v17 = {
    'key': {
      'remoteJid': v15.remoteJid || v14.key.remoteJid,
      'fromMe': false,
      'id': v15.stanzaId,
      'participant': v15.participant
    },
    'message': v15.quotedMessage
  };
  const v18 = await downloadMediaMessage(v17, "buffer", {}, {
    'logger': undefined
  });
  return {
    'buffer': v18,
    'docMsg': v16
  };
}
async function pdfToText(v19) {
  let v20;
  try {
    v20 = require("pdf-parse");
  } catch {
    throw new Error("pdf-parse is not installed. Run: npm i pdf-parse");
  }
  const v21 = Buffer.isBuffer(v19) ? v19 : Buffer.from(v19);
  const v22 = await v20(v21, {
    'version': "v1.10.100"
  });
  const v23 = (v22.text || '').trim();
  if (!v23) {
    throw new Error("No readable text found in PDF. It may be scanned/image-based.");
  }
  return v23;
}
async function textToExcel(v24, v25) {
  let v26;
  try {
    v26 = require('xlsx');
  } catch {
    throw new Error("xlsx is not installed. Run: npm i xlsx");
  }
  const v27 = v24.split("\n").map(v28 => v28.trimEnd()).filter(v29 => v29.length > 0);
  const v30 = v27.map(v31 => {
    const v32 = v31.split(/\t|\s{2,}/);
    return v32.length > 1 ? v32 : [v31];
  });
  const v33 = v26.utils.aoa_to_sheet(v30);
  const v34 = v30.reduce((v35, v36) => {
    v36.forEach((v37, v38) => {
      v35[v38] = Math.max(v35[v38] || 0, String(v37 || '').length);
    });
    return v35;
  }, []);
  v33['!cols'] = v34.map(v39 => ({
    'wch': Math.min(v39 + 2, 60)
  }));
  const v40 = v26.utils.book_new();
  v26.utils.book_append_sheet(v40, v33, "Sheet1");
  v26.writeFile(v40, v25);
}
async function textToWord(v41, v42) {
  let v43;
  let v44;
  let v45;
  let v46;
  try {
    ({
      Document: v43,
      Packer: v44,
      Paragraph: v45,
      TextRun: v46
    } = require("docx"));
  } catch {
    throw new Error("docx is not installed. Run: npm i docx");
  }
  const v47 = v41.split("\n").map(v48 => v48.trim());
  const v49 = v47.map(v50 => new v45({
    'children': [new v46({
      'text': v50,
      'size': 0x18,
      'font': "Calibri"
    })],
    'spacing': {
      'after': 0x78
    }
  }));
  const v51 = new v43({
    'sections': [{
      'properties': {},
      'children': v49
    }]
  });
  const v52 = await v44.toBuffer(v51);
  fs.writeFileSync(v42, v52);
}
async function docxToPdfNode(v53, v54) {
  let v55;
  let v56;
  try {
    v55 = require("mammoth");
  } catch {
    throw new Error("mammoth is not installed. Run: npm i mammoth");
  }
  try {
    v56 = require('pdfkit');
  } catch {
    throw new Error("pdfkit is not installed. Run: npm i pdfkit");
  }
  const v57 = await v55.extractRawText({
    'buffer': v53
  });
  const v58 = (v57.value || '').trim();
  if (!v58) {
    throw new Error("No readable text found in the Word document.");
  }
  await new Promise((v59, v60) => {
    const v61 = new v56({
      'margin': 0x32,
      'size': 'A4'
    });
    const v62 = fs.createWriteStream(v54);
    v61.pipe(v62);
    v61.font('Helvetica').fontSize(11);
    const v63 = v61.page.width - 100;
    v58.split("\n").forEach(v64 => {
      const v65 = v64.trim();
      if (v65 === '') {
        v61.moveDown(0.4);
      } else {
        v61.text(v65, {
          'width': v63,
          'lineGap': 0x3
        });
      }
    });
    v61.end();
    v62.on("finish", v59);
    v62.on('error', v60);
  });
}
async function excelToPdfNode(v66, v67) {
  let v68;
  let v69;
  try {
    v68 = require('xlsx');
  } catch {
    throw new Error("xlsx is not installed. Run: npm i xlsx");
  }
  try {
    v69 = require("pdfkit");
  } catch {
    throw new Error("pdfkit is not installed. Run: npm i pdfkit");
  }
  const v70 = v68.read(v66, {
    'type': 'buffer'
  });
  const v71 = v70.SheetNames[0];
  const v72 = v70.Sheets[v71];
  const v73 = v68.utils.sheet_to_json(v72, {
    'header': 0x1,
    'defval': ''
  });
  if (!v73.length) {
    throw new Error("Excel file appears to be empty.");
  }
  await new Promise((v74, v75) => {
    const v76 = new v69({
      'margin': 0x1e,
      'size': 'A4',
      'layout': "landscape"
    });
    const v77 = fs.createWriteStream(v67);
    v76.pipe(v77);
    v76.font("Helvetica").fontSize(9);
    const v78 = v76.page.width - 60;
    const v79 = v76.page.height - 60;
    const v80 = Math.max(...v73.map(v81 => v81.length));
    const v82 = v80 > 0 ? Math.floor(v78 / v80) : v78;
    v73.forEach((v83, v84) => {
      if (v76.y > v79 - 20) {
        v76.addPage();
      }
      let v85 = 30;
      const v86 = v76.y;
      let v87 = 14;
      v83.forEach((v88, v89) => {
        const v90 = String(v88 ?? '');
        const v91 = v76.heightOfString(v90, {
          'width': v82 - 4
        });
        v87 = Math.max(v87, v91 + 4);
        if (v84 === 0) {
          v76.font("Helvetica-Bold");
        } else {
          v76.font("Helvetica");
        }
        v76.text(v90, v85 + 2, v86, {
          'width': v82 - 4,
          'lineBreak': true
        });
        v85 += v82;
      });
      v76.y = v86 + v87;
      v76.x = 30;
      if (v84 === 0) {
        v76.moveTo(30, v76.y).lineTo(30 + v78, v76.y).stroke();
      }
    });
    v76.end();
    v77.on("finish", v74);
    v77.on('error', v75);
  });
}
async function convertWithFallback(v92, v93, v94, v95, v96) {
  const v97 = writeTmp(v94, v92);
  try {
    const v98 = await libreOfficeConvert(v97, TEMP_DIR, v93);
    if (v98) {
      const v99 = path.basename(v97, '.' + v92);
      const v100 = path.join(TEMP_DIR, v99 + '.' + v93);
      if (fs.existsSync(v100)) {
        fs.renameSync(v100, v95);
        cleanup(v97);
        return;
      }
    }
    await v96(v94, v95);
  } finally {
    cleanup(v97);
  }
}
module.exports = [{
  'name': "toexcel",
  'aliases': ["xlsx", "pdftoexcel"],
  'category': "convert",
  'description': "Convert a PDF to Excel (.xlsx)",
  'usage': ".toexcel (reply to a PDF)",
  async 'execute'(v101, v102, v103, v104) {
    const v105 = v104.from;
    const v106 = await downloadDocument(v101, v102);
    if (!v106) {
      return v104.reply("📎 Reply to a *PDF document* with *.toexcel*");
    }
    const {
      buffer: v107,
      docMsg: v108
    } = v106;
    if (!(v108.mimetype || '').includes("pdf")) {
      return v104.reply("❌ Only *PDF* files can be converted to Excel.");
    }
    await v101.sendMessage(v105, {
      'react': {
        'text': '⏳',
        'key': v102.key
      }
    });
    const v109 = path.join(TEMP_DIR, 'out_' + Date.now() + ".xlsx");
    try {
      const v110 = await pdfToText(v107);
      await textToExcel(v110, v109);
      await v101.sendMessage(v105, {
        'document': fs.readFileSync(v109),
        'mimetype': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        'fileName': "converted.xlsx",
        'caption': "✅ Converted to Excel."
      }, {
        'quoted': v102
      });
      await v101.sendMessage(v105, {
        'react': {
          'text': '✅',
          'key': v102.key
        }
      });
    } catch (v111) {
      console.error("toexcel error:", v111);
      await v104.reply("❌ Conversion failed: " + v111.message);
      await v101.sendMessage(v105, {
        'react': {
          'text': '❌',
          'key': v102.key
        }
      });
    } finally {
      cleanup(v109);
    }
  }
}, {
  'name': "toword",
  'aliases': ["docx2", "pdftoword"],
  'category': "convert",
  'description': "Convert a PDF to Word (.docx)",
  'usage': ".toword (reply to a PDF)",
  async 'execute'(v112, v113, v114, v115) {
    const v116 = v115.from;
    const v117 = await downloadDocument(v112, v113);
    if (!v117) {
      return v115.reply("📎 Reply to a *PDF document* with *.toword*");
    }
    const {
      buffer: v118,
      docMsg: v119
    } = v117;
    if (!(v119.mimetype || '').includes("pdf")) {
      return v115.reply("❌ Only *PDF* files can be converted to Word.");
    }
    await v112.sendMessage(v116, {
      'react': {
        'text': '⏳',
        'key': v113.key
      }
    });
    const v120 = path.join(TEMP_DIR, "out_" + Date.now() + ".docx");
    try {
      const v121 = await pdfToText(v118);
      await textToWord(v121, v120);
      await v112.sendMessage(v116, {
        'document': fs.readFileSync(v120),
        'mimetype': "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        'fileName': "converted.docx",
        'caption': "✅ Converted to Word."
      }, {
        'quoted': v113
      });
      await v112.sendMessage(v116, {
        'react': {
          'text': '✅',
          'key': v113.key
        }
      });
    } catch (v122) {
      console.error("toword error:", v122);
      await v115.reply("❌ Conversion failed: " + v122.message);
      await v112.sendMessage(v116, {
        'react': {
          'text': '❌',
          'key': v113.key
        }
      });
    } finally {
      cleanup(v120);
    }
  }
}, {
  'name': 'topdf',
  'aliases': ["converttopdf", "makepdf"],
  'category': "convert",
  'description': "Convert Word (.docx) or Excel (.xlsx) to PDF",
  'usage': ".topdf (reply to a .docx or .xlsx)",
  async 'execute'(v123, v124, v125, v126) {
    const v127 = v126.from;
    const v128 = await downloadDocument(v123, v124);
    if (!v128) {
      return v126.reply("📎 Reply to a *Word (.docx)* or *Excel (.xlsx)* with *.topdf*");
    }
    const {
      buffer: v129,
      docMsg: v130
    } = v128;
    const v131 = v130.mimetype || '';
    const v132 = (v130.fileName || '').toLowerCase();
    const v133 = v131.includes('wordprocessingml') || v131.includes("msword") || v132.endsWith('.docx') || v132.endsWith(".doc");
    const v134 = v131.includes("spreadsheetml") || v131.includes("ms-excel") || v132.endsWith(".xlsx") || v132.endsWith(".xls");
    if (!v133 && !v134) {
      return v126.reply("❌ Send a *Word (.docx)* or *Excel (.xlsx)* file.");
    }
    await v123.sendMessage(v127, {
      'react': {
        'text': '⏳',
        'key': v124.key
      }
    });
    const v135 = path.join(TEMP_DIR, "out_" + Date.now() + ".pdf");
    try {
      if (v133) {
        await convertWithFallback('docx', "pdf", v129, v135, docxToPdfNode);
      } else {
        await convertWithFallback("xlsx", "pdf", v129, v135, excelToPdfNode);
      }
      await v123.sendMessage(v127, {
        'document': fs.readFileSync(v135),
        'mimetype': 'application/pdf',
        'fileName': "converted.pdf",
        'caption': "✅ Converted to PDF."
      }, {
        'quoted': v124
      });
      await v123.sendMessage(v127, {
        'react': {
          'text': '✅',
          'key': v124.key
        }
      });
    } catch (v136) {
      console.error("topdf error:", v136);
      await v126.reply("❌ Conversion failed: " + v136.message);
      await v123.sendMessage(v127, {
        'react': {
          'text': '❌',
          'key': v124.key
        }
      });
    } finally {
      cleanup(v135);
    }
  }
}];
