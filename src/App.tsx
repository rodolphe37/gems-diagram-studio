import { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from "three/examples/jsm/Addons.js";

type TDiamondProps = {
  tableDiameter: number;
  tableHeight: number;
  crownHeight: number;
  pavilionHeight: number;
  tableFacets: number;
  crownFacets: number;
  pavilionFacets: number;
  visibility: {
    table: boolean;
    crown: boolean;
    pavilion: boolean;
  };
  pavilionDiameter: number;
};

const Diamond = ({
  tableDiameter,
  tableHeight,
  crownHeight,
  pavilionHeight,
  tableFacets,
  crownFacets,
  pavilionFacets,
  visibility,
  pavilionDiameter,
}: TDiamondProps) => {
  const tableHeightMM = tableHeight * 100;
  const crownHeightMM = crownHeight * 100;
  const pavilionHeightMM = pavilionHeight * 100;
  const tableDiameterMM = tableDiameter * 100;
  const pavilionDiameterMM = pavilionDiameter * 100;

  const pavilionPositionY = -crownHeightMM;
  const crownPositionY = pavilionPositionY + pavilionHeightMM / 2;
  const tablePositionY = crownPositionY + crownHeightMM;

  const blackWireframeMaterial = new THREE.LineBasicMaterial({
    color: "black",
    linewidth: 4,
  });

  // const pastelMaterial = new THREE.MeshStandardMaterial({
  //   color: new THREE.Color(0xfff),
  //   metalness: 0.5,
  //   roughness: 0.5,
  //   emissive: new THREE.Color(0.1, 0.1, 0.1),
  //   side: THREE.FrontSide,
  // });

  const getWireframe = (geometry: THREE.CylinderGeometry) => {
    const wireframe = new THREE.WireframeGeometry(geometry);
    return new THREE.LineSegments(wireframe, blackWireframeMaterial);
  };

  // Fonction pour dessiner la règle graduée autour de la couronne
  const createGraduations = (diameter: number) => {
    const radius = diameter / 2;
    const graduationGroup = new THREE.Group();
    const loader = new FontLoader();

    const angleStep = (2 * Math.PI) / 96;

    // Créer les graduations avec les numéros
    for (let i = 0; i < 96; i++) {
      if (i % 2 === 0) {
        const angle = -angleStep * i;  // Inverser l'angle pour le sens horaire
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);

        // Créer une graduation (ligne fine)
        const graduation = new THREE.Mesh(
          new THREE.CylinderGeometry(0.5, 0.5, 5, 12), // Petite ligne
          blackWireframeMaterial
        );
        graduation.position.set(x, crownHeightMM / 2, z);
        graduation.rotation.set(Math.PI / 2, 0, angle);
        graduationGroup.add(graduation);

        // Ajouter les numéros sur les graduations
        loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
          const textGeometry = new TextGeometry(`${i}`, { 
            font: font,
            size: 5,
            depth: 1,
          });

          const textMaterial = new THREE.MeshBasicMaterial({ color: "black" });
          const textMesh = new THREE.Mesh(textGeometry, textMaterial);

          let textRotation = Math.PI / 2;

          if (angle > Math.PI) {
            textRotation = -Math.PI / 2;
          }

          textMesh.position.set(x + 8, crownHeightMM / 2 + 8, z);
          textMesh.rotation.set(0, textRotation, 0);
          graduationGroup.add(textMesh);
        });
      }
    }

    return graduationGroup;
  };

  // Calcul du diamètre de la règle
  const ruleDiameterMM = pavilionDiameterMM * 1.2; // Règle plus large que la couronne

  return (
    <group>
      {/* Table */}
      {visibility.table && (
        <mesh
          position={[0, tablePositionY + tableHeightMM / 2, 0]}
          // material={pastelMaterial}
        >
          <cylinderGeometry
            args={[
              tableDiameterMM / 2,
              pavilionDiameterMM / 2,
              tableHeightMM,
              tableFacets,
            ]}
          />
          <primitive
            object={getWireframe(
              new THREE.CylinderGeometry(
                tableDiameterMM / 2,
                pavilionDiameterMM / 2,
                tableHeightMM,
                tableFacets
              )
            )}
          />
        </mesh>
      )}

      {/* Couronne */}
      {visibility.crown && (
        <mesh
          position={[0, crownPositionY + crownHeightMM / 2, 0]}
          // material={pastelMaterial}
        >
          <cylinderGeometry
            args={[
              pavilionDiameterMM / 2,
              pavilionDiameterMM / 2,
              crownHeightMM,
              crownFacets,
            ]}
          />
          <primitive
            object={getWireframe(
              new THREE.CylinderGeometry(
                pavilionDiameterMM / 2,
                pavilionDiameterMM / 2,
                crownHeightMM,
                crownFacets
              )
            )}
          />
        </mesh>
      )}

      {/* Pavillon */}
      {visibility.pavilion && (
        <mesh
          position={[0, pavilionPositionY, 0]}
          rotation={[Math.PI, 0, 0]}
          // material={pastelMaterial}
        >
          <coneGeometry
            args={[pavilionDiameterMM / 2, pavilionHeightMM, pavilionFacets]}
          />
          <primitive
            object={getWireframe(
              new THREE.ConeGeometry(
                pavilionDiameterMM / 2,
                pavilionHeightMM,
                pavilionFacets
              )
            )}
          />
        </mesh>
      )}

      {/* Règle graduée : maintenant elle est placée au niveau de la couronne */}
      <primitive
        object={createGraduations(ruleDiameterMM)}
        position={[0, crownHeightMM, 0]}  // Positionnée à la hauteur de la couronne
      />
    </group>
  );
};

