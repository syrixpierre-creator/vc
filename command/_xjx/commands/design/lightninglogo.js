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
  'name': "lightninglogo",
  'description': "Create electrifying text logos with realistic lightning and storm effects",
  'category': "design",
  async 'execute'(v5, v6, v7) {
    const v8 = v6.key.remoteJid;
    try {
      if (v7.length === 0) {
        await v5.sendMessage(v8, {
          'text': "⚡ *LIGHTNING LOGO*\n\n*lightninglogo*\nlightninglogo <text>\n\n*Example:*\nlightninglogo BOLT\nlightninglogo THOR\nlightninglogo STORM\n\n" + ("> Powered by " + (config.botName || 'JuneX-Ultra'))
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
      const v10 = await generateLightningLogo(v9);
      await v5.sendMessage(v8, {
        'image': v10,
        'caption': "⚡ *Lightning Logo Generated!*\nText: " + v9 + "\n\n_Created by " + (config.botName || 'JuneX-Ultra') + '_'
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
      console.error("❌ [LIGHTNINGLOGO] ERROR:", v11);
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
async function generateLightningLogo(v12) {
  const v13 = createCanvas(800, 400);
  const v14 = v13.getContext('2d');
  createStormBackground(v14, 800, 400);
  const v15 = generateLightningBolts(v14, 800, 400);
  addLightningGlow(v14, v15);
  addElectricalArcs(v14, 800, 400);
  drawElectrifiedText(v14, v12, 800, 400);
  addStormClouds(v14, 800, 400);
  addRainEffects(v14, 800, 400);
  addEnergyParticles(v14, 800, 400);
  drawElectricBorder(v14, 800, 400);
  addLightningSignature(v14, 800, 400);
  addWatermark(v14, 800, 400);
  return v13.toBuffer("image/png");
}
function createStormBackground(v16, v17, v18) {
  const v19 = v16.createLinearGradient(0, 0, 0, v18);
  v19.addColorStop(0, "#0a0a1a");
  v19.addColorStop(0.3, "#1a1a2a");
  v19.addColorStop(0.6, "#2a2a3a");
  v19.addColorStop(1, "#1a1a2a");
  v16.fillStyle = v19;
  v16.fillRect(0, 0, v17, v18);
  addBackgroundLightningFlashes(v16, v17, v18);
}
function generateLightningBolts(v20, v21, v22) {
  const v23 = [];
  const v24 = createLightningBolt(v20, v21 * 0.7, v22 * 0.1, v21 * 0.3, v22 * 0.9, 5, 0.7);
  v23.push(v24);
  v23.push(createLightningBolt(v20, v21 * 0.8, v22 * 0.05, v21 * 0.5, v22 * 0.7, 4, 0.5));
  v23.push(createLightningBolt(v20, v21 * 0.6, v22 * 0.15, v21 * 0.2, v22 * 0.8, 3, 0.4));
  for (let v25 = 0; v25 < 8; v25++) {
    const v26 = v21 * 0.7 + (Math.random() - 0.5) * 100;
    const v27 = v22 * 0.1 + Math.random() * v22 * 0.3;
    const v28 = v21 * 0.3 + (Math.random() - 0.5) * 200;
    const v29 = v22 * 0.7 + Math.random() * v22 * 0.2;
    v23.push(createLightningBolt(v20, v26, v27, v28, v29, 2, 0.3));
  }
  return v23;
}
function createLightningBolt(v30, v31, v32, v33, v34, v35, v36) {
  v30.save();
  const v37 = generateLightningPath(v31, v32, v33, v34, v35);
  v30.strokeStyle = "rgba(255, 255, 255, " + v36 + ')';
  v30.lineWidth = 3;
  v30.lineCap = "round";
  v30.lineJoin = 'round';
  v30.beginPath();
  v30.moveTo(v37[0].x, v37[0].y);
  for (let v38 = 1; v38 < v37.length; v38++) {
    v30.lineTo(v37[v38].x, v37[v38].y);
  }
  v30.stroke();
  v30.strokeStyle = "rgba(200, 220, 255, " + v36 * 1.2 + ')';
  v30.lineWidth = 1.5;
  v30.beginPath();
  v30.moveTo(v37[0].x, v37[0].y);
  for (let v39 = 1; v39 < v37.length; v39++) {
    v30.lineTo(v37[v39].x, v37[v39].y);
  }
  v30.stroke();
  v30.restore();
  return {
    'points': v37,
    'intensity': v36,
    'startX': v31,
    'startY': v32,
    'endX': v33,
    'endY': v34
  };
}
function generateLightningPath(v40, v41, v42, v43, v44) {
  const v45 = [{
    'x': v40,
    'y': v41
  }];
  function v46(v47, v48, v49) {
    if (v49 <= 0) {
      return;
    }
    const v50 = (v47.x + v48.x) / 2;
    const v51 = (v47.y + v48.y) / 2;
    const v52 = (Math.random() - 0.5) * (50 / v49);
    const v53 = Math.atan2(v48.y - v47.y, v48.x - v47.x);
    const v54 = v50 + Math.cos(v53 + Math.PI / 2) * v52;
    const v55 = v51 + Math.sin(v53 + Math.PI / 2) * v52;
    const v56 = {
      'x': v54,
      'y': v55
    };
    v46(v47, v56, v49 - 1);
    v45.push(v56);
    v46(v56, v48, v49 - 1);
  }
  v46({
    'x': v40,
    'y': v41
  }, {
    'x': v42,
    'y': v43
  }, v44);
  v45.push({
    'x': v42,
    'y': v43
  });
  return v45;
}
function addLightningGlow(v57, v58) {
  v57.save();
  v57.globalCompositeOperation = "screen";
  v58.forEach(v59 => {
    const v60 = v57.createRadialGradient(v59.startX, v59.startY, 0, v59.startX, v59.startY, 100);
    v60.addColorStop(0, "rgba(100, 150, 255, " + v59.intensity * 0.3 + ')');
    v60.addColorStop(1, "transparent");
    v57.fillStyle = v60;
    v57.beginPath();
    v57.arc(v59.startX, v59.startY, 100, 0, Math.PI * 2);
    v57.fill();
    v57.strokeStyle = "rgba(80, 120, 255, " + v59.intensity * 0.4 + ')';
    v57.lineWidth = 20;
    v57.lineCap = "round";
    v57.beginPath();
    v57.moveTo(v59.points[0].x, v59.points[0].y);
    for (let v61 = 1; v61 < v59.points.length; v61++) {
      v57.lineTo(v59.points[v61].x, v59.points[v61].y);
    }
    v57.stroke();
    v57.strokeStyle = "rgba(150, 200, 255, " + v59.intensity * 0.6 + ')';
    v57.lineWidth = 10;
    v57.beginPath();
    v57.moveTo(v59.points[0].x, v59.points[0].y);
    for (let v62 = 1; v62 < v59.points.length; v62++) {
      v57.lineTo(v59.points[v62].x, v59.points[v62].y);
    }
    v57.stroke();
  });
  v57.restore();
}
function addElectricalArcs(v63, v64, v65) {
  v63.save();
  v63.globalCompositeOperation = "screen";
  for (let v66 = 0; v66 < 15; v66++) {
    const v67 = v64 * 0.3 + Math.random() * v64 * 0.4;
    const v68 = v65 * 0.4 + Math.random() * v65 * 0.3;
    const v69 = 20 + Math.random() * 50;
    drawElectricalArc(v63, v67, v68, v69);
  }
  for (let v70 = 0; v70 < 5; v70++) {
    const v71 = v64 * 0.2 + Math.random() * v64 * 0.6;
    const v72 = v65 * 0.85;
    drawGroundStrike(v63, v71, v72);
  }
  v63.restore();
}
function drawElectricalArc(v73, v74, v75, v76) {
  const v77 = [];
  v77.push({
    'x': v74,
    'y': v75
  });
  for (let v78 = 0; v78 < 8; v78++) {
    v77.push({
      'x': v74 + (Math.random() - 0.5) * v76 * 2,
      'y': v75 + (Math.random() - 0.5) * v76
    });
  }
  const v79 = ["rgba(100, 150, 255, 0.8)", "rgba(150, 200, 255, 0.6)", "rgba(200, 230, 255, 0.4)"];
  v79.forEach((v80, v81) => {
    v73.strokeStyle = v80;
    v73.lineWidth = 3 - v81;
    v73.lineCap = "round";
    v73.beginPath();
    v73.moveTo(v77[0].x, v77[0].y);
    for (let v82 = 1; v82 < v77.length; v82++) {
      v73.lineTo(v77[v82].x, v77[v82].y);
    }
    v73.stroke();
  });
  addSparkParticles(v73, v77[v77.length - 1].x, v77[v77.length - 1].y);
}
function drawGroundStrike(v83, v84, v85) {
  const v86 = v83.createRadialGradient(v84, v85, 0, v84, v85, 60);
  v86.addColorStop(0, "rgba(100, 150, 255, 0.6)");
  v86.addColorStop(0.5, "rgba(80, 120, 255, 0.3)");
  v86.addColorStop(1, 'transparent');
  v83.fillStyle = v86;
  v83.beginPath();
  v83.arc(v84, v85, 60, 0, Math.PI * 2);
  v83.fill();
  v83.strokeStyle = "rgba(200, 220, 255, 0.8)";
  v83.lineWidth = 2;
  for (let v87 = 0; v87 < 5; v87++) {
    const v88 = v87 / 5 * Math.PI * 2;
    const v89 = 15 + Math.random() * 25;
    v83.beginPath();
    v83.moveTo(v84, v85);
    v83.lineTo(v84 + Math.cos(v88) * v89, v85 + Math.sin(v88) * v89);
    v83.stroke();
  }
  addSparkParticles(v83, v84, v85);
}
function addSparkParticles(v90, v91, v92) {
  v90.save();
  v90.globalCompositeOperation = "screen";
  for (let v93 = 0; v93 < 8; v93++) {
    const v94 = Math.random() * Math.PI * 2;
    const v95 = 5 + Math.random() * 20;
    const v96 = 1 + Math.random() * 3;
    const v97 = v91 + Math.cos(v94) * v95;
    const v98 = v92 + Math.sin(v94) * v95;
    v90.fillStyle = "rgba(150, 200, 255, 0.8)";
    v90.beginPath();
    v90.arc(v97, v98, v96 * 2, 0, Math.PI * 2);
    v90.fill();
    v90.fillStyle = "rgba(255, 255, 255, 1)";
    v90.beginPath();
    v90.arc(v97, v98, v96 * 0.5, 0, Math.PI * 2);
    v90.fill();
  }
  v90.restore();
}
function drawElectrifiedText(v99, v100, v101, v102) {
  const v103 = v101 * 0.35;
  const v104 = v102 * 0.6;
  v99.save();
  v99.shadowColor = "rgba(100, 150, 255, 0.8)";
  v99.shadowBlur = 40;
  const v105 = v99.createLinearGradient(v103 - 100, v104 - 50, v103 + 100, v104 + 50);
  v105.addColorStop(0, "#ffffff");
  v105.addColorStop(0.3, '#aaccff');
  v105.addColorStop(0.7, '#6688ff');
  v105.addColorStop(1, "#4466cc");
  v99.font = "bold 70px \"Arial\"";
  v99.textAlign = "center";
  v99.textBaseline = "middle";
  v99.fillStyle = v105;
  v99.fillText(v100.toUpperCase(), v103, v104);
  v99.shadowColor = "transparent";
  v99.strokeStyle = "rgba(200, 220, 255, 0.9)";
  v99.lineWidth = 3;
  v99.strokeText(v100.toUpperCase(), v103, v104);
  addTextLightning(v99, v100, v103, v104);
  v99.restore();
}
function addTextLightning(v106, v107, v108, v109) {
  v106.save();
  v106.globalCompositeOperation = "screen";
  const v110 = v106.measureText(v107.toUpperCase());
  const v111 = v110.width;
  for (let v112 = 0; v112 < v107.length * 2; v112++) {
    const v113 = v112 / (v107.length * 2);
    const v114 = v108 - v111 / 2 + v111 * v113;
    const v115 = v109 - 35 + Math.random() * 70;
    if (Math.random() > 0.7) {
      const v116 = 10 + Math.random() * 30;
      const v117 = Math.random() * Math.PI * 2;
      v106.strokeStyle = "rgba(150, 200, 255, " + (0.3 + Math.random() * 0.4) + ')';
      v106.lineWidth = 1 + Math.random() * 2;
      v106.beginPath();
      v106.moveTo(v114, v115);
      v106.lineTo(v114 + Math.cos(v117) * v116, v115 + Math.sin(v117) * v116);
      v106.stroke();
    }
  }
  v106.restore();
}
function addStormClouds(v118, v119, v120) {
  v118.save();
  const v121 = v118.createLinearGradient(0, v120 * 0.2, 0, v120 * 0.5);
  v121.addColorStop(0, "rgba(40, 40, 60, 0.9)");
  v121.addColorStop(1, "rgba(20, 20, 40, 0.7)");
  v118.fillStyle = v121;
  v118.beginPath();
  v118.moveTo(v119 * 0.1, v120 * 0.3);
  for (let v122 = 0; v122 <= 10; v122++) {
    const v123 = v119 * 0.1 + v122 / 10 * v119 * 0.8;
    const v124 = v120 * 0.3 + Math.sin(v122 * 0.8) * 20 - Math.random() * 10;
    v118.lineTo(v123, v124);
  }
  for (let v125 = 10; v125 >= 0; v125--) {
    const v126 = v119 * 0.1 + v125 / 10 * v119 * 0.8;
    const v127 = v120 * 0.5 + Math.cos(v125 * 0.5) * 15 + Math.random() * 10;
    v118.lineTo(v126, v127);
  }
  v118.closePath();
  v118.fill();
  v118.strokeStyle = "rgba(80, 80, 120, 0.6)";
  v118.lineWidth = 2;
  v118.stroke();
  v118.restore();
}
function addRainEffects(v128, v129, v130) {
  v128.save();
  v128.globalAlpha = 0.6;
  for (let v131 = 0; v131 < 200; v131++) {
    const v132 = Math.random() * v129;
    const v133 = Math.random() * v130;
    const v134 = 10 + Math.random() * 20;
    const v135 = Math.PI * 0.2;
    v128.strokeStyle = "rgba(150, 180, 220, " + (0.3 + Math.random() * 0.4) + ')';
    v128.lineWidth = 1;
    v128.lineCap = "round";
    v128.beginPath();
    v128.moveTo(v132, v133);
    v128.lineTo(v132 + Math.cos(v135) * v134, v133 + Math.sin(v135) * v134);
    v128.stroke();
  }
  v128.restore();
}
function addBackgroundLightningFlashes(v136, v137, v138) {
  v136.save();
  v136.globalAlpha = 0.1;
  v136.globalCompositeOperation = 'screen';
  for (let v139 = 0; v139 < 3; v139++) {
    const v140 = Math.random() * v137;
    const v141 = Math.random() * v138 * 0.5;
    const v142 = 100 + Math.random() * 200;
    const v143 = v136.createRadialGradient(v140, v141, 0, v140, v141, v142);
    v143.addColorStop(0, "rgba(100, 150, 255, 0.4)");
    v143.addColorStop(1, "transparent");
    v136.fillStyle = v143;
    v136.beginPath();
    v136.arc(v140, v141, v142, 0, Math.PI * 2);
    v136.fill();
  }
  v136.restore();
}
function addEnergyParticles(v144, v145, v146) {
  v144.save();
  v144.globalCompositeOperation = "screen";
  for (let v147 = 0; v147 < 50; v147++) {
    const v148 = Math.random() * v145;
    const v149 = Math.random() * v146;
    const v150 = 1 + Math.random() * 4;
    const v151 = 0.3 + Math.random() * 0.5;
    v144.fillStyle = "rgba(100, 180, 255, " + v151 + ')';
    v144.beginPath();
    v144.arc(v148, v149, v150, 0, Math.PI * 2);
    v144.fill();
    v144.fillStyle = "rgba(150, 200, 255, " + v151 * 0.3 + ')';
    v144.beginPath();
    v144.arc(v148, v149, v150 * 2, 0, Math.PI * 2);
    v144.fill();
  }
  v144.restore();
}
function drawElectricBorder(v152, v153, v154) {
  v152.save();
  const v155 = v152.createLinearGradient(0, 0, v153, v154);
  v155.addColorStop(0, "#4466cc");
  v155.addColorStop(0.5, "#88aaff");
  v155.addColorStop(1, '#4466cc');
  v152.strokeStyle = v155;
  v152.lineWidth = 8;
  v152.shadowColor = "rgba(100, 150, 255, 0.8)";
  v152.shadowBlur = 25;
  v152.strokeRect(10, 10, v153 - 20, v154 - 20);
  v152.strokeStyle = "rgba(200, 220, 255, 0.6)";
  v152.lineWidth = 2;
  v152.shadowBlur = 15;
  v152.strokeRect(20, 20, v153 - 40, v154 - 40);
  v152.restore();
}
function addLightningSignature(v156, v157, v158) {
  v156.save();
  const v159 = v157 - 110;
  const v160 = v158 - 25;
  v156.font = "italic 14px \"Arial\"";
  v156.fillStyle = "rgba(150, 200, 255, 0.9)";
  v156.textAlign = "right";
  v156.textBaseline = "bottom";
  v156.shadowColor = "rgba(100, 150, 255, 0.6)";
  v156.shadowBlur = 15;
  v156.fillText("by " + (config.botName || 'JuneX-Ultra'), v159, v160);
  v156.strokeStyle = "rgba(200, 220, 255, 0.8)";
  v156.lineWidth = 2;
  v156.lineCap = "round";
  v156.beginPath();
  v156.moveTo(v159 + 5, v160 - 10);
  v156.lineTo(v159 - 15, v160 + 5);
  v156.lineTo(v159 - 5, v160);
  v156.lineTo(v159 - 25, v160 + 15);
  v156.stroke();
  v156.restore();
}
