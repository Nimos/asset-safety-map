import { getSolarSystemList, getSolarSystemInfo, SolarSystem, getSecurityStatusColor } from "./esi";

const CANVAS_ID = "mapcanvas";
const OVERLAY_ID = "mapoverlay";

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

const MIN_X = -508743946216136960;
const MIN_Y = -508743946216136960;
const MAX_X = 472860102256056640;
const MAX_Y = 472860102256056640;

const MAX_CONCURRENT_REQUESTS = 50;

async function init(): Promise<void> {
    const canvas: HTMLCanvasElement | null = <HTMLCanvasElement | null>document.getElementById(CANVAS_ID);
    const overlay: HTMLDivElement | null = <HTMLDivElement | null>document.getElementById(OVERLAY_ID);

    if (!canvas || !overlay) {
        console.error("Missing HTML structure");
        return;
    }

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const ctx = canvas.getContext("2d");

    const solarSystemList = await getSolarSystemList();
    
    let solarSystems: SolarSystem[] = [];

    overlay.innerText = `0 / ${solarSystemList.length}`;
    let count: number = 0;

    let requests = 0

    for (let solarSystemId of solarSystemList) {
        
        while (requests >= MAX_CONCURRENT_REQUESTS) {
            await _sleep(10);
        }

        requests += 1;

        getSolarSystemInfo(solarSystemId).then(info => {
            solarSystems.push(info);

            drawSolarSystem(info);
            
            overlay.innerText = `${++count} / ${solarSystemList.length}`;
        }).finally(() => {
            requests -= 1;
        })
    }

    function drawSolarSystem(solarSystem: SolarSystem) {
        if (!ctx) return;


        let coordinates = convertCoordinate(solarSystem.position.x, solarSystem.position.z);

        ctx.fillStyle = getSecurityStatusColor(solarSystem.security_status);

        ctx.fillRect(coordinates[0] - 1, coordinates[1] - 1, 2, 2)
    }

    function convertCoordinate(x: number, y: number): number[] {
        const rangeX = MAX_X - MIN_X;
        const rangeY = MAX_Y - MIN_Y;
        
        const cwidth = CANVAS_WIDTH * 0.8;
        const cheight = CANVAS_HEIGHT * 0.8;
        
        x = ((x + rangeX/2) / rangeX) * cheight + CANVAS_HEIGHT * 0.1 + (CANVAS_WIDTH - CANVAS_HEIGHT) / 2; 
        y = cheight - ((y + rangeY/2) / rangeY) * cheight + CANVAS_HEIGHT * 0.1;
        
        return [x, y];
      }    

}

async function _sleep(miliseconds: number) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, miliseconds)
    })
}



setTimeout(init, 100);