import * as THREE from './sources/three/build/three.module.js';
import {Player} from "./Player.js";


export class SpaceShip extends Player {
	constructor(model) {
		// model.rotation.set(Math.PI*0.1, 0, Math.PI*0.1)
		// model.getObjectByName('shipCam').name = 'PlayerCam'
		super(model)
		model.getObjectByName('Arrows').visible = this.active;
		this.engine = false
		this.land = true;
		this.inAtmosphere = true;
		this.model.getObjectByName('SpotLight').position.set(0,0.5,0)
		this.model.getObjectByName('lightTarget').position.set(0,-1,0)
		model.getObjectByName("SpotLight").target = model.getObjectByName('lightTarget');
		this.root.add(this.model.getObjectByName('shipLight'))
		this.model.getObjectByName('shipLight').position.set(0,2,0)
		// this.alignToZenith()

		this.animations.Boarding.onComplete = function() {
			model.getObjectByName('Legs').visible = !model.getObjectByName('Legs').visible		
		}

		this.engine = false;
		this.gear = 4,
		this.speed = [-0.2, -0.1, -0.05, -0.01, 0, 0.01, 0.05, 0.1, 0.2]
		this.yaw = 0;
		this.pitch = 0;

		//  	Input Configuration:
		window.addEventListener('keydown', (e) => {
			if (this.active) {
				switch(e.code) {
					case "ShiftRight": this.ssEngine();               // Shift
					break;
					case "ArrowUp": this.shiftUp();                // Up Arrow
					break;
					case "ArrowDown": this.shiftDown();              // Down
					break;
					case "KeyW":                              
						if (this.engine && this.pitch < 0.025) this.pitch = -0.025;
					break;
					case "KeyS":                                
						if (this.engine && this.pitch > -0.025) this.pitch = 0.025;
					break;
					case "KeyA":                                
						if (this.engine && this.yaw < 0.025) this.yaw = 0.025;
					break;
					case "KeyD":                                // D
						if (this.engine && this.yaw > -0.025) this.yaw = -0.025;
					break;
					case "ArrowLeft": 
						this.dodge(-90);
					break;
					// case "ArrowRight": this.dodge(90);
					// break;
					// case "KeyQ": this.land();
				}
			} 
		});

		window.addEventListener('keyup', (e) => {
			switch(e.code){
				case "KeyW": this.pitch = 0;
				break;
				case "KeyS": this.pitch = 0;
				break;
				case "KeyA":
						if(this.yaw > 0){
								//this.cam.rotateZ(0.2);
								this.yaw = 0;
						}
				break;
				case "KeyD":
						if(this.yaw < 0){
								//this.cam.rotateZ(-0.2);
								this.yaw = 0;
						}
				break;
			}
		});
		window.addEventListener('wheel', (e) => {
			if (e.deltaY < 0) this.shiftUp()
			else this.shiftDown()
		})
	}
	update() {
		if (this.engine) {
			if(this.engine) this.root.translateZ(this.speed[this.gear]) 
			// this.root.translateOnAxis(this.fw, this.speed[this.gear])
			// this.root.translateOnAxis(this.root.worldToLocal(this.fw), this.speed[this.gear])
			// if(this.yaw != 0) this.root.rotateOnAxis(new THREE.Vector3(0,1,0), this.yaw)
			// if(this.yaw != 0) this.root.rotateOnWorldAxis(this.up, this.yaw)
			if(this.yaw != 0) this.root.rotateY(this.yaw)
			// if(this.pitch != 0) this.root.rotateOnAxis(new THREE.Vector3(0,0,1), this.pitch)
			// if(this.pitch != 0) this.root.rotateOnWorldAxis(this.w, this.pitch)
			if(this.pitch != 0) this.root.rotateX(this.pitch)
		}
		super.update();
	}
	updateAxis() {
		const root =  this.model.getObjectByName('root')
		root.getWorldDirection( this.fw ) // Returns a vector representing the direction of object's positive z-axis in world space.
		root.getWorldPosition(this.up)
		let x = new THREE.Vector3()
		root.getObjectByName('shipLight').getWorldPosition(x)
		x.add(this.up.negate())
		this.up = x
		this.up.normalize()
		this.w.crossVectors(this.fw, this.up)

		const arrows = root.getObjectByName("Arrows").children
		const fw_1 = this.fw.clone()
		fw_1.z *= -1            
		fw_1.x *= -1 
		arrows[1].setDirection(this.fw)
		arrows[1].setDirection(fw_1)
}

	inAtmosphere(position) {
		const origin = new THREE.Vector3(0,0,0)
		if(position.distanceTo(origin) <=13) {
			return true
		}
		else return false
	}

	ssEngine() {
		this.engine = !this.engine;
		console.log("Engine: ",this.engine);
		this.gear = 4;
		// this.lights.children[1].intensity = this.engine;
	}

	shiftUp(){
		if (this.engine && this.gear < 8 && !this.landed) {
				this.gear +=1;
				// this.lights.children[1].intensity += (2)*Math.sign(this.speed[this.gear]);
			}
		}
		
		shiftDown(){
			if (this.engine && this.gear > 0 && !this.landed) {
				this.gear -=1;
				// this.lights.children[1].intensity -= 2*Math.sign(this.speed[this.gear]);
		}
	}

	moveTo(rotationFrame) {
		this.animations.MoveTo.frames[0] = [rotationFrame]
		this.animations.MoveTo.periods[0] = 1000
		this.animations.MoveTo.delay = false
		this.animations.MoveTo.concat = [this.animations.Doors]
		if (this.land) {
			this.animations.Boarding.concat = [this.animations.MoveTo]
			this.animations.Boarding.start()
			this.land = false
		}
		else {
			this.animations.MoveTo.start()
		}
		this.active = true
	}
}