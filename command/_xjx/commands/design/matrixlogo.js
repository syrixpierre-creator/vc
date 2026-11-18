const {
  createCanvas
} = require('@napi-rs/canvas');
const config = require('../../config');
function getBotName() {
  return config.botName || 'JuneX-Ultra';
}
function getFooter() {
  return "> Powered by " + (config.botName || 'JuneX-Ultra');
}
function addWatermark(v1, v2, v3, v4 = config.botName || 'JuneX-Ultra') {
  v1.save();
  v1.shadowColor = "transparent";
  v1.shadowBlur = 0;
  v1.globalAlpha = 0.6;
  v1.font = "bold 16px Arial";
  v1.textAlign = "center";
  v1.textBaseline = "bottom";
  v1.fillStyle = '#FFFFFF';
  v1.strokeStyle = "#000000";
  v1.lineWidth = 2;
  v1.strokeText(v4, v2 / 2, v3 - 10);
  v1.fillText(v4, v2 / 2, v3 - 10);
  v1.restore();
}
module.exports = {
  'name': "matrixlogo",
  'description': "Create Matrix-style digital rain text logos",
  'category': "design",
  async 'execute'(v5, v6, v7) {
    const v8 = v6.key.remoteJid;
    try {
      if (v7.length === 0) {
        await v5.sendMessage(v8, {
          'text': "🟢 *MATRIX LOGO*\n\n*matrixlogo*\nmatrixlogo <text>\n\n*Example:*\nmatrixlogo WOLF\nmatrixlogo MATRIX\nmatrixlogo NEO\n\n" + ("> Powered by " + (config.botName || 'JuneX-Ultra'))
        }, {
          'quoted': v6
        });
        return;
      }
      const v9 = v7.join(" ");
      if (v9.length > 12) {
        await v5.sendMessage(v8, {
          'text': "❌ *ERROR*\n\nText too long!\nMaximum 12 characters\nYour text: \"" + v9 + "\" (" + v9.length + " chars)"
        }, {
          'quoted': v6
        });
        return;
      }
      await v5.sendMessage(v8, {
        'react': {
          'text': '⏳',
          'key': v6.key
        }
      });
      const v10 = await generateMatrixLogo(v9);
      await v5.sendMessage(v8, {
        'image': v10,
        'caption': "🟢 *Matrix Logo Generated!*\nText: " + v9 + "\n\n_Created by " + (config.botName || 'JuneX-Ultra') + '_'
      }, {
        'quoted': v6
      });
      await v5.sendMessage(v8, {
        'react': {
          'text': '✅',
          'key': v6.key
        }
      });
    } catch (v11) {
      console.error("❌ [MATRIXLOGO] ERROR:", v11);
      await v5.sendMessage(v8, {
        'react': {
          'text': '❌',
          'key': v6.key
        }
      })["catch"](() => {});
      await v5.sendMessage(v8, {
        'text': "❌ *ERROR*\n\n" + v11.message + "\nPlease try again with shorter text"
      }, {
        'quoted': v6
      });
    }
  }
};
async function generateMatrixLogo(v12) {
  const v13 = createCanvas(800, 400);
  const v14 = v13.getContext('2d');
  v14.fillStyle = "#000000";
  v14.fillRect(0, 0, 800, 400);
  generateDigitalRain(v14, 800, 400);
  createMatrixText(v14, v12, 800, 400);
  addMatrixEffects(v14, 800, 400);
  addBinaryBackground(v14, 800, 400);
  addWatermark(v14, 800, 400);
  return v13.toBuffer("image/png");
}
function generateDigitalRain(v15, v16, v17) {
  const v18 = Math.floor(v16 / 20);
  const v19 = Array(v18).fill(1);
  for (let v20 = 0; v20 < 3; v20++) {
    const v21 = 12 - v20 * 2;
    const v22 = 0.3 + v20 * 0.2;
    v15.font = v21 + "px \"Courier New\", monospace";
    for (let v23 = 0; v23 < v19.length; v23++) {
      const v24 = "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789#$%&@*"[Math.floor(Math.random() * "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789#$%&@*".length)];
      const v25 = v23 * 20;
      const v26 = v19[v23] * v21;
      const v27 = v26 / v17;
      const v28 = v22 * (1 - v27);
      const v29 = Math.floor(100 + 155 * (1 - v27));
      v15.fillStyle = "rgba(0, " + v29 + ", 0, " + v28 + ')';
      v15.fillText(v24, v25, v26);
      if (v26 > v17 && Math.random() > 0.975) {
        v19[v23] = 0;
      }
      v19[v23]++;
    }
  }
}
function createMatrixText(v30, v31, v32, v33) {
  const v34 = v32 / 2;
  const v35 = v33 / 2;
  for (let v36 = 0; v36 < 5; v36++) {
    const v37 = (Math.random() - 0.5) * 4;
    const v38 = (Math.random() - 0.5) * 4;
    const v39 = 0.1 + v36 * 0.1;
    const v40 = ['#00FF00', "#00CC00", "#009900", "#00FF66", "#66FF00"];
    v30.fillStyle = '' + v40[v36] + Math.floor(v39 * 255).toString(16).padStart(2, '0');
    v30.font = "bold 70px \"Courier New\", monospace";
    v30.textAlign = "center";
    v30.textBaseline = "middle";
    v30.fillText(v31.toUpperCase(), v34 + v37, v35 + v38);
  }
  v30.fillStyle = '#00FF00';
  v30.font = "bold 72px \"Courier New\", monospace";
  v30.textAlign = "center";
  v30.textBaseline = "middle";
  v30.shadowColor = "#00FF00";
  v30.shadowBlur = 20;
  v30.fillText(v31.toUpperCase(), v34, v35);
  v30.shadowColor = 'transparent';
  v30.shadowBlur = 0;
  addTextGlitches(v30, v31, v32, v33);
}
function addTextGlitches(v41, v42, v43, v44) {
  const v45 = v43 / 2;
  const v46 = v44 / 2;
  const v47 = v41.measureText(v42.toUpperCase()).width;
  v41.save();
  for (let v48 = 0; v48 < 15; v48++) {
    const v49 = v45 - v47 / 2 + Math.random() * v47;
    const v50 = v46 - 35 + Math.random() * 70;
    const v51 = 2 + Math.random() * 8;
    const v52 = 1 + Math.random() * 3;
    const v53 = 0.3 + Math.random() * 0.7;
    v41.fillStyle = "rgba(0, 255, 0, " + v53 + ')';
    v41.fillRect(v49, v50, v51, v52);
  }
  for (let v54 = 0; v54 < 8; v54++) {
    const v55 = v45 - v47 / 2 + Math.random() * v47;
    const v56 = v46 + 40;
    const v57 = 10 + Math.floor(Math.random() * 20);
    const v58 = 2 + Math.random() * 3;
    v41.font = "12px \"Courier New\", monospace";
    v41.fillStyle = "#00FF00";
    for (let v59 = 0; v59 < v57; v59++) {
      const v60 = '01'[Math.floor(Math.random() * '01'.length)];
      const v61 = 1 - v59 / v57;
      v41.globalAlpha = v61;
      v41.fillText(v60, v55, v56 + v59 * v58);
    }
    v41.globalAlpha = 1;
  }
  v41.restore();
}
function addMatrixEffects(v62, v63, v64) {
  v62.strokeStyle = "rgba(0, 255, 0, 0.1)";
  v62.lineWidth = 1;
  for (let v65 = 0; v65 < v64; v65 += 4) {
    v62.beginPath();
    v62.moveTo(0, v65);
    v62.lineTo(v63, v65);
    v62.stroke();
  }
  for (let v66 = 0; v66 < 200; v66++) {
    const v67 = Math.random() * v63;
    const v68 = Math.random() * v64;
    const v69 = Math.random() * 2;
    const v70 = 0.1 + Math.random() * 0.3;
    v62.fillStyle = "rgba(0, 255, 0, " + v70 + ')';
    v62.fillRect(v67, v68, v69, v69);
  }
  for (let v71 = 0; v71 < 5; v71++) {
    const v72 = Math.random() * v63;
    const v73 = Math.random() * v64;
    const v74 = 50 + Math.random() * 100;
    const v75 = 2 + Math.random() * 5;
    const v76 = 0.05 + Math.random() * 0.1;
    v62.fillStyle = "rgba(255, 255, 255, " + v76 + ')';
    v62.fillRect(v72, v73, v74, v75);
  }
}
function addBinaryBackground(v77, v78, v79) {
  v77.save();
  v77.globalAlpha = 0.1;
  v77.font = "10px \"Courier New\", monospace";
  v77.fillStyle = '#00FF00';
  const v80 = Math.floor(v78 / 15);
  const v81 = Math.floor(v79 / 15);
  for (let v82 = 0; v82 < v80; v82++) {
    for (let v83 = 0; v83 < v81; v83++) {
      if (Math.random() > 0.7) {
        const v84 = '01'[Math.floor(Math.random() * '01'.length)];
        v77.fillText(v84, v82 * 15, v83 * 15);
      }
    }
  }
  v77.restore();
}
async function generateSimpleMatrixLogo(v85) {
  const v86 = createCanvas(600, 300);
  const v87 = v86.getContext('2d');
  v87.fillStyle = "#000000";
  v87.fillRect(0, 0, 600, 300);
  for (let v88 = 0; v88 < 50; v88++) {
    const v89 = Math.random() * 600;
    const v90 = Math.random() * 300;
    const v91 = 0.1 + Math.random() * 0.3;
    v87.fillStyle = "rgba(0, 255, 0, " + v91 + ')';
    v87.font = "12px \"Courier New\", monospace";
    v87.fillText(Math.random() > 0.5 ? '0' : '1', v89, v90);
  }
  v87.fillStyle = "#00FF00";
  v87.font = "bold 60px \"Courier New\", monospace";
  v87.textAlign = "center";
  v87.textBaseline = "middle";
  v87.shadowColor = "#00FF00";
  v87.shadowBlur = 15;
  v87.fillText(v85.toUpperCase(), 300, 150);
  v87.strokeStyle = "rgba(0, 255, 0, 0.1)";
  v87.lineWidth = 1;
  for (let v92 = 0; v92 < 300; v92 += 3) {
    v87.beginPath();
    v87.moveTo(0, v92);
    v87.lineTo(600, v92);
    v87.stroke();
  }
  return v86.toBuffer('image/png');
}
