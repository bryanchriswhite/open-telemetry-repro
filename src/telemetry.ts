import {NodeSDK} from "@opentelemetry/sdk-node";

const opentelemetry = require('@opentelemetry/sdk-node');
const {getNodeAutoInstrumentations} = require('@opentelemetry/auto-instrumentations-node');
const {OTLPTraceExporter} = require('@opentelemetry/exporter-trace-otlp-grpc');
const {Resource} = require('@opentelemetry/resources');
const {SemanticResourceAttributes} = require('@opentelemetry/semantic-conventions');
const grpc = require('@grpc/grpc-js');

const {
  OPEN_TELEMETRY_SERVICE_NAME,
  OPEN_TELEMETRY_COLLECTOR_URL,
} = process.env;

interface Telemetry {
  start(): Promise<void>;
  shutdown(): Promise<void>;
}

class NoopSDK implements Telemetry {
  public async start(): Promise<void> {
    // no-op
  }

  public async shutdown(): Promise<void> {
    // no-op
  }
}

export let telemetry: Telemetry = new NoopSDK();
if (OPEN_TELEMETRY_SERVICE_NAME !== "" && OPEN_TELEMETRY_COLLECTOR_URL !== "") {
// configure the SDK to export telemetry data to the console
// enable all auto-instrumentations from the meta package
  const exporterOptions = {
    // TODO: env var
    url: OPEN_TELEMETRY_COLLECTOR_URL,
    credentials: grpc.credentials.createInsecure(),
  };
  const traceExporter = new OTLPTraceExporter(exporterOptions);
  telemetry = new opentelemetry.NodeSDK({
    traceExporter,
    instrumentations: [getNodeAutoInstrumentations()],
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: OPEN_TELEMETRY_SERVICE_NAME,
    }),
  });

// initialize the SDK and register with the OpenTelemetry API
// this enables the API to record telemetry
// telemetry.start()
//   .then(() => console.log('Tracing initialized'))
//   .catch((error) => console.log('Error initializing tracing', error));

// gracefully shut down the SDK on process exit
  process.on('SIGTERM', () => {
    telemetry.shutdown()
      .then(() => console.log('Tracing terminated'))
      .catch((error) => console.log('Error terminating tracing', error))
      .finally(() => process.exit(0));
  });
}

