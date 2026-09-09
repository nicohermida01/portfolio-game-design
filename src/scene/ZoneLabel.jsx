import { Billboard, Text } from "@react-three/drei";

// Floating text that always faces the fixed camera. Used for zone titles and
// the otherwise-unrendered POINT labels.
export default function ZoneLabel({ position, label }) {
  return (
    <Billboard position={position}>
      <Text
        fontSize={0.8}
        color="#ffffff"
        outlineWidth={0.04}
        outlineColor="#000000"
      >
        {label.toUpperCase()}
      </Text>
    </Billboard>
  );
}
