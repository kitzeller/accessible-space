var canvas = document.getElementById("renderCanvas"); // Get the canvas element
var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
var camera;
var gui;
var jumping = false;
var targetObject;
const DISTANCE_REQUIREMENT = 15;
var shadowGenerator;

var inventory = {
    wood: 0,
    rock: 0,
    apple: 0
};


const webcamElement = document.getElementById('webcam');
const classifier = knnClassifier.create();
let net;

async function app() {
    console.log('Loading MobileNet...');
    net = await mobilenet.load();
    console.log('Successfully loaded model');
    const webcam = await tf.data.webcam(webcamElement);

    // Reads an image from the webcam and associates it with a specific class
    // index.
    async function addExample(classId) {
        console.log(classId);
        const img = await webcam.capture();
        const activation = net.infer(img, 'conv_preds');
        classifier.addExample(activation, classId);
        img.dispose();
    };

    document.getElementById('class-w').addEventListener('click', () => addExample(0));
    document.getElementById('class-a').addEventListener('click', () => addExample(1));
    document.getElementById('class-s').addEventListener('click', () => addExample(2));
    document.getElementById('class-d').addEventListener('click', () => addExample(3));
    document.getElementById('class-stop').addEventListener('click', () => addExample(4));

    let lastLabel = "Stop";
    while (true) {
        if (classifier.getNumClasses() > 0) {
            const img = await webcam.capture();

            // Get the activation from mobilenet from the webcam.
            const activation = net.infer(img, 'conv_preds');
            // Get the most likely class and confidences from the classifier module.
            const result = await classifier.predictClass(activation);

            const classes = ['W', 'A', 'S', 'D', 'Stop'];
            console.log(classes[result.label]);

            function upAll() {
                var evt = new KeyboardEvent('keyup', {'keyCode': 87, 'which': 87});
                var pir = new BABYLON.KeyboardInfo(BABYLON.KeyboardEventTypes.KEYUP, evt);
                scene.onKeyboardObservable.notifyObservers(pir, BABYLON.KeyboardEventTypes.KEYUP);

                var evt = new KeyboardEvent('keyup', {'keyCode': 83, 'which': 83});
                var pir = new BABYLON.KeyboardInfo(BABYLON.KeyboardEventTypes.KEYUP, evt);
                scene.onKeyboardObservable.notifyObservers(pir, BABYLON.KeyboardEventTypes.KEYUP);

                var evt = new KeyboardEvent('keyup', {'keyCode': 65, 'which': 65});
                var pir = new BABYLON.KeyboardInfo(BABYLON.KeyboardEventTypes.KEYUP, evt);
                scene.onKeyboardObservable.notifyObservers(pir, BABYLON.KeyboardEventTypes.KEYUP);

                var evt = new KeyboardEvent('keyup', {'keyCode': 68, 'which': 68});
                var pir = new BABYLON.KeyboardInfo(BABYLON.KeyboardEventTypes.KEYUP, evt);
                scene.onKeyboardObservable.notifyObservers(pir, BABYLON.KeyboardEventTypes.KEYUP);
            }

            if (classes[result.label] === 'Stop' && classes[result.label] !== lastLabel) {
                upAll();
            }

            if (classes[result.label] === 'W' && classes[result.label] !== lastLabel) {
                upAll();
                var evt = new KeyboardEvent('keydown', {'keyCode': 87, 'which': 87});
                var pir = new BABYLON.KeyboardInfo(BABYLON.KeyboardEventTypes.KEYDOWN, evt);
                scene.onKeyboardObservable.notifyObservers(pir, BABYLON.KeyboardEventTypes.KEYDOWN);
            }

            if (classes[result.label] === 'S' && classes[result.label] !== lastLabel) {
                upAll();
                var evt = new KeyboardEvent('keydown', {'keyCode': 83, 'which': 83});
                let pir = new BABYLON.KeyboardInfo(BABYLON.KeyboardEventTypes.KEYDOWN, evt);
                scene.onKeyboardObservable.notifyObservers(pir, BABYLON.KeyboardEventTypes.KEYDOWN);
            }

            if (classes[result.label] === 'A' && classes[result.label] !== lastLabel) {
                upAll();
                var evt = new KeyboardEvent('keydown', {'keyCode': 65, 'which': 65});
                let pir = new BABYLON.KeyboardInfo(BABYLON.KeyboardEventTypes.KEYDOWN, evt);
                scene.onKeyboardObservable.notifyObservers(pir, BABYLON.KeyboardEventTypes.KEYDOWN);
            }

            if (classes[result.label] === 'D' && classes[result.label] !== lastLabel) {
                upAll();
                var evt = new KeyboardEvent('keydown', {'keyCode': 68, 'which': 68});
                let pir = new BABYLON.KeyboardInfo(BABYLON.KeyboardEventTypes.KEYDOWN, evt);
                scene.onKeyboardObservable.notifyObservers(pir, BABYLON.KeyboardEventTypes.KEYDOWN);
            }

            lastLabel = classes[result.label];
            img.dispose();
        }

        await tf.nextFrame();
    }
}

