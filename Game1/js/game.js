let game;

let gameOptions = {

    // ground height, in pixels
    groundHeight: 40,

    // panda movement range, in pixels
    pandaMovement: [40, 160],

    // panda speed, in pixels per second
    pandaSpeed: 200,

    // pixels distance range between spikes
    spikeGap: [50, 140],

    // spike speed, in milliseconds to complete the tween
    spikeSpeed: [350, 700],

    // spike loop delay, in milliseconds
    spikeDelay: [300, 700],

    // height of the spike, in pixels
    spikeHeight: [20, 55]
}

window.onload = function() {
    let gameConfig = {
        type: Phaser.AUTO,
        backgroundColor:0x6cc9bf,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            parent: "thegame",
            width: 480,
            height: 320
        },
        physics: {
            default: "arcade",
            arcade: {
                debug: true
            }
        },
        scene: playGame
    }
    game = new Phaser.Game(gameConfig);
    window.focus();
}

class playGame extends Phaser.Scene{
    constructor(){
        super("PlayGame");
    }
    preload(){
        this.load.image("ground", "ground.png");
        this.load.image("panda", "panda.png");
        this.load.image("spike", "spike.png");
    }
    create(){

        // physics group which contains all spikes
        this.spikeGroup = this.physics.add.group();

        // first spike position is in the horizontal center of the canvas
        let spikeX = game.config.width / 2;

        // we place 10 spikes. 10 are more than enough to give the feeling of an endless runner
        for(let i = 0; i < 10; i++){

            // spike creation
            let spike = this.spikeGroup.create(spikeX, game.config.height - gameOptions.groundHeight, "spike");

            // spike registration point is center / bottom
            spike.setOrigin(0.5, 0);

            // immovable - won't move if something collides with it
            spike.setImmovable(true);

            // set the physics body size smaller than the spike itself, so the game will sometimes forgive the player
            spike.setSize(12, 40, true);

            // method to create a tween and attach it to the spike
            this.createTween(spike);

            // determine next spike position
            spikeX += Phaser.Math.Between(gameOptions.spikeGap[0], gameOptions.spikeGap[1]);
        }

        // add the panda to the game
        this.panda = this.physics.add.sprite(gameOptions.pandaMovement[0], game.config.height - gameOptions.groundHeight, "panda");
        this.panda.setOrigin(0.5, 1);
        this.panda.setSize(24, 30, true);

        // the panda can move only until it reaches pandaXLimit. Then the
        // whole game will move towards the panda
        this.panda.canMove = true;

        // isMoving tells if the panda or the whole game are moving. In other
        // words if the player wants to move the panda, no matter what is
        // actually being moved
        this.panda.isMoving = false;

        // add the ground to the game
        let ground = this.add.sprite(0, game.config.height - gameOptions.groundHeight,  "ground");
        ground.setOrigin(0, 0);

        // move the panda when an input is pressed
        this.input.on("pointerdown", this.movePanda, this);

        // stop the panda when an input is released
        this.input.on("pointerup", this.stopPanda, this);
    }

    createTween(object){
        this.tweens.add({

            // object affected by the tween
            targets: object,

            // y position to tween
            y: game.config.height - gameOptions.groundHeight - Phaser.Math.Between(gameOptions.spikeHeight[0], gameOptions.spikeHeight[1]),

            // tween duration
            duration: Phaser.Math.Between(gameOptions.spikeSpeed[0], gameOptions.spikeSpeed[1]),

            // play the tween forever
            repeat: -1,

            // playing the tween back and forth
            yoyo: true,

            // tween easing
            ease: "Quint.easeIn"
        })
    }

    movePanda(){

        // the idea is: if the panda can move, then move the panda, else
        // move all spikes towards the panda. Then set isMoving to true
        if(this.panda.canMove){
            this.panda.body.velocity.x = gameOptions.pandaSpeed;
        }
        else{
            this.spikeGroup.setVelocityX(-gameOptions.pandaSpeed);
        }
        this.panda.isMoving = true;
    }

    stopPanda(){

        // the idea is: stop the panda and all spikes, set isMoving to false
        this.panda.body.velocity.x = 0;
        this.spikeGroup.setVelocityX(0);
        this.panda.isMoving = false;
    }

    getRightmostSpike(){

        // getting rightmost spike
        let rightmostSpike = 0;
        this.spikeGroup.getChildren().forEach(function(spike){
            rightmostSpike = Math.max(rightmostSpike, spike.x);
        });
        return rightmostSpike;
    }

    update(){

        // this is how I make the panda stop when it reaches its maximum
        // horizontal position and start moving the environment instead
        if(this.panda.canMove && this.panda.x > gameOptions.pandaMovement[1]){
            this.panda.canMove = false;
            this.panda.body.velocity.x = 0;
            this.movePanda();
        }

        // recycle spikes when they leave the screen
        this.spikeGroup.getChildren().forEach(function(spike){
            if(spike.getBounds().right < 0){
                spike.x = this.getRightmostSpike() + Phaser.Math.Between(gameOptions.spikeGap[0], gameOptions.spikeGap[1]);
                spike.y = game.config.height - gameOptions.groundHeight;
                this.tweens.killTweensOf(spike);
                this.createTween(spike);
            }
        }, this);

        // restart the game if the panda hits the spikes
        this.physics.world.collide(this.panda, this.spikeGroup, function(){
            this.scene.start("PlayGame");
        }, null, this)
    }
}
