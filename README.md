# [IG] Final Project
> Pignata Giovanni 1913547
> https://sapienzainteractivegraphicscourse.github.io/final-project-pignata/

## The Environment

 The main graphic library used to develop the project is *THREE.js*, a **Javascript 3D Library**, because it offers advanced functions and tools to manage the rendering of the graphic scene.

 For the animations, I used the *TWEEN.js* library, a JavaScript tweening engine for easy animations, incorporating optimised Robert Penner's equations. In particular, I wrote the `Animation`Class that uses groups of tweens to compute smooth animations for the hierarchical models. 

 In addition, I imported *dat.GUI*, a lightweight graphical user interface for changing variables in JavaScript. I used to allow the user to control some settings in the scenario.

## The Scene
 The scene consists of a planet and two stars (light sources) that orbit around it. On the planet's surface, there are an astronaut (humanoid) and a spaceship, two animated hierarchical models. I entirely modeled the scene with the help of the official [3D editor](https://threejs.org/editor/), saved in the `scene.json` file, and imported it into the project during the initialization. 

 When the web page is loaded, the user sees the scene through the `PlayerCam`, a camera that is initially fixed behind the back of the astronaut model, put on the north pole of the planet (assuming (0,1,0) as the North direction). In addition, **the user can control the animated movement** (Walk, TurnRight, TurnLeft, Jump) of this character on the surface of the planet. I implemented two versions of each animation, in order to simulate two different levels of gravity on the planet, that the user can control in the top-right menu. Without gravity, the astronaut's movements are slowed down in time and dilatated in space, as if it was walking on a zero-gravity planet, like the moon.

 The spaceship is parked near the initial location and the user has the possibility to recall it and start the **boarding animation** of the astronaut. All of this with * Thinking Of a Place * of The War On Drugs playing as the soundtrack!

