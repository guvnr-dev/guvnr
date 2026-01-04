#!/usr/bin/env node
/**
 * Post-install script
 *
 * Shows helpful information after installation.
 */

const message = `
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   Guvnr installed successfully!                            ║
║                                                            ║
║   Quick start:                                             ║
║     npx guvnr init         Initialize framework            ║
║     npx guvnr validate     Check configuration             ║
║     npx guvnr doctor       Diagnose issues                 ║
║                                                            ║
║   Documentation:                                           ║
║     https://guvnr.dev/                                     ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`;

// Only show in interactive terminals, not in CI
if (process.stdout.isTTY && !process.env.CI) {
  console.log(message);
}
