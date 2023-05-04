//Declaring constants
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const destroySound = new Audio('Public/music/destroy.mp3');
const gameOverSound = new Audio('Public/music/gameOver.mp3');
const moveSound = new Audio('Public/music/move.mp3');
const musicSound = new Audio('Public/music/gamemusic.mp3');
var vh = window.innerHeight / 100;
var vw = window.innerWidth / 100;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const collisioncanvas = document.getElementById("collisionCanvas");
const collisionctx = collisioncanvas.getContext('2d', { willReadFrequently: true });
collisioncanvas.width = window.innerWidth;
collisioncanvas.height = window.innerHeight;
let lastpainttime = 0;
let score = 0;
let maxscore = localStorage.getItem("MaxScore");
let gameOver = false;
let gameStart = false;

//stores rocks present on the screen
let rocks = [];

//Creating a class for rocks and their animation
class Rock {
    constructor() {
        this.spritewidth = 271;
        this.spriteheight = 194;
        this.sizemodify = Math.random() * 0.2 + 0.6;
        this.height = this.spritewidth;
        this.width = this.spriteheight ;//* this.sizemodify;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - 1.3 * this.height);
        this.velocityX = Math.random() * 1 + 2;
        this.velocityY = Math.random() * 1.5 - 2;
        this.fordeletion = false;
        this.image = new Image;
        this.image.src = 'https://www.frankslaboratory.co.uk/downloads/raven.png';
        this.frame = 0;
        this.maxframe = 4;
        this.lasttime = 0;
        this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
        this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1] + ',' + this.randomColors[2] + ')';
    };

    update(time) {
        if (this.y < 0 || this.y > canvas.height - this.height) this.velocityY = -this.velocityY;
        this.x -= this.velocityX;
        this.y += this.velocityY;
        if (this.x < 0 - this.width) this.fordeletion = true;

        if (time - this.lasttime > 100) {
            if (this.frame > this.maxframe) this.frame = 0;
            else this.frame++;
            this.lasttime = time;
        }
        if (this.x < 0) {
            gameOver = true;

        }
    }
    draw() {
        collisionctx.fillStyle = this.color;
        //collisionctx.fillRect(this.x, this.y, this.width, this.height);
        collisionctx.beginPath();
        collisionctx.arc(this.x+(this.width/2), this.y+(this.height/2), this.width/1.8, 0, 2 * Math.PI);
        collisionctx.fill();
        ctx.drawImage(this.image, this.frame * this.spritewidth, 0, this.spritewidth, this.spriteheight, this.x, this.y, this.width, this.height);
    }
}
let explosions = [];
class Explosion {
    constructor(x, y, size) {
        this.image = new Image();
        this.image.src = "https://www.frankslaboratory.co.uk/downloads/boom.png";
        this.spritewidth = 200;
        this.spriteheight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.sound = destroySound;
        this.lasttime = 0;
        this.frame = 0;
        this.fordeletion = false;

    }
    update(time) {
        if (this.frame === 0) this.sound.play();
        if (time - this.lasttime > 1000) {
            this.frame++;
            if (this.frame > 5) this.fordeletion = true;
        }
    }
    draw() {
        ctx.drawImage(this.image, this.frame * this.spritewidth, 0, this.spritewidth, this.spriteheight, this.x, this.y, this.size, this.size);
    }
}

//animation function and loop
if (maxscore === null) {
    var maxscoreval = 0;
    localStorage.setItem("MaxScore", JSON.stringify(maxscoreval))
}
else {
    maxscoreval = JSON.parse(maxscore);
    MaxScore.innerHTML = "MaxScore: " + maxscoreval;
}
window.addEventListener('click', function (e) {

    moveSound.play();
    
    const detectpixel = collisionctx.getImageData(e.x, e.y, 1, 1);
    console.log(detectpixel);
    const colordata = detectpixel.data;
    rocks.forEach(object => {
        if (object.randomColors[0] === colordata[0] && object.randomColors[1] === colordata[1] && object.randomColors[2] === colordata[2]) {
            object.fordeletion = true;
            score++;
            Score.innerHTML = "Score: " + score;
            explosions.push(new Explosion(object.x, object.y, object.width));
            if (score >= maxscoreval) {
                maxscoreval = score;
                localStorage.setItem("MaxScore", JSON.stringify(maxscoreval));
                MaxScore.innerHTML = "MaxScore: " + maxscoreval;
            }


        }
    })

});
function GameOver() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    collisionctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.textalign = 'center';

    ctx.font = '30px Arial';
    ctx.fillText('Game Over , your score is ' + score + '. Press any key to start again', canvas.width/4, canvas.height/3);
}
function GameStart() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    collisionctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.textalign = 'center';

    ctx.font = '30px Arial';
    ctx.fillText('Press any key to start and click on bird to destroy.', canvas.width/4, canvas.height/3);
    window.addEventListener('keydown', function (e) {

        if (!gameStart) {
            gameStart = true;
            musicSound.play();
            animation();
        }

    })
}

function animation(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    collisionctx.clearRect(0, 0, canvas.width, canvas.height);
    if ((time - lastpainttime) > 700) {
        rocks.push(new Rock);
        lastpainttime = time;
    //    rocks.sort(function (a, b) { return a.width - b.width; });
    }
    [...rocks, ...explosions].forEach(object => object.update(time));
    [...rocks, ...explosions].forEach(object => object.draw());
    rocks = rocks.filter(object => !object.fordeletion);
    explosions = explosions.filter(object => !object.fordeletion);

    if (!gameOver) {
        requestAnimationFrame(animation);
    }
    else {
        musicSound.pause();
        gameOverSound.play();
        GameOver();
        score = 0;
        rocks = [];

        window.addEventListener('keydown', function (e) {
            musicSound.play();
            if (gameOver) {
                gameOver = false;
                animation();
            }

        })

    }



}
GameStart();

