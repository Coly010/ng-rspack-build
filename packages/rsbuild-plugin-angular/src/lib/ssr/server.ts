import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr/node';
import express from 'express';
import { dirname, join, resolve } from 'node:path';

interface RsbuildAngularServer {
  app: express.Express;
  listen: (port?: number) => void;
}

export interface RsbuildAngularServerOptions {
  serverDistFolder?: string;
  browserDistFolder?: string;
  staticFolder?: string;
  indexHtml?: string;
}

export function createServer(
  bootstrap: any,
  opts?: RsbuildAngularServerOptions
): RsbuildAngularServer {
  const serverDistFolder = opts?.serverDistFolder ?? dirname(__filename);
  const browserDistFolder =
    opts?.browserDistFolder ?? resolve(serverDistFolder, '../browser');
  const staticFolder =
    opts?.staticFolder ?? resolve(browserDistFolder, 'static');
  const indexHtml = opts?.indexHtml ?? join(browserDistFolder, 'index.html');

  const app = express();
  const commonEngine = new CommonEngine();
  const ngJsDispatchEvent = `<script type="text/javascript" id="ng-event-dispatch-contract">
(()=>{function p(t,n,r,o,e,i,f,m){return{eventType:t,event:n,targetElement:r,eic:o,timeStamp:e,eia:i,eirp:f,eiack:m}}function u(t){let n=[],r=e=>{n.push(e)};return{c:t,q:n,et:[],etc:[],d:r,h:e=>{r(p(e.type,e,e.target,t,Date.now()))}}}function s(t,n,r){for(let o=0;o<n.length;o++){let e=n[o];(r?t.etc:t.et).push(e),t.c.addEventListener(e,t.h,r)}}function c(t,n,r,o,e=window){let i=u(t);e._ejsas||(e._ejsas={}),e._ejsas[n]=i,s(i,r),s(i,o,!0)}window.__jsaction_bootstrap=c;})();
</script>`;

  app.get(
    '**',
    express.static(browserDistFolder, {
      maxAge: '1y',
      index: false,
    })
  );
  app.use('/static', express.static(staticFolder));

  /**
   * Handle all other requests by rendering the Angular application.
   */
  app.get('**', async (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => {
        html = html.replace('</head>', `${ngJsDispatchEvent}\n</head>`);
        res.send(html);
      })
      .catch((err) => next(err));
  });

  return {
    app,
    listen: (
      port: number = process.env['PORT']
        ? Number.parseInt(process.env['PORT'], 10)
        : 4000
    ) => {
      app.listen(port, () => {
        console.log(
          `Node Express server listening on http://localhost:${port}`
        );
      });
    },
  };
}
