"use client";

import { useEffect, useRef, useCallback } from "react";
import fragmentShaderSrc from "./fragmentShader.glsl";
import vertexShaderSrc from "./vertexShader.glsl";

const quad = new Float32Array([-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]);

function createShader(
  gl: WebGL2RenderingContext,
  type: GLenum,
  source: string,
) {
  const shader = gl.createShader(type);
  if (!shader) {
    console.error(`Shader of type ${type} could not be created`);
    return null;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createWebGlProgram(
  gl: WebGL2RenderingContext,
  vertexShaderSrc: string,
  fragmentShaderSrc: string,
) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSrc,
  );

  if (!vertexShader || !fragmentShader) {
    console.error("WebGL vertex and fragment shaders could not be created");
    return null;
  }

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

export default function Gradient({ ...props }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGL2RenderingContext>(null);
  const timeLocRef = useRef<WebGLUniformLocation>(null);
  const resLocRef = useRef<WebGLUniformLocation>(null);

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const gl = glRef.current;

    if (!canvas || !gl) {
      console.error(
        "Couldn't resize canvas due to empty canvasRef or empty glRef",
      );
      return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    gl.uniform2f(resLocRef.current, canvas.width, canvas.height);
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    glRef.current = canvas.getContext("webgl2");
    const gl = glRef.current;

    if (!gl) {
      console.error("Failed to init WebGL2 context");
      return;
    }

    // Set up shaders and program once
    const program = createWebGlProgram(gl, vertexShaderSrc, fragmentShaderSrc);

    if (!program) {
      console.error("Failed to create WebGL2 program");
      return;
    }
    gl.useProgram(program);

    // Set up VBO
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Pass the variables into the shader
    timeLocRef.current = gl.getUniformLocation(program, "time");
    resLocRef.current = gl.getUniformLocation(program, "resolution");

    window.addEventListener("resize", resizeCanvas);
    // Set initial canvas size
    resizeCanvas();

    function render(time: DOMHighResTimeStamp) {
      // @ts-ignore gl has already been checked for validity
      gl.uniform1f(timeLocRef.current, time * 0.001);
      // @ts-ignore
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

    return () => {
      gl.deleteProgram(program);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} {...props} />;
}
