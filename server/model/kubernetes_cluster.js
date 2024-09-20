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
            kubernetesHost: this.kubernetes_host,
            connectionType: this.connection_type,
            name: this.name,
        };
    }
}

module.exports = KubernetesCluster;
