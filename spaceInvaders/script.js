class Player{
    constructor(game){
        this.game = game;  // player has reference to the game object
        this.width = 140;  
        this.height = 120;
        this.x = this.game.width * 0.5 - this.width *0.5;
        this.y = this.game.height - this.height;
        this.speed = 5;
        this.lives = 3;
        this.image = document.getElementById('player');
        this.jetsImage = document.getElementById('player_jets');
        this.frameX = 0;
        this.jetsFrame = 1;
    }
    draw(context){
        if(this.game.keys.indexOf('1') > -1){
            this.frameX = 1;
        }
        else{
            this.frameX = 0;
        }
        //context.fillRect(this.x, this.y, this.width, this.height); // player is drawn as rectangle  at  the given position
        context.drawImage(this.jetsImage, this.jetsFrame * this.width, 0, this.width, this.height, this.x, this.y,this.width, this.height ); 
        context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x, this.y,this.width, this.height ); 
    }
    update(){
        //horizontal movements
        if (this.game.keys.indexOf("ArrowLeft") > -1) {
            this.x -= this.speed;
            this.jetsFrame = 0;
        }
        else if (this.game.keys.indexOf("ArrowRight") > -1) {
            this.x += this.speed;
            this.jetsFrame = 2;         
        }else{
            this.jetsFrame = 1;
        }
        // horizontal boundaries
        if(this.x < - this.width* 0.5 ) this.x = 0;
        else if (this.x > this.game.width - this.width *0.5  ) this.x = this.game.width - this.width;
    }
    shoot(){
        const projectile = this.game.getProjectile();
        if(projectile) projectile.start(this.x+ this.width/2, this.y);
    }
    restart(){
        this.x = this.game.width * 0.5 - this.width *0.5;
        this.y = this.game.height - this.height;
        this.speed = 10;
        this.lives = 3;
    }
}

class Projectile{
    constructor(){
        this.width = 8;
        this.height= 20;
        this.x = 0;
        this.y = 0;
        this.speed = 20;
        this.free = true;
    }
    draw (context){
        if(!this.free){
            context.fillRect(this.x,this.y, this.width, this.height);
        }
    }
    update(){
        if(!this.free){
            this.y -= this.speed;
            if(this.y< 0 - this.height) this.reset();
        }
    }
    start(x,y){
        this.x= x - this.width *0.5;
        this.y = y;
        this.free = false;
    }
    reset(){
        this.free = true;
    }
}

