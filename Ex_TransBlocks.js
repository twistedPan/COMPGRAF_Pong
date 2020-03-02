import { movePlayers, pl1, pl2, ball } from './GameController.js'
//
// Computer Graphics
//
// WebGL Exercises
//

// Register function to call after document has loaded
window.onload = startup;

// the gl object is saved globally
let gl;
const OUTPUT = document.getElementById("output");

// we keep all local parameters for the program in a single object with the name ctx (for context)
const ctx = {
    shaderProgram: -1,
    aVertexPositionId: -1,
    uSampler2DId: -1,
    aVertexTextureCoordId: -1,
    uProjectionMatId: -1,
    uModelMatId: -1,
};

const rectangleObject = {
    bufferV : -1,
    textureBuffer : -1,
};

// keep texture parameters in an object so we can mix textures and objects
const myTxtr = {
    textureObj : {}
};

/**
 * Startup function to be called when the body is loaded -------------------------------------------
 */
function startup() {
    "use strict";
    const canvas = document.getElementById("myCanvas");
    gl = createGLContext(canvas);
    initGL();
    //loadTexture();
    draw(); // passiert in loadTexture()
    window.requestAnimationFrame(drawAnimated);
    //toggleAudio("music");

    pl1.x = -(canvas.width/2 - 50+pl1.w);
    pl2.x = canvas.width/2 - 50;

    //console.log("pos", pl1.x)
}

/**
 * InitGL should contain the functionality that needs to be executed only once ---------------------------
 */
function initGL() {
    "use strict";
    ctx.shaderProgram = loadAndCompileShaders(gl, 'VertexShader.glsl', 'FragmentShader.glsl');
    setUpAttributesAndUniforms();
    setUpBuffers();

    // set the clear color here
    gl.clearColor(ball.speedX,0.17,0.13,1);

    // Set up the world coordinates
    let projectionMat = mat3.create();
    mat3.fromScaling(projectionMat, [2.0/gl.drawingBufferWidth, 2.0/gl.drawingBufferHeight]);
    gl.uniformMatrix3fv(ctx.uProjectionMatId, false, projectionMat);

    //console.log("gl.drawingBufferWidth", gl.drawingBufferWidth);
}

/**
 * Setup all the attribute and uniform variables ---------------------------------------------------
 */
function setUpAttributesAndUniforms(){
    "use strict";
    ctx.aVertexPositionId = gl.getAttribLocation(ctx.shaderProgram, "aVertexPosition");
    ctx.aVertexTextureCoordId = gl.getAttribLocation(ctx.shaderProgram, "aVertexTextureCoord");
    ctx.uSampler2DId = gl.getUniformLocation(ctx.shaderProgram , "uSampler");
    ctx.uModelMatId = gl.getUniformLocation(ctx.shaderProgram , "uModelMat");
    ctx.uProjectionMatId = gl.getUniformLocation(ctx.shaderProgram , "uProjectionMat");
}


/**
 * Initialize a texture from an image
 * @param image the loaded image
 * @param textureObject WebGL Texture Object
 */
function initTexture(image, textureObject) {
    //gl.enable(gl.TEXTURE_2D);
// create a new texture
    gl.bindTexture(gl.TEXTURE_2D, textureObject);
// set parameters for the texture
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D , 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
// turn texture off again
    gl.bindTexture(gl.TEXTURE_2D, null);
}

/**
 * Load an image as a texture
 */
function loadTexture() {
    let image = new Image();
// create a texture object
    myTxtr.textureObj = gl.createTexture();
    image.onload = function () {
        initTexture(image, myTxtr.textureObj);
// make sure there is a redraw after the loading of the texture
        draw();
    };
// setting the src will trigger onload
    //image.src = "assets/picture/ciri.png";
    image.src = "assets/picture/lava.jpg";
    //image.src = "assets/picture/cat3.jpg";
}


/**
 * Setup the buffers to use. If more objects are needed this should be split into one file per object.
 */
