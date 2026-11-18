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
  v1.textBaseline = "bottom";
  v1.fillStyle = "#FFFFFF";
  v1.strokeStyle = "#000000";
  v1.lineWidth = 2;
  v1.strokeText(v4, v2 / 2, v3 - 10);
  v1.fillText(v4, v2 / 2, v3 - 10);
  v1.restore();
}
module.exports = {
  'name': "darkmagiclogo",
  'description': "Create sinister dark magic text logos with occult and forbidden spell effects",
  'category': "design",
  async 'execute'(v5, v6, v7) {
    const v8 = v6.key.remoteJid;
    try {
      if (v7.length === 0) {
        await v5.sendMessage(v8, {
          'text': "🔮 *DARK MAGIC LOGO*\n\n*darkmagiclogo*\ndarkmagiclogo <text>\n\n*Example:*\ndarkmagiclogo SHADOW\ndarkmagiclogo VOID\ndarkmagiclogo CURSED\n\n" + ("> Powered by " + (config.botName || "JuneX-Ultra"))
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
      const v10 = await generateDarkMagicLogo(v9);
      await v5.sendMessage(v8, {
        'image': v10,
        'caption': "🔮 *Dark Magic Logo Generated!*\nText: " + v9 + "\n\n_Created by " + (config.botName || "JuneX-Ultra") + '_'
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
      console.error("❌ [DARKMAGICLOGO] ERROR:", v11);
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
async function generateDarkMagicLogo(v12) {
  const v13 = createCanvas(800, 400);
  const v14 = v13.getContext('2d');
  createForbiddenSanctum(v14, 800, 400);
  drawDarkSorcerer(v14, 600, 220.00000000000003);
  addRitualCircle(v14, 600, 220.00000000000003);
  addDarkEnergy(v14, 600, 220.00000000000003);
  addShadowTendrils(v14, 800, 400);
  drawCursedText(v14, v12, 800, 400);
  addOccultSymbols(v14, 800, 400);
  addFloatingRunes(v14, 800, 400);
  addBloodDrops(v14, 800, 400);
  addSoulParticles(v14, 800, 400);
  drawForbiddenBorder(v14, 800, 400);
  addDarkSignature(v14, 800, 400);
  addWatermark(v14, 800, 400);
  return v13.toBuffer("image/png");
}
function createForbiddenSanctum(v15, v16, v17) {
  const v18 = v15.createLinearGradient(0, 0, 0, v17);
  v18.addColorStop(0, "#000000");
  v18.addColorStop(0.3, "#1a001a");
  v18.addColorStop(0.6, "#330033");
  v18.addColorStop(1, "#000000");
  v15.fillStyle = v18;
  v15.fillRect(0, 0, v16, v17);
  addAncientStoneTexture(v15, v16, v17);
  addRitualCandles(v15, v16, v17);
}
function addAncientStoneTexture(v19, v20, v21) {
  v19.save();
  v19.globalAlpha = 0.1;
  for (let v22 = 0; v22 < 200; v22++) {
    const v23 = Math.random() * v20;
    const v24 = Math.random() * v21;
    const v25 = 10 + Math.random() * 30;
    const v26 = Math.random() * Math.PI * 2;
    const v27 = 30 + Math.random() * 20;
    v19.strokeStyle = 'rgba(' + v27 + ", " + v27 + ", " + v27 + ", 0.4)";
    v19.lineWidth = 1;
    v19.lineCap = "round";
    v19.beginPath();
    v19.moveTo(v23, v24);
    v19.lineTo(v23 + Math.cos(v26) * v25, v24 + Math.sin(v26) * v25);
    v19.stroke();
  }
  for (let v28 = 0; v28 < 50; v28++) {
    const v29 = Math.random() * v20;
    const v30 = Math.random() * v21;
    const v31 = 3 + Math.random() * 8;
    const v32 = 30 + Math.random() * 20;
    v19.fillStyle = 'rgba(' + v32 + ", " + v32 + ", 20, 0.3)";
    v19.beginPath();
    v19.arc(v29, v30, v31, 0, Math.PI * 2);
    v19.fill();
  }
  v19.restore();
}
function addRitualCandles(v33, v34, v35) {
  v33.save();
  v33.globalAlpha = 0.6;
  const v36 = [{
    'x': v34 * 0.2,
    'y': v35 * 0.7
  }, {
    'x': v34 * 0.3,
    'y': v35 * 0.8
  }, {
    'x': v34 * 0.8,
    'y': v35 * 0.7
  }, {
    'x': v34 * 0.7,
    'y': v35 * 0.8
  }];
  v36.forEach(v37 => {
    v33.fillStyle = "#2c2c2c";
    v33.fillRect(v37.x - 4, v37.y - 30, 8, 30);
    const v38 = v33.createRadialGradient(v37.x, v37.y - 35, 0, v37.x, v37.y - 35, 8);
    v38.addColorStop(0, "rgba(255, 100, 0, 0.9)");
    v38.addColorStop(0.5, "rgba(255, 50, 0, 0.6)");
    v38.addColorStop(1, "transparent");
    v33.fillStyle = v38;
    v33.beginPath();
    v33.arc(v37.x, v37.y - 35, 8, 0, Math.PI * 2);
    v33.fill();
    v33.fillStyle = "rgba(255, 200, 0, 0.4)";
    v33.beginPath();
    v33.arc(v37.x, v37.y - 38, 4, 0, Math.PI * 2);
    v33.fill();
    const v39 = v33.createRadialGradient(v37.x, v37.y - 35, 0, v37.x, v37.y - 35, 20);
    v39.addColorStop(0, "rgba(255, 100, 0, 0.3)");
    v39.addColorStop(1, "transparent");
    v33.fillStyle = v39;
    v33.beginPath();
    v33.arc(v37.x, v37.y - 35, 20, 0, Math.PI * 2);
    v33.fill();
  });
  v33.restore();
}
function drawDarkSorcerer(v40, v41, v42) {
  v40.save();
  const v43 = v40.createLinearGradient(v41, v42 - 60, v41, v42 + 40);
  v43.addColorStop(0, "rgba(20, 0, 40, 0.9)");
  v43.addColorStop(1, "rgba(0, 0, 0, 0.95)");
  v40.fillStyle = v43;
  v40.beginPath();
  v40.moveTo(v41 - 25, v42 - 30);
  v40.bezierCurveTo(v41 - 35, v42 + 40, v41 + 35, v42 + 40, v41 + 25, v42 - 30);
  v40.fill();
  v40.fillStyle = "rgba(0, 0, 0, 0.95)";
  v40.beginPath();
  v40.arc(v41, v42 - 45, 20, 0, Math.PI * 2);
  v40.fill();
  v40.beginPath();
  v40.moveTo(v41 - 20, v42 - 35);
  v40.bezierCurveTo(v41 - 25, v42 - 20, v41 + 25, v42 - 20, v41 + 20, v42 - 35);
  v40.fill();
  const v44 = v40.createRadialGradient(v41 - 8, v42 - 45, 0, v41 - 8, v42 - 45, 6);
  v44.addColorStop(0, "rgba(255, 0, 100, 0.9)");
  v44.addColorStop(1, "transparent");
  v40.fillStyle = v44;
  v40.beginPath();
  v40.arc(v41 - 8, v42 - 45, 6, 0, Math.PI * 2);
  v40.fill();
  v40.beginPath();
  v40.arc(v41 + 8, v42 - 45, 6, 0, Math.PI * 2);
  v40.fill();
  v40.fillStyle = "rgba(0, 0, 0, 0.9)";
  v40.beginPath();
  v40.arc(v41 - 8, v42 - 45, 2, 0, Math.PI * 2);
  v40.fill();
  v40.beginPath();
  v40.arc(v41 + 8, v42 - 45, 2, 0, Math.PI * 2);
  v40.fill();
  v40.fillStyle = "rgba(20, 0, 40, 0.9)";
  v40.beginPath();
  v40.arc(v41 - 35, v42 - 10, 8, 0, Math.PI * 2);
  v40.fill();
  v40.beginPath();
  v40.arc(v41 + 35, v42 - 10, 8, 0, Math.PI * 2);
  v40.fill();
  v40.restore();
}
function addRitualCircle(v45, v46, v47) {
  v45.save();
  v45.globalAlpha = 0.8;
  v45.strokeStyle = "rgba(100, 0, 50, 0.8)";
  v45.lineWidth = 3;
  v45.beginPath();
  v45.arc(v46, v47, 80, 0, Math.PI * 2);
  v45.stroke();
  v45.strokeStyle = "rgba(150, 0, 100, 0.9)";
  v45.lineWidth = 2;
  v45.beginPath();
  v45.arc(v46, v47, 60, 0, Math.PI * 2);
  v45.stroke();
  drawPentagram(v45, v46, v47, 40);
  addCircleSymbols(v45, v46, v47);
  const v48 = v45.createRadialGradient(v46, v47, 50, v46, v47, 90);
  v48.addColorStop(0, "rgba(100, 0, 50, 0.4)");
  v48.addColorStop(1, "transparent");
  v45.fillStyle = v48;
  v45.beginPath();
  v45.arc(v46, v47, 90, 0, Math.PI * 2);
  v45.fill();
  v45.restore();
}
function drawPentagram(v49, v50, v51, v52) {
  v49.save();
  v49.strokeStyle = "rgba(200, 0, 100, 0.9)";
  v49.lineWidth = 2;
  v49.lineJoin = "round";
  const v53 = [];
  for (let v54 = 0; v54 < 5; v54++) {
    const v55 = v54 * 2 * Math.PI / 5 - Math.PI / 2;
    v53.push({
      'x': v50 + Math.cos(v55) * v52,
      'y': v51 + Math.sin(v55) * v52
    });
  }
  v49.beginPath();
  v49.moveTo(v53[0].x, v53[0].y);
  v49.lineTo(v53[2].x, v53[2].y);
  v49.lineTo(v53[4].x, v53[4].y);
  v49.lineTo(v53[1].x, v53[1].y);
  v49.lineTo(v53[3].x, v53[3].y);
  v49.closePath();
  v49.stroke();
  v49.restore();
}
function addCircleSymbols(v56, v57, v58) {
  v56.save();
  v56.globalAlpha = 0.7;
  const v59 = ['†', '‡', 'Ω', 'Ψ', '‡', '∞'];
  v59.forEach((v60, v61) => {
    const v62 = v61 / v59.length * Math.PI * 2;
    const v63 = v57 + Math.cos(v62) * 70;
    const v64 = v58 + Math.sin(v62) * 70;
    v56.fillStyle = "rgba(150, 0, 100, 0.9)";
    v56.font = "bold 14px Arial";
    v56.textAlign = "center";
    v56.textBaseline = "middle";
    v56.fillText(v60, v63, v64);
  });
  v56.restore();
}
function addDarkEnergy(v65, v66, v67) {
  v65.save();
  v65.globalCompositeOperation = "screen";
  for (let v68 = 0; v68 < 3; v68++) {
    const v69 = 100 + v68 * 30;
    const v70 = 0.2 - v68 * 0.05;
    v65.strokeStyle = "rgba(100, 0, 100, " + v70 + ')';
    v65.lineWidth = 8;
    v65.beginPath();
    v65.arc(v66, v67, v69, 0, Math.PI * 2);
    v65.stroke();
  }
  addEnergyTendrils(v65, v66 - 35, v67 - 10);
  addEnergyTendrils(v65, v66 + 35, v67 - 10);
  const v71 = v65.createRadialGradient(v66, v67, 0, v66, v67, 120);
  v71.addColorStop(0, "rgba(100, 0, 50, 0.6)");
  v71.addColorStop(0.5, "rgba(50, 0, 100, 0.3)");
  v71.addColorStop(1, "transparent");
  v65.fillStyle = v71;
  v65.beginPath();
  v65.arc(v66, v67, 120, 0, Math.PI * 2);
  v65.fill();
  v65.restore();
}
function addEnergyTendrils(v72, v73, v74) {
  v72.strokeStyle = "rgba(150, 0, 100, 0.8)";
  v72.lineWidth = 3;
  v72.lineCap = "round";
  for (let v75 = 0; v75 < 5; v75++) {
    const v76 = 30 + Math.random() * 40;
    const v77 = -0.5 + Math.random();
    v72.beginPath();
    v72.moveTo(v73, v74);
    v72.bezierCurveTo(v73 + Math.cos(v77) * v76 * 0.3, v74 + Math.sin(v77) * v76 * 0.3, v73 + Math.cos(v77) * v76 * 0.7, v74 + Math.sin(v77) * v76 * 0.7, v73 + Math.cos(v77) * v76, v74 + Math.sin(v77) * v76);
    v72.stroke();
    v72.strokeStyle = "rgba(200, 0, 150, 0.4)";
    v72.lineWidth = 8;
    v72.beginPath();
    v72.moveTo(v73, v74);
    v72.bezierCurveTo(v73 + Math.cos(v77) * v76 * 0.3, v74 + Math.sin(v77) * v76 * 0.3, v73 + Math.cos(v77) * v76 * 0.7, v74 + Math.sin(v77) * v76 * 0.7, v73 + Math.cos(v77) * v76, v74 + Math.sin(v77) * v76);
    v72.stroke();
    v72.strokeStyle = "rgba(150, 0, 100, 0.8)";
    v72.lineWidth = 3;
  }
}
function addShadowTendrils(v78, v79, v80) {
  v78.save();
  v78.globalAlpha = 0.3;
  for (let v81 = 0; v81 < 8; v81++) {
    const v82 = Math.random() * v79;
    const v83 = v80 + 20;
    const v84 = v82 + (Math.random() - 0.5) * 100;
    const v85 = Math.random() * v80 * 0.8;
    v78.strokeStyle = "rgba(50, 0, 50, 0.6)";
    v78.lineWidth = 4;
    v78.lineCap = "round";
    v78.beginPath();
    v78.moveTo(v82, v83);
    v78.bezierCurveTo(v82 + (Math.random() - 0.5) * 50, v83 - 100, v84 + (Math.random() - 0.5) * 50, v85 + 50, v84, v85);
    v78.stroke();
  }
  v78.restore();
}
function drawCursedText(v86, v87, v88, v89) {
  const v90 = v88 * 0.35;
  const v91 = v89 * 0.6;
  v86.save();
  v86.shadowColor = "rgba(100, 0, 50, 0.8)";
  v86.shadowBlur = 30;
  const v92 = v86.createLinearGradient(v90 - 100, v91 - 50, v90 + 100, v91 + 50);
  v92.addColorStop(0, '#640064');
  v92.addColorStop(0.3, "#960096");
  v92.addColorStop(0.7, '#C80064');
  v92.addColorStop(1, '#640064');
  v86.font = "bold 70px \"Arial\"";
  v86.textAlign = "center";
  v86.textBaseline = "middle";
  v86.fillStyle = v92;
  v86.fillText(v87.toUpperCase(), v90, v91);
  v86.shadowColor = "transparent";
  v86.fillStyle = "rgba(200, 0, 100, 0.7)";
  v86.fillText(v87.toUpperCase(), v90, v91);
  v86.strokeStyle = "rgba(100, 0, 50, 0.9)";
  v86.lineWidth = 2;
  v86.strokeText(v87.toUpperCase(), v90, v91);
  addTextCorruption(v86, v87, v90, v91);
  v86.restore();
}
function addTextCorruption(v93, v94, v95, v96) {
  v93.save();
  v93.globalCompositeOperation = "overlay";
  v93.globalAlpha = 0.4;
  const v97 = v93.measureText(v94.toUpperCase());
  const v98 = v97.width;
  for (let v99 = 0; v99 < 15; v99++) {
    const v100 = v95 - v98 / 2 + Math.random() * v98;
    const v101 = v96 - 35 + Math.random() * 70;
    const v102 = 5 + Math.random() * 15;
    const v103 = Math.random() * Math.PI * 2;
    v93.strokeStyle = "rgba(50, 0, 0, 0.8)";
    v93.lineWidth = 1;
    v93.lineCap = 'round';
    v93.beginPath();
    v93.moveTo(v100, v101);
    v93.lineTo(v100 + Math.cos(v103) * v102, v101 + Math.sin(v103) * v102);
    v93.stroke();
  }
  for (let v104 = 0; v104 < 8; v104++) {
    const v105 = v95 - v98 / 2 + Math.random() * v98;
    const v106 = v96 + 35;
    const v107 = 10 + Math.random() * 20;
    v93.strokeStyle = "rgba(150, 0, 0, 0.7)";
    v93.lineWidth = 2;
    v93.lineCap = 'round';
    v93.beginPath();
    v93.moveTo(v105, v106);
    v93.lineTo(v105, v106 + v107);
    v93.stroke();
    v93.fillStyle = "rgba(150, 0, 0, 0.7)";
    v93.beginPath();
    v93.arc(v105, v106 + v107, 3, 0, Math.PI * 2);
    v93.fill();
  }
  v93.restore();
}
function addOccultSymbols(v108, v109, v110) {
  v108.save();
  v108.globalAlpha = 0.6;
  const v111 = ['†', '‡', 'Ω', 'Ψ', '∞', '⌘', '⚡', '☠'];
  for (let v112 = 0; v112 < 12; v112++) {
    const v113 = Math.random() * v109;
    const v114 = Math.random() * v110;
    const v115 = 10 + Math.random() * 8;
    const v116 = v111[Math.floor(Math.random() * v111.length)];
    v108.fillStyle = "rgba(150, 0, 100, 0.8)";
    v108.font = "bold " + v115 + "px Arial";
    v108.textAlign = "center";
    v108.textBaseline = "middle";
    v108.fillText(v116, v113, v114);
    v108.fillStyle = "rgba(100, 0, 50, 0.3)";
    v108.beginPath();
    v108.arc(v113, v114, v115, 0, Math.PI * 2);
    v108.fill();
  }
  v108.restore();
}
function addFloatingRunes(v117, v118, v119) {
  v117.save();
  v117.globalAlpha = 0.5;
  const v120 = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ'];
  for (let v121 = 0; v121 < 15; v121++) {
    const v122 = Math.random() * v118;
    const v123 = Math.random() * v119;
    const v124 = 12 + Math.random() * 10;
    const v125 = v120[Math.floor(Math.random() * v120.length)];
    v117.fillStyle = "rgba(100, 0, 50, 0.9)";
    v117.font = "bold " + v124 + "px Arial";
    v117.textAlign = "center";
    v117.textBaseline = "middle";
    v117.fillText(v125, v122, v123);
    v117.strokeStyle = "rgba(150, 0, 100, 0.4)";
    v117.lineWidth = 2;
    v117.beginPath();
    v117.arc(v122, v123, v124 * 0.8, 0, Math.PI * 2);
    v117.stroke();
  }
  v117.restore();
}
function addBloodDrops(v126, v127, v128) {
  v126.save();
  v126.globalAlpha = 0.7;
  for (let v129 = 0; v129 < 10; v129++) {
    const v130 = Math.random() * v127;
    const v131 = Math.random() * v128;
    const v132 = 2 + Math.random() * 4;
    const v133 = v126.createRadialGradient(v130, v131, 0, v130, v131, v132);
    v133.addColorStop(0, "rgba(150, 0, 0, 0.9)");
    v133.addColorStop(1, "rgba(100, 0, 0, 0.6)");
    v126.fillStyle = v133;
    v126.beginPath();
    v126.arc(v130, v131, v132, 0, Math.PI * 2);
    v126.fill();
    const v134 = 3 + Math.random() * 8;
    v126.strokeStyle = "rgba(150, 0, 0, 0.6)";
    v126.lineWidth = v132 * 0.5;
    v126.lineCap = "round";
    v126.beginPath();
    v126.moveTo(v130, v131);
    v126.lineTo(v130, v131 + v134);
    v126.stroke();
  }
  v126.restore();
}
function addSoulParticles(v135, v136, v137) {
  v135.save();
  v135.globalCompositeOperation = "screen";
  for (let v138 = 0; v138 < 25; v138++) {
    const v139 = Math.random() * v136;
    const v140 = Math.random() * v137;
    const v141 = 1 + Math.random() * 3;
    const v142 = 300 + Math.random() * 60;
    v135.fillStyle = "hsla(" + v142 + ", 100%, 70%, 0.8)";
    v135.beginPath();
    v135.arc(v139, v140, v141, 0, Math.PI * 2);
    v135.fill();
    const v143 = 5 + Math.random() * 10;
    const v144 = Math.random() * Math.PI * 2;
    v135.strokeStyle = "hsla(" + v142 + ", 100%, 70%, 0.5)";
    v135.lineWidth = v141 * 0.5;
    v135.lineCap = "round";
    v135.beginPath();
    v135.moveTo(v139, v140);
    v135.lineTo(v139 + Math.cos(v144) * v143, v140 + Math.sin(v144) * v143);
    v135.stroke();
  }
  v135.restore();
}
function drawForbiddenBorder(v145, v146, v147) {
  v145.save();
  const v148 = v145.createLinearGradient(0, 0, v146, 0);
  v148.addColorStop(0, "#640064");
  v148.addColorStop(0.3, "#960096");
  v148.addColorStop(0.5, "#C80064");
  v148.addColorStop(0.7, "#960096");
  v148.addColorStop(1, '#640064');
  v145.strokeStyle = v148;
  v145.lineWidth = 10;
  v145.shadowColor = "rgba(100, 0, 50, 0.6)";
  v145.shadowBlur = 20;
  v145.strokeRect(10, 10, v146 - 20, v147 - 20);
  v145.strokeStyle = "rgba(150, 0, 100, 0.6)";
  v145.lineWidth = 3;
  v145.shadowBlur = 15;
  v145.strokeRect(20, 20, v146 - 40, v147 - 40);
  addOccultCorners(v145, v146, v147);
  v145.restore();
}
function addOccultCorners(v149, v150, v151) {
  v149.save();
  v149.globalAlpha = 0.8;
  const v152 = [{
    'x': 0x1e,
    'y': 0x1e
  }, {
    'x': v150 - 30,
    'y': 0x1e
  }, {
    'x': 0x1e,
    'y': v151 - 30
  }, {
    'x': v150 - 30,
    'y': v151 - 30
  }];
  v152.forEach(v153 => {
    v149.strokeStyle = "rgba(150, 0, 100, 0.8)";
    v149.lineWidth = 2;
    v149.beginPath();
    v149.arc(v153.x, v153.y, 8, 0, Math.PI * 2);
    v149.stroke();
    v149.beginPath();
    v149.moveTo(v153.x - 6, v153.y);
    v149.lineTo(v153.x + 6, v153.y);
    v149.stroke();
    v149.beginPath();
    v149.moveTo(v153.x, v153.y - 6);
    v149.lineTo(v153.x, v153.y + 6);
    v149.stroke();
    v149.beginPath();
    v149.moveTo(v153.x - 4, v153.y - 4);
    v149.lineTo(v153.x + 4, v153.y + 4);
    v149.stroke();
    v149.beginPath();
    v149.moveTo(v153.x + 4, v153.y - 4);
    v149.lineTo(v153.x - 4, v153.y + 4);
    v149.stroke();
  });
  v149.restore();
}
function addDarkSignature(v154, v155, v156) {
  v154.save();
  const v157 = v155 - 110;
  const v158 = v156 - 25;
  v154.font = "italic 14px \"Arial\"";
  v154.fillStyle = "rgba(150, 0, 100, 0.9)";
  v154.textAlign = 'right';
  v154.textBaseline = "bottom";
  v154.shadowColor = "rgba(100, 0, 50, 0.6)";
  v154.shadowBlur = 10;
  v154.fillText("by " + (config.botName || "JuneX-Ultra"), v157, v158);
  v154.fillStyle = "rgba(150, 0, 100, 0.8)";
  v154.font = "bold 12px Arial";
  v154.fillText('†', v157 + 5, v158 - 8);
  v154.fillStyle = "rgba(100, 0, 50, 0.3)";
  v154.beginPath();
  v154.arc(v157 + 5, v158 - 8, 6, 0, Math.PI * 2);
  v154.fill();
  v154.restore();
}