class Enemy{
    constructor(game, positionX, positionY){
        this.game = game; 
        this.width= this.game.enemySize;
        this.height= this.game.enemySize;
        this.x =0 ;
        this.y= 0;
        this.positionX = positionX;
        this.positionY = positionY;
        this.markedForDeletion = false;

    }    
    draw(context){
        context.drawImage(this.image, this.frameX *this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
    }
    update(x, y){
        this.x = x + this.positionX;
        this.y = y + this.positionY;
        //check collision
        this.game.ProjectilePool.forEach(projectile =>{
           if(!projectile.free && this.game.checkCollision(this,projectile) && this.lives>0){
                this.hit(1);
                projectile.reset();
           }
        });

        if(this.lives < 1){
            if(this.game.spriteUpdate) this.frameX++;
            if(this.frameX > this.maxFrames){
                this.markedForDeletion= true;
                if(!this.game.gameOver) this.game.score += this.maxLives;
            }
        }

        //player enemy collision
        if(this.game.checkCollision(this, this.game.player)){
            this.markedForDeletion= true;
            if(!this.game.gameOver && this.game.score >0) this.game.score--;
            this.game.player.lives--; 
            if(this.game.player.lives < 1)  this.game.gameOver = true;
            
        }
        //lose game
        if(this.y + this.height > this.game.height){
            this.game.gameOver = true;
        }
       
    }
    hit(damage){
        this.lives -=damage;
    }
}

class Beetlemorph extends Enemy {
    constructor(game, positionX, positionY){
        super(game, positionX, positionY);
        this.image = document.getElementById('beetlemorph');
        this.frameX = 0;
        this.maxFrames = 2;
        this.frameY = Math.floor(Math.random()* 4   );
        this.lives = 1;
        this.maxLives = this.lives;
    }
}

class Wave{
    constructor(game){
        this.game = game;
        this.width = this.game.columns * this.game.enemySize;
        this.height= this.game.rows * this.game.enemySize;
        this.x= this.game.width * 0.5 - this.width * 0.5;
        this.y= - this.height;
        this.speedX = Math.random() <0.5 ? 1:-1;
        this.speedY = 0;
        this.enemies = [];
        this.nextWaveTrigger = false;
        this.create();
    }
    render(context){
        if(this.y < 0) this.y +=5;
        this.speedY = 0;
        if(this.x < 0 || this.x > this.game.width - this.width ){
            this.speedX *= -1;
            this.speedY = this.game.enemySize;
        }
        this.x += this.speedX;
        this.y += this.speedY;
        this.enemies.forEach(enemy => {
            enemy.update(this.x, this.y);
            enemy.draw(context);
        })
        console.log("Before filter:", this.enemies.length);

        this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
        console.log("After filter:", this.enemies.length);

    }
    create() {
        console.log("Creating enemies...");
        for (let y = 0; y < this.game.rows; y++) {
            for (let x = 0; x < this.game.columns; x++) {
                let enemyX = x * this.game.enemySize;
                let enemyY = y * this.game.enemySize;
                this.enemies.push(new Beetlemorph(this.game, enemyX, enemyY));
            }
        }
        console.log("Enemies created:", this.enemies.length); // Log after creation
    }
}

class Game{ 
    constructor(canvas){
        this.canvas = canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.keys = [];
        
        this.player = new Player(this);

        this.ProjectilePool = [];
        this.numberOfProjectile = 10;

        this.createProjectiles();
        this.fired = false;

        this.columns =5;
        this.rows = 3;

        this.enemySize = 80;
        this.waves = [];
        this.waves.push(new Wave(this));
        this.waveCount = 1;
        

        this.spriteUpdate = false;
        this.spriteTimer = 0;
        this.spriteInterval = 120;

        this.score = 0;
        this.gameOver = false;



        //Event listeners
        window.addEventListener("keydown",e =>{
            if(e.key === '1' && !this.fired) this.player.shoot();
            this.fired = true;
            if(this.keys.indexOf(e.key) === -1) this.keys.push(e.key);
             console.log(this.keys);
             if(e.key === 'r' && this.gameOver) this.restart();
        })

        window.addEventListener("keyup",e =>{
            this.fired = false;
            const index = this.keys.indexOf(e.key);
            if (index > -1) this.keys.splice(index,1);
             console.log(this.keys);

        })
    }
    render(context, deltaTime){
        //sprite timer
        if(this.spriteTimer > this.spriteInterval){
            this.spriteUpdate = true;
            this.spriteTimer = 0;
        }
        else{
            this.spriteUpdate = false;
            this.spriteTimer += deltaTime;
        }


        this.drawStatusText(context);
        console.log(this.width, this.height );
        this.player.draw(context);
        this.player.update();
        this.ProjectilePool.forEach(projectile =>{
            projectile.update(this.x , this.y);
            projectile.draw(context);
        })
        this.waves.forEach(wave =>{
            wave.render(context);
            if(wave.enemies.length < 1 && !wave.nextWaveTrigger && !this.gameOver){
                this.newWave();
                this.waveCount++;
                wave.nextWaveTrigger = true;
            }
        })
    }

    createProjectiles(){
        for(let i = 0; i<this.numberOfProjectile; i++){
            this.ProjectilePool.push(new Projectile());
        }
    }

    getProjectile(){
        for (let i = 0; i <this.ProjectilePool.length; i++){
            if(this.ProjectilePool[i].free) return this.ProjectilePool[i];  
        } 
    }
    //collision detection
    checkCollision(a, b){
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
        
    }

    drawStatusText(context){
        context.save();
        context.fillText('Score : ' + this.score, 20, 40);
        context.fillText('Wave : ' + this.waveCount,20,80);
        for(let i = 0 ; i< this.player.lives; i++ ){
            context.fillRect(20 + 10 *i ,100,5,20);
        }
        if(this.gameOver){
            context.textAlign = 'center';
            context.font = '80px Impact';
            context.fillText('GAME OVER !', this.width / 2, this.height /2);
            context.font = '30px Impact';
            context.fillText('Press R To Restart ', this.width / 2, this.height /2 + 30);
        }
        context.restore();
    }

    newWave(){
        this.columns++;
        this.rows++;
        this.waves.push(new Wave(this));
    }

    restart(){
        this.player.restart();
        this.columns = 2;
        this.rows = 3;
        
        this.waves = [];
        this.waves.push(new Wave(this));
        this.waveCount = 1;
        

        this.score = 0;
        this.gameOver = false;

    }
}


window.addEventListener("load", function(){
    const canvas = this.document.getElementById("canvas1");
    const ctx = canvas.getContext("2d");
    canvas.width = 600;
    canvas.height = 800;
    ctx.fillStyle = 'white';
    ctx.strokeStyle ='white';
    ctx.lineWidth = 5;
    ctx.font = '30px Impact';

    const game = new Game(canvas);

    let lastTime = 0;
    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0,0,canvas.width, canvas.height);
        game.render(ctx, deltaTime);
        window.requestAnimationFrame(animate);
    }
    animate(0);
});

