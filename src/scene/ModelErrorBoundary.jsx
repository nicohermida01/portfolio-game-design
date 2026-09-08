import { Component } from "react";

// A model that fails to load or parse would otherwise crash the whole canvas.
// This catches it, logs a hint, and shows the fallback instead.
export default class ModelErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error(
      "[Character] the model failed to load.\n" +
        "- Check `url` in src/character.js matches the file in public/models/\n" +
        "- A .gltf that references an external .bin needs that .bin next to it\n",
      error,
    );
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
