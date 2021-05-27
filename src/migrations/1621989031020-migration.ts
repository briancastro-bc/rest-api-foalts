import {MigrationInterface, QueryRunner} from "typeorm";

export class migration1621989031020 implements MigrationInterface {
    name = 'migration1621989031020'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `notification` (`id` int NOT NULL AUTO_INCREMENT, `text` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `user` CHANGE `last_name` `last_name` char(50) NULL");
        await queryRunner.query("ALTER TABLE `sessions` CHANGE `user_id` `user_id` int NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `sessions` CHANGE `user_id` `user_id` int NULL DEFAULT 'NULL'");
        await queryRunner.query("ALTER TABLE `user` CHANGE `last_name` `last_name` char(50) NULL DEFAULT 'NULL'");
        await queryRunner.query("DROP TABLE `notification`");
    }

}
