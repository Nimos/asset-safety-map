var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const CACHE_PREFIX = "esi-";
    const ESI_BASE = "https://esi.evetech.net";
    const ESI_SOLAR_SYSTEMS_LIST = "/v1/universe/systems/";
    const ESI_SOLAR_SYSTEMS_INFO = "/v4/universe/systems/";
    function getSolarSystemList() {
        return __awaiter(this, void 0, void 0, function* () {
            let systems = yield esiRequest(ESI_SOLAR_SYSTEMS_LIST);
            return systems;
        });
    }
    exports.getSolarSystemList = getSolarSystemList;
    function getSolarSystemInfo(solarSystemId) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = ESI_SOLAR_SYSTEMS_INFO + solarSystemId;
            console.log(url);
            let systemInfo = yield esiRequest(url);
            return systemInfo;
        });
    }
    exports.getSolarSystemInfo = getSolarSystemInfo;
    function esiRequest(route) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield fetch(ESI_BASE + route);
            let result = yield response.json();
            return result;
        });
    }
});
