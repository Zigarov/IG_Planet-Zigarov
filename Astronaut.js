import * as THREE from './sources/three/build/three.module.js';
import {Player} from "./Player.js"

export class Astronaut extends Player {
    dX = 0.0;                                       // Increment of X Angle Rotation        
    dY = 0.0;                                       // Increment of Y Angle Rotation
    gravity = true;    
	moving = false;
    turning = false;
    jumping = false;

	constructor(model) {
		super(model)

//		Set the lightTarget of the astronaut.    
        const lightTarget = new THREE.Object3D();
        lightTarget.name = 'lightTarget'
        this.model.getObjectByName("lightEye").add(lightTarget);
        lightTarget.position.set(0,-1,1);
        this.model.getObjectByName("lightEye").target = lightTarget;
		const animations = this.animations;

		this.animations.TurnBack.onStart = function(){
			// animations.Run.delay = [500]
			animations.Run.start()
		}

		this.animations.TurnBack.onComplete = function() {
			animations.Run.stop()
			// animations.Run.delay = false
			animations.Reset.start()
		}

		//      Input Configuration:
        window.addEventListener('keydown', (e) => {
            if(this.active) {
                let clipName;
                switch(e.code){
                    case "KeyW":
                        clipName = (!this.gravity) ? 'Walk': 'Run'
                        if (!this.moving){
                            this.dX = +0.005;
                            this.animations[clipName].repeat = true;
                            if(!this.jumping) this.animations[clipName].start();
                            this.moving = true;
                        }
                    break;
                    case "KeyA":
                        // if(this.animations.Reset.playing) this.animations.Reset.stop()
                        if(this.animations.TurnRight.playing) this.animations.TurnRight.stop()
                        if (this.dY <= 0.0){
                            this.dY = 0.03;
                            this.animations.TurnLeft.start();
                            this.turning = true
                        }
                        break;
                    case "KeyD":
                        // if(this.animations.Reset.playing) this.animations.Reset.stop()
                        if(this.animations.TurnLeft.playing) this.animations.TurnLeft.stop()
                        if (this.dY >= 0.0){
                            this.animations.TurnRight.start();
                            // this.animations.Run.start();
                            this.turning = true
                            this.dY = -0.03;
                        }
                        break;
                    case "KeyS":
                        const frames = this.animations.CamTransition.frames;
                        // this.animations.CamTransition.frames = [[{y: "+3.1415"}], [{y:"+0"}]]
                        // this.animations.CamTransition.onComplete = function() {
                        //     this.frames = frames
                        // }
                        // this.animations.TurnBack.concat = [this.animations.CamTransition]
                        this.animations.TurnBack.start();
                        // this.turning = true
                        // this.fw = this.dirX.applyAxisAngle(this.dirY, 3.1415)
                        break;
                    case "KeyJ":
                        clipName = (this.gravity) ? 'Jump' : 'nJump'
                        let walk;
                        const moving = this.moving;
                        if (moving) {
                            const walkClipName = (this.gravity) ? 'Run' : 'Walk'
                            walk = this.animations[walkClipName]
                            walk.stop()
                        }
                        this.animations[clipName].onComplete = function() {
                            const astronaut = Player.players[0]                  
                            if(astronaut.moving){
                                const walkClipName = (astronaut.gravity) ? 'Run' : 'Walk'
                                astronaut.animations[walkClipName].start()
                            } 
                            else astronaut.animations.Reset.start();
                            astronaut.jumping = false;
                        }
                        this.animations[clipName].start()
                        this.jumping = true
                        break;
                    case "KeyR":
                        this.animations.Reset.start();
                        break;
                    case 'KeyG':
                        this.gravity = !this.gravity;
                        console.log('Gravity: ', this.gravity)
                        break;
                }
            }
        });
        window.addEventListener('keyup', (e) => {
            if(this.active) {
                switch(e.code){
                    case "KeyW":
                        const clipNames = ['Walk', 'Run']
                        clipNames.forEach(clipName => {
                            if(!this.turning) {
                                this.animations[clipName].stop()
                                if(!this.jumping) this.animations.Reset.start();
                            }
                        })
                        this.moving = false;
                        this.dX = 0;
                        // if(this.dY >0) this.animations.TurnRight.start();
                    break;
                    case "KeyA":
                        if(this.animations.TurnLeft.playing) this.animations.TurnLeft.stop();
                        if(!this.animations.TurnRight.playing) this.animations.Reset.start();
                        this.turning = false;
                        this.dY = 0;
                        // this.animations.TurnRight.start()
                    break;
                    case "KeyD":
                        this.animations.TurnRight.stop();
                        if (!this.moving) this.animations.Run.stop();
                        if(!this.animations.TurnLeft.playing) this.animations.Reset.start();
                        this.turning = false;
                        this.dY = 0;

                        // this.animations.TurnLeft.start()
                        // this.reset()
                    break;
                    case "KeyS":
                        // this.dX = 0;
                        // this.animations.Walk.stop();
                        // this.animations.Reset.start()
                    break;                    
                }
            }
        });
    }
	
	update() {
//      Compute Momevent Update:
        if(this.dY!=0){
            this.model.rotateOnWorldAxis(this.up, this.dY)
            // this.fw = this.dirX.applyAxisAngle(this.dirY, this.dY)
            // this.updateAxis()
        }
        if(this.dX!=0){
            this.model.rotateOnWorldAxis(this.w, -this.dX) 
            // this.dirY = this.dirY.applyAxisAngle(this.dirX, this.dX)
        }
		super.update();
	}

	callSpaceShip(ship) {
        if(this.active) {
            console.log('Calling the SpaceShip...')
            const rotationFrame = {
                x: this.model.rotation.x,
                y: this.model.rotation.y,
                z: this.model.rotation.z,
            }
            ship.moveTo(rotationFrame)
            this.boarding(ship)
        }
	}

	boarding(ship) {
		this.animations.MoveTo.frames[1] = [{y: '+2'}]
		this.animations.MoveTo.delay = [1000]
		this.animations.Crouch.delay = [1000]
        this.animations.MoveTo.onComplete = function() {
            const astronaut = Player.players[0];
            const ship = Player.players[1];
            astronaut.root.position.set(0,0,0)
            astronaut.model.rotation.set(0,0,0)
            ship.root.add(astronaut.model)
            ship.active = true
            ship.engine = true
            const spotLight = ship.model.getObjectByName('SpotLight')
            spotLight.getObjectByName('lightTarget').position.set(0,0,1)
            spotLight.angle *=2
            spotLight.decay = 2
            spotLight.penumbra = .1
            spotLight.intensity = 30
        }
		this.animations.CamTransition.concat = [this.animations.MoveTo, this.animations.Crouch]
		// this.animations.TurnBack.start()
		this.animations.CamTransition.start()
        if (this.pov) this.pov = false;
        this.active = false
	}

    checkCollision() {
        // const collisions = this.rayCaster.intersectObjects(this.model.parent.children, true)
        // if (!this.collision && collisions.length > 0 && collisions[0].distance < 1.5){
        //     this.collision = true;
        //     this.dX = 0;
        //     console.log('Collision Imminent: ', collisions[0].distance)
        // }
        // else if (this.collision) {
        //     if(collisions.length == 0 || collisions[0].distance >= 1.5) {
        //         this.collision = false;
        //         if (this.moving){
        //             this.dX = +0.005;
        //         }
        //     }
        // }
    }

}