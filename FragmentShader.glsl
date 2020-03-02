precision mediump float;

varying vec2 vTextureCoord ;
uniform sampler2D uSampler ;

uniform vec4 uColor;
varying vec4 vColor;

void main() {
    //gl_FragColor = vec4(0,1,0,1);
    //gl_FragColor = uColor;
    gl_FragColor = texture2D(uSampler, vTextureCoord);
    gl_FragColor = vColor;
}

