title = "CHARGE RUSH";

description = `
`;

characters = [
`
  ll
  ll
ccllcc
ccllcc
ccllcc 
cc  cc
`,`
rr  rr
rrrrrr
rrpprr
rrrrrr
  rr
  rr
`,`
y  y
yyyyyy
 y  y
yyyyyy
 y  y
`
];

const G = {
	WIDTH: 100,
	HEIGHT: 150,
	STAR_SPEED_MIN: 0.5,
	STAR_SPEED_MAX: 1.0,

    PLAYER_FIRE_RATE: 10,
    PLAYER_GUN_OFFSET: 3,
	PLAYER_RELOAD_SPEED: 20,
	PLAYER_MAG_SIZE: 10,

    FBULLET_SPEED: 5,

	ENEMY_MIN_BASE_SPEED: 1.0,
    ENEMY_MAX_BASE_SPEED: 2.0,
	ENEMY_FIRE_RATE: 45,

    EBULLET_SPEED: 1.0,
    EBULLET_ROTATION_SPD: 0.1
};

options = {
	viewSize: {x: G.WIDTH, y: G.HEIGHT},
	seed: 2,
	isPlayingBgm: true,
    theme: "shapeDark"
}

/**
* @typedef {{
* pos: Vector,
* speed: number
* }} Star
*/

/**
* @type  { Star [] }
*/
let stars;

/**
 * @typedef {{
 * pos: Vector,
 * firingCooldown: number,
 * isFiringLeft: boolean,
 * currentBullets: number,
 * reloadSpeed: number,
 * }} Player
 */

/**
 * @type { Player }
 */
let player;

/**
 * @typedef {{
 * pos: Vector
 * }} FBullet
 */

/**
 * @type { FBullet [] }
 */
let fBullets;

/**
 * @typedef {{
 * pos: Vector,
 * firingCooldown: number,
 * drift: number
 * }} Enemy
 */

/**
 * @type { Enemy [] }
 */
let enemies;

/**
 * @typedef {{
 * pos: Vector,
 * angle: number,
 * rotation: number
 * }} EBullet
 */

/**
 * @type { EBullet [] }
 */
let eBullets;

/**
 * @type { number }
 */
let currentEnemySpeed;

/**
 * @type { number }
 */
let waveCount;


