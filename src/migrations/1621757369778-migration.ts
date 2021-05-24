import {MigrationInterface, QueryRunner} from "typeorm";

export class migration1621757369778 implements MigrationInterface {
    name = 'migration1621757369778'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `user` (`id` varchar(36) NOT NULL, `email` varchar(80) NOT NULL, `password` varchar(400) NOT NULL, `phone_number` char(20) NOT NULL, `nickname` varchar(50) NOT NULL, `name` char(40) NOT NULL, `last_name` char(50) NULL, `user_role` set ('Usuario', 'Creador', 'Dueño') NOT NULL DEFAULT 'Usuario', UNIQUE INDEX `IDX_e12875dfb3b1d92d7d7c5377e2` (`email`), UNIQUE INDEX `IDX_01eea41349b6c9275aec646eee` (`phone_number`), UNIQUE INDEX `IDX_e2364281027b926b879fa2fa1e` (`nickname`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `sessions` (`id` varchar(44) NOT NULL, `user_id` int NULL, `content` text NOT NULL, `flash` text NOT NULL, `updated_at` int NOT NULL, `created_at` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `sessions`");
        await queryRunner.query("DROP INDEX `IDX_e2364281027b926b879fa2fa1e` ON `user`");
        await queryRunner.query("DROP INDEX `IDX_01eea41349b6c9275aec646eee` ON `user`");
        await queryRunner.query("DROP INDEX `IDX_e12875dfb3b1d92d7d7c5377e2` ON `user`");
        await queryRunner.query("DROP TABLE `user`");
    }

}
