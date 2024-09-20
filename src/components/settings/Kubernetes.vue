<template>
    <div>
        <div class="kubernetesCluster-list my-4">
            <p v-if="$root.kubernetesClusterList.length === 0">
                {{ $t("Not available, please setup.") }}
            </p>

            <ul class="list-group mb-3" style="border-radius: 1rem;">
                <li v-for="(kubernetesCluster, index) in $root.kubernetesClusterList" :key="index" class="list-group-item">
                    {{ kubernetesCluster.name }}<br>
                    <a href="#" @click="$refs.kubernetesClusterDialog.show(kubernetesCluster.id)">{{ $t("Edit") }}</a>
                </li>
            </ul>

            <button class="btn btn-primary me-2" type="button" @click="$refs.kubernetesClusterDialog.show()">
                {{ $t("Setup Kubernetes Cluster") }}
            </button>
        </div>

        <KubernetesClusterDialog ref="kubernetesClusterDialog" />
    </div>
</template>

<script>
import KubernetesClusterDialog from "../../components/KubernetesClusterDialog.vue";

export default {
    components: {
        KubernetesClusterDialog,
    },

    data() {
        return {};
    },

    computed: {
        settings() {
            return this.$parent.$parent.$parent.settings;
        },
        saveSettings() {
            return this.$parent.$parent.$parent.saveSettings;
        },
        settingsLoaded() {
            return this.$parent.$parent.$parent.settingsLoaded;
        },
    }
};
</script>