function update() {
	if (!ticks) {
		stars = times(20, () => {
        	// Random number generator function
        	// rnd( min, max )
            const posX = rnd(0, G.WIDTH);
            const posY = rnd(0, G.HEIGHT);
            // An object of type Star with appropriate properties
            return {
	            // Creates a Vector
                pos: vec(posX, posY),
				          // More RNG
            speed: rnd(0.5, 1.0)
			};
		});

		player = {
			pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
			firingCooldown: G.PLAYER_FIRE_RATE,
            isFiringLeft: true,
			currentBullets: 10,
			reloadSpeed: G.PLAYER_RELOAD_SPEED,
		};

		// Initalise the values:
        fBullets = [];
        eBullets = [];
		enemies = [];
		waveCount = 0;
		currentEnemySpeed = 0;

        waveCount = 0;
	}

    // Update for Star
    stars.forEach((s) => {
        // Move the star downwards
        s.pos.y += s.speed;
        // Bring the star back to top once it's past the bottom of the screen
        s.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);

        // Choose a color to draw
        color("light_black");
        // Draw the star as a square of size 1
        box(s.pos, 1);
    });

	// Updating and drawing the player
	player.pos = vec(input.pos.x, input.pos.y);
	player.pos.clamp(0, G.WIDTH, 0, G.HEIGHT);
	// Cooling down for the next shot
    player.firingCooldown--;
	// increasing mag count
	if(!input.isPressed && player.firingCooldown <= 0) {
		player.reloadSpeed--;
	}
	if (player.reloadSpeed <= 0 && player.currentBullets < 10) {
		player.currentBullets++;
		player.reloadSpeed = G.PLAYER_RELOAD_SPEED;
		color("yellow");
		particle(
        	3, // x coordinate
            10, // y coordinate
            10, // The number of particles
            1, // The speed of the particles
            -PI/2, // The emitting angle
            2*PI  // The emitting width
        );
	}

    // Time to fire the next shot
    if (player.firingCooldown <= 0 && player.currentBullets > 0 && input.isPressed) {
        // Get the side from which the bullet is fired
        const offset = (player.isFiringLeft)
            ? -G.PLAYER_GUN_OFFSET
            : G.PLAYER_GUN_OFFSET;
        // Create the bullet
        fBullets.push({
            pos: vec(player.pos.x + offset, player.pos.y)
        });
		play("laser")
        // Reset the firing cooldown
        player.firingCooldown = G.PLAYER_FIRE_RATE;
        // Switch the side of the firing gun by flipping the boolean value
        player.isFiringLeft = !player.isFiringLeft;
		// subract bullet from mag
		player.currentBullets--;


        color("yellow");
        // Generate particles
        particle(
            player.pos.x + offset, // x coordinate
            player.pos.y, // y coordinate
            4, // The number of particles
            1, // The speed of the particles
            -PI/2, // The emitting angle
            PI/4  // The emitting width
        );
    }
	color("black");
	char("a", player.pos); //box(player.pos, 4);
	color("red");
	particle(
		player.pos.x + G.PLAYER_GUN_OFFSET *2/3, // x coordinate
		player.pos.y + 2, // y coordinate
		1, // The number of particles
		0.5, // The speed of the particles
		PI/2, // The emitting angle
		PI/4  // The emitting width
	);
	particle(
		player.pos.x - G.PLAYER_GUN_OFFSET *2/3, // x coordinate
		player.pos.y + 2, // y coordinate
		1, // The number of particles
		0.5, // The speed of the particles
		PI/2, // The emitting angle
		PI/4  // The emitting width
	);


	// Updating and drawing bullets
    fBullets.forEach((fb) => {
        // Move the bullets upwards
        fb.pos.y -= G.FBULLET_SPEED;
        
        // Drawing
        color("yellow");
        box(fb.pos, 2);
    });
	color("red");
	text(player.currentBullets.toString(), 3, 10);


	if (enemies.length === 0) {
        currentEnemySpeed =
            rnd(G.ENEMY_MIN_BASE_SPEED, G.ENEMY_MAX_BASE_SPEED) * difficulty;
        for (let i = 0; i < 9; i++) {
            const posX = rnd(0, G.WIDTH);
            const posY = -rnd(i * G.HEIGHT * 0.1);
			const Xdrift = rnd(-0.3, 0.3);
            enemies.push({ pos: vec(posX, posY), firingCooldown: G.ENEMY_FIRE_RATE, drift: Xdrift })
        }
        waveCount++;
    }

	remove(enemies, (e) => {
        e.pos.y += currentEnemySpeed;
        e.pos.x += e.drift;
        e.firingCooldown--;
        if (e.firingCooldown <= 0) {
            eBullets.push({
                pos: vec(e.pos.x, e.pos.y),
                angle: e.pos.angleTo(player.pos),
                rotation: rnd()
            });
            e.firingCooldown = G.ENEMY_FIRE_RATE;
            play("select"); // Be creative, you don't always have to follow the label
        }

        color("black");
        const isCollidingWithFBullets = char("b", e.pos).isColliding.rect.yellow;
        if (isCollidingWithFBullets) {
            color("yellow");
            particle(e.pos);
            play("explosion");
            addScore(10 * waveCount, e.pos);
        }

        const isCollidingWithPlayer = char("b", e.pos).isColliding.char.a;
        if (isCollidingWithPlayer) {
            end();
            play("powerUp");
        }

        return (isCollidingWithFBullets || e.pos.y > G.HEIGHT);
    });
	

	remove(fBullets, (fb) => {
		color("yellow");
        const isCollidingWithEnemies = box(fb.pos, 2).isColliding.char.b;
        return (isCollidingWithEnemies || fb.pos.y < 0);
    });

    remove(eBullets, (eb) => {
        // Old-fashioned trigonometry to find out the velocity on each axis
        eb.pos.x += G.EBULLET_SPEED * Math.cos(eb.angle);
        eb.pos.y += G.EBULLET_SPEED * Math.sin(eb.angle);
        // The bullet also rotates around itself
        eb.rotation += G.EBULLET_ROTATION_SPD;

        color("red");
        const isCollidingWithPlayer
            = char("c", eb.pos, {rotation: eb.rotation}).isColliding.char.a;

        if (isCollidingWithPlayer) {
            // End the game
            end();
            // Sarcasm; also, unintedned audio that sounds good in actual gameplay
            play("powerUp"); 
        }
        
        // If eBullet is not onscreen, remove it
        return (!eb.pos.isInRect(0, 0, G.WIDTH, G.HEIGHT));
    });
}
