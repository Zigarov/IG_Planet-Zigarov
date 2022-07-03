import * as THREE from './sources/three/build/three.module.js';
import {Data} from "./Data.js"

export class Player {
    static players = [];
    // active = false;
    animations = {};
    active = false;             // Enable Player Interactions.
    pov = false;                // Enable first person prospective
    collision = false;

// //  Position Parameters:
constructor(obj){
        this.name = obj.name;
        this.model = obj;
        this.root  = obj.getObjectByName('root')
        this.nodes = [];
        getChildrenNames(obj, this.nodes);
        this.fw = new THREE.Vector3(0,0,1);  // Forward Direction
        this.up = new THREE.Vector3(0,1,0);   // Up Direction
        this.w = new THREE.Vector3(1,0,0);   // Tangent Direction
        this.cam = obj.getObjectByName('PlayerCam');
        this.rayCaster = new THREE.Raycaster(new THREE.Vector3(0,10.56,0),this.fw,0.2, 5);

        // setArrowHelpers(obj.getObjectByName('root'), this.fw, this.up, this.w)
        setArrowHelpers(this.cam, this.fw, this.up, this.w)
        this.updateAxis()

//      Load and Compute Animations:
        for (const [name, clip] of Object.entries(Data[this.name].animations)) {
            let joints = [];
            clip.joints.forEach((joint, i) => {
                joints.push(obj.getObjectByName(joint)[clip.attributes[i]])
            });
            this.animations[name] = new Animation(name, joints, clip.frames, clip.periods, clip.delay, clip.repeat, clip.reset);
            if (this.animations[name].reset) this.animations[name].concat = [this.animations.Reset]
        }
        
        Player.players.push(this)

        function getChildrenNames(obj, nodes) {
            nodes.push(obj.name)
            if (Array.isArray(obj.children) && obj.children.length){
                for(let child of obj.children){
                    getChildrenNames(child, nodes)
                }
            }
        }

        function setArrowHelpers(cam, fw , up, w){
//      Set the Arrow Helpers for directions...
            const zero = new THREE.Vector3( 0 , 0, 0);
            const origin = new THREE.Vector3( 0.3 , -0.15, -0.5)
            const length = 0.1;
            const dirX = new THREE.Vector3( -1, 0, 0 );
            const dirY = new THREE.Vector3( 0, 1, 0 );
            const dirZ = new THREE.Vector3( 0, 0, -1 );
            const fw_1 = fw.clone()
            fw_1.z *= -1            
            fw_1.x *= -1 
            const arrowHelpers = [
                new THREE.ArrowHelper(fw_1, zero, length*0.2, 0xFFFF00, length*0.2),
                new THREE.ArrowHelper( dirX, zero, length*0.6, 0xFF0000),
                new THREE.ArrowHelper( dirY, zero, length*0.6, 0x00FF00),
                new THREE.ArrowHelper( dirZ, zero, length*0.6, 0x0000FF),
            ];
            var geometry = new THREE.SphereGeometry(length*0.5, 10, 10);
            var material = new THREE.MeshBasicMaterial({
                color: 0xAAAAAA,
                wireframe: true
            });
            const globe = new THREE.Mesh(geometry, material);
            const arrows = new THREE.Group()
            arrows.name = 'Arrows'
            cam.add(arrows)
            arrows.position.copy(origin)
            arrows.add(globe);
            arrowHelpers.forEach((arrow) => {arrows.add(arrow);});
        }
            
    }

    update() {
//      Compute Animation Update:
        for (const [name, clip] of Object.entries(this.animations)) {
            if (clip.completed){
                // console.log(clip.name)
                //clip.setTweens();
                if(clip.reset){
                    // this.reset();
                }
            clip.completed = false;
            }
            if (clip.playing) clip.update()
        }
        this.updateAxis()
        this.checkCollision()
    }

    updateAxis() {
        this.root.getWorldDirection( this.fw ) // Returns a vector representing the direction of object's positive z-axis in world space.
        this.root.getWorldPosition(this.up)
        const p = this.up.clone()
        this.up.normalize()
        this.w.crossVectors(this.fw, this.up)
        this.rayCaster.set(p,this.fw);
        this.updateArrows(p,this.fw)
    }
    updateArrows(p, fw) {
        const arrows = this.root.getObjectByName("Arrows").children
        const fw_1 = fw.clone()
        fw_1.z *= -1            
        fw_1.x *= -1 
        arrows[1].setDirection(fw_1)

        const d = p.distanceTo(new THREE.Vector3(0,0,0))
        p.multiplyScalar(0.05/d)
        p.x *=-1
        p.z*=-1
        arrows[1].position.copy(p)

        if(d>15) {
            arrows[0].scale.set(10/d, 10/d, 10/d)
        }
    }