app();

canvas.addEventListener("click", function (evt) {
    canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
    if (canvas.requestPointerLock) {
        canvas.requestPointerLock();
    }
}, false);

var createScene = function () {
    // Create the scene space
    var scene = new BABYLON.Scene(engine);

    camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(10, 3, 10), scene);
    camera.attachControl(canvas, true);

    scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
    camera.applyGravity = true;
    camera.ellipsoid = new BABYLON.Vector3(1.5, 2, 1.5);
    scene.collisionsEnabled = true;
    camera.checkCollisions = true;
    camera.speed = 1;

    camera.keysUp.push(87);
    camera.keysDown.push(83);
    camera.keysLeft.push(65);
    camera.keysRight.push(68);

    camera.animations = [];
    this.jumpAnimation = new BABYLON.Animation(
        "a",
        "position.y", 10,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

    // Animation keys
    var keys = [];
    keys.push({frame: 0, value: camera.position.y});
    keys.push({frame: 5, value: camera.position.y + 20});
    keys.push({frame: 10, value: camera.position.y});
    this.jumpAnimation.setKeys(keys);
    var easingFunction = new BABYLON.CircleEase();
    easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    this.jumpAnimation.setEasingFunction(easingFunction);

    camera.animations.push(this.jumpAnimation);

    // Arm
    let rightArm;
    rightArm = BABYLON.MeshBuilder.CreateBox("rightArm", {height: 2, width: 0.5, depth: 0.5}, scene);
    rightArm.position.y = -0.7;
    rightArm.position.z = 1.5;
    rightArm.position.x = 0.7;
    // rightArm.position = new BABYLON.Vector3(4, 1, -7.5);
    rightArm.rotation.x = Math.PI - 2.5;
    rightArm.rotation.z = Math.PI - 0.3;
    rightArm.parent = this.camera;


    // Add lights to the scene
    var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
    var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0, 1, -1), scene);

    // Space background
    var skybox = BABYLON.Mesh.CreateBox("skyBox", 10000.0, scene);
    skybox.isPickable = false;
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    var files = [
        "assets/textures/Space/space_left.jpg",
        "assets/textures/Space/space_up.jpg",
        "assets/textures/Space/space_front.jpg",
        "assets/textures/Space/space_right.jpg",
        "assets/textures/Space/space_down.jpg",
        "assets/textures/Space/space_back.jpg",
    ];
    skyboxMaterial.reflectionTexture = BABYLON.CubeTexture.CreateFromImages(files, scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;


    // Add earth
    var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
    groundMaterial.diffuseTexture = new BABYLON.Texture("assets/textures/earth.jpg", scene);
    var earth = BABYLON.MeshBuilder.CreateSphere("sun", {diameter: 3}, scene);
    earth.material = groundMaterial;
    earth.rotation.x = Math.PI;
    earth.isPickable = false;
    earth.position.y = 100;
    earth.position.z = 100;

    var d1 = new BABYLON.DirectionalLight("dir", new BABYLON.Vector3(1, -1, -2), scene);
    d1.position = new BABYLON.Vector3(-300, 300, 600);

    // Shadows
    shadowGenerator = new BABYLON.ShadowGenerator(4096, d1);
    shadowGenerator.normalBias = 0.02;
    shadowGenerator.usePercentageCloserFiltering = true;

    scene.shadowsEnabled = true;

    var ground = BABYLON.MeshBuilder.CreateGround("ground", {height: 1000, width: 1000, subdivisions: 4}, scene);
    ground.material = new BABYLON.StandardMaterial("ground", scene);
    ground.material.diffuseColor = BABYLON.Color3.FromInts(56, 75, 45);
    ground.material.specularColor = BABYLON.Color3.Black();
    ground.receiveShadows = true;
    ground.collisionsEnabled = true;
    ground.checkCollisions = true;


    var ground2 = BABYLON.MeshBuilder.CreateGround("ground", {height: 1000, width: 1000, subdivisions: 200}, scene);
    ground2.material = new BABYLON.StandardMaterial("ground", scene);
    ground2.material.wireframe = true;
    ground2.position.x += 2.5;
    ground2.position.z += 2.5;


    console.log('[INFO] Generating rocks');
    let rg = new RockGenerator(this.scene, shadowGenerator, ground, -500, 500, 500);
    console.log('[INFO] Generating bushes');
    let tg = new BushGenerator(this.scene, shadowGenerator, ground, -500, 500, 100);

    scene.onPointerDown = (event, pr) => {

        var pickX = canvas.width / 2;
        var pickZ = canvas.height / 2;
        var pickResult = scene.pick(pickX, pickZ);
        if (pickResult && pickResult.pickedPoint && pickResult.distance <= DISTANCE_REQUIREMENT && event.button === 2) {
            createBox(pickResult.pickedPoint, shadowGenerator);
        }

    };

    addUI();
    return scene;
};

