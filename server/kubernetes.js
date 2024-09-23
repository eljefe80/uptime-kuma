const axios = require("axios");
const { R } = require("redbean-node");
const https = require("https");
const fs = require("fs");
const path = require("path");
const Database = require("./database");
//const { axiosAbortSignal } = require("./util-server");
const k8s = require('@kubernetes/client-node');
const yaml = require('js-yaml');
class KubernetesCluster {

    static CertificateFileNameCA = "ca.pem";
    static CertificateFileNameCert = "cert.pem";
    static CertificateFileNameKey = "key.pem";

    /**
     * Save a kubernetes cluster
     * @param {object} kubernetesCluster Kubernetes cluster to save
     * @param {?number} kubernetesClusterID ID of the Kubernetes cluster to update
     * @param {number} userID ID of the user who adds the Kubernetes cluster
     * @returns {Promise<Bean>} Updated Kuberneters Cluster
     */
    static async save(kubernetesCluster, kubernetesClusterID, userID) {
        let bean;

        if (kubernetesClusterID) {
            bean = await R.findOne("kubernetes_cluster", " id = ? AND user_id = ? ", [ kubernetesClusterID, userID ]);

            if (!bean) {
                throw new Error("kubernetes cluster not found");
            }

        } else {
            bean = R.dispense("kubernetes_cluster");
        }

        console.log(kubernetesCluster.kubeConfig);
        console.log(JSON.stringify(yaml.load(kubernetesCluster.kubeConfig)));
        bean.user_id = userID;
        bean.kubernetes_url = kubernetesCluster.kubernetesURL;
        bean.kube_config = JSON.stringify(yaml.load(kubernetesCluster.kubeConfig));
        bean.connection_type = kubernetesCluster.connectionType;
        bean.name = kubernetesCluster.name;
        bean.namespaces = kubernetesCluster.namespaces;

        await R.store(bean);

        return bean;
    }

    /**
     * Delete a Kubernetes Cluster
     * @param {number} kubernetesClusterID ID of the Kubernetes cluster to delete
     * @param {number} userID ID of the user who created the Kubernetes cluster
     * @returns {Promise<void>}
     */
    static async delete(kubernetesClusterID, userID) {
        let bean = await R.findOne("kubernetes_cluster", " id = ? AND user_id = ? ", [ kubernetesClusterID, userID ]);

        if (!bean) {
            throw new Error("kubernetes cluster not found");
        }

        // Delete removed kubernetes_cluster from monitors if exists
        await R.exec("UPDATE monitor SET kubernetes_cluster = null WHERE kubernetes_cluster = ?", [ kubernetesClusterID ]);

        await R.trash(bean);
    }

    /**
     * Fetches the amount of pods on the Kubernetes Cluster
     * @param {object} Kubernetes cluster to check for
     * @returns {Promise<number>} Total amount of containers on the host
     */
    static async testKubernetesCluster(kubernetesCluster) {
        let config;

        const kc = new k8s.KubeConfig();

        if (kubernetesCluster.connection_type === "local") {
            kc.loadFromCluster();
        } else if (kubernetesCluster.connectionType === "remote") {
/*
            config = {
              "apiVersion": 'v1',
              "kind": 'Config',
              "clusters": [
                { 'cluster': { 'server': kubernetesCluster.kubernetesURL }, 'name': kubernetesCluster.name }
              ],
              "contexts": [
                { 'context': { 'user': kubernetesCluster.name, 'cluster': kubernetesCluster.name }, 'name': kubernetesCluster.name }
              ],
              "users": [
                { 'name': kubernetesCluster.name, 'authProvider': { config: { 'access-token': kubernetesCluster.accessToken } } }
              ],
              "current-context": kubernetesCluster.name
            };
            console.log(config);
            kc.loadFromString(JSON.stringify(config));
*/
            kc.loadFromString(JSON.stringify(yaml.load(kubernetesCluster.kubeConfig)));

        }
        const kbsCoreApi = kc.makeApiClient(k8s.CoreV1Api);
        let numpods = 0;
        let ns;
        if (kubernetesCluster.namespaces.includes(",")) { //is csv
          ns = kubernetesCluster.namespaces.split(',');
        } else {
           const namespaces = await kbsCoreApi.listNamespace();
           if (kubernetesCluster.namespaces === "") {
             ns = namespaces.body.items.map(e => e.metadata.name);
           } else {
             ns = [];
             for (let i = 0; i < namespaces.length; i++){
               if (namespaces[i].match(kubernetesCluster.namespaces)){
                 ns.push(namespaces[i]);
               }
             }
           }
        }
        for (let i = 0; i < ns.length; i++) {
          const podsRes = await kbsCoreApi.listNamespacedPod(ns[i]);
          console.log(podsRes.body.items.length);
          numpods += podsRes.body.items.length;
        }
        return numpods;
    }

}

module.exports = {
    KubernetesCluster,
};
