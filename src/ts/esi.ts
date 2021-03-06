const CACHE_PREFIX = "esi-";
const ESI_BASE = "https://esi.evetech.net";
const ESI_SOLAR_SYSTEMS_LIST = "/v1/universe/systems/";
const ESI_SOLAR_SYSTEMS_INFO = "/v4/universe/systems/";
const ESI_CONSTELLATIONS_INFO = "/v1/universe/constellations/";


const SECURITY_COLORS = [
    "#2FEFEF",
    "#48F0C0",
    "#00EF47",
    "#00F000",
    "#8FEF2F",
    "#EFEF00",
    "#D77700",
    "#F06000",
    "#F04800",
    "#D73000",
    "#F00000"
].reverse()

export interface SolarSystem {
    system_id: number;
    name: string;
    position: {
        x: number,
        y: number,
        z: number
    };
    security_status: number;
    stations: number[];
    stargates: number[];
    constellation_id: number;
}

export interface Constellation {
    region_id: number;
}

export async function getSolarSystemList(): Promise<number[]> {
    let systems = await esiRequest(ESI_SOLAR_SYSTEMS_LIST);
    return systems;
}

export async function getSolarSystemInfo(solarSystemId: number): Promise<SolarSystem> {
    const url = ESI_SOLAR_SYSTEMS_INFO + solarSystemId;
    let systemInfo = await esiRequest(url);

    return systemInfo;
}

export async function getConstellation(solarSystem: SolarSystem): Promise<Constellation> {
    const url = ESI_CONSTELLATIONS_INFO + solarSystem.constellation_id;
    let constellation = await esiRequest(url)
    
    return constellation;
}

export function getSecurityStatusColor(security: number) {
    security = Math.max(0, security);
    security = Math.floor(security * 10);

    return SECURITY_COLORS[security];
}


interface ESICache {
    data: any;
    expiresAt: number;
}

async function esiRequest(route: string) {
    let response = await fetch(ESI_BASE + route);
    let result = await response.json();

    return result;
}
