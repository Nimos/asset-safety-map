var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "./esi"], function (require, exports, esi_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const CANVAS_ID = "mapcanvas";
    const OVERLAY_ID = "mapoverlay";
    const CANVAS_WIDTH = 1200;
    const CANVAS_HEIGHT = 800;
    const MIN_X = -508743946216136960;
    const MIN_Y = -508743946216136960;
    const MAX_X = 472860102256056640;
    const MAX_Y = 472860102256056640;
    function init() {
        return __awaiter(this, void 0, void 0, function* () {
            const canvas = document.getElementById(CANVAS_ID);
            const overlay = document.getElementById(OVERLAY_ID);
            if (!canvas || !overlay) {
                console.error("Missing HTML structure");
                return;
            }
            canvas.width = CANVAS_WIDTH;
            canvas.height = CANVAS_HEIGHT;
            const ctx = canvas.getContext("2d");
            const solarSystemList = yield esi_1.getSolarSystemList();
            let solarSystems = [];
            overlay.innerText = `0 / ${solarSystemList.length}`;
            let count = 0;
            console.log(solarSystemList);
            for (let solarSystemId of solarSystemList) {
                let info = yield esi_1.getSolarSystemInfo(solarSystemId);
                solarSystems.push(info);
                drawSolarSystem(info);
                overlay.innerText = `${++count} / ${solarSystemList.length}`;
            }
            function drawSolarSystem(solarSystem) {
                if (!ctx)
                    return;
                let coordinates = convertCoordinate(solarSystem.position.x, solarSystem.position.z);
                if (solarSystem.security_status < 0) {
                    ctx.fillStyle = "#FF0000";
                }
                else if (solarSystem.security_status < 0.5) {
                    ctx.fillStyle = "#FF7700";
                }
                else {
                    ctx.fillStyle = "#00FF00";
                }
                ctx.fillRect(coordinates[0] - 1, coordinates[1] - 1, 2, 2);
            }
            function convertCoordinate(x, y) {
                const rangeX = MAX_X - MIN_X;
                const rangeY = MAX_Y - MIN_Y;
                const cwidth = CANVAS_WIDTH * 0.8;
                const cheight = CANVAS_HEIGHT * 0.8;
                x = ((x + rangeX / 2) / rangeX) * cheight + CANVAS_HEIGHT * 0.1 + (CANVAS_WIDTH - CANVAS_HEIGHT) / 2;
                y = cheight - ((y + rangeY / 2) / rangeY) * cheight + CANVAS_HEIGHT * 0.1;
                return [x, y];
            }
        });
    }
    setTimeout(init, 100);
});
