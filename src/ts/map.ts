import { getSolarSystemList, getSolarSystemInfo, SolarSystem, getSecurityStatusColor, getConstellation } from "./esi";

const CANVAS_ID = "mapcanvas";
const OVERLAY_ID = "mapoverlay";

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

const MIN_X = -508743946216136960;
const MIN_Y = -508743946216136960;
const MAX_X = 472860102256056640;
const MAX_Y = 472860102256056640;

const MAX_CONCURRENT_REQUESTS = 150;

const IGNORED_REGION_IDS = [10000070, 10000004];

const ASSET_SAFETY_COLORS = [
    "#F00",
    "#0F0",
    "#00F",
    "#FF0",
    "#F0F",
    "#0FF",
    "#F70",
    "#F07",
    "#70F",
    "#07F",
    "#7F0",
    "#0F7",
    "#FFF",
    "#F77",
    "#77F",
    "#F7F"
]

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
    let lowsecSystems: SolarSystem[] = [];
    let nullsecSystems: SolarSystem[] = [];

    overlay.innerText = `0 / ${solarSystemList.length}`;
    let count: number = 0;

    let requests = 0

    for (let solarSystemId of solarSystemList) {
        
        while (requests >= MAX_CONCURRENT_REQUESTS) {
            await _sleep(5);
        }

        requests += 1;

        getSolarSystemInfo(solarSystemId).then(async info => {
            solarSystems.push(info);

            drawSolarSystem(info, "#777");
            overlay.innerText = `${++count} / ${solarSystemList.length}`;

            let constellation = await getConstellation(info);

            if (info.security_status < 0 && info.stargates.length > 0 && !IGNORED_REGION_IDS.includes(constellation.region_id)) {
                nullsecSystems.push(info);
            } else if (Math.round(info.security_status*10)/10 < 0.5 && info.stations.length > 0 && !IGNORED_REGION_IDS.includes(constellation.region_id)) {
                lowsecSystems.push(info);
            }
            
        }).finally(() => {
            requests -= 1;
        })
    }

    let systemColors: {[key: number]: string} = {};
    let systemBoundingBoxes: { [key: number]: { x1: number, z1: number, x2: number, z2: number } } = {};
    let nextColor = 0;


    for (let nullsecSystem of nullsecSystems) {
        let closest = findClosest(nullsecSystem, lowsecSystems);

        console.log(nullsecSystem.name, ">>>", closest.name)

        if (!systemColors[closest.system_id]) {
            systemColors[closest.system_id] = ASSET_SAFETY_COLORS[nextColor];
            nextColor = (nextColor + 1) % ASSET_SAFETY_COLORS.length;
        }

        if (!systemBoundingBoxes[closest.system_id]) {
            systemBoundingBoxes[closest.system_id] = {
                x1: nullsecSystem.position.x,
                x2: nullsecSystem.position.x,
                z1: nullsecSystem.position.z,
                z2: nullsecSystem.position.z
            }
        } else {
            systemBoundingBoxes[closest.system_id].x1 =
                Math.min(systemBoundingBoxes[closest.system_id].x1, nullsecSystem.position.x);
            
            systemBoundingBoxes[closest.system_id].x2 =
                Math.max(systemBoundingBoxes[closest.system_id].x2, nullsecSystem.position.x);
            
            systemBoundingBoxes[closest.system_id].z1 =
                Math.min(systemBoundingBoxes[closest.system_id].z1, nullsecSystem.position.z);
            
            systemBoundingBoxes[closest.system_id].z2 =
                Math.max(systemBoundingBoxes[closest.system_id].z2, nullsecSystem.position.z);
        }

        drawSolarSystem(nullsecSystem, systemColors[closest.system_id]);
    }

    for (let lowsecSystem of lowsecSystems) {
        if (systemBoundingBoxes[lowsecSystem.system_id]) {
            let box = systemBoundingBoxes[lowsecSystem.system_id];
            let center = convertCoordinate((box.x2 - box.x1)/2 + box.x1, (box.z2 - box.z1)/2 + box.z1);
            let textPos = [center[0] - ((CANVAS_WIDTH / 2) - center[0])/2, center[1] - ((CANVAS_HEIGHT / 2) - center[1])/2]

            if (!ctx) return;


            ctx.fillStyle = systemColors[lowsecSystem.system_id];
            ctx.strokeStyle  = systemColors[lowsecSystem.system_id];

            ctx.lineWidth = 1;
            ctx.font = '13px Sans-serif';

            ctx.beginPath();
            ctx.moveTo(textPos[0], textPos[1]);
            ctx.lineTo(center[0], center[1]);
            ctx.stroke();

            ctx.strokeStyle = "black";

            ctx.strokeText(lowsecSystem.name, textPos[0], textPos[1]);
            ctx.fillText(lowsecSystem.name, textPos[0], textPos[1]);
            console.log(lowsecSystem.name, center[0], center[1])
        }
    }

    function findClosest(needle: SolarSystem, haystack: SolarSystem[]): SolarSystem {
        let min = Infinity;
        let minSystem: SolarSystem = haystack[0];

        for (let system of haystack) {
            let distance = Math.sqrt(Math.pow(needle.position.x - system.position.x, 2)
                + Math.pow(needle.position.y - system.position.y, 2)
                + Math.pow(needle.position.z - system.position.z, 2));
            
            if (distance < min) {
                min = distance;
                minSystem = system;
            }
        }

        return minSystem;
    }

    function drawSolarSystem(solarSystem: SolarSystem, color: string | undefined = undefined) {
        if (!ctx) return;


        let coordinates = convertCoordinate(solarSystem.position.x, solarSystem.position.z);

        if (!color) {
            ctx.fillStyle = getSecurityStatusColor(solarSystem.security_status);
        } else {
            ctx.fillStyle = color;
        }

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