try {
  if (process.env.OTEL_ENABLED == 'true') {
    require('@godspeedsystems/tracing').initialize();
  }
} catch (error) {
  console.error(
    'OTEL_ENABLED is set, unable to initialize opentelemetry tracing.',
  );
  console.error(error);
  process.exit(1);
}

import Godspeed from '@godspeedsystems/core';
import dotenv from 'dotenv';
// import ngrok from '@ngrok/ngrok';

// load the environment variables
dotenv.config();

// // start ngrok
// (async () => {
//   try {
//     const url = await ngrok.connect({
//       addr: process.env.PORT || 3000,
//     });
//     console.log(`Ngrok tunnel started at ${url}`);
//   } catch (error) {
//     console.error('Failed to start ngrok');
//     console.error(error);
//   }
// })();

// process.stdin.resume(); //so the program will not close instantly

// create a godspeed
const gsApp = new Godspeed();

// initilize the Godspeed App
// this is responsible to load all kind of entities
gsApp.initialize();