var handleKeyDown = function (e) {
    if (e.key === "Shift") {
        camera.speed = 2;
    }

    if (e.key === " ") {
        if (jumping) return;
        // jumping = true;
        // camera.position.y += 10;
        // jumping = false;

        camera.animations = [];
        var a = new BABYLON.Animation(
            "a",
            "position.y", 10,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

        // Animation keys
        var keys = [];
        keys.push({frame: 0, value: camera.position.y});
        keys.push({frame: 10, value: camera.position.y + 10});
        a.setKeys(keys);
        var easingFunction = new BABYLON.CircleEase();
        easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        a.setEasingFunction(easingFunction);
        camera.animations.push(a);
        scene.beginAnimation(camera, 0, 10, false, 1, function () {
            jumping = false;
        });

        // scene.beginAnimation(camera, 0, 10, false, 1, function () {
        //     jumping = false;
        // });
    }
};

var handleKeyUp = function (e) {
    console.log(e)

    if (e.key === "Shift") {
        camera.speed = 1;
    }

    if (e.key === "e") {
        if (targetObject) {
            inventory[targetObject.resourceType] += 1;
            // gui_elements[selectedPosition.pickedMesh.resourceType].text = "" + inventory[selectedPosition.pickedMesh.resourceType];
            console.log(targetObject.resourceType);
            $("#" + targetObject.resourceType).text("" + inventory[targetObject.resourceType]);
            targetObject.dispose();

            decreaseHunger(10);
        }
    }
};

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

var decreaseHunger = function (damage) {
    var total = $("#hunger-bar").data('total');
    var value = $("#hunger-bar").data('value');

    // damage = 100;
    var newValue = value - damage;
    if (newValue > total) {
        damage = total - newValue;
        newValue = total;
    }
    // calculate the percentage of the total width
    var barWidth = (newValue / total) * 100;
    var hitWidth = (damage / value) * 100 + "%";

    // show hit bar and set the width
    $("#hunger-hit").css('width', hitWidth);
    $("#hunger-bar").data('value', newValue);

    setTimeout(function () {
        $("#hunger-hit").css({'width': '0'});
        $("#hunger-bar-inner").css('width', barWidth + "%");
    }, 200);
};

var createBox = function (pickedPoint, sg) {
    var boxSize = 5;
    var mat = new BABYLON.StandardMaterial("", scene);
    mat.diffuseTexture = new BABYLON.Texture("https://i.imgur.com/LrucUu6.jpg", scene);
    var mesh = BABYLON.Mesh.CreateBox("box", boxSize + .1, scene);
    mesh.material = mat;
    mesh.checkCollisions = true;
    sg.getShadowMap().renderList.push(mesh);
    mesh.position.x = nearest(pickedPoint.x, 5);
    mesh.position.z = nearest(pickedPoint.z, 5);
    mesh.position.y = nearest(pickedPoint.y + (boxSize - boxSize / 2), 5) - 2.5;
    let count = 0;
    while (mesh.position.y < 2.5) {
        mesh.position.y = nearest(pickedPoint.y + count + (boxSize - boxSize / 2), 5) - 2.5;
        count++;
    }

    // var meshtop = BABYLON.MeshBuilder.CreateGround("meshtop", {height: 5, width: 5, subdivisions: 1}, scene);
    // meshtop.material = new BABYLON.StandardMaterial("ground", scene);
    // meshtop.position.x = mesh.position.x;
    // meshtop.position.z = mesh.position.z;
    // meshtop.position.y = meshtop.position.y + 5.1;
    // meshtop.checkCollisions = true;
    // meshtop.collisionsEnabled = true;
};

var addUI = function () {
    // GUI
    gui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    let dot = new BABYLON.GUI.Ellipse();
    dot.width = "6px"
    dot.height = "6px";
    dot.color = "White";
    dot.thickness = 4;
    dot.background = "White";
    gui.addControl(dot);
};

var scene = createScene(); //Call the createScene function

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
    scene.render();

    var pickX = canvas.width / 2;
    var pickZ = canvas.height / 2;
    var pickResult = scene.pick(pickX, pickZ);
    if (pickResult && pickResult.pickedPoint && pickResult.distance <= DISTANCE_REQUIREMENT) {
        if (pickResult.pickedMesh.resourceType != null) {
            // console.log("Wooo!");
            $("#info").show();
            $("#info").text("Press 'e' to pick up.")
            targetObject = pickResult.pickedMesh;
            return;
        }
    }
    targetObject = undefined;
    $("#info").hide();
});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});


function nearest(number, n) {
    return Math.round(number / n) * n;
}
