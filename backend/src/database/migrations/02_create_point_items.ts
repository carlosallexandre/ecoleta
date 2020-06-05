import Knex from 'knex';

export async function up(knex: Knex) {
  return knex.schema.createTable('point_items', table => {
    table.increments('id').primary();

    table.integer('point_id')
      .references('id')
      .inTable('points')
      .notNullable();

    table.integer('item_id')
      .references('id')
      .inTable('items')
      .notNullable();
  });
}

export async function down(knex: Knex) {
  return knex.schema.dropTable('point_items')
}
