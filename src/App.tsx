import { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

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
  tableDiameter, // Diamètre supérieur de la table
  tableHeight,
  crownHeight,
  pavilionHeight,
  tableFacets,
  crownFacets,
  pavilionFacets,
  visibility,
  pavilionDiameter, // Diamètre du pavillon, utilisé pour le diamètre inférieur de la table
}: TDiamondProps) => {
  const tableHeightMM = tableHeight * 100; // Convertir en mm
  const crownHeightMM = crownHeight * 100; // Convertir en mm
  const pavilionHeightMM = pavilionHeight * 100; // Convertir en mm
  const tableDiameterMM = tableDiameter * 100; // Diamètre supérieur de la table en mm
  const pavilionDiameterMM = pavilionDiameter * 100; // Diamètre du pavillon en mm

  const pavilionPositionY = -crownHeightMM; // Le pavillon reste toujours collé au bas de la couronne
  const crownPositionY = pavilionPositionY + pavilionHeightMM / 2;
  const tablePositionY = crownPositionY + crownHeightMM;

  // Matériau pour les lignes (trait noir épais)
  const blackWireframeMaterial = new THREE.LineBasicMaterial({
    color: "black",
    linewidth: 4, // Augmenter l'épaisseur des arêtes pour plus de visibilité
  });

  // Matériau pastel clair pour les facettes
  const pastelMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xfff), // Couleur pastel très clair (bleu clair très pâle)
    metalness: 0.5, // Donne un effet de brillance
    roughness: 0.5, // Ajuste la rugosité de la surface pour une lumière diffuse
    emissive: new THREE.Color(0.1, 0.1, 0.1), // Émission de lumière faible pour donner un effet doux
    side: THREE.FrontSide, // Applique le matériau sur la face avant
  });

  // Fonction pour créer un wireframe (trait de séparation uniquement)
  const getWireframe = (geometry: THREE.CylinderGeometry) => {
    const wireframe = new THREE.WireframeGeometry(geometry);
    return new THREE.LineSegments(wireframe, blackWireframeMaterial);
  };

  return (
    <group>
      {/* Table (partie supérieure) */}
      {visibility.table && (
        <mesh
          position={[0, tablePositionY + tableHeightMM / 2, 0]}
          material={pastelMaterial}
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
          material={pastelMaterial}
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
          material={pastelMaterial}
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
    </group>
  );
};

const App = () => {
  const [view, setView] = useState<string>("global"); // Vue par défaut: 'global'
  const [tableHeight, setTableHeight] = useState<number>(0.13);
  const [crownHeight, setCrownHeight] = useState<number>(0.05);
  const [pavilionHeight, setPavilionHeight] = useState<number>(0.75);
  const [tableDiameter, setTableDiameter] = useState<number>(2); // Diamètre supérieur de la table
  const [pavilionDiameter, setPavilionDiameter] = useState<number>(2); // Diamètre du pavillon

  // Nombre de facettes pour chaque partie
  const [tableFacets, setTableFacets] = useState<number>(16);
  const [crownFacets, setCrownFacets] = useState<number>(16);
  const [pavilionFacets, setPavilionFacets] = useState<number>(16);

  const controlsRef = useRef(null!);

  // Calculer les angles d'inclinaison pour chaque partie
  const calculateAngle = (diameter: number, height: number) => {
    const diameterMM = diameter * 100; // Convertir en mm
    const heightMM = height * 100; // Convertir en mm
    return Math.atan(diameterMM / (2 * heightMM)) * (180 / Math.PI); // Calcul en degrés
  };

  const tableAngle = calculateAngle(tableDiameter, tableHeight);
  const crownAngle = calculateAngle(pavilionDiameter, crownHeight);
  const pavilionAngle = calculateAngle(pavilionDiameter, pavilionHeight);

  // Mise à jour de la caméra à chaque changement de vue
  useEffect(() => {
    const { current: controls } = controlsRef;
    if (controls) {
      switch (view) {
        case "top":
          // @ts-expect-error: Should expect string
          controls.setAzimuthalAngle(Math.PI / 2); // Vue du haut
          // @ts-expect-error: Should expect string
          controls.setPolarAngle(Math.PI / 2);
          break;
        case "profile":
          // @ts-expect-error: Should expect string
          controls.setAzimuthalAngle(0); // Vue de profil
          // @ts-expect-error: Should expect string
          controls.setPolarAngle(Math.PI / 3);
          break;
        case "bottom":
          // @ts-expect-error: Should expect string
          controls.setAzimuthalAngle(Math.PI); // Vue du bas
          // @ts-expect-error: Should expect string
          controls.setPolarAngle(Math.PI / 2);
          break;
        case "global":
          // @ts-expect-error: Should expect string
          controls.setAzimuthalAngle(Math.PI / 4); // Vue globale
          // @ts-expect-error: Should expect string
          controls.setPolarAngle(Math.PI / 3);
          break;
        default:
          // @ts-expect-error: Should expect string
          controls.setAzimuthalAngle(Math.PI / 2);
          // @ts-expect-error: Should expect string
          controls.setPolarAngle(Math.PI / 2);
      }
    }
  }, [view]);

  // Déterminer la visibilité des différentes parties en fonction de la vue sélectionnée
  const visibility = {
    table: view === "top" || view === "global", // Table visible en vue globale et vue du haut
    crown:
      view !== "top" &&
      (view === "top" || view === "profile" || view === "global"), // Couronne visible sauf en vue du haut
    pavilion: view === "profile" || view === "global" || view === "bottom", // Pavillon visible en vue de profil, global et bas
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
      {/* Espace réservé en haut pour afficher l'inclinaison et le nombre de facettes */}
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
        style={{ width: "100%", height: "100%" }} // Canvas à 80% de la largeur et de la hauteur de l'écran
        camera={{
          fov: 60, // Augmenter le FOV pour dé-zoomer
          position: [0, 0, 240], // Déplacer la caméra plus loin pour un effet de dé-zoom
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
          pavilionDiameter={pavilionDiameter} // Le diamètre du pavillon est utilisé pour le diamètre inférieur de la table
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
