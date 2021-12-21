define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const CACHE_PREFIX = "esi-";
    const ESI_BASE = "https://esi.evetech.net";
    const ESI_SOLAR_SYSTEMS_LIST = "/v1/universe/systems/";
    const ESI_SOLAR_SYSTEMS_INFO = "/v4/universe/systems/";
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
    ].reverse();
    async function getSolarSystemList() {
        let systems = await esiRequest(ESI_SOLAR_SYSTEMS_LIST);
        return systems;
    }
    exports.getSolarSystemList = getSolarSystemList;
    async function getSolarSystemInfo(solarSystemId) {
        const url = ESI_SOLAR_SYSTEMS_INFO + solarSystemId;
        console.log(url);
        let systemInfo = await esiRequest(url);
        return systemInfo;
    }
    exports.getSolarSystemInfo = getSolarSystemInfo;
    function getSecurityStatusColor(security) {
        security = Math.max(0, security);
        security = Math.floor(security * 10);
        return SECURITY_COLORS[security];
    }
    exports.getSecurityStatusColor = getSecurityStatusColor;
    async function esiRequest(route) {
        let response = await fetch(ESI_BASE + route);
        let result = await response.json();
        return result;
    }
});
