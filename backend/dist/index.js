"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
if (process.env.HTTP_PROXY || process.env.HTTPS_PROXY || process.env.http_proxy || process.env.https_proxy) {
    delete process.env.HTTP_PROXY;
    delete process.env.HTTPS_PROXY;
    delete process.env.http_proxy;
    delete process.env.https_proxy;
    console.log('Proxy environment variables cleared');
}
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const notices_1 = __importDefault(require("./routes/notices"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api', notices_1.default);
app.get('/', (_req, res) => {
    res.json({
        name: 'A-Stock Notice API',
        version: '1.0.0',
        endpoints: {
            notices: '/api/notices',
            health: '/api/health',
        },
    });
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API endpoint: http://localhost:${PORT}/api/notices`);
});
//# sourceMappingURL=index.js.map