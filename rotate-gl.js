
var vertexGlsl = `
precision mediump float;
attribute vec2 coordinates;
uniform mat2 u_translation;

void main(void) {
    vec2 rotated = coordinates * u_translation;
    gl_Position = vec4(rotated, 0.0, 1.0);
}
`

var fragmentGlsl = `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

#define PI 3.1415926535897932384626433832795

void main(void) {
    gl_FragColor = vec4(sin(u_time + gl_FragCoord.x / 100.0),
                        sin(u_time + gl_FragCoord.x / 100.0 + PI / 3.0),
                        sin(u_time + gl_FragCoord.x / 100.0 + PI / 1.5),
                        1.0);
}
`

function main() {
    var gl = canvas.getContext('webgl');
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vertexShader, vertexGlsl);
    gl.shaderSource(fragmentShader, fragmentGlsl);
    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    console.log('vertex:', gl.getShaderInfoLog(vertexShader));
    console.log('fragment:', gl.getShaderInfoLog(fragmentShader));
    console.log('program:', gl.getProgramInfoLog(program));

    function renderScene(now) {
        var time = now / 1000;

        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.useProgram(program);

        var timePtr = gl.getUniformLocation(program, "u_time");
        gl.uniform1f(timePtr, time);

        var resolutionPtr = gl.getUniformLocation(program, "u_resolution");
        var resolution = [ 600, 600 ];
        gl.uniform2fv(resolutionPtr, resolution);

        var translationPtr = gl.getUniformLocation(program, "u_translation");
        var translation = [
            Math.cos(time), Math.sin(time),
            -Math.sin(time), Math.cos(time),
        ];
        gl.uniformMatrix2fv(translationPtr, false, translation);

        var vertices = [
            -0.5, 0.5,
            -0.5, -0.5,
            0.5, 0.5,
            0.5, -0.5
        ];
        // var vertices = [-3, 3, 3, 3, 0, -3];
        var vertex_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        var coord = gl.getAttribLocation(program, "coordinates");
        gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(coord);

        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.viewport(0, 0, canvas.width, canvas.height);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        requestAnimationFrame(renderScene);
    }

    requestAnimationFrame(renderScene);
}
