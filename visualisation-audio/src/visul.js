import * as BABYLON from "@babylonjs/core";

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

let audioData = new Array(60).fill(128);

let audioContext = null;
let analyser = null;
let frequencyData = new Uint8Array(60);

// Setup audio with Web Audio API
let audioSource = null;
let audioBuffer = null;
const audioURL = "./sailor_moeteke_fuku.mp3";

window.addEventListener("load", () => {
  console.log("Page loaded, setting up controls...");
  
  const playBtn = document.getElementById("playBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const volumeControl = document.getElementById("volumeControl");
  const volumeLabel = document.getElementById("volumeLabel");
  
  if (playBtn) {
    playBtn.addEventListener("click", () => {
      console.log("Play button clicked");
      
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        console.log("AudioContext created");
        
        // Fetch and decode audio file once
        fetch(audioURL)
          .then(response => response.arrayBuffer())
          .then(arrayBuffer => {
            console.log("Audio file loaded, decoding...");
            audioContext.decodeAudioData(arrayBuffer, (decodedBuffer) => {
              audioBuffer = decodedBuffer;
              console.log("Audio decoded successfully");
              playAudio();
            });
          })
          .catch(error => {
            console.error("Error loading/decoding audio:", error);
          });
      } else if (audioBuffer) {
        // If context already exists, just play
        playAudio();
      }
    });
  }
  
  function playAudio() {
    // Stop previous source if any
    if (audioSource) {
      try {
        audioSource.stop();
      } catch (e) {
        console.log("Source already stopped");
      }
    }
    
    // Create new source and play
    audioSource = audioContext.createBufferSource();
    audioSource.buffer = audioBuffer;
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
    audioSource.start(0);
    console.log("Audio playing");
    
    // Update audioData continuously
    function extractData() {
      analyser.getByteFrequencyData(frequencyData);
      audioData = Array.from(frequencyData).slice(0, 60);
      const max = Math.max(...audioData);
      if (max > 30) console.log("Audio data detected, max:", max);
      requestAnimationFrame(extractData);
    }
    extractData();
  }
  
  if (pauseBtn) {
    pauseBtn.addEventListener("click", () => {
      if (audioSource) {
        try {
          audioSource.stop();
          console.log("Audio stopped");
        } catch (e) {
          console.log("Source already stopped");
        }
      }
    });
  }
  
  if (volumeControl) {
    volumeControl.addEventListener("input", (e) => {
      const volume = e.target.value;
      volumeLabel.textContent = volume + "%";
      if (analyser) {
        // Volume control via analyser gain would require a GainNode
        console.log("Volume set to:", volume);
      }
    });
  }
});

const createScene = function () {
  var scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.5, 0.5, 0.5);
  var camera = new BABYLON.ArcRotateCamera(
    "camera1",
    0,
    0,
    0,
    new BABYLON.Vector3(0, 0, -0),
    scene
  );
  camera.setPosition(new BABYLON.Vector3(0, 0, -100));
  camera.attachControl(canvas, true);
  var light = new BABYLON.HemisphericLight(
    "light1",
    new BABYLON.Vector3(1, 0.5, 0),
    scene
  );
  light.intensity = 0.7;
  var pl = new BABYLON.PointLight("pl", new BABYLON.Vector3(0, 0, 0), scene);
  pl.diffuse = new BABYLON.Color3(1, 1, 1);
  pl.specular = new BABYLON.Color3(1, 0, 0);
  pl.intensity = 0.95;
  var mat = new BABYLON.StandardMaterial("mat1", scene);
  mat.alpha = 1.0;
  mat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 1.0);
  mat.backFaceCulling = false;
  //mat.wireframe = true;

  // path function
  var pathFunction = function (k) {
    var path = [];
    for (var i = 0; i < 60; i++) {
      var x = i - 30;
      var y = 0;
      var z = k;
      path.push(new BABYLON.Vector3(x, y, z));
    }
    return path;
  };

  // update path function
  var updatePath = function (path, k) {
    for (var i = 0; i < path.length; i++) {
      var x = path[i].x;
      var z = path[i].z;
      var audioValue = audioData[i % audioData.length] / 128 - 1; // Normalize to -1 to 1
      var y =    10*   Math.sin(audioValue) ;
      path[i].x = x;
      path[i].y = y;
      path[i].z = z;
    }
  };

  // ribbon creation
  var sideO = BABYLON.Mesh.BACKSIDE;
  var pathArray = [];
  for (var i = -20; i < 20; i++) {
    pathArray.push(pathFunction(i * 2));
  }
  var mesh = BABYLON.Mesh.CreateRibbon(
    "ribbon",
    pathArray,
    false,
    false,
    0,
    scene,
    true,
    sideO
  );
  mesh.material = mat;

  // morphing
  var k = 0;
  scene.registerBeforeRender(function () {
    // update pathArray
    for (var p = 0; p < pathArray.length; p++) {
      updatePath(pathArray[p], k);
    }
    // ribbon update
    mesh = BABYLON.Mesh.CreateRibbon(
      null,
      pathArray,
      null,
      null,
      null,
      null,
      null,
      null,
      mesh
    );
    k += 0.05;
    pl.position = camera.position;
  });

  return scene;
};
const scene = createScene();
engine.runRenderLoop(function () {
  scene.render();
});
window.addEventListener("resize", function () {
  engine.resize();
});
