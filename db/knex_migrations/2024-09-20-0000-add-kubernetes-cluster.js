
exports.up = function (knex) {
    return knex.schema
    .createTable('kubernetes_cluster', function (table) {
        table.increments("id");
        table.integer("user_id").unsigned().notNullable();
        table.string("kubernetes_url", 255);
        table.string("connection_type", 255);
        table.string("name", 255);
        table.string("kube_config", 255);
        table.string("namespaces", 255);
    })
    .alterTable("monitor", function (table) {
        table.integer("kubernetes_cluster").unsigned()
          .references("id").inTable("kubernetes_cluster");
        table.string("kubernetes_name_or_label", 255);
        table.string("kubernetes_namespace", 255);
        table.string("kubernetes_type", 255);
    });
};

exports.down = function (knex) {
    return knex.schema
    .alterTable("monitor", function (table) {
      table.dropColumn("kubernetes_cluster");
    })
    .dropTable("kubernetes_cluster");
};

