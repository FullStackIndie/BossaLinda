import { ModelInfo } from "./model_info";

class ModelLoader {
  _modelInfo = new ModelInfo();
  _modelUrls = this._modelInfo.modelUrls;
  _imgUrls = this._modelInfo.imgUrls;
  _templateId = "";
  _viewId1 = "";
  _viewId2 = "";

  constructor(templateId, viewId1, viewId2) {
    this._templateId = templateId;
    this._viewId1 = viewId1;
    this._viewId2 = viewId2;
  }

  loadModels() {
    if (this._templateId == null || this._templateId == "") {
      console.log("Template ID was empty. Cannot load models");
      return;
    }
    if (this._viewId1 == null || this._viewId1 == "") {
      console.log("View ID1 List was empty. Cannot load models");
      return;
    }
    if (this._viewId2 == null || this._viewId2 == "") {
      console.log("View ID2 List was empty. Cannot load models");
      return;
    }

    var template = document.getElementById(this._templateId);
    var viewElement1 = document.getElementById(this._viewId1);
    var viewElement2 = document.getElementById(this._viewId2);
    let image = template.content.querySelector("img");
    let isFirstView = true;

    for (let i = 0; i < this._modelUrls.length; i++) {
      let img = document.importNode(image, true);
      let imgNumber = Math.floor(Math.random() * 7);
      img.setAttribute("src", this._imgUrls[imgNumber]);
      img.setAttribute("data-src", this._modelUrls[i]);
      // console.log(img);

      if (isFirstView) {
        viewElement1.appendChild(img);
        isFirstView = false;
      } else {
        viewElement2.appendChild(img);
        isFirstView = true;
      }
    }
  }
}

export { ModelLoader };
