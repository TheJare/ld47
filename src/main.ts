import View from "./view";

export class Game {
  private view: View;

  private prevTime: number;

  constructor(id: string) {
    const canvasBox = <HTMLCanvasElement>document.getElementById(id);
    this.view = new View(canvasBox);

    window.addEventListener("resize", this.resize);
    this.prevTime = 0;
    this.update(0);
  }

  private resize = (): void => {
    this.view.onWindowResize(window.innerWidth, window.innerHeight);
  }

  private update = (t: number): void => {
    const dt = (t - this.prevTime);
    if (dt >= 15)
    {
      this.view.update(dt / 1000);
      this.prevTime = t;
    }
    requestAnimationFrame(this.update);
  }
}

// when the page is loaded, create our game instance
window.addEventListener("load", () => {
  const game = new Game("canvas");
});