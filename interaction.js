const config = {
    type: Phaser.AUTO, // auto selects WebGL or Canvas
    width: 800,
    height: 600,
    parent: 'phaser-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    backgroundColor: '#fff',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {

}

function create() {
    this.add.text(10, 10, 'Hello, Phaser!', { fill: '#000' });
}

function update() {
    //console.log('Game updated');
    
}