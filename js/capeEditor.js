/**
 * every single thing here is terrible
 * 
 * 
 * 
 * 
 * 
 */

const layerLimit = 8;

const opts = {
  doShading: true,
  editing: 0,
  preset: 0,
  custom: false,
  dragging: null,
  dragPosOld: null,
  dragPosNew: null,
  cssRule: null,
  capeData: {
    baseColor: "000000",
    layers: []
  }
}

const presets = [];

const patterns = [];

function hexToBytes(hex) {
  let bytes = []
  for (c = 0; c < hex.length; c += 2)
  bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}

function bytesToBase64(buffer) {
  let binary = '';
  let bytes = new Uint8Array(buffer);
  let len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToBytes(base64) {
  let binary_string = window.atob(base64);
  let len = binary_string.length;
  let bytes = [];
  for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes
}

function bytesToHex(bytes) {
  let hex = []
  for (i = 0; i < bytes.length; i++) {
      let current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
      hex.push((current >>> 4).toString(16));
      hex.push((current & 0xF).toString(16));
  }
  return hex.join("");
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('loaded!')

  const setup = [];
  const dir = "./img/patterns/";

  // Load Patterns
  setup.push(new Promise((resolve, reject) => {
    fetch(`${dir}index.json`)
    .then(response => response.json())
    .then(json => {
      console.log(json);

      let i = 0;

      (function loadNext() {
        const pattern = json[i];
        const prefix = (pattern.name != null) ? "p_" : "s_";
        const path = `${dir}${prefix}${pattern.file}.png`;
  
        console.log(`load ${path}`);
        
        Jimp.read(path).then(image => {
          pattern.jimp = image;
          patterns.push(pattern);
  
          if (i+1 === json.length) {
            resolve();
          } else {
            i++;
            loadNext();
          }
        })
      })();
    });
  }));

  // Load Preset Designs
  setup.push(new Promise((resolve, reject) => {
    fetch(`${dir}presets.json`)
    .then(response => response.json())
    .then(json => {
      for(let i = 0; i < json.length; i++) {
        const preset = json[i];
        presets.push(preset);

        let newPreset = document.createElement('option');
        newPreset.innerHTML = preset.name;
        if (i === 0) newPreset.selected = true;

        document.querySelector("#presets").appendChild(newPreset);
      }

      resolve();
    });
  }));

  // Get CSS texture rule
  setup.push(new Promise((resolve, reject) => {
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

    resolve();
  }));

  Promise.all(setup)
  .then(() => {
    console.log(patterns);
    console.log(presets);
    document.querySelector("#capeEditor").classList.remove("unloaded");

    setPreset(0);
  })
  .catch(err => {
    console.error(err);
  });
  function redraw() {
    if(!opts.custom) {
      // check if the design is now customized
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

        opts.custom = true;

        let preSelect = document.querySelector("#presets");
        preSelect.value = preSelect.children[0].value;
      }
    }

    opts.capeData.layers = opts.capeData.layers.splice(0, 9);

    // check layer limit and remove/add ability to add layers as needed

    if(opts.capeData.layers.length === layerLimit) {
      document.querySelector("#addLayer").classList = "cannotAdd";
    } else {
      document.querySelector("#addLayer").classList = "canAdd";
    }

    // reset graphical layers list

    document.querySelector("#baseLayer .patternPreview").style = "background-color: #"+opts.capeData.baseColor;

    let layers = document.querySelectorAll("#layers .layer:not(#baseLayer)");
    for(let i = 0; i < layers.length; i++) {
      deleteLayer(true, layers[i]);
    }

    let layerData = opts.capeData.layers;
    for(let i = 0; i < layerData.length; i++) {
      createLayer(true, layerData[i].pattern, layerData[i].color, i+1);
    }

    // move "add layer" button to end of node list

    const layersSection = document.querySelector("#layers")
    layersSection.appendChild(document.querySelector("#addLayer"));
    layersSection.scrollTop = layersSection.scrollHeight;

    // start compositing cape texture

    let startTime = new Date().getTime();
    let img = colorPattern(patterns[0].jimp, patterns[0].jimp, "#"+opts.capeData.baseColor);

    const finalRender = () => {
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
          let timeTaken = (new Date().getTime() - startTime)+"ms";
          console.log("image rendered in "+timeTaken)

          document.querySelector("#renderTime").innerHTML = "Render Time: "+timeTaken;

          opts.cssRule.style = "background-image: url(data:image/png;"+base64+")";
        })
      })
    }

    for(let i = 0; i < opts.capeData.layers.length; i++) {
      let layer = opts.capeData.layers[i];

      // get preview image
      colorPattern(patterns[0].jimp, patterns[layer.pattern].jimp, "#"+layer.color).then(function(preview) {
        preview.getBase64Async(Jimp.MIME_PNG)
        .then(function(base64) {
          console.log("updating "+i);
          document.querySelectorAll(".patternPreview")[i+1].style = "background-image: url(data:image/png;"+base64+")";
        });
      });

      // apply actual pattern
      img = img.then(function(jimpImage) {
        return applyPattern(jimpImage, patterns[layer.pattern].jimp, "#"+layer.color);
      });
    }

    finalRender();
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

  function setPreset(i) {
    console.log(i);

    opts.preset = i;
    opts.capeData = JSON.parse(JSON.stringify(presets[i]));
    delete opts.capeData.name;

    console.log(opts.capeData);

    console.warn('redraw');
    redraw();
  }

  function closePatternEditor() {
    document.querySelector("#patternSelector").style = "display: none";
  }

  function createLayer(onlyHTML, pattern, color, index) {
    if(!onlyHTML && opts.capeData.layers.length === layerLimit) {
      return layerLimit-1;
    }

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
    layer.setAttribute("draggable", true);
    layer.addEventListener("dragstart", function(e) {
      opts.dragging = e.target;
      e.target.classList.add("layerDrag");
      e.target.style.opacity = 0.5;

      opts.dragPosOld = Array.from(e.target.parentNode.children).indexOf(e.target)-1;

      console.log("dragging "+opts.dragPosOld);
    });
    layer.addEventListener("dragend", function(e) {
      e.target.style.opacity = null;
      opts.dragging = null;
      opts.dragPosOld = null;
      opts.dragPosNew = null;

      let layers = document.querySelectorAll(".layer");

      for(let i = 1; i < layers.length; i++) {
        layers[i].classList.remove("layerOver", "layerDrag");
      }
    });
    layer.addEventListener("dragenter", function(e) {
      if (opts.dragging === e.target || opts.dragging == null) return;
      layer.classList.add("layerOver");
      console.log(e.target);
    });
    layer.addEventListener("dragleave", function(e) {
      if (opts.dragging === e.target || opts.dragging == null) return;
      layer.classList.remove("layerOver");
    });
    layer.addEventListener("dragover", function(e) {
      if (e.preventDefault) e.preventDefault();
      return false;
    });
    layer.addEventListener("drop", function(e) {
      if (e.preventDefault) e.preventDefault();
      e.stopPropagation();

      if (opts.dragging != null && opts.dragging !== e.target) {

        opts.dragPosNew = Array.from(e.target.parentNode.children).indexOf(e.target)-1;

        console.log("oldPos: "+opts.dragPosOld);
        console.log("newPos: "+opts.dragPosNew);

        const otherLayers = opts.capeData.layers.filter(function(layer, index) {
          return index !== opts.dragPosOld;
        });
        
        opts.capeData.layers = [
          ...otherLayers.slice(0, opts.dragPosNew),
          opts.capeData.layers[opts.dragPosOld],
          ...otherLayers.slice(opts.dragPosNew)
        ];

        redraw();
      }
  
      return false;
    });
    
    layer = fullLayer.appendChild(layer);

    patternPreview.classList = "patternPreview";
    //patternPreview.style = "background-color: #"+colorValue;
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
    const index = Array.from(elem.parentNode.children).indexOf(elem);

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

    if(index) opts.editing = index;

    console.log(opts.editing);

    if(opts.editing === 0) {
      document.querySelector("#patternColor").value = opts.capeData.baseColor;
    } else {
      let currentLayer = opts.capeData.layers[opts.editing-1];
      document.querySelector("#patternColor").value = currentLayer.color;
      document.querySelector("#patternNumber").value = currentLayer.pattern;
    }

    document.querySelector("#patternSelector").style = "";
  }

  document.querySelector("#redraw").addEventListener("click", function() {
    console.warn('redraw');
    redraw();
  });

  document.querySelector("#shade").addEventListener("click", function(e) {
    opts.doShading = e.target.checked;
    console.warn('redraw');
    redraw();
  });

  document.querySelector("#presets").onchange = function (e) {
    if(opts.custom) {
      let answer = confirm("Discard all changes?");

      if(answer) {
        setPreset(e.target.selectedIndex-1)

        opts.custom = false;
      } else {
        e.target.value = e.target.children[0].value;
      }
    } else {
      setPreset(e.target.selectedIndex-1)
    }
  }

  document.querySelector("#patternColor").onchange = function (e) {
    console.log("change");
    if(e.target.value.match(/[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4}/) != null) {
      if(opts.editing === 0) {
        opts.capeData.baseColor = e.target.value;

        //document.querySelector("#baseLayer .patternPreview").style = "background-color: #"+e.target.value;
      } else {
        opts.capeData.layers[opts.editing-1].color = e.target.value;

        //document.querySelector("#layers").children[opts.editing].querySelector(".patternPreview").style = "background-color: #"+e.target.value;
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

  document.querySelector("#addLayer").addEventListener("click", function (e) {
    if(opts.capeData.layers.length === layerLimit) {
      e.target.classList.remove("canAdd");
      return;
    }
    openPatternEditor(null, createLayer());
  });

  const toggles = document.querySelectorAll(".openPatterns");
  for(let i = 0; i < toggles.length; i++) {
    toggles[i].addEventListener("click", openPatternEditor)
  }
});