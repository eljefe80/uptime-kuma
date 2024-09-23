<template>
    <form @submit.prevent="submit">
        <div ref="modal" class="modal fade" tabindex="-1" data-bs-backdrop="static">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 id="exampleModalLabel" class="modal-title">
                            {{ $t("Setup Kubernetes Cluster") }}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="kubernetes-name" class="form-label">{{ $t("Friendly Name") }}</label>
                            <input id="kubernetes-name" v-model="kubernetesCluster.name" type="text" class="form-control" required>
                        </div>

                        <div class="mb-3">
                            <label for="connection-type" class="form-label">{{ $t("Connection Type") }}</label>
                            <select id="connection-type" v-model="kubernetesCluster.connectionType" class="form-select">
                                <option v-for="type in connectionTypes" :key="type" :value="type">{{ $t(type) }}</option>
                            </select>
                        </div>
<!---
                        <div class="mb-3">
                            <label for="kubernetes-url" class="form-label">{{ $t("Kubernetes URL") }}</label>
                            <input id="kubernetes-url" v-model="kubernetesCluster.kubernetesURL" type="text" class="form-control" optional>

                            <div class="form-text">
                                {{ $t("Examples") }}:
                                <ul>
                                    <li>https://kubernetes:6443</li>
                                </ul>
                            </div>
                        </div>
--->
                        <div class="mb-3">
                            <label for="kubernetes-config" class="form-label">{{ $t("Kubernetes Config") }}</label>
                            <textarea id="kubernetes-config" v-model="kubernetesCluster.kubeConfig" rows="5" class="form-control" optional></textarea>
                        </div>
                        <div class="mb-3">
                            <label for="kubernetes-namespaces" class="form-label">{{ $t("Namespaces") }}</label>
                            <input id="kubernetes-namespaces" v-model="kubernetesCluster.namespaces" type="text" class="form-control" optional>
                            <div class="form-text">
                                {{ $t("Namespace(s)") }}:
                                <ul>
                                    <li>/regex/ or comma-separated values; empty means all</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button v-if="id" type="button" class="btn btn-danger" :disabled="processing" @click="deleteConfirm">
                            {{ $t("Delete") }}
                        </button>
                        <button type="button" class="btn btn-warning" :disabled="processing" @click="test">
                            {{ $t("Test") }}
                        </button>
                        <button type="submit" class="btn btn-primary" :disabled="processing">
                            <div v-if="processing" class="spinner-border spinner-border-sm me-1"></div>
                            {{ $t("Save") }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </form>

    <Confirm ref="confirmDelete" btn-style="btn-danger" :yes-text="$t('Yes')" :no-text="$t('No')" @yes="deleteKubernetesCluster">
        {{ $t("deleteKubernetesClusterMsg") }}
    </Confirm>
</template>

<script lang="ts">
import { Modal } from "bootstrap";
import Confirm from "./Confirm.vue";

export default {
    components: {
        Confirm,
    },
    props: {},
    emits: [ "added", "deleted" ],
    data() {
        return {
            modal: null,
            processing: false,
            id: null,
            connectionTypes: [ "local", "remote" ],
            kubernetesCluster: {
                name: "",
                connectionType: "",
                kubernetesURL: "",
                kubeConfig: "",
                namespaces: "",
                // Do not set default value here, please scroll to show()
            }
        };
    },

    mounted() {
        this.modal = new Modal(this.$refs.modal);
    },
    methods: {

        /**
         * Confirm deletion of kubernetes cluster
         * @returns {void}
         */
        deleteConfirm() {
            this.modal.hide();
            this.$refs.confirmDelete.show();
        },

        /**
         * Show specified kubernetes cluster
         * @param {number} kubernetesClusterID ID of host to show
         * @returns {void}
         */
        show(kubernetesClusterID) {
            if (kubernetesClusterID) {
                let found = false;

                this.id = kubernetesClusterID;

                for (let n of this.$root.kubernetesClusterList) {
                    if (n.id === kubernetesClusterID) {
                        this.kubernetesCluster = n;
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    this.$root.toastError("kubernetes cluster not found!");
                }

            } else {
                this.id = null;
                this.kubernetesCluster = {
                    name: "",
                    connectionType: "local",
                    kubernetesURL: "",
                    kubeConfig: "",
                    namespaces: "",
                };
            }

            this.modal.show();
        },

        /**
         * Add kubernetes cluster
         * @returns {void}
         */
        submit() {
            this.processing = true;
            this.$root.getSocket().emit("addKubernetesCluster", this.kubernetesCluster, this.id, (res) => {
                this.$root.toastRes(res);
                this.processing = false;

                if (res.ok) {
                    this.modal.hide();

                    // Emit added event, doesn't emit edit.
                    if (! this.id) {
                        this.$emit("added", res.id);
                    }

                }
            });
        },

        /**
         * Test the kubernetes cluster
         * @returns {void}
         */
        test() {
            this.processing = true;
            this.$root.getSocket().emit("testKubernetesCluster", this.kubernetesCluster, (res) => {
                this.$root.toastRes(res);
                this.processing = false;
            });
        },

        /**
         * Delete this kubernetes cluster
         * @returns {void}
         */
        deleteKubernetesCluster() {
            this.processing = true;
            this.$root.getSocket().emit("deleteKubernetesCluster", this.id, (res) => {
                this.$root.toastRes(res);
                this.processing = false;

                if (res.ok) {
                    this.$emit("deleted", this.id);
                    this.modal.hide();
                }
            });
        },
    },
};
</script>

<style lang="scss" scoped>
@import "../assets/vars.scss";

.dark {
    .modal-dialog .form-text, .modal-dialog p {
        color: $dark-font-color;
    }
}
</style>
