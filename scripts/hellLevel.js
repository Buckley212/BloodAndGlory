
const canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');

const backgroundImage = new Image();
backgroundImage.src = './resources/assets/Hell_Map.PNG'

const player_image = new Image();
player_image.src = './resources/assets/sprites/soldier_idle_spritesheet.png'

const player_image_shoot = new Image();
player_image_shoot.src = './resources/assets/muzzleFlash1.png'

const zombie_image = new Image();
zombie_image.src = './resources/assets/sprites/demon_forward.png'

const splatter_image = new Image();
const bloodimages = ['./resources/assets/bloodPools/blood-splatter1.png','./resources/assets/bloodPools/blood-splatter3.png','./resources/assets/bloodPools/blood-splatter4.png','./resources/assets/bloodPools/blood-splatter5.png','./resources/assets/bloodPools/blood-splatter6.png','./resources/assets/bloodPools/blood-splatter7.png','./resources/assets/bloodPools/blood-splatter2.png']

const barrier_image = new Image();
barrier_image.src = './resources/assets/sandbag_barrier.png';

const bulletButton = document.getElementById('damage');
const barrierButton = document.getElementById('health');

let bulletDamage = 1;
let barrierDurability = 1;

let gMouseX = 0;
let gMouseY = 0;
let gPlayerAngleInRads = 0;
let centerOfPlayerX = 0;
let centerOfPlayerY = 0;
let actualMouseX = 0;
let actualMouseY = 0;

document.addEventListener("mousemove", (e) => {
    gMouseX = e.clientX;
    gMouseY = e.clientY;
});

const score = {
    points: 0,
    draw: function () {
        ctx.font = "30px Arial";
        ctx.fillStyle = "yellow";
        ctx.fillText("Score: "+this.points, 50, 50);
    }
}

const timer = {
    time: 120,
    draw: function(){
        ctx.font = "30px Arial";
        ctx.fillStyle = "yellow";
        if (this.time <= 0){
            victory()
        }
        if (frame % 120 === 0){
            this.time -= 1
        }
        ctx.fillText("Time Remaining: "+this.time, canvas.width/2 -100, 50);
    }
}

const cash = {
    money: 0,
    draw: function () {
        ctx.font = "30px Arial";
        ctx.fillStyle = "yellow";
        ctx.fillText("Cash: "+this.money, canvas.width - 150, 50);
    }
}

const barrierHealth = {
    draw: function(){
        ctx.fillText('Wall Health: ', 50, canvas.height - 65)
        ctx.fillRect(250, canvas.height -100, barriers[0].health/6, 50)
    }
}

class Barrier {
    constructor(health, x, y, w, h){
        this.health = health;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    draw(){
        ctx.drawImage(barrier_image, this.x, this.y, this.w, this.h)
    }
}

const gameOver = () => {
    cancelAnimationFrame(gameInt)
    document.querySelector('body').innerHTML += '<img src="./resources/assets/endScreens/defeat.png" class="lose"></img>'
}

const victory = () => {
    cancelAnimationFrame(gameInt)
    document.querySelector('body').innerHTML += '<img src="./resources/assets/endScreens/victory.png" class="win"></img>'
}

let barriers = [];
barriers.push(new Barrier(4000, -80, 210, canvas.width+200, 140))


let numberOfImages = 20
let numberOfRows = 1
let numOfActualImages = 20
let rowImOn = 0

player_image.onload = function() {
    sx = 0
    sy = rowImOn * player_image.height / numberOfRows
    sw = player_image.width / numberOfImages
    sh = player_image.height / numberOfRows
    dx = 0
    dy = 0
}


let numberOfImagesZ = 4
let numberOfRowZ = 1
let numOfActualImagesZ = 4
let rowImOnZ = 0

zombie_image.onload = function() {
    sxz = 0
    syz = rowImOnZ * zombie_image.height / numberOfRowZ
    swz = zombie_image.width / numberOfImagesZ
    shz = zombie_image.height / numberOfRowZ
    dxz = 0
    dyz = 0
}


let z = 0;

setInterval(function () {
    sxz += swz
    z++
    if (z >= numOfActualImagesZ - 1) {
        sxz = 0;
        z = 0;
    }
}, 100)

let i = 0;

setInterval(function () {
    sx += sw
    i++
    if (i >= numOfActualImages - 1) {
        sx = 0;
        i = 0;
    }
}, 250)

class Player {
    constructor(x, y, w, h, img, img2){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.img = img;
        this.img2 = img2;
    }

