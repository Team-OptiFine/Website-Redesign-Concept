/**
 * every single thing here is terrible
 * 
 * 
 * 
 * 
 * 
 */

const opts = {
  doShading: true,
  editing: 0,
  preset: 0,
  cssRule: null,
  capeData: {
    baseColor: "000000",
    layers: []
  }
}

const presets = [
  {
    name: "OptiFine Classic",
    baseColor: "882D2D",
    layers: [
      {
        color: "5C1C1C",
        pattern: 3,
      },
      {
        color: "E29F00",
        pattern: 4,
      },
      {
        color: "441616",
        pattern: 5,
      }
    ]
  },
  {
    name: "OptiFine Neo",
    baseColor: "313E7C",
    layers: [
      {
        color: "27274E",
        pattern: 3,
      },
      {
        color: "E5EAFF",
        pattern: 4,
      },
      {
        color: "151835",
        pattern: 5,
      }
    ]
  },
  {
    name: "OptiFine White",
    baseColor: "FAFAFA",
    layers: [
      {
        color: "DDDDDD",
        pattern: 3,
      },
      {
        color: "FFFFFF",
        pattern: 4,
      },
      {
        color: "C8C8C8",
        pattern: 5,
      }
    ]
  },
  {
    name: "OptiFine Gray",
    baseColor: "888888",
    layers: [
      {
        color: "5E5E5E",
        pattern: 3,
      },
      {
        color: "CECECE",
        pattern: 4,
      },
      {
        color: "444444",
        pattern: 5,
      }
    ]
  },
  {
    name: "OptiFine Black",
    baseColor: "202020",
    layers: [
      {
        color: "010101",
        pattern: 3,
      },
      {
        color: "404040",
        pattern: 4,
      },
      {
        color: "202020",
        pattern: 5,
      }
    ]
  },
  {
    name: "OptiFine Red",
    baseColor: "880000",
    layers: [
      {
        color: "5E0000",
        pattern: 3,
      },
      {
        color: "E20000",
        pattern: 4,
      },
      {
        color: "440000",
        pattern: 5,
      }
    ]
  },
  {
    name: "OptiFine Green",
    baseColor: "008800",
    layers: [
      {
        color: "005E00",
        pattern: 3,
      },
      {
        color: "00E200",
        pattern: 4,
      },
      {
        color: "004400",
        pattern: 5,
      }
    ]
  },
  {
    name: "OptiFine Blue",
    baseColor: "000088",
    layers: [
      {
        color: "00005E",
        pattern: 3,
      },
      {
        color: "4040FF",
        pattern: 4,
      },
      {
        color: "000044",
        pattern: 5,
      }
    ]
  },
  {
    name: "OptiFine Yellow",
    baseColor: "F5F500",
    layers: [
      {
        color: "CACA00",
        pattern: 3,
      },
      {
        color: "FFFF00",
        pattern: 4,
      },
      {
        color: "BEBE00",
        pattern: 5,
      }
    ]
  },
  {
    name: "OptiFine Purple",
    baseColor: "880088",
    layers: [
      {
        color: "5E005E",
        pattern: 3,
      },
      {
        color: "E200E2",
        pattern: 4,
      },
      {
        color: "440044",
        pattern: 5,
      }
    ]
  },
  {
    name: "OptiFine Cyan",
    baseColor: "008888",
    layers: [
      {
        color: "005E5E",
        pattern: 3,
      },
      {
        color: "00E2E2",
        pattern: 4,
      },
      {
        color: "004444",
        pattern: 5,
      }
    ]
  },
  
]

const patternsDir = "./img/patterns/";

const patterns = [
  {
    name: null,
    file: "base",
    jimp: null
  },
  {
    name: null,
    file: "shading_basic",
    jimp: null
  },
  {
    name: "Top Gradient",
    file: "gradient_top",
    jimp: null
  },
  {
    name: "Bottom Gradient",
    file: "gradient_bottom",
    jimp: null
  },
  {
    name: "OptiFine Logo",
    file: "of_text",
    jimp: null
  },
  {
    name: "OptiFine Shadow",
    file: "of_shadow",
    jimp: null
  },
  {
    name: "OptiFine Logo, Top Gradient",
    file: "of_text_gradient_top",
    jimp: null
  },
  {
    name: "OptiFine Logo, Bottom Gradient",
    file: "of_text_gradient_bottom",
    jimp: null
  }
];

