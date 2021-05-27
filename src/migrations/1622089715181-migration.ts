import {MigrationInterface, QueryRunner} from "typeorm";

export class migration1622089715181 implements MigrationInterface {
    name = 'migration1622089715181'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `last_name`");
        await queryRunner.query("ALTER TABLE `profile` ADD `last_name` char(50) NULL");
        await queryRunner.query("ALTER TABLE `sessions` CHANGE `user_id` `user_id` int NULL");
        await queryRunner.query("ALTER TABLE `profile` DROP FOREIGN KEY `FK_a24972ebd73b106250713dcddd9`");
        await queryRunner.query("ALTER TABLE `profile` CHANGE `picture` `picture` varchar(300) NULL");
        await queryRunner.query("ALTER TABLE `profile` CHANGE `userId` `userId` int NULL");
        await queryRunner.query("ALTER TABLE `profile` ADD CONSTRAINT `FK_a24972ebd73b106250713dcddd9` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `profile` DROP FOREIGN KEY `FK_a24972ebd73b106250713dcddd9`");
        await queryRunner.query("ALTER TABLE `profile` CHANGE `userId` `userId` int NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `profile` CHANGE `picture` `picture` varchar(300) NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `profile` ADD CONSTRAINT `FK_a24972ebd73b106250713dcddd9` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `sessions` CHANGE `user_id` `user_id` int NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `profile` DROP COLUMN `last_name`");
        await queryRunner.query("ALTER TABLE `user` ADD `last_name` char(50) NULL DEFAULT 'NULL'");
    }

}
