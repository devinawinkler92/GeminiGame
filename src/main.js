import * as THREE from 'three';

// --- Scene Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Player position will be managed manually

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// --- Lights ---
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

// --- Environment (Voxel Room) ---
const roomSize = 20;
const boxGeometry = new THREE.BoxGeometry(roomSize, roomSize, roomSize);
const boxMaterial = new THREE.MeshPhongMaterial({
    color: 0x808080,
    side: THREE.BackSide, // Inside of the box
});
const room = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(room);

// Add some "voxels" inside for reference
for (let i = 0; i < 50; i++) {
    const size = Math.random() * 2 + 0.5;
    const geom = new THREE.BoxGeometry(size, size, size);
    const mat = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff });
    const voxel = new THREE.Mesh(geom, mat);
    voxel.position.set(
        (Math.random() - 0.5) * (roomSize - 2),
        (Math.random() - 0.5) * (roomSize - 2),
        (Math.random() - 0.5) * (roomSize - 2)
    );
    scene.add(voxel);
}

// --- Player State ---
const player = {
    position: new THREE.Vector3(0, -roomSize / 2 + 0.5, 0),
    velocity: new THREE.Vector3(),
    // bodyQuaternion represents the orientation of the "floor"
    bodyQuaternion: new THREE.Quaternion(),
    // lookRotation represents yaw (y) and pitch (x) relative to bodyQuaternion
    lookRotation: new THREE.Euler(0, 0, 0, 'YXZ'),
    height: 1.6,
    isGrounded: false,
    isLeaping: false,
    leapTargetQuaternion: new THREE.Quaternion(),
    leapStartQuaternion: new THREE.Quaternion(),
    leapStartTime: 0,
    leapDuration: 0.3,
};

// --- Input Handling ---
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    handleGravityLeap(e.code);
});
document.addEventListener('keyup', (e) => keys[e.code] = false);

function handleGravityLeap(code) {
    if (keys['ShiftLeft'] || keys['ShiftRight']) {
        if (keys['Space']) {
            let rotationAxis = null;
            let angle = 0;

            if (code === 'KeyW') {
                // Pitch forward 90 degrees
                rotationAxis = new THREE.Vector3(1, 0, 0);
                angle = Math.PI / 2;
            } else if (code === 'KeyS') {
                // Flip backward 180 degrees
                rotationAxis = new THREE.Vector3(1, 0, 0);
                angle = Math.PI;
            } else if (code === 'KeyA') {
                // Roll left 90 degrees
                rotationAxis = new THREE.Vector3(0, 0, 1);
                angle = Math.PI / 2;
            } else if (code === 'KeyD') {
                // Roll right 90 degrees
                rotationAxis = new THREE.Vector3(0, 0, 1);
                angle = -Math.PI / 2;
            }

            if (rotationAxis) {
                initiateLeap(rotationAxis, angle);
            }
        }
    }
}

function initiateLeap(axis, angle) {
    player.isLeaping = true;
    player.leapStartTime = performance.now();
    player.leapStartQuaternion.copy(player.bodyQuaternion);

    // Calculate target quaternion by rotating current body orientation
    const leapRotation = new THREE.Quaternion().setFromAxisAngle(axis, angle);
    player.leapTargetQuaternion.copy(player.bodyQuaternion).multiply(leapRotation).normalize();

    // Apply upward leap force (using old basis for initial jump direction)
    const upVector = new THREE.Vector3(0, 1, 0).applyQuaternion(player.bodyQuaternion);
    player.velocity.addScaledVector(upVector, 10);
    player.isGrounded = false;

    // Update body quaternion instantly for physics
    player.bodyQuaternion.copy(player.leapTargetQuaternion);
}

// Current visual orientation of the player's body (for smoothing)
let visualBodyQuaternion = new THREE.Quaternion();

const instructions = document.getElementById('instructions');
const mouseSensitivity = 0.002;

document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === document.body) {
        player.lookRotation.y -= e.movementX * mouseSensitivity;
        player.lookRotation.x -= e.movementY * mouseSensitivity;

        // Clamp pitch
        player.lookRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, player.lookRotation.x));
    }
});

instructions.addEventListener('click', () => {
    document.body.requestPointerLock();
});