const App = () => {
  const [view, setView] = useState<string>("global");
  const [tableHeight, setTableHeight] = useState<number>(0.13);
  const [crownHeight, setCrownHeight] = useState<number>(0.05);
  const [pavilionHeight, setPavilionHeight] = useState<number>(0.75);
  const [tableDiameter, setTableDiameter] = useState<number>(2);
  const [pavilionDiameter, setPavilionDiameter] = useState<number>(2);

  const [tableFacets, setTableFacets] = useState<number>(16);
  const [crownFacets, setCrownFacets] = useState<number>(16);
  const [pavilionFacets, setPavilionFacets] = useState<number>(16);

  const controlsRef = useRef(null!);

  const calculateAngle = (diameter: number, height: number) => {
    const diameterMM = diameter * 100;
    const heightMM = height * 100;
    return Math.atan(diameterMM / (2 * heightMM)) * (180 / Math.PI);
  };

  const tableAngle = calculateAngle(tableDiameter, tableHeight);
  const crownAngle = calculateAngle(pavilionDiameter, crownHeight);
  const pavilionAngle = calculateAngle(pavilionDiameter, pavilionHeight);

  useEffect(() => {
    const { current: controls } = controlsRef;
    if (controls) {
      switch (view) {
        case "top":
          controls.setAzimuthalAngle(Math.PI / 2);
          controls.setPolarAngle(Math.PI / 2);
          break;
        case "profile":
          controls.setAzimuthalAngle(0);
          controls.setPolarAngle(Math.PI / 3);
          break;
        case "bottom":
          controls.setAzimuthalAngle(Math.PI);
          controls.setPolarAngle(Math.PI / 2);
          break;
        case "global":
          controls.setAzimuthalAngle(Math.PI / 4);
          controls.setPolarAngle(Math.PI / 3);
          break;
        default:
          controls.setAzimuthalAngle(Math.PI / 2);
          controls.setPolarAngle(Math.PI / 2);
      }
    }
  }, [view]);

  const visibility = {
    table: view === "top" || view === "global",
    crown:
      view !== "top" &&
      (view === "top" || view === "profile" || view === "global"),
    pavilion: view === "profile" || view === "global" || view === "bottom",
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          color: "black",
          zIndex: 10,
        }}
      >
        <div>
          <strong>Inclinaison Table : </strong>
          {tableAngle.toFixed(2)}°
        </div>
        <div>
          <strong>Inclinaison Couronne : </strong>
          {crownAngle.toFixed(2)}°
        </div>
        <div>
          <strong>Inclinaison Pavillon : </strong>
          {pavilionAngle.toFixed(2)}°
        </div>
        <div>
          <strong>Nombre de facettes Table : </strong>
          {tableFacets}
        </div>
        <div>
          <strong>Nombre de facettes Couronne : </strong>
          {crownFacets}
        </div>
        <div>
          <strong>Nombre de facettes Pavillon : </strong>
          {pavilionFacets}
        </div>
      </div>

      <Canvas
        style={{ width: "100%", height: "100%" }}
        camera={{
          fov: 60,
          position: [0, 0, 240],
        }}
      >
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} intensity={0.8} />
        <OrbitControls ref={controlsRef} enableZoom={true} />
        <Diamond
          tableDiameter={tableDiameter}
          tableHeight={tableHeight}
          crownHeight={crownHeight}
          pavilionHeight={pavilionHeight}
          tableFacets={tableFacets}
          crownFacets={crownFacets}
          pavilionFacets={pavilionFacets}
          visibility={visibility}
          pavilionDiameter={pavilionDiameter}
        />
      </Canvas>

      {/* Contrôles pour changer de vue */}
      <div
        style={{ position: "absolute", top: "80px", left: "20px", zIndex: 90 }}
      >
        <button onClick={() => setView("top")}>Vue du haut</button>
        <button onClick={() => setView("profile")}>Vue de profil</button>
        <button onClick={() => setView("bottom")}>Vue du bas</button>
        <button onClick={() => setView("global")}>Vue globale</button>
      </div>

      {/* Contrôles pour ajuster la taille des différentes parties */}
      <div style={{ position: "absolute", bottom: "20px", left: "20px" }}>
        <label>Diamètre supérieur de la table (en mm) :</label>
        <input
          type="range"
          min="10"
          max={pavilionDiameter * 100}
          step="1"
          value={tableDiameter * 100}
          onChange={(e) => setTableDiameter(parseFloat(e.target.value) / 100)}
        />
        <span>{(tableDiameter * 100).toFixed(1)} mm</span>

        <br />

        <label>Diamètre du pavillon (en mm) :</label>
        <input
          type="range"
          min="10"
          max="3000"
          step="1"
          value={pavilionDiameter * 100}
          onChange={(e) =>
            setPavilionDiameter(parseFloat(e.target.value) / 100)
          }
        />
        <span>{(pavilionDiameter * 100).toFixed(1)} mm</span>

        <br />

        <label>Épaisseur de la table (en mm) :</label>
        <input
          type="range"
          min="1"
          max="100"
          step="1"
          value={tableHeight * 100}
          onChange={(e) => setTableHeight(parseFloat(e.target.value) / 100)}
        />
        <span>{(tableHeight * 100).toFixed(1)} mm</span>

        <br />

        <label>Hauteur de la couronne (en mm) :</label>
        <input
          type="range"
          min="1"
          max="100"
          step="1"
          value={crownHeight * 100}
          onChange={(e) => setCrownHeight(parseFloat(e.target.value) / 100)}
        />
        <span>{(crownHeight * 100).toFixed(1)} mm</span>

        <br />

        <label>Hauteur du pavillon (en mm) :</label>
        <input
          type="range"
          min="10"
          max="500"
          step="1"
          value={pavilionHeight * 100}
          onChange={(e) => setPavilionHeight(parseFloat(e.target.value) / 100)}
        />
        <span>{(pavilionHeight * 100).toFixed(1)} mm</span>

        <br />

        <label>Facettes de la table :</label>
        <input
          type="range"
          min="4"
          max="300"
          step="2"
          value={tableFacets}
          onChange={(e) => setTableFacets(parseInt(e.target.value))}
        />
        <span>{tableFacets}</span>

        <br />

        <label>Facettes de la couronne :</label>
        <input
          type="range"
          min="4"
          max="300"
          step="2"
          value={crownFacets}
          onChange={(e) => setCrownFacets(parseInt(e.target.value))}
        />
        <span>{crownFacets}</span>

        <br />

        <label>Facettes du pavillon :</label>
        <input
          type="range"
          min="4"
          max="300"
          step="2"
          value={pavilionFacets}
          onChange={(e) => setPavilionFacets(parseInt(e.target.value))}
        />
        <span>{pavilionFacets}</span>
      </div>
    </div>
  );
};

export default App;
