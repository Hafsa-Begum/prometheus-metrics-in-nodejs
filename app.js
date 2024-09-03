const express = require('express');
const app = express();

const client = require('prom-client');

app.use(express.json());

let collectDefaultMetrics = client.collectDefaultMetrics;
const register = new client.Registry();

// Create custom metrics
const customCounter = new client.Counter({
    name: "custom_counter",
    help: "Custom counter for my application",
});

// Add your custom metric to the registry
register.registerMetric(customCounter);

client.collectDefaultMetrics({
    app: 'node-application-monitoring-app',
    prefix: 'node_',
    timeout: 10000,
    gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
    register
});

// Create a route to expose /
app.get('/', (req, res) => {
    customCounter.inc();
    console.log(register.metrics());
    res.send("test prometheus metrics in /metrics");
});

// Create a route to expose metrics
app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
});

const PORT = 7000;
app.listen(PORT, () => {
    console.log(`Listening at ${PORT}`);
    
});