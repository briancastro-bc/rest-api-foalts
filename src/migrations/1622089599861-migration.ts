import {MigrationInterface, QueryRunner} from "typeorm";

export class migration1622089599861 implements MigrationInterface {
    name = 'migration1622089599861'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `profile` (`id` int NOT NULL AUTO_INCREMENT, `picture` varchar(300) NULL, `userId` int NULL, UNIQUE INDEX `REL_a24972ebd73b106250713dcddd` (`userId`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `user` CHANGE `last_name` `last_name` char(50) NULL");
        await queryRunner.query("ALTER TABLE `sessions` CHANGE `user_id` `user_id` int NULL");
        await queryRunner.query("ALTER TABLE `profile` ADD CONSTRAINT `FK_a24972ebd73b106250713dcddd9` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `profile` DROP FOREIGN KEY `FK_a24972ebd73b106250713dcddd9`");
        await queryRunner.query("ALTER TABLE `sessions` CHANGE `user_id` `user_id` int NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `user` CHANGE `last_name` `last_name` char(50) NULL DEFAULT 'NULL'");
        await queryRunner.query("DROP INDEX `REL_a24972ebd73b106250713dcddd` ON `profile`");
        await queryRunner.query("DROP TABLE `profile`");
    }

}
