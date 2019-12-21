RockGenerator = function (scene, sd, ground, min, max, num) {
    this.rockNumber = num;
    this._rocks = [];
    this.scene = scene;
    this.minSizeRock = 5;
    this.maxSizeRock = 30;

    this.numberOfDifferent = 8;

    this.minXZ = min;
    this.maxXZ = max;

    this.scene = scene;
    this.sd = sd;
    this.ground = ground;

    this.generate();
};

RockGenerator.prototype.generate = function () {

    this.clean();

    var randomNumber = function (min, max) {
        if (min == max) {
            return (min);
        }
        var random = Math.random();
        return ((random * (max - min)) + min);
    };

    var size;

    for (var j = 0; j < this.numberOfDifferent; j++) {
        size = randomNumber(this.minSizeRock, this.maxSizeRock);
        var rock = Rock(size, this.scene, this.sd);
        rock.isVisible = false;
        rock.position.y = -100;

        // Using instances for rendering
        for (var i = 0; i < this.rockNumber/this.numberOfDifferent; i++) {
            var newInstance = rock.createInstance("i" + i);
            this.sd.getShadowMap().renderList.push(newInstance);
            newInstance.receiveShadows = true;

            newInstance.position.x = randomNumber(this.minXZ, this.maxXZ);
            newInstance.position.z = randomNumber(this.minXZ, this.maxXZ);
            newInstance.position.y = 0;
            newInstance.resourceType = 'rock';
            newInstance.canDestroy = true;
            newInstance.isPickable = true;
            newInstance.checkCollisions = true;

            this._rocks.push(newInstance);
        }
    }

};

RockGenerator.prototype.addToRenderList = function (water) {
    this._rocks.forEach(function (t) {
        water.addToRenderList(t);
    });
    return water;
};

RockGenerator.prototype.clean = function () {
    this._rocks.forEach(function (t) {
        t.dispose();
    });

    this._rocks = [];
};
