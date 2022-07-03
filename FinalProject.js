import * as THREE from './sources/three/build/three.module.js';
// import { OrbitControls } from '../sources/three/examples/jsm/controls/OrbitControls.js';
// import {GLTFLoader} from '../sources/three/examples/jsm/loaders/GLTFLoader.js';
import {GUI} from "./sources/three/examples/jsm/libs/dat.gui.module.js"
import {Player} from "./Player.js"
import { Astronaut } from './Astronaut.js';
import { SpaceShip } from './SpaceShip.js';

window.onload = loadScene();


function loadScene(){
    THREE.Cache.enabled = false;
    const loader = new THREE.ObjectLoader();
    loader.load(('scenes/scene.json'), function (scene) {init(scene)});
    //loader.load(('scenes/PlanetSystem.json'), function (scene) {init(scene)});
    //loader.load(('scenes/CharacterAnimation.json'), function (scene) {init(scene)});

}

function init(scene){
//  Set the canvas: 
    const canvas = document.getElementById("gl-canvas");
    canvas.width  = window.innerWidth*0.9;
    canvas.height = window.innerHeight*0.9;
    canvas.style = "position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0px; margin: auto; border:2px solid white";

    //  Set the Renderer options:
    const renderer = new THREE.WebGLRenderer({canvas});
    renderer.physicallyCorrectLights = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap; //THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    
    //  Get all nodes names:
    let nodes = [];
    getChildrenNames(scene);
    
    //  Set the Astronaut as Player:
    const astronaut = scene.getObjectByName("Astronaut");
    const player = new Astronaut(astronaut);
    player.active = true;
    
    //  Set the Camera:
    let camera = astronaut.getObjectByName("PlayerCam");
    window.addEventListener('resize', resize);
    resize()


//  create an AudioListener and add it to the camera
    const stream = "https://cdn.rawgit.com/ellenprobst/web-audio-api-with-Threejs/57582104/lib/TheWarOnDrugs.m4a";
    const listener = new THREE.AudioListener();
    camera.add( listener );
    const sound = new THREE.Audio( listener );

    //  SpaceShip:
    const ship = new SpaceShip(scene.getObjectByName("SpaceShip"))

//  Function calls:
    configureInputs();
    // setArrowHelpers();
    guiOptions();
    render();

    function render() {
        requestAnimationFrame(render);
        camera.updateProjectionMatrix();
        player.update();
        ship.update()
        orbits();
        renderer.render(scene, camera);
    }

    function configureInputs() {
        //TODO: Configure global keyboard inputs...
        window.addEventListener('keydown', (e) => {
            switch(e.code){
                case('KeyS'):
                    // tweenTurnBack.start()
                    // dirX = dirX.negate()
                break;
                case('KeyC'):
                    camera = ship.model.getObjectByName('PlayerCam')
                break;
                case 'Space':
                    // sound.context.resume();
                    
                    // load a sound and set it as the Audio object's buffer
                    const audioLoader = new THREE.AudioLoader();
                    audioLoader.load( stream, function( buffer ) {
                        sound.setBuffer( buffer );
                        sound.setLoop( true );
                        sound.setVolume( 0.5 );
                        sound.play();
                        // sound.pause();
                    });

					player.callSpaceShip(ship)
                break;
                case 'Digit9':
                    changePOV();
                break;
                case 'Digit8':
                    console.log(sound.isPlaying)
                    if (sound.isPlaying) sound.pause();
                    else sound.play();
                break; 
            }
        })
    }

    function orbits(t){
//      Compute Stars Revolution and Universe Rotation.  
        scene.getObjectByName("Stars").rotateY(0.005);
        scene.getObjectByName("Universe").rotateX(-0.0005);
        // scene.getObjectByName("Planet Zigarov").rotateZ(0.0005);
    }

    function guiOptions(){
//      Set all the user control settings: Lights, Cam.   
        const gui = new GUI() 

//      Camera Controls:     
        const camFolder = gui.addFolder('PlayerCam');
        camFolder.add(camera, 'fov', 30, 90);
        camFolder.add(camera.position, 'y', 0, 10);
        camFolder.add(camera.position, 'z', -5, 5);
        camFolder.add(camera.rotation, 'x', -Math.PI, -Math.PI/2);

//      Lights Controls: 
        const lightsFolder = gui.addFolder("Lights");
        let lights = [
            // scene.getObjectByName("star1Light"),
            // scene.getObjectByName("star2Light"),
            scene.getObjectByName("lightEye")
            // scene.getObjectByName("shipLight")
        ];  
        nodes.forEach(node => {
            if (node.includes("Light")) lights.push(scene.getObjectByName(node))
        })
        lights.forEach(light => {
            const lightFolder = lightsFolder.addFolder(light.name);
            lightFolder.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
            lightFolder.add(light, 'intensity', 0, 1000);
            lightFolder.add(light, 'distance', 0, 1000);
            lightFolder.add(light, 'decay', 0, 2);
            if (light.type == 'SpotLight') {
                lightFolder.add(light, 'angle', 0, 1.57);
                lightFolder.add(light, 'penumbra', 0, 1);

                const targetFolder = lightFolder.addFolder("Target");
                const lightTarget = light.getObjectByName("lightTarget");
                targetFolder.add(lightTarget.position, 'x', -5,5);
                targetFolder.add(lightTarget.position, 'y', -5,5);
                targetFolder.add(lightTarget.position, 'z', -5,5);
            }
        });

//      Planet System Controls:
        const planetSystemFolder = gui.addFolder('PlanetSystem');
        planetSystemFolder.add(player, 'gravity').onChange((value) => {console.log('gravity: ',value);});   
        planetSystemFolder.open()
    }

    function resize() {
        var factor = 0.9; // percentage of the screen
        var w = window.innerWidth * factor;
        var h = window.innerHeight * factor;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    };

    function getChildrenNames(obj) {
        nodes.push(obj.name)
        if (Array.isArray(obj.children) && obj.children.length){
            for(let child of obj.children){
                getChildrenNames(child)
            }
        }
    }

    function changePOV() { 
        const arrows = camera.getObjectByName("Arrows")
		if (!player.pov){
            camera.fov = 80
            arrows.scale.set(2, 2, 2)
            arrows.position.x +=0.1
			camera.position.set(0,0.5,0.2)
            console.log(player.pov)
            player.pov = true;

		} else {
            arrows.scale.set(1,1,1)
            arrows.position.x -=0.1
            if(player.active) {
                camera.position.set(0, 2, -2);
                camera.rotation.x = -2.618
            }
            else {
                camera.position.set(0, 0.56, -5)
                // camera.fov = 80;
                camera.rotation.x = -Math.PI;    
            }
            camera.fov = 50;
            player.pov = false;
		}       
	}
}

class ColorGUIHelper {
    constructor(object, prop) {
        this.object = object;
        this.prop = prop;
    }
    get value() {
        return `#${this.object[this.prop].getHexString()}`;
    }
    set value(hexString) {
        this.object[this.prop].set(hexString);
    }
}
