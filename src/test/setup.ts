import 'fake-indexeddb/auto';

// Mock full HTMLCanvasElement.getContext for 2D canvas in headless test environment
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = function (contextType: string) {
    if (contextType === '2d') {
      const dummyFn = () => {};
      return {
        clearRect: dummyFn,
        fillRect: dummyFn,
        strokeRect: dummyFn,
        drawImage: dummyFn,
        getImageData: () => ({ data: new Uint8ClampedArray(512 * 512 * 4) }),
        putImageData: dummyFn,
        setTransform: dummyFn,
        resetTransform: dummyFn,
        save: dummyFn,
        restore: dummyFn,
        beginPath: dummyFn,
        closePath: dummyFn,
        moveTo: dummyFn,
        lineTo: dummyFn,
        arc: dummyFn,
        arcTo: dummyFn,
        bezierCurveTo: dummyFn,
        quadraticCurveTo: dummyFn,
        stroke: dummyFn,
        fill: dummyFn,
        clip: dummyFn,
        scale: dummyFn,
        rotate: dummyFn,
        translate: dummyFn,
        transform: dummyFn,
        fillText: dummyFn,
        strokeText: dummyFn,
        measureText: () => ({ width: 100 }),
        createLinearGradient: () => ({ addColorStop: dummyFn }),
        createRadialGradient: () => ({ addColorStop: dummyFn }),
        createPattern: () => null,
      } as unknown as CanvasRenderingContext2D;
    }
    return null;
  } as any;
}
