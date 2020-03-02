
attribute vec2 aVertexTextureCoord;
attribute vec2 aVertexPosition;

varying vec2 vTextureCoord ;
varying vec4 vColor;

uniform mat3 uModelMat;
uniform mat3 uProjectionMat;

void main() {
    //gl_Position = vec4(aVertexPosition, 0, 1);
    vTextureCoord = aVertexTextureCoord;
    //vColor = aVertexColor;

    vec3 position = uProjectionMat * uModelMat * vec3(aVertexPosition, 1);

    gl_Position = vec4(position.xy / position[2], 0, 1);
}
