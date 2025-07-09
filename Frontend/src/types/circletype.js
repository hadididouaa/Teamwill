// src/types/circletype.js

class CircleType {
  constructor(element, splitter) {
    this.element = element;
    this.splitter = splitter || ((text) => text.split(''));  // Default splitter if not provided
  }

  radius(value) {
    if (value !== undefined) {
      // Set radius value
      this._radius = value;
      return this;
    }
    return this._radius; // Return radius value if no argument is provided
  }

  dir(value) {
    if (value !== undefined) {
      // Set direction value
      this._dir = value;
      return this;
    }
    return this._dir; // Return direction value if no argument is provided
  }

  forceWidth(value) {
    if (value !== undefined) {
      // Set forceWidth value
      this._forceWidth = value;
      return this;
    }
    return this._forceWidth; // Return forceWidth value if no argument is provided
  }

  forceHeight(value) {
    if (value !== undefined) {
      // Set forceHeight value
      this._forceHeight = value;
      return this;
    }
    return this._forceHeight; // Return forceHeight value if no argument is provided
  }

  refresh() {
    // Logic to refresh
    return this;
  }

  destroy() {
    // Logic to destroy
    return this;
  }
}

module.exports = CircleType;
