import Game from "./game";

export class App {
  private game: Game;

  private prevTime: number;
  private usingTouch: boolean = false;

  constructor(id: string) {
    const canvasBox = <HTMLCanvasElement>document.getElementById(id);
    this.game = new Game(canvasBox);

    window.addEventListener("resize", this.resize);

    canvasBox.addEventListener('mousedown', (e) => { if (!this.usingTouch) this.click(e.clientX, e.clientY); e.preventDefault() });
    canvasBox.addEventListener('mouseup', (e) => { if (!this.usingTouch) this.mousemove(e.clientX, e.clientY); e.preventDefault() });
    canvasBox.addEventListener('mousemove', (e) => { if (!this.usingTouch) this.mousemove(e.clientX, e.clientY); e.preventDefault() });
    // Everything would be nicer with pointer events, thanks Apple.
    canvasBox.addEventListener('touchstart', (e) => { this.usingTouch = true; this.click(e.changedTouches[0].clientX, e.changedTouches[0].clientY); e.preventDefault() });
    canvasBox.addEventListener('touchend', (e) => { this.usingTouch = true; this.mousemove(e.changedTouches[0].clientX, e.changedTouches[0].clientY); e.preventDefault() });
    canvasBox.addEventListener('touchmove', (e) => { this.usingTouch = true; this.mousemove(e.changedTouches[0].clientX, e.changedTouches[0].clientY); e.preventDefault() });

    this.prevTime = 0;
    this.update(0);
  }

  private resize = (): void => {
    this.game.onWindowResize(window.innerWidth, window.innerHeight);
  }

  private mousemove = (x: number, y: number): void => {
    this.game.onMouseMove(x, y);
  }

  private click = (x: number, y: number): void => {
    this.game.onClick(x, y);
  }

  private update = (t: number): void => {
    const dt = (t - this.prevTime);
    if (dt >= 15)
    {
      this.game.update(dt / 1000);
      this.prevTime = t;
    }
    requestAnimationFrame(this.update);
  }
}

// when the page is loaded, create our game instance
window.addEventListener("load", () => {
  const app = new App("canvas");
});