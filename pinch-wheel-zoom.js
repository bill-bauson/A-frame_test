AFRAME.registerComponent('pinch-wheel-zoom', {
  schema: {
    minFov: { default: 30 },
    maxFov: { default: 100 },
    wheelSensitivity: { default: 0.05 },
    pinchSensitivity: { default: 0.15 }
  },

  init: function () {
    this.camera = this.el.getObject3D('camera');
    this.fov = this.camera.fov;

    this.startPinchDistance = null;

    this.onWheel = this.onWheel.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);

    window.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('touchstart', this.onTouchStart, { passive: false });
    window.addEventListener('touchmove', this.onTouchMove, { passive: false });
    window.addEventListener('touchend', this.onTouchEnd);
  },

  remove: function () {
    window.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);
  },

  setFov: function (fov) {
    fov = Math.max(this.data.minFov, Math.min(this.data.maxFov, fov));
    this.camera.fov = fov;
    this.camera.updateProjectionMatrix();
    this.fov = fov;
  },

  /* Mouse wheel zoom */
  onWheel: function (e) {
    e.preventDefault();
    this.setFov(this.fov + e.deltaY * this.data.wheelSensitivity);
  },

  /* Touch pinch zoom */
  onTouchStart: function (e) {
    if (e.touches.length === 2) {
      this.startPinchDistance = this.getDistance(e.touches[0], e.touches[1]);
    }
  },

  onTouchMove: function (e) {
    if (e.touches.length === 2 && this.startPinchDistance) {
      e.preventDefault();
      const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
      const delta = this.startPinchDistance - currentDistance;
      this.setFov(this.fov + delta * this.data.pinchSensitivity);
      this.startPinchDistance = currentDistance;
    }
  },

  onTouchEnd: function () {
    this.startPinchDistance = null;
  },

  getDistance: function (t1, t2) {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
});
