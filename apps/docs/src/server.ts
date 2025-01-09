import { createServer } from '@ng-rsbuild/plugin-angular/ssr';
import bootstrap from './main.server';

const server = createServer(bootstrap);

/** Add your custom server logic here
 *
 * For example, you can add a custom static file server:
 * server.app.use('/static', express.static(staticFolder));
 * Or add additional api routes:
 * server.app.get('/api/hello', (req, res) => {
 *   res.send('Hello World!');
 * });
 * Or add additional middleware:
 * server.app.use((req, res, next) => {
 *   res.send('Hello World!');
 * });
 */

server.listen();
