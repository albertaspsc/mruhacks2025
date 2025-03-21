"use client";

import { useEffect, useRef, useCallback } from "react";
import fragmentShaderSrc from "./fragmentShader.glsl";
import vertexShaderSrc from "./vertexShader.glsl";

const quad = new Float32Array([-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]);

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vertexShaderSrc, fragmentShaderSrc) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSrc,
  );

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
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const programRef = useRef(null);
  const timeLocRef = useRef(null);
  const resLocRef = useRef(null);

  // Resize handling with debounce
  const resizeCanvas = useCallback(() => {
    if (!canvasRef.current || !glRef.current) return;
    const canvas = canvasRef.current;
    const gl = glRef.current;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Update resolution uniform
    gl.uniform2f(resLocRef.current, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = (glRef.current ||= canvas?.getContext("webgl2"));

    if (!gl) {
      console.error("Failed to init WebGL2 context");
      return;
    }

    // Set up shaders and program once
    const program = (programRef.current ||= createProgram(
      gl,
      vertexShaderSrc,
      fragmentShaderSrc,
    ));

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

    // Uniform locations
    timeLocRef.current = gl.getUniformLocation(program, "time");
    resLocRef.current = gl.getUniformLocation(program, "resolution");

    resizeCanvas(); // Set initial canvas size

    function render(time) {
      gl.uniform1f(timeLocRef.current, time * 0.001);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

    return () => {
      gl.deleteProgram(program);
    };
  }, [resizeCanvas]);

  return <canvas ref={canvasRef} {...props} />;
}