    draw = () => {
        let canvasXY = canvas.getBoundingClientRect();

        let actualMouseX = gMouseX - canvasXY.x;
        let actualMouseY = gMouseY - canvasXY.y;
        let centerOfPlayerX = this.x + 50;
        let centerOfPlayerY = this.y + 50;
    
        gPlayerAngleInRads = Math.atan2(
            actualMouseY - centerOfPlayerY,
            actualMouseX - centerOfPlayerX
        );
    
        ctx.translate(centerOfPlayerX, centerOfPlayerY);
        ctx.rotate(gPlayerAngleInRads + (90 * Math.PI) / 180);
        ctx.translate(-centerOfPlayerX, -centerOfPlayerY);
        if(shooting){
            ctx.drawImage(this.img2, this.x+50, this.y, 50, 50);
            ctx.drawImage(
                this.img, sx, sy, sw, sh,
                this.x, this.y+30, this.w, this.h
            )
        }
        // } else {ctx.drawImage(this.img, this.x, this.y, this.w, this.h);}
        else{
            ctx.drawImage(
                this.img, sx, sy, sw, sh,
                this.x, this.y+30, this.w, this.h
            )
        }
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
}

class Blood {
    constructor(x, y, src) {
        this.x = x;
        this.y = y;
        this.src = src;
    }
    draw() {
        splatter_image.src = this.src;
        ctx.drawImage(splatter_image, this.x, this.y, 200, 200)
    }
}

const bloodPools = [];

let bulletSpeed = 9;

class Bullet {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    update() {
        this.draw();
        this.x = this.x + this.velocity.x * bulletSpeed;
        this.y = this.y + this.velocity.y * bulletSpeed;
    }
}

let shooting = false;
const bullets = [];

addEventListener("click", (event) => {
    let canvasXY = canvas.getBoundingClientRect();

    let actualMouseClickX = event.clientX - canvasXY.x;
    let actualMouseClickY = event.clientY - canvasXY.y; 

    let centerPlayerX = player.x + 52;
    let centerPlayerY = player.y + 70;
    shooting = true;

    setTimeout(() => shooting = false, 100) 
    const angle = Math.atan2(
      actualMouseClickY - centerPlayerY,
      actualMouseClickX - centerPlayerX
    );

    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };

    bullets.push(
        new Bullet(
            player.x + 20,
            player.y + 80,
            5,
            `#7E8784`,
            velocity
        )
    )
});
  
function detectCollision(rect1, rect2) {
    if (
        rect1.x < rect2.x + rect2.w &&
        rect1.x + rect1.w > rect2.x &&
        rect1.y < rect2.y + rect2.h &&
        rect1.y + rect1.h > rect2.y
      ) {
        if (rect2.health >= 51) {
            rect2.health -= 50;
            score.points += 5
            bullets.splice(bullets.indexOf(rect1), 1);
            bloodPools.push(new Blood(rect2.x - 50, rect2.y, bloodimages[Math.floor(Math.random()*bloodimages.length)]))
        } 
        else {
            setTimeout(() => {
                cash.money += 5
                score.points += 10
                bullets.splice(bullets.indexOf(rect1), 1);
                zombies.splice(zombies.indexOf(rect2), 1);
                bloodPools.push(new Blood(rect2.x -50, rect2.y, bloodimages[Math.floor(Math.random()*bloodimages.length)]))
            }, 0);
        }
    }
}

  function detectCollision2(rect1, rect2) {
    if (
        rect1.x < rect2.x + rect2.w &&
        rect1.x + rect1.w > rect2.x &&
        rect1.y < rect2.y + rect2.h &&
        rect1.y + rect1.h > rect2.y
      ) {
        if (rect2.health >= 51) {
            rect2.health -= 50;
            score.points += 100
            bullets.splice(bullets.indexOf(rect1), 1);
            bloodPools.push(new Blood(rect2.x - 50, rect2.y, bloodimages[Math.floor(Math.random()*bloodimages.length)]))
        } 
        else {
            setTimeout(() => {
                cash.money += 5
                score.points += 100
                bullets.splice(bullets.indexOf(rect1), 1);
                fastZombies.splice(fastZombies.indexOf(rect2), 1);
                bloodPools.push(new Blood(rect2.x - 50, rect2.y, bloodimages[Math.floor(Math.random()*bloodimages.length)]))
            }, 0);
        }
    }
}

