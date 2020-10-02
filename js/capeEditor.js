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
  baseColor: "882D2D",
  layers: []
}

document.addEventListener('DOMContentLoaded', function () {
  console.log('loaded!')

  let cape;

  /* Jimp.read("../img/cape.png")
  .then(image => {
    cape = image;
  })
  .catch(err => {
    console.error(err);
  }) */

  function calcShading() {
    if(opts.doShading) {

    }
  }

  function recalcOrder() {
    const layers = document.querySelectorAll(".layer");
    for(let i = 1; i < layers.length; i++) {
      const layer = layers[i];

      layer.id = "layer"+i;

      layer.querySelector("span").innerHTML = "Layer "+i;
    }
  }

  document.querySelector("#patternColor").onchange = function (e) {
    console.log("change");
    if(e.target.value.match(/[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4}/) != null) {
      if(opts.editing === 0) {
        opts.baseColor = e.target.value;

        document.querySelector("#baseLayer .patternPreview").style = "background-color: #"+e.target.value;
      } else {
        opts.layers[opts.editing-1].color = e.target.value;

        document.querySelector("#layers").children[opts.editing].querySelector(".patternPreview").style = "background-color: #"+e.target.value;
      }
    }
  }

  document.querySelector("#patternColor").oninput = function (e) {
    e.target.value = e.target.value.replace(/[^0-9a-fA-F]/g, "");
  }

  function closePatternEditor() {


    document.querySelector("#patternSelector").style = "display: none";
  }

  function createLayer() {
    const fullLayer = document.createDocumentFragment();
    const layerNum = opts.layers.length+1;

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
    patternPreview.style = "background-color: #FFFFFF";
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
      deleteLayer(layer);
    });
    deleteLabel.appendChild(deleteInput);

    document.querySelector("#layers").appendChild(fullLayer);

    opts.layers.push({
      color: "FFFFFF",
      pattern: "00",
      element: layer
    });

    return layerNum;
  }

  function deleteLayer(elem) {
    const layerElem = elem.closest(".layer");
    const index = Array.from(layerElem.parentNode.children).indexOf(layerElem);

    console.log("removing "+(index-1))
    opts.layers.splice(index-1, 1);

    while (elem.lastElementChild) {
      elem.removeChild(elem.lastElementChild);
    }

    elem.parentNode.removeChild(elem);

    recalcOrder();
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
      document.querySelector("#patternColor").value = opts.baseColor;
    } else {
      document.querySelector("#patternColor").value = opts.layers[opts.editing-1].color;
    }

    document.querySelector("#patternSelector").style = "";
  }

  document.querySelector("#done").addEventListener("click", closePatternEditor);

  document.querySelector("#add").addEventListener("click", function () {
    openPatternEditor(null, createLayer());
  });

  const toggles = document.querySelectorAll(".openPatterns");
  for(let i = 0; i < toggles.length; i++) {
    toggles[i].addEventListener("click", openPatternEditor)
  }
});