class Game{
    constructor(canvas, context){
        this.canvas = canvas;
        this.context = context;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.player = new Player(this);
        this.baseHeight = 720;
        this.ratio = this.height / this.baseHeight;
        this.gravity = 1;

        this.resize(window.innerWidth, innerHeight);

        window.addEventListener('resize', e =>{
            this.resize(e.currentTarget.innerWidth,e.currentTarget.innerHeight)
        })
    }
    resize(width, height) {
        this.canvas.width = width ;
        this.canvas.height = height;
        this.width = this.canvas.width;
        this.height = this.canvas.height; 
        this.ratio = this.height / this.baseHeight;
        this.player.rezize();
    }
    render(){
        //this.context.fillRect(100,100,50,150);
        this.player.draw();
        this.player.update();
    }
}

window.addEventListener('load', function(){
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 720;
    canvas.height = 720;

    const game = new Game (canvas, ctx);    
    function animate(){
        ctx.clearRect(0,0 , canvas.width, canvas.height);
        game.render();
        requestAnimationFrame(animate);
    }
    animate();

});

