exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.createTable("users", {
        id: {type: "serial", notNull: true, unique: true, primaryKey: true},
        username: {type: "varchar(45)", notNull: true},
        nickname: {type: "varchar(45)"},
        profile_picture: {type: "varchar(255)"},
        age: {type: "smallint"},
        gender: {type: "varchar(5)"},
        incomeLevel: {type: "varchar(100)"},
        location: {type: "varchar(100)"},
        occupation: {type: "varchar(255)"},
        ethnic: {type: "varchar(255)"},
        created_at: {
            type: "timestamp",
            default: pgm.func("current_timestamp")
        },
        updated_at: {
            type: "timestamp",
            default: pgm.func("current_timestamp")
        },
        deleted_at: {type: "timestamp"}
    }, {ifNotExists: true});
    pgm.createTable("social_users", {
        id: {type: "serial", notNull: true, unique: true, primaryKey: true},
        social_id: {type: "varchar(255)"},
        social_type: {type: "varchar(10)"},
        userId: {
            type: "integer",
            notNull: true,
            references: '"users"',
            onDelete: "cascade",
        },
        created_at: {
            type: "timestamp",
            default: pgm.func("current_timestamp")
        },
        updated_at: {
            type: "timestamp",
            default: pgm.func("current_timestamp")
        },
        deleted_at: {type: "timestamp"}
    }, {ifNotExists: true});
    pgm.createIndex("social_users", ["social_id", "social_type"], {unique: true});
    pgm.createTable("facebook_users", {
        id: {type: "serial", notNull: true, unique: true, primaryKey: true},
        access_token: {type: "varchar(255)"},
        created_at: {
            type: "timestamp",
            default: pgm.func("current_timestamp")
        },
        updated_at: {
            type: "timestamp",
            default: pgm.func("current_timestamp")
        },
        deleted_at: {type: "timestamp"}
    }, {ifNotExists: true});
};

exports.down = (pgm) => {
    pgm.dropIndex("social_users", ["social_id", "social_type"], {unique: true});
    pgm.dropTable('social_users', {ifExists: true, cascade: true});
    pgm.dropTable('users', {ifExists: true, cascade: true});
    pgm.dropTable('facebook_users', {ifExists: true, cascade: true});
};
