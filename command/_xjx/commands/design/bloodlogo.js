const {
  createCanvas
} = require("@napi-rs/canvas");
const config = require("../../config");
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
  v1.fillStyle = "#FFFFFF";
  v1.strokeStyle = "#000000";
  v1.lineWidth = 2;
  v1.strokeText(v4, v2 / 2, v3 - 10);
  v1.fillText(v4, v2 / 2, v3 - 10);
  v1.restore();
}
module.exports = {
  'name': "bloodlogo",
  'category': "design",
  'description': "Create terrifying blood text logos with realistic gore and horror effects",
  async 'execute'(v5, v6, v7) {
    const v8 = v6.key.remoteJid;
    try {
      if (v7.length === 0) {
        await v5.sendMessage(v8, {
          'text': "🩸 *BLOOD LOGO*\n\n*blood*\nblood <text>\n\n*Example:*\nblood BLOOD\nblood GORE\nblood HORROR\n\n" + ("> Powered by " + (config.botName || 'JuneX-Ultra'))
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
      const v10 = await generateAdvancedBloodLogo(v9);
      await v5.sendMessage(v8, {
        'image': v10,
        'caption': "🩸 *Advanced Blood Logo Generated!*\nText: " + v9 + "\n\n_Created by " + (config.botName || 'JuneX-Ultra') + '_'
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
      console.error("❌ [BLOODLOGO] ERROR:", v11);
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
async function generateAdvancedBloodLogo(v12) {
  const v13 = createCanvas(800, 400);
  const v14 = v13.getContext('2d');
  createHorrorBackground(v14, 800, 400);
  drawAdvancedBloodText(v14, v12, 400, 200);
  addBloodSplatters(v14, 800, 400);
  addBloodSpatterPhysics(v14, 400, 200, v12);
  addGoreDetails(v14, 800, 400);
  addBloodPools(v14, 800, 400);
  addBloodyHandprints(v14, 800, 400);
  addWeaponMarks(v14, 800, 400);
  addBloodMist(v14, 800, 400);
  addBloodParticles(v14, 800, 400);
  addBloodLighting(v14, 800, 400);
  addHorrorShadows(v14, 800, 400);
  drawGoreBorder(v14, 800, 400);
  addBloodSignature(v14, 800, 400);
  addWatermark(v14, 800, 400);
  return v13.toBuffer("image/png");
}
function createHorrorBackground(v15, v16, v17) {
  const v18 = v15.createLinearGradient(0, 0, 0, v17);
  v18.addColorStop(0, "#2a0a0a");
  v18.addColorStop(0.3, "#3a0a0a");
  v18.addColorStop(0.6, "#4a0a0a");
  v18.addColorStop(1, "#2a0a0a");
  v15.fillStyle = v18;
  v15.fillRect(0, 0, v16, v17);
  addWallTexture(v15, v16, v17);
  addBloodStains(v15, v16, v17);
}
function addWallTexture(v19, v20, v21) {
  v19.save();
  v19.globalAlpha = 0.3;
  for (let v22 = 0; v22 < 150; v22++) {
    const v23 = Math.random() * v20;
    const v24 = Math.random() * v21;
    const v25 = 5 + Math.random() * 25;
    const v26 = Math.random() * Math.PI * 2;
    const v27 = 20 + Math.random() * 15;
    v19.strokeStyle = 'rgba(' + v27 + ", " + v27 + ", " + v27 + ", 0.4)";
    v19.lineWidth = 1;
    v19.lineCap = 'round';
    v19.beginPath();
    v19.moveTo(v23, v24);
    v19.lineTo(v23 + Math.cos(v26) * v25, v24 + Math.sin(v26) * v25);
    v19.stroke();
  }
  for (let v28 = 0; v28 < 80; v28++) {
    const v29 = Math.random() * v20;
    const v30 = Math.random() * v21;
    const v31 = 3 + Math.random() * 12;
    const v32 = 30 + Math.random() * 20;
    v19.fillStyle = 'rgba(' + v32 + ", " + v32 * 0.5 + ", " + v32 * 0.3 + ", 0.3)";
    v19.beginPath();
    v19.arc(v29, v30, v31, 0, Math.PI * 2);
    v19.fill();
  }
  v19.restore();
}
function addBloodStains(v33, v34, v35) {
  v33.save();
  v33.globalAlpha = 0.4;
  for (let v36 = 0; v36 < 15; v36++) {
    const v37 = Math.random() * v34;
    const v38 = Math.random() * v35;
    const v39 = 20 + Math.random() * 40;
    const v40 = v33.createRadialGradient(v37, v38, 0, v37, v38, v39);
    v40.addColorStop(0, "rgba(100, 0, 0, 0.8)");
    v40.addColorStop(0.7, "rgba(80, 0, 0, 0.4)");
    v40.addColorStop(1, "transparent");
    v33.fillStyle = v40;
    v33.beginPath();
    v33.arc(v37, v38, v39, 0, Math.PI * 2);
    v33.fill();
    addStainDrips(v33, v37, v38 + v39, v39 * 0.5);
  }
  v33.restore();
}
function addStainDrips(v41, v42, v43, v44) {
  for (let v45 = 0; v45 < v44; v45++) {
    const v46 = v42 + (Math.random() - 0.5) * 30;
    const v47 = 10 + Math.random() * 40;
    const v48 = 1 + Math.random() * 3;
    v41.strokeStyle = "rgba(80, 0, 0, 0.6)";
    v41.lineWidth = v48;
    v41.lineCap = "round";
    v41.beginPath();
    v41.moveTo(v46, v43);
    v41.lineTo(v46, v43 + v47);
    v41.stroke();
    v41.fillStyle = "rgba(100, 0, 0, 0.7)";
    v41.beginPath();
    v41.arc(v46, v43 + v47, v48 * 1.5, 0, Math.PI * 2);
    v41.fill();
  }
}
function drawAdvancedBloodText(v49, v50, v51, v52) {
  v49.save();
  v49.shadowColor = "rgba(150, 0, 0, 0.8)";
  v49.shadowBlur = 40;
  v49.shadowOffsetX = 5;
  v49.shadowOffsetY = 5;
  const v53 = v49.createLinearGradient(v51 - 150, v52 - 60, v51 + 150, v52 + 60);
  v53.addColorStop(0, "#8B0000");
  v53.addColorStop(0.2, "#DC143C");
  v53.addColorStop(0.5, "#8B0000");
  v53.addColorStop(0.8, "#DC143C");
  v53.addColorStop(1, "#8B0000");
  v49.font = "bold 80px \"Arial\"";
  v49.textAlign = "center";
  v49.textBaseline = "middle";
  v49.fillStyle = v53;
  v49.fillText(v50.toUpperCase(), v51, v52);
  v49.shadowColor = "transparent";
  v49.fillStyle = "rgba(220, 20, 60, 0.6)";
  v49.fillText(v50.toUpperCase(), v51 - 2, v52 - 2);
  addBloodClotTexture(v49, v50, v51, v52);
  addAdvancedDrippingBlood(v49, v50, v51, v52);
  addTextSplatter(v49, v50, v51, v52);
  v49.restore();
}
function addBloodClotTexture(v54, v55, v56, v57) {
  v54.save();
  v54.globalCompositeOperation = "overlay";
  v54.globalAlpha = 0.3;
  const v58 = v54.measureText(v55.toUpperCase());
  const v59 = v58.width;
  for (let v60 = 0; v60 < 25; v60++) {
    const v61 = v56 - v59 / 2 + Math.random() * v59;
    const v62 = v57 - 40 + Math.random() * 80;
    const v63 = 2 + Math.random() * 8;
    v54.fillStyle = "rgba(60, 0, 0, 0.8)";
    v54.beginPath();
    v54.arc(v61, v62, v63, 0, Math.PI * 2);
    v54.fill();
    v54.fillStyle = "rgba(150, 0, 0, 0.6)";
    v54.beginPath();
    v54.arc(v61 - v63 * 0.3, v62 - v63 * 0.3, v63 * 0.5, 0, Math.PI * 2);
    v54.fill();
  }
  for (let v64 = 0; v64 < 15; v64++) {
    const v65 = v56 - v59 / 2 + Math.random() * v59;
    const v66 = v57 - 40 + Math.random() * 80;
    const v67 = 5 + Math.random() * 20;
    const v68 = Math.random() * Math.PI * 2;
    v54.strokeStyle = "rgba(80, 0, 0, 0.7)";
    v54.lineWidth = 1 + Math.random() * 2;
    v54.lineCap = "round";
    v54.beginPath();
    v54.moveTo(v65, v66);
    v54.lineTo(v65 + Math.cos(v68) * v67, v66 + Math.sin(v68) * v67);
    v54.stroke();
  }
  v54.restore();
}
function addAdvancedDrippingBlood(v69, v70, v71, v72) {
  v69.save();
  v69.globalAlpha = 0.9;
  const v73 = v69.measureText(v70.toUpperCase());
  const v74 = v73.width;
  const v75 = [];
  for (let v76 = 0; v76 < v70.length * 3; v76++) {
    v75.push(v71 - v74 / 2 + Math.random() * v74);
  }
  v75.forEach(v77 => {
    const v78 = v72 + 40;
    const v79 = 1 + Math.floor(Math.random() * 3);
    for (let v80 = 0; v80 < v79; v80++) {
      const v81 = 20 + Math.random() * 60;
      const v82 = 2 + Math.random() * 4;
      const v83 = (Math.random() - 0.5) * 10;
      const v84 = v69.createLinearGradient(v77 + v83, v78, v77 + v83, v78 + v81);
      v84.addColorStop(0, "rgba(150, 0, 0, 0.9)");
      v84.addColorStop(0.7, "rgba(100, 0, 0, 0.7)");
      v84.addColorStop(1, "rgba(80, 0, 0, 0.5)");
      v69.strokeStyle = v84;
      v69.lineWidth = v82;
      v69.lineCap = "round";
      v69.beginPath();
      v69.moveTo(v77 + v83, v78);
      v69.lineTo(v77 + v83, v78 + v81);
      v69.stroke();
      const v85 = v69.createRadialGradient(v77 + v83, v78 + v81, 0, v77 + v83, v78 + v81, v82 * 2);
      v85.addColorStop(0, "rgba(180, 0, 0, 0.9)");
      v85.addColorStop(1, "rgba(120, 0, 0, 0.6)");
      v69.fillStyle = v85;
      v69.beginPath();
      v69.arc(v77 + v83, v78 + v81, v82 * 1.5, 0, Math.PI * 2);
      v69.fill();
      if (Math.random() > 0.7) {
        const v86 = 5 + Math.random() * 15;
        const v87 = v77 + v83 + (Math.random() - 0.5) * 8;
        v69.strokeStyle = "rgba(120, 0, 0, 0.7)";
        v69.lineWidth = v82 * 0.6;
        v69.beginPath();
        v69.moveTo(v77 + v83, v78 + v81 * 0.7);
        v69.lineTo(v87, v78 + v81 * 0.7 + v86);
        v69.stroke();
      }
    }
  });
  v69.restore();
}
function addTextSplatter(v88, v89, v90, v91) {
  v88.save();
  v88.globalAlpha = 0.8;
  const v92 = v88.measureText(v89.toUpperCase());
  const v93 = v92.width;
  for (let v94 = 0; v94 < 30; v94++) {
    const v95 = Math.random() * Math.PI * 2;
    const v96 = v93 * 0.3 + Math.random() * v93 * 0.4;
    const v97 = v90 + Math.cos(v95) * v96;
    const v98 = v91 + Math.sin(v95) * v96;
    const v99 = 3 + Math.random() * 12;
    drawBloodSplatter(v88, v97, v98, v99);
  }
  v88.restore();
}
function addBloodSplatters(v100, v101, v102) {
  v100.save();
  v100.globalAlpha = 0.7;
  for (let v103 = 0; v103 < 12; v103++) {
    const v104 = Math.random() * v101;
    const v105 = Math.random() * v102;
    const v106 = 15 + Math.random() * 25;
    drawAdvancedBloodSplatter(v100, v104, v105, v106);
  }
  for (let v107 = 0; v107 < 25; v107++) {
    const v108 = Math.random() * v101;
    const v109 = Math.random() * v102;
    const v110 = 8 + Math.random() * 15;
    drawBloodSplatter(v100, v108, v109, v110);
  }
  for (let v111 = 0; v111 < 60; v111++) {
    const v112 = Math.random() * v101;
    const v113 = Math.random() * v102;
    const v114 = 1 + Math.random() * 5;
    v100.fillStyle = "rgba(120, 0, 0, " + (0.5 + Math.random() * 0.4) + ')';
    v100.beginPath();
    v100.arc(v112, v113, v114, 0, Math.PI * 2);
    v100.fill();
  }
  v100.restore();
}
function drawAdvancedBloodSplatter(v115, v116, v117, v118) {
  const v119 = v115.createRadialGradient(v116, v117, 0, v116, v117, v118);
  v119.addColorStop(0, "rgba(180, 0, 0, 0.9)");
  v119.addColorStop(0.7, "rgba(120, 0, 0, 0.6)");
  v119.addColorStop(1, "transparent");
  v115.fillStyle = v119;
  v115.beginPath();
  v115.arc(v116, v117, v118, 0, Math.PI * 2);
  v115.fill();
  const v120 = 8 + Math.floor(Math.random() * 8);
  for (let v121 = 0; v121 < v120; v121++) {
    const v122 = v121 / v120 * Math.PI * 2;
    const v123 = v118 * (0.5 + Math.random() * 0.8);
    const v124 = v118 * (0.1 + Math.random() * 0.2);
    const v125 = v115.createLinearGradient(v116, v117, v116 + Math.cos(v122) * v123, v117 + Math.sin(v122) * v123);
    v125.addColorStop(0, "rgba(150, 0, 0, 0.8)");
    v125.addColorStop(1, "transparent");
    v115.strokeStyle = v125;
    v115.lineWidth = v124;
    v115.lineCap = 'round';
    v115.beginPath();
    v115.moveTo(v116, v117);
    v115.lineTo(v116 + Math.cos(v122) * v123, v117 + Math.sin(v122) * v123);
    v115.stroke();
  }
}
function drawBloodSplatter(v126, v127, v128, v129) {
  v126.fillStyle = "rgba(120, 0, 0, " + (0.6 + Math.random() * 0.3) + ')';
  v126.beginPath();
  v126.arc(v127, v128, v129, 0, Math.PI * 2);
  v126.fill();
  for (let v130 = 0; v130 < 3; v130++) {
    const v131 = Math.random() * Math.PI * 2;
    const v132 = v129 * 0.5;
    v126.beginPath();
    v126.arc(v127 + Math.cos(v131) * v132, v128 + Math.sin(v131) * v132, v129 * 0.3, 0, Math.PI * 2);
    v126.fill();
  }
}
function addBloodSpatterPhysics(v133, v134, v135, v136) {
  v133.save();
  v133.globalAlpha = 0.6;
  const v137 = v133.measureText(v136.toUpperCase());
  const v138 = v137.width;
  for (let v139 = 0; v139 < 50; v139++) {
    const v140 = v134 - v138 / 2 + Math.random() * v138;
    const v141 = 2 + Math.random() * 4;
    const v142 = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
    const v143 = 5 + Math.floor(Math.random() * 10);
    drawBloodTrajectory(v133, v140, v135, v142, v141, v143);
  }
  v133.restore();
}
function drawBloodTrajectory(v144, v145, v146, v147, v148, v149) {
  let v150 = v145;
  let v151 = v146;
  let v152 = v148;
  v144.strokeStyle = "rgba(150, 0, 0, " + (0.4 + Math.random() * 0.3) + ')';
  v144.lineWidth = 1 + Math.random() * 2;
  v144.lineCap = "round";
  v144.beginPath();
  v144.moveTo(v150, v151);
  for (let v153 = 0; v153 < v149; v153++) {
    v150 += Math.cos(v147) * v152;
    v151 += Math.sin(v147) * v152;
    v152 *= 0.9;
    v147 += 0.020000000000000004;
    v144.lineTo(v150, v151);
    if (Math.random() > 0.8 || v153 === v149 - 1) {
      v144.stroke();
      drawBloodSplatter(v144, v150, v151, 2 + Math.random() * 4);
      v144.beginPath();
      v144.moveTo(v150, v151);
    }
  }
  v144.stroke();
}
function addGoreDetails(v154, v155, v156) {
  v154.save();
  v154.globalAlpha = 0.7;
  for (let v157 = 0; v157 < 8; v157++) {
    const v158 = Math.random() * v155;
    const v159 = Math.random() * v156;
    const v160 = 5 + Math.random() * 15;
    drawFleshChunk(v154, v158, v159, v160);
  }
  for (let v161 = 0; v161 < 5; v161++) {
    const v162 = Math.random() * v155;
    const v163 = Math.random() * v156;
    const v164 = 3 + Math.random() * 8;
    drawBoneFragment(v154, v162, v163, v164);
  }
  v154.restore();
}
function drawFleshChunk(v165, v166, v167, v168) {
  const v169 = "rgba(" + (150 + Math.random() * 50) + ", " + (50 + Math.random() * 30) + ", " + (50 + Math.random() * 30) + ", 0.8)";
  v165.fillStyle = v169;
  v165.beginPath();
  v165.arc(v166, v167, v168, 0, Math.PI * 2);
  v165.fill();
  v165.strokeStyle = "rgba(100, 30, 30, 0.6)";
  v165.lineWidth = 1;
  for (let v170 = 0; v170 < 3; v170++) {
    const v171 = Math.random() * Math.PI * 2;
    const v172 = v168 * 0.8;
    v165.beginPath();
    v165.moveTo(v166, v167);
    v165.lineTo(v166 + Math.cos(v171) * v172, v167 + Math.sin(v171) * v172);
    v165.stroke();
  }
}
function drawBoneFragment(v173, v174, v175, v176) {
  v173.fillStyle = "rgba(240, 240, 220, 0.8)";
  v173.strokeStyle = "rgba(200, 200, 180, 0.9)";
  v173.lineWidth = 1;
  v173.beginPath();
  v173.ellipse(v174, v175, v176, v176 * 0.5, Math.random() * Math.PI, 0, Math.PI * 2);
  v173.fill();
  v173.stroke();
  v173.fillStyle = "rgba(180, 180, 160, 0.6)";
  v173.beginPath();
  v173.ellipse(v174, v175, v176 * 0.6, v176 * 0.3, Math.random() * Math.PI, 0, Math.PI * 2);
  v173.fill();
}
function addBloodPools(v177, v178, v179) {
  v177.save();
  v177.globalAlpha = 0.6;
  for (let v180 = 0; v180 < 6; v180++) {
    const v181 = Math.random() * v178;
    const v182 = v179 * 0.8 + Math.random() * v179 * 0.2;
    const v183 = 20 + Math.random() * 40;
    drawBloodPool(v177, v181, v182, v183);
  }
  v177.restore();
}
function drawBloodPool(v184, v185, v186, v187) {
  const v188 = v184.createRadialGradient(v185, v186, 0, v185, v186, v187);
  v188.addColorStop(0, "rgba(100, 0, 0, 0.8)");
  v188.addColorStop(0.5, "rgba(80, 0, 0, 0.6)");
  v188.addColorStop(1, "rgba(60, 0, 0, 0.3)");
  v184.fillStyle = v188;
  v184.beginPath();
  v184.ellipse(v185, v186, v187, v187 * 0.3, 0, 0, Math.PI * 2);
  v184.fill();
  const v189 = v184.createLinearGradient(v185 - v187, v186, v185 + v187, v186);
  v189.addColorStop(0, "rgba(150, 0, 0, 0.3)");
  v189.addColorStop(0.5, "rgba(180, 0, 0, 0.5)");
  v189.addColorStop(1, "rgba(150, 0, 0, 0.3)");
  v184.fillStyle = v189;
  v184.beginPath();
  v184.ellipse(v185, v186 - v187 * 0.1, v187 * 0.8, v187 * 0.2, 0, 0, Math.PI * 2);
  v184.fill();
}
function addBloodyHandprints(v190, v191, v192) {
  v190.save();
  v190.globalAlpha = 0.5;
  for (let v193 = 0; v193 < 4; v193++) {
    const v194 = Math.random() * v191;
    const v195 = Math.random() * v192;
    const v196 = 30 + Math.random() * 20;
    const v197 = Math.random() * Math.PI * 2;
    drawBloodyHandprint(v190, v194, v195, v196, v197);
  }
  v190.restore();
}
function drawBloodyHandprint(v198, v199, v200, v201, v202) {
  v198.save();
  v198.translate(v199, v200);
  v198.rotate(v202);
  v198.fillStyle = "rgba(120, 0, 0, 0.7)";
  v198.beginPath();
  v198.ellipse(0, 0, v201 * 0.3, v201 * 0.4, 0, 0, Math.PI * 2);
  v198.fill();
  const v203 = [-0.8, -0.4, 0, 0.4, 0.8];
  v203.forEach(v204 => {
    const v205 = Math.cos(v204) * v201 * 0.5;
    const v206 = Math.sin(v204) * v201 * 0.5;
    v198.beginPath();
    v198.ellipse(v205, v206, v201 * 0.1, v201 * 0.25, v204, 0, Math.PI * 2);
    v198.fill();
  });
  v198.restore();
}
function addWeaponMarks(v207, v208, v209) {
  v207.save();
  v207.globalAlpha = 0.4;
  for (let v210 = 0; v210 < 8; v210++) {
    const v211 = Math.random() * v208;
    const v212 = Math.random() * v209;
    const v213 = 20 + Math.random() * 40;
    const v214 = Math.random() * Math.PI * 2;
    v207.strokeStyle = "rgba(80, 0, 0, 0.6)";
    v207.lineWidth = 2;
    v207.lineCap = "round";
    v207.beginPath();
    v207.moveTo(v211, v212);
    v207.lineTo(v211 + Math.cos(v214) * v213, v212 + Math.sin(v214) * v213);
    v207.stroke();
  }
  for (let v215 = 0; v215 < 5; v215++) {
    const v216 = Math.random() * v208;
    const v217 = Math.random() * v209;
    const v218 = 3 + Math.random() * 6;
    v207.fillStyle = "rgba(40, 40, 40, 0.8)";
    v207.beginPath();
    v207.arc(v216, v217, v218, 0, Math.PI * 2);
    v207.fill();
    v207.fillStyle = "rgba(100, 0, 0, 0.5)";
    v207.beginPath();
    v207.arc(v216, v217, v218 * 1.5, 0, Math.PI * 2);
    v207.fill();
  }
  v207.restore();
}
function addBloodMist(v219, v220, v221) {
  v219.save();
  v219.globalAlpha = 0.1;
  v219.globalCompositeOperation = "screen";
  for (let v222 = 0; v222 < 5; v222++) {
    const v223 = Math.random() * v220;
    const v224 = Math.random() * v221;
    const v225 = 50 + Math.random() * 100;
    const v226 = v219.createRadialGradient(v223, v224, 0, v223, v224, v225);
    v226.addColorStop(0, "rgba(100, 0, 0, 0.4)");
    v226.addColorStop(1, "transparent");
    v219.fillStyle = v226;
    v219.beginPath();
    v219.arc(v223, v224, v225, 0, Math.PI * 2);
    v219.fill();
  }
  v219.restore();
}
function addBloodParticles(v227, v228, v229) {
  v227.save();
  v227.globalAlpha = 0.6;
  for (let v230 = 0; v230 < 40; v230++) {
    const v231 = Math.random() * v228;
    const v232 = Math.random() * v229;
    const v233 = 1 + Math.random() * 3;
    const v234 = 0.4 + Math.random() * 0.4;
    v227.fillStyle = "rgba(120, 0, 0, " + v234 + ')';
    v227.beginPath();
    v227.arc(v231, v232, v233, 0, Math.PI * 2);
    v227.fill();
    const v235 = 2 + Math.random() * 6;
    const v236 = Math.random() * Math.PI * 2;
    v227.strokeStyle = "rgba(100, 0, 0, " + v234 * 0.5 + ')';
    v227.lineWidth = v233 * 0.5;
    v227.lineCap = 'round';
    v227.beginPath();
    v227.moveTo(v231, v232);
    v227.lineTo(v231 + Math.cos(v236) * v235, v232 + Math.sin(v236) * v235);
    v227.stroke();
  }
  v227.restore();
}
function addBloodLighting(v237, v238, v239) {
  v237.save();
  v237.globalCompositeOperation = "overlay";
  v237.globalAlpha = 0.2;
  for (let v240 = 0; v240 < 3; v240++) {
    const v241 = Math.random() * v238;
    const v242 = Math.random() * v239 * 0.3;
    const v243 = 60 + Math.random() * 80;
    const v244 = v237.createRadialGradient(v241, v242, 0, v241, v242, v243);
    v244.addColorStop(0, "rgba(255, 0, 0, 0.3)");
    v244.addColorStop(1, "transparent");
    v237.fillStyle = v244;
    v237.beginPath();
    v237.arc(v241, v242, v243, 0, Math.PI * 2);
    v237.fill();
  }
  v237.restore();
}
function addHorrorShadows(v245, v246, v247) {
  v245.save();
  v245.globalAlpha = 0.3;
  v245.fillStyle = "rgba(0, 0, 0, 0.5)";
  v245.beginPath();
  v245.moveTo(0, 0);
  v245.lineTo(v246 * 0.3, 0);
  v245.lineTo(0, v247 * 0.3);
  v245.closePath();
  v245.fill();
  v245.beginPath();
  v245.moveTo(v246, 0);
  v245.lineTo(v246 * 0.7, 0);
  v245.lineTo(v246, v247 * 0.3);
  v245.closePath();
  v245.fill();
  v245.beginPath();
  v245.moveTo(0, v247);
  v245.lineTo(v246 * 0.3, v247);
  v245.lineTo(0, v247 * 0.7);
  v245.closePath();
  v245.fill();
  v245.beginPath();
  v245.moveTo(v246, v247);
  v245.lineTo(v246 * 0.7, v247);
  v245.lineTo(v246, v247 * 0.7);
  v245.closePath();
  v245.fill();
  v245.restore();
}
function drawGoreBorder(v248, v249, v250) {
  v248.save();
  const v251 = v248.createLinearGradient(0, 0, v249, 0);
  v251.addColorStop(0, "#8B0000");
  v251.addColorStop(0.3, '#DC143C');
  v251.addColorStop(0.5, "#8B0000");
  v251.addColorStop(0.7, '#DC143C');
  v251.addColorStop(1, '#8B0000');
  v248.strokeStyle = v251;
  v248.lineWidth = 10;
  v248.shadowColor = "rgba(150, 0, 0, 0.6)";
  v248.shadowBlur = 20;
  v248.strokeRect(10, 10, v249 - 20, v250 - 20);
  v248.strokeStyle = "rgba(150, 0, 0, 0.6)";
  v248.lineWidth = 3;
  v248.shadowBlur = 15;
  v248.strokeRect(20, 20, v249 - 40, v250 - 40);
  addBloodCorners(v248, v249, v250);
  v248.restore();
}
function addBloodCorners(v252, v253, v254) {
  v252.save();
  v252.globalAlpha = 0.8;
  const v255 = [{
    'x': 0x1e,
    'y': 0x1e
  }, {
    'x': v253 - 30,
    'y': 0x1e
  }, {
    'x': 0x1e,
    'y': v254 - 30
  }, {
    'x': v253 - 30,
    'y': v254 - 30
  }];
  v255.forEach(v256 => {
    const v257 = v252.createRadialGradient(v256.x, v256.y, 0, v256.x, v256.y, 8);
    v257.addColorStop(0, "rgba(180, 0, 0, 0.9)");
    v257.addColorStop(1, "rgba(120, 0, 0, 0.6)");
    v252.fillStyle = v257;
    v252.beginPath();
    v252.arc(v256.x, v256.y, 8, 0, Math.PI * 2);
    v252.fill();
    v252.strokeStyle = "rgba(150, 0, 0, 0.8)";
    v252.lineWidth = 3;
    v252.lineCap = "round";
    v252.beginPath();
    v252.moveTo(v256.x, v256.y);
    v252.lineTo(v256.x, v256.y + 15);
    v252.stroke();
  });
  v252.restore();
}
function addBloodSignature(v258, v259, v260) {
  v258.save();
  const v261 = v259 - 110;
  const v262 = v260 - 25;
  v258.font = "italic 14px \"Arial\"";
  v258.fillStyle = "rgba(150, 0, 0, 0.9)";
  v258.textAlign = "right";
  v258.textBaseline = 'bottom';
  v258.shadowColor = "rgba(100, 0, 0, 0.6)";
  v258.shadowBlur = 10;
  v258.fillText("by " + (config.botName || 'JuneX-Ultra'), v261, v262);
  const v263 = v258.createRadialGradient(v261 + 5, v262 - 8, 0, v261 + 5, v262 - 8, 4);
  v263.addColorStop(0, "rgba(180, 0, 0, 0.9)");
  v263.addColorStop(1, "rgba(120, 0, 0, 0.6)");
  v258.fillStyle = v263;
  v258.beginPath();
  v258.arc(v261 + 5, v262 - 8, 4, 0, Math.PI * 2);
  v258.fill();
  v258.strokeStyle = "rgba(150, 0, 0, 0.8)";
  v258.lineWidth = 2;
  v258.lineCap = "round";
  v258.beginPath();
  v258.moveTo(v261 + 5, v262 - 4);
  v258.lineTo(v261 + 5, v262 - 1);
  v258.stroke();
  v258.restore();
}
