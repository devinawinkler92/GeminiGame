# Architectural Specification: The Tesseract-Dyson Nexus (Rev 5.0)

## 1. Executive Summary
The Gemverse Nexus Hub serves as the primary cryptographic, social, and network architectural anchor for the distributed peer-to-peer (P2P) simulation. The world layout uses a nested cube framework built outward from the absolute coordinate origin (0,0,0).

A defining feature of the simulation's physics engine is the complete absence of systemic or zone-enforced gravity forces. Gravity is entirely subjective, decentralized, and manually operationalized by each individual player client. Traversal through structural openings in the 11-block thick Dyson Hull requires manual synchronization of the player's personal gravity vector to safely land on the interior or exterior platforms.

```
                  [ CELESTIAL SKYBOX MENU HORIZON ] (Deep Space Menu Layer)
                                  │
   ┌──────────────────────────────┴──────────────────────────────┐
   │    CLAN CITADEL PLATFORMS (Exterior Surface: 111x111x111)    │
   │    ▲ USER-DEFINED GRAVITY ALIGNMENT                         │
   │  ┌───────────────────────────┴───────────────────────────┐  │
   │  │  DYSON HULL SUB-STRUCTURE (11-Block Thick Basements)  │  │
   │  │  ║ [ ] HULL OPENING     (Manual Vector Alignment Required)║  │
   │  │  ┌────────────────────────┴────────────────────────┐  │  │
   │  │  │ DYSON INTERIOR VOID (Logistics Floor: 100x100x100)│  │  │
   │  │  │ ▼ USER-DEFINED GRAVITY ALIGNMENT               │  │  │  │
   │  │  │  │                                           │  │  │  │
   │  │  │  │     ▲ LOOKING UP SEES TESSERACT CORE ▲    │  │  │  │
   │  │  │  │  ┌──────────────────┴──────────────────┐  │  │  │  │
   │  │  │  │  │  TESSERACT CORE (Spawn Box: 50x50x50)│  │  │  │  │
   │  │  │  │  │               (0,0,0)               │  │  │  │  │
   │  │  │  │  └─────────────────────────────────────┘  │  │  │  │
   │  │  └─────────────────────────────────────────────────┘  │  │
   │  └───────────────────────────────────────────────────────┘  │
   └─────────────────────────────────────────────────────────────┘
```

## 2. Spatial Scale Definitions

### 2.1 The Tesseract Core (Size: 50x50x50 Blocks | Radius: $0 \le r \le 25$)
* **Incubation Core:** Suspended perfectly at the absolute center point of the global hub void. Handles local identity validation and initial spawn arrays completely offline.
* **Manual PvP Matrix:** Serves as the primary arena for high-speed directional gravity combat, where players instantly scale walls or ceilings by manually binding their local down-vectors to various face planes.

### 2.2 The Dyson Interior Void (Size: 100x100x100 Space | Radius: $26 \le r \le 50$)
* **The Structural Void:** A massive open airspace inside the sphere. When standing on the internal deck floor, players orient their personal gravity vectors outward, letting them walk along the interior hull faces while looking "up" across the void to see the floating Tesseract Core infrastructure.
* **Logistics Engine:** Floor surfaces house Activation Beacons, multiplayer queue arrays, and network topology diagnostic nodes.

### 2.3 The Dyson Hull & Hull Openings (Thickness: 11 Blocks | Radius: $51 \le r \le 55$)
* **Sub-Floor Framework:** An 11-block thick shell partition dedicated to player engineering, hidden basements, storage vaults, and custom routing networks.
* **Kinetic Traversal Openings:** Simple structural voids are carved through this 11-block depth. They possess no intrinsic atmospheric or gravitational modifiers. Players must navigate these shafts via momentum and manual vector adjustments.

### 2.4 Clan Citadel Platforms (Size: 111x111x111 Exterior Face | Radius: $56+$)
* **Exterior Shell Foundries:** The outer face of the 11-block hull where clans build outward-facing, open-air fortresses.
* **Subjective Grounding:** To navigate this zone without drifting out into the cosmic horizon, players manually align their down-vector inward toward the center of the Dyson hull, pinning them safely to the outer deck plates.

## 3. Decentralized Gravity Mechanics

Instead of the engine imposing an environment-wide downward acceleration vector, each client thread independently calculates structural movement based on an active player state variable:

$$\vec{g}_{\text{player}} = 9.8 \cdot \hat{u}_{\text{player}}$$

*Where $\hat{u}_{\text{player}}$ is a real-time, user-mutated unit directional vector assigned via client-side input updates. The simulation engine maps voxel collisions based on this local orientation matrix, allowing multiple players to navigate the exact same layout surface from entirely inverted physical frameworks simultaneously.*
