BushGenerator = function (scene, sd, ground, min, max, num) {
    this.twigNumber = num;
    this._twig = [];
    this.scene = scene;

    this.minXZ = min;
    this.maxXZ = max;

    this.scene = scene;
    this.sd = sd;
    this.ground = ground;

    this.generate();
};

BushGenerator.prototype.generate = function () {

    this.clean();

    var randomNumber = function (min, max) {
        if (min == max) {
            return (min);
        }
        var random = Math.random();
        return ((random * (max - min)) + min);
    };

    let _this = this;
    var cyl = BABYLON.MeshBuilder.CreateCylinder("cyl", {
        diameterTop: 0.5,
        diameterBottom: 0.5,
        height: 3,
        tessellation: 7
    }, scene);
    cyl.material = new BABYLON.StandardMaterial("mat", scene);
    cyl.material.diffuseColor = BABYLON.Color3.FromInts(0.23 * 255, 0.18 * 255, 0.05 * 255);
    cyl.material.specularColor = BABYLON.Color3.Black();
    cyl.resourceType = "wood";
    cyl.isVisible = false;

    for (var i = 0; i < _this.twigNumber; i++) {
        var newInstance = cyl.createInstance("i" + i);

        let x = randomNumber(_this.minXZ, _this.maxXZ);
        let z = randomNumber(_this.minXZ, _this.maxXZ);
        newInstance.position.z = z;
        newInstance.position.x = x;
        newInstance.position.y = 0.2;
        newInstance.addRotation(Math.PI / 2, randomNumber(0, 1), 0);
        newInstance.resourceType = "wood";

        _this._twig.push(newInstance);
        _this.sd.getShadowMap().renderList.push(newInstance);
    }
};

BushGenerator.prototype.addToRenderList = function (water) {
    this._twig.forEach(function (t) {
        water.addToRenderList(t);
    });
    return water;
};

BushGenerator.prototype.clean = function () {
    this._twig.forEach(function (t) {
        t.dispose();
    });

    this._twig = [];
};
