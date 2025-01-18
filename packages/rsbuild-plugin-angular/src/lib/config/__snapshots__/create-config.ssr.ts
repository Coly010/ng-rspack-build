import type { RsbuildConfig } from '@rsbuild/core';
const config: RsbuildConfig = {
  "root": "<CWD>",
  "source": {
    "tsconfigPath": "<CWD>/tsconfig.app.json"
  },
  "plugins": [
    {
      "name": "plugin-hoisted-js-transformer",
      "post": [
        "plugin-angular"
      ]
    }
  ],
  "mode": "development",
  "dev": {},
  "server": {
    "host": "localhost",
    "port": 4200,
    "htmlFallback": false,
    "historyApiFallback": {
      "index": "/index.html",
      "rewrites": [
        {
          "from": {},
          "to": "index.html"
        }
      ]
    }
  },
  "tools": {},
  "environments": {
    "browser": {
      "plugins": [
        {
          "name": "plugin-angular",
          "pre": [
            "plugin-hoisted-js-transformer"
          ],
          "post": [
            "plugin-angular-jit"
          ]
        }
      ],
      "source": {
        "preEntry": [
          "zone.js",
          "./src/styles.css"
        ],
        "entry": {
          "index": "./src/main.ts"
        },
        "define": {}
      },
      "output": {
        "target": "web",
        "distPath": {
          "root": "dist/browser"
        },
        "copy": [
          {
            "from": "./public",
            "to": "."
          }
        ]
      },
      "html": {
        "template": "./src/index.html"
      }
    },
    "server": {
      "plugins": [
        {
          "name": "plugin-angular",
          "pre": [
            "plugin-hoisted-js-transformer"
          ],
          "post": [
            "plugin-angular-jit"
          ]
        }
      ],
      "source": {
        "preEntry": [
          "zone.js/node",
          "@angular/platform-server/init"
        ],
        "entry": {},
        "define": {
          "ngServerMode": true
        }
      },
      "output": {
        "target": "node",
        "polyfill": "entry",
        "distPath": {
          "root": "dist/server"
        }
      }
    }
  }
}