const yaml = require('js-yaml');
const { BeanModel } = require("redbean-node/dist/bean-model");

class KubernetesCluster extends BeanModel {
    /**
     * Returns an object that ready to parse to JSON
     * @returns {object} Object ready to parse
     */
    toJSON() {
        return {
            id: this.id,
            userID: this.user_id,
            kubernetesURL: this.kubernetes_url,
            connectionType: this.connection_type,
            kubeConfig: yaml.dump(JSON.parse(this.kube_config)),
            namespaces: this.namespaces,
            name: this.name,
        };
    }
}

module.exports = KubernetesCluster;
