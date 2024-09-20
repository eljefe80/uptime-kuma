const { sendKubernetesClusterList } = require("../client");
const { checkLogin } = require("../util-server");
const { KubernetesCluster } = require("../kubernetes");
const { log } = require("../../src/util");

/**
 * Handlers for kubernetes clusters
 * @param {Socket} socket Socket.io instance
 * @returns {void}
 */
module.exports.kubernetesSocketHandler = (socket) => {
    socket.on("addKubernetesCluster", async (kubernetesCluster, kubernetesClusterID, callback) => {
        try {
            checkLogin(socket);

            let kubernetesClusterBean = await KubernetesCluster.save(kubernetesCluster, kubernetesClusterID, socket.userID);
            await sendKubernetesClusterList(socket);

            callback({
                ok: true,
                msg: "Saved.",
                msgi18n: true,
                id: kubernetesClusterBean.id,
            });

        } catch (e) {
            callback({
                ok: false,
                msg: e.message,
            });
        }
    });

    socket.on("deleteKubernetesCluster", async (kubernetesClusterID, callback) => {
        try {
            checkLogin(socket);

            await KubernetesCluster.delete(kubernetesClusterID, socket.userID);
            await sendKubernetesClusterList(socket);

            callback({
                ok: true,
                msg: "successDeleted",
                msgi18n: true,
            });

        } catch (e) {
            callback({
                ok: false,
                msg: e.message,
            });
        }
    });

    socket.on("testKubernetesCluster", async (kubernetesCluster, callback) => {
        try {
            checkLogin(socket);

            let amount = await KubernetesCluster.testKubernetesCluster(kubernetesCluster);
            let msg;

            if (amount >= 1) {
                msg = "Connected Successfully. Amount of containers: " + amount;
            } else {
                msg = "Connected Successfully, but there are no containers?";
            }

            callback({
                ok: true,
                msg,
            });

        } catch (e) {
            log.error("kubernetes", e);

            callback({
                ok: false,
                msg: e.message,
            });
        }
    });
};
