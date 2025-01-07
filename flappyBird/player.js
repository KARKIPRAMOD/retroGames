class Player{
    constructor(game){
        this.game = game;
        this.x = 50;
        this.y ;
        this.spriteWidth = 200;
        this.spriteHeight = 200;
        this.speedY = 0;
        this.width = 200;
        this.height = 200;
    }
    draw(){
        this.game.context.fillRect(this.x, this.y, this.width, this.height);
    }

    update(){
        this.y += this.speedY;
        if (this.y < this.game.height - this.height){
            this.y += this.game.gravity;
        }
    }

    rezize(){
        this.width = this.spriteWidth * this.game.ratio;
        this.height = this.spriteHeight * this.game.ratio;
        this.y = this.game.height *0.5 - this.height;

    }
}