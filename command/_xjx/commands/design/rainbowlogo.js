const {
  createCanvas
} = require("@napi-rs/canvas");
const config = require("../../config");
function getBotName() {
  return config.botName || "JuneX-Ultra";
}
function getFooter() {
  return "> Powered by " + (config.botName || "JuneX-Ultra");
}
function addWatermark(v1, v2, v3, v4 = config.botName || "JuneX-Ultra") {
  v1.save();
  v1.shadowColor = "transparent";
  v1.shadowBlur = 0;
  v1.globalAlpha = 0.6;
  v1.font = "bold 16px Arial";
  v1.textAlign = 'center';
  v1.textBaseline = 'bottom';
  v1.fillStyle = "#FFFFFF";
  v1.strokeStyle = "#000000";
  v1.lineWidth = 2;
  v1.strokeText(v4, v2 / 2, v3 - 10);
  v1.fillText(v4, v2 / 2, v3 - 10);
  v1.restore();
}
module.exports = {
  'name': "rainbowlogo",
  'description': "Create vibrant rainbow text logos with colorful spectrum effects",
  'category': "design",
  async 'execute'(v5, v6, v7) {
    const v8 = v6.key.remoteJid;
    try {
      if (v7.length === 0) {
        await v5.sendMessage(v8, {
          'text': "🌈 *RAINBOW LOGO*\n\n*rainbow*\nrainbow <text>\n\n*Example:*\nrainbow COLOR\nrainbow RAINBOW\nrainbow SPECTRUM\n\n" + ("> Powered by " + (config.botName || "JuneX-Ultra"))
        }, {
          'quoted': v6
        });
        return;
      }
      const v9 = v7.join(" ");
      if (v9.length > 10) {
        await v5.sendMessage(v8, {
          'text': "❌ *ERROR*\n\nText too long!\nMaximum 10 characters\nYour text: \"" + v9 + "\" (" + v9.length + " chars)"
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
      const v10 = await generateRainbowLogo(v9);
      await v5.sendMessage(v8, {
        'image': v10,
        'caption': "🌈 *Rainbow Logo Generated!*\nText: " + v9 + "\n\n_Created by " + (config.botName || "JuneX-Ultra") + '_'
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
      console.error("❌ [RAINBOWLOGO] ERROR:", v11);
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
async function generateRainbowLogo(v12) {
  const v13 = createCanvas(800, 400);
  const v14 = v13.getContext('2d');
  createRainbowBackground(v14, 800, 400);
  drawRainbowArcs(v14, 800, 400);
  drawRainbowText(v14, v12, 800, 400);
  addColorParticles(v14, 800, 400);
  addSparkles(v14, 800, 400);
  addColorBursts(v14, 800, 400);
  addColorWaves(v14, 800, 400);
  addPrismEffects(v14, 800, 400);
  drawRainbowBorder(v14, 800, 400);
  addRainbowSignature(v14, 800, 400);
  addWatermark(v14, 800, 400);
  return v13.toBuffer("image/png");
}
function createRainbowBackground(v15, v16, v17) {
  const v18 = v15.createLinearGradient(0, 0, v16, v17);
  v18.addColorStop(0, '#ff0080');
  v18.addColorStop(0.2, "#ff00ff");
  v18.addColorStop(0.4, "#8000ff");
  v18.addColorStop(0.6, "#0080ff");
  v18.addColorStop(0.8, '#00ff80');
  v18.addColorStop(1, "#ffff00");
  v15.fillStyle = v18;
  v15.fillRect(0, 0, v16, v17);
  addColorClouds(v15, v16, v17);
}
function addColorClouds(v19, v20, v21) {
  v19.save();
  v19.globalAlpha = 0.3;
  v19.globalCompositeOperation = "screen";
  const v22 = [{
    'x': v20 * 0.2,
    'y': v21 * 0.3,
    'size': 0x78,
    'color': [255, 0, 128]
  }, {
    'x': v20 * 0.7,
    'y': v21 * 0.2,
    'size': 0x64,
    'color': [128, 0, 255]
  }, {
    'x': v20 * 0.3,
    'y': v21 * 0.7,
    'size': 0x6e,
    'color': [0, 128, 255]
  }, {
    'x': v20 * 0.8,
    'y': v21 * 0.6,
    'size': 0x5a,
    'color': [0, 255, 128]
  }, {
    'x': v20 * 0.5,
    'y': v21 * 0.4,
    'size': 0x82,
    'color': [255, 255, 0]
  }];
  v22.forEach(v23 => {
    const [v24, v25, v26] = v23.color;
    const v27 = v19.createRadialGradient(v23.x, v23.y, 0, v23.x, v23.y, v23.size);
    v27.addColorStop(0, "rgba(" + v24 + ", " + v25 + ", " + v26 + ", 0.6)");
    v27.addColorStop(1, "transparent");
    v19.fillStyle = v27;
    v19.beginPath();
    v19.arc(v23.x, v23.y, v23.size, 0, Math.PI * 2);
    v19.fill();
  });
  v19.restore();
}
function drawRainbowArcs(v28, v29, v30) {
  const v31 = v29 / 2;
  const v32 = v30 * 0.6;
  const v33 = Math.min(v29, v30) * 0.8;
  v28.save();
  v28.globalAlpha = 0.7;
  const v34 = ['#ff0000', "#ff7f00", '#ffff00', '#00ff00', '#0000ff', "#4b0082", "#8b00ff"];
  v34.forEach((v35, v36) => {
    const v37 = v33 - v36 * 25;
    const v38 = Math.PI * 0.1;
    const v39 = Math.PI * 0.9;
    v28.strokeStyle = v35;
    v28.lineWidth = 20;
    v28.lineCap = "round";
    v28.beginPath();
    v28.arc(v31, v32, v37, v38, v39);
    v28.stroke();
  });
  v28.shadowColor = '#ffffff';
  v28.shadowBlur = 30;
  v34.forEach((v40, v41) => {
    const v42 = v33 - v41 * 25;
    const v43 = Math.PI * 0.1;
    const v44 = Math.PI * 0.9;
    v28.strokeStyle = v40;
    v28.lineWidth = 15;
    v28.beginPath();
    v28.arc(v31, v32, v42, v43, v44);
    v28.stroke();
  });
  v28.restore();
}
function drawRainbowText(v45, v46, v47, v48) {
  const v49 = v47 * 0.5;
  const v50 = v48 * 0.5;
  v45.save();
  v45.shadowColor = "rgba(0, 0, 0, 0.5)";
  v45.shadowBlur = 20;
  v45.shadowOffsetX = 5;
  v45.shadowOffsetY = 5;
  const v51 = v45.createLinearGradient(v49 - 150, v50 - 50, v49 + 150, v50 + 50);
  v51.addColorStop(0, "#ff0000");
  v51.addColorStop(0.16, "#ff7f00");
  v51.addColorStop(0.33, "#ffff00");
  v51.addColorStop(0.5, "#00ff00");
  v51.addColorStop(0.66, "#0000ff");
  v51.addColorStop(0.83, "#4b0082");
  v51.addColorStop(1, '#8b00ff');
  v45.font = "bold 72px \"Arial\"";
  v45.textAlign = "center";
  v45.textBaseline = "middle";
  v45.fillStyle = v51;
  v45.fillText(v46.toUpperCase(), v49, v50);
  v45.shadowColor = "transparent";
  v45.shadowBlur = 0;
  v45.shadowOffsetX = 0;
  v45.shadowOffsetY = 0;
  v45.strokeStyle = "rgba(255, 255, 255, 0.8)";
  v45.lineWidth = 3;
  v45.strokeText(v46.toUpperCase(), v49, v50);
  v45.strokeStyle = "rgba(255, 255, 255, 0.4)";
  v45.lineWidth = 1;
  v45.strokeText(v46.toUpperCase(), v49, v50);
  addCharacterColorEffects(v45, v46, v49, v50);
  v45.restore();
}
function addCharacterColorEffects(v52, v53, v54, v55) {
  v52.save();
  v52.globalCompositeOperation = 'screen';
  const v56 = v52.measureText(v53.toUpperCase());
  const v57 = v56.width;
  const v58 = v57 / v53.length;
  for (let v59 = 0; v59 < v53.length; v59++) {
    const v60 = v54 - v57 / 2 + (v59 + 0.5) * v58;
    const v61 = v59 * 360 / v53.length % 360;
    const v62 = v52.createRadialGradient(v60, v55, 0, v60, v55, 40);
    v62.addColorStop(0, "hsla(" + v61 + ", 100%, 70%, 0.6)");
    v62.addColorStop(1, "transparent");
    v52.fillStyle = v62;
    v52.beginPath();
    v52.arc(v60, v55, 40, 0, Math.PI * 2);
    v52.fill();
  }
  v52.restore();
}
function addColorParticles(v63, v64, v65) {
  v63.save();
  v63.globalCompositeOperation = 'screen';
  for (let v66 = 0; v66 < 25; v66++) {
    const v67 = Math.random() * v64;
    const v68 = Math.random() * v65;
    const v69 = 8 + Math.random() * 20;
    const v70 = Math.random() * 360;
    const v71 = 80 + Math.random() * 20;
    const v72 = v63.createRadialGradient(v67, v68, 0, v67, v68, v69);
    v72.addColorStop(0, "hsla(" + v70 + ", " + v71 + "%, 70%, 0.8)");
    v72.addColorStop(1, 'hsla(' + v70 + ", " + v71 + "%, 50%, 0.3)");
    v63.fillStyle = v72;
    v63.beginPath();
    v63.arc(v67, v68, v69, 0, Math.PI * 2);
    v63.fill();
    v63.fillStyle = 'hsla(' + v70 + ", 100%, 90%, 0.9)";
    v63.beginPath();
    v63.arc(v67, v68, v69 * 0.3, 0, Math.PI * 2);
    v63.fill();
  }
  for (let v73 = 0; v73 < 50; v73++) {
    const v74 = Math.random() * v64;
    const v75 = Math.random() * v65;
    const v76 = 3 + Math.random() * 10;
    const v77 = Math.random() * 360;
    v63.fillStyle = 'hsla(' + v77 + ", 100%, 70%, 0.7)";
    v63.beginPath();
    v63.arc(v74, v75, v76, 0, Math.PI * 2);
    v63.fill();
  }
  for (let v78 = 0; v78 < 100; v78++) {
    const v79 = Math.random() * v64;
    const v80 = Math.random() * v65;
    const v81 = 1 + Math.random() * 4;
    const v82 = Math.random() * 360;
    v63.fillStyle = "hsla(" + v82 + ", 100%, 80%, 0.9)";
    v63.beginPath();
    v63.arc(v79, v80, v81, 0, Math.PI * 2);
    v63.fill();
  }
  v63.restore();
}
function addSparkles(v83, v84, v85) {
  v83.save();
  v83.globalCompositeOperation = 'screen';
  for (let v86 = 0; v86 < 40; v86++) {
    const v87 = Math.random() * v84;
    const v88 = Math.random() * v85;
    const v89 = 1 + Math.random() * 3;
    const v90 = Math.random() * 360;
    const v91 = Math.random() * Math.PI * 2;
    v83.save();
    v83.translate(v87, v88);
    v83.rotate(v91);
    v83.fillStyle = 'hsla(' + v90 + ", 100%, 80%, 0.9)";
    v83.beginPath();
    for (let v92 = 0; v92 < 5; v92++) {
      const v93 = v92 * Math.PI * 2 / 5;
      const v94 = v89 * 2;
      v83.lineTo(Math.cos(v93) * v94, Math.sin(v93) * v94);
      v83.lineTo(Math.cos(v93 + Math.PI / 5) * v89, Math.sin(v93 + Math.PI / 5) * v89);
    }
    v83.closePath();
    v83.fill();
    v83.fillStyle = "hsla(" + v90 + ", 100%, 70%, 0.4)";
    v83.beginPath();
    v83.arc(0, 0, v89 * 3, 0, Math.PI * 2);
    v83.fill();
    v83.restore();
  }
  v83.restore();
}
function addColorBursts(v95, v96, v97) {
  v95.save();
  v95.globalCompositeOperation = "screen";
  v95.globalAlpha = 0.4;
  const v98 = [{
    'x': v96 * 0.3,
    'y': v97 * 0.3
  }, {
    'x': v96 * 0.7,
    'y': v97 * 0.7
  }, {
    'x': v96 * 0.2,
    'y': v97 * 0.7
  }, {
    'x': v96 * 0.8,
    'y': v97 * 0.3
  }];
  v98.forEach((v99, v100) => {
    const v101 = v100 * 90 % 360;
    for (let v102 = 0; v102 < 12; v102++) {
      const v103 = v102 / 12 * Math.PI * 2;
      const v104 = 80 + Math.random() * 70;
      const v105 = (v101 + v102 * 30) % 360;
      const v106 = v95.createLinearGradient(v99.x, v99.y, v99.x + Math.cos(v103) * v104, v99.y + Math.sin(v103) * v104);
      v106.addColorStop(0, "hsla(" + v105 + ", 100%, 70%, 0.8)");
      v106.addColorStop(0.7, 'hsla(' + v105 + ", 100%, 50%, 0.4)");
      v106.addColorStop(1, "transparent");
      v95.strokeStyle = v106;
      v95.lineWidth = 6;
      v95.lineCap = "round";
      v95.beginPath();
      v95.moveTo(v99.x, v99.y);
      v95.lineTo(v99.x + Math.cos(v103) * v104, v99.y + Math.sin(v103) * v104);
      v95.stroke();
    }
  });
  v95.restore();
}
function addColorWaves(v107, v108, v109) {
  v107.save();
  v107.globalCompositeOperation = "screen";
  v107.globalAlpha = 0.3;
  for (let v110 = 0; v110 < 4; v110++) {
    const v111 = v109 * 0.2 + v110 * 40;
    const v112 = 15 + v110 * 5;
    const v113 = 0.02 + v110 * 0.01;
    v107.beginPath();
    for (let v114 = 0; v114 <= v108; v114 += 2) {
      const v115 = v111 + Math.sin(v114 * v113 + v110) * v112;
      const v116 = (v114 / v108 * 360 + v110 * 90) % 360;
      if (v114 === 0) {
        v107.moveTo(v114, v115);
      } else {
        v107.strokeStyle = "hsla(" + v116 + ", 100%, 70%, 0.6)";
        v107.lineTo(v114, v115);
        v107.stroke();
        v107.beginPath();
        v107.moveTo(v114, v115);
      }
    }
  }
  v107.restore();
}
function addPrismEffects(v117, v118, v119) {
  v117.save();
  v117.globalCompositeOperation = "screen";
  v117.globalAlpha = 0.2;
  const v120 = v118 * 0.5;
  const v121 = v119 * 0.5;
  const v122 = [{
    'angle': -0.3,
    'hue': 0x0,
    'length': 0xc8
  }, {
    'angle': -0.1,
    'hue': 0x3c,
    'length': 0xb4
  }, {
    'angle': 0.1,
    'hue': 0x78,
    'length': 0xa0
  }, {
    'angle': 0.3,
    'hue': 0xf0,
    'length': 0x8c
  }];
  v122.forEach(v123 => {
    const v124 = v117.createLinearGradient(v120, v121, v120 + Math.cos(v123.angle) * v123.length, v121 + Math.sin(v123.angle) * v123.length);
    v124.addColorStop(0, "hsla(" + v123.hue + ", 100%, 70%, 0.6)");
    v124.addColorStop(0.7, "hsla(" + v123.hue + ", 100%, 50%, 0.3)");
    v124.addColorStop(1, "transparent");
    v117.strokeStyle = v124;
    v117.lineWidth = 12;
    v117.lineCap = "round";
    v117.beginPath();
    v117.moveTo(v120, v121);
    v117.lineTo(v120 + Math.cos(v123.angle) * v123.length, v121 + Math.sin(v123.angle) * v123.length);
    v117.stroke();
    v117.strokeStyle = "hsla(" + v123.hue + ", 100%, 70%, 0.3)";
    v117.lineWidth = 25;
    v117.beginPath();
    v117.moveTo(v120, v121);
    v117.lineTo(v120 + Math.cos(v123.angle) * v123.length, v121 + Math.sin(v123.angle) * v123.length);
    v117.stroke();
  });
  const v125 = v117.createRadialGradient(v120, v121, 0, v120, v121, 60);
  v125.addColorStop(0, "rgba(255, 255, 255, 0.8)");
  v125.addColorStop(1, "transparent");
  v117.fillStyle = v125;
  v117.beginPath();
  v117.arc(v120, v121, 60, 0, Math.PI * 2);
  v117.fill();
  v117.restore();
}
function drawRainbowBorder(v126, v127, v128) {
  v126.save();
  const v129 = v126.createLinearGradient(0, 0, v127, 0);
  v129.addColorStop(0, '#ff0000');
  v129.addColorStop(0.16, "#ff7f00");
  v129.addColorStop(0.33, '#ffff00');
  v129.addColorStop(0.5, '#00ff00');
  v129.addColorStop(0.66, "#0000ff");
  v129.addColorStop(0.83, "#4b0082");
  v129.addColorStop(1, "#8b00ff");
  v126.strokeStyle = v129;
  v126.lineWidth = 10;
  v126.shadowColor = "rgba(255, 255, 255, 0.6)";
  v126.shadowBlur = 25;
  v126.strokeRect(10, 10, v127 - 20, v128 - 20);
  const v130 = v126.createLinearGradient(v127, 0, 0, v128);
  v130.addColorStop(0, "#8b00ff");
  v130.addColorStop(0.16, "#4b0082");
  v130.addColorStop(0.33, "#0000ff");
  v130.addColorStop(0.5, "#00ff00");
  v130.addColorStop(0.66, '#ffff00');
  v130.addColorStop(0.83, "#ff7f00");
  v130.addColorStop(1, '#ff0000');
  v126.strokeStyle = v130;
  v126.lineWidth = 3;
  v126.shadowBlur = 15;
  v126.strokeRect(20, 20, v127 - 40, v128 - 40);
  addCornerRainbowAccents(v126, v127, v128);
  v126.restore();
}
function addCornerRainbowAccents(v131, v132, v133) {
  v131.save();
  v131.globalAlpha = 0.7;
  const v134 = [{
    'x': 0x19,
    'y': 0x19
  }, {
    'x': v132 - 25,
    'y': 0x19
  }, {
    'x': 0x19,
    'y': v133 - 25
  }, {
    'x': v132 - 25,
    'y': v133 - 25
  }];
  v134.forEach((v135, v136) => {
    const v137 = v136 * 90 % 360;
    for (let v138 = 0; v138 < 3; v138++) {
      const v139 = 15 + v138 * 8;
      const v140 = (v137 + v138 * 120) % 360;
      v131.strokeStyle = "hsla(" + v140 + ", 100%, 70%, 0.8)";
      v131.lineWidth = 3;
      v131.beginPath();
      v131.arc(v135.x, v135.y, v139, 0, Math.PI * 0.5);
      v131.stroke();
    }
  });
  v131.restore();
}
function addRainbowSignature(v141, v142, v143) {
  v141.save();
  const v144 = v142 - 110;
  const v145 = v143 - 25;
  v141.font = "italic 14px \"Arial\"";
  v141.textAlign = "right";
  v141.textBaseline = 'bottom';
  const v146 = v141.createLinearGradient(v144 - 100, v145, v144, v145);
  v146.addColorStop(0, "#ff0000");
  v146.addColorStop(0.16, "#ff7f00");
  v146.addColorStop(0.33, "#ffff00");
  v146.addColorStop(0.5, '#00ff00');
  v146.addColorStop(0.66, '#0000ff');
  v146.addColorStop(0.83, "#4b0082");
  v146.addColorStop(1, '#8b00ff');
  v141.fillStyle = v146;
  v141.shadowColor = "rgba(255, 255, 255, 0.5)";
  v141.shadowBlur = 10;
  v141.fillText("by " + (config.botName || "JuneX-Ultra"), v144, v145);
  const v147 = v144 - 105;
  const v148 = v145 + 2;
  const v149 = v141.createLinearGradient(v147, v148, v147 + 20, v148);
  v149.addColorStop(0, "#ff0000");
  v149.addColorStop(0.16, "#ff7f00");
  v149.addColorStop(0.33, "#ffff00");
  v149.addColorStop(0.5, '#00ff00');
  v149.addColorStop(0.66, "#0000ff");
  v149.addColorStop(0.83, "#4b0082");
  v149.addColorStop(1, '#8b00ff');
  v141.fillStyle = v149;
  v141.fillRect(v147, v148, 20, 4);
  v141.restore();
}
