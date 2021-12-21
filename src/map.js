var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define("esi", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const CACHE_PREFIX = "esi-";
    const ESI_BASE = "https://esi.evetech.net";
    const ESI_SOLAR_SYSTEMS = "/v1/universe/systems/";
    function getSolarSystemList() {
        return __awaiter(this, void 0, void 0, function* () {
            let systems = yield esiRequest(ESI_SOLAR_SYSTEMS);
            return systems;
        });
    }
    exports.getSolarSystemList = getSolarSystemList;
    function getSolarSystemInfo(solarSystemId) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${ESI_SOLAR_SYSTEMS}/${solarSystemId}/`;
            let systemInfo = yield esiRequest(url);
            return systemInfo;
        });
    }
    exports.getSolarSystemInfo = getSolarSystemInfo;
    function esiRequest(route) {
        return __awaiter(this, void 0, void 0, function* () {
            let cached = window.localStorage.getItem(CACHE_PREFIX + route);
            if (cached !== null) {
                let cachedObj = JSON.parse(cached);
                if (cachedObj.expiresAt < (new Date()).getTime()) {
                    return cachedObj.data;
                }
            }
            let response = yield fetch(ESI_BASE + route);
            let result = yield response.json();
            let expires = response.headers.get('expires');
            let expiresAt;
            if (!expires) {
                expiresAt = new Date(0).getTime();
            }
            else {
                expiresAt = new Date(expires).getTime();
            }
            let cachedObj = {
                data: result,
                expiresAt: expiresAt
            };
            window.localStorage.setItem(CACHE_PREFIX + route, JSON.stringify(cachedObj));
            return result;
        });
    }
});
define("map", ["require", "exports", "esi"], function (require, exports, esi_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const CANVAS_ID = "mapcanvas";
    const OVERLAY_ID = "mapoverlay";
    function init() {
        return __awaiter(this, void 0, void 0, function* () {
            const canvas = document.getElementById(CANVAS_ID);
            const overlay = document.getElementById(OVERLAY_ID);
            if (!canvas || !overlay) {
                console.error("Missing HTML structure");
                return;
            }
            const solarSystemList = yield esi_1.getSolarSystemList();
            let solarSystems = [];
            overlay.innerText = `0 / ${solarSystemList.length}`;
            let count = 0;
            for (let solarSystemId of solarSystemList) {
                let info = yield esi_1.getSolarSystemInfo(solarSystemId);
                solarSystems.push(info);
                overlay.innerText = `${++count} / ${solarSystemList.length}`;
            }
        });
    }
});