    reset(){
        this.animations.Reset.playing = false;
        this.animations.Reset.setTweens(this.animations.Reset);
        this.animations.Reset.start();
        //this.animations.Reset.playing = false;
    }

    alignToZenith() {
/* Function to Align the model respect the tangent to the planet surface.
        DEPRECATED 
*/ 
        let up = new THREE.Vector3()								// up = up direction in world space.
        this.model.getWorldPosition(up)
        up.normalize() 
        // const y = new THREE.Vector3(0,1,0);						// y = up direction in the object space
        const angle = this.y.angleTo(up)   							// Returns the angle between this vector and vector v in radians.
        if (angle > 0.1) {
            const w = new THREE.Vector3().crossVectors(this.y, up)	// w = ortogonal vector between 
            console.log(w)
            this.model.rotateOnAxis(w, angle)						// Rotate an object along an axis in object space. The axis is assumed to be normalized.
            this.y = up;
        }
    }

    getChildrenNames(obj) {
        this.nodes.push(obj.name)
        if (Array.isArray(obj.children) && obj.children.length){
            for(let child of obj.children){
                this.getChildrenNames(child)
            }
        }
    }

    checkCollision(){
        // if((typeof this.rayCaster !== 'undefined')&&(cast.distance <1)&&(!this.collision)){
        //     console.log("Collision Detected");
        //     this.collision = true;
        //     // this.gear = 4;
        //     // this.lights.children[1].intensity = this.engine;
        // }
        // else if((typeof cast !== 'undefined')&&(cast.distance >2)&&(this.collision)){
        //     this.collision = false;
        // }
    }
}

export class Animation{
    paused = false;
    completed = false;
    group = new TWEEN.Group();
    tweens = [];
    next = null;
    constructor(name, joints, frames, periods, delay, repeat, reset) {
        this.playing = false;
        this.name = name;
        this.repeat = repeat;
        this.joints = joints;
        this.frames = frames;
        this.periods = periods;
        this.delay = delay;
        this.reset = reset;
        //this.setTweens(this);
    }

    setTweens(clip){
        this.group.removeAll();
        let tweens = [];
        for (let i = 0; i<this.joints.length; i++){
            let firstTween, currentTween;
            for (let j = 0; j < this.frames[i].length; j++) {
                const tween = new TWEEN.Tween(this.joints[i],this.group).to(this.frames[i][j],this.periods[j]);
                if(this.delay != false && this.delay != undefined){
                    if (this.delay[j] != false && this.delay[j] != undefined){
                        tween.delay(this.delay[j]);
                    }
                }
                if (j==0) {
                    tween.onComplete(function(){
                        clip.completed = false;
                    })
                    firstTween = tween;
                }
                else currentTween.chain(tween);
                currentTween = tween;
            }
            if (this.repeat) {
                const tween = new TWEEN.Tween(this.joints[i],this.group).to(this.frames[i][0],this.periods[0])
                currentTween.chain(tween,firstTween)
                //currentTween.chain(firstTween);
            }
            else {
                const tween = new TWEEN.Tween(this.joints[i],this.group).to(this.frames[i][0],this.periods[0])
                currentTween.onComplete(function() {
                    clip.completed = true;
                })
                currentTween.chain(tween,firstTween)
            }
            //currentTween.chain(firstTween);
            tweens.push(firstTween);
        }

        this.tweens = tweens;
    }

    start() {
        this.onStart()
        if(!this.playing){
            console.log(this.name)
            this.setTweens(this);
            this.tweens.forEach((tween) => {
                tween.start();
            });
            this.playing = true;
        }
    }

    stop() {
        if(this.playing){
            this.playing = false;
            this.group.getAll().forEach((tween) => tween.stop());        
        }
    }

    update(){
        this.onUpdate();
        this.group.update();
        if ((this.completed)&&(!this.repeat)) {
            this.onComplete()
            if (this.next != null){
                this.next.forEach(animation => {animation.start()})
                this.next = null;
            } 
            this.stop();
        }
    }

    onComplete(){}
    onStart(){}
    loadParams(param) { this.params.push(param)}
    onUpdate(){}

    set concat(animations) {
//      Concatenate animation parameter to this. 
        this.next = animations;
    }

    get reverse(){
        const reversedFrames = []
        this.frames.forEach(frame => {
            reversedFrames.push(frame.reverse())
        })
        return new Animation(
            this.name + 'Reverse',
            this.joints,
            reversedFrames,
            this.periods,
            this.delay,
            this.repeat,
            this.reset
        )
    }
}