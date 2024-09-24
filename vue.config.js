const { defineConfig } = require("@vue/cli-service");
const { DefinePlugin } = require("webpack");
const path = require("path");
module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: (config) => {
    config.module
      .rule("js")
      .exclude.add(/\.worker\.js$/)
      .end();

    config.module
      .rule("workers")
      .test(/\.worker\.js$/)
      .use("worker-loader")
      .loader("worker-loader")
      .options({
        inline: "fallback",
      })
      .end();
  },
  configureWebpack: {
    plugins: [
      new DefinePlugin({
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
      }),
    ],
    module: {
      rules: [
        {
          test: /\.worker\.js$/, // Matches the worker files
          use: {
            loader: "worker-loader",
            options: {
              // Additional options here
            },
          },
          include: path.resolve(__dirname, "src/workers"),
        },
      ],
    },
  },
  lintOnSave: true, // 禁用 ESLint

  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        appId: "com.mixtool.app",
        productName: "Mix Tool", // 应用名称
        copyright: "Copyright © 2024",
        directories: {
          output: "dist_electron", // 打包输出目录
          buildResources: "build", // 资源文件的目录
        },

        win: {
          target: [
            "nsis", // 可选：'msi', 'portable'
          ],
          icon: "build/ico.ico", // ICO 图标路径，确保至少 256x256
        },
        nsis: {
          oneClick: false,
          perMachine: true,
          allowToChangeInstallationDirectory: true,
        },

        publish: [
          {
            provider: "github",
            owner: "dexcpro",
            repo: "Telegram_Game_bot",
          },
        ],
      },
    },
  },
});