All the models can be found in the [myModels](https://github.com/SapienzaInteractiveGraphicsCourse/final-project-pignata/myModels/) directory.

### The Planet, the two stars, and the Universe

![scene](https://github.com/SapienzaInteractiveGraphicsCourse/final-project-pignata/blob/main/myModels/scene.png)

 All these four elements are spheres. The universe is rendered on the back side and it has an appropriate color texture, it contains the entire scene. Both the stars have the same emissive map, but different colors. On the planet, three different maps are applied: a color map, a displace map to cause an effect where the actual geometric position of points over the textured surface is displaced, giving a great sense of depth and detail,  and a normal map is used to add even more details (better shading) without using more polygons. On the planet's surface, some trees are located at random to give a reference point of the north pole.

### The Astronaut

![astronaut](https://github.com/SapienzaInteractiveGraphicsCourse/final-project-pignata/blob/main/myModels/Astronaut/images/astronaut.png)

 The first two images show the astronaut model, composed of 29 nodes, the camera `PlayerCam` and the spotlight `lightEye`, located in the Head. In particular, the *wired* nodes are the joints that are rotated during the animations. As it is possible to see, there are two types of nodes, cylindrical and spherical. Joints of the first type can rotate only in one direction, the others in all three directions. A texture is applied to the body parts of the model in order to appear as a metallic material.

### The Space-Ship
## <img src="https://github.com/SapienzaInteractiveGraphicsCourse/final-project-pignata/blob/main/myModels/SpaceShip/images/spaceship.png" alt="spaceship" style="zoom:150%;" />

The ship model is composed of 16 nodes, a camera and two lights, the `shipLight` , a *pointlight* located one unit up respect the camera (which position is set to (0,1.5,5) wrt the spaceship object space), and the `spotlight` located 0.5 units down wrt the ship center. A second "metallic" texture is applied on the ring, to give impression of a metallic surface.



### The Mini Map

 On the bottom-right of the canvas, it is possible to see a map of the planet (sphere), the three axes (x,y,z), and a yellow arrow that represents the player's position and its forward direction.



## The Scripts

All the source code is divided in 5 files: `FinalProject.js`, `Player.js`, `Astronaut.js`,  `SpaceShip.js` and `Data.js`, which contains most of the configuration data.

### FinalProject.js
 The main script is `FinalProject.js`. In this file the scene is loaded and initialized through the `init()` function. In this, the `THREE.WebGLRenderer` is linked to the gl-canvas, the camera is set to the `PlayerCam`, and all the general settings are initialized before calling the `render()` function which takes care of the dynamic rendering of the scene. 

### Player.js, Astronaut.js and SpaceShip.js
```javascript
/* We are in init()...*/

// 	Initialize the Astronaut as Animated Character and Active Player:
	const astronaut = scene.getObjectByName("Astronaut");
	const player = new Astronaut(astronaut);
	player.active = true;		// When true, keyboard controls enabled.

// 	Initialize the SpaceShip as Animated Character:
	const ship = new SpaceShip(scene.getObjectByName("SpaceShip"))
```
In this particular piece of code, the astronaut and the spaceship models are used as parameters for the initialization of two objects belonging to the `Astronaut` and` SpaceShip` classes, defined respectively in the *Astronaut.js* and the *SpaceShip.js* files. Both classes are extensions of the `Player` class defined in *Player.js*.

  In the `Player` class are defined all the variables and methods useful to manage **Animated and Controllable Characters**, i.e, loading animation parameters from *Data.js* and initializing them, and setting the interactions with the user. `Astronaut` and `SpaceShip` classes inherit these tools and extend them to define specific features for their particular type of characters. 

## The Animation System
In `Player.js` in addition to the `Player` class is defined the `Animation` class that it is used to compute the animations by managing groups of tweens. 

 In `Data.js` are specified all the parameters for each animation in the `Data` dictionary, having the following structure: 
 - `Data`  {}
	 - "*Character Name*": {}
		 - `animations`: {}
			 - "*Animation Name*": {}
				 - `joints`: []
				 - `attributes`: []
				 - `frames` : []
					 - 	`keyframe`: {}
						 - `parameter`: *Final Value or Delta Value* 
				 - `periods`: []
				 - `delay`: []
				 - `reapeat`: *Boolean*
				 - `reset`: *Boolean* 

 For each character, there is a nested dictionary called `animations`, for which the keys are the animations name and the values are other dictionaries. In these, for each animation is specified a `joints` name list; a **joint** is a *THREE.js Object/Group* to animate. Each joint is associated with an **attribute**  (`rotation` or `position`) to update during the animation by the tweening engine. For each joint attribute, there is a list o `frames`. A **keyframe** is a dictionary having as keys the parameters (`x`,`y`,`z`) to update and as values the final value or the increment that the tweening engine uses to update the parameters starting from the initial value, considered as the one when the animations are started. In `periods` are stored the **tweens durations** expressed in milliseconds, in `delay` the **delay** to apply from a keyframe to the other, and `repeat`and `reset`are two boolean values used to manage **repetition** and **reset**, i.e. the concatenation of the *Reset Animation* that bring the character to the default pose. **All these data are loaded in the `Player` constructor**. 

When an animation is started (`Animation.start()`, a group of **chained tweens** is initialized with the function `Animation.setTweens(clip)`

 In the `render()` function defined in `FinalProject.js`, for each player is called the method  `Player.update()`. In this function, for each animation is called the `Animation.update()` method which in turn calls `TWEEN.Group.update()` that apply the update to the current value of all the joints attributes. 

 Other methods like `stop()`, `onStart()`, `onComplete()` and `reverse()` are defined in order to better integrate the animation system in the project with additional features like **animations concatenations**, ** repetition**, **reset** and **interactions** with the scene.

### Animations Lists
In the project are implemented a total 14 animations. 10 for the astronaut, 3 for the spaceship and  1 for the camera. All the animations used are defined in the following list:
- **Astronaut**: 
	1. `Reset`: Bring back the model to default Pose.
	2. `Walk`: Repeated Walking Animation of 8 poses, gravity disabled.
	3. `Run`: Repeated Walking Animation of 8 poses, gravity enabled.
	4. `Jump`: Single Jump Animation of 4 poses, gravity disabled.
	5. `nJump`: Single Jump Animation of 5 poses, gravity enabled.
	6. `TurnRight`: This Animation rotate the ankles and core of the astronaut to the right.
	7. `TurnLeft`: Same but in the opposite direction.
	8. `TurnBack`: Rotate of 180 degrees the Astronaut model (face to `PlayerCam`).
	9. `MoveTo`: Translate the astronaut in the desired position on the planet's surface.
	10. `CamTransistion`: Move and incline the camera in the desired position. 
	11. `Crouch`: Bring the model to a Crouched pose to sit in the spaceship.
- **SpaceShip**:
	1.	`Boarding`: Lifts the spaceship off the ground and retracts the support legs.
	2.	`MoveTo`: Translate the spaceship in the desired position in the planet's atmosphere.
	3.	`Doors`: Open or close the back doors of the ship.

## User Interactions

The user can interact with the scene in three different way: using the keyboard, the mouse wheel and the top-right menu.

### Character Controls

- **Astronaut**:

  - `W`: Until pressed down, it move forward the character on the planet's surface, starting the respective animation. When released, it stops the movement and the character return to the static pose. 
  - `A`: When pressed down, the character rotates to the left around the axis that originates in the center of mass of the planet and passes through the center of mass of the character. A simple animation that rotate the upTronco and the ankles starts. When released, the model return to the static pose (Reset Animation).
  - `D`: Same as `A` but right direction of rotation.
  - `S`: The character rotates of 180 degrees around the vertical axis. 
  - `J`: When pressed, it starts the jumping animation. It works even if the character is moving during the animation. When the animations end, if the character is not moving, it returns to the static pose, otherwise the walking animation starts.
  - `G`: When pressed, change the gravity.
  - `R`: Starts the Reset animation which bring the character in the static pose.
  - `9`: Change the camera point of view from third person to first person and vice versa.
  - `Space`: It starts the astronaut side of the boarding animations chain. After this moment the astronaut is not more an active character, i.e, the interactions are disabled.

- **Space Ship**:

  - `Shif Right`: Turn on/off the space ship's engine.

  - `Arrow Up` or `Wheel up`: Increase the ship's velocity.

  - `Arrow Down` or `Wheel down`: Decrease the ship's velocity.

  - `W`: Pitching down the ship. (Rotation around the X axis)

  - `S`: Pitching up the ship. (Rotation around the X axis)

  - `A`: Yaw to the left the ship. (Rotation around the Y axis)

  - `D`: Yaw to the right the ship. (Rotation around the Y axis)

  - `Space`: It starts the ship side of the boarding animations chain. After this moment, the space ship is the active character, i.e, the other interactions are enabled. It also starts the soundtrack.

  - `C` Switch between the astronaut and spaceship camera

    

- **GUI**: The Top-Right Menu

  - **PlayerCam**: camera settings
    - fov: field of view.
    - y: height position wrt the character.
    - z: distance wrt the character.
    - x:  horizontal position  wrt the character.
  - **Lights**: settings for each light:
    - Intensity
    - distance
    - decay
    - angle
    - penumbra
    - **Target**: define the spotlight direction.
      - x,y,z direction wrt to the spotlight position.

  - **Planet System**: Scene settings
    - gravity: enable/disable the gravity on the planet's surface. 

## Further Development

 For lack of time and experience, I did not have the chance to implement the following features:

- Landing Animation
- Physics: Collisions, bouncing... 
- Animations sounds
- Procedural Asteroids to avoid when driving the space ship.
