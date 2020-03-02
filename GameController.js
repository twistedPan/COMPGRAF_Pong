const CW = document.getElementById("myCanvas").width;
const cH = document.getElementById("myCanvas").height;
const OUTPUT = document.getElementById("output");

let gamePaused = true;

export const KEYMAP = {};
onkeydown = onkeyup = function(e){
    //e = e || e.code; // to deal with IE
    KEYMAP[e.code] = e.type === 'keydown';
    /* insert conditional here */
};

const reset = _ => {
    if (KEYMAP.Space && gamePaused) {
        // new Game
        ball.speedX = chooseRnd(-5,5);
        ball.speedY = random(-3,3);
        gamePaused = false;
    } else if (KEYMAP.Space && ball.lost) {
        // death screen
        pl1 = new CPlayer(pl1.x,-90,15,150);
        pl2 = new CPlayer(pl2.x,-90,15,150);
        ball = new Ball(0,0,20);
        ball.speedX = chooseRnd(5,-5);
        ball.speedY = random(-3,3);
        ball.lost = false;
        // stop the music
        document.getElementById("audioTrack").remove();
    }
};

// Player Class ------------------------------------------------------ Player
export class CPlayer {
    constructor(x,y,w,h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.speed = 10;
        this.keyPress = false;
        this.direction = 0;
        this.score = 0;
    }
    update(_newX, _newY) {
        this.x = _newX;
        this.y = _newY;
    }
    moveY(_newY) {
        this.y += (_newY * this.speed);
    }
    reduceHight() {
        this.h -= 2.5;
        this.y += 1.25;
        //this.y *= 1.0140845070422535211267605633803;
    }

}

// create Player 1+2
export let pl1 = new CPlayer(0,-90,15,150);
export let pl2 = new CPlayer(0,-90,15,150);


// Player movement
export function movePlayers(pl1,pl2) {
    if (pl1.keyPress) {
        if (pl1.direction === "KeyW") {
            if (isInArea(pl1)) pl1.moveY(1);
            else pl1.moveY(0);

        } else if (pl1.direction === "KeyS") {
            if (isInArea(pl1)) pl1.moveY(-1);
            else pl1.moveY(0);
        }
    }

    if (pl2.keyPress) {
        if (pl2.direction === "ArrowUp") {
            if (isInArea(pl2)) pl2.moveY(1);
            else pl2.moveY(0);

        } else if (pl2.direction === "ArrowDown") {
            if (isInArea(pl2)) pl2.moveY(-1);
            else pl2.moveY(0);
        }
    }
}



// Ball Class ----------------------------------------------------- Ball
export class Ball {
    constructor(x,y,r) {
        this.x = x;
        this.y = y;
        this.w = r;
        this.h = r;
        this.speedX = 0; // 5
        this.speedY = 0; // 2
        this.rotate = 0;
        this.rotFac = 0.1;
        this.lost = false;
        this.shrink = this.w/50;
    }

    moveBall(pl1,pl2) {
        this.x += this.speedX;
        this.y += this.speedY;

        // Lower / Upper Boundary
        if(this.y+this.h > cH/2 || this.y < -cH/2) {
            //console.log("Ball X", this.y);
            this.speedY *= -1;
        }
            // Player bounce
            if(rectCollisionDetect(this,pl1) || rectCollisionDetect(pl2,this)) {

            //console.log("Ball S1", this.speedX);
            this.speedX += (this.speedX/20);
            this.speedX *= -1;

            if(rectCollisionDetect(this,pl1)) { // collide with Player 1
                calcImpactOnPlayer(pl1);
                toggleAudio('bleep');
                pl1.score++;
            } else {                           // collide with Player 2
                calcImpactOnPlayer(pl2);
                toggleAudio('bleepd');
                pl2.score++;
            }

            // juice stuff
            this.w = this.h = this.w-this.shrink;
            this.rotFac += 0.1;
            if(rectCollisionDetect(this,pl1)) {
                pl1.reduceHight();
            } else {
                pl2.reduceHight();
            }

            OUTPUT.innerHTML = pl1.score + " - " + pl2.score;
        }

        // Lose condition
        if((this.x > CW/2 || this.x < -CW/2) && !this.lost) {
            this.speedX = this.speedY = 0;
            this.x = this.y = 0; //-400;
            this.lost = true;
            toggleAudio("lost");
            toggleAudio("music");
        }
    }
}

// create Ball
export let ball = new Ball(0,0,20);


