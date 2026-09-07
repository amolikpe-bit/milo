import app from "../apps/web/app.html";
import landing from "../apps/web/index.html";

const publicRoutes = Object.fromEntries(
  Array.from(new Bun.Glob("**/*").scanSync("apps/web/public")).map((path) => [
    `/${path}`,
    Bun.file(`apps/web/public/${path}`),
  ]),
);
const appRoutes = [
  "/demo",
  "/sign-in",
  "/orders",
  "/merchant/orders",
  "/merchant/quotes/new",
  "/operator/cases",
  "/account",
  "/how-it-works",
  "/privacy",
  "/terms",
  "/pilot",
];

Bun.serve({
  hostname: "0.0.0.0",
  port: 3000,
  development: true,
  routes: {
    ...publicRoutes,
    "/": landing,
    ...Object.fromEntries(appRoutes.map((route) => [route, app])),
    "/m/*": app,
    "/quotes/*": app,
    "/orders/*": app,
    "/merchant/*": app,
    "/operator/*": app,
    "/__qa/axe.js": new Response(Bun.file("node_modules/axe-core/axe.min.js"), {
      headers: { "Content-Type": "text/javascript" },
    }),
    "/*": app,
  },
});
