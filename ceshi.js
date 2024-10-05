const axios = require("axios");
const net = require("net");

axios
  .get("https://crsub.us/s/1e52e5bce2a6d6559c1887987e6dfc68", {
    responseType: "text",
  })
  .then(async (response) => {
    const base64Data = response.data;
    const decodedData = Buffer.from(base64Data, "base64").toString("utf-8");
    console.log(decodedData);
    const trojanRegex = /trojan:\/\/(.*)@(.*):(\d+)\?(.*)#(.*)/g;
    let match;
    let parsedList = [];

    while ((match = trojanRegex.exec(decodedData)) !== null) {
      const [_, password, server, port, params, remarks] = match;
      const nodeInfo = {
        password: password,
        server: server,
        port: port,
        params: params,
        remarks: decodeURIComponent(remarks),
        latency: null,
      };

      // 测量延迟
      try {
        const start = Date.now();
        await new Promise((resolve, reject) => {
          const socket = net.createConnection({ host: server, port: port }, () => {
            const end = Date.now();
            socket.destroy(); // 关闭连接
            nodeInfo.latency = end - start; // 计算延迟
            resolve();
          });

          socket.setTimeout(3000); // 设置超时时间
          socket.on("timeout", () => {
            socket.destroy();
            reject("请求超时");
          });

          socket.on("error", (err) => {
            reject(err);
          });
        });
      } catch (error) {
        nodeInfo.latency = "请求超时"; // 处理请求失败
      }

      parsedList.push(nodeInfo);
    }

    console.log(parsedList);
  })
  .catch((error) => {
    console.error("获取订阅数据失败:", error);
  });
