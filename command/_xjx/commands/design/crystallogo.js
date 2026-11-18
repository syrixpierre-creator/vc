const {
  createCanvas
} = require('@napi-rs/canvas');
const config = require('../../config');
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
  v1.textAlign = "center";
  v1.textBaseline = "bottom";
  v1.fillStyle = "#FFFFFF";
  v1.strokeStyle = "#000000";
  v1.lineWidth = 2;
  v1.strokeText(v4, v2 / 2, v3 - 10);
  v1.fillText(v4, v2 / 2, v3 - 10);
  v1.restore();
}
module.exports = {
  'name': 'crystallogo',
  'category': 'design',
  'description': "Create stunning crystal text logos with gemstone and refractive effects",
  async 'execute'(v5, v6, v7) {
    const v8 = v6.key.remoteJid;
    try {
      if (v7.length === 0) {
        await v5.sendMessage(v8, {
          'text': "💎 *CRYSTAL LOGO*\n\n*crystallogo*\ncrystallogo <text>\n\n*Example:*\ncrystallogo CRYSTAL\ncrystallogo GEM\ncrystallogo DIAMOND\n\n" + ("> Powered by " + (config.botName || "JuneX-Ultra"))
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
      const v10 = await generateCrystalLogo(v9);
      await v5.sendMessage(v8, {
        'image': v10,
        'caption': "💎 *Crystal Logo Generated!*\nText: " + v9 + "\n\n_Created by " + (config.botName || "JuneX-Ultra") + '_'
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
      console.error("❌ [CRYSTALLOGO] ERROR:", v11);
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
async function generateCrystalLogo(v12) {
  const v13 = createCanvas(800, 400);
  const v14 = v13.getContext('2d');
  createCrystalCave(v14, 800, 400);
  drawCrystalCluster(v14, 600, 240);
  addCrystalLightBeams(v14, 600, 240);
  addCrystalRefractions(v14, 800, 400);
  drawCrystalText(v14, v12, 800, 400);
  addFloatingShards(v14, 800, 400);
  addCrystalDust(v14, 800, 400);
  addGemstoneHighlights(v14, 800, 400);
  addRainbowRefractions(v14, 800, 400);
  drawCrystalBorder(v14, 800, 400);
  addCrystalSignature(v14, 800, 400);
  addWatermark(v14, 800, 400);
  return v13.toBuffer("image/png");
}
function createCrystalCave(v15, v16, v17) {
  const v18 = v15.createLinearGradient(0, 0, 0, v17);
  v18.addColorStop(0, "#0a0a2a");
  v18.addColorStop(0.3, "#1a1a4a");
  v18.addColorStop(0.6, '#2d2d6a');
  v18.addColorStop(1, "#0a0a2a");
  v15.fillStyle = v18;
  v15.fillRect(0, 0, v16, v17);
  addBackgroundCrystals(v15, v16, v17);
  addCrystalPatterns(v15, v16, v17);
}
function addBackgroundCrystals(v19, v20, v21) {
  v19.save();
  v19.globalAlpha = 0.3;
  for (let v22 = 0; v22 < 8; v22++) {
    const v23 = Math.random() * v20;
    const v24 = v21 * 0.7 + Math.random() * v21 * 0.3;
    const v25 = 20 + Math.random() * 40;
    const v26 = 200 + Math.random() * 160;
    drawBackgroundCrystal(v19, v23, v24, v25, v26);
  }
  v19.restore();
}
function drawBackgroundCrystal(v27, v28, v29, v30, v31) {
  v27.save();
  v27.translate(v28, v29);
  v27.rotate(Math.random() * Math.PI);
  const v32 = v27.createLinearGradient(-v30, -v30, v30, v30);
  v32.addColorStop(0, "hsla(" + v31 + ", 80%, 50%, 0.4)");
  v32.addColorStop(0.5, "hsla(" + v31 + ", 100%, 70%, 0.6)");
  v32.addColorStop(1, 'hsla(' + v31 + ", 80%, 50%, 0.4)");
  v27.fillStyle = v32;
  v27.beginPath();
  v27.moveTo(0, -v30);
  v27.lineTo(v30 * 0.7, 0);
  v27.lineTo(0, v30);
  v27.lineTo(-v30 * 0.7, 0);
  v27.closePath();
  v27.fill();
  v27.strokeStyle = "hsla(" + v31 + ", 100%, 80%, 0.6)";
  v27.lineWidth = 1;
  v27.beginPath();
  v27.moveTo(0, -v30);
  v27.lineTo(0, v30);
  v27.stroke();
  v27.beginPath();
  v27.moveTo(-v30 * 0.7, 0);
  v27.lineTo(v30 * 0.7, 0);
  v27.stroke();
  v27.restore();
}
function addCrystalPatterns(v33, v34, v35) {
  v33.save();
  v33.globalAlpha = 0.1;
  v33.strokeStyle = "rgba(100, 150, 255, 0.4)";
  v33.lineWidth = 1;
  for (let v36 = 0; v36 < v35; v36 += 45) {
    for (let v37 = 0; v37 < v34; v37 += 51.96) {
      drawHexagon(v33, v37 + (v36 % 90 ? 25.98 : 0), v36, 30);
    }
  }
  v33.restore();
}
function drawHexagon(v38, v39, v40, v41) {
  v38.beginPath();
  for (let v42 = 0; v42 < 6; v42++) {
    const v43 = v42 * Math.PI / 3;
    const v44 = v39 + Math.cos(v43) * v41;
    const v45 = v40 + Math.sin(v43) * v41;
    if (v42 === 0) {
      v38.moveTo(v44, v45);
    } else {
      v38.lineTo(v44, v45);
    }
  }
  v38.closePath();
  v38.stroke();
}
function drawCrystalCluster(v46, v47, v48) {
  v46.save();
  drawMainCrystal(v46, v47, v48 - 30, 50, 220);
  const v49 = [{
    'x': -40,
    'y': -10,
    'size': 0x1e,
    'hue': 0xc8,
    'rotation': -0.3
  }, {
    'x': 0x23,
    'y': -15,
    'size': 0x19,
    'hue': 0xf0,
    'rotation': 0.2
  }, {
    'x': -25,
    'y': 0x28,
    'size': 0x14,
    'hue': 0xb4,
    'rotation': -0.1
  }, {
    'x': 0x1e,
    'y': 0x23,
    'size': 0x16,
    'hue': 0x104,
    'rotation': 0.4
  }, {
    'x': 0x0,
    'y': 0x32,
    'size': 0x12,
    'hue': 0xdc,
    'rotation': 0x0
  }];
  v49.forEach(v50 => {
    drawSingleCrystal(v46, v47 + v50.x, v48 + v50.y, v50.size, v50.hue, v50.rotation);
  });
  const v51 = v46.createRadialGradient(v47, v48 + 60, 0, v47, v48 + 60, 40);
  v51.addColorStop(0, "rgba(50, 50, 100, 0.8)");
  v51.addColorStop(1, "rgba(20, 20, 50, 0.4)");
  v46.fillStyle = v51;
  v46.beginPath();
  v46.arc(v47, v48 + 60, 40, 0, Math.PI * 2);
  v46.fill();
  v46.restore();
}
function drawMainCrystal(v52, v53, v54, v55, v56) {
  v52.save();
  v52.translate(v53, v54);
  const v57 = v52.createLinearGradient(-v55, -v55, v55, v55);
  v57.addColorStop(0, "hsla(" + v56 + ", 100%, 40%, 0.9)");
  v57.addColorStop(0.3, "hsla(" + v56 + ", 100%, 70%, 0.95)");
  v57.addColorStop(0.7, "hsla(" + v56 + ", 100%, 60%, 0.9)");
  v57.addColorStop(1, "hsla(" + v56 + ", 100%, 40%, 0.8)");
  v52.fillStyle = v57;
  v52.beginPath();
  v52.moveTo(0, -v55);
  v52.lineTo(v55 * 0.8, -v55 * 0.3);
  v52.lineTo(v55 * 0.8, v55 * 0.5);
  v52.lineTo(0, v55);
  v52.lineTo(-v55 * 0.8, v55 * 0.5);
  v52.lineTo(-v55 * 0.8, -v55 * 0.3);
  v52.closePath();
  v52.fill();
  addCrystalFacets(v52, v55, v56);
  const v58 = v52.createRadialGradient(0, 0, 0, 0, 0, v55 * 0.6);
  v58.addColorStop(0, "hsla(" + v56 + ", 100%, 80%, 0.6)");
  v58.addColorStop(1, "transparent");
  v52.fillStyle = v58;
  v52.beginPath();
  v52.arc(0, 0, v55 * 0.6, 0, Math.PI * 2);
  v52.fill();
  v52.restore();
}
function addCrystalFacets(v59, v60, v61) {
  v59.strokeStyle = 'hsla(' + v61 + ", 100%, 90%, 0.8)";
  v59.lineWidth = 2;
  v59.beginPath();
  v59.moveTo(0, -v60);
  v59.lineTo(0, v60);
  v59.stroke();
  v59.beginPath();
  v59.moveTo(-v60 * 0.8, -v60 * 0.3);
  v59.lineTo(v60 * 0.8, v60 * 0.5);
  v59.stroke();
  v59.beginPath();
  v59.moveTo(v60 * 0.8, -v60 * 0.3);
  v59.lineTo(-v60 * 0.8, v60 * 0.5);
  v59.stroke();
  v59.fillStyle = "hsla(" + v61 + ", 100%, 95%, 0.6)";
  v59.beginPath();
  v59.moveTo(0, -v60);
  v59.lineTo(v60 * 0.3, -v60 * 0.6);
  v59.lineTo(-v60 * 0.3, -v60 * 0.6);
  v59.closePath();
  v59.fill();
  v59.beginPath();
  v59.moveTo(v60 * 0.8, -v60 * 0.3);
  v59.lineTo(v60 * 0.5, 0);
  v59.lineTo(v60 * 0.8, v60 * 0.2);
  v59.closePath();
  v59.fill();
  v59.beginPath();
  v59.moveTo(-v60 * 0.8, -v60 * 0.3);
  v59.lineTo(-v60 * 0.5, 0);
  v59.lineTo(-v60 * 0.8, v60 * 0.2);
  v59.closePath();
  v59.fill();
}
function drawSingleCrystal(v62, v63, v64, v65, v66, v67) {
  v62.save();
  v62.translate(v63, v64);
  v62.rotate(v67);
  const v68 = v62.createLinearGradient(-v65, -v65, v65, v65);
  v68.addColorStop(0, "hsla(" + v66 + ", 100%, 50%, 0.8)");
  v68.addColorStop(0.5, "hsla(" + v66 + ", 100%, 70%, 0.9)");
  v68.addColorStop(1, "hsla(" + v66 + ", 100%, 50%, 0.8)");
  v62.fillStyle = v68;
  v62.beginPath();
  v62.moveTo(0, -v65);
  v62.lineTo(v65 * 0.6, 0);
  v62.lineTo(0, v65);
  v62.lineTo(-v65 * 0.6, 0);
  v62.closePath();
  v62.fill();
  v62.strokeStyle = "hsla(" + v66 + ", 100%, 90%, 0.7)";
  v62.lineWidth = 1;
  v62.beginPath();
  v62.moveTo(0, -v65);
  v62.lineTo(0, v65);
  v62.stroke();
  v62.beginPath();
  v62.moveTo(-v65 * 0.6, 0);
  v62.lineTo(v65 * 0.6, 0);
  v62.stroke();
  v62.fillStyle = "hsla(" + v66 + ", 100%, 95%, 0.5)";
  v62.beginPath();
  v62.moveTo(0, -v65);
  v62.lineTo(v65 * 0.2, -v65 * 0.3);
  v62.lineTo(-v65 * 0.2, -v65 * 0.3);
  v62.closePath();
  v62.fill();
  v62.restore();
}
function addCrystalLightBeams(v69, v70, v71) {
  v69.save();
  v69.globalCompositeOperation = "screen";
  v69.globalAlpha = 0.4;
  for (let v72 = 0; v72 < 12; v72++) {
    const v73 = v72 / 12 * Math.PI * 2;
    const v74 = 100 + Math.random() * 80;
    const v75 = 200 + Math.random() * 160;
    const v76 = v69.createLinearGradient(v70, v71, v70 + Math.cos(v73) * v74, v71 + Math.sin(v73) * v74);
    v76.addColorStop(0, 'hsla(' + v75 + ", 100%, 70%, 0.8)");
    v76.addColorStop(0.7, "hsla(" + v75 + ", 100%, 50%, 0.4)");
    v76.addColorStop(1, "transparent");
    v69.strokeStyle = v76;
    v69.lineWidth = 6;
    v69.lineCap = "round";
    v69.beginPath();
    v69.moveTo(v70, v71);
    v69.lineTo(v70 + Math.cos(v73) * v74, v71 + Math.sin(v73) * v74);
    v69.stroke();
  }
  const v77 = v69.createRadialGradient(v70, v71, 0, v70, v71, 120);
  v77.addColorStop(0, "rgba(100, 150, 255, 0.6)");
  v77.addColorStop(0.5, "rgba(80, 120, 255, 0.3)");
  v77.addColorStop(1, "transparent");
  v69.fillStyle = v77;
  v69.beginPath();
  v69.arc(v70, v71, 120, 0, Math.PI * 2);
  v69.fill();
  v69.restore();
}
function addCrystalRefractions(v78, v79, v80) {
  v78.save();
  v78.globalCompositeOperation = 'overlay';
  v78.globalAlpha = 0.2;
  for (let v81 = 0; v81 < v80; v81 += 30) {
    for (let v82 = 0; v82 < v79; v82 += 30) {
      const v83 = 0.3 + Math.sin(v82 * 0.02 + v81 * 0.01) * 0.3;
      const v84 = 15 + Math.sin(v82 * 0.03) * 10;
      v78.fillStyle = "rgba(255, 255, 255, " + v83 + ')';
      v78.beginPath();
      v78.arc(v82 + Math.sin(v81 * 0.02) * 10, v81, v84, 0, Math.PI * 2);
      v78.fill();
    }
  }
  v78.restore();
}
function drawCrystalText(v85, v86, v87, v88) {
  const v89 = v87 * 0.35;
  const v90 = v88 * 0.6;
  v85.save();
  v85.shadowColor = "rgba(100, 150, 255, 0.8)";
  v85.shadowBlur = 30;
  const v91 = v85.createLinearGradient(v89 - 100, v90 - 50, v89 + 100, v90 + 50);
  v91.addColorStop(0, '#64C8FF');
  v91.addColorStop(0.2, "#9664FF");
  v91.addColorStop(0.5, "#FFFFFF");
  v91.addColorStop(0.8, "#64FFC8");
  v91.addColorStop(1, '#64C8FF');
  v85.font = "bold 70px \"Arial\"";
  v85.textAlign = "center";
  v85.textBaseline = "middle";
  v85.fillStyle = v91;
  v85.fillText(v86.toUpperCase(), v89, v90);
  v85.shadowColor = "transparent";
  v85.fillStyle = "rgba(255, 255, 255, 0.7)";
  v85.fillText(v86.toUpperCase(), v89, v90);
  v85.strokeStyle = "rgba(200, 230, 255, 0.9)";
  v85.lineWidth = 2;
  v85.strokeText(v86.toUpperCase(), v89, v90);
  addTextFacets(v85, v86, v89, v90);
  v85.restore();
}
function addTextFacets(v92, v93, v94, v95) {
  v92.save();
  v92.globalCompositeOperation = "overlay";
  v92.globalAlpha = 0.3;
  const v96 = v92.measureText(v93.toUpperCase());
  const v97 = v96.width;
  for (let v98 = 0; v98 < v93.length * 3; v98++) {
    const v99 = v98 / (v93.length * 3);
    const v100 = v94 - v97 / 2 + v97 * v99;
    const v101 = v95 - 35 + Math.random() * 70;
    if (Math.random() > 0.7) {
      const v102 = 3 + Math.random() * 8;
      const v103 = Math.random() * Math.PI * 2;
      v92.fillStyle = "rgba(255, 255, 255, 0.8)";
      v92.beginPath();
      v92.moveTo(v100, v101);
      v92.lineTo(v100 + Math.cos(v103) * v102, v101 + Math.sin(v103) * v102);
      v92.lineTo(v100 + Math.cos(v103 + Math.PI / 3) * v102, v101 + Math.sin(v103 + Math.PI / 3) * v102);
      v92.closePath();
      v92.fill();
    }
  }
  v92.restore();
}
function addFloatingShards(v104, v105, v106) {
  v104.save();
  v104.globalAlpha = 0.8;
  for (let v107 = 0; v107 < 10; v107++) {
    const v108 = Math.random() * v105;
    const v109 = Math.random() * v106;
    const v110 = 5 + Math.random() * 15;
    const v111 = 200 + Math.random() * 160;
    const v112 = Math.random() * Math.PI;
    drawCrystalShard(v104, v108, v109, v110, v111, v112);
  }
  for (let v113 = 0; v113 < 25; v113++) {
    const v114 = Math.random() * v105;
    const v115 = Math.random() * v106;
    const v116 = 2 + Math.random() * 6;
    const v117 = 200 + Math.random() * 160;
    v104.fillStyle = "hsla(" + v117 + ", 100%, 70%, 0.9)";
    v104.beginPath();
    v104.moveTo(v114, v115 - v116);
    v104.lineTo(v114 + v116 * 0.6, v115);
    v104.lineTo(v114, v115 + v116);
    v104.lineTo(v114 - v116 * 0.6, v115);
    v104.closePath();
    v104.fill();
  }
  v104.restore();
}
function drawCrystalShard(v118, v119, v120, v121, v122, v123) {
  v118.save();
  v118.translate(v119, v120);
  v118.rotate(v123);
  const v124 = v118.createLinearGradient(-v121, -v121, v121, v121);
  v124.addColorStop(0, "hsla(" + v122 + ", 100%, 50%, 0.8)");
  v124.addColorStop(0.5, 'hsla(' + v122 + ", 100%, 70%, 0.9)");
  v124.addColorStop(1, "hsla(" + v122 + ", 100%, 50%, 0.8)");
  v118.fillStyle = v124;
  v118.beginPath();
  v118.moveTo(0, -v121);
  v118.lineTo(v121 * 0.8, 0);
  v118.lineTo(0, v121);
  v118.lineTo(-v121 * 0.8, 0);
  v118.closePath();
  v118.fill();
  v118.fillStyle = "hsla(" + v122 + ", 100%, 90%, 0.6)";
  v118.beginPath();
  v118.moveTo(0, -v121);
  v118.lineTo(v121 * 0.3, -v121 * 0.2);
  v118.lineTo(-v121 * 0.3, -v121 * 0.2);
  v118.closePath();
  v118.fill();
  v118.restore();
}
function addCrystalDust(v125, v126, v127) {
  v125.save();
  v125.globalCompositeOperation = 'screen';
  for (let v128 = 0; v128 < 60; v128++) {
    const v129 = Math.random() * v126;
    const v130 = Math.random() * v127;
    const v131 = 1 + Math.random() * 3;
    const v132 = 200 + Math.random() * 160;
    const v133 = 0.6 + Math.random() * 0.4;
    v125.fillStyle = 'hsla(' + v132 + ", 100%, 70%, " + v133 + ')';
    v125.beginPath();
    v125.arc(v129, v130, v131, 0, Math.PI * 2);
    v125.fill();
    v125.fillStyle = "hsla(" + v132 + ", 100%, 70%, " + v133 * 0.3 + ')';
    v125.beginPath();
    v125.arc(v129, v130, v131 * 2, 0, Math.PI * 2);
    v125.fill();
  }
  v125.restore();
}
function addGemstoneHighlights(v134, v135, v136) {
  v134.save();
  v134.globalCompositeOperation = "screen";
  v134.globalAlpha = 0.3;
  for (let v137 = 0; v137 < 20; v137++) {
    const v138 = Math.random() * v135;
    const v139 = Math.random() * v136;
    const v140 = 2 + Math.random() * 4;
    v134.fillStyle = "rgba(255, 255, 255, 0.9)";
    v134.beginPath();
    for (let v141 = 0; v141 < 5; v141++) {
      const v142 = v141 * Math.PI * 2 / 5;
      const v143 = v140 * 2;
      v134.lineTo(v138 + Math.cos(v142) * v143, v139 + Math.sin(v142) * v143);
      v134.lineTo(v138 + Math.cos(v142 + Math.PI / 5) * v140, v139 + Math.sin(v142 + Math.PI / 5) * v140);
    }
    v134.closePath();
    v134.fill();
  }
  v134.restore();
}
function addRainbowRefractions(v144, v145, v146) {
  v144.save();
  v144.globalCompositeOperation = "screen";
  v144.globalAlpha = 0.1;
  for (let v147 = 0; v147 < 8; v147++) {
    const v148 = Math.random() * v145;
    const v149 = Math.random() * v146;
    const v150 = 30 + Math.random() * 40;
    const v151 = Math.random() * 360;
    const v152 = v144.createRadialGradient(v148, v149, 0, v148, v149, v150);
    v152.addColorStop(0, 'hsla(' + v151 + ", 100%, 70%, 0.6)");
    v152.addColorStop(1, "transparent");
    v144.fillStyle = v152;
    v144.beginPath();
    v144.arc(v148, v149, v150, 0, Math.PI * 2);
    v144.fill();
  }
  v144.restore();
}
function drawCrystalBorder(v153, v154, v155) {
  v153.save();
  const v156 = v153.createLinearGradient(0, 0, v154, 0);
  v156.addColorStop(0, "#64C8FF");
  v156.addColorStop(0.3, "#9664FF");
  v156.addColorStop(0.5, "#FFFFFF");
  v156.addColorStop(0.7, "#9664FF");
  v156.addColorStop(1, "#64C8FF");
  v153.strokeStyle = v156;
  v153.lineWidth = 10;
  v153.shadowColor = "rgba(100, 150, 255, 0.6)";
  v153.shadowBlur = 20;
  v153.strokeRect(10, 10, v154 - 20, v155 - 20);
  v153.strokeStyle = "rgba(200, 230, 255, 0.6)";
  v153.lineWidth = 3;
  v153.shadowBlur = 15;
  v153.strokeRect(20, 20, v154 - 40, v155 - 40);
  addCornerGems(v153, v154, v155);
  v153.restore();
}
function addCornerGems(v157, v158, v159) {
  v157.save();
  v157.globalAlpha = 0.8;
  const v160 = [{
    'x': 0x1e,
    'y': 0x1e,
    'hue': 0xc8
  }, {
    'x': v158 - 30,
    'y': 0x1e,
    'hue': 0xf0
  }, {
    'x': 0x1e,
    'y': v159 - 30,
    'hue': 0xb4
  }, {
    'x': v158 - 30,
    'y': v159 - 30,
    'hue': 0x104
  }];
  v160.forEach(v161 => {
    const v162 = v157.createRadialGradient(v161.x, v161.y, 0, v161.x, v161.y, 8);
    v162.addColorStop(0, "hsla(" + v161.hue + ", 100%, 80%, 0.9)");
    v162.addColorStop(1, 'hsla(' + v161.hue + ", 100%, 50%, 0.6)");
    v157.fillStyle = v162;
    v157.beginPath();
    v157.arc(v161.x, v161.y, 8, 0, Math.PI * 2);
    v157.fill();
    v157.fillStyle = 'hsla(' + v161.hue + ", 100%, 95%, 0.8)";
    v157.beginPath();
    v157.arc(v161.x - 2, v161.y - 2, 3, 0, Math.PI * 2);
    v157.fill();
  });
  v157.restore();
}
function addCrystalSignature(v163, v164, v165) {
  v163.save();
  const v166 = v164 - 110;
  const v167 = v165 - 25;
  v163.font = "italic 14px \"Arial\"";
  v163.fillStyle = "rgba(200, 230, 255, 0.9)";
  v163.textAlign = "right";
  v163.textBaseline = "bottom";
  v163.shadowColor = "rgba(100, 150, 255, 0.6)";
  v163.shadowBlur = 10;
  v163.fillText("by " + (config.botName || "JuneX-Ultra"), v166, v167);
  v163.fillStyle = "#64C8FF";
  v163.beginPath();
  v163.moveTo(v166 + 5, v167 - 10);
  v163.lineTo(v166 + 10, v167 - 8);
  v163.lineTo(v166 + 5, v167 - 6);
  v163.lineTo(v166, v167 - 8);
  v163.closePath();
  v163.fill();
  v163.fillStyle = "rgba(255, 255, 255, 0.8)";
  v163.beginPath();
  v163.moveTo(v166 + 3, v167 - 9);
  v163.lineTo(v166 + 5, v167 - 8);
  v163.lineTo(v166 + 3, v167 - 7);
  v163.closePath();
  v163.fill();
  v163.restore();
}
