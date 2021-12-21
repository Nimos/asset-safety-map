const CACHE_PREFIX = "esi-";
const ESI_BASE = "https://esi.evetech.net";
const ESI_SOLAR_SYSTEMS_LIST = "/v1/universe/systems/";
const ESI_SOLAR_SYSTEMS_INFO = "/v4/universe/systems/";

export interface SolarSystem {
    system_id: number;
    name: string;
    position: {
        x: number,
        y: number,
        z: number
    },
    security_status: number
}

export async function getSolarSystemList(): Promise<number[]> {
    let systems = await esiRequest(ESI_SOLAR_SYSTEMS_LIST);
    return systems;
}

export async function getSolarSystemInfo(solarSystemId: number): Promise<SolarSystem> {
    const url = ESI_SOLAR_SYSTEMS_INFO + solarSystemId;
    console.log(url);
    let systemInfo = await esiRequest(url);

    return systemInfo;
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