document.addEventListener('DOMContentLoaded', function () {
  console.log('loaded!')

  // LOAD PATTERNS
  let promises = [];
  for(let i = 0; i < patterns.length; i++) {
    let pattern = patterns[i];
    let prefix = (pattern.name != null) ? "p_" : "s_"
    let path = patternsDir + prefix + pattern.file + ".png";

    console.log("load: "+path);
    
    promises.push(Jimp.read(path));
  }

  Promise.all(promises)
  .then(images => {
    for(let i = 0; i < images.length; i++) {
      patterns[i].jimp = images[i];
    }
    setPreset(0);
  })
  .catch(err => {
    console.error(err);
  });

  // GET CSS TEXTURE RULE
  for(let i = 0; i < document.styleSheets.length; i++) {
    let sheet = document.styleSheets[i];
    if (sheet.title === "capeEditorCSS") {
      for(let i = 0; i < sheet.cssRules.length; i++) {
        let rule = sheet.cssRules[i];
        if (rule.selectorText === ".capeTex") {
          opts.cssRule = rule;
          break;
        }
      }
      break;
    }
  }

  function redraw() {
    let presetData = JSON.parse(JSON.stringify(presets[opts.preset]));
    let cdata = JSON.stringify(opts.capeData)

    delete presetData.name;

    presetData = JSON.stringify(presetData);

    console.log(presetData);
    console.log(cdata);

    if(presetData === cdata) {
      console.log('same as preset')
    } else {
      console.log('custom')

      let preSelect = document.querySelector("#presets");
      preSelect.value = preSelect.children[0].value;
    }

    let startTime = new Date().getTime();

    document.querySelector("#baseLayer .patternPreview").style = "background-color: #"+opts.capeData.baseColor;

    let img = colorPattern(patterns[0].jimp, patterns[0].jimp, "#"+opts.capeData.baseColor);

    function finalRender() {
      img.then(function (jimpImage) {
        if(opts.doShading) {
          console.log('add shading')
          return applyPattern(jimpImage, patterns[1].jimp, "#000000");
        } else {
          return Promise.resolve(jimpImage);
        }
      })
      .then(function (img) {
        img.getBase64Async(Jimp.MIME_PNG)
        .then(function(base64) {
          console.log("image rendered in "+(new Date().getTime() - startTime)+"ms")
          opts.cssRule.style = "background-image: url(data:image/png;"+base64+")";
        })
      })
    }

    if(opts.capeData.layers.length === 0) {
      finalRender();
    } else {
      for(let i = 0; i < opts.capeData.layers.length; i++) {
        let layer = opts.capeData.layers[i];
  
        img = img.then(function(jimpImage) {
          return applyPattern(jimpImage, patterns[layer.pattern].jimp, "#"+layer.color);
        });
  
        if(i+1 === opts.capeData.layers.length) {
          finalRender();
        }
      }
    }
  }

  function resetLayers() {
    let layers = document.querySelectorAll("#layers .layer");
    for(let i = 0; i < layers.length; i++) {
      if(layers[i].id === "baseLayer") continue;

      deleteLayer(true, layers[i]);
    }
  }

  function redrawLayers() {
    resetLayers();

    let layers = opts.capeData.layers;

    for(let i = 0; i < layers.length; i++) {
      createLayer(true, layers[i].pattern, layers[i].color, i+1);
    }
  }

  function colorPattern(base, pattern, color) {
    return new Promise((resolve, reject) => {
      let p = pattern.clone();

      p.scan(0, 0, p.bitmap.width, p.bitmap.height, function(x, y, idx) {
        const r = this.bitmap.data[idx+0];
        const g = this.bitmap.data[idx+1];
        const b = this.bitmap.data[idx+2];

        const baseTransparency = Jimp.intToRGBA(base.getPixelColor(x, y)).a;
        const targetTransparency = (r+g+b) / 3;

        this.bitmap.data[idx+3] = Math.min(targetTransparency, baseTransparency);

        let newColor = Jimp.intToRGBA(Jimp.cssColorToHex(color));
        this.bitmap.data[idx+0] = newColor.r;
        this.bitmap.data[idx+1] = newColor.g;
        this.bitmap.data[idx+2] = newColor.b;

        //console.log("color is now "+[r, g, b].join())

        if (x === p.bitmap.width-1 && y === p.bitmap.height-1) {
          resolve(p);
        }
      });
    });
  }

  function applyPattern(img, pattern, color) {
    return new Promise((resolve, reject) => {
      colorPattern(img, pattern, color).then(function (colored) {
        resolve(img.composite(colored, 0, 0));
      })
    });
  }

  function recalcOrder() {
    const layers = document.querySelectorAll(".layer");
    for(let i = 1; i < layers.length; i++) {
      const layer = layers[i];

      layer.id = "layer"+i;

      layer.querySelector("span").innerHTML = "Layer "+i;
    }
  }

  function setPreset(i) {
    console.log(i);

    opts.preset = i;
    opts.capeData = JSON.parse(JSON.stringify(presets[i]));
    delete opts.capeData.name;

    console.log(opts.capeData);

    console.warn('redraw');
    redraw();
    redrawLayers();
  }

  // LOAD PRESETS
  for(let i = 0; i < presets.length; i++) {
    let newPreset = document.createElement('option');
    newPreset.innerHTML = presets[i].name;
    if (i === 0) newPreset.selected = true;

    document.querySelector("#presets").appendChild(newPreset);
  }

  function closePatternEditor() {
    document.querySelector("#patternSelector").style = "display: none";
  }

  function createLayer(onlyHTML, pattern, color, index) {
    const fullLayer = document.createDocumentFragment();
    const layerNum = (index != null) ? index : opts.capeData.layers.length+1;

    const colorValue = (color != null) ? color : "FFFFFF";
    const patternValue = (pattern != null) ? pattern : 2;

    console.log(index);

    let layer = document.createElement('div');
    let patternPreview = document.createElement('div');
    let displayName = document.createElement('span');
    let editLabel = document.createElement('label');
    let editInput = document.createElement('input');
    let deleteLabel = document.createElement('label');
    let deleteInput = document.createElement('input');

    layer.classList = "layer";
    layer = fullLayer.appendChild(layer);

    patternPreview.classList = "patternPreview";
    patternPreview.style = "background-color: #"+colorValue;
    layer.appendChild(patternPreview);

    displayName.innerHTML = "Layer "+layerNum;
    layer.appendChild(displayName);

    editLabel.classList = "editor-button";
    editLabel.title = "Edit Pattern";
    editLabel.innerHTML = "Edit";
    editLabel = layer.appendChild(editLabel);

    editInput.type = "button";
    editInput.classList = "editor-input";
    editInput.addEventListener("click", openPatternEditor);
    editLabel.appendChild(editInput);

    deleteLabel.classList = "editor-button";
    deleteLabel.title = "Delete Pattern";
    deleteLabel.innerHTML = "Del";
    deleteLabel = layer.appendChild(deleteLabel);

    deleteInput.type = "button";
    deleteInput.classList = "editor-input";
    deleteInput.addEventListener("click", function() {
      deleteLayer(false, layer);
    });
    deleteLabel.appendChild(deleteInput);

    document.querySelector("#layers").appendChild(fullLayer);

    if(!onlyHTML) {
      opts.capeData.layers.push({
        color: colorValue,
        pattern: patternValue
      });

      console.warn('redraw');
      redraw();
    }

    return layerNum;
  }

  function deleteLayer(onlyHTML, elem) {
    const layerElem = elem.closest(".layer");
    const index = Array.from(layerElem.parentNode.children).indexOf(layerElem);

    while (elem.lastElementChild) {
      elem.removeChild(elem.lastElementChild);
    }

    elem.parentNode.removeChild(elem);

    if(!onlyHTML) {
      console.log("removing "+(index-1))
      opts.capeData.layers.splice(index-1, 1);

      console.warn('redraw');
      redraw();
    }
  }

  function openPatternEditor(e, index) {
    if(e) {
      const layerElem = e.target.closest(".layer");

      if (layerElem != null) {
        opts.editing = Array.from(layerElem.parentNode.children).indexOf(layerElem);
      }
    }

    if(index) {
      opts.editing = index;
    }

    console.log(opts.editing);

    if(opts.editing === 0) {
      document.querySelector("#patternColor").value = opts.capeData.baseColor;
    } else {
      document.querySelector("#patternColor").value = opts.capeData.layers[opts.editing-1].color;
    }

    document.querySelector("#patternSelector").style = "";
  }

  document.querySelector("#redraw").addEventListener("click", function() {
    console.warn('redraw');
    redraw();
    redrawLayers();
  });

  document.querySelector("#shade").addEventListener("click", function(e) {
    opts.doShading = e.target.checked;
    console.warn('redraw');
    redraw();
  });

  document.querySelector("#presets").onchange = function (e) {
    setPreset(e.target.selectedIndex-1)
  }

  document.querySelector("#patternColor").onchange = function (e) {
    console.log("change");
    if(e.target.value.match(/[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4}/) != null) {
      if(opts.editing === 0) {
        opts.capeData.baseColor = e.target.value;

        document.querySelector("#baseLayer .patternPreview").style = "background-color: #"+e.target.value;
      } else {
        opts.capeData.layers[opts.editing-1].color = e.target.value;

        document.querySelector("#layers").children[opts.editing].querySelector(".patternPreview").style = "background-color: #"+e.target.value;
      }

      console.warn('redraw');
      redraw();
    }
  }

  document.querySelector("#patternNumber").onchange = function (e) {
    console.log("change");
    if(patterns[e.target.value] != null && opts.editing !== 0) {
      opts.capeData.layers[opts.editing-1].pattern = e.target.value;

      console.warn('redraw');
      redraw();
    }
  }

  document.querySelector("#patternColor").oninput = function (e) {
    e.target.value = e.target.value.replace(/[^0-9a-fA-F]/g, "");
  }

  document.querySelector("#done").addEventListener("click", function (e) {
    if(document.querySelector("#patternColor").value.match(/[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4}/) != null) closePatternEditor();
  });

  document.querySelector("#add").addEventListener("click", function () {
    openPatternEditor(null, createLayer());
  });

  const toggles = document.querySelectorAll(".openPatterns");
  for(let i = 0; i < toggles.length; i++) {
    toggles[i].addEventListener("click", openPatternEditor)
  }
});