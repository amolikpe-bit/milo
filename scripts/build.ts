export {};

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
const outdir = "dist";
const buildEntrypoints = ".tools/build-entrypoints";

await Bun.$`rm -rf ${outdir}`;
await Bun.$`rm -rf ${buildEntrypoints}`;
await Bun.$`mkdir -p ${buildEntrypoints}`;

const prepareHtmlEntrypoint = async (name: "index" | "app") => {
  const source = await Bun.file(`apps/web/${name}.html`).text();
  await Bun.write(
    `${buildEntrypoints}/${name}.html`,
    source
      .replaceAll('href="./src/', 'href="../../apps/web/src/')
      .replaceAll('src="./src/', 'src="../../apps/web/src/')
      .replaceAll('src="./public/', 'src="../../apps/web/public/'),
  );
};

await Promise.all([
  prepareHtmlEntrypoint("index"),
  prepareHtmlEntrypoint("app"),
]);
const result = await Bun.build({
  entrypoints: [
    `${buildEntrypoints}/index.html`,
    `${buildEntrypoints}/app.html`,
  ],
  outdir,
  root: buildEntrypoints,
  publicPath: "/",
  minify: true,
  define: { "process.env.NODE_ENV": '"production"' },
  naming: {
    entry: "[dir]/[name].[ext]",
    chunk: "[name]-[hash].[ext]",
    asset: "[name]-[hash].[ext]",
  },
});

await Bun.$`rm -rf ${buildEntrypoints}`;

if (!result.success) {
  for (const message of result.logs) {
    console.error(message);
  }
  process.exit(1);
}

for (const route of appRoutes) {
  await Bun.$`mkdir -p ${outdir}${route}`;
  await Bun.write(
    `${outdir}${route}/index.html`,
    Bun.file(`${outdir}/app.html`),
  );
}

const publicDirectory = "apps/web/public";
for (const path of new Bun.Glob("**/*").scanSync(publicDirectory)) {
  await Bun.write(`${outdir}/${path}`, Bun.file(`${publicDirectory}/${path}`));
}

await Bun.write(
  `${outdir}/_redirects`,
  `${[
    "/m/* /app.html 200",
    "/quotes/* /app.html 200",
    "/orders/* /app.html 200",
    "/merchant/* /app.html 200",
    "/operator/* /app.html 200",
  ].join("\n")}\n`,
);