document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === document.body) {
        instructions.style.display = 'none';
    } else {
        instructions.style.display = 'block';
    }
});

const moveSpeed = 5;
const gravityForce = 20;

// --- Main Loop ---
let lastTime = performance.now();
function animate() {
    requestAnimationFrame(animate);
    const time = performance.now();
    let delta = (time - lastTime) / 1000;
    lastTime = time;

    if (delta > 0.1) delta = 0.1; // Cap delta to avoid huge jumps

    // --- Movement Physics ---
    const moveDir = new THREE.Vector3(0, 0, 0);
    if (keys['KeyW']) moveDir.z -= 1;
    if (keys['KeyS']) moveDir.z += 1;
    if (keys['KeyA']) moveDir.x -= 1;
    if (keys['KeyD']) moveDir.x += 1;
    moveDir.normalize();

    // Rotate moveDir to align with body orientation and yaw
    const yawQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), player.lookRotation.y);
    const combinedMoveQuaternion = new THREE.Quaternion().copy(player.bodyQuaternion).multiply(yawQuaternion);
    moveDir.applyQuaternion(combinedMoveQuaternion);

    // Apply movement
    player.position.addScaledVector(moveDir, moveSpeed * delta);

    // Apply gravity
    const downVector = new THREE.Vector3(0, -1, 0).applyQuaternion(player.bodyQuaternion);
    if (!player.isGrounded) {
        player.velocity.addScaledVector(downVector, gravityForce * delta);
    } else {
        player.velocity.set(0, 0, 0);
    }
    player.position.addScaledVector(player.velocity, delta);

    // --- Collision Detection (Room bounds) ---
    const halfRoom = roomSize / 2;
    const margin = 0.5;
    player.isGrounded = false;

    // Check bottom collision relative to body orientation
    // For simplicity in this prototype, we'll just use world bounds for the room
    if (player.position.y <= -halfRoom + margin) {
        if (player.bodyQuaternion.equals(new THREE.Quaternion(0, 0, 0, 1))) {
            player.position.y = -halfRoom + margin;
            player.isGrounded = true;
        }
    }
    // More robust grounding: check distance to the "floor" plane defined by bodyQuaternion
    const localPos = player.position.clone().applyQuaternion(player.bodyQuaternion.clone().invert());
    if (localPos.y <= -halfRoom + margin) {
        localPos.y = -halfRoom + margin;
        player.position.copy(localPos.applyQuaternion(player.bodyQuaternion));
        player.isGrounded = true;
    }
    // Ceiling
    if (localPos.y >= halfRoom - margin) {
        localPos.y = halfRoom - margin;
        player.position.copy(localPos.applyQuaternion(player.bodyQuaternion));
    }
    // Walls
    if (localPos.x <= -halfRoom + margin) localPos.x = -halfRoom + margin;
    if (localPos.x >= halfRoom - margin) localPos.x = halfRoom - margin;
    if (localPos.z <= -halfRoom + margin) localPos.z = -halfRoom + margin;
    if (localPos.z >= halfRoom - margin) localPos.z = halfRoom - margin;
    player.position.copy(localPos.applyQuaternion(player.bodyQuaternion));

    // --- Camera Smoothing ---
    if (player.isLeaping) {
        const elapsed = (time - player.leapStartTime) / 1000;
        const t = Math.min(elapsed / player.leapDuration, 1);

        // Slerp from start to target
        visualBodyQuaternion.copy(player.leapStartQuaternion).slerp(player.leapTargetQuaternion, t);

        if (t >= 1) {
            player.isLeaping = false;
        }
    } else {
        visualBodyQuaternion.copy(player.bodyQuaternion);
    }

    // Update camera orientation
    const lookQuaternion = new THREE.Quaternion().setFromEuler(player.lookRotation);
    camera.quaternion.copy(visualBodyQuaternion).multiply(lookQuaternion);

    // Update camera position to follow player position (accounting for eye level)
    // We use visualBodyQuaternion for position smoothing as well if desired,
    // but typically camera position should stay pinned to the physics-accurate head position.
    // However, the prompt mentions "re-orient the viewport", suggesting visual smoothness.
    const upOffset = new THREE.Vector3(0, player.height, 0).applyQuaternion(visualBodyQuaternion);
    camera.position.copy(player.position).add(upOffset);

    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
