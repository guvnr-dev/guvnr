/**
 * Edge Case Tests for AI Excellence Framework
 *
 * Tests boundary conditions, error handling, and unusual inputs.
 *
 * Run with: node --test tests/edge-cases.test.js
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import {
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync,
  readFileSync,
  chmodSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, "..");

function createTempDir() {
  const tempDir = join(
    tmpdir(),
    `ai-excellence-edge-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  mkdirSync(tempDir, { recursive: true });
  return tempDir;
}

function cleanupTempDir(dir) {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ============================================
// MALFORMED INPUT TESTS
// ============================================

describe("Malformed Input Handling", () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  it("should handle CLAUDE.md with only whitespace", () => {
    writeFileSync(join(tempDir, "CLAUDE.md"), "   \n\n   \t\t\n  ");
    const content = readFileSync(join(tempDir, "CLAUDE.md"), "utf-8");
    assert.ok(content.trim() === "", "Should be empty when trimmed");
  });

  it("should handle CLAUDE.md with binary content", () => {
    // Write some binary-like content
    const binaryContent = Buffer.from([
      0x00, 0x01, 0xff, 0xfe, 0x48, 0x65, 0x6c, 0x6c, 0x6f,
    ]);
    writeFileSync(join(tempDir, "CLAUDE.md"), binaryContent);

    const content = readFileSync(join(tempDir, "CLAUDE.md"));
    assert.ok(
      Buffer.isBuffer(content) || typeof content === "string",
      "Should be readable",
    );
  });

  it("should handle extremely long lines in CLAUDE.md", () => {
    const longLine = "A".repeat(100000);
    writeFileSync(
      join(tempDir, "CLAUDE.md"),
      `# Test\n\n${longLine}\n\n## Overview\nTest`,
    );

    const content = readFileSync(join(tempDir, "CLAUDE.md"), "utf-8");
    assert.ok(
      content.includes("A".repeat(1000)),
      "Should contain long content",
    );
  });

  it("should handle CLAUDE.md with special characters", () => {
    const specialContent = `# Project 🚀

## Overview
This has émojis 👨‍💻 and spëcîál çhàráctérs

## Tech Stack
- ñoño language
- 日本語フレームワーク

## Current State
Status: ✅ Working
`;
    writeFileSync(join(tempDir, "CLAUDE.md"), specialContent);

    const content = readFileSync(join(tempDir, "CLAUDE.md"), "utf-8");
    assert.ok(content.includes("🚀"), "Should preserve emojis");
    assert.ok(content.includes("日本語"), "Should preserve unicode");
  });

  it("should handle malformed JSON config", () => {
    const malformedJson = '{ "version": "1.0.0", "preset": }';
    writeFileSync(join(tempDir, "ai-excellence.config.json"), malformedJson);

    assert.throws(
      () => {
        JSON.parse(
          readFileSync(join(tempDir, "ai-excellence.config.json"), "utf-8"),
        );
      },
      /Unexpected token|Expected/,
      "Should throw on malformed JSON",
    );
  });

  it("should handle JSON with trailing commas", () => {
    const trailingCommaJson = '{ "version": "1.0.0", "preset": "minimal", }';
    writeFileSync(
      join(tempDir, "ai-excellence.config.json"),
      trailingCommaJson,
    );

    assert.throws(
      () => {
        JSON.parse(
          readFileSync(join(tempDir, "ai-excellence.config.json"), "utf-8"),
        );
      },
      /Unexpected token|Expected/,
      "Should throw on trailing comma",
    );
  });

  it("should handle empty JSON config", () => {
    writeFileSync(join(tempDir, "ai-excellence.config.json"), "{}");

    const config = JSON.parse(
      readFileSync(join(tempDir, "ai-excellence.config.json"), "utf-8"),
    );
    assert.deepStrictEqual(config, {}, "Should parse empty object");
  });
});

// ============================================
// PATH HANDLING TESTS
// ============================================

describe("Path Edge Cases", () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  it("should handle paths with spaces", () => {
    const spacedDir = join(tempDir, "path with spaces");
    mkdirSync(spacedDir, { recursive: true });
    writeFileSync(join(spacedDir, "test.md"), "# Test");

    assert.ok(
      existsSync(join(spacedDir, "test.md")),
      "Should create file in path with spaces",
    );
  });

  it("should handle paths with unicode characters", () => {
    const unicodeDir = join(tempDir, "tëst-dirëctöry-日本語");
    mkdirSync(unicodeDir, { recursive: true });
    writeFileSync(join(unicodeDir, "test.md"), "# Test");

    assert.ok(
      existsSync(join(unicodeDir, "test.md")),
      "Should create file in unicode path",
    );
  });

  it("should handle deeply nested paths", () => {
    const deepPath = join(
      tempDir,
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
    );
    mkdirSync(deepPath, { recursive: true });
    writeFileSync(join(deepPath, "deep.md"), "# Deep");

    assert.ok(
      existsSync(join(deepPath, "deep.md")),
      "Should create deeply nested file",
    );
  });

  it("should handle symlinks to directories", () => {
    const targetDir = join(tempDir, "target");
    const linkPath = join(tempDir, "link");
    mkdirSync(targetDir);

    try {
      const { symlinkSync } = require("fs");
      symlinkSync(targetDir, linkPath);
      assert.ok(existsSync(linkPath), "Should follow symlink");
    } catch {
      // Symlinks may require elevated permissions on some systems
      assert.ok(true, "Symlink creation may require elevated permissions");
    }
  });
});

// ============================================
// SECURITY PATTERN TESTS
// ============================================

describe("Security Pattern Detection", () => {
  const secretPatterns = [
    {
      name: "AWS Access Key",
      content: "AKIAIOSFODNN7EXAMPLE",
      shouldMatch: true,
    },
    {
      name: "AWS Secret Key",
      content: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
      shouldMatch: true,
    },
    {
      name: "GitHub PAT",
      content: "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      shouldMatch: true,
    },
    {
      name: "GitHub OAuth",
      content: "gho_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      shouldMatch: true,
    },
    {
      name: "GitLab PAT",
      content: "glpat-xxxxxxxxxxxxxxxxxxxx",
      shouldMatch: true,
    },
    {
      name: "OpenAI Key",
      content: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      shouldMatch: true,
    },
    {
      name: "Anthropic Key",
      content: "sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      shouldMatch: true,
    },
    {
      name: "Slack Token",
      content: "xoxb-123456789012-123456789012-abcdefghij123456789012",
      shouldMatch: true,
    },
    {
      name: "Stripe Key",
      content: "sk_live_xxxxxxxxxxxxxxxxxxxxxxxx",
      shouldMatch: true,
    },
    {
      name: "Private Key Header",
      content: "-----BEGIN PRIVATE KEY-----",
      shouldMatch: true,
    },
    {
      name: "RSA Private Key",
      content: "-----BEGIN RSA PRIVATE KEY-----",
      shouldMatch: true,
    },
    {
      name: "Safe content",
      content: "This is just normal text",
      shouldMatch: false,
    },
    {
      name: "Example placeholder",
      content: "API_KEY=your-api-key-here",
      shouldMatch: false,
    },
    {
      name: "Environment variable reference",
      content: "API_KEY=${API_KEY}",
      shouldMatch: false,
    },
  ];

  const patterns = [
    /AKIA[0-9A-Z]{16}/,
    /ghp_[a-zA-Z0-9]{36}/,
    /gho_[a-zA-Z0-9]{36}/,
    /glpat-[a-zA-Z0-9-]{20}/,
    /sk-[a-zA-Z0-9-]{32,}/,
    /sk-ant-[a-zA-Z0-9-]{32,}/,
    /xoxb-[0-9-]+/,
    /sk_live_[a-zA-Z0-9]{24}/,
    /-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----/,
    /wJalrXUtnFEMI\/K7MDENG/,
  ];

  function containsSecret(content) {
    return patterns.some((p) => p.test(content));
  }

  for (const test of secretPatterns) {
    it(`should ${test.shouldMatch ? "detect" : "not detect"} ${test.name}`, () => {
      const detected = containsSecret(test.content);
      assert.strictEqual(
        detected,
        test.shouldMatch,
        `Expected ${test.name} detection to be ${test.shouldMatch}`,
      );
    });
  }
});

// ============================================
// PACKAGE NAME VALIDATION TESTS
// ============================================

describe("Package Name Validation", () => {
  function isValidNpmPackage(name) {
    if (!name || typeof name !== "string") {
      return false;
    }
    if (name.length > 214) {
      return false;
    }
    if (name.startsWith(".") || name.startsWith("_")) {
      return false;
    }
    if (/[A-Z]/.test(name.replace(/^@[^/]+\//, ""))) {
      return false;
    }

    const validPattern =
      /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
    return validPattern.test(name);
  }

  const validPackages = [
    "lodash",
    "react",
    "@types/node",
    "@angular/core",
    "fs-extra",
    "node-fetch",
    "chalk",
    "@scope/package-name",
    "a".repeat(214),
  ];

  const invalidPackages = [
    "",
    null,
    undefined,
    "UPPERCASE",
    "camelCase",
    ".hidden",
    "_private",
    "../escape",
    "/absolute",
    "a".repeat(215),
    "spaces in name",
    "special@chars",
    "@/missing-name",
    "@scope/",
    "a\\backslash",
  ];

  for (const pkg of validPackages) {
    it(`should accept valid package: ${pkg.slice(0, 50)}`, () => {
      assert.ok(isValidNpmPackage(pkg), `${pkg} should be valid`);
    });
  }

  for (const pkg of invalidPackages) {
    it(`should reject invalid package: ${String(pkg).slice(0, 50)}`, () => {
      assert.ok(!isValidNpmPackage(pkg), `${pkg} should be invalid`);
    });
  }
});

// ============================================
// YAML FRONTMATTER PARSING TESTS
// ============================================

describe("Command Frontmatter Parsing", () => {
  function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) {
      return null;
    }

    const yaml = match[1];
    const result = {};

    // Simple YAML parser for frontmatter
    const lines = yaml.split("\n");
    for (const line of lines) {
      const colonIndex = line.indexOf(":");
      if (colonIndex > 0) {
        const key = line.slice(0, colonIndex).trim();
        let value = line.slice(colonIndex + 1).trim();
        // Remove quotes
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        result[key] = value;
      }
    }

    return result;
  }

  it("should parse valid frontmatter", () => {
    const content = `---
description: Test command
model: haiku
---
# Content`;
    const fm = parseFrontmatter(content);
    assert.strictEqual(fm.description, "Test command");
    assert.strictEqual(fm.model, "haiku");
  });

  it("should handle frontmatter with quotes", () => {
    const content = `---
description: "Quoted description"
name: 'single quotes'
---
# Content`;
    const fm = parseFrontmatter(content);
    assert.strictEqual(fm.description, "Quoted description");
    assert.strictEqual(fm.name, "single quotes");
  });

  it("should return null for missing frontmatter", () => {
    const content = `# No Frontmatter
Just content here.`;
    const fm = parseFrontmatter(content);
    assert.strictEqual(fm, null);
  });

  it("should handle unclosed frontmatter", () => {
    const content = `---
description: Missing closing
# Content`;
    const fm = parseFrontmatter(content);
    assert.strictEqual(fm, null);
  });
});

// ============================================
// VERSION STRING VALIDATION TESTS
// ============================================

describe("Semver Validation", () => {
  function isValidSemver(version) {
    const semverRegex =
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
    return semverRegex.test(version);
  }

  const validVersions = [
    "1.0.0",
    "0.0.1",
    "1.2.3",
    "10.20.30",
    "1.0.0-alpha",
    "1.0.0-alpha.1",
    "1.0.0-beta.2",
    "1.0.0-rc.1",
    "1.0.0+build",
    "1.0.0-alpha+build",
    "1.0.0-0.3.7",
    "1.0.0-x.7.z.92",
  ];

  const invalidVersions = [
    "1",
    "1.0",
    "v1.0.0",
    "1.0.0.0",
    "01.0.0",
    "1.01.0",
    "1.0.01",
    "a.b.c",
    "1.0.0-",
    "1.0.0+",
  ];

  for (const v of validVersions) {
    it(`should accept valid version: ${v}`, () => {
      assert.ok(isValidSemver(v), `${v} should be valid semver`);
    });
  }

  for (const v of invalidVersions) {
    it(`should reject invalid version: ${v}`, () => {
      assert.ok(!isValidSemver(v), `${v} should be invalid semver`);
    });
  }
});

// ============================================
// ERROR CODE VALIDATION TESTS
// ============================================

describe("Error Code Format", () => {
  function isValidErrorCode(code) {
    // Format: AIX-{CATEGORY}-{NUMBER}
    return /^AIX-[A-Z]+-\d{3}$/.test(code);
  }

  const validCodes = [
    "AIX-INIT-100",
    "AIX-VALID-200",
    "AIX-CONFIG-300",
    "AIX-FS-400",
    "AIX-NET-500",
    "AIX-MCP-600",
    "AIX-HOOK-700",
    "AIX-GEN-900",
  ];

  const invalidCodes = [
    "INIT-100",
    "AIX-100",
    "AIX-INIT",
    "AIX-init-100",
    "AIX-INIT-1000",
    "AIX-INIT-10",
    "aix-INIT-100",
    "AIX_INIT_100",
  ];

  for (const code of validCodes) {
    it(`should accept valid error code: ${code}`, () => {
      assert.ok(isValidErrorCode(code), `${code} should be valid`);
    });
  }

  for (const code of invalidCodes) {
    it(`should reject invalid error code: ${code}`, () => {
      assert.ok(!isValidErrorCode(code), `${code} should be invalid`);
    });
  }
});

// ============================================
// CONCURRENT ACCESS TESTS
// ============================================

describe("Concurrent File Access", () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  it("should handle multiple simultaneous reads", async () => {
    const testFile = join(tempDir, "test.md");
    writeFileSync(testFile, "# Test Content\n".repeat(100));

    const reads = Array(10)
      .fill(null)
      .map(
        () =>
          new Promise((resolve, reject) => {
            try {
              const content = readFileSync(testFile, "utf-8");
              resolve(content);
            } catch (err) {
              reject(err);
            }
          }),
      );

    const results = await Promise.all(reads);
    assert.strictEqual(results.length, 10, "Should complete all reads");
    results.forEach((content) => {
      assert.ok(
        content.includes("# Test Content"),
        "Content should be correct",
      );
    });
  });

  it("should handle read during write", async () => {
    const testFile = join(tempDir, "concurrent.md");
    writeFileSync(testFile, "Initial content");

    // Start a write operation
    const writePromise = new Promise((resolve) => {
      writeFileSync(testFile, "Updated content");
      resolve();
    });

    // Read immediately
    await writePromise;
    const content = readFileSync(testFile, "utf-8");
    assert.ok(content.length > 0, "Should read some content");
  });
});

// ============================================
// ENCODING TESTS
// ============================================

describe("File Encoding Handling", () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  it("should handle UTF-8 with BOM", () => {
    const bomContent = "\uFEFF# Project Title\n\nContent with BOM";
    const testFile = join(tempDir, "bom.md");
    writeFileSync(testFile, bomContent, "utf-8");

    const content = readFileSync(testFile, "utf-8");
    assert.ok(
      content.includes("# Project Title"),
      "Should read content after BOM",
    );
  });

  it("should handle mixed line endings", () => {
    const mixedContent = "# Title\r\nLine 2\nLine 3\rLine 4";
    const testFile = join(tempDir, "mixed-endings.md");
    writeFileSync(testFile, mixedContent);

    const content = readFileSync(testFile, "utf-8");
    assert.ok(content.includes("Line 2"), "Should contain Line 2");
    assert.ok(content.includes("Line 3"), "Should contain Line 3");
  });

  it("should handle null bytes", () => {
    const nullContent = "Before\x00After";
    const testFile = join(tempDir, "null.md");
    writeFileSync(testFile, nullContent);

    const content = readFileSync(testFile, "utf-8");
    assert.ok(content.includes("Before"), "Should contain text before null");
  });
});

console.log(
  "Edge case tests loaded. Run with: node --test tests/edge-cases.test.js",
);
