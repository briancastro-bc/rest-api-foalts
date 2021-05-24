import {MigrationInterface, QueryRunner} from "typeorm";

export class migration1621832712913 implements MigrationInterface {
    name = 'migration1621832712913'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `sessions` DROP FOREIGN KEY `sessions_ibfk_1`");
        await queryRunner.query("DROP INDEX `user_id` ON `sessions`");
        await queryRunner.query("ALTER TABLE `user` DROP PRIMARY KEY");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `id`");
        await queryRunner.query("ALTER TABLE `user` ADD `id` int NOT NULL PRIMARY KEY AUTO_INCREMENT");
        await queryRunner.query("ALTER TABLE `user` CHANGE `last_name` `last_name` char(50) NULL");
        await queryRunner.query("ALTER TABLE `sessions` DROP COLUMN `user_id`");
        await queryRunner.query("ALTER TABLE `sessions` ADD `user_id` int NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `sessions` DROP COLUMN `user_id`");
        await queryRunner.query("ALTER TABLE `sessions` ADD `user_id` varchar(36) NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `user` CHANGE `last_name` `last_name` char(50) NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `id`");
        await queryRunner.query("ALTER TABLE `user` ADD `id` varchar(36) NOT NULL");
        await queryRunner.query("ALTER TABLE `user` ADD PRIMARY KEY (`id`)");
        await queryRunner.query("CREATE INDEX `user_id` ON `sessions` (`user_id`)");
        await queryRunner.query("ALTER TABLE `sessions` ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT");
    }

}