// KeyListeners
const keyUpdate = e => {
    //console.log(KEYMAP);
    // PL 1
    if ( KEYMAP.KeyW ) {
        pl1.keyPress = true;
        pl1.direction = "KeyW";
    } else if ( KEYMAP.KeyS ) {
        pl1.keyPress = true;
        pl1.direction = "KeyS";
    } else {
        pl1.keyPress = false;
    }
    // Pl 2
    if ( KEYMAP.ArrowUp ) {
        pl2.keyPress = true;
        pl2.direction = "ArrowUp";
    } else if ( KEYMAP.ArrowDown ) {
        pl2.keyPress = true;
        pl2.direction = "ArrowDown";
    } else {
        pl2.keyPress = false;
    }

    if(e.type === "keyup") {
        // slow stopping wär do no öbis
        if (e.code === "KeyW") {
            if (!isInArea(pl1)) pl1.moveY(-1);
            //else phaseOut(pl1)
        } else if (e.code === "KeyS") {
            if (!isInArea(pl1)) pl1.moveY(1);
        }
        if (e.code === "ArrowUp") {
            if (!isInArea(pl2)) pl2.moveY(-1);
        } else if (e.code === "ArrowDown") {
            if (!isInArea(pl2)) pl2.moveY(1);
        }
    }
};

// EVENTLISTENER ----------------------------------------------------------

addEventListener(`keydown`, keyUpdate);
addEventListener(`keyup`, keyUpdate);
addEventListener("keydown", reset);

/**
 * Top_Left -- / Bottom_Right ++
 * FieldHeight -> canvas=600 => ( -300 <-> 300 )
 * -100 > -300 -> true
 *
 * Player.h = 150
 * Player.y = 0 - (Player.h/2)
 *
 * Top || Bottom
 */
function isInArea(obj) {
    return !(obj.y <= -cH/2 || obj.y+obj.h >= cH/2);
}
//console.log("1:",pl1.y);
//console.log("2:",pl1.h);

// Collision Detection for Rectangles
function rectCollisionDetect(rect1,rect2) {
    return rect1.x < rect2.x + rect2.w &&
        rect1.x + rect1.w > rect2.x &&
        rect1.y < rect2.y + rect2.h &&
        rect1.y + rect1.h > rect2.y;
}

// P5.js Map
const map = function(n, start1, stop1, start2, stop2, withinBounds) {
    const newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
    if (!withinBounds) {
        return newval;
    }
    if (start2 < stop2) {
        return this.constrain(newval, start2, stop2);
    } else {
        return this.constrain(newval, stop2, start2);
    }
};

// Je nach Auftriffshöhe auf Player wird der Y-Speed anderst berechnet
function calcImpactOnPlayer(player) {
    //console.table(ball);
    //console.table(player);
    let ballMap = map(ball.y, 300-ball.h,-300, ball.h,600);
    let playMap = map(player.y, 300-player.h,-300, player.h,600);
    ballMap -= ball.h/2;

    let hitMap = map(playMap-ballMap, 0, player.h, -5, 5);

    //console.log("PLAYER", player.y, " Map", playMap, " /////// ", "BALL", ball.y, " Map", ballMap, " //// Diff", hitMap);

    if (ballMap >= playMap - player.h && // upper bound and higher
        ballMap <= playMap - player.h / 2) { // upper middle
        //console.log("oben")
        ball.speedY = hitMap;

    } else if (ballMap >= playMap || // lower bound and lower
        ballMap <= playMap + player.h / 2) { // lower middle
        //console.log("unten")
        ball.speedY = hitMap;
    }
}


function random(min, max) {
    return Math.random() * (max - min) + min;
}

function chooseRnd(min, max) {
    if (Math.random() >= 0.5) return max;
    else return min;
}

// smooth out stop motion
function phaseOut(obj) {
    let n = 1;
    while (n > 0.1) {
        n = n*0.7;
        obj.moveY(n)
    }
}

// benötigt <audio> element mit id(audio, music) erzeugt töne
export function toggleAudio(type) {
    switch (type) {
        case "bleep":
            document.getElementById("audio").innerHTML =
                "<audio autoplay><source src='assets/sound/bleep.mp3'></audio>";
            //document.getElementById("audio").innerHTML =
            // "<audio autoplay><source src='assets/sound/smb_fireball.wav'></audio>";
            break;
        case "bleepd":
            document.getElementById("audio").innerHTML =
                "<audio autoplay><source src='assets/sound/bleep-deep.mp3'></audio>";
            //document.getElementById("audio").innerHTML =
            // "<audio autoplay><source src='assets/sound/smb_fireball.wav'></audio>";
            break;
        case "lost":
            document.getElementById("audio").innerHTML =
                "<audio autoplay><source src='assets/sound/applauseNcheer.mp3'></audio>";
            break;
        case "music":
            //document.getElementById("music").innerHTML =
                //"<audio id='audioTrack' autoplay><source src='assets/sound/creditesTheme-RR.mp3'></audio>";
            break;
        default:
            break;
    }
}


