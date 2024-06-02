"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mockGenerateDelegationsData_1 = require("./mockGenerateDelegationsData");
const allMockData = mockGenerateDelegationsData_1.generateRandomDelegationData(1000);
exports.mockGetDelegations = (key, publicKeyNoCoord) => __awaiter(this, void 0, void 0, function* () {
    if (!publicKeyNoCoord) {
        throw new Error("No public key provided");
    }
    const pageSize = 100;
    const pageIndex = parseInt(key) || 0;
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    const data = allMockData.slice(startIndex, endIndex);
    const nextKey = endIndex >= allMockData.length ? null : pageIndex + 1;
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    yield sleep(3000); // mock 3 seconds delay
    return {
        data,
        pagination: {
            next_key: nextKey ? .toString() || "" : ,
        },
    };
});
//# sourceMappingURL=mockGetDelegations.js.map