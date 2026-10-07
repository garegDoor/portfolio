const config = {
    type: Phaser.AUTO, // auto selects WebGL or Canvas
    width: 800,
    height: 600,
    parent: 'phaser-container',
    scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH
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
let cursors;
let platforms;
let cameraDolly;

function preload() {
    this.load.image('ground', 'portfolio_website_ground.png');
    this.load.image('player', 'portfolio_website_player.png');
}

function create() {
    //this.add.text(10, 10, 'Hello, Phaser!', { fill: '#000' });

    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    player = this.physics.add.sprite(100, 450, 'player');
    player.setCollideWorldBounds(true);

    this.physics.add.collider(player, platforms);

    cursors = this.input.keyboard.createCursorKeys();

    cameraDolly = new Phaser.Math.Vector2(player.x, player.y);

    this.cameras.main.startFollow(cameraDolly, true, 1, 1);
    this.cameras.main.setBounds(0, 0, 1600, 600);
    this.physics.world.setBounds(0, 0, 1600, 600);

    this.cameras.main.setRoundPixels(false);

}

function update(time, delta) {
    // update mouseX & mouseY variables
    mouseX = this.input.mousePointer.x;
    mouseY = this.input.mousePointer.y;

    //this.add.circle(mouseX, mouseY, 20, 0xff0000);

    if (cursors.left.isDown) {
        player.setVelocityX(-200);
    } else if (cursors.right.isDown) {
        player.setVelocityX(200);
    } else {
        player.setVelocityX(0);
    }

    if (cursors.up.isDown && (player.body.touching.down || player.body.blocked.down)) {
        player.setVelocityY(-600);
    }

    // Camera stuff
    let lerpFactor = 0.08 * (delta / 16.666);

    lerpFactor = Phaser.Math.Clamp(lerpFactor, 0, 1);

    cameraDolly.x = Phaser.Math.Linear(cameraDolly.x, player.x, lerpFactor);
    cameraDolly.y = Phaser.Math.Linear(cameraDolly.y, player.y, lerpFactor);
}