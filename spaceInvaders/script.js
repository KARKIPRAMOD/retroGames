class Player{
    constructor(game){
        this.game = game;  // player has reference to the game object
        this.width = 100;  
        this.height = 100;
        this.x = this.game.width * 0.5 - this.width *0.5;
        this.y = this.game.height - this.height;
        this.speed = 10;
    }
    draw(context){
        context.fillRect(this.x, this.y, this.width, this.height); // player is drawn as rectangle  at  the given position 
    }
    update(){
        //horizontal movements
        if (this.game.keys.indexOf("ArrowLeft") > -1) this.x -= this.speed;
        if (this.game.keys.indexOf("ArrowRight") > -1) this.x += this.speed;
        
        // horizontal boundaries
        if(this.x < - this.width* 0.5 ) this.x = 0;
        else if (this.x > this.game.width - this.width *0.5  ) this.x = this.game.width - this.width;
    }
    shoot(){
        const projectile = this.game.getProjectile();
        if(projectile) projectile.start(this.x+ this.width/2, this.y);
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

class Enemy{}

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
        console.log(this.ProjectilePool);

        //Event listeners
        window.addEventListener("keydown",e =>{
            if(this.keys.indexOf(e.key) === -1) this.keys.push(e.key);
             console.log(this.keys);
             if(e.key === '1') this.player.shoot();
        })

        window.addEventListener("keyup",e =>{
            const index = this.keys.indexOf(e.key);
            if (index > -1) this.keys.splice(index,1);
             console.log(this.keys);

        })
    }
    render(context){
        console.log(this.width, this.height );
        this.player.draw(context);
        this.player.update();
        this.ProjectilePool.forEach(projectile =>{
            projectile.update();
            projectile.draw(context);
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
}


window.addEventListener("load", function(){
    const canvas = this.document.getElementById("canvas1");
    const ctx = canvas.getContext("2d");
    canvas.width = 600;
    canvas.height = 800;
    const game = new Game(canvas);
    
    function animate(){
        ctx.clearRect(0,0,canvas.width, canvas.height);
        game.render(ctx);
        window.requestAnimationFrame(animate);
    }
    animate();
});