  function detectCollision3(rect1, rect2) {
    if (
        rect1.x < rect2.x + rect2.w &&
        rect1.x + rect1.w > rect2.x &&
        rect1.y < rect2.y + rect2.h &&
        rect1.y + rect1.h > rect2.y
      ) {
        if (rect2.health >= 51) {
            rect2.health -= 50;
            score.points += 10
            bullets.splice(bullets.indexOf(rect1), 1);
            bloodPools.push(new Blood(rect2.x + 75, rect2.y + 50, bloodimages[Math.floor(Math.random()*bloodimages.length)]))
        } 
        else {
            setTimeout(() => {
                cash.money += 25
                score.points += 100
                bullets.splice(bullets.indexOf(rect1), 1);
                tankZombies.splice(tankZombies.indexOf(rect2), 1);
                bloodPools.push(new Blood(rect2.x + 75, rect2.y + 50, bloodimages[Math.floor(Math.random()*bloodimages.length)]))
            }, 0);
        }
    }
}
  

class Zombie {
    constructor(x, y, w, h, img){
        this.health = 200
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.img = img;
    }

    draw = () => {
        if(this.health > 0){
            ctx.drawImage(
                this.img, sxz, syz, swz, shz,
                this.x, this.y, this.w, this.h
            )
        }
    }
    
    move = () => {
        if (this.y > 300){
            this.y -=1;
        }
        if (this.y === 300) {
            this.y -= 0;
            if (barriers[0].health >= 1){
                if (frame % 120 === 0 && barriers.length > 0){
                    barriers[0].health -=100;
                }
            }
            if (barriers[0].health <= 0) {
                barriers.splice(0, 1)
            }
        }
    }
}

class FastZ extends Zombie {
    constructor(x, y, w, h, img){
        super(x, y, w, h, img);
        this.health = 50;
    }
    move = () => {
        if (this.y > 300){
            this.y -= 5
        }
        if (this.y === 300) {
            this.y -= 0;
            if (frame % 120 === 0 && barriers.length > 0){
                barriers[0].health -=5;
            }
            if (barriers[0].health <= 0) {
                barriers.splice(0, 1)
            }
        }
    }
}

class TankZ extends Zombie {
    constructor(x, y, w, h, img){
        super(x, y, w, h, img);
        this.health = 1000;
    }
    move = () => {
        if (this.y > 300){
            this.y -= 0.1;
        }
        if (this.y === 300) {
            this.y -= 0;
            if (frame % 120 === 0 && barriers.length > 0){
                barriers[0].health -= 50;
            }
            if (barriers[0].health <= 0) {
                barriers.splice(0, 1)
            }
        }
    }
}

let tankZombies = [];
let zombies = [];
let fastZombies = [];

setInterval(function () {
    zombies.push(new Zombie(Math.floor(Math.random()*canvas.width - 50), canvas.height, 100, 100, zombie_image))
}, 750)

setInterval(function (){
    fastZombies.push(new FastZ(Math.floor(Math.random()*canvas.width), canvas.height, 75, 75, zombie_image))
}, 5000)

setInterval(function (){
    tankZombies.push(new TankZ(Math.floor(Math.random()*canvas.width), canvas.height, 300, 300, zombie_image))
}, 15000)

const player = new Player(canvas.width/2 - 20, 150, 100, 100, player_image, player_image_shoot)

const background = {
    x: 0,
    y: 0,
    w: canvas.width,
    h: canvas.height,
    draw: function() {
        ctx.drawImage(backgroundImage, this.x, this.y, this.w, this.h)
    }
}

bulletButton.addEventListener('click', function(){
    if (cash.money >= 25){
        cash.money -= 25;
        bulletDamage++;
    }
})

barrierButton.addEventListener('click', function(){
    if (cash.money >= 25){
        cash.money -= 25;
        barrierDurability++;
    }
})


let gameInt = null;
let frame = 0;
function animate() {
    gameInt=requestAnimationFrame(animate)
    ctx.clearRect(0,0,canvas.width,canvas.height)
    background.draw();
    bloodPools.forEach(pool => {
        pool.draw()
    })
    if (barriers.length === 0){
        gameOver()
    } 
    else {
        barriers.forEach(barrier => {
            barrier.draw()
        });
    }
    player.draw();
    zombies.forEach(badguy => {
        badguy.draw()
        badguy.move()
        bullets.forEach((bullet) => {
            bullet.update();
            bullet.w = bullet.radius * 2;
            bullet.h = bullet.radius * 2;
            detectCollision(bullet, badguy);
        });
    })
    fastZombies.forEach(badguy => {badguy.draw()
        badguy.move()
        bullets.forEach((bullet) => {
        bullet.update();
        bullet.w = bullet.radius * 2;
        bullet.h = bullet.radius * 2;
        detectCollision2(bullet, badguy);
    });
    })
    tankZombies.forEach(badguy => {badguy.draw()
        badguy.move()
        bullets.forEach((bullet) => {
        bullet.update();
        bullet.w = bullet.radius * 2;
        bullet.h = bullet.radius * 2;
        detectCollision3(bullet, badguy);
    });
    })
    score.draw();
    cash.draw();
    barrierHealth.draw()
    timer.draw();
    frame++
}

window.onload = animate();
