const config = {
    type: Phaser.CANVAS,
    width: 800,
    height: 600,
    parent: 'phaser-container',
    scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.NO_CENTER
    },
    backgroundColor: '#fff',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            fixedStep: false,
            debug: false
        }
    },
    render: {
        pixelArt: true,
        roundPixels: true
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let mouseX;
let mouseY;

let player;
let playerSprite;
let cursors;
let platforms;
let cameraDolly;

let wasAirborne = false;
let walkCycleTime = 0;
let targetAngle = 0;

function preload() {
    this.load.image('ground', 'portfolio_website_ground.png');
    this.load.image('player', 'portfolio_website_player.png');
}

function create() {
    //this.add.text(10, 10, 'Hello, Phaser!', { fill: '#000' });

    platforms = this.physics.add.staticGroup();
    addGround(platforms, 100, 500);
    addGround(platforms, 500, 300);
    addGround(platforms, 900, 500);
    addGround(platforms, 1300, 300);

    player = this.physics.add.sprite(100, 200, 'player');
    player.setCollideWorldBounds(true);
    player.setVisible(false); // This is our physics body basically, so don't want to see it
    player.setOrigin(0.5, 1);
    player.body.setSize(player.width, player.height);

    playerSprite = this.add.sprite(player.x, player.y, 'player');
    playerSprite.setOrigin(0.5, 1);

    this.physics.add.collider(player, platforms);

    // Arrow Keys
    cursors = this.input.keyboard.createCursorKeys();

    // WASD Keys
    const wasd = this.input.keyboard.addKeys({
        left: Phaser.Input.Keyboard.KeyCodes.A,
        up: Phaser.Input.Keyboard.KeyCodes.W,
        right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // Store both
    cursors.leftKeys = [cursors.left, wasd.left];
    cursors.rightKeys = [cursors.right, wasd.right];
    cursors.upKeys = [cursors.up, wasd.up];

    cameraDolly = new Phaser.Math.Vector2(player.x, player.y);

    this.cameras.main.startFollow(cameraDolly, true, 1, 1);
    this.cameras.main.setFollowOffset(0, 150);
    this.cameras.main.setBounds(0, -1000, 3200, 1600);
    this.physics.world.setBounds(0, -1000, 3200, 1600);

    this.cameras.main.setRoundPixels(false);
}

function addGround(platformGroup, x, y) {
    let ground = platformGroup.create(x, y, 'ground');

    // All below code is doing is creating an offset from the top the of ground so the player sits nicely in the middle of the platform
    let scaleXFactor = 2;
    let scaleYFactor = 2;

    ground.setDisplaySize(ground.width * scaleXFactor, ground.height * scaleYFactor);
    ground.refreshBody();

    let shrinkAmount = 6 * 4 * 2; //in pixels * 2, because the sprite itself was exported as 4x scale so need total of 4x to get 1 px

    ground.body.setSize(ground.displayWidth, ground.displayHeight - shrinkAmount);
    ground.body.y += shrinkAmount/2;
}

function update(time, delta) {
    // update mouseX & mouseY variables
    mouseX = this.input.mousePointer.x;
    mouseY = this.input.mousePointer.y;

    //this.add.circle(mouseX, mouseY, 20, 0xff0000);

    if (cursors.leftKeys.some(key => key.isDown)) {
        player.setVelocityX(-200);
        playerSprite.setFlipX(true);
    } else if (cursors.rightKeys.some(key => key.isDown)) {
        player.setVelocityX(200);
        playerSprite.setFlipX(false);
    } else {
        player.setVelocityX(0);
    }

    const isGrounded = player.body.touching.down || player.body.blocked.down;
    const isMovingHorizontally = Math.abs(player.body.velocity.x) > 0;

    if (cursors.upKeys.some(key => key.isDown) && isGrounded) {
        player.setVelocityY(-600);

        // jump Juice scaling
        playerSprite.scaleX = 0.7;
        playerSprite.scaleY = 1.4;
    }

    // landing Juice scaling
    if (isGrounded && wasAirborne) {
        playerSprite.scaleX = 1;
        playerSprite.scaleY = 0.7;
    }
    wasAirborne = !isGrounded;

    // walk cycle vars
    let targetScaleX = 1;
    let targetScaleY = 1;
    targetAngle = 0;

    if (isGrounded && isMovingHorizontally) {
        walkCycleTime += delta * 0.015;

        const rawWave = Math.sin(walkCycleTime);
        const wobbleWave = rawWave * 0.1;

        // walk cycle scaling
        targetScaleX = 1 + wobbleWave;
        targetScaleY = 1 - wobbleWave;

        // walk cycle rotation
        //const direction = player.body.velocity.x > 0 ? 1 : -1;
        targetAngle = rawWave * 4; //* direction;
    } else {
        walkCycleTime = 0;
    }

    // jump rotation
    if (!isGrounded) {
        let directionMultiplier = 1;
        if (player.body.velocity.x < 0) {
            directionMultiplier = -1;
        } else if (player.body.velocity.x === 0) {
            directionMultiplier = playerSprite.flipX ? -1 : 1;
        }

        if (player.body.velocity.y > 0) {
            // player is falling
            targetAngle = player.body.velocity.y * 0.03 * directionMultiplier;
        } else if (player.body.velocity.y < 0) {
            // moving up
            targetAngle = player.body.velocity.y * 0.03 * directionMultiplier;
        }
    }

    // return player to original scale after a juice scale
    let scaleRecovery = 0.15 * (delta / 16.666);
    let blendRate = Phaser.Math.Clamp(scaleRecovery, 0, 1);

    playerSprite.scaleX = Phaser.Math.Linear(playerSprite.scaleX, targetScaleX, blendRate);
    playerSprite.scaleY = Phaser.Math.Linear(playerSprite.scaleY, targetScaleY, blendRate);
    playerSprite.angle = Phaser.Math.Linear(playerSprite.angle, targetAngle, blendRate);

    playerSprite.x = player.x;
    playerSprite.y = player.y;

    // Camera stuff
    let lerpFactor = 0.08 * (delta / 16.666);

    lerpFactor = Phaser.Math.Clamp(lerpFactor, 0, 1);

    cameraDolly.x = Phaser.Math.Linear(cameraDolly.x, player.x, lerpFactor);
    cameraDolly.y = Phaser.Math.Linear(cameraDolly.y, player.y, lerpFactor);
}