function setUpBuffers(){
    "use strict";
    // create the texture coordinates for the object
    rectangleObject.bufferV = gl.createBuffer();
    const verticies = [
        0,0,
        1,0,
        1,1,
        0,1
    ];

    rectangleObject.textureBuffer = gl.createBuffer();
    var textureCoord = [
        0, 0,
        1, 0,
        1, 1,
        0, 1
    ];

    gl.bindBuffer(gl.ARRAY_BUFFER, rectangleObject.bufferV);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticies), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, rectangleObject.textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoord), gl.STATIC_DRAW);
}


/**
 * Draw the scene.
 */
function draw() {
    "use strict";
    //console.log("Drawing in draw()");
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Vertex
    gl.bindBuffer(gl.ARRAY_BUFFER, rectangleObject.bufferV);
    gl.vertexAttribPointer(ctx.aVertexPositionId, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(ctx.aVertexPositionId);

    //gl.bindBuffer(gl.ARRAY_BUFFER, rectangleObject.bufferV);
    //gl.vertexAttribPointer(ctx.aVertexColorId, 2, gl.FLOAT, false, 0, 0);
    //gl.enableVertexAttribArray(ctx.aVertexColorId);

    // Texture

    // Models
    let modelMat = mat3.create();

    // Middle Line Verticaly
    mat3.fromTranslation(modelMat, [-1.5,-300]);
    mat3.scale(modelMat,modelMat, [3,window.innerHeight]);
    gl.uniformMatrix3fv(ctx.uModelMatId, false, modelMat);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // Block Left
    mat3.fromTranslation(modelMat, [pl1.x,pl1.y]);
    mat3.scale(modelMat,modelMat, [pl1.w,pl1.h]);
    gl.uniformMatrix3fv(ctx.uModelMatId, false, modelMat);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // Block Right
    mat3.fromTranslation(modelMat, [pl2.x,pl2.y]);
    mat3.scale(modelMat,modelMat, [pl2.w,pl2.h]);
    gl.uniformMatrix3fv(ctx.uModelMatId, false, modelMat);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // Ball
    mat3.fromTranslation(modelMat, [ball.x,ball.y]);
    mat3.rotate(modelMat,modelMat,ball.rotate);
    mat3.scale(modelMat,modelMat, [ball.w,ball.h]);
    gl.uniformMatrix3fv(ctx.uModelMatId, false, modelMat);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // Tests
    //mat3.fromTranslation(modelMat, [-390,-290]); // Links unten
    //mat3.scale(modelMat,modelMat, [10,10]);
    //gl.uniformMatrix3fv(ctx.uModelMatId, false, modelMat);
    //gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    //mat3.fromTranslation(modelMat, [380,280]); // rechts oben
    //mat3.scale(modelMat,modelMat, [10,10]);
    //gl.uniformMatrix3fv(ctx.uModelMatId, false, modelMat);
    //gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    // Middle Line Horizontal
    //mat3.fromTranslation(modelMat, [-400,0.5]);
    //mat3.scale(modelMat,modelMat, [window.innerWidth,1]);
    //gl.uniformMatrix3fv(ctx.uModelMatId, false, modelMat);
    //gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

}

/*
* // Texture
    gl.bindBuffer(gl.ARRAY_BUFFER, rectangleObject.textureBuffer);
    gl.vertexAttribPointer(ctx.aVertexTextureCoordId, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(ctx.aVertexTextureCoordId);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, myTxtr.textureObj);
    gl.uniform1i(ctx.uSampler2DId, 0);
*
* */



let first = true;
let lastTimeStamp = 0;
function drawAnimated( timeStamp ) {
    let timeElapsed = 0;
    if (first) {
        lastTimeStamp = timeStamp;
        first = false;
    } else {
        timeElapsed = timeStamp - lastTimeStamp;
        lastTimeStamp = timeStamp;
    }

    // move or change objects
    //console.log("Area", isInArea(pl1));
    ball.moveBall(pl1,pl2);
    movePlayers(pl1,pl2);
    draw();
    ball.rotate += ball.rotFac;
    //OUTPUT.innerHTML =  "pX:" + ball.x + " / pY:" + ball.y;
    window.requestAnimationFrame(drawAnimated);
}







