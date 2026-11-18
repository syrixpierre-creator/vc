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
  'name': "wizardlogo",
  'description': "Create magical wizard text logos with spellcasting and mystical effects",
  'category': 'design',
  async 'execute'(v5, v6, v7) {
    const v8 = v6.key.remoteJid;
    try {
      if (v7.length === 0) {
        await v5.sendMessage(v8, {
          'text': "🧙‍♂️ *WIZARD LOGO*\n\n*wizardlogo*\nwizardlogo <text>\n\n*Example:*\nwizardlogo WIZARD\nwizardlogo MAGIC\nwizardlogo SPELL\n\n" + ("> Powered by " + (config.botName || "JuneX-Ultra"))
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
      const v10 = await generateWizardLogo(v9);
      await v5.sendMessage(v8, {
        'image': v10,
        'caption': "🧙‍♂️ *Wizard Logo Generated!*\nText: " + v9 + "\n\n_Created by " + (config.botName || "JuneX-Ultra") + '_'
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
      console.error("❌ [WIZARDLOGO] ERROR:", v11);
      await v5.sendMessage(v8, {
        'react': {
          'text': '❌',
          'key': v6.key
        }
      })['catch'](() => {});
      await v5.sendMessage(v8, {
        'text': "❌ *ERROR*\n\n" + v11.message + "\nPlease try again with shorter text"
      }, {
        'quoted': v6
      });
    }
  }
};
async function generateWizardLogo(v12) {
  const v13 = createCanvas(800, 400);
  const v14 = v13.getContext('2d');
  createWizardBackground(v14, 800, 400);
  drawWizardCharacter(v14, 600, 220.00000000000003);
  addMagicStaff(v14, 600, 220.00000000000003);
  addSpellCast(v14, 600, 220.00000000000003);
  addMagicCircles(v14, 600, 220.00000000000003);
  drawArcaneText(v14, v12, 800, 400);
  addMagicParticles(v14, 800, 400);
  addFloatingRunes(v14, 800, 400);
  addMysticalOrbs(v14, 800, 400);
  addSpellTrails(v14, 800, 400);
  drawArcaneBorder(v14, 800, 400);
  addWizardSignature(v14, 800, 400);
  addWatermark(v14, 800, 400);
  return v13.toBuffer("image/png");
}
function createWizardBackground(v15, v16, v17) {
  const v18 = v15.createLinearGradient(0, 0, 0, v17);
  v18.addColorStop(0, "#0a0020");
  v18.addColorStop(0.3, "#1a0040");
  v18.addColorStop(0.6, "#2d1b4e");
  v18.addColorStop(1, "#0a0020");
  v15.fillStyle = v18;
  v15.fillRect(0, 0, v16, v17);
  addStarfield(v15, v16, v17);
  addLibraryElements(v15, v16, v17);
}
function addStarfield(v19, v20, v21) {
  v19.save();
  v19.globalAlpha = 0.8;
  for (let v22 = 0; v22 < 150; v22++) {
    const v23 = Math.random() * v20;
    const v24 = Math.random() * v21;
    const v25 = Math.random() * 2;
    const v26 = 0.5 + Math.random() * 0.5;
    v19.fillStyle = "rgba(255, 255, 255, " + v26 + ')';
    v19.beginPath();
    v19.arc(v23, v24, v25, 0, Math.PI * 2);
    v19.fill();
  }
  for (let v27 = 0; v27 < 50; v27++) {
    const v28 = Math.random() * v20;
    const v29 = Math.random() * v21;
    const v30 = 1 + Math.random() * 3;
    const v31 = 240 + Math.random() * 120;
    v19.fillStyle = "hsla(" + v31 + ", 100%, 70%, 0.8)";
    v19.beginPath();
    v19.arc(v28, v29, v30, 0, Math.PI * 2);
    v19.fill();
    v19.fillStyle = 'hsla(' + v31 + ", 100%, 70%, 0.3)";
    v19.beginPath();
    v19.arc(v28, v29, v30 * 2, 0, Math.PI * 2);
    v19.fill();
  }
  v19.restore();
}
function addLibraryElements(v32, v33, v34) {
  v32.save();
  v32.globalAlpha = 0.3;
  for (let v35 = 0; v35 < 8; v35++) {
    const v36 = v33 * 0.1 + v35 * 25;
    const v37 = v34 * 0.8;
    const v38 = 30 + Math.random() * 20;
    const v39 = "hsl(" + Math.random() * 360 + ", 50%, 40%)";
    v32.fillStyle = v39;
    v32.fillRect(v36, v37 - v38, 15, v38);
    v32.strokeStyle = "rgba(255, 255, 255, 0.5)";
    v32.lineWidth = 1;
    v32.strokeRect(v36, v37 - v38, 15, v38);
    v32.strokeStyle = "rgba(200, 200, 150, 0.6)";
    v32.beginPath();
    v32.moveTo(v36, v37 - v38 + 5);
    v32.lineTo(v36 + 15, v37 - v38 + 5);
    v32.stroke();
  }
  const v40 = v33 * 0.85;
  const v41 = v34 * 0.3;
  v32.fillStyle = "rgba(210, 180, 140, 0.6)";
  v32.fillRect(v40 - 20, v41 - 5, 40, 10);
  v32.fillStyle = "rgba(139, 69, 19, 0.8)";
  v32.beginPath();
  v32.ellipse(v40 - 20, v41, 3, 5, 0, 0, Math.PI * 2);
  v32.fill();
  v32.beginPath();
  v32.ellipse(v40 + 20, v41, 3, 5, 0, 0, Math.PI * 2);
  v32.fill();
  v32.restore();
}
function drawWizardCharacter(v42, v43, v44) {
  v42.save();
  const v45 = v42.createLinearGradient(v43, v44 - 40, v43, v44 + 40);
  v45.addColorStop(0, "#2d1b4e");
  v45.addColorStop(0.5, "#4a2c7a");
  v45.addColorStop(1, "#2d1b4e");
  v42.fillStyle = v45;
  v42.beginPath();
  v42.moveTo(v43 - 25, v44 - 20);
  v42.bezierCurveTo(v43 - 30, v44 + 30, v43 + 30, v44 + 30, v43 + 25, v44 - 20);
  v42.fill();
  v42.fillStyle = "rgba(210, 180, 140, 0.9)";
  v42.beginPath();
  v42.arc(v43, v44 - 30, 15, 0, Math.PI * 2);
  v42.fill();
  v42.fillStyle = "rgba(255, 255, 255, 0.9)";
  v42.beginPath();
  v42.moveTo(v43 - 12, v44 - 25);
  v42.bezierCurveTo(v43 - 15, v44 - 15, v43 + 15, v44 - 15, v43 + 12, v44 - 25);
  v42.bezierCurveTo(v43 + 8, v44 - 10, v43 - 8, v44 - 10, v43 - 12, v44 - 25);
  v42.fill();
  drawWizardHat(v42, v43, v44 - 45);
  v42.fillStyle = "rgba(210, 180, 140, 0.9)";
  v42.beginPath();
  v42.arc(v43 - 30, v44, 8, 0, Math.PI * 2);
  v42.fill();
  v42.beginPath();
  v42.arc(v43 + 30, v44, 8, 0, Math.PI * 2);
  v42.fill();
  v42.restore();
}
function drawWizardHat(v46, v47, v48) {
  v46.fillStyle = "#2d1b4e";
  v46.beginPath();
  v46.ellipse(v47, v48 + 5, 25, 8, 0, 0, Math.PI * 2);
  v46.fill();
  const v49 = v46.createLinearGradient(v47, v48 - 40, v47, v48 + 5);
  v49.addColorStop(0, "#4a2c7a");
  v49.addColorStop(1, "#2d1b4e");
  v46.fillStyle = v49;
  v46.beginPath();
  v46.moveTo(v47 - 20, v48 + 5);
  v46.lineTo(v47, v48 - 40);
  v46.lineTo(v47 + 20, v48 + 5);
  v46.closePath();
  v46.fill();
  v46.fillStyle = "rgba(255, 255, 200, 0.8)";
  for (let v50 = 0; v50 < 3; v50++) {
    const v51 = v47 - 10 + v50 * 10;
    const v52 = v48 - 20 + v50 * 5;
    v46.beginPath();
    v46.arc(v51, v52, 2, 0, Math.PI * 2);
    v46.fill();
  }
}
function addMagicStaff(v53, v54, v55) {
  v53.save();
  const v56 = v53.createLinearGradient(v54 - 50, v55 - 10, v54 - 50, v55 + 30);
  v56.addColorStop(0, "#8B4513");
  v56.addColorStop(1, '#654321');
  v53.strokeStyle = v56;
  v53.lineWidth = 6;
  v53.lineCap = "round";
  v53.beginPath();
  v53.moveTo(v54 - 50, v55 - 10);
  v53.lineTo(v54 - 50, v55 + 30);
  v53.stroke();
  const v57 = v53.createRadialGradient(v54 - 50, v55 - 15, 0, v54 - 50, v55 - 15, 12);
  v57.addColorStop(0, "rgba(100, 200, 255, 0.9)");
  v57.addColorStop(0.7, "rgba(50, 100, 200, 0.6)");
  v57.addColorStop(1, "rgba(0, 50, 150, 0.3)");
  v53.fillStyle = v57;
  v53.beginPath();
  v53.moveTo(v54 - 50, v55 - 25);
  v53.lineTo(v54 - 40, v55 - 15);
  v53.lineTo(v54 - 50, v55 - 5);
  v53.lineTo(v54 - 60, v55 - 15);
  v53.closePath();
  v53.fill();
  v53.fillStyle = "rgba(100, 200, 255, 0.3)";
  v53.beginPath();
  v53.arc(v54 - 50, v55 - 15, 15, 0, Math.PI * 2);
  v53.fill();
  v53.restore();
}
function addSpellCast(v58, v59, v60) {
  v58.save();
  v58.globalCompositeOperation = "screen";
  const v61 = v58.createLinearGradient(v59 - 50, v60 - 15, v59 - 150, v60 - 15);
  v61.addColorStop(0, "rgba(100, 200, 255, 0.9)");
  v61.addColorStop(0.5, "rgba(150, 100, 255, 0.6)");
  v61.addColorStop(1, "rgba(200, 50, 255, 0.3)");
  v58.strokeStyle = v61;
  v58.lineWidth = 8;
  v58.lineCap = "round";
  v58.beginPath();
  v58.moveTo(v59 - 50, v60 - 15);
  v58.lineTo(v59 - 150, v60 - 15);
  v58.stroke();
  v58.strokeStyle = "rgba(150, 200, 255, 0.4)";
  v58.lineWidth = 20;
  v58.beginPath();
  v58.moveTo(v59 - 50, v60 - 15);
  v58.lineTo(v59 - 150, v60 - 15);
  v58.stroke();
  const v62 = v58.createRadialGradient(v59 - 150, v60 - 15, 0, v59 - 150, v60 - 15, 30);
  v62.addColorStop(0, "rgba(255, 255, 255, 0.8)");
  v62.addColorStop(0.5, "rgba(150, 200, 255, 0.5)");
  v62.addColorStop(1, "transparent");
  v58.fillStyle = v62;
  v58.beginPath();
  v58.arc(v59 - 150, v60 - 15, 30, 0, Math.PI * 2);
  v58.fill();
  for (let v63 = 0; v63 < 15; v63++) {
    const v64 = Math.random();
    const v65 = v59 - 50 - v64 * 100;
    const v66 = v60 - 15 + (Math.random() - 0.5) * 20;
    const v67 = 1 + Math.random() * 3;
    const v68 = 200 + Math.random() * 160;
    v58.fillStyle = "hsla(" + v68 + ", 100%, 70%, 0.8)";
    v58.beginPath();
    v58.arc(v65, v66, v67, 0, Math.PI * 2);
    v58.fill();
  }
  v58.restore();
}
function addMagicCircles(v69, v70, v71) {
  v69.save();
  v69.globalAlpha = 0.6;
  const v72 = ["#64C8FF", "#9664FF", "#FF64C8"];
  v72.forEach((v73, v74) => {
    const v75 = 60 + v74 * 20;
    const v76 = 3 - v74;
    v69.strokeStyle = v73;
    v69.lineWidth = v76;
    v69.setLineDash([5, 5]);
    v69.beginPath();
    v69.arc(v70, v71, v75, 0, Math.PI * 2);
    v69.stroke();
    v69.setLineDash([]);
  });
  addCircleRunes(v69, v70, v71);
  v69.restore();
}
function addCircleRunes(v77, v78, v79) {
  v77.save();
  v77.globalAlpha = 0.8;
  for (let v80 = 0; v80 < 8; v80++) {
    const v81 = v80 / 8 * Math.PI * 2;
    const v82 = v78 + Math.cos(v81) * 80;
    const v83 = v79 + Math.sin(v81) * 80;
    v77.fillStyle = "rgba(100, 200, 255, 0.9)";
    v77.font = "bold 16px Arial";
    v77.textAlign = "center";
    v77.textBaseline = 'middle';
    v77.fillText('*', v82, v83);
    v77.fillStyle = "rgba(100, 200, 255, 0.3)";
    v77.beginPath();
    v77.arc(v82, v83, 10, 0, Math.PI * 2);
    v77.fill();
  }
  v77.restore();
}
function drawArcaneText(v84, v85, v86, v87) {
  const v88 = v86 * 0.35;
  const v89 = v87 * 0.6;
  v84.save();
  v84.shadowColor = "rgba(100, 200, 255, 0.8)";
  v84.shadowBlur = 30;
  const v90 = v84.createLinearGradient(v88 - 100, v89 - 50, v88 + 100, v89 + 50);
  v90.addColorStop(0, "#64C8FF");
  v90.addColorStop(0.3, "#9664FF");
  v90.addColorStop(0.7, "#FF64C8");
  v90.addColorStop(1, "#64C8FF");
  v84.font = "bold 68px \"Arial\"";
  v84.textAlign = "center";
  v84.textBaseline = "middle";
  v84.fillStyle = v90;
  v84.fillText(v85.toUpperCase(), v88, v89);
  v84.shadowColor = "transparent";
  v84.fillStyle = "rgba(255, 255, 255, 0.6)";
  v84.fillText(v85.toUpperCase(), v88, v89);
  v84.strokeStyle = "rgba(200, 230, 255, 0.8)";
  v84.lineWidth = 2;
  v84.strokeText(v85.toUpperCase(), v88, v89);
  addTextRunes(v84, v85, v88, v89);
  v84.restore();
}
function addTextRunes(v91, v92, v93, v94) {
  v91.save();
  v91.globalCompositeOperation = "overlay";
  v91.globalAlpha = 0.3;
  const v95 = v91.measureText(v92.toUpperCase());
  const v96 = v95.width;
  for (let v97 = 0; v97 < 20; v97++) {
    const v98 = v93 - v96 / 2 + Math.random() * v96;
    const v99 = v94 - 34 + Math.random() * 68;
    const v100 = 1 + Math.random() * 3;
    const v101 = 200 + Math.random() * 160;
    v91.fillStyle = "hsla(" + v101 + ", 100%, 70%, 0.7)";
    v91.beginPath();
    v91.arc(v98, v99, v100, 0, Math.PI * 2);
    v91.fill();
  }
  v91.restore();
}
function addMagicParticles(v102, v103, v104) {
  v102.save();
  v102.globalCompositeOperation = "screen";
  for (let v105 = 0; v105 < 15; v105++) {
    const v106 = Math.random() * v103;
    const v107 = Math.random() * v104;
    const v108 = 4 + Math.random() * 8;
    const v109 = 200 + Math.random() * 160;
    const v110 = v102.createRadialGradient(v106, v107, 0, v106, v107, v108);
    v110.addColorStop(0, 'hsla(' + v109 + ", 100%, 80%, 0.9)");
    v110.addColorStop(1, "hsla(" + v109 + ", 100%, 60%, 0.3)");
    v102.fillStyle = v110;
    v102.beginPath();
    v102.arc(v106, v107, v108, 0, Math.PI * 2);
    v102.fill();
    const v111 = 5 + Math.random() * 15;
    const v112 = Math.random() * Math.PI * 2;
    v102.strokeStyle = 'hsla(' + v109 + ", 100%, 70%, 0.5)";
    v102.lineWidth = v108 * 0.5;
    v102.lineCap = "round";
    v102.beginPath();
    v102.moveTo(v106, v107);
    v102.lineTo(v106 + Math.cos(v112) * v111, v107 + Math.sin(v112) * v111);
    v102.stroke();
  }
  for (let v113 = 0; v113 < 40; v113++) {
    const v114 = Math.random() * v103;
    const v115 = Math.random() * v104;
    const v116 = 1 + Math.random() * 2;
    const v117 = 200 + Math.random() * 160;
    v102.fillStyle = "hsla(" + v117 + ", 100%, 80%, 0.9)";
    v102.beginPath();
    v102.arc(v114, v115, v116, 0, Math.PI * 2);
    v102.fill();
  }
  v102.restore();
}
function addFloatingRunes(v118, v119, v120) {
  v118.save();
  v118.globalAlpha = 0.6;
  const v121 = ['*', '+', '○', '□', '△'];
  for (let v122 = 0; v122 < 12; v122++) {
    const v123 = Math.random() * v119;
    const v124 = Math.random() * v120;
    const v125 = 8 + Math.random() * 6;
    const v126 = 200 + Math.random() * 160;
    const v127 = v121[Math.floor(Math.random() * v121.length)];
    v118.fillStyle = "hsla(" + v126 + ", 100%, 70%, 0.8)";
    v118.font = "bold " + v125 + "px Arial";
    v118.textAlign = "center";
    v118.textBaseline = 'middle';
    v118.fillText(v127, v123, v124);
    v118.fillStyle = "hsla(" + v126 + ", 100%, 70%, 0.3)";
    v118.beginPath();
    v118.arc(v123, v124, v125, 0, Math.PI * 2);
    v118.fill();
  }
  v118.restore();
}
function addMysticalOrbs(v128, v129, v130) {
  v128.save();
  v128.globalCompositeOperation = "screen";
  v128.globalAlpha = 0.4;
  const v131 = [{
    'x': v129 * 0.2,
    'y': v130 * 0.3,
    'size': 0x28,
    'color': [100, 200, 255]
  }, {
    'x': v129 * 0.8,
    'y': v130 * 0.4,
    'size': 0x23,
    'color': [150, 100, 255]
  }, {
    'x': v129 * 0.3,
    'y': v130 * 0.7,
    'size': 0x2d,
    'color': [255, 100, 200]
  }];
  v131.forEach(v132 => {
    const [v133, v134, v135] = v132.color;
    const v136 = v128.createRadialGradient(v132.x, v132.y, 0, v132.x, v132.y, v132.size);
    v136.addColorStop(0, 'rgba(' + v133 + ", " + v134 + ", " + v135 + ", 0.7)");
    v136.addColorStop(1, 'transparent');
    v128.fillStyle = v136;
    v128.beginPath();
    v128.arc(v132.x, v132.y, v132.size, 0, Math.PI * 2);
    v128.fill();
  });
  v128.restore();
}
function addSpellTrails(v137, v138, v139) {
  v137.save();
  v137.globalCompositeOperation = "screen";
  v137.globalAlpha = 0.2;
  for (let v140 = 0; v140 < 5; v140++) {
    const v141 = Math.random() * v138;
    const v142 = v139 + 20;
    const v143 = v141 + (Math.random() - 0.5) * 100;
    const v144 = Math.random() * v139 * 0.5;
    const v145 = 200 + Math.random() * 160;
    const v146 = v137.createLinearGradient(v141, v142, v143, v144);
    v146.addColorStop(0, "hsla(" + v145 + ", 100%, 70%, 0.6)");
    v146.addColorStop(1, "hsla(" + v145 + ", 100%, 50%, 0.2)");
    v137.strokeStyle = v146;
    v137.lineWidth = 6;
    v137.lineCap = "round";
    v137.beginPath();
    v137.moveTo(v141, v142);
    v137.lineTo(v143, v144);
    v137.stroke();
  }
  v137.restore();
}
function drawArcaneBorder(v147, v148, v149) {
  v147.save();
  const v150 = v147.createLinearGradient(0, 0, v148, 0);
  v150.addColorStop(0, "#64C8FF");
  v150.addColorStop(0.3, "#9664FF");
  v150.addColorStop(0.5, '#FF64C8');
  v150.addColorStop(0.7, "#9664FF");
  v150.addColorStop(1, '#64C8FF');
  v147.strokeStyle = v150;
  v147.lineWidth = 10;
  v147.shadowColor = "rgba(100, 200, 255, 0.6)";
  v147.shadowBlur = 20;
  v147.strokeRect(10, 10, v148 - 20, v149 - 20);
  v147.strokeStyle = "rgba(200, 230, 255, 0.6)";
  v147.lineWidth = 3;
  v147.shadowBlur = 15;
  v147.strokeRect(20, 20, v148 - 40, v149 - 40);
  addRunicCorners(v147, v148, v149);
  v147.restore();
}
function addRunicCorners(v151, v152, v153) {
  v151.save();
  v151.globalAlpha = 0.7;
  const v154 = [{
    'x': 0x1e,
    'y': 0x1e
  }, {
    'x': v152 - 30,
    'y': 0x1e
  }, {
    'x': 0x1e,
    'y': v153 - 30
  }, {
    'x': v152 - 30,
    'y': v153 - 30
  }];
  v154.forEach(v155 => {
    v151.strokeStyle = "rgba(100, 200, 255, 0.8)";
    v151.lineWidth = 2;
    v151.beginPath();
    v151.arc(v155.x, v155.y, 8, 0, Math.PI * 2);
    v151.stroke();
    v151.beginPath();
    v151.moveTo(v155.x - 5, v155.y);
    v151.lineTo(v155.x + 5, v155.y);
    v151.stroke();
    v151.beginPath();
    v151.moveTo(v155.x, v155.y - 5);
    v151.lineTo(v155.x, v155.y + 5);
    v151.stroke();
  });
  v151.restore();
}
function addWizardSignature(v156, v157, v158) {
  v156.save();
  const v159 = v157 - 110;
  const v160 = v158 - 25;
  v156.font = "italic 14px \"Arial\"";
  v156.fillStyle = "rgba(200, 230, 255, 0.9)";
  v156.textAlign = "right";
  v156.textBaseline = 'bottom';
  v156.shadowColor = "rgba(100, 200, 255, 0.6)";
  v156.shadowBlur = 10;
  v156.fillText("by " + (config.botName || "JuneX-Ultra"), v159, v160);
  v156.fillStyle = "rgba(100, 200, 255, 0.8)";
  v156.font = "bold 12px Arial";
  v156.fillText('*', v159 + 5, v160 - 8);
  v156.fillStyle = "rgba(100, 200, 255, 0.3)";
  v156.beginPath();
  v156.arc(v159 + 5, v160 - 8, 6, 0, Math.PI * 2);
  v156.fill();
  v156.restore();
}
